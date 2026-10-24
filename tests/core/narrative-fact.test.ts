import { describe, expect, it } from "vitest";
import { slugify, normalizeValue } from "@core/ids";
import { NarrativeFactSchema, lockedFactsFromChapter, mergeInheritedFacts, type NarrativeFact } from "@core/NarrativeFact";

describe("slugify", () => {
  it("turns a display name into a stable ref", () => {
    expect(slugify("Emma Vale")).toBe("emma-vale");
    expect(slugify("  The Aurora Room ")).toBe("the-aurora-room");
  });
});

describe("NarrativeFactSchema", () => {
  it("accepts a locked core fact", () => {
    const fact = NarrativeFactSchema.parse({
      id: "f1",
      entity_ref: "emma-vale",
      entity_label: "Emma Vale",
      predicate: "core.identity",
      value: "Bartender at the Aurora Room",
      sequence_index: 0,
      status: "locked",
      source: "author",
      created_at: "2026-09-14T00:00:00.000Z"
    });
    expect(fact.predicate).toBe("core.identity");
  });

  it("accepts an optional scene_id, additive like chapter_id", () => {
    const fact = NarrativeFactSchema.parse({
      id: "f1",
      entity_ref: "emma-vale",
      entity_label: "Emma Vale",
      predicate: "core.identity",
      value: "Bartender at the Aurora Room",
      sequence_index: 0,
      chapter_id: "ch1",
      scene_id: "ch1:scene-1",
      status: "locked",
      source: "author",
      created_at: "2026-09-14T00:00:00.000Z"
    });
    expect(fact.scene_id).toBe("ch1:scene-1");

    const legacy = NarrativeFactSchema.parse({
      id: "f2",
      entity_ref: "emma-vale",
      entity_label: "Emma Vale",
      predicate: "core.identity",
      value: "Bartender at the Aurora Room",
      sequence_index: 0,
      status: "locked",
      source: "author",
      created_at: "2026-09-14T00:00:00.000Z"
    });
    expect(legacy.scene_id).toBeUndefined();
  });

  it("accepts an optional is_merge_suggestion flag, additive and missing by default", () => {
    const fact = NarrativeFactSchema.parse({
      id: "f1",
      entity_ref: "jeff",
      entity_label: "Jeff",
      predicate: "core.identity",
      value: "A captain on a space ship",
      sequence_index: 0,
      status: "flagged",
      source: "extractor",
      conflict_with: "locked-jeff",
      is_merge_suggestion: true,
      created_at: "2026-09-14T00:00:00.000Z"
    });
    expect(fact.is_merge_suggestion).toBe(true);

    const conflict = NarrativeFactSchema.parse({
      id: "f2",
      entity_ref: "jeff",
      entity_label: "Jeff",
      predicate: "core.identity",
      value: "A cook",
      sequence_index: 0,
      status: "flagged",
      source: "extractor",
      conflict_with: "locked-jeff",
      created_at: "2026-09-14T00:00:00.000Z"
    });
    expect(conflict.is_merge_suggestion).toBeUndefined();
  });

  it("rejects rpg predicates — they do not belong in this app's bible", () => {
    expect(() =>
      NarrativeFactSchema.parse({
        id: "f1",
        entity_ref: "emma",
        entity_label: "Emma",
        predicate: "rpg.stats",
        value: "12",
        sequence_index: 0,
        status: "locked",
        source: "author",
        created_at: "2026-09-14T00:00:00.000Z"
      })
    ).toThrow();
  });
});

describe("normalizeValue", () => {
  it("treats spacing and case as the same claim", () => {
    expect(normalizeValue("  Sister of Kael ")).toBe(normalizeValue("sister of kael"));
  });
});

describe("lockedFactsFromChapter", () => {
  function fact(overrides: Partial<NarrativeFact> = {}): NarrativeFact {
    return {
      id: overrides.id ?? "f1",
      entity_ref: "emma",
      entity_label: "Emma",
      predicate: "core.identity",
      value: "Something",
      sequence_index: 0,
      status: "locked",
      source: "author",
      created_at: "2026-09-26T00:00:00.000Z",
      ...overrides
    };
  }

  it("finds only locked, active facts sourced from the given chapter", () => {
    const facts = [
      fact({ id: "a", chapter_id: "ch1" }),
      fact({ id: "b", chapter_id: "ch2" }),
      fact({ id: "c", chapter_id: "ch1", status: "ai_proposed" }),
      fact({ id: "d", chapter_id: "ch1", superseded_by: "e" }),
      fact({ id: "e", chapter_id: "ch1" }),
      fact({ id: "f" })
    ];
    const result = lockedFactsFromChapter(facts, "ch1");
    expect(result.map((row) => row.id).sort()).toEqual(["a", "e"]);
  });

  it("returns an empty list when nothing locked traces back to that chapter", () => {
    expect(lockedFactsFromChapter([fact({ chapter_id: "ch2" })], "ch1")).toEqual([]);
  });
});

describe("mergeInheritedFacts", () => {
  function fact(overrides: Partial<NarrativeFact> = {}): NarrativeFact {
    return {
      id: overrides.id ?? "f1",
      entity_ref: "elara",
      entity_label: "Elara",
      predicate: "core.identity",
      value: "Something",
      sequence_index: 0,
      status: "locked",
      source: "author",
      created_at: "2026-09-26T00:00:00.000Z",
      ...overrides
    };
  }

  it("returns the book's own facts unchanged when the series has none", () => {
    const bookFacts = [fact({ id: "b1" })];
    expect(mergeInheritedFacts(bookFacts, [])).toBe(bookFacts);
  });

  it("appends a series fact the book doesn't already cover", () => {
    const seriesFact = fact({ id: "s1", value: "Guardian of Dun Sorrow" });
    const merged = mergeInheritedFacts([], [seriesFact]);
    expect(merged).toEqual([seriesFact]);
  });

  it("lets a locked book fact win over the series' value for the same entity+predicate", () => {
    const bookFact = fact({ id: "b1", value: "Harbor master now" });
    const seriesFact = fact({ id: "s1", value: "Guardian of Dun Sorrow" });
    const merged = mergeInheritedFacts([bookFact], [seriesFact]);
    expect(merged).toEqual([bookFact]);
  });

  it("still inherits other predicates on the same entity the book hasn't touched", () => {
    const bookFact = fact({ id: "b1", predicate: "core.trait", value: "Short-tempered" });
    const seriesFact = fact({ id: "s1", value: "Guardian of Dun Sorrow" });
    const merged = mergeInheritedFacts([bookFact], [seriesFact]);
    expect(merged.map((f) => f.id).sort()).toEqual(["b1", "s1"]);
  });

  it("a merely flagged book fact doesn't block inheritance — only a locked one does", () => {
    const flagged = fact({ id: "b1", status: "flagged", value: "Maybe a spy" });
    const seriesFact = fact({ id: "s1", value: "Guardian of Dun Sorrow" });
    const merged = mergeInheritedFacts([flagged], [seriesFact]);
    expect(merged.map((f) => f.id).sort()).toEqual(["b1", "s1"]);
  });

  it("ignores a series fact that is only ai_proposed or superseded", () => {
    const proposed = fact({ id: "s1", status: "ai_proposed" });
    const superseded = fact({ id: "s2", superseded_by: "s3" });
    expect(mergeInheritedFacts([], [proposed, superseded])).toEqual([]);
  });
});
