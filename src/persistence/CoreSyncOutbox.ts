import type { Book } from "@core/BookSchema";

export type CoreChange =
  | { id: string; token: string; scope: "private-snapshot"; kind: "save"; book: Book }
  | { id: string; token: string; scope: "private-snapshot"; kind: "delete" };

export interface CoreSyncSink {
  enqueueSave(book: Book): Promise<void>;
  enqueueDelete(id: string): Promise<void>;
}

export type CoreTransport = (change: CoreChange) => Promise<void>;

const DB_NAME = "storybook-core-outbox";
const STORE = "pending";

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error ?? new Error("Core outbox request failed"));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("Core outbox transaction aborted"));
    tx.onerror = () => reject(tx.error ?? new Error("Core outbox transaction failed"));
  });
}

/** Owner-only full-book snapshots. Never publish these to a grantable workspace. */
export class CoreSyncOutbox implements CoreSyncSink {
  private draining: Promise<void> | null = null;

  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}

  private db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const open = this.factory.open(DB_NAME, 1);
      open.onupgradeneeded = () => open.result.createObjectStore(STORE, { keyPath: "id" });
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error ?? new Error("Core outbox open failed"));
    });
  }

  private async put(change: CoreChange): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction(STORE, "readwrite");
      const done = transactionDone(tx);
      tx.objectStore(STORE).put(change);
      await done;
    } finally { db.close(); }
  }

  enqueueSave(book: Book): Promise<void> {
    return this.put({ id: book.id, token: crypto.randomUUID(), scope: "private-snapshot", kind: "save", book });
  }

  enqueueDelete(id: string): Promise<void> {
    return this.put({ id, token: crypto.randomUUID(), scope: "private-snapshot", kind: "delete" });
  }

  async pending(): Promise<CoreChange[]> {
    const db = await this.db();
    try { return await request(db.transaction(STORE, "readonly").objectStore(STORE).getAll()) as CoreChange[]; }
    finally { db.close(); }
  }

  /** Retries on reconnect. A failed send retains its change; a newer local edit is never discarded. */
  flush(transport: CoreTransport): Promise<void> {
    if (this.draining) return this.draining;
    const drain = async () => {
      for (const change of await this.pending()) {
        await transport(change);
        const db = await this.db();
        try {
          const tx = db.transaction(STORE, "readwrite");
          const done = transactionDone(tx);
          const store = tx.objectStore(STORE);
          const current = await request(store.get(change.id)) as CoreChange | undefined;
          if (current?.token === change.token) store.delete(change.id);
          await done;
        } finally { db.close(); }
      }
    };
    const running = drain().finally(() => { if (this.draining === running) this.draining = null; });
    this.draining = running;
    return running;
  }
}
