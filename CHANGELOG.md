# Changelog

All notable changes to StoryBook AI are documented here. This file follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and the
project uses [Semantic Versioning](https://semver.org/).

This file starts tracking from the 1.0.0 release. The full development
history before that — every incremental step, in detail — lives in
`project_spec.md`'s changelog (in Swedish; it's the project's internal
working log).

## [1.0.111] - 2026-10-15

### Fixed
- IDML export produced far too many pages (115/229 reported, for content that should have needed far fewer) with almost no visible text in either InDesign or Affinity. The previous approach threaded several `TextFrame`s per chapter together (`PreviousTextFrame`/`NextTextFrame`) and relied on the reader application to work out which text landed on which page when the file was opened — syntax that follows the IDML spec, but with no real IDML file to verify it against, it wasn't trustworthy enough to build pagination on, and evidently isn't read the way expected. IDML export now paginates itself: it measures each paragraph's real wrapped height with the manuscript's actual font (the same font-metric word-wrap PDF export already uses for its own pagination) and decides page breaks directly, so every page's content is exactly what belongs on it — nothing is left for InDesign or Affinity to compute, and nothing for them to get wrong. No `TextFrame` is threaded to another one anymore.

## [1.0.110] - 2026-10-15

### Added
- Page size and margin (Settings → Typography): choose A4, US Letter, or 6×9in trade paperback, plus a narrow/normal/wide margin — for IDML, PDF, and ODT, the three export formats with a real printed page (RTF and HTML/ePub reflow with no fixed page geometry). Defaults to 6×9in with a normal margin, matching IDML's previous fixed size. The editor's own writing column also scales its width to roughly match the chosen page's proportions — not true pagination, just a closer preview; the column still scrolls as one continuous piece.
- IDML export now flows a chapter's (or the Story Bible's) text across as many same-size, threaded pages as it needs, instead of squeezing everything onto one oversized page. Every page in the document is the same fixed size (the chosen page size above), and InDesign/Affinity compute the real page-by-page text flow themselves when the file is opened, the same as a real multi-page layout.

### Changed
- PDF's page size, previously hardcoded to A4, and ODT's page layout, previously left unset (inheriting whatever the opening application's own default was), now both follow the new Page size/margin setting.

## [1.0.109] - 2026-10-15

### Fixed
- IDML export opened in InDesign and Affinity (after the v1.0.108 packaging fix) but still showed inconsistent page sizes and almost no visible text. Every page's `GeometricBounds` (title page, each chapter, the Story Bible) was previously computed independently, sized just tall enough for that page's own content — but InDesign and Affinity expect uniform page geometry across a document, and distrust per-page sizes that vary, reflowing the whole document to an unrelated size and desyncing text frame placement from the actual pages. All pages in an IDML export now share one height — the tallest page the book needs — matching the pattern used by ComicBook AI's own IDML export. A short chapter now has more empty space at the bottom of its page than before; this is an accepted tradeoff of uniform sizing, not a bug.

## [1.0.108] - 2026-10-15

### Fixed
- IDML export failed to open in InDesign and Affinity. `META-INF/container.xml` — the first file any IDML reader looks at to even find the rest of the package — used the wrong XML namespace and attribute names; now uses the correct OCF container convention. designmap.xml was also missing InDesign's own `<?aid ...?>` package marker, had the wrong attribute case on `ZeroPoint`, and declared a default XML namespace on `<Document>` that shouldn't be there.

## [1.0.107] - 2026-10-14

### Added
- IDML export (Publish → IDML (InDesign)), for an author doing the book's own typesetting in Adobe InDesign. One text frame per chapter, each on its own generously tall page sized to hold the whole chapter without threading to another page — not a finished book layout, raw material for the author to lay out themselves. Carries chapter headings, prose (with real bold/italic/underline, drop caps, and scene-break ornaments), and the Story Bible, the same content every other Publish format includes. Built from scratch — no existing reference to work from, confirmed by searching ComicBook AI's repo directly — and not verifiable by actually opening the result in InDesign in this environment; the zip structure, XML well-formedness, and every internal cross-reference are tested, but treat a first export as a first draft worth opening and reporting back on.

### Fixed
- Bold, italic, and underline applied in the chapter editor were silently dropped by every Publish export format — RTF, ODT, HTML, ePub, and PDF all flattened formatted prose to plain text, with no warning. All five now carry it through: real `<b>`/`<i>`/`<u>` in HTML and ePub, RTF control words, named ODT character styles, and bold plus a drawn underline rule in PDF. Italic is the one deliberate exception in PDF specifically — the app draws its own PDF text and has no italic font file embedded for any of its 13 typefaces, so an italic run there renders in the regular weight rather than faking a slant; every other format renders italic correctly, since they leave font selection to the reading application.

## [1.0.105] - 2026-10-14

### Changed
- Guide: updated the map of StoryBook AI, "Which tool do I need?", and "Three complete workflows" overview sections to reference every tool added across this Guide catch-up — Polish, Developmental analysis, Language versions, Attached context, Darlings, and Placeholders — now that each has its own section to point to. Final batch of the Guide catch-up started in v1.0.99.

## [1.0.104] - 2026-10-14

### Added
- Guide: a new Connection presets section in Getting Started, and the Scenes section now mentions "Create scene" from a text selection alongside "Split into two…". Sixth batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.103] - 2026-10-14

### Changed
- Guide: rewrote the "Convert markers to formatting says nothing was found" FAQ entry to lead with Smart quotes (v1.0.98) for the quote-mark case — Convert markers usually isn't needed for that anymore — and kept the copy-paste workaround for other markers (asterisks, custom pairs). Fifth batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.102] - 2026-10-14

### Added
- Guide: two new Images, Publishing & Backup sections, Typography and Language versions of a manuscript, plus updated Publish (Paragraph style) and Backup (Export for other apps / StoryCore) sections. Fourth batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.101] - 2026-10-14

### Added
- Guide: two new Revise sections, Polish and Developmental analysis, plus an updated Proofread section naming its seven checks and the placeholder warning. Third batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.100] - 2026-10-14

### Added
- Guide: four new Writing sections — Attached context, Darlings, Placeholders, and Smart quotes. Second batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.99] - 2026-10-14

