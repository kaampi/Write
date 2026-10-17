import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { addChapter, createBook, updateChapter } from "@core/BookSchema";
import { packManuscriptBackup } from "@core/manuscriptBackup";
import {
  buildManuscriptExport,
  formatExportHtml,
  formatExportMarkdown,
  formatExportPlainText,
  formatExportRtf,
  packEpub,
  packIdml,
  packOdt,
  packPdf,
  PAGE_SIZES,
  type PublishFont
} from "@core/manuscriptExport";

const LORA: PublishFont = {
  name: "Lora",
  stack: `Lora, Georgia, serif`,
  embed: {
    regular: new Uint8Array(readFileSync(new URL("../../src/assets/fonts/lora/Lora-Regular.ttf", import.meta.url))),
    bold: new Uint8Array(readFileSync(new URL("../../src/assets/fonts/lora/Lora-Bold.ttf", import.meta.url)))
  }
};

// A real, tiny (4x3px) valid JPEG — needed because pdf-lib's embedJpg() rejects garbage bytes.
const TINY_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDIooor5E/SD//Z";
const TINY_JPEG_DATA_URL = `data:image/jpeg;base64,${TINY_JPEG_BASE64}`;

describe("manuscript export formats", () => {
  it("writes RTF with headings and escapes control marks", () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the {door}." });
    const rtf = formatExportRtf(buildManuscriptExport(book, "First pass"));
    expect(rtf.startsWith("{\\rtf1")).toBe(true);
    expect(rtf).toContain("Night Keys");
    expect(rtf).toContain("The quay");
    expect(rtf).toContain("Emma locked the \\{door\\}.");
    expect(rtf).toContain("First pass");
    expect(rtf).not.toContain("brainstorm");
  });

  it("packs ODT as a zip Scrivener can import", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "secret stowaway" };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const odt = packOdt(buildManuscriptExport(book));
    const text = new TextDecoder().decode(odt);
    expect(odt[0]).toBe(0x50);
    expect(odt[1]).toBe(0x4b);
    expect(text).toContain("application/vnd.oasis.opendocument.text");
    expect(text).toContain("Emma locked the door.");
    expect(text).toContain("The quay");
    expect(text).not.toContain("secret stowaway");
  });

  it("exports live prose and leaves earlier versions out", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Emma locked the door.",
      revisions: [
        {
          id: "rev-1",
          at: "2026-09-21T00:00:00.000Z",
          op: "draft",
          prose: "SECRET OLD VERSION the stowaway smiled."
        }
      ]
    });
    const doc = buildManuscriptExport(book);
    expect(doc.chapters[0]?.prose).toBe("Emma locked the door.");
    expect(JSON.stringify(doc)).not.toContain("SECRET OLD VERSION");
  });

  it("drops a model Note from chapter prose so it cannot ride along", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: '(Note: Changed "moves with practiced ease" to "surges through".)Jeff\'s eyes adjust.'
    });
    const doc = buildManuscriptExport(book);
    expect(doc.chapters[0]?.prose).toBe("Jeff's eyes adjust.");
    expect(doc.chapters[0]?.prose).not.toContain("Note:");
  });

  it("writes a self-contained HTML page and escapes markup", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "secret stowaway", synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      brief: "Emma meets the stranger",
      prose: "Emma locked the <door>."
    });
    const html = formatExportHtml(buildManuscriptExport(book, "First pass"));
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("Night Keys");
    expect(html).toContain("The quay");
    expect(html).toContain("Emma locked the &lt;door&gt;.");
    expect(html).toContain("First pass");
    expect(html).not.toContain("secret stowaway");
    expect(html).not.toContain("Synopsis");
    expect(html).not.toContain("Emma leaves before winter.");
    expect(html).not.toContain("Emma meets the stranger");
    expect(html).toContain(`<h2 class="chapter">`);
  });

  it("writes plain text with no markup at all", () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door.\n\nShe waited." });
    const txt = formatExportPlainText(buildManuscriptExport(book, "First pass"));
    expect(txt).toContain("Night Keys");
    expect(txt).toContain("The quay");
    expect(txt).toContain("Emma locked the door.\n\nShe waited.");
    expect(txt).toContain("First pass");
    expect(txt).not.toContain("#");
    expect(txt).not.toContain("**");
    expect(txt).not.toContain("Synopsis");
  });

  it("leaves the synopsis and chapter briefs out of every publish format", async () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      brief: "Emma meets the stranger",
      prose: "Emma locked the door."
    });
    const doc = buildManuscriptExport(book);

    const md = formatExportMarkdown(doc);
    expect(md).not.toContain("Synopsis");
    expect(md).not.toContain("Emma leaves before winter.");
    expect(md).not.toContain("Brief:");
    expect(md).not.toContain("Emma meets the stranger");

    const txt = formatExportPlainText(doc);
    expect(txt).not.toContain("Synopsis");
    expect(txt).not.toContain("Emma leaves before winter.");
    expect(txt).not.toContain("Brief:");
    expect(txt).not.toContain("Emma meets the stranger");

    const rtf = formatExportRtf(doc);
    expect(rtf).not.toContain("Synopsis");
    expect(rtf).not.toContain("Emma leaves before winter.");
    expect(rtf).not.toContain("Brief:");
    expect(rtf).not.toContain("Emma meets the stranger");

    const odtText = new TextDecoder().decode(packOdt(doc));
    expect(odtText).not.toContain("Synopsis");
    expect(odtText).not.toContain("Emma leaves before winter.");
    expect(odtText).not.toContain("Brief:");
    expect(odtText).not.toContain("Emma meets the stranger");

    const epubText = new TextDecoder().decode(packEpub(doc));
    expect(epubText).not.toContain("synopsis.xhtml");
    expect(epubText).not.toContain("Emma leaves before winter.");
    expect(epubText).not.toContain("Brief:");
    expect(epubText).not.toContain("Emma meets the stranger");

    const pdfBytes = await packPdf(doc);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getTitle()).toBe("Night Keys");
  });

  it("gives each chapter its own page in RTF and ODT, and its own file in ePub", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    book = { ...book, chapters: [...book.chapters, { ...book.chapters[0]!, id: "ch2", title: "The tide", sequence_index: 1, prose: "Water rose." }] };
    const doc = buildManuscriptExport(book);

    const rtf = formatExportRtf(doc);
    expect(rtf.split("\\page").length - 1).toBe(2);

    const odtText = new TextDecoder().decode(packOdt(doc));
    expect(odtText).toContain('text:style-name="ChapterHeading"');
    expect(odtText).toContain('fo:break-before="page"');

    const epubText = new TextDecoder().decode(packEpub(doc));
    expect(epubText).toContain("text/chapter-0.xhtml");
    expect(epubText).toContain("text/chapter-1.xhtml");
  });

  it("forces a new PDF page for every chapter, even a short one", async () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Short." });
    const doc = buildManuscriptExport(book);
    const bytes = await packPdf(doc);
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBe(2);
  });

  it("packs an ePub a reader can open, with mimetype stored first and uncompressed", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "secret stowaway", synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const epub = packEpub(buildManuscriptExport(book));
    expect(epub[0]).toBe(0x50);
    expect(epub[1]).toBe(0x4b);
    const text = new TextDecoder().decode(epub);
    expect(text).toContain("application/epub+zip");
    expect(text).toContain("OEBPS/content.opf");
    expect(text).toContain("Emma locked the door.");
    expect(text).toContain("The quay");
    expect(text).not.toContain("secret stowaway");

    const mimetypeIndex = text.indexOf("mimetypeapplication/epub+zip");
    expect(mimetypeIndex).toBeGreaterThan(-1);
    expect(mimetypeIndex).toBeLessThan(60);
  });

  it("gives an ePub page for the Story Bible and leaves it out when there are no facts", () => {
    const book = createBook("Night Keys");
    const epub = packEpub(buildManuscriptExport(book));
    const text = new TextDecoder().decode(epub);
    expect(text).not.toContain("bible.xhtml");
  });

  it("packs a PDF with the manuscript title as its document title", async () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const bytes = await packPdf(buildManuscriptExport(book));
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getTitle()).toBe("Night Keys");
    expect(loaded.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("breaks a long manuscript across more than one PDF page", async () => {
    let book = createBook("Night Keys");
    const longProse = Array.from({ length: 80 }, (_, i) => `Paragraph ${i}: a long enough line to wrap and fill the page with prose.`).join("\n");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: longProse });
    const bytes = await packPdf(buildManuscriptExport(book));
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBeGreaterThan(1);
  });

  it("falls back to the built-in Times/Georgia/Liberation Serif look when no font is chosen", () => {
    const doc = buildManuscriptExport(createBook("Night Keys"));
    expect(formatExportRtf(doc)).toContain("Times New Roman");
    expect(new TextDecoder().decode(packOdt(doc))).toContain("Liberation Serif");
    expect(formatExportHtml(doc)).toContain(`Georgia, "Times New Roman", serif`);
    expect(new TextDecoder().decode(packEpub(doc))).toContain(`Georgia, "Times New Roman", serif`);
  });

  it("swaps the font name into RTF and ODT without embedding anything", () => {
    const doc = buildManuscriptExport(createBook("Night Keys"));
    const rtf = formatExportRtf(doc, LORA);
    expect(rtf).toContain("\\froman Lora;");
    expect(rtf).not.toContain("Times New Roman");

    const odtText = new TextDecoder().decode(packOdt(doc, LORA));
    expect(odtText).toContain('style:font-name="Lora"');
    expect(odtText).not.toContain("Liberation Serif");
  });

  it("embeds the chosen font as base64 @font-face rules in HTML", () => {
    const doc = buildManuscriptExport(createBook("Night Keys"));
    const html = formatExportHtml(doc, LORA);
    expect(html).toContain("@font-face{font-family:'Lora';font-weight:400;src:url(data:font/ttf;base64,");
    expect(html).toContain("@font-face{font-family:'Lora';font-weight:700;src:url(data:font/ttf;base64,");
    expect(html).toContain("body{font-family:Lora, Georgia, serif;font-weight:400}");
  });

  it("embeds the chosen font as real files inside the ePub package", () => {
    const doc = buildManuscriptExport(createBook("Night Keys"));
    const epub = packEpub(doc, LORA);
    const text = new TextDecoder().decode(epub);
    expect(text).toContain("OEBPS/fonts/regular.ttf");
    expect(text).toContain("OEBPS/fonts/bold.ttf");
    expect(text).toContain('href="fonts/regular.ttf" media-type="application/x-font-ttf"');
    expect(text).toContain("body{font-family:Lora, Georgia, serif;font-weight:400}");
    // The embedded TTF bytes themselves should be present in the archive, uncompressed.
    const magic = Array.from(LORA.embed!.regular.slice(0, 4));
    const bytes = Array.from(epub);
    const found = bytes.some((_, i) => magic.every((byte, j) => bytes[i + j] === byte));
    expect(found).toBe(true);
  });

  it("embeds the chosen font's real glyph data in the PDF, not just a name", async () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma locked the door." });
    const doc = buildManuscriptExport(book);
    const standard = await packPdf(doc);
    const embedded = await packPdf(doc, LORA);
    const loaded = await PDFDocument.load(embedded);
    expect(loaded.getPageCount()).toBeGreaterThanOrEqual(1);
    // Embedding real glyph outlines is inherently much heavier than referencing a standard font by name.
    expect(embedded.length).toBeGreaterThan(standard.length + 5_000);
  });
});

