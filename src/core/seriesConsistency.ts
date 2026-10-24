import { normalizeValue } from "./ids";
import { lockedFacts, type NarrativeFact } from "./NarrativeFact";
import type { CorePredicate } from "./predicates";

/** One source's claim for a flagged entity+predicate — the series itself, or one of its books. */
export type ConsistencySource = { label: string; value: string };

export type ConsistencyIssue = {
  entity_ref: string;
  entity_label: string;
  predicate: CorePredicate;
  sources: ConsistencySource[];
};

export type BookFactSet = { bookTitle: string; facts: NarrativeFact[] };

/**
 * An on-demand audit (series workspace, "Check consistency") — not the
 * lock-time warning (NarrativeFact.ts's `seriesCanonConflict`), which only
 * catches a book diverging from the series at the moment it locks a fact.
 * Two sibling books never see each other's facts at all, only the series',
 * so nothing stops them from independently locking different claims for
 * the same entity+predicate — this finds those after the fact, deliberate
 * or not. Purely deterministic and synchronous: a comparison of what's
 * already locked, no AI involved, so it never needs to "run" in the
 * background.
 */
export function crossBookConsistencyIssues(
  seriesFacts: NarrativeFact[],
  seriesLabel: string,
  books: BookFactSet[]
): ConsistencyIssue[] {
  const byKey = new Map<string, { entity_label: string; predicate: CorePredicate; sources: ConsistencySource[] }>();

  function add(sourceLabel: string, facts: NarrativeFact[]) {
    for (const fact of lockedFacts(facts)) {
      const key = `${fact.entity_ref}\u0000${fact.predicate}`;
      const entry = byKey.get(key) ?? { entity_label: fact.entity_label, predicate: fact.predicate, sources: [] };
      entry.sources.push({ label: sourceLabel, value: fact.value });
      byKey.set(key, entry);
    }
  }

  add(seriesLabel, seriesFacts);
  for (const book of books) add(book.bookTitle, book.facts);

  const issues: ConsistencyIssue[] = [];
  for (const [key, entry] of byKey) {
    const distinctValues = new Set(entry.sources.map((source) => normalizeValue(source.value)));
    if (distinctValues.size < 2) continue;
    const entity_ref = key.split("\u0000")[0]!;
    issues.push({ entity_ref, entity_label: entry.entity_label, predicate: entry.predicate, sources: entry.sources });
  }
  return issues.sort((a, b) => a.entity_label.localeCompare(b.entity_label));
}
