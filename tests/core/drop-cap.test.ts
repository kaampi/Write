import { describe, expect, it } from "vitest";
import { dropCapCharacters, dropCapLeadQuoteMarkup, opensWithLeadQuote, splitDropCapLeadQuote } from "@core/dropCap";

describe("drop cap lead quote rule", () => {
  it("recognizes a paragraph opening with a curly quote, even before any letter follows", () => {
    expect(opensWithLeadQuote("“")).toBe(true);
    expect(opensWithLeadQuote("“Come in,” she said.")).toBe(true);
    expect(opensWithLeadQuote("Come in.")).toBe(false);
    expect(opensWithLeadQuote('"Straight quotes stay on the plain path."')).toBe(false);
  });

  it("splits quote, real first letter and the rest, with offsets inside the paragraph", () => {
    expect(splitDropCapLeadQuote("“Come in,” she said.")).toEqual({
      letter: "C",
      letterStart: 1,
      rest: "ome in,” she said.",
      restStart: 2
    });
  });

  it("gives nothing to drop for a lone quote or a paragraph without one", () => {
    expect(splitDropCapLeadQuote("“")).toBeNull();
    expect(splitDropCapLeadQuote("Come in.")).toBeNull();
  });

  it("keeps a letter outside the basic plane whole", () => {
    expect(splitDropCapLeadQuote("“😀 hej")).toMatchObject({ letter: "😀", restStart: 3, rest: " hej" });
  });

  it("covers two characters when the quote can't hang (ODT/IDML), one otherwise", () => {
    expect(dropCapCharacters("“Come in.”")).toBe(2);
    expect(dropCapCharacters("“")).toBe(1);
    expect(dropCapCharacters("Come in.")).toBe(1);
  });

  it("builds the span markup, handing each slice its absolute offset", () => {
    const parts = splitDropCapLeadQuote("“Come in.")!;
    const seen: [string, number, string][] = [];
    const html = dropCapLeadQuoteMarkup(parts, 10, (slice, at, part) => {
      seen.push([slice, at, part]);
      return slice;
    });
    expect(html).toBe('<span class="drop-cap-quote">“</span><span class="drop-cap-letter">C</span>ome in.');
    expect(seen).toEqual([
      ["“", 10, "quote"],
      ["C", 11, "letter"],
      ["ome in.", 12, "rest"]
    ]);
  });
});
