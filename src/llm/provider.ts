import type { ChatMessage, CompletionRequest, StreamChunk } from "./types";
import {
  completeOllamaChat,
  DEFAULT_OLLAMA_BASE_URL,
  listOllamaModels,
  normalizeBaseUrl,
  OllamaProvider,
  OllamaRequestError
} from "./ollama";
import { localServerFetch } from "./tauriFetch";

export interface EmbeddingRequest {
  texts: string[];
  signal?: AbortSignal;
}

/** Which local backend the app talks to. Chosen in Settings, never a cloud provider (see assertLocalOnlyBaseUrl). */
export type LlmEngine = "ollama" | "openai-compatible";

/** LM Studio's own default port — a starting placeholder, not a fallback the app silently uses. */
export const DEFAULT_OPENAI_COMPATIBLE_BASE_URL = "http://localhost:1234";

/**
 * The provider-agnostic contract every local model backend implements.
 * "Local" is an explicit rule, not a convention (project_spec.md §9): an
 * adapter must never resolve to a cloud API host, see assertLocalOnlyBaseUrl.
 */
export interface LocalModelProvider {
  readonly name: string;
  chat(request: CompletionRequest): Promise<string>;
  streamChat(request: CompletionRequest): AsyncGenerator<StreamChunk>;
  embed(request: EmbeddingRequest): Promise<number[][]>;
  supportsEmbeddings(): boolean;
  listModels(signal?: AbortSignal): Promise<string[]>;
  healthCheck(signal?: AbortSignal): Promise<boolean>;
}

export class LocalProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalProviderConfigError";
  }
}

export class LocalProviderRequestError extends Error {
  constructor(
    public readonly providerName: string,
    public readonly status: number,
    statusText: string
  ) {
    super(`${providerName} request failed: ${status} ${statusText}`);
    this.name = "LocalProviderRequestError";
  }
}

const CLOUD_HOSTNAME_PATTERNS = [
  /(^|\.)openai\.com$/i,
  /(^|\.)anthropic\.com$/i,
  /(^|\.)googleapis\.com$/i,
  /(^|\.)generativelanguage\.google\.com$/i,
  /(^|\.)azure\.com$/i,
  /(^|\.)cohere\.(ai|com)$/i,
  /(^|\.)together\.(ai|xyz)$/i,
  /(^|\.)groq\.com$/i,
  /(^|\.)openrouter\.ai$/i,
  /(^|\.)perplexity\.ai$/i,
  /(^|\.)mistral\.ai$/i,
  /(^|\.)fireworks\.ai$/i,
  /(^|\.)deepseek\.com$/i
];

export function assertLocalOnlyBaseUrl(baseUrl: string, providerName: string): void {
  let hostname: string;
  try {
    hostname = new URL(baseUrl).hostname;
  } catch {
    throw new LocalProviderConfigError(`${providerName}: "${baseUrl}" is not a valid URL.`);
  }
  if (CLOUD_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new LocalProviderConfigError(
      `${providerName}: "${hostname}" is a cloud API host. kaampi Write only talks to local model servers.`
    );
  }
}

export class LocalModelTimeoutError extends Error {
  constructor(
    public readonly providerName: string,
    public readonly timeoutMs: number
  ) {
    super(`${providerName} didn't respond within ${Math.round(timeoutMs / 1000)}s.`);
    this.name = "LocalModelTimeoutError";
  }
}

/** chat/streamChat/embed — a cold model load can legitimately take a while. Reset on every streamed chunk, so this only ever catches genuine silence, never a slow-but-working reply. */
export const LOCAL_MODEL_TIMEOUT_MS = 120_000;
/** listModels/healthCheck — a metadata GET with no model load involved, so it should answer almost immediately. This is also the one call every app start makes unconditionally, so a hung server here used to freeze that check forever with no error (see BookStore.tsx's historical note on the bug this guard replaces). */
export const LOCAL_SERVER_PROBE_TIMEOUT_MS = 15_000;

function isAbortError(err: unknown): boolean {
  return Boolean(err) && typeof err === "object" && (err as { name?: unknown }).name === "AbortError";
}

/**
 * Bounds one request to `timeoutMs` against an internal AbortController that
 * layers on top of the caller's own signal rather than replacing it — either
 * one aborts the underlying call, but only the internal deadline produces a
 * `timedOut()` of true. `poke()` pushes the deadline back out, for a
 * streaming reply that should only time out on silence, not on total
 * duration. `onTick` (optional) reports the live countdown once a second,
 * for a UI that wants to show it; it's called with `null` once the request
 * settles, as a clear "stop showing a countdown" signal.
 */
