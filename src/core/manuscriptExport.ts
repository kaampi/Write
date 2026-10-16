import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { groupBibleEntities } from "./bibleGroups";
import { sortedChapters, type Book } from "./BookSchema";
import { profileFor } from "./characterProfile";
import { PREDICATE_LABELS } from "./predicates";
import { HR_BLOCK, peelModelAsides, splitFlowParagraphs, splitFlowParagraphsWithOffsets, wrapStyles } from "./proseFlow";
import { formattingSegments, type ProseFormattingRange, type ProseFormattingStyle } from "./proseFormatting";
import { newId } from "./ids";

export type PublishFont = {
  name: string;
  stack: string;
  embed?: { regular: Uint8Array; bold: Uint8Array };
};

/**
 * How a chapter's paragraphs are set on the page. "spaced" (the long-
 * standing default) is a blank line between paragraphs, no indent — what
 * every format already did before this existed. "indented" is the classic
 * printed-book convention instead: no blank line, each paragraph's first
 * line indented (except a chapter's very first paragraph, which typesetting
 * convention leaves flush). Markdown is left out — a blank line is what
 * *makes* a paragraph a paragraph there, so there's nothing to toggle.
 */
export type ParagraphStyle = "spaced" | "indented";

/** Body text weight (BookSchema's body_font_weight) — "bold" uses the font's own bold-embedded weight for everything but headings, which already render bold regardless and so don't visually separate from bold body text. Only two values because that's what's actually embedded per font (see PublishFont above). */
export type BodyWeight = "regular" | "bold";

/** Page dimensions, in points, for every format with a real printed page (IDML, PDF, ODT) — BookSchema's page_size. "6x9" is a common trade-paperback trim; the other two are the two paper sizes everything else defaults to. */
export const PAGE_SIZES: Record<Book["page_size"], { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  "6x9": { width: 432, height: 648 }
};

/** Page margin presets, in points, shared by IDML/PDF/ODT — BookSchema's page_margin. "normal" (0.75in) matches IDML's original fixed margin from before this was configurable. */
export const PAGE_MARGINS: Record<Book["page_margin"], number> = {
  narrow: 36,
  normal: 54,
  wide: 72
};

function exportProse(text: string): string {
  return peelModelAsides(text).prose.trim();
}

export type ManuscriptExportEntity = {
  name: string;
  lines: string[];
};

export type ManuscriptExportSection = {
  heading: string;
  entities: ManuscriptExportEntity[];
};

export type ManuscriptExportChapter = {
  heading: string;
  voice: string;
  prose: string;
  /**
   * `chapter.prose`, untouched — unlike `prose` above (which is peeled of
   * stray model asides and trimmed, for the plain-text formats). Bold/
   * italic/underline ranges are offsets into this exact string, so every
   * format that renders real formatting (RTF, ODT, HTML, ePub, PDF) reads
   * from `rawProse`/`formatting` together, never `prose`. Peeling is a
   * defensive no-op in the ordinary case anyway — `chapter.prose` is
   * already peeled of model asides at the point an AI result is accepted
   * into it (`manuscriptFromModel`, BookStore.tsx) — so using the raw
   * string here costs nothing in practice and sidesteps re-deriving how
   * peeling would shift formatting offsets.
   */
  rawProse: string;
  formatting: ProseFormattingRange[];
  /** Data URL (always JPEG) for the chapter's banner illustration, when the author uploaded one. Only HTML, ePub, and PDF embed it — RTF, ODT, and Markdown stay text-only. */
  startImageDataUrl?: string;
};

export type ManuscriptExport = {
  title: string;
  exportedLabel: string;
  note: string;
  voice: string;
  viewpoint: string;
  readerAge?: number;
  /** Drop-cap ("anfang") height in lines for each chapter's opening letter — 0 turns it off (BookSchema's drop_cap_lines). */
  dropCapLines: number;
  /** Decorative scene-break ornament (BookSchema's scene_break_style) — "plain" keeps today's unadorned rule. */
  sceneBreakStyle: Book["scene_break_style"];
  /** Page width/height in points (BookSchema's page_size, looked up via PAGE_SIZES) — used by IDML, PDF, and ODT, the three formats with a real printed page. */
  pageWidth: number;
  pageHeight: number;
  /** Page margin in points (BookSchema's page_margin, looked up via PAGE_MARGINS) — same three formats as pageWidth/pageHeight. */
  margin: number;
  chapters: ManuscriptExportChapter[];
  bible: ManuscriptExportSection[];
};

export function buildManuscriptExport(book: Book, note = "", exportedAt = new Date().toISOString()): ManuscriptExport {
  const bible: ManuscriptExportSection[] = [];
  for (const section of groupBibleEntities(book.facts, book.entity_kinds)) {
    bible.push({
      heading: section.label,
      entities: section.entities.map((entity) => {
        const profile = profileFor(book.profiles, entity.entity_ref);
        const lines: string[] = [];
        if (profile.pronoun) lines.push(`Pronoun: ${profile.pronoun}`);
        if (profile.approximateAge !== undefined) lines.push(`Approximate age: ${profile.approximateAge}`);
        if (profile.looks.trim()) lines.push(`Looks: ${profile.looks.trim()}`);
        if (profile.personality.trim()) lines.push(`Personality: ${profile.personality.trim()}`);
        for (const fact of entity.facts) {
          lines.push(`${PREDICATE_LABELS[fact.predicate]}: ${fact.value.trim()}`);
        }
        return { name: entity.entity_label, lines };
      })
    });
  }
  return {
    title: book.title.trim() || "Untitled manuscript",
    exportedLabel: `Exported ${exportedAt.slice(0, 10) || new Date().toISOString().slice(0, 10)}.`,
    note: note.trim(),
    voice: book.voice.trim(),
    viewpoint: book.viewpoint.trim(),
    ...(book.reader_age !== undefined ? { readerAge: book.reader_age } : {}),
    dropCapLines: book.drop_cap_lines,
    sceneBreakStyle: book.scene_break_style,
    pageWidth: PAGE_SIZES[book.page_size].width,
    pageHeight: PAGE_SIZES[book.page_size].height,
    margin: PAGE_MARGINS[book.page_margin],
    chapters: sortedChapters(book).map((chapter) => ({
      heading: `${chapter.sequence_index + 1}. ${chapter.title.trim() || `Chapter ${chapter.sequence_index + 1}`}`,
      voice: chapter.voice?.trim() ?? "",
      prose: exportProse(chapter.prose),
      rawProse: chapter.prose,
      formatting: chapter.formatting ?? [],
      ...(chapter.startImage ? { startImageDataUrl: chapter.startImage.imageDataUrl } : {})
    })),
    bible
  };
}

