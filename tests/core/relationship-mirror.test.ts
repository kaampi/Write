import { describe, expect, it, vi } from "vitest";
import {
  RELATIONSHIP_MIRROR_SYSTEM,
  relationshipMirrorDraft,
  relationshipMirrorDraftAI,
  withRelationshipMirror,
  withRelationshipMirrorAI,
  withRelationshipMirrorFor,
  withRelationshipMirrorForAI
} from "@core/relationshipMirror";
import type { NarrativeFact } from "@core/NarrativeFact";
import type { EntityKind } from "@core/bibleGroups";

function lockedIdentity(entity_ref: string, entity_label: string): NarrativeFact {
  return {
    id: `${entity_ref}-identity`,
    entity_ref,
    entity_label,
    predicate: "core.identity",
    value: `${entity_label} is a character in the story`,
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-26T00:00:00.000Z"
  };
}

function lockedRelationship(entity_ref: string, entity_label: string, value: string, id = `${entity_ref}-rel`): NarrativeFact {
  return {
    id,
    entity_ref,
    entity_label,
    predicate: "core.relationship",
    value,
    sequence_index: 1,
    status: "locked",
    source: "author",
    created_at: "2026-09-26T00:00:00.000Z"
  };
}

const kinds: EntityKind[] = [];

describe("relationshipMirrorDraft", () => {
  it("drafts the same claim for the other named character, names swapped", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const draft = relationshipMirrorDraft(fact, [...facts, fact], kinds);
    expect(draft).toEqual({
      entity_ref: "erik",
      entity_label: "Erik",
      predicate: "core.relationship",
      value: "Met Anna at the docks ten years ago"
    });
  });

  it("does nothing for a non-relationship predicate", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = { ...lockedRelationship("anna", "Anna", "Met Erik at the docks"), predicate: "core.identity" as const };
    expect(relationshipMirrorDraft(fact, [...facts, fact], kinds)).toBeUndefined();
  });

  it("does nothing when the value names no known character", () => {
    const facts = [lockedIdentity("anna", "Anna")];
    const fact = lockedRelationship("anna", "Anna", "Trusts no one since the war");
    expect(relationshipMirrorDraft(fact, [...facts, fact], kinds)).toBeUndefined();
  });

  it("refuses to guess when the value names more than one other character", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik"), lockedIdentity("björn", "Björn")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik and Björn at the same time, at the docks");
    expect(relationshipMirrorDraft(fact, [...facts, fact], kinds)).toBeUndefined();
  });
});

describe("withRelationshipMirror", () => {
  it("queues a pending proposal on the other character when nothing conflicts yet", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const next = withRelationshipMirror([...facts, fact], fact, kinds);
    const mirrored = next.find((row) => row.entity_ref === "erik" && row.predicate === "core.relationship");
    expect(mirrored?.status).toBe("ai_proposed");
    expect(mirrored?.value).toBe("Met Anna at the docks ten years ago");
  });

  it("flags a real conflict instead of silently locking, when Erik's own facts already disagree", () => {
    const erikExisting = lockedRelationship("erik", "Erik", "Has never met Anna", "erik-existing");
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik"), erikExisting];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const next = withRelationshipMirror([...facts, fact], fact, kinds);
    const flagged = next.find((row) => row.entity_ref === "erik" && row.status === "flagged");
    expect(flagged).toBeTruthy();
    expect(flagged?.conflict_with).toBe("erik-existing");
  });

  it("never locks the mirrored claim directly", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const next = withRelationshipMirror([...facts, fact], fact, kinds);
    expect(next.some((row) => row.entity_ref === "erik" && row.predicate === "core.relationship" && row.status === "locked")).toBe(
      false
    );
  });
});

describe("withRelationshipMirrorFor", () => {
  it("no-ops when the matching claim never actually landed as locked truth", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const next = withRelationshipMirrorFor(facts, { entity_ref: "anna", predicate: "core.relationship", value: "Never established" }, kinds);
    expect(next).toBe(facts);
  });

  it("finds the freshly-locked fact by its claim and mirrors it", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const applied = [...facts, fact];
    const next = withRelationshipMirrorFor(
      applied,
      { entity_ref: "anna", predicate: "core.relationship", value: "Met Erik at the docks ten years ago" },
      kinds
    );
    expect(next.some((row) => row.entity_ref === "erik" && row.status === "ai_proposed")).toBe(true);
  });
});

