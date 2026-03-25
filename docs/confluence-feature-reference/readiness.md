## Command / entry

`CloudeCodeToolBox.showIntelligenceReadiness` — **Intelligence — readiness summary**

## What it does

Scans the workspace for common **Claude Code–oriented** artifacts (and legacy Copilot files where relevant), evaluates **pass/fail-style checks**, and opens a **preview Markdown document** (unsaved buffer) with the summary. Offers buttons to run **MCP & Skills scan** or open **workspace mcp.json**.

## Reads from

Workspace root, via `gatherReadinessInput`:

- **`CLAUDE.md`** (exists, size; optional Copilot-merge marker)
- `.github/copilot-instructions.md` (legacy; exists, size)
- **`.claude/rules/`** (count of `.md` rule files)
- `AGENTS.md`
- `.github/instructions/*.instructions.md` (count)
- `memory-bank/` (directory exists)
- `.vscode/mcp.json`
- `.cursorrules`
- `.cursor/rules/` (any `.md` / `.mdc` files)

## Writes / modifies

- **None on disk** — report is an **in-memory** text document in the editor only.

## Code

`packages/cloude-code-toolbox/src/intelligence/readinessCommand.ts`, `buildReadinessInput.ts`, `readiness.ts`.
