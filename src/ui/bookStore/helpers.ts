import { flushSync } from "react-dom";
import { sortedChapters, type Book, type EditorSurface } from "@core/BookSchema";
import { resolveVoice } from "@core/generateProse";
import { resolveReader } from "@core/reader";
import type { ConnectionStatus } from "@llm/connectionStatus";
import { LocalModelTimeoutError, LocalProviderConfigError, type LlmEngine } from "@llm/provider";
import { withReasoningHeadroom } from "@llm/tokenBudget";
import { estimateTokens } from "../promptDebug";
import { STORE_ERROR } from "../i18n";

/**
 * Pure helpers and constants of BookStore.tsx: storage keys, per-operation
 * token budgets, last-position persistence, the connection-error mapping and
 * the voice/reader lookups. Nothing here touches React state, so it can be
 * read (and later tested) on its own.
 */

export const MODEL_KEY = "storybook-ai.model";
export const REVIEW_MODEL_KEY = "storybook-ai.review-model";
export const TRANSLATE_MODEL_KEY = "storybook-ai.translate-model";
export const LAST_BOOK_KEY = "storybook-ai.last-book";
export const ENGINE_KEY = "storybook-ai.engine";
export const BASE_URL_KEY = "storybook-ai.base-url";
/** Optional access token for the local server — device-local, never part of a book or backup (see llm/apiKey.ts). */
export const API_KEY_KEY = "storybook-ai.api-key";
/**
 * A whole unsplit chapter (or a long interview) can hold many facts to
 * enumerate in one JSON response — 1200 was tight enough that a dense
 * chapter routinely got its response cut off mid-array, which then failed
 * to parse at all. `parseExtractorPayload` now salvages a truncated
 * response's complete facts regardless, but a roomier budget means it
 * rarely needs to. Also used as Proofread's shared per-stage token budget,
 * since its "facts" stage runs this same extractor — and Series'
 * extraction calls (SeriesStore.tsx), which import this same constant
 * rather than keeping their own copy. `withReasoningHeadroom` on top: a
 * tester hit this exact 4000-token ceiling on a reasoning model whose
 * hidden "thinking" pass ate most of the budget before any fact JSON
 * came out.
 */
export const EXTRACTOR_MAX_TOKENS = withReasoningHeadroom(4000);

/**
 * Polish rewrites the whole chapter, so the reply needs room for roughly as
 * much prose as it was given — not a flat budget regardless of chapter
 * length, which is what this used to be (1800, always). A real ~4,000-word
 * chapter needs well over 1800 tokens just for the rewritten prose itself,
 * and nothing checked whether the reply actually got that far before this
 * (see completeOllamaChat/OpenAICompatibleLocalProvider.chat's own
 * truncation guards). Scales from the chapter's own estimated token
 * count, with headroom for the rewrite running a little longer than the
 * original, a floor so a short chapter still gets a reasonable budget,
 * and `withReasoningHeadroom` on top for a thinking model's own planning
 * pass.
 */
export function polishMaxTokens(prose: string): number {
  return withReasoningHeadroom(Math.max(1800, Math.ceil(estimateTokens(prose) * 1.3) + 200));
}

/**
 * Analyze's reply is a short structured report (strengths/issues), not
 * prose the length of the chapter — a flat budget is the right shape here,
 * unlike Polish's chapter-scaled one. A tester's reasoning model (no
 * "thinking" toggle visible in LM Studio's own UI, so nothing suggested it
 * needed one) burned 1797 of this budget's 1800 tokens on hidden reasoning
 * and returned an empty reply — `withReasoningHeadroom` covers that pass
 * on top of the report itself.
 */
export const ANALYZE_MAX_TOKENS = withReasoningHeadroom(1800);

/** Same shape as Analyze's own budget — a critic persona's reply is a short structured list, not prose. */
export const CRITIC_MAX_TOKENS = withReasoningHeadroom(1800);

/**
 * The relationship-mirror rewrite (see `relationshipMirror.ts`) is a single
 * short phrase, not a report — but a reasoning model still spends its own
 * tokens thinking before it writes those few words, same as everywhere else
 * `withReasoningHeadroom` is used.
 */
export const RELATIONSHIP_MIRROR_MAX_TOKENS = withReasoningHeadroom(60);

export function readEngine(): LlmEngine {
  return localStorage.getItem(ENGINE_KEY) === "openai-compatible" ? "openai-compatible" : "ollama";
}

export function lastPositionKey(bookId: string): string {
  return `storybook-ai.last-position.${bookId}`;
}

/** Where you were last time you had this book open — which tab, and which chapter if it was the chapter tab. Falls back to null (caller then uses openingSurface's guess) if nothing is stored, the stored chapter no longer exists, or the value is corrupt. */
export function readLastPosition(book: Book): { surface: EditorSurface; chapterId: string | null } | null {
  const raw = localStorage.getItem(lastPositionKey(book.id));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { surface?: EditorSurface; chapterId?: string | null };
    if (!parsed.surface) return null;
    const chapters = sortedChapters(book);
    const chapterId = parsed.chapterId && chapters.some((chapter) => chapter.id === parsed.chapterId) ? parsed.chapterId : null;
    if (parsed.surface === "chapter" && !chapterId) return null;
    return { surface: parsed.surface, chapterId };
  } catch {
    return null;
  }
}

/**
 * Crossfades between pages via the browser's View Transitions API — Home vs.
 * Editor at the default duration, and the editor's own rail surfaces
 * (Brainstorm, Synopsis, ...) faster since those are clicked far more often.
 * Falls back to a plain state update where unsupported (e.g. Firefox).
 */
export function withViewTransition(update: () => void, durationMs = 320): void {
  if (typeof document.startViewTransition === "function") {
    document.documentElement.style.setProperty("--vt-duration", `${durationMs}ms`);
    document.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

/**
 * The red banner's text for a connection state — null for the states that are
 * not an error but a calm "no local AI yet" (nothing answering, or a server
 * with no models), which Editor.tsx shows as a quiet notice instead.
 */
export function connectionErrorCode(status: ConnectionStatus): string | null {
  switch (status.kind) {
    case "blocked":
      return STORE_ERROR.ollamaOrigins;
    case "refused":
      return STORE_ERROR.serverRefused;
    case "timeout":
      return STORE_ERROR.timeout;
    case "no-address":
      return STORE_ERROR.serverUrlMissing;
    case "error":
      return status.message;
    default:
      return null;
  }
}

export function ollamaHint(error: unknown): string {
  if (error instanceof LocalModelTimeoutError) {
    return STORE_ERROR.timeout;
  }
  if (error instanceof LocalProviderConfigError && error.message === STORE_ERROR.serverUrlMissing) {
    return STORE_ERROR.serverUrlMissing;
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return STORE_ERROR.ollamaOrigins;
  }
  return message;
}

export function activeVoice(book: Book, surface: EditorSurface, chapterId: string | null): string {
  if (surface !== "chapter") return book.voice.trim();
  const chapter = book.chapters.find((item) => item.id === chapterId);
  return resolveVoice(book, chapter);
}

export function activeReader(book: Book, surface: EditorSurface, chapterId: string | null): number | undefined {
  if (surface !== "chapter") return book.reader_age;
  const chapter = book.chapters.find((item) => item.id === chapterId);
  return resolveReader(book, chapter);
}
