import { describe, expect, it } from "vitest";
import { createSeries, entityNoteFor, parseSeries, setEntityNoteHistory, summarizeSeries, touchSeries } from "@core/SeriesSchema";
import type { NarrativeFact } from "@core/NarrativeFact";

const lockedFact: NarrativeFact = {
  id: "1",
  entity_ref: "dun-sorrow",
  entity_label: "Dun Sorrow",
  predicate: "core.place",
  value: "A fog-bound harbor town",
  sequence_index: 0,
  status: "locked",
  source: "author",
  created_at: "2026-09-16T00:00:00.000Z"
};

describe("createSeries", () => {
  it("starts empty with a title", () => {
    const series = createSeries("The Fog Cycle");
    expect(series.title).toBe("The Fog Cycle");
    expect(series.brainstorm).toBe("");
    expect(series.brainstorm_notes).toEqual([]);
    expect(series.synopsis).toBe("");
    expect(series.facts).toEqual([]);
    expect(series.entity_notes).toEqual([]);
    expect(series.media).toEqual([]);
    expect(series.id).toBeTruthy();
  });

  it("falls back to a default title when blank", () => {
    expect(createSeries("   ").title).toBe("Untitled series");
  });
});

describe("parseSeries", () => {
  it("round-trips what createSeries produces", () => {
    const series = createSeries("The Fog Cycle");
    expect(parseSeries(series)).toEqual(series);
  });

  it("rejects something that isn't a series", () => {
    expect(() => parseSeries({ hello: "world" })).toThrow();
  });
});

describe("touchSeries", () => {
  it("applies a patch and bumps updated_at", () => {
    const series = createSeries("The Fog Cycle");
    const patched = touchSeries(series, { synopsis: "A port city built on lies." });
    expect(patched.synopsis).toBe("A port city built on lies.");
    expect(patched.updated_at >= series.updated_at).toBe(true);
  });
});

describe("entityNoteFor / setEntityNoteHistory", () => {
  it("returns an empty note for an entity with none yet", () => {
    expect(entityNoteFor([], "elara")).toEqual({ entity_ref: "elara", history: "" });
  });

  it("creates a new note on first write", () => {
    const notes = setEntityNoteHistory([], "elara", "Born during the Long Silence.");
    expect(notes).toEqual([{ entity_ref: "elara", history: "Born during the Long Silence." }]);
    expect(entityNoteFor(notes, "elara").history).toBe("Born during the Long Silence.");
  });

  it("updates an existing note in place, leaving others untouched", () => {
    const notes = setEntityNoteHistory(
      [
        { entity_ref: "elara", history: "Draft one." },
        { entity_ref: "dun-sorrow", history: "A harbor town." }
      ],
      "elara",
      "Rewritten history."
    );
    expect(entityNoteFor(notes, "elara").history).toBe("Rewritten history.");
    expect(entityNoteFor(notes, "dun-sorrow").history).toBe("A harbor town.");
  });

  it("writing an empty history for an entity with no note yet is a no-op", () => {
    expect(setEntityNoteHistory([], "elara", "")).toEqual([]);
  });

  it("clearing an existing note's history keeps the (now empty) row rather than deleting it", () => {
    const notes = setEntityNoteHistory([{ entity_ref: "elara", history: "Something." }], "elara", "");
    expect(notes).toEqual([{ entity_ref: "elara", history: "" }]);
  });
});

describe("summarizeSeries", () => {
  it("counts only locked, non-superseded facts", () => {
    const proposed: NarrativeFact = { ...lockedFact, id: "2", status: "ai_proposed" };
    const superseded: NarrativeFact = { ...lockedFact, id: "3", superseded_by: "1" };
    const series = { ...createSeries("The Fog Cycle"), facts: [lockedFact, proposed, superseded] };
    const summary = summarizeSeries(series, 2);
    expect(summary.factCount).toBe(1);
    expect(summary.bookCount).toBe(2);
    expect(summary.title).toBe("The Fog Cycle");
  });
});
