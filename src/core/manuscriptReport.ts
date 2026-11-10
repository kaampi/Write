import type { Chapter } from "./BookSchema";
import { isEchoContentWord } from "./echoDetect";
import { countDialogueWords, countWords, entityNameTokens, normalizeWord, wordMatches } from "./proseStats";

export type ManuscriptPassage = {
  chapterId: string;
  start: number;
  text: string;
  context: string;
};

const PHRASE_WORDS = 4;
const NEARBY_WORDS = 120;
const MAX_FINDINGS = 5;
const MIN_CHAPTER_WORDS = 100;
const MIN_DIALOGUE_SHIFT = 10;

export function summarizeChapterLengths(chapters: readonly { words: number }[]) {
  const lengths = chapters.map(({ words }) => words).sort((a, b) => a - b);
  const shortest = lengths[0];
  const longest = lengths.at(-1);
  if (shortest === undefined || longest === undefined) return undefined;
  const middle = Math.floor(lengths.length / 2);
  const median = (lengths[Math.floor((lengths.length - 1) / 2)]! + lengths[middle]!) / 2;
  return { shortest, longest, median };
}

export function manuscriptReport(chapters: Pick<Chapter, "id" | "title" | "prose">[], names: string[]) {
  const nameTokens = entityNameTokens(names);
  const recent = new Map<string, { wordIndex: number; passage: ManuscriptPassage }>();
  const reported = new Set<string>();
  const repetitions: [ManuscriptPassage, ManuscriptPassage][] = [];
  let wordIndex = 0;
  let lastReportedIndex = -PHRASE_WORDS;
  const dialogue = chapters.flatMap((chapter, index) => {
    const words = countWords(chapter.prose);
    if (!words) return [];
    const spoken = countDialogueWords(chapter.prose);
    if (repetitions.length < MAX_FINDINGS) {
      for (const paragraph of chapter.prose.matchAll(/[^\r\n]+/g)) {
        const tokens = Array.from(wordMatches(paragraph[0]), (match) => ({
          start: match.index,
          end: match.index + match[0].length,
          word: normalizeWord(match[0])
        }));
        for (let index = 0; index + PHRASE_WORDS <= tokens.length; index++) {
          const run = tokens.slice(index, index + PHRASE_WORDS);
          const continuous = run.slice(1).every((token, offset) =>
            /^[ \t]+$/.test(paragraph[0].slice(run[offset]!.end, token.start))
          );
          if (!continuous || run.filter((token) => isEchoContentWord(token.word, nameTokens)).length < 2) continue;
          const start = run[0]!.start;
          const end = run[PHRASE_WORDS - 1]!.end;
          const key = run.map((token) => token.word).join(" ");
          const position = wordIndex + index;
          const previous = recent.get(key);
          const passage = {
            chapterId: chapter.id,
            start: paragraph.index + start,
            text: paragraph[0].slice(start, end),
            context: paragraph[0].slice(Math.max(0, start - 55), end + 55).trim()
          };
          if (previous) {
            const distance = position - previous.wordIndex;
            if (distance >= PHRASE_WORDS && distance <= NEARBY_WORDS &&
              position - lastReportedIndex >= PHRASE_WORDS && !reported.has(key)) {
              repetitions.push([previous.passage, passage]);
              reported.add(key);
              lastReportedIndex = position;
            }
          }
          recent.set(key, { wordIndex: position, passage });
          if (repetitions.length === MAX_FINDINGS) break;
        }
        wordIndex += tokens.length;
        if (repetitions.length === MAX_FINDINGS) break;
      }
    }
    return [{ id: chapter.id, index, words, spoken, share: Math.round(100 * spoken / words) }];
  });
  let dialogueShift: { from: typeof dialogue[number]; to: typeof dialogue[number]; difference: number } | undefined;
  for (let index = 1; index < dialogue.length; index++) {
    const from = dialogue[index - 1]!;
    const to = dialogue[index]!;
    if (to.index !== from.index + 1 || Math.min(from.words, to.words) < MIN_CHAPTER_WORDS) continue;
    const difference = Math.abs(to.share - from.share);
    if (difference >= MIN_DIALOGUE_SHIFT && difference > (dialogueShift?.difference ?? 0)) {
      dialogueShift = { from, to, difference };
    }
  }
  return {
    dialogue,
    dialogueShift,
    repetitions,
    words: dialogue.reduce((sum, chapter) => sum + chapter.words, 0),
    spoken: dialogue.reduce((sum, chapter) => sum + chapter.spoken, 0)
  };
}
