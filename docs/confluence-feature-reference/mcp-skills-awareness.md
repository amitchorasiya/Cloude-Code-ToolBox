## Command / entry

`CloudeCodeToolBox.showMcpSkillsAwareness` — **Scan MCP & Skills awareness** (also used by auto-scan).

## What it does

Uses the same **hub payload** as the MCP & Skills webview: lists configured MCP servers and discovered **SKILL.md** skill trees. Opens a **preview Markdown** report in the editor.

If `cloude-code-toolbox.intelligence.autoScanMcpSkillsOnWorkspaceOpen` is **true** (same setting that triggers auto-scan), the flow can also **merge** a generated block into **`CLAUDE.md`** (replaceable HTML-comment region) for Claude Code workspace context.

## Reads from

- `gatherHubPayload(context)` — workspace + user **mcp.json** paths, skills roots, server entries (see hub webview implementation).
- User **mcp.json** path (stable vs Insiders per `useInsidersPaths`).
- Existing **`CLAUDE.md`** at workspace root when merging (read → merge → write).

## Writes / modifies

- **`.claude/cloude-code-toolbox-mcp-skills-awareness.md`** — full awareness report (overwritten when the scan runs).
- **Optional:** **`CLAUDE.md`** — updates or appends the **MCP & skills** summary block when auto-scan (or interactive scan with merge) is on.

## Code

`packages/cloude-code-toolbox/src/intelligence/mcpSkillsAwarenessCommand.ts`, `formatMcpSkillsAwareness.ts`, `mergeMcpSkillsIntoClaudeMd.ts`, `webview/mcpSkillsHubView.ts`.
