import { describe, expect, it } from "vitest";
import { addChapter, createBook, updateChapter, type Book } from "@core/BookSchema";
import { addPlotline, toggleChapterPlotline } from "@core/plotlines";
import {
  CHAPTER_SYNTHESIS_SYSTEM,
  REPORT_SYSTEM,
  SCENE_READ_SYSTEM,
  chapterSynthesisUserPrompt,
  developmentalPercent,
  hasAnyTaggedThread,
  parseChapterSynthesis,
  parseDevelopmentalReport,
  parseSceneRead,
  reportUserPrompt,
  sceneReadUserPrompt,
  startDevelopmentalJob,
  touchDevelopmental,
  type ChapterRead,
  type SceneRead
} from "@core/developmental";
import { runDevelopmental } from "@core/developmentalRun";
import { chapterScenes } from "@core/bookScene";

function twoChapters(): { book: Book; first: string; second: string } {
  let book = createBook("Night Keys");
  book = addChapter(book);
  const first = book.chapters[0]!.id;
  const second = book.chapters[1]!.id;
  book = updateChapter(book, first, {
    title: "The lock",
    prose: "Emma locked the quay door and counted the night keys by the lamp on the wet planks before the stranger spoke a word."
  });
  book = updateChapter(book, second, {
    title: "The harbour",
    prose: "At the harbour gate Emma turned the lock and numbered the night keys under the lamp on the wet planks while the tide pulled away."
  });
  return { book, first, second };
}

describe("startDevelopmentalJob / touchDevelopmental", () => {
  it("starts running at the scene stage with everything empty", () => {
    const job = startDevelopmentalJob();
    expect(job.status).toBe("running");
    expect(job.stage).toBe("scene");
    expect(job.sceneDone).toEqual([]);
    expect(job.chapterDone).toEqual([]);
    expect(job.sceneReads).toEqual([]);
    expect(job.chapterReads).toEqual([]);
    expect(job.report).toBeUndefined();
  });

  it("patches fields and bumps updated_at", () => {
    const job = startDevelopmentalJob();
    const patched = touchDevelopmental(job, { stage: "chapter" });
    expect(patched.stage).toBe("chapter");
    expect(patched.id).toBe(job.id);
  });
});

describe("hasAnyTaggedThread", () => {
  it("is false for a manuscript with no plotlines tagged", () => {
    const { book } = twoChapters();
    expect(hasAnyTaggedThread(book)).toBe(false);
  });

  it("is true once at least one live chapter is tagged", () => {
    let { book, first } = twoChapters();
    book = addPlotline(book, "The missing key");
    const plotlineId = book.plotlines[0]!.id;
    book = toggleChapterPlotline(book, first, plotlineId);
    expect(hasAnyTaggedThread(book)).toBe(true);
  });
});

describe("developmentalPercent", () => {
  it("is 0 at the very start of the scene stage", () => {
    const job = startDevelopmentalJob();
    expect(developmentalPercent(job, 4, 2)).toBe(0);
  });

  it("is 100 once the job is done", () => {
    const job = touchDevelopmental(startDevelopmentalJob(), { status: "done", stage: "done" });
    expect(developmentalPercent(job, 4, 2)).toBe(100);
  });

  it("weights the scene stage up to 55%", () => {
    const job = touchDevelopmental(startDevelopmentalJob(), { sceneDone: ["a", "b", "c", "d"] });
    expect(developmentalPercent(job, 4, 2)).toBe(55);
  });

  it("weights the chapter stage from 55% to 90%", () => {
    const job = touchDevelopmental(startDevelopmentalJob(), { stage: "chapter", sceneDone: ["a", "b"], chapterDone: ["c1", "c2"] });
    expect(developmentalPercent(job, 2, 2)).toBe(90);
  });
});

