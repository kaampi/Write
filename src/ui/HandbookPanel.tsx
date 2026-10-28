import { useEffect, useState } from "react";
import { useLocale } from "./i18n";
import { QuickstartCards } from "./QuickstartCards";
import { CloseIconButton } from "./CloseIconButton";

/**
 * The Handbook is the deliberate, sequential read for a newcomer — separate
 * from the old anchor-driven Guide (`GuidePanel.tsx`), which stays wired to
 * every in-context "?" button as reference material (and, longer-term, the
 * basis for real tooltips). Nothing links into the Handbook by anchor, so
 * unlike the Guide it has no `scrollTo` prop — just eight numbered
 * categories, browsed top to bottom.
 */
export const HANDBOOK_CATEGORY_IDS = [
  "getting-started",
  "how-you-work",
  "plan",
  "story-bible-world",
  "writing",
  "revise",
  "images-publish-backup",
  "writing-tips",
  "help"
] as const;
export type HandbookCategoryId = (typeof HANDBOOK_CATEGORY_IDS)[number];

/** Keep in sync by hand with `handbook.sections` in the locale files (same keys, `Record`-typed). */
export const HANDBOOK_SECTION_IDS = [
  "connect-local-ai",
  "connection-presets",
  "first-book",
  "first-chapter",
  "map-of-storybook-ai",
  "no-required-workflow",
  "three-workflows",
  "which-tool-do-i-need",
  "most-important-principle",
  "brainstorm-free",
  "synopsis-short",
  "chapter-briefs",
  "chapter-summary",
  "development-methods",
  "snowflake-method",
  "three-act",
  "save-the-cat",
  "heros-journey",
  "method-differences",
  "scenes",
  "plotlines",
  "timeline",
  "scenes-plotlines-timeline",
  "story-bible-memory",
  "what-is-canon",
  "aliases-and-exclusions",
  "merge-story-bible-cards",
  "edit-vs-update",
  "interview-world",
  "interview-sandbox",
  "interview-to-story",
  "brainstorm-vs-interview",
  "three-levels-of-information",
  "extract-facts",
  "moving-from-other-tool",
  "import-lore",
  "lore-relevance-filter",
  "already-have-manuscript",
  "write-with-ai",
  "attached-context",
  "smallest-tool",
  "ai-not-autopilot",
  "darlings",
  "placeholders",
  "pov-tense-voice",
  "reader",
  "author-voice",
  "smart-quotes",
  "analyze-chapter",
  "polish",
  "continuity",
  "ask-manuscript",
  "ask-about-passage",
  "history",
  "proofread",
  "developmental-analysis",
  "images-illustrations",
  "typography",
  "language-versions",
  "publish",
  "backup",
  "network-ai-server",
  "ai-writing-wrong-things",
  "marker-conversion-no-match",
  "routine-short-often",
  "routine-draft-then-edit",
  "routine-set-time-place",
  "routine-pause-when-stuck",
  "routine-read-widely",
  "opening-raise-a-question",
  "opening-wait-on-backstory",
  "opening-let-details-show",
  "opening-save-the-surprises",
  "voice-overexplaining",
  "voice-too-predictable",
  "voice-varied-emotion",
  "voice-straight-timeline",
  "writing-tips-sources"
] as const;
export type HandbookSectionId = (typeof HANDBOOK_SECTION_IDS)[number];