describe("relationshipMirrorDraftAI", () => {
  it("uses the model's inverted phrasing instead of the mechanical name-swap", async () => {
    // The tester's own report: Amber's "reluctant mentor to Wick" was mirroring onto
    // Wick's card as "reluctant mentor to Amber" — same role, wrong person, because the
    // mechanical version only swaps the name and never flips a directional role.
    const facts = [lockedIdentity("amber", "Amber"), lockedIdentity("wick", "Wick")];
    const fact = lockedRelationship("amber", "Amber", "reluctant mentor to Wick");
    const chat = vi.fn().mockResolvedValue("reluctant student of Amber");
    const draft = await relationshipMirrorDraftAI(fact, [...facts, fact], kinds, chat);
    expect(draft).toEqual({
      entity_ref: "wick",
      entity_label: "Wick",
      predicate: "core.relationship",
      value: "reluctant student of Amber"
    });
    expect(chat).toHaveBeenCalledTimes(1);
  });

  it("falls back to the mechanical substitution when the model call throws", async () => {
    const facts = [lockedIdentity("rose", "Rose"), lockedIdentity("amber", "Amber")];
    const fact = lockedRelationship("rose", "Rose", "Amber's mother");
    const chat = vi.fn().mockRejectedValue(new Error("model unreachable"));
    const draft = await relationshipMirrorDraftAI(fact, [...facts, fact], kinds, chat);
    expect(draft).toEqual({
      entity_ref: "amber",
      entity_label: "Amber",
      predicate: "core.relationship",
      value: "Rose's mother"
    });
  });

  it("falls back to the mechanical substitution when the model returns nothing usable", async () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const chat = vi.fn().mockResolvedValue("   ");
    const draft = await relationshipMirrorDraftAI(fact, [...facts, fact], kinds, chat);
    expect(draft?.value).toBe("Met Anna at the docks ten years ago");
  });

  it("strips surrounding quotes the model adds around its answer", async () => {
    const facts = [lockedIdentity("amber", "Amber"), lockedIdentity("wick", "Wick")];
    const fact = lockedRelationship("amber", "Amber", "reluctant mentor to Wick");
    const chat = vi.fn().mockResolvedValue('"reluctant student of Amber"');
    const draft = await relationshipMirrorDraftAI(fact, [...facts, fact], kinds, chat);
    expect(draft?.value).toBe("reluctant student of Amber");
  });

  it("does nothing for a non-relationship predicate, same as the mechanical version", async () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = { ...lockedRelationship("anna", "Anna", "Met Erik at the docks"), predicate: "core.identity" as const };
    const chat = vi.fn();
    expect(await relationshipMirrorDraftAI(fact, [...facts, fact], kinds, chat)).toBeUndefined();
    expect(chat).not.toHaveBeenCalled();
  });
});

describe("RELATIONSHIP_MIRROR_SYSTEM", () => {
  it("warns against carrying the original character's own attitude onto the other side", () => {
    // Mats's follow-up catch: "reluctant mentor to Wick" mirroring to "reluctant student of
    // Amber" invents a feeling of Wick's the original fact never stated — the reluctance was
    // Amber's. Only a prompt-level guard is possible here (no code path can judge this), so
    // this just pins the instruction's presence, same pattern as INTERVIEW_EXTRACTOR_SYSTEM's
    // own content assertions.
    expect(RELATIONSHIP_MIRROR_SYSTEM).toContain("own attitude or feeling");
    expect(RELATIONSHIP_MIRROR_SYSTEM).toContain("reluctant");
  });

  it("passes an attitude-free mirrored value through unchanged", async () => {
    const facts = [lockedIdentity("amber", "Amber"), lockedIdentity("wick", "Wick")];
    const fact = lockedRelationship("amber", "Amber", "reluctant mentor to Wick");
    const chat = vi.fn().mockResolvedValue("Amber's student");
    const draft = await relationshipMirrorDraftAI(fact, [...facts, fact], kinds, chat);
    expect(draft?.value).toBe("Amber's student");
  });
});

describe("withRelationshipMirrorAI / withRelationshipMirrorForAI", () => {
  it("queues the AI-inverted claim as a pending proposal, never locked directly", async () => {
    const facts = [lockedIdentity("amber", "Amber"), lockedIdentity("wick", "Wick")];
    const fact = lockedRelationship("amber", "Amber", "reluctant mentor to Wick");
    const chat = vi.fn().mockResolvedValue("reluctant student of Amber");
    const next = await withRelationshipMirrorAI([...facts, fact], fact, kinds, chat);
    const mirrored = next.find((row) => row.entity_ref === "wick" && row.predicate === "core.relationship");
    expect(mirrored?.status).toBe("ai_proposed");
    expect(mirrored?.value).toBe("reluctant student of Amber");
  });

  it("finds the freshly-locked fact by its claim and mirrors it with the AI rewrite", async () => {
    const facts = [lockedIdentity("rose", "Rose"), lockedIdentity("amber", "Amber")];
    const fact = lockedRelationship("rose", "Rose", "Amber's mother");
    const applied = [...facts, fact];
    const chat = vi.fn().mockResolvedValue("daughter of Rose");
    const next = await withRelationshipMirrorForAI(applied, { entity_ref: "rose", predicate: "core.relationship", value: "Amber's mother" }, kinds, chat);
    const mirrored = next.find((row) => row.entity_ref === "amber" && row.predicate === "core.relationship");
    expect(mirrored?.value).toBe("daughter of Rose");
  });

  it("no-ops without calling the model when the matching claim never landed as locked truth", async () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const chat = vi.fn();
    const next = await withRelationshipMirrorForAI(facts, { entity_ref: "anna", predicate: "core.relationship", value: "Never established" }, kinds, chat);
    expect(next).toBe(facts);
    expect(chat).not.toHaveBeenCalled();
  });
});
