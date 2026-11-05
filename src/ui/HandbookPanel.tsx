import { useEffect, useRef, useState } from "react";
import { useLocale } from "./i18n";
import { QuickstartCards } from "./QuickstartCards";
import { CloseIconButton } from "./CloseIconButton";

/**
 * The Handbook is the deliberate, sequential read for a newcomer — separate
 * from the old anchor-driven Guide (`GuidePanel.tsx`), which stays wired to
 * every in-context "?" button as reference material (and, longer-term, the
 * basis for real tooltips).
 *
 * Shown as a modal (Mats, 2026-11-05: match kaampi Explore's own Guide —
 * "jag vill att Write får en likadan [guide], både visuellt och upplägget"),
 * with a collapsible register on the left (one group per category, Explore's
 * own pattern) and one chapter at a time on the right — not the old full-page,
 * every-section-at-once layout. `HANDBOOK_CATEGORY_IDS`/`HANDBOOK_SECTION_IDS`/
 * `HANDBOOK_SECTION_CATEGORY` below are unchanged by this; only how
 * `HandbookPanel` renders them changed.
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

/**
 * An optional, more pedagogical layout for a section: a short intro (the
 * section's own `body`) followed by labelled steps, each with its own real
 * screenshot of the app — closer to how kaampi Write's own feature set is
 * actually used, task by task, rather than one dense paragraph. Most
 * sections still just use `heading`/`body` alone; `steps` is opt-in per
 * section, starting with "write-with-ai" as the pilot (Mats, pointing at
 * Sudowrite's own docs: "samma pedagogiska... text och med skärmdumpar").
 */
export interface HandbookStep {
  heading: string;
  body: string;
  image?: { src: string; alt: string };
}

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

export function HandbookPanel({ onClose, initialTopic }: { onClose: () => void; initialTopic?: HandbookSectionId }) {
  const { messages: m } = useLocale();
  const startId = initialTopic ?? HANDBOOK_SECTION_IDS[0]!;
  const [active, setActiveState] = useState<HandbookSectionId>(startId);
  const [openCategories, setOpenCategories] = useState<Set<HandbookCategoryId>>(() => new Set([HANDBOOK_SECTION_CATEGORY[startId]]));
  const [aiSetupOpen, setAiSetupOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  function setActive(id: HandbookSectionId) {
    setActiveState(id);
    const category = HANDBOOK_SECTION_CATEGORY[id];
    setOpenCategories((current) => (current.has(category) ? current : new Set(current).add(category)));
    contentRef.current?.scrollTo({ top: 0 });
  }

  function toggleCategory(id: HandbookCategoryId) {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // The AI-setup dialog is a second, nested modal — let its own Escape
      // handler close just that one first, same as any other stacked dialog.
      if (event.key === "Escape" && !aiSetupOpen) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, aiSetupOpen]);

  useEffect(() => {
    if (!aiSetupOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setAiSetupOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiSetupOpen]);

  const entry = m.handbook.sections[active];
  const position = HANDBOOK_SECTION_IDS.indexOf(active);
  const prevId = position > 0 ? HANDBOOK_SECTION_IDS[position - 1] : null;
  const nextId = position < HANDBOOK_SECTION_IDS.length - 1 ? HANDBOOK_SECTION_IDS[position + 1] : null;

  return (
    <div
      className="edit-overlay handbook-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card handbook-modal-card" role="dialog" aria-modal="true" aria-label={m.handbook.title}>
        <div className="dialog-head">
          <h2>{m.handbook.title}</h2>
          <CloseIconButton onClick={onClose} label={m.common.close} />
        </div>
        <div className="handbook-modal-body">
          <nav className="handbook-modal-nav" aria-label={m.handbook.title}>
            {HANDBOOK_CATEGORY_IDS.map((catId, catIndex) => {
              const isOpen = openCategories.has(catId);
              const chapters = HANDBOOK_SECTION_IDS.filter((id) => HANDBOOK_SECTION_CATEGORY[id] === catId);
              return (
                <div key={catId} className={isOpen ? "handbook-modal-group is-open" : "handbook-modal-group"}>
                  <button type="button" className="handbook-modal-group-head" onClick={() => toggleCategory(catId)}>
                    <span>
                      {catIndex + 1}. {m.handbook.categories[catId]}
                    </span>
                    <span className="handbook-modal-group-count">
                      {chapters.length}
                      <span className="handbook-modal-chev" aria-hidden="true">
                        ▸
                      </span>
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="handbook-modal-group-list">
                      {chapters.map((id) => (
                        <button
                          key={id}
                          type="button"
                          className={id === active ? "handbook-modal-chapter is-active" : "handbook-modal-chapter"}
                          aria-current={id === active ? "page" : undefined}
                          onClick={() => setActive(id)}
                        >
                          {m.handbook.sections[id].heading}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <section className="handbook-modal-content" ref={contentRef} aria-live="polite">
            <div className="handbook-modal-content-inner" key={active}>
              <h2>{entry.heading}</h2>
              <p className="handbook-body handbook-modal-intro">{entry.body}</p>

              {active === "connect-local-ai" ? (
                <section className="guide-block guide-quickstart-block">
                  <button type="button" className="primary" onClick={() => setAiSetupOpen(true)}>
                    {m.guide.connectAiButton}
                  </button>
                </section>
              ) : null}

              {entry.steps ? (
                <ol className="handbook-steps">
                  {entry.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="handbook-step">
                      <h4>{step.heading}</h4>
                      <p className="handbook-body">{step.body}</p>
                      {step.image ? (
                        <img className="handbook-step-image" src={step.image.src} alt={step.image.alt} loading="lazy" />
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : null}

              {entry.tip ? <p className="handbook-tip">{entry.tip}</p> : null}

              <nav className="handbook-modal-paging" aria-label={m.handbook.title}>
                {prevId ? (
                  <button type="button" onClick={() => setActive(prevId)}>
                    <span className="handbook-modal-paging-dir">← {m.common.previous}</span>
                    {m.handbook.sections[prevId].heading}
                  </button>
                ) : (
                  <span />
                )}
                {nextId ? (
                  <button type="button" className="handbook-modal-paging-next" onClick={() => setActive(nextId)}>
                    <span className="handbook-modal-paging-dir">{m.common.next} →</span>
                    {m.handbook.sections[nextId].heading}
                  </button>
                ) : (
                  <span />
                )}
              </nav>
            </div>
          </section>
        </div>
      </div>

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
    </div>
  );
}