function makeTimeoutController(
  callerSignal: AbortSignal | undefined,
  timeoutMs: number,
  onTick?: (secondsLeft: number | null) => void
): { signal: AbortSignal; timedOut: () => boolean; poke: () => void; cleanup: () => void } {
  const internal = new AbortController();
  let timedOut = false;
  let deadline = Date.now() + timeoutMs;

  const fire = () => {
    timedOut = true;
    internal.abort();
  };
  let deadlineId = setTimeout(fire, timeoutMs);
  const tick = () => onTick?.(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
  const tickId = onTick ? setInterval(tick, 1000) : undefined;
  if (onTick) tick();

  const onCallerAbort = () => internal.abort();
  if (callerSignal?.aborted) internal.abort();
  else callerSignal?.addEventListener("abort", onCallerAbort);

  return {
    signal: internal.signal,
    timedOut: () => timedOut,
    poke: () => {
      deadline = Date.now() + timeoutMs;
      clearTimeout(deadlineId);
      deadlineId = setTimeout(fire, timeoutMs);
    },
    cleanup: () => {
      clearTimeout(deadlineId);
      if (tickId !== undefined) clearInterval(tickId);
      callerSignal?.removeEventListener("abort", onCallerAbort);
      onTick?.(null);
    }
  };
}

/**
 * Wraps any LocalModelProvider so every call is bounded, regardless of
 * whether its caller remembers to add its own timeout — the root fix for
 * "No call into LocalModelProvider ever had a client-side timeout" (see
 * BookStore.tsx's historical note; this replaces the handful of call sites
 * that used to wrap themselves individually). A caller's own cancellation
 * (e.g. a Stop button) still works exactly as before and still surfaces as
 * a plain AbortError — only a guard-triggered abort becomes a distinct
 * LocalModelTimeoutError, so existing "was this the user cancelling?" catch
 * blocks elsewhere in the app don't need to change at all.
 */
export function withTimeoutGuard(provider: LocalModelProvider, onTick?: (secondsLeft: number | null) => void): LocalModelProvider {
  async function guardOnce<T>(run: (signal: AbortSignal) => Promise<T>, callerSignal: AbortSignal | undefined, timeoutMs: number): Promise<T> {
    const ctl = makeTimeoutController(callerSignal, timeoutMs, onTick);
    try {
      return await run(ctl.signal);
    } catch (err) {
      if (ctl.timedOut() && isAbortError(err)) throw new LocalModelTimeoutError(provider.name, timeoutMs);
      throw err;
    } finally {
      ctl.cleanup();
    }
  }

  async function* guardStream(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const ctl = makeTimeoutController(request.signal, LOCAL_MODEL_TIMEOUT_MS, onTick);
    try {
      for await (const chunk of provider.streamChat({ ...request, signal: ctl.signal })) {
        ctl.poke();
        yield chunk;
      }
    } catch (err) {
      if (ctl.timedOut() && isAbortError(err)) throw new LocalModelTimeoutError(provider.name, LOCAL_MODEL_TIMEOUT_MS);
      throw err;
    } finally {
      ctl.cleanup();
    }
  }

  return {
    name: provider.name,
    supportsEmbeddings: () => provider.supportsEmbeddings(),
    chat: (request) => guardOnce((signal) => provider.chat({ ...request, signal }), request.signal, LOCAL_MODEL_TIMEOUT_MS),
    streamChat: (request) => guardStream(request),
    embed: (request) => guardOnce((signal) => provider.embed({ ...request, signal }), request.signal, LOCAL_MODEL_TIMEOUT_MS),
    listModels: (signal) => guardOnce((s) => provider.listModels(s), signal, LOCAL_SERVER_PROBE_TIMEOUT_MS),
    healthCheck: (signal) => guardOnce((s) => provider.healthCheck(s), signal, LOCAL_SERVER_PROBE_TIMEOUT_MS)
  };
}

/**
 * Wraps the existing Ollama transport (src/llm/ollama.ts) behind
 * LocalModelProvider, without changing its request/response shapes.
 */
export class OllamaModelProvider implements LocalModelProvider {
  readonly name: string;
  private readonly model: string;
  private readonly baseUrl: string | undefined;
  private readonly fetchImpl: typeof fetch | undefined;
  private readonly contextWindow: number | undefined;

  constructor(config: {
    model: string;
    baseUrl?: string;
    name?: string;
    fetchImpl?: typeof fetch;
    contextWindow?: number;
  }) {
    if (config.baseUrl) assertLocalOnlyBaseUrl(config.baseUrl, config.name ?? "Ollama");
    this.model = config.model;
    this.baseUrl = config.baseUrl;
    this.fetchImpl = config.fetchImpl;
    this.contextWindow = config.contextWindow;
    this.name = config.name ?? `ollama:${config.model}`;
  }

  chat(request: CompletionRequest): Promise<string> {
    return completeOllamaChat({
      model: this.model,
      messages: request.messages,
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      ...(request.maxTokens !== undefined ? { maxTokens: request.maxTokens } : {}),
      ...(request.signal ? { signal: request.signal } : {}),
      ...(this.baseUrl ? { baseUrl: this.baseUrl } : {}),
      ...(this.fetchImpl ? { fetchImpl: this.fetchImpl } : {}),
      ...(this.contextWindow !== undefined ? { contextWindow: this.contextWindow } : {})
    });
  }

  streamChat(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const provider = new OllamaProvider({
      model: this.model,
      ...(this.baseUrl ? { baseUrl: this.baseUrl } : {}),
      ...(this.fetchImpl ? { fetchImpl: this.fetchImpl } : {}),
      ...(this.contextWindow !== undefined ? { contextWindow: this.contextWindow } : {})
    });
    return provider.streamCompletion(request);
  }

  listModels(signal?: AbortSignal): Promise<string[]> {
    return listOllamaModels({
      ...(this.baseUrl ? { baseUrl: this.baseUrl } : {}),
      ...(this.fetchImpl ? { fetchImpl: this.fetchImpl } : {}),
      ...(signal ? { signal } : {})
    });
  }

  async healthCheck(signal?: AbortSignal): Promise<boolean> {
    try {
      await this.listModels(signal);
      return true;
    } catch {
      return false;
    }
  }

  supportsEmbeddings(): boolean {
    return true;
  }

  async embed(request: EmbeddingRequest): Promise<number[][]> {
    const fetchImpl = this.fetchImpl ?? localServerFetch();
    const response = await fetchImpl(`${normalizeBaseUrl(this.baseUrl ?? DEFAULT_OLLAMA_BASE_URL)}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: JSON.stringify({ model: this.model, input: request.texts })
    });
    if (!response.ok) {
      throw new OllamaRequestError(response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const embeddings = (payload as { embeddings?: unknown })?.embeddings;
    if (!Array.isArray(embeddings)) {
      throw new Error("Ollama returned no embeddings.");
    }
    return embeddings as number[][];
  }
}

interface OpenAiChatChunk {
  choices?: Array<{ delta?: { content?: unknown }; finish_reason?: unknown }>;
}

/**
 * Second adapter (LM Studio, llama.cpp-server, etc.): the OpenAI-compatible
 * REST contract they share, hit against a caller-supplied local baseUrl —
 * never a default, since these servers run on arbitrary local ports.
 */
export class OpenAICompatibleLocalProvider implements LocalModelProvider {
  readonly name: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: { model: string; baseUrl: string; name?: string; fetchImpl?: typeof fetch }) {
    assertLocalOnlyBaseUrl(config.baseUrl, config.name ?? "Local OpenAI-compatible server");
    this.model = config.model;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.name = config.name ?? `local-openai:${config.model}`;
    this.fetchImpl = config.fetchImpl ?? localServerFetch();
  }

  private chatBody(messages: ChatMessage[], stream: boolean, temperature?: number, maxTokens?: number) {
    return JSON.stringify({
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream,
      ...(temperature !== undefined ? { temperature } : {}),
      ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {})
    });
  }

  async chat(request: CompletionRequest): Promise<string> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: this.chatBody(request.messages, false, request.temperature, request.maxTokens)
    });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const choice = (payload as { choices?: Array<{ message?: { content?: unknown }; finish_reason?: unknown }> })?.choices?.[0];
    const content = choice?.message?.content;
    const reasoningTokens = (
      payload as { usage?: { completion_tokens_details?: { reasoning_tokens?: unknown } } }
    )?.usage?.completion_tokens_details?.reasoning_tokens;
    const reasoningAteTheBudget =
      typeof reasoningTokens === "number" && typeof request.maxTokens === "number" && reasoningTokens >= request.maxTokens * 0.9;
    // Checked before the empty-reply case below: a reasoning model that burns
    // its budget on hidden "thinking" can finish with no visible content at
    // all, which used to surface as the far less useful "empty reply" — a
    // tester's LM Studio log showed this exact shape (1797 of a 1800-token
    // budget spent on reasoning, finish_reason not even "length").
    if (choice?.finish_reason === "length" || reasoningAteTheBudget) {
      const reasoningNote =
        typeof reasoningTokens === "number" && reasoningTokens > 0
          ? ` ${reasoningTokens} of those tokens went to the model's own hidden reasoning before it could start answering — if it has a "thinking"/reasoning toggle, try turning it off, or give it a larger reply budget.`
          : "";
      throw new Error(
        `${this.name}'s reply was cut off at the ${request.maxTokens ?? "?"}-token limit (maxTokens) before it finished — the model needed more room than this request allowed, not a model failure.${reasoningNote}`
      );
    }
    if (typeof content !== "string" || !content.trim()) {
      throw new Error(`${this.name} returned an empty reply.`);
    }
    return content;
  }

  async *streamChat(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: this.chatBody(request.messages, true, request.temperature, request.maxTokens)
    });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    if (!response.body) {
      throw new Error(`${this.name} response had no readable body.`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let receivedText = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const result = this.parseSseLine(line);
          if (!result) continue;
          if (result.type === "text_delta") receivedText = true;
          if (result.type === "done" && !receivedText) {
            yield this.emptyStreamError();
            return;
          }
          yield result;
          if (result.type === "done" || result.type === "error") return;
        }
      }
      if (!receivedText) yield this.emptyStreamError();
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * The server closed the connection having streamed `finish_reason` (or
   * nothing at all) without ever sending `delta.content` — the exact
   * symptom a reasoning/thinking model produces when it streams its answer
   * as `delta.reasoning_content` (or another field this app doesn't read)
   * instead of `delta.content`: the server's own token counter shows real
   * output, but every chunk here parses to nothing. Previously this ended
   * the generator silently, so Draft/Recast/etc. quietly kept whatever
   * prose was already there with no error at all — indistinguishable from
   * "nothing changed" until a tester noticed the model clearly ran (their
   * own server logged ~900 output tokens) but the editor stayed untouched.
   * Mirrors the same guard `chat()` already has for a non-streaming empty
   * reply, so both paths fail loudly instead of one of them failing silently.
   */
  private emptyStreamError(): StreamChunk {
    return {
      type: "error",
      message: `${this.name} finished without sending any reply text. If this is a reasoning/thinking model, check whether it streams its answer as reasoning content rather than the final reply — kaampi Write only reads the final reply.`
    };
  }

  private parseSseLine(line: string): StreamChunk | undefined {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return undefined;
    const data = trimmed.slice("data:".length).trim();
    if (!data) return undefined;
    if (data === "[DONE]") return { type: "done", finishReason: "stop" };
    let parsed: OpenAiChatChunk;
    try {
      parsed = JSON.parse(data) as OpenAiChatChunk;
    } catch {
      return { type: "error", message: `Unparseable SSE line from ${this.name}: ${data}` };
    }
    const choice = parsed.choices?.[0];
    const text = choice?.delta?.content;
    if (typeof text === "string" && text.length > 0) return { type: "text_delta", text };
    if (choice?.finish_reason === "length") return { type: "done", finishReason: "length" };
    if (choice?.finish_reason === "stop") return { type: "done", finishReason: "stop" };
    return undefined;
  }

  async listModels(signal?: AbortSignal): Promise<string[]> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/models`, { method: "GET", signal: signal ?? null });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const data = (payload as { data?: unknown })?.data;
    if (!Array.isArray(data)) return [];
    return data
      .map((entry) => (entry && typeof entry === "object" && "id" in entry ? (entry as { id: unknown }).id : undefined))
      .filter((id): id is string => typeof id === "string" && id.length > 0);
  }

  async healthCheck(signal?: AbortSignal): Promise<boolean> {
    try {
      await this.listModels(signal);
      return true;
    } catch {
      return false;
    }
  }

  supportsEmbeddings(): boolean {
    return true;
  }

  async embed(request: EmbeddingRequest): Promise<number[][]> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: JSON.stringify({ model: this.model, input: request.texts })
    });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const data = (payload as { data?: unknown })?.data;
    if (!Array.isArray(data)) {
      throw new Error(`${this.name} returned no embeddings.`);
    }
    return data.map((entry) => {
      const embedding = (entry && typeof entry === "object" ? (entry as { embedding?: unknown }).embedding : undefined);
      if (!Array.isArray(embedding)) {
        throw new Error(`${this.name} returned a malformed embedding.`);
      }
      return embedding as number[];
    });
  }
}
