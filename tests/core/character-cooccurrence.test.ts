import { describe, expect, it } from "vitest";
import { createBook } from "@core/BookSchema";
import { characterCooccurrence } from "@core/characterCooccurrence";

describe("characterCooccurrence", () => {
  it("counts shared scenes between two characters, not just shared dialogue", () => {
    const [base] = createBook("Night Keys").chapters;
    const chapterA = {
      ...base!,
      id: "a",
      prose: "Kael found Melanie by the gate.\n\nKael walked alone through the woods.",
      scenes: [{ id: "together", startParagraph: 0 }, { id: "alone", startParagraph: 1 }]
    };
    const chapterB = { ...base!, id: "b", prose: "Melanie and Kael shared bread by the fire." };

    const result = characterCooccurrence(
      [chapterA, chapterB],
      [{ entity_ref: "kael", entity_label: "Kael" }, { entity_ref: "melanie", entity_label: "Melanie" }],
      []
    );

    const kael = result.nodes.find((n) => n.entityRef === "kael");
    const melanie = result.nodes.find((n) => n.entityRef === "melanie");
    expect(kael?.scenesMentioned).toBe(3);
    expect(melanie?.scenesMentioned).toBe(2);

    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0]).toMatchObject({ a: "kael", b: "melanie", scenesTogether: 2 });
    expect(result.pairs[0]?.together).toBeCloseTo(2 / 3, 5);
  });

  it("omits a pair that never shares a scene", () => {
    const [base] = createBook("Night Keys").chapters;
    const chapter = {
      ...base!,
      prose: "Kael walked alone.\n\nMarkus brooded in the tower.",
      scenes: [{ id: "kael-scene", startParagraph: 0 }, { id: "markus-scene", startParagraph: 1 }]
    };
    const result = characterCooccurrence(
      [chapter],
      [{ entity_ref: "kael", entity_label: "Kael" }, { entity_ref: "markus", entity_label: "Markus" }],
      []
    );
    expect(result.pairs).toEqual([]);
  });

  it("uses aliases and exclusions the same way Story Bible mention tracking does", () => {
    const [base] = createBook("Night Keys").chapters;
    const chapter = { ...base!, prose: "Rose handed Mimi the key.\n\nThe rose garden was quiet." };
    const result = characterCooccurrence(
      [chapter],
      [{ entity_ref: "rose", entity_label: "Rose" }, { entity_ref: "mimi", entity_label: "Mimi" }],
      [{ entity_ref: "rose", aliases: [], exclusions: ["rose garden"] }]
    );
    const rose = result.nodes.find((n) => n.entityRef === "rose");
    expect(rose?.scenesMentioned).toBe(1);
  });
});
