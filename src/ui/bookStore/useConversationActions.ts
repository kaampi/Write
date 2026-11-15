import { useCallback, useState } from "react";
import { sortedChapters, touch } from "@core/BookSchema";
import { brainstormChatSystemPrompt, type BrainstormChatMessage } from "@core/brainstorm";
import { applyExtractorDrafts } from "@core/ConsistencyGate";
import { characterInterviewSystem, type InterviewMessage } from "@core/characterInterview";
import type { BibleKind } from "@core/bibleGroups";
import { profileFor, upsertCharacterProfile } from "@core/characterProfile";
import {
  beatPlotlines,
  developExpandUserPrompt,
  developmentMethodById,
  materializeBeats,
  DEVELOP_EXPAND_SYSTEM,
  type DevelopmentStep
} from "@core/developmentMethod";
import { removePlotline } from "@core/plotlines";
import { INTERVIEW_EXTRACTOR_SYSTEM, interviewExtractorUserPrompt, parseExtractorPayload } from "@core/extractFacts";
import { type FactDraft } from "@core/NarrativeFact";
import { type PromptDebugMessage } from "../promptDebug";
import { count, format, getMessages, STORE_ERROR } from "../i18n";
import { EXTRACTOR_MAX_TOKENS, ollamaHint } from "./helpers";

import type { AiContext } from "./aiContext";

/**
 * The conversational AI actions: the brainstorm chat, the character
 * interview (including extracting facts from it), and the development-method
 * helpers. They own their own state — chat and interview history, the
 * extraction position, the current development suggestion — and use the shared
 * `AiContext` for everything that belongs to the store as a whole.
 */
