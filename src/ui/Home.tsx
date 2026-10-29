import React, { useRef, useState } from "react";
import { groupManuscripts } from "@core/translation";
import { useBookStore } from "./useBookStore";
import { useSeriesStore } from "./useSeriesStore";
import { HandbookPanel } from "./HandbookPanel";
import { count, format, translateError, useLocale } from "./i18n";
import { checkForUpdates, isDesktopApp, type UpdateStatus } from "./desktopBridge";
import { UpdateCheckDialog } from "./UpdateCheckDialog";
import { ImportManuscriptCard } from "./ImportManuscriptCard";
import { CodexHomeCard } from "./CodexHomeCard";

export function Home({
  guideOpen,
  onOpenGuide,
  onCloseGuide
}: {
  guideOpen: boolean;
  onOpenGuide: () => void;
  onCloseGuide: () => void;
}) {
  const { summaries, newBook, openBook, deleteBook, setBookSeries, importManuscript, importMarkdownManuscript, error } =
    useBookStore();
  const { summaries: seriesSummaries, createSeries, openSeries } = useSeriesStore();
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const standaloneSummaries = summaries.filter((item) => !item.series_id);
  const filteredSummaries = standaloneSummaries.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));

  function submitNewSeries(event: React.SyntheticEvent) {
    event.preventDefault();
    const trimmed = newSeriesTitle;
    void createSeries(trimmed).then(() => setNewSeriesTitle(""));
  }

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  function runUpdateCheck() {
    setUpdateDialogOpen(true);
    setUpdateChecking(true);
    setUpdateError(null);
    setUpdateStatus(null);
    checkForUpdates()
      .then(setUpdateStatus)
      .catch((err: unknown) => setUpdateError(String(err)))
      .finally(() => setUpdateChecking(false));
  }

  function submitNew(event?: React.SyntheticEvent) {
    event?.preventDefault();
    void newBook(title).then(() => setTitle(""));
  }

  return (
    <div className="home">
      <header className="home-brand">
        <img className="home-logo home-logo-light" src="/logo.svg" alt="kaampi Write" />
        <img className="home-logo home-logo-dark" src="/logo-dark.svg" alt="kaampi Write" />
        <div className="home-heading-row">
          <h1>
            {m.home.headline}
            <br />
            {m.home.truth}
          </h1>
          {isDesktopApp() ? (
            <div className="home-heading-actions">
              <button type="button" className="home-guide-button" onClick={runUpdateCheck} disabled={updateChecking}>
                {updateChecking ? m.home.desktopCheckingUpdate : m.home.desktopCheckUpdate}
              </button>
            </div>
          ) : null}
        </div>
        <p className="lede">{m.home.lede}</p>
      </header>

      <section className="home-start" aria-label={m.home.startHeading}>
        <h2 className="settings-heading home-heading-lg">{m.home.startHeading}</h2>
        <div className="home-start-cards">
          <div className="home-start-card">
            <span className="home-start-card-copy">
              <strong>{m.home.newManuscript}</strong>
              <span>{m.home.newManuscriptCardLede}</span>
            </span>
            <form className="home-start-card-form" action="#" onSubmit={submitNew}>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={m.home.titlePlaceholder}
                autoComplete="off"
                aria-label={m.home.newManuscript}
              />
              <button type="submit" className="home-start-card-action">
                {m.home.open} →
              </button>
            </form>
          </div>
          <button type="button" className="home-start-card" onClick={() => fileRef.current?.click()}>
            <span className="home-start-card-copy">
              <strong>{m.home.importBackup}</strong>
              <span>{m.home.importBackupCardLede}</span>
              <span className="home-start-card-action">{m.home.importBackupCardAction} →</span>
            </span>
          </button>
          <button type="button" className="home-start-card" onClick={() => setImportOpen(true)}>
            <span className="home-start-card-copy">
              <strong>{m.home.importManuscriptButton}</strong>
              <span>{m.home.importManuscriptCardLede}</span>
              <span className="home-start-card-action">{m.home.importManuscriptCardAction} →</span>
            </span>
          </button>
          <button type="button" className="home-start-card" onClick={onOpenGuide}>
            <span className="home-start-card-copy">
              <strong>{m.guide.openFromHome}</strong>
              <span>{m.home.guideCardLede}</span>
              <span className="home-start-card-action">{m.home.guideCardAction} →</span>
            </span>
          </button>
          {isDesktopApp() ? <CodexHomeCard /> : null}
        </div>
        <input
          ref={fileRef}
          className="setup-file"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void importManuscript(file);
          }}
        />
      </section>

      {updateDialogOpen ? (
        <UpdateCheckDialog
          checking={updateChecking}
          status={updateStatus}
          error={updateError}
          onClose={() => setUpdateDialogOpen(false)}
        />
      ) : null}

      {error ? (
        <p className="banner home-banner" role="status">
          {translateError(error, m)}
        </p>
      ) : null}

      <section className="series-shelf" aria-label={m.series.heading}>
        <div className="home-start-card-copy series-shelf-head">
          <h2 className="settings-heading home-heading-lg">{m.series.heading}</h2>
          <form className="home-start-card-form series-new-form" onSubmit={submitNewSeries}>
            <input
              value={newSeriesTitle}
              onChange={(event) => setNewSeriesTitle(event.target.value)}
              placeholder={m.series.newSeriesTitlePlaceholder}
              autoComplete="off"
              aria-label={m.series.newSeries}
            />
            <button type="submit" className="home-start-card-action">
              {m.series.create}
            </button>
          </form>
        </div>

        {seriesSummaries.length > 0 ? (
          <ul className="series-list">
            {seriesSummaries.map((seriesSummary) => (
              <li key={seriesSummary.id} className="series-card">
                <div className="series-card-head">
                  <div>
                    <strong>{seriesSummary.title}</strong>
                    <span className="quiet">
                      {count(seriesSummary.bookCount, m.series.books)}
                      <span className="dot">·</span>
                      {count(seriesSummary.factCount, m.series.facts)}
                    </span>
                  </div>
                  <button type="button" className="home-start-card-action" onClick={() => void openSeries(seriesSummary.id)}>
                    {m.series.open}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="book-shelf" aria-label={m.home.shelf}>
        <h2 className="settings-heading home-heading-lg">
          {seriesSummaries.length > 0 ? m.series.standaloneHeading : m.home.shelfHeading}
        </h2>

        {standaloneSummaries.length === 0 ? (
          seriesSummaries.length === 0 ? <p className="empty-shelf">{m.home.emptyShelf}</p> : null
        ) : (
          <>
            <input
              type="search"
              className="book-shelf-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.home.searchPlaceholder}
              aria-label={m.home.searchPlaceholder}
            />
            {filteredSummaries.length === 0 ? <p className="empty-shelf">{m.home.noSearchResults}</p> : null}
          </>
        )}

        {filteredSummaries.length > 0 ? (
          <ul>
            {groupManuscripts(filteredSummaries).map((group) => {
              const [primary, ...siblings] = group;
              if (!primary) return null;
              return (
                <li key={primary.id} className="book-shelf-group">
                  <div className="book-shelf-row">
                    <button type="button" className="book-card" onClick={() => void openBook(primary.id)}>
                      <strong>{primary.title}</strong>
                      <span>
                        {primary.prose_language ? <span className="book-language-tag">{primary.prose_language}</span> : null}
                        {count(primary.chapterCount, m.home.chapters)}
                        <span className="dot">·</span>
                        {count(primary.factCount, m.home.facts)}
                      </span>
                    </button>
                    <div className="book-shelf-row-actions">
                      {seriesSummaries.length > 0 ? (
                        <select
                          className="book-shelf-series-assign"
                          aria-label={m.series.assignLabel}
                          value=""
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value) void setBookSeries(primary.id, value);
                          }}
                        >
                          <option value="">{m.series.assignNone}</option>
                          {seriesSummaries.map((seriesSummary) => (
                            <option key={seriesSummary.id} value={seriesSummary.id}>
                              {seriesSummary.title}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      <button
                        type="button"
                        className="text-button danger"
                        onClick={() => {
                          if (window.confirm(format(m.home.deleteConfirm, { title: primary.title }))) {
                            void deleteBook(primary.id);
                          }
                        }}
                      >
                        {m.home.delete}
                      </button>
                    </div>
                  </div>
                  {siblings.length > 0 ? (
                    <ul className="book-shelf-siblings">
                      {siblings.map((sibling) => (
                        <li key={sibling.id}>
                          <button type="button" className="book-card book-card-sibling" onClick={() => void openBook(sibling.id)}>
                            <span className="book-language-tag">{sibling.prose_language || m.home.languageVersionUnset}</span>
                            <span>{count(sibling.chapterCount, m.home.chapters)}</span>
                          </button>
                          <button
                            type="button"
                            className="text-button danger"
                            onClick={() => {
                              if (window.confirm(format(m.home.deleteConfirm, { title: sibling.title }))) {
                                void deleteBook(sibling.id);
                              }
                            }}
                          >
                            {m.home.delete}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {guideOpen ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseGuide();
          }}
        >
          <div className="edit-card guide-overlay-card">
            <div className="edit-actions guide-overlay-close">
              <button type="button" className="text-button" onClick={onCloseGuide}>
                {m.guide.closeAction}
              </button>
            </div>
            <HandbookPanel />
          </div>
        </div>
      ) : null}

      {importOpen ? (
        <ImportManuscriptCard
          onClose={() => setImportOpen(false)}
          onImport={(importedTitle, chapters) => {
            void importMarkdownManuscript(importedTitle, chapters);
            setImportOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
