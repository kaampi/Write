import { describe, expect, it } from "vitest";
import { MANUSCRIPT_EXPORT_FORMAT, MANUSCRIPT_EXPORT_KIND, parseManuscriptExport } from "@ocedo-apps/storycore";
import { addChapter, createBook, updateChapter } from "@core/BookSchema";
import { addScene, splitSceneAtParagraph, updateSceneMeta } from "@core/bookScene";
import { manuscriptAppExportFilename, packManuscriptExport } from "@core/manuscriptAppExport";
import type { NarrativeFact } from "@core/NarrativeFact";

const baseFact: NarrativeFact = {
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

describe("packManuscriptExport", () => {
  it("produces an envelope that StoryCore itself accepts", () => {
    const book = createBook("Night Keys");
    const packed = packManuscriptExport(book, "2026-10-02T00:00:00.000Z");
    expect(() => parseManuscriptExport(packed)).not.toThrow();
    expect(packed.kind).toBe(MANUSCRIPT_EXPORT_KIND);
    expect(packed.format).toBe(MANUSCRIPT_EXPORT_FORMAT);
    expect(packed.sourceApp).toBe("storybook-ai");
    expect(packed.title).toBe("Night Keys");
  });

  it("includes a locked, visible fact grouped under its Bible kind", () => {
    const book = { ...createBook("Night Keys"), facts: [baseFact] };
    const packed = packManuscriptExport(book);
    const characters = packed.bible.find((section) => section.kind === "characters");
    expect(characters?.entities).toEqual([
      expect.objectContaining({ entity_ref: "emma", name: "Emma", facts: [{ predicate: "core.identity", label: "Identity", value: "Bartender" }] })
    ]);
  });

  it("omits an unlocked (ai_proposed) fact — never exported as settled canon", () => {
    const proposed: NarrativeFact = { ...baseFact, status: "ai_proposed" };
    const book = { ...createBook("Night Keys"), facts: [proposed] };
    const packed = packManuscriptExport(book);
    expect(packed.bible).toEqual([]);
  });

  it("omits a fact hidden from the model", () => {
    const hidden: NarrativeFact = { ...baseFact, hidden_from_ai: true };
    const book = { ...createBook("Night Keys"), facts: [hidden] };
    expect(packManuscriptExport(book).bible).toEqual([]);
  });

  it("omits a hidden entity's facts entirely", () => {
    const book = { ...createBook("Night Keys"), facts: [baseFact], hidden_entities: ["emma"] };
    expect(packManuscriptExport(book).bible).toEqual([]);
  });

  it("includes every Bible kind, not just characters and locations", () => {
    const objectFact: NarrativeFact = { ...baseFact, id: "2", entity_ref: "lantern", entity_label: "The Lantern", predicate: "core.object", value: "Brass, dented" };
    const conceptFact: NarrativeFact = { ...baseFact, id: "3", entity_ref: "the-old-law", entity_label: "The Old Law", predicate: "core.concept", value: "No fire after dusk" };
    const book = { ...createBook("Night Keys"), facts: [objectFact, conceptFact] };
    const kinds = packManuscriptExport(book).bible.map((section) => section.kind);
    expect(kinds).toEqual(["objects", "concepts"]);
  });

  it("carries chapters in reading order with id, title, prose, and an empty brief by default", () => {
    let book = addChapter(createBook("Night Keys"));
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma walked to the quay." });
    const packed = packManuscriptExport(book);
    expect(packed.chapters[0]?.id).toBe(book.chapters[0]!.id);
    expect(packed.chapters[0]?.sequence_index).toBe(0);
    expect(packed.chapters[0]?.title).toBe("The quay");
    expect(packed.chapters[0]?.prose).toBe("Emma walked to the quay.");
    expect(packed.chapters[0]?.brief).toBe("");
  });

  it("carries the manuscript's synopsis", () => {
    const book = { ...createBook("Night Keys"), synopsis: "A bartender finds a smuggler's key." };
    expect(packManuscriptExport(book).synopsis).toBe("A bartender finds a smuggler's key.");
  });

  it("carries a chapter's brief verbatim", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { brief: "Open on the flooded quay." });
    expect(packManuscriptExport(book).chapters[0]?.brief).toBe("Open on the flooded quay.");
  });

  it("gives an unsplit chapter a single scene spanning its whole prose", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma locked the door." });
    const scenes = packManuscriptExport(book).chapters[0]?.scenes;
    expect(scenes).toHaveLength(1);
    expect(scenes?.[0]?.description).toBe("Emma locked the door.");
    expect(scenes?.[0]?.title).toBeUndefined();
    expect(scenes?.[0]?.instructions).toBeUndefined();
  });

  it("carries each explicit scene's id, order, title, description, and instructions", () => {
    let book = createBook("Night Keys");
    const chapterId = book.chapters[0]!.id;
    book = updateChapter(book, chapterId, { prose: "Emma locked the door.\n\nRain hit the windows." });
    let chapter = book.chapters[0]!;
    const scenes = splitSceneAtParagraph(chapter, 1);
    book = updateChapter(book, chapterId, { scenes });
    chapter = book.chapters.find((item) => item.id === chapterId)!;
    const secondSceneId = scenes[1]!.id;
    book = updateChapter(book, chapterId, {
      scenes: updateSceneMeta(chapter, secondSceneId, { title: "The storm breaks", brief: "Must establish the leak." })
    });

    const exported = packManuscriptExport(book).chapters[0]!;
    expect(exported.scenes).toHaveLength(2);
    expect(exported.scenes[0]?.description).toBe("Emma locked the door.");
    expect(exported.scenes[0]?.sequence_index).toBe(0);
    expect(exported.scenes[1]?.id).toBe(secondSceneId);
    expect(exported.scenes[1]?.sequence_index).toBe(1);
    expect(exported.scenes[1]?.title).toBe("The storm breaks");
    expect(exported.scenes[1]?.description).toBe("Rain hit the windows.");
    expect(exported.scenes[1]?.instructions).toBe("Must establish the leak.");
  });

  it("drops a trailing placeholder scene (added but never drafted into) from the export", () => {
    let book = createBook("Night Keys");
    const chapterId = book.chapters[0]!.id;
    book = updateChapter(book, chapterId, { prose: "Emma locked the door." });
    const chapter = book.chapters[0]!;
    book = updateChapter(book, chapterId, { scenes: addScene(chapter) });

    const exported = packManuscriptExport(book).chapters[0]!;
    expect(exported.scenes).toHaveLength(1);
    expect(exported.scenes[0]?.description).toBe("Emma locked the door.");
  });
});

describe("manuscriptAppExportFilename", () => {
  it("slugifies the title and appends the export date", () => {
    const book = createBook("Night Keys!");
    expect(manuscriptAppExportFilename(book, "2026-10-02T00:00:00.000Z")).toBe("night-keys-storycore-2026-10-02.json");
  });

  it("falls back to 'manuscript' when the title has no letters or digits", () => {
    const book = { ...createBook("Night Keys"), title: "—" };
    expect(manuscriptAppExportFilename(book, "2026-10-02T00:00:00.000Z")).toBe("manuscript-storycore-2026-10-02.json");
  });
});