export const HANDBOOK_SECTION_CATEGORY: Record<HandbookSectionId, HandbookCategoryId> = {
  "connect-local-ai": "getting-started",
  "connection-presets": "getting-started",
  "first-book": "getting-started",
  "first-chapter": "getting-started",
  "map-of-storybook-ai": "how-you-work",
  "no-required-workflow": "how-you-work",
  "three-workflows": "how-you-work",
  "which-tool-do-i-need": "how-you-work",
  "most-important-principle": "how-you-work",
  "brainstorm-free": "plan",
  "synopsis-short": "plan",
  "chapter-briefs": "plan",
  "chapter-summary": "plan",
  "development-methods": "plan",
  "snowflake-method": "plan",
  "three-act": "plan",
  "save-the-cat": "plan",
  "heros-journey": "plan",
  "method-differences": "plan",
  scenes: "plan",
  plotlines: "plan",
  timeline: "plan",
  "scenes-plotlines-timeline": "plan",
  "story-bible-memory": "story-bible-world",
  "what-is-canon": "story-bible-world",
  "aliases-and-exclusions": "story-bible-world",
  "merge-story-bible-cards": "story-bible-world",
  "edit-vs-update": "story-bible-world",
  "interview-world": "story-bible-world",
  "interview-sandbox": "story-bible-world",
  "interview-to-story": "story-bible-world",
  "brainstorm-vs-interview": "story-bible-world",
  "three-levels-of-information": "story-bible-world",
  "extract-facts": "story-bible-world",
  "moving-from-other-tool": "story-bible-world",
  "import-lore": "story-bible-world",
  "lore-relevance-filter": "story-bible-world",
  "already-have-manuscript": "story-bible-world",
  "write-with-ai": "writing",
  "attached-context": "writing",
  "smallest-tool": "writing",
  "ai-not-autopilot": "writing",
  darlings: "writing",
  placeholders: "writing",
  "pov-tense-voice": "writing",
  reader: "writing",
  "author-voice": "writing",
  "smart-quotes": "writing",
  "analyze-chapter": "revise",
  polish: "revise",
  continuity: "revise",
  "ask-manuscript": "revise",
  "ask-about-passage": "revise",
  history: "revise",
  proofread: "revise",
  "developmental-analysis": "revise",
  "images-illustrations": "images-publish-backup",
  typography: "images-publish-backup",
  "language-versions": "images-publish-backup",
  publish: "images-publish-backup",
  backup: "images-publish-backup",
  "network-ai-server": "help",
  "ai-writing-wrong-things": "help",
  "marker-conversion-no-match": "help",
  "routine-short-often": "writing-tips",
  "routine-draft-then-edit": "writing-tips",
  "routine-set-time-place": "writing-tips",
  "routine-pause-when-stuck": "writing-tips",
  "routine-read-widely": "writing-tips",
  "opening-raise-a-question": "writing-tips",
  "opening-wait-on-backstory": "writing-tips",
  "opening-let-details-show": "writing-tips",
  "opening-save-the-surprises": "writing-tips",
  "voice-overexplaining": "writing-tips",
  "voice-too-predictable": "writing-tips",
  "voice-varied-emotion": "writing-tips",
  "voice-straight-timeline": "writing-tips",
  "writing-tips-sources": "writing-tips"
};

export function HandbookPanel() {
  const { messages: m } = useLocale();
  const [category, setCategory] = useState<HandbookCategoryId>("getting-started");
  const [aiSetupOpen, setAiSetupOpen] = useState(false);

  useEffect(() => {
    if (!aiSetupOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setAiSetupOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiSetupOpen]);

  const categoryIndex = HANDBOOK_CATEGORY_IDS.indexOf(category) + 1;
  const sectionsInCategory = HANDBOOK_SECTION_IDS.filter((id) => HANDBOOK_SECTION_CATEGORY[id] === category);

  return (
    <main className="manuscript manuscript-inset guide-page">
      <h1 className="chapter-title">{m.handbook.title}</h1>
      <p className="synopsis-lede handbook-body">{m.handbook.intro}</p>

      <div className="guide-tabs" role="tablist">
        {HANDBOOK_CATEGORY_IDS.map((id, index) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            className={category === id ? "guide-tab is-active" : "guide-tab"}
            onClick={() => setCategory(id)}
          >
            {index + 1}. {m.handbook.categories[id]}
          </button>
        ))}
      </div>

      {category === "getting-started" ? (
        <section className="guide-block">
          <button type="button" className="primary" onClick={() => setAiSetupOpen(true)}>
            {m.guide.connectAiButton}
          </button>
        </section>
      ) : null}

      <section className="guide-block">
        <h2 className="settings-heading">
          {categoryIndex}. {m.handbook.categories[category]}
        </h2>
        <div className="guide-sections">
          {sectionsInCategory.map((id, index) => {
            const entry = m.handbook.sections[id];
            return (
              <article key={id} className="guide-section">
                <h3>
                  {categoryIndex}.{index + 1} {entry.heading}
                </h3>
                <p className="handbook-body">{entry.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {aiSetupOpen ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAiSetupOpen(false);
          }}
        >
          <div className="edit-card ai-setup-card" role="dialog" aria-modal="true" aria-label={m.guide.connectAiButton}>
            <div className="stats-card-head">
              <p className="chapter-craft-label">{m.guide.connectAiButton}</p>
              <CloseIconButton onClick={() => setAiSetupOpen(false)} label={m.common.close} />
            </div>
            <QuickstartCards />
          </div>
        </div>
      ) : null}
    </main>
  );
}
