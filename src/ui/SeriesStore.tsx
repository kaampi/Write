import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSeries as createSeriesRecord, entityNoteFor, setEntityNoteHistory, touchSeries, type Series } from "@core/SeriesSchema";
import {
  applyAuthorAddition,
  applyExtractorDrafts,
  applyPromotedFact,
  approveFact,
  keepFactSeparate,
  rejectFact,
  retractFact as retractFactRow,
  reviseFact as reviseFactRow
} from "@core/ConsistencyGate";
import { liftFragmentToSynopsis } from "@core/brainstorm";
import {
  EXTRACTOR_SYSTEM,
  extractorUserPrompt,
  parseExtractorPayload,
  PLANNING_EXTRACTOR_SYSTEM,
  planningExtractorUserPrompt
} from "@core/extractFacts";
import { addEntityPicture as addEntityPictureRow, removeEntityPicture as removeEntityPictureRow } from "@core/entityMedia";
import { slugify } from "@core/ids";
import type { FactDraft } from "@core/NarrativeFact";
import type { CorePredicate } from "@core/predicates";
import { crossBookConsistencyIssues, type BookFactSet, type ConsistencyIssue } from "@core/seriesConsistency";
import { SeriesNotFoundError, SeriesRepository } from "@persistence/SeriesRepository";
import { BookRepository } from "@persistence/Repository";
import { coreSharingOutbox } from "@persistence/CoreSharingRuntime";
import { picturesFromFile } from "./entityImage";
import {
  DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
  LocalProviderConfigError,
  OllamaModelProvider,
  OpenAICompatibleLocalProvider,
  type LocalModelProvider
} from "@llm/provider";
import { STORE_ERROR } from "./i18n";
import { EXTRACTOR_MAX_TOKENS, ollamaHint } from "./BookStore";
import { useBookStore } from "./useBookStore";
import { SeriesStoreContext, type SeriesBusy, type SeriesStoreValue } from "./useSeriesStore";

/**
 * A separate, much smaller context than BookStore — Series only owns the
 * series record itself (title/brainstorm/synopsis/facts) and its CRUD. A
 * book's own `series_id` is written through BookStore's `setBookSeries`
 * instead of here, so Book persistence has exactly one owner. Reads
 * BookStore's `summaries`/`engine`/`baseUrl`/`reviewModel`/`contextWindow`
 * (all already global, not per-book) to work out which books belong to
 * which series and to build its own LLM provider for extraction — this
 * provider must sit inside `BookStoreProvider` for either.
 */
