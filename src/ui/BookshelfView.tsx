import { useState, type CSSProperties } from "react";
import type { BookSummary } from "@core/BookSchema";
import { count, format, useLocale } from "./i18n";

const SPINE_COLORS = ["var(--ink)", "var(--plotline-blue)", "var(--flag)", "var(--sage)", "var(--ai)", "var(--plotline-charcoal)"];
const BASE_HEIGHT = 230;
const GAP = 9;

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

/** Groups already share one primary per translation family (see groupManuscripts); the shelf shows one spine per group. */
export function BookshelfView({
  groups,
  onOpen,
  onDelete
}: {
  groups: BookSummary[][];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { messages: m } = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = groups
    .map((group) => group[0])
    .filter((primary): primary is BookSummary => Boolean(primary))
    .map((primary) => {
      const hash = hashString(primary.id);
      const width = 46 + (hashString(primary.title) % 26);
      return { primary, width, depth: Math.round(width * 3.3), color: SPINE_COLORS[hash % SPINE_COLORS.length] };
    });

  // Shrink-to-fit width is unreliable inside a flex row with absolutely-positioned 3D
  // faces, so the shelf's pixel width is computed here from the real data instead of
  // trusting CSS auto-sizing; the margin on each side has to be symmetric, not just
  // generous on the side a book happens to pop out toward.
  const booksWidth = items.reduce((sum, item) => sum + item.width, 0);
  const gapsWidth = GAP * Math.max(0, items.length - 1);
  const shelfWidth = Math.max(360, 60 + booksWidth + gapsWidth + 60);

  const selected = items.find((item) => item.primary.id === selectedId) ?? null;
  const selectedGroup = selected ? groups.find((group) => group[0]?.id === selected.primary.id) : undefined;
  const siblings = selectedGroup ? selectedGroup.slice(1) : [];

  return (
    <div className="shelf-row">
      <div className="shelf-scene" style={{ width: shelfWidth }}>
        <div className="shelf-books">
          {items.map((item) => {
            const active = item.primary.id === selectedId;
            const style = {
              "--w": `${item.width}px`,
              "--h": `${BASE_HEIGHT}px`,
              "--d": `${item.depth}px`,
              "--bg": item.color
            } as CSSProperties;
            return (
              <button
                key={item.primary.id}
                type="button"
                className={active ? "book-spine is-active" : "book-spine"}
                style={style}
                aria-pressed={active}
                title={item.primary.title}
                onClick={() => setSelectedId(active ? null : item.primary.id)}
              >
                <div className="face spine-face">
                  <span className="spine-title">{item.primary.title}</span>
                </div>
                <div className="face cover-front">
                  <span className="cover-title">{item.primary.title}</span>
                </div>
                <div className="face cover-back" />
                <div className="face pages-top" />
                <div className="face pages-bottom" />
                <div className="face pages-edge" />
                <div className="face book-shadow" />
              </button>
            );
          })}
        </div>
        <div className="shelf-plank-top" />
        <div className="shelf-plank-bottom" />
      </div>

      <div className={selected ? "shelf-info-card is-visible" : "shelf-info-card"}>
        {selected ? (
          <>
            <strong className="shelf-info-title">{selected.primary.title}</strong>
            <span className="shelf-info-meta">
              {selected.primary.prose_language ? <span className="book-language-tag">{selected.primary.prose_language}</span> : null}
              {count(selected.primary.chapterCount, m.home.chapters)}
              <span className="dot">·</span>
              {count(selected.primary.factCount, m.home.facts)}
            </span>
            {siblings.length > 0 ? (
              <ul className="shelf-info-siblings">
                {siblings.map((sibling) => (
                  <li key={sibling.id}>
                    <button type="button" className="text-button" onClick={() => onOpen(sibling.id)}>
                      {sibling.prose_language || m.home.languageVersionUnset}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="shelf-info-actions">
              <button type="button" className="primary" onClick={() => onOpen(selected.primary.id)}>
                {m.home.shelfOpen}
              </button>
              <button
                type="button"
                className="text-button danger"
                onClick={() => {
                  if (window.confirm(format(m.home.deleteConfirm, { title: selected.primary.title }))) onDelete(selected.primary.id);
                }}
              >
                {m.home.delete}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
