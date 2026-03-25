## Command / entry

`CloudeCodeToolBox.applyBundledMcpRecipe` — **Apply bundled MCP recipe**

## What it does

Loads **`bundled-recipes.json`** from the **extension** package, user picks a recipe, resolves `${input:…}` placeholders via input boxes, **merges** the server entry into **`mcp.json` `servers`**, shows **JSON preview**, user confirms **Write**.

## Reads from

- **`resources/mcp-recipes/bundled-recipes.json`** inside the installed extension
- Existing **`.vscode/mcp.json`** (parse `servers` object)

## Writes / modifies

- **`.vscode/mcp.json`** (creates `.vscode/` if needed) after explicit **Write** confirmation. Can **overwrite** an existing server key after modal confirm.

## Code

`packages/cloude-code-toolbox/src/commands/mcpRecipeCommand.ts`.
