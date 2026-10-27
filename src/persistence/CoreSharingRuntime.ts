import { BookRepository } from "./Repository";
import { SeriesRepository } from "./SeriesRepository";
import { CoreSharingOutbox } from "./CoreSharingOutbox";
import { coreDesktopTransport } from "./CoreDesktopTransport";

/** One queue for the shelf, the connection dialog and background retries. */
export const coreSharingOutbox = new CoreSharingOutbox();

export function flushCoreSharing(): Promise<void> {
  return coreSharingOutbox.flush(new BookRepository(), new SeriesRepository(), coreDesktopTransport);
}
