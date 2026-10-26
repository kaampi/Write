import { applyExtractorDrafts } from "./ConsistencyGate";
import { normalizeValue } from "./ids";
import { groupBibleEntities, type EntityKind } from "./bibleGroups";
import { findNameHitsInText } from "./bibleMentions";
import { activeFacts, type FactDraft, type NarrativeFact } from "./NarrativeFact";
import type { CorePredicate } from "./predicates";

type MirrorTarget = {
  otherRef: string;
  otherLabel: string;
  hits: ReturnType<typeof findNameHitsInText>;
};

/** Shared by the mechanical and AI-backed mirror: which other character the fact names, unambiguously — or no mirror at all. */
function findMirrorTarget(fact: NarrativeFact, facts: NarrativeFact[], kinds: EntityKind[]): MirrorTarget | undefined {
  if (fact.predicate !== "core.relationship") return undefined;

  const otherCharacters = (groupBibleEntities(facts, kinds).find((section) => section.kind === "characters")?.entities ?? [])
    .filter((entity) => entity.entity_ref !== fact.entity_ref)
    .map((entity) => ({ entity_ref: entity.entity_ref, entity_label: entity.entity_label }));
  if (otherCharacters.length === 0) return undefined;

  const hits = findNameHitsInText(fact.value, otherCharacters);
  const distinctRefs = new Set(hits.map((hit) => hit.entityRef));
  if (distinctRefs.size !== 1) return undefined;

  const [otherRef] = distinctRefs;
  const otherLabel = hits.find((hit) => hit.entityRef === otherRef)?.entityLabel;
  if (!otherRef || !otherLabel) return undefined;

  return { otherRef, otherLabel, hits };
}

/** Swaps the other character's name for the fact owner's, leaving every other word untouched — correct for a symmetric relation ("Met Erik at the docks"), wrong for a directional one ("reluctant mentor to Wick" stays "reluctant mentor to Amber" instead of flipping to mentee). Kept as the offline fallback for `relationshipMirrorDraftAI` below, and as `relationshipMirrorDraft`'s own behavior for callers with no model to ask. */
function mechanicalMirrorValue(fact: NarrativeFact, target: MirrorTarget): string {
  let mirroredValue = fact.value;
  const ownHits = target.hits.filter((hit) => hit.entityRef === target.otherRef).sort((a, b) => b.start - a.start);
  for (const hit of ownHits) {
    mirroredValue = mirroredValue.slice(0, hit.start) + fact.entity_label + mirroredValue.slice(hit.end);
  }
  return mirroredValue;
}

/**
 * A locked `core.relationship` fact is one character's side of a story
 * ("met Erik at the docks") — it says nothing about whether Erik's own
 * facts agree. If the value names another known character by name (and
 * only one, unambiguously — never guess between two), draft the same
 * claim for that character too, with the names swapped so it reads from
 * their side.
 *
 * Mechanical only — see `relationshipMirrorDraftAI` for the version that
 * asks a model to invert a directional relationship's role instead of
 * just swapping the name.
 */
export function relationshipMirrorDraft(fact: NarrativeFact, facts: NarrativeFact[], kinds: EntityKind[]): FactDraft | undefined {
  const target = findMirrorTarget(fact, facts, kinds);
  if (!target) return undefined;
  return {
    entity_ref: target.otherRef,
    entity_label: target.otherLabel,
    predicate: "core.relationship",
    value: mechanicalMirrorValue(fact, target)
  };
}

type MirrorChatFn = (messages: { role: "system" | "user"; content: string }[]) => Promise<string>;

/**
 * Asks a model to rewrite one character's relationship fact so it reads as
 * the OTHER character's own fact — crucially, with a directional role
 * flipped to the other side (mentor → mentee, "X's mother" → "daughter of
 * X"), not just the name swapped. A tester's report: Amber's "reluctant
 * mentor to Wick" was mirroring as Wick's "reluctant mentor to Amber" —
 * same role, wrong person. Falls back to the mechanical substitution above
 * if the model call fails or returns nothing usable, so a locked fact never
 * goes unmirrored just because this one extra call errored.
 */
export const RELATIONSHIP_MIRROR_SYSTEM = `You rewrite one character's relationship fact so it reads from the OTHER named character's point of view.

Input: a fact belonging to one character, naming a second character.
Output: the same relationship, stated as the second character's own fact about the first — one short phrase, not a full sentence. Return just that phrase: no quotes, no explanation, no restating whose fact this is.

Invert a one-directional role so it is still true from the other side: a "mentor" fact for one side becomes a "mentee"/"student" fact for the other, never the same word restated with the names swapped. A parent fact ("X's mother") becomes a child fact ("daughter of X"), never pasted onto the wrong person. A mutual, symmetric fact (met at the docks, childhood friends) keeps its shape — only the name changes.

Never invent anything the original fact doesn't already say. Never add a detail the original didn't have.`;

