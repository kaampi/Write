import { describe, expect, it } from "vitest";
import { mayAccess, mayReviewProposal, type CoreApp } from "@core/workspaceAccess";

const apps: CoreApp[] = ["storybook", "sandbox", "comic"];

describe("Core workspace isolation", () => {
  for (const ownerApp of apps) {
    for (const caller of apps) {
      const workspace = { id: `workspace-${ownerApp}`, ownerApp };
      it(`${caller} cannot mutate ${ownerApp}'s workspace unless owner`, () => {
        expect(mayAccess({ app: caller }, workspace, "write")).toBe(caller === ownerApp);
        expect(mayAccess({ app: caller }, workspace, "delete")).toBe(caller === ownerApp);
      });
      it(`${caller} can read ${ownerApp}'s workspace only with a grant or ownership`, () => {
        expect(mayAccess({ app: caller }, workspace, "read")).toBe(caller === ownerApp);
        expect(mayAccess({ app: caller }, workspace, "read", [
          { workspaceId: workspace.id, readerApp: caller }
        ])).toBe(true);
      });
      it("publication never grants write", () => {
        expect(mayAccess({ app: caller }, workspace, "write", [
          { workspaceId: workspace.id, readerApp: caller }
        ])).toBe(caller === ownerApp);
      });
      it("only target owner may review incoming proposals", () => {
        expect(mayReviewProposal({ app: caller }, workspace)).toBe(caller === ownerApp);
      });
    }
  }
});
