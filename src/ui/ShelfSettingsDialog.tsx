import { useRef, useState } from "react";
import type { EntityPicture } from "@core/entityMedia";
import { EntityImageError, picturesFromFile } from "./entityImage";
import { count, useLocale, format } from "./i18n";
import { OverlayCard } from "./BiblePanel";

/**
 * The four kaampi apps' own brand colors first (Codex, Explore, Comic,
 * Write — in that order, as given), then three more from the same set
 * (Mats, 2026-11-04).
 */
export const SHELF_COLOR_SWATCHES = ["#BD9300", "#84676A", "#67846A", "#677084", "#295370", "#561517", "#BF3ADF"];

export type ShelfSettingsPatch = {
  cover?: EntityPicture | undefined;
  shelf_color?: string | undefined;
  shelf_height_adjust?: number;
  shelf_author?: string;
  shelf_description?: string;
};

/** Shelf view's gear dialog (roadmap-ideas.md #58) — cover/spine color/height/author/description, committed on Save, discarded on Cancel; also surfaces the book's own Open/Delete so the card doubles as the book's quick-look. */
export function ShelfSettingsDialog({
  title,
  cover,
  shelfColor,
  shelfHeightAdjust,
  shelfAuthor,
  shelfDescription,
  chapterCount,
  factCount,
  onOpen,
  onDelete,
  onSave,
  onClose
}: {
  title: string;
  cover: EntityPicture | undefined;
  shelfColor: string | undefined;
  shelfHeightAdjust: number;
  shelfAuthor: string;
  shelfDescription: string;
  chapterCount: number;
  factCount: number;
  onOpen: () => void;
  onDelete: () => void;
  onSave: (patch: ShelfSettingsPatch) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [draftCover, setDraftCover] = useState(cover);
  const [draftColor, setDraftColor] = useState(shelfColor);
  const [draftHeight, setDraftHeight] = useState(shelfHeightAdjust);
  const [draftAuthor, setDraftAuthor] = useState(shelfAuthor);
  const [draftDescription, setDraftDescription] = useState(shelfDescription);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  /**
   * `cover` as passed in is reconstructed from BookSummary's flattened
   * `cover_image_data_url` (both its thumbDataUrl/imageDataUrl set to the
   * same full-size image — BookSummary doesn't carry a true thumbnail),
   * not read straight off the stored Book. Keep the patch from touching
   * `cover` at all unless this dialog actually changed it, rather than
   * relying on that reconstruction always matching the original forever.
   */
  const [coverTouched, setCoverTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function save() {
    onSave({
      ...(coverTouched ? { cover: draftCover } : {}),
      shelf_color: draftColor,
      shelf_height_adjust: draftHeight,
      shelf_author: draftAuthor,
      shelf_description: draftDescription
    });
    onClose();
  }

  return (
    <OverlayCard titleId="shelf-settings-title" title={format(m.shelfEdit.title, { title })} onClose={onClose} className="shelf-settings-card">
      <div className="shelf-settings-body">
        <div className="shelf-settings-column">
          <section className="shelf-settings-field">
            <h3 className="bible-field-label">{m.shelfEdit.coverLabel}</h3>
            <div className="chapter-start-image">
              {draftCover ? (
                <div className="shelf-cover-frame">
                  <img src={draftCover.imageDataUrl} alt="" className="shelf-cover-picture" />
                  <div className="chapter-start-image-actions">
                    <button type="button" className="text-button" disabled={imageBusy} onClick={() => fileRef.current?.click()}>
                      {imageBusy ? "…" : m.shelfEdit.replaceCover}
                    </button>
                    <button
                      type="button"
                      className="text-button danger"
                      disabled={imageBusy}
                      onClick={() => {
                        setDraftCover(undefined);
                        setCoverTouched(true);
                      }}
                    >
                      {m.shelfEdit.removeCover}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="shelf-cover-add" disabled={imageBusy} onClick={() => fileRef.current?.click()}>
                  {imageBusy ? "…" : m.shelfEdit.addCover}
                </button>
              )}
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
                  void picturesFromFile(file)
                    .then((picture) => {
                      setDraftCover(picture);
                      setCoverTouched(true);
                    })
                    .catch((err) => {
                      setImageError(
                        err instanceof EntityImageError ? (err.code === "choose" ? m.errors.imageChoose : m.errors.imageRead) : m.errors.imageAdd
                      );
                    })
                    .finally(() => setImageBusy(false));
                }}
              />
              {imageError ? <p className="conflict-note">{imageError}</p> : null}
            </div>
          </section>

          <section className="shelf-settings-field">
            <h3 className="bible-field-label">{m.shelfEdit.colorLabel}</h3>
            <div className="shelf-settings-swatches" role="group" aria-label={m.shelfEdit.colorLabel}>
              {SHELF_COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  className={draftColor === swatch ? "shelf-swatch is-active" : "shelf-swatch"}
                  style={{ background: swatch }}
                  aria-pressed={draftColor === swatch}
                  aria-label={swatch}
                  onClick={() => setDraftColor(draftColor === swatch ? undefined : swatch)}
                />
              ))}
            </div>
          </section>

          <section className="shelf-settings-field">
            <h3 className="bible-field-label">
              {m.shelfEdit.heightLabel} — {format(m.shelfEdit.heightValue, { sign: draftHeight > 0 ? "+" : "", percent: draftHeight })}
            </h3>
            <input
              type="range"
              min={-10}
              max={10}
              value={draftHeight}
              onChange={(event) => setDraftHeight(Number(event.target.value))}
            />
          </section>
        </div>

        <div className="shelf-settings-column">
          <section className="shelf-settings-field">
            <h3 className="bible-field-label">{m.shelfEdit.authorLabel}</h3>
            <input
              type="text"
              value={draftAuthor}
              placeholder={m.shelfEdit.authorPlaceholder}
              onChange={(event) => setDraftAuthor(event.target.value)}
            />
          </section>

          <section className="shelf-settings-field">
            <h3 className="bible-field-label">{m.shelfEdit.descriptionLabel}</h3>
            <textarea
              rows={3}
              value={draftDescription}
              placeholder={m.shelfEdit.descriptionPlaceholder}
              onChange={(event) => setDraftDescription(event.target.value)}
            />
          </section>

          <section className="shelf-settings-field">
            <span className="shelf-settings-meta">
              {count(chapterCount, m.home.chapters)}
              <span className="dot">·</span>
              {count(factCount, m.home.facts)}
            </span>
            <div className="shelf-info-actions">
              <button type="button" className="primary" onClick={onOpen}>
                {m.home.shelfOpen}
              </button>
              <button
                type="button"
                className="text-button danger"
                onClick={() => {
                  if (window.confirm(format(m.home.deleteConfirm, { title }))) onDelete();
                }}
              >
                {m.home.delete}
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className="edit-actions">
        <button type="button" className="text-button" onClick={onClose}>
          {m.common.cancel}
        </button>
        <button type="button" className="primary" onClick={save}>
          {m.common.save}
        </button>
      </div>
    </OverlayCard>
  );
}
