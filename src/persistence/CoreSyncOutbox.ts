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
const SETTINGS = "auto-settings";
const INTERVAL_MS = 10 * 60 * 1000;
type AutoSetting = { id: string; enabled: boolean; lastSentAt: number | null };

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
      const open = this.factory.open(DB_NAME, 2);
      open.onupgradeneeded = () => {
        if (!open.result.objectStoreNames.contains(STORE)) open.result.createObjectStore(STORE, { keyPath: "id" });
        if (!open.result.objectStoreNames.contains(SETTINGS)) open.result.createObjectStore(SETTINGS, { keyPath: "id" });
      };
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

  async autoChoice(id: string): Promise<AutoSetting> {
    const db = await this.db();
    try {
      const row = await request(db.transaction(SETTINGS, "readonly").objectStore(SETTINGS).get(id)) as AutoSetting | undefined;
      return row ?? { id, enabled: false, lastSentAt: null };
    } finally { db.close(); }
  }

  async setAutoEnabled(id: string, enabled: boolean): Promise<void> {
    if (!id) throw new Error("Invalid manuscript ID");
    const db = await this.db();
    try {
      const tx = db.transaction(SETTINGS, "readwrite");
      const done = transactionDone(tx);
      const store = tx.objectStore(SETTINGS);
      const row = await request(store.get(id)) as AutoSetting | undefined;
      store.put({ id, enabled, lastSentAt: row?.lastSentAt ?? null } satisfies AutoSetting);
      await done;
    } finally { db.close(); }
  }

  /** Queue only for opted-in books. While offline, replace the queued copy with the latest local save. */
  async enqueueAutoSave(book: Book, now = Date.now()): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction([STORE, SETTINGS], "readwrite");
      const done = transactionDone(tx);
      const setting = await request(tx.objectStore(SETTINGS).get(book.id)) as AutoSetting | undefined;
      if (setting?.enabled) {
        const pending = tx.objectStore(STORE);
        const existing = await request(pending.get(book.id)) as CoreChange | undefined;
        if (existing?.kind === "save" || setting.lastSentAt === null || now - setting.lastSentAt >= INTERVAL_MS) {
          pending.put({ id: book.id, token: crypto.randomUUID(), scope: "private-snapshot", kind: "save", book } satisfies CoreChange);
        }
      }
      await done;
    } finally { db.close(); }
  }

  async pending(): Promise<CoreChange[]> {
    const db = await this.db();
    try { return await request(db.transaction(STORE, "readonly").objectStore(STORE).getAll()) as CoreChange[]; }
    finally { db.close(); }
  }

  /** Retries on reconnect. A failed send retains its change; a newer local edit is never discarded. */
  flush(transport: CoreTransport): Promise<void> {
    // A caller requiring a confirmed checkpoint must also drain work queued
    // while another send was already in flight.
    if (this.draining) return this.draining.then(() => this.flush(transport));
    const drain = async () => {
      while (true) {
        const changes = await this.pending();
        if (!changes.length) return;
        for (const change of changes) {
          await transport(change);
          const db = await this.db();
          try {
            const tx = db.transaction([STORE, SETTINGS], "readwrite");
            const done = transactionDone(tx);
            const store = tx.objectStore(STORE);
            const current = await request(store.get(change.id)) as CoreChange | undefined;
            if (current?.token === change.token) {
              store.delete(change.id);
              if (change.kind === "save") {
                const settings = tx.objectStore(SETTINGS);
                const row = await request(settings.get(change.id)) as AutoSetting | undefined;
                settings.put({ id: change.id, enabled: row?.enabled ?? false, lastSentAt: Date.now() } satisfies AutoSetting);
              }
            }
            await done;
          } finally { db.close(); }
        }
      }
    };
    const running = drain().finally(() => { if (this.draining === running) this.draining = null; });
    this.draining = running;
    return running;
  }
}