describe("sceneReadUserPrompt", () => {
  it("includes the scene text, manuscript title, and tagged threads", () => {
    let { book, first } = twoChapters();
    book = addPlotline(book, "The missing key");
    const plotlineId = book.plotlines[0]!.id;
    book = toggleChapterPlotline(book, first, plotlineId);
    const chapter = book.chapters.find((item) => item.id === first)!;
    const scene = chapterScenes(chapter)[0]!;
    const prompt = sceneReadUserPrompt(book, chapter, scene);
    expect(prompt).toContain("Night Keys");
    expect(prompt).toContain("Emma locked the quay door");
    expect(prompt).toContain("The missing key");
  });

  it("omits the flashback line for a chapter in normal story order", () => {
    const { book, first } = twoChapters();
    const chapter = book.chapters.find((item) => item.id === first)!;
    const scene = chapterScenes(chapter)[0]!;
    const prompt = sceneReadUserPrompt(book, chapter, scene);
    expect(prompt).not.toContain("flashback");
  });
});

describe("parseSceneRead", () => {
  it("parses a well-formed response", () => {
    const parsed = parseSceneRead('{"function":"advance_plot","tension":"rises","note":"Strong opening."}');
    expect(parsed).toEqual({ function: "advance_plot", tension: "rises", note: "Strong opening." });
  });

  it("falls back to safe defaults for an unknown enum value", () => {
    const parsed = parseSceneRead('{"function":"nonsense","tension":"nonsense","note":""}');
    expect(parsed).toEqual({ function: "other", tension: "flat", note: "" });
  });

  it("returns null for unparseable output", () => {
    expect(parseSceneRead("not json at all")).toBeNull();
  });
});

describe("chapterSynthesisUserPrompt / parseChapterSynthesis", () => {
  it("lists the scene reads and tagged thread names", () => {
    let { book, first } = twoChapters();
    book = addPlotline(book, "The missing key");
    const plotlineId = book.plotlines[0]!.id;
    book = toggleChapterPlotline(book, first, plotlineId);
    const chapter = book.chapters.find((item) => item.id === first)!;
    const sceneReads: SceneRead[] = [{ chapterId: first, sceneId: "s1", function: "advance_plot", tension: "rises", note: "" }];
    const prompt = chapterSynthesisUserPrompt(book, chapter, sceneReads);
    expect(prompt).toContain("The missing key");
    expect(prompt).toContain("function advance_plot");
  });

  it("maps a returned thread name back to its plotline id and drops unknown names", () => {
    const taggedThreads = [{ id: "pl-1", title: "The missing key" }];
    const parsed = parseChapterSynthesis(
      '{"pacing":"right_pace","tension":"rises","threads":[{"thread":"The missing key","status":"advanced"},{"thread":"Unrelated thread","status":"stalled"}],"note":"Good momentum."}',
      taggedThreads
    );
    expect(parsed).toEqual({
      pacing: "right_pace",
      tension: "rises",
      threads: [{ plotlineId: "pl-1", status: "advanced" }],
      note: "Good momentum."
    });
  });

  it("returns null for unparseable output", () => {
    expect(parseChapterSynthesis("garbage", [])).toBeNull();
  });
});

describe("reportUserPrompt / parseDevelopmentalReport", () => {
  it("resolves thread ids back to names in the chapter-read lines", () => {
    let { book, first, second } = twoChapters();
    book = addPlotline(book, "The missing key");
    const plotlineId = book.plotlines[0]!.id;
    book = toggleChapterPlotline(book, first, plotlineId);
    const chapterReads: ChapterRead[] = [
      { chapterId: first, pacing: "right_pace", tension: "rises", threads: [{ plotlineId, status: "advanced" }], note: "" },
      { chapterId: second, pacing: "too_slow", tension: "flat", threads: [], note: "Drags a little." }
    ];
    const prompt = reportUserPrompt(book, chapterReads);
    expect(prompt).toContain("The missing key advanced");
    expect(prompt).toContain("Chapter 2");
    expect(prompt).toContain("Drags a little.");
  });

  it("maps a concern's chapter number back to a chapter id and drops concerns for an out-of-range chapter", () => {
    const { book } = twoChapters();
    const parsed = parseDevelopmentalReport(
      '{"summary":"Tension builds steadily toward the midpoint.","concerns":[{"chapter":2,"note":"The harbour chapter repeats earlier information."},{"chapter":9,"note":"Does not exist."}]}',
      book
    );
    expect(parsed?.summary).toBe("Tension builds steadily toward the midpoint.");
    expect(parsed?.concerns).toHaveLength(1);
    expect(parsed?.concerns[0]!.chapterId).toBe(book.chapters[1]!.id);
  });

  it("returns null when the summary is missing or empty", () => {
    const { book } = twoChapters();
    expect(parseDevelopmentalReport('{"concerns":[]}', book)).toBeNull();
    expect(parseDevelopmentalReport('{"summary":"","concerns":[]}', book)).toBeNull();
  });
});

