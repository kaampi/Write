/**
 * A reasoning model "thinks out loud" before it writes a word of the actual
 * reply, and that thinking is billed against the same maxTokens budget as
 * the reply itself. First caught on Polish (a tester's LM Studio log showed
 * 1131 of a 1800-token budget spent on reasoning alone, cutting the rewrite
 * off after the chapter's first scene) — then again on Analyze (a reasoning
 * model with no obvious "thinking" indicator in LM Studio's own UI spent
 * 1797 of 1800 completion tokens on reasoning, leaving an empty reply) and
 * Extract (cut off at the shared 4000-token extractor budget before it
 * could finish). Any fixed or length-scaled maxTokens budget needs this
 * added on top, not instead of, its own budget — a short request is cheap
 * either way, but the reasoning pass before it isn't any shorter for it.
 */
export const REASONING_HEADROOM_TOKENS = 2000;

export function withReasoningHeadroom(baseMaxTokens: number): number {
  return REASONING_HEADROOM_TOKENS + baseMaxTokens;
}
