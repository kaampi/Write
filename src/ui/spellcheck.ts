/**
 * The desktop app's spell check is the webview engine's own native
 * underlining (WebView2/Chromium on Windows, WKWebView on macOS,
 * WebKitGTK on Linux) — kaampi Write just sets the standard HTML
 * `spellcheck` attribute on its editable prose surfaces and the OS/
 * browser does the rest, language included. There is no way to offer a
 * language picker here: the webview only accepts a `lang` hint, and
 * actually honoring it depends on a dictionary already being installed
 * at the OS level, which this app has no way to guarantee or bundle.
 * This is just an on/off switch for that native behavior (Mats,
 * 2026-11-05: "Man borde kunna slå av dessa... Om den alls ska vara
 * kvar" — decided: toggle only, no language selector).
 *
 * Same localStorage-backed pub-sub shape as mascot.ts/aiFreeMode.ts.
 * Defaults to on (true) — the behavior every version before this one
 * already had, unannounced.
 */
const SPELLCHECK_KEY = "storybook-ai.spellcheck-enabled";

export function readSpellcheckEnabled(): boolean {
  try {
    const stored = localStorage.getItem(SPELLCHECK_KEY);
    return stored === null ? true : stored === "1";
  } catch {
    return true;
  }
}

const listeners = new Set<(enabled: boolean) => void>();

export function setSpellcheckEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SPELLCHECK_KEY, enabled ? "1" : "0");
  } catch {
    /* private mode */
  }
  listeners.forEach((listener) => listener(enabled));
}

export function subscribeSpellcheckEnabled(listener: (enabled: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
