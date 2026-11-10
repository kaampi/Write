import { describe, expect, it } from "vitest";
import { findMarksByParagraph } from "../../src/core/findReplace";
import { manuscriptReport, summarizeChapterLengths } from "../../src/core/manuscriptReport";

describe("manuscript report", () => {
  it("summarizes chapter lengths without changing manuscript order", () => {
    const chapters = [{ words: 200 }, { words: 100 }, { words: 1 }, { words: 101 }];
    expect(summarizeChapterLengths(chapters)).toEqual({ shortest: 1, longest: 200, median: 100.5 });
    expect(chapters.map(({ words }) => words)).toEqual([200, 100, 1, 101]);
    expect(summarizeChapterLengths(chapters.slice(0, 1))).toEqual({ shortest: 200, longest: 200, median: 200 });
    expect(summarizeChapterLengths([])).toBeUndefined();
  });

  it("keeps exact passage offsets across a chapter boundary", () => {
    const chapters = [
      { id: "first", title: "First", prose: '“Stay here,” she said.\r\n\r\n  Cold rain\t battered windows all night.' },
      { id: "second", title: "Second", prose: "By dawn, cold rain battered windows again." },
      { id: "blank", title: "Blank", prose: "  " }
    ];
    const report = manuscriptReport(chapters, []);
    expect(report.dialogue.map(({ id, spoken }) => [id, spoken])).toEqual([["first", 2], ["second", 0]]);
    expect(report.repetitions).toHaveLength(1);
    const passages = report.repetitions[0]!;
    expect(passages.map(({ chapterId }) => chapterId)).toEqual(["first", "second"]);
    for (const [index, passage] of passages.entries()) {
      const prose = chapters[index]!.prose;
      expect(prose.slice(passage.start, passage.start + passage.text.length)).toBe(passage.text);
      expect(findMarksByParagraph(prose, passage.text, { matchCase: true, wholeWord: true }, passage.start)
        .flat().some((mark) => mark.current)).toBe(true);
    }
  });

  it("ignores distant repeats and does not join words across sentence punctuation", () => {
    const chapters = [
      { id: "first", title: "First", prose: "Cold rain battered windows." },
      { id: "middle", title: "Middle", prose: "It was there. ".repeat(60) },
      { id: "last", title: "Last", prose: "Cold rain. Battered windows. Cold rain battered windows." }
    ];
    expect(manuscriptReport(chapters, []).repetitions).toEqual([]);
  });

  it("reports the largest adjacent dialogue change and skips short chapters", () => {
    const prose = "It was there. ".repeat(40);
    const chapters = [
      { id: "a", title: "A", prose },
      { id: "b", title: "B", prose: `“${prose}” ${prose}` },
      { id: "c", title: "C", prose: `“${prose}”` },
      { id: "short", title: "Short", prose: "It was there." }
    ];
    const report = manuscriptReport(chapters, []);
    expect(report.dialogue.map(({ share }) => share)).toEqual([0, 50, 100, 0]);
    expect(report.dialogueShift).toMatchObject({ from: { id: "a" }, to: { id: "b" }, difference: 50 });
    expect(manuscriptReport([chapters[0]!, { id: "blank", title: "", prose: "" }, chapters[2]!], [])
      .dialogueShift).toBeUndefined();
  });
});
