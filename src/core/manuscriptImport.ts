export type ImportedChapterCandidate = {
  title: string;
  prose: string;
};

export type ImportedManuscript = {
  title: string;
  chapters: ImportedChapterCandidate[];
};

const HEADING_LINE = /^(#{1,6})[ \t]+(.+)$/gm;

type Heading = { level: number; title: string; start: number; end: number };

function findHeadings(text: string): Heading[] {
  const headings: Heading[] = [];
  for (const match of text.matchAll(HEADING_LINE)) {
    headings.push({
      level: match[1]!.length,
      title: match[2]!.trim(),
      start: match.index!,
      end: match.index! + match[0].length
    });
  }
  return headings;
}

/**
 * Counts how many headings exist at each level (1-6) in the document — the
 * raw signal `suggestChapterHeadingLevel` and the import UI's level picker
 * both read from, so a heading-structure preview and the auto-pick always
 * agree on what's actually in the file.
 */
export function headingLevelCounts(text: string): Map<number, number> {
  const counts = new Map<number, number>();
  for (const heading of findHeadings(text)) {
    counts.set(heading.level, (counts.get(heading.level) ?? 0) + 1);
  }
  return counts;
}

/**
 * Guesses which heading level marks chapter boundaries in an imported
 * manuscript — genuinely a guess, since no two writing tools' Markdown
 * exports agree on this (an "Act" wrapper, if present, usually outranks
 * chapters by one level; scene subtitles, if present, usually sit one level
 * below). Picks the level with the most headings (chapters should vastly
 * outnumber acts, and most chapters won't have a scene subtitle at all),
 * tie-breaking toward the shallower level. The import UI always shows this
 * as an adjustable starting point with a live chapter-count preview, never
 * a silent final answer — wrong guesses are cheap to notice and fix there.
 */
export function suggestChapterHeadingLevel(text: string): number {
  const counts = headingLevelCounts(text);
  let best: { level: number; count: number } | null = null;
  for (const [level, count] of counts) {
    if (!best || count > best.count || (count === best.count && level < best.level)) {
      best = { level, count };
    }
  }
  return best?.level ?? 1;
}

/**
 * Splits a Markdown manuscript into chapter candidates at a given heading
 * level. Headings shallower than or equal to that level always end the
 * current chapter (so an "Act" wrapper above the chosen level doesn't get
 * folded into the previous chapter's prose); headings deeper than it stay
 * inside the chapter body as plain text (hash markers stripped) rather than
 * becoming their own chapters — the common shape for a scene subtitle.
 * Text before the first matching heading becomes a leading untitled
 * chapter rather than being silently dropped, same convention
 * `splitLoreArticles` already uses for a preamble.
 */
export function splitMarkdownIntoChapters(text: string, level: number): ImportedChapterCandidate[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const headings = findHeadings(normalized).filter((heading) => heading.level <= level);
  const chapters: ImportedChapterCandidate[] = [];

  function segmentText(start: number, end: number): string {
    return stripHeadingMarkers(normalized.slice(start, end)).trim();
  }

  // Text before the first heading — likely front matter (a prologue, an
  // epigraph) rather than throwaway structural noise — becomes its own
  // leading untitled chapter, same convention `splitLoreArticles` already
  // uses for a preamble: never silently merged into whatever chapter
  // happens to come next.
  const preamble = segmentText(0, headings[0]?.start ?? normalized.length);
  if (preamble) chapters.push({ title: "", prose: preamble });

  // A heading shallower than `level` found AFTER that point (e.g. an Act
  // title with no chapter of its own) is a different case: clearly
  // structural wrapping between two real chapters, not front matter, so it
  // folds forward into the next chapter-level heading's prose instead of
  // becoming a spurious almost-empty chapter of its own.
  let pendingPrefix = "";

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]!;
    const bodyStart = heading.end;
    const bodyEnd = i + 1 < headings.length ? headings[i + 1]!.start : normalized.length;
    const body = segmentText(bodyStart, bodyEnd);
    if (heading.level === level) {
      chapters.push({ title: heading.title, prose: [pendingPrefix, body].filter(Boolean).join("\n\n") });
      pendingPrefix = "";
    } else {
      pendingPrefix = [pendingPrefix, heading.title, body].filter(Boolean).join("\n\n");
    }
  }
  if (pendingPrefix) chapters.push({ title: "", prose: pendingPrefix });
  return chapters;
}

function stripHeadingMarkers(text: string): string {
  return text.replace(/^#{1,6}[ \t]+/gm, "");
}
