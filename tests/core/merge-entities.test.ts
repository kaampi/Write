import { describe, expect, it } from "vitest";
import { createBook, type Book } from "@core/BookSchema";
import { applyMerge, buildMergeProposal, canMergeEntities } from "@core/mergeEntities";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(ref: string, label: string, overrides: Partial<NarrativeFact> = {}): NarrativeFact {
  // `overrides.id` is a per-ref suffix, not the final id — computed and
  // placed after the spread so two different refs passing the same suffix
  // (e.g. both using "identity") never collide into one literal fact id.
  const suffix = overrides.id ?? "1";
  return {
    entity_ref: ref,
    entity_label: label,
    predicate: "core.identity",
    value: "Something",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-26T00:00:00.000Z",
    ...overrides,
    id: `${ref}-${overrides.predicate ?? "core.identity"}-${suffix}`
  };
}

/** Captain Kael spread across two cards — the exact case Mats described: "Kael" and "Kaptenen". */
function bookWithKael(): Book {
  let book = createBook("Night Keys");
  book = {
    ...book,
    facts: [
      fact("kael", "Kael", { id: "identity", value: "A starship captain." }),
      fact("kael", "Kael", { id: "trait-1", predicate: "core.trait", value: "Steady under pressure." }),
      fact("kaptenen", "Kaptenen", { id: "identity", value: "A starship captain." }),
      fact("kaptenen", "Kaptenen", { id: "trait-1", predicate: "core.trait", value: "Haunted by the mutiny." })
    ],
    profiles: [{ entity_ref: "kael", looks: "Grey at the temples", personality: "", goals: "", fears: "", tags: ["pov"] }],
    event_profiles: [{ entity_ref: "the-mutiny", participants: ["kael", "kaptenen"] }],
    media: [
      { entity_ref: "kael", pictures: [{ thumbDataUrl: "a", imageDataUrl: "a" }] },
      { entity_ref: "kaptenen", pictures: [{ thumbDataUrl: "b", imageDataUrl: "b" }] }
    ],
    hidden_entities: ["kaptenen"],
    entity_kinds: [],
    entity_tracking: [{ entity_ref: "kaptenen", aliases: ["the Captain"], exclusions: ["captain's log"] }]
  };
  return book;
}

describe("canMergeEntities", () => {
  it("refuses fewer than two distinct refs", () => {
    expect(canMergeEntities(bookWithKael(), ["kael"])).toEqual({ ok: false, reason: "too-few" });
    expect(canMergeEntities(bookWithKael(), ["kael", "kael"])).toEqual({ ok: false, reason: "too-few" });
  });

  it("refuses entities that resolve to different kinds", () => {
    let book = bookWithKael();
    book = { ...book, facts: [...book.facts, fact("the-bridge", "The Bridge", { id: "place", predicate: "core.place", value: "Deck one." })] };
    expect(canMergeEntities(book, ["kael", "the-bridge"])).toEqual({ ok: false, reason: "kind-mismatch" });
  });

  it("allows two same-kind entities", () => {
    expect(canMergeEntities(bookWithKael(), ["kael", "kaptenen"])).toEqual({ ok: true });
  });
});

describe("buildMergeProposal", () => {
  it("skips a predicate where every merged entity agrees on the exact same value", () => {
    const groups = buildMergeProposal(bookWithKael(), ["kael", "kaptenen"]);
    expect(groups.some((group) => group.predicate === "core.identity")).toBe(false);
  });

  it("surfaces a predicate where the merged entities disagree, grouped by distinct value", () => {
    const groups = buildMergeProposal(bookWithKael(), ["kael", "kaptenen"]);
    const trait = groups.find((group) => group.predicate === "core.trait");
    expect(trait?.options.map((option) => option.value).sort()).toEqual([
      "Haunted by the mutiny.",
      "Steady under pressure."
    ]);
  });

  it("collapses a true duplicate (same predicate, same value, different entities) into one option", () => {
    let book = bookWithKael();
    book = {
      ...book,
      facts: book.facts.map((row) =>
        row.entity_ref === "kaptenen" && row.predicate === "core.trait" ? { ...row, value: "Steady under pressure." } : row
      )
    };
    const groups = buildMergeProposal(book, ["kael", "kaptenen"]);
    // Now both cards agree on the trait too, so it drops out of the proposal
    // entirely — nothing left to decide, same as identity.
    expect(groups.some((group) => group.predicate === "core.trait")).toBe(false);
  });
});

