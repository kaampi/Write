import type { Book } from "@core/BookSchema";

/**
 * "saved": nothing is waiting to be written. "saving": a write is queued or
 * in flight. "failed": the newest state of at least one manuscript could not
 * be written and is being held for retry — the author must be told.
 */
export type SaveState = "saved" | "saving" | "failed";

type Waiter = { resolve: () => void; reject: (error: unknown) => void };
type Entry = { book: Book; waiters: Waiter[] };

export type BookSaveQueueOptions = {
  /** Called whenever the state changes. `error` is only set alongside "failed". */
  onState?: (state: SaveState, error: unknown) => void;
  /** Wait before each automatic retry; the last value repeats. */
  retryDelaysMs?: readonly number[];
  setTimer?: (run: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
};

const DEFAULT_RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000] as const;

/**
 * Every manuscript write goes through here instead of straight to the
 * repository. Before this existed the editor's debounced save was a bare
 * `void persist(next)`: if the write rejected (schema validation, storage
 * quota, a blocked database) nothing noticed, the editor kept showing text
 * that was no longer reaching disk, and a later, older write could in
 * principle land after a newer one because nothing ordered them.
 *
 * - One write in flight at a time, so writes land in the order they were asked for.
 * - Newest state wins: a manuscript queued twice before its turn is written once.
 * - A failed write is never dropped. Its manuscript is held and retried on a
 *   timer, on `retry()`, and on `flush()` — and replaced by any newer state
 *   of the same manuscript that arrives meanwhile.
 * - One manuscript that cannot be written never blocks the others.
 */
export class BookSaveQueue {
  private readonly pending = new Map<string, Entry>();
  private readonly held = new Map<string, Book>();
  private running: Promise<void> | null = null;
  private inFlightId: string | null = null;
  private dropInFlight = false;
  private retryHandle: unknown = null;
  private retryAttempts = 0;
  private lastError: unknown = null;
  private state: SaveState = "saved";
  private readonly retryDelaysMs: readonly number[];
  private readonly setTimer: (run: () => void, ms: number) => unknown;
  private readonly clearTimer: (handle: unknown) => void;

  constructor(
    private readonly save: (book: Book) => Promise<void>,
    private readonly options: BookSaveQueueOptions = {}
  ) {
    this.retryDelaysMs = options.retryDelaysMs?.length ? options.retryDelaysMs : DEFAULT_RETRY_DELAYS_MS;
    this.setTimer = options.setTimer ?? ((run, ms) => setTimeout(run, ms));
    this.clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
  }

  /**
   * Queue this state of the manuscript. Resolves once it — or a newer state
   * of the same manuscript — is on disk; rejects if the write covering it
   * failed (the manuscript is then held for retry, not lost).
   */
  enqueue(book: Book): Promise<void> {
    this.held.delete(book.id);
    return new Promise<void>((resolve, reject) => {
      const waiters = this.pending.get(book.id)?.waiters ?? [];
      waiters.push({ resolve, reject });
      this.pending.set(book.id, { book, waiters });
      void this.drain();
    });
  }

  /** Try held manuscripts again now instead of waiting for the retry timer. */
  retry(): void {
    this.requeueHeld();
    void this.drain();
  }

  /**
   * Write everything outstanding, including manuscripts held after a
   * failure. Resolves when all of it is on disk; rejects with the last
   * error if anything still could not be written.
   */
  async flush(): Promise<void> {
    this.requeueHeld();
    while (this.running || this.pending.size > 0) await this.drain();
    if (this.held.size > 0) throw this.lastError ?? new Error("Could not save the manuscript");
  }

  /**
   * Forget unwritten state for one manuscript — for callers about to
   * replace or delete that row themselves (import over an existing book,
   * restore, delete), where a late or retried write of the old in-memory
   * state would undo what they just did. Waits out a write of that
   * manuscript already in flight, so the caller's own write lands after it.
   */
  async discard(bookId: string): Promise<void> {
    const entry = this.pending.get(bookId);
    this.pending.delete(bookId);
    this.held.delete(bookId);
    entry?.waiters.forEach((waiter) => waiter.resolve());
    if (this.inFlightId === bookId) {
      this.dropInFlight = true;
      await this.running;
    } else if (!this.running) {
      this.settle();
    }
  }

  /** True while anything is queued, in flight, or held after a failure. */
  hasUnsaved(): boolean {
    return this.running !== null || this.pending.size > 0 || this.held.size > 0;
  }

  /** Manuscripts whose newest state is not on disk because a write failed. */
  failedBooks(): Book[] {
    return [...this.held.values()];
  }

  currentState(): SaveState {
    return this.state;
  }

  /** Cancels the retry timer. The queue stays usable. */
  dispose(): void {
    this.cancelRetry();
  }

  private requeueHeld(): void {
    for (const [id, book] of this.held) {
      if (!this.pending.has(id)) this.pending.set(id, { book, waiters: [] });
    }
    this.held.clear();
  }

  private drain(): Promise<void> {
    if (this.running) return this.running;
    if (this.pending.size === 0) {
      this.settle();
      return Promise.resolve();
    }
    this.cancelRetry();
    // Once a write has failed the state stays "failed" until everything is
    // actually on disk — a retry in progress is not good news yet, and
    // flipping to "saving" on every attempt would make the warning flicker.
    if (this.state !== "failed") this.emit("saving");
    this.running = this.writeAll();
    return this.running;
  }

  private async writeAll(): Promise<void> {
    // Yield once so `running` is assigned before the first write starts,
    // even if `save` throws synchronously.
    await null;
    try {
      while (this.pending.size > 0) {
        const next = this.pending.entries().next();
        if (next.done) break;
        const [id, entry] = next.value;
        this.pending.delete(id);
        this.inFlightId = id;
        this.dropInFlight = false;
        try {
          await this.save(entry.book);
          entry.waiters.forEach((waiter) => waiter.resolve());
        } catch (error) {
          this.lastError = error;
          // A newer state already queued supersedes this one; otherwise keep
          // it for retry rather than losing the author's latest text.
          if (!this.dropInFlight && !this.pending.has(id)) this.held.set(id, entry.book);
          entry.waiters.forEach((waiter) => waiter.reject(error));
        } finally {
          this.inFlightId = null;
        }
      }
    } finally {
      // Wound down in the same turn the loop ends: a caller woken by its
      // own write resolving sees an idle queue and starts a fresh run,
      // instead of adding to one that has already stopped looking.
      this.running = null;
      this.settle();
    }
  }

  private settle(): void {
    if (this.held.size > 0) {
      this.emit("failed");
      this.scheduleRetry();
      return;
    }
    this.cancelRetry();
    this.retryAttempts = 0;
    this.lastError = null;
    this.emit("saved");
  }

  private scheduleRetry(): void {
    if (this.retryHandle !== null) return;
    const index = Math.min(this.retryAttempts, this.retryDelaysMs.length - 1);
    const delay = this.retryDelaysMs[index] ?? 30_000;
    this.retryAttempts += 1;
    this.retryHandle = this.setTimer(() => {
      this.retryHandle = null;
      this.retry();
    }, delay);
  }

  private cancelRetry(): void {
    if (this.retryHandle === null) return;
    this.clearTimer(this.retryHandle);
    this.retryHandle = null;
  }

  private emit(state: SaveState): void {
    if (state === this.state) return;
    this.state = state;
    try {
      this.options.onState?.(state, state === "failed" ? this.lastError : null);
    } catch {
      // A listener must never be able to stall the queue.
    }
  }
}
