import { createContext, useContext } from "react";
import type { BookSummary } from "@core/BookSchema";
import type { FactDraft } from "@core/NarrativeFact";
import type { CorePredicate } from "@core/predicates";
import type { ConsistencyIssue } from "@core/seriesConsistency";
import type { Series, SeriesSummary } from "@core/SeriesSchema";

export type SeriesBusy = "extract-synopsis" | "extract-entity-note" | null;

export type SeriesStoreValue = {
  summaries: SeriesSummary[];
  seriesId: string | null;
  series: Series | null;
  busy: SeriesBusy;
  error: string | null;
  refresh: () => Promise<void>;
  createSeries: (title: string) => Promise<Series>;
  openSeries: (id: string) => Promise<void>;
  closeSeries: () => void;
  renameSeries: (title: string) => Promise<void>;
  deleteSeries: (id: string) => Promise<void>;
  /** Every book summary whose `series_id` matches, in no particular order — the caller sorts if it needs to. */
  booksInSeries: (id: string) => BookSummary[];
  setBrainstorm: (text: string) => void;
  liftBrainstormToSynopsis: () => void;
  setSynopsis: (text: string) => void;
  extractSynopsis: () => Promise<void>;
  /** The entity's history page for the entity detail view — debounced save, same pattern as `setSynopsis`. */
  setEntityHistory: (entity_ref: string, history: string) => void;
  addEntityPicture: (entity_ref: string, file: File) => Promise<void>;
  removeEntityPicture: (entity_ref: string, index: number) => Promise<void>;
  /** Runs the entity's history page through the extractor, same mechanism as `extractSynopsis`. */
  extractEntityNote: (entity_ref: string, entity_label: string) => Promise<void>;
  addFact: (draft: { label: string; predicate: CorePredicate; value: string }) => Promise<void>;
  reviseFact: (factId: string, value: string) => Promise<void>;
  retractFact: (factId: string) => Promise<void>;
  approve: (factId: string, value?: string) => Promise<void>;
  reject: (factId: string) => Promise<void>;
  keepSeparate: (factId: string, value?: string) => Promise<void>;
  /** "Send to series" — promotes one of a book's own locked facts up to this series, tagged with where it came from. */
  promoteBookFact: (
    draft: FactDraft,
    source: { book_id: string; book_title: string; chapter_title?: string }
  ) => Promise<void>;
  /** On-demand audit across the series' own facts and every book in it — `null` before the first run, or after `openSeries`/`closeSeries` clears it. */
  consistencyIssues: ConsistencyIssue[] | null;
  consistencyChecking: boolean;
  checkConsistency: () => Promise<void>;
};

export const SeriesStoreContext = createContext<SeriesStoreValue | null>(null);

export function useSeriesStore(): SeriesStoreValue {
  const value = useContext(SeriesStoreContext);
  if (!value) throw new Error("useSeriesStore must be used inside SeriesStoreProvider");
  return value;
}