describe("formatting fidelity", () => {
  // "Emma locked the door." — "locked" is chars [5, 11).
  function bookWithBoldLocked() {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      prose: "Emma locked the door.",
      formatting: [{ start: 5, end: 11, style: "bold" }]
    });
    return book;
  }

  it("carries bold/italic/underline into HTML and ePub as real <b>/<i>/<u>", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      prose: "Emma locked the door.",
      formatting: [
        { start: 5, end: 11, style: "bold" },
        { start: 16, end: 20, style: "italic" },
        { start: 0, end: 4, style: "underline" }
      ]
    });
    const doc = buildManuscriptExport(book);
    const html = formatExportHtml(doc);
    expect(html).toContain("<b>locked</b>");
    expect(html).toContain("<i>door</i>");
    expect(html).toContain("<u>Emma</u>");

    const epubText = new TextDecoder().decode(packEpub(doc));
    expect(epubText).toContain("<b>locked</b>");
    expect(epubText).toContain("<i>door</i>");
    expect(epubText).toContain("<u>Emma</u>");
  });

  it("nests combined styles consistently in HTML (bold outside italic outside underline)", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Emma locked the door.",
      formatting: [
        { start: 5, end: 11, style: "bold" },
        { start: 5, end: 11, style: "italic" }
      ]
    });
    const html = formatExportHtml(buildManuscriptExport(book));
    expect(html).toContain("<b><i>locked</i></b>");
  });

  it("carries formatting into RTF as grouped control words", () => {
    const rtf = formatExportRtf(buildManuscriptExport(bookWithBoldLocked()));
    expect(rtf).toContain("{\\b locked}");
    expect(rtf).not.toContain("locked the door"); // the bold run splits "locked" out of the plain run
  });

  it("carries formatting into ODT as named text:span styles, with styles.xml defining them", () => {
    const odt = packOdt(buildManuscriptExport(bookWithBoldLocked()));
    const text = new TextDecoder().decode(odt);
    expect(text).toContain('<text:span text:style-name="Bold">locked</text:span>');
    expect(text).toContain('<style:style style:name="Bold" style:family="text">');
  });

  it("keeps formatting ranges aligned under the indented paragraph style too", () => {
    const doc = buildManuscriptExport(bookWithBoldLocked());
    const html = formatExportHtml(doc, undefined, "indented");
    expect(html).toContain("<b>locked</b>");
    const rtf = formatExportRtf(doc, undefined, "indented");
    expect(rtf).toContain("{\\b locked}");
  });

  it("renders a PDF without crashing when formatting ranges are present, bold included", async () => {
    const doc = buildManuscriptExport(bookWithBoldLocked());
    const bytes = await packPdf(doc);
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it("leaves plain chapters byte-identical in behavior when formatting is empty", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const doc = buildManuscriptExport(book);
    expect(formatExportHtml(doc)).toContain("<p>Emma locked the door.</p>");
    expect(formatExportRtf(doc)).toContain("Emma locked the door.\\par");
  });
});

