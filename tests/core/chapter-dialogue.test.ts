import { describe, expect, it } from "vitest";
import { chapterDialogue } from "@core/chapterDialogue";
import { countDialogueWords } from "@core/proseStats";

describe("chapter dialogue distribution", () => {
  it("counts a quotation that crosses paragraphs without losing the manuscript offsets", () => {
    const prose = "The room fell silent.\r\n\r\n  “Wait here,\r\n\r\n please,” she said.\r\n\r\n---\r\n\r\n\"I will.\"";
    const result = chapterDialogue({ id: "chapter", prose });
    expect(result.map(({ spoken, words }) => [spoken, words])).toEqual([[0, 4], [2, 2], [1, 3], [2, 2]]);
    expect(result.reduce((sum, paragraph) => sum + paragraph.spoken, 0)).toBe(countDialogueWords(prose));
    for (const { passage } of result) {
      expect(prose.slice(passage.start, passage.start + passage.text.length)).toBe(passage.text);
    }
  });
});
