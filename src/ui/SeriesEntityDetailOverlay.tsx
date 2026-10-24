import { useRef, useState } from "react";
import { entityNoteFor } from "@core/SeriesSchema";
import { picturesFor, MAX_ENTITY_PICTURES } from "@core/entityMedia";
import { lockedFacts } from "@core/NarrativeFact";
import { format, useLocale } from "./i18n";
import { useSeriesStore } from "./useSeriesStore";
import { OverlayCard } from "./BiblePanel";
import { EntityImageError } from "./entityImage";

/**
 * A series entity's own wiki-style page (roadmap discussion: "entitetssidor
 * vore bra att utveckla") — portrait + long-form history on the left, the
 * structured facts Draft actually sees on the right, same split the
 * preview mockup settled on. The history text and images are for the
 * author and the extractor; Draft never reads either directly, only what
 * "Extract facts" pulls out of the text into the facts list.
 */
export function SeriesEntityDetailOverlay({ entityRef, entityLabel, onClose }: { entityRef: string; entityLabel: string; onClose: () => void }) {
  const { series, busy, setEntityHistory, addEntityPicture, removeEntityPicture, extractEntityNote } = useSeriesStore();
  const { messages: m } = useLocale();
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!series) return null;

  const note = entityNoteFor(series.entity_notes, entityRef);
  const pictures = picturesFor(series.media, entityRef);
  const facts = lockedFacts(series.facts).filter((fact) => fact.entity_ref === entityRef);
  const extracting = busy === "extract-entity-note";

  return (
    <OverlayCard titleId="series-entity-title" title={entityLabel} onClose={onClose} className="series-entity-detail-card">
      <div className="series-entity-detail">
        <section className="series-entity-detail-main">
          <section className="bible-pictures">
            <div className="bible-pictures-head">
              <h3 className="bible-field-label">{m.bible.pictures}</h3>
            </div>
            <ul className="bible-picture-list">
              {pictures.map((picture, index) => (
                <li key={`${picture.thumbDataUrl.slice(0, 48)}-${index}`}>
                  <img src={picture.thumbDataUrl} alt="" />
                  <button
                    type="button"
                    className="bible-picture-remove"
                    aria-label={format(m.bible.removePicture, { n: index + 1 })}
                    onClick={() => void removeEntityPicture(entityRef, index)}
                  >
                    ×
                  </button>
                </li>
              ))}
              {pictures.length < MAX_ENTITY_PICTURES ? (
                <li>
                  <button
                    type="button"
                    className="bible-picture-add"
                    aria-label={imageBusy ? m.bible.addingImage : m.bible.addImage}
                    disabled={imageBusy}
                    onClick={() => fileRef.current?.click()}
                  >
                    {imageBusy ? "…" : "+"}
                  </button>
                </li>
              ) : null}
            </ul>
            <input
              ref={fileRef}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setImageError(null);
                setImageBusy(true);
                void addEntityPicture(entityRef, file)
                  .catch((err) => {
                    setImageError(err instanceof EntityImageError ? (err.code === "choose" ? m.errors.imageChoose : m.errors.imageRead) : m.errors.imageAdd);
                  })
                  .finally(() => setImageBusy(false));
              }}
            />
            {imageError ? <p className="conflict-note">{imageError}</p> : null}
          </section>

          <h3 className="bible-field-label">{m.series.historyHeading}</h3>
          <textarea
            className="series-entity-history"
            defaultValue={note.history}
            placeholder={m.series.historyPlaceholder}
            rows={14}
            onChange={(event) => setEntityHistory(entityRef, event.target.value)}
          />
          <div className="series-entity-history-foot">
            <span className="quiet">{m.series.historyHint}</span>
            <button
              type="button"
              className="primary"
              disabled={extracting || !note.history.trim()}
              onClick={() => void extractEntityNote(entityRef, entityLabel)}
            >
              {extracting ? m.series.extracting : m.series.extractFromHistory}
            </button>
          </div>
        </section>

        <section className="series-entity-detail-facts">
          <div className="series-entity-detail-facts-head">
            <h3 className="bible-field-label">{m.series.lockedFactsHeading}</h3>
            <span className="quiet">{m.series.whatDraftSees}</span>
          </div>
          {facts.length === 0 ? <p className="quiet">{m.series.noFactsYet}</p> : null}
          {facts.map((fact) => (
            <div key={fact.id} className="series-entity-fact">
              <span className="series-entity-fact-predicate">{m.bible.predicates[fact.predicate]}</span>
              <p>{fact.value}</p>
              {fact.source_book_title ? (
                <span className="quiet series-fact-provenance">
                  {format(fact.source_chapter_title ? m.series.establishedInChapter : m.series.establishedIn, {
                    book: fact.source_book_title,
                    chapter: fact.source_chapter_title ?? ""
                  })}
                </span>
              ) : null}
            </div>
          ))}
          <p className="quiet series-entity-images-note">{m.series.imagesNote}</p>
        </section>
      </div>
    </OverlayCard>
  );
}
