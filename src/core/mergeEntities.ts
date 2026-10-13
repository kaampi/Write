import { touch, type Book } from "./BookSchema";
import { isActiveFact, type NarrativeFact } from "./NarrativeFact";
import { CORE_PREDICATES, type CorePredicate } from "./predicates";
import { classifyEntity, kindOverrideFor, type BibleKind } from "./bibleGroups";
import { profileFor, type CharacterProfile } from "./characterProfile";
import { eventProfileFor, type EventProfile } from "./eventProfile";
import { picturesFor, MAX_ENTITY_PICTURES, type EntityMedia } from "./entityMedia";
import { trackingFor, upsertEntityTracking, type EntityTracking } from "./entityTracking";
import { entityIsHidden } from "./visibility";

export type MergeGuard = { ok: true } | { ok: false; reason: "too-few" | "kind-mismatch" };

/** Whether `refs` (2+ distinct entity_refs) can be merged into one card — same resolved kind, at least two selected. */
export function canMergeEntities(book: Book, refs: string[]): MergeGuard {
  const unique = [...new Set(refs)];
  if (unique.length < 2) return { ok: false, reason: "too-few" };
  const kinds = new Set<BibleKind>(
    unique.map((ref) => {
      const facts = book.facts.filter((fact) => fact.status === "locked" && isActiveFact(fact) && fact.entity_ref === ref);
      return classifyEntity(facts, kindOverrideFor(book.entity_kinds, ref));
    })
  );
  if (kinds.size > 1) return { ok: false, reason: "kind-mismatch" };
  return { ok: true };
}

export type MergeFactOption = {
  value: string;
  /** Every active locked fact id sharing this exact value for this predicate, across the merged entities. */
  factIds: string[];
};

export type MergeFactGroup = {
  predicate: CorePredicate;
  options: MergeFactOption[];
};

/**
 * One row per predicate with more than one DISTINCT active-locked value
 * across the merged entities — the only thing the author actually has to
 * decide. A predicate with a single distinct value never appears here, even
 * if several of the merged cards repeat it identically; those collapse to
 * one surviving fact automatically in `applyMerge`, no choice to make.
 */
export function buildMergeProposal(book: Book, refs: string[]): MergeFactGroup[] {
  const refSet = new Set(refs);
  const relevant = book.facts.filter(
    (fact) => fact.status === "locked" && isActiveFact(fact) && refSet.has(fact.entity_ref)
  );
  const byPredicate = new Map<CorePredicate, NarrativeFact[]>();
  for (const fact of relevant) {
    const list = byPredicate.get(fact.predicate) ?? [];
    list.push(fact);
    byPredicate.set(fact.predicate, list);
  }
  const groups: MergeFactGroup[] = [];
  for (const predicate of CORE_PREDICATES) {
    const facts = byPredicate.get(predicate);
    if (!facts || facts.length === 0) continue;
    const byValue = new Map<string, string[]>();
    for (const fact of facts) {
      const ids = byValue.get(fact.value) ?? [];
      ids.push(fact.id);
      byValue.set(fact.value, ids);
    }
    if (byValue.size <= 1) continue;
    groups.push({ predicate, options: [...byValue.entries()].map(([value, factIds]) => ({ value, factIds })) });
  }
  return groups;
}

export type MergeChoice = { predicate: CorePredicate; keptValues: string[] };

function profileIsEmpty(profile: CharacterProfile): boolean {
  return (
    !profile.pronoun &&
    profile.approximateAge === undefined &&
    !profile.looks.trim() &&
    !profile.personality.trim() &&
    !profile.goals.trim() &&
    !profile.fears.trim() &&
    profile.tags.length === 0
  );
}

function eventProfileIsEmpty(profile: EventProfile): boolean {
  return !profile.where && profile.participants.length === 0;
}

