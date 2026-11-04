import { useEffect, useState } from "react";
import type { BookSummary } from "@core/BookSchema";
import { seriesTimelineEntries } from "@core/seriesTimeline";
import { useSeriesStore } from "./useSeriesStore";
import { useBookStore } from "./useBookStore";
import { CloseIconButton } from "./CloseIconButton";
import { format, translateError, useLocale } from "./i18n";

/** A common manuscript-format estimate (12pt, double-spaced) — same constant the Home-page artifact sketch used, not tied to any book's own chosen page_size (Typography's Page size setting is a per-book export detail; this is just a quick at-a-glance estimate). */
const WORDS_PER_PAGE = 275;

/**
 * Opened from a series row on Home ("Open series →"), over the top of
 * Home rather than replacing it — deliberately NOT driven by the same
 * `seriesId`/`series` pair SeriesWorkspace uses (see SeriesStore.tsx's
 * `previewSeries` doc comment), so this can show as a modal without
 * App.tsx's routing swapping Home out from under it. "Open series
 * workspace" below hands off to the real `openSeries`, for Brainstorm/
 * Synopsis/Story Bible/Books editing this modal doesn't attempt.
 *
 * Ports the Series detail modal sketched in the Claude artifact
 * (2026-11-04): a cover carousel + word/page/locked-fact metadata on the
 * left, with the Series Timeline (book_order, up/down + "Reordered" flag)
 * below it, and the series' own synopsis on the right. UI and book
 * ordering only — explicitly NOT wired to change what Draft sees (see
 * SeriesSchema.ts's `book_order` doc comment).
 */
export function SeriesDetailModal() {
  const { previewSeries, previewError, closeSeriesPreview, booksInSeries, moveBookOrder, openSeries } = useSeriesStore();
  const { openBook } = useBookStore();
  const { messages: m } = useLocale();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const books: BookSummary[] = previewSeries ? booksInSeries(previewSeries.id) : [];
  const entries = previewSeries ? seriesTimelineEntries(previewSeries, books) : [];
  const booksById = new Map(books.map((book) => [book.id, book]));
  const orderedBooks = entries.map((entry) => booksById.get(entry.bookId)).filter((book): book is BookSummary => Boolean(book));

  useEffect(() => {
    if (orderedBooks.length === 0) {
      setSelectedBookId(null);
      return;
    }
    if (!orderedBooks.some((book) => book.id === selectedBookId)) setSelectedBookId(orderedBooks[0]!.id);
    // Re-run when the series or its book list changes shape, not on every
    // reorder — a reorder shouldn't knock the carousel back to book #1.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewSeries?.id, orderedBooks.length]);

  useEffect(() => {
    if (!previewSeries) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeSeriesPreview();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewSeries, closeSeriesPreview]);

  if (!previewSeries) return null;

  const currentIndex = orderedBooks.findIndex((book) => book.id === selectedBookId);
  const currentBook = currentIndex >= 0 ? orderedBooks[currentIndex] : undefined;
  const cumulativeFacts =
    currentIndex >= 0 ? orderedBooks.slice(0, currentIndex + 1).reduce((sum, book) => sum + book.factCount, 0) : 0;
  const pages = currentBook ? Math.max(1, Math.round(currentBook.wordCount / WORDS_PER_PAGE)) : 0;

  return (
    <div className="edit-overlay" role="presentation" onClick={closeSeriesPreview}>
      <div
        className="edit-card series-detail-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="series-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <strong id="series-detail-title" className="series-detail-title">
            {previewSeries.title}
          </strong>
          <CloseIconButton onClick={closeSeriesPreview} label={m.common.close} />
        </div>

        {previewError ? (
          <p className="banner home-banner" role="status">
            {translateError(previewError, m)}
          </p>
        ) : null}

        {orderedBooks.length === 0 ? (
          <p className="empty-shelf">{m.series.noBooksYet}</p>
        ) : (
          <div className="series-detail-columns">
            <div className="series-detail-left">
              <div className="series-detail-cover-row">
                <button
                  type="button"
                  className="series-detail-nav"
                  disabled={currentIndex <= 0}
                  onClick={() => setSelectedBookId(orderedBooks[currentIndex - 1]!.id)}
                  aria-label={m.series.previousBook}
                >
                  ‹
                </button>
                <div className="series-detail-cover">
                  {currentBook?.cover_image_data_url ? (
                    <img className="series-detail-cover-image" src={currentBook.cover_image_data_url} alt="" />
                  ) : (
                    <span className="series-detail-cover-placeholder">{currentBook?.title}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="series-detail-nav"
                  disabled={currentIndex < 0 || currentIndex >= orderedBooks.length - 1}
                  onClick={() => setSelectedBookId(orderedBooks[currentIndex + 1]!.id)}
                  aria-label={m.series.nextBook}
                >
                  ›
                </button>
              </div>
              <div className="series-detail-book-title">{currentBook?.title}</div>
              <div className="series-detail-meta">
                <span>
                  {format(m.series.detailWords, { words: (currentBook?.wordCount ?? 0).toLocaleString(), pages: String(pages) })}
                </span>
                <span>{format(m.series.detailFacts, { own: String(currentBook?.factCount ?? 0), cumulative: String(cumulativeFacts) })}</span>
              </div>

              <div className="series-detail-timeline-label">{m.series.timelineLabel}</div>
              <p className="series-detail-timeline-lede">{m.series.timelineLede}</p>
              <ul className="series-detail-timeline-list">
                {entries.map((entry, index) => (
                  <li key={entry.bookId} className={entry.bookId === selectedBookId ? "is-current" : undefined}>
                    <button type="button" className="series-detail-timeline-row" onClick={() => setSelectedBookId(entry.bookId)}>
                      <span className="series-detail-timeline-position">{index + 1}</span>
                      <span className="series-detail-timeline-title">{entry.bookTitle}</span>
                    </button>
                    {entry.outOfOrder ? <span className="series-detail-timeline-flag">{m.series.timelineReordered}</span> : null}
                    <div className="series-detail-timeline-nav">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => void moveBookOrder(entry.bookId, "up")}
                        aria-label={m.series.timelineMoveEarlier}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === entries.length - 1}
                        onClick={() => void moveBookOrder(entry.bookId, "down")}
                        aria-label={m.series.timelineMoveLater}
                      >
                        ▼
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="series-detail-right">
              <h3 className="series-detail-synopsis-label">{m.series.synopsisHeading}</h3>
              {previewSeries.synopsis.trim() ? (
                <p className="series-detail-synopsis">{previewSeries.synopsis}</p>
              ) : (
                <p className="series-detail-synopsis quiet">{m.series.detailNoSynopsis}</p>
              )}

              <div className="series-detail-actions">
                <button
                  type="button"
                  className="text-button"
                  disabled={!currentBook}
                  onClick={() => currentBook && void openBook(currentBook.id)}
                >
                  {m.series.detailOpenBook}
                </button>
                <button
                  type="button"
                  className="home-start-card-action"
                  onClick={() => {
                    const id = previewSeries.id;
                    closeSeriesPreview();
                    void openSeries(id);
                  }}
                >
                  {m.series.detailOpenWorkspace}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
