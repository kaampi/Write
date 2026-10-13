import { useMemo, useState } from "react";
import { PROOFREAD_STAGES, type ProofreadStage } from "@core/proofread";
import { collectPlaceholders, type Placeholder } from "@core/placeholders";
import { count, format, useLocale } from "./i18n";

/**
 * Shown before every proofread run (first start and "run again" alike) so
 * the choice is never stale — pick which stages to run and, for the two
 * stages whose cost actually scales with chapter count (grammar, facts),
 * whether to limit them to just the open chapter instead of the whole
 * manuscript. Defaults to everything, whole manuscript: today's behavior,
 * unless the author narrows it.
 */
export function ProofreadSetupCard({
  chapter,
  chapters,
  onStart,
  onClose
}: {
  chapter: { id: string; title: string } | undefined;
  /** Every chapter's own placeholders, for the open-placeholders reminder below — not reduced to the current chapter even when scoping, so toggling scope can recount without a prop change. */
  chapters: { id: string; title: string; placeholders?: Placeholder[] | undefined }[];
  onStart: (options: { stages: ProofreadStage[]; scopeChapterId?: string }) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [stages, setStages] = useState<Set<ProofreadStage>>(new Set(PROOFREAD_STAGES));
  const [scopeToChapter, setScopeToChapter] = useState(false);
  const openPlaceholders = useMemo(() => collectPlaceholders(chapters), [chapters]);
  const scopedPlaceholderCount = scopeToChapter
    ? openPlaceholders.filter((item) => item.chapterId === chapter?.id).length
    : openPlaceholders.length;

  function toggleStage(stage: ProofreadStage) {
    setStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  }

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card proofread-card" role="dialog" aria-modal="true" aria-labelledby="proofread-setup-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.proofread.action}</p>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="proofread-setup-title">{m.proofread.setupTitle}</h2>
        <p className="quiet">{m.proofread.setupLede}</p>

        <fieldset className="proofread-setup-stages">
          <legend className="chapter-craft-label">{m.proofread.setupStagesLabel}</legend>
          {PROOFREAD_STAGES.map((stage) => (
            <label key={stage} className="proofread-setup-stage">
              <input type="checkbox" checked={stages.has(stage)} onChange={() => toggleStage(stage)} />
              {m.proofread[stage]}
            </label>
          ))}
        </fieldset>

        {chapter ? (
          <fieldset className="proofread-setup-scope">
            <legend className="chapter-craft-label">{m.proofread.setupScopeLabel}</legend>
            <label className="proofread-setup-scope-option">
              <input type="radio" name="proofread-scope" checked={!scopeToChapter} onChange={() => setScopeToChapter(false)} />
              {m.proofread.setupScopeManuscript}
            </label>
            <label className="proofread-setup-scope-option">
              <input type="radio" name="proofread-scope" checked={scopeToChapter} onChange={() => setScopeToChapter(true)} />
              {format(m.proofread.setupScopeChapter, { chapter: chapter.title })}
            </label>
            {scopeToChapter ? <p className="quiet">{m.proofread.setupScopeChapterHint}</p> : null}
          </fieldset>
        ) : null}

        {scopedPlaceholderCount > 0 ? (
          <p className="quiet proofread-setup-placeholder-warning">
            {count(
              scopedPlaceholderCount,
              scopeToChapter ? m.proofread.openPlaceholdersChapter : m.proofread.openPlaceholdersManuscript
            )}
          </p>
        ) : null}

        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button
            type="button"
            className="primary"
            disabled={stages.size === 0}
            title={stages.size === 0 ? m.proofread.setupNothingSelected : undefined}
            onClick={() =>
              onStart({
                stages: PROOFREAD_STAGES.filter((stage) => stages.has(stage)),
                ...(scopeToChapter && chapter ? { scopeChapterId: chapter.id } : {})
              })
            }
          >
            {m.proofread.setupStart}
          </button>
        </div>
      </div>
    </div>
  );
}
