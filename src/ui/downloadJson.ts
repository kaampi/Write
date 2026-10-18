/**
 * The File System Access API's own types aren't in TypeScript's bundled DOM
 * lib (it's still a Chromium-only proposal, not a standard), so this is the
 * minimal shape `downloadBlob` actually calls — not a full ambient
 * declaration, just enough to call `showSaveFilePicker` and write to the
 * handle it returns.
 */
interface FileSystemWritableStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}
interface FileSystemFileHandleLike {
  createWritable(): Promise<FileSystemWritableStream>;
}
type ShowSaveFilePicker = (options: {
  suggestedName: string;
  types?: { description: string; accept: Record<string, string[]> }[];
}) => Promise<FileSystemFileHandleLike>;

export function downloadJson(filename: string, data: unknown): Promise<void> {
  return downloadText(filename, `${JSON.stringify(data, null, 2)}\n`, "application/json");
}

export function downloadText(filename: string, text: string, type = "text/plain"): Promise<void> {
  return downloadBlob(filename, new Blob([text], { type: `${type};charset=utf-8` }));
}

/**
 * Tries a real native Save As dialog first (the File System Access API's
 * `showSaveFilePicker`, available in every Chromium browser — including
 * Brave — plus the desktop app's WebView2), only falling back to the
 * classic hidden-`<a download>`-plus-synthetic-click trick where that API
 * doesn't exist at all (Firefox, Safari) or throws for a reason other than
 * the user cancelling. A report that choosing "Skapa backup" in Brave did
 * nothing — no dialog, no file, no error — traced back to this file still
 * only using the `<a download>` trick: Brave's download handling can swallow
 * that silently in some configurations, where a real save-dialog call either
 * succeeds outright or fails loudly enough to hit the fallback below.
 *
 * `AbortError` means the user themselves closed the save dialog — that's
 * them declining to save, not a failure, so it returns rather than falling
 * through to a second, unexpected download they never asked for.
 */
export async function downloadBlob(filename: string, blob: Blob): Promise<void> {
  const picker = (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: filename, accept: { [blob.type.split(";")[0] || "application/octet-stream"]: [extensionOf(filename)] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Not supported, blocked by the browser, or some other failure — fall through to the classic download below.
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking the object URL synchronously, right after click(), is safe in
  // Chromium (it captures the blob reference at click time) but not
  // guaranteed everywhere — notably Windows' WebView2, which the desktop
  // app runs on, can still be asynchronously starting the download (e.g.
  // while its own native Save As dialog is open) when the revoke call
  // runs, silently dropping the download with no error shown. A short
  // delay lets the download actually start first; the extra few seconds of
  // memory held by the blob URL cost nothing a user would notice.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot);
}

export function downloadBytes(filename: string, bytes: Uint8Array, type: string): Promise<void> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return downloadBlob(filename, new Blob([copy.buffer], { type }));
}
