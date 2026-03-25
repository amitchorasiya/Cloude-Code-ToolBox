## Command / entry

`CloudeCodeToolBox.runFirstWorkspaceTestTask` — **Run first test-like task**

## What it does

Calls `vscode.tasks.fetchTasks()`, prefers tasks whose **name** or **definition type** matches **test**-like patterns (`test`, `vitest`, `jest`, `pytest`, `mocha`), otherwise runs the **first** task. **Executes** the task via VS Code task API.

## Reads from

- **VS Code task providers** / **`tasks.json`** (whatever the workspace exposes).

## Writes / modifies

- **None** by the extension itself — running the task may compile/test files **as defined by your task**.

## Code

`packages/cloude-code-toolbox/src/commands/runFirstTestTask.ts`.
