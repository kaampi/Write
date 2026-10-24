import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSeries as createSeriesRecord, touchSeries, type Series } from "@core/SeriesSchema";
import { SeriesNotFoundError, SeriesRepository } from "@persistence/SeriesRepository";
import { useBookStore } from "./useBookStore";
import { SeriesStoreContext, type SeriesStoreValue } from "./useSeriesStore";

/**
 * A separate, much smaller context than BookStore — Series only owns the
 * series record itself (title/brainstorm/synopsis/facts) and its CRUD.
 * A book's own `series_id` is written through BookStore's `setBookSeries`
 * instead of here, so Book persistence has exactly one owner. Reads
 * BookStore's `summaries` to work out which books belong to which series
 * and to keep each `SeriesSummary.bookCount` current — this provider must
 * sit inside `BookStoreProvider` for that.
 */
export function SeriesStoreProvider({ children }: { children: React.ReactNode }) {
  const { summaries: bookSummaries } = useBookStore();
  const repo = useMemo(() => new SeriesRepository(), []);
  const [summaries, setSummaries] = useState<SeriesStoreValue["summaries"]>([]);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seriesRef = useRef<Series | null>(null);
  const saveTimer = useRef<number | null>(null);

  const bookCountBySeriesId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const summary of bookSummaries) {
      if (!summary.series_id) continue;
      counts.set(summary.series_id, (counts.get(summary.series_id) ?? 0) + 1);
    }
    return counts;
  }, [bookSummaries]);

  const refresh = useCallback(async () => {
    setSummaries(await repo.list(bookCountBySeriesId));
  }, [repo, bookCountBySeriesId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (next: Series) => {
      await repo.save(next);
      setSummaries(await repo.list(bookCountBySeriesId));
    },
    [repo, bookCountBySeriesId]
  );

  const createSeries = useCallback(
    async (title: string) => {
      const created = createSeriesRecord(title);
      await repo.save(created);
      setSummaries(await repo.list(bookCountBySeriesId));
      seriesRef.current = created;
      setSeries(created);
      setSeriesId(created.id);
      setError(null);
      return created;
    },
    [repo, bookCountBySeriesId]
  );

  const openSeries = useCallback(
    async (id: string) => {
      try {
        const loaded = await repo.get(id);
        seriesRef.current = loaded;
        setSeries(loaded);
        setSeriesId(id);
        setError(null);
      } catch (err) {
        setError(err instanceof SeriesNotFoundError ? "series-not-found" : "series-unreadable");
      }
    },
    [repo]
  );

  const closeSeries = useCallback(() => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const current = seriesRef.current;
    if (current) void persist(current);
    seriesRef.current = null;
    setSeries(null);
    setSeriesId(null);
  }, [persist]);

  const renameSeries = useCallback(
    async (title: string) => {
      const current = seriesRef.current;
      if (!current) return;
      const next = touchSeries(current, { title: title.trim() || "Untitled series" });
      seriesRef.current = next;
      setSeries(next);
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void persist(next);
        saveTimer.current = null;
      }, 400);
    },
    [persist]
  );

  const deleteSeries = useCallback(
    async (id: string) => {
      await repo.delete(id);
      if (seriesRef.current?.id === id) {
        seriesRef.current = null;
        setSeries(null);
        setSeriesId(null);
      }
      setSummaries(await repo.list(bookCountBySeriesId));
    },
    [repo, bookCountBySeriesId]
  );

  const booksInSeries = useCallback((id: string) => bookSummaries.filter((book) => book.series_id === id), [bookSummaries]);

  const value: SeriesStoreValue = {
    summaries,
    seriesId,
    series,
    error,
    refresh,
    createSeries,
    openSeries,
    closeSeries,
    renameSeries,
    deleteSeries,
    booksInSeries
  };

  return <SeriesStoreContext.Provider value={value}>{children}</SeriesStoreContext.Provider>;
}
