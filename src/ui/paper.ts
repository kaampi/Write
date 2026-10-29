/**
 * The editor's own writing-surface color, independent of the app-wide
 * dark/light theme (Mats: dark theme is nice everywhere else, but light
 * text on a dark page gets tiring to write/read for long stretches).
 * Same storage/apply pattern as theme.ts, deliberately — a separate
 * [data-paper] attribute rather than folding this into [data-theme] so
 * "dark app, light paper" stays a valid combination, which is the whole
 * point.
 */
export type Paper = "default" | "warm" | "sepia" | "gray" | "dark";

export const PAPER_KEY = "storybook-ai.paper";

export const PAPERS: readonly Paper[] = ["default", "warm", "sepia", "gray", "dark"];

export function parsePaper(value: string | null | undefined): Paper {
  return (PAPERS as readonly string[]).includes(value ?? "") ? (value as Paper) : "default";
}

export function readPaper(): Paper {
  try {
    return parsePaper(localStorage.getItem(PAPER_KEY));
  } catch {
    return "default";
  }
}

export function applyPaper(paper: Paper): void {
  const root = document.documentElement;
  if (paper === "default") delete root.dataset.paper;
  else root.dataset.paper = paper;
  try {
    localStorage.setItem(PAPER_KEY, paper);
  } catch {
    /* private mode */
  }
}
