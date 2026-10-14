/**
 * Smart/curly double quotes. A straight `"` becomes an opening curly quote
 * (“) when the character right before it starts a fresh run of text —
 * nothing before it, whitespace, an opening bracket, a dash, or another
 * opening quote — and a closing curly quote (”) otherwise. The same
 * heuristic word processors use; good enough for ordinary dialogue, not
 * infallible for every edge case (e.g. a quote right after a closing
 * parenthesis reads as a close, which is usually what's wanted anyway).
 */
const OPENING_CONTEXT = /[\s([{\-–—‘“]/;

export function smartQuoteFor(before: string | undefined): string {
  if (before === undefined || OPENING_CONTEXT.test(before)) return "“";
  return "”";
}

/**
 * Converts every straight double quote in `text` to a curly quote — a
 * one-for-one character swap, so every other offset into this string
 * (formatting ranges, placeholders, darlings, prose history) stays valid
 * untouched; nothing is inserted or removed.
 */
export function smartenQuotes(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += text[i] === '"' ? smartQuoteFor(text[i - 1]) : text[i];
  }
  return result;
}
