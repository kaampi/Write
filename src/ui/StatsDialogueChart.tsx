import React, { useMemo, useState } from "react";
import type { Chapter } from "@core/BookSchema";
import { chapterDialogue } from "@core/chapterDialogue";
import type { ManuscriptPassage } from "@core/manuscriptReport";
import { format, useLocale } from "./i18n";

export function StatsDialogueChart({
  chapter, onOpen
}: {
  chapter: Chapter;
  onOpen: (chapterId: string, passage?: ManuscriptPassage) => void;
}) {
  const copy = useLocale().messages.stats.report;
  const [selected, setSelected] = useState<number | null>(null);
  const paragraphs = useMemo(() => chapterDialogue(chapter), [chapter]);
  const paragraph = selected === null ? undefined : paragraphs[selected];
  const paragraphLabel = (n: number, spoken: number, words: number) =>
    format(copy.dialogueParagraph, { n, share: Math.round(100 * spoken / words) });

  return (
    <div className="stats-dialogue-chart">
      <div className="stats-spark stats-dialogue-spark" role="group" aria-label={copy.dialogueDistribution}>
        {paragraphs.map(({ words, spoken, passage }, index) => {
          const label = paragraphLabel(index + 1, spoken, words);
          return (
            <button
              key={passage.start}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span aria-hidden="true" style={{ height: `max(2px, ${100 * spoken / words}%)` }} />
            </button>
          );
        })}
      </div>
      <button className="text-button stats-dialogue-go" type="button" onClick={() => onOpen(chapter.id)}>
        {copy.goToDialogueChapter}
      </button>
      {paragraph && selected !== null ? (
        <div className="stats-sentence">
          <p>{paragraphLabel(selected + 1, paragraph.spoken, paragraph.words)}</p>
          <blockquote>{paragraph.passage.context}</blockquote>
          <button type="button" onClick={() => onOpen(chapter.id, paragraph.passage)}>{copy.openDialogueParagraph}</button>
        </div>
      ) : null}
    </div>
  );
}
