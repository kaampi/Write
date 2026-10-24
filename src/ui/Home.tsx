import React, { useEffect, useRef, useState } from "react";
import { groupManuscripts } from "@core/translation";
import { DEFAULT_OPENAI_COMPATIBLE_BASE_URL } from "@llm/provider";
import { DEFAULT_OLLAMA_BASE_URL } from "@llm/ollama";
import { useBookStore } from "./useBookStore";
import { HandbookPanel } from "./HandbookPanel";
import { ModelSelect } from "./SettingsPanel";
import { count, format, translateError, useLocale } from "./i18n";
import {
  checkForUpdates,
  detectGpuSuggestion,
  isDesktopApp,
  openOllamaDownloadPage,
  type GpuSuggestion,
  type UpdateStatus
} from "./desktopBridge";
import { UpdateCheckDialog } from "./UpdateCheckDialog";
import { ImportManuscriptCard } from "./ImportManuscriptCard";

const GPU_TIER_KEY = {
  "3b": "desktopGpuTier3b",
  "7b": "desktopGpuTier7b",
  "14b": "desktopGpuTier14b",
  "30b": "desktopGpuTier30b",
  "70b": "desktopGpuTier70b"
} as const;

export function Home({
  guideOpen,
  onOpenGuide,
  onCloseGuide
}: {
  guideOpen: boolean;
  onOpenGuide: () => void;
  onCloseGuide: () => void;
}) {
  const {
    summaries,
    newBook,
    openBook,
    deleteBook,
    importManuscript,
    importMarkdownManuscript,
    error,
    engine,
    baseUrl,
    models,
    model,
    reviewModel,
    translateModel,
    ollamaError,
    setEngine,
    setBaseUrl,
    setModel,
    setReviewModel,
    setTranslateModel
  } = useBookStore();
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const filteredSummaries = summaries.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));

  // Engine/model rarely changes once it works — no reason for the controls
  // to sit open and take up space every visit. null means "no explicit
  // choice yet": default to open while there's nothing connected or
  // something's wrong, collapsed once it's working, same as any other
  // status the author doesn't need to keep looking at. A manual toggle
  // always wins over that default for the rest of the session.
  const [connectOpen, setConnectOpen] = useState<boolean | null>(null);
  const connected = models.length > 0 && !ollamaError;
  const isConnectOpen = connectOpen ?? !connected;

  // Only the standalone desktop app can reach the OS (open a browser tab,
  // read GPU memory) — a plain browser tab has neither capability, so this
  // whole block stays invisible there.
  const [gpuSuggestion, setGpuSuggestion] = useState<GpuSuggestion | null>(null);
  useEffect(() => {
    if (!isDesktopApp()) return;
    let cancelled = false;
    void detectGpuSuggestion().then((result) => {
      if (!cancelled) setGpuSuggestion(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
        <img className="home-logo home-logo-light" src="/logo.png" alt="StoryBook AI" />
        <img className="home-logo home-logo-dark" src="/logo-dark.png" alt="StoryBook AI" />
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

      {/*
        A tester's feedback: "Connect a local AI" (in the Guide/Handbook)
        only ever opened more explanatory text, never actual connection
        setup — and Settings, where the real Engine/model controls live,
        was only reachable after creating a manuscript. Engine/baseUrl/
        model are already global (localStorage-backed, not per-book), so
        the real controls belong right here too, with nothing to create
        first.
      */}
      <section className="home-connect" aria-label={m.guide.connectAiButton}>
        <button
          type="button"
          className="home-connect-toggle"
          aria-expanded={isConnectOpen}
          onClick={() => setConnectOpen(!isConnectOpen)}
        >
          <span className="chevron" aria-hidden="true">
            {isConnectOpen ? "▾" : "▸"}
          </span>
          <h2 className="settings-heading home-heading-lg">{m.guide.connectAiButton}</h2>
        </button>
        <p className={ollamaError ? "banner home-banner" : "quiet"} role={ollamaError ? "status" : undefined}>
          {ollamaError ? translateError(ollamaError, m) : models.length > 0 ? count(models.length, m.home.connectFound) : m.home.connectNotFound}
        </p>
        {isDesktopApp() && !connected ? (
          <div className="home-connect-desktop">
            <button type="button" className="home-guide-button" onClick={() => void openOllamaDownloadPage()}>
              {m.home.desktopInstallOllama}
            </button>
            {gpuSuggestion ? (
              <p className="quiet">
                {format(m.home.desktopGpuSuggestion, {
                  gb: Math.round(gpuSuggestion.vramMb / 1024),
                  tier: m.home[GPU_TIER_KEY[gpuSuggestion.tier]]
                })}
              </p>
            ) : null}
          </div>
        ) : null}
        {isConnectOpen ? (
          <>
            <div className="settings-engine">
              <label className="craft-field">
                <span>{m.editor.engineLabel}</span>
                <select
                  value={engine}
                  onChange={(event) => setEngine(event.target.value === "openai-compatible" ? "openai-compatible" : "ollama")}
                  aria-label={m.editor.engineLabel}
                >
                  <option value="ollama">{m.editor.engineOllama}</option>
                  <option value="openai-compatible">{m.editor.engineOpenAiCompatible}</option>
                </select>
              </label>
              <label className="voice-field">
                <span>{m.editor.baseUrlLabel}</span>
                <input
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder={engine === "ollama" ? DEFAULT_OLLAMA_BASE_URL : DEFAULT_OPENAI_COMPATIBLE_BASE_URL}
                  title={m.editor.baseUrlLede}
                  aria-label={m.editor.baseUrlLabel}
                />
              </label>
            </div>
            {models.length > 0 ? (
              <div className="settings-models">
                <ModelSelect label={m.editor.writing} value={model} models={models} emptyLabel={m.editor.noModels} onChange={setModel} />
                <ModelSelect
                  label={m.editor.review}
                  value={reviewModel}
                  models={models}
                  emptyLabel={m.editor.noModels}
                  onChange={setReviewModel}
                />
                <ModelSelect
                  label={m.editor.translateModelLabel}
                  value={translateModel}
                  models={models}
                  emptyLabel={m.editor.noModels}
                  followLabel={m.editor.translateModelFollowWriting}
                  onChange={setTranslateModel}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="book-shelf" aria-label={m.home.shelf}>
        <h2 className="settings-heading home-heading-lg">{m.home.shelfHeading}</h2>

        {summaries.length === 0 ? (
          <p className="empty-shelf">{m.home.emptyShelf}</p>
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
