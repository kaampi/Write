import type { Book, Chapter } from "./BookSchema";
import { chapterScenes, type BookScene } from "./bookScene";
import { plotlinesForChapter } from "./plotlines";
import { timelineEntries } from "./timeline";
import { proseChapters } from "./proofread";
import { recoverJsonObject } from "./extractFacts";
import { newId, nowIso } from "./ids";
import {
  DEVELOPMENTAL_STAGES,
  PACING_ASSESSMENTS,
  SCENE_FUNCTIONS,
  TENSION_DELTAS,
  THREAD_STATUSES,
  type ChapterRead,
  type DevelopmentalConcern,
  type DevelopmentalJob,
  type DevelopmentalReport,
  type PacingAssessment,
  type SceneFunction,
  type SceneRead,
  type TensionDelta,
  type ThreadStatus
} from "./developmentalSchema";

export {
  DEVELOPMENTAL_STAGES,
  type ChapterRead,
  type DevelopmentalConcern,
  type DevelopmentalJob,
  type DevelopmentalReport,
  type SceneRead
};
export type { DevelopmentalStage, DevelopmentalStatus } from "./developmentalSchema";

export function startDevelopmentalJob(): DevelopmentalJob {
  const stamp = nowIso();
  return {
    id: newId(),
    started_at: stamp,
    updated_at: stamp,
    status: "running",
    stage: "scene",
    sceneDone: [],
    chapterDone: [],
    sceneReads: [],
    chapterReads: [],
    detail: ""
  };
}

export function touchDevelopmental(job: DevelopmentalJob, patch: Partial<DevelopmentalJob>): DevelopmentalJob {
  return { ...job, ...patch, updated_at: nowIso() };
}

/** True once every live chapter has at least one Plotline tagged — grounds the pre-run hint that an untagged manuscript still works, just coarser (roadmap-ideas.md #14 discussion). */
export function hasAnyTaggedThread(book: Book): boolean {
  return proseChapters(book).some((chapter) => plotlinesForChapter(book, chapter).length > 0);
}

export function developmentalPercent(job: DevelopmentalJob, sceneCount: number, chapterCount: number): number {
  if (job.status === "done" || job.stage === "done") return 100;
  const scenes = Math.max(1, sceneCount);
  const chapters = Math.max(1, chapterCount);
  if (job.stage === "scene") {
    return Math.round((job.sceneDone.length / scenes) * 55);
  }
  if (job.stage === "chapter") {
    return 55 + Math.round((job.chapterDone.length / chapters) * 35);
  }
  return 90;
}

export const SCENE_READ_SYSTEM = `You read one scene from a novel manuscript as a developmental editor — judging its structural role, not its line-level prose quality.
Return JSON only: {"function":"advance_plot"|"reveal_character"|"build_world"|"breather"|"other","tension":"rises"|"falls"|"flat","note":"..."}
"function" is the scene's primary job in the story, whichever single one is strongest. "tension" is how the stakes or dramatic pressure in this scene compare to right before it. "note" is one sentence flagging a real structural concern — the scene doesn't earn its place, repeats information already established, or drags without moving anything forward. Leave "note" empty ("") when the scene is doing its job.`;

