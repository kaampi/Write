/** Authorization policy for Core's app-owned data. The service must supply
 * a verified principal; never derive it from untrusted request payloads. */
export type CoreApp = "storybook" | "sandbox" | "comic";
export type Principal = { app: CoreApp };
export type Workspace = { id: string; ownerApp: CoreApp };
export type Publication = { workspaceId: string; readerApp: CoreApp };
export type Operation = "read" | "write" | "delete";

export function mayAccess(
  principal: Principal,
  workspace: Workspace,
  operation: Operation,
  publications: readonly Publication[] = []
): boolean {
  if (principal.app === workspace.ownerApp) return true;
  if (operation !== "read") return false;
  return publications.some(
    grant => grant.workspaceId === workspace.id && grant.readerApp === principal.app
  );
}

export type CanonProposal = {
  id: string;
  sourceWorkspaceId: string;
  targetWorkspaceId: string;
  sourceRevision: string;
  entityId: string;
  proposedChange: unknown;
  status: "pending" | "accepted" | "rejected";
};

/** Submission never mutates the target; only its owner may adjudicate. */
export function mayReviewProposal(principal: Principal, target: Workspace): boolean {
  return principal.app === target.ownerApp;
}
