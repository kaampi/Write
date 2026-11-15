import { useCallback, useState } from "react";
import { touch, updateChapter, type Book } from "@core/BookSchema";
import { BRAINSTORM_PASSAGE_SYSTEM, brainstormPassageUserPrompt } from "@core/brainstorm";
import { applyAssembledBrainstorm } from "@core/brainstormNotes";
import { chapterScenes, mergeSceneWithNext, replaceSceneProse, sceneIdRemovedByMerge } from "@core/bookScene";
import {
  DRAFT_SYSTEM,
  PASSAGE_SYSTEM,
  RECAST_SYSTEM,
  TRANSLATE_SYSTEM,
  draftSceneUserPrompt,
  draftUserPrompt,
  passageUserPrompt,
  polishUserPrompt,
  recastSceneUserPrompt,
  recastUserPrompt,
  translateChapterUserPrompt
} from "@core/generateProse";
import { recordProseRevision, restoreProseRevision, rewriteHistoryOp } from "@core/proseHistory";
import { applyExtend, applyReplace, normalizeSpan, surroundingPassage, type TextSpan } from "@core/textSpan";
import { shiftFormattingRanges } from "@core/proseFormatting";
import { shiftPlaceholders } from "@core/placeholders";
import { cutToDarling, discardDarling, restoreDarling, shiftDarlings } from "@core/darlings";
import { type PromptDebugMessage } from "../promptDebug";
import { type PolishDraft } from "../useBookStore";
import { STORE_ERROR } from "../i18n";
import { ollamaHint, polishMaxTokens } from "./helpers";

import type { AiContext } from "./aiContext";

/**
 * The AI actions that write or rewrite the manuscript's own prose: Draft,
 * Recast and Translate (whole chapter and per scene), rewriting a selected
 * span, Polish with its review step, merging scenes, darlings and restoring an
 * earlier version. They own the state only they use — the Draft "waiting for
 * the first token" flag and the pending Polish result — and take everything
 * shared from `AiContext`.
 */
