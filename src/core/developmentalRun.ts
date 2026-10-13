import type { Book } from "./BookSchema";
import { chapterScenes } from "./bookScene";
import { plotlinesForChapter } from "./plotlines";
import { proseChapters } from "./proofread";
import {
  CHAPTER_SYNTHESIS_SYSTEM,
  REPORT_SYSTEM,
  SCENE_READ_SYSTEM,
  chapterSynthesisUserPrompt,
  parseChapterSynthesis,
  parseDevelopmentalReport,
  parseSceneRead,
  reportUserPrompt,
  sceneReadUserPrompt,
  touchDevelopmental,
  type DevelopmentalJob
} from "./developmental";

export type DevelopmentalIO = {
  complete: (system: string, user: string, signal: AbortSignal) => Promise<string>;
  getBook: () => Book;
  save: (job: DevelopmentalJob) => Promise<void>;
};

export async function runDevelopmental(job: DevelopmentalJob, io: DevelopmentalIO, signal: AbortSignal): Promise<DevelopmentalJob> {
  let current = job;
  current = await runScenes(current, io, signal);
  current = await runChapters(current, io, signal);
  current = await runReport(current, io, signal);
  current = touchDevelopmental(current, { status: "done", stage: "done", detail: "" });
  await io.save(current);
  return current;
}

async function runScenes(job: DevelopmentalJob, io: DevelopmentalIO, signal: AbortSignal): Promise<DevelopmentalJob> {
  let current = job;
  if (current.stage !== "scene") return current;
  current = touchDevelopmental(current, { stage: "scene", status: "running" });
  const book = io.getBook();
  for (const chapter of proseChapters(book)) {
    for (const scene of chapterScenes(chapter)) {
      throwIfAborted(signal);
      if (current.sceneDone.includes(scene.id)) continue;
      current = touchDevelopmental(current, { detail: `scene:${chapter.sequence_index + 1}:${scene.sequence_index + 1}` });
      await io.save(current);
      const raw = await io.complete(SCENE_READ_SYSTEM, sceneReadUserPrompt(book, chapter, scene), signal);
      const parsed = parseSceneRead(raw);
      const sceneReads = parsed
        ? [...current.sceneReads, { chapterId: chapter.id, sceneId: scene.id, ...parsed }]
        : current.sceneReads;
      current = touchDevelopmental(current, { sceneReads, sceneDone: [...current.sceneDone, scene.id] });
      await io.save(current);
    }
  }
  return touchDevelopmental(current, { stage: "chapter" });
}

async function runChapters(job: DevelopmentalJob, io: DevelopmentalIO, signal: AbortSignal): Promise<DevelopmentalJob> {
  let current = job;
  if (current.stage !== "chapter") return current;
  current = touchDevelopmental(current, { stage: "chapter", status: "running" });
  const book = io.getBook();
  for (const chapter of proseChapters(book)) {
    throwIfAborted(signal);
    if (current.chapterDone.includes(chapter.id)) continue;
    current = touchDevelopmental(current, { detail: `chapter:${chapter.sequence_index + 1}` });
    await io.save(current);
    const sceneReads = current.sceneReads.filter((read) => read.chapterId === chapter.id);
    const taggedThreads = plotlinesForChapter(book, chapter);
    const raw = await io.complete(CHAPTER_SYNTHESIS_SYSTEM, chapterSynthesisUserPrompt(book, chapter, sceneReads), signal);
    const parsed = parseChapterSynthesis(raw, taggedThreads);
    const chapterReads = parsed
      ? [...current.chapterReads, { chapterId: chapter.id, ...parsed }]
      : current.chapterReads;
    current = touchDevelopmental(current, { chapterReads, chapterDone: [...current.chapterDone, chapter.id] });
    await io.save(current);
  }
  return touchDevelopmental(current, { stage: "report" });
}

async function runReport(job: DevelopmentalJob, io: DevelopmentalIO, signal: AbortSignal): Promise<DevelopmentalJob> {
  let current = job;
  if (current.stage !== "report") return current;
  throwIfAborted(signal);
  current = touchDevelopmental(current, { stage: "report", status: "running", detail: "report" });
  await io.save(current);
  const book = io.getBook();
  const raw = await io.complete(REPORT_SYSTEM, reportUserPrompt(book, current.chapterReads), signal);
  const report = parseDevelopmentalReport(raw, book) ?? { summary: "", concerns: [] };
  return touchDevelopmental(current, { report });
}

function throwIfAborted(signal: AbortSignal): void {
  if (!signal.aborted) return;
  const error = new Error("Aborted");
  error.name = "AbortError";
  throw error;
}
