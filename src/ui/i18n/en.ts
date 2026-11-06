import type { GuideCategoryId, GuideMainSectionId } from "../GuidePanel";
import type { HandbookCategoryId, HandbookSectionId, HandbookStep } from "../HandbookPanel";

const guideCategories: Record<GuideCategoryId, string> = {
  "getting-started": "Introduction",
  "basic-writing": "Basic Writing",
  "the-writer": "The Writer",
  images: "Images",
  "focused-workflow": "Focused Workflow",
  "advanced-tools": "Advanced Writing Tools",
  "world-bible": "Story Bible",
  "polish-publish": "Polish & Publish",
  troubleshooting: "Troubleshooting"
};

const guideSections: Record<GuideMainSectionId, { heading: string; body: string }> = {
  privacy: {
    heading: "A fully closed digital safe",
    body: "kaampi Write is built around one rule: your manuscript is your property, and it should never leave your computer. There is no way out to the internet in the app itself — no API keys for ChatGPT, Claude, or other cloud services (that's not a missing feature, it's a deliberate choice), and the fonts ship bundled with the app instead of being fetched from anywhere. Your text lives only in your browser, and the AI model runs only on your own processor. The separate desktop app (optional) can check whether a newer version of itself exists — never of your manuscript, which it doesn't even have access to. Whatever you're writing — a diary, trade secrets, or your next big fantasy epic — every letter stays with you."
  },
  author: {
    heading: "Author beats AI, always",
    body: "The model proposes; you decide. A detail the model invents in prose stays a proposal — shown with a light dashed underline — until you lock it into the Story Bible. Nothing crosses into canon on its own."
  },
  chapters: {
    heading: "Chapters: Draft, Recast, Analyze",
    body: "Draft writes new prose from what is established. Recast rewrites the same chapter in a different point of view or tense, keeping the same events. Analyze reviews a chapter for common craft issues without rewriting a word — telling instead of showing (instead of \"Lisa was furious,\" it might suggest \"Lisa slammed the door so hard the coffee cups rattled\"), filler dialogue, or a beat that clashes with a locked trait. Reader (in Settings, and per chapter) sets who it is written for — Board book through Adult — so sentence length and word choice match that age. Below the text, Rare and Clichés toggle two optional highlights — uncommon words for that reader, and phrasing that reads as AI-generated (\"a testament to\", overused em dashes) — one at a time, off by default."
  },
  "editor-tools": {
    heading: "The right-click menu",
    body: "Select a passage and right-click for Extend (continues on from where the selection ends), Elaborate (expands the passage itself), Rewrite… (give your own instruction, like \"make her angrier\"), Illustration prompt… (see Images), and Manual editing (rewrite just the marked passage yourself, by hand — the rest of the chapter stays as it was). Right-click with nothing selected instead, and you get a single option, Write a beat…: describe what happens next in one line, and the model writes just that — a short paragraph, not the rest of the scene — dropped in exactly at your cursor. Selecting a passage also shows a small Bold/Italic/Underline toolbar above it (or Ctrl+B/I/U) — display formatting only, saved separately from the text itself, so it never reaches the model."
  },
  "add-picture": {
    heading: "A picture for the chapter",
    body: "Add your own image — JPEG, PNG, or WebP — to the top of a chapter. It's decorative, not AI-generated: pick a file from your computer and it appears above the chapter's opening lines, carrying through when you publish to HTML, ePub, or PDF."
  },
  "illustration-prompts": {
    heading: "Illustration prompts",
    body: "Select a passage and choose Illustration prompt… from the right-click menu. The model writes an image-generation prompt — not a picture — built from the passage, your locked Story Bible facts, and your manuscript's illustration style, ready to paste into whatever image generator you use; kaampi Write stays fully local and never generates the image itself. Set a default style under Settings → Illustration style, or open the style library to save named, reusable styles — each with its own genre tags and an example image — so every prompt keeps a consistent look across the book."
  },
  "brainstorm-synopsis": {
    heading: "Brainstorm & Synopsis",
    body: "Brainstorm is your private corkboard — scratch paper or a wall of sticky notes, one note per idea, draggable, no order required. Draft never leans on a note you haven't lifted into Synopsis. (Ask the model about your notes, or have it extend or elaborate one, and it naturally reads what you're asking about — but nothing from there becomes canon or leaks into chapter-writing on its own.) Lift the ideas that stick into Synopsis: the shape of the whole book, in a few sentences. It's what the AI model leans on when it later helps you write chapters."
  },
  method: {
    heading: "Development method",
    body: "An optional, ready-made set of steps for growing a spark into a shape — Snowflake, Three-Act Structure, Save the Cat, or Hero's Journey. It never keeps anything of its own: a beat-based method's beats become threads in Plotlines, and Snowflake's steps write straight into Synopsis, the same as any other note you lift there. Switching method, or choosing none, never deletes anything either of those already hold."
  },
  plotlines: {
    heading: "Plotlines",
    body: "Track which thread runs through which chapter in a table, so a thread that has gone quiet for ten chapters is easy to spot."
  },
  scenes: {
    heading: "Scenes",
    body: "A long chapter can be split into scenes — pick where one ends and the next begins, name it, add a short note. Once a chapter has scenes, Draft, Recast and Analyze can each target just one of them."
  },
  timeline: {
    heading: "Timeline",
    body: "Reading order and story-time order are not always the same thing. Give a chapter a story-time note, and see how the book falls when sorted by when things actually happen, next to where it sits in the manuscript."
  },
  "story-bible": {
    heading: "Story Bible",
    body: "The single source of truth for your story's facts — who someone is, where a place is, what a name means. A fact starts as a proposal, from you or from an extraction pass, and only becomes locked truth once you approve it. Locked facts are what the model is told it must not contradict — if a new proposal contradicts an already-locked fact (say, someone suddenly has brown eyes when you've locked blue), it gets flagged extra clearly in the review queue. Open a card and press Interview to chat about it — in a character's own voice, or, for a place, object, group, or concept, with a worldbuilding collaborator who discusses it in the third person — built only from what is locked so far. A way to hear a voice or explore lore and spot gaps, not to create new canon. If something said is worth keeping, press Extract facts to propose it for the Story Bible, same review queue as any other extraction — nothing is added until you approve it. Ctrl+click (Cmd+click on Mac) a known name anywhere in your prose to jump straight to its card — a plain click still just places your cursor there, as usual."
  },
  continuity: {
    heading: "Continuity warnings",
    body: "When a chapter can see a fact that was only established later in the manuscript, it is flagged — not necessarily wrong, maybe it is a flashback, just worth a glance. Proofread goes further: it checks a person or object's recorded place across the whole story, in story-time order, and flags a jump that looks impossible or unexplained given how much time passed."
  },
  proofread: {
    heading: "Proofread",
    body: "A last pass over the whole manuscript: grammar, repeated scenes, style and mood drift between chapters, age-appropriateness, a continuity check, a look for planted details that never pay off (a gun shown in chapter 4 that no one ever fires), and a fact check against the whole book. When Reader is set to a children's or YA level, it also flags swearing, violence, or explicit content that does not fit that age. Notes only — nothing is rewritten for you. It pauses and resumes, and only re-checks what has changed."
  },
  "ask-manuscript": {
    heading: "Ask Manuscript",
    body: "Ask a question about your own story and get an answer built only from what is actually written — with the chapters it came from, so you can check it yourself."
  },
  publish: {
    heading: "Publish",
    body: "Export a clean reading copy — Markdown, RTF, ODT, HTML, ePub, or PDF. Brainstorm never leaves the book; only the manuscript itself does."
  }
};

const handbookCategories: Record<HandbookCategoryId, string> = {
  "getting-started": "Getting Started",
  "how-you-work": "How You Can Work",
  plan: "Plan the Story",
  "story-bible-world": "Story Bible & World",
  writing: "Writing",
  revise: "Revise the Manuscript",
  "images-publish-backup": "Images, Publishing & Backup",
  "writing-tips": "Writing Tips",
  help: "Help & Troubleshooting"
};

const handbookSections: Record<
  HandbookSectionId,
  { heading: string; body: string; steps?: HandbookStep[]; tip?: string }
