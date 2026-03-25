# Feature: Workspace kit tree

- **Workspace kit** tree (`cloudeCodeKitWorkspace`) — `WorkspaceKitProvider`
- **Guide & tools** was removed in **0.5.17**; use the **MCP & skills** hub tiles and Command Palette for the same commands.

## Workspace kit

**Workspace kit:** shows whether key paths exist (`.cursor/rules`, `.cursorrules`, `memory-bank/`, **`CLAUDE.md`**, `.github/copilot-instructions.md` (legacy), `.vscode/mcp.json`) and offers **Open** / **Create / sync** (runs the matching Toolbox command) or **One Click Setup** on the top row.

**Code:** `packages/cloude-code-toolbox/src/tree/workspaceKitProvider.ts`.
