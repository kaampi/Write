import { describe, expect, it } from "vitest";
import { createBook } from "@core/BookSchema";
import { findMarksByParagraph } from "@core/findReplace";
import { manuscriptCharacterMentions } from "@core/manuscriptCharacterMentions";

describe("manuscript character mentions", () => {
  it("uses aliases and exclusions and links to exact scene positions in Windows text", () => {
    const [base] = createBook("Night Keys").chapters;
    const chapter = {
      ...base!,
      prose: "Rose handed Mimi the key.\r\n\r\nThe rose garden was quiet.\r\n\r\nA door opened.\r\n\r\n  Mimi closed it.",
      scenes: [
        { id: "first", startParagraph: 0 },
        { id: "garden", startParagraph: 1 },
        { id: "door", startParagraph: 2 },
        { id: "last", startParagraph: 3, title: "Return" }
      ]
    };
    const report = manuscriptCharacterMentions([chapter], "Rose", {
      entity_ref: "rose", aliases: ["Mimi"], exclusions: ["rose garden"]
    });
    expect(report.hits.map(({ sceneIndex, count }) => [sceneIndex, count])).toEqual([[0, 2], [3, 1]]);
    expect(report.gap).toMatchObject({ scenes: 2, before: { sceneIndex: 0 }, after: { sceneIndex: 3 } });
    const last = report.hits[1]!;
    expect(last.sceneTitle).toBe("Return");
    expect(last.passage).toMatchObject({
      start: chapter.prose.lastIndexOf("Mimi"), text: "Mimi", context: "Mimi closed it."
    });
    expect(findMarksByParagraph(chapter.prose, last.passage.text, { wholeWord: true, matchCase: true }, last.passage.start)
      .flat().some((mark) => mark.current)).toBe(true);
  });

  it("skips empty scenes and tracks an unsplit chapter as one scene", () => {
    const [base] = createBook("Night Keys").chapters;
    const chapters = [
      { ...base!, id: "first", prose: "Mira waited.", scenes: [{ id: "first-scene", startParagraph: 0 }, { id: "placeholder", startParagraph: 1 }] },
      { ...base!, id: "empty", prose: "---" },
      { ...base!, id: "middle", prose: "The rain stopped." },
      { ...base!, id: "last", prose: "Mira left." }
    ];
    const report = manuscriptCharacterMentions(chapters, "Mira", { entity_ref: "mira", aliases: [], exclusions: [] });
    expect(report.hits.map(({ passage, sceneIndex }) => [passage.chapterId, sceneIndex])).toEqual([["first", 0], ["last", 0]]);
    expect(report.gap).toBeUndefined();
  });
});
