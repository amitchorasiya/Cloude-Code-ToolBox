## Commands / entry

- `CloudeCodeToolBox.openSessionNotepad`
- `CloudeCodeToolBox.copySessionNotepad`

## What it does

**Open:** ensures **`.vscode/cloude-code-toolbox-notepad.md`** exists (seeds default header if missing; may **migrate** from legacy **`.vscode/copilot-kit-notepad.md`**), then opens it.

**Copy:** reads that file and copies **full contents** to the **clipboard**.

Context Pack can **append** to this file when that follow-up option is selected (see Context Pack page).

## Reads from

- **`.vscode/cloude-code-toolbox-notepad.md`** (and optionally legacy file for one-time migration).

## Writes / modifies

- **Creates/updates** **`.vscode/cloude-code-toolbox-notepad.md`** when opening (default content) or when **appending** from Context Pack.
- **May delete** legacy **`copilot-kit-notepad.md`** after copy-migrate.

## Code

`packages/cloude-code-toolbox/src/commands/sessionNotepad.ts`.