### Added
- Guide: four new Story Bible & World sections documenting features that had shipped without any Guide coverage — Chapter summary, Aliases and exclusion phrases, Merge Story Bible cards, and Edit vs. Update a fact. First batch of a broader Guide catch-up; the Guide's narrative content hadn't been updated since v1.0.34, roughly 65 releases behind.

## [1.0.98] - 2026-10-14

### Added
- Smart quotes. Straight double quotes (`"`) typed in the chapter editor now turn into real opening/closing curly quotes (" / ") automatically, based on what comes right before — start of text, whitespace, a bracket, a dash, or another opening quote opens; anything else closes. A new "Smarten quotes in whole manuscript" action (Tools → Convert markers) converts every straight quote already in the manuscript the same way, in one pass.

## [1.0.97] - 2026-10-13

### Added
- Developmental analysis (Tools menu). A manually started, resumable pass over the whole manuscript that reads structure rather than line-level prose: scene by scene, then chapter by chapter, then one final report — never the whole manuscript in a single model call. The report covers pacing, whether tension escalates, and which Plotlines threads advance, stall, or get resolved, with specific chapters flagged worth a look. Grounded in whatever Plotlines tags and Timeline positions the manuscript already has; works without either, just with a coarser read, and says so before starting.

## [1.0.96] - 2026-10-13

