## Command / entry

`CloudeCodeToolBox.claudeToolboxConfigScan` — **Claude Code / MCP config scan** (hygiene / secret-shaped patterns).

## What it does

Reads selected **JSON/Markdown config files**, runs **heuristic regexes** for common token shapes (e.g. `ghp_`, `sk-`, `AKIA…`), **masks** matches in the report, and prints results to the **Output** channel **Cloude Code ToolBox**.

## Reads from

- **`.vscode/mcp.json`** (workspace)
- **User `mcp.json`** (path from `mcpPaths.userMcpJsonPath`, Insiders-aware)
- **`.github/copilot-instructions.md`** (legacy Copilot instructions file — still scanned if present)

## Writes / modifies

- **None** to project files — output channel only.

## Code

`packages/cloude-code-toolbox/src/commands/claudeToolboxConfigScan.ts`.