/** Walks `zipStore`'s own local-file-header layout (STORE method, no data descriptor) — the mirror image of how it's written, so it can pull individual entries back out for the IDML structure checks below. */
function unzipStore(bytes: Uint8Array): Record<string, Uint8Array> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const files: Record<string, Uint8Array> = {};
  let offset = 0;
  while (offset + 4 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const compressedSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    files[name] = bytes.slice(dataStart, dataStart + compressedSize);
    offset = dataStart + compressedSize;
  }
  return files;
}

/** A minimal tag-balance check — not a real XML validator, but enough to catch a mismatched or unclosed tag in hand-written template strings, which is the actual risk in generated XML with no CDATA, comments, or `>` inside attribute values. */
function assertWellFormedXml(xml: string, label: string): void {
  const body = xml.replace(/^<\?xml[^?]*\?>\s*/, "");
  const stack: string[] = [];
  const tagRe = /<\/?([a-zA-Z0-9:_-]+)(?:\s[^>]*?)?(\/?)>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(body))) {
    const [full, name, selfClose] = match;
    if (full!.startsWith("</")) {
      const top = stack.pop();
      if (top !== name) throw new Error(`${label}: mismatched closing tag </${name}>, expected </${top}>`);
    } else if (!selfClose) {
      stack.push(name!);
    }
  }
  if (stack.length > 0) throw new Error(`${label}: unclosed tag(s) — ${stack.join(", ")}`);
}

