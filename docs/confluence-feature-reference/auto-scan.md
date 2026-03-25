## Mechanism

Registered at extension activation: `registerMcpSkillsAutoScanOnWorkspaceOpen`.

## What it does

When **`cloude-code-toolbox.intelligence.autoScanMcpSkillsOnWorkspaceOpen`** is **true**, schedules (debounced ~1.2 s) a run of the same handler as **MCP & Skills awareness** after workspace folders are added or on startup if a folder is open.

## Reads from

- Same as **MCP & Skills awareness** (hub payload, optional merge path).

## Writes / modifies

- Same as awareness: writes **`.claude/cloude-code-toolbox-mcp-skills-awareness.md`**; when auto-scan is enabled, may also **merge** a replaceable MCP/skills summary block into **`CLAUDE.md`** at the workspace root (see **MCP & Skills awareness**).

## Code

`packages/cloude-code-toolbox/src/intelligence/workspaceAutoScan.ts` (calls into `showMcpSkillsAwareness` from `extension.ts`).
