import { z } from "zod";

/**
 * Whole-manuscript developmental analysis (roadmap-ideas.md #14) — never
 * the whole manuscript in one model call. Three stages, each stage's
 * output feeding the next as condensed, structured data rather than raw
 * prose: scene → chapter → manuscript report. No "act" stage — the
 * author's own earlier call was to skip that layer in v1 (no `Book.acts`
 * concept exists anywhere in this schema) and add it later only if scene
 * → chapter → manuscript proves too coarse on its own.
 */
export const DEVELOPMENTAL_STAGES = ["scene", "chapter", "report"] as const;
export type DevelopmentalStage = (typeof DEVELOPMENTAL_STAGES)[number];

export const DEVELOPMENTAL_STATUSES = ["running", "paused", "done", "error"] as const;
export type DevelopmentalStatus = (typeof DEVELOPMENTAL_STATUSES)[number];

/** A scene's primary job in the story — whichever single one is strongest. */
export const SCENE_FUNCTIONS = ["advance_plot", "reveal_character", "build_world", "breather", "other"] as const;
export type SceneFunction = (typeof SCENE_FUNCTIONS)[number];

/** How the dramatic pressure in a scene/chapter compares to right before it. */
export const TENSION_DELTAS = ["rises", "falls", "flat"] as const;
export type TensionDelta = (typeof TENSION_DELTAS)[number];

/** One scene's structural read — never shown to the author directly, only synthesized upward into the chapter stage. */
export const SceneReadSchema = z.object({
  chapterId: z.string().min(1),
  sceneId: z.string().min(1),
  function: z.enum(SCENE_FUNCTIONS),
  tension: z.enum(TENSION_DELTAS),
  /** One sentence flagging a structural concern — empty when the scene is doing its job. */
  note: z.string()
});
export type SceneRead = z.infer<typeof SceneReadSchema>;

export const PACING_ASSESSMENTS = ["too_slow", "right_pace", "too_fast"] as const;
export type PacingAssessment = (typeof PACING_ASSESSMENTS)[number];

export const THREAD_STATUSES = ["advanced", "stalled", "resolved"] as const;
export type ThreadStatus = (typeof THREAD_STATUSES)[number];

export const ThreadStatusEntrySchema = z.object({
  plotlineId: z.string().min(1),
  status: z.enum(THREAD_STATUSES)
});
export type ThreadStatusEntry = z.infer<typeof ThreadStatusEntrySchema>;

/** One chapter's structural read, synthesized from its own scene reads — never re-reads the chapter's full prose. */
export const ChapterReadSchema = z.object({
  chapterId: z.string().min(1),
  pacing: z.enum(PACING_ASSESSMENTS),
  tension: z.enum(TENSION_DELTAS),
  /** Only threads this chapter is actually tagged with (Plotlines) — never a thread the model has to guess at. */
  threads: z.array(ThreadStatusEntrySchema).default([]),
  note: z.string()
});
export type ChapterRead = z.infer<typeof ChapterReadSchema>;

export const DevelopmentalConcernSchema = z.object({
  chapterId: z.string().min(1),
  note: z.string()
});
export type DevelopmentalConcern = z.infer<typeof DevelopmentalConcernSchema>;

/** The one thing the author actually reads — the chapter-by-chapter reads above stay internal working data. */
export const DevelopmentalReportSchema = z.object({
  summary: z.string(),
  concerns: z.array(DevelopmentalConcernSchema).default([])
});
export type DevelopmentalReport = z.infer<typeof DevelopmentalReportSchema>;

export const DevelopmentalJobSchema = z.object({
  id: z.string().min(1),
  started_at: z.string().min(1),
  updated_at: z.string().min(1),
  status: z.enum(DEVELOPMENTAL_STATUSES),
  stage: z.enum([...DEVELOPMENTAL_STAGES, "done"]),
  /** Scene ids already read — scene ids are chapter-scoped (`${chapterId}:scene-N}` or a stored uuid), so no separate chapterId needed to dedupe. */
  sceneDone: z.array(z.string()).default([]),
  chapterDone: z.array(z.string()).default([]),
  sceneReads: z.array(SceneReadSchema).default([]),
  chapterReads: z.array(ChapterReadSchema).default([]),
  report: DevelopmentalReportSchema.optional(),
  detail: z.string().default("")
});
export type DevelopmentalJob = z.infer<typeof DevelopmentalJobSchema>;
