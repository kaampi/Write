import { useCallback, type MutableRefObject } from "react";
import { sortedChapters, touch, type Book } from "@core/BookSchema";
import { chapterScenes } from "@core/bookScene";
import {
  applyAuthorAddition,
  applyAuthorDraft,
  approveFact,
  keepFactSeparate,
  rejectFact,
  retractFact,
  reviseFact
} from "@core/ConsistencyGate";
import type { EntityKind } from "@core/bibleGroups";
import { slugify } from "@core/ids";
import type { FactDraft, NarrativeFact } from "@core/NarrativeFact";
import type { CorePredicate } from "@core/predicates";
import { withRelationshipMirrorForAI } from "@core/relationshipMirror";
import type { LocalModelProvider } from "@llm/provider";
import { RELATIONSHIP_MIRROR_MAX_TOKENS } from "./helpers";

/** What the Story Bible fact actions need from the store around them. */
export type FactsDeps = {
  bookRef: MutableRefObject<Book | null>;
  chapterRef: MutableRefObject<string | null>;
  flushSave: (next: Book) => Promise<unknown>;
  makeProvider: (modelName: string) => LocalModelProvider;
  reviewModel: string;
};

/**
 * The author-facing Story Bible fact actions: add, revise, retract, approve,
 * reject, keep separate — plus the relationship-mirror helper they share with
 * BiblePanel's merge flow. Each one reads the latest book from `bookRef`, runs
 * the ConsistencyGate rule, and saves through `flushSave`.
 */
export function useFacts({ bookRef, chapterRef, flushSave, makeProvider, reviewModel }: FactsDeps) {
  /**
   * Shared by every call site that needs the relationship-mirror suggestion
   * — wires `withRelationshipMirrorForAI` to the Review model so the mirror
   * is written from the other character's point of view, not just the
   * names swapped (see `relationshipMirror.ts`). Exposed on the store so
   * BiblePanel's merge flow can use the same provider wiring as the
   * in-store callbacks below, instead of duplicating it.
   */
  const mirrorRelationshipFact = useCallback(
    async (facts: NarrativeFact[], match: { entity_ref: string; predicate: CorePredicate; value: string }, kinds: EntityKind[]) =>
      withRelationshipMirrorForAI(facts, match, kinds, (messages) =>
        makeProvider(reviewModel).chat({ messages, temperature: 0.2, maxTokens: RELATIONSHIP_MIRROR_MAX_TOKENS })
      ),
    [reviewModel]
  );

  const addFact = useCallback(
    async (input: { label: string; predicate: CorePredicate; value: string; mode?: "replace" | "add" }) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current) return;
      const chapter = current.chapters.find((item) => item.id === id) ?? sortedChapters(current)[0];
      const draft: FactDraft = {
        entity_ref: slugify(input.label),
        entity_label: input.label.trim(),
        predicate: input.predicate,
        value: input.value.trim()
      };
      if (!draft.entity_label || !draft.value) return;
      const sceneId = chapter ? chapterScenes(chapter)[0]?.id : undefined;
      const applied =
        input.mode === "add"
          ? applyAuthorAddition(current.facts, draft, chapter?.sequence_index ?? 0, chapter?.id, sceneId)
          : applyAuthorDraft(current.facts, draft, chapter?.sequence_index ?? 0, chapter?.id, sceneId);
      const facts = await mirrorRelationshipFact(applied, draft, current.entity_kinds);
      await flushSave(touch(current, { facts }));
    },
    [flushSave, mirrorRelationshipFact]
  );

  const revise = useCallback(
    async (factId: string, value: string) => {
      const current = bookRef.current;
      if (!current) return;
      const target = current.facts.find((fact) => fact.id === factId);
      const revised = reviseFact(current.facts, factId, value);
      const facts = target
        ? await mirrorRelationshipFact(revised, { entity_ref: target.entity_ref, predicate: target.predicate, value }, current.entity_kinds)
        : revised;
      await flushSave(touch(current, { facts }));
    },
    [flushSave, mirrorRelationshipFact]
  );

  const retract = useCallback(
    async (factId: string) => {
      const current = bookRef.current;
      if (!current) return;
      const facts = retractFact(current.facts, factId);
      await flushSave(touch(current, { facts }));
    },
    [flushSave]
  );

  const approve = useCallback(
    async (factId: string, value?: string) => {
      const current = bookRef.current;
      if (!current) return;
      const next = value ? reviseFact(current.facts, factId, value) : current.facts;
      const approved = approveFact(next, factId);
      const target = approved.find((fact) => fact.id === factId);
      const facts = target
        ? await mirrorRelationshipFact(
            approved,
            { entity_ref: target.entity_ref, predicate: target.predicate, value: target.value },
            current.entity_kinds
          )
        : approved;
      await flushSave(touch(current, { facts }));
    },
    [flushSave, mirrorRelationshipFact]
  );

  const reject = useCallback(
    async (factId: string) => {
      const current = bookRef.current;
      if (!current) return;
      await flushSave(touch(current, { facts: rejectFact(current.facts, factId) }));
    },
    [flushSave]
  );

  const keepSeparate = useCallback(
    async (factId: string, value?: string) => {
      const current = bookRef.current;
      if (!current) return;
      const next = value ? reviseFact(current.facts, factId, value) : current.facts;
      await flushSave(touch(current, { facts: keepFactSeparate(next, factId) }));
    },
    [flushSave]
  );

  return { mirrorRelationshipFact, addFact, revise, retract, approve, reject, keepSeparate };
}
