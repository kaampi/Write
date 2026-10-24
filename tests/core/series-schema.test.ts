import { describe, expect, it } from "vitest";
import { createSeries, parseSeries, summarizeSeries, touchSeries } from "@core/SeriesSchema";
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
