import { useMemo, useState } from "react";
import { activeFacts, lockedFacts, type NarrativeFact } from "@core/NarrativeFact";
import { CORE_PREDICATES, type CorePredicate } from "@core/predicates";
import { format, useLocale } from "./i18n";
import { useSeriesStore } from "./useSeriesStore";
import { PendingFact } from "./BiblePanel";

type EntityGroup = { entity_ref: string; entity_label: string; facts: NarrativeFact[] };

function groupByEntity(facts: NarrativeFact[]): EntityGroup[] {
  const groups = new Map<string, EntityGroup>();
  for (const fact of facts) {
    const existing = groups.get(fact.entity_ref);
    if (existing) existing.facts.push(fact);
    else groups.set(fact.entity_ref, { entity_ref: fact.entity_ref, entity_label: fact.entity_label, facts: [fact] });
  }
  return [...groups.values()].sort((a, b) => a.entity_label.localeCompare(b.entity_label));
}

/**
 * The series' own Story Bible — same review-queue mechanism as a book's
 * (`PendingFact` reused directly, no coupling to Book itself), but
 * deliberately flat: no entity "kind" sections, profiles, pictures, or
 * mentions-in-chapter tracking, since a series doesn't have chapters of
 * its own. Those stay book-only; a series fact is just entity + claims.
 */
export function SeriesBiblePanel() {
  const { series, addFact, reviseFact, retractFact, approve, reject, keepSeparate } = useSeriesStore();
  const { messages: m } = useLocale();
  const [label, setLabel] = useState("");
  const [predicate, setPredicate] = useState<CorePredicate>("core.identity");
  const [value, setValue] = useState("");

  const facts = series?.facts ?? [];
  const locked = useMemo(() => groupByEntity(lockedFacts(facts)), [facts]);
  const pending = useMemo(() => activeFacts(facts).filter((fact) => fact.status !== "locked"), [facts]);

  if (!series) return null;

  return (
    <div className="series-bible">
      {pending.length > 0 ? (
        <section className="series-bible-review">
          <h3 className="settings-heading home-heading-lg">{m.bible.review}</h3>
          <p className="quiet">{m.bible.reviewBody}</p>
          <ul className="bible-review-list">
            {pending.map((fact) => (
              <PendingFact
                key={fact.id}
                fact={fact}
                mergeOptions={[]}
                onLock={(nextValue) => void approve(fact.id, nextValue)}
                onReject={() => void reject(fact.id)}
                onKeepSeparate={(nextValue) => void keepSeparate(fact.id, nextValue)}
                onMergeWith={() => {}}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="series-bible-locked">
        <h3 className="settings-heading home-heading-lg">{m.series.lockedFactsHeading}</h3>
        {locked.length === 0 ? <p className="empty-shelf">{m.series.noFactsYet}</p> : null}
        <div className="series-entity-grid">
          {locked.map((entity) => (
            <div key={entity.entity_ref} className="series-entity-card">
              <strong>{entity.entity_label}</strong>
              {entity.facts.map((fact) => (
                <div key={fact.id} className="series-entity-fact">
                  <div className="series-entity-fact-row">
                    <span className="series-entity-fact-predicate">{m.bible.predicates[fact.predicate]}</span>
                    <button
                      type="button"
                      className="text-button danger"
                      onClick={() => {
                        if (window.confirm(format(m.bible.removeFactConfirm, { value: fact.value }))) void retractFact(fact.id);
                      }}
                    >
                      {m.bible.remove}
                    </button>
                  </div>
                  <textarea
                    className="series-entity-fact-value"
                    defaultValue={fact.value}
                    rows={2}
                    onBlur={(event) => {
                      const next = event.target.value;
                      if (next.trim() && next !== fact.value) void reviseFact(fact.id, next);
                    }}
                  />
                  {fact.source_book_title ? (
                    <span className="quiet series-fact-provenance">
                      {format(
                        fact.source_chapter_title ? m.series.establishedInChapter : m.series.establishedIn,
                        { book: fact.source_book_title, chapter: fact.source_chapter_title ?? "" }
                      )}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="series-bible-add">
        <h3 className="settings-heading home-heading-lg">{m.series.addFact}</h3>
        <form
          className="series-add-fact-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!label.trim() || !value.trim()) return;
            void addFact({ label, predicate, value }).then(() => setValue(""));
          }}
        >
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={m.series.entityNamePlaceholder}
            aria-label={m.series.entityNamePlaceholder}
          />
          <select value={predicate} onChange={(event) => setPredicate(event.target.value as CorePredicate)}>
            {CORE_PREDICATES.map((item) => (
              <option key={item} value={item}>
                {m.bible.predicates[item]}
              </option>
            ))}
          </select>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={m.bible.claimPlaceholder}
            rows={1}
          />
          <button type="submit" className="primary" disabled={!label.trim() || !value.trim()}>
            {m.bible.lockInto}
          </button>
        </form>
      </section>
    </div>
  );
}
