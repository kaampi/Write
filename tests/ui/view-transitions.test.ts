import { describe, expect, it } from "vitest";
import { isWebKitGtk } from "../../src/ui/bookStore/helpers";

/**
 * `isWebKitGtk` is what keeps the Linux desktop build from crashing on every
 * screen change (WebKit #321683): `document.startViewTransition()` must be
 * skipped there, and only there. These are real user-agent strings for every
 * engine the app runs in.
 */
describe("isWebKitGtk", () => {
  it.each([
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/60.5 Safari/605.1.15",
    "Mozilla/5.0 (Ubuntu; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
  ])("recognizes WebKitGTK: %s", (userAgent) => {
    expect(isWebKitGtk(userAgent)).toBe(true);
  });

  it.each([
    [
      "Chromium on Linux",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ],
    [
      "WebView2/Edge on Windows",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
    ],
    [
      "Firefox on Linux",
      "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0"
    ],
    [
      "Safari on macOS",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15"
    ],
    [
      "WKWebView on macOS",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)"
    ],
    [
      "Safari on iOS",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1"
    ],
    ["Node's test environment", "Node.js/26.13.1"],
    ["an empty user agent", ""]
  ])("leaves %s alone", (_label, userAgent) => {
    expect(isWebKitGtk(userAgent)).toBe(false);
  });
});