### Changed
- Draft, Extend/Elaborate/Beat, and the default Polish instructions now push back on three AI storytelling habits documented in a recent research paper on narrative idiosyncrasies in AI fiction (roadmap-ideas.md #45): over-explaining a scene's theme or lesson through the narration, conveying emotion almost exclusively through physical sensation rather than ever naming it plainly, and resolving every scene neatly through the protagonist's own choice. Polish's instructions also stopped treating every emotion word as something to strip — naming a feeling plainly is sometimes the stronger choice, not always a tell.

## [1.0.95] - 2026-10-13

### Added
- Language versions of a manuscript. A manuscript can now spin off a separate, linked edition in another language (title bar → the language switcher next to the manuscript title → "New language version…"), with its own chapters pre-created empty and linked to their source counterparts — translate each one from the chapter editor ("Translate chapter"), which carries over the source chapter's prose plus the manuscript's Story Bible and Voice for consistent names and terms. A translated chapter flags when its source has changed since the last translation ("Source changed since this was translated"), with a same-language diff ("Show what changed") of exactly what moved, and a "Re-translate chapter" action. The manuscript shelf now groups a source manuscript with its language versions instead of listing them as unrelated rows. Settings → AI settings gained a third model choice, Translate, alongside Writing and Review — defaults to the Writing model until set.

## [1.0.94] - 2026-10-13

### Added
- Proofread now scales two previously-fixed limits to the author's own setup instead of using the same hard caps for everyone. Style's chapter sampling (how much of each chapter it reads for a register or mood slip) now scales from Settings' Context window — a short chapter can be sent whole once it fits, instead of always trimming to a fixed snippet. Scenes' repeated-scene search gets a new Settings → AI settings → Proofread thoroughness level (Fast/Balanced/Thorough), controlling how many candidate pairs are sent to the model — a call-count question Context window isn't a good fit for. Both default to today's existing behavior unchanged.

## [1.0.93] - 2026-10-13

### Added
- Attached context for Draft and Recast. A chapter can now pin an earlier chapter — or just one of its scenes — as extra reference material, from Chapter settings → Attached context. Its full prose is sent alongside the Story Bible, not just a one-line summary, for when a place, object, or character needs to read exactly as it was first described. Shows a rough token-cost estimate for whatever's pinned.

## [1.0.92] - 2026-10-13

### Fixed
- Clicking into an existing block-quote line (the `>` convention) and pressing Enter near its start could corrupt it — the quote's hidden marker would duplicate, and the two paragraphs' text would run together with no break between them, intermittently and without an obvious trigger. The marker is invisible, so a click or Home near the start of a quote line had no way to land anywhere predictable relative to it; Enter there now always produces a clean new paragraph instead.

## [1.0.91] - 2026-10-13

### Added
- Decorative scene-break styles. Settings → Typography → Scene break now offers four named ornaments for a `---` paragraph — Classic book vignette (❦), Minimalist diamond (❖), French elegance (⚜), and Glimmer / star (✦) — alongside today's plain short rule. Shows live in the editor and carries into every Publish export, with simpler versions where a format can't do a true fade (ODT, RTF use a centered symbol, no fading line) or the ornament itself (PDF draws a small vector shape instead of the character, since the manuscript's chosen body font has no dingbat glyphs to draw).

### Fixed
- A scene break (`---` on its own line) was never recognized by any Publish export — HTML, ePub, ODT, RTF, and PDF all rendered the literal three dashes as ordinary text. All five now render a proper rule (the default "plain" style, or one of the new named ornaments), matching what the editor has always shown.

## [1.0.90] - 2026-10-13

### Added
- Pending facts from Extract Facts can now be merged straight onto an existing Story Bible card of the same kind, right from the review queue — no more locking a fact first just to merge it afterward. Pick "Merge with…" on the card, and if the target already has a conflicting value for that same fact, you'll be asked whether to keep both or replace the old one, exactly like the existing "Replace or add?" choice on manual fact entry.

## [1.0.89] - 2026-10-13

### Added
- Merge Story Bible cards. Pick "Merge cards…" in the Story Bible panel, select two or more cards of the same kind (say, "Kael" and "the Captain" that turned out to be the same person), and merge them into one. Nothing is deleted — every fact moves onto the merged card, you choose which value wins wherever the cards disagreed, and each old name becomes an alias so a later mention of either still resolves to it. Optionally replaces the old names in the manuscript text too.

### Fixed
- Deleting a Story Bible entity left its tracked aliases and exclusions behind under the deleted entity's id. Harmless on its own, but needless clutter — now cleaned up along with everything else `deleteEntity` already removed.

## [1.0.88] - 2026-10-13

### Added
- Proofread now warns if there's an open placeholder note before it runs — easy to forget one's still waiting once you've moved on, and it's never been checked for before. Not a blocker, just a reminder; it updates to match whichever scope (whole manuscript or just the open chapter) you pick.

## [1.0.87] - 2026-10-11

### Fixed
- Pasting multi-paragraph text could leave stray blank lines behind — real, but only ever visual: the chapter's stored prose was always clean underneath, and the gaps vanished the moment any other edit (typing a `>` quote line, for instance) forced a redraw. Paste now builds one paragraph at a time instead of handing the browser the whole clipboard text at once, so the stray blank blocks never appear in the first place.

## [1.0.86] - 2026-10-11

### Fixed
- Find & Replace made the chapter's prose render as a garbled double-exposure of overlapping text. The real editable text and the highlight overlay that marks your matches were both fully visible and drawn on top of each other — not a data problem, chapter text was always intact underneath.

## [1.0.85] - 2026-10-11

### Fixed
- Draft, Recast, and every other streaming AI operation could finish without writing anything — no error, no change, nothing — when a model streamed its reply under a field the app doesn't read (a reasoning/thinking model sending `reasoning_content` instead of the final answer, for example). The server's own usage logs could show real output while the editor stayed untouched. Both local-server connections (Ollama and the OpenAI-compatible one used for LM Studio and similar servers) now raise a clear error instead of finishing silently when a streamed reply never carries any actual reply text.

## [1.0.84] - 2026-10-11

### Added
- A new way to split a chapter into scenes: mark the text that should be its own scene and pick "Create scene" from the selection menu, instead of hunting for the right paragraph in the Scenes panel's "Split in two…" list.

## [1.0.83] - 2026-10-10

### Fixed
- The Polish review window was stuck at the same narrow width as a small confirmation dialog, cramming its side-by-side before/after text into two thin, scrolling columns. It now opens as wide as the History comparison view, which uses the same side-by-side layout.

## [1.0.82] - 2026-10-10

### Added
- A new Polish step. Runs a cleanup pass over the whole chapter — cuts exposition inserts, emotion-naming, vague statements, purple prose, and tightens dialogue — then shows the original and the rewrite side by side with word-level highlighting before anything is kept. Accept or discard; nothing touches the chapter until you say so. The instructions Polish gives the model are editable per manuscript in Settings → Polish.

## [1.0.81] - 2026-10-10

### Fixed
- Analyze's run never showed up under Tools → "View AI context…" — it recorded the prompt sent to the model but not the model's own reply, the one AI operation in the app missing that. Fixed; "What came back" now appears for Analyze like it already does for every other job.

## [1.0.80] - 2026-10-10

### Changed
- Stats is now a real button next to Analyze, instead of blending into the quiet word-count/Rare/Clichés/Story Bible Names row where it was easy to miss.

## [1.0.79] - 2026-10-10

### Fixed
- Analyze's "show vs tell" check was discarding some of its own correct catches — a sanity filter on the model's output only recognized a short list of feeling-words, so lines like "he pushed the feelings aside" or "a sense of comfort settled over him" were silently dropped even when the model had already flagged them right. The filter now recognizes a much wider range of telling language.

## [1.0.78] - 2026-10-10

### Added
- Settings → Typography gets a Color choice for the prose — one for the app's dark theme, one for light, so it stays legible and intentional in both instead of one color picked for whichever theme you happened to be in. Live in the editor; Publish exports (HTML, ePub, ODT, RTF, PDF) always use the light-mode color, the usual dark-text-on-a-light-page convention for a static document.

## [1.0.77] - 2026-10-09

### Fixed
- The drop cap ("anfang") sat lower than it should across every typeface — its box was sized about 9% taller than the number of lines it was meant to span, wrapping one extra line of text below the target instead of stopping cleanly. Fixed in the live editor and in HTML/ePub exports.

## [1.0.76] - 2026-10-09

### Added
- Settings → Typography gets a Weight choice (Regular or Bold) alongside Font — the manuscript's prose can now sit heavier on the page, in the editor and in every Publish export.

## [1.0.75] - 2026-10-09

### Added
- Settings → Typography's Font list grows from 5 to 13 typefaces — Alegreya, Fraunces, Literata, Lora, Libron, Spectral, PT Serif and Source Serif 4 under Serif; PT Sans, Chivo, Asap, Open Sans and Rubik under Sans serif. The list is grouped by those two headings, and each entry shows in its own typeface so you can tell them apart before picking one.

## [1.0.74] - 2026-10-09

### Changed
- The manuscript's font is now one setting, not a separate pick on every export. Settings → Typography gets a Font choice (System serif, Lora, Literata, Source Serif 4, or Asap — Literata by default) that drives the live editor and every Publish export, so you see what you'll get before you export it. Publish's own font picker is gone — it shows the chosen font as a note instead.

## [1.0.73] - 2026-10-09

### Changed
- Settings has a new Typography section — Drop cap moved there from among POV/Tense/Viewpoint, making room for more typography controls to come.

## [1.0.72] - 2026-10-09

### Fixed
- The drop cap's own letter was being clipped at the top, with an odd gap underneath — a too-tight line spacing made its box shorter than the letter itself. Fixed in the editor, and in HTML/ePub exports.

## [1.0.71] - 2026-10-09

### Added
- Drop cap ("anfang") under Settings → General: choose off or 2–5 lines, and each chapter's opening letter grows to match — live while you write, and carried into Publish's HTML, ePub, and ODT exports. (RTF and PDF don't support it yet.)

## [1.0.70] - 2026-10-09

### Added
- Connection presets under Settings → Models. Save your Engine and Server address as a named tile — Ollama, LM Studio, a test rig, whatever you switch between — and click a tile to use it again instead of retyping the address. Each tile expands to show (and edit) its own settings, with an Update button to save changes and a delete button to remove it. Whatever is live right now, saved or not, always stays visible and editable.

## [1.0.69] - 2026-10-09

### Fixed
- The desktop app's own last fix (1.0.68) still refused local servers running on a non-default port — which is every real one (Ollama, LM Studio, Strata, and similar all use a custom port). The permission the desktop app was given only covered the plain default port for a plain web address, not a custom one. It now covers any port.

## [1.0.68] - 2026-10-08

### Fixed
- The desktop app could refuse to connect to a local server (Ollama, LM Studio, Strata, and similar) that worked fine from the browser version, because that server's allowed-origins setting didn't recognize the desktop app's own internal address. The desktop app now reaches local servers directly through its own backend instead of its embedded browser window, so this no longer matters.

## [1.0.67] - 2026-10-08

### Changed
- Add chapter illustration now lives inside Chapter settings — open it to reach the banner — instead of sitting next to it.

## [1.0.66] - 2026-10-08

### Changed
- Reordered the chapter header: Add chapter illustration now sits right under Chapter settings, and the chapter title (with its plotline threads) now sits under Scenes.

## [1.0.65] - 2026-10-08

### Fixed
- Scenes sat outside the chapter's own centered column, so on a wide window the scene list visibly started further left than the chapter title, threads and prose above and below it. It now lives directly under Chapter settings, at the same width as the rest of the chapter.

## [1.0.64] - 2026-10-08

### Added
- Aliases can now be set right when creating a new Story Bible character, place, or object — not just afterward. The "New…" dialog has an Aliases field alongside the name and first claim.

## [1.0.63] - 2026-10-08

### Fixed
- Proofread's Age stage was asked to "read closely" for profanity, violence, and sexual content unsuited to a young reader, but was never actually given the chapter text — only word-count and sentence-length numbers — so it had nothing real to check and could in principle report a quote that wasn't really there. Content screening for an under-18 Reader now happens during the Grammar stage instead, which already reads every chapter in full and already verifies every quote it reports against the real text before showing it.

## [1.0.62] - 2026-10-07

### Fixed
- The scene-break line from v1.0.61 wasn't actually visible — it had no width and no spacing above or below it, just a 1-pixel-tall sliver, because of a CSS unit that unintentionally zeroed itself out. It's a proper short centered line now.
- Typing `>` to start a quoted line, then continuing to type right after it without pressing Enter first, made everything you typed invisible (and could silently swallow the space after `>`). Both are fixed — the text you type now shows up as you type it, exactly as typed.

## [1.0.61] - 2026-10-07

### Fixed
- A scene-break line (`---` on its own) or a quoted line (`>` at the start) typed by hand now turns into its visual line/indent immediately, instead of staying as plain dashes or a plain `>` until the chapter was closed and reopened. Also fixed: pressing Enter right after typing one of these used to do nothing at all, because of how the line was being hidden in the page — the scene-break line is built differently now so Enter works normally again.

## [1.0.60] - 2026-10-07

### Changed
- Ask Manuscript's dialog is now sized to match its own reading-width text column instead of sharing Settings' wide, two-column width — no more empty space down the right side. The question field is two lines tall and the same width as the answer text, instead of stretching full width at three lines.

### Fixed
- The question field's minimum height was stuck at a much taller generic value from the same kind of CSS specificity tie fixed in Settings for Voice and the writing-primer field — it's back to actually being as tall as its `rows` say.

## [1.0.59] - 2026-10-07

### Changed
- Ask Manuscript is now a large dialog (the same size as Settings) instead of its own full-page view, closing with its own Close button, by clicking outside it, or with Escape. The question field stays pinned at the bottom, with the answer and its sources scrolling in their own area above — so a long answer never pushes the question field out of view, the same convention Claude, Gemini, and ChatGPT use.
- The explanatory text above and the empty-state hint below the question field are gone — the same information now lives in the field's own placeholder text.
- "Versions per chapter" is now just "Revisions" — shorter, with the "?" tooltip still there for anyone wondering what it means.

## [1.0.58] - 2026-10-07

### Fixed
- Prose language, Reader, and Versions per chapter now line up on the same row in Settings — Reader's input used to sit a few pixels lower than the other two, since it was the only one of the three without a "?" tooltip button holding its label to the same height. Reader now has one too.
- Prose language, Reader, and Versions per chapter are equally wide, matching the row below them (POV/Tense/Viewpoint) — Prose language no longer takes up twice the width for no reason.
- Voice and the writing-primer text were rendering at a much larger serif size (matching manuscript prose) than intended, because of a CSS specificity tie going the wrong way. Both are back to their intended compact size, matching the chapter cards in the left panel.

## [1.0.57] - 2026-10-07

### Changed
- "Suggest from model" is now a clear button right next to the Context window field in Settings, instead of a faint link underneath it.
- "View AI context…" moved from Settings to the Tools menu — it inspects what was actually sent to the model, which fits better alongside Proofread and Ask Manuscript than among the writing settings.

## [1.0.56] - 2026-10-07

### Changed
- Prose language, Reader, and Versions per chapter now sit side by side in Settings' General card, and so do POV, Tense, and Viewpoint — matching how they're grouped already, and leaving more height for everything below.

## [1.0.55] - 2026-10-07

### Changed
- The Settings dialog now grows taller on a tall window instead of staying capped at a fixed height — less or no internal scrolling needed to see everything, with the same graceful scroll-within-the-dialog fallback on a shorter window.

## [1.0.54] - 2026-10-07

### Changed
- The Settings dialog's explanatory sentences under each field no longer sit permanently on the page — they were taking up a lot of its height. Each field's label (and the dialog's own title, and the AI settings heading) now has a small "?" next to it; hover or focus it to see the same explanation as a tooltip.

## [1.0.53] - 2026-10-07

### Changed
- Settings is now a large dialog opened from the top bar, instead of its own full-page view. It closes with its own Close button, by clicking outside it, or with Escape — returning to exactly the chapter or view you had open, instead of navigating away from it. Fields are reorganized into three clearly labeled groups — General, Illustrations, and AI settings — with "Versions per chapter" moved out of AI settings and into General, next to Prose language and Reader.

## [1.0.52] - 2026-10-07

### Fixed
- "Summarize chapter" asked the model for only a very small reply budget (far smaller than every other short-answer prompt in the app). A model that thinks or plans before writing its actual answer — increasingly common among local models, reasoning ones especially — could burn through that budget before ever reaching the summary, coming back empty or with just its own unfinished preamble (which can look like the chapter's opening echoed back). The budget is now generous enough to leave room for that before the real 2-4 sentence summary.

## [1.0.51] - 2026-10-07

### Changed
- Reorganized the manuscript's top bar. Brainstorm, Synopsis, Development method, Briefs, and Timeline — previously a vertical list in the left panel — are now tabs on a single top row, next to the manuscript title. The remaining actions are grouped into two dropdown menus, "File" (Backup, Export for other apps, Import lore, Publish) and "Tools" (Convert markers, Ask Manuscript, Proofread), with Settings and the renamed "Find/Replace" staying as direct buttons. This clears up the crowded, sometimes overlapping row of buttons the top bar used to show at normal window widths.
- The left panel is now narrower, holding only the chapter list and a word-count/goal indicator at the bottom. The Story Bible panel on the right is correspondingly wider, with more room for longer alias lists, trait text, and mentions.

## [1.0.50] - 2026-10-07

### Added
- A new "Update…" button on a Story Bible fact that changes over the story (anything but Identity) jumps straight to Add fact, pre-filled with the same category and focused, instead of requiring you to retype the category by hand. A short note now explains what adding a claim under an existing category actually does: it offers to replace it, keeping the earlier value visible in History, anchored to the chapter you're writing.

### Changed
- "Edit" (which corrects what a claim always was) and "Update…" (which marks it as changing from this chapter onward) are now visually distinct actions on each fact, instead of one easy-to-miss "Add fact" form doing double duty for both.

## [1.0.49] - 2026-10-07

### Changed
- Creating a new Story Bible card no longer asks which category ("Identity", "Trait", etc.) the first fact belongs to — the right one is chosen automatically. Adding further facts to an existing character now offers a short, relevant list ("Trait", "Relationship") instead of the full eight-category list, so there's no longer a confusing choice between near-identical categories that worked the same way either way.

## [1.0.48] - 2026-10-07

### Added
- Story Bible entities can now have aliases — nicknames, titles, alter egos — that count as a mention alongside the main name, both in the Mentions tracker and in the lore-relevance filter (`filter_lore_by_relevance`). A character known as "Em" in the prose is now recognized even if her Story Bible card is named "Emma".
- Entities can also have exclusion phrases: specific phrases that should never count as a mention even though the name appears inside them. For a name that doubles as an ordinary word, excluding "rose garden" stops every mention of the flower bed from being read as a sighting of a character named Rose.

## [1.0.47] - 2026-10-06

### Added
- A new "Chapter summary" field, next to Chapter brief — a short note on what actually happens in the chapter, written by hand or generated with a new "Summarize chapter" button. Earlier chapters' summaries now feed Draft, Extend, Elaborate, and Beat for later chapters, in story-time order, so the model can keep track of what has already happened without needing each earlier chapter's full prose in context. A chapter nobody has summarized yet is simply left out — nothing required, nothing breaks.

## [1.0.46] - 2026-10-06

### Fixed
- The Timeline / Plotlines matrix no longer gets squeezed into a cramped scrolling box of its own — a CSS quirk (setting only horizontal overflow still forces the browser to treat the box as scrollable on both axes, which collapsed its height inside the page's flex layout) had it shrinking down to a sliver with a tight inner scrollbar. The page scrolls normally again.
- The matrix's chapter-column headers and thread-row labels now stay in view (frozen, like a spreadsheet) while scrolling in either direction, instead of scrolling out of sight and leaving the grid impossible to read at a glance.

## [1.0.45] - 2026-10-06

### Added
- Publish got a new "Paragraph style" option: the long-standing "blank line between paragraphs" look, or a new "indented, no blank line" classic book style (RTF, ODT, HTML, ePub, PDF, and plain text). A chapter's opening paragraph is left flush, as in print. Markdown is unaffected — a blank line is what makes a paragraph a paragraph there.

## [1.0.44] - 2026-10-06

### Added
- An empty chapter now shows its brief as faint ghost text right in the editor — a template to write over — instead of only in the collapsed "Chapter settings" panel. Falls back to the usual hint when there's no brief yet; disappears the moment you start writing for real.

## [1.0.43] - 2026-10-06

### Added
- A paragraph starting with `>` now renders as a quoted block — indented, with a rule down the side — the way a letter or note read aloud is set in print. Several `>` lines in a row share one continuous rule. Cosmetic only: the marker stays in the saved text, and formatting inside a quoted line still works.

## [1.0.42] - 2026-10-06

### Fixed
- Typing straight into a brand-new, empty chapter could silently lose the very first paragraph once a later paragraph break was added — the editor now always starts with a real paragraph to type into, instead of leaving that first line as text outside any block.

## [1.0.41] - 2026-10-06

### Added
- A paragraph containing only `---` now renders as a scene-break rule in the editor, instead of showing as literal dashes. Purely visual — the saved text is unchanged, so export, word count, and everything else still sees `---`.

## [1.0.40] - 2026-10-06

### Added
- Darlings — "kill your darlings," but keep the bodies. Select a passage and "Cut to Darlings" from the right-click menu to pull it out of the chapter without deleting it for good; it lands in a "N darlings kept" tray with every other cut passage in the book, where you can restore it to its spot or discard it for good. A cut or restore gets its own row in the chapter's history too.

## [1.0.39] - 2026-10-05

### Added
- Auto-hiding side panels — pin (📌) stays the default, exactly like today, but a new unpin toggle (📍) in the Chapters panel and the Story Bible lets either one shrink to a thin edge strip and slide back out over the manuscript when you hover near it, instead of always taking up space.

## [1.0.38] - 2026-10-04

### Added
- Placeholders — drop a marker mid-draft without breaking your flow ("what was this character's last name again?") from the right-click menu at your cursor, then keep writing. A small pin shows where it sits in the text; click it to see the note, edit it, or mark it resolved. Chapters with an open one get a small dot in the chapter list, and a compact "N placeholders to come back to" panel lists every one in the book with a jump to its chapter.

## [1.0.37] - 2026-10-03

### Changed
- Brainstorm's "Ask…" is now "Talk it through…" — a real back-and-forth chat instead of a single question and answer. The AI sees your whole story and the notes already on the board, and remembers the conversation turn to turn, like a thinking partner you can keep talking to. The conversation itself is never saved — close the window and it's gone — but each of its replies gets its own "Add to notes" button, so you only keep the ideas you actually want.

## [1.0.36] - 2026-10-03

### Fixed
- Character/entity Interview now also sees locked facts about other Story Bible entities mentioned in the conversation — either because the interviewee's own facts already name them (e.g. a relationship), or because the author asks about them directly. Previously an Interview could only ever see the one entity's own card, so asking about anyone or anything else gave the model nothing to work from except inventing an answer — risking a contradiction with what was actually established elsewhere. One level only: a mentioned entity's own mentions aren't chased further.

## [1.0.35] - 2026-10-02

### Added
- "Export for other apps" — a new, separate export next to Backup that writes a [StoryCore](https://github.com/ocedo-apps/StoryCore)-shaped JSON snapshot of the manuscript: locked, visible Story Bible facts (grouped by kind — characters, locations, objects, groups, events, concepts) and chapters, for a sibling app such as ComicBook AI to import. A snapshot, not a live link — unlocked, flagged, or hidden-from-the-model facts are never included, the same visibility rule Draft itself uses.

## [1.0.34] - 2026-10-02

### Added
- Two new Guide sections documenting the last two releases: "Keeping a large imported Story Bible relevant" (Story Bible & World), explaining the new lore-relevance filter toggle, and "Ask about a chapter or a passage" (Revise the Manuscript), explaining the new free-form craft-feedback feature. The map of StoryBook AI and the "Which tool do I need?" overview were also updated to mention the new Ask feature.

## [1.0.33] - 2026-10-02

### Added
- "Ask about chapter…" — a free-form question to the Review model about the chapter's craft (pacing, tension, voice, whether the ending lands), with a system prompt that explicitly encourages honest, critical feedback instead of politely hedging. Two ways to use it: a new button next to Analyze asks about the whole chapter, or mark a passage in the text and choose "Ask…" from its menu to ask about just that passage (with surrounding context). The answer is a read-only reply — nothing is changed or saved, same as Ask Manuscript.

## [1.0.32] - 2026-10-01

### Added
- An optional, off-by-default setting ("Only show relevant lore for Draft") that filters imported lore facts (not facts established by the manuscript itself) out of the Draft prompt's Story Bible section unless the fact's own entity, or — for an Event entity — one of its participants or its location, is actually mentioned in the chapter. Pin an individual lore fact to always include it regardless, with the same cycle button already used for story-time position overrides. Addresses a tester's report that a large imported Story Bible buries the handful of facts actually relevant to the chapter being written, and that cross-referenced facts (e.g. a sponsorship event whose participant is named elsewhere, but which is never itself named in the text) could be missed entirely.

## [1.0.31] - 2026-10-01

### Added
- A new Guide section, "An AI server on another computer on the network" (Help & Troubleshooting), walking through connecting to Ollama or LM Studio running on a different machine on your LAN: which engine to pick (only "LM Studio / other local server" exposes a server-address field — the Ollama engine always points at localhost), the address format, and the server-side settings (OLLAMA_HOST/OLLAMA_ORIGINS for Ollama, Serve on Local Network/Enable CORS for LM Studio) plus the firewall rule needed on the other machine.

## [1.0.30] - 2026-09-30

### Changed
- "Check for updates" now opens a proper dialog instead of a small line of text on the home screen — easy to miss feedback from a tester's report ("it just flashes"). The dialog shows the checking/up-to-date/update-available states clearly, with a download link and a link to the full changelog when a newer version exists.

## [1.0.29] - 2026-09-30

### Added
- The desktop app can now check for updates: a "Check for updates" button on the home screen compares the running app against the latest GitHub release and links straight to it when a newer one exists. Desktop-app-only, same as the Ollama helper above. Every push to main now also publishes a GitHub Release with the Windows installer attached (instead of only the 90-day workflow-run artifact), so there's a stable link to check against and to actually download.
- Clicking a `storybookai://` link (from anywhere, including a plain browser tab) launches the desktop app and runs the same update check, opening the release page directly if one is available — the fallback path for anyone running StoryBook AI manually instead of through the desktop app.

### Changed
- The Guide's privacy section no longer claims "no update checks against GitHub" — that stopped being true once the desktop app could check for its own updates. The core promise is unchanged and still holds without qualification: StoryBook AI itself never sends your manuscript anywhere. The desktop app's optional update check only ever asks about its own version, never your text, which it doesn't have access to.

## [1.0.28] - 2026-09-30

### Added
- The desktop app (see roadmap-ideas.md #35) now helps with the first step of connecting a local AI: when it can't find Ollama yet, an "Install Ollama" button opens Ollama's official download page in your system browser, and — on an NVIDIA graphics card — a rough size suggestion ("this computer can likely run a model around 7-8 billion parameters") based on the card's VRAM. Both are desktop-app-only; nothing changes for anyone running StoryBook AI in a plain browser tab.

## [1.0.27] - 2026-09-30

### Added
- Character cards now have Goals and Fears fields alongside Looks and Personality — Draft reads them the same way.
- Event cards now have Where (a Location) and Who was there (Characters present) — structured links to existing Story Bible cards, not free text.
- A Location card now shows "Events here" and "People here", read straight off which Events are placed there and who's in them — nothing to fill in on the Location card itself, so there's only one place to keep it up to date.

### Changed
- Deleting a Character or Location now also clears it out of any Event's Where/Who was there, instead of leaving a dangling reference.
- "Extract facts" on the Synopsis and on any chapter or scene brief — the same planning-content pipeline Brainstorm notes got in 1.0.25, now covering all three sources the roadmap called for. A chapter or scene brief's candidates are attributed to that chapter (and scene, when extracted from a scene's own brief) the same way Interview-extracted facts already are, so they're gated by the same story-time visibility rule; Synopsis, like Brainstorm and Lore, isn't tied to any one chapter.

## [1.0.25] - 2026-09-30

### Added
- "Extract facts" on each Brainstorm note — the same review-queue pipeline Chapter, Interview, and Lore import already use, now reachable from planning material too, so an idea written naturally in a note doesn't have to be manually re-typed into Story Bible. Uses a new extractor prompt tuned for planning text: a hedged or speculative claim ("Nora may discover…") keeps its own hedge in the extracted candidate rather than being flattened into a flat, false-certain claim — it still only ever produces a candidate for review, never locks automatically. Proposed and flagged facts in the review queue now show which source they came from (Chapter, Interview, Lore, or Brainstorm) when known.

## [1.0.24] - 2026-09-30

### Changed
- Reworked the Handbook's "From interview to story" section for readability: shorter paragraphs, and the two techniques (a chapter-locked fact applying from the chapter's first page vs. linking a fact to a specific scene) are now each under their own short lead-in line instead of running together as one long explanation.

## [1.0.23] - 2026-09-30

### Added
- Facts extracted from an Interview can now be linked to a specific scene within a chapter, not just the chapter as a whole. For a chapter split into scenes, the "As of" picker lists its scenes alongside "Whole chapter"; a fact linked to a scene stays invisible to Draft until that scene's own pass, rather than from the whole chapter's first page — solving the mid-chapter-reveal problem the Handbook already described (a friend turning out to be the antagonist partway through a chapter, say), provided the author drafts scene by scene rather than the whole chapter in one pass. The Handbook's "From interview to story" section now walks through this with that exact example.

## [1.0.22] - 2026-09-30

### Changed
- The Handbook's "From interview to story" section now explains that a locked fact is tied to a chapter as a whole, not a point within it — important for a mid-chapter reveal (a friend turning out to be the one who hurt the protagonist's wife, say), where locking the reveal as of that chapter makes it visible to Draft from the chapter's very first page, not just from the reveal onward.

## [1.0.21] - 2026-09-30

### Added
- Interview's "Extract facts" now shows "As of chapter" — a dropdown, in story-time order, for which chapter these facts belong to in the plot's own chronology. Draft only sees a fact from that point in the story onward, so this matters for anything that could only become true partway through (e.g. a character's feelings about someone he hasn't met yet). Previously this was decided silently by whichever chapter happened to be open in the editor, with no way to see or correct it before locking a fact into the wrong point in the story.

## [1.0.20] - 2026-09-30

### Added
- A "Keep both" option next to Lock/Merge and Reject when a proposed fact conflicts with an existing one. The conflict check only knows "same entity, same predicate, different wording" — it has no way to tell a genuine contradiction from two independent facts that happen to share a broad predicate like Trait (a sexual orientation and a monogamy preference, say, share zero words and get flagged as if they contradicted each other). "Keep both" locks the new fact without retiring the one it was checked against, for exactly that case.

## [1.0.19] - 2026-09-30

### Fixed
- The fact-review queue could scroll its own "Review facts" heading and Close button out of view on a long list — the whole card scrolled as one block. Only the list of proposed facts scrolls now; the heading and Close stay put.

### Changed
- Proposed-fact text fields are shorter by default (2 lines instead of 3) — a locked fact is almost always a short claim, not a paragraph.
- The review queue's title is now "Review facts" instead of the more generic "Review".

## [1.0.18] - 2026-09-30

### Fixed
- The Interview card's info column (title, portrait, personality) needed its own scrollbar once the portrait was added — the card's fixed height hadn't grown to match. Made the whole card taller instead, so nothing on the left needs to scroll.

### Changed
- The question field now sends on Enter, like an ordinary chat box, instead of only inserting a line break. Shift+Enter still adds a line break for a multi-part question.

## [1.0.17] - 2026-09-30

### Fixed
- Extract facts on an Interview could genuinely hide its own result: the fact-review queue opens itself automatically whenever a new pending fact appears, but it shares the same stacking layer as every other modal — so it could open right behind the still-open Interview card, invisible. The review queue now always wins that stacking fight.

### Changed
- "Extract facts" is now an orange primary button instead of a plain text link, matching Ask and every other main action in the app, so it's easier to spot.

## [1.0.16] - 2026-09-30

### Added
- Interview now shows the entity's own portrait (its first Story Bible picture) at the top of the info column, right below the title — matching a mockup shared by the author. Falls back to the same initial-letter placeholder the small chat avatars already use when the entity has no picture yet.

## [1.0.15] - 2026-09-29

### Added
- The Home page's "Connect a local AI" section now collapses — Engine and model rarely change once set up, so there's no reason for the controls to take up space on every visit. It opens by default whenever there's nothing connected yet or something's wrong, and collapses once it's working; a status line stays visible either way, and a manual toggle always overrides the default.

## [1.0.14] - 2026-09-29

### Changed
- Styled the Home page's "Connect a local AI" box to match the rest of the page: same card background as a manuscript's shelf card (it was using a tinted accent color instead), and full-width instead of an oddly narrow fixed measure it had accidentally inherited from Settings' own styling. Also widened the gap before "Start a new manuscript" now that there's a full card sitting above it.

## [1.0.13] - 2026-09-29

### Changed
- Removed the static "Getting started with a local AI" three-card explainer from the Home page — now redundant with the working "Connect a local AI" section above it. Its one piece of unique information (where to get Ollama if you don't have a local AI server yet) moved into that section's own "not connected" message instead of disappearing.

## [1.0.12] - 2026-09-29

### Added
- The Home page now has a real "Connect a local AI" section — Engine, server address, and model pickers — right below the header, usable before creating a manuscript. Previously, connecting your model was only possible from Settings, which only existed once a manuscript was open, even though the app's own onboarding text told you to connect first, and the "Connect a local AI" button in the Guide only ever opened more explanatory text, never an actual connection form. Engine/server/model were already global settings (not tied to any one book), so nothing had to change to make them reachable from Home too.

### Added
- Settings now has its own "← Back to manuscript" link. Previously the only way out was the header logo, which exits the whole manuscript back to the shelf rather than just closing Settings — a tester never found the (unlabeled) alternative of clicking a chapter in the rail underneath.

### Fixed
- The Brainstorm hint told authors to "drag a note into the send column when it should become plot" — but no column is labeled "send" (it's "To synopsis"), and the app has a separate, unrelated "Plotlines" feature, so "become plot" pointed at the wrong destination. Reworded to name the actual column.
- A long brainstorm note (a tester's ~400-word one) had nothing capping its height in the "To synopsis" column, so it grew to fill the whole column and pushed every other note out of view. Long notes now scroll within their own card instead.

### Fixed
- Found the actual bug behind the empty extraction results, using the new raw-response view: the local model returned a bare `[...]` array of facts instead of the `{"facts": [...]}` object the prompt's example nests it in — valid JSON on its own, just one bracket layer flatter than expected. The old parser assumed the response always opened with `{` and mis-sliced it into several comma-joined objects with no enclosing bracket, which failed to parse and, in salvaging the pieces, lost the very bracket that recovery needed. The parser now recognizes either shape.
- Also caught and fixed a genuinely wrong instruction along the way: the Interview extraction prompt flatly said the interviewee always answers in the first person. That's only true for a character — asking about a place, object, group, event, or concept (like "Henrik's apartment") is answered in the third person, naming the subject directly. Harmless in the one case seen so far, since the narration named the subject every time regardless, but worded to no longer assume one grammatical person over the other.

### Added
- AI Context Inspector ("Show AI context" in Settings) now shows the model's raw reply alongside what was sent, for fact extraction (Interview and chapter). Diagnosing an extraction that came back empty or wrong required guessing blind at what a local model actually returned — this makes the real response visible without needing a developer console.

## [1.0.8] - 2026-09-29

### Changed
- Extract facts (Interview and chapter extraction) now explicitly names age, relationship status, and occupation as examples of the "trait" fact type, and Interview extraction now says explicitly that a hedged or approximate self-description ("let's say 35", "in my mid-thirties") is still a fact worth extracting, in the interviewee's own words. A tester's answer clearly stated an age and a relationship status and the extractor still found nothing — most likely because neither obviously fit any predicate's one-line description as written before, and a hedge read as a guess to rule out rather than the character's own way of putting it.

## [1.0.7] - 2026-09-29

### Fixed
- Extract facts on an Interview could show a raw, untranslated parser error ("Extractor returned no JSON object.") when a weaker local model failed to produce any JSON at all instead of the expected empty result — now treated the same as "found nothing," with the same friendly message, in both Interview and chapter extraction.

### Changed
- Tightened the Interview fact-extraction prompt to reduce the chance of a local model straying into explanatory prose instead of the required JSON: simplified one rule that invited reasoning about edge cases, and added an explicit "respond with only the JSON object" instruction at the end (models tend to follow instructions placed right before they start generating more reliably than ones stated only at the top).

## [1.0.6] - 2026-09-29

### Fixed
- Extract facts on an Interview transcript could come back empty even when the character had clearly stated facts — because they always answer in the first person ("my favorite food is..."), and the extractor's prompt (shared with chapter/lore extraction, written for third-person narrative) never told the model that "I"/"my" in an interview turn means the interviewee. Interview extraction now uses its own prompt that names the interviewee up front and says explicitly what their pronouns resolve to.

## [1.0.5] - 2026-09-29

### Changed
- Interview widened into a two-column layout: character info and personality stay in a fixed-width column on the left, while the conversation itself — questions and replies — gets a wide column on the right with real room to breathe, instead of squeezing everything into one narrow strip. Stacks back into a single column on narrow screens.

## [1.0.4] - 2026-09-29

### Fixed
- The tester confirmed 1.0.3's streaming fix actually worked — a reply was coming through — but the transcript area where it appears was rendering almost zero pixels tall, so the reply was there and invisible. The card used `max-height` on a flex column whose middle section fills leftover space; without a *definite* height to compute "leftover" from, that middle section collapsed instead of expanding. Switched to a fixed height, which is also just how a chat window should behave regardless of how much history it holds.

## [1.0.3] - 2026-09-29

### Fixed
- Interview still hung with no reply even after 1.0.2's timeout — the tester confirmed other AI features (Extend/Elaborate) worked fine, which was the key clue: Interview was the one place still using a single non-streaming request for the Writing model, waiting for the entire reply with zero visible feedback until it was fully generated. Every other Writing-model call already streams token by token. Interview now does too — the reply appears as it's written, like the rest of the app, instead of sitting silent until (or unless) the whole thing arrives at once.

## [1.0.2] - 2026-09-29

### Fixed
- Interview (and its "Extract facts" pass) had no timeout on the underlying model request at all — if the local server hung (still loading the model, a stalled connection) the Ask button stayed dimmed indefinitely with no error, since nothing ever resolved to clear it. Both now give up after two minutes with a clear error instead of waiting forever.

## [1.0.1] - 2026-09-29

### Fixed
- Interviewing a character could silently do nothing when a question was sent while an unrelated AI action elsewhere in the app was still running — the question vanished from the field with no reply, no error, and no loading indicator. The global "busy" state that blocked it wasn't visible to the Interview card, so its Ask and Extract facts buttons stayed enabled and gave no feedback. Now: the card disables its controls and explains why whenever something else is in flight, and if it's ever hit anyway, it shows an error instead of failing silently.

## [1.0.0] - 2026-09-29

First release labeled 1.0. Highlights from the stretch leading up to it:

### Added
- Mac (`starta.command`) and Linux (`starta.sh`) launcher scripts, matching the existing Windows `starta.bat` — install dependencies on first run, then start the app.
- Timeline and Plotlines merged into a single board: chapters as columns in story-time order, threads as rows, a continuous colored bar wherever a thread runs through a chapter.
- A dedicated ten-color palette for Plotline threads, freely chosen per thread via an Edit thread card (name, color, optional description shown as a tooltip).
- "Hide from AI" option per thread — keeps it visible in the writing view while excluding it from the Draft/Extend/Elaborate prompt.
- A chapter's tagged threads now show as a reminder above its title while writing, and (unless hidden) as guidance in the Draft/Extend/Elaborate prompt.
- Generic multi-article lore import: paste or upload text, it splits on headers into candidate articles you can pick from before extracting.
- A short, always-visible "Chronological position" label next to each chapter's story-time field, replacing a placeholder that no longer fit.

### Fixed
- The Context Window and Versions-per-chapter settings fields no longer clamp mid-keystroke while typing a value outside the current range.
- Extract Facts no longer creates duplicate Story Bible cards for the same person — entity identity is now derived deterministically from the label instead of trusted from the model.

### Changed
- `package.json` version bumped from `0.1.0` to `1.0.0`.
