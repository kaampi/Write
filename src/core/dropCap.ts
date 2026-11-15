/**
 * The one place that decides how a drop cap (Anfang) treats a first paragraph
 * that opens with a curly “. Book typography hangs that quote in the margin
 * at normal size and drops the real first letter, so every surface that draws
 * a drop cap has to split the paragraph the same way: the live editor
 * (proseFlow.ts), HTML/ePub (manuscriptExport.ts), and — where the format has
 * no hanging quote — ODT and IDML, which instead cover both characters.
 * Keeping the rule here stops those from drifting apart (they did: the
 * Publish export once enlarged the quote together with the letter).
 *
 * Only ever about how text is DISPLAYED or exported; stored prose is never
 * touched.
 */

/** The curly opening double quote `smartQuotes.ts` produces — the one case a chapter's first paragraph can start with that calls for hanging punctuation. */
export const OPENING_CURLY_QUOTE = "“";

/** Class on the first `<p>`: tells the CSS to stand down its plain `::first-letter` rule for this paragraph. */
export const DROP_CAP_LEAD_QUOTE_CLASS = "drop-cap-lead-quote";
/** Span holding the hanging quote. */
export const DROP_CAP_QUOTE_CLASS = "drop-cap-quote";
/** Span holding the real first letter, which gets the drop cap. */
export const DROP_CAP_LETTER_CLASS = "drop-cap-letter";

/** Whether a paragraph opens with the hanging quote — even when nothing follows it yet (the editor still marks that paragraph, so typing on picks up the letter span). */
export function opensWithLeadQuote(text: string): boolean {
  return text.startsWith(OPENING_CURLY_QUOTE);
}

export type DropCapLeadQuoteParts = {
  letter: string;
  /** Offset of `letter` within the paragraph. */
  letterStart: number;
  /** Everything after the letter. */
  rest: string;
  /** Offset of `rest` within the paragraph. */
  restStart: number;
};

/**
 * Splits a paragraph that opens with “ into its quote, the real first letter
 * and the rest; null when it doesn't open with one, or when there is no
 * letter after it yet (a lone “ has nothing to drop).
 */
export function splitDropCapLeadQuote(text: string): DropCapLeadQuoteParts | null {
  if (!opensWithLeadQuote(text)) return null;
  const afterQuote = text.slice(OPENING_CURLY_QUOTE.length);
  const letter = [...afterQuote][0];
  if (!letter) return null;
  const letterStart = OPENING_CURLY_QUOTE.length;
  const restStart = letterStart + letter.length;
  return { letter, letterStart, rest: text.slice(restStart), restStart };
}

/**
 * How many characters a drop cap covers where the format cannot hang the
 * quote (ODT, IDML): 2 for a quote opening, so quote and letter drop
 * together instead of the quote standing alone as the cap; otherwise 1.
 */
export function dropCapCharacters(text: string): 1 | 2 {
  return splitDropCapLeadQuote(text) ? 2 : 1;
}

/**
 * The inner markup of a quote-opening first paragraph: the hanging quote span,
 * the drop-cap letter span, then the rest. `render` turns each slice (with its
 * absolute offset into the chapter, for formatting ranges) into the surface's
 * own markup — the editor's and the exporter's differ in what they do with
 * asides and escaping.
 */
export function dropCapLeadQuoteMarkup(
  parts: DropCapLeadQuoteParts,
  paragraphStart: number,
  render: (slice: string, absoluteStart: number, part: "quote" | "letter" | "rest") => string
): string {
  return (
    `<span class="${DROP_CAP_QUOTE_CLASS}">${render(OPENING_CURLY_QUOTE, paragraphStart, "quote")}</span>` +
    `<span class="${DROP_CAP_LETTER_CLASS}">${render(parts.letter, paragraphStart + parts.letterStart, "letter")}</span>` +
    render(parts.rest, paragraphStart + parts.restStart, "rest")
  );
}
