import { invoke, isTauri } from "@tauri-apps/api/core";
import type { CoreManuscriptPublication } from "./CoreManuscriptPublication";
import { parseBook, type Book } from "@core/BookSchema";
import type { CoreBookRevision } from "@core/coreRevisionRestore";
import type { CoreSharingTransport } from "./CoreSharingOutbox";

const CORE_URL_KEY = "storybook-ai.core-url";

/**
 * Codex over LAN (roadmap-ideas.md #56's narrowed first step): empty means
 * "this machine's own Codex", kaampi Write's behavior since before this
 * setting existed. A non-empty value points every call below at a Codex
 * instance on another machine instead — core_bridge.rs validates and
 * resolves it on the Rust side (resolve_core_url), this is just storage.
 */
export function getCoreUrl(): string {
  return localStorage.getItem(CORE_URL_KEY) ?? "";
}

export function setCoreUrl(url: string): void {
  const trimmed = url.trim();
  if (trimmed) localStorage.setItem(CORE_URL_KEY, trimmed);
  else localStorage.removeItem(CORE_URL_KEY);
}

export type CoreConnection = { paired: boolean; reachable: boolean };
export type CoreSharedAccess = { projectId: string; exists: boolean; readers: ("sandbox" | "comic")[] };
export type CorePrivateVersions = {
  workspace: { id: string; owner_app: "storybook"; kind: "private-snapshot"; project_id: string } | null;
  revisions: { id: string; workspace_id: string; number: number; created_at: string; deleted: boolean }[];
};
export type CorePrivateManuscript = { projectId: string; title: string; revision: number; updatedAt: string };

/** Credentials stay in the native bridge; the webview only sends the filtered publication. */
export const coreDesktopTransport: CoreSharingTransport = {
  async publish(publication: CoreManuscriptPublication) {
    if (!isTauri()) throw new Error("Core desktop connection is unavailable in this browser");
    await invoke("core_publish_shared", { publication, coreUrl: getCoreUrl() });
  },
  async revoke(bookId: string) {
    if (!isTauri()) throw new Error("Core desktop connection is unavailable in this browser");
    await invoke("core_revoke_shared", { projectId: bookId, coreUrl: getCoreUrl() });
  }
};

export async function coreConnection(): Promise<CoreConnection> {
  if (!isTauri()) return { paired: false, reachable: false };
  return invoke<CoreConnection>("core_connection", { coreUrl: getCoreUrl() });
}

export async function coreSharedAccess(projectId: string): Promise<CoreSharedAccess> {
  if (!isTauri()) throw new Error("Core sharing access requires the desktop app");
  const value = await invoke<CoreSharedAccess>("core_shared_access", { projectId, coreUrl: getCoreUrl() });
  if (value.projectId !== projectId || typeof value.exists !== "boolean" || !Array.isArray(value.readers) ||
      value.readers.some(reader => reader !== "sandbox" && reader !== "comic")) {
    throw new Error("Invalid Core sharing access response");
  }
  return value;
}

export async function saveCorePrivateBook(book: Book): Promise<void> {
  if (!isTauri()) throw new Error("Core private snapshots require the desktop app");
  await invoke("core_save_private", { book: parseBook(book), coreUrl: getCoreUrl() });
}

/**
 * "Import Codex book" on Home (Mats, 2026-10-31): a picker for a machine
 * that doesn't have the manuscript locally at all, so unlike
 * corePrivateVersions below there's no project_id to ask about yet.
 */
export async function corePrivateManuscripts(): Promise<CorePrivateManuscript[]> {
  if (!isTauri()) throw new Error("Core private manuscripts require the desktop app");
  const value = await invoke<CorePrivateManuscript[]>("core_private_manuscripts", { coreUrl: getCoreUrl() });
  if (
    !Array.isArray(value) ||
    value.some(
      (entry) =>
        !entry ||
        typeof entry.projectId !== "string" ||
        typeof entry.title !== "string" ||
        !Number.isSafeInteger(entry.revision) ||
        typeof entry.updatedAt !== "string"
    )
  ) {
    throw new Error("Invalid Core manuscript list response");
  }
  return value;
}

export async function corePrivateVersions(projectId: string): Promise<CorePrivateVersions> {
  if (!isTauri()) throw new Error("Core versions require the desktop app");
  const value = await invoke<CorePrivateVersions>("core_private_versions", { projectId, coreUrl: getCoreUrl() });
  if (!value || !Array.isArray(value.revisions) ||
      (value.workspace && (value.workspace.kind !== "private-snapshot" || value.workspace.owner_app !== "storybook" || value.workspace.project_id !== projectId)) ||
      value.revisions.some(rev => typeof rev.id !== "string" || !Number.isSafeInteger(rev.number) || rev.workspace_id !== value.workspace?.id)) {
    throw new Error("Invalid Core version response");
  }
  return value;
}

/** The owner-only revision body is validated by prepareCoreBookRestore before display or import. */
export async function corePrivateRevision(revisionId: string): Promise<CoreBookRevision["revision"]> {
  if (!isTauri()) throw new Error("Core versions require the desktop app");
  const value = await invoke<CoreBookRevision["revision"]>("core_private_revision", { revisionId, coreUrl: getCoreUrl() });
  if (!value || value.id !== revisionId || typeof value.workspace_id !== "string" || typeof value.deleted !== "boolean") {
    throw new Error("Invalid Core revision response");
  }
  return value;
}

/** The token is only handled transiently during pairing; never persist it in IndexedDB/localStorage. */
export async function pairCore(token: string): Promise<void> {
  if (!isTauri()) throw new Error("Core pairing requires the desktop app");
  await invoke("core_pair", { token, coreUrl: getCoreUrl() });
}

/** Tries to pair from a freshly installed Core's own first-run file (same machine, no key to copy). Resolves to false, never throws, when there's nothing to claim. */
export async function coreAutoClaim(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    await invoke("core_auto_claim");
    return true;
  } catch {
    return false;
  }
}
