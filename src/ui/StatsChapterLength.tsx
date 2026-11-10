import React from "react";
import { summarizeChapterLengths } from "@core/manuscriptReport";
import { format, useLocale } from "./i18n";

export function StatsChapterLength({
  chapters, titles, onOpen
}: {
  chapters: { id: string; words: number }[];
  titles: Map<string, string>;
  onOpen: (chapterId: string) => void;
}) {
  const { locale, messages: m } = useLocale();
  const copy = m.stats.report;
  const summary = summarizeChapterLengths(chapters);
  if (!summary) return null;

  const { shortest, longest, median } = summary;
  const number = new Intl.NumberFormat(locale);
  const wordCount = (words: number) =>
    format(words === 1 ? m.stats.wordsShort.one : m.stats.wordsShort.other, { count: number.format(words) });

  return (
    <article className="stats-report-copy">
      <h3>{copy.chapterLength}</h3>
      <p>{format(copy.chapterLengthMedian, { count: wordCount(median) })}</p>
      {shortest !== longest ? (
        <p>{format(copy.chapterLengthRange, { shortest: wordCount(shortest), longest: wordCount(longest) })}</p>
      ) : null}
      <p>{copy.chapterLengthHint}</p>
      <p className="stats-length-legend">{copy.chapterLengthMedianLine}</p>
      <ul aria-label={copy.chapterLength}>
        {chapters.map(({ id, words }) => (
          <li key={id}>
            <button className="stats-length-row" type="button" onClick={() => onOpen(id)}>
              <span>{titles.get(id)}</span>
              <strong>{wordCount(words)}</strong>
              <span className="stats-length-track" aria-hidden="true">
                <span className="stats-length-bar" style={{ width: `${100 * words / longest}%` }} />
                <span className="stats-length-marker" style={{ insetInlineStart: `min(${100 * median / longest}%, calc(100% - 2px))` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