export function formatExportMarkdown(doc: ManuscriptExport): string {
  const lines: string[] = [`# ${doc.title}`, "", doc.exportedLabel];
  if (doc.note) {
    lines.push("", doc.note);
  }
  if (doc.voice || doc.viewpoint || doc.readerAge !== undefined) {
    lines.push("");
    if (doc.voice) lines.push(`Voice: ${doc.voice}`);
    if (doc.viewpoint) lines.push(`Viewpoint: ${doc.viewpoint}`);
    if (doc.readerAge !== undefined) lines.push(`Reader: ${doc.readerAge}`);
  }
  for (const chapter of doc.chapters) {
    lines.push("", `## ${chapter.heading}`);
    if (chapter.voice) {
      lines.push(`Voice: ${chapter.voice}`);
    }
    if (chapter.prose) {
      lines.push("", chapter.prose);
    }
  }
  if (doc.bible.length > 0) {
    lines.push("", "## Story Bible");
    for (const section of doc.bible) {
      lines.push("", `### ${section.heading}`);
      for (const entity of section.entities) {
        lines.push("", `**${entity.name}**`);
        for (const line of entity.lines) lines.push(`- ${line}`);
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}

function plainTextProse(prose: string, paragraphStyle: ParagraphStyle): string {
  if (paragraphStyle === "spaced") return prose;
  return splitFlowParagraphs(prose)
    .map((paragraph) => `\t${paragraph}`)
    .join("\n");
}

/** Same content as `formatExportMarkdown`, with no markup at all — for authors who just want the words. */
export function formatExportPlainText(doc: ManuscriptExport, paragraphStyle: ParagraphStyle = "spaced"): string {
  const lines: string[] = [doc.title, "", doc.exportedLabel];
  if (doc.note) {
    lines.push("", doc.note);
  }
  if (doc.voice || doc.viewpoint || doc.readerAge !== undefined) {
    lines.push("");
    if (doc.voice) lines.push(`Voice: ${doc.voice}`);
    if (doc.viewpoint) lines.push(`Viewpoint: ${doc.viewpoint}`);
    if (doc.readerAge !== undefined) lines.push(`Reader: ${doc.readerAge}`);
  }
  for (const chapter of doc.chapters) {
    lines.push("", "", chapter.heading);
    if (chapter.voice) {
      lines.push(`Voice: ${chapter.voice}`);
    }
    if (chapter.prose) {
      lines.push("", plainTextProse(chapter.prose, paragraphStyle));
    }
  }
  if (doc.bible.length > 0) {
    lines.push("", "", "STORY BIBLE");
    for (const section of doc.bible) {
      lines.push("", section.heading.toUpperCase());
      for (const entity of section.entities) {
        lines.push("", entity.name);
        for (const line of entity.lines) lines.push(`- ${line}`);
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}

const HTML_EXPORT_CSS_BASE = `body{max-width:42rem;margin:2.5rem auto;padding:0 1.5rem;line-height:1.6;color:#1a1a1a}h1{font-size:1.9rem;margin-bottom:0.25rem}h2{font-size:1.35rem;margin-top:2.5rem}h3{font-size:1.1rem}.meta{color:#666;font-size:0.9rem}ul{padding-left:1.25rem}.chapter-image{max-width:100%;height:auto;display:block;margin:0.75em 0 1.25em;border-radius:4px}@media print{h2.chapter{break-before:page}}`;
/** Classic printed-book paragraphs — no blank line, first line of each indented, except the paragraph right after a heading (typesetting convention: a section's opening line is set flush). `.first` marks that one explicitly rather than relying on `:first-child`, since a chapter's first paragraph isn't its parent's first element (the heading and an optional image come before it). */
const INDENTED_PARAGRAPHS_CSS = `.indented p{margin:0;text-indent:1.5em}.indented p.first{text-indent:0}`;
const HTML_DEFAULT_STACK = `Georgia, "Times New Roman", serif`;

/**
 * Anfang/drop-cap CSS for one document's chosen line count (BookSchema's
 * drop_cap_lines — 0 means off, so callers skip this entirely then). The
 * 1.5em-per-line multiplier (and no top padding) is the same, separately
 * bisected fix as the live editor preview's (styles.css,
 * .prose.has-drop-cap — see its comment for why 1.8, and even the exact
 * line-height-matching 1.65, wraps text one line too far: a tester
 * reported it, "anfangen är för långt ner nu", across every font tried).
 * This CSS runs against its own, different base (HTML_EXPORT_CSS_BASE/
 * EPUB_CSS_BASE's line-height:1.6 at the browser default font-size,
 * rather than .prose's 1.65 at 1.2rem), so 1.5 here isn't inherited from
 * that fix — it was independently bisected live against real wrapped
 * paragraphs in this export's own CSS and landed on the same number.
 * line-height stays at 1 for the same reason it does there: anything
 * tighter makes the line box shorter than the glyph and clips its top.
 */
function dropCapCss(lines: number): string {
  if (lines <= 0) return "";
  const size = (lines * 1.5).toFixed(2);
  return `.has-drop-cap p.drop-cap::first-letter{float:left;font-weight:700;font-size:${size}em;line-height:1;padding:0 0.08em 0 0}`;
}

/**
 * The four named scene-break ornaments (BookSchema's scene_break_style,
 * "plain" excluded — that's today's unadorned rule, unchanged). Same
 * Unicode characters and colors as styles.css's own .scene-break-* rules
 * for the live editor — a separate, independently maintained copy (same
 * duplication dropCapCss's 1.5 multiplier already has against styles.css's
 * own, for the same reason: two different static CSS bases, nothing to
 * share a constant against at runtime).
 */
const SCENE_BREAK_ORNAMENTS: Record<Exclude<Book["scene_break_style"], "plain">, { char: string; line: string; symbol: string; width: string }> = {
  vignette: { char: "❦", line: "#9c7a52", symbol: "#8a6640", width: "14rem" },
  fleur: { char: "⚜", line: "#c9a227", symbol: "#b8923f", width: "14rem" },
  diamond: { char: "❖", line: "#8f8f8f", symbol: "#7a7a7a", width: "8rem" },
  sparkle: { char: "✦", line: "#a8a8a8", symbol: "#adadad", width: "14rem" }
};

/** HTML/ePub CSS for one document's chosen scene-break style — "plain" needs none (the default short rule is inline on the paragraph itself, see sceneBreakHtml). `pageBg` punches a gap in the line behind the symbol; both exports render on a plain white page, unlike the live editor's themed --bg. */
function sceneBreakCss(style: Book["scene_break_style"], pageBg = "#fff"): string {
  if (style === "plain") return "";
  const o = SCENE_BREAK_ORNAMENTS[style];
  return `.scene-break{display:block;position:relative;height:1px;margin:1.3em auto;width:${o.width};background:linear-gradient(to right,transparent,${o.line},transparent)}.scene-break::before{content:"${o.char}";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:1.05em;line-height:1;color:${o.symbol};background:${pageBg};padding:0 0.6em}`;
}

/** The scene-break paragraph itself (shared by formatExportHtml and packEpub). "plain" keeps the exact markup/look this always had — a short solid rule, no symbol — everything else gets the decorated .scene-break class sceneBreakCss() styles. px, not em: this element also sets its own font-size to 0 (to hide the literal "---" text it still contains, same trick styles.css's .prose-hr already uses), so an em value here would resolve against that zero and collapse to 0 width/margin — caught the same way, against actual rendered pixels, not by inspecting the CSS alone (Playwright reported a 0-width box until this was fixed). */
function sceneBreakHtml(style: Book["scene_break_style"]): string {
  if (style === "plain") return `<p style="height:1px;width:56px;margin:21px auto;background:#ccc;font-size:0;line-height:0;color:transparent">---</p>`;
  return `<p class="scene-break"><span aria-hidden="true"> </span></p>`;
}

/**
 * ODT/RTF scene-break text — neither format can do a fading rule or an
 * overlaid symbol the way HTML/ePub's CSS can (same "different fidelity
 * per format" tradeoff Anfang/drop-cap already made), so every style
 * collapses to a single centered line: the four named ornaments render
 * their real character, "plain" is the old-fashioned asterism (three
 * centered asterisks) rather than the literal "---" both formats rendered
 * before this — unchanged markup, not a dash a reader would mistake for a
 * typo.
 */
function sceneBreakSymbol(style: Book["scene_break_style"]): string {
  return style === "plain" ? "* * *" : SCENE_BREAK_ORNAMENTS[style].char;
}

export type FormattedRun = { text: string; styles: ProseFormattingStyle[] };

/**
 * Splits `text` — a slice of `rawProse` starting at `offset` within it — into
 * runs of constant bold/italic/underline, by walking `formattingSegments`
 * (the same engine proseFlow.ts's live HTML renderer already uses) and
 * slicing. Every rich format (RTF, ODT, HTML, ePub, PDF) calls this once per
 * paragraph, or per PDF text line, to know where to turn styling on and off.
 */
function formattedRuns(text: string, offset: number, formatting: ProseFormattingRange[]): FormattedRun[] {
  if (!text) return [];
  if (formatting.length === 0) return [{ text, styles: [] }];
  return formattingSegments(formatting, offset, offset + text.length).map((segment) => ({
    text: text.slice(segment.start - offset, segment.end - offset),
    styles: segment.styles
  }));
}

/**
 * Same split as `text.split(/\r\n|\n|\r/)` — one entry per raw line, blank
 * lines kept as empty entries — but keeps each line's start offset, the way
 * `splitFlowParagraphsWithOffsets` does for the collapsed/trimmed paragraph
 * split. "Spaced" paragraph style (unlike "indented") renders every typed
 * line as its own paragraph verbatim, so this is the offset-preserving
 * sibling that style's renderers need for formatting lookups.
 */
function splitLinesWithOffsets(text: string): { text: string; start: number }[] {
  const result: { text: string; start: number }[] = [];
  const re = /\r\n|\n|\r/g;
  let start = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    result.push({ text: text.slice(start, match.index), start });
    start = match.index + match[0].length;
  }
  result.push({ text: text.slice(start), start });
  return result;
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function bytesFromDataUrl(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function htmlFontCss(font: PublishFont | undefined, bodyWeight: BodyWeight, bodyColor: string | undefined): string {
  const stack = font?.stack ?? HTML_DEFAULT_STACK;
  const faces = font?.embed
    ? `@font-face{font-family:'${font.name}';font-weight:400;src:url(data:font/ttf;base64,${base64FromBytes(font.embed.regular)}) format('truetype')}` +
      `@font-face{font-family:'${font.name}';font-weight:700;src:url(data:font/ttf;base64,${base64FromBytes(font.embed.bold)}) format('truetype')}`
    : "";
  const color = bodyColor ? `;color:${bodyColor}` : "";
  return `${faces}body{font-family:${stack};font-weight:${bodyWeight === "bold" ? 700 : 400}${color}}`;
}

function htmlRun(run: FormattedRun): string {
  return wrapStyles(xmlEscape(run.text), run.styles);
}

function htmlParagraphs(
  text: string,
  formatting: ProseFormattingRange[],
  paragraphStyle: ParagraphStyle,
  dropCap: boolean,
  sceneBreakStyle: Book["scene_break_style"]
): string {
  if (paragraphStyle === "indented") {
    return splitFlowParagraphsWithOffsets(text)
      .map((paragraph, index) => {
        if (HR_BLOCK.test(paragraph.text)) return sceneBreakHtml(sceneBreakStyle);
        const classes = [index === 0 ? "first" : "", index === 0 && dropCap ? "drop-cap" : ""].filter(Boolean);
        const body = formattedRuns(paragraph.text, paragraph.start, formatting).map(htmlRun).join("");
        return `<p${classes.length > 0 ? ` class="${classes.join(" ")}"` : ""}>${body}</p>`;
      })
      .join("\n");
  }
  const lines = splitLinesWithOffsets(text);
  if (lines.length === 0) return "";
  let dropCapUsed = !dropCap;
  return lines
    .map((line) => {
      if (!line.text) return "<p><br/></p>";
      if (HR_BLOCK.test(line.text)) return sceneBreakHtml(sceneBreakStyle);
      const cls = dropCapUsed ? "" : ' class="drop-cap"';
      dropCapUsed = true;
      const body = formattedRuns(line.text, line.start, formatting).map(htmlRun).join("");
      return `<p${cls}>${body}</p>`;
    })
    .join("\n");
}

export function formatExportHtml(
  doc: ManuscriptExport,
  font?: PublishFont,
  paragraphStyle: ParagraphStyle = "spaced",
  bodyWeight: BodyWeight = "regular",
  bodyColor?: string
): string {
  const body: string[] = [`<h1>${xmlEscape(doc.title)}</h1>`, `<p class="meta">${xmlEscape(doc.exportedLabel)}</p>`];
  if (doc.note) body.push(`<p class="meta">${xmlEscape(doc.note)}</p>`);
  if (doc.voice || doc.viewpoint || doc.readerAge !== undefined) {
    const meta: string[] = [];
    if (doc.voice) meta.push(`Voice: ${xmlEscape(doc.voice)}`);
    if (doc.viewpoint) meta.push(`Viewpoint: ${xmlEscape(doc.viewpoint)}`);
    if (doc.readerAge !== undefined) meta.push(`Reader: ${doc.readerAge}`);
    body.push(`<p class="meta">${meta.join("<br/>")}</p>`);
  }
  for (const chapter of doc.chapters) {
    body.push(`<h2 class="chapter">${xmlEscape(chapter.heading)}</h2>`);
    if (chapter.startImageDataUrl) body.push(`<img class="chapter-image" src="${chapter.startImageDataUrl}" alt=""/>`);
    if (chapter.voice) body.push(`<p class="meta">Voice: ${xmlEscape(chapter.voice)}</p>`);
    if (chapter.prose) {
      body.push(htmlParagraphs(chapter.rawProse, chapter.formatting, paragraphStyle, doc.dropCapLines > 0, doc.sceneBreakStyle));
    }
  }
  if (doc.bible.length > 0) {
    body.push("<h2>Story Bible</h2>");
    for (const section of doc.bible) {
      body.push(`<h3>${xmlEscape(section.heading)}</h3>`);
      for (const entity of section.entities) {
        body.push(`<p><strong>${xmlEscape(entity.name)}</strong></p>`);
        if (entity.lines.length > 0) {
          body.push(`<ul>${entity.lines.map((line) => `<li>${xmlEscape(line)}</li>`).join("")}</ul>`);
        }
      }
    }
  }
  const bodyClasses = [paragraphStyle === "indented" ? "indented" : "", doc.dropCapLines > 0 ? "has-drop-cap" : ""].filter(
    Boolean
  );
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${xmlEscape(doc.title)}</title>
<style>${HTML_EXPORT_CSS_BASE}${INDENTED_PARAGRAPHS_CSS}${dropCapCss(doc.dropCapLines)}${sceneBreakCss(doc.sceneBreakStyle)}${htmlFontCss(font, bodyWeight, bodyColor)}</style>
</head>
<body${bodyClasses.length > 0 ? ` class="${bodyClasses.join(" ")}"` : ""}>
${body.join("\n")}
</body>
</html>
`;
}

/**
 * `doc.dropCapLines` is intentionally not applied here. RTF has no simple
 * drop-cap control word — real ones (as Word itself writes them) are an
 * absolutely-positioned frame around the letter, which is fiddly to get
 * right and inconsistently supported by RTF readers. Left plain rather
 * than shipping something fragile; HTML/ePub/ODT all have a real,
 * well-supported mechanism and get it.
 */
export function formatExportRtf(
  doc: ManuscriptExport,
  font?: PublishFont,
  paragraphStyle: ParagraphStyle = "spaced",
  bodyWeight: BodyWeight = "regular",
  bodyColor?: string
): string {
  const parts: string[] = [
    "{\\rtf1\\ansi\\ansicpg1252\\deff0",
    `{\\fonttbl{\\f0\\froman ${rtfEscape(font?.name ?? "Times New Roman")};}}`,
    ...(bodyColor ? [`{\\colortbl;${rtfColor(bodyColor)};}`] : []),
    [bodyWeight === "bold" ? "\\f0\\fs24\\b" : "\\f0\\fs24", bodyColor ? "\\cf1" : ""].join(""),
    `{\\fs40\\b ${rtfEscape(doc.title)}}\\par`,
    "\\par",
    `${rtfEscape(doc.exportedLabel)}\\par`
  ];
  if (doc.note) {
    parts.push("\\par", `${rtfEscape(doc.note)}\\par`);
  }
  if (doc.voice) parts.push(`${rtfEscape(`Voice: ${doc.voice}`)}\\par`);
  if (doc.viewpoint) parts.push(`${rtfEscape(`Viewpoint: ${doc.viewpoint}`)}\\par`);
  if (doc.readerAge !== undefined) parts.push(`${rtfEscape(`Reader: ${doc.readerAge}`)}\\par`);
  for (const chapter of doc.chapters) {
    parts.push("\\page", `{\\fs32\\b ${rtfEscape(chapter.heading)}}\\par`);
    if (chapter.voice) parts.push(`${rtfEscape(`Voice: ${chapter.voice}`)}\\par`);
    if (chapter.prose) {
      parts.push("\\par", rtfBlock(chapter.rawProse, chapter.formatting, paragraphStyle, doc.sceneBreakStyle));
      if (paragraphStyle === "indented") parts.push("\\pard");
    }
  }
  if (doc.bible.length > 0) {
    parts.push("\\par", `{\\fs32\\b ${rtfEscape("Story Bible")}}\\par`);
    for (const section of doc.bible) {
      parts.push("\\par", `{\\fs28\\b ${rtfEscape(section.heading)}}\\par`);
      for (const entity of section.entities) {
        parts.push("\\par", `{\\b ${rtfEscape(entity.name)}}\\par`);
        for (const line of entity.lines) parts.push(`${rtfEscape(line)}\\par`);
      }
    }
  }
  parts.push("}");
  return parts.join("\n");
}

export function packOdt(
  doc: ManuscriptExport,
  font?: PublishFont,
  paragraphStyle: ParagraphStyle = "spaced",
  bodyWeight: BodyWeight = "regular",
  bodyColor?: string
): Uint8Array {
  return zipStore([
    { name: "mimetype", data: utf8("application/vnd.oasis.opendocument.text") },
    { name: "content.xml", data: utf8(odtContentXml(doc, paragraphStyle)) },
    {
      name: "styles.xml",
      data: utf8(
        odtStyles(
          font?.name ?? "Liberation Serif",
          doc.dropCapLines,
          bodyWeight,
          bodyColor,
          doc.sceneBreakStyle,
          doc.pageWidth,
          doc.pageHeight,
          doc.margin
        )
      )
    },
    { name: "META-INF/manifest.xml", data: utf8(ODT_MANIFEST) }
  ]);
}

const EPUB_CSS_BASE = `body{line-height:1.6;margin:1.25em}h1{font-size:1.6em}h2{font-size:1.3em}.meta{color:#555;font-size:0.9em}`;
const EPUB_DEFAULT_STACK = `Georgia, "Times New Roman", serif`;

function epubFontCss(font: PublishFont | undefined, bodyWeight: BodyWeight, bodyColor: string | undefined): string {
  const stack = font?.stack ?? EPUB_DEFAULT_STACK;
  const faces = font?.embed
    ? `@font-face{font-family:'${font.name}';font-weight:400;src:url(../fonts/regular.ttf) format('truetype')}` +
      `@font-face{font-family:'${font.name}';font-weight:700;src:url(../fonts/bold.ttf) format('truetype')}`
    : "";
  const color = bodyColor ? `;color:${bodyColor}` : "";
  return `${faces}body{font-family:${stack};font-weight:${bodyWeight === "bold" ? 700 : 400}${color}}`;
}

type EpubPage = { id: string; file: string; title: string; body: string; bodyClass?: string };

function epubXhtml(title: string, body: string, bodyClass?: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="utf-8"/><title>${xmlEscape(title)}</title><link rel="stylesheet" type="text/css" href="../styles/stylesheet.css"/></head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
${body}
</body>
</html>
`;
}

type EpubImage = { id: string; name: string; data: Uint8Array };

export function packEpub(
  doc: ManuscriptExport,
  font?: PublishFont,
  paragraphStyle: ParagraphStyle = "spaced",
  bodyWeight: BodyWeight = "regular",
  bodyColor?: string
): Uint8Array {
  const pages: EpubPage[] = [];
  const images: EpubImage[] = [];

  const titleMeta: string[] = [];
  if (doc.voice) titleMeta.push(`Voice: ${xmlEscape(doc.voice)}`);
  if (doc.viewpoint) titleMeta.push(`Viewpoint: ${xmlEscape(doc.viewpoint)}`);
  if (doc.readerAge !== undefined) titleMeta.push(`Reader: ${doc.readerAge}`);
  const titleBody = [
    `<h1>${xmlEscape(doc.title)}</h1>`,
    `<p class="meta">${xmlEscape(doc.exportedLabel)}</p>`,
    doc.note ? `<p class="meta">${xmlEscape(doc.note)}</p>` : "",
    titleMeta.length > 0 ? `<p class="meta">${titleMeta.join("<br/>")}</p>` : ""
  ]
    .filter(Boolean)
    .join("\n");
  pages.push({ id: "title", file: "text/title.xhtml", title: doc.title, body: titleBody });

  doc.chapters.forEach((chapter, index) => {
    const parts = [`<h1>${xmlEscape(chapter.heading)}</h1>`];
    if (chapter.startImageDataUrl) {
      const imageId = `img-chapter-${index}`;
      images.push({ id: imageId, name: `chapter-${index}.jpg`, data: bytesFromDataUrl(chapter.startImageDataUrl) });
      parts.push(`<img src="../images/chapter-${index}.jpg" alt=""/>`);
    }
    if (chapter.voice) parts.push(`<p class="meta">Voice: ${xmlEscape(chapter.voice)}</p>`);
    if (chapter.prose) {
      parts.push(htmlParagraphs(chapter.rawProse, chapter.formatting, paragraphStyle, doc.dropCapLines > 0, doc.sceneBreakStyle));
    }
    const bodyClasses = [paragraphStyle === "indented" ? "indented" : "", doc.dropCapLines > 0 ? "has-drop-cap" : ""].filter(
      Boolean
    );
    pages.push({
      id: `chapter-${index}`,
      file: `text/chapter-${index}.xhtml`,
      title: chapter.heading,
      body: parts.join("\n"),
      ...(bodyClasses.length > 0 ? { bodyClass: bodyClasses.join(" ") } : {})
    });
  });

  if (doc.bible.length > 0) {
    const parts = ["<h1>Story Bible</h1>"];
    for (const section of doc.bible) {
      parts.push(`<h2>${xmlEscape(section.heading)}</h2>`);
      for (const entity of section.entities) {
        parts.push(`<p><strong>${xmlEscape(entity.name)}</strong></p>`);
        if (entity.lines.length > 0) {
          parts.push(`<ul>${entity.lines.map((line) => `<li>${xmlEscape(line)}</li>`).join("")}</ul>`);
        }
      }
    }
    pages.push({ id: "bible", file: "text/bible.xhtml", title: "Story Bible", body: parts.join("\n") });
  }

  const manifestItems = pages
    .map((page) => `    <item id="${page.id}" href="${page.file}" media-type="application/xhtml+xml"/>`)
    .join("\n");
  const imageManifestItems = images
    .map((image) => `    <item id="${image.id}" href="images/${image.name}" media-type="image/jpeg"/>`)
    .join("\n");
  const spineItems = pages.map((page) => `    <itemref idref="${page.id}"/>`).join("\n");
  const navList = pages
    .map((page) => `        <li><a href="${page.file}">${xmlEscape(page.title)}</a></li>`)
    .join("\n");

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${newId()}</dc:identifier>
    <dc:title>${xmlEscape(doc.title)}</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
  </metadata>
  <manifest>
${manifestItems}
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles/stylesheet.css" media-type="text/css"/>${
      imageManifestItems ? `\n${imageManifestItems}` : ""
    }${
      font?.embed
        ? `
    <item id="font-regular" href="fonts/regular.ttf" media-type="application/x-font-ttf"/>
    <item id="font-bold" href="fonts/bold.ttf" media-type="application/x-font-ttf"/>`
        : ""
    }
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>
`;

  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="utf-8"/><title>${xmlEscape(doc.title)}</title><link rel="stylesheet" type="text/css" href="styles/stylesheet.css"/></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${xmlEscape(doc.title)}</h1>
    <ol>
${navList}
    </ol>
  </nav>
</body>
</html>
`;

  const container = `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

  return zipStore([
    { name: "mimetype", data: utf8("application/epub+zip") },
    { name: "META-INF/container.xml", data: utf8(container) },
    { name: "OEBPS/content.opf", data: utf8(opf) },
    { name: "OEBPS/nav.xhtml", data: utf8(nav) },
    {
      name: "OEBPS/styles/stylesheet.css",
      data: utf8(EPUB_CSS_BASE + INDENTED_PARAGRAPHS_CSS + dropCapCss(doc.dropCapLines) + sceneBreakCss(doc.sceneBreakStyle) + epubFontCss(font, bodyWeight, bodyColor))
    },
    ...images.map((image) => ({ name: `OEBPS/images/${image.name}`, data: image.data })),
    ...(font?.embed
      ? [
          { name: "OEBPS/fonts/regular.ttf", data: font.embed.regular },
          { name: "OEBPS/fonts/bold.ttf", data: font.embed.bold }
        ]
      : []),
    ...pages.map((page) => ({ name: `OEBPS/${page.file}`, data: utf8(epubXhtml(page.title, page.body, page.bodyClass)) }))
  ]);
}

const PDF_META_COLOR = rgb(0.4, 0.4, 0.4);

/** Simple leaf silhouette (24x24 viewBox) — "vignette"'s PDF stand-in for ❦. */
const PDF_LEAF_PATH = "M12 2 C18 7 18 17 12 22 C6 17 6 7 12 2 Z";

/** Three overlapping petal lobes plus a base band (24x24 viewBox) — "fleur"'s PDF stand-in for ⚜. */
const PDF_FLEUR_PATH =
  "M12 2 C9 6 8 10 9 14 C9.5 16 10.5 17 12 18 C13.5 17 14.5 16 15 14 C16 10 15 6 12 2 Z " +
  "M12 10 C9 9 5 9 3 11 C2 12.2 2.3 14 4 15 C6.5 16.3 9.5 15 11 12.5 Z " +
  "M12 10 C15 9 19 9 21 11 C22 12.2 21.7 14 20 15 C17.5 16.3 14.5 15 13 12.5 Z " +
  "M7 17 L17 17 L17 19 L7 19 Z";

/** Classic four-point sparkle (24x24 viewBox) — "sparkle"'s PDF stand-in for ✦. */
const PDF_SPARKLE_PATH = "M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z";

/**
 * A handful of short line segments with interpolated opacity — pdf-lib's
 * drawLine has no native gradient, so this is the closest stand-in for the
 * editor/HTML CSS's linear-gradient fade. fadeFrom "left" fades out toward
 * xStart and is solid at xEnd (for the rule's left half); "right" mirrors
 * it (for the right half, solid near the symbol, fading toward the edge).
 */
function drawFadingRule(
  page: PDFPage,
  xStart: number,
  xEnd: number,
  y: number,
  color: ReturnType<typeof rgb>,
  fadeFrom: "left" | "right"
): void {
  const segments = 12;
  const width = xEnd - xStart;
  for (let i = 0; i < segments; i += 1) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const mid = (t0 + t1) / 2;
    const opacity = Math.max(0.08, fadeFrom === "left" ? mid : 1 - mid);
    page.drawLine({ start: { x: xStart + t0 * width, y }, end: { x: xStart + t1 * width, y }, thickness: 0.75, color, opacity });
  }
}

/**
 * Vector approximations of the four named ornaments, drawn by hand rather
 * than rendering the real Unicode glyph — pdf-lib can only draw characters
 * the embedded font actually contains, and the manuscript's chosen body
 * font (Lora, Literata, etc.) has no dingbat glyphs, so drawText would
 * throw on them. Not pixel-exact to the reference image (a hand-curled
 * fleuron and a true fleur-de-lis are calligraphic forms, not something
 * worth freehanding bezier-exact); good enough to read as "ornamental
 * divider" at the small size a scene break actually renders at. (x, y) is
 * the ornament's intended center.
 */
function drawOrnament(page: PDFPage, style: Exclude<Book["scene_break_style"], "plain">, x: number, y: number, color: ReturnType<typeof rgb>): void {
  if (style === "diamond") {
    page.drawRectangle({ x: x - 3.2, y: y - 3.2, width: 6.4, height: 6.4, rotate: degrees(45), color });
    return;
  }
  const paths: Record<"vignette" | "fleur" | "sparkle", { path: string; scale: number }> = {
    vignette: { path: PDF_LEAF_PATH, scale: 0.5 },
    fleur: { path: PDF_FLEUR_PATH, scale: 0.42 },
    sparkle: { path: PDF_SPARKLE_PATH, scale: 0.42 }
  };
  const { path, scale } = paths[style];
  // The path's own viewBox is 24x24; centering it on (x, y) means offsetting
  // by half its scaled size in both axes (drawSvgPath anchors at the path's
  // own top-left origin, not its center).
  page.drawSvgPath(path, { x: x - 12 * scale, y: y + 12 * scale, scale, color });
}

/** Greedy word-wrap using the font's real measured width — shared by PdfWriter and IDML's own pagination (packIdml), which needs the same real line-fitting math to know how much of a chapter fits on one fixed-size page before it has to start a new one. */
function wrapTextLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/ +/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  lines.push(line);
  return lines;
}

/**
 * Same greedy word-wrap as `wrapTextLines`, but keeps each line's [start, end)
 * back into `text` — needed so a caller can look up which formatting ranges
 * fall in a given wrapped line. Measures every line in `font` regardless of
 * what a word inside it will actually be drawn in (bold text is usually a
 * little wider) — an accepted approximation, same spirit as this file's
 * other per-format fidelity trade-offs: a line with a long bold run near the
 * margin can very occasionally run a touch wide, never badly.
 */
function wrapTextLinesWithOffsets(text: string, font: PDFFont, size: number, maxWidth: number): { text: string; start: number; end: number }[] {
  const words = [...text.matchAll(/\S+/g)];
  if (words.length === 0) return [{ text: "", start: 0, end: 0 }];
  const lines: { text: string; start: number; end: number }[] = [];
  let line = "";
  let lineStart = words[0]!.index!;
  let lineEnd = lineStart;
  for (const match of words) {
    const word = match[0];
    const wordStart = match.index!;
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push({ text: line, start: lineStart, end: lineEnd });
      line = word;
      lineStart = wordStart;
      lineEnd = wordStart + word.length;
    } else {
      line = candidate;
      lineEnd = wordStart + word.length;
    }
  }
  lines.push({ text: line, start: lineStart, end: lineEnd });
  return lines;
}

class PdfWriter {
  private readonly pdf: PDFDocument;
  private readonly body: PDFFont;
  private readonly bold: PDFFont;
  private readonly color: ReturnType<typeof rgb> | undefined;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margin: number;
  private readonly maxWidth: number;
  private page: PDFPage;
  private y: number;

  constructor(pdf: PDFDocument, body: PDFFont, bold: PDFFont, pageWidth: number, pageHeight: number, margin: number, color?: ReturnType<typeof rgb>) {
    this.pdf = pdf;
    this.body = body;
    this.bold = bold;
    this.color = color;
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
    this.margin = margin;
    this.maxWidth = pageWidth - margin * 2;
    this.page = pdf.addPage([pageWidth, pageHeight]);
    this.y = pageHeight - margin;
  }

  /** Draws one already-wrapped line run by run — bold switches to the embedded bold font, underline draws a manual rule under the run's measured width. Italic is intentionally not drawn differently: no italic font is embedded for any typeface, and pdf-lib can't synthesize one. */
  private drawStyledLine(lineText: string, offset: number, formatting: ProseFormattingRange[], x: number, size: number): void {
    let cursorX = x;
    for (const run of formattedRuns(lineText, offset, formatting)) {
      const font = run.styles.includes("bold") ? this.bold : this.body;
      this.page.drawText(run.text, { x: cursorX, y: this.y, size, font, ...(this.color ? { color: this.color } : {}) });
      const width = font.widthOfTextAtSize(run.text, size);
      if (run.styles.includes("underline")) {
        const underlineY = this.y - size * 0.12;
        this.page.drawLine({
          start: { x: cursorX, y: underlineY },
          end: { x: cursorX + width, y: underlineY },
          thickness: Math.max(0.5, size * 0.04),
          color: this.color ?? rgb(0, 0, 0)
        });
      }
      cursorX += width;
    }
  }

  private ensureSpace(lineHeight: number): void {
    if (this.y - lineHeight < this.margin) {
      this.page = this.pdf.addPage([this.pageWidth, this.pageHeight]);
      this.y = this.pageHeight - this.margin;
    }
  }

  heading(text: string, size: number): void {
    if (!text) return;
    this.y -= size * 0.3;
    const lineHeight = size * 1.25;
    for (const line of wrapTextLines(text, this.bold, size, this.maxWidth)) {
      this.ensureSpace(lineHeight);
      this.page.drawText(line, { x: this.margin, y: this.y, size, font: this.bold, ...(this.color ? { color: this.color } : {}) });
      this.y -= lineHeight;
    }
    this.y -= size * 0.35;
  }

  lines(text: string, opts: { size?: number; bold?: boolean; meta?: boolean } = {}): void {
    const size = opts.size ?? 11;
    const font = opts.bold ? this.bold : this.body;
    const lineHeight = size * 1.45;
    for (const raw of text.split(/\r\n|\n|\r/)) {
      if (!raw) {
        this.y -= lineHeight * 0.6;
        continue;
      }
      for (const line of wrapTextLines(raw, font, size, this.maxWidth)) {
        this.ensureSpace(lineHeight);
        this.page.drawText(line, {
          x: this.margin,
          y: this.y,
          size,
          font,
          ...(opts.meta ? { color: PDF_META_COLOR } : this.color ? { color: this.color } : {})
        });
        this.y -= lineHeight;
      }
    }
  }

  /** Chapter body text. "spaced" keeps the long-standing line-by-line behavior (a blank source line opens a small gap). "indented" sets each paragraph flush against the next, first line indented — except the chapter's opening paragraph, left flush by convention. A `---` paragraph (either style) draws sceneBreak() instead of the literal dashes it used to. */
  prose(
    text: string,
    formatting: ProseFormattingRange[],
    paragraphStyle: ParagraphStyle,
    sceneBreakStyle: Book["scene_break_style"],
    size = 11
  ): void {
    if (paragraphStyle === "spaced") {
      const lineHeight = size * 1.45;
      for (const raw of splitLinesWithOffsets(text)) {
        if (!raw.text) {
          this.y -= lineHeight * 0.6;
          continue;
        }
        if (HR_BLOCK.test(raw.text)) {
          this.sceneBreak(sceneBreakStyle);
          continue;
        }
        for (const line of wrapTextLinesWithOffsets(raw.text, this.body, size, this.maxWidth)) {
          this.ensureSpace(lineHeight);
          this.drawStyledLine(line.text, raw.start + line.start, formatting, this.margin, size);
          this.y -= lineHeight;
        }
      }
      return;
    }
    const font = this.body;
    const lineHeight = size * 1.45;
    const indent = 20;
    splitFlowParagraphsWithOffsets(text).forEach((paragraph, index) => {
      if (HR_BLOCK.test(paragraph.text)) {
        this.sceneBreak(sceneBreakStyle);
        return;
      }
      wrapTextLinesWithOffsets(paragraph.text, font, size, this.maxWidth).forEach((line, lineIndex) => {
        this.ensureSpace(lineHeight);
        const x = index > 0 && lineIndex === 0 ? this.margin + indent : this.margin;
        this.drawStyledLine(line.text, paragraph.start + line.start, formatting, x, size);
        this.y -= lineHeight;
      });
    });
  }

  /** Draws one scene-break ornament centered on the page and advances past it. "plain" is a short solid rule, no symbol — everything else fades a wider rule toward both edges (drawFadingRule) with drawOrnament() centered in the gap. */
  sceneBreak(style: Book["scene_break_style"]): void {
    const rowHeight = 28;
    this.ensureSpace(rowHeight);
    const centerX = this.margin + this.maxWidth / 2;
    const lineY = this.y - rowHeight / 2;
    if (style === "plain") {
      const half = 25;
      this.page.drawLine({ start: { x: centerX - half, y: lineY }, end: { x: centerX + half, y: lineY }, thickness: 0.75, color: rgb(0.75, 0.75, 0.75) });
      this.y -= rowHeight;
      return;
    }
    const spec = SCENE_BREAK_ORNAMENTS[style];
    const lineColor = pdfRgb(spec.line);
    const symbolColor = pdfRgb(spec.symbol);
    const half = style === "diamond" ? 55 : 95;
    const gap = 10;
    drawFadingRule(this.page, centerX - half, centerX - gap, lineY, lineColor, "left");
    drawFadingRule(this.page, centerX + gap, centerX + half, lineY, lineColor, "right");
    drawOrnament(this.page, style, centerX, lineY, symbolColor);
    this.y -= rowHeight;
  }

  bullet(text: string, size = 11): void {
    const indent = 14;
    const lineHeight = size * 1.45;
    wrapTextLines(text, this.body, size, this.maxWidth - indent).forEach((line, index) => {
      this.ensureSpace(lineHeight);
      this.page.drawText(index === 0 ? `• ${line}` : `  ${line}`, {
        x: this.margin + indent,
        y: this.y,
        size,
        font: this.body,
        ...(this.color ? { color: this.color } : {})
      });
      this.y -= lineHeight;
    });
  }

  space(amount: number): void {
    this.y -= amount;
  }

  image(image: PDFImage): void {
    const availableHeight = this.pageHeight - this.margin * 2;
    const scale = Math.min(1, this.maxWidth / image.width, availableHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    this.ensureSpace(height);
    this.page.drawImage(image, { x: this.margin, y: this.y - height, width, height });
    this.y -= height + 14;
  }

  newPage(): void {
    this.page = this.pdf.addPage([this.pageWidth, this.pageHeight]);
    this.y = this.pageHeight - this.margin;
  }
}

/**
 * `doc.dropCapLines` is intentionally not applied here (yet). This writer
 * lays out text by hand (pdf-lib, no browser engine behind it) — a real
 * drop cap needs the body text to wrap around the big letter's width for
 * its first few lines, which means computing a narrower wrap width per
 * line rather than the single `maxWidth` `wrap()` uses today. Worth doing
 * as a follow-up; HTML/ePub/ODT already get a real one in the meantime.
 */
export async function packPdf(
  doc: ManuscriptExport,
  font?: PublishFont,
  paragraphStyle: ParagraphStyle = "spaced",
  bodyWeight: BodyWeight = "regular",
  bodyColor?: string
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(doc.title);
  let body: PDFFont;
  let bold: PDFFont;
  if (font?.embed) {
    pdf.registerFontkit(fontkit);
    // Subsetting trims file size but produces glyph tables some readers (Adobe Acrobat in
    // particular) render incompletely. A full embed costs a few hundred KB more but is safe.
    body = await pdf.embedFont(font.embed.regular);
    bold = await pdf.embedFont(font.embed.bold);
  } else {
    body = await pdf.embedFont(StandardFonts.TimesRoman);
    bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  }
  const writer = new PdfWriter(
    pdf,
    bodyWeight === "bold" ? bold : body,
    bold,
    doc.pageWidth,
    doc.pageHeight,
    doc.margin,
    bodyColor ? pdfRgb(bodyColor) : undefined
  );

  writer.heading(doc.title, 22);
  writer.lines(doc.exportedLabel, { size: 9, meta: true });
  if (doc.note) writer.lines(doc.note, { size: 9, meta: true });
  const meta: string[] = [];
  if (doc.voice) meta.push(`Voice: ${doc.voice}`);
  if (doc.viewpoint) meta.push(`Viewpoint: ${doc.viewpoint}`);
  if (doc.readerAge !== undefined) meta.push(`Reader: ${doc.readerAge}`);
  if (meta.length > 0) writer.lines(meta.join("\n"), { size: 9, meta: true });

  for (const chapter of doc.chapters) {
    writer.newPage();
    writer.heading(chapter.heading, 15);
    if (chapter.startImageDataUrl) {
      const image = await pdf.embedJpg(bytesFromDataUrl(chapter.startImageDataUrl));
      writer.image(image);
    }
    if (chapter.voice) writer.lines(`Voice: ${chapter.voice}`, { size: 9, meta: true });
    if (chapter.prose) writer.prose(chapter.rawProse, chapter.formatting, paragraphStyle, doc.sceneBreakStyle);
  }

  if (doc.bible.length > 0) {
    writer.space(18);
    writer.heading("Story Bible", 15);
    for (const section of doc.bible) {
      writer.space(6);
      writer.heading(section.heading, 12);
      for (const entity of section.entities) {
        writer.lines(entity.name, { bold: true });
        for (const line of entity.lines) writer.bullet(line);
      }
    }
  }

  return pdf.save();
}

/** 567 twips ≈ 0.4in, a common manuscript first-line indent. */
const RTF_INDENT_TWIPS = 567;

/** Wraps a run's escaped text in its own `{...}` group with the control words its styles need — grouped so none of them leak into whatever follows. */
function rtfRun(run: FormattedRun): string {
  const escaped = rtfEscape(run.text);
  if (run.styles.length === 0) return escaped;
  const controls = [
    run.styles.includes("bold") ? "\\b" : "",
    run.styles.includes("italic") ? "\\i" : "",
    run.styles.includes("underline") ? "\\ul" : ""
  ].join("");
  return `{${controls} ${escaped}}`;
}

function rtfBlock(
  text: string,
  formatting: ProseFormattingRange[],
  paragraphStyle: ParagraphStyle,
  sceneBreakStyle: Book["scene_break_style"]
): string {
  // Wrapped in its own `{...}` group so `\qc` (centered) never leaks into
  // the paragraphs after it — RTF alignment otherwise persists until
  // explicitly reset, and the "spaced" branch below never resets it.
  const sceneBreak = `{\\qc ${rtfEscape(sceneBreakSymbol(sceneBreakStyle))}\\par}`;
  if (paragraphStyle === "indented") {
    return splitFlowParagraphsWithOffsets(text)
      .map((paragraph, index) => {
        if (HR_BLOCK.test(paragraph.text)) return sceneBreak;
        const body = formattedRuns(paragraph.text, paragraph.start, formatting).map(rtfRun).join("");
        return `\\pard\\sa0\\fi${index === 0 ? 0 : RTF_INDENT_TWIPS} ${body}\\par`;
      })
      .join("\n");
  }
  return splitLinesWithOffsets(text)
    .map((line) =>
      HR_BLOCK.test(line.text) ? sceneBreak : `${formattedRuns(line.text, line.start, formatting).map(rtfRun).join("")}\\par`
    )
    .join("\n");
}

// ===================== IDML (InDesign Markup Language) =====================
//
// A from-scratch IDML writer — ComicBook AI, the sibling repo Mats pointed
// at as a reference, turned out to have no IDML export anywhere in it
// (confirmed by searching the repo directly: zero hits for "idml",
// "InDesign", or "icml" in its code, PROJECT_SPEC.md, or README). Built
// instead against the documented IDML package shape: a zip of XML resource
// and content files, assembled the same way packOdt/packEpub already build
// their own zip-of-XML packages, with `zipStore` reused as-is.
//
// Unlike every other format in this file, this one could not be verified
// by actually opening the result in InDesign — not available in this
// environment, the same kind of gap as an AI chain nobody here can run
// end to end without a connected model. What IS verified (see the "IDML
// structure" tests): the zip is valid, every XML file parses, and every
// Self/src cross-reference in designmap.xml resolves to something the
// package actually contains. Treat the first real export as a first draft
// to open in InDesign and report back on.

let idmlIdCounter = 0;
/**
 * Zero-padded to a fixed width (6 digits — room for ~a million ids, far
 * more than any real manuscript needs) so every id's numeric creation
 * order also matches its STRING sort order. Found by direct measurement
 * to be the actual cause of a real, reported bug: unpadded ids like
 * "uSpread6", "uSpread13", ..., "uSpread108" sort correctly as numbers
 * but scramble badly as plain strings (every id starting with a higher
 * leading digit, like "uSpread2..." through "uSpread9...", sorts before
 * "uSpread108" lexicographically) — and InDesign's own Pages panel
 * turned out to display this writer's threaded spreads in that scrambled
 * string order rather than the order they're listed in designmap.xml,
 * exactly reproducing a real report of early chapters' pages (and even
 * the title page) appearing far later than their actual position, with
 * unrelated spreads shown first. Confirmed by reproducing the reported
 * page number precisely: a synthetic 30-chapter book's title spread
 * (always first in designmap.xml and always the very first id this
 * writer generates) lands at string-sorted index 108 of 121 spreads —
 * the same page number independently reported for where a real
 * manuscript's title text actually appeared.
 */
function idmlId(prefix: string): string {
  idmlIdCounter += 1;
  return `${prefix}${String(idmlIdCounter).padStart(6, "0")}`;
}

const IDML_BODY_SIZE = 12;
const IDML_LINE_HEIGHT = IDML_BODY_SIZE * 1.4;
const IDML_TITLE_SIZE = 28;
const IDML_CHAPTER_HEADING_SIZE = 20;
const IDML_PARA_END = "&#13;"; // the paragraph-end mark IDML stories expect — a literal \r byte would be silently normalized away by any XML parser per the XML 1.0 spec, so it has to be a character reference, not raw text

/**
 * IDML paragraph style names — used as both the style's displayed `Name`
 * (what Mats sees in InDesign's own Paragraph Styles panel) and its
 * internal `Self="ParagraphStyle/<name>"` identifier, the same way real
 * InDesign-authored IDML routinely uses a human-readable name as the path
 * itself (e.g. the reserved "$ID/[No paragraph style]"). Named constants,
 * not inline string literals, so the definition in `idmlStylesXml` and
 * every place a block is tagged with one of these names (and the places
 * that later compare against it, like `idmlStyleMetrics`) can never drift
 * out of sync with each other.
 */
const IDML_STYLE_TITLE = "Title";
const IDML_STYLE_CHAPTER_NAME = "Chapter Name";
const IDML_STYLE_BODY_TEXT = "Body Text";
const IDML_STYLE_BODY_TEXT_FIRST = "Body Text First";
const IDML_STYLE_BODY_TEXT_INDENTED = "Body Text Indented";
const IDML_STYLE_SCENE_BREAK = "Scene Break";

/** Font size and line-height for a paragraph style — used to measure a block's real wrapped height (`idmlBlockHeight`) with the same numbers `idmlStylesXml` gives the style itself, so pagination's idea of how tall a Title/Chapter Name block is matches what actually renders. */
function idmlStyleMetrics(styleName: string): { size: number; lineHeight: number } {
  if (styleName === IDML_STYLE_TITLE) return { size: IDML_TITLE_SIZE, lineHeight: IDML_TITLE_SIZE * 1.2 };
  if (styleName === IDML_STYLE_CHAPTER_NAME) return { size: IDML_CHAPTER_HEADING_SIZE, lineHeight: IDML_CHAPTER_HEADING_SIZE * 1.2 };
  return { size: IDML_BODY_SIZE, lineHeight: IDML_LINE_HEIGHT };
}

function idmlCharacterAttrs(styles: ProseFormattingStyle[]): string {
  const bold = styles.includes("bold");
  const italic = styles.includes("italic");
  const underline = styles.includes("underline");
  const fontStyle = bold && italic ? "Bold Italic" : bold ? "Bold" : italic ? "Italic" : "Regular";
  return ` FontStyle="${fontStyle}"${underline ? ` Underline="true"` : ""}`;
}

/** One `<CharacterStyleRange>` — a local FontStyle/Underline override on the reserved "no character style", rather than named CharacterStyle resources (IDML allows either; local overrides need no Styles.xml entries to stay in sync). `paragraphEnd` appends the paragraph-end mark IDML expects on the last run of every paragraph. */
function idmlRun(run: FormattedRun, paragraphEnd = false): string {
  const content = `<Content>${xmlEscape(run.text)}${paragraphEnd ? IDML_PARA_END : ""}</Content>`;
  const attrs = run.styles.length === 0 ? "" : idmlCharacterAttrs(run.styles);
  return `<CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"${attrs}>${content}</CharacterStyleRange>`;
}

function idmlParagraphRuns(text: string, offset: number, formatting: ProseFormattingRange[]): string {
  const runs = formattedRuns(text, offset, formatting);
  if (runs.length === 0) return idmlRun({ text: "", styles: [] }, true);
  return runs.map((run, index) => idmlRun(run, index === runs.length - 1)).join("");
}

function idmlParagraph(paragraphStyleName: string, runsXml: string, extraAttrs = ""): string {
  return `<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/${paragraphStyleName}"${extraAttrs}>${runsXml}</ParagraphStyleRange>`;
}

/**
 * One paragraph-ish unit of chapter/bible content, kept separate from its
 * eventual page and its rendered XML — `idmlBlockHeight` measures it with
 * real font metrics before `paginateIdmlBlocks` decides which page it lands
 * on, and only then does `idmlBlockXml` turn it into markup. `forceBold` is
 * for Story Bible entity names, which are always bold with no formatting
 * ranges of their own to express that (unlike chapter prose).
 */
type IdmlBlock =
  | { kind: "sceneBreak" }
  | { kind: "paragraph"; text: string; start: number; styleName: string; dropCapLines: number; forceBold?: boolean };

/** Chapter body blocks, mirroring the same spaced/indented split and HR_BLOCK scene-break detection every other rich format uses — `splitFlowParagraphsWithOffsets`/`splitLinesWithOffsets` are exactly the offset-preserving tools this needs. Pagination (deciding which blocks land on which page) happens separately, in `paginateIdmlBlocks`. */
function idmlChapterBlocks(text: string, paragraphStyle: ParagraphStyle, dropCapLines: number): IdmlBlock[] {
  if (paragraphStyle === "indented") {
    let firstUsed = false;
    return splitFlowParagraphsWithOffsets(text).map((paragraph): IdmlBlock => {
      if (HR_BLOCK.test(paragraph.text)) return { kind: "sceneBreak" };
      const isFirst = !firstUsed;
      firstUsed = true;
      return {
        kind: "paragraph",
        text: paragraph.text,
        start: paragraph.start,
        styleName: isFirst ? IDML_STYLE_BODY_TEXT_FIRST : IDML_STYLE_BODY_TEXT_INDENTED,
        dropCapLines: isFirst ? dropCapLines : 0
      };
    });
  }
  let firstUsed = false;
  return splitLinesWithOffsets(text).map((line): IdmlBlock => {
    if (!line.text) return { kind: "paragraph", text: "", start: line.start, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 };
    if (HR_BLOCK.test(line.text)) return { kind: "sceneBreak" };
    const isFirst = !firstUsed;
    firstUsed = true;
    return { kind: "paragraph", text: line.text, start: line.start, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: isFirst ? dropCapLines : 0 };
  });
}

function idmlBibleBlocks(bible: ManuscriptExportSection[]): IdmlBlock[] {
  const blocks: IdmlBlock[] = [{ kind: "paragraph", text: "Story Bible", start: 0, styleName: IDML_STYLE_CHAPTER_NAME, dropCapLines: 0 }];
  for (const section of bible) {
    blocks.push({ kind: "paragraph", text: section.heading, start: 0, styleName: IDML_STYLE_CHAPTER_NAME, dropCapLines: 0 });
    for (const entity of section.entities) {
      blocks.push({ kind: "paragraph", text: entity.name, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0, forceBold: true });
      for (const line of entity.lines) blocks.push({ kind: "paragraph", text: line, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 });
    }
  }
  return blocks;
}

function idmlBlockXml(block: IdmlBlock, formatting: ProseFormattingRange[], sceneBreakStyle: Book["scene_break_style"]): string {
  if (block.kind === "sceneBreak") {
    return idmlParagraph(IDML_STYLE_SCENE_BREAK, idmlRun({ text: sceneBreakSymbol(sceneBreakStyle), styles: [] }, true));
  }
  const dropCapAttr = block.dropCapLines > 0 ? ` DropCapCharacters="1" DropCapLines="${block.dropCapLines}"` : "";
  if (!block.text) return idmlParagraph(block.styleName, idmlRun({ text: "", styles: [] }, true));
  if (block.forceBold) return idmlParagraph(block.styleName, idmlRun({ text: block.text, styles: ["bold"] }, true));
  return idmlParagraph(block.styleName, idmlParagraphRuns(block.text, block.start, formatting), dropCapAttr);
}

/**
 * The real `SpaceAfter` (or, for ChapterHeading, `SpaceBefore` too — it
 * always follows a page break so there's no previous block to absorb it)
 * `idmlStylesXml` gives a style, in points. Body Text and its First/
 * Indented variants are all "0" since v1.0.117 (an earlier version had
 * Body carry a non-zero SpaceAfter, doubling the visible gap between
 * "spaced" mode's own explicit blank-line paragraphs — see `idmlStylesXml`'s
 * comment); only Title/Chapter Name/Scene Break still add real space.
 */
function idmlStyleSpaceAfter(styleName: string): number {
  if (styleName === IDML_STYLE_TITLE) return 18;
  if (styleName === IDML_STYLE_CHAPTER_NAME) return 24 + 14;
  if (styleName === IDML_STYLE_SCENE_BREAK) return 10 + 10;
  return 0;
}

/**
 * A block's real rendered height, in points — wrapped with the manuscript's
 * actual embedded (or standard fallback) font, the same `wrapTextLines`
 * pdf-lib-backed word-wrap PdfWriter uses for its own real pagination, not a
 * character-count guess. Measured at the block's real style size
 * (`idmlStyleMetrics` — Title/ChapterHeading are far larger than body text)
 * and in the bold font for anything that renders bold (headings, and Story
 * Bible entity names), since bold glyphs measure a little wider and using
 * the regular font there would risk undercounting wrapped lines. Adds the
 * style's own real `SpaceAfter`/`SpaceBefore` (`idmlStyleSpaceAfter`) rather
 * than a flat guess — an earlier flat `+ size * 0.3` allowance, written back
 * when Body Text still carried a real SpaceAfter, was never updated when
 * that value changed to "0" in v1.0.117, leaving every block (the large
 * majority of them Body Text, which no longer has any SpaceAfter at all) a
 * little taller than it actually renders — compounded across a whole book,
 * a real test showed this inflating the page-count estimate enough to
 * leave roughly half the manuscript's pages sitting empty.
 */
function idmlBlockHeight(block: IdmlBlock, bodyFont: PDFFont, boldFont: PDFFont, columnWidth: number): number {
  if (block.kind === "sceneBreak") return IDML_LINE_HEIGHT * 2;
  if (!block.text) return IDML_LINE_HEIGHT;
  const { size, lineHeight } = idmlStyleMetrics(block.styleName);
  const isBold = block.forceBold || block.styleName === IDML_STYLE_TITLE || block.styleName === IDML_STYLE_CHAPTER_NAME;
  const lineCount = wrapTextLines(block.text, isBold ? boldFont : bodyFont, size, columnWidth).length;
  return lineCount * lineHeight + idmlStyleSpaceAfter(block.styleName);
}

/**
 * Estimates how many pages a unit's blocks will need, by the same real
 * per-block height measurement (`idmlBlockHeight`) PDF's own pagination
 * uses. `packIdml` only reads this estimate's `.length` — to decide how
 * many threaded frames to pre-create for the unit — not its actual
 * per-page grouping; the unit's full text always goes into one shared
 * Story that InDesign/Affinity auto-flow across those frames themselves
 * when the file opens (see `packIdml`'s own comment on why, and its
 * history). A block taller than a whole page by itself (a very long single
 * paragraph) is still counted as needing its own page rather than split
 * mid-paragraph — a rare, accepted edge case.
 */
function paginateIdmlBlocks(blocks: IdmlBlock[], bodyFont: PDFFont, boldFont: PDFFont, columnWidth: number, pageHeight: number): IdmlBlock[][] {
  const pages: IdmlBlock[][] = [];
  let current: IdmlBlock[] = [];
  let remaining = pageHeight;
  for (const block of blocks) {
    const height = idmlBlockHeight(block, bodyFont, boldFont, columnWidth);
    if (current.length > 0 && height > remaining) {
      pages.push(current);
      current = [];
      remaining = pageHeight;
    }
    current.push(block);
    remaining -= height;
  }
  pages.push(current);
  return pages;
}

function idmlStoryXml(storyId: string, paragraphsXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Story xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0">
  <Story Self="${storyId}" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="" AppliedNamedGrid="n">
    <StoryPreference OpticalMarginAlignment="false" StoryOrientation="Horizontal" StoryDirection="LeftToRightDirection"/>
    ${paragraphsXml}
  </Story>
</idPkg:Story>
`;
}

/**
 * A plain rectangle, as IDML's own path-based geometry model expects it: four
 * corner points in the item's own LOCAL coordinates (0,0 at one corner,
 * width/height at the opposite one), each point's Left/RightDirection equal
 * to its own Anchor since every corner is a straight line, never a curve.
 */
function idmlRectPathGeometry(width: number, height: number): string {
  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height]
  ];
  const points = corners
    .map(([x, y]) => `<PathPointType Anchor="${x} ${y}" LeftDirection="${x} ${y}" RightDirection="${x} ${y}"/>`)
    .join("");
  return `<Properties><PathGeometry><GeometryPathType PathOpen="false"><PathPointArray>${points}</PathPointArray></GeometryPathType></PathGeometry></Properties>`;
}

/**
 * One page, with one TextFrame, threaded to the next/previous frame of the
 * same unit's Story via `previousTextFrame`/`nextTextFrame` ("n" at either
 * end of a chain) — see `packIdml`'s own comment for why threading is back
 * after being abandoned once already.
 *
 * The TextFrame's shape comes from a `<Properties><PathGeometry>` rectangle
 * in the frame's own local coordinates, positioned on the page via
 * `ItemTransform`'s translation — not a bare `GeometricBounds` attribute
 * with an identity transform, which is what every earlier version of this
 * writer used. IDML's actual page-item model is path-based (so a frame can
 * be any shape, not just a rectangle); `GeometricBounds` is a cached summary
 * value, and a `TextFrame` with no `PathGeometry` of its own has no
 * authoritative shape for a reader to fall back on. Found by comparing
 * against ComicBook AI's own IDML writer, which includes a PathGeometry on
 * every page item it draws and has never once used a bare GeometricBounds
 * for one — the one difference between a frame this writer always
 * generated and one a reference implementation actually produces.
 *
 * `AllowPageShuffle="false"` (also set document-wide on `DocumentPreference`
 * in `idmlPreferencesXml`) tells InDesign not to reflow this writer's
 * one-page-per-Spread layout into its own default facing-pages pairing —
 * without it, a real test showed InDesign inserting a blank companion page
 * before every one of this writer's standalone pages (except the first),
 * nearly doubling the page count, while Affinity — which doesn't shuffle
 * pages the same way — showed every page correctly. Found the same way as
 * the PathGeometry fix above: ComicBook AI's own IDML writer sets this
 * `false` in both places, never `true`.
 *
 * `spreadIndex` places this Spread at its own position on the document's
 * pasteboard (`ItemTransform`'s translation, `spreadIndex * pageWidth`
 * along X) instead of every Spread sitting at an identical "0 0" — a real
 * InDesign document's pasteboard is one continuous strip with every Spread
 * occupying its own successive segment of it, never multiple Spreads
 * stacked on top of each other; ComicBook AI's own (never-threaded) IDML
 * writer never surfaced this, since reading order for independent,
 * non-threaded pages doesn't depend on pasteboard position the way a
 * reader resolving a threaded Story's auto-flow across many Spreads might.
 * `Page` and `TextFrame` below keep their own small, page-relative
 * transforms unchanged — only the Spread's own position on the shared
 * pasteboard moves.
 */
function idmlSpreadXml(
  spreadId: string,
  pageId: string,
  frameId: string,
  storyId: string,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  label: string,
  spreadIndex: number,
  previousTextFrame = "n",
  nextTextFrame = "n"
): string {
  const columnWidth = pageWidth - margin * 2;
  const columnHeight = pageHeight - margin * 2;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Spread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0">
  <Spread Self="${spreadId}" PageCount="1" BindingLocation="0" AllowPageShuffle="false" ItemTransform="1 0 0 1 ${spreadIndex * pageWidth} 0" ShowMasterItems="false">
    <Page Self="${pageId}" Name="${xmlEscape(label)}" AppliedMaster="n" OverrideList="" GeometricBounds="0 0 ${pageHeight} ${pageWidth}" ItemTransform="1 0 0 1 0 0">
      <MarginPreference ColumnCount="1" ColumnGutter="18" Top="${margin}" Bottom="${margin}" Left="${margin}" Right="${margin}"/>
    </Page>
    <TextFrame Self="${frameId}" ParentStory="${storyId}" PreviousTextFrame="${previousTextFrame}" NextTextFrame="${nextTextFrame}" ContentType="TextType" ItemTransform="1 0 0 1 ${margin} ${margin}">
      ${idmlRectPathGeometry(columnWidth, columnHeight)}
      <TextFramePreference TextColumnCount="1" TextColumnFixedWidth="${columnWidth}" UseFlexibleColumnWidth="false" FirstBaselineOffset="AscentOffset" VerticalJustification="TopAlign" InsetSpacing="0 0 0 0"/>
    </TextFrame>
  </Spread>
</idPkg:Spread>
`;
}

/**
 * The OCF container convention IDML actually packages (same `urn:oasis:
 * names:tc:opendocument:xmlns:container` namespace other OCF-based formats
 * use) — the first file InDesign reads to find designmap.xml, so a wrong
 * namespace or attribute name here breaks the whole package before
 * anything else in it is even looked at.
 */
const IDML_CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="designmap.xml" media-type="text/xml"/></rootfiles></container>
`;

/** The reserved color/swatch names ("Black", "Paper", "Registration", "None") InDesign expects any IDML package to define — none of them are referenced with a custom value anywhere in this writer, but the entries themselves are part of what makes a package well-formed. */
function idmlGraphicXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Graphic xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0">
  <Color Self="Color/Black" Model="Process" Space="CMYK" ColorValue="0 0 0 100" Name="Black" ColorEditable="false" ColorRemovable="false"/>
  <Color Self="Color/Paper" Model="Spot" Space="CMYK" ColorValue="0 0 0 0" Name="Paper" ColorEditable="false" ColorRemovable="false"/>
  <Color Self="Color/Registration" Model="Registration" Space="CMYK" ColorValue="100 100 100 100" Name="Registration" ColorEditable="false" ColorRemovable="false"/>
  <Swatch Self="Swatch/None" Name="None" ColorEditable="false" ColorRemovable="false"/>
</idPkg:Graphic>
`;
}

/** Declares the chosen font family exists, the same way RTF/ODT reference a font by name and leave finding it to whatever opens the file — not an embedded font file. InDesign shows its own missing-font warning if it isn't actually installed, same as Word/LibreOffice would for RTF/ODT. */
function idmlFontsXml(fontName: string): string {
  const escaped = xmlEscape(fontName);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Fonts xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0">
  <FontFamily Self="FontFamily/${escaped}" Name="${escaped}">
    <Font Self="Font/${escaped}-Regular" FontFamily="${escaped}" Name="${escaped}" PostScriptName="${escaped}" FontStyleName="Regular" Status="INSTALLED" WritingScript="0" PlatformName="${escaped}"/>
  </FontFamily>
</idPkg:Fonts>
`;
}

function idmlPreferencesXml(pageCount: number, pageWidth: number, pageHeight: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Preferences xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0">
  <DocumentPreference PageWidth="${pageWidth}" PageHeight="${pageHeight}" FacingPages="false" PagesPerDocument="${pageCount}" PageBindingDirection="LeftToRightDirection" AllowPageShuffle="false" Intent="PrintIntent"/>
  <ViewPreference HorizontalMeasurementUnits="Points" VerticalMeasurementUnits="Points"/>
</idPkg:Preferences>
`;
}

/** A single, empty master spread — required for the package to be structurally complete, but applied to none of the real pages (`AppliedMaster="n"` throughout `idmlSpreadXml`), so there's nothing on it to get wrong. */
function idmlMasterSpreadXml(masterSelf: string, masterPageSelf: string, pageWidth: number, pageHeight: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:MasterSpread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0">
  <MasterSpread Self="${masterSelf}" Name="A" NamePrefix="A" BaseName="A" ShowMasterItems="true" PageCount="1">
    <Page Self="${masterPageSelf}" Name="A" AppliedMaster="n" OverrideList="" GeometricBounds="0 0 ${pageHeight} ${pageWidth}" ItemTransform="1 0 0 1 0 0"/>
  </MasterSpread>
</idPkg:MasterSpread>
`;
}

/**
 * Title/ChapterHeading/Body(+First/+Indented)/SceneBreak paragraph styles,
 * plus the two reserved "no style" entries every IDML Styles.xml defines.
 * Character formatting (bold/italic/underline) is never a named style here
 * — see `idmlRun`'s local FontStyle/Underline overrides instead.
 *
 * Body's `SpaceAfter` is "0", not a real gap — "spaced" paragraph style
 * already puts an explicit blank-line paragraph between real ones
 * (`idmlChapterBlocks`), the same empty-paragraph-as-separator convention
 * every other export format uses. A `SpaceAfter` on top of that blank
 * paragraph's own line height doubled the visible gap between paragraphs,
 * confirmed by a real test in Affinity.
 */
function idmlStylesXml(fontName: string, bodyWeight: BodyWeight): string {
  const escaped = xmlEscape(fontName);
  const bodyFontStyle = bodyWeight === "bold" ? "Bold" : "Regular";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Styles xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0">
  <RootCharacterStyleGroup Self="u_ccg">
    <CharacterStyle Self="CharacterStyle/$ID/[No character style]" Name="$ID/[No character style]"/>
  </RootCharacterStyleGroup>
  <RootParagraphStyleGroup Self="u_pcg">
    <ParagraphStyle Self="ParagraphStyle/$ID/[No paragraph style]" Name="$ID/[No paragraph style]"/>
    <ParagraphStyle Self="ParagraphStyle/${IDML_STYLE_TITLE}" Name="${IDML_STYLE_TITLE}" PointSize="${IDML_TITLE_SIZE}" FontStyle="Bold" Justification="LeftAlign" SpaceAfter="18">
      <Properties><AppliedFont type="string">${escaped}</AppliedFont></Properties>
    </ParagraphStyle>
    <ParagraphStyle Self="ParagraphStyle/${IDML_STYLE_CHAPTER_NAME}" Name="${IDML_STYLE_CHAPTER_NAME}" PointSize="${IDML_CHAPTER_HEADING_SIZE}" FontStyle="Bold" Justification="LeftAlign" SpaceBefore="24" SpaceAfter="14">
      <Properties><AppliedFont type="string">${escaped}</AppliedFont></Properties>
    </ParagraphStyle>
    <ParagraphStyle Self="ParagraphStyle/${IDML_STYLE_BODY_TEXT}" Name="${IDML_STYLE_BODY_TEXT}" PointSize="${IDML_BODY_SIZE}" Leading="${IDML_LINE_HEIGHT}" FontStyle="${bodyFontStyle}" SpaceAfter="0">
      <Properties><AppliedFont type="string">${escaped}</AppliedFont></Properties>
    </ParagraphStyle>
    <ParagraphStyle Self="ParagraphStyle/${IDML_STYLE_BODY_TEXT_FIRST}" Name="${IDML_STYLE_BODY_TEXT_FIRST}" BasedOn="ParagraphStyle/${IDML_STYLE_BODY_TEXT}" FirstLineIndent="0"/>
    <ParagraphStyle Self="ParagraphStyle/${IDML_STYLE_BODY_TEXT_INDENTED}" Name="${IDML_STYLE_BODY_TEXT_INDENTED}" BasedOn="ParagraphStyle/${IDML_STYLE_BODY_TEXT}" FirstLineIndent="18" SpaceAfter="0"/>
    <ParagraphStyle Self="ParagraphStyle/${IDML_STYLE_SCENE_BREAK}" Name="${IDML_STYLE_SCENE_BREAK}" BasedOn="ParagraphStyle/${IDML_STYLE_BODY_TEXT}" Justification="CenterAlign" SpaceBefore="10" SpaceAfter="10"/>
  </RootParagraphStyleGroup>
</idPkg:Styles>
`;
}

/**
 * Packs the manuscript as an IDML package at the manuscript's chosen page
 * size (BookSchema's page_size/page_margin, carried in `doc.pageWidth`/
 * `doc.pageHeight`/`doc.margin`) — every page in the document shares the
 * same size, never a custom height per page. An earlier version of this
 * writer gave each chapter its own, independently-estimated page height;
 * that's exactly what made InDesign stop trusting the per-page
 * GeometricBounds and instead reflow the whole document to a size of its
 * own choosing, confirmed by a real test where every page came out the
 * same unrelated height and all but one chapter's text went missing. A
 * chapter (or the Story Bible) gets one Story holding its whole text,
 * threaded across as many pages as it's estimated to need
 * (`paginateIdmlBlocks`, reused here only for its page *count* — the real
 * per-page split is InDesign/Affinity's own job once the frames are
 * threaded) — real, linked text frames, the way an author actually wants to
 * open the file in InDesign and edit it: tighten a sentence and have the
 * rest of the chapter reflow, not find every page an island.
 *
 * Threading was tried once before (pre-v1.0.111) and abandoned after a real
 * test showed far too many pages and no visible text. At the time that
 * looked like proof the threading syntax itself couldn't be trusted. In
 * hindsight it wasn't: the two bugs that test actually hit — a `TextFrame`
 * with no `PathGeometry` of its own (see `idmlRectPathGeometry`'s comment)
 * and `AllowPageShuffle` left `true` (see `idmlSpreadXml`'s comment) — are
 * both independent of threading and would have broken the single-frame-per-
 * page version just the same; they just hadn't been found yet. Both are
 * fixed now, each confirmed by its own real test, so threading is back on
 * top of a foundation that's actually been verified. The page-count
 * estimate still carries a small safety margin for a multi-page chapter
 * (an extra frame left empty is harmless; running out of frames mid-
 * chapter would silently clip text, the one outcome worth erring away
 * from) — but it no longer has to be as generous as before, since this
 * estimate is only ever a starting point for InDesign/Affinity's own real
 * layout now, not the sole source of truth it had to be when self-
 * pagination was the whole story.
 *
 * Async (unlike every other pack* export) because that page-count estimate
 * needs real font metrics — the same embedded (or standard fallback) font
 * `packPdf` already embeds, for the same reason. `bodyColor` isn't carried
 * into IDML: unlike a screen-reading preference, a print-layout document's
 * color is squarely the author's own call to make once it's in InDesign,
 * not something worth guessing a swatch for here.
 */
export async function packIdml(
  doc: ManuscriptExport,
  font?: PublishFont,
  paragraphStyle: ParagraphStyle = "spaced",
  bodyWeight: BodyWeight = "regular"
): Promise<Uint8Array> {
  idmlIdCounter = 0;
  const fontName = font?.name ?? "Times New Roman";
  const masterSelf = idmlId("uMaster");
  const masterPageSelf = idmlId("uMasterPage");
  const docSelf = idmlId("uDoc");
  const { pageWidth, pageHeight, margin } = doc;
  const columnWidth = pageWidth - margin * 2;
  const columnHeight = pageHeight - margin * 2;

  // Only used to measure real wrapped line counts (idmlBlockHeight) — no
  // PDF page is ever created or kept, this PDFDocument exists purely to
  // borrow pdf-lib's font metrics, the same ones packPdf uses for its own
  // real pagination.
  const metricsPdf = await PDFDocument.create();
  let bodyMetricsFont: PDFFont;
  let boldMetricsFont: PDFFont;
  if (font?.embed) {
    metricsPdf.registerFontkit(fontkit);
    bodyMetricsFont = await metricsPdf.embedFont(font.embed.regular);
    boldMetricsFont = await metricsPdf.embedFont(font.embed.bold);
  } else {
    bodyMetricsFont = await metricsPdf.embedFont(StandardFonts.TimesRoman);
    boldMetricsFont = await metricsPdf.embedFont(StandardFonts.TimesRomanBold);
  }
  const measuringFont = bodyWeight === "bold" ? boldMetricsFont : bodyMetricsFont;

  const otherFiles: { name: string; data: Uint8Array }[] = [];
  const storyIds: string[] = [];
  const spreadRefs: string[] = [];
  const storyRefs: string[] = [];

  const units: { label: string; blocks: IdmlBlock[]; formatting: ProseFormattingRange[] }[] = [];

  const titleBlocks: IdmlBlock[] = [{ kind: "paragraph", text: doc.title, start: 0, styleName: IDML_STYLE_TITLE, dropCapLines: 0 }];
  titleBlocks.push({ kind: "paragraph", text: doc.exportedLabel, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 });
  if (doc.note) titleBlocks.push({ kind: "paragraph", text: doc.note, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 });
  if (doc.voice) titleBlocks.push({ kind: "paragraph", text: `Voice: ${doc.voice}`, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 });
  if (doc.viewpoint) titleBlocks.push({ kind: "paragraph", text: `Viewpoint: ${doc.viewpoint}`, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 });
  if (doc.readerAge !== undefined) titleBlocks.push({ kind: "paragraph", text: `Reader: ${doc.readerAge}`, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 });
  units.push({ label: doc.title, blocks: titleBlocks, formatting: [] });

  for (const chapter of doc.chapters) {
    const blocks: IdmlBlock[] = [{ kind: "paragraph", text: chapter.heading, start: 0, styleName: IDML_STYLE_CHAPTER_NAME, dropCapLines: 0 }];
    if (chapter.voice) blocks.push({ kind: "paragraph", text: `Voice: ${chapter.voice}`, start: 0, styleName: IDML_STYLE_BODY_TEXT, dropCapLines: 0 });
    if (chapter.rawProse) blocks.push(...idmlChapterBlocks(chapter.rawProse, paragraphStyle, doc.dropCapLines));
    units.push({ label: chapter.heading, blocks, formatting: chapter.formatting });
  }

  if (doc.bible.length > 0) {
    units.push({ label: "Story Bible", blocks: idmlBibleBlocks(doc.bible), formatting: [] });
  }

  // Every Spread's own position on the document's shared pasteboard — see
  // idmlSpreadXml's comment on why each one needs a distinct position
  // instead of every Spread sitting at an identical "0 0". Counted across
  // the whole document (not reset per unit), the same way a real InDesign
  // pasteboard has one continuous strip of spreads regardless of which
  // story each one belongs to.
  let globalSpreadIndex = 0;

  for (const unit of units) {
    // Reused only for its page count — the real per-page split now happens
    // in InDesign/Affinity once the frames below are threaded together.
    const estimatedPages = paginateIdmlBlocks(unit.blocks, measuringFont, boldMetricsFont, columnWidth, columnHeight).length;
    const frameCount = estimatedPages > 1 ? estimatedPages + 1 : estimatedPages;

    const storySelf = idmlId("uStory");
    const paragraphsXml = unit.blocks.map((block) => idmlBlockXml(block, unit.formatting, doc.sceneBreakStyle)).join("");
    storyIds.push(storySelf);
    otherFiles.push({ name: `Stories/Story_${storySelf}.xml`, data: utf8(idmlStoryXml(storySelf, paragraphsXml)) });
    storyRefs.push(`  <idPkg:Story src="Stories/Story_${storySelf}.xml"/>`);

    const frameIds = Array.from({ length: frameCount }, () => idmlId("uFrame"));
    for (let index = 0; index < frameCount; index += 1) {
      const spreadSelf = idmlId("uSpread");
      const pageSelf = idmlId("uPage");
      const label = index === 0 ? unit.label : `${unit.label} (${index + 1})`;
      const previousTextFrame = index > 0 ? frameIds[index - 1]! : "n";
      const nextTextFrame = index < frameCount - 1 ? frameIds[index + 1]! : "n";
      otherFiles.push({
        name: `Spreads/Spread_${spreadSelf}.xml`,
        data: utf8(
          idmlSpreadXml(
            spreadSelf,
            pageSelf,
            frameIds[index]!,
            storySelf,
            pageWidth,
            pageHeight,
            margin,
            label,
            globalSpreadIndex,
            previousTextFrame,
            nextTextFrame
          )
        )
      });
      spreadRefs.push(`  <idPkg:Spread src="Spreads/Spread_${spreadSelf}.xml"/>`);
      globalSpreadIndex += 1;
    }
  }

  const pageCount = spreadRefs.length;

  // No default `xmlns=` on <Document> — only the idPkg: prefix resource
  // references need a namespace; Document and its children (Layer, Page,
  // Spread/Story refs) are unprefixed. The `<?aid ...?>` processing
  // instruction right after the XML declaration is InDesign's own package
  // marker, found on every real IDML designmap.xml.
  const designmap = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?aid style="50" type="document" readerVersion="6.0" featureSet="257"?>
<Document xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="8.0" Self="${docSelf}" StoryList="${storyIds.join(" ")}" ZeroPoint="0 0">
  <idPkg:Graphic src="Resources/Graphic.xml"/>
  <idPkg:Fonts src="Resources/Fonts.xml"/>
  <idPkg:Styles src="Resources/Styles.xml"/>
  <idPkg:Preferences src="Resources/Preferences.xml"/>
  <idPkg:MasterSpread src="MasterSpreads/MasterSpread_${masterSelf}.xml"/>
${spreadRefs.join("\n")}
${storyRefs.join("\n")}
</Document>
`;

  return zipStore([
    { name: "mimetype", data: utf8("application/vnd.adobe.indesign-idml-package") },
    { name: "META-INF/container.xml", data: utf8(IDML_CONTAINER_XML) },
    { name: "designmap.xml", data: utf8(designmap) },
    { name: "Resources/Graphic.xml", data: utf8(idmlGraphicXml()) },
    { name: "Resources/Fonts.xml", data: utf8(idmlFontsXml(fontName)) },
    { name: "Resources/Styles.xml", data: utf8(idmlStylesXml(fontName, bodyWeight)) },
    { name: "Resources/Preferences.xml", data: utf8(idmlPreferencesXml(pageCount, pageWidth, pageHeight)) },
    { name: `MasterSpreads/MasterSpread_${masterSelf}.xml`, data: utf8(idmlMasterSpreadXml(masterSelf, masterPageSelf, pageWidth, pageHeight)) },
    ...otherFiles
  ]);
}

/** Parses a BookSchema-validated "#RRGGBB" string (the schema's regex already guarantees this shape) into 0-255 channel ints. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}

function rtfColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `\\red${r}\\green${g}\\blue${b}`;
}

function pdfRgb(hex: string): ReturnType<typeof rgb> {
  const { r, g, b } = hexToRgb(hex);
  return rgb(r / 255, g / 255, b / 255);
}

function rtfEscape(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (char === "\\" || char === "{" || char === "}") out += `\\${char}`;
    else if (code === 9) out += "\\tab ";
    else if (code < 128) out += char;
    else if (code <= 0xffff) {
      const signed = code > 32767 ? code - 65536 : code;
      out += `\\u${signed}?`;
    } else {
      const s = code - 0x10000;
      const hi = 0xd800 + (s >> 10);
      const lo = 0xdc00 + (s & 0x3ff);
      out += `\\u${hi > 32767 ? hi - 65536 : hi}?\\u${lo > 32767 ? lo - 65536 : lo}?`;
    }
  }
  return out;
}

function xmlEscape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function odtParagraphs(text: string, style = "Standard", firstStyle = style, sceneBreakStyle: Book["scene_break_style"] = "plain"): string {
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length === 0) return `<text:p text:style-name="${style}"/>`;
  let firstUsed = false;
  return lines
    .map((line) => {
      if (!line) return `<text:p text:style-name="${style}"/>`;
      if (HR_BLOCK.test(line)) return `<text:p text:style-name="SceneBreak">${xmlEscape(sceneBreakSymbol(sceneBreakStyle))}</text:p>`;
      const lineStyle = firstUsed ? style : firstStyle;
      firstUsed = true;
      return `<text:p text:style-name="${lineStyle}">${xmlEscape(line)}</text:p>`;
    })
    .join("");
}

/** "Bold", "Italic", "BoldItalicUnderline", etc. — one of the seven non-empty style combinations `odtStyles()` defines as a `style:family="text"` style. */
function odtSpanStyleName(styles: ProseFormattingStyle[]): string {
  return (
    (styles.includes("bold") ? "Bold" : "") +
    (styles.includes("italic") ? "Italic" : "") +
    (styles.includes("underline") ? "Underline" : "")
  );
}

function odtRun(run: FormattedRun): string {
  const escaped = xmlEscape(run.text);
  return run.styles.length === 0 ? escaped : `<text:span text:style-name="${odtSpanStyleName(run.styles)}">${escaped}</text:span>`;
}

function odtProse(
  text: string,
  formatting: ProseFormattingRange[],
  paragraphStyle: ParagraphStyle,
  dropCap: boolean,
  sceneBreakStyle: Book["scene_break_style"]
): string {
  if (paragraphStyle === "spaced") {
    let firstUsed = false;
    return splitLinesWithOffsets(text)
      .map((line) => {
        if (!line.text) return `<text:p text:style-name="Standard"/>`;
        if (HR_BLOCK.test(line.text)) return `<text:p text:style-name="SceneBreak">${xmlEscape(sceneBreakSymbol(sceneBreakStyle))}</text:p>`;
        const lineStyle = firstUsed || !dropCap ? "Standard" : "StandardDropCap";
        firstUsed = true;
        const body = formattedRuns(line.text, line.start, formatting).map(odtRun).join("");
        return `<text:p text:style-name="${lineStyle}">${body}</text:p>`;
      })
      .join("");
  }
  return splitFlowParagraphsWithOffsets(text)
    .map((paragraph, index) => {
      if (HR_BLOCK.test(paragraph.text)) return `<text:p text:style-name="SceneBreak">${xmlEscape(sceneBreakSymbol(sceneBreakStyle))}</text:p>`;
      const firstStyle = dropCap ? "IndentedFirstDropCap" : "IndentedFirst";
      const body = formattedRuns(paragraph.text, paragraph.start, formatting).map(odtRun).join("");
      return `<text:p text:style-name="${index === 0 ? firstStyle : "Indented"}">${body}</text:p>`;
    })
    .join("");
}

function odtHeading(level: 1 | 2 | 3, text: string): string {
  const style = level === 1 ? "Title" : level === 2 ? "Heading_20_1" : "Heading_20_2";
  return `<text:h text:style-name="${style}" text:outline-level="${level}">${xmlEscape(text)}</text:h>`;
}

function odtChapterHeading(text: string): string {
  return `<text:h text:style-name="ChapterHeading" text:outline-level="2">${xmlEscape(text)}</text:h>`;
}

function odtContentXml(doc: ManuscriptExport, paragraphStyle: ParagraphStyle): string {
  const body: string[] = [odtHeading(1, doc.title), odtParagraphs(doc.exportedLabel)];
  if (doc.note) body.push(odtParagraphs(doc.note));
  if (doc.voice) body.push(odtParagraphs(`Voice: ${doc.voice}`));
  if (doc.viewpoint) body.push(odtParagraphs(`Viewpoint: ${doc.viewpoint}`));
  if (doc.readerAge !== undefined) body.push(odtParagraphs(`Reader: ${doc.readerAge}`));
  for (const chapter of doc.chapters) {
    body.push(odtChapterHeading(chapter.heading));
    if (chapter.voice) body.push(odtParagraphs(`Voice: ${chapter.voice}`));
    if (chapter.prose) {
      body.push(odtProse(chapter.rawProse, chapter.formatting, paragraphStyle, doc.dropCapLines > 0, doc.sceneBreakStyle));
    }
  }
  if (doc.bible.length > 0) {
    body.push(odtHeading(2, "Story Bible"));
    for (const section of doc.bible) {
      body.push(odtHeading(3, section.heading));
      for (const entity of section.entities) {
        body.push(odtParagraphs(entity.name, "Strong"));
        for (const line of entity.lines) body.push(odtParagraphs(line));
      }
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.3">
  <office:automatic-styles/>
  <office:body>
    <office:text>${body.join("")}</office:text>
  </office:body>
</office:document-content>
`;
}

/** One `style:family="text"` style per non-empty bold/italic/underline combination — referenced by name from `odtRun`'s `<text:span>`s. */
const ODT_SPAN_STYLES = `
    <style:style style:name="Bold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>
    <style:style style:name="Italic" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>
    <style:style style:name="Underline" style:family="text"><style:text-properties style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style>
    <style:style style:name="BoldItalic" style:family="text"><style:text-properties fo:font-weight="bold" fo:font-style="italic"/></style:style>
    <style:style style:name="BoldUnderline" style:family="text"><style:text-properties fo:font-weight="bold" style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style>
    <style:style style:name="ItalicUnderline" style:family="text"><style:text-properties fo:font-style="italic" style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style>
    <style:style style:name="BoldItalicUnderline" style:family="text"><style:text-properties fo:font-weight="bold" fo:font-style="italic" style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style>`;

function odtStyles(
  fontName: string,
  dropCapLines = 0,
  bodyWeight: BodyWeight = "regular",
  bodyColor?: string,
  sceneBreakStyle: Book["scene_break_style"] = "plain",
  pageWidth = PAGE_SIZES["6x9"].width,
  pageHeight = PAGE_SIZES["6x9"].height,
  margin = PAGE_MARGINS.normal
): string {
  const dropCapStyles =
    dropCapLines > 0
      ? `
    <style:style style:name="StandardDropCap" style:family="paragraph" style:parent-style-name="Standard">
      <style:paragraph-properties><style:drop-cap style:lines="${dropCapLines}" style:length="1"/></style:paragraph-properties>
    </style:style>
    <style:style style:name="IndentedFirstDropCap" style:family="paragraph" style:parent-style-name="IndentedFirst">
      <style:paragraph-properties><style:drop-cap style:lines="${dropCapLines}" style:length="1"/></style:paragraph-properties>
    </style:style>`
      : "";
  const sceneBreakColor = sceneBreakStyle === "plain" ? "" : ` fo:color="${SCENE_BREAK_ORNAMENTS[sceneBreakStyle].symbol}"`;
  const sceneBreakStyleXml = `
    <style:style style:name="SceneBreak" style:family="paragraph" style:parent-style-name="Standard">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0.3cm" fo:margin-bottom="0.3cm"/>
      <style:text-properties fo:font-size="14pt"${sceneBreakColor}/>
    </style:style>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3">
  <office:styles>
    <style:style style:name="Standard" style:family="paragraph">
      <style:text-properties style:font-name="${xmlEscape(fontName)}" fo:font-size="12pt"${
        bodyWeight === "bold" ? ` fo:font-weight="bold"` : ""
      }${bodyColor ? ` fo:color="${bodyColor}"` : ""}/>
    </style:style>
    <style:style style:name="Title" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-size="22pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Heading_20_1" style:display-name="Heading 1" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ChapterHeading" style:family="paragraph" style:parent-style-name="Heading_20_1">
      <style:paragraph-properties fo:break-before="page"/>
    </style:style>
    <style:style style:name="Heading_20_2" style:display-name="Heading 2" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-size="14pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Strong" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Indented" style:family="paragraph" style:parent-style-name="Standard">
      <style:paragraph-properties fo:margin-top="0in" fo:margin-bottom="0in" fo:text-indent="0.4in"/>
    </style:style>
    <style:style style:name="IndentedFirst" style:family="paragraph" style:parent-style-name="Standard">
      <style:paragraph-properties fo:margin-top="0in" fo:margin-bottom="0in" fo:text-indent="0in"/>
    </style:style>${dropCapStyles}${sceneBreakStyleXml}${ODT_SPAN_STYLES}
  </office:styles>
  <office:automatic-styles>
    <style:page-layout style:name="PM1">
      <style:page-layout-properties fo:page-width="${pageWidth}pt" fo:page-height="${pageHeight}pt" fo:margin-top="${margin}pt" fo:margin-bottom="${margin}pt" fo:margin-left="${margin}pt" fo:margin-right="${margin}pt" style:print-orientation="portrait"/>
    </style:page-layout>
  </office:automatic-styles>
  <office:master-styles>
    <style:master-page style:name="Standard" style:page-layout-name="PM1"/>
  </office:master-styles>
</office:document-styles>
`;
}

const ODT_MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="META-INF/manifest.xml" manifest:media-type="text/xml"/>
</manifest:manifest>
`;

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i]!;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = utf8(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(14, crc & 0xffff, true);
    view.setUint16(16, crc >>> 16, true);
    view.setUint32(18, file.data.length, true);
    view.setUint32(22, file.data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    chunks.push(local, file.data);
    const dir = new Uint8Array(46 + name.length);
    const dview = new DataView(dir.buffer);
    dview.setUint32(0, 0x02014b50, true);
    dview.setUint16(4, 20, true);
    dview.setUint16(6, 20, true);
    dview.setUint16(16, crc & 0xffff, true);
    dview.setUint16(18, crc >>> 16, true);
    dview.setUint32(20, file.data.length, true);
    dview.setUint32(24, file.data.length, true);
    dview.setUint16(28, name.length, true);
    dview.setUint32(42, offset, true);
    dir.set(name, 46);
    central.push(dir);
    offset += local.length + file.data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const eview = new DataView(end.buffer);
  eview.setUint32(0, 0x06054b50, true);
  eview.setUint16(8, files.length, true);
  eview.setUint16(10, files.length, true);
  eview.setUint32(12, centralSize, true);
  eview.setUint32(16, offset, true);
  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of chunks) {
    out.set(part, at);
    at += part.length;
  }
  for (const part of central) {
    out.set(part, at);
    at += part.length;
  }
  out.set(end, at);
  return out;
}
