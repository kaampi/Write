import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Book } from "@core/BookSchema";
import type { LocalModelProvider } from "@llm/provider";
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
  bookRef: MutableRefObject<Book | null>;
  chapterRef: MutableRefObject<string | null>;
  abortRef: MutableRefObject<AbortController | null>;
  busy: Busy;
  setBusy: Dispatch<SetStateAction<Busy>>;
  setError: Dispatch<SetStateAction<string | null>>;
  models: string[];
  ollamaError: string | null;
  model: string;
  reviewModel: string;
  flushSave: (next: Book) => Promise<void>;
  patchBook: (mutate: (current: Book) => Book) => Promise<void>;
  recordPrompt: (operation: PromptOperation, model: string, messages: PromptDebugMessage[], target?: PromptDebugTarget) => void;
  recordPromptResponse: (response: string) => void;
  makeProvider: (modelName: string, name?: string) => LocalModelProvider;
  writingSystem: (job: string) => string;
  withInheritedFacts: (book: Book) => Book;
};
