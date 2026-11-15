import { describe, expect, it } from "vitest";
import { chapterDialogue } from "@core/chapterDialogue";
import { countDialogueWords, dialogueSpans } from "@core/proseStats";

function spoken(text: string): string[] {
  return dialogueSpans(text).map(({ start, end }) => text.slice(start, end));
}

describe("dialogueSpans", () => {
  it("keeps recognizing straight and curly English quotes, without the marks themselves", () => {
    expect(spoken("“Come in,” she said. \"Sit down.\"")).toEqual(["Come in,", "Sit down."]);
  });

  it("recognizes Swedish ”…” where the same mark opens and closes", () => {
    const text = "”Kom in”, sa hon. ”Jag väntade på dig.”";
    expect(spoken(text)).toEqual(["Kom in", "Jag väntade på dig."]);
    expect(countDialogueWords(text)).toBe(6);
  });

  it("does not read an English closing ” as an opener", () => {
    expect(spoken("Han sa hej” och gick.")).toEqual([]);
    expect(spoken("“Hej,” sa hon, “nu.”")).toEqual(["Hej,", "nu."]);
  });

  it("recognizes Norwegian «…»", () => {
    expect(spoken("«Kom inn,» sa hun. «Jeg ventet på deg.»")).toEqual(["Kom inn,", "Jeg ventet på deg."]);
  });

  it("recognizes »…» and »…« as opened by » after whitespace or at the start", () => {
    expect(spoken("»Kom in», sa hon.")).toEqual(["Kom in"]);
    expect(spoken("»Kom ind« sagde hun.")).toEqual(["Kom ind"]);
    expect(spoken("Hon sa »nej« och gick.")).toEqual(["nej"]);
  });

  it("counts a paragraph opened with a dash to its end, including the dialogue tag", () => {
    const text = "– Kom in, sa hon.\n— Jag väntade.\n- Äntligen.";
    expect(spoken(text)).toEqual(["Kom in, sa hon.", "Jag väntade.", "Äntligen."]);
  });

  it("leaves a scene break, a > quote block and a dash with no space after it alone", () => {
    expect(spoken("---")).toEqual([]);
    expect(spoken("> Dear Sir,")).toEqual([]);
    expect(spoken("-bra, sa hon.")).toEqual([]);
    expect(spoken("Hon gick – långsamt – därifrån.")).toEqual([]);
  });

  it("does not double-count quoted words inside a dash paragraph", () => {
    const text = "– Hon sa ”nej” igen.";
    expect(spoken(text)).toEqual(["Hon sa ”nej” igen."]);
  });

  it("gives no span for an opening mark with no closing one, and swallows nothing after it", () => {
    expect(spoken('He said "no and left.')).toEqual([]);
    expect(spoken("Hon sa nej. ”Kom.”")).toEqual(["Kom."]);
  });

  it("returns sorted, non-overlapping spans across mixed typography", () => {
    const text = "“One,” he said.\n– Two, sa hon.\n«Three.» ”Four.”";
    const spans = dialogueSpans(text);
    expect(spoken(text)).toEqual(["One,", "Two, sa hon.", "Three.", "Four."]);
    for (let i = 1; i < spans.length; i += 1) expect(spans[i]!.start).toBeGreaterThanOrEqual(spans[i - 1]!.end);
  });

  it("lets chapterDialogue place dash dialogue per paragraph", () => {
    const prose = "Regnet föll.\n\n– Kom in, sa hon.\n\n– Tack.";
    const result = chapterDialogue({ id: "c", prose });
    expect(result.map(({ spoken: s, words }) => [s, words])).toEqual([[0, 2], [4, 4], [1, 1]]);
    expect(result.reduce((sum, p) => sum + p.spoken, 0)).toBe(countDialogueWords(prose));
  });
});