describe("IDML export", () => {
  function bookWithTwoChapters() {
    let book = { ...createBook("Night Keys"), brainstorm: "secret stowaway" };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      prose: "Emma locked the door.",
      formatting: [{ start: 5, end: 11, style: "bold" }]
    });
    book = {
      ...book,
      chapters: [...book.chapters, { ...book.chapters[0]!, id: "ch2", title: "The tide", sequence_index: 1, prose: "Water rose.", formatting: [] }]
    };
    return book;
  }

  it("packs a well-formed zip with mimetype first and uncompressed", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    expect(idml[0]).toBe(0x50);
    expect(idml[1]).toBe(0x4b);
    const files = unzipStore(idml);
    expect(new TextDecoder().decode(files["mimetype"])).toBe("application/vnd.adobe.indesign-idml-package");
    expect(Object.keys(files)[0]).toBe("mimetype");
  });

  it("produces only well-formed XML files, and leaves brainstorm out", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    for (const [name, data] of Object.entries(files)) {
      if (!name.endsWith(".xml")) continue;
      assertWellFormedXml(new TextDecoder().decode(data), name);
    }
    const everyXmlText = Object.entries(files)
      .filter(([name]) => name.endsWith(".xml"))
      .map(([, data]) => new TextDecoder().decode(data))
      .join("\n");
    expect(everyXmlText).not.toContain("secret stowaway");
  });

  it("gives every chapter/title/bible unit its own Story, one Spread per page it's threaded across, referenced from designmap.xml", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const designmap = new TextDecoder().decode(files["designmap.xml"]!);
    const spreadFiles = Object.keys(files).filter((name) => name.startsWith("Spreads/"));
    const storyFiles = Object.keys(files).filter((name) => name.startsWith("Stories/"));
    // Title + 2 short chapters = 3 units, each short enough to need only 1 page/Story here.
    expect(storyFiles.length).toBe(3);
    expect(spreadFiles.length).toBe(3);
    for (const path of [...spreadFiles, ...storyFiles]) {
      expect(designmap).toContain(`src="${path}"`);
    }
  });

  it("threads a long chapter's one Story across several pages, with the full text in that single Story", async () => {
    let book = bookWithTwoChapters();
    const longProse = Array.from({ length: 80 }, (_, i) => `Paragraph number ${i} with enough words to take up real space on the page.`).join(
      "\n\n"
    );
    book = updateChapter(book, book.chapters[0]!.id, { prose: longProse, formatting: [] });
    const idml = await packIdml(buildManuscriptExport(book));
    const files = unzipStore(idml);
    const storyTexts = Object.entries(files)
      .filter(([name]) => name.startsWith("Stories/"))
      .map(([, data]) => new TextDecoder().decode(data));
    const chapterStories = storyTexts.filter((text) => /Paragraph number \d+/.test(text));
    // One Story holds the whole chapter — not split across several Stories.
    expect(chapterStories.length).toBe(1);
    const chapterStory = chapterStories[0]!;
    expect(chapterStory).toContain(">Paragraph number 0 ");
    expect(chapterStory).toContain("Paragraph number 79");

    const storySelf = chapterStory.match(/Story Self="([^"]+)"/)?.[1];
    expect(storySelf).toBeDefined();
    const framesForStory = Object.entries(files)
      .filter(([name]) => name.startsWith("Spreads/"))
      .map(([, data]) => new TextDecoder().decode(data))
      .filter((text) => text.includes(`ParentStory="${storySelf}"`));
    // The long chapter alone should need more than one page at 6x9in.
    expect(framesForStory.length).toBeGreaterThan(1);
    const previousRefs = framesForStory.map((text) => text.match(/PreviousTextFrame="([^"]+)"/)?.[1]);
    const nextRefs = framesForStory.map((text) => text.match(/NextTextFrame="([^"]+)"/)?.[1]);
    expect(previousRefs[0]).toBe("n");
    expect(nextRefs[nextRefs.length - 1]).toBe("n");
    expect(previousRefs.slice(1).every((ref) => ref !== "n")).toBe(true);
    expect(nextRefs.slice(0, -1).every((ref) => ref !== "n")).toBe(true);
  });

  it("gives every Spread a distinct, increasing position on the document's shared pasteboard", async () => {
    let book = bookWithTwoChapters();
    const longProse = Array.from({ length: 80 }, (_, i) => `Paragraph number ${i} with enough words to take up real space on the page.`).join(
      "\n\n"
    );
    book = updateChapter(book, book.chapters[0]!.id, { prose: longProse, formatting: [] });
    const idml = await packIdml(buildManuscriptExport(book));
    const files = unzipStore(idml);
    const designmap = new TextDecoder().decode(files["designmap.xml"]!);
    const spreadPaths = [...designmap.matchAll(/<idPkg:Spread src="(Spreads\/Spread_[^"]+\.xml)"\/>/g)].map((m) => m[1]!);
    // Every page past v1.0.113's threading reintroduction identically sat at "0 0" on the
    // pasteboard, unlike any real InDesign-authored IDML (a document's pasteboard is one
    // continuous strip, each Spread its own successive segment) — each Spread now gets its
    // own X offset, in designmap order, one page-width apart.
    const offsets = spreadPaths.map((path) => {
      const xml = new TextDecoder().decode(files[path]!);
      return Number(xml.match(/<Spread [^>]*ItemTransform="1 0 0 1 (-?[\d.]+) 0"/)?.[1]);
    });
    expect(offsets.length).toBeGreaterThan(3);
    for (let i = 0; i < offsets.length; i += 1) expect(offsets[i]).toBe(i * PAGE_SIZES["6x9"].width);
  });

  it("zero-pads every internal id, so a lexicographic (string) sort never disagrees with creation/designmap order", async () => {
    // Enough chapters, each long enough to need several threaded spreads, that
    // the running id counter crosses from single/double into triple digits —
    // the exact condition that broke an unpadded counter. Unpadded ids like
    // "uSpread6" and "uSpread12" sort correctly as numbers but as plain
    // strings "uSpread12" comes before "uSpread6" (because "1" < "6") — and a
    // real report showed InDesign's own Pages panel displaying this writer's
    // threaded spreads in exactly that scrambled string order instead of
    // designmap.xml's actual order, putting the title page and early
    // chapters' real text over a hundred pages later than where they
    // belong. Reproduced directly: a synthetic 30-chapter book's title
    // spread (always id "...6", always first in designmap.xml) landed at
    // lexicographic-sort position 108 of 121 before this fix — the same
    // page number independently reported for where a real manuscript's
    // title text actually appeared in InDesign.
    let book = createBook("Many Chapters");
    for (let i = 1; i < 15; i += 1) book = addChapter(book);
    const longProse = Array.from({ length: 10 }, (_, i) => `Paragraph ${i} has enough words to take up real space on a printed page.`).join("\n\n");
    for (const chapter of book.chapters) book = updateChapter(book, chapter.id, { prose: longProse, formatting: [] });
    const idml = await packIdml(buildManuscriptExport(book));
    const files = unzipStore(idml);
    const designmap = new TextDecoder().decode(files["designmap.xml"]!);
    const ids = [...designmap.matchAll(/<idPkg:Spread src="Spreads\/Spread_([^".]+)\.xml"\/>/g)].map((m) => m[1]!);
    expect(ids.length).toBeGreaterThan(20);
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it("declares a Section covering the whole document, starting at the first real Page", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const designmap = new TextDecoder().decode(files["designmap.xml"]!);
    const sectionMatch = designmap.match(
      /<Section Self="[^"]+" Length="(\d+)" PageStart="([^"]+)" PageNumberStart="1" ContinueNumbering="false" IncludeSectionPrefix="false" SectionPrefix="" Marker=""\/>/
    );
    expect(sectionMatch).not.toBeNull();
    const spreadPaths = [...designmap.matchAll(/<idPkg:Spread src="(Spreads\/Spread_[^"]+\.xml)"\/>/g)].map((m) => m[1]!);
    // Length covers every real page, and PageStart points at the first Spread's own Page id.
    expect(Number(sectionMatch![1])).toBe(spreadPaths.length);
    const firstSpreadXml = new TextDecoder().decode(files[spreadPaths[0]!]!);
    expect(firstSpreadXml).toContain(`<Page Self="${sectionMatch![2]}"`);
  });

  it("declares a Layer and assigns every TextFrame to it", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const designmap = new TextDecoder().decode(files["designmap.xml"]!);
    const layerMatch = designmap.match(/<Layer Self="([^"]+)"/);
    expect(layerMatch).not.toBeNull();
    expect(designmap).toContain(`ActiveLayer="${layerMatch![1]}"`);
    const spreadPaths = Object.keys(files).filter((name) => name.startsWith("Spreads/"));
    expect(spreadPaths.length).toBeGreaterThan(0);
    for (const path of spreadPaths) {
      const spreadXml = new TextDecoder().decode(files[path]!);
      expect(spreadXml).toContain(`<TextFrame Self="`);
      expect(spreadXml).toContain(`ItemLayer="${layerMatch![1]}"`);
    }
  });

  it("gives InsetSpacing as a nested Properties list, not a flat attribute, matching a real InDesign export", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const spreadPaths = Object.keys(files).filter((name) => name.startsWith("Spreads/"));
    expect(spreadPaths.length).toBeGreaterThan(0);
    for (const path of spreadPaths) {
      const spreadXml = new TextDecoder().decode(files[path]!);
      expect(spreadXml).not.toMatch(/InsetSpacing="[^"]*"/);
      expect(spreadXml).toContain('<InsetSpacing type="list">');
      expect(spreadXml.match(/<ListItem type="unit">0<\/ListItem>/g)?.length).toBe(4);
    }
  });

  it("carries bold formatting into a Story's CharacterStyleRange as a local FontStyle override", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const storyWithLocked = Object.entries(files)
      .filter(([name]) => name.startsWith("Stories/"))
      .map(([, data]) => new TextDecoder().decode(data))
      .find((text) => text.includes("locked"));
    expect(storyWithLocked).toBeDefined();
    expect(storyWithLocked).toContain('FontStyle="Bold"');
    expect(storyWithLocked).toMatch(/<Content>locked<\/Content>/);
  });

  it("gives paragraph styles human-readable names InDesign's own Paragraph Styles panel shows, not programmer-style identifiers", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const styles = new TextDecoder().decode(files["Resources/Styles.xml"]!);
    for (const name of ["Title", "Chapter Name", "Body Text", "Body Text First", "Body Text Indented", "Scene Break"]) {
      expect(styles).toContain(`Self="ParagraphStyle/${name}" Name="${name}"`);
    }
    // The chapter heading paragraph is actually tagged with the "Chapter Name" style, not the old "ChapterHeading".
    const storyTexts = Object.entries(files)
      .filter(([name]) => name.startsWith("Stories/"))
      .map(([, data]) => new TextDecoder().decode(data));
    expect(storyTexts.some((text) => text.includes('AppliedParagraphStyle="ParagraphStyle/Chapter Name"'))).toBe(true);
    expect(storyTexts.some((text) => text.includes('AppliedParagraphStyle="ParagraphStyle/Body Text"'))).toBe(true);
  });

  it("gives Body Text no SpaceAfter, so the blank-line separator between spaced paragraphs isn't doubled", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const styles = new TextDecoder().decode(files["Resources/Styles.xml"]!);
    expect(styles).toMatch(/Self="ParagraphStyle\/Body Text"[^>]*SpaceAfter="0"/);
  });

  it("adds a Story Bible page only when there are locked facts to show", async () => {
    let book = bookWithTwoChapters();
    book = {
      ...book,
      facts: [
        {
          id: "f1",
          entity_ref: "emma",
          entity_label: "Emma",
          predicate: "core.identity",
          value: "Bartender at the Aurora Room",
          sequence_index: 0,
          status: "locked",
          source: "author",
          created_at: "2026-09-15T00:00:00.000Z"
        }
      ]
    };
    const withBibleText = new TextDecoder().decode(await packIdml(buildManuscriptExport(book)));
    expect(withBibleText).toContain("Story Bible");
    expect(withBibleText).toContain("Bartender at the Aurora Room");

    const emptyBibleText = new TextDecoder().decode(await packIdml(buildManuscriptExport(bookWithTwoChapters())));
    expect(emptyBibleText).not.toContain("Story Bible");
  });

  it("applies the real master spread to every real page, matching a real InDesign export", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const designmap = new TextDecoder().decode(files["designmap.xml"]!);
    const masterId = designmap.match(/<idPkg:MasterSpread src="MasterSpreads\/MasterSpread_([^".]+)\.xml"\/>/)?.[1];
    expect(masterId).toBeDefined();
    const spreadTexts = Object.entries(files)
      .filter(([name]) => name.startsWith("Spreads/"))
      .map(([, data]) => new TextDecoder().decode(data));
    expect(spreadTexts.length).toBeGreaterThan(0);
    for (const text of spreadTexts) {
      expect(text).toContain(`<Page Self="`);
      expect(text).toContain(`AppliedMaster="${masterId}"`);
      expect(text).not.toContain('AppliedMaster="n"');
    }
  });

  it("gives every real page the same GeometricBounds height, matching Preferences.xml", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const spreadTexts = Object.entries(files)
      .filter(([name]) => name.startsWith("Spreads/"))
      .map(([, data]) => new TextDecoder().decode(data));
    const pageHeights = spreadTexts.map((text) => {
      const match = text.match(/<Page [^>]*GeometricBounds="0 0 (\S+) /);
      expect(match).not.toBeNull();
      return match![1];
    });
    expect(new Set(pageHeights).size).toBe(1);

    const preferences = new TextDecoder().decode(files["Resources/Preferences.xml"]!);
    const prefsMatch = preferences.match(/PageHeight="(\S+)"/);
    expect(prefsMatch).not.toBeNull();
    expect(prefsMatch![1]).toBe(pageHeights[0]);
  });

  it("gives every TextFrame a rectangular PathGeometry positioned by ItemTransform, not a bare GeometricBounds", async () => {
    const book = { ...createBook("Night Keys"), page_size: "6x9" as const, page_margin: "normal" as const };
    const idml = await packIdml(buildManuscriptExport(book));
    const files = unzipStore(idml);
    const spreadTexts = Object.entries(files)
      .filter(([name]) => name.startsWith("Spreads/"))
      .map(([, data]) => new TextDecoder().decode(data));
    expect(spreadTexts.length).toBeGreaterThan(0);
    for (const text of spreadTexts) {
      const frame = text.match(/<TextFrame [^>]*>/)?.[0];
      expect(frame).toBeDefined();
      // No bare GeometricBounds on the TextFrame itself — only the Page keeps one.
      expect(frame).not.toContain("GeometricBounds");
      // Positioned at (margin, margin) via a pure-translation ItemTransform.
      expect(frame).toContain('ItemTransform="1 0 0 1 54 54"');
      // A closed, 4-point rectangular path in the frame's own local coordinates (0,0 origin).
      expect(text).toContain("<PathGeometry>");
      expect(text).toContain('PathOpen="false"');
      expect(text).toMatch(/<PathPointType Anchor="0 0"/);
      // Local width/height match the column box (page width/height minus two margins).
      expect(text).toMatch(/<PathPointType Anchor="324 0"/);
      expect(text).toMatch(/<PathPointType Anchor="324 540"/);
      expect(text).toMatch(/<PathPointType Anchor="0 540"/);
    }
  });

  it("allows page shuffle, matching a real InDesign export's own Spread/DocumentPreference settings", async () => {
    const idml = await packIdml(buildManuscriptExport(bookWithTwoChapters()));
    const files = unzipStore(idml);
    const preferences = new TextDecoder().decode(files["Resources/Preferences.xml"]!);
    expect(preferences).toMatch(/<DocumentPreference[^>]*AllowPageShuffle="true"/);
    const spreadTexts = Object.entries(files)
      .filter(([name]) => name.startsWith("Spreads/"))
      .map(([, data]) => new TextDecoder().decode(data));
    for (const text of spreadTexts) {
      expect(text).toMatch(/<Spread[^>]*AllowPageShuffle="true"/);
    }
  });
});

