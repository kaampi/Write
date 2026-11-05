import { useState, type CSSProperties } from "react";
import type { BookSummary } from "@core/BookSchema";
import { count, format, useLocale } from "./i18n";
import { ShelfSettingsDialog, type ShelfSettingsPatch } from "./ShelfSettingsDialog";

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
  seriesTitleById,
  onOpen,
  onDelete,
  onUpdateSettings,
  onOpenSeries,
  onReorder
}: {
  groups: BookSummary[][];
  seriesTitleById: Record<string, string>;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSettings: (id: string, patch: ShelfSettingsPatch) => void;
  /** The selected book's "Series: …" tag opens the series workspace focused on that exact book, rather than just the series in general. */
  onOpenSeries: (seriesId: string, bookId: string) => void;
  /** Drag a spine onto another (or past the last one, with `null`) to reorder the shelf (Mats, 2026-11-04). */
  onReorder: (draggedId: string, targetId: string | null) => void;
}) {
  const { messages: m } = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = groups
    .map((group) => group[0])
    .filter((primary): primary is BookSummary => Boolean(primary))
    .map((primary) => {
      const hash = hashString(primary.id);
      const width = 46 + (hashString(primary.title) % 26);
      const heightAdjust = primary.shelf_height_adjust ?? 0;
      return {
        primary,
        width,
        depth: Math.round(width * 3.3),
        height: Math.round(BASE_HEIGHT * (1 + heightAdjust / 100)),
        color: primary.shelf_color ?? SPINE_COLORS[hash % SPINE_COLORS.length]
      };
    });

  // Shrink-to-fit width is unreliable inside a flex row with absolutely-positioned 3D
  // faces, so the shelf's pixel width is computed here from the real data instead of
  // trusting CSS auto-sizing; the margin on each side has to be symmetric, not just
  // generous on the side a book happens to pop out toward.
  const booksWidth = items.reduce((sum, item) => sum + item.width, 0);
  const gapsWidth = GAP * Math.max(0, items.length - 1);
  const shelfWidth = Math.max(360, 60 + booksWidth + gapsWidth + 60);

  const selected = items.find((item) => item.primary.id === selectedId) ?? null;
  const selectedSeriesId = selected?.primary.series_id;
  const selectedSeriesTitle = selectedSeriesId ? seriesTitleById[selectedSeriesId] : undefined;
  const selectedGroup = selected ? groups.find((group) => group[0]?.id === selected.primary.id) : undefined;
  const siblings = selectedGroup ? selectedGroup.slice(1) : [];
  const editing = editingId ? items.find((item) => item.primary.id === editingId) : undefined;

  return (
    <div className="shelf-row">
      <div className="shelf-scene" style={{ width: shelfWidth }}>
        <div
          className="shelf-books"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (event.target !== event.currentTarget) return;
            onReorder(event.dataTransfer.getData("text/plain"), null);
          }}
        >
          {items.map((item) => {
            const active = item.primary.id === selectedId;
            const style = {
              "--w": `${item.width}px`,
              "--h": `${item.height}px`,
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
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", item.primary.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onReorder(event.dataTransfer.getData("text/plain"), item.primary.id);
                }}
                onClick={() => setSelectedId(active ? null : item.primary.id)}
              >
                <div className="face spine-face">
                  <span className="spine-title">{item.primary.title}</span>
                </div>
                <div className="face cover-front">
                  {item.primary.cover_image_data_url ? (
                    <img className="shelf-cover-image" src={item.primary.cover_image_data_url} alt="" />
                  ) : (
                    <>
                      <span className="cover-title">{item.primary.title}</span>
                      <span className="cover-author">{item.primary.shelf_author || "kaampi Write"}</span>
                    </>
                  )}
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

      {selected ? (
        <div className="shelf-info-card">
          <div className="shelf-info-head">
            <strong className="shelf-info-title">{selected.primary.title}</strong>
            <button
              type="button"
              className="gear-button"
              aria-label={m.shelfEdit.settingsLabel}
              onClick={() => setEditingId(selected.primary.id)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.07 7.07 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.63 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.05.3-.08.62-.08.94s.02.64.07.94L2.75 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.42.33.6.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.58-.24 1.12-.56 1.62-.94l2.39.96c.24.1.5 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.02-1.56ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
                />
              </svg>
            </button>
          </div>
          {selectedSeriesTitle && selectedSeriesId ? (
            <button
              type="button"
              className="book-language-tag book-language-tag-button"
              onClick={() => onOpenSeries(selectedSeriesId, selected.primary.id)}
            >
              {format(m.home.seriesTag, { series: selectedSeriesTitle })}
            </button>
          ) : null}
          {selected.primary.shelf_author ? <span className="shelf-info-author">{selected.primary.shelf_author}</span> : null}
          {selected.primary.shelf_description ? <p className="shelf-info-description">{selected.primary.shelf_description}</p> : null}
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
        </div>
      ) : null}

      {editing ? (
        <ShelfSettingsDialog
          title={editing.primary.title}
          cover={editing.primary.cover_image_data_url ? { thumbDataUrl: editing.primary.cover_image_data_url, imageDataUrl: editing.primary.cover_image_data_url } : undefined}
          shelfColor={editing.primary.shelf_color}
          shelfHeightAdjust={editing.primary.shelf_height_adjust ?? 0}
          shelfAuthor={editing.primary.shelf_author ?? ""}
          shelfDescription={editing.primary.shelf_description ?? ""}
          chapterCount={editing.primary.chapterCount}
          factCount={editing.primary.factCount}
          onOpen={() => {
            setEditingId(null);
            onOpen(editing.primary.id);
          }}
          onDelete={() => {
            setEditingId(null);
            setSelectedId(null);
            onDelete(editing.primary.id);
          }}
          onSave={(patch) => onUpdateSettings(editing.primary.id, patch)}
          onClose={() => setEditingId(null)}
        />
      ) : null}
    </div>
  );
}
