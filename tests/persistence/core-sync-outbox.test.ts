import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { BookRepository } from "@persistence/Repository";
import { CoreSyncOutbox } from "@persistence/CoreSyncOutbox";

describe("opt-in Core sync queue", () => {
  afterEach(() => {
    indexedDB.deleteDatabase("storybook-ai");
    indexedDB.deleteDatabase("storybook-core-outbox");
  });

  it("keeps local saves usable when Core is offline and retries the latest state", async () => {
    const outbox = new CoreSyncOutbox(indexedDB);
    const repo = new BookRepository(indexedDB, outbox);
    let book = createBook("Draft");
    await repo.save(book);
    book = updateChapter(book, book.chapters[0]!.id, { prose: "A revised opening." });
    await repo.save(book);
    await expect(outbox.flush(async () => { throw new Error("Core offline"); })).rejects.toThrow("Core offline");
    expect((await repo.get(book.id)).chapters[0]?.prose).toBe("A revised opening.");
    expect(await outbox.pending()).toHaveLength(1);

    const sent: string[] = [];
    await outbox.flush(async change => {
      if (change.kind === "save") sent.push(change.book.chapters[0]!.prose);
    });
    expect(sent).toEqual(["A revised opening."]);
    expect(await outbox.pending()).toEqual([]);
  });

  it("does not discard a newer save made while an older change is in flight", async () => {
    const outbox = new CoreSyncOutbox(indexedDB);
    const repo = new BookRepository(indexedDB, outbox);
    let book = createBook("Changing draft");
    await repo.save(book);
    const sent: string[] = [];
    await outbox.flush(async change => {
      if (change.kind !== "save") return;
      sent.push(change.book.chapters[0]!.prose);
      if (sent.length === 1) {
        book = updateChapter(book, book.chapters[0]!.id, { prose: "Newer local edit" });
        await repo.save(book);
      }
    });
    expect(sent).toEqual(["", "Newer local edit"]);
    expect(await outbox.pending()).toEqual([]);
  });

  it("queues a deletion and never fails the local write on a queue error", async () => {
    const errors: unknown[] = [];
    const repo = new BookRepository(indexedDB, {
      enqueueSave: async () => { throw new Error("Outbox unavailable"); },
      enqueueDelete: async () => { throw new Error("Outbox unavailable"); }
    }, error => errors.push(error));
    const book = createBook("Local only");
    await repo.save(book);
    expect((await repo.get(book.id)).title).toBe("Local only");
    await repo.delete(book.id);
    expect(await repo.list()).toEqual([]);
    expect(errors).toHaveLength(2);

    const outbox = new CoreSyncOutbox(indexedDB);
    const connected = new BookRepository(indexedDB, outbox);
    await connected.save(book);
    await connected.delete(book.id);
    expect(await outbox.pending()).toMatchObject([{ id: book.id, scope: "private-snapshot", kind: "delete" }]);
  });

  it("a second flush waits for a checkpoint queued during an in-flight send", async () => {
    const outbox = new CoreSyncOutbox(indexedDB);
    const book = createBook("Concurrent checkpoint");
    await outbox.enqueueSave(book);
    let release!: () => void;
    let entered!: () => void;
    const sending = new Promise<void>(resolve => { release = resolve; });
    const started = new Promise<void>(resolve => { entered = resolve; });
    const sent: string[] = [];
    const transport = async (change: { kind: string; book?: typeof book }) => {
      if (change.kind !== "save" || !change.book) return;
      sent.push(change.book.chapters[0]!.prose);
      if (sent.length === 1) { entered(); await sending; }
    };
    const first = outbox.flush(transport);
    await started;
    await outbox.enqueueSave(updateChapter(book, book.chapters[0]!.id, { prose: "Must be acknowledged" }));
    const requiredCheckpoint = outbox.flush(transport);
    release();
    await Promise.all([first, requiredCheckpoint]);
    expect(sent).toContain("Must be acknowledged");
    expect(await outbox.pending()).toEqual([]);
  });
});
