import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createBook,
  createChapter,
  openingSurface,
  sortedChapters,
  touch,
  updateChapter,
  type Book,
  type BookSummary
} from "@core/BookSchema";
import { liftFragmentToSynopsis, sendStagedNotesToSynopsis } from "@core/brainstorm";
import { applyMarkerConversion, DEFAULT_MARKER_CONVERSION_RULES, type MarkerConversionRule } from "@core/markerConversion";
import { smartenQuotes } from "@core/smartQuotes";
import { type ChapterFeedback } from "@core/chapterFeedback";
import { type CriticItem } from "@core/critics";
import type { ImportedChapterCandidate } from "@core/manuscriptImport";
import { createLanguageVersion } from "@core/translation";
import { recordProseRevision, type ProseHistoryOp } from "@core/proseHistory";
import { peelModelAsides } from "@core/proseFlow";
import { type ProseFormattingRange } from "@core/proseFormatting";
import { type Placeholder } from "@core/placeholders";
import { type Darling } from "@core/darlings";
import { nowIso } from "@core/ids";
import { mergeInheritedFacts, type NarrativeFact } from "@core/NarrativeFact";
import { BookNotFoundError, BookRepository } from "@persistence/Repository";
import { coreBookSink, coreSnapshotOutbox, flushCoreSnapshots } from "@persistence/CoreSharingRuntime";
import type { CoreBookRevision } from "@core/coreRevisionRestore";
import { persistCoreImport, persistCoreRestore } from "@core/coreRestoreWorkflow";
import { corePrivateRevision, corePrivateVersions } from "@persistence/CoreDesktopTransport";
import { SeriesRepository } from "@persistence/SeriesRepository";
import { ManuscriptBackupError, parseManuscriptBackup } from "@core/manuscriptBackup";
import { forgetLastJsonBackup, recordLastJsonBackup } from "./jsonBackupStamp";
import { type PromptDebugEntry, type PromptDebugMessage, type PromptOperation, type PromptDebugTarget } from "./promptDebug";
import { BookStoreContext, type BookStoreValue, type Busy } from "./useBookStore";
import { format, getMessages, STORE_ERROR } from "./i18n";
import { useModelSettings } from "./bookStore/useModelSettings";
import type { AiContext } from "./bookStore/aiContext";
import { useConversationActions } from "./bookStore/useConversationActions";
import { useReviewActions } from "./bookStore/useReviewActions";
import { useWritingActions } from "./bookStore/useWritingActions";
import { useFacts } from "./bookStore/useFacts";
import { useSurfaceNavigation } from "./bookStore/useSurfaceNavigation";
import { LAST_BOOK_KEY, lastPositionKey, readLastPosition, withViewTransition } from "./bookStore/helpers";