> = {
  "connect-local-ai": {
    heading: "Connect a local AI",
    body: "kaampi Write never talks to a cloud AI service. Drafting, rewriting, analysis, and interviews all run against a model you install and run yourself, on your own computer — nothing to subscribe to, no API key field anywhere in the app, nothing that leaves your machine.",
    steps: [
      {
        heading: "Why a local model, not a cloud one",
        body: "This isn't a missing feature — it's the whole point of kaampi Write. Your manuscript is your property, and it should never have to leave your computer to be useful. Running the model locally is what makes that promise literally true, not just a policy: there is no server on the other end of the connection to send your text to in the first place."
      },
      {
        heading: "1. Install a local AI engine",
        body: "An engine is the program that actually runs a model on your computer; kaampi Write talks to it, and it talks to the model. If you don't already have one, we recommend Ollama — free, from ollama.com, and the simplest to get running. Prefer something else? LM Studio and other local servers work too."
      },
      {
        heading: "2. Choose a model",
        body: "The model is what actually writes and reasons with you — the engine from step 1 just runs it. We recommend one tuned for fiction, for example fluffy/l3-8b-stheno-v3.2 (search \"stheno\" in Ollama). Otherwise, any general chat model works fine — llama3 or mistral, for instance."
      },
      {
        heading: "3. Connect it to kaampi Write",
        body: "Using Ollama? Nothing to configure — kaampi Write finds it automatically on your computer. Using LM Studio or another server instead? Open Settings → Models, choose it under Engine, and paste the server address it shows you."
      },
      {
        heading: "If nothing happens when you draft",
        body: "kaampi Write can't reach your local server. Make sure the engine from step 1 is actually running, and that a chat model is installed in it. Settings → Models shows the engine and address it's trying to use — they need to match what's actually running on your computer."
      }
    ]
  },
  "connection-presets": {
    heading: "Connection presets",
    body: "A preset is a saved shortcut back to one particular engine and server address — useful the moment you regularly talk to more than one.",
    steps: [
      {
        heading: "Who this is for",
        body: "If you only ever use one local server, you'll likely never need this — Settings → Models already remembers your one connection. Presets start earning their keep once you switch between more than one: Ollama for everyday writing, LM Studio for a different model, a test rig on another machine on your network."
      },
      {
        heading: "Save a connection as a tile",
        body: "Settings → Models lets you save an Engine and Server address as a named tile, instead of retyping the address every time you switch between them. Click a tile to make it the live connection again."
      },
      {
        heading: "Edit or remove a tile",
        body: "Each tile expands to show and edit its own settings — an Update button saves changes to that tile, and a delete button removes it. Editing a tile only changes the saved shortcut; it doesn't touch whatever connection is live right now unless you also click it."
      },
      {
        heading: "What's live always stays visible",
        body: "Whatever engine and address kaampi Write is actually using right now shows and stays editable whether or not it happens to be saved as a tile. Saving a tile is purely a convenience for getting back to it later — it's never required to use a connection."
      }
    ]
  },
  "first-book": {
    heading: "Create your first book",
    body: "A title is all kaampi Write actually needs from you to start — everything else is optional, and nothing has to happen in a particular order.",
    steps: [
      {
        heading: "1. Give it a name",
        body: "Type a title and press Enter, or click the arrow next to the field. That's the entire setup — you don't need a Synopsis, a Story Bible, a development method, or any kind of outline before you start."
      },
      {
        heading: "2. Go straight to the page",
        body: "A new manuscript opens with one empty chapter already waiting. Chapters → Chapter 1 → start writing, the same as opening a blank document in an ordinary word processor — click into the page and type."
      },
      {
        heading: "3. Your words are saved as you go",
        body: "kaampi Write saves what you write automatically, a short moment after you stop typing — there's no Save button to remember, and nothing to lose if you close the tab or the app."
      },
      {
        heading: "Reach for AI only when you want it",
        body: "Writing the whole thing by hand is a complete, normal way to use kaampi Write. The AI tools (Draft, Extend, Elaborate, and the rest) sit below the page whenever you decide you want a hand with a particular chapter — never a requirement to get words on the page."
      }
    ]
  },
  "first-chapter": {
    heading: "Your first chapter",
    body: "A chapter is, at its core, two separate things that live in two separate places: a brief describing what it needs to do, and the manuscript itself — the words a reader will actually see.",
    steps: [
      {
        heading: "The brief is an instruction, not prose",
        body: "The brief sits above the page and describes what the chapter needs to accomplish — for you, and for the AI tools if you use them. It never has to be well written; it's a note to yourself, not part of the story. For example: \"Erik arrives at the old railway station. There he meets a woman who seems to know his father. She refuses to explain how, and leaves an old photograph on the table.\""
      },
      {
        heading: "The manuscript is what grows from it",
        body: "Below the brief is the page itself — the actual text of the chapter, the part a reader will see. It's the story that grows out of whatever the brief described, written in as much or as little detail as the brief gave you."
      },
      {
        heading: "Write it yourself, or let Draft start it",
        body: "You can write the chapter by hand from the brief, exactly as you'd write from any outline. Or press Draft to get a full first pass from the model, built from the brief plus everything else already established about the story — something to read, keep, or rewrite, not a final version."
      },
      {
        heading: "A brief isn't a summary",
        body: "The brief describes what should happen, written before the chapter exists. Once the chapter is actually written, a separate field — Summary — records what did happen, after the fact. The two point in opposite directions along the same chapter; Summary gets its own chapter later in this guide."
      }
    ]
  },
  "map-of-storybook-ai": {
    heading: "A map of kaampi Write",
    body: "kaampi Write's tools fall into six rough stages — Explore, Plan, Establish, Write, Review, Finish. The map below moves left to right because that's the easiest way to show it on a page, not because every book actually travels it in that order.",
    steps: [
      {
        heading: "Explore — where ideas get to be uncertain",
        body: "Brainstorm and Interview the world. Nothing here is canon yet; it's a place to try an idea out loud before deciding whether it belongs in the story at all."
      },
      {
        heading: "Plan — where you shape the story",
        body: "Synopsis, Chapter briefs, Scenes, Plotlines, Timeline. These give the story a direction and a shape — as loose or as detailed as you want."
      },
      {
        heading: "Establish — where you decide what counts as true",
        body: "Story Bible, Extract facts, Review, Lock. This is the one stage that actually commits something — a fact only constrains later writing once you've locked it here."
      },
      {
        heading: "Write — where the prose happens",
        body: "Chapters — Draft, Write a beat, Extend, Elaborate, Rewrite. Everything upstream (Plan, Establish) exists to feed this stage; this is the one stage no book skips."
      },
      {
        heading: "Review — where you check what you've written",
        body: "Analyze, Polish, Ask Manuscript, Ask about a passage, Continuity, Proofread, Developmental analysis. Different tools here ask different questions — a chapter-level craft check is a different job than a whole-book pacing check."
      },
      {
        heading: "Finish — getting the book out",
        body: "Images, Language versions, Publish, Backup. The last stage, reached whenever a chapter — or the whole book — is ready to leave kaampi Write."
      }
    ],
    tip: "It's a map, not a required order. Plenty of chapters go straight from Write back to Write, skipping Plan and Review entirely until much later — or never."
  },
  "no-required-workflow": {
    heading: "You don't need to use everything",
    body: "kaampi Write can be used in many different ways. There is no required workflow — the five examples below are starting points, not a menu you have to pick exactly one from.",
    steps: [
      {
        heading: "I just want to start writing",
        body: "Chapter → Write → Next chapter. Plan later, only when you actually need to — nothing stops you from adding a Synopsis or a Story Bible fact in the middle of chapter 12."
      },
      {
        heading: "I want to plan the story",
        body: "Brainstorm → Synopsis → Chapter briefs → Chapters. Shape the story before writing it scene by scene, without committing to a named development method."
      },
      {
        heading: "I want to work in a very structured way",
        body: "Synopsis → Development method → Plotlines → Chapter briefs → Scenes → Timeline → Chapters. Every planning tool kaampi Write has, used together, before the first word of prose."
      },
      {
        heading: "I already have a manuscript",
        body: "Bring in the existing text → Analyze → Story Bible → Revise → Publish. Nothing about starting with finished or partial prose instead of a blank page changes which tools are available to you."
      },
      {
        heading: "I'm coming from another writing tool",
        body: "Bring your manuscript and lore → Import → Review → Keep writing. The same path as above, just starting from material built somewhere else."
      }
    ],
    tip: "You decide how much structure you need — and that answer is allowed to change between books, or between chapters of the same book."
  },
  "three-workflows": {
    heading: "Three complete workflows",
    body: "Three ways of using kaampi Write start to finish, from loosest to most structured. None of the three is more correct than the others — they're different trade-offs between speed and scaffolding.",
    steps: [
      {
        heading: "I write intuitively",
        body: "New manuscript → Chapter 1 → Write → Chapter 2 → Write. As the story grows: Extract facts → Story Bible, to keep continuity without planning ahead. Later: Analyze → Polish → Proofread → Publish. You never have to create a detailed plan at any point in this path."
      },
      {
        heading: "I want to plan first",
        body: "Brainstorm → Synopsis → Chapter briefs → Write chapters → Story Bible → Analyze → Polish → Proofread → Publish. This gives the story real direction before you write a word of prose, without requiring a named dramatic structure."
      },
      {
        heading: "I want to plan a lot",
        body: "Brainstorm → Snowflake → Synopsis → Three-Act Structure / Save the Cat / Hero's Journey → Plotlines → Chapter briefs → Scenes → Timeline → Write → Story Bible + continuity → Analyze → Developmental analysis → Polish → Proofread → Publish. Every tool, in roughly the order it's most useful — the most structured of the three, built for authors who want the scaffolding up before they write."
      }
    ]
  },
  "which-tool-do-i-need": {
    heading: "Which tool do I need?",
    body: "A symptom-first index — find what you're feeling stuck on below, and see which tool actually addresses it.",
    steps: [
      {
        heading: "Finding the story",
        body: "\"I don't know what the story is about.\" → Brainstorm. \"I have an idea but can't pull it into a whole story.\" → Snowflake. \"I have many ideas but no whole.\" → Synopsis. \"I don't quite know who my character is yet.\" → Interview the world. \"I want to try ideas about the character without affecting the book.\" → Interview the world."
      },
      {
        heading: "Shaping the structure",
        body: "\"I need a simple dramatic structure.\" → Three-Act Structure. \"I want more clear beats to work with.\" → Save the Cat. \"The story is about the protagonist's transformation.\" → Hero's Journey."
      },
      {
        heading: "Keeping track as you write",
        body: "\"I need to remember what's actually true.\" → Story Bible. \"I keep losing track of what the chapter should do.\" → Chapter brief. \"The chapter has gotten too complicated.\" → Scenes. \"I keep losing track of different plots and relationships.\" → Plotlines. \"I keep losing track of when things happen.\" → Timeline."
      },
      {
        heading: "Getting unstuck mid-scene",
        body: "\"I'm stuck in the middle of a scene.\" → Write a beat, Extend, or Elaborate. \"This chapter needs to read exactly like an earlier one did, word for word.\" → Attached context. \"I cut something good but I'm not ready to lose it for good.\" → Darlings. \"A small question would break my flow if I stopped to answer it right now.\" → Placeholders."
      },
      {
        heading: "Reviewing what you wrote",
        body: "\"I don't know if the chapter works.\" → Analyze. \"I want AI to tighten the prose itself, not just point things out.\" → Polish. \"I want honest, critical feedback on a specific question.\" → Ask about chapter / Ask about a passage. \"I can't find something again in my long manuscript.\" → Ask Manuscript. \"I want to know if the book's pacing and threads actually hold together.\" → Developmental analysis."
      },
      {
        heading: "Finishing",
        body: "\"The story is done and I want a final line-by-line check before anyone reads it.\" → Proofread. \"I need this book in another language too.\" → Language versions. \"I want to give someone the book to read.\" → Publish."
      }
    ]
  },
  "most-important-principle": {
    heading: "The most important principle",
    body: "kaampi Write contains many features because different authors work in different ways. That doesn't mean every feature has to be used — not using most of them is a completely normal way to write a book here.",
    steps: [
      {
        heading: "Start with the story, not the tools",
        body: "When you hit a problem, choose the tool that helps with that specific problem — never work through the feature list looking for something to use."
      },
      {
        heading: "One tool per stage",
        body: "Explore when you need ideas. Plan when you need direction. Lock facts when something should become established. Write when you know enough to continue. Review when you want to understand what you've written."
      }
    ],
    tip: "The tools should adapt to how you write — not the other way around. If a feature isn't solving a problem you actually have, you're not missing anything by skipping it."
  },
  "brainstorm-free": {
    heading: "Brainstorm – think freely",
    body: "Brainstorm is your private scratchpad. Nothing you put here needs to be decided yet — it's a place to try an idea out loud before you know if it belongs in the story.",
    steps: [
      {
        heading: "Write one note per idea",
        body: "\"What if the woman on the train actually knows Erik's father?\" \"Maybe the lighthouse isn't abandoned?\" \"Would the story work better if the brother were still alive?\" Each goes on its own note, so you can move them around and compare them side by side."
      },
      {
        heading: "Brainstorm doesn't automatically affect the story",
        body: "This is the important part. An idea sitting in Brainstorm doesn't automatically become part of the story, and it shouldn't start quietly steering ordinary chapter drafts just because it exists."
      },
      {
        heading: "You decide which ideas leave the corkboard",
        body: "When you decide an idea should move forward, drag it onto Send to Synopsis. Until you do that, it stays exactly what it is — a maybe."
      }
    ]
  },
  "synopsis-short": {
    heading: "Synopsis – the story in short form",
    body: "Synopsis describes the story as a whole — not any single chapter, but the shape of the entire thing.",
    steps: [
      {
        heading: "What belongs in a Synopsis",
        body: "Who matters, what happens, what the major conflicts are, and where the story is headed. Not scene-by-scene detail — the overview a stranger would need to understand what this book is about."
      },
      {
        heading: "From a Brainstorm note to a Synopsis line",
        body: "Brainstorm: \"What if the woman on the train knows Erik's father?\" Once you decide to use the idea, it can develop into: \"During the journey, Erik meets a woman who turns out to know the circumstances of his father's disappearance.\" That sentence belongs in Synopsis — it's no longer a maybe."
      },
      {
        heading: "How the planning tools relate",
        body: "Brainstorm = maybe. Synopsis = the story's plan. Chapter brief = one chapter's job. Manuscript = the story itself, as actually written."
      }
    ]
  },
  "chapter-briefs": {
    heading: "Chapter briefs",
    body: "A chapter brief describes what a chapter needs to accomplish. It doesn't need to be well written — it's an instruction to yourself, and to the AI when you use the writing tools.",
    steps: [
      {
        heading: "What a brief looks like",
        body: "\"Erik meets the woman in the dining car. She hints that she knew his father but refuses to say how. The chapter ends with her leaving a photograph on the table.\" Rough, functional, written to be useful rather than beautiful."
      },
      {
        heading: "The brief is not the story itself",
        body: "It describes what the story should do in this chapter — not how it's phrased, not the exact dialogue, not the prose. The writing tools turn the brief into the actual chapter."
      },
      {
        heading: "How it fits with Synopsis and the manuscript",
        body: "Synopsis = the whole story. Brief = one chapter. Manuscript = what the reader actually gets."
      }
    ]
  },
  "chapter-summary": {
    heading: "Chapter summary",
    body: "Next to Chapter brief sits a second field, Chapter summary — a short note on what actually happened in the chapter, once it's written.",
    steps: [
      {
        heading: "Before and after",
        body: "Brief = what the chapter should do, written before you draft it. Summary = what the chapter actually did, written after."
      },
      {
        heading: "Writing the summary",
        body: "Write it by hand, or click \"Summarize chapter\" to have it generated straight from the prose you just wrote."
      },
      {
        heading: "Why summaries matter for later chapters",
        body: "Once a chapter has a summary, earlier chapters' summaries feed Draft, Extend, Elaborate, and Beat for later chapters — in story-time order, not just chapter order — so the model can keep track of what's already happened without needing every earlier chapter's full prose crammed into the prompt."
      },
      {
        heading: "Nothing is required",
        body: "A chapter nobody has summarized yet is simply left out of that context. Nothing breaks — it just means that chapter's events aren't available as background for later ones until you add a summary."
      }
    ]
  },
  "development-methods": {
    heading: "Development methods",
    body: "kaampi Write includes several methods that can help you develop or structure the story. They are entirely optional — you can always choose No method, and just write freely instead.",
    steps: [
      {
        heading: "What the methods are for",
        body: "Snowflake, Three-Act Structure, Save the Cat, and Hero's Journey each offer a different way of thinking about a story — some focus on developing content, others on structuring it. The following chapters cover each one."
      }
    ]
  },
  "snowflake-method": {
    heading: "Snowflake",
    body: "Snowflake works well when you have an idea but not yet a whole story. It helps you develop the content step by step, each pass adding more detail than the last.",
    steps: [
      {
        heading: "One sentence",
        body: "\"A journalist returns to her home island to investigate her father's twenty-year-old disappearance.\" The whole story, compressed to its core."
      },
      {
        heading: "One paragraph",
        body: "Develop that core idea with conflict, development, and direction — still short, but no longer a single line."
      },
      {
        heading: "Full synopsis",
        body: "Keep building until you have a coherent description of the whole story, then send it to Synopsis."
      },
      {
        heading: "Write it yourself, or with AI",
        body: "Every step can be done by hand or with AI as support — the method doesn't require either approach specifically."
      }
    ],
    tip: "Snowflake mainly helps answer one question: \"What is this story I'm actually writing?\""
  },
  "three-act": {
    heading: "Three-Act Structure",
    body: "Three-Act Structure works well when you want a simple dramatic backbone for the story, without a long list of named beats to track.",
    steps: [
      {
        heading: "The turning points",
        body: "kaampi Write uses key turning points: Setup, Inciting incident, Break into two, Midpoint, All is lost, Climax, Resolution."
      },
      {
        heading: "These become Plotlines",
        body: "Each turning point becomes a Plotline you can attach to specific chapters in the story."
      },
      {
        heading: "Worked example",
        body: "Inciting incident: \"Nora finds a letter from her missing father.\" (Chapter 3). Later — Midpoint: \"Nora discovers the letter was written after the date her father is said to have disappeared.\" (Chapter 12)."
      }
    ],
    tip: "The method helps you see the story's larger movement. It doesn't write the story for you."
  },
  "save-the-cat": {
    heading: "Save the Cat",
    body: "Save the Cat offers more beats than Three-Act Structure — a finer-grained map of the same kind of journey.",
    steps: [
      {
        heading: "The fifteen beats",
        body: "Opening image, Theme stated, Setup, Catalyst, Debate, Break into two, B story, Fun and games, Midpoint, Bad guys close in, All is lost, Dark night of the soul, Break into three, Finale, Final image."
      },
      {
        heading: "Created as Plotlines",
        body: "Each beat becomes a Plotline. You then decide how — and whether — it actually fits your story."
      }
    ],
    tip: "Any percentage markers the method mentions are landmarks, not rules for exactly where something must happen. Use it as a map, not an answer key."
  },
  "heros-journey": {
    heading: "Hero's Journey",
    body: "Hero's Journey works well for stories where the protagonist's transformation is the real subject of the book.",
    steps: [
      {
        heading: "The twelve steps",
        body: "Ordinary World, Call to Adventure, Refusal of the Call, Meeting the Mentor, Crossing the Threshold, Tests/Allies/Enemies, Approach to the Inmost Cave, The Ordeal, Reward, The Road Back, Resurrection, Return with the Elixir."
      },
      {
        heading: "These too are created as Plotlines",
        body: "Each step becomes a Plotline you can attach to a chapter, same as with the other methods."
      },
      {
        heading: "The journey doesn't have to be literal",
        body: "A character can leave their safe world by moving, starting a relationship, losing their job, discovering a secret, or making a decision that changes their life — no quest or magic required."
      }
    ]
  },
  "method-differences": {
    heading: "The difference between the methods",
    body: "The four development methods split into two different jobs, and it helps to know which one you actually need.",
    steps: [
      {
        heading: "Snowflake develops content",
        body: "Idea → One sentence → One paragraph → Full synopsis → Synopsis. Snowflake is about working out what the story even is."
      },
      {
        heading: "The three beat-methods structure development",
        body: "Three-Act Structure / Save the Cat / Hero's Journey: Method → Beats and turning points → Plotlines → Chapters. These help you arrange a story you already have some grip on."
      },
      {
        heading: "Switching methods later is safe",
        body: "What you've already written in Synopsis, or already created as Plotlines, isn't deleted just because you choose a different method, or decide to go back to writing freely."
      }
    ]
  },
  scenes: {
    heading: "Scenes",
    body: "When a chapter gets long or complicated, it can help to split it into Scenes — smaller, named beats inside the same chapter.",
    steps: [
      {
        heading: "Worked example",
        body: "Chapter 8 – The Lighthouse. Scene 1: Nora arrives on the island. Scene 2: She breaks into the lighthouse. Scene 3: She finds the photographs. Scene 4: Someone locks the door from outside."
      },
      {
        heading: "How Scenes relates to the brief",
        body: "Brief = the chapter's job. Scenes = the path through the chapter — the steps that get it from start to finish."
      },
      {
        heading: "Two ways to split one off",
        body: "In the Scenes panel, \"Split into two…\" picks a paragraph to break at. Or mark the exact text that should become its own scene and choose \"Create scene\" from the selection menu."
      }
    ],
    tip: "You don't need Scenes for simple chapters where you already have the overview in your head."
  },
  plotlines: {
    heading: "Plotlines",
    body: "Plotlines help you follow things that develop gradually through the story, rather than things that happen in a single chapter.",
    steps: [
      {
        heading: "What you can track with a Plotline",
        body: "The main conflict, a relationship, a mystery, a secret, a rivalry, a character's change, or a set of dramatic beats from a development method."
      },
      {
        heading: "Worked example",
        body: "🔴 The father's disappearance. 🟡 Nora and Elias. 🔵 The lighthouse's history. Each color marks a separate thread you can follow across chapters."
      }
    ],
    tip: "You can see how these run through the chapters. If an important subplot suddenly vanishes for ten chapters, it becomes easy to spot — the color just stops appearing."
  },
  timeline: {
    heading: "Timeline",
    body: "Timeline answers one question: when does this happen? It becomes especially useful when chapter order isn't the same as the story's actual chronology.",
    steps: [
      {
        heading: "Chapter order",
        body: "Chapter 1 – 2026: Nora returns. Chapter 2 – 2006: The father disappears. Chapter 3 – 2026: Nora finds the letter. Chapter 4 – 1998: The father meets Elias."
      },
      {
        heading: "Chronological order",
        body: "1998 → 2006 → 2026. The same four chapters, reordered by when the events actually happened rather than when the reader encounters them."
      }
    ],
    tip: "Timeline helps you keep track of the difference between the two orderings, so a time jump stays intentional rather than confusing."
  },
  "scenes-plotlines-timeline": {
    heading: "Scenes, Plotlines, and Timeline",
    body: "These three tools can look similar at a glance, but they answer three different questions.",
    steps: [
      {
        heading: "Three separate questions",
        body: "Scenes: what happens? Plotlines: what develops? Timeline: when does it happen?"
      }
    ],
    tip: "The same event can live in all three without the tools doing the same job — a scene can advance a plotline and sit at a specific point on the timeline, all at once."
  },
  "story-bible-memory": {
    heading: "Story Bible – the story's memory",
    body: "Story Bible gathers information the story needs to remember, so it can tell the difference between what's actually true in the world and what was just a passing detail.",
    steps: [
      {
        heading: "What Story Bible holds",
        body: "People, places, relationships, groups, objects, events, and rules or concepts in the world — anything later chapters need to stay consistent with."
      },
      {
        heading: "From manuscript text to possible facts",
        body: "Suppose the manuscript says: \"Nora walked up the stairs to the lighthouse. She hadn't been there since her father disappeared twenty years ago.\" kaampi Write can identify possible facts from that: \"Nora has a father.\" \"Nora's father disappeared twenty years ago.\" \"Nora has been to the lighthouse before.\""
      },
      {
        heading: "You decide what becomes established",
        body: "You review the suggestions. Only once you decide something should be locked does it become established information kaampi Write can rely on — a suggestion sitting unreviewed changes nothing yet."
      }
    ]
  },
  "what-is-canon": {
    heading: "What does canon mean?",
    body: "Canon is whatever you've decided should be treated as true in the story. Not all text needs to become canon — most of it shouldn't.",
    steps: [
      {
        heading: "A detail doesn't need saving just because it was written",
        body: "If the AI writes: \"Nora pulled the red scarf tighter around her neck,\" you don't need to save the scarf's color just because it happened to appear in the text."
      },
      {
        heading: "Unless it later becomes important",
        body: "If the scarf later becomes important — say it turns up again in chapter 20 — the information may be worth locking at that point."
      }
    ],
    tip: "Story Bible should remember what needs to stay consistent. It doesn't need to become a database of every detail in every sentence."
  },
  "aliases-and-exclusions": {
    heading: "Aliases and exclusion phrases",
    body: "A character, place, or object doesn't always show up in the text under its card's own name — two tools handle the two ways that can go wrong.",
    steps: [
      {
        heading: "Aliases catch other names for the same thing",
        body: "Open a Story Bible card and you can give it aliases — nicknames, titles, alter egos — so a mention under any of them still counts. A character named \"Emma\" on her card, but called \"Em\" throughout the manuscript, is recognized either way — in the Mentions tracker, and in the lore-relevance filter if you use one."
      },
      {
        heading: "Exclusion phrases catch false positives",
        body: "The opposite problem also happens: a name that's also an ordinary word. A character named Rose means every mention of a rose garden, a rose bush, or roses on a table looks like a sighting of her. Exclusion phrases fix that — add \"rose garden\" as an exclusion on Rose's card, and that specific phrase stops counting as a mention of her, while \"Rose smiled\" still does."
      }
    ]
  },
  "merge-story-bible-cards": {
    heading: "Merge Story Bible cards",
    body: "Sometimes two Story Bible cards turn out to be the same thing — you created \"Kael\" early on, and much later realize \"the Captain\" who kept showing up is Kael too.",
    steps: [
      {
        heading: "How merging works",
        body: "\"Merge cards…\" in the Story Bible panel handles this: pick two or more cards of the same kind and merge them into one. Nothing is deleted — every fact moves onto the merged card; where the two cards disagreed, you choose which value wins; each old name becomes an alias of the merged card, so a later mention of either still resolves correctly."
      },
      {
        heading: "Updating the manuscript text too",
        body: "There's also an option to replace the old names with the new one in the manuscript text itself, if you want the two names gone from the prose as well as unified on the card."
      },
      {
        heading: "Merging works from the review queue too",
        body: "The same merging also works the other way — a pending suggestion from Extract facts can be merged straight onto an existing card from the review queue, instead of locking it as a new card first and merging afterward."
      }
    ]
  },
  "edit-vs-update": {
    heading: "Edit vs. Update a fact",
    body: "A locked fact has two different ways to change it, and they mean different things — which one you pick decides whether the story has one true value or two, at different times.",
    steps: [
      {
        heading: "Edit corrects a mistake",
        body: "The fact was always this way, you just wrote it down wrong. No history, no \"as of\" chapter; it simply becomes correct."
      },
      {
        heading: "Update records a real change",
        body: "The fact was true, and from some chapter onward it changes to something else. \"Nora's hair was black\" (established in chapter 1), \"Nora's hair is now gray\" (Update, anchored to chapter 14, after the events that aged her). The earlier value stays visible in History instead of being overwritten, since both were true — just at different points in the story."
      },
      {
        heading: "Identity facts only ever take Edit",
        body: "Facts like name or species only ever get Edit — there's rarely a story reason for someone's name to change mid-book the way their hair color or where they live might."
      }
    ]
  },
  "interview-world": {
    heading: "Interview the world",
    body: "Story Bible doesn't just have to be used to store what you already know. You can also use Interview the world to discover more — exploring a character through conversation instead of filling out long forms.",
    steps: [
      {
        heading: "Starting from what you already know",
        body: "Suppose you know: \"Nora Berg. 38. Journalist. Grew up on the island. Her father disappeared when she was eighteen.\""
      },
      {
        heading: "Ask the character directly",
        body: "\"Why did you become a journalist?\" \"What do you remember from the day your father disappeared?\" \"Who do you trust the least?\" \"What would you never admit to Elias?\" \"What are you most afraid of discovering?\""
      }
    ],
    tip: "The interview can help you find personality, motive, background, relationships, and conflicts — often faster than deciding them all up front."
  },
  "interview-sandbox": {
    heading: "The interview is a sandbox",
    body: "This is very important: what's said during the interview doesn't affect how the book is written. The AI is free to invent and experiment during the conversation.",
    steps: [
      {
        heading: "An answer in the interview isn't automatically true",
        body: "Suppose Nora says: \"My father used to take me to the lighthouse when I was little.\" That doesn't mean kaampi Write is now free to use this as established information when a chapter is written. You first have to choose to turn the information into a fact."
      },
      {
        heading: "The path from a line in the interview to canon",
        body: "Interview → AI says something interesting → Extract facts → Review → Lock facts → Story Bible → now the information can affect future AI writing."
      }
    ],
    tip: "Interview ≠ canon. Locked facts = canon. That lets you ask wild questions and try out ideas without risking them starting to affect the story."
  },
  "interview-to-story": {
    heading: "From interview to story",
    body: "An idea from the interview doesn't become part of the story until you lock it — and once you do, exactly when it takes effect in the manuscript is worth understanding.",
    steps: [
      {
        heading: "From an interesting line to a possible fact",
        body: "During the interview, Nora might say: \"My mother always lied about what happened to Dad. I learned early that adults tell whichever version of the truth suits them.\" You find the idea interesting. After the interview, kaampi Write can help you identify possible facts: \"Nora's mother withheld information about the father's disappearance.\""
      },
      {
        heading: "Lock it, or leave it as exploration",
        body: "Lock the fact and it becomes an established part of Story Bible. Don't lock it, and it stays something explored during the interview — it shouldn't be treated as established information when the book is written."
      },
      {
        heading: "A fact can apply from a chapter's first page, even if it's only true later",
        body: "A fact locked to a chapter applies from the chapter's first page. Draft can use the fact right there — even if it's actually only true later in the chapter. Example: your protagonist meets an old friend, Marcus, in chapter 6. The chapter opens as an ordinary reunion. Only partway through does the protagonist realize Marcus has secretly been working against him — Marcus is the antagonist. If you extract \"Marcus is the antagonist\" from the Interview and lock it to chapter 6, Draft has access to the reveal already when it writes the opening reunion, as if nobody yet knows what Marcus is really up to."
      },
      {
        heading: "Lock the fact to a specific scene instead",
        body: "If the fact should only become available once the reveal happens, link it to the scene where it happens. First split chapter 6 into scenes (Scenes → Split into two…) at the point where the reveal happens, so the reunion and the reveal become separate scenes. When you then extract the fact from the Interview, the \"As of\" picker shows that chapter's scenes — pick the reveal's scene instead of \"Whole chapter\". Draft now only gets access to the fact from that scene onward."
      },
      {
        heading: "This only works with scene-by-scene Draft",
        body: "The scene link only affects Draft when you write one scene at a time (Scenes → Draft). Run Draft for the whole chapter in one pass, and Draft has access to every fact attributed to the chapter, whichever scene it's linked to. If you prefer drafting whole chapters in one pass, the simpler workaround still applies: hold off locking the fact until you've written past the turn, or draft the chapter in two passes and lock the fact only before the second."
      }
    ]
  },
  "brainstorm-vs-interview": {
    heading: "Brainstorm and interview",
    body: "They are two different ways of exploring the story, and neither has to automatically change it — both are places where you get to think.",
    steps: [
      {
        heading: "Brainstorm looks from the outside",
        body: "\"What if Nora's mother knows more about the disappearance?\" — a question about the story, asked from outside it."
      },
      {
        heading: "Interview looks from within",
        body: "\"Nora, do you think your mother knows what happened to your father?\" — the same kind of question, but asked to the character directly, in her own voice."
      }
    ]
  },
  "three-levels-of-information": {
    heading: "Three levels of information",
    body: "A useful mental model for how uncertain or settled a piece of story information is, at any given moment.",
    steps: [
      {
        heading: "Explore",
        body: "Brainstorm and interviews. \"What if…?\" Here ideas get to be uncertain."
      },
      {
        heading: "Plan",
        body: "Synopsis, briefs, Scenes, and Plotlines. \"This is what I think will happen.\" Here you shape the story."
      },
      {
        heading: "Establish",
        body: "Locked facts in Story Bible. \"This is true in the story's world.\" Here is information kaampi Write can rely on when the story is written."
      }
    ]
  },
  "extract-facts": {
    heading: "Extract facts from the manuscript",
    body: "You don't have to fill Story Bible by hand as you write. When a chapter contains information worth remembering, kaampi Write can help you extract possible facts straight from the prose.",
    steps: [
      {
        heading: "The workflow",
        body: "Chapter → Extract facts → Suggestions → Review → Approve and lock → Story Bible."
      }
    ],
    tip: "AI suggests. You decide — nothing gets added to Story Bible without your approval."
  },
  "moving-from-other-tool": {
    heading: "Moving from another writing tool",
    body: "If you've already worked on the story elsewhere, you don't need to start over.",
    steps: [
      {
        heading: "What you might already have",
        body: "A manuscript, character descriptions, places, worldbuilding, lore, organizations, objects, history, rules of the world — anything built up in another tool before you came here."
      },
      {
        heading: "kaampi Write can help you bring it with you",
        body: "The chapters that follow cover the specific tools for that: importing a manuscript, importing lore, and starting from material you already have."
      }
    ]
  },
  "import-lore": {
    heading: "Import lore",
    body: "Open: Story Bible → Import lore.",
    steps: [
      {
        heading: "Paste existing material",
        body: "Paste an article or text from your existing material. It could be, for example: \"The lighthouse was built in 1892 on the island's northern point. It has been unmanned since 1987. The locals avoid the place after dark.\""
      },
      {
        heading: "AI reads it and suggests facts",
        body: "kaampi Write's local AI reads the text and suggests facts. You then review the suggestions, exactly as with Extract facts."
      },
      {
        heading: "Only the approved facts carry forward",
        body: "The original text isn't saved as part of the book. It's the facts you choose to approve that carry forward into Story Bible."
      }
    ],
    tip: "The current lore import works with one article or text at a time."
  },
  "lore-relevance-filter": {
    heading: "Keeping a large imported Story Bible relevant",
    body: "Two kinds of Story Bible facts behave differently when it comes to what Draft actually needs to see.",
    steps: [
      {
        heading: "Manuscript facts always show up",
        body: "Facts the manuscript itself has established — written in a chapter, or approved from an interview — always show up in Draft. They're the story's own memory, and there's no safe way to leave them out."
      },
      {
        heading: "Imported lore is different",
        body: "Imported lore (Import lore) is background information, useful only when the chapter being drafted actually touches it. With a large imported setting, keeping every one of those facts in every Draft prompt can make the prompt huge and bury the handful that actually matter to the chapter at hand."
      },
      {
        heading: "The relevance filter",
        body: "Settings → Only show relevant lore for Draft (off by default) changes that: an imported lore fact only shows up if its own name is mentioned in the chapter, or — for an Event, such as a historical battle or a sponsorship deal — if one of its participants or its location is mentioned instead, even if the event itself is never named."
      },
      {
        heading: "Pin a fact the filter gets wrong",
        body: "If the filter ever guesses wrong about a specific fact, pin it: the same cycle button in Story Bible already used to override a fact's story-time position now also means \"always include this one, regardless.\""
      }
    ]
  },
  "already-have-manuscript": {
    heading: "You already have a manuscript",
    body: "If you've already written part of, or all of, the story, you don't need to start with Brainstorm or a development method. Start with the text you have.",
    steps: [
      {
        heading: "One possible workflow",
        body: "Existing manuscript → Chapters → Extract facts → Story Bible → Analyze and revise → Keep writing."
      }
    ],
    tip: "Brainstorm, Synopsis, and development methods are aids. They aren't required steps."
  },
  "write-with-ai": {
    heading: "Write together with AI",
    body: "AI doesn't have to write whole chapters. Choose the smallest tool that actually solves the problem in front of you — the three ways below cover an empty chapter, a chapter already in progress, and a single missing beat.",
    steps: [
      {
        heading: "Start with Draft",
        body: "A new chapter opens empty, with just its brief above the page. Press Draft and the model writes the whole chapter from the synopsis, the Story Bible, the brief, the camera, Reader, and prose language — everything already established, nothing you have to repeat by hand. The same button keeps working once the chapter already has some prose: it fills in what's missing and continues on from where the text stops, rather than starting over.",
        image: { src: "/handbook/write-with-ai/draft-empty-chapter.png", alt: "An empty chapter with the Draft button highlighted in the toolbar below the page" }
      },
      {
        heading: "Select a passage for Extend, Elaborate, or Rewrite",
        body: "Select any stretch of prose and right-click: Extend continues on from where the selection ends, Elaborate expands the passage itself without moving the story forward, and Rewrite… opens a field for your own instruction — for example \"make the dialogue more uncomfortable without the characters saying outright what they're angry about.\" Only the selected text changes; the rest of the chapter stays exactly as it was.",
        image: { src: "/handbook/write-with-ai/selection-menu.png", alt: "A selected sentence with the right-click menu open, showing Extend, Elaborate, Rewrite…, and more" }
      },
      {
        heading: "Write a beat, without selecting anything",
        body: "Right-click with nothing selected and the menu shrinks to a single pair of options. Write a beat… describes what happens next in one line — \"Nora hears footsteps on the stairs and hides the letter before the door opens\" — and the model writes just that: a short paragraph, not the rest of the scene, dropped in exactly at the cursor.",
        image: { src: "/handbook/write-with-ai/beat-menu.png", alt: "The cursor placed in the middle of a paragraph with the right-click menu open, showing Write a beat… and Drop a placeholder…" }
      }
    ],
    tip: "Try this: if a chapter stalls mid-scene, reach for Write a beat before Draft or Extend — naming the next small thing that happens is often easier than asking the model to keep going on its own, and it keeps you, not the model, deciding what happens next."
  },
  "attached-context": {
    heading: "Attached context",
    body: "Story Bible holds the facts, but not always the exact words a place, object, or character was first described in — and sometimes that's what matters.",
    steps: [
      {
        heading: "Pin an earlier chapter, or just a scene",
        body: "Chapter settings → Attached context lets a chapter pin an earlier chapter, or just one of its scenes, as extra reference material for Draft and Recast."
      },
      {
        heading: "Actual prose, not a summary",
        body: "Unlike Story Bible facts, what's pinned is sent as its actual prose — useful when the lighthouse, say, needs to read exactly as it was first painted in chapter 2, not just as the Story Bible fact \"an abandoned lighthouse on the northern point.\""
      },
      {
        heading: "Knowing what it costs",
        body: "A rough token-cost estimate shows next to whatever's pinned, so you can see what it's adding to the prompt."
      }
    ]
  },
  "smallest-tool": {
    heading: "Choose the smallest tool",
    body: "The writing tools scale down as well as up — matching the tool to the size of the actual gap gives you more control than regenerating large amounts of text.",
    steps: [
      {
        heading: "What \"smallest\" actually means",
        body: "Not least effort, and not simplest to use — smallest means how much existing text the tool touches. Draft can fill or rewrite a whole chapter. Write a beat drops in a short paragraph at your cursor and leaves everything else untouched. Elaborate expands a single passage you've selected, without moving the story forward around it. The smaller the tool, the less of your own prose gets regenerated — and the less you have to re-read afterward to make sure nothing unwanted changed."
      },
      {
        heading: "How to judge which one you need",
        body: "Ask yourself: how much of the existing text does this problem actually require changing? A missing beat needs one new paragraph, not a rewritten chapter. A thin passage needs expanding in place, not continuing forward. Reach for the smallest tool that can solve what's actually in front of you, and only step up to a bigger one — Extend, Rewrite, or Draft — when the problem genuinely needs that much touched."
      },
      {
        heading: "Match the tool to the problem",
        body: "Completely empty chapter → Draft. A smaller event is missing → Write a beat. The passage is too thin → Elaborate. I need to move forward → Extend. I know what I want to change → Rewrite. I want to know if the chapter works → Analyze."
      }
    ]
  },
  "ai-not-autopilot": {
    heading: "AI is not autopilot",
    body: "kaampi Write isn't built around \"Write my book.\" It's built around a loop where you stay in control of every step.",
    steps: [
      {
        heading: "The loop",
        body: "You decide the direction. AI helps where you want help. You read the result. You change, keep, or discard it. The story develops."
      },
      {
        heading: "There's no one correct amount of AI to use",
        body: "You can write several chapters entirely without AI. You can use AI only when you get stuck. Or generate rough drafts that you then rewrite heavily. All of these are normal ways to use kaampi Write."
      }
    ]
  },
  darlings: {
    heading: "Darlings — kill your darlings, keep the bodies",
    body: "A passage can be wrong for this draft without being worth losing for good.",
    steps: [
      {
        heading: "Cutting without deleting",
        body: "Select the passage and choose \"Cut to Darlings\" from the right-click menu, and it's pulled out of the chapter without being deleted — it lands in a \"N darlings kept\" tray shared across the whole book."
      },
      {
        heading: "Restore it, or let it go",
        body: "From the tray, restore a darling to its original spot, or discard it for good once you're sure you won't need it. A cut or a restore gets its own row in the chapter's History too, so there's always a record of what moved where."
      }
    ]
  },
  placeholders: {
    heading: "Placeholders",
    body: "A question mid-draft doesn't have to break your flow.",
    steps: [
      {
        heading: "Drop a note and keep going",
        body: "Right-click where the question comes up — \"what was this character's last name again?\" — and drop a placeholder note, then keep writing. A small pin marks where it sits in the text; click it any time to read the note, edit it, or mark it resolved."
      },
      {
        heading: "Finding open placeholders later",
        body: "A chapter with an open placeholder gets a small dot in the chapter list, and a compact \"N placeholders to come back to\" panel lists every open one in the book with a jump straight to its chapter."
      }
    ],
    tip: "Proofread also checks for any still open before it runs, in case one's been forgotten."
  },
  "pov-tense-voice": {
    heading: "Point of view, tense, and narrative voice",
    body: "kaampi Write can be given information about how the story should be told.",
    steps: [
      {
        heading: "What this covers",
        body: "Point of view, tense, viewpoint, and narrative voice."
      },
      {
        heading: "Individual chapters can deviate",
        body: "Individual chapters can, when needed, deviate from the book's overall settings. That can be useful if most of the novel is told in third person but one particular chapter needs a different viewpoint."
      }
    ],
    tip: "Point of view is about more than swapping pronouns. If you use AI for larger rewrites after such a change, always read the result carefully."
  },
  reader: {
    heading: "Reader",
    body: "You can specify what kind of reader the story is aimed at. This can help AI adapt, for example, word choice and sentence structure when it writes together with you.",
    steps: [
      {
        heading: "Writing support, not a rating",
        body: "It's writing support. It is not an automatic rating of what age the finished book is suitable for — you still decide that yourself."
      }
    ]
  },
  "author-voice": {
    heading: "Author voice",
    body: "Two authors can describe the same event in completely different ways. Author voice helps AI understand how you want the prose to feel.",
    steps: [
      {
        heading: "What it can involve",
        body: "Sentence length, amount of setting description, dialogue, rhythm, direct or restrained language, and other stylistic traits."
      },
      {
        heading: "Guidance, not a rule",
        body: "It's guidance for AI. Not rules for how you must write. Your own text always has the final word."
      }
    ]
  },
  "smart-quotes": {
    heading: "Smart quotes",
    body: "A straight \" typed in the chapter editor becomes a real opening or closing curly quote automatically, based on what comes right before it — nothing to think about, nothing to switch on.",
    steps: [
      {
        heading: "Converting existing text",
        body: "Already have text with straight quotes — pasted in, or imported from elsewhere? Tools → Convert markers → \"Smarten quotes in whole manuscript\" converts every one already in the manuscript the same way, in a single pass."
      }
    ]
  },
  "analyze-chapter": {
    heading: "Analyze a chapter",
    body: "Analyze reviews the text without rewriting it for you. The point is to help you notice things you might want to look into yourself.",
    steps: [
      {
        heading: "Think of it as an extra reader",
        body: "Not: \"This is how you should write.\" But: \"Here's something you might want to look at.\""
      },
      {
        heading: "You decide what's relevant",
        body: "Analyze only points things out — you decide whether each observation is actually worth acting on."
      }
    ]
  },
  polish: {
    heading: "Polish",
    body: "Where Analyze only points things out, Polish rewrites.",
    steps: [
      {
        heading: "What it cleans up",
        body: "It runs a cleanup pass over the whole chapter — cutting exposition inserts, emotion-naming (\"she felt a pang of regret\"), vague statements, purple prose, and tightening dialogue."
      },
      {
        heading: "Compare before you commit",
        body: "It then shows the original and the rewrite side by side, with word-level highlighting, before anything is kept. Accept or discard — nothing touches the chapter until you say so."
      },
      {
        heading: "Adjust it to your voice",
        body: "If Polish's default instincts don't match your voice — maybe you want more emotion-naming kept, not less — Settings → Polish lets you edit the instructions it gives the model, per manuscript."
      }
    ]
  },
  continuity: {
    heading: "Continuity",
    body: "The longer a manuscript gets, the harder it is to remember everything. A person might end up with different eye colors. A place might suddenly change. A character might seem to know information they shouldn't know yet.",
    steps: [
      {
        heading: "Comparing against what's established",
        body: "Here, Story Bible and the story's continuity tools help you compare what you're writing against what's already established."
      },
      {
        heading: "Who knows what?",
        body: "Continuity isn't only about physical details. It's also about information. The reader might know a secret. That doesn't mean every character does."
      }
    ],
    tip: "This becomes especially important in mysteries, thrillers, multiple viewpoints, and stories where information is revealed gradually."
  },
  "ask-manuscript": {
    heading: "Ask Manuscript",
    body: "Once the book has grown long, you can use Ask Manuscript to examine your own story.",
    steps: [
      {
        heading: "Factual questions about what's already written",
        body: "\"When does Erik first meet the woman on the train?\" \"In which chapters is the lighthouse mentioned?\" \"What does Lena know about Erik's father?\" \"When does the reader learn the photograph is from 1932?\""
      },
      {
        heading: "Broader questions too",
        body: "\"Which chapters are mostly about the relationship between Nora and Elias?\" Or: \"Where is the key mentioned before it becomes important later?\""
      }
    ],
    tip: "The answer is a tool for you. It doesn't automatically become canon, and shouldn't by itself change the chapters."
  },
  "ask-about-passage": {
    heading: "Ask about a chapter or a passage",
    body: "Analyze checks fixed categories. Ask Manuscript answers factual questions about what's already written. Neither can answer something like: \"Does this build toward a strong ending?\" or \"Is this argument believable, or does it feel forced?\" — Ask about chapter / Ask about a passage is for exactly that kind of question.",
    steps: [
      {
        heading: "Two ways to use it",
        body: "\"Ask about chapter…\" (next to Analyze) asks about the whole chapter. Mark a passage in the text, then choose \"Ask…\" from its menu, to ask about just that passage, with the surrounding text as context."
      },
      {
        heading: "What kind of question it's for",
        body: "\"Does the ending make you want to read the next chapter?\" \"Is this scene showing too much, too fast?\" Your own question about craft, with an honest — and critical, if asked — answer."
      }
    ],
    tip: "The answer is just a read. Nothing is changed or saved — same as Ask Manuscript."
  },
  history: {
    heading: "History",
    body: "AI-assisted writing often means experimenting. A rewrite might turn out better. Or you might discover the old version actually worked better.",
    steps: [
      {
        heading: "Comparing and going back",
        body: "When earlier versions are available, History can help you compare and go back. Think: Try → Read → Keep or revert."
      }
    ],
    tip: "You don't have to accept a change just because AI made it."
  },
  proofread: {
    heading: "Proofread",
    body: "Proofreading fits later in the process. Earlier, the question might have been: \"How can the scene develop?\" Now the question becomes: \"Is there something here that needs fixing or checking?\"",
    steps: [
      {
        heading: "Work from large to small",
        body: "It's rarely worth polishing every sentence if you still plan to rewrite whole chapters. The story → Continuity → The chapters → Developmental analysis → Polish → Proofreading → Your own final read."
      },
      {
        heading: "Seven checks in one pass",
        body: "Proofread runs seven checks across the whole manuscript at once — grammar, repeated scenes, style and mood consistency between chapters, an age-appropriateness report, continuity, setups and payoffs, and a fact check against Story Bible."
      },
      {
        heading: "A reminder before it starts",
        body: "It warns first if an open placeholder note is still waiting, in case it's been forgotten along the way."
      }
    ],
    tip: "AI can find things. The author decides what works."
  },
  "developmental-analysis": {
    heading: "Developmental analysis",
    body: "Proofread reads line by line. Developmental analysis reads the shape of the whole book instead: does tension actually rise as the story goes on, does the middle sag, which Plotlines threads get resolved and which quietly stall for ten chapters.",
    steps: [
      {
        heading: "Three stages, never the whole book at once",
        body: "It works in three stages — scene by scene, then chapter by chapter, then one final report — never the whole manuscript in a single pass, so it stays manageable even for a long book."
      },
      {
        heading: "Grounded in Plotlines and Timeline, but not dependent on them",
        body: "A manually started run, not something that happens automatically. It's grounded in whatever Plotlines tags and Timeline positions the manuscript already has, but works without either — just a coarser read, and it says so before starting."
      },
      {
        heading: "What you actually see",
        body: "The only thing you ever see is the final report: a prose summary, plus a clickable list of specific chapters worth a look. The scene-by-scene and chapter-by-chapter readings underneath stay internal working data — the same \"never raw data, always synthesized\" principle as everywhere else AI reviews your writing."
      }
    ]
  },
  "images-illustrations": {
    heading: "Images and illustrations",
    body: "kaampi Write can help you work with images in two different ways.",
    steps: [
      {
        heading: "Your own images",
        body: "You can add images to the story. Useful for illustrated stories, children's books, or projects where images are part of the reading experience."
      },
      {
        heading: "Illustration prompts",
        body: "You can also use text from the story as the basis for an image description. Example — manuscript: \"Erik stood alone on the platform. Fog lay thick over the tracks, and the station clock had stopped at 3:17.\" kaampi Write can help you turn the passage into an illustration prompt based on the subject and the project's chosen visual style. The story text itself isn't changed."
      }
    ]
  },
  typography: {
    heading: "Typography",
    body: "Settings → Typography shapes how the prose actually looks, live in the editor and carried into every Publish export — so what you see while writing is what the reader gets.",
    steps: [
      {
        heading: "Font and weight",
        body: "Font — a choice of thirteen typefaces, serif and sans serif, each shown in its own face so you can tell them apart before picking one. Weight — Regular or Bold, for prose that sits heavier on the page."
      },
      {
        heading: "Color",
        body: "One shade for dark theme, one for light, so it stays legible and intentional in both."
      },
      {
        heading: "Drop cap and scene break",
        body: "Drop cap — off, or 2–5 lines, for a chapter's opening letter. Scene break — the plain short rule, or one of four named ornaments (a classic book vignette, a minimalist diamond, French elegance, or a glimmering star) for a `---` paragraph."
      }
    ],
    tip: "None of this is required. The defaults are a reasonable starting point; Typography is there for when the look of the page starts to matter as much as the words on it."
  },
  "language-versions": {
    heading: "Language versions of a manuscript",
    body: "A finished — or still-growing — manuscript can spin off a separate, linked edition in another language.",
    steps: [
      {
        heading: "Starting a language version",
        body: "From the language switcher next to the manuscript title (\"New language version…\"). Its chapters are pre-created empty, each linked to its source counterpart."
      },
      {
        heading: "Translating a chapter",
        body: "Translate each one from the chapter editor (\"Translate chapter\") — it carries over the source chapter's prose along with the manuscript's Story Bible and Voice, so names and terms stay consistent across the translation, not just within it."
      },
      {
        heading: "When the source chapter changes later",
        body: "The translated chapter flags it (\"Source changed since this was translated\"), with a same-language diff showing exactly what moved, and a \"Re-translate chapter\" action. The manuscript shelf groups a source manuscript together with its language versions, instead of listing them as unrelated books."
      }
    ],
    tip: "Settings → AI settings has a third model choice for this, Translate, alongside Writing and Review."
  },
  publish: {
    heading: "Publish",
    body: "When the story is ready to leave the workspace, use Publish.",
    steps: [
      {
        heading: "Workshop vs. finished copy",
        body: "The kaampi Write project is your workshop. The published copy is what the reader gets. Brainstorm, working notes, and other planning don't need to follow into the published story."
      },
      {
        heading: "Choosing a paragraph style",
        body: "Paragraph style offers two conventions: the familiar blank line between paragraphs, or an indented, no-blank-line classic book style with the chapter's opening paragraph left flush, as in print."
      }
    ],
    tip: "Choose the format that fits how the text will be used, and continue working with the result from there when needed."
  },
  backup: {
    heading: "Backup",
    body: "Publishing and backing up aren't the same thing.",
    steps: [
      {
        heading: "A published book vs. a backup",
        body: "A published book is for the reader. A kaampi Write backup is for restoring the project itself. It can therefore contain information that isn't in the published version."
      },
      {
        heading: "Import backup is not manuscript import",
        body: "Import backup is used for kaampi Write's own backups. That's not the same as importing a manuscript or lore from another writing program."
      },
      {
        heading: "Export for other apps",
        body: "A third, different thing again — not a backup, and not a reading copy either. It writes a snapshot in a shared format for a sibling app (such as kaampi Comic) to import: locked, visible Story Bible facts and chapters, grouped by kind. Unlocked, flagged, or hidden-from-the-model facts never go into it, the same visibility rule Draft itself follows."
      }
    ],
    tip: "Save backups regularly, especially before major changes."
  },
  "network-ai-server": {
    heading: "An AI server on another computer on the network",
    body: "Have a powerful computer or server on the same network, and want to write in kaampi Write from a different machine — a laptop, say? That works, but needs settings in three places: in kaampi Write, on the server machine, and its firewall.",
    steps: [
      {
        heading: "Pick the engine that matches what's running there",
        body: "Open Settings → Models. Whether the other machine runs Ollama or LM Studio, choose that same engine here — both have a server address field."
      },
      {
        heading: "Enter the other computer's network address",
        body: "In the Server address field: http://[the other computer's network IP]:[port] — for example http://192.168.1.50:11434 for Ollama, or http://192.168.1.50:1234 for LM Studio. Leave it empty to use this computer's own default instead. Don't add /v1 at the end — kaampi Write adds that itself. Find that computer's network address with ipconfig (Windows) or ifconfig/ip addr (Mac/Linux), run on that same machine."
      },
      {
        heading: "Let the server listen on the network, not just itself",
        body: "If the other machine runs Ollama: start it with the environment variable OLLAMA_HOST=0.0.0.0 so it listens broadly, and OLLAMA_ORIGINS set to the address kaampi Write is actually running from (or OLLAMA_ORIGINS=* to allow any address) — otherwise it refuses the browser's request even once the connection itself works. If it runs LM Studio: the Developer tab → Server settings → turn on \"Serve on Local Network\" and \"Enable CORS\"."
      },
      {
        heading: "The server machine's firewall",
        body: "It must allow inbound connections on that port (11434 for Ollama, usually 1234 for LM Studio) from the rest of the network — otherwise the request never gets through, even with everything above set correctly."
      }
    ],
    tip: "Each computer also keeps its own separate shelf of manuscripts — only the AI connection is shared, not what you've written. To keep working on the same book from both machines, use Backup/Restore to move it across."
  },
  "ai-writing-wrong-things": {
    heading: "If AI starts writing the wrong things",
    body: "First, think about what information the model actually received.",
    steps: [
      {
        heading: "The chapter brief is outdated",
        body: "Check whether the brief still describes the chapter you want to write."
      },
      {
        heading: "Synopsis hasn't kept up with the story's development",
        body: "The story may have changed since you planned it."
      },
      {
        heading: "The idea only exists in Brainstorm, or only came from an interview",
        body: "Brainstorm is an exploratory space. An idea there shouldn't automatically be treated as part of the story. The same principle applies to an interview — what was said doesn't affect how the book is written unless you've chosen to lock the information as a fact."
      },
      {
        heading: "Important information is missing from Story Bible",
        body: "If something needs to stay consistent, it may need to be established and locked as a fact."
      },
      {
        heading: "Your instruction is too broad",
        body: "Instead of: \"Rewrite the scene to make it better,\" try: \"Make the dialogue between Nora and Elias more guarded. They suspect each other but neither wants to show it yet.\""
      }
    ],
    tip: "The clearer the problem is, the easier it becomes to choose the right tool."
  },
  "marker-conversion-no-match": {
    heading: "\"Convert markers to formatting\" says nothing was found",
    body: "Two different causes, depending on what you're trying to convert.",
    steps: [
      {
        heading: "If this is about quotation marks specifically",
        body: "You probably don't need Convert markers for that at all anymore. See Smart quotes (Writing) — a straight \" already turns curly as you type, and \"Smarten quotes in whole manuscript\" converts a whole imported or pasted-in manuscript in one pass, straight quotes included."
      },
      {
        heading: "For anything else Convert markers handles",
        body: "*Asterisks* for italic, custom pairs of your own — \"nothing found\" usually means the character you typed into the field isn't quite the same character as the one in your manuscript. Easy to happen with punctuation that comes in more than one look-alike form."
      },
      {
        heading: "The safest fix",
        body: "Open the chapter, select one of the actual marker characters in your text, copy it (Ctrl/Cmd+C), and paste it into the Opening or Closing marker field instead of retyping it on the keyboard. That guarantees an exact match."
      }
    ]
  },
  "routine-short-often": {
    heading: "Write little, but often",
    body: "Finding time to write can be the hardest part. Small changes to your routine can make a big difference — this chapter and the four after it offer five tips to help you build good habits, find focus, and keep going when you get stuck.",
    steps: [
      {
        heading: "Short sessions can beat waiting for the perfect moment",
        body: "You don't need several free hours to get something written. Short, regular writing sessions can be more effective than waiting for the perfect moment."
      }
    ],
    tip: "Try it: set aside 15–30 minutes a few days a week. Focus on writing, not on how much you manage to produce."
  },
  "routine-draft-then-edit": {
    heading: "Write first, edit later",
    body: "It's hard to be creative and critical at the same time. If you keep stopping to fix wording, you risk losing both focus and the story's direction.",
    steps: [
      {
        heading: "Let the first draft be a draft",
        body: "You can improve the language later — the first pass only needs to get the story down."
      }
    ],
    tip: "Try it: write a scene without going back to change anything. Read it through and edit only once the scene is done."
  },
  "routine-set-time-place": {
    heading: "Decide when and where you'll write",
    body: "It's easy to put off something that has no set time. A concrete plan makes it easier to actually sit down and write.",
    steps: [
      {
        heading: "Replace intention with a plan",
        body: "Swap \"I'll try to write more\" for \"Saturday after breakfast, I write for 30 minutes.\""
      }
    ],
    tip: "Try it: pick a time and place that fits your everyday life. Ideally, tie the writing to something you already do regularly."
  },
  "routine-pause-when-stuck": {
    heading: "Take a break when you get stuck",
    body: "Sometimes staring longer at the same sentence or scene doesn't help. Doing something else for a while can give you a new perspective.",
    steps: [
      {
        heading: "Step away on purpose",
        body: "Go for a walk, do the dishes, or do something that doesn't demand all your attention. When you come back, the problem can feel easier to solve."
      }
    ],
    tip: "Try it: write down what you're stuck on before you take the break. That makes it easier to pick back up when you return."
  },
  "routine-read-widely": {
    heading: "Read to grow your writing",
    body: "Reading different authors and genres gives you a better feel for language, dialogue, pacing, and story structure.",
    steps: [
      {
        heading: "You don't need to analyze every book",
        body: "But sometimes it's worth thinking about why a scene works especially well."
      }
    ],
    tip: "Try it: next time a book grips you, stop and ask yourself — what did the author do to catch my interest?"
  },
  "opening-raise-a-question": {
    heading: "Raise a question in the reader's mind",
    body: "The first few pages help a reader decide whether the story is worth continuing with — this chapter and the three after it cover four ways to write an opening that sparks curiosity.",
    steps: [
      {
        heading: "A strong opening doesn't need drama",
        body: "But something should catch the reader's interest. It could be an unexpected event, strange behavior, or something that doesn't quite add up."
      },
      {
        heading: "Wondering is what keeps a reader going",
        body: "Once the reader starts wondering what happened, why it happened, or what's coming next, there's a reason to keep reading."
      }
    ],
    tip: "Ask yourself: what question do I want the reader carrying with them after page one?"
  },
  "opening-wait-on-backstory": {
    heading: "Hold off on the backstory",
    body: "You don't need to explain everything about the protagonist or the world right away.",
    steps: [
      {
        heading: "Too much background slows the opening down",
        body: "Too much background information up front can slow the story down before the reader has had a chance to get invested."
      },
      {
        heading: "Show only what's needed, for now",
        body: "Show only what's needed to understand the situation, and let the rest of the information arrive when it becomes relevant."
      }
    ],
    tip: "Ask yourself: does the reader really need to know this already?"
  },
  "opening-let-details-show": {
    heading: "Let the details do the telling",
    body: "You don't always have to state a person's traits outright. A character often comes across as more alive through what they do, say, or notice.",
    steps: [
      {
        heading: "Show the trait through action",
        body: "Instead of writing that someone is controlling, you could, for example, show them straightening the objects on a table before a difficult conversation."
      }
    ],
    tip: "A well-chosen detail can say more than a long explanation. Ask yourself: can I show this trait through an action or a detail?"
  },
  "opening-save-the-surprises": {
    heading: "Save the surprises",
    body: "It can be tempting to open with the story's most dramatic event to hook the reader right away.",
    steps: [
      {
        heading: "Revealing too much too early costs you later",
        body: "If you reveal too much too early, later twists risk losing their impact."
      },
      {
        heading: "A prologue or flashback can still work",
        body: "As long as it offers more than just a preview of what's about to happen."
      }
    ],
    tip: "Ask yourself: does my opening spark curiosity, or does it reveal something that would have been more exciting to discover later?"
  },
  "voice-overexplaining": {
    heading: "Give your text a voice of its own",
    body: "AI tools can help you write and revise text. But the result still needs to feel like your story. When you use Draft, Recast, or Polish, it can help to look out for a few recurring patterns — this chapter and the three after it cover four of them.",
    steps: [
      {
        heading: "Is the text over-explaining?",
        body: "Sometimes the narrator states outright what an event means, or what the reader should feel."
      },
      {
        heading: "Let the story speak for itself",
        body: "Let the action, the dialogue, and the characters' choices speak for themselves. The reader doesn't need everything spelled out."
      }
    ]
  },
  "voice-too-predictable": {
    heading: "Is the story too predictable?",
    body: "If every event leads straight into the next, a story can start to feel too neatly arranged.",
    steps: [
      {
        heading: "Questions worth asking",
        body: "Consider whether the characters have goals of their own, whether conflicts exist alongside the main plot, and whether something could develop in an unexpected but believable way."
      }
    ]
  },
  "voice-varied-emotion": {
    heading: "Are emotions described the same way every time?",
    body: "A knot in the stomach, a racing heart, or shaking hands can all work well. But describe every emotion through a bodily reaction, and the language quickly starts to feel repetitive.",
    steps: [
      {
        heading: "Vary the approach",
        body: "Vary between actions, thoughts, dialogue, physical reactions, and naming the feeling directly."
      }
    ]
  },
  "voice-straight-timeline": {
    heading: "Does everything follow a straight timeline?",
    body: "A story doesn't always have to follow events in the exact order they happened.",
    steps: [
      {
        heading: "Flashbacks and time jumps can add meaning",
        body: "Flashbacks, time jumps, and shifts in perspective can sometimes build tension or give an event new meaning."
      },
      {
        heading: "Use them deliberately",
        body: "Use them when they strengthen the story — not just for the sake of variety."
      }
    ],
    tip: "None of this is a rule for how a story must be written. Treat it as questions to ask yourself while revising. What matters most is that the language, structure, and narrative voice fit your own story."
  },
  "writing-tips-sources": {
    heading: "Sources and further reading",
    body: "These tips draw on the following research and writing on habits, creativity, language development, and craft.",
    steps: [
      {
        heading: "Writing habits and creativity",
        body: "Boice, R. (1990). Procrastination, busyness and bingeing. Behaviour Research and Therapy, 27(6), 605–611. Kellogg, R. T. (1996). A model of working memory in writing. Memory & Cognition, 24(3), 318–329. Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493–503. Sio, U. N. & Ormerod, T. C. (2009). Does incubation enhance problem solving? Psychological Bulletin, 135(1), 94–120. Krashen, S. (2004). The Power of Reading: Insights from the Research. Libraries Unlimited."
      },
      {
        heading: "Craft and AI-generated text",
        body: "Ephron, H. The Importance of a Strong Opening Scene. Writer's Digest. StoryScope. Research from the University of Maryland and Google DeepMind on recurring patterns in AI-generated text (arxiv.org/html/2604.03136v6)."
      }
    ],
    tip: "These are practical suggestions, not hard rules. Adapt them to your own writing."
  }
};

