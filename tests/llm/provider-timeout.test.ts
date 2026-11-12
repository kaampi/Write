import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LocalModelTimeoutError,
  LOCAL_MODEL_TIMEOUT_MS,
  LOCAL_SERVER_PROBE_TIMEOUT_MS,
  withTimeoutGuard,
  type LocalModelProvider
} from "@llm/provider";
import type { StreamChunk } from "@llm/types";

function stubProvider(overrides: Partial<LocalModelProvider> = {}): LocalModelProvider {
  return {
    name: "stub",
    chat: () => new Promise(() => undefined),
    async *streamChat(): AsyncGenerator<StreamChunk> {
      await new Promise(() => undefined);
    },
    embed: () => new Promise(() => undefined),
    supportsEmbeddings: () => true,
    listModels: () => new Promise(() => undefined),
    healthCheck: () => new Promise(() => undefined),
    ...overrides
  };
}

describe("withTimeoutGuard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("times out chat() after LOCAL_MODEL_TIMEOUT_MS with a LocalModelTimeoutError", async () => {
    const guarded = withTimeoutGuard(
      stubProvider({
        chat: (request) =>
          new Promise((_, reject) => {
            request.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          })
      })
    );
    const result = guarded.chat({ messages: [{ role: "user", content: "hi" }] });
    const assertion = expect(result).rejects.toBeInstanceOf(LocalModelTimeoutError);
    await vi.advanceTimersByTimeAsync(LOCAL_MODEL_TIMEOUT_MS);
    await assertion;
  });

  it("times out listModels() after the much shorter probe timeout, not the long one", async () => {
    const guarded = withTimeoutGuard(
      stubProvider({
        listModels: (signal) =>
          new Promise((_, reject) => {
            signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          })
      })
    );
    const result = guarded.listModels();
    const assertion = expect(result).rejects.toBeInstanceOf(LocalModelTimeoutError);
    await vi.advanceTimersByTimeAsync(LOCAL_SERVER_PROBE_TIMEOUT_MS);
    await assertion;
  });

  it("does not time out listModels() just before the deadline", async () => {
    let resolveIt: ((names: string[]) => void) | undefined;
    const guarded = withTimeoutGuard(
      stubProvider({
        listModels: () => new Promise((resolve) => { resolveIt = resolve; })
      })
    );
    const result = guarded.listModels();
    await vi.advanceTimersByTimeAsync(LOCAL_SERVER_PROBE_TIMEOUT_MS - 1000);
    resolveIt?.(["a-model"]);
    await expect(result).resolves.toEqual(["a-model"]);
  });

  it("a caller's own cancel still surfaces as a plain AbortError, not a timeout", async () => {
    const controller = new AbortController();
    const guarded = withTimeoutGuard(
      stubProvider({
        chat: (request) =>
          new Promise((_, reject) => {
            request.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          })
      })
    );
    const result = guarded.chat({ messages: [{ role: "user", content: "hi" }], signal: controller.signal });
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: "AbortError" });
  });

  it("streamChat() resets its deadline on every chunk, so a slow-but-working stream never times out", async () => {
    async function* slowStream(request: { signal?: AbortSignal }): AsyncGenerator<StreamChunk> {
      for (let i = 0; i < 3; i += 1) {
        await new Promise<void>((resolve, reject) => {
          const id = setTimeout(resolve, LOCAL_MODEL_TIMEOUT_MS - 1000);
          request.signal?.addEventListener("abort", () => {
            clearTimeout(id);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
        yield { type: "text_delta", text: `chunk ${i}` };
      }
      yield { type: "done", finishReason: "stop" };
    }
    const guarded = withTimeoutGuard(stubProvider({ streamChat: (request) => slowStream(request) }));
    const chunks: StreamChunk[] = [];
    const gen = guarded.streamChat({ messages: [{ role: "user", content: "hi" }] });
    const drain = (async () => {
      for await (const chunk of gen) chunks.push(chunk);
    })();
    // Three gaps just under the timeout each — would blow a flat, non-reset deadline, but each chunk pokes it back out.
    await vi.advanceTimersByTimeAsync(LOCAL_MODEL_TIMEOUT_MS - 1000);
    await vi.advanceTimersByTimeAsync(LOCAL_MODEL_TIMEOUT_MS - 1000);
    await vi.advanceTimersByTimeAsync(LOCAL_MODEL_TIMEOUT_MS - 1000);
    await drain;
    expect(chunks).toEqual([
      { type: "text_delta", text: "chunk 0" },
      { type: "text_delta", text: "chunk 1" },
      { type: "text_delta", text: "chunk 2" },
      { type: "done", finishReason: "stop" }
    ]);
  });

  it("reports a live countdown via onTick, and null once the request settles", async () => {
    const ticks: (number | null)[] = [];
    let resolveIt: ((v: boolean) => void) | undefined;
    const guarded = withTimeoutGuard(
      stubProvider({ healthCheck: () => new Promise((resolve) => { resolveIt = resolve; }) }),
      (secondsLeft) => ticks.push(secondsLeft)
    );
    const result = guarded.healthCheck();
    await vi.advanceTimersByTimeAsync(2000);
    resolveIt?.(true);
    await result;
    expect(ticks[0]).toBe(Math.round(LOCAL_SERVER_PROBE_TIMEOUT_MS / 1000));
    expect(ticks.some((t) => typeof t === "number" && t < Math.round(LOCAL_SERVER_PROBE_TIMEOUT_MS / 1000))).toBe(true);
    expect(ticks.at(-1)).toBeNull();
  });
});