export function useWritingActions(ctx: AiContext) {
  const {
    repo,
    bookRef,
    setBook,
    setModelAsides,
    chapterRef,
    abortRef,
    busy,
    setBusy,
    setError,
    models,
    ollamaError,
    model,
    translateModel,
    historyLimitRef,
    flushSave,
    patchBook,
    persistProseWrite,
    manuscriptFromModel,
    recordPrompt,
    recordPromptResponse,
    makeProvider,
    writingSystem,
    withInheritedFacts
  } = ctx;
  /**
   * True only for the stretch of a Draft between clicking the button and
   * the model's first token arriving — nothing is visible to watch yet
   * (worse on a cold model load), so Editor.tsx shows BusyDialog for just
   * that stretch. False again the moment text starts appearing in the
   * prose, so the dialog never covers the live generation itself.
   */
  const [draftAwaiting, setDraftAwaiting] = useState(false);
  const [polishDraft, setPolishDraft] = useState<PolishDraft | null>(null);

  const draftChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter) return;
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("draft");
    setDraftAwaiting(true);
    setError(null);
    setModelAsides([]);

    const provider = makeProvider(model);
    const before = chapter.prose;
    const beforeFormatting = chapter.formatting ?? [];
    const beforePlaceholders = chapter.placeholders ?? [];
    const beforeDarlings = chapter.darlings ?? [];
    // Draft appends after whatever is already there — the kept prefix's
    // characters don't move, so their formatting survives untouched; only
    // the freshly generated tail (from here on) has none of its own.
    const insertionPoint = before.replace(/\s+$/, "").length;
    let assembled = chapter.prose;
    const prefix = assembled.trim() ? `${assembled.replace(/\s+$/, "")}\n\n` : "";
    assembled = prefix;
    let raw = "";

    const draftFormatting = () => shiftFormattingRanges(beforeFormatting, insertionPoint, insertionPoint, assembled.length - insertionPoint);
    const draftPlaceholders = () => shiftPlaceholders(beforePlaceholders, insertionPoint, insertionPoint, assembled.length - insertionPoint);
    const draftDarlings = () => shiftDarlings(beforeDarlings, insertionPoint, insertionPoint, assembled.length - insertionPoint);

    try {
      await patchBook((book) => updateChapter(book, id, { prose: assembled }));
      const draftMessages: PromptDebugMessage[] = [
        { role: "system", content: writingSystem(DRAFT_SYSTEM) },
        { role: "user", content: draftUserPrompt(withInheritedFacts(current), chapter) }
      ];
      recordPrompt("draft", model, draftMessages);
      for await (const chunk of provider.streamChat({
        messages: draftMessages,
        temperature: 0.85,
        maxTokens: 900,
        signal: abort.signal
      })) {
        if (chunk.type === "text_delta") {
          if (raw === "") setDraftAwaiting(false);
          raw += chunk.text;
          assembled = prefix + manuscriptFromModel(raw, "");
          setBook((prev) =>
            prev
              ? updateChapter(prev, id, {
                  prose: assembled,
                  formatting: draftFormatting(),
                  placeholders: draftPlaceholders(),
                  darlings: draftDarlings()
                })
              : prev
          );
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
      }
      const latest = bookRef.current;
      if (latest) await persistProseWrite(latest, id, assembled, "draft", before, draftFormatting(), draftPlaceholders(), draftDarlings());
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        const latest = bookRef.current;
        if (latest)
          await persistProseWrite(latest, id, assembled, "draft", before, draftFormatting(), draftPlaceholders(), draftDarlings());
      } else {
        setError(ollamaHint(err));
      }
    } finally {
      setBusy(null);
      setDraftAwaiting(false);
      abortRef.current = null;
    }
  }, [busy, flushSave, model, models.length, ollamaError, patchBook, persistProseWrite]);

  const recastChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError(STORE_ERROR.recastEmpty);
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("recast");
    setError(null);
    setModelAsides([]);

    const original = chapter.prose;
    // Recast regenerates the whole chapter from scratch — old formatting
    // positions no longer line up with the new prose, so they're cleared
    // rather than shifted. If the model produces nothing and the chapter
    // falls back to its original text, the original formatting comes back
    // with it.
    const originalFormatting = chapter.formatting ?? [];
    const originalPlaceholders = chapter.placeholders ?? [];
    // Darlings hold real authored text, not just a position — unlike
    // formatting/placeholders they're kept (not cleared) through a wholesale
    // regenerate, and simply clamped to the new prose's length on restore.
    const originalDarlings = chapter.darlings ?? [];
    let assembled = "";
    let raw = "";

    try {
      const provider = makeProvider(model);
      const recastMessages: PromptDebugMessage[] = [
        { role: "system", content: writingSystem(RECAST_SYSTEM) },
        { role: "user", content: recastUserPrompt(withInheritedFacts(current), chapter) }
      ];
      recordPrompt("recast", model, recastMessages);
      for await (const chunk of provider.streamChat({
        messages: recastMessages,
        temperature: 0.5,
        maxTokens: 1600,
        signal: abort.signal
      })) {
        if (chunk.type === "text_delta") {
          raw += chunk.text;
          assembled = manuscriptFromModel(raw, "");
          const finished = assembled.trim() ? assembled : original;
          setBook((prev) =>
            prev
              ? updateChapter(prev, id, {
                  prose: finished,
                  formatting: assembled.trim() ? [] : originalFormatting,
                  placeholders: assembled.trim() ? [] : originalPlaceholders,
                  darlings: originalDarlings
                })
              : prev
          );
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
      }
      const latest = bookRef.current;
      if (latest) {
        const finished = assembled.trim() ? assembled : original;
        await persistProseWrite(
          latest,
          id,
          finished,
          "recast",
          original,
          assembled.trim() ? [] : originalFormatting,
          assembled.trim() ? [] : originalPlaceholders,
          originalDarlings
        );
      }
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        const latest = bookRef.current;
        if (latest) {
          const finished = assembled.trim() ? assembled : original;
          await persistProseWrite(
            latest,
            id,
            finished,
            "recast",
            original,
            assembled.trim() ? [] : originalFormatting,
            assembled.trim() ? [] : originalPlaceholders,
            originalDarlings
          );
        }
      } else {
        setError(ollamaHint(err));
        const latest = bookRef.current;
        if (latest)
          await flushSave(
            updateChapter(latest, id, {
              prose: original,
              formatting: originalFormatting,
              placeholders: originalPlaceholders,
              darlings: originalDarlings
            })
          );
      }
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, model, models.length, ollamaError, persistProseWrite]);

  const translateChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.translated_from_chapter_id || !current.translated_from_book_id) return;
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }

    let sourceBook: Book;
    try {
      sourceBook = await repo.get(current.translated_from_book_id);
    } catch {
      setError(STORE_ERROR.translateSourceMissing);
      return;
    }
    const sourceChapter = sourceBook.chapters.find((item) => item.id === chapter.translated_from_chapter_id);
    if (!sourceChapter?.prose.trim()) {
      setError(STORE_ERROR.translateSourceEmpty);
      return;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("translate");
    setError(null);
    setModelAsides([]);

    const original = chapter.prose;
    const originalFormatting = chapter.formatting ?? [];
    const originalPlaceholders = chapter.placeholders ?? [];
    const originalDarlings = chapter.darlings ?? [];
    const snapshotProse = sourceChapter.prose;
    let assembled = "";
    let raw = "";

    try {
      const translateModelName = translateModel.trim() || model;
      const provider = makeProvider(translateModelName);
      const translateMessages: PromptDebugMessage[] = [
        { role: "system", content: writingSystem(TRANSLATE_SYSTEM) },
        { role: "user", content: translateChapterUserPrompt(sourceBook, sourceChapter, current.prose_language) }
      ];
      recordPrompt("translate", translateModelName, translateMessages);
      for await (const chunk of provider.streamChat({
        messages: translateMessages,
        temperature: 0.4,
        maxTokens: 1600,
        signal: abort.signal
      })) {
        if (chunk.type === "text_delta") {
          raw += chunk.text;
          assembled = manuscriptFromModel(raw, "");
          const finished = assembled.trim() ? assembled : original;
          setBook((prev) =>
            prev
              ? updateChapter(prev, id, {
                  prose: finished,
                  formatting: assembled.trim() ? [] : originalFormatting,
                  placeholders: assembled.trim() ? [] : originalPlaceholders,
                  darlings: originalDarlings
                })
              : prev
          );
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
      }
      const latest = bookRef.current;
      if (latest) {
        const finished = assembled.trim() ? assembled : original;
        await persistProseWrite(
          latest,
          id,
          finished,
          "translate",
          original,
          assembled.trim() ? [] : originalFormatting,
          assembled.trim() ? [] : originalPlaceholders,
          originalDarlings
        );
        if (assembled.trim()) {
          const withSnapshot = bookRef.current;
          if (withSnapshot) await flushSave(updateChapter(withSnapshot, id, { translated_from_snapshot: snapshotProse }));
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        const latest = bookRef.current;
        if (latest) {
          const finished = assembled.trim() ? assembled : original;
          await persistProseWrite(
            latest,
            id,
            finished,
            "translate",
            original,
            assembled.trim() ? [] : originalFormatting,
            assembled.trim() ? [] : originalPlaceholders,
            originalDarlings
          );
        }
      } else {
        setError(ollamaHint(err));
        const latest = bookRef.current;
        if (latest)
          await flushSave(
            updateChapter(latest, id, {
              prose: original,
              formatting: originalFormatting,
              placeholders: originalPlaceholders,
              darlings: originalDarlings
            })
          );
      }
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, model, translateModel, models.length, ollamaError, persistProseWrite, repo]);

  const draftScene = useCallback(
    async (sceneId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      const chapter = current.chapters.find((item) => item.id === id);
      const scene = chapter ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      if (!chapter || !scene) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("draft");
      setDraftAwaiting(true);
      setError(null);
      setModelAsides([]);

      const provider = makeProvider(model);
      const before = chapter.prose;
      const prefix = scene.prose.trim() ? `${scene.prose.replace(/\s+$/, "")}\n\n` : "";
      let raw = "";

      // Scene-level Draft/Recast splice a chunk into the middle of
      // `chapter.prose`; shifting formatting precisely for just the
      // affected scene isn't done yet, so the whole chapter's formatting is
      // cleared rather than risk stale ranges landing on the wrong words.
      const finish = async (sceneAssembled: string) => {
        const spliced = replaceSceneProse(chapter, sceneId, sceneAssembled);
        const latest = bookRef.current ?? current;
        await persistProseWrite(updateChapter(latest, id, { scenes: spliced.scenes }), id, spliced.prose, "draft", before, [], []);
      };

      try {
        const draftMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(DRAFT_SYSTEM) },
          { role: "user", content: draftSceneUserPrompt(withInheritedFacts(current), chapter, sceneId) }
        ];
        recordPrompt("draft", model, draftMessages);
        for await (const chunk of provider.streamChat({
          messages: draftMessages,
          temperature: 0.85,
          maxTokens: 900,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            if (raw === "") setDraftAwaiting(false);
            raw += chunk.text;
            const sceneAssembled = prefix + manuscriptFromModel(raw, "");
            const spliced = replaceSceneProse(chapter, sceneId, sceneAssembled);
            setBook((prev) =>
              prev ? updateChapter(prev, id, { prose: spliced.prose, scenes: spliced.scenes, formatting: [], placeholders: [] }) : prev
            );
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        await finish(prefix + manuscriptFromModel(raw, ""));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          await finish(prefix + manuscriptFromModel(raw, ""));
        } else {
          setError(ollamaHint(err));
        }
      } finally {
        setBusy(null);
        setDraftAwaiting(false);
        abortRef.current = null;
      }
    },
    [busy, model, models.length, ollamaError, persistProseWrite]
  );

  const recastScene = useCallback(
    async (sceneId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      const chapter = current.chapters.find((item) => item.id === id);
      const scene = chapter ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      if (!chapter || !scene?.prose.trim()) {
        setError(STORE_ERROR.recastEmpty);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("recast");
      setError(null);
      setModelAsides([]);

      const before = chapter.prose;
      const originalScene = scene.prose;
      // Same reasoning as draftScene: no precise per-scene shift yet, so a
      // real recast clears the chapter's formatting; falling all the way
      // back to the original scene text keeps the original formatting too.
      const originalFormatting = chapter.formatting ?? [];
      const originalPlaceholders = chapter.placeholders ?? [];
      let raw = "";

      const finish = async (sceneAssembled: string) => {
        const finalScene = sceneAssembled.trim() ? sceneAssembled : originalScene;
        const spliced = replaceSceneProse(chapter, sceneId, finalScene);
        const latest = bookRef.current ?? current;
        await persistProseWrite(
          updateChapter(latest, id, { scenes: spliced.scenes }),
          id,
          spliced.prose,
          "recast",
          before,
          sceneAssembled.trim() ? [] : originalFormatting,
          sceneAssembled.trim() ? [] : originalPlaceholders
        );
      };

      try {
        const provider = makeProvider(model);
        const recastMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(RECAST_SYSTEM) },
          { role: "user", content: recastSceneUserPrompt(withInheritedFacts(current), chapter, sceneId) }
        ];
        recordPrompt("recast", model, recastMessages);
        let assembled = "";
        for await (const chunk of provider.streamChat({
          messages: recastMessages,
          temperature: 0.5,
          maxTokens: 1600,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            raw += chunk.text;
            assembled = manuscriptFromModel(raw, "");
            const spliced = replaceSceneProse(chapter, sceneId, assembled.trim() ? assembled : originalScene);
            setBook((prev) =>
              prev
                ? updateChapter(prev, id, {
                    prose: spliced.prose,
                    scenes: spliced.scenes,
                    formatting: assembled.trim() ? [] : originalFormatting,
                    placeholders: assembled.trim() ? [] : originalPlaceholders
                  })
                : prev
            );
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        await finish(assembled);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          await finish(manuscriptFromModel(raw, ""));
        } else {
          setError(ollamaHint(err));
          const spliced = replaceSceneProse(chapter, sceneId, originalScene);
          const latest = bookRef.current ?? current;
          await flushSave(
            updateChapter(latest, id, {
              prose: spliced.prose,
              scenes: spliced.scenes,
              formatting: originalFormatting,
              placeholders: originalPlaceholders
            })
          );
        }
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, model, models.length, ollamaError, persistProseWrite]
  );

  const mergeScene = useCallback(
    (sceneId: string) => {
      const id = chapterRef.current;
      if (!id) return;
      void patchBook((current) => {
        const chapter = current.chapters.find((item) => item.id === id);
        if (!chapter) return current;
        const removedId = sceneIdRemovedByMerge(chapter, sceneId);
        const withChapter = updateChapter(current, id, { scenes: mergeSceneWithNext(chapter, sceneId) });
        if (!removedId) return withChapter;
        return {
          ...withChapter,
          facts: withChapter.facts.map((fact) => (fact.scene_id === removedId ? { ...fact, scene_id: sceneId } : fact))
        };
      });
    },
    [patchBook]
  );

  const rewriteSpan = useCallback(
    async (args: {
      target: "prose" | "synopsis" | "brainstorm";
      mode: "extend" | "elaborate" | "instruct" | "beat";
      span: TextSpan;
      instruction?: string;
    }) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || busy) return;
      if (args.target === "prose" && !id) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const chapter = id ? current.chapters.find((item) => item.id === id) : undefined;
      if (args.target === "prose" && !chapter) return;
      const source =
        args.target === "synopsis"
          ? current.synopsis
          : args.target === "brainstorm"
            ? current.brainstorm
            : chapter?.prose;
      if (source === undefined) return;
      const around = surroundingPassage(source, args.span);
      if (args.mode !== "beat" && !around.selected) return;
      if ((args.mode === "instruct" || args.mode === "beat") && !(args.instruction ?? "").trim()) return;

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy(args.mode);
      setError(null);
      if (args.target !== "brainstorm") setModelAsides([]);

      let generated = "";

      // Extend/Beat insert after the span without touching its own text
      // (applyExtend), so the "edit" for formatting purposes is a
      // zero-width insertion at its end; Elaborate/Instruct replace the
      // whole span (applyReplace) — matches `assemble()` below exactly, so
      // shifted ranges land where the actual edit happened.
      const { start: spanStart, end: spanEnd } = normalizeSpan(args.span.start, args.span.end);
      const isInsertion = args.mode === "extend" || args.mode === "beat";
      const editStart = isInsertion ? spanEnd : spanStart;
      const editEnd = spanEnd;
      const sourceFormatting =
        args.target === "prose" ? (chapter?.formatting ?? []) : args.target === "synopsis" ? (current.synopsis_formatting ?? []) : [];
      const formattingFor = (next: string) =>
        shiftFormattingRanges(sourceFormatting, editStart, editEnd, next.length - source.length + (editEnd - editStart));
      const sourcePlaceholders = args.target === "prose" ? (chapter?.placeholders ?? []) : [];
      const placeholdersFor = (next: string) =>
        shiftPlaceholders(sourcePlaceholders, editStart, editEnd, next.length - source.length + (editEnd - editStart));
      const sourceDarlings = args.target === "prose" ? (chapter?.darlings ?? []) : [];
      const darlingsFor = (next: string) =>
        shiftDarlings(sourceDarlings, editStart, editEnd, next.length - source.length + (editEnd - editStart));

      const write = (next: string) => {
        if (args.target === "synopsis") {
          setBook((prev) => (prev ? { ...prev, synopsis: next, synopsis_formatting: formattingFor(next) } : prev));
          return;
        }
        if (args.target === "brainstorm") {
          setBook((prev) => (prev ? applyAssembledBrainstorm(prev, next) : prev));
          return;
        }
        setBook((prev) =>
          prev && id
            ? updateChapter(prev, id, {
                prose: next,
                formatting: formattingFor(next),
                placeholders: placeholdersFor(next),
                darlings: darlingsFor(next)
              })
            : prev
        );
      };

      const assemble = () => {
        const chunk =
          args.target === "brainstorm"
            ? generated
            : manuscriptFromModel(generated, args.mode === "extend" ? "" : around.selected);
        return args.mode === "extend" || args.mode === "beat"
          ? applyExtend(source, args.span, chunk)
          : applyReplace(source, args.span, chunk);
      };

      const persistAssembled = async (latest: Book, assembled: string) => {
        if (args.target === "synopsis") await flushSave(touch(latest, { synopsis: assembled, synopsis_formatting: formattingFor(assembled) }));
        else if (args.target === "brainstorm") {
          const patched = applyAssembledBrainstorm(latest, assembled);
          await flushSave(touch(latest, { brainstorm: patched.brainstorm, brainstorm_notes: patched.brainstorm_notes }));
        }
        else if (id) {
          await persistProseWrite(
            latest,
            id,
            assembled,
            rewriteHistoryOp(args.mode),
            source,
            formattingFor(assembled),
            placeholdersFor(assembled),
            darlingsFor(assembled)
          );
        }
      };

      const userContent =
        args.target === "brainstorm"
          ? brainstormPassageUserPrompt({
              book: current,
              mode: args.mode,
              before: around.before,
              selected: around.selected,
              after: around.after,
              ...(args.instruction ? { instruction: args.instruction } : {})
            })
          : passageUserPrompt({
              book: withInheritedFacts(current),
              chapter: args.target === "prose" ? chapter ?? null : null,
              mode: args.mode,
              before: around.before,
              selected: around.selected,
              after: around.after,
              ...(args.instruction ? { instruction: args.instruction } : {})
            });

      try {
        const provider = makeProvider(model);
        const rewriteMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(args.target === "brainstorm" ? BRAINSTORM_PASSAGE_SYSTEM : PASSAGE_SYSTEM) },
          { role: "user", content: userContent }
        ];
        recordPrompt(args.mode, model, rewriteMessages, args.target);
        for await (const chunk of provider.streamChat({
          messages: rewriteMessages,
          temperature: args.target === "brainstorm" ? 0.9 : 0.8,
          maxTokens: args.mode === "extend" || args.mode === "beat" ? 280 : 420,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            generated += chunk.text;
            write(assemble());
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        const latest = bookRef.current;
        if (!latest) return;
        await persistAssembled(latest, assemble());
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          const latest = bookRef.current;
          if (!latest) return;
          await persistAssembled(latest, assemble());
        } else {
          setError(ollamaHint(err));
        }
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, model, models.length, ollamaError, persistProseWrite]
  );

  const restoreChapterProse = useCallback(
    async (revisionId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      await flushSave(restoreProseRevision(current, id, revisionId, historyLimitRef.current));
    },
    [busy, flushSave]
  );

  const cutChapterDarling = useCallback(
    async (span: TextSpan) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      const chapter = current.chapters.find((item) => item.id === id);
      if (!chapter) return;
      const before = chapter.prose;
      const result = cutToDarling(before, span, chapter.darlings ?? []);
      const next = recordProseRevision(current, id, "darling", before, historyLimitRef.current);
      await flushSave(updateChapter(next, id, { prose: result.prose, darlings: result.darlings }));
    },
    [busy, flushSave]
  );

  const restoreChapterDarling = useCallback(
    async (chapterId: string, darlingId: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter) return;
      const before = chapter.prose;
      const result = restoreDarling(before, chapter.darlings ?? [], darlingId);
      if (!result) return;
      const next = recordProseRevision(current, chapterId, "darling", before, historyLimitRef.current);
      await flushSave(updateChapter(next, chapterId, { prose: result.prose, darlings: result.darlings }));
    },
    [busy, flushSave]
  );

  const discardChapterDarling = useCallback(
    async (chapterId: string, darlingId: string) => {
      const current = bookRef.current;
      if (!current) return;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter) return;
      await flushSave(updateChapter(current, chapterId, { darlings: discardDarling(chapter.darlings ?? [], darlingId) }));
    },
    [flushSave]
  );

  const stopDraft = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /**
   * Generates a Polish candidate but does not write it anywhere — unlike
   * Draft/Recast, which stream straight into the live chapter, Polish is
   * an aggressive cut-and-rewrite pass the author needs to see before it
   * touches their prose. The result sits in polishDraft until
   * acceptPolish or discardPolish resolves it (PolishReviewCard shows the
   * diff in between).
   */
  const polishChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return false;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError(STORE_ERROR.polishEmpty);
      return false;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return false;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("polish");
    setError(null);
    try {
      const polishMessages: PromptDebugMessage[] = [
        { role: "system", content: writingSystem(current.polish_prompt) },
        { role: "user", content: polishUserPrompt(withInheritedFacts(current), chapter) }
      ];
      recordPrompt("polish", model, polishMessages);
      const raw = await makeProvider(model).chat({
        messages: polishMessages,
        temperature: 0.4,
        maxTokens: polishMaxTokens(chapter.prose),
        signal: abort.signal
      });
      recordPromptResponse(raw);
      const candidate = manuscriptFromModel(raw, "");
      if (!candidate.trim()) {
        setError(STORE_ERROR.polishEmpty);
        return false;
      }
      setPolishDraft({ chapterId: id, original: chapter.prose, candidate });
      return true;
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return false;
      setError(ollamaHint(err));
      return false;
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, model, models.length, ollamaError]);

  const acceptPolish = useCallback(async () => {
    const draft = polishDraft;
    const latest = bookRef.current;
    if (!draft || !latest) return;
    const chapter = latest.chapters.find((item) => item.id === draft.chapterId);
    // A whole-chapter rewrite, same as Recast: old formatting/placeholder positions no
    // longer line up with the new prose, so they're cleared rather than shifted. Darlings
    // hold real authored text, not just a position, so they're kept through the rewrite.
    await persistProseWrite(
      latest,
      draft.chapterId,
      draft.candidate,
      "polish",
      draft.original,
      [],
      [],
      chapter?.darlings ?? []
    );
    setPolishDraft(null);
  }, [polishDraft, persistProseWrite]);

  const discardPolish = useCallback(() => setPolishDraft(null), []);

  return {
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
  };
}
