import { localServerFetch } from "@llm/tauriFetch";
import { isDesktopApp, openExternalUrl } from "./desktopBridge";

export const COMPANION_APP_IDS = ["explore", "comic"] as const;
export type CompanionAppId = (typeof COMPANION_APP_IDS)[number];

export const DEFAULT_COMPANION_ADDRESSES: Record<CompanionAppId, string> = {
  explore: "http://localhost:5173/",
  comic: "http://localhost:5176/"
};

export interface CompanionAppMeta {
  name: string;
  repository: string;
  logoLight: string;
  logoDark: string;
}

export const COMPANION_APPS: Record<CompanionAppId, CompanionAppMeta> = {
  explore: {
    name: "kaampi Explore",
    repository: "https://github.com/kaampi/Explore",
    logoLight: "/brand/companions/explore.svg",
    logoDark: "/brand/companions/explore-dark.svg"
  },
  comic: {
    name: "kaampi Comic",
    repository: "https://github.com/kaampi/Comic",
    logoLight: "/brand/companions/comic.svg",
    logoDark: "/brand/companions/comic-dark.svg"
  }
};

/**
 * Each sibling app's own <title>, normalized to [a-z0-9] and lowercased —
 * the same fallback kaampi Explore's own prober (server/localApps.ts) uses
 * for apps with no shared /.well-known/storycore-app.json identity endpoint
 * yet. None of the three apps serve one today, so a title match is the only
 * signal available.
 */
const EXPECTED_TITLE: Record<CompanionAppId, string> = {
  explore: "kaampiexploreyourcreativespace",
  comic: "kaampicomic"
};

export type CompanionAppState = "available" | "unreachable" | "wrong-app" | "unknown";

export interface CompanionAppStatus {
  appId: CompanionAppId;
  address: string;
  state: CompanionAppState;
  checkedAt: number;
}

export function safeAppAddress(value: string): string {
  if (!value.trim()) return "";
  const url = new URL(value.trim());
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Use an HTTP or HTTPS app address without credentials.");
  }
  return url.href;
}

export function isLoopbackAddress(address: string): boolean {
  try {
    const url = new URL(safeAppAddress(address));
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

const PROBE_TIMEOUT_MS = 2000;
const MAX_BODY_CHARS = 8192;

/**
 * Only probes in the desktop app, routed through Tauri's HTTP plugin (Rust,
 * not the webview — bypasses CORS, same as tauriFetch.ts already does for
 * local AI servers). The plain web app has no backend to proxy through the
 * way kaampi Explore's own Vite dev server does for its two companions
 * (server/localApps.ts) — a browser fetch to another app's localhost port
 * from here would itself be blocked by CORS, so it stays "unknown" there:
 * no false negatives, just no live status without a manual check.
 */
export async function checkCompanionApp(appId: CompanionAppId, address: string): Promise<CompanionAppStatus> {
  const checkedAddress = safeAppAddress(address) || DEFAULT_COMPANION_ADDRESSES[appId];
  const base: CompanionAppStatus = { appId, address: checkedAddress, state: "unknown", checkedAt: Date.now() };
  if (!isDesktopApp() || !isLoopbackAddress(checkedAddress)) return base;
  try {
    const response = await localServerFetch()(checkedAddress, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    if (!response.ok) return { ...base, state: "unreachable" };
    const body = (await response.text()).slice(0, MAX_BODY_CHARS);
    const title = body
      .match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/[^a-z0-9]/gi, "")
      .toLowerCase();
    return { ...base, state: title === EXPECTED_TITLE[appId] ? "available" : "wrong-app" };
  } catch {
    return { ...base, state: "unreachable" };
  }
}

const ADDRESS_KEY_PREFIX = "storybook-ai.companion-app-";

export function readCompanionAddress(appId: CompanionAppId): string {
  try {
    return safeAppAddress(localStorage.getItem(ADDRESS_KEY_PREFIX + appId) ?? "") || DEFAULT_COMPANION_ADDRESSES[appId];
  } catch {
    return DEFAULT_COMPANION_ADDRESSES[appId];
  }
}

export function saveCompanionAddress(appId: CompanionAppId, address: string): string {
  const valid = safeAppAddress(address) || DEFAULT_COMPANION_ADDRESSES[appId];
  localStorage.setItem(ADDRESS_KEY_PREFIX + appId, valid);
  return valid;
}

/** The desktop app's webview can't reliably hand off to the OS browser via a plain link — route through the same Rust-side opener already used for Ollama's download page and the changelog. */
export async function openCompanionAddress(address: string): Promise<void> {
  if (isDesktopApp()) {
    await openExternalUrl(address);
  } else {
    window.open(address, "_blank", "noopener,noreferrer");
  }
}
