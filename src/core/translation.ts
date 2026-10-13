import { createBook, createChapter, sortedChapters, type Book, type BookSummary, type Chapter } from "./BookSchema";
import { newId } from "./ids";
import { proseHash } from "./proofread";
import { diffProse, type ProseDiffHunk } from "./proseDiff";

/**
 * A new, empty-prose language version of `sourceBook` (roadmap-ideas.md
 * #43) — same chapter titles and order, each chapter pointing back at its
 * source counterpart via `translated_from_chapter_id` so "Translate this
 * chapter" and the staleness check know which source chapter to read.
 * Craft/presentation settings (voice, camera, typography, reader) are
 * carried over so the translated edition looks and reads like a sibling,
 * not a blank manuscript; synopsis and Story Bible facts are NOT copied —
 * the Bible stays a single, source-language source of truth per the #43
 * discussion (translate once, maintain separately), and a translator
 * works from the source book's own Bible when translating a chapter.
 *
 * `groupId` is the source's existing `translation_group_id`, or a freshly
 * generated one when this is the source's first translation — the caller
 * must also patch the source book with that id (see `BookStore.tsx`'s
 * `newLanguageVersion`, which does this in the same save).
 */
export function createLanguageVersion(sourceBook: Book, targetLanguage: string): { book: Book; groupId: string } {
  const groupId = sourceBook.translation_group_id ?? newId();
  const sourceChapters = sortedChapters(sourceBook);
  const chapters: Chapter[] = sourceChapters.map((chapter, index) => ({
    ...createChapter(index, chapter.title),
    translated_from_chapter_id: chapter.id
  }));
  const base = createBook(sourceBook.title);
  const book: Book = {
    ...base,
    chapters: chapters.length > 0 ? chapters : base.chapters,
    pov: sourceBook.pov,
    tense: sourceBook.tense,
    viewpoint: sourceBook.viewpoint,
    voice: sourceBook.voice,
    illustration_style: sourceBook.illustration_style,
    illustration_orientation: sourceBook.illustration_orientation,
    drop_cap_lines: sourceBook.drop_cap_lines,
    body_font: sourceBook.body_font,
    body_font_weight: sourceBook.body_font_weight,
    body_color_dark: sourceBook.body_color_dark,
    body_color_light: sourceBook.body_color_light,
    scene_break_style: sourceBook.scene_break_style,
    reader_age: sourceBook.reader_age,
    proofread_thoroughness: sourceBook.proofread_thoroughness,
    prose_language: targetLanguage.trim(),
    translation_group_id: groupId,
    translated_from_book_id: sourceBook.id
  };
  return { book, groupId };
}

export type TranslationStatus = "none" | "untranslated" | "stale" | "current" | "orphaned";

/**
 * Where a translated chapter stands relative to its source counterpart.
 * "orphaned" means the source chapter this one points at no longer
 * exists (discarded or the source book itself deleted) — a dangling
 * reference, same "just resolves to nothing" handling as any other stale
 * id in this schema (see `clearPointersTo`'s doc comment). `sourceChapter`
 * is `undefined` in that case.
 */
export function translationStatus(chapter: Chapter, sourceChapter: Chapter | undefined): TranslationStatus {
  if (chapter.translated_from_chapter_id === undefined) return "none";
  if (!sourceChapter) return "orphaned";
  if (!chapter.prose.trim()) return "untranslated";
  if (chapter.translated_from_snapshot === undefined) return "stale";
  return proseHash(chapter.translated_from_snapshot) === proseHash(sourceChapter.prose) ? "current" : "stale";
}

/** Same-language diff of the source prose this translation was last made from vs. its current live prose. */
export function sourceChangesSinceTranslation(chapter: Chapter, sourceChapter: Chapter): ProseDiffHunk[] {
  return diffProse(chapter.translated_from_snapshot ?? "", sourceChapter.prose);
}

/** Writes a freshly translated (or re-translated) chapter and snapshots the source prose it was made from. */
export function acceptTranslation(chapter: Chapter, translatedProse: string, sourceChapterProse: string): Chapter {
  return {
    ...chapter,
    prose: translatedProse,
    translated_from_snapshot: sourceChapterProse
  };
}

/**
 * Every manuscript sharing `current`'s translation group (its own id when
 * it has no group yet, so a never-translated book still returns itself as
 * a singleton group), source first then by language. Operates on
 * `BookSummary` so the shelf (Home.tsx) and the in-editor language
 * switcher can group/list without loading every sibling's full `Book`.
 */
export function languageGroup(
  summaries: BookSummary[],
  current: Pick<BookSummary, "id" | "translation_group_id" | "translated_from_book_id">
): BookSummary[] {
  const key = current.translation_group_id ?? current.id;
  return summaries
    .filter((summary) => (summary.translation_group_id ?? summary.id) === key)
    .sort((a, b) => {
      const aSource = a.translated_from_book_id === undefined;
      const bSource = b.translated_from_book_id === undefined;
      if (aSource !== bSource) return aSource ? -1 : 1;
      return (a.prose_language ?? "").localeCompare(b.prose_language ?? "");
    });
}

/** Every distinct translation group in `summaries`, each as its own sorted `languageGroup`, first-seen order. */
export function groupManuscripts(summaries: BookSummary[]): BookSummary[][] {
  const seen = new Set<string>();
  const groups: BookSummary[][] = [];
  for (const summary of summaries) {
    const key = summary.translation_group_id ?? summary.id;
    if (seen.has(key)) continue;
    seen.add(key);
    groups.push(languageGroup(summaries, summary));
  }
  return groups;
}