export const en = {
  common: {
    fileSaveError: "Could not save the file. Please try again.",
    cancel: "Cancel",
    close: "Close",
    stop: "Stop",
    save: "Save",
    copy: "Copy",
    copied: "Copied",
    infoAbout: "More about {field}",
    previous: "Previous",
    next: "Next"
  },
  busy: {
    title: "Working",
    help: "Your local AI is working on this. The first request can take a little longer while the model loads.",
    drafting: "Drafting…",
    analyzing: "Analyzing…",
    polishing: "Polishing…",
    illustrating: "Writing an illustration prompt…",
    developing: "Developing…",
    importing: "Importing {current} of {total}…"
  },
  app: {
    crash: "The app hit an error.",
    tryAgain: "Try again",
    missingRoot: "Missing #root element"
  },
  chrome: {
    language: "Language",
    light: "Light",
    dark: "Dark",
    lightTitle: "Use a light page",
    darkTitle: "Use a dark page"
  },
  appBar: {
    nav: "Files",
    newManuscript: "New manuscript…",
    viewAll: "View all manuscripts",
    goHome: "Go to all manuscripts",
    importBackupItem: "Import a backup…",
    importManuscriptItem: "Import a text file…",
    loadSampleManuscriptItem: "Load sample manuscript…",
    importCodexItem: "Import a Codex book…"
  },
  companionApps: {
    nav: "Your creative apps",
    openApp: "Open {name}",
    appInfo: "{name} information and address",
    aboutApp: "About {name}",
    addressLabel: "App address",
    statusAvailable: "The app is running and ready to open.",
    statusUnreachable: "The app cannot be reached. It may be installed but not running. Start it and try again.",
    statusWrongApp: "A different service answered at this address. Check the app's address and try again.",
    statusUnknown: "Automatic checks are only available in the desktop app. You can still open the address yourself.",
    checking: "Checking the app…",
    tryAgain: "Try again",
    saveAddress: "Save address",
    openAppAction: "Open app ↗",
    getApp: "Get the app & installation guide ↗",
    invalidAddress: "Use an HTTP or HTTPS app address without credentials."
  },
  home: {
    headline: "Write the prose.",
    truth: "The Story Bible holds truth.",
    lede: "A local manuscript tool where you decide.",
    newManuscript: "Start a new manuscript",
    newManuscriptCardLede: "Title it, then grow the story in Brainstorm — the model drafts the chapters, you decide.",
    titlePlaceholder: "Title",
    open: "Create",
    importCodexBookTitle: "Import a book from kaampi Codex",
    importCodexBookLede:
      "Every manuscript kaampi Codex holds a private backup of, that isn't already in this installation. Picking one brings it in with its own original history — chapters, Story Bible, everything — exactly as Codex last saw it.",
    importCodexBookLoading: "Checking kaampi Codex…",
    importCodexBookEmpty: "Nothing to import — either kaampi Codex has no private backups, or this installation already has them all.",
    importCodexBookImport: "Import",
    importCodexBookImporting: "Importing…",
    guideCardLede: "Not sure where to start? The Guide walks through every part of the app.",
    guideCardAction: "Open the Guide",
    mascotIntroText:
      "This is Kaamilla, your assistant. She'll occasionally pop up with tips and info. You can turn her off in Settings, or switch to Kaamy or Kaambot there.",
    mascotIntroUnderstood: "Understood",
    codexCard: "kaampi Codex",
    codexConnected: "Connected — backups and sharing with your other kaampi apps are on.",
    codexOffline: "Paired, but not reachable right now. Your work keeps saving locally.",
    codexCardLede: "Not connected yet. Paste the pairing key from kaampi Codex's own first-run screen, or leave this — it's entirely optional.",
    codexDesktopOnly: "Connecting to kaampi Codex is only possible in the desktop app, not here in the browser.",
    codexTokenPlaceholder: "Pairing key",
    codexConnectAction: "Connect",
    codexConnecting: "Connecting…",
    startHeading: "Where would you like to start?",
    importManuscriptTitle: "Import a manuscript (text file)",
    importManuscriptLede:
      "Starts a brand-new manuscript from a plain text or Markdown file — an export from another writing tool, or just a .txt/.md file you already have. Splits on headings into chapters (plain text with no headings imports as a single chapter), and converts *italic*/**bold** markers into real formatting, same as Tools → Convert markers to formatting.",
    importManuscriptContact:
      "Working with a tool that doesn't export plain text or Markdown? Get in touch and share an export file — we can look into adding support for it.",
    importManuscriptBookTitle: "Manuscript title",
    importManuscriptBookTitlePlaceholder: "Title",
    importManuscriptUpload: "Upload a file…",
    importManuscriptText: "Or paste the exported text",
    importManuscriptTextPlaceholder: "Paste a Markdown export here, or upload a file above…",
    importManuscriptLevelLabel: "Which heading marks a new chapter?",
    importManuscriptLevelOption: "{hashes} ({count} found)",
    importManuscriptFoundCount: "Found {count}.",
    importManuscriptChaptersCount: { one: "{count} chapter", other: "{count} chapters" },
    importManuscriptUntitledChapter: "Chapter {n}",
    importManuscriptAction: "Import",
    shelf: "Manuscripts",
    shelfHeading: "Your manuscripts",
    listView: "List view",
    shelfView: "Shelf view",
    shelfOpen: "Open",
    seriesTag: "Series: {series}",
    searchPlaceholder: "Search manuscripts…",
    noSearchResults: "No manuscripts match your search.",
    emptyShelf: "No manuscripts yet. A title is enough to start.",
    delete: "Delete",
    deleteConfirm: "Delete “{title}”? This cannot be undone.",
    replaceConfirm: "Replace “{title}” with this backup? Anything written since that backup will be lost.",
    languageVersionUnset: "Untitled language",
    chapters: { one: "{count} chapter", other: "{count} chapters" },
    facts: { one: "{count} locked fact", other: "{count} locked facts" },
    connectFound: { one: "Connected — {count} model found.", other: "Connected — {count} models found." },
    connectNotFound:
      "Not connected yet. Don't have a local AI server? We recommend Ollama — free, from ollama.com. Install a model (search for “stheno” for one tuned for fiction, or any general chat model like llama3), and it will show up here automatically.",
    desktopInstallOllama: "Install Ollama",
    desktopGpuSuggestion: "Based on your graphics card's memory (~{gb} GB), this computer can likely run {tier}.",
    desktopGpuTier3b: "a small model, around 3 billion parameters (4-bit)",
    desktopGpuTier7b: "a model around 7-8 billion parameters (4-bit)",
    desktopGpuTier14b: "a model around 13-14 billion parameters (4-bit)",
    desktopGpuTier30b: "a model around 30-34 billion parameters (4-bit)",
    desktopGpuTier70b: "a large model, 70 billion parameters or more (4-bit)",
    desktopCheckUpdate: "Check for updates",
    desktopCheckingUpdate: "Checking for updates…",
    desktopUpdateAvailableShort: "Update available",
    desktopUpdateAvailable: "A new version is available ({latest}, you have {current}).",
    desktopViewChangelog: "View changelog",
    desktopDownloadUpdate: "Download update",
    desktopUpToDate: "You have the latest version ({current}).",
    desktopUpdateCheckFailed: "Couldn't check for updates: {error}"
  },
  series: {
    heading: "Your series",
    newSeries: "+ New series",
    newSeriesTitlePlaceholder: "Series title",
    create: "Create",
    open: "Open series →",
    books: { one: "{count} book", other: "{count} books" },
    facts: { one: "{count} locked fact", other: "{count} locked facts" },
    newBookInSeries: "+ New book in this series",
    assignLabel: "Series",
    assignNone: "— Standalone —",
    backToShelf: "← To the shelf",
    titleLabel: "Series title",
    booksHeading: "Books in this series",
    noBooksYet: "No books in this series yet.",
    removeFromSeries: "Remove from series",
    removeFromSeriesTitle: "Make this book standalone again — its own locked facts stay, it just stops inheriting series canon.",
    removeFromSeriesConfirm: 'Remove "{title}" from this series? It becomes a standalone manuscript again — its own facts stay, but it stops inheriting series canon.',
    deleteSeries: "Delete series",
    deleteConfirm: 'Delete the series "{title}"? Its books stay — they just won\'t belong to a series anymore.',
    deleteBlocked: "Move its books out first (or delete them) to delete this series.",
    notFound: "That series doesn't exist anymore.",
    unreadable: "That series couldn't be read.",
    tabs: { brainstorm: "Brainstorm", synopsis: "Synopsis", bible: "Story Bible", books: "Books" },
    brainstormLede: "Private scratch for the series' own world — not shared with any book's own Brainstorm, and Draft never reads this directly. Lift what holds up to Synopsis when you're ready.",
    brainstormPlaceholder: "Sketch the world here — history, factions, how magic works, whatever the series needs before any book starts…",
    liftToSynopsis: "Lift to Synopsis →",
    synopsisLede: "A short-form pitch for the series' world — a writing map for its own facts, not locked canon itself. Extract facts from it when it's ready; nothing locks in directly, everything lands in the review queue below.",
    synopsisPlaceholder: "Summarize the series' world in a few paragraphs…",
    extractFacts: "Extract facts",
    extracting: "Extracting…",
    lockedFactsHeading: "Series canon",
    noFactsYet: "No locked facts yet — write a synopsis and extract from it, or add one by hand below.",
    addFact: "Add a fact by hand",
    entityNamePlaceholder: "Entity name (e.g. \"Luke Skywalker\")",
    establishedIn: "Established in: {book}",
    establishedInChapter: "Established in: {book}, {chapter}",
    sendToSeries: "Send to series",
    conflictTitle: "Differs from the series",
    conflictBody: 'The series says {predicate}: "{seriesValue}" — this book would now say something else. Nothing else changes; the series keeps its own value until you send this one up too.',
    conflictLockAnyway: "Lock anyway",
    consistencyHeading: "Consistency check",
    consistencyCheck: "Check consistency",
    consistencyChecking: "Checking…",
    consistencyLede: "Compares every locked fact across the series and all its books, looking for claims nobody reconciled — not just what you were already warned about while writing.",
    consistencyNone: "No contradictions found.",
    historyHeading: "History & description",
    historyPlaceholder: "Write this entity's history as freely as a wiki article — not a list of facts, the story of who or what they are…",
    historyHint: "For you — never sent to Draft as-is. Only what you extract from it below becomes canon.",
    extractFromHistory: "Extract facts from this text",
    whatDraftSees: "what Draft sees",
    imagesNote: "Images are visual reference only — never sent to Draft as text context.",
    searchPlaceholder: "Search series…",
    noSearchResults: "No series match your search.",
    previousBook: "Previous book",
    nextBook: "Next book",
    detailWords: "{words} words, ~{pages} pages",
    detailFacts: "{own} / {cumulative} locked facts",
    timelineLabel: "Series timeline",
    timelineLede: "The order these books happen in the story — not the order you wrote them. A reading aid for you; it doesn't change what Draft sees yet.",
    timelineReordered: "Reordered",
    timelineMoveEarlier: "Move earlier",
    timelineMoveLater: "Move later",
    synopsisHeading: "Synopsis",
    detailNoSynopsis: "No synopsis yet — write one in the series workspace.",
    detailOpenBook: "Open this book",
    detailOpenWorkspace: "Open series workspace →"
  },
  shelfEdit: {
    settingsLabel: "Edit shelf card",
    title: "Shelf card",
    coverLabel: "Cover",
    addCover: "Add a cover",
    replaceCover: "Replace",
    removeCover: "Remove",
    authorLabel: "Author name",
    authorPlaceholder: "kaampi Write",
    colorLabel: "Spine color",
    heightLabel: "Height",
    heightValue: "{sign}{percent}%",
    descriptionLabel: "Description",
    descriptionPlaceholder: "A short line for the shelf card…"
  },
  editor: {
    manuscriptTitle: "Manuscript title",
    writing: "Writing",
    primer: "Primer",
    primerTitle: "Start prompt for this writing model",
    primerLede: "This goes out before every writing job. The chapter rules still follow. Empty means those rules only.",
    primerRestore: "Use start prompt",
    primerAria: "Start prompt for {model}",
    polishPromptLabel: "Polish instructions",
    polishPromptLede:
      "What the Polish step tells the model to do — a ruthless-editor cleanup pass by default. Edit this however suits your manuscript; Polish always shows a diff to review before anything is kept.",
    polishPromptRestore: "Reset to default",
    polishPromptAria: "Polish instructions",
    review: "Review",
    translateModelLabel: "Translate",
    translateModelFollowWriting: "Use Writing model",
    languageSwitcherOriginal: "Original",
    languageSwitcherCurrentHint: "This manuscript's language",
    languageSwitcherNew: "New language version…",
    languageSwitcherNewPlaceholder: "Language, e.g. Svenska",
    languageSwitcherAdd: "Create",
    translationStatusLoading: "Checking source chapter…",
    translationStatusOrphaned: "The source chapter this was translated from no longer exists.",
    translationStatusUntranslated: "Not translated yet",
    translationStatusStale: "Source changed since this was translated",
    translationStatusCurrent: "Up to date with the source",
    translationStatusShowDiff: "Show what changed",
    translationStatusHideDiff: "Hide what changed",
    translationStatusSnapshotLabel: "Last translated from",
    translationStatusLiveSourceLabel: "Source now",
    translateChapterAction: "Translate chapter",
    retranslateChapterAction: "Re-translate chapter",
    noModels: "No local models found",
    backup: "Backup",
    backupDue: "! Backup",
    backupDueTitle: "This manuscript has changed since the last JSON backup",
    backupTitle: "Backup",
    appExport: "Export for other apps",
    appExportTitle: "Download a kaampi Codex manuscript export — locked Story Bible facts and chapters, for a sibling app like kaampi Comic to import. A snapshot, not a live link.",
    publish: "Publish",
    archiveNav: "File",
    toolsNav: "Tools",
    codexNav: "Codex",
    settings: "Manuscript settings",
    settingsLede:
      "How this manuscript is written. Not Story Bible. Chapters can still override camera, Voice, and Reader.",
    appSettings: "Settings",
    appSettingsLede:
      "App-wide, not tied to any one manuscript: which AI server to use, the writing primer, how many revisions to keep, and the editor's paper color.",
    editorSettingsHeading: "Editor",
    proofreadHeading: "Proofreading",
    generalHeading: "General",
    typographyHeading: "Typography",
    sceneBreakHeading: "Scene break",
    illustrationsHeading: "Illustrations",
    proseLanguage: "Prose language",
    proseLanguagePlaceholder: "e.g. English",
    proseLanguageTitle: "The language the sentences are written in. Empty infers from the manuscript. A writing instruction, not canon.",
    modelsHeading: "AI settings",
    aiFreeModeLabel: "AI-free mode",
    aiFreeModeHint:
      "Grays out every tool that needs AI (drafting, rewriting, analysis, interviews…) instead of hiding them. Writing, chapters, the Story Bible and export all work without AI regardless of this setting — this just turns off the AI tools on top, even if a local AI is connected.",
    aiFreeModeDisabledHint: "Turned off in AI-free mode (Settings).",
    engineLabel: "Engine",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / other local server",
    engineLede: "No cloud accounts or subscriptions, ever — only a server running on this computer or your local network.",
    baseUrlLabel: "Server address",
    baseUrlLede: "Leave empty to use this computer's own default address. To reach a server on another machine on your local network instead — Ollama, LM Studio, or another local server such as llama.cpp — enter its network address here, e.g. http://192.168.1.50:11434.",
    connectionPresetsCurrentLabel: "Current connection",
    connectionPresetActive: "Active",
    connectionPresetUpdate: "Update",
    connectionPresetNew: "+ New model",
    connectionPresetDelete: "Delete",
    connectionPresetDeleteConfirm: "Delete “{name}”? This can’t be undone.",
    connectionPresetNameLabel: "Preset name",
    contextWindowLabel: "Context window",
    contextWindowLede: "How much text the model is told it may actually look at. Ollama's own default is often much smaller than what your model and computer can really handle, which can make Draft lose track of details that were just written a paragraph or two ago. A bigger number needs more memory (RAM/VRAM) — lower it if generation becomes very slow or fails.",
    contextWindowSuggest: "Suggest from model",
    contextWindowSuggesting: "Checking…",
    contextWindowSuggested: "Set to {value}, the model's own reported maximum.",
    contextWindowSuggestError: "Couldn't get this from the model — set it by hand.",
    contextWindowOpenAiNote: "For LM Studio and other OpenAI-compatible servers, the context length is set when you load the model there, not here.",
    proofreadThoroughnessLabel: "Proofread thoroughness",
    proofreadThoroughnessLede:
      "How hard Proofread's Scenes stage looks for repeated scenes — more candidate pairs means a more thorough search but more model calls, so a longer run. Style's own sampling (how much of each chapter it reads for a register/mood slip) already scales on its own from Context window above; this is specifically about Scenes' call count, which Context window isn't a good proxy for.",
    proofreadThoroughnessFast: "Fast — fewer candidates, quicker run",
    proofreadThoroughnessBalanced: "Balanced (default)",
    proofreadThoroughnessThorough: "Thorough — more candidates, slower run",
    filterLoreLabel: "Only show relevant lore for Draft",
    filterLoreLede: "Off by default. Lore facts (imported, not written in a chapter) are otherwise always included, whether or not the chapter is actually about them. Turn this on if your Story Bible has a lot of imported lore and the prompt is getting too large — only lore whose name (or, for Events, a participant or location) is mentioned in the chapter's brief or text so far gets included. Pin an individual lore fact to always include it regardless, with the same button already in the Story Bible.",
    historyLimit: "Revisions",
    historyLimitLede:
      "How many earlier versions of a chapter are kept, going back through Draft, Recast, Extend, Elaborate, and Rewrite. Once you go over the limit, the oldest version is dropped first. Typing on your own doesn't create a version — only those actions do.",
    paperLabel: "Editor paper",
    paperLede:
      "The writing surface's own background and text color, separate from the app's dark/light theme — so you can keep a dark theme everywhere else while writing on a lighter page. Applies to the whole app, not just this manuscript.",
    paperOptions: {
      default: "Match theme",
      warm: "Warm white",
      sepia: "Sepia",
      gray: "Soft gray",
      dark: "Dark"
    },
    spellcheckLabel: "Spell check",
    spellcheckHint:
      "The desktop app's red underlines are the operating system's own spell check, not something this app runs itself — turning it off here just tells the window not to ask for it. Applies to the whole app, not just this manuscript.",
    mascotLabel: "Mascot",
    mascotLede:
      "A companion who shows up with tips here and there, like pointing out the Guide on a new Home screen. Pick one below, or leave it off — you can change this at any time. Applies to the whole app, not just this manuscript.",
    mascotOptions: {
      none: "None",
      kaamilla: "Kaamilla",
      kaamy: "Kaamy",
      kaambot: "Kaambot"
    },
    assistantHeading: "Assistant",
    dropCapLabel: "Drop cap",
    dropCapLede:
      'A large opening letter for each chapter\'s first paragraph, spanning the chosen number of lines — sometimes called an "anfang". Shows live in the editor and carries into Publish exports (HTML, ePub, RTF, ODT; PDF not yet).',
    dropCapOff: "Off",
    dropCapLines: "{n} lines",
    sceneBreakLabel: "Style",
    sceneBreakLede:
      "Decoration for a scene break (a `---` paragraph on its own) — a fading rule with a centered ornament instead of a plain short line. Shows live in the editor and carries into Publish exports, with simpler versions in formats that can't do a true fade (ODT, RTF) or the ornament itself (PDF uses a drawn shape instead of the character).",
    sceneBreakPlain: "Plain (today's short rule)",
    sceneBreakVignette: "Classic book vignette (❦)",
    sceneBreakDiamond: "Minimalist diamond (❖)",
    sceneBreakFleur: "French elegance (⚜)",
    sceneBreakSparkle: "Glimmer / star (✦)",
    sceneBreakWidthLabel: "Width",
    sceneBreakWidthLede:
      "How wide the scene-break line draws, as a scale on top of the chosen style's own width — a narrowed diamond and a narrowed vignette stay proportioned the same relative to each other. Shows live in the editor and carries into Publish's HTML, ePub, and PDF exports (RTF, ODT, and IDML render scene breaks as a plain centered symbol with no line at all, so width has nothing to apply to there).",
    sceneBreakWidthNarrow: "Narrow",
    sceneBreakWidthDefault: "Default",
    sceneBreakWidthWide: "Wide",
    sceneBreakSpacingLabel: "Spacing",
    sceneBreakSpacingLede:
      "The gap above and below the scene-break line, as a scale on top of the chosen style's own spacing. Shows live in the editor and carries into Publish's HTML, ePub, and PDF exports (RTF, ODT, and IDML aren't affected, for the same reason as Width above).",
    sceneBreakSpacingTight: "Tight",
    sceneBreakSpacingDefault: "Default",
    sceneBreakSpacingLoose: "Loose",
    pageSizeLabel: "Page size",
    pageSizeLede:
      "The page dimensions for every export format with a real printed page — IDML, PDF, and ODT (RTF and HTML/ePub reflow with no fixed page). Also roughly scales the editor's own writing column width to match — not true pagination, the editor still scrolls as one continuous column; real page-by-page layout happens in Publish's exports and, for IDML, ultimately in InDesign or Affinity.",
    pageSizeA4: "A4",
    pageSizeLetter: "US Letter",
    pageSize6x9: "6 × 9 in (trade paperback)",
    pageSizePocket: "Pocket (110 × 180 mm)",
    pageSizeStorpocket: "Trade pocket (135 × 210 mm)",
    pageSizeA5: "A5 (148 × 210 mm)",
    pageSizeS5: "S5 (165 × 242 mm)",
    pageMarginLabel: "Page margin",
    pageMarginLede: "Margin on all four sides, for the same three formats as Page size.",
    pageMarginNarrow: "Narrow (0.5 in)",
    pageMarginNormal: "Normal (0.75 in)",
    pageMarginWide: "Wide (1 in)",
    editorBackgroundLabel: "Editor background",
    editorBackgroundLede:
      "A decorative backdrop behind the chapter card and the prose page in the live editor only — never affects Publish exports, which have no such canvas. The text areas themselves always stay fully opaque, so the picture never has to be checked for contrast against your writing.",
    editorBackgroundNone: "None (plain panel)",
    editorBackgroundForest: "Misty forest",
    editorBackgroundMilkyWay: "Milky Way",
    editorBackgroundCork: "Cork board",
    editorBackgroundTriangles: "Triangles",
    editorBackgroundFabric: "Fabric",
    editorBackgroundSchool: "School doodles",
    editorBackgroundPine: "Pine trees",
    editorBackgroundLeaves: "Leaves",
    bodyFontLabel: "Font",
    bodyFontLede:
      "The typeface for the manuscript's prose — in the editor itself, and carried into every Publish export, so there's one choice instead of a separate, unsaved pick each time.",
    fontCategorySerif: "Serif",
    fontCategorySans: "Sans serif",
    bodyWeightLabel: "Weight",
    bodyWeightLede:
      "How heavy the manuscript's prose sits on the page — in the editor itself, and carried into every Publish export, same as Font. Only Regular and Bold because that's what each bundled typeface actually ships.",
    bodyWeightRegular: "Regular",
    bodyWeightBold: "Bold",
    bodyColorDarkLabel: "Color (dark mode)",
    bodyColorLightLabel: "Color (light mode)",
    bodyColorLede:
      "The manuscript's prose color — one for the app's dark theme, one for light, so it stays legible and intentional in both instead of one color picked for whichever theme you happened to be in. Publish exports always use the light-mode color — a static page has no theme toggle of its own, same convention every export already used (dark text on a light page) before this setting existed.",
    uiLanguageStays: "The page language stays in the header.",
    brainstorm: "Brainstorm",
    synopsis: "Synopsis",
    briefs: "Briefs",
    briefsLede:
      "Each card is a chapter. Drag a card and it follows your pointer; the others slide aside. Double-click a title to write that chapter.",
    reorderBriefs: "Chapter briefs. Drag to change order.",
    openChapter: "Write {title}",
    chapters: "Chapters",
    add: "Add",
    untitled: "Untitled",
    removeChapter: "Remove {title}",
    removeChapterFallback: "chapter",
    discardChapterConfirm: "Move “{title}” to Discarded chapters?",
    discardedChapters: "Discarded chapters",
    restoreChapter: "Restore {title}",
    restoreDiscarded: "Restore",
    throwAwayChapter: "Throw away {title}",
    throwAwayConfirm: "Throw away “{title}”? The chapter will be gone. This cannot be undone.",
    chapterFactsNote: {
      one: "{count} fact in the Story Bible comes from this chapter. It will not be removed or changed automatically — check the Story Bible if you want to update or delete it by hand.",
      other: "{count} facts in the Story Bible come from this chapter. They will not be removed or changed automatically — check the Story Bible if you want to update or delete them by hand."
    },
    reorderChapters: "Chapters. Drag to change order.",
    showBrief: "Show brief for {title}",
    hideBrief: "Hide brief for {title}",
    continuesCleared:
      "{title} no longer continues from “{from}”, because that chapter now comes later. It follows the previous chapter in the list.",
    voice: "Voice",
    voicePlaceholder: "Tone, rhythm, word choice",
    chapterVoiceInherit: "Manuscript voice",
    manuscript: "Manuscript",
    brief: "Brief",
    briefPlaceholder: "What this chapter must do. A writing instruction, not canon.",
    chapterTitle: "Chapter title",
    chapterBrief: "Chapter brief",
    chapterVoice: "Chapter voice",
    voiceCue: "Voice",
    reader: "Reader",
    readerTitle: "Who this is written for. Pick the closest age group — Adult writes with no age limits in mind.",
    readerTierHint:
      "Chapters written for this reader use shorter sentences and simpler words, matched to the age group. Proofread will also flag swearing, violence, or explicit content that does not fit that age.",
    readerCategories: {
      board: "Board book (up to age 3)",
      early: "Early reader (ages 4–7)",
      chapter: "Chapter book (ages 8–9)",
      middle: "Middle grade (ages 10–12)",
      ya: "YA (ages 13–17)",
      adult: "Adult"
    },
    chapterReader: "Chapter reader",
    chapterSettingsToggle: "Chapter settings",
    chapterSettingsFor: "Chapter settings for {title}",
    scenesFor: "Scenes for {title}",
    scenesPopoverTitle: "Scenes",
    chapterReaderInheritOption: "Same as manuscript — {category}",
    readerCue: "Reader",
    placeholdersCue: "Has a placeholder to come back to",
    newStrand: "new strand",
    startChapter: "Start Chapter {n}",
    draft: "Draft",
    extract: "Extract facts",
    extracting: "Extracting…",
    analyze: "Analyze",
    critics: "Critics",
    askPassage: "Ask about chapter…",
    proofread: "Proofread",
    notes: "Notes",
    history: "History",
    recast: "Recast prose",
    recasting: "Recasting…",
    recastTitle: "Rewrite this chapter to the current POV, tense, and viewpoint",
    polish: "Polish",
    polishTitle: "Run a cleanup pass over this chapter, then review the changes before they're kept",
    stop: "Stop",
    brainstormChat: "Talk it through…",
    openSynopsis: "Open synopsis",
    maximize: "Maximize",
    restore: "Restore",
    maximizeTitle: "Hide panels and write",
    restoreTitle: "Restore panels (Esc)",
    pinPanel: "Pin panel open",
    unpinPanel: "Auto-hide this panel — hover the edge to bring it back",
    resizePanel: "Drag to resize this panel",
    brainstormLede:
      "Private scratch. One note per idea. Drag them anywhere — there is no order yet. When a note is ready, drag it into the To synopsis column on the right.",
    brainstormPlaceholder: "An idea…",
    synopsisLede:
      "The story in a nutshell: who’s involved, what happens, and how it ends. Drafts are always based on this summary — but nothing becomes set in stone until you finalise it as fact.",
    synopsisPlaceholder: "The story in a few sentences.",
    chapterPlaceholder: "The chapter lives here. Draft, then rewrite until it is yours.",
    chapterImageAdd: "Add chapter illustration",
    chapterImageReplace: "Replace image",
    chapterImageRemove: "Remove image",
    instructTitle: "Change this note",
    instructHint: "Tell the model what to do with the marked note. Only that span is replaced.",
    instructPlaceholder: "What should change?",
    instructAction: "Rewrite",
    addNote: "New note",
    removeNote: "Remove note",
    removeNoteConfirm: "Throw away this note?",
    noteLabel: "Brainstorm note",
    reorderNotes: "Drag to move this note",
    resizeNote: "Drag to resize this note",
    noteColor: "Note colour",
    noteColors: {
      paper: "Paper",
      rust: "Rust",
      sage: "Sage",
      gold: "Gold",
      lilac: "Lilac"
    },
    sendLane: "To synopsis",
    sendLaneLede: "Drop notes here. Order in this column is the order they land as paragraphs.",
    sendLaneEmpty: "Drop notes here",
    sendToSynopsis: "Send to synopsis",
    extractNoteFacts: "Extract facts",
    extractNoteFactsHint: "Find possible Story Bible facts in this note. They land in the review queue as candidates — nothing here becomes canon until you lock it.",
    extractSynopsisFacts: "Extract facts",
    extractSynopsisFactsHint: "Find possible Story Bible facts in this synopsis. They land in the review queue as candidates — nothing here becomes canon until you lock it.",
    extractBriefFacts: "Extract facts",
    extractBriefFactsHint: "Find possible Story Bible facts in this brief. They land in the review queue as candidates — nothing here becomes canon until you lock it.",
    chapterSummary: "Chapter summary",
    summaryPlaceholder: "",
    summarizeChapterAction: "Summarize",
    summarizeChapterHint: "A short digest of what happens in this chapter, so later chapters' Draft/Extend/Elaborate/Beat can see it without needing this chapter's full prose. Proposes it below for you to accept or discard — never saved until you choose.",
    summarizing: "Summarizing…",
    summarizeSuggestionLabel: "Suggested summary",
    applySummarySuggestion: "Use this",
    rejectSummarySuggestion: "Discard"
  },
  backup: {
    title: "Backup",
    body: "A JSON copy this app can read back. Import backup on the shelf restores it. Anything written since that file will be lost.",
    downloadHint: "If no Save As dialog appears, check Downloads. In Brave, enable “Ask where to save each file before downloading” in Settings → Downloads to choose a location for ordinary downloads.",
    saveError: "Could not save the backup. Please try again.",
    whatHappened: "What happened",
    whatHappenedPlaceholder: "Optional. Recast chapter 2, new Voice on 3.",
    documentName: "Document name",
    action: "Backup",
    sendToCore: "Send to kaampi Codex",
    sendToCoreHint: "Saves a private version of the manuscript to your paired kaampi Codex, in addition to the JSON file.",
    sendToCoreSending: "Sending…",
    sendToCoreDone: "Saved to kaampi Codex.",
    sendToCoreError: "Could not reach kaampi Codex right now. Saved locally and will send automatically once the connection is back.",
    errors: {
      "not-backup": "That file is not a manuscript backup.",
      "sandbox-export": "That file is a kaampi Explore card export. Import it in kaampi Explore, not here.",
      "not-manuscript": "That file is not a kaampi Write manuscript backup.",
      "newer-format": "This backup is from a newer kaampi Write. Update the app, then try again.",
      unreadable: "The manuscript inside this file could not be read."
    }
  },
  illustration: {
    fieldLabel: "Illustration style",
    browseLibrary: "Browse library…",
    libraryTitle: "Illustration styles",
    searchPlaceholder: "Search styles…",
    searchResults: "Search results",
    saveCurrentAsNew: "Save current text as new style",
    select: "Use this style",
    edit: "Edit",
    delete: "Delete",
    untagged: "Untagged",
    noResults: "No styles match.",
    newStyleTitle: "New style",
    editStyleTitle: "Edit style",
    nameLabel: "Name",
    promptTextLabel: "Prompt text",
    genreTagsLabel: "Genre tags",
    genreTagsPlaceholder: "Comma-separated, e.g. Fantasy, Adventure",
    exampleImageLabel: "Example image",
    uploadImage: "Upload image",
    replaceImage: "Replace image",
    removeImage: "Remove image",
    deleteConfirm: "Delete “{name}” from the library? This can’t be undone.",
    promptTitle: "Illustration prompt",
    promptHint: "Generated from the passage, locked Story Bible facts, and the manuscript’s illustration style.",
    generating: "Generating…",
    generateError: "Couldn’t generate a prompt this time.",
    viewFullImage: "View full image",
    noStyleSelected: "No style selected",
    customStyleLabel: "Custom prompt",
    editTextManually: "Edit text manually",
    hideManualEdit: "Hide manual text",
    orientationLabel: "Illustration orientation",
    orientations: {
      landscape: "Landscape",
      portrait: "Portrait"
    }
  },
  aiContext: {
    trigger: "View AI context…",
    title: "AI context",
    hint: "Exactly what was sent to the model for the last job that ran, including anything it excluded.",
    empty: "No AI request yet this session. Run a writing or review job, then come back here.",
    operation: "Operation",
    model: "Model",
    tokensEstimate: "~{n} tokens (rough estimate)",
    systemInstructions: "System instructions",
    whatWasSent: "What was sent",
    whatCameBack: "What the model replied (raw, unedited)",
    target: {
      prose: "chapter",
      synopsis: "synopsis",
      brainstorm: "brainstorm note"
    },
    operations: {
      draft: "Draft",
      recast: "Recast",
      polish: "Polish",
      extend: "Extend",
      elaborate: "Elaborate",
      instruct: "Rewrite",
      "brainstorm-chat": "Brainstorm chat",
      "word-swap": "Word alternatives",
      "sentence-split": "Sentence split",
      "paragraph-break": "Paragraph break",
      extract: "Extract facts",
      analyze: "Analyze",
      critics: "Critics",
      illustrate: "Illustration prompt",
      proofread: "Proofread",
      "ask-manuscript": "Ask Manuscript",
      "ask-passage": "Ask about passage",
      interview: "Character interview",
      develop: "Development method",
      "extract-interview": "Extract facts (interview)",
      "extract-brainstorm": "Extract facts (brainstorm)",
      "extract-synopsis": "Extract facts (synopsis)",
      "extract-brief": "Extract facts (brief)",
      "import-lore": "Import lore",
      beat: "Write a beat",
      summarize: "Summarize chapter",
      translate: "Translate chapter",
      developmental: "Developmental analysis"
    }
  },
  askManuscript: {
    nav: "Ask Manuscript",
    title: "Ask your manuscript",
    placeholder: "Ask a question about your story. The answer only uses what is actually written — with the chapters it drew from, so you can check it yourself.",
    action: "Ask",
    asking: "Asking…",
    answerHeading: "Answer",
    sourcesHeading: "Sources",
    jumpToChapter: "Open “{chapter}”"
  },
  askPassage: {
    title: "Ask about this chapter",
    lede: "Ask anything about the chapter's craft — pacing, tension, voice, whether the ending lands. Be as critical as you like; this is just a read, nothing is saved.",
    placeholder: "E.g. “Does this build toward a strong ending?”",
    action: "Ask",
    asking: "Asking…",
    answerHeading: "Answer"
  },
  interview: {
    action: "Interview",
    title: "Interview {name}",
    titleWorld: "Ask about {name}",
    lede: "A private conversation with {name}, built only from what is locked in your Story Bible so far. Nothing said here becomes canon on its own — a way to hear their voice and spot gaps in what is established.",
    ledeWorld: "A private conversation about {name}, built only from what is locked in your Story Bible so far. Nothing said here becomes canon on its own — a way to explore ideas and spot gaps in what is established.",
    placeholder: "Ask {name} something…",
    placeholderWorld: "Ask something about {name}…",
    ask: "Ask",
    asking: "Asking…",
    you: "You",
    thinking: "{name} is thinking…",
    thinkingWorld: "Thinking about {name}…",
    empty: "Nothing asked yet. Start the conversation with {name} below.",
    emptyWorld: "Nothing asked yet. Start exploring {name} below.",
    extractAction: "Extract facts",
    extracting: "Extracting…",
    extractAsOf: "As of",
    extractAsOfHint: "Which chapter — or, for a chapter split into scenes, which scene — these facts belong to in story time, not the manuscript's page order. A whole-chapter Draft sees a fact from that chapter's first page onward; a scene-by-scene Draft only sees it from its own scene onward. Pick where this actually becomes true (e.g. when two characters first meet, or a reveal partway through a chapter), not just whichever chapter you happen to have open.",
    extractWholeChapter: "Whole chapter",
    extractSceneFallback: "Scene {index}",
    personalityLabel: "Personality for this conversation — try it out, save to the profile once the tone feels right",
    personalityPlaceholder: "How they talk and react",
    personalitySave: "Save to profile"
  },
  brainstormChat: {
    title: "Talk it through",
    lede: "A loose back-and-forth about your story — like talking it over with a friend. Nothing here is canon, and none of it is kept; drag the ideas worth keeping onto the board yourself.",
    placeholder: "Say what's on your mind…",
    send: "Send",
    sending: "Thinking…",
    you: "You",
    partner: "Partner",
    thinking: "Thinking…",
    empty: "Nothing said yet. Start talking an idea through below.",
    addToNotes: "Add to notes"
  },
  timeline: {
    nav: "Timeline",
    title: "Timeline",
    lede: "Reading order is not always when things happen. Give a chapter a story-time note and move it to see how it actually falls, compared to where it sits in the manuscript.",
    readingPosition: "Manuscript position {n}",
    storyTimeCaption: "Chronological position",
    storyTimePlaceholder: "E.g. “Three years earlier”",
    storyTimeLabel: "Story time for “{chapter}”",
    outOfOrder: "Out of reading order",
    moveEarlier: "Move earlier",
    moveLater: "Move later"
  },
  continuity: {
    leakCount: {
      one: "{count} fact from later in the story",
      other: "{count} facts from later in the story"
    },
    leakHint: "These are already locked truth, but established after this chapter — the model can still see them here. Not necessarily a problem (maybe this chapter is a flash-forward), just worth a glance.",
    establishedIn: "Established in “{chapter}”"
  },
  placeholders: {
    count: {
      one: "{count} placeholder to come back to",
      other: "{count} placeholders to come back to"
    },
    empty: "Placeholder",
    jumpTo: "In “{chapter}”"
  },
  darlings: {
    count: {
      one: "{count} darling kept",
      other: "{count} darlings kept"
    },
    jumpTo: "In “{chapter}”",
    restore: "Restore",
    discard: "Discard for good"
  },
  plotlines: {
    nav: "Plotlines",
    title: "Plotlines",
    lede: "Which threads run through which chapter, at a glance. Mark a chapter against every thread it touches.",
    chapterColumn: "Chapter",
    addPlaceholder: "New thread name",
    addAction: "Add",
    removeThread: "Remove thread “{title}”",
    renameLabel: "Thread name",
    cellLabel: "{chapter} — {thread}",
    emptyPlotlines: "No threads yet. Add one below to start the matrix.",
    emptyChapters: "Write a chapter first — the matrix needs something to show.",
    colorSwatchLabel: "Set “{thread}”'s color to {color}",
    colorNames: {
      lime: "Lime",
      green: "Green",
      cyan: "Cyan",
      blue: "Blue",
      violet: "Violet",
      magenta: "Magenta",
      orange: "Orange",
      coral: "Coral",
      grey: "Grey",
      charcoal: "Charcoal"
    },
    editAction: "Edit",
    editLabel: "Edit thread “{title}”",
    editTitle: "Edit thread",
    colorFieldLabel: "Color",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Shown as a tooltip over the thread's name and its bars",
    hideFromAiLabel: "Hide from AI",
    hideFromAiHint: "Left out of the Draft/Extend/Elaborate prompt for chapters tagged with this thread. Still shown to you while writing.",
    chapterThreadsLabel: "Threads:"
  },
  method: {
    nav: "Development method",
    title: "Development method",
    lede: "A development method is a ready-made set of steps for growing your story from a spark into a shape. It never keeps anything of its own — every step just writes into Synopsis or Plotlines, which you already have. Skip this entirely if you'd rather write freeform.",
    pickerLede: "Pick a method to get a guided path. You can change your mind later — nothing already written is ever deleted.",
    useAction: "Use this method",
    changeAction: "Change method",
    noneAction: "No method — write freely",
    activeBadge: "In use",
    beatsHeading: "Beats",
    beatsHint: "Each beat below became a thread in Plotlines. Open Plotlines to mark which chapters cover which beat.",
    openPlotlines: "Open Plotlines",
    assistAction: "Suggest a start",
    assisting: "Thinking…",
    draftPlaceholder: "Write your own, or ask the assistant for a start…",
    suggestionHeading: "Suggestion",
    useSuggestionAction: "Use this text",
    sendToSynopsisAction: "Send to Synopsis",
    sentToSynopsis: "Added to Synopsis.",
    removeOldBeatsConfirm: {
      one: "Remove the {count} leftover thread from {method} — {titles}?",
      other: "Remove the {count} leftover threads from {method} — {titles}?"
    },
    methods: {
      snowflake: {
        name: "Snowflake Method",
        description:
          "Start with one sentence and grow the story outward in a few widening passes. A simplified, three-pass take on Randy Ingermanson's method.",
        steps: {
          logline: {
            label: "One sentence",
            prompt: "Sum up the whole story in one sentence — the character, what they want, and what stands in the way."
          },
          paragraph: {
            label: "One paragraph",
            prompt:
              "Grow that sentence into a short paragraph: the setup, the conflict that develops it, the turn partway through, and how it ends."
          },
          synopsis: {
            label: "Full synopsis",
            prompt: "Grow the paragraph into a full synopsis — the shape of the whole book, scene by scene where it helps."
          }
        }
      },
      "three-act": {
        name: "Three-Act Structure",
        description: "The classic setup / confrontation / resolution shape, as seven recognizable turning points.",
        steps: {
          setup: { label: "Setup", hint: "The ordinary world, before the story disturbs it." },
          inciting: { label: "Inciting incident", hint: "The event that starts the story moving." },
          "break-two": { label: "Break into Act Two", hint: "The character commits — there is no going back to the ordinary world." },
          midpoint: { label: "Midpoint", hint: "A false victory or false defeat that raises the stakes." },
          "all-is-lost": { label: "All is lost", hint: "The low point — it looks like the character cannot win." },
          climax: { label: "Climax", hint: "The final confrontation the whole story has been building to." },
          resolution: { label: "Resolution", hint: "The new ordinary world, after the story's change." }
        }
      },
      "save-the-cat": {
        name: "Save the Cat",
        description: "Blake Snyder's 15-beat sheet — a detailed, percentage-mapped structure popular in genre fiction and screenwriting.",
        steps: {
          "opening-image": { label: "Opening image", hint: "A snapshot of the character's world before the story." },
          "theme-stated": { label: "Theme stated", hint: "Someone states, almost in passing, what the story is really about." },
          "set-up": { label: "Set-up", hint: "The world, the cast, and what is missing from the character's life." },
          catalyst: { label: "Catalyst", hint: "The event that kicks the story into motion." },
          debate: { label: "Debate", hint: "The character hesitates — can they really do this?" },
          "break-two": { label: "Break into Two", hint: "The character chooses to act, leaving the old world behind." },
          "b-story": { label: "B story", hint: "A second thread begins — often a relationship that carries the theme." },
          "fun-and-games": { label: "Fun and games", hint: "The premise delivers on its promise — the trailer moments." },
          midpoint: { label: "Midpoint", hint: "A false victory or false defeat; stakes rise, the clock starts." },
          "bad-guys-close-in": { label: "Bad guys close in", hint: "External and internal pressure both tighten." },
          "all-is-lost": { label: "All is lost", hint: "The lowest point — often marked by a loss or a death." },
          "dark-night": { label: "Dark night of the soul", hint: "The character sits with the loss before finding a way forward." },
          "break-three": { label: "Break into Three", hint: "The character finds the solution, often from the B story's lesson." },
          finale: { label: "Finale", hint: "The character acts on the lesson and resolves the story's problem." },
          "final-image": { label: "Final image", hint: "A snapshot that mirrors the opening image, showing how much has changed." }
        }
      },
      "hero-journey": {
        name: "Hero's Journey",
        description: "Campbell and Vogler's mythic structure — twelve stages of a character leaving the known world and returning changed.",
        steps: {
          "ordinary-world": { label: "Ordinary world", hint: "Life before the adventure." },
          call: { label: "Call to adventure", hint: "Something disturbs the ordinary world." },
          refusal: { label: "Refusal of the call", hint: "Fear or doubt holds the character back." },
          mentor: { label: "Meeting the mentor", hint: "Someone gives the character what they need to go on." },
          threshold: { label: "Crossing the threshold", hint: "The character commits and leaves the ordinary world." },
          tests: { label: "Tests, allies, enemies", hint: "The new world's rules, friends, and rivals are learned." },
          approach: { label: "Approach to the inmost cave", hint: "Preparing for the central ordeal." },
          ordeal: { label: "Ordeal", hint: "The central crisis — a brush with death, literal or otherwise." },
          reward: { label: "Reward", hint: "The character takes hold of what they came for." },
          "road-back": { label: "The road back", hint: "Committing to finish the journey and return." },
          resurrection: { label: "Resurrection", hint: "A final, higher-stakes test that proves the change is real." },
          return: { label: "Return with the elixir", hint: "The character comes home changed, with something to give back." }
        }
      }
    }
  },
  guide: {
    nav: "Guide",
    title: "Guide",
    intro: "A short walkthrough — how to get the app talking to a model, and what everything does once it is.",
    closeAction: "Close",
    fromErrorLink: "See the quickstart guide",
    helpFor: "Guide: {topic}",
    connectAiButton: "Connect a local AI",
    quickstartHeading: "Getting started with a local AI",
    quickstartCards: [
      {
        heading: "Install a local AI server",
        body: "If you don't already have one, we recommend Ollama — free, from ollama.com. Prefer something else? LM Studio or another local server works too."
      },
      {
        heading: "Choose your AI model",
        body: "The AI model is what actually writes and reasons with you. We recommend one tuned for fiction, for example fluffy/l3-8b-stheno-v3.2 (search for \"stheno\" in Ollama). Otherwise, any general chat model works — for example llama3 or mistral."
      },
      {
        heading: "Connect it to kaampi Write",
        body: "Using Ollama? Nothing to configure — kaampi Write finds it automatically. Using LM Studio or another server instead? Open Settings → Models, choose it under Engine, and paste the server address it shows you."
      }
    ],
    categories: guideCategories,
    sections: guideSections,
    faqHeading: "Troubleshooting",
    faq: [
      {
        heading: "“No local model found”",
        body: "kaampi Write cannot reach your local server. Using Ollama? Make sure it is running. Using LM Studio or another server? Check Settings → Models — the engine and server address need to match what is actually running on your computer."
      },
      {
        heading: "Where is my book stored?",
        body: "On your own computer, in the browser's local storage — nothing is uploaded anywhere. Use Backup from time to time to save a copy you can restore from, in case you clear your browser's data."
      },
      {
        heading: "Can I run the app on another computer or phone on my home network?",
        body: "Yes, but it's two separate things. To reach the app itself from another device, start it with \"npm run dev -- --host\" and use the network address the terminal prints (e.g. http://192.168.1.23:5175) instead of localhost. For that device to also talk to your local AI model, the model server (e.g. Ollama) needs to allow it too: let it listen broadly (OLLAMA_HOST=0.0.0.0), allow the address (OLLAMA_ORIGINS), and point the app's model setting at that computer's network address instead of localhost. Keep in mind each device still keeps its own library — manuscripts aren't shared between them automatically; move a book between devices with Backup/Restore."
      },
      {
        heading: "Can I use a paid AI service instead?",
        body: "No — on purpose. kaampi Write only ever talks to a model running on your own computer or network. That is not a missing feature; it is the whole point: your manuscript never has to leave your machine."
      }
    ]
  },
  handbook: {
    title: "Guide",
    intro:
      "kaampi Write contains many tools, but you don't need to learn all of them before you start.\nYou can write a whole book just by creating chapters and writing in the editor. The other tools are there when you need help with ideas, structure, characters, continuity, editing, or publishing.\n\nStart simple. Add structure when the story needs it.",
    categories: handbookCategories,
    sections: handbookSections
  },
  scenes: {
    toggleCount: {
      one: "{count} scene",
      other: "{count} scenes"
    },
    titlePlaceholder: "Untitled scene",
    titleLabel: "Scene {index} title",
    briefPlaceholder: "Writing note for this scene only (optional)",
    briefLabel: "Scene {index} brief",
    mergeWithNext: "Merge with next ↓",
    splitHere: "Split into two…",
    splitHint: "Pick where the new scene starts:",
    draft: "Draft",
    recast: "Recast",
    analyze: "Analyze",
    addScene: "Add scene",
    addSceneDisabledHint: "Finish writing this scene before adding the next"
  },
  publish: {
    title: "Publish",
    body: "A readable copy of the story. Leaves brainstorm out. RTF and ODT open in Scrivener. HTML opens in any browser. ePub opens in an e-reader. PDF is ready to print. IDML opens in InDesign, for an author doing the book's own typesetting there — one tall page per chapter, no page layout decided for you.",
    documentName: "Document name",
    format: "Format",
    font: "Font",
    systemFont: "System serif (Times/Georgia)",
    fontSetInSettings: "set in Settings → Typography",
    paragraphStyle: "Paragraph style",
    paragraphStyleSpaced: "Blank line between paragraphs",
    paragraphStyleIndented: "Indented, no blank line (classic book style)",
    action: "Publish",
    markdown: "Markdown",
    txt: "Plain text",
    rtf: "RTF",
    odt: "ODT",
    html: "HTML",
    epub: "ePub",
    pdf: "PDF",
    idml: "IDML (InDesign)"
  },
  progress: {
    title: "Progress",
    setGoal: "Set goal",
    editGoal: "Edit goal",
    removeGoal: "Remove goal",
    saveGoal: "Save goal",
    targetWordsLabel: "Target word count",
    deadlineLabel: "Deadline",
    daysPerWeekLabel: "Writing days per week",
    wordsOfTarget: "{current} of {target} words",
    percentComplete: "{percent}% of the way there",
    dailyPaceNeeded: "~{perDay} words a day needed to make it",
    overdue: "Deadline passed — {remaining} words still to go",
    targetReached: "Target reached"
  },
  find: {
    action: "Find/Replace",
    title: "Find & replace",
    body: "Matches light up in the text. Arrows jump to the next or previous. Story Bible stays. Brainstorm stays unless you include it.",
    find: "Find",
    replaceWith: "Replace with",
    matchCase: "Match case",
    wholeWord: "Whole word",
    includeBrainstorm: "Include brainstorm",
    here: "This page",
    echoes: "Repeated words",
    phrases: "Repeated phrases",
    noneEcho: "No repeated words on this page.",
    nonePhrases: "No repeated phrases on this page.",
    none: "Nothing matches.",
    hits: { one: "{count} match", other: "{count} matches" },
    snippetHint: "The lines under a heading are the word with the text around it. The search window covers the page, so the places are listed here.",
    moreSnippets: "And {count} more in this place.",
    fields: {
      title: "Title",
      brief: "Brief",
      voice: "Voice",
      viewpoint: "Viewpoint"
    },
    replace: "Replace",
    replaceCount: "Replace {count}",
    showHit: "Show {place}",
    untitled: "Untitled",
    prev: "Previous match",
    next: "Next match",
    position: "{current} of {total}"
  },
  proofread: {
    action: "Proofread",
    title: "Proofread",
    runningTitle: "Proofreading in progress — a good time for a cup of tea.",
    lede: "A last Review pass over the whole manuscript. Quotes and notes only. Nothing is rewritten.",
    grammar: "Grammar",
    scenes: "Repeated scenes",
    style: "Style and mood across chapters",
    age: "Age report",
    continuity: "Continuity",
    setups: "Setups & payoffs",
    facts: "Fact check",
    grammarProgress: "Grammar — {done} of {total} chapters done",
    scenesProgress: "Looking for repeated scenes — {done} of {total} paragraph pairs compared",
    styleProgress: "Style and mood consistency between chapters",
    ageProgress: "Compiling the age report",
    continuityProgress: "Checking that no one is in two places at once",
    setupsProgress: "Looking for planted details that have not paid off yet",
    factsProgress: "Checking facts against the Story Bible — {done} of {total} chapters done",
    now: "Now: {detail}",
    nowGrammar: "reading chapter {n}…",
    nowScenes: "comparing chapter {a} with chapter {b}…",
    nowStyle: "listening for a shift in register or mood…",
    nowAge: "weighing the prose against Reader…",
    nowContinuity: "checking who and what is where, and when…",
    nowSetups: "checking what has been planted, and what has paid off…",
    nowFacts: "checking chapter {n} against the Story Bible…",
    stillWorking: "Still working — a single chapter can take a few minutes on slower hardware. Nothing is stuck.",
    percent: "{n}%",
    continue: "Continue",
    runAgain: "Run again",
    resultsTitle: "Proofread notes",
    emptyResults: "Nothing solid this time.",
    clickHint: "Click a line to open that chapter.",
    stale: "This chapter has changed since the pass.",
    suggestion: "Suggestion",
    chapter: "Chapter {n}",
    chapters: "Chapters {a} and {b}",
    paused: "Paused. What finished is saved.",
    error: "The pass stopped. What finished is saved.",
    craft: "Camera on the cards",
    contentFlag: "Content check",
    stageSkipped: "Not selected this time",
    scopeSummary: "Scope: just {chapter}. Grammar and Fact-check only cover that chapter; the other stages always compare the whole manuscript.",
    setupTitle: "Before we run this",
    setupLede: "Check off what you want checked this time. Everything is checked by default, same as before.",
    setupStagesLabel: "What to check",
    setupScopeLabel: "Scope",
    setupScopeManuscript: "Whole manuscript",
    setupScopeChapter: "Just \"{chapter}\" (the open chapter)",
    setupScopeChapterHint: "Only affects Grammar and Fact-check — the only two stages that scale with chapter count. The others always compare chapters to each other, so they run over the whole manuscript regardless.",
    openPlaceholdersChapter: {
      one: "{count} open placeholder note in this chapter — easy to run proofreading and forget it's still there.",
      other: "{count} open placeholder notes in this chapter — easy to run proofreading and forget they're still there."
    },
    openPlaceholdersManuscript: {
      one: "{count} open placeholder note across the manuscript — easy to run proofreading and forget it's still there.",
      other: "{count} open placeholder notes across the manuscript — easy to run proofreading and forget they're still there."
    },
    setupStart: "Start proofreading",
    setupNothingSelected: "Pick at least one thing to check."
  },
  developmental: {
    action: "Developmental analysis",
    runningTitle: "Developmental analysis in progress — this covers the whole manuscript, so it can take a while.",
    resultsTitle: "Developmental report",
    lede: "A structural read of the whole manuscript — pacing, tension, and which threads pay off. Scene by scene, then chapter by chapter, then one final report. Nothing is rewritten.",
    stageScene: "Reading scenes",
    stageChapter: "Synthesizing chapters",
    stageReport: "Writing the report",
    sceneProgress: "Scenes — {done} of {total} read",
    chapterProgress: "Chapters — {done} of {total} synthesized",
    reportProgress: "Writing the final report",
    now: "Now: {detail}",
    nowScene: "reading chapter {chapter}, scene {scene}…",
    nowChapter: "synthesizing chapter {n}…",
    nowReport: "writing the final report…",
    stillWorking: "Still working — this covers the whole manuscript, so it can take a good while on slower hardware. Nothing is stuck.",
    percent: "{n}%",
    continue: "Continue",
    runAgain: "Run again",
    emptyResults: "No report yet.",
    openingHookLabel: "Opening hook",
    openingHookGood: "Chapter 1 hooks the reader — a concrete unanswered question or an out-of-the-ordinary event pulls them forward.",
    openingHookIssues: {
      none: "Chapter 1 doesn't clearly hook the reader.",
      no_question: "Chapter 1 doesn't raise anything unresolved — nothing pulls the reader to the next page.",
      backstory_dump: "Chapter 1 opens on explaining history or context instead of starting the story's actual present-tense action.",
      reveals_too_much: "Chapter 1 gives away the mystery or stakes before they get to function as a question."
    },
    summaryLabel: "Summary",
    concernsLabel: "Worth a look",
    clickHint: "Click a chapter to open it.",
    chapter: "Chapter {n}",
    paused: "Paused. What finished is saved.",
    error: "The pass stopped. What finished is saved.",
    setupTitle: "Before we run this",
    setupLede: "A manually started pass over the whole manuscript — scene by scene, then chapter by chapter, then a final report. It can take a while; feel free to start it and come back later.",
    setupNoThreadsWarning: "No threads are tagged anywhere in this manuscript yet (Plotlines) — the read still works, just a bit coarser without that grounding.",
    setupStart: "Start analysis"
  },
  craft: {
    pov: "POV",
    povAria: "Point of view",
    chapterPov: "Chapter point of view",
    tense: "Tense",
    tenseAria: "Tense",
    chapterTense: "Chapter tense",
    viewpoint: "Viewpoint",
    viewpointPlaceholder: "Whose head?",
    viewpointAria: "Viewpoint character",
    chapterViewpoint: "Chapter viewpoint character",
    viewpointInherit: "{name} (manuscript)",
    usual: "Usual",
    more: "More",
    inheritPov: "Manuscript · {label}",
    inheritTense: "Manuscript · {label}",
    continuesFrom: "Continues from",
    previousChapter: "Previous chapter",
    previousChapterNamed: "Previous chapter · {label}",
    noneStrand: "None · new strand",
    attachedContextLabel: "Attached context",
    attachedContextLede:
      "Pin an earlier chapter — or just one of its scenes — as extra context for Draft and Recast on this chapter. Sends its full prose, not just a summary line: useful when a place, object, or character needs to read exactly as it was first described, something \"Story so far\" alone can lose.",
    attachedContextPickChapter: "Pick a chapter…",
    attachedContextWholeChapter: "Whole chapter",
    attachedContextSceneFallback: "Scene {index}",
    attachedContextAdd: "Attach",
    attachedContextRemove: "Remove {label} from attached context",
    attachedContextCost: "~{n} tokens of attached context",
    modes: {
      limited: "3rd limited",
      first: "1st person",
      omniscient: "3rd omniscient",
      objective: "3rd objective",
      second: "2nd person"
    },
    tenses: {
      past: "Past",
      present: "Present"
    }
  },
  bible: {
    title: "Story Bible",
    search: "Search Story Bible",
    searchPlaceholder: "Find a name or claim",
    shelves: "Story Bible shelves",
    review: "Review facts",
    reviewCount: "Review · {count}",
    lockedCount: "{count} locked",
    exportCards: "Export cards",
    exportCardsTitle: "Download characters, places, and objects for kaampi Explore",
    importLoreNav: "Import lore",
    importLoreTitle: "Import a lore article",
    importLoreLede: "Paste text from your own lorebook. An AI reads through it and proposes facts for the right cards — the same as extracting facts from a chapter. Nothing locks in directly; everything lands in the review queue. The text itself is never saved to the book, only whatever facts come out of it.",
    importLoreArticleTitle: "Article title (optional, shown in review)",
    importLoreArticleTitlePlaceholder: "e.g. \"The Lighthouse\" or \"Order's Rules\"",
    importLoreText: "Text to extract facts from",
    importLoreTextPlaceholder: "Paste the article here…",
    importLoreAction: "Extract facts",
    importLoreExtracting: "Extracting…",
    importLoreUpload: "Upload file",
    importLoreFoundCount: "Found {count}",
    importLoreArticlesCount: { one: "{count} article", other: "{count} articles" },
    importLoreExtractingProgress: "Extracting {current} of {total}…",
    importLoreActionCount: "Extract facts from {count}",
    importSeriesNav: "Import previous book",
    importSeriesTitle: "Bring the series forward",
    importSeriesLede: "Upload the previous book's \"Export for other apps\" file to bring its locked facts forward as review candidates — a fact that held last book isn't automatically still true in this one, so nothing locks in directly. Pick which characters, places and other entities to bring in below.",
    importSeriesUpload: "Upload export file",
    importSeriesParseError: {
      "not-export": "That file isn't a kaampi Write export.",
      "wrong-kind": "That file isn't a manuscript export.",
      "newer-format": "That export was made with a newer version of kaampi Write than this one understands.",
      invalid: "That file couldn't be read as an export."
    },
    importSeriesFoundCount: "\"{title}\" — found {count} entities",
    importSeriesFactsCount: { one: "{count} fact", other: "{count} facts" },
    importSeriesActionCount: "Bring in {count}",
    importSeriesImported: "Added {count} to the review queue.",
    importSeriesTextTitle: "Anything else to bring forward?",
    importSeriesTextLede: "Anything from the previous book that never became a structured fact — write it here and an AI will propose facts from it, the same as importing a lore article.",
    importSeriesTextPlaceholder: "e.g. notes, a brief, or anything else worth carrying over…",
    importSeriesTextAction: "Extract facts",
    nothingMatches: "Nothing matches.",
    hidden: "Hidden",
    name: "Name",
    close: "Close",
    reviewBody: "Proposed Story Bible rows. Thicken them, then lock — or reject.",
    hideFromDraft: "Hide from Draft",
    interview: "Interview",
    interviewPickerTitle: "Who do you want to interview?",
    interviewPickerLede: "Any Story Bible card — not just characters. A place or an object can be interviewed too, in the third person, as a way to build out your world.",
    showToDraft: "Show to Draft",
    hiddenNote: "The model cannot see this card until you show it again.",
    deleteEntity: "Delete this card",
    deleteConfirm: "Delete “{name}” entirely, along with all its facts, pictures, and profile? This cannot be undone.",
    thisIsA: "This is a",
    pictures: "Pictures",
    picturesAside: "(For later export. Draft never sees these.)",
    removePicture: "Remove picture {n}",
    addImage: "Add image",
    addingImage: "Adding image",
    addFact: "Add fact",
    addFactHint: "Adding a claim under a category that already has one offers to replace it — the earlier value stays visible in History, anchored to the chapter you're writing now.",
    claimPlaceholder: "The claim, in one line",
    lockInto: "Lock into Story Bible",
    addChoiceTitle: "Replace or add?",
    addChoiceBody: "{predicate} already has “{existing}”. Should the new text replace it, or sit alongside it as another {predicate} row?",
    addChoiceKeepBoth: "Add as another",
    addChoiceReplace: "Replace the existing one",
    mergeStart: "Merge cards…",
    createSeriesFromBook: "Create series from this book",
    creatingSeriesFromBook: "Creating series…",
    createSeriesFromBookTitle:
      "Creates a new series named after this book, assigns the book to it, and promotes every one of its locked facts up to the series as established canon.",
    createSeriesFromBookConfirm:
      'Create a series called "{title}", with this book as its first? Every one of its locked facts becomes the series\' own canon.',
    createSeriesFromBookDone: 'Created the series "{title}", with this book as its first.',
    seriesMissing: "This book belongs to a series that can't be found — deleted, or never synced to this install. Your own Story Bible is unaffected, but this book won't show on the home page's standalone shelf until it's either reconnected or made standalone again.",
    seriesMissingConfirm: "Make this book standalone again? Its own locked facts stay exactly as they are — it just stops pointing at a series that can't be found.",
    seriesMissingFix: "Make this book standalone",
    mergeSelectedCount: { one: "{count} card selected", other: "{count} cards selected" },
    mergeAction: "Merge ({count})",
    mergeKindMismatch: "These cards are different kinds (a character and a location, say) — merging only works within one kind.",
    mergeTitle: "Merge {count} cards into one",
    mergeLede: "Nothing is deleted — every fact moves onto the merged card, and each old name becomes an alias so a later mention of either still resolves here.",
    mergeLabelLegend: "Which name should the merged card show?",
    mergeLabelCustom: "Something else",
    mergeConflictsLabel: "These cards disagree — pick what stays",
    mergeConfirm: "Merge",
    mergeReplaceTitle: "Replace the old names in the manuscript too?",
    mergeReplaceBody: "The merged card is now called “{to}”. These earlier names still appear in your text — replace them there as well?",
    mergeReplaceRow: "“{from}” in {places}",
    mergeWithPlaceholder: "Merge with…",
    history: "History",
    historyAside: "(Replacing a claim below adds an entry here.)",
    historyCurrent: "current",
    asOfLabel: "View Story Bible as of",
    asOfNow: "Current",
    asOfBanner: "Viewing the Story Bible as it stood at “{chapter}” — read-only.",
    asOfBack: "Back to current",
    asOfEntityLede: "As it stood at “{chapter}”.",
    mentions: "Mentions",
    mentionsAside: "(Every chapter that names this entity in its prose.)",
    aliases: "Aliases",
    aliasesAside: "(Nicknames and titles. Count as a mention too.)",
    aliasesPlaceholder: "Comma-separated nicknames",
    exclusions: "Exclusions",
    exclusionsAside: "(Phrases that shouldn't count as a mention.)",
    exclusionsPlaceholder: "Comma-separated phrases to ignore",
    replaceTitle: "Replace in manuscript?",
    replaceBody: "Replace “{from}” with “{to}” in {places}. Brainstorm is left alone.",
    places: { one: "{count} place", other: "{count} places" },
    keepTexts: "Keep texts",
    replace: "Replace",
    pronoun: "Pronoun",
    age: "Approximate age",
    looks: "Looks",
    looksPlaceholder: "Body and face. Not clothes.",
    tags: "Tags",
    tagsAside: "(Shelf only. Draft never sees these.)",
    tagsPlaceholder: "Comma-separated traits",
    personality: "Personality",
    personalityPlaceholder: "How they tend to be",
    goals: "Goals",
    goalsPlaceholder: "What they want",
    fears: "Fears",
    fearsPlaceholder: "What they're afraid of",
    eventWhere: "Where",
    eventWhereNone: "Not placed yet",
    eventParticipants: "Who was there",
    eventsHere: "Events here",
    peopleHere: "People here",
    namePlaceholder: "Name",
    factText: "Fact text",
    sourceLabel: "Source: {source}",
    sources: {
      chapter: "Chapter",
      interview: "Interview",
      lore: "Lore",
      brainstorm: "Brainstorm",
      synopsis: "Synopsis",
      brief: "Brief",
      series: "Previous book"
    },
    unconfirmed: "Unconfirmed — only claimed by a character, not settled backstory.",
    unconfirmedClaimedBy: "Unconfirmed — claimed by {name}, not settled backstory.",
    unconfirmedBadge: "Unconfirmed",
    promoteUnconfirmedConfirm: "Send this to the series anyway? “{value}” is still unconfirmed — nobody has independently borne it out. Sending it makes it settled canon for every book in the series.",
    promoteUnconfirmedConfirmClaimedBy: "Send this to the series anyway? “{value}” is still only claimed by {name}, not independently confirmed. Sending it makes it settled canon for every book in the series.",
    seriesSkippedUnconfirmed: "Skipped {count} unconfirmed claim(s) — they stayed in this book instead of becoming series canon. Send them individually from the entity's card if they should be series-wide after all.",
    conflictsWith: "Conflicts with: {value}",
    similarTo: "Similar to: {value} — looks like the same fact, more detailed",
    lock: "Lock",
    merge: "Merge",
    keepSeparate: "Keep both",
    reject: "Reject",
    show: "Show",
    hide: "Hide",
    showClaim: "Show this claim to Draft",
    hideClaim: "Hide this claim from Draft",
    positionOverrideAuto: "Auto",
    positionOverrideInclude: "Always on",
    positionOverrideExclude: "Never on",
    positionOverrideToInclude: "Always include in Draft, regardless of the chapter's position in story time or the lore-relevance filter",
    positionOverrideToExclude: "Always exclude from Draft, regardless of the chapter's position in story time",
    positionOverrideToAuto: "Back to automatic positioning (goes by story time)",
    edit: "Edit",
    editFact: "Edit fact",
    save: "Save",
    remove: "Remove",
    removeFactConfirm: "Remove this fact — “{value}”? This can't be undone. Use this for a claim that's simply wrong, not one you're correcting with a new value (use Edit for that, or Update… if it's changing from here on).",
    updateFact: "Update…",
    updateFactHint: "Mark this as changing from here — fills in Add fact below, anchored to the chapter you're currently writing. Unlike Edit, which corrects what this always was.",
    kinds: {
      characters: "Characters",
      locations: "Locations",
      objects: "Objects",
      groups: "Groups",
      events: "Events",
      concepts: "Concepts"
    },
    singular: {
      characters: "Character",
      locations: "Location",
      objects: "Object",
      groups: "Group",
      events: "Event",
      concepts: "Concept"
    },
    newLabel: {
      characters: "New character",
      locations: "New location",
      objects: "New object",
      groups: "New group",
      events: "New event",
      concepts: "New concept"
    },
    empty: {
      characters: "No characters yet.",
      locations: "No locations yet.",
      objects: "No objects yet.",
      groups: "No groups yet.",
      events: "No events yet.",
      concepts: "No concepts yet."
    },
    predicates: {
      "core.identity": "Identity",
      "core.trait": "Trait",
      "core.place": "Place",
      "core.object": "Object",
      "core.group": "Group",
      "core.relationship": "Relationship",
      "core.event": "Event",
      "core.concept": "Concept"
    },
    pronouns: {
      she: "She",
      he: "He",
      it: "It"
    }
  },
  canvas: {
    jumpToEntity: "Ctrl+click (Cmd+click on Mac) to open {name}’s Story Bible card",
    extend: "Extend",
    elaborate: "Elaborate",
    beat: "Write a beat…",
    beatTitle: "Write a beat",
    beatHint: "Short and concrete: what happens next? The model writes only that beat, nothing more, and inserts it right at the cursor.",
    beatPlaceholder: "What happens next, in one line",
    beatAction: "Write the beat",
    rewriteMenu: "Rewrite…",
    illustrate: "Illustration prompt…",
    lift: "Lift to synopsis",
    cutToDarling: "Cut to Darlings",
    createScene: "Create scene",
    formatToolbar: "Formatting",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    manual: "Manual Edit",
    insteadOf: "Instead of “{word}”",
    looking: "Looking…",
    noAlts: "No alternatives this time.",
    retry: "Retry",
    manualTitle: "Manual Edit",
    manualBody: "Rewrite only the marked passage. The rest of the text stays put.",
    apply: "Apply",
    rewriteTitle: "Rewrite",
    rewriteHint: "Tell the model how to change the marked passage. Only that span is replaced.",
    rewritePlaceholder: "What should change?",
    rewriteAction: "Rewrite",
    ask: "Ask…",
    askTitle: "Ask about this passage",
    askHint: "Ask anything about the marked passage — be as critical as you like. The answer is just a read, nothing is changed or saved.",
    askPlaceholder: "What do you want to know?",
    askAction: "Ask",
    placeholderAdd: "Drop a placeholder…",
    placeholderAddTitle: "Drop a placeholder",
    placeholderAddHint: "A quick note to yourself — a name, a fact, a date you'll fill in later. Keep writing; come back to it anytime.",
    placeholderPlaceholder: "What do you need to come back to?",
    placeholderAddAction: "Drop it",
    placeholderViewTitle: "Placeholder",
    placeholderSave: "Save",
    placeholderResolve: "Mark resolved",
    placeholderOpen: "Open this placeholder",
    placeholderEmptyNote: "Placeholder",
    rewriteChips: {
      group: "Shortcuts from Stats and Analyze",
      povLeakCamera:
        "Stay in the current camera. Do not enter a mind the camera cannot know. Keep the same events.",
      povLeak: {
        label: "Fix POV leak",
        prompt:
          "Stay in {who}’s perception. Do not report another character’s thoughts or feelings. Keep the same events."
      },
      strongerVerbs: {
        label: "Stronger verbs",
        prompt:
          "Swap weak verbs plus manner-adverbs for stronger verbs (ran quickly → rushed). Do not only delete the -ly words. Keep the same events."
      },
      activeVoice: {
        label: "Active voice",
        prompt:
          "Recast possible passives as active (the door was opened by her → she opened the door). Keep the same events."
      },
      showDontTell: {
        label: "Show, don’t tell",
        prompt:
          "Where a feeling is named, let the body or the scene carry it. Do not add explanation. Keep the same events."
      },
      breakLong: {
        label: "Break the long sentence",
        prompt:
          "Break the long sentence. Keep the meaning. Prefer a short hit after a long line, not a string of equal shorts."
      }
    },
    modelAside: "The model added this. It is not in the manuscript."
  },
  stats: {
    label: "Stats",
    wordsShort: { one: "{count} word", other: "{count} words" },
    rareOn: "Rare on",
    rareOff: "Rare off",
    rareOnTitle: "Hide uncommon words",
    rareOffTitle: "Mark uncommon words",
    ticsOn: "Clichés on",
    ticsOff: "Clichés off",
    ticsOnTitle: "Hide AI-sounding phrases",
    ticsOffTitle: "Mark AI-sounding phrases",
    factsOn: "Story Bible names on",
    factsOff: "Story Bible names off",
    factsOnTitle: "Hide underlining of Story Bible names",
    factsOffTitle: "Underline names that exist in the Story Bible",
    rareMarkTitle: "Uncommon word — may be harder for this reader",
    ticPhraseTitle: "Reads like an AI-generated phrase",
    ticDashTitle: "This passage leans heavily on em dashes",
    title: "How it reads",
    emptyTitle: "No prose yet",
    writeSome: "Write some prose to see how it reads.",
    sentence: "Sentence {n} · {words}",
    alreadyShort: "Already short.",
    suggestSplit: "Suggest a split",
    looking: "Looking…",
    noSplit: "No split this time.",
    split: "Split",
    editSplit: "Edit split",
    useSplit: "Use this split",
    paragraph: "Paragraph {n} · {words}",
    packedHint: "Action, a long look back, and stacked senses in this block.",
    suggestBreak: "Suggest a break",
    noBreak: "No break this time.",
    break: "Break",
    editBreak: "Edit paragraph break",
    useBreak: "Use this break",
    clickBar: "Click a bar to read that sentence.",
    mixedFocus: "Mixed focus",
    mixedOne: "This block mixes present action, a long look back, and stacked senses.",
    mixedMany: "These blocks mix present action, a long look back, and stacked senses.",
    echo: "Echo",
    echoBody: "The same word or phrase repeats in a short span. Click one to find it. A refrain can be the point.",
    reuse: "Repeated phrase",
    reuseBody: "The same stretch of words appears in more than one paragraph. Click one to find it. A refrain can be the point.",
    reuseWhere: "Paragraphs {list} · {n} words",
    openFind: "Find “{phrase}” in the text",
    povLeak: "POV leak",
    foot: "{words} words · {sentences} sentences · {spoken}% spoken",
    highlight: "Highlight in text",
    keepHighlight: "Keep highlighting",
    measures: "What this measures",
    raise: "How to raise it",
    remember: "Remember",
    longSentences: "{n}+ words",
    rareList: "Off the familiar list",
    hideGauge: "Hide this gauge.",
    aboutGauge: "About this gauge.",
    gaugeAria: "{label} {score}. {detail}",
    sparkTitle: "{count} words",
    sparkAria: "Sentence {n}, {count} words",
    leakObjective: "These lines look like thought. Objective only shows what a camera would see. A candidate, not a verdict.",
    leakFirstNamed: "These lines look like a mind other than {who}. A candidate, not a verdict.",
    leakOther: "These lines look like another mind. A candidate, not a verdict.",
    leakLimitedNamed: "Limited to {who} — these lines look like another mind. A candidate, not a verdict.",
    directnessReadout:
      "{adverbs} -ly / 1k · {passives} possible passives / 1k · start at 100, minus those two.",
    pacingSpanSame: "{count} words each",
    pacingSpanRange: "{min}–{max} words",
    pacingReadout:
      "{mix} · {mean} words typical · {span}. Variation raises it; a stack of {n}+ lines or a monotone lowers it.",
    vocabularyReadout: "{share}% uncommon · variety {ttr}. A mix scores higher than all-plain or all-rare.",
    vocabularyReadoutKid: "{share}% uncommon · variety {ttr}. Familiar words score higher for this reader.",
    mix: {
      mixed: "Mixed",
      choppy: "Short & even",
      sweeping: "Long & even",
      even: "Steady"
    },
    profiles: {
      empty: { label: "No prose yet", genres: "" },
      short: { label: "Too short to score", genres: "Write a little more" },
      breezy: { label: "Fast & breezy", genres: "Thriller / YA" },
      brisk: { label: "Brisk", genres: "Adventure / romance" },
      balanced: { label: "Balanced", genres: "General fiction" },
      atmospheric: { label: "Dense & atmospheric", genres: "Literary / epic fantasy" },
      heavy: { label: "Heavy", genres: "Literary / experimental" }
    },
    gauges: {
      directness: {
        label: "Directness",
        measures: "How directly you write, from the share of manner-adverbs and possible passives.",
        raise: [
          "Swap a weak verb plus adverb for a stronger verb (ran quickly → rushed).",
          "Recast a possible passive as an active (the door was opened by her → she opened the door)."
        ],
        remember:
          "100 is not always the aim. In dreamlike or atmospheric passages, passives and manner-adverbs can be the right choice. Let the scene lead."
      },
      pacing: {
        label: "Pacing",
        measures:
          "How much sentence length varies, and whether long lines stack. A mix of short and long usually keeps momentum.",
        raise: [
          "Break a run of {n}+ word sentences. Click a tall bar to inspect one.",
          "Follow a long line with a short hit, or the other way around.",
          "If every sentence is the same length, vary one."
        ],
        remember:
          "Even, punchy prose can be the point — a fight, a chase, dialogue. A sweeping passage can be too. This flags a monotone or a stack of long lines, not a genre."
      },
      vocabulary: {
        label: "Vocabulary",
        measures: "The balance of familiar words and uncommon ones. Names in the Story Bible are left out.",
        raise: [
          "If the prose is all common words, one precise noun or verb often does more than a string of adjectives.",
          "If uncommon words pile up, swap a few for plainer ones — unless that diction is the voice.",
          "Highlight in text marks words off the Dale–Chall familiar list."
        ],
        remember: "Unusual can be the point. A harbour story needs quay and stowaway. 100 is a mix, not a simpler vocabulary."
      }
    }
  },
  notes: {
    review: "Review",
    title: "Chapter notes",
    emptyTitle: "Nothing to flag",
    intro:
      "The review tries to find lines that neither reveal the character’s personality nor drive the scene forward.",
    introReader: "Aimed at {category} readers about {age}.",
    paragraph: "Paragraph {n}",
    note: "Note",
    clickHint: "Click a note to read the quote. Notes are not rewrites.",
    nothingSolid: "The Review model found nothing solid in this pass.",
    foot: "Notes flag a spot. They do not rewrite the chapter or touch the Story Bible.",
    categories: {
      show_vs_tell: {
        label: "Show vs tell",
        blurb: "A named feeling where the body or the scene could carry it."
      },
      dialogue_purpose: {
        label: "Dialogue",
        blurb: "A spoken line that neither reveals character nor moves the scene."
      },
      voice_drift: {
        label: "Voice",
        blurb: "The register slipped from the Voice field."
      },
      character_fidelity: {
        label: "Character",
        blurb: "A beat that sits against a locked Story Bible trait."
      },
      child_agency: {
        label: "Agency",
        blurb: "An adult makes the decisive move. The child should."
      },
      lecture: {
        label: "Lecture",
        blurb: "A moral stated by an adult, not earned by the protagonist’s choice."
      }
    }
  },
  critics: {
    action: "Critics",
    setupTitle: "Who should read this chapter?",
    setupLede: "Each voice below reads the chapter on its own — pick one or more. Every one checked is its own pass, so the choice is also the cost.",
    setupPersonasLabel: "Critics to run",
    setupStart: "Run critics",
    setupNothingSelected: "Pick at least one critic to run.",
    review: "Critics",
    title: "Critic notes",
    emptyTitle: "Nothing to flag",
    intro: "Three distinct readers, each looking for something the others don't — not a rewrite, just what they noticed.",
    paragraph: "Paragraph {n}",
    note: "Note",
    clickHint: "Click a note to read the quote.",
    nothingSolid: "None of the critics found anything solid this pass.",
    foot: "Notes flag a spot, in that critic's own voice. They do not rewrite the chapter or touch the Story Bible.",
    personas: {
      "impatient-reader": {
        label: "Impatient reader",
        blurb: "Flags where the pace drags past the point it's earning its place."
      },
      "pacing-critic": {
        label: "Pacing critic",
        blurb: "Reads the chapter's rhythm — where tension builds, holds, or slackens when it shouldn't."
      },
      "confused-reader": {
        label: "Confused reader",
        blurb: "Flags a passage that's accidentally hard to follow, not a mystery you planted on purpose."
      }
    }
  },
  history: {
    kicker: "Chapter",
    title: "History",
    emptyTitle: "No history yet",
    intro:
      "Earlier versions from Draft, Recast, Extend, Elaborate, and Rewrite. Restoring jumps to that version. Later rows stay.",
    empty: "The model has not rewritten this chapter yet.",
    emptyProse: "(empty)",
    clickHint: "Click a version to read it, then Restore to put it in the chapter.",
    restore: "Restore",
    compare: "Compare",
    compareHint: "Click another version to compare with this one. Restore still uses the selected version.",
    comparePair: "{from} → {to}",
    live: "Live chapter",
    same: "These two are the same.",
    fromOnly: "Only in this text — what you lose if you restore",
    toOnly: "Only in this text — what you gain if you restore",
    foot: "This list is not undo. Typing is not kept. Prompts only see the live chapter.",
    ops: {
      draft: "Draft",
      recast: "Recast",
      polish: "Polish",
      extend: "Extend",
      elaborate: "Elaborate",
      rewrite: "Rewrite",
      beat: "Beat",
      restore: "Restore",
      format: "Formatting",
      darling: "Darling",
      translate: "Translate"
    }
  },
  polishReview: {
    title: "Review Polish",
    hint: "The model's cleanup pass, not yet kept. Compare the two versions, then accept or discard.",
    original: "Original",
    candidate: "Polish suggestion",
    originalHint: "What you keep if you discard",
    candidateHint: "What you get if you accept",
    accept: "Keep this version",
    discard: "Discard"
  },
  markerConvert: {
    nav: "Convert markers",
    heading: "Convert markers to formatting",
    intro:
      "Turn characters like *asterisks* — or opening/closing pairs like “smart quotes” — from an imported manuscript into real bold, italic, or underline. The markers are removed from the text; only the formatting stays. Longer markers run first, so \"**\" is not mistaken for two single \"*\" — set both if your manuscript uses them for different things.",
    openLabel: "Opening marker",
    openPlaceholder: "e.g. * or “",
    closeLabel: "Closing marker",
    closePlaceholder: "e.g. * or ”",
    becomes: "becomes",
    styleLabel: "Style",
    addRule: "Add rule",
    removeRule: "Remove",
    convertAction: "Convert whole manuscript",
    converting: "Converting…",
    resultSummary: "Converted {markers} across {chapters}.",
    resultNone: "No markers found — nothing to convert.",
    markersCount: { one: "{count} marker", other: "{count} markers" },
    chaptersCount: { one: "{count} chapter", other: "{count} chapters" },
    smartQuotesIntro:
      "Straight quotes (\") typed from now on turn into real opening/closing curly quotes automatically. This converts every straight quote already in the manuscript the same way, in one pass.",
    smartQuotesAction: "Smarten quotes in whole manuscript",
    smartQuotesConverting: "Converting…",
    smartQuotesResultSummary: "Smartened quotes across {chapters}.",
    smartQuotesResultNone: "No straight quotes found — nothing to convert."
  },
  errors: {
    ollamaOrigins: "The local server did not accept the browser. Using Ollama? Start it with OLLAMA_ORIGINS set to wherever kaampi Write is actually running from — OLLAMA_ORIGINS=http://localhost:5175 if it's this computer, or OLLAMA_ORIGINS=* to allow any address, simplest when connecting from another machine on your network. Using LM Studio or another server? Look for a setting about which web addresses are allowed to connect (often called CORS or allowed origins).",
    noModel: "No local model found. Start Ollama or your local server, then reload.",
    notJson: "That file is not JSON.",
    backupUnreadable: "Could not read that backup.",
    sampleManuscriptUnavailable: "Could not load the sample manuscript.",
    shelfUnreadable: "Could not read the shelf.",
    recastEmpty: "Write or draft some prose before recasting the camera.",
    extractEmpty: "Write or draft some prose before extracting facts.",
    analyzeEmpty: "Write or draft some prose before analyzing the chapter.",
    polishEmpty: "Write or draft some prose before polishing the chapter.",
    extractorNone: "Extractor found no stated facts in this chapter.",
    interviewExtractorNone: "Extractor found no stated facts in this conversation.",
    brainstormExtractorNone: "Extractor found no stated facts in this note.",
    synopsisExtractorNone: "Extractor found no stated facts in the synopsis.",
    briefExtractorNone: "Extractor found no stated facts in this brief.",
    importLoreNone: "Extractor found no stated facts in the pasted text.",
    summarizeNone: "Could not summarize this chapter — try again, or write the summary by hand.",
    proofreadEmpty: "Write or draft some chapter prose before proofreading.",
    developmentalEmpty: "Write or draft some chapter prose before running a developmental analysis.",
    askManuscriptEmpty: "Write or draft some chapter prose before asking about the manuscript.",
    askManuscriptNoMatch: "Nothing in the manuscript matches that question.",
    translateSourceEmpty: "The source chapter has no prose yet — write or draft it there first.",
    translateSourceMissing: "Could not load the source manuscript this chapter is linked to.",
    serverUrlMissing: "Enter your local server's address in Settings.",
    busy: "Another action is already running. Wait for it to finish, then try again.",
    timeout: "The local model didn't respond in time. It may still be loading, or your hardware may need longer than usual — check that it's running, then try again.",
    imageChoose: "Choose an image file.",
    imageRead: "Could not read that image.",
    imageAdd: "Could not add that image."
  }
};

export type Messages = typeof en;
