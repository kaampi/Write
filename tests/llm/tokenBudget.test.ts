import { describe, expect, it } from "vitest";
import { REASONING_HEADROOM_TOKENS, withReasoningHeadroom } from "@llm/tokenBudget";

describe("withReasoningHeadroom", () => {
  it("adds the reasoning reserve on top of the base budget", () => {
    expect(withReasoningHeadroom(4000)).toBe(4000 + REASONING_HEADROOM_TOKENS);
    expect(withReasoningHeadroom(1800)).toBe(1800 + REASONING_HEADROOM_TOKENS);
  });

  it("scales with the base budget rather than replacing it", () => {
    expect(withReasoningHeadroom(100)).toBeLessThan(withReasoningHeadroom(200));
  });
});
