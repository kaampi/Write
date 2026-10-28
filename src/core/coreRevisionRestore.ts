import { parseBook, type Book } from "./BookSchema";
import { newId, nowIso } from "./ids";
import { ManuscriptBackupError, packManuscriptBackup, parseManuscriptBackup, type ManuscriptBackup } from "./manuscriptBackup";

/** The Core workspace and immutable revision must be fetched with kaampi Write's verified identity. */
export type CoreBookRevision = {
  workspace: { id: string; owner_app: string; kind: string; project_id: string | null };
  revision: { id: string; workspace_id: string; body: unknown; deleted: boolean };
};

export type PreparedCoreRestore = {
  backup: ManuscriptBackup;
  source: { workspaceId: string; revisionId: string; bookId: string };
  mode: "same-book" | "new-book";
};

/** Prepare an owner-only full-Book snapshot for the already existing backup import path. Does not save or overwrite anything. */
export function prepareCoreBookRestore(
  source: CoreBookRevision,
  mode: "same-book" | "new-book",
  options: { availableSeriesIds?: ReadonlySet<string>; newBookId?: string; at?: string; currentBook?: Book } = {}
): PreparedCoreRestore {
  if (!source?.workspace || !source.revision ||
      source.workspace.owner_app !== "storybook" || source.workspace.kind !== "private-snapshot" ||
      source.revision.workspace_id !== source.workspace.id || source.revision.deleted ||
      !source.revision.id || !source.workspace.project_id) {
    throw new ManuscriptBackupError("unreadable", "A kaampi Write-owned private Core revision is required.");
  }
  let book: Book;
  try { book = parseBook(source.revision.body); }
  catch { throw new ManuscriptBackupError("unreadable", "The Core revision is not a full kaampi Write manuscript."); }
  if (book.id !== source.workspace.project_id) {
    throw new ManuscriptBackupError("unreadable", "The Core revision belongs to a different manuscript.");
  }

  if (mode === "same-book" && options.currentBook) {
    if (options.currentBook.id !== book.id) {
      throw new ManuscriptBackupError("unreadable", "The current manuscript has a different ID.");
    }
    // A historical source revision can predate the creation of its
    // translation family. Restore its content without orphaning siblings.
    const { translation_group_id: _oldGroup, translated_from_book_id: _oldSource, ...content } = book;
    book = {
      ...content,
      ...(options.currentBook.translation_group_id ? { translation_group_id: options.currentBook.translation_group_id } : {}),
      ...(options.currentBook.translated_from_book_id ? { translated_from_book_id: options.currentBook.translated_from_book_id } : {})
    };
    void _oldGroup; void _oldSource;
  }

  if (mode === "new-book") {
    const id = options.newBookId ?? newId();
    if (!id || id === book.id) throw new ManuscriptBackupError("unreadable", "A new manuscript needs a distinct ID.");
    const { translation_group_id: _group, translated_from_book_id: _source, series_id, ...detached } = book;
    const at = options.at ?? nowIso();
    book = {
      ...detached,
      id,
      created_at: at,
      updated_at: at,
      chapters: book.chapters.map((chapter) => {
        const { translated_from_chapter_id: _chapter, translated_from_snapshot: _snapshot, ...independent } = chapter;
        return independent;
      }),
      ...(series_id && options.availableSeriesIds?.has(series_id) ? { series_id } : {})
    };
    void _group; void _source;
  }

  // The familiar file import validates this same envelope. Its derived
  // adaptationChapters come from the validated Book, not from Core metadata.
  const backup = parseManuscriptBackup(packManuscriptBackup(book, "", options.at ?? nowIso()));
  return {
    backup,
    source: { workspaceId: source.workspace.id, revisionId: source.revision.id, bookId: source.workspace.project_id },
    mode
  };
}
