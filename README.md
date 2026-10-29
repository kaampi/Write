<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/logo-dark.svg">
    <img src="public/logo.svg" alt="kaampi Write" width="420">
  </picture>
</p>

<p align="center">A local-first prose tool. The Story Bible holds truth. The model drafts. You decide.</p>

<p align="center">
  <a href="https://github.com/kaampi/Write/actions/workflows/desktop-build.yml"><img src="https://github.com/kaampi/Write/actions/workflows/desktop-build.yml/badge.svg" alt="Desktop build status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPLv3-blue.svg" alt="License: GPLv3"></a>
</p>

kaampi Write is a desktop writing tool for long-form fiction — novels and series — built around a **Story Bible**: locked facts about your people, places, objects, groups, and events that every draft, rewrite, and consistency check is checked against. The model fills in prose; it never gets to invent canon on its own.

**No cloud API keys, ever.** kaampi Write only talks to a model server running on your own computer or network — [Ollama](https://ollama.com), or any OpenAI-compatible server such as LM Studio, llama.cpp, or vLLM (see [Models](docs/models.md)). Cloud providers (OpenAI, Anthropic, Google, and others) are deliberately excluded at the network layer — the provider code refuses to resolve to their hostnames, not just undocumented as an option.

The UI is English, Swedish, or Norwegian Bokmål. **Prose language** on Settings is the language of the sentences themselves — export files and model prompts follow that field when it is set, otherwise the language of the manuscript.

## What's inside

- **Story Bible** — people, places, objects, groups, and events, each locked or still a draft. Drafting, Extend, Elaborate, and Rewrite all check against locked facts; **Extract facts** proposes new rows from what you've already written instead of making you fill out forms up front.
- **Brainstorm → Synopsis → Briefs** — a private scratch board for ideas, a synopsis that becomes the map, and a brief per chapter as a writing instruction, not canon. **Development method** offers guided structures (Snowflake, three-act, Save the Cat, Hero's Journey) if you want one.
- **Draft, Extend, Elaborate, Rewrite** — fills or continues a chapter from the synopsis, Story Bible, brief, Plotlines, camera (POV/tense/viewpoint), Reader tier, and prose language. Select a passage to extend it, expand it, or rewrite it with a chip-filled instruction (POV leak, stronger verbs, active voice, show don't tell, long sentence).
- **Analyze & Proofread** — an opt-in review pass that flags lines doing neither characterization nor scene work, named-feelings telling, Voice drift, and beats against a locked trait; Proofread is a slower whole-manuscript pass (grammar, repeated scenes, cross-chapter style, age report) that never rewrites on its own.
- **Stats** — directness, pacing, vocabulary, echo and repeated-phrase detection, POV leaks, mixed-focus paragraphs, rare-word highlighting with Review-suggested alternatives.
- **Timeline & Plotlines** — reading order against story-time order, threads as coloured bars across chapters, a gap in the bar is a gap in the thread.
- **History** — a snapshot before every Draft, Recast, Extend, Elaborate, Rewrite, or Restore, with a word-level diff between any two versions; Restore never silently loses the current text.
- **Publish** — export to HTML, ePub, RTF, and ODT (PDF coming), with per-manuscript typography, drop caps, scene-break style, page size and margins.

See [The Loop](docs/guide.md) for the full walkthrough, step by step.

## The kaampi family

kaampi Write is one of four sibling apps that share a Story Bible via **[kaampi Codex](https://github.com/kaampi/Codex)**, a local sync service — never a cloud account:

- **[kaampi Write](https://github.com/kaampi/Write)** (this app) — long-form prose
- **[kaampi Comic](https://github.com/kaampi/Comic)** — comic scripting and panel layout
- **[kaampi Explore](https://github.com/kaampi/Explore)** — tabletop campaign sandbox
- **[kaampi Codex](https://github.com/kaampi/Codex)** — the local sync service the others pair with

Each is a sibling, not a module of another — kaampi Write can send locked Story Bible cards to kaampi Explore shelves, and kaampi Explore's Storyboard can export chapter shells (title + brief, no prose) for kaampi Write to pick up. No app requires any of the others.

## Quickstart

**Desktop app (recommended)** — download the installer for your platform from the [latest release](https://github.com/kaampi/Write/releases/latest): `.exe` for Windows, `.deb` or `.AppImage` for Linux. This is the only way to pair with **kaampi Codex** for backup and sync with your other kaampi apps: pairing needs the compiled desktop app specifically and is unavailable from a browser tab, however it's launched. No macOS build yet.

**Running from source** (any platform, or for development — no Codex pairing) — on Windows, double-click **`starta.bat`**. On macOS, double-click **`starta.command`**. On Linux, run **`./starta.sh`** from a terminal (or double-click it, if your file manager runs executable scripts). Each installs dependencies on first run and then starts the app. Or, on any platform:

```bash
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175) so it does not collide with kaampi Explore (5173). See [Running kaampi Write](docs/running.md) for the Ollama origin setting, the Codex-pairing limitation, and how Backup/Publish get your work out.

## Documentation

- [Running kaampi Write](docs/running.md) — install, start, local AI server, backup and publish
- [Models](docs/models.md) — picking an engine, Writing vs Review models, context window
- [The Loop](docs/guide.md) — a full walkthrough of every tool, step by step, plus Analyze
- [Testing](docs/testing.md) — running the test suite

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for what changed in each release.

## License

[GNU GPLv3](LICENSE).
