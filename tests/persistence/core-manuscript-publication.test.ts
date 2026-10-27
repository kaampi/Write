import { describe, expect, it } from "vitest";
import { addChapter, createBook, updateChapter } from "@core/BookSchema";
import type { NarrativeFact } from "@core/NarrativeFact";
import { buildCoreManuscriptPublication } from "@persistence/CoreManuscriptPublication";
import { createLanguageVersion } from "@core/translation";

const fact: NarrativeFact = {
  id: "visible", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity",
  value: "Bartender", sequence_index: 0, status: "locked", source: "author",
  created_at: "2026-10-27T00:00:00.000Z"
};

describe("Core manuscript publication", () => {
  it("publishes full prose and inherited visible canon without private Book fields", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "The entire first chapter." });
    book = addChapter(book);
    book = updateChapter(book, book.chapters[1]!.id, { prose: "The entire second chapter." });
    book = {
      ...book,
      synopsis: "The whole synopsis.", brainstorm: "Private brainstorm note",
      facts: [fact, { ...fact, id: "proposed", status: "ai_proposed", value: "Unapproved secret" },
        { ...fact, id: "flagged", status: "flagged", value: "Flagged secret" },
        { ...fact, id: "hidden", hidden_from_ai: true, value: "Hidden secret" }]
    };
    const inherited = { ...fact, id: "series", entity_ref: "port", entity_label: "The Port", predicate: "core.place" as const, value: "Harbor" };
    const publication = buildCoreManuscriptPublication(book, [inherited], ["comic"], "2026-10-27T00:00:00.000Z");
    expect(publication.projectId).toBe(book.id);
    expect(publication.readers).toEqual(["comic"]);
    expect(publication.translationGroupId).toBe(book.id);
    expect(publication.language).toBe("");
    expect(publication.manuscript.chapters.map(chapter => chapter.prose)).toEqual(["The entire first chapter.", "The entire second chapter."]);
    expect(publication.manuscript.synopsis).toBe("The whole synopsis.");
    expect(JSON.stringify(publication)).not.toMatch(/Private brainstorm note|Unapproved secret|Flagged secret|Hidden secret/);
    expect(publication.manuscript.bible.flatMap(section => section.entities).flatMap(entity => entity.facts.map(row => row.value)))
      .toEqual(["Bartender", "Harbor"]);
  });

  it("keeps each language version separate while supplying grouping metadata", () => {
    const source = { ...createBook("Night Keys"), facts: [fact] };
    const { book: translated, groupId } = createLanguageVersion(source, "Svenska");
    const sourcePublication = buildCoreManuscriptPublication({ ...source, translation_group_id: groupId }, [], [], "2026-10-27T00:00:00.000Z");
    const translationPublication = buildCoreManuscriptPublication(translated, [], ["comic"], "2026-10-27T00:00:00.000Z");
    expect(translationPublication.projectId).not.toBe(sourcePublication.projectId);
    expect(translationPublication.translationGroupId).toBe(sourcePublication.translationGroupId);
    expect(translationPublication.language).toBe("Svenska");
    expect(sourcePublication.readers).toEqual([]);
    expect(translationPublication.readers).toEqual(["comic"]);
    expect(translationPublication.manuscript.bible).toEqual([]);
    expect(sourcePublication.manuscript.bible).not.toEqual([]);
  });
});
