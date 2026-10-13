import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { groupBibleEntities } from "./bibleGroups";
import { sortedChapters, type Book } from "./BookSchema";
import { profileFor } from "./characterProfile";
import { PREDICATE_LABELS } from "./predicates";
import { HR_BLOCK, peelModelAsides, splitFlowParagraphs } from "./proseFlow";
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
    chapters: sortedChapters(book).map((chapter) => ({
      heading: `${chapter.sequence_index + 1}. ${chapter.title.trim() || `Chapter ${chapter.sequence_index + 1}`}`,
      voice: chapter.voice?.trim() ?? "",
      prose: exportProse(chapter.prose),
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

function htmlParagraphs(text: string, paragraphStyle: ParagraphStyle, dropCap: boolean, sceneBreakStyle: Book["scene_break_style"]): string {
  if (paragraphStyle === "indented") {
    return splitFlowParagraphs(text)
      .map((paragraph, index) => {
        if (HR_BLOCK.test(paragraph)) return sceneBreakHtml(sceneBreakStyle);
        const classes = [index === 0 ? "first" : "", index === 0 && dropCap ? "drop-cap" : ""].filter(Boolean);
        return `<p${classes.length > 0 ? ` class="${classes.join(" ")}"` : ""}>${xmlEscape(paragraph)}</p>`;
      })
      .join("\n");
  }
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length === 0) return "";
  let dropCapUsed = !dropCap;
  return lines
    .map((line) => {
      if (!line) return "<p><br/></p>";
      if (HR_BLOCK.test(line)) return sceneBreakHtml(sceneBreakStyle);
      const cls = dropCapUsed ? "" : ' class="drop-cap"';
      dropCapUsed = true;
      return `<p${cls}>${xmlEscape(line)}</p>`;
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
    if (chapter.prose) body.push(htmlParagraphs(chapter.prose, paragraphStyle, doc.dropCapLines > 0, doc.sceneBreakStyle));
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
      parts.push("\\par", rtfBlock(chapter.prose, paragraphStyle, doc.sceneBreakStyle));
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
      data: utf8(odtStyles(font?.name ?? "Liberation Serif", doc.dropCapLines, bodyWeight, bodyColor, doc.sceneBreakStyle))
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
    if (chapter.prose) parts.push(htmlParagraphs(chapter.prose, paragraphStyle, doc.dropCapLines > 0, doc.sceneBreakStyle));
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

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN = 56;
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

class PdfWriter {
  private readonly pdf: PDFDocument;
  private readonly body: PDFFont;
  private readonly bold: PDFFont;
  private readonly color: ReturnType<typeof rgb> | undefined;
  private readonly maxWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
  private page: PDFPage;
  private y: number;

  constructor(pdf: PDFDocument, body: PDFFont, bold: PDFFont, color?: ReturnType<typeof rgb>) {
    this.pdf = pdf;
    this.body = body;
    this.bold = bold;
    this.color = color;
    this.page = pdf.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
    this.y = PDF_PAGE_HEIGHT - PDF_MARGIN;
  }

  private wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

  private ensureSpace(lineHeight: number): void {
    if (this.y - lineHeight < PDF_MARGIN) {
      this.page = this.pdf.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
      this.y = PDF_PAGE_HEIGHT - PDF_MARGIN;
    }
  }

  heading(text: string, size: number): void {
    if (!text) return;
    this.y -= size * 0.3;
    const lineHeight = size * 1.25;
    for (const line of this.wrap(text, this.bold, size, this.maxWidth)) {
      this.ensureSpace(lineHeight);
      this.page.drawText(line, { x: PDF_MARGIN, y: this.y, size, font: this.bold, ...(this.color ? { color: this.color } : {}) });
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
      for (const line of this.wrap(raw, font, size, this.maxWidth)) {
        this.ensureSpace(lineHeight);
        this.page.drawText(line, {
          x: PDF_MARGIN,
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
  prose(text: string, paragraphStyle: ParagraphStyle, sceneBreakStyle: Book["scene_break_style"], size = 11): void {
    if (paragraphStyle === "spaced") {
      const lineHeight = size * 1.45;
      for (const raw of text.split(/\r\n|\n|\r/)) {
        if (!raw) {
          this.y -= lineHeight * 0.6;
          continue;
        }
        if (HR_BLOCK.test(raw)) {
          this.sceneBreak(sceneBreakStyle);
          continue;
        }
        for (const line of this.wrap(raw, this.body, size, this.maxWidth)) {
          this.ensureSpace(lineHeight);
          this.page.drawText(line, { x: PDF_MARGIN, y: this.y, size, font: this.body, ...(this.color ? { color: this.color } : {}) });
          this.y -= lineHeight;
        }
      }
      return;
    }
    const font = this.body;
    const lineHeight = size * 1.45;
    const indent = 20;
    splitFlowParagraphs(text).forEach((paragraph, index) => {
      if (HR_BLOCK.test(paragraph)) {
        this.sceneBreak(sceneBreakStyle);
        return;
      }
      this.wrap(paragraph, font, size, this.maxWidth).forEach((line, lineIndex) => {
        this.ensureSpace(lineHeight);
        const x = index > 0 && lineIndex === 0 ? PDF_MARGIN + indent : PDF_MARGIN;
        this.page.drawText(line, { x, y: this.y, size, font, ...(this.color ? { color: this.color } : {}) });
        this.y -= lineHeight;
      });
    });
  }

  /** Draws one scene-break ornament centered on the page and advances past it. "plain" is a short solid rule, no symbol — everything else fades a wider rule toward both edges (drawFadingRule) with drawOrnament() centered in the gap. */
  sceneBreak(style: Book["scene_break_style"]): void {
    const rowHeight = 28;
    this.ensureSpace(rowHeight);
    const centerX = PDF_MARGIN + this.maxWidth / 2;
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
    this.wrap(text, this.body, size, this.maxWidth - indent).forEach((line, index) => {
      this.ensureSpace(lineHeight);
      this.page.drawText(index === 0 ? `• ${line}` : `  ${line}`, {
        x: PDF_MARGIN + indent,
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
    const availableHeight = PDF_PAGE_HEIGHT - PDF_MARGIN * 2;
    const scale = Math.min(1, this.maxWidth / image.width, availableHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    this.ensureSpace(height);
    this.page.drawImage(image, { x: PDF_MARGIN, y: this.y - height, width, height });
    this.y -= height + 14;
  }

  newPage(): void {
    this.page = this.pdf.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
    this.y = PDF_PAGE_HEIGHT - PDF_MARGIN;
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
  const writer = new PdfWriter(pdf, bodyWeight === "bold" ? bold : body, bold, bodyColor ? pdfRgb(bodyColor) : undefined);

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
    if (chapter.prose) writer.prose(chapter.prose, paragraphStyle, doc.sceneBreakStyle);
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

function rtfBlock(text: string, paragraphStyle: ParagraphStyle, sceneBreakStyle: Book["scene_break_style"]): string {
  // Wrapped in its own `{...}` group so `\qc` (centered) never leaks into
  // the paragraphs after it — RTF alignment otherwise persists until
  // explicitly reset, and the "spaced" branch below never resets it.
  const sceneBreak = `{\\qc ${rtfEscape(sceneBreakSymbol(sceneBreakStyle))}\\par}`;
  if (paragraphStyle === "indented") {
    return splitFlowParagraphs(text)
      .map((paragraph, index) => {
        if (HR_BLOCK.test(paragraph)) return sceneBreak;
        return `\\pard\\sa0\\fi${index === 0 ? 0 : RTF_INDENT_TWIPS} ${rtfEscape(paragraph)}\\par`;
      })
      .join("\n");
  }
  return text
    .split(/\r\n|\n|\r/)
    .map((line) => (HR_BLOCK.test(line) ? sceneBreak : `${rtfEscape(line)}\\par`))
    .join("\n");
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

function odtProse(text: string, paragraphStyle: ParagraphStyle, dropCap: boolean, sceneBreakStyle: Book["scene_break_style"]): string {
  if (paragraphStyle === "spaced") {
    return odtParagraphs(text, "Standard", dropCap ? "StandardDropCap" : "Standard", sceneBreakStyle);
  }
  return splitFlowParagraphs(text)
    .map((paragraph, index) => {
      if (HR_BLOCK.test(paragraph)) return `<text:p text:style-name="SceneBreak">${xmlEscape(sceneBreakSymbol(sceneBreakStyle))}</text:p>`;
      const firstStyle = dropCap ? "IndentedFirstDropCap" : "IndentedFirst";
      return `<text:p text:style-name="${index === 0 ? firstStyle : "Indented"}">${xmlEscape(paragraph)}</text:p>`;
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
    if (chapter.prose) body.push(odtProse(chapter.prose, paragraphStyle, doc.dropCapLines > 0, doc.sceneBreakStyle));
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

function odtStyles(
  fontName: string,
  dropCapLines = 0,
  bodyWeight: BodyWeight = "regular",
  bodyColor?: string,
  sceneBreakStyle: Book["scene_break_style"] = "plain"
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
    </style:style>${dropCapStyles}${sceneBreakStyleXml}
  </office:styles>
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
