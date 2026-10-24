import { parseManuscriptExport, type ExportedBibleSection, type ManuscriptExport } from "@ocedo-apps/storycore";
import type { FactDraft } from "./NarrativeFact";
import { isCorePredicate } from "./predicates";

/**
 * Reading a previous book's own export back in — "bring the series
 * forward". `bible` in a `ManuscriptExport` is
 * already exactly the right subset: locked, visible facts only, the same
 * ones the previous book's author chose to keep. Nothing here writes
 * anything to the book directly — it only turns the file into `FactDraft`s
 * for the caller to run through `applyExtractorDrafts` (origin "series"),
 * landing as ordinary review-queue candidates the author locks in one at a
 * time, same as any other proposed fact. A predicate that isn't one of
 * this app's own (shouldn't happen — the export only ever came from this
 * app — but the exporter only promises the string is *some* predicate
 * value, not that it's current) is dropped rather than guessed at.
 */
export function parseSeriesImport(input: unknown): ManuscriptExport {
  return parseManuscriptExport(input);
}

/** One entity's worth of previous-book facts, for the author to include or leave out before import. */
export type SeriesImportEntity = {
  entity_ref: string;
  name: string;
  kind: ExportedBibleSection["kind"];
  factCount: number;
};

/** Flattened for a selection list — one row per entity, in the file's own section/entity order. */
export function seriesImportEntities(manuscript: ManuscriptExport): SeriesImportEntity[] {
  return manuscript.bible.flatMap((section) =>
    section.entities.map((entity) => ({
      entity_ref: entity.entity_ref,
      name: entity.name,
      kind: section.kind,
      factCount: entity.facts.length
    }))
  );
}

/** The chosen entities' facts, ready for `applyExtractorDrafts`. */
export function seriesFactDrafts(manuscript: ManuscriptExport, includedEntityRefs: ReadonlySet<string>): FactDraft[] {
  const drafts: FactDraft[] = [];
  for (const section of manuscript.bible) {
    for (const entity of section.entities) {
      if (!includedEntityRefs.has(entity.entity_ref)) continue;
      for (const fact of entity.facts) {
        if (!isCorePredicate(fact.predicate)) continue;
        drafts.push({
          entity_ref: entity.entity_ref,
          entity_label: entity.name,
          predicate: fact.predicate,
          value: fact.value
        });
      }
    }
  }
  return drafts;
}
