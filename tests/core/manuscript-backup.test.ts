import { describe, expect, it } from "vitest";
import { createBook, createChapter, discardChapter, touch, updateChapter } from "@core/BookSchema";
import { addScene, splitSceneAtParagraph, updateSceneMeta } from "@core/bookScene";
import {
  formatManuscriptMarkdown,
  MANUSCRIPT_BACKUP_FORMAT,
  MANUSCRIPT_BACKUP_KIND,
  ManuscriptBackupError,
  manuscriptBackupBasename,
  manuscriptBackupFilename,
  manuscriptExportBasename,
  manuscriptNeedsJsonBackup,
  manuscriptReplaceWarning,
  packManuscriptBackup,
  parseManuscriptBackup,
  ensureDownloadFilename
} from "@core/manuscriptBackup";
import { SANDBOX_LIBRARY_KIND } from "@core/sandboxExport";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(
  partial: Pick<NarrativeFact, "id" | "entity_ref" | "entity_label" | "predicate" | "value">
): NarrativeFact {
  return {
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-16T00:00:00.000Z",
    ...partial
  };
}

describe("manuscript backup", () => {
  it("round-trips a book and keeps an empty note", () => {
    const book = createBook("Night Keys");
    const packed = packManuscriptBackup(book, "   ", "2026-09-18T21:00:00.000Z");
    expect(packed.kind).toBe(MANUSCRIPT_BACKUP_KIND);
    expect(packed.format).toBe(MANUSCRIPT_BACKUP_FORMAT);
    expect(packed.note).toBe("");
    const parsed = parseManuscriptBackup(JSON.parse(JSON.stringify(packed)));
    expect(parsed.book.title).toBe("Night Keys");
    expect(parsed.book.id).toBe(book.id);
    expect(parsed.note).toBe("");
  });

  it("keeps a what-happened line when one is given", () => {
    const book = createBook("Night Keys");
    const packed = packManuscriptBackup(book, " Recast chapter 2 ");
    expect(parseManuscriptBackup(packed).note).toBe("Recast chapter 2");
  });

  it("restores brainstorm in JSON but omits it from the readable copy", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "The stowaway is the captain's sister.", synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const packed = packManuscriptBackup(book, "First pass");
    expect(packed.book.brainstorm).toContain("captain's sister");
    const md = formatManuscriptMarkdown(packed);
    expect(md).toContain("# Night Keys");
    expect(md).toContain("First pass");
    expect(md).toContain("Emma locked the door.");
    expect(md).not.toContain("captain's sister");
    expect(md).not.toContain("Emma leaves before winter.");
    expect(md).not.toMatch(/brainstorm/i);
  });

  it("keeps chapter revisions in JSON and leaves them out of the readable copy", () => {
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
    const packed = packManuscriptBackup(book);
    expect(packed.book.chapters[0]?.revisions[0]?.prose).toBe("SECRET OLD VERSION the stowaway smiled.");
    const parsed = parseManuscriptBackup(JSON.parse(JSON.stringify(packed)));
    expect(parsed.book.chapters[0]?.revisions).toHaveLength(1);
    expect(formatManuscriptMarkdown(packed)).not.toContain("SECRET OLD VERSION");
  });

  it("lists locked Story Bible rows in the readable copy", () => {
    const book = {
      ...createBook("Night Keys"),
      facts: [fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender at the Aurora Room" })]
    };
    const md = formatManuscriptMarkdown(packManuscriptBackup(book));
    expect(md).toContain("## Story Bible");
    expect(md).toContain("**Emma**");
    expect(md).toContain("Identity: Bartender at the Aurora Room");
  });

  it("rejects a Sandbox card export", () => {
    expect(() => parseManuscriptBackup({ kind: SANDBOX_LIBRARY_KIND, format: 1, characters: [] })).toThrow(
      ManuscriptBackupError
    );
  });

  it("rejects a newer format", () => {
    const book = createBook("Night Keys");
    expect(() => parseManuscriptBackup({ kind: MANUSCRIPT_BACKUP_KIND, format: 99, book })).toThrow(/newer kaampi Write/);
  });

  it("names the restore file from the title and day", () => {
    const book = createBook("Night Keys");
    expect(manuscriptBackupFilename(book, "2026-09-18T21:00:00.000Z")).toBe("night-keys-backup-2026-09-18.json");
    expect(manuscriptBackupBasename(book, "2026-09-18T21:00:00.000Z")).toBe("night-keys-backup-2026-09-18");
    expect(manuscriptExportBasename(book, "2026-09-18T21:00:00.000Z")).toBe("night-keys-2026-09-18");
  });

  it("warns that a restore overwrites work since the backup", () => {
    expect(manuscriptReplaceWarning("Night Keys")).toMatch(/Anything written since that backup will be lost/);
    expect(manuscriptReplaceWarning("Night Keys")).toContain("Night Keys");
  });

  it("asks for a JSON backup when none is recorded or the book is newer", () => {
    expect(manuscriptNeedsJsonBackup("2026-09-18T21:00:00.000Z", null)).toBe(true);
    expect(manuscriptNeedsJsonBackup("2026-09-18T21:00:00.000Z", "2026-09-17T21:00:00.000Z")).toBe(true);
    expect(manuscriptNeedsJsonBackup("2026-09-18T21:00:00.000Z", "2026-09-18T21:00:00.000Z")).toBe(false);
    expect(manuscriptNeedsJsonBackup("2026-09-18T20:00:00.000Z", "2026-09-18T21:00:00.000Z")).toBe(false);
  });

  it("exports adaptationChapters in reading order, excluding discarded chapters", () => {
    let book = createBook("Night Keys");
    const ch1 = book.chapters[0]!;
    const ch2 = createChapter(1, "The crossing");
    const ch3 = createChapter(2, "The quay");
    // Stored out of reading order on purpose, same as a real reorder would leave it.
    book = { ...book, chapters: [ch3, ch1, ch2] };
    book = discardChapter(book, ch2.id);

    const packed = packManuscriptBackup(book);
    expect(packed.adaptationChapters.map((chapter) => chapter.id)).toEqual([ch1.id, ch3.id]);
    // discardChapter reindexes the remaining live chapters to stay compact.
    expect(packed.adaptationChapters.map((chapter) => chapter.sequence_index)).toEqual([0, 1]);
  });

  it("carries a chapter's brief verbatim, empty or not", () => {
    let book = createBook("Night Keys");
    const chapterId = book.chapters[0]!.id;
    book = updateChapter(book, chapterId, { brief: "Open on the flooded quay." });
    const withBrief = packManuscriptBackup(book).adaptationChapters[0];
    expect(withBrief?.brief).toBe("Open on the flooded quay.");

    const untouched = packManuscriptBackup(createBook("Night Keys")).adaptationChapters[0];
    expect(untouched?.brief).toBe("");
  });

  it("gives an unsplit chapter a single scene spanning its whole prose", () => {
    let book = createBook("Night Keys");
    const chapterId = book.chapters[0]!.id;
    book = updateChapter(book, chapterId, { prose: "Emma locked the door." });
    const chapter = packManuscriptBackup(book).adaptationChapters[0]!;
    expect(chapter.scenes).toHaveLength(1);
    expect(chapter.scenes[0]?.description).toBe("Emma locked the door.");
    expect(chapter.scenes[0]?.title).toBeUndefined();
    expect(chapter.scenes[0]?.instructions).toBeUndefined();
  });

  it("carries each explicit scene's id, order, title, description, and instructions", () => {
    let book = createBook("Night Keys");
    const chapterId = book.chapters[0]!.id;
    book = updateChapter(book, chapterId, { prose: "Emma locked the door.\n\nRain hit the windows." });
    let chapter = book.chapters[0]!;
    const scenes = splitSceneAtParagraph(chapter, 1);
    book = updateChapter(book, chapterId, { scenes });
    chapter = book.chapters.find((item) => item.id === chapterId)!;
    const secondSceneId = scenes[1]!.id;
    book = updateChapter(book, chapterId, {
      scenes: updateSceneMeta(chapter, secondSceneId, { title: "The storm breaks", brief: "Must establish the leak." })
    });

    const exported = packManuscriptBackup(book).adaptationChapters[0]!;
    expect(exported.scenes).toHaveLength(2);
    expect(exported.scenes[0]?.description).toBe("Emma locked the door.");
    expect(exported.scenes[0]?.sequence_index).toBe(0);
    expect(exported.scenes[1]?.id).toBe(secondSceneId);
    expect(exported.scenes[1]?.sequence_index).toBe(1);
    expect(exported.scenes[1]?.title).toBe("The storm breaks");
    expect(exported.scenes[1]?.description).toBe("Rain hit the windows.");
    expect(exported.scenes[1]?.instructions).toBe("Must establish the leak.");
  });

  it("drops a trailing placeholder scene (added but never drafted into) from adaptationChapters", () => {
    let book = createBook("Night Keys");
    const chapterId = book.chapters[0]!.id;
    book = updateChapter(book, chapterId, { prose: "Emma locked the door." });
    const chapter = book.chapters[0]!;
    book = updateChapter(book, chapterId, { scenes: addScene(chapter) });

    const exported = packManuscriptBackup(book).adaptationChapters[0]!;
    expect(exported.scenes).toHaveLength(1);
    expect(exported.scenes[0]?.description).toBe("Emma locked the door.");
  });

  it("derives adaptationChapters fresh when reading a format-1 backup that has no such field", () => {
    const book = (() => {
      let b = createBook("Night Keys");
      b = updateChapter(b, b.chapters[0]!.id, { prose: "Emma locked the door.", brief: "Open cold." });
      return touch(b, {});
    })();
    const legacyRow = { kind: MANUSCRIPT_BACKUP_KIND, format: 1, exportedAt: "2026-09-18T21:00:00.000Z", note: "", book };
    const parsed = parseManuscriptBackup(JSON.parse(JSON.stringify(legacyRow)));
    expect(parsed.adaptationChapters).toHaveLength(1);
    expect(parsed.adaptationChapters[0]?.brief).toBe("Open cold.");
    expect(parsed.adaptationChapters[0]?.scenes[0]?.description).toBe("Emma locked the door.");
  });

  it("keeps a typed file name and forces the extension", () => {
    expect(ensureDownloadFilename("Night Keys", "json")).toBe("Night Keys.json");
    expect(ensureDownloadFilename("Night Keys.json", "json")).toBe("Night Keys.json");
    expect(ensureDownloadFilename("draft.md", "json")).toBe("draft.json");
    expect(ensureDownloadFilename("bad/name?.txt", "md")).toBe("badname.md");
    expect(ensureDownloadFilename("   ", "md")).toBe("manuscript.md");
  });
});
