import { describe, expect, it } from "vitest";
import { createBook } from "@core/BookSchema";
import { packManuscriptExport } from "@core/manuscriptAppExport";
import { parseSeriesImport, seriesFactDrafts, seriesImportEntities } from "@core/seriesImport";
import type { NarrativeFact } from "@core/NarrativeFact";

const emmaFact: NarrativeFact = {
  id: "1",
  entity_ref: "emma",
  entity_label: "Emma",
  predicate: "core.identity",
  value: "Bartender",
  sequence_index: 0,
  status: "locked",
  source: "author",
  created_at: "2026-09-16T00:00:00.000Z"
};

const lanternFact: NarrativeFact = {
  ...emmaFact,
  id: "2",
  entity_ref: "lantern",
  entity_label: "The Lantern",
  predicate: "core.object",
  value: "Brass, dented"
};

describe("parseSeriesImport", () => {
  it("accepts a book's own export", () => {
    const book = { ...createBook("Night Keys"), facts: [emmaFact] };
    const packed = packManuscriptExport(book);
    expect(() => parseSeriesImport(packed)).not.toThrow();
  });

  it("rejects something that isn't an export at all", () => {
    expect(() => parseSeriesImport({ hello: "world" })).toThrow();
  });
});

describe("seriesImportEntities", () => {
  it("flattens every bible section into one row per entity", () => {
    const book = { ...createBook("Night Keys"), facts: [emmaFact, lanternFact] };
    const manuscript = parseSeriesImport(packManuscriptExport(book));
    const entities = seriesImportEntities(manuscript);
    expect(entities).toEqual([
      expect.objectContaining({ entity_ref: "emma", name: "Emma", kind: "characters", factCount: 1 }),
      expect.objectContaining({ entity_ref: "lantern", name: "The Lantern", kind: "objects", factCount: 1 })
    ]);
  });

  it("returns nothing for an export with no locked facts", () => {
    const book = createBook("Night Keys");
    const manuscript = parseSeriesImport(packManuscriptExport(book));
    expect(seriesImportEntities(manuscript)).toEqual([]);
  });
});

describe("seriesFactDrafts", () => {
  it("turns an included entity's facts into drafts", () => {
    const book = { ...createBook("Night Keys"), facts: [emmaFact, lanternFact] };
    const manuscript = parseSeriesImport(packManuscriptExport(book));
    const drafts = seriesFactDrafts(manuscript, new Set(["emma"]));
    expect(drafts).toEqual([{ entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" }]);
  });

  it("leaves out an entity that wasn't selected", () => {
    const book = { ...createBook("Night Keys"), facts: [emmaFact, lanternFact] };
    const manuscript = parseSeriesImport(packManuscriptExport(book));
    const drafts = seriesFactDrafts(manuscript, new Set(["lantern"]));
    expect(drafts.map((draft) => draft.entity_ref)).toEqual(["lantern"]);
  });

  it("returns nothing when no entity is selected", () => {
    const book = { ...createBook("Night Keys"), facts: [emmaFact] };
    const manuscript = parseSeriesImport(packManuscriptExport(book));
    expect(seriesFactDrafts(manuscript, new Set())).toEqual([]);
  });

  it("drops a predicate that isn't one of this app's own", () => {
    const book = { ...createBook("Night Keys"), facts: [emmaFact] };
    const manuscript = parseSeriesImport(packManuscriptExport(book));
    const tampered = {
      ...manuscript,
      bible: manuscript.bible.map((section) => ({
        ...section,
        entities: section.entities.map((entity) => ({
          ...entity,
          facts: entity.facts.map((fact) => ({ ...fact, predicate: "not.a.real.predicate" }))
        }))
      }))
    };
    expect(seriesFactDrafts(tampered, new Set(["emma"]))).toEqual([]);
  });
});
