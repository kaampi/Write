import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorSurface } from "@core/BookSchema";
import { lastPositionKey, withViewTransition } from "./helpers";

/**
 * Where the author is inside the open book: which surface (chapter,
 * Brainstorm, Synopsis, ...) and which chapter, the transitions between them,
 * the Handbook modal, and remembering the last position per book. The open
 * book itself stays in BookStore; this only needs its id to key the saved
 * position.
 */
export function useSurfaceNavigation(bookId: string | undefined) {
  const [chapterId, setChapterIdState] = useState<string | null>(null);
  const [surface, setSurface] = useState<EditorSurface>("brainstorm");
  const chapterRef = useRef<string | null>(null);
  const surfaceRef = useRef<EditorSurface>("brainstorm");
  chapterRef.current = chapterId;
  surfaceRef.current = surface;

  useEffect(() => {
    if (!bookId) return;
    localStorage.setItem(lastPositionKey(bookId), JSON.stringify({ surface, chapterId }));
  }, [bookId, surface, chapterId]);

  const setChapterId = useCallback((id: string) => {
    withViewTransition(() => {
      setChapterIdState(id);
      setSurface("chapter");
    }, 160);
  }, []);

  const selectChapter = useCallback((id: string) => {
    setChapterIdState(id);
  }, []);

  const showSettings = useCallback(() => {
    withViewTransition(() => setSurface("settings"), 160);
  }, []);

  const showBrainstorm = useCallback(() => {
    withViewTransition(() => setSurface("brainstorm"), 160);
  }, []);

  const showSynopsis = useCallback(() => {
    withViewTransition(() => setSurface("synopsis"), 160);
  }, []);

  const showAsk = useCallback(() => {
    withViewTransition(() => setSurface("ask"), 160);
  }, []);

  const showTimeline = useCallback(() => {
    withViewTransition(() => setSurface("timeline"), 160);
  }, []);

  const showPlotlines = useCallback(() => {
    withViewTransition(() => setSurface("plotlines"), 160);
  }, []);

  const showMethod = useCallback(() => {
    withViewTransition(() => setSurface("method"), 160);
  }, []);

  const showGuide = useCallback(() => {
    withViewTransition(() => setSurface("guide"), 160);
  }, []);

  /**
   * The Handbook is a modal now (Mats, 2026-11-05: wants it to match kaampi
   * Explore's own Guide — a modal with a chapter register, not a page you
   * navigate away to), not an EditorSurface — it opens over whatever
   * surface is already showing and closes back to exactly that, from
   * Home, a series workspace, or any Editor surface alike. `"handbook"`
   * stays a legal EditorSurface value purely for backward compatibility
   * with already-saved "last position" data and `openingSurface`'s own
   * blank-book default (BookSchema.ts) — Editor.tsx's own effect catches
   * that value and redirects to a real surface underneath while opening
   * this modal, so old saved state and a fresh book both still land
   * somewhere sensible instead of a surface nothing renders for.
   */
  const [handbookOpen, setHandbookOpen] = useState(false);
  const openHandbook = useCallback(() => setHandbookOpen(true), []);
  const closeHandbook = useCallback(() => setHandbookOpen(false), []);

  return {
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
  };
}
