import type { BookSummary } from "./BookSchema";
import type { Series } from "./SeriesSchema";

/**
 * The series-level equivalent of timeline.ts's book-level Timeline — same
 * "reading order vs story-time order, flag when they differ" shape, one
 * level up. Here "reading order" is each book's `created_at` order (the
 * closest real equivalent of a chapter's `sequence_index` — the order the
 * books actually came into being), and "story time" is the author's own
 * `book_order` override (a prequel can be dragged ahead of the book it
 * was written after). Display only — see SeriesSchema.ts's `book_order`
 * doc comment: this does not gate which facts a book inherits.
 */
export type SeriesTimelineEntry = {
  bookId: string;
  bookTitle: string;
  /** Position in the series' own book_order (or the created_at fallback when book_order doesn't mention this book). */
  storyTimeRank: number;
  /** True when this book's story-time position differs from its created_at position. */
  outOfOrder: boolean;
};

/** Every book in the series, `created_at` ascending — the natural fallback order before any author override. */
function byCreatedAt(books: BookSummary[]): BookSummary[] {
  return [...books].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

/**
 * `series.book_order` filtered down to books still actually in the series,
 * with any book not yet mentioned there (new, or book_order was never set)
 * appended in `created_at` order — the same "ordered array, re-synced
 * against current reality" idea as timeline.ts's own reordering.
 */
export function effectiveBookOrder(series: Series, books: BookSummary[]): BookSummary[] {
  const byId = new Map(books.map((book) => [book.id, book]));
  const ordered: BookSummary[] = [];
  for (const id of series.book_order) {
    const book = byId.get(id);
    if (book && !ordered.includes(book)) ordered.push(book);
  }
  for (const book of byCreatedAt(books)) {
    if (!ordered.includes(book)) ordered.push(book);
  }
  return ordered;
}

/** The Series Timeline: every book in its effective story-time order, flagged when that differs from `created_at` order. */
export function seriesTimelineEntries(series: Series, books: BookSummary[]): SeriesTimelineEntry[] {
  const createdRank = new Map(byCreatedAt(books).map((book, index) => [book.id, index]));
  return effectiveBookOrder(series, books).map((book, index) => ({
    bookId: book.id,
    bookTitle: book.title,
    storyTimeRank: index,
    outOfOrder: createdRank.get(book.id) !== index
  }));
}

/**
 * Swaps a book with its story-time neighbor and returns a fresh, complete
 * `book_order` (every book in the series, in its new order) — the only
 * place that field is ever written, same role as timeline.ts's
 * `moveStoryTimeOrder` has for `story_time_order`.
 */
export function moveSeriesBookOrder(series: Series, bookId: string, direction: "up" | "down", books: BookSummary[]): string[] {
  const ordered = effectiveBookOrder(series, books);
  const index = ordered.findIndex((book) => book.id === bookId);
  if (index < 0) return series.book_order;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ordered.length) return series.book_order;

  const reordered = [...ordered];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith]!, reordered[index]!];
  return reordered.map((book) => book.id);
}
