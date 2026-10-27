import React, { Component, Fragment, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { coreConnection } from "@persistence/CoreDesktopTransport";
import { flushCoreSharing, flushCoreSnapshots } from "@persistence/CoreSharingRuntime";
import { BookStoreProvider } from "./BookStore";
import { useBookStore } from "./useBookStore";
import { SeriesStoreProvider } from "./SeriesStore";
import { useSeriesStore } from "./useSeriesStore";
import { AppTopBar } from "./AppTopBar";
import { Editor } from "./Editor";
import { Home } from "./Home";
import { SeriesWorkspace } from "./SeriesWorkspace";
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
  const { book } = useBookStore();
  const { seriesId } = useSeriesStore();
  const [homeGuideOpen, setHomeGuideOpen] = useState(false);
  useEffect(() => {
    if (!isTauri()) return;
    const retry = () => { void coreConnection().then(status => status.reachable ? Promise.allSettled([flushCoreSharing(), flushCoreSnapshots()]) : undefined).catch(() => {}); };
    retry();
    const timer = window.setInterval(retry, 30_000);
    window.addEventListener("online", retry);
    return () => { window.clearInterval(timer); window.removeEventListener("online", retry); };
  }, []);
  return (
    <div className="app-shell">
      <AppTopBar onOpenHomeGuide={() => setHomeGuideOpen(true)} />
      {book ? (
        <Editor />
      ) : seriesId ? (
        <SeriesWorkspace />
      ) : (
        <Home
          guideOpen={homeGuideOpen}
          onOpenGuide={() => setHomeGuideOpen(true)}
          onCloseGuide={() => setHomeGuideOpen(false)}
        />
      )}
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
