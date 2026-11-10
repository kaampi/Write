import { useState } from "react";
import { useBookStore } from "./useBookStore";
import { useLocale } from "./i18n";

/**
 * Shown for as long as the newest text is not on disk because a write was
 * rejected (BookSaveQueue's "failed" state). Mounted in App.tsx's Shell,
 * above both the Editor and Home, because the failure can outlive the
 * screen it happened on — closing a manuscript whose last save failed lands
 * on Home with that manuscript still unwritten.
 *
 * The queue keeps retrying on its own; the two buttons are for an author
 * who doesn't want to wait (Try again) or wants the text safely out of the
 * app first (Download a backup).
 */
export function SaveFailedBanner() {
  const { saveState, retrySave, downloadUnsavedBackup } = useBookStore();
  const { messages: m } = useLocale();
  const [downloading, setDownloading] = useState(false);
  if (saveState !== "failed") return null;
  return (
    <p className="banner save-failed-banner" role="alert">
      <span>{m.app.saveFailed}</span>
      <button type="button" className="text-button" onClick={retrySave}>
        {m.app.saveRetry}
      </button>
      <button
        type="button"
        className="text-button"
        disabled={downloading}
        onClick={() => {
          setDownloading(true);
          void downloadUnsavedBackup()
            .catch(() => {})
            .finally(() => setDownloading(false));
        }}
      >
        {m.app.saveDownloadBackup}
      </button>
    </p>
  );
}