describe("system prompts", () => {
  it("each instructs JSON-only output", () => {
    expect(SCENE_READ_SYSTEM).toMatch(/JSON only/);
    expect(CHAPTER_SYNTHESIS_SYSTEM).toMatch(/JSON only/);
    expect(REPORT_SYSTEM).toMatch(/JSON only/);
  });
});

describe("runDevelopmental", () => {
  it("walks scene → chapter → report, saving as it goes, and never sends brainstorm", async () => {
    const { book } = twoChapters();
    const secret = { ...book, brainstorm: "The stowaway is the captain's sister." };
    let latest = secret;
    const saved: string[] = [];
    const prompts: string[] = [];
    const job = startDevelopmentalJob();

    const result = await runDevelopmental(
      job,
      {
        complete: async (_system, user) => {
          prompts.push(user);
          if (user.includes("Scene text")) return '{"function":"advance_plot","tension":"rises","note":""}';
          if (user.includes("Scene reads")) return '{"pacing":"right_pace","tension":"rises","threads":[],"note":""}';
          return '{"summary":"A steady two-chapter opening.","concerns":[]}';
        },
        getBook: () => latest,
        save: async (next) => {
          saved.push(next.stage);
          latest = { ...latest, developmental: next };
        }
      },
      new AbortController().signal
    );

    expect(result.status).toBe("done");
    expect(result.stage).toBe("done");
    expect(result.sceneReads).toHaveLength(2);
    expect(result.chapterReads).toHaveLength(2);
    expect(result.report?.summary).toBe("A steady two-chapter opening.");
    expect(saved).toContain("chapter");
    expect(saved).toContain("report");
    expect(prompts.some((prompt) => prompt.includes("stowaway"))).toBe(false);
  });

  it("resumes from a partially completed scene stage without redoing finished scenes", async () => {
    const { book, first } = twoChapters();
    const chapter = book.chapters.find((item) => item.id === first)!;
    const scene = chapterScenes(chapter)[0]!;
    let latest = book;
    const calls: string[] = [];
    const job = touchDevelopmental(startDevelopmentalJob(), {
      sceneDone: [scene.id],
      sceneReads: [{ chapterId: first, sceneId: scene.id, function: "advance_plot", tension: "rises", note: "" }]
    });

    const result = await runDevelopmental(
      job,
      {
        complete: async (_system, user) => {
          calls.push(user);
          if (user.includes("Scene text")) return '{"function":"reveal_character","tension":"flat","note":""}';
          if (user.includes("Scene reads")) return '{"pacing":"right_pace","tension":"flat","threads":[],"note":""}';
          return '{"summary":"Fine.","concerns":[]}';
        },
        getBook: () => latest,
        save: async (next) => {
          latest = { ...latest, developmental: next };
        }
      },
      new AbortController().signal
    );

    expect(result.sceneReads).toHaveLength(2);
    expect(result.sceneReads[0]).toMatchObject({ sceneId: scene.id, function: "advance_plot" });
    // The already-done scene's own read must never be re-requested — only its
    // chapter-synthesis and the final report (which also names the chapter) may
    // mention "The lock" afterward.
    expect(calls.some((prompt) => prompt.includes("Scene text") && prompt.includes("The lock"))).toBe(false);
  });

  it("throws AbortError before it writes a later stage", async () => {
    const { book } = twoChapters();
    const job = startDevelopmentalJob();
    const abort = new AbortController();
    abort.abort();
    await expect(
      runDevelopmental(
        job,
        {
          complete: async () => '{"function":"advance_plot","tension":"flat","note":""}',
          getBook: () => book,
          save: async () => undefined
        },
        abort.signal
      )
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
