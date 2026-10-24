import { useState } from "react";
import { useSeriesStore } from "./useSeriesStore";
import { useBookStore } from "./useBookStore";
import { count, format, translateError, useLocale } from "./i18n";
import { SeriesBiblePanel } from "./SeriesBiblePanel";

type SeriesTab = "brainstorm" | "synopsis" | "bible" | "books";

/**
 * The series-level workspace. Step 2 (v1.0.179) landed the Books tab only
 * — see and manage a series' books. This step adds the actual payoff:
 * Brainstorm (free text only — no sticky-note board, unlike a book's; a
 * series doesn't need the full tray/send mechanism for v1), Synopsis (with
 * AI extraction into facts, same extractor a book's own Synopsis uses),
 * and Story Bible (SeriesBiblePanel — the series' own locked canon, plus
 * whatever "Send to series" promoted up from a book).
 */
export function SeriesWorkspace() {
  const {
    series,
    busy,
    error,
    closeSeries,
    renameSeries,
    deleteSeries,
    booksInSeries,
    setBrainstorm,
    liftBrainstormToSynopsis,
    setSynopsis,
    extractSynopsis
  } = useSeriesStore();
  const { openBook, newBook } = useBookStore();
  const { messages: m } = useLocale();
  const [newBookTitle, setNewBookTitle] = useState("");
  const [tab, setTab] = useState<SeriesTab>("brainstorm");

  if (!series) {
    return (
      <div className="home series-workspace">
        <p className="banner home-banner" role="status">
          {error === "series-not-found" ? m.series.notFound : m.series.unreadable}
        </p>
        <button type="button" className="text-button" onClick={closeSeries}>
          {m.series.backToShelf}
        </button>
      </div>
    );
  }

  const books = booksInSeries(series.id);

  function submitNewBook(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!series) return;
    void newBook(newBookTitle, series.id).then(() => setNewBookTitle(""));
  }

  return (
    <div className="home series-workspace">
      <header className="home-brand">
        <button type="button" className="text-button" onClick={closeSeries}>
          {m.series.backToShelf}
        </button>
        <input
          className="title-input series-title-input"
          value={series.title}
          onChange={(event) => void renameSeries(event.target.value)}
          aria-label={m.series.titleLabel}
        />
      </header>

      <nav className="series-tabs" aria-label={m.series.heading}>
        {(["brainstorm", "synopsis", "bible", "books"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={item === tab ? "series-tab is-active" : "series-tab"}
            onClick={() => setTab(item)}
          >
            {m.series.tabs[item]}
          </button>
        ))}
      </nav>

      {error && error !== "series-not-found" && error !== "series-unreadable" ? (
        <p className="banner home-banner" role="status">
          {translateError(error, m)}
        </p>
      ) : null}

      {tab === "brainstorm" ? (
        <section className="series-tab-panel">
          <p className="quiet">{m.series.brainstormLede}</p>
          <textarea
            className="series-brainstorm-area"
            value={series.brainstorm}
            onChange={(event) => setBrainstorm(event.target.value)}
            placeholder={m.series.brainstormPlaceholder}
            rows={16}
          />
          <div className="edit-actions">
            <button type="button" className="primary" disabled={!series.brainstorm.trim()} onClick={liftBrainstormToSynopsis}>
              {m.series.liftToSynopsis}
            </button>
          </div>
        </section>
      ) : null}

      {tab === "synopsis" ? (
        <section className="series-tab-panel">
          <p className="quiet">{m.series.synopsisLede}</p>
          <textarea
            className="series-synopsis-area"
            value={series.synopsis}
            onChange={(event) => setSynopsis(event.target.value)}
            placeholder={m.series.synopsisPlaceholder}
            rows={16}
          />
          <div className="edit-actions">
            <button type="button" className="primary" disabled={busy !== null || !series.synopsis.trim()} onClick={() => void extractSynopsis()}>
              {busy === "extract-synopsis" ? m.series.extracting : m.series.extractFacts}
            </button>
          </div>
        </section>
      ) : null}

      {tab === "bible" ? <SeriesBiblePanel /> : null}

      {tab === "books" ? (
        <section className="book-shelf series-book-list" aria-label={m.series.booksHeading}>
          {books.length === 0 ? <p className="empty-shelf">{m.series.noBooksYet}</p> : null}

          {books.length > 0 ? (
            <ul>
              {books.map((book) => (
                <li key={book.id}>
                  <button type="button" className="book-card" onClick={() => void openBook(book.id)}>
                    <strong>{book.title}</strong>
                    <span>
                      {count(book.chapterCount, m.home.chapters)}
                      <span className="dot">·</span>
                      {count(book.factCount, m.home.facts)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <form className="home-start-card-form series-new-book-form" onSubmit={submitNewBook}>
            <input
              value={newBookTitle}
              onChange={(event) => setNewBookTitle(event.target.value)}
              placeholder={m.home.titlePlaceholder}
              autoComplete="off"
              aria-label={m.series.newBookInSeries}
            />
            <button type="submit" className="home-start-card-action">
              {m.series.newBookInSeries}
            </button>
          </form>

          <div className="series-danger-zone">
            <button
              type="button"
              className="text-button danger"
              disabled={books.length > 0}
              title={books.length > 0 ? m.series.deleteBlocked : undefined}
              onClick={() => {
                if (window.confirm(format(m.series.deleteConfirm, { title: series.title }))) {
                  void deleteSeries(series.id);
                }
              }}
            >
              {m.series.deleteSeries}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
