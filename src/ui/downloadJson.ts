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

export type DownloadResult = "saved" | "download-started" | "cancelled";

export function downloadJson(filename: string, data: unknown): Promise<DownloadResult> {
  return downloadText(filename, `${JSON.stringify(data, null, 2)}\n`, "application/json");
}

export function downloadText(filename: string, text: string, type = "text/plain"): Promise<DownloadResult> {
  return downloadBlob(filename, new Blob([text], { type: `${type};charset=utf-8` }));
}

/**
 * Open the native picker during the click/submit event when available.
 * Brave can disable this API, so retain the regular browser download path
 * used by ComicBook AI. That path follows the browser's download settings;
 * it cannot force a Save As dialog or confirm that the file reached disk.
 * Only picker cancellation is treated as cancellation. Write/close errors
 * must reach the caller rather than silently starting another download.
 */
export function downloadBlob(filename: string, blob: Blob): Promise<DownloadResult> {
  return downloadGeneratedBlob(filename, blob.type, () => blob);
}

/** Choose the destination before async font loading or PDF/IDML generation
 * can consume the click's transient user activation. Cancellation skips work. */
export async function downloadGeneratedBlob(
  filename: string,
  type: string,
  createBlob: () => Blob | Promise<Blob>
): Promise<DownloadResult> {
  const picker = (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker;
  if (typeof picker === "function") {
    let handle: FileSystemFileHandleLike | undefined;
    try {
      // Web API methods require their Window receiver (otherwise Illegal invocation).
      handle = await picker.call(window, {
        suggestedName: filename,
        types: [{ description: filename, accept: { [type.split(";")[0] || "application/octet-stream"]: [extensionOf(filename)] } }]
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Not supported, blocked by the browser, or some other failure — fall through to the classic download below.
    }
    if (handle) {
      const blob = await createBlob();
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "saved";
    }
  }
  const generated = createBlob();
  // Keep synchronous JSON/text downloads in the original click event.
  const blob = generated instanceof Blob ? generated : await generated;
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
  return "download-started";
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot);
}

export function downloadBytes(filename: string, bytes: Uint8Array, type: string): Promise<DownloadResult> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return downloadBlob(filename, new Blob([copy.buffer], { type }));
}
