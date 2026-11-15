import { useCallback, useEffect, useRef, useState } from "react";
import { touch } from "@core/BookSchema";
import { applyExtractorDrafts } from "@core/ConsistencyGate";
import { chapterScenes } from "@core/bookScene";
import {
  ASK_MANUSCRIPT_SYSTEM,
  askManuscriptUserPrompt,
  rankByKeywordOverlap,
  rankBySimilarity,
  type AskManuscriptAnswer,
  type ManuscriptEvidence,
  type ManuscriptSource
} from "@core/askManuscript";
import { ASK_ABOUT_PASSAGE_SYSTEM, askAboutChapterUserPrompt, askAboutSelectionUserPrompt } from "@core/askAboutPassage";
import { ANALYZE_SYSTEM, analyzeSceneUserPrompt, analyzeUserPrompt, parseChapterFeedback } from "@core/chapterFeedback";
import { CRITIC_SYSTEM_PROMPTS, criticUserPrompt, parseCriticFeedback, type CriticPersonaId } from "@core/critics";
import {
  applyOrientationHint,
  enforceNoTextConstraint,
  illustrationPromptMessages,
  relevantEntitiesForPassage
} from "@core/illustrationPrompt";
import {
  EXTRACTOR_SYSTEM,
  extractorUserPrompt,
  parseExtractorPayload,
  PLANNING_EXTRACTOR_SYSTEM,
  planningExtractorUserPrompt
} from "@core/extractFacts";
import type { LoreArticleCandidate } from "@core/loreImport";
import { SUMMARIZE_CHAPTER_SYSTEM, summarizeChapterUserPrompt } from "@core/chapterSummary";
import { proseChapters, startProofreadJob, touchProofread, type ProofreadStage } from "@core/proofread";
import { runProofread } from "@core/proofreadRun";
import { startDevelopmentalJob, touchDevelopmental } from "@core/developmental";
import { runDevelopmental } from "@core/developmentalRun";
import { resolveVoice } from "@core/generateProse";
import { resolveReader, kidlitReader } from "@core/reader";
import { surroundingPassage, type TextSpan } from "@core/textSpan";
import { ALTERNATIVES_SYSTEM, alternativesUserPrompt, dropWrongSense, parseAlternativeWords } from "@core/wordAlternatives";
import { BREAK_SYSTEM, breakUserPrompt, parseParagraphBreak } from "@core/paragraphBreak";
import { SPLIT_SYSTEM, parseSplitSuggestion, splitUserPrompt } from "@core/sentenceSplit";
import { type FactDraft, type FactOrigin } from "@core/NarrativeFact";
import { type PromptDebugMessage } from "../promptDebug";
import { STORE_ERROR } from "../i18n";
import { ANALYZE_MAX_TOKENS, CRITIC_MAX_TOKENS, EXTRACTOR_MAX_TOKENS, activeReader, activeVoice, ollamaHint } from "./helpers";

import type { AiContext } from "./aiContext";

/**
 * The AI actions that read and judge the manuscript rather than write it:
 * Analyze, Critics, Extract facts (chapter, brainstorm note, synopsis, brief),
 * Summarize, Ask about the manuscript or a passage, lore import, the
 * illustration prompt, small suggestions (word alternatives, sentence split,
 * paragraph break), and the long-running Proofread and Developmental passes
 * that resume themselves. They own their results and the two job locks, and
 * take everything shared from `AiContext`.
 */
