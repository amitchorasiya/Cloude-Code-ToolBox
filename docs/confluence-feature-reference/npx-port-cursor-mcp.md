## Command / entry

`CloudeCodeToolBox.portCursorMcp` — **Port Cursor MCP → VS Code**

## What it does

Runs **`npx`** package **`cursor-mcp-vscode-port`** (tag from `cloude-code-toolbox.npxTag`) in an **integrated terminal** with options: overwrite workspace **`mcp.json`**, merge, **user** `mcp.json`, or **dry-run**.

## Reads from

- **Cursor MCP config** on disk (read by the **npx** CLI, not duplicated here).
- Workspace folder path; extension settings for **npx tag**.

## Writes / modifies

- Whatever the **external CLI** writes (typically **`.vscode/mcp.json`** or user-level MCP JSON). The extension does **not** merge by itself — it **delegates** to the terminal command.

## Code

`packages/cloude-code-toolbox/src/commands/portFromCursor.ts`, `terminal/runNpx.ts`.
