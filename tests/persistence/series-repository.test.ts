import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, describe, expect, it } from "vitest";
import { createSeries, touchSeries } from "@core/SeriesSchema";
import { SeriesNotFoundError, SeriesRepository } from "@persistence/SeriesRepository";
import { BookRepository } from "@persistence/Repository";
import { createBook } from "@core/BookSchema";

describe("SeriesRepository", () => {
  afterEach(async () => {
    indexedDB.deleteDatabase("storybook-ai");
  });

  it("round-trips a series", async () => {
    const repo = new SeriesRepository(indexedDB);
    const series = touchSeries(createSeries("The Fog Cycle"), { synopsis: "A port city built on lies." });
    await repo.save(series);

    const loaded = await repo.get(series.id);
    expect(loaded.synopsis).toBe("A port city built on lies.");
  });

  it("throws SeriesNotFoundError for a missing id", async () => {
    const repo = new SeriesRepository(indexedDB);
    await expect(repo.get("missing")).rejects.toBeInstanceOf(SeriesNotFoundError);
  });

  it("deletes a series", async () => {
    const repo = new SeriesRepository(indexedDB);
    const series = createSeries("The Fog Cycle");
    await repo.save(series);
    await repo.delete(series.id);
    await expect(repo.get(series.id)).rejects.toBeInstanceOf(SeriesNotFoundError);
  });

  it("lists series sorted by most recently updated, with caller-supplied book counts", async () => {
    const repo = new SeriesRepository(indexedDB);
    const older = { ...createSeries("Older Series"), updated_at: "2026-01-01T00:00:00.000Z" };
    const newer = { ...createSeries("Newer Series"), updated_at: "2026-06-01T00:00:00.000Z" };
    await repo.save(older);
    await repo.save(newer);

    const listed = await repo.list(new Map([[newer.id, 3]]));
    expect(listed.map((series) => series.title)).toEqual(["Newer Series", "Older Series"]);
    expect(listed[0]?.bookCount).toBe(3);
    expect(listed[1]?.bookCount).toBe(0);
  });

  it("lives in the same database as BookRepository without colliding", async () => {
    const seriesRepo = new SeriesRepository(indexedDB);
    const bookRepo = new BookRepository(indexedDB);
    const series = createSeries("The Fog Cycle");
    const book = createBook("Dun Sorrow");
    await seriesRepo.save(series);
    await bookRepo.save(book);

    expect(await seriesRepo.list()).toHaveLength(1);
    expect(await bookRepo.list()).toHaveLength(1);
  });
});