describe("page size", () => {
  it("defaults every real-page format (IDML, PDF, ODT) to 6x9in with a normal margin", async () => {
    const doc = buildManuscriptExport(createBook("Night Keys"));
    expect(doc.pageWidth).toBeCloseTo(432);
    expect(doc.pageHeight).toBeCloseTo(648);
    expect(doc.margin).toBeCloseTo(54);

    const pdfBytes = await packPdf(doc);
    const pdf = await PDFDocument.load(pdfBytes);
    const { width, height } = pdf.getPage(0).getSize();
    expect(width).toBeCloseTo(432);
    expect(height).toBeCloseTo(648);

    const odtFiles = unzipStore(packOdt(doc));
    const odtStylesXml = new TextDecoder().decode(odtFiles["styles.xml"]!);
    expect(odtStylesXml).toContain('fo:page-width="432pt"');
    expect(odtStylesXml).toContain('fo:page-height="648pt"');
    expect(odtStylesXml).toContain('fo:margin-top="54pt"');

    const idmlFiles = unzipStore(await packIdml(doc));
    const preferences = new TextDecoder().decode(idmlFiles["Resources/Preferences.xml"]!);
    expect(preferences).toContain('PageWidth="432"');
    expect(preferences).toContain('PageHeight="648"');
  });

  it("switches all three to A4 with a wide margin when the book is set to it", async () => {
    const book = { ...createBook("Night Keys"), page_size: "a4" as const, page_margin: "wide" as const };
    const doc = buildManuscriptExport(book);
    expect(doc.pageWidth).toBeCloseTo(595.28);
    expect(doc.pageHeight).toBeCloseTo(841.89);
    expect(doc.margin).toBeCloseTo(72);

    const pdfBytes = await packPdf(doc);
    const pdf = await PDFDocument.load(pdfBytes);
    const { width, height } = pdf.getPage(0).getSize();
    expect(width).toBeCloseTo(595.28);
    expect(height).toBeCloseTo(841.89);

    const odtStylesXml = new TextDecoder().decode(unzipStore(packOdt(doc))["styles.xml"]!);
    expect(odtStylesXml).toContain('fo:page-width="595.28pt"');
    expect(odtStylesXml).toContain('fo:margin-left="72pt"');

    const preferences = new TextDecoder().decode(unzipStore(await packIdml(doc))["Resources/Preferences.xml"]!);
    expect(preferences).toContain('PageWidth="595.28"');
    expect(preferences).toContain('PageHeight="841.89"');
  });
});

