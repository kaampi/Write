import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { prepareCoreBookRestore, type CoreBookRevision } from "@core/coreRevisionRestore";
import { parseManuscriptBackup } from "@core/manuscriptBackup";

function source(body: unknown): CoreBookRevision {
  return {
    workspace: { id: "private-workspace", owner_app: "storybook", kind: "private-snapshot", project_id: "original" },
    revision: { id: "rev-4", workspace_id: "private-workspace", body, deleted: false }
  };
}

describe("Core manuscript restore preparation", () => {
  it("validates a complete private Book and keeps its ID and local chapter history for same-book restore", () => {
    let book = { ...createBook("Novel"), id: "original", brainstorm: "Private draft notes" };
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "The previous whole chapter.",
      revisions: [{ id: "chapter-history", at: "2026-10-01T00:00:00.000Z", op: "draft", prose: "Earlier prose" }]
    });
    const prepared = prepareCoreBookRestore(source(book), "same-book", { at: "2026-10-27T00:00:00.000Z" });
    expect(prepared.source).toEqual({ workspaceId: "private-workspace", revisionId: "rev-4", bookId: "original" });
    expect(prepared.backup.book.id).toBe("original");
    expect(prepared.backup.book.brainstorm).toBe("Private draft notes");
    expect(prepared.backup.book.chapters[0]?.revisions[0]?.prose).toBe("Earlier prose");
    expect(parseManuscriptBackup(prepared.backup).book).toEqual(prepared.backup.book);
  });

  it("makes an independent copy without stale translation or missing-series links", () => {
    const book = {
      ...createBook("Translated novel"), id: "original", series_id: "old-series",
      translation_group_id: "old-group", translated_from_book_id: "source-book",
      chapters: [{ ...createBook("Novel").chapters[0]!, translated_from_chapter_id: "source-chapter", translated_from_snapshot: "Source prose", prose: "Translated prose" }]
    };
    const copied = prepareCoreBookRestore(source(book), "new-book", {
      newBookId: "new-id", at: "2026-10-27T00:00:00.000Z", availableSeriesIds: new Set()
    });
    expect(copied.backup.book.id).toBe("new-id");
    expect(copied.backup.book.chapters[0]?.prose).toBe("Translated prose");
    expect(copied.backup.book.translated_from_book_id).toBeUndefined();
    expect(copied.backup.book.translation_group_id).toBeUndefined();
    expect(copied.backup.book.chapters[0]?.translated_from_chapter_id).toBeUndefined();
    expect(copied.backup.book.chapters[0]?.translated_from_snapshot).toBeUndefined();
    expect(copied.backup.book.series_id).toBeUndefined();
    expect(copied.source.bookId).toBe("original");
    const withSeries = prepareCoreBookRestore(source(book), "new-book", {
      newBookId: "another-id", availableSeriesIds: new Set(["old-series"])
    });
    expect(withSeries.backup.book.series_id).toBe("old-series");
  });

  it("rejects shared projections, deleted revisions, mismatched workspaces and reused IDs", () => {
    const book = { ...createBook("Novel"), id: "original" };
    expect(() => prepareCoreBookRestore({ ...source(book), workspace: { ...source(book).workspace, kind: "shared-manuscript" } }, "same-book")).toThrow();
    expect(() => prepareCoreBookRestore({ ...source(book), workspace: { ...source(book).workspace, owner_app: "comic" } }, "same-book")).toThrow();
    expect(() => prepareCoreBookRestore({ ...source(book), workspace: { ...source(book).workspace, project_id: "another-book" } }, "same-book")).toThrow();
    expect(() => prepareCoreBookRestore({ ...source(book), revision: { ...source(book).revision, deleted: true } }, "same-book")).toThrow();
    expect(() => prepareCoreBookRestore({ ...source(book), revision: { ...source(book).revision, workspace_id: "other" } }, "same-book")).toThrow();
    expect(() => prepareCoreBookRestore(source({ kind: "storycore.manuscript-export", sourceBookId: "original" }), "same-book")).toThrow();
    expect(() => prepareCoreBookRestore(source(book), "new-book", { newBookId: "original" })).toThrow();
  });
});
