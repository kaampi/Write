import React, { useEffect, useState } from "react";
import type { Book, BookSummary, Chapter } from "@core/BookSchema";
import { languageGroup, sourceChangesSinceTranslation, translationStatus } from "@core/translation";
import { HistorySplit } from "./ChapterHistoryCard";
import { useLocale } from "./i18n";

/**
 * Switches between a manuscript's language versions, or spins off a new
 * one (roadmap-ideas.md #43) — rendered next to the manuscript title.
 * Siblings come from `summaries` alone (no cross-book load): grouping only
 * needs `translation_group_id`/`prose_language`, already on `BookSummary`.
 */
export function LanguageSwitcher({
  book,
  summaries,
  busy,
  onOpenBook,
  onCreate
}: {
  book: Book;
  summaries: BookSummary[];
  busy: boolean;
  onOpenBook: (id: string) => void;
  onCreate: (language: string) => void;
}) {
  const { messages: m } = useLocale();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const group = languageGroup(summaries, book).filter((item) => item.id !== book.id);
  const currentLabel = book.prose_language.trim() || m.editor.languageSwitcherOriginal;

  return (
    <div className="language-switcher">
      <span className="language-switcher-current" title={m.editor.languageSwitcherCurrentHint}>
        {currentLabel}
      </span>
      {group.map((item) => (
        <button key={item.id} type="button" className="text-button" onClick={() => onOpenBook(item.id)}>
          {item.prose_language?.trim() || m.editor.languageSwitcherOriginal}
        </button>
      ))}
      {adding ? (
        <form
          className="language-switcher-add-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            onCreate(draft.trim());
            setDraft("");
            setAdding(false);
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={m.editor.languageSwitcherNewPlaceholder}
            aria-label={m.editor.languageSwitcherNewPlaceholder}
          />
          <button type="submit" disabled={!draft.trim() || busy}>
            {m.editor.languageSwitcherAdd}
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setAdding(false);
              setDraft("");
            }}
          >
            {m.common.cancel}
          </button>
        </form>
      ) : (
        <button type="button" className="text-button" onClick={() => setAdding(true)} disabled={busy}>
          {m.editor.languageSwitcherNew}
        </button>
      )}
    </div>
  );
}

/**
 * Where a translated chapter stands relative to its source (roadmap-ideas.md
 * #43) — loads the source book/chapter on demand (once per chapter switch,
 * not baked into any shelf summary) to compute `translationStatus`, and
 * offers the same-language diff (`HistorySplit`/`diffProse`, reused from the
 * History panel) when the source has moved on since the last translation.
 */
export function TranslationStatus({
  book,
  chapter,
  busy,
  loadBook,
  onTranslate
}: {
  book: Book;
  chapter: Chapter;
  busy: boolean;
  loadBook: (id: string) => Promise<Book>;
  onTranslate: () => void;
}) {
  const { messages: m } = useLocale();
  const [sourceChapter, setSourceChapter] = useState<Chapter | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const sourceBookId = book.translated_from_book_id;
  const sourceChapterId = chapter.translated_from_chapter_id;

  useEffect(() => {
    setLoaded(false);
    setSourceChapter(undefined);
    setDiffOpen(false);
    if (!sourceBookId || !sourceChapterId) return;
    let cancelled = false;
    void loadBook(sourceBookId)
      .then((source) => {
        if (cancelled) return;
        setSourceChapter(source.chapters.find((item) => item.id === sourceChapterId));
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sourceBookId, sourceChapterId, loadBook]);

  if (!sourceChapterId) return null;
  if (!loaded) return <p className="quiet translation-status">{m.editor.translationStatusLoading}</p>;

  const status = translationStatus(chapter, sourceChapter);
  const label =
    status === "orphaned"
      ? m.editor.translationStatusOrphaned
      : status === "untranslated"
        ? m.editor.translationStatusUntranslated
        : status === "stale"
          ? m.editor.translationStatusStale
          : m.editor.translationStatusCurrent;

  return (
    <div className={`translation-status translation-status-${status}`}>
      <span>{label}</span>
      {status === "stale" && sourceChapter ? (
        <button type="button" className="text-button" onClick={() => setDiffOpen((on) => !on)}>
          {diffOpen ? m.editor.translationStatusHideDiff : m.editor.translationStatusShowDiff}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onTranslate}
        disabled={busy || status === "orphaned" || !sourceChapter?.prose.trim()}
      >
        {status === "untranslated" ? m.editor.translateChapterAction : m.editor.retranslateChapterAction}
      </button>
      {diffOpen && sourceChapter ? (
        <HistorySplit
          hunks={sourceChangesSinceTranslation(chapter, sourceChapter)}
          empty={m.history.same}
          fromLabel={m.editor.translationStatusSnapshotLabel}
          toLabel={m.editor.translationStatusLiveSourceLabel}
          fromKey="translation-snapshot"
          toKey="translation-live-source"
        />
      ) : null}
    </div>
  );
}
