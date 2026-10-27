import type { Book } from "./BookSchema";
import { prepareCoreBookRestore, type CoreBookRevision } from "./coreRevisionRestore";
import { newId } from "./ids";

/** The caller confirms replacement and flushes local edits before invoking this workflow. */
export async function persistCoreRestore(
  source: CoreBookRevision,
  mode: "same-book" | "new-book",
  options: {
    currentBook: Book;
    availableSeriesIds: ReadonlySet<string>;
    idExists: (id: string) => Promise<boolean>;
    save: (book: Book) => Promise<void>;
    checkpointCurrent: (book: Book) => Promise<void>;
    createId?: () => string;
  }
): Promise<Book> {
  if (source.workspace.project_id !== options.currentBook.id) throw new Error("The Core version belongs to another manuscript");
  let newBookId: string | undefined;
  if (mode === "new-book") {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = (options.createId ?? newId)();
      if (candidate !== options.currentBook.id && !(await options.idExists(candidate))) {
        newBookId = candidate;
        break;
      }
    }
    if (!newBookId) throw new Error("Could not allocate a new manuscript ID");
  }
  const prepared = prepareCoreBookRestore(source, mode, {
    availableSeriesIds: options.availableSeriesIds,
    ...(mode === "same-book" ? { currentBook: options.currentBook } : {}),
    ...(newBookId ? { newBookId } : {})
  });
  if (mode === "same-book") await options.checkpointCurrent(options.currentBook);
  await options.save(prepared.backup.book);
  return prepared.backup.book;
}
