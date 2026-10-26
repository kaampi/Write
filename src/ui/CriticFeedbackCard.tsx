import { useEffect, useState } from "react";
import { CRITIC_PERSONA_IDS, type CriticItem } from "@core/critics";
import { useLocale, format } from "./i18n";

export function CriticFeedbackCard({ items, onClose }: { items: CriticItem[]; onClose: () => void }) {
  const { messages: m } = useLocale();
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected !== null ? (items[selected] ?? null) : null;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const groups = CRITIC_PERSONA_IDS.map((persona) => ({
    persona,
    rows: items.map((item, index) => ({ item, index })).filter((row) => row.item.persona === persona)
  })).filter((group) => group.rows.length > 0);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card" role="dialog" aria-modal="true" aria-labelledby="critics-notes-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.critics.review}</p>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="critics-notes-title">{items.length > 0 ? m.critics.title : m.critics.emptyTitle}</h2>
        <p className="quiet">{m.critics.intro}</p>

        {current ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">
              {m.critics.personas[current.persona].label}
              {current.paragraphIndex !== null ? ` · ${format(m.critics.paragraph, { n: current.paragraphIndex + 1 })}` : ""}
            </p>
            <blockquote>{current.quote}</blockquote>
            <p className="chapter-craft-label">{m.critics.note}</p>
            <p className="quiet">{current.observation}</p>
          </div>
        ) : items.length > 0 ? (
          <p className="quiet stats-spark-hint">{m.critics.clickHint}</p>
        ) : (
          <p className="quiet">{m.critics.nothingSolid}</p>
        )}

        {groups.map((group) => (
          <div key={group.persona} className="stats-long stats-packed">
            <p className="chapter-craft-label">{m.critics.personas[group.persona].label}</p>
            <p className="quiet">{m.critics.personas[group.persona].blurb}</p>
            <ul>
              {group.rows.map(({ item, index }) => (
                <li key={`${item.persona}-${index}`} className={selected === index ? "is-selected" : undefined}>
                  <button type="button" className="stats-long-pick" onClick={() => setSelected(index)}>
                    {clip(item.quote, 140)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="quiet stats-foot">{m.critics.foot}</p>
      </div>
    </div>
  );
}

function clip(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, max - 1).trimEnd()}…`;
}
