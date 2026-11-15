import type { Chapter } from "./BookSchema";
import type { ManuscriptPassage } from "./manuscriptReport";
import { countWords, dialogueSpans, wordMatches } from "./proseStats";

export type ParagraphDialogue = {
  words: number;
  spoken: number;
  passage: ManuscriptPassage;
};

export function chapterDialogue(chapter: Pick<Chapter, "id" | "prose">): ParagraphDialogue[] {
  const { prose } = chapter;
  const spans = dialogueSpans(prose);
  const paragraphs: ParagraphDialogue[] = [];
  let spanIndex = 0;

  for (const line of prose.matchAll(/[^\n]+/g)) {
    const words = countWords(line[0]);
    if (!words) continue;
    const firstWord = wordMatches(line[0]).next().value!;
    const end = line.index + line[0].length;
    while (spanIndex < spans.length && spans[spanIndex]!.end <= line.index) spanIndex += 1;
    let spoken = 0;
    for (let index = spanIndex; index < spans.length && spans[index]!.start < end; index++) {
      const span = spans[index]!;
      spoken += countWords(prose.slice(Math.max(line.index, span.start), Math.min(end, span.end)));
    }
    paragraphs.push({
      words,
      spoken,
      passage: {
        chapterId: chapter.id,
        start: line.index + firstWord.index,
        text: firstWord[0],
        context: line[0].trim()
      }
    });
  }
  return paragraphs;
}
