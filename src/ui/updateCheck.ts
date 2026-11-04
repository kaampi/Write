import { checkForUpdates, isDesktopApp, type UpdateStatus } from "./desktopBridge";

/**
 * App-wide, localStorage-cached update status — same pub-sub shape as
 * mascot.ts, plus a periodic background re-check so the home page's
 * "Check for updates" button can say "Update available" on its own,
 * without the author ever clicking it (Mats, 2026-11-04: "Kan man få så
 * att Check for updates ändras till Update available om det finns en ny
 * version? Att appen kolla efter updates med jämna mellanrum?").
 * startUpdateChecks() is called once from App.tsx's Shell (mounted the
 * whole session, unlike Home, which unmounts while a book or series is
 * open) so the check keeps running in the background either way.
 */
const CACHE_KEY = "storybook-ai.update-status";
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

function readCache(): UpdateStatus | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as UpdateStatus) : null;
  } catch {
    return null;
  }
}

function writeCache(status: UpdateStatus | null): void {
  try {
    if (status) localStorage.setItem(CACHE_KEY, JSON.stringify(status));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* private mode */
  }
}

let cached: UpdateStatus | null = readCache();
let inFlight: Promise<UpdateStatus | null> | null = null;
let intervalId: number | null = null;
const listeners = new Set<(status: UpdateStatus | null) => void>();

export function readUpdateStatus(): UpdateStatus | null {
  return cached;
}

export function subscribeUpdateStatus(listener: (status: UpdateStatus | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setStatus(status: UpdateStatus | null): void {
  cached = status;
  writeCache(status);
  listeners.forEach((listener) => listener(status));
}

/**
 * Runs a real check against GitHub (via the Rust `check_for_updates`
 * command) and updates the shared cache — the single path both the
 * periodic background check and a manual "Check for updates" click go
 * through, so either one refreshes what the button/dialog show. Concurrent
 * callers share one in-flight request rather than firing a second one.
 * Throws on network failure (same contract as desktopBridge's own
 * checkForUpdates) — callers that show the error themselves (the dialog)
 * should catch it; the periodic background call below swallows it instead,
 * since there's no UI to show it to at that point.
 */
export async function runUpdateCheck(): Promise<UpdateStatus | null> {
  if (!isDesktopApp()) return null;
  if (inFlight) return inFlight;
  inFlight = checkForUpdates()
    .then((status) => {
      setStatus(status);
      return status;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/**
 * Starts the background check: once immediately, then every
 * CHECK_INTERVAL_MS. Safe to call more than once (e.g. a remount) — it
 * just restarts the same timer rather than stacking a second one. Returns
 * a stop function; App.tsx's Shell doesn't currently call it (the check
 * should keep running for the app's whole lifetime), but tests/future
 * callers can.
 */
export function startUpdateChecks(): () => void {
  if (!isDesktopApp()) return () => {};
  void runUpdateCheck().catch(() => {
    /* no UI to report to here — the next manual check will surface it */
  });
  if (intervalId !== null) window.clearInterval(intervalId);
  intervalId = window.setInterval(() => {
    void runUpdateCheck().catch(() => {});
  }, CHECK_INTERVAL_MS);
  const id = intervalId;
  return () => {
    window.clearInterval(id);
    if (intervalId === id) intervalId = null;
  };
}
