import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBlob, downloadBytes, downloadGeneratedBlob, downloadJson } from "../../src/ui/downloadJson";

describe("backup downloads", () => {
  let link: { href: string; download: string; click: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };
  let appendChild: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    link = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    appendChild = vi.fn();
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { createElement: vi.fn(() => link), body: { appendChild } });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:backup");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("calls the native picker immediately with its Window receiver and awaits close", async () => {
    let finish!: () => void;
    const close = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const write = vi.fn();
    const picker = vi.fn(function (this: unknown) {
      if (this !== window) throw new TypeError("Illegal invocation");
      return Promise.resolve({ createWritable: async () => ({ write, close }) });
    });
    vi.stubGlobal("window", { showSaveFilePicker: picker });
    let done = false;
    const pending = downloadJson("backup.json", { title: "My book" }).then((result) => { done = true; return result; });
    expect(picker).toHaveBeenCalledWith({ suggestedName: "backup.json", types: [{ description: "backup.json", accept: { "application/json": [".json"] } }] });
    await vi.waitFor(() => expect(close).toHaveBeenCalled());
    expect(done).toBe(false);
    const blob = write.mock.calls[0]![0] as Blob;
    expect(JSON.parse(await blob.text())).toEqual({ title: "My book" });
    finish();
    expect(await pending).toBe("saved");
    expect(link.click).not.toHaveBeenCalled();
  });

  it("does not start a download when the user cancels the picker", async () => {
    vi.stubGlobal("window", { showSaveFilePicker: vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError")) });
    expect(await downloadJson("backup.json", {})).toBe("cancelled");
    expect(link.click).not.toHaveBeenCalled();
  });

  it.each(["unavailable", "blocked"])("uses ComicBook's download path when the picker is %s", async (state) => {
    if (state === "blocked") vi.stubGlobal("window", { showSaveFilePicker: vi.fn().mockRejectedValue(new DOMException("Blocked", "SecurityError")) });
    expect(await downloadJson("backup.json", {})).toBe("download-started");
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(link.href).toBe("blob:backup");
    expect(link.download).toBe("backup.json");
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.remove).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:backup");
  });

  it.each(["createWritable", "write", "close"])("reports %s failures without silently downloading another copy", async (stage) => {
    const failure = new DOMException("Disk write failed", "AbortError");
    const fail = async () => { throw failure; };
    vi.stubGlobal("window", { showSaveFilePicker: async () => ({
      createWritable: stage === "createWritable" ? fail : async () => ({
        write: stage === "write" ? fail : async () => {},
        close: stage === "close" ? fail : async () => {}
      })
    }) });
    await expect(downloadBlob("backup.json", new Blob(["{}"])) ).rejects.toBe(failure);
    expect(link.click).not.toHaveBeenCalled();
  });

  it("preserves binary exports", async () => {
    const write = vi.fn();
    vi.stubGlobal("window", { showSaveFilePicker: async () => ({ createWritable: async () => ({ write, close: async () => {} }) }) });
    const bytes = new Uint8Array([0, 128, 255]);
    expect(await downloadBytes("book.pdf", bytes, "application/pdf")).toBe("saved");
    const blob = write.mock.calls[0]![0] as Blob;
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(bytes);
  });

  it("opens the picker before starting slow publication work", async () => {
    let choose!: (handle: unknown) => void;
    let generate!: (blob: Blob) => void;
    const write = vi.fn();
    const picker = vi.fn(() => new Promise((resolve) => { choose = resolve; }));
    const create = vi.fn(() => new Promise<Blob>((resolve) => { generate = resolve; }));
    vi.stubGlobal("window", { showSaveFilePicker: picker });
    const pending = downloadGeneratedBlob("book.pdf", "application/pdf", create);
    expect(picker).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
    choose({ createWritable: async () => ({ write, close: async () => {} }) });
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(write).not.toHaveBeenCalled();
    const pdf = new Blob(["%PDF"], { type: "application/pdf" });
    generate(pdf);
    expect(await pending).toBe("saved");
    expect(write).toHaveBeenCalledWith(pdf);
  });

  it("skips publication work when choosing a destination is cancelled", async () => {
    vi.stubGlobal("window", { showSaveFilePicker: vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError")) });
    const create = vi.fn();
    expect(await downloadGeneratedBlob("book.idml", "application/vnd.adobe.indesign-idml-package", create)).toBe("cancelled");
    expect(create).not.toHaveBeenCalled();
    expect(link.click).not.toHaveBeenCalled();
  });

  it("reports generation failures before opening a writable file", async () => {
    const createWritable = vi.fn();
    vi.stubGlobal("window", { showSaveFilePicker: async () => ({ createWritable }) });
    const error = new Error("Font or PDF generation failed");
    await expect(downloadGeneratedBlob("book.pdf", "application/pdf", async () => { throw error; })).rejects.toBe(error);
    expect(createWritable).not.toHaveBeenCalled();
    expect(link.click).not.toHaveBeenCalled();
  });

  it("downloads a generated publication when the native picker is unavailable", async () => {
    const blob = new Blob(["publication"]);
    expect(await downloadGeneratedBlob("book.epub", "application/epub+zip", async () => blob)).toBe("download-started");
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(link.download).toBe("book.epub");
    expect(link.click).toHaveBeenCalledOnce();
  });
});
