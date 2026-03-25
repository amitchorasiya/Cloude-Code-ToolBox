## Command / entry

`CloudeCodeToolBox.syncCursorRules` — **Sync Cursor rules → CLAUDE.md**

## What it does

Runs **`npx`** package **`cursor-rules-to-claude`** with `--cwd <workspace>` and optional **`--dry-run`**.

## Reads from

- **Cursor rules / project files** as interpreted by the **npx** CLI.

## Writes / modifies

- **npx** CLI writes **`CLAUDE.md`** and **`.claude/rules`** (and related Claude-oriented paths) when not dry-run — extension only **launches** the command.

## Code

`packages/cloude-code-toolbox/src/commands/rulesToCopilot.ts` (legacy filename; implements Cursor rules → Claude-oriented output).
