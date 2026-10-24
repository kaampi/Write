import { describe, expect, it } from "vitest";
import { crossBookConsistencyIssues } from "@core/seriesConsistency";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(overrides: Partial<NarrativeFact> = {}): NarrativeFact {
  return {
    id: overrides.id ?? "f1",
    entity_ref: "elara",
    entity_label: "Elara",
    predicate: "core.identity",
    value: "Guardian of Dun Sorrow",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-26T00:00:00.000Z",
    ...overrides
  };
}

describe("crossBookConsistencyIssues", () => {
  it("finds nothing when every source agrees", () => {
    const series = [fact()];
    const books = [{ bookTitle: "Book One", facts: [fact({ id: "b1" })] }];
    expect(crossBookConsistencyIssues(series, "Series", books)).toEqual([]);
  });

  it("flags two books that independently locked different values, with neither overriding the series", () => {
    const books = [
      { bookTitle: "Book Two", facts: [fact({ id: "b2", value: "A traveling merchant" })] },
      { bookTitle: "Book Three", facts: [fact({ id: "b3", value: "A retired soldier" })] }
    ];
    const issues = crossBookConsistencyIssues([], "Series", books);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.entity_label).toBe("Elara");
    expect(issues[0]?.sources.map((s) => ({ label: s.label, value: s.value }))).toEqual([
      { label: "Book Two", value: "A traveling merchant" },
      { label: "Book Three", value: "A retired soldier" }
    ]);
  });

  it("flags a book that diverges from the series too, same as a between-book divergence", () => {
    const series = [fact({ value: "Guardian of Dun Sorrow" })];
    const books = [{ bookTitle: "Book Three", facts: [fact({ id: "b3", value: "A retired soldier" })] }];
    const issues = crossBookConsistencyIssues(series, "Series", books);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.sources.map((s) => s.label)).toEqual(["Series", "Book Three"]);
  });

  it("treats spacing/case-only differences as agreement, not a conflict", () => {
    const books = [
      { bookTitle: "Book Two", facts: [fact({ id: "b2", value: "Guardian of Dun Sorrow" })] },
      { bookTitle: "Book Three", facts: [fact({ id: "b3", value: "  guardian of dun sorrow " })] }
    ];
    expect(crossBookConsistencyIssues([], "Series", books)).toEqual([]);
  });

  it("ignores ai_proposed, flagged, and superseded facts on either side", () => {
    const books = [
      { bookTitle: "Book Two", facts: [fact({ id: "b2", value: "A traveling merchant", status: "ai_proposed" })] },
      { bookTitle: "Book Three", facts: [fact({ id: "b3", value: "A retired soldier", superseded_by: "x" })] }
    ];
    expect(crossBookConsistencyIssues([], "Series", books)).toEqual([]);
  });

  it("keeps different entities and different predicates separate", () => {
    const books = [
      {
        bookTitle: "Book Two",
        facts: [
          fact({ id: "b2", value: "A traveling merchant" }),
          fact({ id: "b2b", predicate: "core.trait", value: "Short-tempered" })
        ]
      },
      {
        bookTitle: "Book Three",
        facts: [
          fact({ id: "b3", entity_ref: "dun-sorrow", entity_label: "Dun Sorrow", predicate: "core.place", value: "A ruined outpost" })
        ]
      }
    ];
    expect(crossBookConsistencyIssues([], "Series", books)).toEqual([]);
  });
});
