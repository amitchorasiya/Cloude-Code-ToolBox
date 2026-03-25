## Entry

**Sidebar:** MCP & Skills hub **webview** (activity bar / secondary view). Commands such as **`openWorkspaceMcp`**, **`openUserMcp`**, **`mcpListServers`**, **`mcpBrowseRegistry`**, **`mcpAddServer`** route to **native VS Code** MCP UI where available.

## What it does

Webview shows **tiles** for discovery, MCP JSON, skills, Intelligence actions, etc. **`gatherHubPayload`** drives both the hub and the **awareness** markdown (shared data).

## Reads from

- Workspace + user **`mcp.json`** (parsed for server list)
- **Skill roots** — scans for **`SKILL.md`** trees (conventions in `mcpPaths` / hub code)
- Extension **context** for packaged resources (icons, recipe metadata)

## Writes / modifies

- **Hub itself** does not write repo files; **clicks** dispatch VS Code commands (which may open editors or run flows that write — e.g. **Open mcp.json** opens the file for manual edit).
- **Native MCP** commands invoke built-in VS Code MCP command IDs.

## Code

`packages/cloude-code-toolbox/src/webview/mcpSkillsHubView.ts`, `extension.ts` (MCP command registrations), `registry/mcpInstall.ts`.
