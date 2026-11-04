import { describe, expect, it } from "vitest";
import { applyShelfOrder, nextShelfOrder } from "../../src/ui/shelfOrder";

describe("nextShelfOrder", () => {
  it("moves the dragged id to just before the target", () => {
    expect(nextShelfOrder(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"]);
  });

  it("moves the dragged id to the end when the target is null", () => {
    expect(nextShelfOrder(["a", "b", "c"], "a", null)).toEqual(["b", "c", "a"]);
  });

  it("is a no-op shape when dropped on its own current successor", () => {
    expect(nextShelfOrder(["a", "b", "c"], "a", "b")).toEqual(["a", "b", "c"]);
  });

  it("returns null for an unknown target id instead of silently dropping it", () => {
    expect(nextShelfOrder(["a", "b"], "a", "missing")).toBeNull();
  });
});

describe("applyShelfOrder", () => {
  function groupsOf(ids: string[]): { id: string }[][] {
    return ids.map((id) => [{ id }]);
  }

  it("leaves groups untouched when no manual order is stored", () => {
    const groups = groupsOf(["z", "a"]);
    expect(applyShelfOrder(groups, [])).toBe(groups);
  });

  it("places manually-ordered groups first, in that order", () => {
    const groups = groupsOf(["z", "a", "m"]);
    const result = applyShelfOrder(groups, ["a", "z"]);
    expect(result.map((group) => group[0]!.id)).toEqual(["a", "z", "m"]);
  });

  it("appends a group never dragged after the manually-ordered ones, keeping its relative order", () => {
    const groups = groupsOf(["new1", "new2", "a"]);
    const result = applyShelfOrder(groups, ["a"]);
    expect(result.map((group) => group[0]!.id)).toEqual(["a", "new1", "new2"]);
  });

  it("ignores a stored id for a group that no longer exists", () => {
    const groups = groupsOf(["a", "b"]);
    const result = applyShelfOrder(groups, ["deleted", "b", "a"]);
    expect(result.map((group) => group[0]!.id)).toEqual(["b", "a"]);
  });
});
