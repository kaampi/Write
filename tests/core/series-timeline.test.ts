import { describe, expect, it } from "vitest";
import type { BookSummary } from "@core/BookSchema";
import { createSeries, type Series } from "@core/SeriesSchema";
import { effectiveBookOrder, moveSeriesBookOrder, seriesTimelineEntries } from "@core/seriesTimeline";

function summary(id: string, title: string, createdAt: string): BookSummary {
  return { id, title, chapterCount: 0, factCount: 0, wordCount: 0, updated_at: createdAt, created_at: createdAt };
}

function seriesWithOrder(order: string[]): Series {
  return { ...createSeries("Test series"), book_order: order };
}

describe("seriesTimelineEntries", () => {
  it("matches created_at order when book_order is empty", () => {
    const books = [summary("b1", "One", "2026-01-01T00:00:00.000Z"), summary("b2", "Two", "2026-01-02T00:00:00.000Z")];
    const entries = seriesTimelineEntries(seriesWithOrder([]), books);
    expect(entries.map((e) => e.bookTitle)).toEqual(["One", "Two"]);
    expect(entries.every((e) => !e.outOfOrder)).toBe(true);
  });

  it("re-sorts by book_order and flags books out of created_at order", () => {
    const books = [
      summary("b1", "One", "2026-01-01T00:00:00.000Z"),
      summary("b2", "Two", "2026-01-02T00:00:00.000Z"),
      summary("b3", "Three", "2026-01-03T00:00:00.000Z")
    ];
    const entries = seriesTimelineEntries(seriesWithOrder(["b3", "b1", "b2"]), books);
    expect(entries.map((e) => e.bookTitle)).toEqual(["Three", "One", "Two"]);
    expect(entries.find((e) => e.bookTitle === "Three")?.outOfOrder).toBe(true);
    expect(entries.find((e) => e.bookTitle === "One")?.outOfOrder).toBe(true);
    expect(entries.find((e) => e.bookTitle === "Two")?.outOfOrder).toBe(true);
  });

  it("appends a book missing from book_order at its created_at position", () => {
    const books = [
      summary("b1", "One", "2026-01-01T00:00:00.000Z"),
      summary("b2", "Two", "2026-01-02T00:00:00.000Z")
    ];
    // book_order only mentions b1 (e.g. b2 was just added to the series)
    const entries = seriesTimelineEntries(seriesWithOrder(["b1"]), books);
    expect(entries.map((e) => e.bookTitle)).toEqual(["One", "Two"]);
    expect(entries.every((e) => !e.outOfOrder)).toBe(true);
  });

  it("ignores a book_order id for a book no longer in the series", () => {
    const books = [summary("b1", "One", "2026-01-01T00:00:00.000Z")];
    const entries = seriesTimelineEntries(seriesWithOrder(["b1", "gone"]), books);
    expect(entries.map((e) => e.bookTitle)).toEqual(["One"]);
  });
});

describe("moveSeriesBookOrder", () => {
  it("swaps a book with its story-time neighbor and returns a full id list", () => {
    const books = [
      summary("b1", "One", "2026-01-01T00:00:00.000Z"),
      summary("b2", "Two", "2026-01-02T00:00:00.000Z"),
      summary("b3", "Three", "2026-01-03T00:00:00.000Z")
    ];
    const next = moveSeriesBookOrder(seriesWithOrder([]), "b2", "up", books);
    expect(next).toEqual(["b2", "b1", "b3"]);
  });

  it("does nothing when moving the first book up or the last book down", () => {
    const books = [summary("b1", "One", "2026-01-01T00:00:00.000Z"), summary("b2", "Two", "2026-01-02T00:00:00.000Z")];
    const series = seriesWithOrder([]);
    expect(moveSeriesBookOrder(series, "b1", "up", books)).toBe(series.book_order);
    expect(moveSeriesBookOrder(series, "b2", "down", books)).toBe(series.book_order);
  });

  it("is a no-op for an unknown book id", () => {
    const books = [summary("b1", "One", "2026-01-01T00:00:00.000Z")];
    const series = seriesWithOrder([]);
    expect(moveSeriesBookOrder(series, "missing", "up", books)).toBe(series.book_order);
  });
});

describe("effectiveBookOrder", () => {
  it("returns books sorted per the series' book_order", () => {
    const books = [summary("b1", "One", "2026-01-01T00:00:00.000Z"), summary("b2", "Two", "2026-01-02T00:00:00.000Z")];
    const ordered = effectiveBookOrder(seriesWithOrder(["b2", "b1"]), books);
    expect(ordered.map((b) => b.title)).toEqual(["Two", "One"]);
  });
});
