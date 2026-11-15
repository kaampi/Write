import React, { useMemo, useState } from "react";
import { sortedChapters, type Book, type Chapter } from "@core/BookSchema";
import { manuscriptReport, type ManuscriptPassage } from "@core/manuscriptReport";
import { format, useLocale } from "./i18n";
import { StatsCharacterMentions } from "./StatsCharacterMentions";
import { StatsCharacterNetwork } from "./StatsCharacterNetwork";
import { StatsDialogueChart } from "./StatsDialogueChart";
import { StatsChapterLength } from "./StatsChapterLength";

const REPORT_VIEWS = ["dialogue", "repetitions", "characters", "network", "length"] as const;
export type ManuscriptStatsView = typeof REPORT_VIEWS[number];

export function ManuscriptStatsReport({
  book, names, view, onChangeView, characterRef, onSelectCharacter, onOpen
}: {
  book: Book;
  names: string[];
  view: ManuscriptStatsView;
  onChangeView: (view: ManuscriptStatsView) => void;
  characterRef: string;
  onSelectCharacter: (ref: string) => void;
  onOpen: (chapterId: string, passage?: ManuscriptPassage) => void;
}) {
  const { messages: m } = useLocale();
  const copy = m.stats.report;
  const labels: Record<ManuscriptStatsView, string> = {
    dialogue: copy.dialogue,
    repetitions: copy.repetitions,
    characters: copy.characterMentions,
    network: copy.network,
    length: copy.chapterLength
  };
  const chapters = useMemo(() => sortedChapters(book), [book]);
  const report = useMemo(() => manuscriptReport(chapters, names), [chapters, names]);
  const titles = new Map(chapters.map((chapter, index) => [
    chapter.id,
    chapter.title.trim() || format(copy.chapter, { n: index + 1 })
  ]));

  const shift = report.dialogueShift;
  const crossesChapters = report.repetitions.some(([first, second]) => first.chapterId !== second.chapterId);

  function changeTabFromKeyboard(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = REPORT_VIEWS.indexOf(view);
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % REPORT_VIEWS.length; break;
      case "ArrowLeft": next = (index + REPORT_VIEWS.length - 1) % REPORT_VIEWS.length; break;
      case "Home": next = 0; break;
      case "End": next = REPORT_VIEWS.length - 1; break;
      default: return;
    }
    event.preventDefault();
    onChangeView(REPORT_VIEWS[next]!);
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  }

  return (
    <div>
      <h2>{copy.title}</h2>
      <div className="guide-tabs" role="tablist" aria-label={copy.title} onKeyDown={changeTabFromKeyboard}>
        {REPORT_VIEWS.map((id) => (
          <button
            key={id}
            id={`stats-report-tab-${id}`}
            className={view === id ? "guide-tab is-active" : "guide-tab"}
            type="button"
            role="tab"
            aria-selected={view === id}
            aria-controls="stats-report-panel"
            tabIndex={view === id ? 0 : -1}
            onClick={() => onChangeView(id)}
          >
            {labels[id]}
          </button>
        ))}
      </div>
      <div
        className={view === "dialogue" && report.words ? "stats-report" : "stats-report stats-report-single"}
        id="stats-report-panel"
        role="tabpanel"
        aria-labelledby={`stats-report-tab-${view}`}
        tabIndex={0}
      >
        {!report.words ? <p>{copy.empty}</p> : view === "dialogue" ? (
          <>
            <article className="stats-report-copy">
              <h3>{copy.dialogue}</h3>
              <p>{format(copy.dialogueSummary, { share: Math.round(100 * report.spoken / report.words) })}</p>
              {shift ? (
                <>
                  <p>{format(copy.dialogueShift, {
                    from: titles.get(shift.from.id) ?? "",
                    to: titles.get(shift.to.id) ?? "",
                    before: shift.from.share,
                    after: shift.to.share
                  })}</p>
                  <p>{copy.dialogueAction}</p>
                  <ul>
                    {[shift.from, shift.to].map(({ id }) => (
                      <li key={id}>
                        <button type="button" onClick={() => onOpen(id)}>
                          {format(copy.openDialogue, { chapter: titles.get(id) ?? "" })}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p>{copy.dialogueMethod}</p>
            </article>
            <aside className="stats-report-chapters" aria-label={copy.byChapter}>
              <h3>{copy.byChapter}</h3>
              <p>{copy.dialogueChartHint}</p>
              <ul>
                {report.dialogue.map(({ id, index, share }) => (
                  <ChapterDialogueRow
                    key={id}
                    chapter={chapters[index]!}
                    title={titles.get(id) ?? ""}
                    share={share}
                    onOpen={onOpen}
                  />
                ))}
              </ul>
            </aside>
          </>
        ) : view === "repetitions" ? (
          <article className="stats-report-copy">
            <h3>{copy.repetitions}</h3>
            {report.repetitions.length === 0 ? <p>{copy.noRepetitions}</p> : (
              <>
                <p>{copy.repetitionIntro}</p>
                <p>{copy.actionWithin}</p>
                {crossesChapters ? <p>{copy.actionAcross}</p> : null}
                {report.repetitions.map(([first, second]) => (
                  <section className="stats-report-finding" key={`${second.chapterId}:${second.start}`}>
                    <h4>“{first.text}”</h4>
                    <ul className="stats-report-evidence">
                      {[first, second].map((passage) => (
                        <li key={`${passage.chapterId}:${passage.start}`}>
                          <button type="button" onClick={() => onOpen(passage.chapterId, passage)}>
                            <strong>{titles.get(passage.chapterId)}</strong>
                            <span>“{passage.context}”</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </>
            )}
          </article>
        ) : view === "characters" ? (
          <article className="stats-report-copy">
            <StatsCharacterMentions
              book={book}
              chapters={chapters}
              titles={titles}
              characterRef={characterRef}
              onSelectCharacter={onSelectCharacter}
              onOpen={onOpen}
            />
          </article>
        ) : view === "network" ? (
          <StatsCharacterNetwork book={book} chapters={chapters} />
        ) : (
          <StatsChapterLength chapters={report.dialogue} titles={titles} onOpen={onOpen} />
        )}
      </div>
    </div>
  );
}

function ChapterDialogueRow({
  chapter, title, share, onOpen
}: {
  chapter: Chapter;
  title: string;
  share: number;
  onOpen: (chapterId: string, passage?: ManuscriptPassage) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li>
      <details className="stats-chapter-row" onToggle={(event) => setExpanded(event.currentTarget.open)}>
        <summary>
          <span className="stats-chapter-disclosure" aria-hidden="true">›</span>
          <span>{title}</span>
          <strong>{share} %</strong>
        </summary>
        {expanded ? <StatsDialogueChart chapter={chapter} onOpen={onOpen} /> : null}
      </details>
    </li>
  );
}
