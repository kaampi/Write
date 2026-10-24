import { z } from "zod";
import { newId, nowIso } from "./ids";
import { NarrativeFactSchema } from "./NarrativeFact";
import { BrainstormNoteSchema } from "./BookSchema";
import { ensureBrainstormNotes } from "./brainstormNotes";

/**
 * The level above a Book — a series' own world/lore, written once and
 * meant to live across every book set in it, rather than copied
 * book-to-book (see seriesImport.ts for that older, file-based path,
 * still useful for an already-written sequel or someone else's bible).
 * Deliberately has no chapters/scenes of its own: only a Book writes
 * prose. Same brainstorm → synopsis → extracted-facts shape as a Book
 * (`brainstorm`/`brainstorm_notes`/`synopsis`/`facts`), so building a
 * series' foundation works exactly like building a book's — just one
 * level up, before any book in it exists.
 */
export const SeriesSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Private scratch before (and beside) a synopsis. Draft never reads this. */
  brainstorm: z.string().default(""),
  /** Free notes on the Brainstorm surface. The running `brainstorm` string stays in sync for prompts and find. */
  brainstorm_notes: z.array(BrainstormNoteSchema).default([]),
  /** Short-form world pitch. A writing map for the series' own facts, not locked canon itself. */
  synopsis: z.string().default(""),
  /** The series' own locked/proposed facts — canon every book in the series inherits. */
  facts: z.array(NarrativeFactSchema).default([]),
  created_at: z.string().min(1),
  updated_at: z.string().min(1)
});
export type Series = z.infer<typeof SeriesSchema>;

export const SeriesSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  factCount: z.number().int().nonnegative(),
  bookCount: z.number().int().nonnegative(),
  updated_at: z.string().min(1)
});
export type SeriesSummary = z.infer<typeof SeriesSummarySchema>;

export function parseSeries(input: unknown): Series {
  return ensureBrainstormNotes(SeriesSchema.parse(input));
}

export function createSeries(title: string): Series {
  const trimmed = title.trim() || "Untitled series";
  const timestamp = nowIso();
  return {
    id: newId(),
    title: trimmed,
    brainstorm: "",
    brainstorm_notes: [],
    synopsis: "",
    facts: [],
    created_at: timestamp,
    updated_at: timestamp
  };
}

export function touchSeries(series: Series, patch: Partial<Series>): Series {
  return { ...series, ...patch, updated_at: nowIso() };
}

/** `bookCount` isn't on `Series` itself (books point at it, not the reverse) — the caller supplies it from whatever book list it already has on hand. */
export function summarizeSeries(series: Series, bookCount: number): SeriesSummary {
  return {
    id: series.id,
    title: series.title,
    factCount: series.facts.filter((fact) => fact.superseded_by === undefined && fact.status === "locked").length,
    bookCount,
    updated_at: series.updated_at
  };
}
