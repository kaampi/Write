import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIconButton } from "./CloseIconButton";
import {
  headingLevelCounts,
  splitMarkdownIntoChapters,
  suggestChapterHeadingLevel,
  type ImportedChapterCandidate
} from "@core/manuscriptImport";
import { count, format, useLocale } from "./i18n";

/**
 * Starts a brand-new manuscript from a plain text or Markdown file —
 * source-agnostic rather than tied to one writing tool (the idea started
 * from Novelcrafter specifically, but plain text/Markdown isn't unique to
 * it, and "Novelcraft" vs. "Novelcrafter" turned out to be two different,
 * unrelated tools, surfaced only once we went looking at an actual export).
 * A tool with a genuinely proprietary export format (Scrivener's .scrivx+RTF,
 * Sudowriter's JSON) would need its own, format-specific card instead — see
 * roadmap-ideas.md #28's import-adapter family. No two tools agree on which
 * heading level marks a chapter (an "Act" wrapper, if present, outranks it
 * by one level), so the level is an adjustable, live-previewed guess rather
 * than a hardcoded assumption — see `suggestChapterHeadingLevel`'s own
 * reasoning.
 */
export function ImportManuscriptCard({
  onImport,
  onClose
}: {
  onImport: (title: string, chapters: ImportedChapterCandidate[]) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => headingLevelCounts(text), [text]);
  const suggestedLevel = useMemo(() => suggestChapterHeadingLevel(text), [text]);
  const effectiveLevel = level ?? suggestedLevel;
  const levelOptions = useMemo(() => [...counts.keys()].sort((a, b) => a - b), [counts]);

  // A new text (pasted or freshly uploaded) gets its own fresh guess —
  // an explicit level pick from a previous file shouldn't silently carry
  // over onto an unrelated one.
  useEffect(() => {
    setLevel(null);
  }, [text]);

  const chapters = useMemo(() => (text.trim() ? splitMarkdownIntoChapters(text, effectiveLevel) : []), [text, effectiveLevel]);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card bible-card" role="dialog" aria-modal="true" aria-labelledby="import-manuscript-title">
        <div className="bible-card-head">
          <h2 id="import-manuscript-title">{m.home.importManuscriptTitle}</h2>
          <div className="bible-card-head-actions">
            <CloseIconButton onClick={onClose} label={m.bible.close} />
          </div>
        </div>
        <p className="quiet">{m.home.importManuscriptLede}</p>
        <label className="bible-field">
          <span className="bible-field-label">{m.home.importManuscriptBookTitle}</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={m.home.importManuscriptBookTitlePlaceholder} />
        </label>
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={() => fileRef.current?.click()}>
            {m.home.importManuscriptUpload}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.txt,text/markdown,text/plain"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void file.text().then((content) => {
                setText(content);
                if (!title.trim()) setTitle(file.name.replace(/\.(md|markdown|txt)$/i, ""));
              });
            }}
          />
        </div>
        <label className="bible-field">
          <span className="bible-field-label">{m.home.importManuscriptText}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={m.home.importManuscriptTextPlaceholder}
            rows={10}
          />
        </label>
        {levelOptions.length > 1 ? (
          <label className="bible-field">
            <span className="bible-field-label">{m.home.importManuscriptLevelLabel}</span>
            <select value={effectiveLevel} onChange={(event) => setLevel(Number(event.target.value))}>
              {levelOptions.map((option) => (
                <option key={option} value={option}>
                  {format(m.home.importManuscriptLevelOption, { hashes: "#".repeat(option), count: counts.get(option) ?? 0 })}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {chapters.length > 0 ? (
          <div className="lore-import-articles">
            <p className="quiet">
              {format(m.home.importManuscriptFoundCount, { count: count(chapters.length, m.home.importManuscriptChaptersCount) })}
            </p>
            <ul className="lore-import-article-list">
              {chapters.map((chapter, index) => (
                <li key={index} className="lore-import-article-row">
                  <span>{chapter.title || format(m.home.importManuscriptUntitledChapter, { n: index + 1 })}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button
            type="button"
            className="primary"
            disabled={chapters.length === 0 || !title.trim()}
            onClick={() => onImport(title, chapters)}
          >
            {m.home.importManuscriptAction}
          </button>
        </div>
        <p className="quiet">{m.home.importManuscriptContact}</p>
      </div>
    </div>
  );
}
