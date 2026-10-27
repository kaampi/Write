import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { createSeries } from "@core/SeriesSchema";
import type { NarrativeFact } from "@core/NarrativeFact";
import { BookRepository } from "@persistence/Repository";
import { SeriesRepository } from "@persistence/SeriesRepository";
import { CoreSharingOutbox, type CoreSharingTransport } from "@persistence/CoreSharingOutbox";

const visibleFact: NarrativeFact = {
  id: "series-fact", entity_ref: "port", entity_label: "Port", predicate: "core.place",
  value: "The harbor", sequence_index: 0, status: "locked", source: "author",
  created_at: "2026-10-27T00:00:00.000Z"
};

describe("opt-in Core manuscript sharing choices", () => {
  afterEach(() => {
    indexedDB.deleteDatabase("storybook-ai");
    indexedDB.deleteDatabase("storybook-core-sharing");
  });

  it("starts private and retries a filtered, current manuscript after Core is unavailable", async () => {
    const choices = new CoreSharingOutbox(indexedDB);
    const books = new BookRepository(indexedDB, choices);
    const series = new SeriesRepository(indexedDB);
    let book = createBook("Night Keys");
    expect(await choices.choice(book.id)).toEqual({ readers: [], pending: false });
    await books.save(book);
    expect(await choices.pending()).toEqual([]);

    const universe = { ...createSeries("World"), facts: [visibleFact, { ...visibleFact, id: "hidden", value: "Hidden", hidden_from_ai: true }] };
    await series.save(universe);
    book = { ...book, series_id: universe.id, brainstorm: "Private brainstorm", synopsis: "Entire synopsis." };
    await books.save(book);
    await choices.setReaders(book.id, ["comic"]);
    book = updateChapter(book, book.chapters[0]!.id, { prose: "The complete latest chapter." });
    await books.save(book);
    const offline: CoreSharingTransport = {
      publish: async () => { throw new Error("Core offline"); },
      revoke: async () => { throw new Error("Core offline"); }
    };
    await expect(choices.flush(books, series, offline)).rejects.toThrow("Core offline");
    expect(await choices.choice(book.id)).toEqual({ readers: ["comic"], pending: true });

    const sent: unknown[] = [];
    await choices.flush(books, series, {
      publish: async value => { sent.push(value); },
      revoke: async () => { throw new Error("Unexpected revoke"); }
    });
    expect(sent).toHaveLength(1);
    const serialized = JSON.stringify(sent[0]);
    expect(serialized).toContain("The complete latest chapter.");
    expect(serialized).toContain("Entire synopsis.");
    expect(serialized).toContain("The harbor");
    expect(serialized).not.toMatch(/Private brainstorm|Hidden/);
    expect(await choices.choice(book.id)).toEqual({ readers: ["comic"], pending: false });
  });

  it("does not lose a new opt-out while an earlier publication is in flight", async () => {
    const choices = new CoreSharingOutbox(indexedDB);
    const books = new BookRepository(indexedDB, choices);
    const series = new SeriesRepository(indexedDB);
    const book = createBook("Draft");
    await books.save(book);
    await choices.setReaders(book.id, ["sandbox"]);
    await choices.flush(books, series, {
      publish: async () => { await choices.setReaders(book.id, []); },
      revoke: async () => { throw new Error("Unexpected revoke"); }
    });
    expect(await choices.choice(book.id)).toEqual({ readers: [], pending: true });
    const revoked: string[] = [];
    await choices.flush(books, series, {
      publish: async () => { throw new Error("Unexpected publish"); },
      revoke: async id => { revoked.push(id); }
    });
    expect(revoked).toEqual([book.id]);
    expect(await choices.choice(book.id)).toEqual({ readers: [], pending: false });
  });

  it("keeps a deletion locally successful and queues remote revocation", async () => {
    const choices = new CoreSharingOutbox(indexedDB);
    const books = new BookRepository(indexedDB, choices);
    const series = new SeriesRepository(indexedDB);
    const book = createBook("Delete me");
    await books.save(book);
    await choices.setReaders(book.id, ["comic"]);
    await books.delete(book.id);
    expect(await books.list()).toEqual([]);
    expect(await choices.choice(book.id)).toEqual({ readers: [], pending: true });
    const revoked: string[] = [];
    await choices.flush(books, series, {
      publish: async () => { throw new Error("Unexpected publish"); },
      revoke: async id => { revoked.push(id); }
    });
    expect(revoked).toEqual([book.id]);
  });
});
