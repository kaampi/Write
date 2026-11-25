import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeApiKey, withApiKey } from "@llm/apiKey";
import { readContextWindow, writeContextWindow } from "@llm/contextWindow";
import { localServerFetch } from "@llm/tauriFetch";
import { probeConnection, type ConnectionStatus } from "@llm/connectionStatus";
import {
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_REVIEW_MODEL,
  getOllamaModelContextLength,
  pickListedOllamaModel,
  pickListedReviewModel
} from "@llm/ollama";
import {
  DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
  OllamaModelProvider,
  OpenAICompatibleLocalProvider,
  withTimeoutGuard,
  type LlmEngine,
  type LocalModelProvider
} from "@llm/provider";
import { readProseHistoryLimit, writeProseHistoryLimit } from "@core/proseHistory";
import { clearWritingPrimer, readWritingPrimer, withWritingPrimer, writeWritingPrimer } from "@core/writingPrimer";
import {
  API_KEY_KEY,
  BASE_URL_KEY,
  ENGINE_KEY,
  MODEL_KEY,
  REVIEW_MODEL_KEY,
  TRANSLATE_MODEL_KEY,
  connectionErrorCode,
  readEngine
} from "./helpers";

/**
 * Everything BookStore keeps about the local model: which engine and server
 * address, which models are chosen for writing, reviewing and translating,
 * the context window and history limit, what the server last answered
 * (`connection`, see connectionStatus.ts), and `makeProvider` — the one place
 * a configured provider is built. None of it depends on the open book, which
 * is why it can live apart from the rest of the store.
 *
 * The refs mirror the latest state so the AI callbacks in BookStore (which
 * are memoized and do not list these in their dependencies) always read the
 * current engine, address and limits.
 */
