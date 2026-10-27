import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { BookRepository } from "@persistence/Repository";
import { coreBookSink, coreSnapshotOutbox } from "@persistence/CoreSharingRuntime";

afterEach(() => {
  indexedDB.deleteDatabase("storybook-ai");
  indexedDB.deleteDatabase("storybook-core-sharing");
  indexedDB.deleteDatabase("storybook-core-outbox");
});

it("keeps IndexedDB authoritative while automatic private copies are opt-in", async () => {
  const repo = new BookRepository(indexedDB, coreBookSink);
  let book = createBook("Local draft");
  await repo.save(book);
  expect(await coreSnapshotOutbox.pending()).toEqual([]);
  await coreSnapshotOutbox.setAutoEnabled(book.id, true);
  book = updateChapter(book, book.chapters[0]!.id, { prose: "Saved locally while Core is absent" });
  await repo.save(book);
  expect((await repo.get(book.id)).chapters[0]?.prose).toBe("Saved locally while Core is absent");
  expect(await coreSnapshotOutbox.pending()).toMatchObject([{ id: book.id, book }]);
  await repo.delete(book.id);
  expect(await repo.list()).toEqual([]);
  expect((await coreSnapshotOutbox.autoChoice(book.id)).enabled).toBe(false);
  // Local deletion does not erase an already queued private recovery copy.
  expect(await coreSnapshotOutbox.pending()).toHaveLength(1);
});
