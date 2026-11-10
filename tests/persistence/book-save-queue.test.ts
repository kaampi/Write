import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, describe, expect, it } from "vitest";
import { createBook, updateChapter, type Book } from "@core/BookSchema";
import { BookRepository } from "@persistence/Repository";
import { BookSaveQueue, type SaveState } from "@persistence/BookSaveQueue";

function withProse(book: Book, prose: string): Book {
  return updateChapter(book, book.chapters[0]!.id, { prose });
}

function proseOf(book: Book): string {
  return book.chapters[0]!.prose;
}

/** A save function whose every call waits for the test to settle it by hand. */
function manualSave() {
  const calls: { book: Book; resolve: () => void; reject: (error: unknown) => void }[] = [];
  const save = (book: Book) =>
    new Promise<void>((resolve, reject) => {
      calls.push({ book, resolve, reject });
    });
  return { calls, save };
}

/** Timers the test fires itself, so retries never depend on real time. */
function manualTimers() {
  const timers: { run: () => void; ms: number; cancelled: boolean }[] = [];
  return {
    timers,
    setTimer: (run: () => void, ms: number) => {
      const timer = { run, ms, cancelled: false };
      timers.push(timer);
      return timer;
    },
    clearTimer: (handle: unknown) => {
      (handle as { cancelled: boolean }).cancelled = true;
    },
    live: () => timers.filter((timer) => !timer.cancelled)
  };
}

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe("BookSaveQueue", () => {
  it("writes one manuscript at a time, in the order asked for", async () => {
    const { calls, save } = manualSave();
    const queue = new BookSaveQueue(save);
    const first = createBook("First");
    const second = createBook("Second");

    const a = queue.enqueue(first);
    const b = queue.enqueue(second);
    await tick();
    expect(calls.map((call) => call.book.title)).toEqual(["First"]);

    calls[0]!.resolve();
    await a;
    await tick();
    expect(calls.map((call) => call.book.title)).toEqual(["First", "Second"]);
    calls[1]!.resolve();
    await b;
    expect(queue.hasUnsaved()).toBe(false);
  });

  it("collapses edits queued behind a write into one write of the newest state", async () => {
    const { calls, save } = manualSave();
    const queue = new BookSaveQueue(save);
    const book = createBook("Draft");

    const first = queue.enqueue(withProse(book, "one"));
    await tick();
    const second = queue.enqueue(withProse(book, "two"));
    const third = queue.enqueue(withProse(book, "three"));

    calls[0]!.resolve();
    await first;
    await tick();
    expect(calls.map((call) => proseOf(call.book))).toEqual(["one", "three"]);
    calls[1]!.resolve();
    await Promise.all([second, third]);
    expect(calls).toHaveLength(2);
  });

  it("reports a failed write, keeps the manuscript, and writes it on retry", async () => {
    const states: SaveState[] = [];
    const clock = manualTimers();
    let failing = true;
    const written: string[] = [];
    const queue = new BookSaveQueue(
      async (book) => {
        if (failing) throw new Error("disk full");
        written.push(proseOf(book));
      },
      { onState: (state) => states.push(state), setTimer: clock.setTimer, clearTimer: clock.clearTimer }
    );
    const book = withProse(createBook("Draft"), "the only copy");

    await expect(queue.enqueue(book)).rejects.toThrow("disk full");
    await tick();
    expect(states).toEqual(["saving", "failed"]);
    expect(queue.hasUnsaved()).toBe(true);
    expect(queue.failedBooks().map(proseOf)).toEqual(["the only copy"]);
    expect(clock.live()).toHaveLength(1);

    failing = false;
    clock.live()[0]!.run();
    await tick();
    expect(written).toEqual(["the only copy"]);
    expect(states).toEqual(["saving", "failed", "saved"]);
    expect(queue.hasUnsaved()).toBe(false);
    expect(queue.failedBooks()).toEqual([]);
  });

  it("stays failed, without flickering, while retries keep failing — and backs off", async () => {
    const states: SaveState[] = [];
    const clock = manualTimers();
    const queue = new BookSaveQueue(
      async () => {
        throw new Error("still broken");
      },
      { onState: (state) => states.push(state), retryDelaysMs: [10, 20], setTimer: clock.setTimer, clearTimer: clock.clearTimer }
    );

    await expect(queue.enqueue(createBook("Draft"))).rejects.toThrow();
    await tick();
    clock.live()[0]!.run();
    await tick();
    clock.live()[0]!.run();
    await tick();

    expect(states).toEqual(["saving", "failed"]);
    expect(clock.timers.map((timer) => timer.ms)).toEqual([10, 20, 20]);
    expect(queue.failedBooks()).toHaveLength(1);
  });

  it("lets a newer edit replace the state held after a failure", async () => {
    const clock = manualTimers();
    let failing = true;
    const written: string[] = [];
    const queue = new BookSaveQueue(
      async (book) => {
        if (failing) throw new Error("rejected");
        written.push(proseOf(book));
      },
      { setTimer: clock.setTimer, clearTimer: clock.clearTimer }
    );
    const book = createBook("Draft");

    await expect(queue.enqueue(withProse(book, "old"))).rejects.toThrow();
    failing = false;
    await queue.enqueue(withProse(book, "new"));
    await tick();

    expect(written).toEqual(["new"]);
    expect(queue.hasUnsaved()).toBe(false);
    expect(clock.live()).toEqual([]);
  });

  it("does not let one manuscript that cannot be written block another", async () => {
    const clock = manualTimers();
    const written: string[] = [];
    const queue = new BookSaveQueue(
      async (book) => {
        if (book.title === "Broken") throw new Error("invalid");
        written.push(book.title);
      },
      { setTimer: clock.setTimer, clearTimer: clock.clearTimer }
    );

    const broken = queue.enqueue(createBook("Broken"));
    const fine = queue.enqueue(createBook("Fine"));
    await expect(broken).rejects.toThrow("invalid");
    await fine;
    await tick();

    expect(written).toEqual(["Fine"]);
    expect(queue.currentState()).toBe("failed");
    expect(queue.failedBooks().map((book) => book.title)).toEqual(["Broken"]);
  });

  it("flush waits for queued work and retries held manuscripts", async () => {
    const clock = manualTimers();
    let failing = true;
    const written: string[] = [];
    const queue = new BookSaveQueue(
      async (book) => {
        await tick();
        if (failing) throw new Error("offline");
        written.push(proseOf(book));
      },
      { setTimer: clock.setTimer, clearTimer: clock.clearTimer }
    );
    const book = createBook("Draft");

    await expect(queue.enqueue(withProse(book, "held"))).rejects.toThrow();
    await expect(queue.flush()).rejects.toThrow("offline");
    expect(queue.failedBooks()).toHaveLength(1);

    failing = false;
    const other = createBook("Other");
    void queue.enqueue(withProse(other, "queued"));
    await queue.flush();

    expect(written.sort()).toEqual(["held", "queued"]);
    expect(queue.hasUnsaved()).toBe(false);
    expect(queue.currentState()).toBe("saved");
  });

  it("writes an edit queued by a caller the moment its own write resolves", async () => {
    const written: string[] = [];
    const queue = new BookSaveQueue(async (book) => {
      written.push(proseOf(book));
    });
    const book = createBook("Draft");

    await queue.enqueue(withProse(book, "first"));
    // Queued in the same turn the first write resolved, before the queue has wound down.
    const second = queue.enqueue(withProse(book, "second"));
    await second;

    expect(written).toEqual(["first", "second"]);
    expect(queue.hasUnsaved()).toBe(false);
  });

  it("discard drops unwritten and held state so a replaced manuscript is not written back", async () => {
    const clock = manualTimers();
    const written: string[] = [];
    let failing = true;
    const queue = new BookSaveQueue(
      async (book) => {
        if (failing) throw new Error("rejected");
        written.push(proseOf(book));
      },
      { setTimer: clock.setTimer, clearTimer: clock.clearTimer }
    );
    const book = createBook("Draft");

    await expect(queue.enqueue(withProse(book, "stale"))).rejects.toThrow();
    await tick();
    expect(queue.currentState()).toBe("failed");

    await queue.discard(book.id);
    failing = false;
    queue.retry();
    await queue.flush();

    expect(written).toEqual([]);
    expect(queue.currentState()).toBe("saved");
    expect(clock.live()).toEqual([]);
  });

  it("discard waits out a write already in flight, so the caller's own write lands after it", async () => {
    const { calls, save } = manualSave();
    const queue = new BookSaveQueue(save);
    const book = createBook("Draft");
    const order: string[] = [];

    const inFlight = queue.enqueue(withProse(book, "old")).then(() => order.push("queued write"));
    await tick();
    const discarded = queue.discard(book.id).then(() => order.push("discard returned"));
    await tick();
    expect(order).toEqual([]);

    calls[0]!.resolve();
    await Promise.all([inFlight, discarded]);
    expect(order).toEqual(["queued write", "discard returned"]);
  });
});

