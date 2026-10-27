import { BookRepository } from "./Repository";
import { SeriesRepository } from "./SeriesRepository";
import { CoreSharingOutbox } from "./CoreSharingOutbox";
import { coreDesktopTransport } from "./CoreDesktopTransport";
import { saveCorePrivateBook } from "./CoreDesktopTransport";
import { CoreSyncOutbox } from "./CoreSyncOutbox";

/** One queue for the shelf, the connection dialog and background retries. */
export const coreSharingOutbox = new CoreSharingOutbox();
export const coreSnapshotOutbox = new CoreSyncOutbox();

export function flushCoreSharing(): Promise<void> {
  return coreSharingOutbox.flush(new BookRepository(), new SeriesRepository(), coreDesktopTransport);
}

export function flushCoreSnapshots(): Promise<void> {
  return coreSnapshotOutbox.flush(change => {
    if (change.kind !== "save") throw new Error("Private Core deletion is not supported");
    return saveCorePrivateBook(change.book);
  });
}
