import { diffProse } from "@core/proseDiff";
import { HistorySplit } from "./ChapterHistoryCard";
import { useLocale } from "./i18n";

/**
 * Shows a Polish candidate against the chapter's current prose, side by
 * side with word-level diff highlighting, before anything is written —
 * reuses ChapterHistoryCard's own split-diff view (HistorySplit) rather
 * than building a second one, since "two prose versions compared" is the
 * same problem either way.
 */
export function PolishReviewCard({
  original,
  candidate,
  busy,
  onAccept,
  onDiscard
}: {
  original: string;
  candidate: string;
  busy: boolean;
  onAccept: () => void;
  onDiscard: () => void;
}) {
  const { messages: m } = useLocale();
  const hunks = diffProse(original, candidate);

  return (
    <div className="edit-overlay" role="presentation">
      <div className="edit-card polish-review-card" role="dialog" aria-modal="true" aria-labelledby="polish-review-title">
        <h2 id="polish-review-title">{m.polishReview.title}</h2>
        <p className="quiet">{m.polishReview.hint}</p>
        <HistorySplit
          hunks={hunks}
          empty={m.history.emptyProse}
          fromLabel={m.polishReview.original}
          toLabel={m.polishReview.candidate}
          fromKey={m.polishReview.originalHint}
          toKey={m.polishReview.candidateHint}
        />
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onDiscard} disabled={busy}>
            {m.polishReview.discard}
          </button>
          <button type="button" className="primary" onClick={onAccept} disabled={busy}>
            {m.polishReview.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
