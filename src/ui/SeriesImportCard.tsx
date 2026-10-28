import { useMemo, useRef, useState } from "react";
import { ManuscriptExportError, type ManuscriptExport } from "@ocedo-apps/storycore";
import { BIBLE_KIND_LABELS } from "@core/bibleGroups";
import { parseSeriesImport, seriesFactDrafts, seriesImportEntities, type SeriesImportEntity } from "@core/seriesImport";
import { count, format, useLocale } from "./i18n";
import { CloseIconButton } from "./CloseIconButton";

/**
 * "Bring the series forward" (roadmap-ideas.md #44): read a previous book's
 * own "Export for other apps" file back in, and let the author pick which
 * entities' locked facts should become lockable candidates in this book —
 * plus a free-text field for anything else worth carrying over that never
 * made it into a structured fact. Both halves land in the normal review
 * queue (origin "series"), never locked outright.
 */
export function SeriesImportCard({
  busy,
  progress,
  onImportFacts,
  onImportText,
  onClose
}: {
  busy: boolean;
  progress: { current: number; total: number } | null;
  onImportFacts: (drafts: ReturnType<typeof seriesFactDrafts>) => Promise<{ imported: number }>;
  onImportText: (text: string) => Promise<{ totalFacts: number }>;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [manuscript, setManuscript] = useState<ManuscriptExport | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [factResult, setFactResult] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState<number | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const entities: SeriesImportEntity[] = useMemo(() => (manuscript ? seriesImportEntities(manuscript) : []), [manuscript]);
  const includedRefs = useMemo(
    () => new Set(entities.filter((entity) => !excluded.has(entity.entity_ref)).map((entity) => entity.entity_ref)),
    [entities, excluded]
  );
  const includedFactCount = entities
    .filter((entity) => includedRefs.has(entity.entity_ref))
    .reduce((sum, entity) => sum + entity.factCount, 0);

  const loadFile = (file: File) => {
    setParseError(null);
    setFactResult(null);
    void file
      .text()
      .then((content) => JSON.parse(content))
      .then((parsed) => {
        const next = parseSeriesImport(parsed);
        setManuscript(next);
        setExcluded(new Set());
      })
      .catch((err) => {
        setManuscript(null);
        if (err instanceof ManuscriptExportError) {
          setParseError(m.bible.importSeriesParseError[err.code]);
        } else {
          setParseError(m.bible.importSeriesParseError.invalid);
        }
      });
  };

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card bible-card" role="dialog" aria-modal="true" aria-labelledby="series-import-title">
        <div className="bible-card-head">
          <h2 id="series-import-title">{m.bible.importSeriesTitle}</h2>
          <div className="bible-card-head-actions">
            <CloseIconButton onClick={onClose} label={m.bible.close} />
          </div>
        </div>
        <p className="quiet">{m.bible.importSeriesLede}</p>

        <div className="edit-actions">
          <button type="button" className="text-button" onClick={() => fileRef.current?.click()}>
            {m.bible.importSeriesUpload}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) loadFile(file);
            }}
          />
        </div>
        {parseError ? <p className="quiet">{parseError}</p> : null}

        {manuscript ? (
          <div className="lore-import-articles">
            <p className="quiet">{format(m.bible.importSeriesFoundCount, { title: manuscript.title, count: entities.length })}</p>
            <ul className="lore-import-article-list">
              {entities.map((entity) => (
                <li key={entity.entity_ref} className="lore-import-article-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={!excluded.has(entity.entity_ref)}
                      onChange={(event) => {
                        setExcluded((prev) => {
                          const next = new Set(prev);
                          if (event.target.checked) next.delete(entity.entity_ref);
                          else next.add(entity.entity_ref);
                          return next;
                        });
                      }}
                    />
                    <span>
                      {entity.name} <span className="quiet">({BIBLE_KIND_LABELS[entity.kind]})</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="edit-actions">
              <button
                type="button"
                className="primary"
                disabled={busy || includedFactCount === 0}
                onClick={async () => {
                  const drafts = seriesFactDrafts(manuscript, includedRefs);
                  const result = await onImportFacts(drafts);
                  setFactResult(result.imported);
                }}
              >
                {format(m.bible.importSeriesActionCount, { count: count(includedFactCount, m.bible.importSeriesFactsCount) })}
              </button>
            </div>
            {factResult !== null ? (
              <p className="quiet">{format(m.bible.importSeriesImported, { count: count(factResult, m.bible.importSeriesFactsCount) })}</p>
            ) : null}
          </div>
        ) : null}

        <div className="bible-card-head" style={{ marginTop: "1.5rem" }}>
          <h3>{m.bible.importSeriesTextTitle}</h3>
        </div>
        <p className="quiet">{m.bible.importSeriesTextLede}</p>
        <label className="bible-field">
          <span className="bible-field-label">{m.bible.importLoreText}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={m.bible.importSeriesTextPlaceholder}
            rows={8}
          />
        </label>
        <div className="edit-actions">
          <button
            type="button"
            className="primary"
            disabled={busy || extracting || !text.trim()}
            onClick={async () => {
              setExtracting(true);
              setTextResult(null);
              try {
                const result = await onImportText(text);
                setTextResult(result.totalFacts);
                setText("");
              } finally {
                setExtracting(false);
              }
            }}
          >
            {extracting
              ? progress
                ? format(m.bible.importLoreExtractingProgress, { current: progress.current, total: progress.total })
                : m.bible.importLoreExtracting
              : m.bible.importSeriesTextAction}
          </button>
        </div>
        {textResult !== null ? (
          <p className="quiet">{format(m.bible.importSeriesImported, { count: count(textResult, m.bible.importSeriesFactsCount) })}</p>
        ) : null}
      </div>
    </div>
  );
}
