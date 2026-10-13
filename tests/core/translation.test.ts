import { describe, expect, it } from "vitest";
import { createBook, summarizeBook, updateChapter, type Book } from "@core/BookSchema";
import {
  acceptTranslation,
  createLanguageVersion,
  groupManuscripts,
  languageGroup,
  sourceChangesSinceTranslation,
  translationStatus
} from "@core/translation";

function withTwoChapters(): Book {
  let book = createBook("Night Keys");
  book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the Aurora Room." });
  const second = { ...book.chapters[0]! };
  book = { ...book, chapters: [book.chapters[0]!, { ...second, id: "ch2", title: "The stranger", prose: "" }] };
  return book;
}

describe("createLanguageVersion", () => {
  it("clones chapter titles and order with empty prose, linked back to their source chapter", () => {
    const source = withTwoChapters();
    const { book, groupId } = createLanguageVersion(source, "Svenska");
    expect(book.chapters.map((chapter) => chapter.title)).toEqual(["The quay", "The stranger"]);
    expect(book.chapters.every((chapter) => chapter.prose === "")).toBe(true);
    expect(book.chapters[0]!.translated_from_chapter_id).toBe(source.chapters[0]!.id);
    expect(book.chapters[1]!.translated_from_chapter_id).toBe("ch2");
    expect(book.prose_language).toBe("Svenska");
    expect(book.translated_from_book_id).toBe(source.id);
    expect(book.translation_group_id).toBe(groupId);
  });

  it("generates a fresh group id when the source has none yet", () => {
    const source = withTwoChapters();
    expect(source.translation_group_id).toBeUndefined();
    const { groupId } = createLanguageVersion(source, "Svenska");
    expect(groupId).toBeTruthy();
  });

  it("reuses the source's existing group id for a second language version", () => {
    const source = { ...withTwoChapters(), translation_group_id: "group-1" };
    const { groupId } = createLanguageVersion(source, "Norsk");
    expect(groupId).toBe("group-1");
  });

  it("carries over craft/presentation settings so the translation reads like a sibling", () => {
    const source: Book = { ...withTwoChapters(), voice: "Wry, close third", pov: "first", body_font: "literata" };
    const { book } = createLanguageVersion(source, "Svenska");
    expect(book.voice).toBe("Wry, close third");
    expect(book.pov).toBe("first");
    expect(book.body_font).toBe("literata");
  });

  it("does not copy the synopsis — the Bible stays source-language only", () => {
    const source: Book = { ...withTwoChapters(), synopsis: "A thief steals the aurora." };
    const { book } = createLanguageVersion(source, "Svenska");
    expect(book.synopsis).toBe("");
  });
});

describe("translationStatus", () => {
  it("is 'none' for a chapter that isn't a translation of anything", () => {
    const chapter = withTwoChapters().chapters[0]!;
    expect(translationStatus(chapter, undefined)).toBe("none");
  });

  it("is 'orphaned' when the source chapter no longer exists", () => {
    const chapter = { ...withTwoChapters().chapters[0]!, translated_from_chapter_id: "gone" };
    expect(translationStatus(chapter, undefined)).toBe("orphaned");
  });

  it("is 'untranslated' when linked but no prose has been written yet", () => {
    const source = withTwoChapters().chapters[0]!;
    const chapter = { ...withTwoChapters().chapters[1]!, translated_from_chapter_id: source.id, prose: "" };
    expect(translationStatus(chapter, source)).toBe("untranslated");
  });

  it("is 'stale' when translated once but never snapshotted", () => {
    const source = withTwoChapters().chapters[0]!;
    const chapter = {
      ...withTwoChapters().chapters[1]!,
      translated_from_chapter_id: source.id,
      prose: "Emma ha nyckeln."
    };
    expect(translationStatus(chapter, source)).toBe("stale");
  });

  it("is 'current' when the snapshot matches the live source prose", () => {
    const source = withTwoChapters().chapters[0]!;
    const chapter = {
      ...withTwoChapters().chapters[1]!,
      translated_from_chapter_id: source.id,
      prose: "Emma ha nyckeln.",
      translated_from_snapshot: source.prose
    };
    expect(translationStatus(chapter, source)).toBe("current");
  });

  it("is 'stale' when the source prose changed since the snapshot", () => {
    const source = { ...withTwoChapters().chapters[0]!, prose: "Emma locked the Aurora Room at dusk." };
    const chapter = {
      ...withTwoChapters().chapters[1]!,
      translated_from_chapter_id: source.id,
      prose: "Emma ha nyckeln.",
      translated_from_snapshot: "Emma locked the Aurora Room."
    };
    expect(translationStatus(chapter, source)).toBe("stale");
  });
});

describe("sourceChangesSinceTranslation", () => {
  it("diffs the stored snapshot against the source's current prose", () => {
    const source = { ...withTwoChapters().chapters[0]!, prose: "Emma locked the Aurora Room at dusk." };
    const chapter = { ...withTwoChapters().chapters[1]!, translated_from_snapshot: "Emma locked the Aurora Room." };
    const hunks = sourceChangesSinceTranslation(chapter, source);
    expect(hunks.some((hunk) => hunk.type === "ins")).toBe(true);
  });
});

describe("acceptTranslation", () => {
  it("writes the translated prose and snapshots the source prose it was made from", () => {
    const chapter = withTwoChapters().chapters[1]!;
    const next = acceptTranslation(chapter, "Emma ha nyckeln.", "Emma locked the Aurora Room.");
    expect(next.prose).toBe("Emma ha nyckeln.");
    expect(next.translated_from_snapshot).toBe("Emma locked the Aurora Room.");
  });
});

describe("languageGroup / groupManuscripts", () => {
  it("returns a manuscript with no group as a singleton of itself", () => {
    const book = createBook("Solo");
    const summary = summarizeBook(book);
    expect(languageGroup([summary], summary)).toEqual([summary]);
  });

  it("groups source and translations together, source first then by language", () => {
    const source = { ...createBook("Night Keys"), translation_group_id: "group-1" };
    const sv = { ...createBook("Night Keys"), translation_group_id: "group-1", translated_from_book_id: source.id, prose_language: "Svenska" };
    const no = { ...createBook("Night Keys"), translation_group_id: "group-1", translated_from_book_id: source.id, prose_language: "Norsk" };
    const other = createBook("Unrelated");
    const summaries = [sv, other, source, no].map(summarizeBook);
    const group = languageGroup(summaries, summarizeBook(sv));
    expect(group.map((item) => item.prose_language ?? "")).toEqual(["", "Norsk", "Svenska"]);
  });

  it("groups the whole shelf into distinct clusters, first-seen order", () => {
    const source = { ...createBook("Night Keys"), translation_group_id: "group-1" };
    const sv = { ...createBook("Night Keys"), translation_group_id: "group-1", translated_from_book_id: source.id, prose_language: "Svenska" };
    const other = createBook("Unrelated");
    const summaries = [source, other, sv].map(summarizeBook);
    const groups = groupManuscripts(summaries);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.map((item) => item.id)).toEqual([source.id, sv.id]);
    expect(groups[1]!.map((item) => item.id)).toEqual([other.id]);
  });
});
