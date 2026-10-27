import type { Book } from "@core/BookSchema";
import type { NarrativeFact } from "@core/NarrativeFact";
import { BookNotFoundError, type BookRepository } from "./Repository";
import { SeriesNotFoundError, type SeriesRepository } from "./SeriesRepository";
import { buildCoreManuscriptPublication, type CoreManuscriptPublication, type CoreShareReader } from "./CoreManuscriptPublication";
import type { CoreSyncSink } from "./CoreSyncOutbox";

type SharingChoice = { bookId: string; readers: CoreShareReader[]; pending: boolean; token: string };
export type CoreSharingTransport = {
  publish(value: CoreManuscriptPublication): Promise<void>;
  revoke(bookId: string): Promise<void>;
};

const DB_NAME = "storybook-core-sharing";
const STORE = "choices";
const allowed = new Set<CoreShareReader>(["sandbox", "comic"]);

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error ?? new Error("Core sharing request failed"));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("Core sharing transaction aborted"));
    tx.onerror = () => reject(tx.error ?? new Error("Core sharing transaction failed"));
  });
}

/** Opt-in choices and retry state live outside Storybook's working book database. */
export class CoreSharingOutbox implements CoreSyncSink {
  private draining: Promise<void> | null = null;

  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}

  private db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const open = this.factory.open(DB_NAME, 1);
      open.onupgradeneeded = () => open.result.createObjectStore(STORE, { keyPath: "bookId" });
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error ?? new Error("Core sharing open failed"));
    });
  }

  async choice(bookId: string): Promise<{ readers: CoreShareReader[]; pending: boolean }> {
    const db = await this.db();
    try {
      const row = await request(db.transaction(STORE, "readonly").objectStore(STORE).get(bookId)) as SharingChoice | undefined;
      return { readers: row?.readers ?? [], pending: row?.pending ?? false };
    } finally { db.close(); }
  }

  async choiceVersion(bookId: string): Promise<string | null> {
    const db = await this.db();
    try {
      const row = await request(db.transaction(STORE, "readonly").objectStore(STORE).get(bookId)) as SharingChoice | undefined;
      return row?.token ?? null;
    } finally { db.close(); }
  }

  /** Adopt Core's verified grants only when no local change is awaiting delivery. */
  async reconcile(bookId: string, remoteReaders: readonly CoreShareReader[], expectedToken?: string | null): Promise<void> {
    if (!bookId || remoteReaders.some(reader => !allowed.has(reader))) throw new Error("Invalid Core readers");
    const readers = [...new Set(remoteReaders)].sort();
    const db = await this.db();
    try {
      const tx = db.transaction(STORE, "readwrite");
      const done = transactionDone(tx);
      const store = tx.objectStore(STORE);
      const current = await request(store.get(bookId)) as SharingChoice | undefined;
      if (expectedToken !== undefined && (current?.token ?? null) !== expectedToken) { await done; return; }
      if (!current?.pending && (current?.readers.join() ?? "") !== readers.join()) {
        store.put({ bookId, readers, pending: false, token: crypto.randomUUID() } satisfies SharingChoice);
      }
      await done;
    } finally { db.close(); }
  }

  async setReaders(bookId: string, readers: readonly CoreShareReader[]): Promise<void> {
    if (!bookId || readers.some(reader => !allowed.has(reader))) throw new Error("Invalid Core sharing choice");
    const selected = [...new Set(readers)].sort();
    const db = await this.db();
    try {
      const tx = db.transaction(STORE, "readwrite");
      const done = transactionDone(tx);
      const store = tx.objectStore(STORE);
      const current = await request(store.get(bookId)) as SharingChoice | undefined;
      if (!current && selected.length === 0) { await done; return; }
      if (!current || selected.join() !== current.readers.join()) {
        store.put({ bookId, readers: selected, pending: true, token: crypto.randomUUID() } satisfies SharingChoice);
      }
      await done;
    } finally { db.close(); }
  }

  async enqueueSave(book: Book): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction(STORE, "readwrite");
      const done = transactionDone(tx);
      const store = tx.objectStore(STORE);
      const current = await request(store.get(book.id)) as SharingChoice | undefined;
      if (current?.readers.length) store.put({ ...current, pending: true, token: crypto.randomUUID() });
      await done;
    } finally { db.close(); }
  }

  /** A series edit can change the exported facts of several shared books. */
  async enqueueSeriesSave(seriesId: string, books: Pick<BookRepository, "list">): Promise<void> {
    const related = new Set((await books.list()).filter(book => book.series_id === seriesId).map(book => book.id));
    if (!related.size) return;
    const db = await this.db();
    try {
      const tx = db.transaction(STORE, "readwrite");
      const done = transactionDone(tx);
      const store = tx.objectStore(STORE);
      const choices = await request(store.getAll()) as SharingChoice[];
      for (const current of choices) {
        if (related.has(current.bookId) && current.readers.length) {
          store.put({ ...current, pending: true, token: crypto.randomUUID() });
        }
      }
      await done;
    } finally { db.close(); }
  }

  async enqueueDelete(bookId: string): Promise<void> {
    await this.setReaders(bookId, []);
  }

  async pending(): Promise<SharingChoice[]> {
    const db = await this.db();
    try {
      return (await request(db.transaction(STORE, "readonly").objectStore(STORE).getAll()) as SharingChoice[])
        .filter(row => row.pending);
    } finally { db.close(); }
  }

  /** Reloads the latest local manuscript at send time. A failed send keeps the choice pending. */
  flush(
    books: Pick<BookRepository, "get">,
    series: Pick<SeriesRepository, "get">,
    transport: CoreSharingTransport
  ): Promise<void> {
    if (this.draining) return this.draining;
    const drain = async () => {
      for (const change of await this.pending()) {
        if (change.readers.length === 0) await transport.revoke(change.bookId);
        else {
          let book: Book;
          try { book = await books.get(change.bookId); }
          catch (error) {
            if (!(error instanceof BookNotFoundError)) throw error;
            await transport.revoke(change.bookId);
            await this.ack(change);
            continue;
          }
          let seriesFacts: NarrativeFact[] = [];
          if (book.series_id) {
            try { seriesFacts = (await series.get(book.series_id)).facts; }
            catch (error) { if (!(error instanceof SeriesNotFoundError)) throw error; throw new Error("Resolve the missing series before sharing this manuscript"); }
          }
          await transport.publish(buildCoreManuscriptPublication(book, seriesFacts, change.readers));
        }
        await this.ack(change);
      }
    };
    const running = drain().finally(() => { if (this.draining === running) this.draining = null; });
    this.draining = running;
    return running;
  }

  private async ack(change: SharingChoice): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction(STORE, "readwrite");
      const done = transactionDone(tx);
      const store = tx.objectStore(STORE);
      const current = await request(store.get(change.bookId)) as SharingChoice | undefined;
      if (current?.token === change.token) store.put({ ...current, pending: false });
      await done;
    } finally { db.close(); }
  }
}
