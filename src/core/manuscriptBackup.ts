import { parseBook, sortedChapters, type Book } from "./BookSchema";
import { exportableScenes } from "./bookScene";
import { SANDBOX_LIBRARY_KIND } from "./sandboxExport";
import { slugify } from "./ids";
import { buildManuscriptExport, formatExportMarkdown } from "./manuscriptExport";

export const MANUSCRIPT_BACKUP_KIND = "storybook-ai.manuscript";
/**
 * Format 2 adds `adaptationChapters` (below) alongside the unchanged `book`
 * field — for an external reader (e.g. a comic-adaptation tool) that wants
 * chapters/scenes in reading order without having to know `book.chapters`
 * isn't stored pre-sorted or pre-filtered of discarded chapters. `book`
 * itself is untouched by the bump: restore (parseManuscriptBackup) only
 * ever reads `book`, so a format-1 backup and a format-2 backup round-trip
 * through this app identically — the new field is additive, read by
 * external consumers only.
 */
export const MANUSCRIPT_BACKUP_FORMAT = 2;

/** One scene within an `adaptationChapters` entry — see its own doc comment. */
export type ManuscriptBackupScene = {
  id: string;
  sequence_index: number;
  /** Missing when the author never titled this scene. */
  title?: string;
  /**
   * The scene's own slice of the chapter's prose — the source of "what
   * actually happens" at scene granularity. Always present, even if empty
   * (a scene with no prose yet still exports as "", not an omitted field).
   */
  description: string;
  /** The scene's own writing instruction (SceneMeta.brief) — focus notes, required beats, anything editorial for this scene only. Missing when none was written. */
  instructions?: string;
};

/**
 * One chapter, pre-sorted into reading order and pre-filtered of discarded
 * chapters — unlike `book.chapters`, which stores both in insertion order
 * and needs `sortedChapters`/`isLiveChapter` to read correctly. Built for
 * an external reader that wants to walk chapters and scenes directly
 * without reimplementing those two rules.
 */
export type ManuscriptBackupChapter = {
  id: string;
  sequence_index: number;
  title: string;
  /** chapter.brief verbatim — always present, "" when the author left it empty. */
  brief: string;
  /** chapter.prose verbatim. */
  prose: string;
  /**
   * Always at least one entry — a chapter the author never explicitly
   * split into scenes still gets a single scene spanning its whole prose
   * (same convention `chapterScenes` uses everywhere else in the app), so
   * this is never an empty array for a chapter with any prose at all.
   */
  scenes: ManuscriptBackupScene[];
};

export type ManuscriptBackup = {
  kind: typeof MANUSCRIPT_BACKUP_KIND;
  format: number;
  exportedAt: string;
  note: string;
  book: Book;
  /** See ManuscriptBackupChapter's doc comment. Missing on a format-1 backup read by a format-2-aware parser — treat that the same as an empty array. */
  adaptationChapters: ManuscriptBackupChapter[];
};

function buildAdaptationChapters(book: Book): ManuscriptBackupChapter[] {
  return sortedChapters(book).map((chapter) => ({
    id: chapter.id,
    sequence_index: chapter.sequence_index,
    title: chapter.title,
    brief: chapter.brief,
    prose: chapter.prose,
    scenes: exportableScenes(chapter).map((scene) => ({
      id: scene.id,
      sequence_index: scene.sequence_index,
      ...(scene.title ? { title: scene.title } : {}),
      description: scene.prose,
      ...(scene.brief ? { instructions: scene.brief } : {})
    }))
  }));
}

export type ManuscriptBackupErrorCode =
  | "not-backup"
  | "sandbox-export"
  | "not-manuscript"
  | "newer-format"
  | "unreadable";

export class ManuscriptBackupError extends Error {
  readonly code: ManuscriptBackupErrorCode;

  constructor(code: ManuscriptBackupErrorCode, message: string) {
    super(message);
    this.name = "ManuscriptBackupError";
    this.code = code;
  }
}

