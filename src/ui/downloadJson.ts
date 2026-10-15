export function downloadJson(filename: string, data: unknown): void {
  downloadText(filename, `${JSON.stringify(data, null, 2)}\n`, "application/json");
}

export function downloadText(filename: string, text: string, type = "text/plain"): void {
  downloadBlob(filename, new Blob([text], { type: `${type};charset=utf-8` }));
}

export function downloadBlob(filename: string, blob: Blob): void {
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

export function downloadBytes(filename: string, bytes: Uint8Array, type: string): void {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  downloadBlob(filename, new Blob([copy.buffer], { type }));
}
