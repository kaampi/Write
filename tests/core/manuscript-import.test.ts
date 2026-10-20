import { describe, expect, it } from "vitest";
import { headingLevelCounts, splitMarkdownIntoChapters, suggestChapterHeadingLevel } from "@core/manuscriptImport";

describe("headingLevelCounts", () => {
  it("counts headings at each level present", () => {
    const raw = "# Act One\n## Chapter 1\nText.\n## Chapter 2\nMore text.\n# Act Two\n## Chapter 3\nEven more.";
    expect(headingLevelCounts(raw)).toEqual(new Map([[1, 2], [2, 3]]));
  });

  it("returns an empty map for text with no headings at all", () => {
    expect(headingLevelCounts("Just plain prose, no structure.").size).toBe(0);
  });
});

describe("suggestChapterHeadingLevel", () => {
  it("picks the level with the most headings — chapters outnumbering an Act wrapper", () => {
    const raw = "# Act One\n## Chapter 1\nA.\n## Chapter 2\nB.\n# Act Two\n## Chapter 3\nC.";
    expect(suggestChapterHeadingLevel(raw)).toBe(2);
  });

  it("falls back to level 1 when there are no headings at all", () => {
    expect(suggestChapterHeadingLevel("Just plain prose.")).toBe(1);
  });

  it("ties toward the shallower level", () => {
    const raw = "# One\nA.\n## Two\nB.";
    expect(suggestChapterHeadingLevel(raw)).toBe(1);
  });
});

describe("splitMarkdownIntoChapters", () => {
  it("splits a flat, single-level document into chapters", () => {
    const raw = "# Chapter 1\nThe rain poured down.\n\n# Chapter 2\nShe opened the door.";
    expect(splitMarkdownIntoChapters(raw, 1)).toEqual([
      { title: "Chapter 1", prose: "The rain poured down." },
      { title: "Chapter 2", prose: "She opened the door." }
    ]);
  });

  it("keeps text before the first heading as a leading untitled chapter", () => {
    const raw = "A short prologue with no heading.\n\n# Chapter 1\nThe story begins.";
    expect(splitMarkdownIntoChapters(raw, 1)).toEqual([
      { title: "", prose: "A short prologue with no heading." },
      { title: "Chapter 1", prose: "The story begins." }
    ]);
  });

  it("folds an Act wrapper (shallower than the chosen level) into the next chapter instead of dropping it or splitting on it", () => {
    const raw = "# Act One\n## Chapter 1\nFirst chapter text.\n## Chapter 2\nSecond chapter text.\n# Act Two\n## Chapter 3\nThird chapter text.";
    expect(splitMarkdownIntoChapters(raw, 2)).toEqual([
      { title: "Chapter 1", prose: "Act One\n\nFirst chapter text." },
      { title: "Chapter 2", prose: "Second chapter text." },
      { title: "Chapter 3", prose: "Act Two\n\nThird chapter text." }
    ]);
  });

  it("keeps a heading deeper than the chosen level as plain text inside the chapter body, hash markers stripped", () => {
    const raw = "## Chapter 1\nOpening line.\n\n### A scene subtitle\nMore prose after the subtitle.";
    expect(splitMarkdownIntoChapters(raw, 2)).toEqual([
      { title: "Chapter 1", prose: "Opening line.\n\nA scene subtitle\nMore prose after the subtitle." }
    ]);
  });

  it("keeps a chapter heading with no body text as its own chapter, unlike lore import's empty-article skip", () => {
    const raw = "# Chapter 1\n\n# Chapter 2\nSomething happens here.";
    expect(splitMarkdownIntoChapters(raw, 1)).toEqual([
      { title: "Chapter 1", prose: "" },
      { title: "Chapter 2", prose: "Something happens here." }
    ]);
  });

  it("returns a single untitled chapter for plain text with no headings", () => {
    expect(splitMarkdownIntoChapters("Just a wall of prose, no structure at all.", 1)).toEqual([
      { title: "", prose: "Just a wall of prose, no structure at all." }
    ]);
  });

  it("returns nothing for empty input", () => {
    expect(splitMarkdownIntoChapters("", 1)).toEqual([]);
  });

  it("normalizes Windows line endings before splitting", () => {
    const raw = "# Chapter 1\r\nFirst.\r\n\r\n# Chapter 2\r\nSecond.";
    expect(splitMarkdownIntoChapters(raw, 1)).toEqual([
      { title: "Chapter 1", prose: "First." },
      { title: "Chapter 2", prose: "Second." }
    ]);
  });
});
