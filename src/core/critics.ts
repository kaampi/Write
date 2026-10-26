import type { Book, Chapter } from "./BookSchema";
import { recoverJsonObject } from "./extractFacts";
import { formatReaderForReview, resolveReader } from "./reader";
import { locateQuote } from "./chapterFeedback";

/**
 * Several distinct critique "voices" on the same chapter, each reading for
 * something the others don't — roadmap-ideas.md #50, after a tester's
 * comparison to a competitor's five fixed critic personas. Deliberately
 * narrow (three, not five): the two personas closest to what Analyze
 * (show_vs_tell, dialogue_purpose, voice_drift, character_fidelity) and
 * Proofread's style step already cover were left out, so this adds real
 * new lenses instead of a second coat of the same paint. Opt-in per run —
 * each persona checked is its own AI call, so the author picks the cost.
 */
export const CRITIC_PERSONA_IDS = ["impatient-reader", "pacing-critic", "confused-reader"] as const;
export type CriticPersonaId = (typeof CRITIC_PERSONA_IDS)[number];

export type CriticItem = {
  persona: CriticPersonaId;
  quote: string;
  observation: string;
  paragraphIndex: number | null;
};

const MAX_ITEMS_PER_PERSONA = 6;
const MIN_QUOTE = 8;

const PERSONA_VOICE: Record<CriticPersonaId, string> = {
  "impatient-reader": `You are an impatient reader — you want the story to keep moving and you say so the moment it stalls. Flag a passage where you'd be tempted to skim: description that outlasts its purpose, a beat the scene has already made, a moment the chapter lingers on past the point it's earned. Not every slow passage is wrong — a deliberate pause before a turn is doing its job — flag only where the slowness isn't earning anything.`,
  "pacing-critic": `You read for rhythm across the whole chapter — where tension builds, where it holds, where it slackens when it shouldn't. Flag a passage where the chapter's momentum drops at the wrong moment (right after a turn that should be driving the reader forward, or a stretch with no rising or falling pressure at all) or where two consecutive beats move at the same pace when a shift would serve the scene better.`,
  "confused-reader": `You are a reader meeting this chapter for the first time, with no outside knowledge of the manuscript. Flag a passage you'd have to re-read to understand: an unclear pronoun or "they" with no clear antecedent, an action or spatial jump that doesn't track, a reference to something the chapter never actually established. Not a plot mystery the author planted on purpose — only a passage that's accidentally hard to follow.`
};

function criticSystemPrompt(persona: CriticPersonaId): string {
  return `${PERSONA_VOICE[persona]}
Return JSON only, shaped as: {"items":[{"quote":"...","observation":"..."}]}

Rules:
- quote must be verbatim from the chapter prose, short enough to find.
- observation names what you noticed in one short sentence, in your own voice as described above. It is not a rewrite and not a paraphrase of the quote.
- Never invent facts. Never use material that is not in the chapter, the Voice field, the Reader field, or the Story Bible.
- Never mention brainstorm, secrets, or notes you were not given.
- If nothing solid stands out, return an empty list: {"items":[]}.
- At most ${MAX_ITEMS_PER_PERSONA} items. Prefer your strongest reactions, not one for every paragraph.`;
}

export const CRITIC_SYSTEM_PROMPTS: Record<CriticPersonaId, string> = Object.fromEntries(
  CRITIC_PERSONA_IDS.map((persona) => [persona, criticSystemPrompt(persona)])
) as Record<CriticPersonaId, string>;

export function criticUserPrompt(book: Book, chapter: Chapter): string {
  const reader = formatReaderForReview(resolveReader(book, chapter));
  const parts = [
    `Manuscript: ${book.title}`,
    reader,
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}`,
    `Prose:\n${chapter.prose.trim()}`,
    "Review only this chapter. JSON only."
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function parseCriticFeedback(raw: string, prose: string, persona: CriticPersonaId): CriticItem[] {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return [];
  }
  const rows = (payload as { items?: unknown })?.items;
  if (!Array.isArray(rows)) return [];

  const items: CriticItem[] = [];
  for (const row of rows) {
    if (items.length >= MAX_ITEMS_PER_PERSONA) break;
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const quote = typeof rec.quote === "string" ? rec.quote.trim() : "";
    const observation = typeof rec.observation === "string" ? rec.observation.trim() : "";
    if (quote.length < MIN_QUOTE || !observation) continue;
    items.push({ persona, quote, observation, paragraphIndex: locateQuote(prose, quote) });
  }
  return items;
}