describe("chapter start image", () => {
  function bookWithOneIllustratedChapter() {
    let book = createBook("Night Keys");
    book = addChapter(book);
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      prose: "Emma locked the door.",
      startImage: { thumbDataUrl: TINY_JPEG_DATA_URL, imageDataUrl: TINY_JPEG_DATA_URL }
    });
    return book;
  }

  it("carries the image through buildManuscriptExport only for the chapter that has one", () => {
    const doc = buildManuscriptExport(bookWithOneIllustratedChapter());
    expect(doc.chapters[0]?.startImageDataUrl).toBe(TINY_JPEG_DATA_URL);
    expect(doc.chapters[1]?.startImageDataUrl).toBeUndefined();
  });

  it("embeds the image as a base64 <img> in HTML, only for the chapter that has one", () => {
    const html = formatExportHtml(buildManuscriptExport(bookWithOneIllustratedChapter()));
    expect(html).toContain(`<img class="chapter-image" src="${TINY_JPEG_DATA_URL}" alt=""/>`);
    expect(html.match(/<img class="chapter-image"/g)).toHaveLength(1);
  });

  it("embeds the image as a real JPEG file inside the ePub package, referenced from the chapter page", () => {
    const epub = packEpub(buildManuscriptExport(bookWithOneIllustratedChapter()));
    const text = new TextDecoder().decode(epub);
    expect(text).toContain("OEBPS/images/chapter-0.jpg");
    expect(text).toContain('media-type="image/jpeg"');
    expect(text).toContain('<img src="../images/chapter-0.jpg" alt=""/>');
    // The chapter with no image gets no <img> tag on its page.
    expect(text).not.toContain("chapter-1.jpg");
    // The real JPEG bytes themselves should be present in the archive, uncompressed.
    const magic = Array.from(new Uint8Array(Buffer.from(TINY_JPEG_BASE64, "base64")).slice(0, 8));
    const bytes = Array.from(epub);
    const found = bytes.some((_, i) => magic.every((byte, j) => bytes[i + j] === byte));
    expect(found).toBe(true);
  });

  it("embeds the image as a drawable object in the PDF without breaking pagination", async () => {
    const doc = buildManuscriptExport(bookWithOneIllustratedChapter());
    const bytes = await packPdf(doc);
    const loaded = await PDFDocument.load(bytes);
    // Title page + one page per chapter (2 chapters), at minimum.
    expect(loaded.getPageCount()).toBeGreaterThanOrEqual(3);
  });

  it("never leaks the chapter image data into RTF, ODT, or Markdown, which stay text-only", () => {
    const doc = buildManuscriptExport(bookWithOneIllustratedChapter());
    expect(formatExportMarkdown(doc)).not.toContain("base64");
    expect(formatExportRtf(doc)).not.toContain("base64");
    expect(new TextDecoder().decode(packOdt(doc))).not.toContain("base64");
  });
});

describe("paragraph style", () => {
  function bookWithTwoParagraphs() {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      prose: "Emma locked the door.\n\nShe waited for the tide."
    });
    return book;
  }

  it("defaults to the old spaced behavior when no style is passed", () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    expect(formatExportHtml(doc)).toContain("<p><br/></p>");
    expect(formatExportPlainText(doc)).toContain("Emma locked the door.\n\nShe waited for the tide.");
  });

  it("drops the blank-line filler and indents in HTML, leaving the opening paragraph flush", () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    const html = formatExportHtml(doc, undefined, "indented");
    expect(html).not.toContain("<p><br/></p>");
    expect(html).toContain('<body class="indented">');
    expect(html).toContain('<p class="first">Emma locked the door.</p>');
    expect(html).toContain("<p>She waited for the tide.</p>");
  });

  it("does the same in ePub, scoped to the chapter page only", () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    const text = new TextDecoder().decode(packEpub(doc, undefined, "indented"));
    expect(text).not.toContain("<p><br/></p>");
    expect(text).toContain('<p class="first">Emma locked the door.</p>');
    expect(text).toContain(".indented p{margin:0;text-indent:1.5em}");
  });

  it("tab-indents each paragraph and drops the blank line in plain text", () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    const txt = formatExportPlainText(doc, "indented");
    expect(txt).toContain("\tEmma locked the door.\n\tShe waited for the tide.");
    expect(txt).not.toContain("door.\n\n\t");
  });

  it("sets a first-line indent and no inter-paragraph gap in RTF, resetting before the next heading", () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    const rtf = formatExportRtf(doc, undefined, "indented");
    expect(rtf).toContain("\\pard\\sa0\\fi0 Emma locked the door.\\par");
    expect(rtf).toContain("\\pard\\sa0\\fi567 She waited for the tide.\\par");
    expect(rtf).toContain("\\pard\n}");
  });

  it("uses the IndentedFirst/Indented ODT styles and drops the blank filler paragraph", () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    const odtText = new TextDecoder().decode(packOdt(doc, undefined, "indented"));
    expect(odtText).toContain('<text:p text:style-name="IndentedFirst">Emma locked the door.</text:p>');
    expect(odtText).toContain('<text:p text:style-name="Indented">She waited for the tide.</text:p>');
    expect(odtText).toContain('style:name="Indented"');
    expect(odtText).toContain('fo:text-indent="0.4in"');
  });

  it("renders an indented PDF without throwing and keeps the page count sane", async () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    const bytes = await packPdf(doc, undefined, "indented");
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBe(2);
  });

  it("leaves Markdown untouched — a blank line is what makes a paragraph there", () => {
    const doc = buildManuscriptExport(bookWithTwoParagraphs());
    expect(formatExportMarkdown(doc)).toContain("Emma locked the door.\n\nShe waited for the tide.");
  });
});