export function sceneReadUserPrompt(book: Book, chapter: Chapter, scene: BookScene): string {
  const threads = plotlinesForChapter(book, chapter);
  const entry = timelineEntries(book).find((item) => item.chapterId === chapter.id);
  const parts = [
    `Manuscript: ${book.title}`,
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}, scene ${scene.sequence_index + 1}`,
    entry?.outOfOrder ? "This chapter is a flashback or flash-forward relative to the manuscript's story-time order." : "",
    threads.length > 0 ? `Threads this chapter is tagged with: ${threads.map((thread) => thread.title).join(", ")}` : "",
    `Scene text:\n${scene.prose.trim()}`
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function parseSceneRead(raw: string): { function: SceneFunction; tension: TensionDelta; note: string } | null {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as Record<string, unknown>;
  const fn = typeof rec.function === "string" && (SCENE_FUNCTIONS as readonly string[]).includes(rec.function) ? (rec.function as SceneFunction) : "other";
  const tension = typeof rec.tension === "string" && (TENSION_DELTAS as readonly string[]).includes(rec.tension) ? (rec.tension as TensionDelta) : "flat";
  const note = typeof rec.note === "string" ? rec.note.trim() : "";
  return { function: fn, tension, note };
}

export const CHAPTER_SYNTHESIS_SYSTEM = `You synthesize a chapter's role in a novel's overall structure from the scene-by-scene reads already made for it and the threads tagged to this chapter — not from the chapter's raw prose.
Return JSON only: {"pacing":"too_slow"|"right_pace"|"too_fast","tension":"rises"|"falls"|"flat","threads":[{"thread":"<exact thread name from the list given>","status":"advanced"|"stalled"|"resolved"}],"note":"..."}
"pacing" judges this chapter's momentum against a well-paced novel in general, not against the other chapters of this manuscript. "tension" compares the chapter's end to its start. For "threads", include an entry for every thread name listed below, exactly as spelled — "advanced" if the chapter moves it forward, "stalled" if it's tagged but doesn't move, "resolved" if the chapter pays it off. "note" is one or two sentences on the chapter's structural role and any real concern — empty ("") if none.`;

export function chapterSynthesisUserPrompt(book: Book, chapter: Chapter, sceneReads: SceneRead[]): string {
  const threads = plotlinesForChapter(book, chapter);
  const sceneLines = sceneReads.map(
    (read, index) => `Scene ${index + 1}: function ${read.function}, tension ${read.tension}${read.note ? `, note: ${read.note}` : ""}`
  );
  const parts = [
    `Manuscript: ${book.title}`,
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}`,
    threads.length > 0 ? `Threads tagged to this chapter: ${threads.map((thread) => thread.title).join(", ")}` : "No threads tagged to this chapter.",
    `Scene reads:\n${sceneLines.join("\n")}`
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function parseChapterSynthesis(
  raw: string,
  taggedThreads: { id: string; title: string }[]
): { pacing: PacingAssessment; tension: TensionDelta; threads: { plotlineId: string; status: ThreadStatus }[]; note: string } | null {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as Record<string, unknown>;
  const pacing = typeof rec.pacing === "string" && (PACING_ASSESSMENTS as readonly string[]).includes(rec.pacing) ? (rec.pacing as PacingAssessment) : "right_pace";
  const tension = typeof rec.tension === "string" && (TENSION_DELTAS as readonly string[]).includes(rec.tension) ? (rec.tension as TensionDelta) : "flat";
  const note = typeof rec.note === "string" ? rec.note.trim() : "";
  const byTitle = new Map(taggedThreads.map((thread) => [thread.title.trim().toLowerCase(), thread.id]));
  const rows = Array.isArray(rec.threads) ? rec.threads : [];
  const threads: { plotlineId: string; status: ThreadStatus }[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const entry = row as Record<string, unknown>;
    const title = typeof entry.thread === "string" ? entry.thread.trim().toLowerCase() : "";
    const plotlineId = byTitle.get(title);
    if (!plotlineId) continue;
    const status = typeof entry.status === "string" && (THREAD_STATUSES as readonly string[]).includes(entry.status) ? (entry.status as ThreadStatus) : undefined;
    if (!status) continue;
    threads.push({ plotlineId, status });
  }
  return { pacing, tension, threads, note };
}

export const REPORT_SYSTEM = `You write the developmental-editing report for a finished novel manuscript, synthesizing every chapter's already-made structural read — not the manuscript's prose directly.
Return JSON only: {"summary":"...","concerns":[{"chapter":4,"note":"..."}]}
"summary" is a few paragraphs: the manuscript's overall pacing curve, whether tension escalates toward a climax or plateaus, which threads got dropped or never paid off, and the strongest structural issue if there is one. Ground every claim in the chapter reads given below — never invent a plot event or character beat the reads don't mention. "concerns" lists specific chapters worth the author's attention, each with one clear sentence why — an empty array if nothing stands out.`;

export function reportUserPrompt(book: Book, chapterReads: ChapterRead[]): string {
  const chapters = proseChapters(book);
  const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const lines = chapterReads
    .map((read) => {
      const chapter = byId.get(read.chapterId);
      if (!chapter) return null;
      const threads = plotlinesForChapter(book, chapter);
      const byPlotlineId = new Map(threads.map((thread) => [thread.id, thread.title]));
      const threadBits = read.threads
        .map((entry) => `${byPlotlineId.get(entry.plotlineId) ?? "thread"} ${entry.status}`)
        .join(", ");
      return `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"} — pacing ${read.pacing}, tension ${read.tension}${threadBits ? `, threads: ${threadBits}` : ""}${read.note ? `, note: ${read.note}` : ""}`;
    })
    .filter((line): line is string => line !== null);
  return [`Manuscript: ${book.title}`, `Chapter reads, in order:\n${lines.join("\n")}`].join("\n\n");
}

export function parseDevelopmentalReport(raw: string, book: Book): DevelopmentalReport | null {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as Record<string, unknown>;
  const summary = typeof rec.summary === "string" ? rec.summary.trim() : "";
  if (!summary) return null;
  const chapters = proseChapters(book);
  const rows = Array.isArray(rec.concerns) ? rec.concerns : [];
  const concerns: DevelopmentalConcern[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const entry = row as Record<string, unknown>;
    const n = typeof entry.chapter === "number" ? entry.chapter : Number(entry.chapter);
    const chapter = chapters[n - 1];
    const note = typeof entry.note === "string" ? entry.note.trim() : "";
    if (!chapter || !note) continue;
    concerns.push({ chapterId: chapter.id, note });
  }
  return { summary, concerns };
}