export function relationshipMirrorUserPrompt(fact: NarrativeFact, otherLabel: string): string {
  return `${fact.entity_label}'s fact about ${otherLabel}: "${fact.value}"\n\nWrite ${otherLabel}'s own relationship fact about ${fact.entity_label}, from ${otherLabel}'s point of view.`;
}

export async function relationshipMirrorDraftAI(
  fact: NarrativeFact,
  facts: NarrativeFact[],
  kinds: EntityKind[],
  chat: MirrorChatFn
): Promise<FactDraft | undefined> {
  const target = findMirrorTarget(fact, facts, kinds);
  if (!target) return undefined;

  const fallbackValue = mechanicalMirrorValue(fact, target);
  let value = fallbackValue;
  try {
    const raw = await chat([
      { role: "system", content: RELATIONSHIP_MIRROR_SYSTEM },
      { role: "user", content: relationshipMirrorUserPrompt(fact, target.otherLabel) }
    ]);
    const cleaned = raw.trim().replace(/^["']|["']$/g, "");
    if (cleaned) value = cleaned;
  } catch {
    // Mirror suggestion is best-effort — the fact itself is already locked by now, so a
    // model error here falls back to the mechanical phrasing rather than losing the mirror.
  }

  return { entity_ref: target.otherRef, entity_label: target.otherLabel, predicate: "core.relationship", value };
}

/**
 * Never locks the mirrored claim directly — it is the author's/AI's
 * telling from one side, not something the other character has
 * confirmed. It goes through the same extractor pipeline a fact pulled
 * from prose would: queued for review if it's new, or — the point of
 * this — flagged as a real conflict if that character's own locked
 * facts already say something else, instead of the two sides silently
 * drifting apart.
 */
export function withRelationshipMirror(facts: NarrativeFact[], lockedFact: NarrativeFact, kinds: EntityKind[]): NarrativeFact[] {
  const draft = relationshipMirrorDraft(lockedFact, facts, kinds);
  if (!draft) return facts;
  return applyExtractorDrafts(facts, [draft], lockedFact.sequence_index, lockedFact.chapter_id, lockedFact.scene_id);
}

/**
 * Call sites don't always have the freshly-locked fact object in hand —
 * addFact, approve, and revise each learn the outcome differently — so
 * this finds it by the claim it should now match and runs the mirror
 * check, or no-ops if that claim never actually landed as locked truth.
 */
export function withRelationshipMirrorFor(
  facts: NarrativeFact[],
  match: { entity_ref: string; predicate: CorePredicate; value: string },
  kinds: EntityKind[]
): NarrativeFact[] {
  const locked = activeFacts(facts).find(
    (fact) =>
      fact.entity_ref === match.entity_ref &&
      fact.predicate === match.predicate &&
      fact.status === "locked" &&
      normalizeValue(fact.value) === normalizeValue(match.value)
  );
  return locked ? withRelationshipMirror(facts, locked, kinds) : facts;
}

/** AI-backed counterpart to `withRelationshipMirror`, using `relationshipMirrorDraftAI`. */
export async function withRelationshipMirrorAI(
  facts: NarrativeFact[],
  lockedFact: NarrativeFact,
  kinds: EntityKind[],
  chat: MirrorChatFn
): Promise<NarrativeFact[]> {
  const draft = await relationshipMirrorDraftAI(lockedFact, facts, kinds, chat);
  if (!draft) return facts;
  return applyExtractorDrafts(facts, [draft], lockedFact.sequence_index, lockedFact.chapter_id, lockedFact.scene_id);
}

/** AI-backed counterpart to `withRelationshipMirrorFor`, used by every call site that has a model to ask — the mechanical versions above now exist only as their fallback and for tests. */
export async function withRelationshipMirrorForAI(
  facts: NarrativeFact[],
  match: { entity_ref: string; predicate: CorePredicate; value: string },
  kinds: EntityKind[],
  chat: MirrorChatFn
): Promise<NarrativeFact[]> {
  const locked = activeFacts(facts).find(
    (fact) =>
      fact.entity_ref === match.entity_ref &&
      fact.predicate === match.predicate &&
      fact.status === "locked" &&
      normalizeValue(fact.value) === normalizeValue(match.value)
  );
  return locked ? withRelationshipMirrorAI(facts, locked, kinds, chat) : facts;
}
