import { BookRepository } from "./Repository";
import { SeriesRepository } from "./SeriesRepository";
import { CoreSharingOutbox } from "./CoreSharingOutbox";
import { coreDesktopTransport } from "./CoreDesktopTransport";
import { saveCorePrivateBook } from "./CoreDesktopTransport";
import { CoreSyncOutbox, type CoreSyncSink } from "./CoreSyncOutbox";
import type { Book } from "@core/BookSchema";

/** One queue for the shelf, the connection dialog and background retries. */
export const coreSharingOutbox = new CoreSharingOutbox();
export const coreSnapshotOutbox = new CoreSyncOutbox();

async function both(first: Promise<void>, second: Promise<void>): Promise<void> {
  const results = await Promise.allSettled([first, second]);
  const failure = results.find(result => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
}

/** Local saves complete first; neither optional queue prevents the other from recording its change. */
export const coreBookSink: CoreSyncSink = {
  enqueueSave(book: Book) {
    return both(coreSharingOutbox.enqueueSave(book), coreSnapshotOutbox.enqueueAutoSave(book));
  },
  enqueueDelete(id: string) {
    // Keep earlier private versions; deletion stops future automatic checkpoints.
    return both(coreSharingOutbox.enqueueDelete(id), coreSnapshotOutbox.setAutoEnabled(id, false));
  }
};

export function flushCoreSharing(): Promise<void> {
  return coreSharingOutbox.flush(new BookRepository(), new SeriesRepository(), coreDesktopTransport);
}

export function flushCoreSnapshots(): Promise<void> {
  return coreSnapshotOutbox.flush(change => {
    if (change.kind !== "save") throw new Error("Private Core deletion is not supported");
    return saveCorePrivateBook(change.book);
  });
}
