import { useEffect, useRef, useState } from "react";
import { useBookStore } from "./useBookStore";
import { LocaleSelect } from "./LocaleSelect";
import { ThemeToggle } from "./ThemeToggle";
import { useLocale } from "./i18n";
import { CoreConnectionDialog } from "./CoreConnectionDialog";
import { AppSettingsDialog } from "./AppSettingsDialog";
import { AppSwitcher } from "./AppSwitcher";

const RECENT_LIMIT = 10;

export function AppTopBar({ onOpenHomeGuide }: { onOpenHomeGuide: () => void }) {
  const store = useBookStore();
  const { messages: m } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [coreOpen, setCoreOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const recent = store.summaries.slice(0, RECENT_LIMIT);
  const hasMore = store.summaries.length > RECENT_LIMIT;

  return (
    <header className="app-top-bar">
      <button type="button" className="app-top-logo-button" onClick={store.closeBook} aria-label={m.appBar.goHome}>
        <img className="app-top-logo app-top-logo-light" src="/logo.svg" alt="kaampi Write" />
        <img className="app-top-logo app-top-logo-dark" src="/logo-dark.svg" alt="kaampi Write" />
      </button>

      <div className="app-top-menu" ref={menuRef}>
        <button
          type="button"
          className={menuOpen ? "text-button app-top-menu-trigger is-on" : "text-button app-top-menu-trigger"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {m.appBar.nav}
        </button>
        {menuOpen ? (
          <div className="app-top-menu-panel" role="menu">
            <button
              type="button"
              role="menuitem"
              className="app-top-menu-item"
              onClick={() => {
                setMenuOpen(false);
                store.closeBook();
              }}
            >
              {m.appBar.newManuscript}
            </button>
            {recent.length > 0 ? (
              <>
                <div className="app-top-menu-divider" />
                {recent.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className="app-top-menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      void store.openBook(item.id);
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </>
            ) : null}
            {hasMore ? (
              <>
                <div className="app-top-menu-divider" />
                <button
                  type="button"
                  role="menuitem"
                  className="app-top-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    store.closeBook();
                  }}
                >
                  {m.appBar.viewAll}
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="text-button"
        onClick={() => {
          if (store.book) store.showHandbook();
          else onOpenHomeGuide();
        }}
      >
        {m.guide.nav}
      </button>

      <button type="button" className="text-button" onClick={() => setSettingsOpen(true)}>
        {m.editor.appSettings}
      </button>

      <AppSwitcher />

      <div className="app-top-chrome">
        {store.book ? (
          <button type="button" className="text-button" onClick={() => setCoreOpen(true)}>
            {m.editor.codexNav}
          </button>
        ) : null}
        <LocaleSelect />
        <ThemeToggle />
      </div>
      {coreOpen && store.book ? <CoreConnectionDialog key={store.book.id} currentBook={store.book} bookId={store.book.id} onCheckpoint={store.checkpointBook} onRestore={store.restoreCoreRevision} onClose={() => setCoreOpen(false)} /> : null}
      {settingsOpen ? (
        <AppSettingsDialog
          models={store.models}
          model={store.model}
          reviewModel={store.reviewModel}
          translateModel={store.translateModel}
          engine={store.engine}
          baseUrl={store.baseUrl}
          contextWindow={store.contextWindow}
          writingPrimer={store.writingPrimer}
          historyLimit={store.historyLimit}
          ollamaError={store.ollamaError}
          onModel={store.setModel}
          onReviewModel={store.setReviewModel}
          onTranslateModel={store.setTranslateModel}
          onEngine={store.setEngine}
          onBaseUrl={store.setBaseUrl}
          onContextWindow={store.setContextWindow}
          onSuggestContextWindow={store.suggestContextWindow}
          onPrimer={store.setWritingPrimer}
          onResetPrimer={store.resetWritingPrimer}
          onHistoryLimit={store.setHistoryLimit}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </header>
  );
}