export function useReviewActions(ctx: AiContext) {
  const {
    book,
    bookRef,
    chapterRef,
    surfaceRef,
    abortRef,
    busy,
    setBusy,
    setError,
    setChapterFeedback,
    setCriticFeedback,
    models,
    ollamaError,
    reviewModel,
    contextWindowRef,
    flushSave,
    manuscriptFromModel,
    recordPrompt,
    recordPromptResponse,
    makeProvider,
    withInheritedFacts
  } = ctx;
  const [askManuscriptAnswer, setAskManuscriptAnswer] = useState<AskManuscriptAnswer | null>(null);
  const [askPassageAnswer, setAskPassageAnswer] = useState<{ question: string; answer: string } | null>(null);
  const [importLoreProgress, setImportLoreProgress] = useState<{ current: number; total: number } | null>(null);
  const proofreadLock = useRef(false);
  const developmentalLock = useRef(false);
  const analyzeScene = useCallback(
    async (sceneId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return false;
      const chapter = current.chapters.find((item) => item.id === id);
      const scene = chapter ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      if (!chapter || !scene?.prose.trim()) {
        setError(STORE_ERROR.analyzeEmpty);
        return false;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return false;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("analyze");
      setError(null);
      try {
        const analyzeMessages: PromptDebugMessage[] = [
          { role: "system", content: ANALYZE_SYSTEM },
          { role: "user", content: analyzeSceneUserPrompt(current, chapter, sceneId) }
        ];
        recordPrompt("analyze", reviewModel, analyzeMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: analyzeMessages,
          temperature: 0.25,
          maxTokens: ANALYZE_MAX_TOKENS,
          signal: abort.signal
        });
        const items = parseChapterFeedback(raw, scene.prose, {
          voice: resolveVoice(current, chapter),
          ...(kidlitReader(resolveReader(current, chapter)) ? { kidlit: true } : {})
        }).map((item) => ({
          ...item,
          paragraphIndex: item.paragraphIndex === null ? null : item.paragraphIndex + scene.startParagraph
        }));
        setChapterFeedback({ chapterId: id, items });
        return true;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return false;
        setError(ollamaHint(err));
        return false;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, reviewModel, models.length, ollamaError]
  );

  const suggestAlternatives = useCallback(
    async (args: {
      word: string;
      sentence: string;
      before?: string;
      after?: string;
      signal?: AbortSignal;
    }) => {
      if (models.length === 0) {
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const alternativesMessages: PromptDebugMessage[] = [
          { role: "system", content: ALTERNATIVES_SYSTEM },
          {
            role: "user",
            content: alternativesUserPrompt(
              args.word,
              args.sentence,
              bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "",
              {
                ...(args.before ? { before: args.before } : {}),
                ...(args.after ? { after: args.after } : {})
              },
              bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined
            )
          }
        ];
        recordPrompt("word-swap", reviewModel, alternativesMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: alternativesMessages,
          temperature: 0.3,
          maxTokens: 140,
          ...(args.signal ? { signal: args.signal } : {})
        });
        return dropWrongSense(args.word, args.sentence, parseAlternativeWords(raw, args.word));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") throw err;
        setError(ollamaHint(err));
        throw err;
      }
    },
    [reviewModel, models.length, ollamaError]
  );

  const suggestSentenceSplit = useCallback(
    async (sentence: string, signal?: AbortSignal) => {
      if (models.length === 0) {
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const splitMessages: PromptDebugMessage[] = [
          { role: "system", content: SPLIT_SYSTEM },
          { role: "user", content: splitUserPrompt(sentence, bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "", bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined) }
        ];
        recordPrompt("sentence-split", reviewModel, splitMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: splitMessages,
          temperature: 0.55,
          maxTokens: 280,
          ...(signal ? { signal } : {})
        });
        const split = parseSplitSuggestion(raw, sentence);
        if (!split) return "";
        return split;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") throw err;
        setError(ollamaHint(err));
        throw err;
      }
    },
    [reviewModel, models.length, ollamaError]
  );

  const suggestParagraphBreak = useCallback(
    async (paragraph: string, signal?: AbortSignal) => {
      if (models.length === 0) {
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const breakMessages: PromptDebugMessage[] = [
          { role: "system", content: BREAK_SYSTEM },
          { role: "user", content: breakUserPrompt(paragraph, bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "", bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined) }
        ];
        recordPrompt("paragraph-break", reviewModel, breakMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: breakMessages,
          temperature: 0.4,
          maxTokens: 700,
          ...(signal ? { signal } : {})
        });
        return parseParagraphBreak(raw, paragraph);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") throw err;
        setError(ollamaHint(err));
        throw err;
      }
    },
    [reviewModel, models.length, ollamaError]
  );

  const extractChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError(STORE_ERROR.extractEmpty);
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("extract");
    setError(null);
    try {
      const scenes = chapterScenes(chapter);
      const provider = makeProvider(reviewModel);
      let totalDrafts = 0;
      for (const scene of scenes) {
        if (!scene.prose.trim()) continue;
        const title = scenes.length > 1 ? `${chapter.title} — scene ${scene.sequence_index + 1}` : chapter.title;
        const extractMessages: PromptDebugMessage[] = [
          { role: "system", content: EXTRACTOR_SYSTEM },
          { role: "user", content: extractorUserPrompt(scene.prose, title) }
        ];
        recordPrompt("extract", reviewModel, extractMessages);
        const raw = await provider.chat({
          messages: extractMessages,
          temperature: 0.1,
          maxTokens: EXTRACTOR_MAX_TOKENS,
          signal: abort.signal
        });
        recordPromptResponse(raw);
        // See the matching comment in extractInterview: a parse failure
        // (no JSON at all in the response) means the same thing to the
        // author as an empty result, so it's treated the same way rather
        // than surfacing the raw parser exception.
        let drafts: FactDraft[];
        try {
          drafts = parseExtractorPayload(raw);
        } catch {
          drafts = [];
        }
        totalDrafts += drafts.length;
        const latest = bookRef.current ?? current;
        const nextFacts = applyExtractorDrafts(latest.facts, drafts, chapter.sequence_index, chapter.id, scene.id, "chapter");
        await flushSave(touch(latest, { facts: nextFacts }));
      }
      if (totalDrafts === 0) setError(STORE_ERROR.extractorNone);
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setError(ollamaHint(err));
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, reviewModel, models.length, ollamaError]);

  const analyzeChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return false;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError(STORE_ERROR.analyzeEmpty);
      return false;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return false;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("analyze");
    setError(null);
    try {
      const analyzeMessages: PromptDebugMessage[] = [
        { role: "system", content: ANALYZE_SYSTEM },
        { role: "user", content: analyzeUserPrompt(current, chapter) }
      ];
      recordPrompt("analyze", reviewModel, analyzeMessages);
      const raw = await makeProvider(reviewModel).chat({
        messages: analyzeMessages,
        temperature: 0.25,
        maxTokens: ANALYZE_MAX_TOKENS,
        signal: abort.signal
      });
      recordPromptResponse(raw);
      const items = parseChapterFeedback(raw, chapter.prose, {
        voice: resolveVoice(current, chapter),
        ...(kidlitReader(resolveReader(current, chapter)) ? { kidlit: true } : {})
      });
      setChapterFeedback({ chapterId: id, items });
      return true;
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return false;
      setError(ollamaHint(err));
      return false;
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, reviewModel, models.length, ollamaError]);

  /**
   * One AI call per selected persona (roadmap-ideas.md #50), run in
   * parallel — each reads the same chapter prose with its own voice and
   * its own, separate quote-and-observation list. The author picks which
   * personas run each time (checkbox setup card), so the cost is theirs to
   * choose; an empty selection never reaches here (the setup card disables
   * the run button). If any one persona's call fails, the whole run
   * surfaces that error rather than silently dropping a voice.
   */
  const runCritics = useCallback(
    async (personas: CriticPersonaId[]) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy || personas.length === 0) return false;
      const chapter = current.chapters.find((item) => item.id === id);
      if (!chapter?.prose.trim()) {
        setError(STORE_ERROR.analyzeEmpty);
        return false;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return false;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("critics");
      setError(null);
      try {
        const userPrompt = criticUserPrompt(current, chapter);
        const results = await Promise.all(
          personas.map(async (persona) => {
            const messages: PromptDebugMessage[] = [
              { role: "system", content: CRITIC_SYSTEM_PROMPTS[persona] },
              { role: "user", content: userPrompt }
            ];
            recordPrompt("critics", reviewModel, messages);
            const raw = await makeProvider(reviewModel).chat({
              messages,
              temperature: 0.3,
              maxTokens: CRITIC_MAX_TOKENS,
              signal: abort.signal
            });
            recordPromptResponse(raw);
            return parseCriticFeedback(raw, chapter.prose, persona);
          })
        );
        setCriticFeedback({ chapterId: id, items: results.flat() });
        return true;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return false;
        setError(ollamaHint(err));
        return false;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, reviewModel, models.length, ollamaError]
  );

  const dismissCriticFeedback = useCallback(() => setCriticFeedback(null), []);

  const generateIllustrationPrompt = useCallback(
    async (passage: string) => {
      const current = bookRef.current;
      if (!current || busy || !passage.trim()) return null;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return null;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("illustrate");
      setError(null);
      try {
        const entities = relevantEntitiesForPassage(passage, withInheritedFacts(current));
        const illustrateMessages = illustrationPromptMessages(passage, entities, current.illustration_style);
        recordPrompt("illustrate", reviewModel, illustrateMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: illustrateMessages,
          temperature: 0.4,
          maxTokens: 500,
          signal: abort.signal
        });
        const withTextConstraint = enforceNoTextConstraint(raw.trim(), current.illustration_style);
        return applyOrientationHint(withTextConstraint, current.illustration_orientation);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return null;
        setError(ollamaHint(err));
        return null;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, reviewModel, models.length, ollamaError]
  );

  const askManuscript = useCallback(
    async (question: string) => {
      const current = bookRef.current;
      const trimmed = question.trim();
      if (!current || busy || !trimmed) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      const chaptersWithProse = proseChapters(current);
      if (chaptersWithProse.length === 0) {
        setError(STORE_ERROR.askManuscriptEmpty);
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("ask-manuscript");
      setError(null);

      const sources: ManuscriptSource[] = chaptersWithProse.flatMap((chapterItem) =>
        chapterScenes(chapterItem)
          .filter((scene) => scene.prose.trim())
          .map((scene) => ({
            sceneId: scene.id,
            chapterId: chapterItem.id,
            chapterTitle: chapterItem.title,
            prose: scene.prose
          }))
      );

      try {
        const provider = makeProvider(reviewModel);
        let evidence: ManuscriptEvidence[];
        try {
          const [sourceEmbeddings, queryEmbeddings] = await Promise.all([
            provider.embed({ texts: sources.map((source) => source.prose), signal: abort.signal }),
            provider.embed({ texts: [trimmed], signal: abort.signal })
          ]);
          const queryEmbedding = queryEmbeddings[0];
          if (!queryEmbedding) throw new Error("No query embedding returned.");
          evidence = rankBySimilarity(queryEmbedding, sources, sourceEmbeddings, undefined, trimmed);
        } catch (embedErr) {
          if ((embedErr as { name?: string }).name === "AbortError") throw embedErr;
          evidence = rankByKeywordOverlap(trimmed, sources);
        }

        if (evidence.length === 0) {
          setError(STORE_ERROR.askManuscriptNoMatch);
          return;
        }

        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: ASK_MANUSCRIPT_SYSTEM },
          { role: "user", content: askManuscriptUserPrompt(trimmed, evidence) }
        ];
        recordPrompt("ask-manuscript", reviewModel, askMessages);
        const raw = await provider.chat({
          messages: askMessages,
          temperature: 0.2,
          maxTokens: 700,
          signal: abort.signal
        });
        setAskManuscriptAnswer({ question: trimmed, answer: raw.trim(), evidence });
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, models.length, ollamaError, recordPrompt, reviewModel]
  );

  const askAboutPassage = useCallback(
    async (args: { span?: TextSpan; question: string }) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      const trimmed = args.question.trim();
      if (!current || !id || busy || !trimmed) return false;
      const chapter = current.chapters.find((item) => item.id === id);
      if (!chapter?.prose.trim()) {
        setError(STORE_ERROR.analyzeEmpty);
        return false;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return false;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("ask-passage");
      setError(null);
      try {
        const userContent = args.span
          ? askAboutSelectionUserPrompt({ book: current, chapter, ...surroundingPassage(chapter.prose, args.span), question: trimmed })
          : askAboutChapterUserPrompt(current, chapter, trimmed);
        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: ASK_ABOUT_PASSAGE_SYSTEM },
          { role: "user", content: userContent }
        ];
        recordPrompt("ask-passage", reviewModel, askMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: askMessages,
          temperature: 0.4,
          maxTokens: 700,
          signal: abort.signal
        });
        setAskPassageAnswer({ question: trimmed, answer: raw.trim() });
        return true;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return false;
        setError(ollamaHint(err));
        return false;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, models.length, ollamaError, recordPrompt, reviewModel]
  );

  /**
   * Extract candidate Story Bible facts straight from a Brainstorm note —
   * the first of several planning-content sources (Synopsis and chapter/
   * scene briefs are next) meant to close the "author writes naturally,
   * then has to re-type the same information into Story Bible" gap. Not
   * tied to any chapter (same reasoning as importLoreArticles below: a
   * brainstorm note isn't manuscript prose, so nothing here is "as of" a
   * story-time position) and uses PLANNING_EXTRACTOR_SYSTEM rather than
   * EXTRACTOR_SYSTEM — planning text mixes settled claims with possibilities
   * ("Nora may discover…") that a prose-tuned extractor would flatten into
   * false certainty. Every candidate still lands in the same review queue
   * as any other extraction, tagged origin: "brainstorm" for the "Source:
   * Brainstorm" line — never locked directly.
   */
  const extractBrainstormNote = useCallback(
    async (noteId: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      const note = current.brainstorm_notes.find((item) => item.id === noteId);
      if (!note?.text.trim()) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("extract-brainstorm");
      setError(null);
      try {
        const provider = makeProvider(reviewModel);
        const extractMessages: PromptDebugMessage[] = [
          { role: "system", content: PLANNING_EXTRACTOR_SYSTEM },
          { role: "user", content: planningExtractorUserPrompt(note.text, "Brainstorm note") }
        ];
        recordPrompt("extract-brainstorm", reviewModel, extractMessages);
        const raw = await provider.chat({
          messages: extractMessages,
          temperature: 0.1,
          maxTokens: EXTRACTOR_MAX_TOKENS,
          signal: abort.signal
        });
        recordPromptResponse(raw);
        let drafts: FactDraft[];
        try {
          drafts = parseExtractorPayload(raw);
        } catch {
          drafts = [];
        }
        if (drafts.length === 0) {
          setError(STORE_ERROR.brainstormExtractorNone);
          return;
        }
        const latest = bookRef.current ?? current;
        const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, "brainstorm");
        await flushSave(touch(latest, { facts: nextFacts }));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]
  );

  /**
   * Second of the three planning-content sources (Brainstorm notes above,
   * chapter/scene briefs below) — same PLANNING_EXTRACTOR_SYSTEM, same
   * unattached-to-any-chapter treatment as importLoreArticles: Synopsis
   * describes the whole story, not one chapter's story-time position.
   */
  const extractSynopsis = useCallback(async () => {
    const current = bookRef.current;
    if (!current || busy || !current.synopsis.trim()) return;
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("extract-synopsis");
    setError(null);
    try {
      const provider = makeProvider(reviewModel);
      const extractMessages: PromptDebugMessage[] = [
        { role: "system", content: PLANNING_EXTRACTOR_SYSTEM },
        { role: "user", content: planningExtractorUserPrompt(current.synopsis, "Synopsis") }
      ];
      recordPrompt("extract-synopsis", reviewModel, extractMessages);
      const raw = await provider.chat({
        messages: extractMessages,
        temperature: 0.1,
        maxTokens: EXTRACTOR_MAX_TOKENS,
        signal: abort.signal
      });
      recordPromptResponse(raw);
      let drafts: FactDraft[];
      try {
        drafts = parseExtractorPayload(raw);
      } catch {
        drafts = [];
      }
      if (drafts.length === 0) {
        setError(STORE_ERROR.synopsisExtractorNone);
        return;
      }
      const latest = bookRef.current ?? current;
      const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, "synopsis");
      await flushSave(touch(latest, { facts: nextFacts }));
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setError(ollamaHint(err));
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]);

  /**
   * Third planning-content source: a chapter's own brief, or (with sceneId)
   * one scene's own brief. Unlike Brainstorm/Synopsis, briefs ARE naturally
   * chapter-scoped — so, exactly like Interview extraction since v1.0.23,
   * this attributes the resulting facts to that chapter (and scene, when
   * given), reusing the same story-time visibility gate: a fact from a
   * scene's own brief stays invisible to Draft until that scene's own pass,
   * a fact from the chapter's whole brief from the chapter's first page.
   */
  const extractBrief = useCallback(
    async (chapterId: string, sceneId?: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter) return;
      const scene = sceneId ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      const text = sceneId ? scene?.brief : chapter.brief;
      if (!text?.trim()) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("extract-brief");
      setError(null);
      try {
        const provider = makeProvider(reviewModel);
        const title = chapter.title.trim() || "Untitled";
        const label = sceneId ? `${title} — scene brief` : `${title} — chapter brief`;
        const extractMessages: PromptDebugMessage[] = [
          { role: "system", content: PLANNING_EXTRACTOR_SYSTEM },
          { role: "user", content: planningExtractorUserPrompt(text, label) }
        ];
        recordPrompt("extract-brief", reviewModel, extractMessages);
        const raw = await provider.chat({
          messages: extractMessages,
          temperature: 0.1,
          maxTokens: EXTRACTOR_MAX_TOKENS,
          signal: abort.signal
        });
        recordPromptResponse(raw);
        let drafts: FactDraft[];
        try {
          drafts = parseExtractorPayload(raw);
        } catch {
          drafts = [];
        }
        if (drafts.length === 0) {
          setError(STORE_ERROR.briefExtractorNone);
          return;
        }
        const latest = bookRef.current ?? current;
        const nextFacts = applyExtractorDrafts(
          latest.facts,
          drafts,
          chapter.sequence_index,
          chapter.id,
          sceneId,
          "brief"
        );
        await flushSave(touch(latest, { facts: nextFacts }));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]
  );

  /**
   * Generates a chapter summary but never saves it — the caller decides
   * whether to apply it outright (an empty summary has nothing to lose)
   * or hold it for the author to accept/reject (there's handwritten or
   * previously generated text in the field already). Returns undefined
   * on any failure (error already set via `setError`).
   */
  const summarizeChapter = useCallback(
    async (chapterId: string): Promise<string | undefined> => {
      const current = bookRef.current;
      if (!current || busy) return undefined;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter || !chapter.prose.trim()) return undefined;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return undefined;
      }
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("summarize");
      setError(null);
      try {
        const provider = makeProvider(reviewModel);
        const summarizeMessages: PromptDebugMessage[] = [
          { role: "system", content: SUMMARIZE_CHAPTER_SYSTEM },
          { role: "user", content: summarizeChapterUserPrompt(chapter) }
        ];
        recordPrompt("summarize", reviewModel, summarizeMessages);
        // The wanted output is just 2-4 sentences, but a tight token budget
        // starves any model that thinks/plans before answering (reasoning
        // models especially) — it gets cut off mid-preamble, which reads as
        // either an empty reply or the chapter's own opening echoed back.
        // 700 leaves room for that before the real summary comes out.
        const raw = await provider.chat({ messages: summarizeMessages, temperature: 0.2, maxTokens: 700, signal: abort.signal });
        recordPromptResponse(raw);
        const summary = manuscriptFromModel(raw, "");
        if (!summary) {
          setError(STORE_ERROR.summarizeNone);
          return undefined;
        }
        return summary;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return undefined;
        setError(ollamaHint(err));
        return undefined;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]
  );

  /**
   * A porting aid for an author's existing lorebook (roadmap-ideas.md #28,
   * step 1: source-agnostic, before any format-specific adapter exists) —
   * run one or more pasted/uploaded articles through the same extractor a
   * chapter or interview uses. Not tied to any chapter (no
   * chapter_id/scene_id): an article isn't manuscript prose, so nothing
   * here is "as of" a story-time position. Every article lands in the same
   * review queue as any other extraction, never locked directly.
   *
   * Runs sequentially, not in parallel — a local model server generally
   * only processes one generation at a time anyway, and sequential keeps
   * "article 3 of 7" progress reporting simple and correct. One article
   * failing (a bad response, a dropped connection) is reported but doesn't
   * abort the rest of the batch; the single-article case (the common one,
   * still just a one-element array) behaves exactly as before.
   */
  const importLoreArticles = useCallback(
    async (
      articles: LoreArticleCandidate[],
      origin: FactOrigin = "lore"
    ): Promise<{ articlesProcessed: number; articlesWithFacts: number; totalFacts: number }> => {
      const trimmed = articles
        .map((article) => ({ title: article.title.trim(), text: article.text.trim() }))
        .filter((article) => article.text);
      const current = bookRef.current;
      const empty = { articlesProcessed: 0, articlesWithFacts: 0, totalFacts: 0 };
      if (!current || busy || trimmed.length === 0) return empty;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return empty;
      }
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("import-lore");
      setError(null);
      let articlesWithFacts = 0;
      let totalFacts = 0;
      try {
        for (let i = 0; i < trimmed.length; i++) {
          const article = trimmed[i]!;
          setImportLoreProgress({ current: i + 1, total: trimmed.length });
          try {
            const provider = makeProvider(reviewModel);
            const extractMessages: PromptDebugMessage[] = [
              { role: "system", content: EXTRACTOR_SYSTEM },
              { role: "user", content: extractorUserPrompt(article.text, article.title || "Imported lore article") }
            ];
            recordPrompt("import-lore", reviewModel, extractMessages);
            const raw = await provider.chat({
              messages: extractMessages,
              temperature: 0.1,
              maxTokens: EXTRACTOR_MAX_TOKENS,
              signal: abort.signal
            });
            const drafts = parseExtractorPayload(raw);
            if (drafts.length === 0) continue;
            const latest = bookRef.current ?? current;
            const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, origin);
            await flushSave(touch(latest, { facts: nextFacts }));
            articlesWithFacts += 1;
            totalFacts += drafts.length;
          } catch (err) {
            if ((err as { name?: string }).name === "AbortError") throw err;
            setError(ollamaHint(err));
          }
        }
        if (articlesWithFacts === 0) setError(STORE_ERROR.importLoreNone);
        return { articlesProcessed: trimmed.length, articlesWithFacts, totalFacts };
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return { articlesProcessed: trimmed.length, articlesWithFacts, totalFacts };
        throw err;
      } finally {
        setBusy(null);
        setImportLoreProgress(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, models.length, ollamaError, recordPrompt, reviewModel]
  );

  /**
   * The other half of "bring the series forward" —
   * facts read straight from a previous book's own export file
   * (seriesImport.ts), not run through the extractor at all: the values
   * are already known, not guessed from prose. Still lands as ordinary
   * `ai_proposed` review-queue candidates (origin "series") rather than
   * locked outright — a fact that held in the last book isn't
   * automatically still true in this one, and `applyExtractorDrafts`
   * already flags it instead of duplicating if this book disagrees.
   */
  const importSeriesFacts = useCallback(
    async (drafts: FactDraft[]): Promise<{ imported: number }> => {
      const current = bookRef.current;
      if (!current || busy || drafts.length === 0) return { imported: 0 };
      const nextFacts = applyExtractorDrafts(current.facts, drafts, current.facts.length, undefined, undefined, "series");
      const imported = nextFacts.length - current.facts.length;
      if (imported > 0) await flushSave(touch(current, { facts: nextFacts }));
      return { imported };
    },
    [busy, flushSave]
  );


  const startProofread = useCallback(
    async (opts?: { restart?: boolean; stages?: ProofreadStage[]; scopeChapterId?: string }) => {
      const current = bookRef.current;
      if (!current || busy || proofreadLock.current) return;
      if (proseChapters(current).length === 0) {
        setError(STORE_ERROR.proofreadEmpty);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const existing = current.proofread;
      const restart = Boolean(opts?.restart);
      const job =
        !restart && existing && (existing.status === "paused" || existing.status === "running" || existing.status === "error")
          ? touchProofread(existing, { status: "running" })
          : startProofreadJob(current, {
              ...(opts?.stages ? { stages: opts.stages } : {}),
              ...(opts?.scopeChapterId ? { scopeChapterId: opts.scopeChapterId } : {})
            });

      proofreadLock.current = true;
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("proofread");
      setError(null);
      await flushSave(touch(current, { proofread: job }));
      try {
        await runProofread(
          job,
          {
            complete: (system, user, signal) => {
              const proofreadMessages: PromptDebugMessage[] = [
                { role: "system", content: system },
                { role: "user", content: user }
              ];
              recordPrompt("proofread", reviewModel, proofreadMessages);
              return makeProvider(reviewModel).chat({
                messages: proofreadMessages,
                temperature: 0.2,
                maxTokens: EXTRACTOR_MAX_TOKENS,
                signal
              });
            },
            getBook: () => bookRef.current ?? current,
            save: async (next) => {
              const latest = bookRef.current;
              if (!latest) return;
              await flushSave(touch(latest, { proofread: next }));
            },
            saveFacts: async (facts) => {
              const latest = bookRef.current;
              if (!latest) return;
              await flushSave(touch(latest, { facts }));
            },
            contextWindow: contextWindowRef.current
          },
          abort.signal
        );
      } catch (err) {
        const latest = bookRef.current;
        const proofread = latest?.proofread;
        if ((err as { name?: string }).name === "AbortError") {
          if (latest && proofread) {
            await flushSave(touch(latest, { proofread: touchProofread(proofread, { status: "paused" }) }));
          }
          return;
        }
        setError(ollamaHint(err));
        if (latest && proofread) {
          await flushSave(touch(latest, { proofread: touchProofread(proofread, { status: "error" }) }));
        }
      } finally {
        proofreadLock.current = false;
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, models.length, ollamaError, reviewModel]
  );

  useEffect(() => {
    if (!book?.proofread || book.proofread.status !== "running") return;
    if (busy) return;
    if (models.length === 0) return;
    void startProofread();
  }, [book?.id, book?.proofread?.status, busy, models.length, startProofread]);

  const startDevelopmentalAnalysis = useCallback(
    async (opts?: { restart?: boolean }) => {
      const current = bookRef.current;
      if (!current || busy || developmentalLock.current) return;
      if (proseChapters(current).length === 0) {
        setError(STORE_ERROR.developmentalEmpty);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const existing = current.developmental;
      const restart = Boolean(opts?.restart);
      const job =
        !restart && existing && (existing.status === "paused" || existing.status === "running" || existing.status === "error")
          ? touchDevelopmental(existing, { status: "running" })
          : startDevelopmentalJob();

      developmentalLock.current = true;
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("developmental");
      setError(null);
      await flushSave(touch(current, { developmental: job }));
      try {
        await runDevelopmental(
          job,
          {
            complete: (system, user, signal) => {
              const developmentalMessages: PromptDebugMessage[] = [
                { role: "system", content: system },
                { role: "user", content: user }
              ];
              recordPrompt("developmental", reviewModel, developmentalMessages);
              return makeProvider(reviewModel).chat({
                messages: developmentalMessages,
                temperature: 0.2,
                maxTokens: EXTRACTOR_MAX_TOKENS,
                signal
              });
            },
            getBook: () => bookRef.current ?? current,
            save: async (next) => {
              const latest = bookRef.current;
              if (!latest) return;
              await flushSave(touch(latest, { developmental: next }));
            }
          },
          abort.signal
        );
      } catch (err) {
        const latest = bookRef.current;
        const developmental = latest?.developmental;
        if ((err as { name?: string }).name === "AbortError") {
          if (latest && developmental) {
            await flushSave(touch(latest, { developmental: touchDevelopmental(developmental, { status: "paused" }) }));
          }
          return;
        }
        setError(ollamaHint(err));
        if (latest && developmental) {
          await flushSave(touch(latest, { developmental: touchDevelopmental(developmental, { status: "error" }) }));
        }
      } finally {
        developmentalLock.current = false;
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, models.length, ollamaError, reviewModel]
  );

  useEffect(() => {
    if (!book?.developmental || book.developmental.status !== "running") return;
    if (busy) return;
    if (models.length === 0) return;
    void startDevelopmentalAnalysis();
  }, [book?.id, book?.developmental?.status, busy, models.length, startDevelopmentalAnalysis]);

  return {
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
  };
}