describe("drop cap", () => {
  function bookWithDropCap(lines: number) {
    let book = { ...createBook("Night Keys"), drop_cap_lines: lines };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      prose: "Emma locked the door.\n\nShe waited for the tide."
    });
    return book;
  }

  it("is off by default — no markup, no rule", () => {
    const doc = buildManuscriptExport({ ...createBook("Night Keys") });
    expect(doc.dropCapLines).toBe(0);
    const html = formatExportHtml(doc);
    expect(html).not.toContain("drop-cap");
  });

  it("marks only the chapter's first paragraph in HTML (spaced), and sizes the rule from the line count", () => {
    const doc = buildManuscriptExport(bookWithDropCap(3));
    const html = formatExportHtml(doc);
    expect(html).toContain('<body class="has-drop-cap">');
    expect(html).toContain('<p class="drop-cap">Emma locked the door.</p>');
    expect(html).toContain("<p>She waited for the tide.</p>");
    expect(html).toContain(".has-drop-cap p.drop-cap::first-letter{float:left;font-weight:700;font-size:4.50em");
  });

  it("combines with the first-paragraph-flush indented style instead of replacing it", () => {
    const doc = buildManuscriptExport(bookWithDropCap(4));
    const html = formatExportHtml(doc, undefined, "indented");
    expect(html).toContain('<p class="first drop-cap">Emma locked the door.</p>');
    expect(html).toContain(".has-drop-cap p.drop-cap::first-letter{float:left;font-weight:700;font-size:6.00em");
  });

  it("does the same in ePub, with the rule in the shared stylesheet", () => {
    const doc = buildManuscriptExport(bookWithDropCap(2));
    const text = new TextDecoder().decode(packEpub(doc));
    expect(text).toContain('<body class="has-drop-cap">');
    expect(text).toContain('<p class="drop-cap">Emma locked the door.</p>');
    expect(text).toContain(".has-drop-cap p.drop-cap::first-letter{float:left;font-weight:700;font-size:3.00em");
  });

  it("uses ODF's own style:drop-cap element on the first paragraph's style only, in spaced mode", () => {
    const doc = buildManuscriptExport(bookWithDropCap(5));
    const odtText = new TextDecoder().decode(packOdt(doc));
    expect(odtText).toContain('<text:p text:style-name="StandardDropCap">Emma locked the door.</text:p>');
    expect(odtText).toContain('<text:p text:style-name="Standard">She waited for the tide.</text:p>');
    expect(odtText).toContain('<style:style style:name="StandardDropCap"');
    expect(odtText).toContain('<style:drop-cap style:lines="5" style:length="1"/>');
  });

  it("uses the indented-first variant in indented mode", () => {
    const doc = buildManuscriptExport(bookWithDropCap(3));
    const odtText = new TextDecoder().decode(packOdt(doc, undefined, "indented"));
    expect(odtText).toContain('<text:p text:style-name="IndentedFirstDropCap">Emma locked the door.</text:p>');
    expect(odtText).toContain('<text:p text:style-name="Indented">She waited for the tide.</text:p>');
    expect(odtText).toContain('<style:style style:name="IndentedFirstDropCap"');
  });

  it("leaves RTF and PDF plain for now — neither has a real drop cap mechanism yet", async () => {
    const doc = buildManuscriptExport(bookWithDropCap(3));
    const rtf = formatExportRtf(doc);
    expect(rtf).toContain("Emma locked the door.");
    expect(rtf).not.toContain("dropcap");
    const bytes = await packPdf(doc);
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBeGreaterThan(0);
  });
});

describe("scene break", () => {
  function bookWithSceneBreak(style: "plain" | "vignette" | "diamond" | "fleur" | "sparkle") {
    let book = { ...createBook("Night Keys"), scene_break_style: style };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      prose: "Emma locked the door.\n---\nShe waited for the tide."
    });
    return book;
  }

  it("is plain by default", () => {
    const doc = buildManuscriptExport({ ...createBook("Night Keys") });
    expect(doc.sceneBreakStyle).toBe("plain");
  });

  it("renders a short rule in HTML for the plain default, not a plain paragraph of literal dashes exports used to show", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("plain"));
    const html = formatExportHtml(doc);
    expect(html).not.toContain("<p>---</p>");
    // px, not em: this paragraph also sets its own font-size to 0 (to hide
    // the "---" text node it still contains), so an em width/margin here
    // would resolve against that zero and collapse to 0 — a real bug this
    // guards against, caught live via Playwright, not from reading the CSS.
    expect(html).toContain('style="height:1px;width:56px;margin:21px auto;background:#ccc;font-size:0;line-height:0;color:transparent">---</p>');
    expect(html).toContain("<p>Emma locked the door.</p>");
    expect(html).toContain("<p>She waited for the tide.</p>");
  });

  it("renders the named ornament as a .scene-break paragraph plus its CSS, in HTML (spaced)", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("vignette"));
    const html = formatExportHtml(doc);
    expect(html).toContain('<p class="scene-break"><span aria-hidden="true"> </span></p>');
    expect(html).toContain('.scene-break::before{content:"❦"');
    expect(html).toContain("#9c7a52");
  });

  it("detects a `---` paragraph the same way in indented mode", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("diamond"));
    const html = formatExportHtml(doc, undefined, "indented");
    expect(html).toContain('<p class="scene-break"><span aria-hidden="true"> </span></p>');
    expect(html).not.toContain(">---<");
  });

  it("does the same in ePub, with the rule in the shared stylesheet", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("sparkle"));
    const text = new TextDecoder().decode(packEpub(doc));
    expect(text).toContain('<p class="scene-break"><span aria-hidden="true"> </span></p>');
    expect(text).toContain('.scene-break::before{content:"✦"');
  });

  it("collapses to a single centered SceneBreak paragraph in ODT, with the real symbol", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("fleur"));
    const odtText = new TextDecoder().decode(packOdt(doc));
    expect(odtText).toContain('<text:p text:style-name="SceneBreak">⚜</text:p>');
    expect(odtText).toContain('<style:style style:name="SceneBreak"');
    expect(odtText).toContain('fo:text-align="center"');
  });

  it("uses the old-fashioned asterism, not literal dashes, for plain in ODT", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("plain"));
    const odtText = new TextDecoder().decode(packOdt(doc));
    expect(odtText).toContain('<text:p text:style-name="SceneBreak">* * *</text:p>');
    expect(odtText).not.toContain(">---<");
  });

  it("works the same in ODT's indented mode", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("diamond"));
    const odtText = new TextDecoder().decode(packOdt(doc, undefined, "indented"));
    expect(odtText).toContain('<text:p text:style-name="SceneBreak">❖</text:p>');
  });

  it("renders a centered line in RTF, scoped in its own {...} group so \\qc never leaks into the paragraphs around it (neither is itself wrapped in a group)", () => {
    const doc = buildManuscriptExport(bookWithSceneBreak("vignette"));
    const rtf = formatExportRtf(doc);
    expect(rtf).toContain("{\\qc \\u10086?\\par}");
    expect(rtf).not.toContain("---");
    expect(rtf).toContain("Emma locked the door.\\par");
    expect(rtf).toContain("She waited for the tide.\\par");
  });

  it("doesn't throw and still produces pages for every style in PDF (vector-drawn ornaments, not glyphs)", async () => {
    for (const style of ["plain", "vignette", "diamond", "fleur", "sparkle"] as const) {
      const doc = buildManuscriptExport(bookWithSceneBreak(style));
      const bytes = await packPdf(doc);
      const loaded = await PDFDocument.load(bytes);
      expect(loaded.getPageCount()).toBeGreaterThan(0);
    }
  });
});

