import type { Book } from "@core/BookSchema";
import { hasAnyTaggedThread } from "@core/developmental";
import { useLocale } from "./i18n";
import { CloseIconButton } from "./CloseIconButton";

/**
 * Shown before every developmental-analysis run (roadmap-ideas.md #14) —
 * no stage/scope picker, unlike Proofread's setup card: a developmental
 * read only makes sense over the whole manuscript. Warns, but never
 * blocks, when no chapter has a Plotline tag yet — the run still works,
 * just with less grounding for the chapter-synthesis stage (see the
 * author discussion in roadmap-ideas.md #14).
 */
export function DevelopmentalSetupCard({ book, onStart, onClose }: { book: Book; onStart: () => void; onClose: () => void }) {
  const { messages: m } = useLocale();
  const noThreadsTagged = !hasAnyTaggedThread(book);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card proofread-card" role="dialog" aria-modal="true" aria-labelledby="developmental-setup-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.developmental.action}</p>
          <CloseIconButton onClick={onClose} label={m.common.close} />
        </div>
        <h2 id="developmental-setup-title">{m.developmental.setupTitle}</h2>
        <p className="quiet">{m.developmental.setupLede}</p>

        {noThreadsTagged ? <p className="quiet proofread-setup-placeholder-warning">{m.developmental.setupNoThreadsWarning}</p> : null}

        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button type="button" className="primary" onClick={onStart}>
            {m.developmental.setupStart}
          </button>
        </div>
      </div>
    </div>
  );
}
