import { formattingSegments, type ProseFormattingRange, type ProseFormattingStyle } from "./proseFormatting";

export function splitFlowParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((block) => block.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

/**
 * Same split as `splitFlowParagraphs`, but keeps each paragraph's start
 * offset in the original string — needed to map formatting ranges (offsets
 * into `chapter.prose`) onto the right paragraph when rendering. Exact as
 * long as `text` is already in the "joined" form `joinFlowParagraphs`
 * produces (trimmed blocks, single spaces, "\n\n" between them) — true for
 * any `chapter.prose` that has passed through the canvas or a span edit,
 * which is the only kind of prose formatting ranges are ever computed
 * against.
 */
export function splitFlowParagraphsWithOffsets(text: string): { text: string; start: number }[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const result: { text: string; start: number }[] = [];
  let index = 0;
  for (const part of normalized.split(/(\n+)/)) {
    if (part === "" || /^\n+$/.test(part)) {
      index += part.length;
      continue;
    }
    const leading = part.match(/^[ \t]*/)?.[0].length ?? 0;
    const collapsed = part.replace(/[ \t]+/g, " ").trim();
    if (collapsed) result.push({ text: collapsed, start: index + leading });
    index += part.length;
  }
  return result;
}

/** Model commentary glued onto a rewrite, e.g. `(Note: swapped the verbs…)`. */
const ASIDE_HEAD = /^(Notes|Note|Nota|Notering|Anteckning|Anmärkning|Anm|Notat|Merknad|Merk|Obs|Not)\s*:/i;

/**
 * A scene-break paragraph on its own — the manuscript convention `---`.
 * Rendered as a horizontal rule; the text itself is untouched. Exported so
 * `proseDom.ts` can tell whether a live-typed block still needs upgrading
 * to that markup (see `blockMarkupNeedsSync`).
 */
export const HR_BLOCK = /^-{3,}$/;

/**
 * A quoted line — `>` at the start of a paragraph, the Markdown/email-reply
 * convention. Renders as an indented block with a rule down the side (a
 * letter, a note someone reads aloud); the marker itself is hidden, the
 * rest of the line displays normally. Exported for the same reason as
 * `HR_BLOCK` above.
 */
export const QUOTE_PREFIX = /^>[ \t]?/;

/** Heading the model slaps on a rewrite, e.g. `Rewritten passage:`. */
const REWRITE_WRAPPER =
  /(^|\n+|[.!?]["']?\s+)(?:#{1,3}\s+)?\*{0,3}(?:here(?:'s| is) (?:the )?|här är den |her er den )?(?:rewritten|revised|recast|omskrivna?|omskriven[ae]?|omskrivet|omarbetad[ea]?|omskrevet|revidert)\s+(?:passage(?:n)?|text|paragraph|stycke|avsnitt|passasje(?:n)?)\s*:\*{0,3}/i;

export function peelModelAsides(text: string): { prose: string; asides: string[] } {
  const asides: string[] = [];
  let prose = peelParenAsides(text, asides);
  prose = peelRewriteWrappers(prose);
  prose = peelEdgeNoteParagraphs(prose, asides);
  return { prose: tidyPeeledProse(prose), asides };
}

function peelParenAsides(text: string, asides: string[]): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const span = parenAsideAt(text, i);
    if (span) {
      const aside = unwrapAside(text.slice(span.start, span.end));
      if (aside) asides.push(aside);
      i = span.end;
      continue;
    }
    out += text[i];
    i++;
  }
  return out;
}

function parenAsideAt(text: string, index: number): { start: number; end: number } | null {
  if (text[index] !== "(") return null;
  if (!ASIDE_HEAD.test(text.slice(index + 1))) return null;
  let depth = 1;
  for (let j = index + 1; j < text.length; j++) {
    const ch = text[j];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return { start: index, end: j + 1 };
    }
  }
  return { start: index, end: text.length };
}