/**
 * Folds `refs` (2+ entities) into one: every fact, profile, picture, event
 * link, hidden flag, kind override, and alias/exclusion row currently under
 * any of them moves to `winnerRef`, under `finalLabel`. Nothing is deleted —
 * facts are superseded (never erased, per NarrativeFact's own rule), and the
 * losing entities' own previous labels become aliases of the merged card, so
 * a later mention of either old name still resolves to it.
 *
 * `choices` resolves every predicate `buildMergeProposal` flagged as having
 * more than one distinct active value: the listed values stay active (and,
 * for duplicates of the same value, the earliest fact survives, the rest
 * are superseded by it); any value for that predicate NOT listed is
 * superseded by the first kept value's surviving fact. A predicate absent
 * from `choices` either had only one distinct value (nothing to resolve) or
 * wasn't touched — either way every one of its facts just carries over.
 */
export function applyMerge(
  book: Book,
  params: { refs: string[]; winnerRef: string; finalLabel: string; choices: MergeChoice[] }
): Book {
  const refs = [...new Set(params.refs)];
  const winnerRef = params.winnerRef;
  const label = params.finalLabel.trim();
  if (refs.length < 2 || !refs.includes(winnerRef) || !label) return book;
  const refSet = new Set(refs);
  const loserRefs = refs.filter((ref) => ref !== winnerRef);
  const keptByPredicate = new Map(params.choices.map((choice) => [choice.predicate, new Set(choice.keptValues)]));

  type ValueGroup = { value: string; survivor: NarrativeFact; rest: NarrativeFact[] };
  const relevantLocked = book.facts.filter(
    (fact) => refSet.has(fact.entity_ref) && fact.status === "locked" && isActiveFact(fact)
  );
  const byPredicateValue = new Map<string, NarrativeFact[]>();
  for (const fact of relevantLocked) {
    const key = `${fact.predicate}\u0000${fact.value}`;
    const list = byPredicateValue.get(key) ?? [];
    list.push(fact);
    byPredicateValue.set(key, list);
  }
  const byPredicate = new Map<CorePredicate, ValueGroup[]>();
  for (const [key, list] of byPredicateValue) {
    const [predicate, value] = key.split("\u0000") as [CorePredicate, string];
    const sorted = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const group = byPredicate.get(predicate) ?? [];
    group.push({ value, survivor: sorted[0]!, rest: sorted.slice(1) });
    byPredicate.set(predicate, group);
  }

  const supersededByMerge = new Map<string, string>();
  for (const [predicate, groups] of byPredicate) {
    for (const group of groups) {
      for (const loser of group.rest) supersededByMerge.set(loser.id, group.survivor.id);
    }
    const kept = keptByPredicate.get(predicate);
    if (!kept) continue;
    const keptGroup = groups.find((group) => kept.has(group.value));
    if (!keptGroup) continue;
    for (const group of groups) {
      if (kept.has(group.value)) continue;
      supersededByMerge.set(group.survivor.id, keptGroup.survivor.id);
    }
  }

  const facts = book.facts.map((fact) => {
    const reassigned = refSet.has(fact.entity_ref) ? { ...fact, entity_ref: winnerRef, entity_label: label } : fact;
    const supersedeTarget = supersededByMerge.get(fact.id);
    return supersedeTarget ? { ...reassigned, superseded_by: supersedeTarget } : reassigned;
  });

  // Profile: keep the winner's own if it holds anything; otherwise adopt the
  // first loser's non-empty profile. Tags union regardless — cheap and safe.
  const winnerProfile = profileFor(book.profiles, winnerRef);
  const donorProfile = profileIsEmpty(winnerProfile)
    ? loserRefs.map((ref) => profileFor(book.profiles, ref)).find((profile) => !profileIsEmpty(profile))
    : undefined;
  const basedProfile = donorProfile ?? winnerProfile;
  const allTags = new Set([
    ...winnerProfile.tags,
    ...loserRefs.flatMap((ref) => profileFor(book.profiles, ref).tags)
  ]);
  const mergedProfile: CharacterProfile = { ...basedProfile, entity_ref: winnerRef, tags: [...allTags] };
  const profiles = profileIsEmpty(mergedProfile)
    ? book.profiles.filter((row) => !refSet.has(row.entity_ref))
    : [...book.profiles.filter((row) => !refSet.has(row.entity_ref)), mergedProfile];

  // Pictures: union across every merged entity, capped the same as a normal add.
  const allPictures = refs.flatMap((ref) => picturesFor(book.media, ref)).slice(0, MAX_ENTITY_PICTURES);
  const media = [
    ...book.media.filter((row) => !refSet.has(row.entity_ref)),
    ...(allPictures.length > 0 ? [{ entity_ref: winnerRef, pictures: allPictures }] : [])
  ];

  // Event profile: same "keep winner's own, else first non-empty loser's"
  // rule as the character profile. Every OTHER event's own participants/
  // where that pointed at a losing ref now point at the winner instead —
  // the link survives the merge, unlike a real delete (deleteEntity.ts),
  // which drops it.
  const winnerEventProfile = eventProfileFor(book.event_profiles, winnerRef);
  const donorEventProfile = eventProfileIsEmpty(winnerEventProfile)
    ? loserRefs.map((ref) => eventProfileFor(book.event_profiles, ref)).find((profile) => !eventProfileIsEmpty(profile))
    : undefined;
  const mergedEventProfile: EventProfile = { ...(donorEventProfile ?? winnerEventProfile), entity_ref: winnerRef };
  const event_profiles = book.event_profiles
    .filter((row) => !refSet.has(row.entity_ref))
    .map((row) => {
      const participants = [...new Set(row.participants.map((ref) => (refSet.has(ref) ? winnerRef : ref)))];
      const where = row.where && refSet.has(row.where) ? winnerRef : row.where;
      return { ...row, participants, ...(where ? { where } : {}) };
    });
  if (!eventProfileIsEmpty(mergedEventProfile)) event_profiles.push(mergedEventProfile);

  const hidden = refs.some((ref) => entityIsHidden(book.hidden_entities, ref));
  const hidden_entities = book.hidden_entities.filter((ref) => !refSet.has(ref));
  if (hidden) hidden_entities.push(winnerRef);

  const winnerKindOverride = kindOverrideFor(book.entity_kinds, winnerRef);
  const donorKindOverride = winnerKindOverride ?? loserRefs.map((ref) => kindOverrideFor(book.entity_kinds, ref)).find(Boolean);
  const entity_kinds = book.entity_kinds.filter((row) => !refSet.has(row.entity_ref));
  if (donorKindOverride) entity_kinds.push({ entity_ref: winnerRef, kind: donorKindOverride });

  // Aliases: union every merged entity's own tracked aliases/exclusions,
  // plus — the whole point — each losing card's OWN previous label becomes
  // an alias of the merged card, so a later "Kaptenen" or "Kael" still
  // resolves to the same Story Bible entry the mentions tracker already
  // knows how to match against.
  const labelByRef = new Map(refs.map((ref) => [ref, book.facts.find((fact) => fact.entity_ref === ref)?.entity_label]));
  const mergedAliases = new Set<string>();
  const mergedExclusions = new Set<string>();
  for (const ref of refs) {
    const tracking = trackingFor(book.entity_tracking, ref);
    for (const alias of tracking.aliases) mergedAliases.add(alias);
    for (const exclusion of tracking.exclusions) mergedExclusions.add(exclusion);
  }
  for (const ref of loserRefs) {
    const oldLabel = labelByRef.get(ref);
    if (oldLabel && oldLabel !== label) mergedAliases.add(oldLabel);
  }
  mergedAliases.delete(label);
  const entity_tracking = upsertEntityTracking(
    book.entity_tracking.filter((row) => !refSet.has(row.entity_ref)),
    { entity_ref: winnerRef, aliases: [...mergedAliases], exclusions: [...mergedExclusions] }
  );

  return touch(book, { facts, profiles, media, event_profiles, hidden_entities, entity_kinds, entity_tracking });
}
