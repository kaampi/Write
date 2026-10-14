import { describe, expect, it } from "vitest";
import { smartQuoteFor, smartenQuotes } from "@core/smartQuotes";

describe("smartQuoteFor", () => {
  it("opens at the very start of the text", () => {
    expect(smartQuoteFor(undefined)).toBe("“");
  });

  it("opens after whitespace", () => {
    expect(smartQuoteFor(" ")).toBe("“");
    expect(smartQuoteFor("\n")).toBe("“");
  });

  it("opens after an opening bracket or dash", () => {
    expect(smartQuoteFor("(")).toBe("“");
    expect(smartQuoteFor("[")).toBe("“");
    expect(smartQuoteFor("{")).toBe("“");
    expect(smartQuoteFor("-")).toBe("“");
    expect(smartQuoteFor("—")).toBe("“");
  });

  it("opens right after another opening curly quote (immediate nesting)", () => {
    expect(smartQuoteFor("“")).toBe("“");
    expect(smartQuoteFor("‘")).toBe("“");
  });

  it("closes after a letter, digit, or ordinary punctuation", () => {
    expect(smartQuoteFor("o")).toBe("”");
    expect(smartQuoteFor("5")).toBe("”");
    expect(smartQuoteFor(".")).toBe("”");
    expect(smartQuoteFor(",")).toBe("”");
  });
});

describe("smartenQuotes", () => {
  it("turns a simple quoted sentence into curly open/close quotes", () => {
    expect(smartenQuotes('She said "hello" and left.')).toBe("She said “hello” and left.");
  });

  it("handles a quote at the very start of the text as opening", () => {
    expect(smartenQuotes('"Hello," she said.')).toBe("“Hello,” she said.");
  });

  it("handles nested dialogue correctly", () => {
    expect(smartenQuotes('She said "he told me \'hi\' once" and smiled.')).toBe(
      "She said “he told me 'hi' once” and smiled."
    );
  });

  it("leaves text with no straight quotes untouched", () => {
    const text = "No quotes here at all.";
    expect(smartenQuotes(text)).toBe(text);
  });

  it("is a pure one-for-one swap — output length always equals input length", () => {
    const text = 'He said "this" and then "that" twice.';
    expect(smartenQuotes(text).length).toBe(text.length);
  });

  it("does not re-convert already-curly quotes", () => {
    const text = "“Already smart,” she said.";
    expect(smartenQuotes(text)).toBe(text);
  });
});
