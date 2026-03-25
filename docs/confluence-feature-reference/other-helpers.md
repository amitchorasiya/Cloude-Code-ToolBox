## Scope

Miscellaneous **Toolbox** commands that mostly **open UI**, **external URLs**, or **run small helpers** without a dedicated “reads / writes” contract in-repo.

## Examples (non-exhaustive)

| Command | Typical effect |
| --- | --- |
| `workspaceSetupWizard` | Legacy entry: points to **One Click Setup** / settings (no duplicate step-by-step wizard) |
| `openComposerHub` | Opens **Composer hub** webview/panel |
| `openSessionNotepad` / `copySessionNotepad` | See **Session notepad** page |
| `openClaudeCode` | Opens **Claude Code** |
| `openInstructionsPicker` | UI to pick instruction files |
| `appendCursorrules` / `createCursorrulesTemplate` | **`.cursorrules`** / template helpers |
| `openCursorClaudeReference` | Opens bundled **Cursor vs Claude Code** reference |
| `openClaudeCodeAccountDocs` / `openEnvSyncChecklist` | External docs / checklist webviews |
| `translateContextSelection` | Rewrites **selection** in editor (user confirms) |
| `openInlineChatCursorStyle` | Proxies to inline chat |
| `openIntelligenceToolboxRepos` (and related) | Opens GitHub repos in browser |
| `toggleMcpDiscovery` | Toggles discovery-related setting |
| `refreshMcpView` / `refreshWorkspaceView` | Refreshes tree/webview data |

## Writes / modifies

**Varies** — many are **read-only** or **open-only**. **translateContextSelection** and **cursorrules** helpers may **edit** active or specific files after confirmation; see respective `commands/*.ts` files.

## Code

`packages/cloude-code-toolbox/src/extension.ts` (registrations) and individual files under `packages/cloude-code-toolbox/src/commands/`.
