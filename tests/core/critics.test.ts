import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { CRITIC_PERSONA_IDS, CRITIC_SYSTEM_PROMPTS, criticUserPrompt, parseCriticFeedback } from "@core/critics";

function bookWithProse(prose: string) {
  const book = createBook("Night Keys");
  const chapter = book.chapters[0]!;
  return {
    book: updateChapter(book, chapter.id, { prose }),
    chapterId: chapter.id
  };
}

describe("CRITIC_PERSONA_IDS", () => {
  it("has exactly the three agreed personas", () => {
    expect(CRITIC_PERSONA_IDS).toEqual(["impatient-reader", "pacing-critic", "confused-reader"]);
  });

  it("gives each persona its own distinct system prompt", () => {
    const prompts = CRITIC_PERSONA_IDS.map((persona) => CRITIC_SYSTEM_PROMPTS[persona]);
    expect(new Set(prompts).size).toBe(CRITIC_PERSONA_IDS.length);
    for (const prompt of prompts) {
      expect(prompt).toContain('{"items":[{"quote":"...","observation":"..."}]}');
    }
  });
});

describe("criticUserPrompt", () => {
  it("sends the chapter prose and Reader, never brainstorm or Story Bible", () => {
    const { book, chapterId } = bookWithProse("Emma locked the quay door. She felt tired to her bones.");
    const withSecret = { ...book, brainstorm: "The stowaway is the captain's sister. Do not reveal this yet." };
    const chapter = withSecret.chapters.find((item) => item.id === chapterId)!;
    const prompt = criticUserPrompt(withSecret, chapter);
    expect(prompt).toContain("Emma locked the quay door");
    expect(prompt).not.toContain("brainstorm");
    expect(prompt).not.toContain("stowaway");
  });
});

describe("parseCriticFeedback", () => {
  const prose = "Emma locked the quay door. She felt tired to her bones. The gulls screamed overhead.";

  it("parses items and tags them with the given persona", () => {
    const raw = JSON.stringify({
      items: [{ quote: "She felt tired to her bones", observation: "This beat already happened a paragraph ago." }]
    });
    const items = parseCriticFeedback(raw, prose, "impatient-reader");
    expect(items).toEqual([
      {
        persona: "impatient-reader",
        quote: "She felt tired to her bones",
        observation: "This beat already happened a paragraph ago.",
        paragraphIndex: 0
      }
    ]);
  });

  it("drops a row with a too-short quote", () => {
    const raw = JSON.stringify({ items: [{ quote: "short", observation: "Too short to find reliably." }] });
    expect(parseCriticFeedback(raw, prose, "confused-reader")).toEqual([]);
  });

  it("drops a row with no observation", () => {
    const raw = JSON.stringify({ items: [{ quote: "Emma locked the quay door", observation: "" }] });
    expect(parseCriticFeedback(raw, prose, "pacing-critic")).toEqual([]);
  });

  it("returns an empty list for malformed JSON instead of throwing", () => {
    expect(parseCriticFeedback("not json", prose, "impatient-reader")).toEqual([]);
  });

  it("returns an empty list when items is missing or not an array", () => {
    expect(parseCriticFeedback(JSON.stringify({}), prose, "impatient-reader")).toEqual([]);
    expect(parseCriticFeedback(JSON.stringify({ items: "nope" }), prose, "impatient-reader")).toEqual([]);
  });

  it("caps at the per-persona item limit", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      quote: `Emma locked the quay door ${i}`,
      observation: `Observation ${i}`
    }));
    const raw = JSON.stringify({ items });
    expect(parseCriticFeedback(raw, prose, "pacing-critic").length).toBeLessThanOrEqual(6);
  });
});