function looksLikeModelNote(block: string): boolean {
  const stripped = unwrapAside(block.replace(/^\*+|\*+$/g, ""));
  if (!ASIDE_HEAD.test(stripped)) return false;
  return /→|->|Changed\b|Swapped\b|Recast\b|rewritten as asked|as per the author|to ["/']/i.test(stripped);
}

function peelRewriteWrappers(text: string): string {
  const match = text.match(REWRITE_WRAPPER);
  if (!match || match.index === undefined) return text;
  const headingStart = match.index + match[1]!.length;
  const after = text.slice(match.index + match[0].length).trim();
  if (after) return after;
  return text.slice(0, headingStart).trim();
}

function peelEdgeNoteParagraphs(text: string, asides: string[]): string {
  const blocks = splitFlowParagraphs(text);
  if (blocks.length === 0) return text;
  const keep: string[] = [];
  for (const block of blocks) {
    if (looksLikeModelNote(block)) {
      const aside = unwrapAside(block.replace(/^\*+|\*+$/g, "").trim());
      if (aside) asides.push(aside);
      continue;
    }
    keep.push(block);
  }
  return joinFlowParagraphs(keep);
}

function unwrapAside(raw: string): string {
  return raw
    .trim()
    .replace(/^\*+|\*+$/g, "")
    .trim()
    .replace(/^\(/, "")
    .replace(/\)$/, "")
    .trim();
}

function tidyPeeledProse(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The curly opening double quote `smartQuotes.ts` produces — the one case a chapter's first paragraph can start with that calls for hanging punctuation (see `markupDropCapLeadQuote`). Exported so `proseDom.ts` can tell whether a live-typed first paragraph still needs upgrading to that markup, the same reason `HR_BLOCK`/`QUOTE_PREFIX` are. */
export const OPENING_CURLY_QUOTE = "“";

export function htmlFromProse(text: string, formatting: ProseFormattingRange[] = []): string {
  const paras = splitFlowParagraphsWithOffsets(text);
  if (paras.length === 0) return "<p><br></p>";
  return paras
    .map((para, index) => {
      // The hr class sits on the <p> itself, not a <span> inside it — a
      // <span> forced to display:block to render as a line silently broke
      // the browser's own Enter-key paragraph split (execCommand
      // "insertParagraph" just appends a sibling span instead of creating a
      // new <p> when the caret is inside a block-ified inline element).
      // The <p> is block-level by its tag already, so none of this CSS
      // needs forcing an inline element's display, and Enter keeps working.
      if (HR_BLOCK.test(para.text)) return `<p class="prose-hr">${escapeHtml(para.text)}</p>`;
      if (index === 0 && para.text.startsWith(OPENING_CURLY_QUOTE)) {
        return `<p class="drop-cap-lead-quote">${markupDropCapLeadQuote(para.text, para.start, formatting)}</p>`;
      }
      const cls = QUOTE_PREFIX.test(para.text) ? ' class="prose-quote"' : "";
      return `<p${cls}>${markupProseBlock(para.text, para.start, formatting)}</p>`;
    })
    .join("");
}

/**
 * A chapter opening with dialogue — `“Come in," she said.` — used to make
 * the opening curly quote itself the whole drop cap whenever one is active:
 * not how books do it (Mats: "jag tror att det är vanligt för böcker att
 * det ligger ett citattecken utanför till vänster och att den först
 * bokstaven ligger på sin plats"). Peels the quote into its own span so
 * `styles.css` can hang it in the left margin at normal size, and the real
 * first letter into its own span so it gets the drop-cap treatment instead
 * — `.drop-cap-lead-quote` on the `<p>` tells that CSS to stand down its
 * usual `::first-letter` rule so the two don't double up. Harmless when no
 * drop cap is set: both spans then render as plain inline text. Only ever
 * touches how the manuscript's very first paragraph is DISPLAYED — the
 * stored text itself (what Codex and every export reads) is untouched.
 */
function markupDropCapLeadQuote(block: string, blockStart: number, formatting: ProseFormattingRange[]): string {
  const rest = block.slice(OPENING_CURLY_QUOTE.length);
  const letter = [...rest][0];
  if (!letter) return markupProseBlockBody(block, blockStart, formatting);
  const letterStart = blockStart + OPENING_CURLY_QUOTE.length;
  const afterLetter = rest.slice(letter.length);
  return (
    `<span class="drop-cap-quote">${markupFormattedSlice(OPENING_CURLY_QUOTE, blockStart, formatting)}</span>` +
    `<span class="drop-cap-letter">${markupFormattedSlice(letter, letterStart, formatting)}</span>` +
    markupProseBlockBody(afterLetter, letterStart + letter.length, formatting)
  );
}

function markupProseBlock(block: string, blockStart: number, formatting: ProseFormattingRange[]): string {
  const quote = block.match(QUOTE_PREFIX);
  if (quote) {
    const marker = quote[0];
    return (
      `<span class="prose-quote-marker">${escapeHtml(marker)}</span>` +
      markupProseBlockBody(block.slice(marker.length), blockStart + marker.length, formatting)
    );
  }
  return markupProseBlockBody(block, blockStart, formatting);
}

function markupProseBlockBody(block: string, blockStart: number, formatting: ProseFormattingRange[]): string {
  let out = "";
  let i = 0;
  while (i < block.length) {
    const span = parenAsideAt(block, i);
    if (span) {
      out += `<span class="prose-aside">${escapeHtml(block.slice(span.start, span.end))}</span>`;
      i = span.end;
      continue;
    }
    if (i === 0 && ASIDE_HEAD.test(block.replace(/^\*+|\*+$/g, "").trim())) {
      return `<span class="prose-aside">${escapeHtml(block)}</span>`;
    }
    const next = block.indexOf("(", i + 1);
    const sliceEnd = next === -1 ? block.length : next;
    out += markupFormattedSlice(block.slice(i, sliceEnd), blockStart + i, formatting);
    i = sliceEnd;
  }
  return out;
}

function markupFormattedSlice(text: string, offset: number, formatting: ProseFormattingRange[]): string {
  if (text.length === 0) return "";
  if (formatting.length === 0) return escapeHtml(text);
  let out = "";
  for (const segment of formattingSegments(formatting, offset, offset + text.length)) {
    const piece = text.slice(segment.start - offset, segment.end - offset);
    out += wrapStyles(escapeHtml(piece), segment.styles);
  }
  return out;
}

export function wrapStyles(html: string, styles: ProseFormattingStyle[]): string {
  let out = html;
  if (styles.includes("underline")) out = `<u>${out}</u>`;
  if (styles.includes("italic")) out = `<i>${out}</i>`;
  if (styles.includes("bold")) out = `<b>${out}</b>`;
  return out;
}

export function joinFlowParagraphs(blocks: string[]): string {
  return blocks
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