export function SeriesStoreProvider({ children }: { children: React.ReactNode }) {
  const { summaries: bookSummaries, engine, baseUrl, reviewModel, models, ollamaError, contextWindow } = useBookStore();
  const repo = useMemo(() => new SeriesRepository(), []);
  const bookRepo = useMemo(() => new BookRepository(), []);
  const [summaries, setSummaries] = useState<SeriesStoreValue["summaries"]>([]);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [busy, setBusy] = useState<SeriesBusy>(null);
  const [error, setError] = useState<string | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[] | null>(null);
  const [consistencyChecking, setConsistencyChecking] = useState(false);
  const seriesRef = useRef<Series | null>(null);
  const saveTimer = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const bookCountBySeriesId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const summary of bookSummaries) {
      if (!summary.series_id) continue;
      counts.set(summary.series_id, (counts.get(summary.series_id) ?? 0) + 1);
    }
    return counts;
  }, [bookSummaries]);

  const refresh = useCallback(async () => {
    setSummaries(await repo.list(bookCountBySeriesId));
  }, [repo, bookCountBySeriesId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (next: Series) => {
      await repo.save(next);
      // The series remains locally saved even if the optional Core queue is unavailable.
      try { await coreSharingOutbox.enqueueSeriesSave(next.id, bookRepo); } catch { /* retry after the next local edit */ }
      setSummaries(await repo.list(bookCountBySeriesId));
    },
    [repo, bookRepo, bookCountBySeriesId]
  );

  const createSeries = useCallback(
    async (title: string) => {
      const created = createSeriesRecord(title);
      await repo.save(created);
      setSummaries(await repo.list(bookCountBySeriesId));
      seriesRef.current = created;
      setSeries(created);
      setSeriesId(created.id);
      setError(null);
      setConsistencyIssues(null);
      return created;
    },
    [repo, bookCountBySeriesId]
  );

  const openSeries = useCallback(
    async (id: string) => {
      try {
        const loaded = await repo.get(id);
        seriesRef.current = loaded;
        setSeries(loaded);
        setSeriesId(id);
        setError(null);
        setConsistencyIssues(null);
      } catch (err) {
        setError(err instanceof SeriesNotFoundError ? "series-not-found" : "series-unreadable");
      }
    },
    [repo]
  );

  const closeSeries = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(null);
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const current = seriesRef.current;
    if (current) void persist(current);
    seriesRef.current = null;
    setSeries(null);
    setSeriesId(null);
    setConsistencyIssues(null);
  }, [persist]);

  const renameSeries = useCallback(
    async (title: string) => {
      const current = seriesRef.current;
      if (!current) return;
      const next = touchSeries(current, { title: title.trim() || "Untitled series" });
      seriesRef.current = next;
      setSeries(next);
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void persist(next);
        saveTimer.current = null;
      }, 400);
    },
    [persist]
  );

  const deleteSeries = useCallback(
    async (id: string) => {
      await repo.delete(id);
      if (seriesRef.current?.id === id) {
        seriesRef.current = null;
        setSeries(null);
        setSeriesId(null);
      }
      setSummaries(await repo.list(bookCountBySeriesId));
    },
    [repo, bookCountBySeriesId]
  );

  const booksInSeries = useCallback((id: string) => bookSummaries.filter((book) => book.series_id === id), [bookSummaries]);

  const checkConsistency = useCallback(async () => {
    const current = seriesRef.current;
    if (!current) return;
    setConsistencyChecking(true);
    try {
      const summaries = bookSummaries.filter((book) => book.series_id === current.id);
      const bookFactSets: BookFactSet[] = await Promise.all(
        summaries.map(async (summary) => {
          try {
            const full = await bookRepo.get(summary.id);
            return { bookTitle: full.title, facts: full.facts };
          } catch {
            return { bookTitle: summary.title, facts: [] };
          }
        })
      );
      setConsistencyIssues(crossBookConsistencyIssues(current.facts, current.title, bookFactSets));
    } finally {
      setConsistencyChecking(false);
    }
  }, [bookSummaries, bookRepo]);

  /** Same debounced-patch shape as BookStore's `patchBook` — mutate in place, save shortly after. */
  const patchSeries = useCallback(
    (mutate: (current: Series) => Series) => {
      const current = seriesRef.current;
      if (!current) return;
      const next = touchSeries(mutate(current), {});
      seriesRef.current = next;
      setSeries(next);
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void persist(next);
        saveTimer.current = null;
      }, 400);
    },
    [persist]
  );

  const setBrainstorm = useCallback((text: string) => patchSeries((current) => ({ ...current, brainstorm: text })), [patchSeries]);

  const setSynopsis = useCallback((text: string) => patchSeries((current) => ({ ...current, synopsis: text })), [patchSeries]);

  const liftBrainstormToSynopsis = useCallback(() => {
    patchSeries((current) => ({ ...current, synopsis: liftFragmentToSynopsis(current.synopsis, current.brainstorm) }));
  }, [patchSeries]);

  function makeProvider(modelName: string): LocalModelProvider {
    if (engine === "openai-compatible") {
      return new OpenAICompatibleLocalProvider({ model: modelName, baseUrl: baseUrl.trim() || DEFAULT_OPENAI_COMPATIBLE_BASE_URL });
    }
    const ollamaBaseUrl = baseUrl.trim();
    return new OllamaModelProvider({ model: modelName, contextWindow, ...(ollamaBaseUrl ? { baseUrl: ollamaBaseUrl } : {}) });
  }

  const extractSynopsis = useCallback(async () => {
    const current = seriesRef.current;
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
      const raw = await provider.chat({
        messages: [
          { role: "system", content: PLANNING_EXTRACTOR_SYSTEM },
          { role: "user", content: planningExtractorUserPrompt(current.synopsis, current.title) }
        ],
        temperature: 0.1,
        maxTokens: EXTRACTOR_MAX_TOKENS,
        signal: abort.signal
      });
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
      const latest = seriesRef.current ?? current;
      const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, "synopsis");
      const next = touchSeries(latest, { facts: nextFacts });
      await persist(next);
      seriesRef.current = next;
      setSeries(next);
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setError(err instanceof LocalProviderConfigError ? err.message : ollamaHint(err));
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, models.length, ollamaError, reviewModel, persist, engine, baseUrl, contextWindow]);

  const setEntityHistory = useCallback(
    (entity_ref: string, history: string) =>
      patchSeries((current) => ({ ...current, entity_notes: setEntityNoteHistory(current.entity_notes, entity_ref, history) })),
    [patchSeries]
  );

  const addEntityPicture = useCallback(
    async (entity_ref: string, file: File) => {
      const current = seriesRef.current;
      if (!current) return;
      const picture = await picturesFromFile(file);
      const next = touchSeries(current, { media: addEntityPictureRow(current.media, entity_ref, picture) });
      await persist(next);
      seriesRef.current = next;
      setSeries(next);
    },
    [persist]
  );

  const removeEntityPicture = useCallback(
    async (entity_ref: string, index: number) => {
      const current = seriesRef.current;
      if (!current) return;
      const next = touchSeries(current, { media: removeEntityPictureRow(current.media, entity_ref, index) });
      await persist(next);
      seriesRef.current = next;
      setSeries(next);
    },
    [persist]
  );

  /**
   * "Extrahera fakta ur texten" on an entity's own history page — same
   * extractor a lore import uses (EXTRACTOR_SYSTEM: "established narrative
   * facts from accepted prose"), not the planning one Synopsis uses, since
   * a history page reads as settled lore, not a loose plan. Lands as
   * `ai_proposed` under origin "lore" — the same label a book's own lore
   * import already shows in its review queue, extended one level up.
   */
  const extractEntityNote = useCallback(
    async (entity_ref: string, entity_label: string) => {
      const current = seriesRef.current;
      if (!current || busy) return;
      const history = entityNoteFor(current.entity_notes, entity_ref).history;
      if (!history.trim()) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("extract-entity-note");
      setError(null);
      try {
        const provider = makeProvider(reviewModel);
        const raw = await provider.chat({
          messages: [
            { role: "system", content: EXTRACTOR_SYSTEM },
            { role: "user", content: extractorUserPrompt(history, entity_label) }
          ],
          temperature: 0.1,
          maxTokens: EXTRACTOR_MAX_TOKENS,
          signal: abort.signal
        });
        let drafts: FactDraft[];
        try {
          drafts = parseExtractorPayload(raw);
        } catch {
          drafts = [];
        }
        if (drafts.length === 0) {
          setError(STORE_ERROR.extractorNone);
          return;
        }
        const latest = seriesRef.current ?? current;
        const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, "lore");
        const next = touchSeries(latest, { facts: nextFacts });
        await persist(next);
        seriesRef.current = next;
        setSeries(next);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(err instanceof LocalProviderConfigError ? err.message : ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, models.length, ollamaError, reviewModel, persist, engine, baseUrl, contextWindow]
  );

  const addFact = useCallback(
    async (draft: { label: string; predicate: CorePredicate; value: string }) => {
      const current = seriesRef.current;
      if (!current) return;
      const factDraft: FactDraft = { entity_ref: slugify(draft.label), entity_label: draft.label, predicate: draft.predicate, value: draft.value };
      const nextFacts = applyAuthorAddition(current.facts, factDraft, current.facts.length);
      const next = touchSeries(current, { facts: nextFacts });
      await persist(next);
      seriesRef.current = next;
      setSeries(next);
    },
    [persist]
  );

  const mutateFacts = useCallback(
    async (mutate: (facts: Series["facts"]) => Series["facts"]) => {
      const current = seriesRef.current;
      if (!current) return;
      const nextFacts = mutate(current.facts);
      if (nextFacts === current.facts) return;
      const next = touchSeries(current, { facts: nextFacts });
      await persist(next);
      seriesRef.current = next;
      setSeries(next);
    },
    [persist]
  );

  const reviseFact = useCallback((factId: string, value: string) => mutateFacts((facts) => reviseFactRow(facts, factId, value)), [mutateFacts]);
  const retractFact = useCallback((factId: string) => mutateFacts((facts) => retractFactRow(facts, factId)), [mutateFacts]);
  const reject = useCallback((factId: string) => mutateFacts((facts) => rejectFact(facts, factId)), [mutateFacts]);
  const keepSeparate = useCallback(
    (factId: string, value?: string) =>
      mutateFacts((facts) => keepFactSeparate(value !== undefined ? reviseFactRow(facts, factId, value) : facts, factId)),
    [mutateFacts]
  );
  const approve = useCallback(
    (factId: string, value?: string) =>
      mutateFacts((facts) => approveFact(value !== undefined ? reviseFactRow(facts, factId, value) : facts, factId)),
    [mutateFacts]
  );

  const promoteBookFact = useCallback(
    async (draft: FactDraft, source: { book_id: string; book_title: string; chapter_title?: string }) => {
      const current = seriesRef.current;
      if (!current) return;
      const nextFacts = applyPromotedFact(current.facts, draft, current.facts.length, source);
      const next = touchSeries(current, { facts: nextFacts });
      await persist(next);
      seriesRef.current = next;
      setSeries(next);
    },
    [persist]
  );

  const value: SeriesStoreValue = {
    summaries,
    seriesId,
    series,
    busy,
    error,
    refresh,
    createSeries,
    openSeries,
    closeSeries,
    renameSeries,
    deleteSeries,
    booksInSeries,
    setBrainstorm,
    liftBrainstormToSynopsis,
    setSynopsis,
    extractSynopsis,
    setEntityHistory,
    addEntityPicture,
    removeEntityPicture,
    extractEntityNote,
    addFact,
    reviseFact,
    retractFact,
    approve,
    reject,
    keepSeparate,
    promoteBookFact,
    consistencyIssues,
    consistencyChecking,
    checkConsistency
  };

  return <SeriesStoreContext.Provider value={value}>{children}</SeriesStoreContext.Provider>;
}
