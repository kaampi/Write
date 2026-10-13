import { describe, expect, it } from "vitest";
import { addChapter, createBook, discardChapter, updateChapter } from "@core/BookSchema";
import { splitSceneAtParagraph } from "@core/bookScene";
import {
  addContextRef,
  attachableChapters,
  attachableScenes,
  formatAttachedContextForPrompt,
  removeContextRef,
  resolveContextRefs
} from "@core/chapterContext";
import { draftUserPrompt } from "@core/generateProse";

function withThreeChapters() {
  let book = createBook("Night Keys");
  book = addChapter(book);
  book = addChapter(book);
  const [one, two, three] = book.chapters;
  book = updateChapter(book, one!.id, {
    title: "The quay",
    prose: "Emma locked the Aurora Room.\n\nSalt crusted the lower step."
  });
  book = updateChapter(book, two!.id, { title: "The stranger", prose: "He paid in salt and did not sit." });
  book = updateChapter(book, three!.id, { title: "The keys again", prose: "" });
  return book;
}

describe("attachableChapters", () => {
  it("offers only earlier chapters that actually have prose", () => {
    const book = withThreeChapters();
    const third = book.chapters[2]!;
    const options = attachableChapters(book.chapters, third);
    expect(options.map((item) => item.title)).toEqual(["The quay", "The stranger"]);
  });

  it("offers nothing for the first chapter", () => {
    const book = withThreeChapters();
    const first = book.chapters[0]!;
    expect(attachableChapters(book.chapters, first)).toEqual([]);
  });
});

describe("attachableScenes", () => {
  it("lists every scene with prose once a chapter is split", () => {
    let book = withThreeChapters();
    const first = book.chapters[0]!;
    const scenes = splitSceneAtParagraph(first, 1);
    book = updateChapter(book, first.id, { scenes });
    const split = book.chapters[0]!;
    const options = attachableScenes(split);
    expect(options).toHaveLength(2);
    expect(options[0]!.prose).toBe("Emma locked the Aurora Room.");
    expect(options[1]!.prose).toBe("Salt crusted the lower step.");
  });
});

describe("resolveContextRefs", () => {
  it("resolves a whole-chapter pin", () => {
    let book = withThreeChapters();
    const [first, , third] = book.chapters;
    book = updateChapter(book, third!.id, { context_refs: [{ chapter_id: first!.id }] });
    const resolved = resolveContextRefs(book.chapters, book.chapters[2]!);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.label).toBe("1 · The quay");
    expect(resolved[0]!.prose).toBe("Emma locked the Aurora Room.\n\nSalt crusted the lower step.");
  });

  it("resolves a single pinned scene, not the whole chapter", () => {
    let book = withThreeChapters();
    const [first, , third] = book.chapters;
    const scenes = splitSceneAtParagraph(first!, 1);
    book = updateChapter(book, first!.id, { scenes });
    const splitFirst = book.chapters[0]!;
    const secondScene = scenes[1]!;
    book = updateChapter(book, third!.id, { context_refs: [{ chapter_id: splitFirst.id, scene_id: secondScene.id }] });
    const resolved = resolveContextRefs(book.chapters, book.chapters[2]!);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.label).toBe("1 · The quay — Scene 2");
    expect(resolved[0]!.prose).toBe("Salt crusted the lower step.");
  });

  it("silently drops a ref to a chapter that no longer exists", () => {
    let book = withThreeChapters();
    const third = book.chapters[2]!;
    book = updateChapter(book, third.id, { context_refs: [{ chapter_id: "does-not-exist" }] });
    expect(resolveContextRefs(book.chapters, book.chapters[2]!)).toEqual([]);
  });

  it("silently drops a ref to a scene that no longer exists (merged away)", () => {
    let book = withThreeChapters();
    const [first, , third] = book.chapters;
    book = updateChapter(book, third!.id, { context_refs: [{ chapter_id: first!.id, scene_id: "stale-scene" }] });
    expect(resolveContextRefs(book.chapters, book.chapters[2]!)).toEqual([]);
  });
});

describe("formatAttachedContextForPrompt", () => {
  it("is empty when nothing is pinned", () => {
    const book = withThreeChapters();
    expect(formatAttachedContextForPrompt(book, book.chapters[2]!)).toBe("");
  });

  it("renders every pinned block, labeled, in order", () => {
    let book = withThreeChapters();
    const [first, second, third] = book.chapters;
    book = updateChapter(book, third!.id, {
      context_refs: [{ chapter_id: first!.id }, { chapter_id: second!.id }]
    });
    const text = formatAttachedContextForPrompt(book, book.chapters[2]!);
    expect(text).toContain("1 · The quay:\nEmma locked the Aurora Room.");
    expect(text).toContain("2 · The stranger:\nHe paid in salt and did not sit.");
    expect(text.indexOf("1 · The quay")).toBeLessThan(text.indexOf("2 · The stranger"));
  });
});

describe("addContextRef / removeContextRef", () => {
  it("does not add the same ref twice", () => {
    const ref = { chapter_id: "a", scene_id: "s1" };
    const once = addContextRef([], ref);
    const twice = addContextRef(once, { ...ref });
    expect(twice).toHaveLength(1);
  });

  it("keeps a whole-chapter pin and a specific-scene pin on the same chapter as distinct entries", () => {
    const whole = addContextRef([], { chapter_id: "a" });
    const withScene = addContextRef(whole, { chapter_id: "a", scene_id: "s1" });
    expect(withScene).toHaveLength(2);
  });

  it("removes exactly the matching ref", () => {
    const refs = addContextRef(addContextRef([], { chapter_id: "a" }), { chapter_id: "b" });
    expect(removeContextRef(refs, { chapter_id: "a" })).toEqual([{ chapter_id: "b" }]);
  });
});

describe("discarding a pinned chapter", () => {
  it("clears the dangling context_refs pin along with continues_from", () => {
    let book = withThreeChapters();
    const [first, , third] = book.chapters;
    book = updateChapter(book, third!.id, { context_refs: [{ chapter_id: first!.id }] });
    book = discardChapter(book, first!.id);
    const survivor = book.chapters.find((item) => item.id === third!.id)!;
    expect(survivor.context_refs).toEqual([]);
  });
});

describe("draftUserPrompt integration", () => {
  it("includes the attached-context block when something is pinned", () => {
    let book = withThreeChapters();
    const [first, , third] = book.chapters;
    book = updateChapter(book, third!.id, { context_refs: [{ chapter_id: first!.id }] });
    const prompt = draftUserPrompt(book, book.chapters[2]!);
    expect(prompt).toContain("Context the author manually attached for reference");
    expect(prompt).toContain("Emma locked the Aurora Room.");
  });

  it("omits the block entirely when nothing is pinned", () => {
    const book = withThreeChapters();
    const prompt = draftUserPrompt(book, book.chapters[2]!);
    expect(prompt).not.toContain("Context the author manually attached");
  });
});