export function useModelSettings() {
  const [models, setModels] = useState<string[]>([]);
  const [model, setModelState] = useState(() => localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL);
  const [writingPrimer, setWritingPrimerState] = useState(() =>
    readWritingPrimer(localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL)
  );
  const [reviewModel, setReviewModelState] = useState(
    () => localStorage.getItem(REVIEW_MODEL_KEY) ?? DEFAULT_REVIEW_MODEL
  );
  /**
   * AI model for chapter translation (roadmap-ideas.md #43). Empty string
   * means "use the Writing model" — unlike `reviewModel`, this has no
   * hardcoded default of its own and no auto-pick-on-model-list-load
   * logic, since falling back to whatever `model` already resolved to is
   * simpler and always valid.
   */
  const [translateModel, setTranslateModelState] = useState(
    () => localStorage.getItem(TRANSLATE_MODEL_KEY) ?? ""
  );
  const [engine, setEngineState] = useState<LlmEngine>(readEngine);
  const [baseUrl, setBaseUrlState] = useState(() => localStorage.getItem(BASE_URL_KEY) ?? "");
  const [apiKey, setApiKeyState] = useState(() => normalizeApiKey(localStorage.getItem(API_KEY_KEY)));
  const [contextWindow, setContextWindowState] = useState(() => readContextWindow());
  const [historyLimit, setHistoryLimitState] = useState(() => readProseHistoryLimit());
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>({ kind: "checking" });

  /**
   * Live countdown (seconds) to the current local-model request's timeout,
   * fed by the same withTimeoutGuard every makeProvider() call already goes
   * through — null whenever nothing is waiting on a response. Only one AI
   * call ever runs at a time (every action already guards on `busy`), so a
   * single shared field is enough; no per-call bookkeeping needed.
   */
  const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);

  const writingPrimerRef = useRef(writingPrimer);
  const historyLimitRef = useRef(historyLimit);
  const engineRef = useRef(engine);
  const baseUrlRef = useRef(baseUrl);
  const apiKeyRef = useRef(apiKey);
  const contextWindowRef = useRef(contextWindow);

  writingPrimerRef.current = writingPrimer;
  historyLimitRef.current = historyLimit;
  engineRef.current = engine;
  baseUrlRef.current = baseUrl;
  apiKeyRef.current = apiKey;
  contextWindowRef.current = contextWindow;


  const writingSystem = (job: string) => withWritingPrimer(job, writingPrimerRef.current);

  function makeProvider(modelName: string, name?: string): LocalModelProvider {
    const raw =
      engineRef.current === "openai-compatible"
        ? new OpenAICompatibleLocalProvider({
            model: modelName,
            baseUrl: baseUrlRef.current.trim() || DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
            ...(apiKeyRef.current ? { apiKey: apiKeyRef.current } : {}),
            ...(name ? { name } : {})
          })
        : new OllamaModelProvider({
            model: modelName,
            contextWindow: contextWindowRef.current,
            ...(baseUrlRef.current.trim() ? { baseUrl: baseUrlRef.current.trim() } : {}),
            ...(apiKeyRef.current ? { apiKey: apiKeyRef.current } : {}),
            ...(name ? { name } : {})
          });
    return withTimeoutGuard(raw, setTimeoutCountdown);
  }

  const connectionRef = useRef(connection);
  connectionRef.current = connection;
  const probeSeq = useRef(0);
  const lastProbeAt = useRef(0);

  /**
   * Asks the configured server what it has and records the honest answer —
   * see connectionStatus.ts for why "nothing answered" and "answered but
   * blocked us" are told apart. `quiet` is for the background re-check
   * when the window regains focus: no "checking" flash, and nothing is
   * touched if the answer is the same as before. A newer check always
   * wins over an older one still in flight.
   */
  const checkConnection = useCallback(async (options: { quiet?: boolean } = {}): Promise<ConnectionStatus> => {
    const seq = ++probeSeq.current;
    lastProbeAt.current = Date.now();
    if (!options.quiet) setConnection({ kind: "checking" });
    const status = await probeConnection(engineRef.current, baseUrlRef.current, { apiKey: apiKeyRef.current });
    if (seq !== probeSeq.current) return status;
    if (options.quiet && JSON.stringify(status) === JSON.stringify(connectionRef.current)) return status;
    setConnection(status);
    setModels(status.kind === "connected" ? status.models : []);
    setOllamaError(connectionErrorCode(status));
    if (status.kind === "connected") {
      const names = status.models;
      const preferred = localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL;
      const picked = pickListedOllamaModel(preferred, names);
      if (picked) {
        setModelState(picked);
        localStorage.setItem(MODEL_KEY, picked);
        setWritingPrimerState(readWritingPrimer(picked));
      }
      const reviewPreferred = localStorage.getItem(REVIEW_MODEL_KEY) ?? DEFAULT_REVIEW_MODEL;
      const reviewPicked = pickListedReviewModel(reviewPreferred, names);
      if (reviewPicked) {
        setReviewModelState(reviewPicked);
        localStorage.setItem(REVIEW_MODEL_KEY, reviewPicked);
      }
    }
    return status;
  }, []);

  useEffect(() => {
    void checkConnection();
  }, [engine, baseUrl, apiKey, checkConnection]);

  // Start Ollama in another window, come back, and it just works — no
  // polling, only a re-check when the window regains focus, and only while
  // there is nothing connected to lose.
  useEffect(() => {
    function recheck() {
      if (document.visibilityState === "hidden") return;
      const kind = connectionRef.current.kind;
      if (kind === "connected" || kind === "checking" || kind === "no-address") return;
      if (Date.now() - lastProbeAt.current < 3000) return;
      void checkConnection({ quiet: true });
    }
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [checkConnection]);

  const setModel = useCallback((name: string) => {
    setModelState(name);
    localStorage.setItem(MODEL_KEY, name);
    setWritingPrimerState(readWritingPrimer(name));
  }, []);

  const setWritingPrimer = useCallback((text: string) => {
    setWritingPrimerState(text);
    writeWritingPrimer(model, text);
  }, [model]);

  const resetWritingPrimer = useCallback(() => {
    clearWritingPrimer(model);
    setWritingPrimerState(readWritingPrimer(model));
  }, [model]);

  const setReviewModel = useCallback((name: string) => {
    setReviewModelState(name);
    localStorage.setItem(REVIEW_MODEL_KEY, name);
  }, []);

  const setTranslateModel = useCallback((name: string) => {
    setTranslateModelState(name);
    localStorage.setItem(TRANSLATE_MODEL_KEY, name);
  }, []);

  const setEngine = useCallback((next: LlmEngine) => {
    setEngineState(next);
    localStorage.setItem(ENGINE_KEY, next);
    if (next === "openai-compatible" && !localStorage.getItem(BASE_URL_KEY)) {
      setBaseUrlState(DEFAULT_OPENAI_COMPATIBLE_BASE_URL);
      localStorage.setItem(BASE_URL_KEY, DEFAULT_OPENAI_COMPATIBLE_BASE_URL);
    }
  }, []);

  const setApiKey = useCallback((value: string) => {
    const next = normalizeApiKey(value);
    setApiKeyState(next);
    if (next) localStorage.setItem(API_KEY_KEY, next);
    else localStorage.removeItem(API_KEY_KEY);
  }, []);

  const setBaseUrl = useCallback((url: string) => {
    setBaseUrlState(url);
    localStorage.setItem(BASE_URL_KEY, url);
  }, []);

  const setContextWindow = useCallback((n: number) => {
    writeContextWindow(n);
    setContextWindowState(readContextWindow());
  }, []);

  /**
   * Pre-fills the context-window field from the connected model's own
   * reported maximum (Ollama only — an OpenAI-compatible server's context
   * length is set when the author loads the model there, not per request,
   * so there is nothing equivalent to ask it for here). Returns the value
   * on success so Settings can show what it found; null on failure or when
   * Ollama doesn't report one, so Settings can say so rather than silently
   * doing nothing.
   */
  const suggestContextWindow = useCallback(async (): Promise<number | null> => {
    if (engineRef.current !== "ollama") return null;
    try {
      const found = await getOllamaModelContextLength({
        model,
        ...(baseUrlRef.current.trim() ? { baseUrl: baseUrlRef.current.trim() } : {}),
        fetchImpl: withApiKey(localServerFetch(), apiKeyRef.current)
      });
      if (found === undefined) return null;
      setContextWindow(found);
      return found;
    } catch {
      return null;
    }
  }, [model, setContextWindow]);

  const setHistoryLimit = useCallback((n: number) => {
    const next = Number.isFinite(n) ? n : readProseHistoryLimit();
    writeProseHistoryLimit(next);
    setHistoryLimitState(readProseHistoryLimit());
  }, []);


  return {
    models,
    model,
    writingPrimer,
    reviewModel,
    translateModel,
    engine,
    baseUrl,
    apiKey,
    contextWindow,
    historyLimit,
    ollamaError,
    connection,
    timeoutCountdown,
    historyLimitRef,
    contextWindowRef,
    writingSystem,
    makeProvider,
    checkConnection,
    setModel,
    setWritingPrimer,
    resetWritingPrimer,
    setReviewModel,
    setTranslateModel,
    setEngine,
    setBaseUrl,
    setApiKey,
    setContextWindow,
    suggestContextWindow,
    setHistoryLimit
  };
}
