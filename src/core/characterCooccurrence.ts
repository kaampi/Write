import type { Chapter } from "./BookSchema";
import { trackedMentionMatcher } from "./bibleMentions";
import { chapterScenes } from "./bookScene";
import { trackingFor, type EntityTracking } from "./entityTracking";
import { splitFlowParagraphsWithOffsets } from "./proseFlow";
import { countWords } from "./proseStats";

export type CharacterNode = {
  entityRef: string;
  entityLabel: string;
  /** Scenes (not just chapters) where this character's name is mentioned at least once. */
  scenesMentioned: number;
};

export type CharacterPair = {
  a: string;
  b: string;
  /** Jaccard overlap of the two characters' scene sets — 1 if they never appear without each other, 0 if never together. */
  together: number;
  scenesTogether: number;
};

export type CharacterCooccurrence = {
  nodes: CharacterNode[];
  pairs: CharacterPair[];
};

type CharacterInput = { entity_ref: string; entity_label: string };

/** Caps the pair list for a very large cast, so the network stays readable and cheap to lay out. */
const MAX_PAIRS = 60;

/**
 * Which characters share a scene, independent of whether they actually
 * speak to each other — Mats: "Ska man lägga till när karaktärer finns i
 * samma scen (oavsett om de pratar med varandra)?" Reuses the same name
 * matching Story Bible already trusts (trackedMentionMatcher) and the same
 * scene-boundary walk manuscriptCharacterMentions.ts uses, just recording
 * which scenes a name appears in rather than every individual mention.
 * "Thinks of each other" is a separate, not-yet-built signal (needs a
 * lexicon of interiority phrases) — this only covers shared presence.
 */
export function characterCooccurrence(chapters: Chapter[], characters: CharacterInput[], tracking: EntityTracking[]): CharacterCooccurrence {
  const sceneKeysByEntity = new Map<string, Set<string>>();

  for (const character of characters) {
    const findMentions = trackedMentionMatcher(character.entity_label, trackingFor(tracking, character.entity_ref));
    const keys = new Set<string>();
    for (const chapter of chapters) {
      const scenes = chapterScenes(chapter);
      const paragraphs = splitFlowParagraphsWithOffsets(chapter.prose);
      const matches = findMentions(chapter.prose);
      let cursor = 0;
      for (const [index, scene] of scenes.entries()) {
        const nextScene = scenes[index + 1];
        const end = nextScene ? paragraphs[nextScene.startParagraph]?.start ?? chapter.prose.length : chapter.prose.length;
        if (countWords(scene.prose) === 0) continue;
        let hit = false;
        while (cursor < matches.length && (matches[cursor]?.start ?? Infinity) < end) {
          hit = true;
          cursor += 1;
        }
        if (hit) keys.add(`${chapter.id}:${scene.sequence_index}`);
      }
    }
    sceneKeysByEntity.set(character.entity_ref, keys);
  }

  const nodes: CharacterNode[] = characters.map((c) => ({
    entityRef: c.entity_ref,
    entityLabel: c.entity_label,
    scenesMentioned: sceneKeysByEntity.get(c.entity_ref)?.size ?? 0
  }));

  const pairs: CharacterPair[] = [];
  for (let i = 0; i < characters.length; i += 1) {
    for (let j = i + 1; j < characters.length; j += 1) {
      const a = characters[i];
      const b = characters[j];
      if (!a || !b) continue;
      const keysA = sceneKeysByEntity.get(a.entity_ref) ?? new Set<string>();
      const keysB = sceneKeysByEntity.get(b.entity_ref) ?? new Set<string>();
      let together = 0;
      for (const key of keysA) if (keysB.has(key)) together += 1;
      if (together === 0) continue;
      const union = keysA.size + keysB.size - together;
      pairs.push({ a: a.entity_ref, b: b.entity_ref, together: union > 0 ? together / union : 0, scenesTogether: together });
    }
  }
  pairs.sort((x, y) => y.together - x.together);
  return { nodes, pairs: pairs.slice(0, MAX_PAIRS) };
}
