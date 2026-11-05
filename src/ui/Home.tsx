import React, { useEffect, useState } from "react";
import { groupManuscripts } from "@core/translation";
import { useBookStore } from "./useBookStore";
import { useSeriesStore } from "./useSeriesStore";
import { count, format, translateError, useLocale } from "./i18n";
import { isDesktopApp, type UpdateStatus } from "./desktopBridge";
import { UpdateCheckDialog } from "./UpdateCheckDialog";
import { readUpdateStatus, runUpdateCheck, subscribeUpdateStatus } from "./updateCheck";
import { MascotTip } from "./MascotTip";
import { BookshelfView } from "./BookshelfView";
import { SeriesDetailModal } from "./SeriesDetailModal";
import { applyShelfOrder, readShelfOrder, reorderShelf, subscribeShelfOrder } from "./shelfOrder";
import {
  dismissMascotIntro,
  MASCOT_NAMES,
  readMascot,
  readMascotIntroSeen,
  setMascot,
  subscribeMascot,
  subscribeMascotIntroSeen
} from "./mascot";

export function Home() {
  const { summaries, newBook, openBook, deleteBook, setBookSeries, updateShelfSettings, error, openHandbook } = useBookStore();
  const { summaries: seriesSummaries, createSeries, openSeries, openSeriesPreview } = useSeriesStore();
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [search, setSearch] = useState("");
  const [seriesSearch, setSeriesSearch] = useState("");
  const [shelfMode, setShelfMode] = useState<"list" | "shelf">("shelf");
  const [mascot, setMascotValue] = useState(readMascot);
  useEffect(() => subscribeMascot(setMascotValue), []);
  const [mascotIntroSeen, setMascotIntroSeen] = useState(readMascotIntroSeen);
  useEffect(() => subscribeMascotIntroSeen(() => setMascotIntroSeen(true)), []);
  /**
   * The shelf/list used to exclude any book with a series_id — reaching
   * one meant opening its series and then the Books tab. Mats, 2026-11-04:
   * with every book in a series, that left the shelf looking empty and
   * added two clicks to open any book. Every manuscript shows here now,
   * series or not; `seriesTitleById` below lets a series member still say
   * which series it belongs to (a small tag, not a replacement for the
   * series workspace's own Books list — a book appears in both).
   */
  const filteredSummaries = summaries.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));
  const seriesTitleById = Object.fromEntries(seriesSummaries.map((seriesSummary) => [seriesSummary.id, seriesSummary.title]));
  const filteredSeriesSummaries = seriesSummaries.filter((item) =>
    item.title.toLowerCase().includes(seriesSearch.trim().toLowerCase())
  );

  /**
   * Shared between Shelf view and List view, so a drag in either one keeps
   * both in sync (Mats, 2026-11-04: "Ja båda vyerna") — grouped once here,
   * manual order applied once here, rather than each view doing its own
   * groupManuscripts()+ordering and risking drift between them.
   */
  const [shelfOrder, setShelfOrder] = useState(readShelfOrder);
  useEffect(() => subscribeShelfOrder(setShelfOrder), []);
  const manuscriptGroups = applyShelfOrder(groupManuscripts(filteredSummaries), shelfOrder);
  const manuscriptIds = manuscriptGroups.map((group) => group[0]!.id);
  function dropManuscript(draggedId: string, targetId: string | null) {
    if (draggedId === targetId) return;
    reorderShelf(manuscriptIds, draggedId, targetId);
  }

  function submitNewSeries(event: React.SyntheticEvent) {
    event.preventDefault();
    const trimmed = newSeriesTitle;
    void createSeries(trimmed).then(() => setNewSeriesTitle(""));
  }

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  // The hero banner's button label reflects this shared, periodically
  // refreshed status (updateCheck.ts) rather than only the dialog's own
  // per-click state, so it can say "Update available" on its own — see
  // App.tsx's Shell, which starts the background check for the app's
  // whole session.
  const [sharedUpdateStatus, setSharedUpdateStatus] = useState(readUpdateStatus);
  useEffect(() => subscribeUpdateStatus(setSharedUpdateStatus), []);

  function openUpdateCheck() {
    setUpdateDialogOpen(true);
    setUpdateChecking(true);
    setUpdateError(null);
    setUpdateStatus(null);
    runUpdateCheck()
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
      <header className="home-brand home-hero-banner">
        <img className="home-hero-banner-image" src="/home-hero.jpg" alt="" aria-hidden="true" />
        <div className="home-hero-banner-overlay">
          <h1>
            <strong>{m.home.headline}</strong>
            <br />
            {m.home.truth}
          </h1>
          <p className="lede">{m.home.lede}</p>
          {isDesktopApp() ? (
            <button type="button" className="home-hero-banner-button" onClick={openUpdateCheck} disabled={updateChecking}>
              {updateChecking
                ? m.home.desktopCheckingUpdate
                : sharedUpdateStatus?.updateAvailable
                  ? m.home.desktopUpdateAvailableShort
                  : m.home.desktopCheckUpdate}
            </button>
          ) : null}
        </div>
      </header>

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

      <section className="book-shelf" aria-label={m.home.shelf}>
        {/* "Manuscript_topp" (Mats, 2026-11-04): heading + List/Shelf toggle + search, one row — search to the right of the Shelf view button, not on its own row below like before. */}
        <div className="manuscript-topp">
          <h2 className="settings-heading home-heading-lg">{m.home.shelfHeading}</h2>
          {summaries.length > 0 ? (
            <div className="manuscript-topp-controls">
              <span className="shelf-view-toggle" role="group">
                <button
                  type="button"
                  className={shelfMode === "list" ? "is-active" : ""}
                  aria-pressed={shelfMode === "list"}
                  onClick={() => setShelfMode("list")}
                >
                  {m.home.listView}
                </button>
                <button
                  type="button"
                  className={shelfMode === "shelf" ? "is-active" : ""}
                  aria-pressed={shelfMode === "shelf"}
                  onClick={() => setShelfMode("shelf")}
                >
                  {m.home.shelfView}
                </button>
              </span>
              <input
                type="search"
                className="manuscript-topp-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={m.home.searchPlaceholder}
                aria-label={m.home.searchPlaceholder}
              />
            </div>
          ) : null}
        </div>

        {/* "Start a new manuscript" now sits under Manuscript_topp, not above it (Mats, 2026-11-04). */}
        <div className="home-start">
          <form className="home-hero-pill" action="#" onSubmit={submitNew}>
            <span className="home-hero-label">{m.home.newManuscript}</span>
            <input
              className="home-hero-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={m.home.titlePlaceholder}
              autoComplete="off"
              aria-label={m.home.newManuscript}
            />
            <button type="submit" className="home-hero-submit" aria-label={m.home.open}>
              <img src="/icons/pill-arrow.svg" alt="" aria-hidden="true" />
            </button>
          </form>
          {mascot !== "none" ? (
            <MascotTip
              key={mascot}
              mascot={mascot}
              name={MASCOT_NAMES[mascot]}
              text={m.home.guideCardLede}
              action={{ label: `${m.home.guideCardAction} →`, onClick: openHandbook }}
              onClose={() => setMascot("none")}
              closeLabel={m.common.close}
              {...(mascot === "kaamilla" && !mascotIntroSeen
                ? { intro: { text: m.home.mascotIntroText, actionLabel: m.home.mascotIntroUnderstood, onDismiss: dismissMascotIntro } }
                : {})}
            />
          ) : null}
        </div>

        {summaries.length === 0 ? (
          seriesSummaries.length === 0 ? <p className="empty-shelf">{m.home.emptyShelf}</p> : null
        ) : filteredSummaries.length === 0 ? (
          <p className="empty-shelf">{m.home.noSearchResults}</p>
        ) : null}

        {filteredSummaries.length > 0 && shelfMode === "shelf" ? (
          <BookshelfView
            groups={manuscriptGroups}
            seriesTitleById={seriesTitleById}
            onOpen={(id) => void openBook(id)}
            onDelete={(id) => void deleteBook(id)}
            onUpdateSettings={(id, patch) => void updateShelfSettings(id, patch)}
            onOpenSeries={(seriesId, bookId) => void openSeries(seriesId, bookId)}
            onReorder={dropManuscript}
          />
        ) : null}

        {filteredSummaries.length > 0 && shelfMode === "list" ? (
          <ul
            className="book-shelf-list"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (event.target !== event.currentTarget) return;
              dropManuscript(event.dataTransfer.getData("text/plain"), null);
            }}
          >
            {manuscriptGroups.map((group) => {
              const [primary, ...siblings] = group;
              if (!primary) return null;
              const primarySeriesTitle = primary.series_id ? seriesTitleById[primary.series_id] : undefined;
              return (
                <li
                  key={primary.id}
                  className="book-shelf-group"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", primary.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    dropManuscript(event.dataTransfer.getData("text/plain"), primary.id);
                  }}
                >
                  <div className="book-shelf-row">
                    <button type="button" className="book-card" onClick={() => void openBook(primary.id)}>
                      <strong>{primary.title}</strong>
                      <span>
                        {primary.prose_language ? <span className="book-language-tag">{primary.prose_language}</span> : null}
                        {primarySeriesTitle ? (
                          <span className="book-language-tag">{format(m.home.seriesTag, { series: primarySeriesTitle })}</span>
                        ) : null}
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

      <section className="series-shelf" aria-label={m.series.heading}>
        {/* Same "_topp" shape as Manuscript_topp: heading + search, one row (no List/Shelf toggle here — Series has no such view to switch). */}
        <div className="series-topp">
          <h2 className="settings-heading home-heading-lg">{m.series.heading}</h2>
          {seriesSummaries.length > 0 ? (
            <input
              type="search"
              className="series-topp-search"
              value={seriesSearch}
              onChange={(event) => setSeriesSearch(event.target.value)}
              placeholder={m.series.searchPlaceholder}
              aria-label={m.series.searchPlaceholder}
            />
          ) : null}
        </div>

        <div className="home-start">
          <form className="home-hero-pill" action="#" onSubmit={submitNewSeries}>
            <span className="home-hero-label">{m.series.newSeries}</span>
            <input
              className="home-hero-input"
              value={newSeriesTitle}
              onChange={(event) => setNewSeriesTitle(event.target.value)}
              placeholder={m.series.newSeriesTitlePlaceholder}
              autoComplete="off"
              aria-label={m.series.newSeries}
            />
            <button type="submit" className="home-hero-submit" aria-label={m.series.create}>
              <img src="/icons/pill-arrow.svg" alt="" aria-hidden="true" />
            </button>
          </form>
        </div>

        {seriesSummaries.length > 0 && filteredSeriesSummaries.length === 0 ? (
          <p className="empty-shelf">{m.series.noSearchResults}</p>
        ) : null}

        {filteredSeriesSummaries.length > 0 ? (
          <ul className="series-list">
            {filteredSeriesSummaries.map((seriesSummary) => (
              <li key={seriesSummary.id} className="series-row">
                <div>
                  <strong>{seriesSummary.title}</strong>
                  <span className="quiet">
                    {count(seriesSummary.bookCount, m.series.books)}
                    <span className="dot">·</span>
                    {count(seriesSummary.factCount, m.series.facts)}
                  </span>
                </div>
                <button type="button" className="home-start-card-action" onClick={() => void openSeriesPreview(seriesSummary.id)}>
                  {m.series.open}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <SeriesDetailModal />

    </div>
  );
}
