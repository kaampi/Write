import type { Book, Chapter, ChapterContextRef } from "./BookSchema";
import { sortedChapters } from "./BookSchema";
import { chapterChoiceLabel, earlierChapters } from "./continuesFrom";
import { chapterScenes, type BookScene } from "./bookScene";

/**
 * Chapters this chapter could pin as extra context (roadmap-ideas.md #44) —
 * earlier chapters only, same restriction `continues_from`'s strand picker
 * already uses, and only ones with actual prose: attaching an empty chapter
 * has nothing to give the model. A later chapter isn't offered either —
 * nothing written there yet to attach, by definition of "later".
 */
export function attachableChapters(chapters: Chapter[], chapter: Chapter): Chapter[] {
  return earlierChapters(chapters, chapter).filter((item) => item.prose.trim());
}

/** A chapter's scenes worth offering in the picker once it's chosen — same emptiness filter as attachableChapters, scene by scene. */
export function attachableScenes(chapter: Chapter): BookScene[] {
  return chapterScenes(chapter).filter((scene) => scene.prose.trim());
}

export function sceneChoiceLabel(scene: BookScene): string {
  return scene.title ? `Scene ${scene.sequence_index + 1}: ${scene.title}` : `Scene ${scene.sequence_index + 1}`;
}

export type ResolvedContextRef = {
  ref: ChapterContextRef;
  chapter: Chapter;
  scene?: BookScene;
  label: string;
  prose: string;
};

/**
 * Resolves `chapter.context_refs` against the manuscript's current live
 * chapters/scenes (same `chapters: Chapter[]` shape `earlierChapters` takes
 * — the Editor already has that list at hand without needing the whole
 * Book), dropping anything that no longer exists or has gone empty. A
 * discarded chapter is already stripped out of every context_refs list by
 * BookSchema's clearPointersTo; this covers what that can't catch by
 * construction — a scene merged away by a later re-split, or a chapter
 * emptied out after being pinned — the same silent-skip-what's-gone
 * handling every other reference in this schema gets, not a special case.
 */
export function resolveContextRefs(chapters: Chapter[], chapter: Chapter): ResolvedContextRef[] {
  const byId = new Map(chapters.map((item) => [item.id, item]));
  const out: ResolvedContextRef[] = [];
  for (const ref of chapter.context_refs) {
    const refChapter = byId.get(ref.chapter_id);
    if (!refChapter) continue;
    if (ref.scene_id) {
      const scene = chapterScenes(refChapter).find((item) => item.id === ref.scene_id);
      if (!scene || !scene.prose.trim()) continue;
      out.push({
        ref,
        chapter: refChapter,
        scene,
        label: `${chapterChoiceLabel(refChapter)} — ${sceneChoiceLabel(scene)}`,
        prose: scene.prose.trim()
      });
    } else {
      if (!refChapter.prose.trim()) continue;
      out.push({ ref, chapter: refChapter, label: chapterChoiceLabel(refChapter), prose: refChapter.prose.trim() });
    }
  }
  return out;
}

/**
 * Prompt block for Draft/Recast — the author's own curated attachments, in
 * full, not `formatStorySoFar`'s one-line-per-chapter summary. Exists for
 * what a summary loses: the exact wording a place or character was first
 * described in, not just the fact that it happened. Empty whenever nothing
 * is pinned (or everything pinned has since gone stale), same
 * silent-when-unset pattern as every other optional prompt block in
 * generateProse.ts.
 */
export function formatAttachedContextForPrompt(book: Book, chapter: Chapter): string {
  const resolved = resolveContextRefs(sortedChapters(book), chapter);
  if (resolved.length === 0) return "";
  const blocks = resolved.map((item) => `${item.label}:\n${item.prose}`);
  return `Context the author manually attached for reference — full prose from elsewhere in the manuscript, not canon to repeat verbatim unless it already fits naturally (useful for voice, sensory detail, and how something was first described):\n\n${blocks.join("\n\n")}`;
}

export function addContextRef(refs: ChapterContextRef[], next: ChapterContextRef): ChapterContextRef[] {
  const exists = refs.some((ref) => ref.chapter_id === next.chapter_id && ref.scene_id === next.scene_id);
  return exists ? refs : [...refs, next];
}

export function removeContextRef(refs: ChapterContextRef[], target: ChapterContextRef): ChapterContextRef[] {
  return refs.filter((ref) => !(ref.chapter_id === target.chapter_id && ref.scene_id === target.scene_id));
}
