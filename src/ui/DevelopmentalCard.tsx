import React, { useEffect, useState } from "react";
import type { Book } from "@core/BookSchema";
import { CloseIconButton } from "./CloseIconButton";
import { chapterScenes } from "@core/bookScene";
import { proseChapters } from "@core/proofread";
import {
  DEVELOPMENTAL_STAGES,
  developmentalPercent,
  type DevelopmentalJob,
  type DevelopmentalStage
} from "@core/developmental";
import { format, useLocale } from "./i18n";

export function DevelopmentalCard({
  book,
  job,
  running,
  onClose,
  onStop,
  onContinue,
  onRunAgain,
  onOpenChapter
}: {
  book: Book;
  job: DevelopmentalJob;
  running: boolean;
  onClose: () => void;
  onStop: () => void;
  onContinue: () => void;
  onRunAgain: () => void;
  onOpenChapter: (chapterId: string) => void;
}) {
  const { messages: m } = useLocale();
  const chapters = proseChapters(book);
  const sceneCount = chapters.reduce((total, chapter) => total + chapterScenes(chapter).length, 0);
  const percent = developmentalPercent(job, sceneCount, chapters.length);
  const live = running || job.status === "running";
  const paused = job.status === "paused";
  const failed = job.status === "error";
  const done = job.status === "done";

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (live) return;
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live, onClose]);

  const [patient, setPatient] = useState(false);
  useEffect(() => {
    setPatient(false);
    if (!live || !job.detail) return;
    const id = window.setTimeout(() => setPatient(true), 20000);
    return () => window.clearTimeout(id);
  }, [live, job.detail]);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (live) return;
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card proofread-card" role="dialog" aria-modal="true" aria-labelledby="developmental-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.developmental.action}</p>
          {live ? (
            <button type="button" className="text-button" onClick={onStop}>
              {m.common.stop}
            </button>
          ) : (
            <CloseIconButton onClick={onClose} label={m.common.close} />
          )}
        </div>
        <h2 id="developmental-title">{live || paused || failed ? m.developmental.runningTitle : m.developmental.resultsTitle}</h2>
        <p className="quiet">{m.developmental.lede}</p>
        {paused ? <p className="quiet">{m.developmental.paused}</p> : null}
        {failed ? <p className="quiet">{m.developmental.error}</p> : null}

        {!done ? (
          <>
            <ol className="proofread-stages">
              {DEVELOPMENTAL_STAGES.map((stage) => (
                <li key={stage} className={stageClass(job, stage)}>
                  <span className="proofread-mark" aria-hidden="true">
                    {stageMark(job, stage)}
                  </span>
                  <span>{stageLine(job, stage, sceneCount, chapters.length, m)}</span>
                </li>
              ))}
            </ol>
            <div className="proofread-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
              <span style={{ width: `${percent}%` }} />
            </div>
            <p className="quiet">{format(m.developmental.percent, { n: percent })}</p>
            {job.detail ? (
              <p className="quiet proofread-now">
                {live ? (
                  <span className="pulse-dots" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                ) : null}
                {format(m.developmental.now, { detail: nowDetail(job.detail, book, m) })}
              </p>
            ) : null}
            {live && patient ? <p className="quiet proofread-patience">{m.developmental.stillWorking}</p> : null}
          </>
        ) : null}

        {done && job.report ? (
          <>
            <div className="stats-sentence">
              <p className="chapter-craft-label">{m.developmental.summaryLabel}</p>
              {job.report.summary
                .split(/\n{2,}/)
                .filter((part) => part.trim())
                .map((paragraph, index) => (
                  <p key={index} className="quiet">
                    {paragraph.trim()}
                  </p>
                ))}
            </div>
            {job.report.concerns.length > 0 ? (
              <div className="stats-long stats-packed">
                <p className="chapter-craft-label">{m.developmental.concernsLabel}</p>
                <p className="quiet stats-spark-hint">{m.developmental.clickHint}</p>
                <ul>
                  {job.report.concerns.map((concern, index) => (
                    <li key={`${concern.chapterId}:${index}`}>
                      <button type="button" className="stats-long-pick" onClick={() => onOpenChapter(concern.chapterId)}>
                        {chapterLabel(concern.chapterId, book, m)}
                      </button>
                      <p className="quiet">{concern.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
        {done && !job.report ? <p className="quiet">{m.developmental.emptyResults}</p> : null}

        <div className="edit-actions">
          {paused || failed ? (
            <button type="button" className="primary" onClick={onContinue}>
              {m.developmental.continue}
            </button>
          ) : null}
          {done ? (
            <button type="button" className="primary" onClick={onRunAgain}>
              {m.developmental.runAgain}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const STAGE_ORDER: Record<DevelopmentalStage | "done", number> = { scene: 0, chapter: 1, report: 2, done: 3 };

function stageDone(job: DevelopmentalJob, stage: DevelopmentalStage): boolean {
  if (job.status === "done") return true;
  return STAGE_ORDER[job.stage] > STAGE_ORDER[stage];
}

function stageClass(job: DevelopmentalJob, stage: DevelopmentalStage): string {
  if (stageDone(job, stage)) return "is-done";
  if (job.stage === stage) return "is-current";
  return "is-wait";
}

function stageMark(job: DevelopmentalJob, stage: DevelopmentalStage): string {
  if (stageDone(job, stage)) return "✓";
  if (job.stage === stage) return "▶";
  return "";
}

function stageLine(
  job: DevelopmentalJob,
  stage: DevelopmentalStage,
  sceneCount: number,
  chapterCount: number,
  m: ReturnType<typeof useLocale>["messages"]
): string {
  if (stage === "scene") return format(m.developmental.sceneProgress, { done: job.sceneDone.length, total: Math.max(1, sceneCount) });
  if (stage === "chapter") return format(m.developmental.chapterProgress, { done: job.chapterDone.length, total: Math.max(1, chapterCount) });
  return m.developmental.reportProgress;
}

function nowDetail(detail: string, book: Book, m: ReturnType<typeof useLocale>["messages"]): string {
  const scene = /^scene:(\d+):(\d+)$/.exec(detail);
  if (scene) return format(m.developmental.nowScene, { chapter: scene[1] ?? "", scene: scene[2] ?? "" });
  const chapter = /^chapter:(\d+)$/.exec(detail);
  if (chapter) return format(m.developmental.nowChapter, { n: chapter[1] ?? "" });
  if (detail === "report") return m.developmental.nowReport;
  return detail;
}

function chapterLabel(chapterId: string, book: Book, m: ReturnType<typeof useLocale>["messages"]): string {
  const chapter = book.chapters.find((item) => item.id === chapterId);
  return format(m.developmental.chapter, { n: (chapter?.sequence_index ?? 0) + 1 });
}
