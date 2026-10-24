import { createContext, useContext } from "react";
import type { BookSummary } from "@core/BookSchema";
import type { Series, SeriesSummary } from "@core/SeriesSchema";

export type SeriesStoreValue = {
  summaries: SeriesSummary[];
  seriesId: string | null;
  series: Series | null;
  error: string | null;
  refresh: () => Promise<void>;
  createSeries: (title: string) => Promise<Series>;
  openSeries: (id: string) => Promise<void>;
  closeSeries: () => void;
  renameSeries: (title: string) => Promise<void>;
  deleteSeries: (id: string) => Promise<void>;
  /** Every book summary whose `series_id` matches, in no particular order — the caller sorts if it needs to. */
  booksInSeries: (id: string) => BookSummary[];
};

export const SeriesStoreContext = createContext<SeriesStoreValue | null>(null);

export function useSeriesStore(): SeriesStoreValue {
  const value = useContext(SeriesStoreContext);
  if (!value) throw new Error("useSeriesStore must be used inside SeriesStoreProvider");
  return value;
}
