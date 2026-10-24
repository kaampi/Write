import { useState } from "react";
import { useSeriesStore } from "./useSeriesStore";
import { useBookStore } from "./useBookStore";
import { count, format, useLocale } from "./i18n";

/**
 * The series-level workspace (step 2 of the series rollout — schema and
 * persistence landed in v1.0.178). Deliberately minimal for now: open the
 * series, see and rename its title, see and open its books, start a new
 * one inside it. Brainstorm/Synopsis/Story Bible for the series itself —
 * the actual "build the world before any book exists" payoff — are the
 * next step; this one just gets a series' books organized and navigable.
 */
export function SeriesWorkspace() {
  const { series, error, closeSeries, renameSeries, deleteSeries, booksInSeries } = useSeriesStore();
  const { openBook, newBook } = useBookStore();
  const { messages: m } = useLocale();
  const [newBookTitle, setNewBookTitle] = useState("");

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

      <section className="book-shelf series-book-list" aria-label={m.series.booksHeading}>
        <h2 className="settings-heading home-heading-lg">{m.series.booksHeading}</h2>

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
      </section>

      <section className="series-danger-zone">
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
      </section>
    </div>
  );
}
