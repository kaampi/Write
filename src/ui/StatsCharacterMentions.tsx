import React, { useMemo } from "react";
import type { Book, Chapter } from "@core/BookSchema";
import { groupBibleEntities } from "@core/bibleGroups";
import { trackingFor } from "@core/entityTracking";
import { manuscriptCharacterMentions, type CharacterSceneMention } from "@core/manuscriptCharacterMentions";
import type { ManuscriptPassage } from "@core/manuscriptReport";
import { format, useLocale } from "./i18n";

export function StatsCharacterMentions({
  book, chapters, titles, characterRef, onSelectCharacter, onOpen
}: {
  book: Book;
  chapters: Chapter[];
  titles: Map<string, string>;
  characterRef: string;
  onSelectCharacter: (ref: string) => void;
  onOpen: (chapterId: string, passage?: ManuscriptPassage) => void;
}) {
  const copy = useLocale().messages.stats.report;
  const characters = useMemo(() =>
    groupBibleEntities(book.facts, book.entity_kinds).find(({ kind }) => kind === "characters")?.entities ?? [],
  [book.facts, book.entity_kinds]);
  const selected = characters.find(({ entity_ref }) => entity_ref === characterRef) ?? characters[0];
  const report = useMemo(() => selected && manuscriptCharacterMentions(
    chapters, selected.entity_label, trackingFor(book.entity_tracking, selected.entity_ref)
  ), [chapters, selected, book.entity_tracking]);

  function sceneLabel(hit: CharacterSceneMention) {
    const chapter = titles.get(hit.passage.chapterId) ?? "";
    const scene = hit.sceneTitle ?? format(copy.scene, { n: hit.sceneIndex + 1 });
    return `${chapter} · ${scene}`;
  }

  function mentionList(hits: CharacterSceneMention[]) {
    return (
      <ul className="stats-report-evidence">
        {hits.map((hit) => (
          <li key={`${hit.passage.chapterId}:${hit.passage.start}`}>
            <button type="button" onClick={() => onOpen(hit.passage.chapterId, hit.passage)}>
              <strong>{sceneLabel(hit)} · {format(hit.count === 1 ? copy.mentionOne : copy.mentionMany, { n: hit.count })}</strong>
              <span>“{hit.passage.context}”</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="stats-report-character" aria-labelledby="stats-character-mentions">
      <h3 id="stats-character-mentions">{copy.characterMentions}</h3>
      {selected && report ? (
        <>
          <p>{copy.mentionMethod}</p>
          <label className="stats-character-picker">
            <span>{copy.chooseCharacter}</span>
            <select value={selected.entity_ref} onChange={(event) => onSelectCharacter(event.target.value)}>
              {characters.map((character) => (
                <option key={character.entity_ref} value={character.entity_ref}>{character.entity_label}</option>
              ))}
            </select>
          </label>
          {report.hits.length === 0 ? <p>{format(copy.noMentions, { name: selected.entity_label })}</p> : (
            <>
              <p>{format(report.hits.length === 1 ? copy.mentionSceneOne : copy.mentionSceneMany, {
                name: selected.entity_label, n: report.hits.length
              })}</p>
              {report.gap ? (
                <>
                  <p>{format(copy.mentionGap, { n: report.gap.scenes })}</p>
                  {mentionList([report.gap.before, report.gap.after])}
                  <p>{copy.mentionAction}</p>
                </>
              ) : null}
              <details key={selected.entity_ref} open={!report.gap && report.hits.length <= 5}>
                <summary>{copy.mentionList}</summary>
                {mentionList(report.hits)}
              </details>
            </>
          )}
        </>
      ) : <p>{copy.noCharacters}</p>}
    </section>
  );
}