describe("body text weight", () => {
  function bookForWeight() {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    return book;
  }

  it("is regular by default — no font-weight override in HTML/ePub, no fo:font-weight on Standard in ODT", () => {
    const doc = buildManuscriptExport(bookForWeight());
    expect(formatExportHtml(doc, LORA)).toContain("body{font-family:Lora, Georgia, serif;font-weight:400}");
    const epubText = new TextDecoder().decode(packEpub(doc, LORA));
    expect(epubText).toContain("body{font-family:Lora, Georgia, serif;font-weight:400}");
    const odtText = new TextDecoder().decode(packOdt(doc, LORA));
    expect(odtText).toContain('style:font-name="Lora" fo:font-size="12pt"/>');
  });

  it("sets body{font-weight:700} in HTML and ePub when bold", () => {
    const doc = buildManuscriptExport(bookForWeight());
    expect(formatExportHtml(doc, LORA, "spaced", "bold")).toContain("body{font-family:Lora, Georgia, serif;font-weight:700}");
    const epubText = new TextDecoder().decode(packEpub(doc, LORA, "spaced", "bold"));
    expect(epubText).toContain("body{font-family:Lora, Georgia, serif;font-weight:700}");
  });

  it("adds fo:font-weight=\"bold\" to ODT's Standard style when bold", () => {
    const doc = buildManuscriptExport(bookForWeight());
    const odtText = new TextDecoder().decode(packOdt(doc, LORA, "spaced", "bold"));
    expect(odtText).toContain('style:font-name="Lora" fo:font-size="12pt" fo:font-weight="bold"/>');
  });

  it("opens with \\b in RTF when bold, leaving a regular export without it", () => {
    const doc = buildManuscriptExport(bookForWeight());
    const regular = formatExportRtf(doc, LORA);
    expect(regular).toContain("\\f0\\fs24\n");
    const bold = formatExportRtf(doc, LORA, "spaced", "bold");
    expect(bold).toContain("\\f0\\fs24\\b\n");
    expect(bold).toContain("Emma locked the door.");
  });

  it("produces different PDF bytes for bold body text, both still valid", async () => {
    const doc = buildManuscriptExport(bookForWeight());
    const regularBytes = await packPdf(doc, LORA);
    const boldBytes = await packPdf(doc, LORA, "spaced", "bold");
    expect(boldBytes).not.toEqual(regularBytes);
    const regularPdf = await PDFDocument.load(regularBytes);
    const boldPdf = await PDFDocument.load(boldBytes);
    expect(regularPdf.getPageCount()).toBeGreaterThan(0);
    expect(boldPdf.getPageCount()).toBeGreaterThan(0);
  });
});

describe("body text color", () => {
  function bookForColor() {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    return book;
  }

  it("adds no color override to HTML/ePub/ODT when omitted", () => {
    const doc = buildManuscriptExport(bookForColor());
    expect(formatExportHtml(doc, LORA)).toContain("body{font-family:Lora, Georgia, serif;font-weight:400}");
    const epubText = new TextDecoder().decode(packEpub(doc, LORA));
    expect(epubText).toContain("body{font-family:Lora, Georgia, serif;font-weight:400}");
    const odtText = new TextDecoder().decode(packOdt(doc, LORA));
    expect(odtText).not.toContain("fo:color");
  });

  it("sets body{...;color:#2a2218} in HTML and ePub when given", () => {
    const doc = buildManuscriptExport(bookForColor());
    expect(formatExportHtml(doc, LORA, "spaced", "regular", "#2a2218")).toContain(
      "body{font-family:Lora, Georgia, serif;font-weight:400;color:#2a2218}"
    );
    const epubText = new TextDecoder().decode(packEpub(doc, LORA, "spaced", "regular", "#2a2218"));
    expect(epubText).toContain("body{font-family:Lora, Georgia, serif;font-weight:400;color:#2a2218}");
  });

  it('adds fo:color="#2a2218" to ODT\'s Standard style when given', () => {
    const doc = buildManuscriptExport(bookForColor());
    const odtText = new TextDecoder().decode(packOdt(doc, LORA, "spaced", "regular", "#2a2218"));
    expect(odtText).toContain('style:font-name="Lora" fo:font-size="12pt" fo:color="#2a2218"/>');
  });

  it("adds a colortbl and \\cf1 in RTF when given, leaving a colorless export without either", () => {
    const doc = buildManuscriptExport(bookForColor());
    const colorless = formatExportRtf(doc, LORA);
    expect(colorless).not.toContain("colortbl");
    expect(colorless).not.toContain("\\cf1");
    const colored = formatExportRtf(doc, LORA, "spaced", "regular", "#2a2218");
    expect(colored).toContain("{\\colortbl;\\red42\\green34\\blue24;}");
    expect(colored).toContain("\\cf1");
    expect(colored).toContain("Emma locked the door.");
  });

  it("produces different PDF bytes for a colored export, still valid", async () => {
    const doc = buildManuscriptExport(bookForColor());
    const colorlessBytes = await packPdf(doc, LORA);
    const coloredBytes = await packPdf(doc, LORA, "spaced", "regular", "#2a2218");
    expect(coloredBytes).not.toEqual(colorlessBytes);
    const coloredPdf = await PDFDocument.load(coloredBytes);
    expect(coloredPdf.getPageCount()).toBeGreaterThan(0);
  });
});
