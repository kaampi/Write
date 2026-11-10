import React, { Component, Fragment, useEffect, type ErrorInfo, type ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { coreConnection } from "@persistence/CoreDesktopTransport";
import { flushCoreSharing, flushCoreSnapshots } from "@persistence/CoreSharingRuntime";
import { BookStoreProvider } from "./BookStore";
import { useBookStore } from "./useBookStore";
import { SeriesStoreProvider } from "./SeriesStore";
import { useSeriesStore } from "./useSeriesStore";
import { AppTopBar } from "./AppTopBar";
import { startUpdateChecks } from "./updateCheck";
import { Editor } from "./Editor";
import { Home } from "./Home";
import { SeriesWorkspace } from "./SeriesWorkspace";
import { HandbookPanel } from "./HandbookPanel";
import { SaveFailedBanner } from "./SaveFailedBanner";
import { LocaleProvider, getMessages } from "./i18n";

class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null; retry: number }> {
  override state: { message: string | null; retry: number } = { message: null, retry: 0 };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  override render() {
    if (this.state.message) {
      const copy = getMessages();
      return (
        <div className="crash">
          <p>{copy.app.crash}</p>
          <pre>{this.state.message}</pre>
          <button type="button" onClick={() => this.setState((s) => ({ message: null, retry: s.retry + 1 }))}>
            {copy.app.tryAgain}
          </button>
        </div>
      );
    }
    return <Fragment key={this.state.retry}>{this.props.children}</Fragment>;
  }
}

function Shell() {
  const { book, handbookOpen, closeHandbook } = useBookStore();
  const { seriesId } = useSeriesStore();
  useEffect(() => {
    if (!isTauri()) return;
    const retry = () => { void coreConnection().then(status => status.reachable ? Promise.allSettled([flushCoreSharing(), flushCoreSnapshots()]) : undefined).catch(() => {}); };
    retry();
    const timer = window.setInterval(retry, 30_000);
    window.addEventListener("online", retry);
    return () => { window.clearInterval(timer); window.removeEventListener("online", retry); };
  }, []);
  // Mounted for the app's whole session (unlike Home, which unmounts while
  // a book or series is open) so the periodic update check keeps running
  // in the background regardless of which screen is open.
  useEffect(() => startUpdateChecks(), []);
  /**
   * Without this, IndexedDB storage counts as "best effort"/evictable, and
   * a browser under extreme disk pressure is allowed to clear it — the
   * manuscript data itself, not just a cache. Unlikely in practice (and
   * the quota itself is already disk-space-bound, not a small fixed
   * limit), but a single cheap, fire-and-forget call at startup is enough
   * to ask for persistent storage; no UI, nothing to wait on, and browsers
   * without the API (or that refuse the request) just keep today's
   * behavior (roadmap-ideas.md #55).
   */
  useEffect(() => {
    void navigator.storage?.persist?.().catch(() => {});
  }, []);
  return (
    <div className="app-shell">
      <AppTopBar />
      <SaveFailedBanner />
      {book ? <Editor /> : seriesId ? <SeriesWorkspace /> : <Home />}
      {handbookOpen ? <HandbookPanel onClose={closeHandbook} /> : null}
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <ErrorBoundary>
        <BookStoreProvider>
          <SeriesStoreProvider>
            <Shell />
          </SeriesStoreProvider>
        </BookStoreProvider>
      </ErrorBoundary>
    </LocaleProvider>
  );
}