export function useConversationActions(ctx: AiContext) {
  const {
    bookRef,
    chapterRef,
    abortRef,
    busy,
    setBusy,
    setError,
    models,
    ollamaError,
    model,
    reviewModel,
    flushSave,
    patchBook,
    recordPrompt,
    recordPromptResponse,
    makeProvider,
    writingSystem,
    withInheritedFacts
  } = ctx;
  const [interviewEntity, setInterviewEntity] = useState<{ ref: string; label: string; kind: BibleKind } | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<InterviewMessage[]>([]);
  const [interviewPersonalityDraft, setInterviewPersonalityDraft] = useState("");
  const [brainstormChatHistory, setBrainstormChatHistory] = useState<BrainstormChatMessage[]>([]);
  /**
   * Which chapter Extract facts attributes new facts to, in story time — not
   * always the chapter open in the editor. An interview isn't extracted
   * from that chapter's own prose (unlike chapter extraction, where the
   * source chapter IS the natural story-time position), so guessing "the
   * chapter you happen to have open" can silently misdate a fact that only
   * becomes true later — e.g. a character's preference between two people
   * he hasn't met yet. Defaults to the open chapter when the interview
   * starts (today's old behavior), but now as a visible, changeable choice
   * rather than a silent one.
   */
  const [interviewExtractChapterId, setInterviewExtractChapterIdState] = useState<string | null>(null);
  /**
   * Which scene, within `interviewExtractChapterId`, the extracted fact is
   * attributed to (roadmap-ideas.md #33 follow-up) — null means "the whole
   * chapter," the old, simpler default. Set together with the chapter id
   * (never independently) so the two can never point at mismatched
   * chapters; see `setInterviewExtractPosition`.
   */
  const [interviewExtractSceneId, setInterviewExtractSceneId] = useState<string | null>(null);
  const [developSuggestion, setDevelopSuggestion] = useState<string | null>(null);
  const startBrainstormChat = useCallback(() => {
    setBrainstormChatHistory([]);
  }, []);

  const closeBrainstormChat = useCallback(() => {
    setBrainstormChatHistory([]);
  }, []);

  const askBrainstormChat = useCallback(
    async (message: string) => {
      const current = bookRef.current;
      const trimmed = message.trim();
      if (!current || !trimmed) return;
      if (busy) {
        setError(STORE_ERROR.busy);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const priorTurns = brainstormChatHistory;
      const userTurn: BrainstormChatMessage = { role: "user", content: trimmed };
      setBrainstormChatHistory([...priorTurns, userTurn]);

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("brainstorm-chat");
      setError(null);

      try {
        const provider = makeProvider(model);
        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(brainstormChatSystemPrompt(current)) },
          ...priorTurns,
          userTurn
        ];
        recordPrompt("brainstorm-chat", model, askMessages);
        let raw = "";
        for await (const chunk of provider.streamChat({
          messages: askMessages,
          temperature: 0.9,
          maxTokens: 500,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            raw += chunk.text;
            setBrainstormChatHistory([...priorTurns, userTurn, { role: "assistant", content: raw }]);
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        setBrainstormChatHistory([...priorTurns, userTurn, { role: "assistant", content: raw.trim() }]);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [brainstormChatHistory, busy, model, models.length, ollamaError, recordPrompt]
  );
  /** The only way to change either half of the extraction position — keeps chapter and scene from ever pointing at mismatched chapters. */
  const setInterviewExtractPosition = useCallback((chapterId: string, sceneId: string | null) => {
    setInterviewExtractChapterIdState(chapterId);
    setInterviewExtractSceneId(sceneId);
  }, []);

  const startInterview = useCallback((entityRef: string, entityLabel: string, kind: BibleKind) => {
    setInterviewEntity({ ref: entityRef, label: entityLabel, kind });
    setInterviewHistory([]);
    setInterviewPersonalityDraft(profileFor(bookRef.current?.profiles ?? [], entityRef).personality);
    const current = bookRef.current;
    const opened = current?.chapters.find((item) => item.id === chapterRef.current);
    const chapterId = opened?.id ?? (current ? sortedChapters(current)[0]?.id ?? null : null);
    setInterviewExtractChapterIdState(chapterId);
    setInterviewExtractSceneId(null);
  }, []);

  const closeInterview = useCallback(() => {
    abortRef.current?.abort();
    setInterviewEntity(null);
    setInterviewHistory([]);
    setInterviewPersonalityDraft("");
    setInterviewExtractChapterIdState(null);
    setInterviewExtractSceneId(null);
  }, []);

  const saveInterviewPersonality = useCallback(() => {
    const target = interviewEntity;
    if (!target) return;
    void patchBook((current) => {
      const profile = profileFor(current.profiles, target.ref);
      return touch(current, {
        profiles: upsertCharacterProfile(current.profiles, { ...profile, personality: interviewPersonalityDraft })
      });
    });
  }, [interviewEntity, interviewPersonalityDraft, patchBook]);

  const askCharacter = useCallback(
    async (question: string) => {
      const current = bookRef.current;
      const target = interviewEntity;
      const trimmed = question.trim();
      if (!current || !target || !trimmed) return;
      // Interview shares the app's single global `busy` flag with every other
      // AI action, but this card only disables its own controls for its own
      // in-flight call — so a question asked while something unrelated is
      // still running (a Draft left going in another tab of the app, say)
      // used to hit this guard and return with no feedback at all: the
      // question vanished from the field, nothing was ever added to the
      // transcript, and nothing told the author why. Surface it instead.
      if (busy) {
        setError(STORE_ERROR.busy);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const priorTurns = interviewHistory;
      const userTurn: InterviewMessage = { role: "user", content: trimmed };
      setInterviewHistory([...priorTurns, userTurn]);

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("interview");
      setError(null);

      try {
        const provider = makeProvider(model);
        const askMessages: PromptDebugMessage[] = [
          {
            role: "system",
            content: characterInterviewSystem(
              withInheritedFacts(current),
              target.ref,
              target.label,
              target.kind,
              interviewPersonalityDraft,
              [...priorTurns.map((turn) => turn.content), trimmed].join("\n")
            )
          },
          ...priorTurns,
          userTurn
        ];
        recordPrompt("interview", model, askMessages);
        // Streamed, like Draft/Extend/Elaborate — not because the reply needs
        // to look typed out (though it's a nice side effect), but because a
        // single non-streaming call sits with zero visible feedback until the
        // whole reply is generated, which on a slower model reads as "hung"
        // even when it's still working. Every other Writing-model call in the
        // app already streams; this was the one exception.
        let raw = "";
        for await (const chunk of provider.streamChat({
          messages: askMessages,
          temperature: 0.9,
          maxTokens: 400,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            raw += chunk.text;
            setInterviewHistory([...priorTurns, userTurn, { role: "assistant", content: raw }]);
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        setInterviewHistory([...priorTurns, userTurn, { role: "assistant", content: raw.trim() }]);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, interviewEntity, interviewHistory, interviewPersonalityDraft, model, models.length, ollamaError, recordPrompt]
  );

  const extractInterview = useCallback(async () => {
    const current = bookRef.current;
    const target = interviewEntity;
    if (!current || !target || interviewHistory.length === 0) return;
    // Same reasoning as askCharacter above: the global busy flag can be set
    // by an unrelated action while this card's own controls stay enabled,
    // so refusing silently here would look identical to nothing happening.
    if (busy) {
      setError(STORE_ERROR.busy);
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("extract-interview");
    setError(null);
    try {
      const transcript = interviewHistory
        .map((turn) => `${turn.role === "user" ? "Author" : target.label}: ${turn.content}`)
        .join("\n\n");
      const provider = makeProvider(reviewModel);
      const extractMessages: PromptDebugMessage[] = [
        { role: "system", content: INTERVIEW_EXTRACTOR_SYSTEM },
        { role: "user", content: interviewExtractorUserPrompt(transcript, target.label) }
      ];
      recordPrompt("extract-interview", reviewModel, extractMessages);
      const raw = await provider.chat({
        messages: extractMessages,
        temperature: 0.1,
        maxTokens: EXTRACTOR_MAX_TOKENS,
        signal: abort.signal
      });
      recordPromptResponse(raw);
      // A weak local model can fail to produce any JSON at all (rambling
      // prose instead of the required object) rather than the well-formed
      // {"facts":[]} that means "found nothing" — parseExtractorPayload
      // throws in that case. To the author both look identical: no facts
      // came out of this pass. Treat a parse failure the same as an empty
      // result instead of leaking the raw parser exception as the error.
      let drafts: FactDraft[];
      try {
        drafts = parseExtractorPayload(raw);
      } catch {
        drafts = [];
      }
      if (drafts.length === 0) {
        setError(STORE_ERROR.interviewExtractorNone);
        return;
      }
      const chapter =
        current.chapters.find((item) => item.id === interviewExtractChapterId) ??
        current.chapters.find((item) => item.id === chapterRef.current) ??
        sortedChapters(current)[0];
      if (!chapter) return;
      // Only trust interviewExtractSceneId when it actually belongs to the
      // chapter just resolved — setInterviewExtractPosition keeps the two in
      // sync, but the chapter fallbacks above exist precisely for when
      // interviewExtractChapterId itself couldn't be resolved.
      const sceneId = chapter.id === interviewExtractChapterId ? (interviewExtractSceneId ?? undefined) : undefined;
      const nextFacts = applyExtractorDrafts(current.facts, drafts, chapter.sequence_index, chapter.id, sceneId, "interview");
      await flushSave(touch(current, { facts: nextFacts }));
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setError(ollamaHint(err));
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [
    busy,
    flushSave,
    interviewEntity,
    interviewExtractChapterId,
    interviewExtractSceneId,
    interviewHistory,
    models.length,
    ollamaError,
    recordPrompt,
    recordPromptResponse,
    reviewModel
  ]);
  const setDevelopmentMethod = useCallback(
    async (id: string | null) => {
      setDevelopSuggestion(null);
      const current = bookRef.current;
      if (!current) return;

      // Switching away from a method never deletes its beats automatically
      // (materializeBeats' own contract) — but offer to, so a leftover beat
      // sheet from a method the author no longer uses doesn't just pile up
      // as unused Plotline rows (see roadmap-ideas.md #33 follow-up).
      let removeIds: string[] = [];
      const previousId = current.development_method;
      if (previousId && previousId !== id) {
        const previousMethod = developmentMethodById(previousId);
        const previousMessages =
          getMessages().method.methods[previousId as keyof ReturnType<typeof getMessages>["method"]["methods"]];
        if (previousMethod && previousMessages) {
          const previousLabels: Record<string, string> = {};
          for (const step of previousMethod.steps) {
            if (step.kind !== "beat") continue;
            const stepMessages = (previousMessages.steps as Record<string, { label: string }>)[step.id];
            if (stepMessages) previousLabels[step.id] = stepMessages.label;
          }
          const leftover = beatPlotlines(current, previousMethod, previousLabels);
          if (
            leftover.length > 0 &&
            window.confirm(
              format(count(leftover.length, getMessages().method.removeOldBeatsConfirm), {
                method: previousMessages.name,
                titles: leftover.map((plotline) => plotline.title).join(", ")
              })
            )
          ) {
            removeIds = leftover.map((plotline) => plotline.id);
          }
        }
      }

      const method = id ? developmentMethodById(id) : undefined;
      const methodMessages = id ? getMessages().method.methods[id as keyof ReturnType<typeof getMessages>["method"]["methods"]] : undefined;
      await patchBook((currentForPatch) => {
        const withoutOldBeats = removeIds.reduce((book, plotlineId) => removePlotline(book, plotlineId), currentForPatch);
        const withMethod = touch(withoutOldBeats, { development_method: id ?? undefined });
        if (!method || !methodMessages) return withMethod;
        const labelsByStepId: Record<string, string> = {};
        for (const step of method.steps) {
          if (step.kind !== "beat") continue;
          const stepMessages = (methodMessages.steps as Record<string, { label: string }>)[step.id];
          if (stepMessages) labelsByStepId[step.id] = stepMessages.label;
        }
        return materializeBeats(withMethod, method, labelsByStepId);
      });
    },
    [patchBook]
  );

  const developExpand = useCallback(
    async (step: Extract<DevelopmentStep, { kind: "expand" }>, draft: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      const method = developmentMethodById(current.development_method);
      const methodMessages = current.development_method
        ? getMessages().method.methods[current.development_method as keyof ReturnType<typeof getMessages>["method"]["methods"]]
        : undefined;
      const stepMessages = methodMessages ? (methodMessages.steps as Record<string, { label: string; prompt: string }>)[step.id] : undefined;
      if (!method || !stepMessages) return;

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("develop");
      setError(null);
      setDevelopSuggestion(null);

      try {
        const provider = makeProvider(model);
        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(DEVELOP_EXPAND_SYSTEM) },
          {
            role: "user",
            content: developExpandUserPrompt({
              book: current,
              stepLabel: stepMessages.label,
              stepPrompt: stepMessages.prompt,
              priorStepsText: current.synopsis,
              draft
            })
          }
        ];
        recordPrompt("develop", model, askMessages);
        const raw = await provider.chat({
          messages: askMessages,
          temperature: 0.8,
          maxTokens: 500,
          signal: abort.signal
        });
        setDevelopSuggestion(raw.trim());
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, model, models.length, ollamaError, recordPrompt]
  );

  const dismissDevelopSuggestion = useCallback(() => setDevelopSuggestion(null), []);
  return {
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
  };
}
