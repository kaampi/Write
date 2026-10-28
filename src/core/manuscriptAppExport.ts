import {
  MANUSCRIPT_EXPORT_FORMAT,
  MANUSCRIPT_EXPORT_KIND,
  type ExportedBibleSection,
  type ExportedChapter,
  type ExportedEntity,
  type ExportedScene,
  type ManuscriptExport
} from "@ocedo-apps/storycore";
import { groupFacts } from "./bibleGroups";
import { exportableScenes } from "./bookScene";
import { sortedChapters, type Book } from "./BookSchema";
import { profileFor } from "./characterProfile";
import { picturesFor } from "./entityMedia";
import { mergeInheritedFacts, type NarrativeFact } from "./NarrativeFact";
import { PREDICATE_LABELS } from "./predicates";
import { visibleLockedFacts } from "./visibility";

/**
 * The machine-readable sibling of `buildManuscriptExport` (Publish, for a
 * human reader) — same grouping, but scoped for a sibling app that feeds
 * this into further AI generation, the same category of consumer as Draft.
 * Uses `visibleLockedFacts` (locked, not hidden from the model, not a
 * hidden entity), not `lockedFacts` alone the way Publish intentionally
 * does — a fact the author hid from the model should stay hidden here too.
 *
 * Produces StoryCore's `ManuscriptExport` shape (roadmap-ideas.md #31) —
 * kaampi Write is the only writer of this file; see @ocedo-apps/storycore's
 * own README for the read-only, propose-only contract this exists to keep.
 *
 * `seriesFacts`, when this book belongs to a Series, are baked straight
 * into `bible` alongside the book's own — a sibling app reading this
 * export has no way to also fetch the series separately, so the export
 * must already be self-contained with the same canon Draft itself sees
 * (`mergeInheritedFacts`: the series' locked facts, with this book's own
 * winning on anything it's established differently). A standalone book
 * (no series, or no `seriesFacts` given) is completely unaffected.
 */
export function packManuscriptExport(
  book: Book,
  exportedAt = new Date().toISOString(),
  seriesFacts: NarrativeFact[] = []
): ManuscriptExport {
  const visible = visibleLockedFacts(mergeInheritedFacts(book.facts, seriesFacts), book.hidden_entities);
  const sections = groupFacts(visible, book.entity_kinds);

  const bible: ExportedBibleSection[] = sections.map((section) => ({
    kind: section.kind,
    label: section.label,
    entities: section.entities.map((entity): ExportedEntity => {
      const profile = profileFor(book.profiles, entity.entity_ref);
      const pictures = picturesFor(book.media, entity.entity_ref);
      return {
        entity_ref: entity.entity_ref,
        name: entity.entity_label,
        facts: entity.facts.map((fact) => ({
          predicate: fact.predicate,
          label: PREDICATE_LABELS[fact.predicate],
          value: fact.value
        })),
        ...(profile.pronoun ? { pronoun: profile.pronoun } : {}),
        ...(profile.approximateAge !== undefined ? { approximateAge: profile.approximateAge } : {}),
        ...(profile.looks.trim() ? { looks: profile.looks.trim() } : {}),
        ...(profile.personality.trim() ? { personality: profile.personality.trim() } : {}),
        referenceImages: pictures.map((picture) => picture.imageDataUrl)
      };
    })
  }));

  return {
    kind: MANUSCRIPT_EXPORT_KIND,
    format: MANUSCRIPT_EXPORT_FORMAT,
    exportedAt,
    sourceApp: "storybook-ai",
    sourceBookId: book.id,
    title: book.title.trim() || "Untitled manuscript",
    illustrationStyle: book.illustration_style,
    synopsis: book.synopsis,
    chapters: sortedChapters(book).map((chapter): ExportedChapter => ({
      id: chapter.id,
      sequence_index: chapter.sequence_index,
      title: chapter.title,
      prose: chapter.prose,
      brief: chapter.brief,
      scenes: exportableScenes(chapter).map(
        (scene): ExportedScene => ({
          id: scene.id,
          sequence_index: scene.sequence_index,
          ...(scene.title ? { title: scene.title } : {}),
          description: scene.prose,
          ...(scene.brief ? { instructions: scene.brief } : {})
        })
      )
    })),
    bible
  };
}

export function manuscriptAppExportFilename(book: Book, exportedAt = new Date().toISOString()): string {
  const stem = book.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "manuscript";
  const day = exportedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);
  return `${stem}-storycore-${day}.json`;
}
