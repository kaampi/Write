import { invoke, isTauri } from "@tauri-apps/api/core";
import type { CoreManuscriptPublication } from "./CoreManuscriptPublication";
import type { CoreSharingTransport } from "./CoreSharingOutbox";

export type CoreConnection = { paired: boolean; reachable: boolean };
export type CoreSharedAccess = { projectId: string; exists: boolean; readers: ("sandbox" | "comic")[] };

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

/** The token is only handled transiently during pairing; never persist it in IndexedDB/localStorage. */
export async function pairCore(token: string): Promise<void> {
  if (!isTauri()) throw new Error("Core pairing requires the desktop app");
  await invoke("core_pair", { token });
}