describe("BookSaveQueue over the real repository", () => {
  afterEach(() => {
    indexedDB.deleteDatabase("storybook-ai");
  });

  it("surfaces a schema-rejected save instead of losing it, and saves once the manuscript is valid again", async () => {
    const repo = new BookRepository(indexedDB);
    const states: SaveState[] = [];
    const clock = manualTimers();
    const queue = new BookSaveQueue((book) => repo.save(book), {
      onState: (state) => states.push(state),
      setTimer: clock.setTimer,
      clearTimer: clock.clearTimer
    });
    const book = withProse(createBook("Draft"), "Chapter one.");
    await queue.enqueue(book);

    // An empty title fails BookSchema — the kind of save that used to vanish without a trace.
    const invalid = { ...withProse(book, "Chapter one, revised."), title: "" };
    await expect(queue.enqueue(invalid)).rejects.toThrow();
    await tick();
    expect(queue.currentState()).toBe("failed");
    expect((await repo.get(book.id)).chapters[0]?.prose).toBe("Chapter one.");
    expect(queue.failedBooks().map(proseOf)).toEqual(["Chapter one, revised."]);

    await queue.enqueue({ ...invalid, title: "Draft" });
    await tick();
    expect((await repo.get(book.id)).chapters[0]?.prose).toBe("Chapter one, revised.");
    expect(states).toEqual(["saving", "saved", "saving", "failed", "saved"]);
  });
});
