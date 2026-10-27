import { describe, expect, it } from "vitest";
import { addChapter, createBook, updateChapter } from "@core/BookSchema";
import type { NarrativeFact } from "@core/NarrativeFact";
import { buildCoreManuscriptPublication } from "@persistence/CoreManuscriptPublication";

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
    expect(publication.manuscript.chapters.map(chapter => chapter.prose)).toEqual(["The entire first chapter.", "The entire second chapter."]);
    expect(publication.manuscript.synopsis).toBe("The whole synopsis.");
    expect(JSON.stringify(publication)).not.toMatch(/Private brainstorm note|Unapproved secret|Flagged secret|Hidden secret/);
    expect(publication.manuscript.bible.flatMap(section => section.entities).flatMap(entity => entity.facts.map(row => row.value)))
      .toEqual(["Bartender", "Harbor"]);
  });
});