describe("applyMerge", () => {
  it("reassigns every fact to the winner's ref and label", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    expect(next.facts.every((row) => row.entity_ref === "kael" || row.superseded_by)).toBe(true);
    expect(next.facts.filter((row) => !row.superseded_by).every((row) => row.entity_label === "Captain Kael")).toBe(true);
  });

  it("collapses identical values to one surviving fact, superseding the rest", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    const identityFacts = next.facts.filter((row) => row.predicate === "core.identity");
    expect(identityFacts).toHaveLength(2);
    const active = identityFacts.filter((row) => !row.superseded_by);
    expect(active).toHaveLength(1);
    expect(active[0]!.value).toBe("A starship captain.");
  });

  it("supersedes the dropped choice in a real conflict, keeping only the chosen value active", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Haunted by the mutiny."] }]
    });
    const traits = next.facts.filter((row) => row.predicate === "core.trait" && !row.superseded_by);
    expect(traits).toHaveLength(1);
    expect(traits[0]!.value).toBe("Haunted by the mutiny.");
  });

  it("keeps both values active when both are chosen", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure.", "Haunted by the mutiny."] }]
    });
    const traits = next.facts.filter((row) => row.predicate === "core.trait" && !row.superseded_by);
    expect(traits.map((row) => row.value).sort()).toEqual(["Haunted by the mutiny.", "Steady under pressure."]);
  });

  it("keeps the winner's own non-empty profile and unions tags", () => {
    let book = bookWithKael();
    book = { ...book, profiles: [...book.profiles, { entity_ref: "kaptenen", looks: "", personality: "Grim", goals: "", fears: "", tags: ["antagonist?"] }] };
    const next = applyMerge(book, {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    const profile = next.profiles.find((row) => row.entity_ref === "kael");
    expect(profile?.looks).toBe("Grey at the temples");
    expect(profile?.tags.sort()).toEqual(["antagonist?", "pov"]);
    expect(next.profiles.some((row) => row.entity_ref === "kaptenen")).toBe(false);
  });

  it("adopts a loser's profile when the winner has none", () => {
    let book = bookWithKael();
    book = {
      ...book,
      profiles: [{ entity_ref: "kaptenen", looks: "A scar across one eye", personality: "", goals: "", fears: "", tags: [] }]
    };
    const next = applyMerge(book, {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    expect(next.profiles.find((row) => row.entity_ref === "kael")?.looks).toBe("A scar across one eye");
  });

  it("unions pictures from both entities, capped at the normal picture limit", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    const pictures = next.media.find((row) => row.entity_ref === "kael")?.pictures ?? [];
    expect(pictures).toHaveLength(2);
    expect(next.media.some((row) => row.entity_ref === "kaptenen")).toBe(false);
  });

  it("rewrites another event's participants to the winner instead of dropping the link", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    const mutiny = next.event_profiles.find((row) => row.entity_ref === "the-mutiny");
    // kael and kaptenen were both participants — after the merge that's the
    // same ref twice, deduped down to one.
    expect(mutiny?.participants).toEqual(["kael"]);
  });

  it("hides the merged card if either side was hidden", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    expect(next.hidden_entities).toEqual(["kael"]);
  });

  it("carries the losing entity's tracked aliases/exclusions over, plus its old label as a new alias", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Captain Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    const tracking = next.entity_tracking.find((row) => row.entity_ref === "kael");
    expect(tracking?.aliases.sort()).toEqual(["Kaptenen", "the Captain"]);
    expect(tracking?.exclusions).toEqual(["captain's log"]);
  });

  it("never adds the final label itself as its own alias", () => {
    const next = applyMerge(bookWithKael(), {
      refs: ["kael", "kaptenen"],
      winnerRef: "kael",
      finalLabel: "Kael",
      choices: [{ predicate: "core.trait", keptValues: ["Steady under pressure."] }]
    });
    const tracking = next.entity_tracking.find((row) => row.entity_ref === "kael");
    expect(tracking?.aliases).not.toContain("Kael");
  });

  it("no-ops with fewer than two refs", () => {
    const book = bookWithKael();
    expect(applyMerge(book, { refs: ["kael"], winnerRef: "kael", finalLabel: "Kael", choices: [] })).toEqual(book);
  });

  it("no-ops when winnerRef is not one of the merged refs", () => {
    const book = bookWithKael();
    expect(applyMerge(book, { refs: ["kael", "kaptenen"], winnerRef: "someone-else", finalLabel: "X", choices: [] })).toEqual(book);
  });

  it("no-ops with an empty final label", () => {
    const book = bookWithKael();
    expect(applyMerge(book, { refs: ["kael", "kaptenen"], winnerRef: "kael", finalLabel: "   ", choices: [] })).toEqual(book);
  });
});