export function BookStoreProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo(() => new BookRepository(undefined, coreBookSink), []);
  const seriesRepo = useMemo(() => new SeriesRepository(), []);
  const [summaries, setSummaries] = useState<BookSummary[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const {
    chapterId,
    setChapterIdState,
    surface,
    setSurface,
    chapterRef,
    surfaceRef,
    setChapterId,
    selectChapter,
    showSettings,
    showBrainstorm,
    showSynopsis,
    showAsk,
    showTimeline,
    showPlotlines,
    showMethod,
    showGuide,
    handbookOpen,
    openHandbook,
    closeHandbook
  } = useSurfaceNavigation(book?.id);
  const {
    models,
    model,
    writingPrimer,
    reviewModel,
    translateModel,
    engine,
    baseUrl,
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
    setContextWindow,
    suggestContextWindow,
    setHistoryLimit
  } = useModelSettings();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [chapterFeedback, setChapterFeedback] = useState<ChapterFeedback | null>(null);
  const [criticFeedback, setCriticFeedback] = useState<{ chapterId: string; items: CriticItem[] } | null>(null);
  const [modelAsides, setModelAsides] = useState<string[]>([]);
  const [lastPrompt, setLastPrompt] = useState<PromptDebugEntry | null>(null);
  const bookRef = useRef<Book | null>(null);
  /**
   * The open book's series' own locked facts, if it belongs to one — kept
   * only for `withInheritedFacts` to merge into prompts (never written
   * back as part of the book's own `facts`). Refetched whenever the open
   * book's `series_id` changes; a prompt built in the brief window before
   * that fetch resolves just sees the book's own facts, same as a book
   * with no series.
   */
  const seriesFactsRef = useRef<NarrativeFact[]>([]);
  /** Same data as `seriesFactsRef`, mirrored into state so Editor.tsx can read it reactively (export, "Send to series" chapter-title lookups elsewhere already use the book itself). */
  const [seriesFacts, setSeriesFacts] = useState<NarrativeFact[]>([]);
  /**
   * True when `book.series_id` is set but that series could not be read —
   * deleted out from under this book, or never synced to this install.
   * Without this, a book in that state was a silent dead end: excluded
   * from Home's standalone shelf (series_id is set) and from "Create
   * series from this book" (same reason), with no series left to open and
   * use "Remove from series" from, and no indication anything was wrong —
   * `seriesFacts` just quietly stayed empty, same as a book with no
   * series at all. BiblePanel surfaces this flag with a way out:
   * `setBookSeries(book.id, undefined)` to make the book standalone again.
   */
  const [seriesMissing, setSeriesMissing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<number | null>(null);

  bookRef.current = book;


  useEffect(() => {
    const seriesId = book?.series_id;
    if (!seriesId) {
      seriesFactsRef.current = [];
      setSeriesFacts([]);
      setSeriesMissing(false);
      return;
    }
    let cancelled = false;
    void seriesRepo.get(seriesId).then(
      (series) => {
        if (!cancelled) {
          seriesFactsRef.current = series.facts;
          setSeriesFacts(series.facts);
          setSeriesMissing(false);
        }
      },
      () => {
        if (!cancelled) {
          seriesFactsRef.current = [];
          setSeriesFacts([]);
          setSeriesMissing(true);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [book?.series_id, seriesRepo]);

  /**
   * Draft/Recast/Interview/Illustration prompts read `book.facts` directly
   * — rather than touch every one of those (generateProse.ts,
   * characterInterview.ts, illustrationPrompt.ts), call sites here pass
   * this book-shaped view instead of the raw one wherever a prompt gets
   * built, so the merge (NarrativeFact.ts's `mergeInheritedFacts`) is the
   * only place inheritance logic lives. Never used for a write — `patchBook`
   * and friends keep mutating the real `book`/`bookRef`, so an inherited
   * series fact is never saved back into the book's own `facts`.
   */
  function withInheritedFacts(b: Book): Book {
    if (!b.series_id || seriesFactsRef.current.length === 0) return b;
    return { ...b, facts: mergeInheritedFacts(b.facts, seriesFactsRef.current) };
  }

  const persist = useCallback(
    async (next: Book) => {
      await repo.save(next);
      setSummaries(await repo.list());
    },
    [repo]
  );

  const refresh = useCallback(async () => {
    setSummaries(await repo.list());
  }, [repo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const last = localStorage.getItem(LAST_BOOK_KEY);
    if (!last) return;
    void repo.get(last).then((loaded) => {
      const remembered = readLastPosition(loaded);
      setBook(loaded);
      setChapterIdState(remembered?.chapterId ?? sortedChapters(loaded)[0]?.id ?? null);
      setSurface(remembered?.surface ?? openingSurface(loaded));
    }).catch(() => {
      localStorage.removeItem(LAST_BOOK_KEY);
    });
  }, [repo]);



  const flushSave = useCallback(async (next: Book) => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    bookRef.current = next;
    setBook(next);
    await persist(next);
  }, [persist]);

  const checkpointBook = useCallback(async () => {
    const current = bookRef.current;
    if (!current) throw new Error("No manuscript is open");
    // Flush debounced edits to the authoritative local store before queuing the copy.
    await flushSave(current);
    await coreSnapshotOutbox.enqueueSave(current);
  }, [flushSave]);

  const restoreCoreRevision = useCallback(async (source: CoreBookRevision, mode: "same-book" | "new-book"): Promise<boolean> => {
    const current = bookRef.current;
    if (!current || source.workspace.project_id !== current.id) throw new Error("The kaampi Codex version belongs to another manuscript");
    if (busy) throw new Error("Wait for the current operation before restoring a manuscript");
    const availableSeriesIds = new Set((await seriesRepo.list()).map(item => item.id));
    if (mode === "same-book" && !window.confirm(format(getMessages().home.replaceConfirm, { title: current.title }))) return false;

    await flushSave(current);
    const restored = await persistCoreRestore(source, mode, {
      currentBook: current,
      availableSeriesIds,
      idExists: id => repo.get(id).then(() => true, error => {
        if (error instanceof BookNotFoundError) return false;
        throw error;
      }),
      save: book => repo.save(book),
      checkpointCurrent: async book => {
        // Keep the current state recoverable before replacing the local row.
        await coreSnapshotOutbox.enqueueSave(book);
        await flushCoreSnapshots();
      }
    });
    bookRef.current = restored;
    setSummaries(await repo.list());
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(null);
    withViewTransition(() => {
      setBook(restored);
      setChapterIdState(sortedChapters(restored)[0]?.id ?? null);
      setSurface(openingSurface(restored));
      setChapterFeedback(null);
      setCriticFeedback(null);
    });
    localStorage.setItem(LAST_BOOK_KEY, restored.id);
    setError(null);
    await coreSnapshotOutbox.enqueueSave(restored);
    try { await flushCoreSnapshots(); } catch { /* locally restored; queued for retry */ }
    return true;
  }, [busy, flushSave, repo, seriesRepo]);

  /**
   * "Import Codex book" (Mats, 2026-10-31: a machine that doesn't have the
   * manuscript locally at all, as opposed to restoreCoreRevision above,
   * which only ever touches the already-open book). Pulls the latest
   * revision for a project_id picked from corePrivateManuscripts and
   * brings it in with its own original identity, same tail as
   * importManuscript's JSON-file path: save, refresh the shelf, open it.
   */
  const importCoreManuscript = useCallback(
    async (projectId: string) => {
      try {
        const versions = await corePrivateVersions(projectId);
        const latest = versions.revisions[0];
        if (!versions.workspace || !latest) {
          setError("This manuscript is no longer available in kaampi Codex");
          return;
        }
        const revision = await corePrivateRevision(latest.id);
        const imported = await persistCoreImport(
          { workspace: versions.workspace, revision },
          {
            idExists: (id) =>
              repo.get(id).then(
                () => true,
                (error) => {
                  if (error instanceof BookNotFoundError) return false;
                  throw error;
                }
              ),
            save: (book) => repo.save(book)
          }
        );
        setSummaries(await repo.list());
        const remembered = readLastPosition(imported);
        withViewTransition(() => {
          setBook(imported);
          setChapterIdState(remembered?.chapterId ?? sortedChapters(imported)[0]?.id ?? null);
          setSurface(remembered?.surface ?? openingSurface(imported));
          setChapterFeedback(null);
          setCriticFeedback(null);
        });
        localStorage.setItem(LAST_BOOK_KEY, imported.id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : STORE_ERROR.shelfUnreadable);
      }
    },
    [repo]
  );

  const persistProseWrite = useCallback(
    async (
      latest: Book,
      id: string,
      assembled: string,
      op: ProseHistoryOp,
      before: string,
      formatting?: ProseFormattingRange[],
      placeholders?: Placeholder[],
      darlings?: Darling[]
    ) => {
      let next = latest;
      if (before !== assembled) {
        next = recordProseRevision(next, id, op, before, historyLimitRef.current);
      }
      await flushSave(
        updateChapter(next, id, {
          prose: assembled,
          ...(formatting ? { formatting } : {}),
          ...(placeholders ? { placeholders } : {}),
          ...(darlings ? { darlings } : {})
        })
      );
    },
    [flushSave]
  );

  const convertMarkersToFormatting = useCallback(
    async (rules: MarkerConversionRule[]) => {
      const current = bookRef.current;
      if (!current) return { totalConversions: 0, chaptersChanged: 0 };
      let next = current;
      let totalConversions = 0;
      let chaptersChanged = 0;
      for (const chapter of current.chapters) {
        const result = applyMarkerConversion(
          chapter.prose,
          chapter.formatting ?? [],
          rules,
          chapter.placeholders ?? [],
          chapter.darlings ?? []
        );
        if (result.count === 0) continue;
        totalConversions += result.count;
        chaptersChanged += 1;
        next = recordProseRevision(next, chapter.id, "format", chapter.prose, historyLimitRef.current);
        next = updateChapter(next, chapter.id, {
          prose: result.prose,
          formatting: result.formatting,
          placeholders: result.placeholders,
          darlings: result.darlings
        });
      }
      if (chaptersChanged > 0) await flushSave(next);
      return { totalConversions, chaptersChanged };
    },
    [flushSave]
  );

  const smartenManuscriptQuotes = useCallback(async () => {
    const current = bookRef.current;
    if (!current) return { chaptersChanged: 0 };
    let next = current;
    let chaptersChanged = 0;
    for (const chapter of current.chapters) {
      const smartened = smartenQuotes(chapter.prose);
      if (smartened === chapter.prose) continue;
      chaptersChanged += 1;
      next = recordProseRevision(next, chapter.id, "format", chapter.prose, historyLimitRef.current);
      next = updateChapter(next, chapter.id, { prose: smartened });
    }
    if (chaptersChanged > 0) await flushSave(next);
    return { chaptersChanged };
  }, [flushSave]);

  const patchBook = useCallback(
    async (mutate: (current: Book) => Book) => {
      const current = bookRef.current;
      if (!current) return;
      const mutated = mutate(current);
      if (mutated === current) return;
      const next = touch(mutated, {
        title: mutated.title.trim() || "Untitled manuscript"
      });
      bookRef.current = next;
      setBook(next);
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void persist(next);
        saveTimer.current = null;
      }, 400);
    },
    [persist]
  );

  /**
   * Assigns (or clears, with `seriesId` undefined) which Series a book
   * belongs to — works on any book, not just the open one, since this is
   * called from the Home shelf where nothing is open yet. Routes through
   * `patchBook` when the target happens to be the currently open book, so
   * its in-memory state and debounced save stay the single code path.
   */
  const setBookSeries = useCallback(
    async (bookId: string, seriesId: string | undefined) => {
      if (bookRef.current?.id === bookId) {
        await patchBook((current) => ({ ...current, series_id: seriesId }));
        return;
      }
      const loaded = await repo.get(bookId);
      await persist(touch(loaded, { series_id: seriesId }));
    },
    [patchBook, persist, repo]
  );

  /**
   * Shelf view's gear dialog (roadmap-ideas.md #58) — cover/spine
   * color/height adjustment/display author. Same "works on any book, not
   * just the open one" shape as setBookSeries, since this is also called
   * from the Home shelf where nothing is open yet.
   *
   * Deliberately does NOT go through `touch`/`patchBook` (both bump
   * `updated_at`, which `summaries` is sorted by) — shelf display settings
   * aren't manuscript content, so editing them shouldn't reorder "Your
   * manuscripts" out from under the author (Mats, 2026-11-04: "när man
   * redigerar en boks info ifrån shelf så hamnar boken automatiskt på
   * första plats").
   */
  const updateShelfSettings = useCallback(
    async (
      bookId: string,
      patch: Partial<Pick<Book, "cover" | "shelf_color" | "shelf_height_adjust" | "shelf_author" | "shelf_description">>
    ) => {
      if (bookRef.current?.id === bookId) {
        const next = { ...bookRef.current, ...patch };
        bookRef.current = next;
        setBook(next);
        await persist(next);
        return;
      }
      const loaded = await repo.get(bookId);
      await persist({ ...loaded, ...patch });
    },
    [persist, repo]
  );

  const openBook = useCallback(
    async (id: string) => {
      const loaded = await repo.get(id);
      const remembered = readLastPosition(loaded);
      withViewTransition(() => {
        setBook(loaded);
        setChapterIdState(remembered?.chapterId ?? sortedChapters(loaded)[0]?.id ?? null);
        setSurface(remembered?.surface ?? openingSurface(loaded));
        setChapterFeedback(null);
        setCriticFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, id);
      setError(null);
    },
    [repo]
  );

  const closeBook = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(null);
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const current = bookRef.current;
    if (current) void persist(current);
    withViewTransition(() => {
      setBook(null);
      setChapterIdState(null);
      setSurface("brainstorm");
      setChapterFeedback(null);
      setCriticFeedback(null);
    });
    localStorage.removeItem(LAST_BOOK_KEY);
    void refresh();
  }, [persist, refresh]);

  /**
   * A book added to an existing series (Mats, 2026-11-03: "Kanske ska bok 2
   * och framåt ärva den förra bokens format och inställningar för
   * typografi etc.") inherits Typography (page size/margin, font, weight,
   * colors, drop cap, scene break) plus the editor backdrop from the
   * series' own most recently updated book — not necessarily its first —
   * so a trilogy stays visually consistent without the author having to
   * redo Settings on every new installment. Writing-instruction fields
   * (pov/tense/voice/viewpoint, polish prompt) are deliberately NOT
   * copied: those are per-book creative choices, not presentation.
   * `summaries` is already sorted newest-updated-first (Repository.list()),
   * so the first match is the series' latest book. Falls back to
   * createBook's own defaults if the source book can't be loaded, or
   * there's no earlier book in this series to inherit from — same as today.
   */
  const newBook = useCallback(
    async (title: string, seriesId?: string) => {
      let typography: Partial<Book> = {};
      const latestInSeries = seriesId ? summaries.find((item) => item.series_id === seriesId) : undefined;
      if (latestInSeries) {
        try {
          const source = await repo.get(latestInSeries.id);
          typography = {
            drop_cap_lines: source.drop_cap_lines,
            body_font: source.body_font,
            body_font_weight: source.body_font_weight,
            body_color_dark: source.body_color_dark,
            body_color_light: source.body_color_light,
            scene_break_style: source.scene_break_style,
            page_size: source.page_size,
            page_margin: source.page_margin,
            editor_background: source.editor_background
          };
        } catch {
          /* fall back to createBook's own defaults */
        }
      }
      const created = { ...createBook(title), ...typography, ...(seriesId ? { series_id: seriesId } : {}) };
      await repo.save(created);
      setSummaries(await repo.list());
      withViewTransition(() => {
        setBook(created);
        setChapterIdState(sortedChapters(created)[0]?.id ?? null);
        setSurface(openingSurface(created));
        setChapterFeedback(null);
        setCriticFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, created.id);
      setError(null);
    },
    [repo, summaries]
  );

  /**
   * "Load sample manuscript" (Files menu) — Arthur Conan Doyle's "The
   * Hound of the Baskervilles" (public domain, 1901-02), bundled as a
   * static asset so a brand-new author has something real to explore the
   * app's features on without having to write anything first (Mats,
   * 2026-11-04: "läser in en bok som är fri... lägger in den som en
   * exempelbok"). The original text as chapter prose, hand-written
   * brief/summary per chapter — not AI-generated (Mats: "Bara
   * originaltexten som prosa").
   */
  const loadSampleManuscript = useCallback(async () => {
    const response = await fetch("/sample-manuscripts/hound-of-the-baskervilles.json");
    if (!response.ok) {
      setError(STORE_ERROR.sampleManuscriptUnavailable);
      return;
    }
    const data = (await response.json()) as {
      title: string;
      shelf_author: string;
      prose_language: string;
      synopsis: string;
      chapters: { title: string; brief: string; summary: string; prose: string }[];
    };
    const created = createBook(data.title);
    const chapters = data.chapters.map((candidate, index) => ({
      ...createChapter(index, candidate.title),
      brief: candidate.brief,
      summary: candidate.summary,
      prose: candidate.prose
    }));
    const book: Book = {
      ...created,
      shelf_author: data.shelf_author,
      prose_language: data.prose_language,
      synopsis: data.synopsis,
      chapters
    };
    await repo.save(book);
    setSummaries(await repo.list());
    withViewTransition(() => {
      setBook(book);
      setChapterIdState(sortedChapters(book)[0]?.id ?? null);
      setSurface(openingSurface(book));
      setChapterFeedback(null);
      setCriticFeedback(null);
    });
    localStorage.setItem(LAST_BOOK_KEY, book.id);
    setError(null);
  }, [repo]);

  const newLanguageVersion = useCallback(
    async (targetLanguage: string) => {
      const current = bookRef.current;
      if (!current) return;
      const { book: created, groupId } = createLanguageVersion(current, targetLanguage);
      if (current.translation_group_id !== groupId) {
        const patchedSource = touch(current, { translation_group_id: groupId });
        await repo.save(patchedSource);
        bookRef.current = patchedSource;
        setBook(patchedSource);
      }
      await repo.save(created);
      setSummaries(await repo.list());
      withViewTransition(() => {
        setBook(created);
        setChapterIdState(sortedChapters(created)[0]?.id ?? null);
        setSurface(openingSurface(created));
        setChapterFeedback(null);
        setCriticFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, created.id);
      setError(null);
    },
    [repo]
  );

  const loadBook = useCallback((id: string) => repo.get(id), [repo]);

  const importManuscript = useCallback(
    async (file: File) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(await file.text()) as unknown;
      } catch {
        setError(STORE_ERROR.notJson);
        return;
      }
      let backup;
      try {
        backup = parseManuscriptBackup(parsed);
      } catch (err) {
        setError(err instanceof ManuscriptBackupError ? err.code : STORE_ERROR.backupUnreadable);
        return;
      }
      let exists = false;
      try {
        await repo.get(backup.book.id);
        exists = true;
      } catch (err) {
        if (!(err instanceof BookNotFoundError)) {
          setError(err instanceof Error ? err.message : STORE_ERROR.shelfUnreadable);
          return;
        }
      }
      if (exists && !window.confirm(format(getMessages().home.replaceConfirm, { title: backup.book.title }))) return;
      const current = bookRef.current;
      if (current && current.id !== backup.book.id) {
        if (saveTimer.current !== null) {
          window.clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        await persist(current);
      }
      abortRef.current?.abort();
      abortRef.current = null;
      setBusy(null);
      await repo.save(backup.book);
      setSummaries(await repo.list());
      const remembered = readLastPosition(backup.book);
      withViewTransition(() => {
        setBook(backup.book);
        setChapterIdState(remembered?.chapterId ?? sortedChapters(backup.book)[0]?.id ?? null);
        setSurface(remembered?.surface ?? openingSurface(backup.book));
        setChapterFeedback(null);
        setCriticFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, backup.book.id);
      recordLastJsonBackup(backup.book.id, new Date().toISOString());
      setError(null);
    },
    [persist, repo]
  );

  /**
   * Builds a brand-new manuscript from chapters already parsed from a
   * plain text/Markdown file — source-agnostic rather than tied to one
   * writing tool's export (the idea started from Novelcrafter specifically,
   * but the format itself has nothing Novelcrafter-specific about it). A
   * genuinely format-specific adapter (Scrivener's .scrivx+RTF, Sudowriter's
   * JSON) would need its own parser feeding the same `ImportedChapterCandidate`
   * shape, per roadmap-ideas.md #28's layering.
   * Runs each chapter's prose through the same marker-conversion rules the
   * "Convert markers to formatting" tool uses (an imported manuscript's
   * `*italic*`/`**bold**` markers are exactly the kind of leftover-from-
   * another-tool text that tool already exists for), so bold/italic carry
   * over as real formatting instead of literal asterisks.
   */
  const importMarkdownManuscript = useCallback(
    async (title: string, chapters: ImportedChapterCandidate[]) => {
      const created = createBook(title);
      const mapped = (chapters.length > 0 ? chapters : [{ title: "", prose: "" }]).map((candidate, index) => {
        const converted = applyMarkerConversion(candidate.prose, [], DEFAULT_MARKER_CONVERSION_RULES);
        const chapter = createChapter(index, candidate.title);
        return { ...chapter, prose: converted.prose, formatting: converted.formatting };
      });
      const book: Book = { ...created, chapters: mapped };
      await repo.save(book);
      setSummaries(await repo.list());
      withViewTransition(() => {
        setBook(book);
        setChapterIdState(sortedChapters(book)[0]?.id ?? null);
        setSurface(openingSurface(book));
        setChapterFeedback(null);
        setCriticFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, book.id);
      setError(null);
    },
    [repo]
  );

  const deleteBook = useCallback(
    async (id: string) => {
      await repo.delete(id);
      forgetLastJsonBackup(id);
      localStorage.removeItem(lastPositionKey(id));
      if (bookRef.current?.id === id) {
        withViewTransition(() => {
          setBook(null);
          setChapterIdState(null);
          setSurface("brainstorm");
          setChapterFeedback(null);
          setCriticFeedback(null);
        });
      }
      await refresh();
    },
    [refresh, repo]
  );



  const dismissModelAside = useCallback(() => setModelAsides([]), []);

  const manuscriptFromModel = (raw: string, fallback: string) => {
    const { prose, asides } = peelModelAsides(raw);
    if (asides.length > 0) setModelAsides(asides);
    return prose.trim() ? prose : fallback;
  };

  /**
   * Records exactly what's about to be sent to the model, for the AI Context Inspector.
   * Called right before the request goes out, so it captures intent even if the
   * request itself later fails or is aborted.
   */
  const recordPrompt = useCallback(
    (operation: PromptOperation, model: string, messages: PromptDebugMessage[], target?: PromptDebugTarget) => {
      setLastPrompt({ operation, model, messages, at: nowIso(), ...(target ? { target } : {}) });
    },
    []
  );

  /**
   * Attaches the model's raw reply to whichever entry recordPrompt most
   * recently opened, so the AI Context Inspector can show not just what was
   * sent but what actually came back. Currently wired only into fact
   * extraction (Interview and chapter) — the one place a tester needed to
   * see the raw response to tell a formatting failure from a genuine "found
   * nothing," rather than guessing blind from a symptom relayed in chat.
   */
  const recordPromptResponse = useCallback((response: string) => {
    setLastPrompt((prev) => (prev ? { ...prev, response } : prev));
  }, []);

  const aiContext: AiContext = {
    repo,
    book,
    bookRef,
    setBook,
    setModelAsides,
    chapterRef,
    surfaceRef,
    historyLimitRef,
    contextWindowRef,
    abortRef,
    busy,
    setBusy,
    setError,
    setChapterFeedback,
    setCriticFeedback,
    models,
    ollamaError,
    model,
    reviewModel,
    translateModel,
    flushSave,
    patchBook,
    persistProseWrite,
    manuscriptFromModel,
    recordPrompt,
    recordPromptResponse,
    makeProvider,
    writingSystem,
    withInheritedFacts
  };

  const {
    interviewEntity,
    interviewHistory,
    interviewPersonalityDraft,
    brainstormChatHistory,
    interviewExtractChapterId,
    interviewExtractSceneId,
    developSuggestion,
    setInterviewPersonalityDraft,
    setInterviewExtractPosition,
    startBrainstormChat,
    closeBrainstormChat,
    askBrainstormChat,
    startInterview,
    closeInterview,
    saveInterviewPersonality,
    askCharacter,
    extractInterview,
    setDevelopmentMethod,
    developExpand,
    dismissDevelopSuggestion
  } = useConversationActions(aiContext);

  const {
    draftAwaiting,
    polishDraft,
    draftChapter,
    recastChapter,
    translateChapter,
    draftScene,
    recastScene,
    mergeScene,
    rewriteSpan,
    restoreChapterProse,
    cutChapterDarling,
    restoreChapterDarling,
    discardChapterDarling,
    stopDraft,
    polishChapter,
    acceptPolish,
    discardPolish
  } = useWritingActions(aiContext);

  const {
    askManuscriptAnswer,
    askPassageAnswer,
    importLoreProgress,
    analyzeScene,
    suggestAlternatives,
    suggestSentenceSplit,
    suggestParagraphBreak,
    extractChapter,
    analyzeChapter,
    runCritics,
    dismissCriticFeedback,
    generateIllustrationPrompt,
    askManuscript,
    askAboutPassage,
    extractBrainstormNote,
    extractSynopsis,
    extractBrief,
    summarizeChapter,
    importLoreArticles,
    importSeriesFacts,
    startProofread,
    startDevelopmentalAnalysis
  } = useReviewActions(aiContext);

  const liftToSynopsis = useCallback(
    async (fragment: string) => {
      const current = bookRef.current;
      if (!current) return;
      const next = liftFragmentToSynopsis(current.synopsis, fragment);
      if (next === current.synopsis) return;
      await flushSave(touch(current, { synopsis: next }));
    },
    [flushSave]
  );

  const sendBrainstormToSynopsis = useCallback(async () => {
    const current = bookRef.current;
    if (!current) return;
    const next = sendStagedNotesToSynopsis(current);
    if (next !== current) {
      await flushSave(
        touch(current, {
          synopsis: next.synopsis,
          brainstorm: next.brainstorm,
          brainstorm_notes: next.brainstorm_notes
        })
      );
    }
    setSurface("synopsis");
  }, [flushSave]);

  const { mirrorRelationshipFact, addFact, revise, retract, approve, reject, keepSeparate } = useFacts({
    bookRef,
    chapterRef,
    flushSave,
    makeProvider,
    reviewModel
  });

  const value: BookStoreValue = {
    summaries,
    book,
    chapterId,
    surface,
    models,
    model,
    writingPrimer,
    reviewModel,
    translateModel,
    engine,
    baseUrl,
    contextWindow,
    historyLimit,
    ollamaError,
    connection,
    checkConnection,
    busy,
    timeoutCountdown,
    draftAwaiting,
    error,
    chapterFeedback,
    criticFeedback,
    polishDraft,
    modelAsides,
    lastPrompt,
    askManuscriptAnswer,
    askPassageAnswer,
    interviewEntity,
    interviewHistory,
    interviewPersonalityDraft,
    brainstormChatHistory,
    interviewExtractChapterId,
    interviewExtractSceneId,
    setInterviewExtractPosition,
    developSuggestion,
    importLoreProgress,
    seriesFacts,
    seriesMissing,
    refresh,
    openBook,
    closeBook,
    newBook,
    loadSampleManuscript,
    newLanguageVersion,
    loadBook,
    checkpointBook,
    restoreCoreRevision,
    importCoreManuscript,
    importManuscript,
    importMarkdownManuscript,
    deleteBook,
    patchBook,
    setBookSeries,
    updateShelfSettings,
    setChapterId,
    selectChapter,
    showSettings,
    showBrainstorm,
    showSynopsis,
    showAsk,
    showTimeline,
    showPlotlines,
    showMethod,
    showGuide,
    handbookOpen,
    openHandbook,
    closeHandbook,
    convertMarkersToFormatting,
    smartenManuscriptQuotes,
    dismissModelAside,
    setModel,
    setWritingPrimer,
    resetWritingPrimer,
    setReviewModel,
    setTranslateModel,
    setEngine,
    setBaseUrl,
    setContextWindow,
    suggestContextWindow,
    setHistoryLimit,
    draftChapter,
    recastChapter,
    translateChapter,
    polishChapter,
    acceptPolish,
    discardPolish,
    draftScene,
    recastScene,
    analyzeScene,
    mergeScene,
    rewriteSpan,
    restoreChapterProse,
    summarizeChapter,
    cutChapterDarling,
    restoreChapterDarling,
    discardChapterDarling,
    startBrainstormChat,
    askBrainstormChat,
    closeBrainstormChat,
    liftToSynopsis,
    sendBrainstormToSynopsis,
    suggestAlternatives,
    suggestSentenceSplit,
    suggestParagraphBreak,
    stopDraft,
    extractChapter,
    analyzeChapter,
    runCritics,
    dismissCriticFeedback,
    startProofread,
    startDevelopmentalAnalysis,
    generateIllustrationPrompt,
    askManuscript,
    askAboutPassage,
    startInterview,
    askCharacter,
    extractInterview,
    extractBrainstormNote,
    extractSynopsis,
    extractBrief,
    importLoreArticles,
    importSeriesFacts,
    closeInterview,
    setInterviewPersonalityDraft,
    saveInterviewPersonality,
    setDevelopmentMethod,
    developExpand,
    dismissDevelopSuggestion,
    addFact,
    reviseFact: revise,
    retractFact: retract,
    approve,
    reject,
    keepSeparate,
    mirrorRelationshipFact
  };

  return <BookStoreContext.Provider value={value}>{children}</BookStoreContext.Provider>;
}
