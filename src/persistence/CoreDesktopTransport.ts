import { invoke, isTauri } from "@tauri-apps/api/core";
import type { CoreManuscriptPublication } from "./CoreManuscriptPublication";
import { parseBook, type Book } from "@core/BookSchema";
import type { CoreBookRevision } from "@core/coreRevisionRestore";
import type { CoreSharingTransport } from "./CoreSharingOutbox";

export type CoreConnection = { paired: boolean; reachable: boolean };
export type CoreSharedAccess = { projectId: string; exists: boolean; readers: ("sandbox" | "comic")[] };
export type CorePrivateVersions = {
  workspace: { id: string; owner_app: "storybook"; kind: "private-snapshot"; project_id: string } | null;
  revisions: { id: string; workspace_id: string; number: number; created_at: string; deleted: boolean }[];
};

/** Credentials stay in the native bridge; the webview only sends the filtered publication. */
export const coreDesktopTransport: CoreSharingTransport = {
  async publish(publication: CoreManuscriptPublication) {
    if (!isTauri()) throw new Error("Core desktop connection is unavailable in this browser");
    await invoke("core_publish_shared", { publication });
  },
  async revoke(bookId: string) {
    if (!isTauri()) throw new Error("Core desktop connection is unavailable in this browser");
    await invoke("core_revoke_shared", { projectId: bookId });
  }
};

export async function coreConnection(): Promise<CoreConnection> {
  if (!isTauri()) return { paired: false, reachable: false };
  return invoke<CoreConnection>("core_connection");
}

export async function coreSharedAccess(projectId: string): Promise<CoreSharedAccess> {
  if (!isTauri()) throw new Error("Core sharing access requires the desktop app");
  const value = await invoke<CoreSharedAccess>("core_shared_access", { projectId });
  if (value.projectId !== projectId || typeof value.exists !== "boolean" || !Array.isArray(value.readers) ||
      value.readers.some(reader => reader !== "sandbox" && reader !== "comic")) {
    throw new Error("Invalid Core sharing access response");
  }
  return value;
}

export async function saveCorePrivateBook(book: Book): Promise<void> {
  if (!isTauri()) throw new Error("Core private snapshots require the desktop app");
  await invoke("core_save_private", { book: parseBook(book) });
}

export async function corePrivateVersions(projectId: string): Promise<CorePrivateVersions> {
  if (!isTauri()) throw new Error("Core versions require the desktop app");
  const value = await invoke<CorePrivateVersions>("core_private_versions", { projectId });
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
  const value = await invoke<CoreBookRevision["revision"]>("core_private_revision", { revisionId });
  if (!value || value.id !== revisionId || typeof value.workspace_id !== "string" || typeof value.deleted !== "boolean") {
    throw new Error("Invalid Core revision response");
  }
  return value;
}

/** The token is only handled transiently during pairing; never persist it in IndexedDB/localStorage. */
export async function pairCore(token: string): Promise<void> {
  if (!isTauri()) throw new Error("Core pairing requires the desktop app");
  await invoke("core_pair", { token });
}
