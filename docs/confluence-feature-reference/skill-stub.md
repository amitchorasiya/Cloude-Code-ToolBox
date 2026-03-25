## Command / entry

`CloudeCodeToolBox.createSkillStub` — **Create SKILL.md stub**

## What it does

Prompts for a **folder name** (`[a-z0-9-]{2,64}`), creates **`.github/skills/<name>/`**, writes a **template `SKILL.md`** with YAML frontmatter, opens the file. Errors if **`SKILL.md` already exists** at that path.

## Reads from

- Checks whether target **`SKILL.md`** already exists.

## Writes / modifies

- **Creates** **`.github/skills/<name>/SKILL.md`** (and parent directories).

## Code

`packages/cloude-code-toolbox/src/commands/skillStubCommand.ts`.
