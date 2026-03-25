## Command / entry

`CloudeCodeToolBox.buildContextPack` — **Intelligence — build context pack for Claude Code (copy)**

## What it does

Builds a **Markdown bundle** for **Claude Code** (and human paste workflows): workspace name/root, active editor (path, language, optional selection), paths of **open file tabs**, optional **diagnostics** and **git** snippets, plus `#file:` hint lines. **Always copies** the bundle to the **system clipboard**. Optionally **appends** the same text to the **session notepad** and/or **opens Claude Code** (per settings).

## Reads from

- Primary **workspace folder** (name + root path).
- **Active editor** (if `file:` URI in workspace): relative path, `languageId`, selected text if any (capped at 8 000 chars).
- **Open tabs** via `vscode.window.tabGroups` — workspace-relative **paths only** (max 14); does **not** read full file contents for every tab.
- **Diagnostics** (optional): `vscode.languages.getDiagnostics` on active + open tab URIs (max 6 files, 10 messages per file).
- **Git** (optional): `git rev-parse --abbrev-ref HEAD` and `git diff --stat` in workspace root (subprocess; capped bytes, ~12 s timeout).
- **Settings** for quick-pick defaults: `cloude-code-toolbox.intelligence.includeGitByDefault`, `includeDiagnosticsByDefault`, `appendNotepadAfterPack`, `openChatAfterPack`.

## Writes / modifies

- **Clipboard** (always).
- **`.vscode/cloude-code-toolbox-notepad.md`** — only if you choose **Append pack to session notepad** (append with ISO timestamp; may create file or migrate from legacy `copilot-kit-notepad.md`).
- **No** automatic edits to application source files.

## Code

`packages/cloude-code-toolbox/src/intelligence/contextPackCommand.ts`, `contextPackCore.ts`, `gitSpawn.ts`; notepad: `commands/sessionNotepad.ts`.
