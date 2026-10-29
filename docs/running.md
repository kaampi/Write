# Running kaampi Write

## Windows desktop app (recommended)

Download the installer from the [latest release](https://github.com/kaampi/Write/releases/latest) — `StoryBook-AI-Setup.exe` — and run it. It's unsigned (no code-signing budget yet, see `roadmap-ideas.md` #35), so Windows SmartScreen will warn on first run; that's expected. There's also a small online-installer stub at the `installer-stub` release tag that fetches the current version at install time instead of bundling it, if you'd rather not download the full installer up front.

**This is the only way to pair with kaampi Codex.** Codex pairing (automatic backup and sync with your other kaampi apps) checks `isTauri()` at runtime — it only resolves to `true` inside the compiled desktop app, never in a browser tab, no matter how that tab was launched. Running from source (below) opens the same UI in your regular browser, where the Codex connection dialog shows "Connecting to kaampi Codex is only possible in the Windows desktop app, not here in the browser" and stays unavailable.

## Running from source

For development, or on macOS/Linux where there's no packaged build yet — manuscripts still save locally and Publish/Backup work the same, only Codex pairing is unavailable.

On Windows, double-click **`starta.bat`**. On macOS, double-click **`starta.command`**. On Linux, run **`./starta.sh`** from a terminal (or double-click it, if your file manager runs executable scripts). Each installs dependencies on first run and then starts the app. Or, on any platform:

```bash
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175) so it does not collide with kaampi Explore (5173).

Allow the origin:

```bash
OLLAMA_ORIGINS=http://localhost:5175 ollama serve
```

## Backup & Publish

You can still write and lock facts by hand if Ollama is off. Manuscripts live in this browser's IndexedDB, not in the git repo. **Backup** writes a JSON file the app can read back. **Publish**, in the **File** menu (top bar), writes Markdown, plain text, RTF, ODT, HTML, ePub, or PDF — prose and chapter titles only, no Synopsis or chapter briefs. Every chapter starts its own page in RTF, ODT, and PDF, and its own file in ePub. HTML, ePub, and PDF can use one of four bundled OFL typefaces (Lora, Literata, Source Serif 4, Asap) instead of the default Times/Georgia look — RTF and ODT get the font by name only, since Scrivener and Word substitute from what's installed anyway.

At the bottom of the left rail, **Progress** shows the manuscript's word count and, once you set an optional target and deadline, a percentage that opens onto a full pace readout — the daily words needed to make the deadline, recalculated fresh each time rather than just falling behind silently if a week gets missed.
