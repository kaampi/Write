import type { Chapter } from "./BookSchema";
import { trackedMentionMatcher } from "./bibleMentions";
import { chapterScenes } from "./bookScene";
import type { EntityTracking } from "./entityTracking";
import { snippetAround } from "./findReplace";
import type { ManuscriptPassage } from "./manuscriptReport";
import { splitFlowParagraphsWithOffsets } from "./proseFlow";
import { countWords } from "./proseStats";

export type CharacterSceneMention = {
  sceneIndex: number;
  sceneTitle?: string;
  count: number;
  passage: ManuscriptPassage;
};

export function manuscriptCharacterMentions(chapters: Chapter[], label: string, tracking: EntityTracking) {
  const findMentions = trackedMentionMatcher(label, tracking);
  const hits: CharacterSceneMention[] = [];
  let gap: { before: CharacterSceneMention; after: CharacterSceneMention; scenes: number } | undefined;
  let scenesSinceMention = 0;

  for (const chapter of chapters) {
    const scenes = chapterScenes(chapter);
    const paragraphs = splitFlowParagraphsWithOffsets(chapter.prose);
    const matches = findMentions(chapter.prose);
    let cursor = 0;
    for (const [index, scene] of scenes.entries()) {
      const nextScene = scenes[index + 1];
      const end = nextScene ? paragraphs[nextScene.startParagraph]?.start ?? chapter.prose.length : chapter.prose.length;
      const first = matches[cursor];
      const startCursor = cursor;
      while (cursor < matches.length && matches[cursor]!.start < end) cursor += 1;
      if (countWords(scene.prose) === 0) continue;
      if (!first || startCursor === cursor) {
        scenesSinceMention += 1;
        continue;
      }
      const start = paragraphs[scene.startParagraph]?.start ?? 0;
      const hit: CharacterSceneMention = {
        sceneIndex: scene.sequence_index,
        ...(scene.title ? { sceneTitle: scene.title } : {}),
        count: cursor - startCursor,
        passage: {
          chapterId: chapter.id,
          start: first.start,
          text: chapter.prose.slice(first.start, first.end),
          context: snippetAround(chapter.prose.slice(start, end), first.start - start, first.end - start)
        }
      };
      const before = hits.at(-1);
      if (before && scenesSinceMention >= 2 && scenesSinceMention > (gap?.scenes ?? 0)) {
        gap = { before, after: hit, scenes: scenesSinceMention };
      }
      hits.push(hit);
      scenesSinceMention = 0;
    }
  }
  return { hits, gap };
}