export function packManuscriptBackup(book: Book, note = "", exportedAt = new Date().toISOString()): ManuscriptBackup {
  return {
    kind: MANUSCRIPT_BACKUP_KIND,
    format: MANUSCRIPT_BACKUP_FORMAT,
    exportedAt,
    note: note.trim(),
    book,
    adaptationChapters: buildAdaptationChapters(book)
  };
}

export function parseManuscriptBackup(input: unknown): ManuscriptBackup {
  if (!input || typeof input !== "object") {
    throw new ManuscriptBackupError("not-backup", "That file is not a manuscript backup.");
  }
  const row = input as Record<string, unknown>;
  if (row.kind === SANDBOX_LIBRARY_KIND) {
    throw new ManuscriptBackupError("sandbox-export", "That file is a Sandbox card export. Import it in Sandbox, not here.");
  }
  if (row.kind !== MANUSCRIPT_BACKUP_KIND) {
    throw new ManuscriptBackupError("not-manuscript", "That file is not a StoryBook manuscript backup.");
  }
  const format = typeof row.format === "number" ? row.format : MANUSCRIPT_BACKUP_FORMAT;
  if (format > MANUSCRIPT_BACKUP_FORMAT) {
    throw new ManuscriptBackupError("newer-format", "This backup is from a newer StoryBook. Update the app, then try again.");
  }
  let book: Book;
  try {
    book = parseBook(row.book);
  } catch {
    throw new ManuscriptBackupError("unreadable", "The manuscript inside this file could not be read.");
  }
  return {
    kind: MANUSCRIPT_BACKUP_KIND,
    format,
    exportedAt: typeof row.exportedAt === "string" ? row.exportedAt : new Date().toISOString(),
    note: typeof row.note === "string" ? row.note.trim() : "",
    book,
    // Derived fresh from `book` rather than trusted from the file — stays
    // correct even for a format-1 backup (which has no such field at all)
    // and can't drift from whatever `book` actually contains.
    adaptationChapters: buildAdaptationChapters(book)
  };
}

export function manuscriptBackupBasename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${fileSlug(book)}-backup-${dayStamp(exportedAt)}`;
}

export function manuscriptBackupFilename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${manuscriptBackupBasename(book, exportedAt)}.json`;
}

export function manuscriptReplaceWarning(title: string): string {
  return `Replace “${title}” with this backup? Anything written since that backup will be lost.`;
}

/** True when no JSON backup is recorded, or the manuscript has changed since that backup. */
export function manuscriptNeedsJsonBackup(updatedAt: string, lastJsonBackupAt: string | null): boolean {
  if (!lastJsonBackupAt) return true;
  return updatedAt > lastJsonBackupAt;
}

export function manuscriptExportBasename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${fileSlug(book)}-${dayStamp(exportedAt)}`;
}

export function manuscriptReadableFilename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${manuscriptExportBasename(book, exportedAt)}.md`;
}

/** Keep a user-typed name, force the extension, strip characters a filesystem will reject. */
export function ensureDownloadFilename(name: string, ext: string, fallback = "manuscript"): string {
  const suffix = ext.replace(/^\./, "").toLowerCase();
  const cleaned = name
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/[.\s]+$/g, "");
  const stem = (cleaned.replace(/\.[^.]+$/, "") || fallback).replace(/[.\s]+$/g, "") || fallback;
  return `${stem}.${suffix}`;
}

function fileSlug(book: Book): string {
  return slugify(book.title) || "manuscript";
}

function dayStamp(exportedAt: string): string {
  return exportedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);
}

/** Readable copy. Omits brainstorm — that stays in the JSON restore file. */
export function formatManuscriptMarkdown(backup: ManuscriptBackup): string {
  return formatExportMarkdown(buildManuscriptExport(backup.book, backup.note, backup.exportedAt));
}
