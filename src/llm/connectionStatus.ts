import { isTauri } from "@tauri-apps/api/core";
import { normalizeBaseUrl, OllamaRequestError } from "./ollama";
import {
  LocalModelTimeoutError,
  LocalProviderConfigError,
  LocalProviderRequestError,
  OllamaModelProvider,
  OpenAICompatibleLocalProvider,
  withTimeoutGuard,
  type LlmEngine
} from "./provider";

/**
 * What the app can honestly say about the local model server, instead of one
 * "failed to fetch" for everything. The distinctions matter because each one
 * needs different advice: nothing answering is not a CORS problem, and a
 * server with no models pulled is not "start Ollama".
 */
export type ConnectionStatus =
  | { kind: "checking" }
  | { kind: "connected"; models: string[] }
  /** The server answered, but its model list is empty. */
  | { kind: "no-models" }
  /** Nothing answered at that address: not installed, not started, or the wrong address. */
  | { kind: "unreachable" }
  /** Something answered, but the browser's CORS check stopped us reading it. Web app only. */
  | { kind: "blocked" }
  /** The server answered and refused the request — typically because it requires an API key. */
  | { kind: "refused"; status: number }
  | { kind: "timeout" }
  /** The OpenAI-compatible engine has no address configured. */
  | { kind: "no-address" }
  | { kind: "error"; message: string };

export type ProbeOptions = {
  /** Replaces the transport, for tests. */
  fetchImpl?: typeof fetch;
  /** The desktop app routes requests through Rust, where CORS does not exist. Defaults to `isTauri()`. */
  desktop?: boolean;
  /** Replaces the `no-cors` follow-up request, for tests. */
  noCorsFetch?: typeof fetch;
};

const NO_CORS_TIMEOUT_MS = 5_000;
const NETWORK_FAILURE = /failed to fetch|networkerror|load failed/i;

/**
 * Asks the configured server for its models and says what happened. A plain
 * `fetch` fails identically (`TypeError: Failed to fetch`) whether nothing is
 * listening or the server is up but sends no CORS headers, so after a
 * network failure in the browser one more request is made in `no-cors` mode:
 * it resolves (as an opaque response) whenever something is listening, and
 * rejects when nothing is. That is the whole difference between "blocked" and
 * "unreachable".
 */
export async function probeConnection(
  engine: LlmEngine,
  baseUrl: string,
  options: ProbeOptions = {}
): Promise<ConnectionStatus> {
  const trimmed = baseUrl.trim();
  if (engine === "openai-compatible" && !trimmed) return { kind: "no-address" };
  try {
    const transport = options.fetchImpl ? { fetchImpl: options.fetchImpl } : {};
    const raw =
      engine === "openai-compatible"
        ? new OpenAICompatibleLocalProvider({ model: "", baseUrl: trimmed, ...transport })
        : new OllamaModelProvider({ model: "", ...(trimmed ? { baseUrl: trimmed } : {}), ...transport });
    const models = await withTimeoutGuard(raw).listModels();
    return models.length > 0 ? { kind: "connected", models } : { kind: "no-models" };
  } catch (err) {
    return classifyProbeError(err, engine, trimmed, options);
  }
}

async function classifyProbeError(
  err: unknown,
  engine: LlmEngine,
  baseUrl: string,
  options: ProbeOptions
): Promise<ConnectionStatus> {
  if (err instanceof LocalModelTimeoutError) return { kind: "timeout" };
  if (err instanceof LocalProviderConfigError) return { kind: "error", message: err.message };
  const message = err instanceof Error ? err.message : String(err);

  if (err instanceof OllamaRequestError || err instanceof LocalProviderRequestError) {
    return err.status === 401 || err.status === 403 ? { kind: "refused", status: err.status } : { kind: "error", message };
  }

  const desktop = options.desktop ?? isTauri();
  if (desktop) {
    // No CORS exists on this path, so any transport-level failure means nothing answered. A reachable
    // server that sent something unreadable is a different problem and keeps its own message.
    return err instanceof SyntaxError ? { kind: "error", message } : { kind: "unreachable" };
  }
  if (err instanceof TypeError || NETWORK_FAILURE.test(message)) {
    const answers = await serverAnswers(probeUrl(engine, baseUrl), options.noCorsFetch ?? globalThis.fetch.bind(globalThis));
    return { kind: answers ? "blocked" : "unreachable" };
  }
  return { kind: "error", message };
}

function probeUrl(engine: LlmEngine, baseUrl: string): string {
  return engine === "openai-compatible"
    ? `${baseUrl.replace(/\/$/, "")}/v1/models`
    : `${normalizeBaseUrl(baseUrl || undefined)}/api/tags`;
}

async function serverAnswers(url: string, fetchImpl: typeof fetch): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NO_CORS_TIMEOUT_MS);
  try {
    await fetchImpl(url, { mode: "no-cors", signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
