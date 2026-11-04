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
  /** `bookId`, when given, is the book the caller wants the Series workspace to land on and highlight (its Books tab opens by default instead of Brainstorm) — set by clicking a book's "Series: …" tag on the shelf. Omit for the ordinary "Open series" entry point. */
  openSeries: (id: string, bookId?: string) => Promise<void>;
  /** The book passed to the `openSeries` call that's currently open, or null for an ordinary open — SeriesWorkspace reads this once, on mount, to choose its initial tab and which row to scroll to/highlight. */
  focusBookId: string | null;
  closeSeries: () => void;
  /** A series loaded for the Series detail modal (cover carousel, metadata, Series Timeline) — separate from `series`/`seriesId` on purpose, since those drive App.tsx's full-page routing and the modal opens over Home instead. */
  previewSeries: Series | null;
  previewError: string | null;
  openSeriesPreview: (id: string) => Promise<void>;
  closeSeriesPreview: () => void;
  /** Moves a book one step in the series' Timeline (`book_order`) — operates on `previewSeries`, the only place the Timeline UI lives. */
  moveBookOrder: (bookId: string, direction: "up" | "down") => Promise<void>;
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
