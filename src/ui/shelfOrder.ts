/**
 * Manual drag-to-reorder for "Your manuscripts" (Mats, 2026-11-04: "Skulle
 * man kunna sortera böckerna genom att hålla ner muspekaren och dra boken
 * till sin plats?" - confirmed for both Shelf view and List view, so they
 * stay in sync). Same localStorage pub-sub shape as mascot.ts - this is
 * purely local display order, not manuscript content, so it has nothing to
 * do with Book/updated_at (see v1.0.275: editing shelf settings must NOT
 * touch that field either).
 *
 * Stores the translation-group PRIMARY id (group[0].id from
 * groupManuscripts) for each manually-placed group, in the order the
 * author dragged them into. A group never touched by drag-and-drop simply
 * isn't in this list, and keeps falling in wherever the default
 * newest-updated-first order already puts it.
 */
const SHELF_ORDER_KEY = "storybook-ai.shelf-order";

export function readShelfOrder(): string[] {
  try {
    const stored = localStorage.getItem(SHELF_ORDER_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeShelfOrder(order: string[]): void {
  try {
    localStorage.setItem(SHELF_ORDER_KEY, JSON.stringify(order));
  } catch {
    /* private mode */
  }
  listeners.forEach((listener) => listener(order));
}

const listeners = new Set<(order: string[]) => void>();

export function subscribeShelfOrder(listener: (order: string[]) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Moves `draggedId` to just before `targetId` (or to the end, if
 * `targetId` is null - dropped past the last item). `allIds` is the
 * group's primary ids in their CURRENT on-screen order (manual order
 * already applied, where present), so a drop always produces a full,
 * unambiguous order covering every group - not just the ones already
 * manually placed. Pure, so it's unit-testable without touching
 * localStorage - reorderShelf below is the thin storage-writing wrapper.
 */
export function nextShelfOrder(allIds: string[], draggedId: string, targetId: string | null): string[] | null {
  const withoutDragged = allIds.filter((id) => id !== draggedId);
  const targetIndex = targetId === null ? withoutDragged.length : withoutDragged.indexOf(targetId);
  if (targetId !== null && targetIndex === -1) return null;
  return [...withoutDragged.slice(0, targetIndex), draggedId, ...withoutDragged.slice(targetIndex)];
}

export function reorderShelf(allIds: string[], draggedId: string, targetId: string | null): void {
  const next = nextShelfOrder(allIds, draggedId, targetId);
  if (next) writeShelfOrder(next);
}

/**
 * Applies a stored manual order to a freshly-grouped list: items with a
 * remembered position come first, in that order; everything else keeps the
 * relative order `groups` already had (newest-updated-first), appended
 * after. A group dragged once and a brand-new manuscript created later
 * both behave sensibly this way - the new one lands at the front via the
 * normal newest-first rule until the author drags it too.
 */
export function applyShelfOrder<T extends { id: string }>(groups: T[][], order: string[]): T[][] {
  if (order.length === 0) return groups;
  const byId = new Map(groups.map((group) => [group[0]!.id, group]));
  const ordered: T[][] = [];
  for (const id of order) {
    const group = byId.get(id);
    if (group) {
      ordered.push(group);
      byId.delete(id);
    }
  }
  for (const group of groups) {
    if (byId.has(group[0]!.id)) ordered.push(group);
  }
  return ordered;
}
