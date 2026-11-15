import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Book, EditorSurface } from "@core/BookSchema";
import type { ProseFormattingRange } from "@core/proseFormatting";
import type { ChapterFeedback } from "@core/chapterFeedback";
import type { CriticItem } from "@core/critics";
import type { Darling } from "@core/darlings";
import type { Placeholder } from "@core/placeholders";
import type { ProseHistoryOp } from "@core/proseHistory";
import type { LocalModelProvider } from "@llm/provider";
import type { BookRepository } from "@persistence/Repository";
import type { PromptDebugMessage, PromptDebugTarget, PromptOperation } from "../promptDebug";
import type { Busy } from "../useBookStore";

/**
 * What every AI action in BookStore needs from the store around it: the open
 * book, the one running request (`busy`/`abortRef`), where errors go, whether a
 * model is reachable, the configured provider, and the save/record helpers.
 * `BookStoreProvider` builds this each render and hands it to the action hooks
 * (`useConversationActions`, ...). Internal to the store — nothing outside
 * `src/ui/bookStore/` sees it, and `useBookStore.ts` is unchanged.
 *
 * The values are the same ones the actions used to close over directly, and the
 * hooks destructure them at the top so each `useCallback` keeps listing exactly
 * the dependencies it always did.
 */
export type AiContext = {
  repo: BookRepository;
  book: Book | null;
  bookRef: MutableRefObject<Book | null>;
  setBook: Dispatch<SetStateAction<Book | null>>;
  setModelAsides: Dispatch<SetStateAction<string[]>>;
  chapterRef: MutableRefObject<string | null>;
  surfaceRef: MutableRefObject<EditorSurface>;
  historyLimitRef: MutableRefObject<number>;
  contextWindowRef: MutableRefObject<number>;
  abortRef: MutableRefObject<AbortController | null>;
  busy: Busy;
  setBusy: Dispatch<SetStateAction<Busy>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setChapterFeedback: Dispatch<SetStateAction<ChapterFeedback | null>>;
  setCriticFeedback: Dispatch<SetStateAction<{ chapterId: string; items: CriticItem[] } | null>>;
  models: string[];
  ollamaError: string | null;
  model: string;
  reviewModel: string;
  translateModel: string;
  flushSave: (next: Book) => Promise<void>;
  patchBook: (mutate: (current: Book) => Book) => Promise<void>;
  persistProseWrite: (
    latest: Book,
    id: string,
    assembled: string,
    op: ProseHistoryOp,
    before: string,
    formatting?: ProseFormattingRange[],
    placeholders?: Placeholder[],
    darlings?: Darling[]
  ) => Promise<void>;
  manuscriptFromModel: (raw: string, fallback: string) => string;
  recordPrompt: (operation: PromptOperation, model: string, messages: PromptDebugMessage[], target?: PromptDebugTarget) => void;
  recordPromptResponse: (response: string) => void;
  makeProvider: (modelName: string, name?: string) => LocalModelProvider;
  writingSystem: (job: string) => string;
  withInheritedFacts: (book: Book) => Book;
};
