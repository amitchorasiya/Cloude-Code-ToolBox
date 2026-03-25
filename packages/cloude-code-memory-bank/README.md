# github-copilot-memory-bank

**Scaffold a [memory bank](https://tweag.github.io/agentic-coding-handbook/WORKFLOW_MEMORY_BANK/) in your repository** and connect it to **GitHub Copilot** using [repository custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot). Optionally install the same ideas as **Cursor rules** for teams that use both editors.

There is **no persistent chat memory** inside the model: the memory bank is **Markdown in your repo** that you and Copilot read and update over time.

**This GitHub repository** is laid out as the **npm package itself** (`package.json`, `bin/`, `templates/` at the root). When you run **`init` in another project**, the CLI creates that project’s own **`memory-bank/`** folder (the product’s persistent docs)—not a subfolder of this repo.

---

## Table of contents

- [What this tool does](#what-this-tool-does)
- [Why use a memory bank](#why-use-a-memory-bank)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Installation options](#installation-options)
- [Command: `init`](#command-init)
- [CLI flags reference](#cli-flags-reference)
- [Files and folders created](#files-and-folders-created)
- [What each memory-bank file is for](#what-each-memory-bank-file-is-for)
- [How GitHub Copilot uses this](#how-github-copilot-uses-this)
- [Using Cursor alongside Copilot](#using-cursor-alongside-copilot)
- [Day-to-day workflow](#day-to-day-workflow)
- [Re-running `init`](#re-running-init)
- [Comparison with `cursor-bank` on npm](#comparison-with-cursor-bank-on-npm)
- [Troubleshooting](#troubleshooting)
- [Developing and publishing this package](#developing-and-publishing-this-package)
- [License and notices](#license-and-notices)

---

## What this tool does

Running **`init`** in a project:

1. **Creates a folder** (default: `memory-bank/`) with **six starter Markdown files** so you are not staring at an empty directory.
2. **Creates or updates** **`.github/copilot-instructions.md`** with a **bounded block** (wrapped in HTML comments) that includes **Plan / Act** behavior for VS Code Copilot (no file edits until the user types **`ACT`**, matching Cursor-style `core.mdc`) and tells Copilot to **read and maintain** the memory bank. If the file already exists, the tool **merges** by replacing only that block, not your whole instructions file.
3. **Optionally** (`--cursor-rules`) copies **`.cursor/rules/*.mdc`** rules for **Cursor** (aligned Plan/Act + memory-bank behavior), with paths adjusted to your `--bank-dir`.

It does **not** call GitHub APIs, store secrets, or run a server. It only writes files on disk.

---

## Why use a memory bank

- **Continuity**: New chats or sessions start cold; the bank holds goals, stack, patterns, and current task.
- **One source of truth**: Less re-explaining architecture and conventions in every thread.
- **Reviewable**: Everything is plain text in git—diffs, PRs, and onboarding stay transparent.

This complements (and does not replace) Copilot’s own [agent memory](https://docs.github.com/copilot/concepts/agents/copilot-memory) where that feature is available: the memory bank is **yours**, versioned like code.

---

## Requirements

- **Node.js 18+** (for `npx` / the CLI).
- A **Git repository** is recommended so you can commit the new files, but the tool does not require `git`.

---

## Quick start

From your **repository root**:

```bash
npx github-copilot-memory-bank@latest init
```

Then:

1. **Fill in** the placeholders in `memory-bank/*.md` (or replace them with your own structure over time).
2. **Commit** `memory-bank/` and `.github/copilot-instructions.md`.
3. In Copilot chat or agent flows, ask for work **in this repo**; Copilot should follow **custom instructions** for that repository (see [How GitHub Copilot uses this](#how-github-copilot-uses-this)).

**Cursor + VS Code in the same repo:**

```bash
npx github-copilot-memory-bank@latest init --cursor-rules
```

**Preview changes without writing:**

```bash
npx github-copilot-memory-bank@latest init --dry-run
```

---

## Installation options

### Recommended: `npx` (no install)

```bash
npx github-copilot-memory-bank@latest init
```

Uses the latest published version from npm each time (good for CI or one-off setup).

### Global install

```bash
npm install -g github-copilot-memory-bank
github-copilot-memory-bank init
# or
ghb-memory-bank init
```

### Local clone / monorepo

```bash
cd /path/to/github-copilot-memory-bank
node bin/cli.mjs init --cwd /path/to/target/project
```

---

## Command: `init`

```text
github-copilot-memory-bank init [options]
ghb-memory-bank init [options]
```

**`init`** is the only command. Run **`--help`** for a short summary:

```bash
npx github-copilot-memory-bank@latest init --help
```

---

## CLI flags reference

| Flag | Description |
|------|-------------|
| `--cwd <dir>` | Treat `<dir>` as the project root. Default: current working directory. |
| `--bank-dir <path>` | Folder for memory files, **relative to `--cwd`**. Default: `memory-bank`. Example: `docs/memory-bank`. |
| `--dry-run` | Log what would be written; **do not** create or change files. |
| `--force` | Overwrite existing **memory-bank `*.md`** templates and **Cursor `*.mdc`** files if they already exist. Does not delete extra files you added yourself. |
| `--no-copilot` | Skip **`.github/copilot-instructions.md`** entirely (only memory bank, and Cursor rules if requested). |
| `--copilot-replace` | If `copilot-instructions.md` exists, **replace the entire file** with only the memory-bank block (destructive). Default behavior is **merge** (see [Re-running `init`](#re-running-init)). |
| `--cursor-rules` | Also write **`.cursor/rules/memory-bank.mdc`** and **`.cursor/rules/core.mdc`**. |
| `-h`, `--help` | Print help and exit. |

**Examples**

```bash
# Default layout
npx github-copilot-memory-bank@latest init

# Memory bank under docs/, still merge Copilot block
npx github-copilot-memory-bank@latest init --bank-dir docs/memory-bank

# Refresh starter templates and Cursor rules (overwrites those files only)
npx github-copilot-memory-bank@latest init --force --cursor-rules

# Memory bank only (e.g. you manage Copilot instructions yourself)
npx github-copilot-memory-bank@latest init --no-copilot

# Initialize another repo from CI
npx github-copilot-memory-bank@latest init --cwd ./packages/app
```

---

## Files and folders created

### Default: `init` (Copilot enabled, no Cursor rules)

```text
your-repo/
├── .github/
│   └── copilot-instructions.md    # created or merged
└── memory-bank/
    ├── projectbrief.md
    ├── productContext.md
    ├── activeContext.md
    ├── systemPatterns.md
    ├── techContext.md
    └── progress.md
```

### With `--cursor-rules`

```text
your-repo/
├── .cursor/
│   └── rules/
│       ├── memory-bank.mdc
│       └── core.mdc
├── .github/
│   └── copilot-instructions.md
└── memory-bank/
    └── … (same six .md files)
```

### With `--bank-dir docs/memory-bank`

The six files live under **`docs/memory-bank/`**. Paths inside **`.github/copilot-instructions.md`** and the **`.mdc`** files are updated to match.

---

## What each memory-bank file is for

| File | Role |
|------|------|
| **projectbrief.md** | What you are building, goals, scope, non-goals, “done” for this phase. |
| **productContext.md** | Why the product exists, users, UX principles, product-side constraints. |
| **activeContext.md** | What you are doing *now*, short-term decisions, open questions—**update often**. |
| **systemPatterns.md** | Architecture, modules, patterns to follow or avoid, how pieces fit together. |
| **techContext.md** | Stack, versions, env vars (names only), build/test commands, technical constraints. |
| **progress.md** | What works, backlog, known issues—**good for handoff**. |

You can add more Markdown (or subfolders) under the memory-bank directory; keep Copilot instructions aligned if you rename the folder (re-run `init` with the new `--bank-dir` or edit instructions manually).

---

## How GitHub Copilot uses this

GitHub Copilot loads **repository custom instructions** from **`.github/copilot-instructions.md`** when assisting **in that repository** (see [official documentation](https://docs.github.com/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)).

This package injects a section that tells Copilot to:

- Use **Plan mode** by default (`# Mode: PLAN`): **no file edits** (including memory bank) until you approve with **`ACT`** (`# Mode: ACT`), unless you explicitly skip planning.
- Read the memory bank **before substantive work** when context matters.
- Keep **activeContext** and **progress** current (in Act mode).
- When you ask to **update memory bank**, **review every** file in the bank, then edit only what needs to change.

**Important:** Instruction files are guidance for the model; they are not a guarantee. Smaller, accurate updates beat huge walls of text. Commit the bank so Copilot and humans see the same truth.

---

## Using Cursor alongside Copilot

With **`--cursor-rules`**, Cursor loads:

- **memory-bank.mdc** — Read/update the same memory files; includes workflow diagrams and the **“update memory bank”** expectation.
- **core.mdc** — **Plan** vs **Act** mode (`PLAN` / `ACT`) so the assistant plans before editing unless you approve.

Paths in those rules use the same **`--bank-dir`** you pass to `init`.

---

## Day-to-day workflow

1. **Start a task** — Open or summarize **activeContext.md** and **progress.md**; ask Copilot to read the bank if needed.
2. **While coding** — When focus shifts, adjust **activeContext.md** in the same commit or PR as the code when practical.
3. **After a milestone** — Update **progress.md** and any of **systemPatterns** / **techContext** that changed.
4. **Explicit refresh** — Say **“update memory bank”** (or similar) when you want a full pass over all six files.

Treat the bank like **living documentation**, not a one-time template dump.

---

## Re-running `init`

| Scenario | Behavior |
|----------|----------|
| Memory-bank `*.md` already exist | **Skipped** unless you pass **`--force`** (then templates overwrite those six files). |
| `.github/copilot-instructions.md` missing | **Created** with the memory-bank block. |
| `copilot-instructions.md` exists, no package marker | Block is **appended**. |
| `copilot-instructions.md` exists, marker present | Only the block between **`<!-- github-copilot-memory-bank:begin -->`** and **`<!-- github-copilot-memory-bank:end -->`** is **replaced** (safe to re-run after upgrading this package). |
| You want a clean Copilot file | Use **`--copilot-replace`** (overwrites the **entire** file—back up first). |

Cursor rules: existing **`.mdc`** files are **skipped** unless **`--force`**.

---

## Comparison with `cursor-bank` on npm

The npm package **[`cursor-bank`](https://www.npmjs.com/package/cursor-bank)** (`npx cursor-bank init`) clones rules from GitHub and copies **`.cursor/rules`**, and ensures an **empty** `memory-bank/` folder.

| | **cursor-bank** | **github-copilot-memory-bank** |
|--|-----------------|--------------------------------|
| **`.github/copilot-instructions.md`** | No | Yes (merge-safe block) |
| **Starter `memory-bank/*.md`** | No | Yes (six files) |
| **`.cursor/rules`** | Yes (git clone) | Yes with **`--cursor-rules`** (bundled) |
| **Dependencies** | Includes `simple-git`, etc. | **None** (Node stdlib only) |
| **Offline / air-gapped** | Needs clone | Works offline after install |

There is **no** npm package named **`cursor-memory-bank`**; **`cursor-bank`** is the common installer name people associate with that workflow.

---

## Troubleshooting

**Copilot does not seem to follow the bank**

- Confirm **`.github/copilot-instructions.md`** is on the **default branch** you use with Copilot and is **committed**.
- Check you are in the **correct repository** and Copilot **custom instructions** are enabled for your org/account (see GitHub docs).
- Instructions are **hints**, not hard rules—keep them short and concrete.

**I changed `--bank-dir` and old paths are wrong**

- Re-run **`init`** with the new **`--bank-dir`** so templates and the merged Copilot block update. Manually fix any custom text you added outside the HTML markers.

**`skip (exists)` for every memory file**

- Use **`--force`** to refresh the six templates (this **overwrites** those files; back up if you customized them).

**Merge markers look ugly in GitHub’s UI**

- The HTML comments are intentional so merges are predictable. You can still read and edit the Markdown inside the block in the web UI.

---

## Developing and publishing this package

```bash
git clone <your-fork-or-repo>
cd github-copilot-memory-bank
node bin/cli.mjs init --dry-run
npm pack --dry-run
```

Publish (adjust **`name`** in `package.json` if you use a scope):

```bash
npm publish --access public
```

---

## License and notices

- **License:** MIT — see **`LICENSE`**.
- **NOTICE:** Cursor-oriented rule content is **inspired by** and aligned with community practice and **[tacticlaunch/cursor-bank](https://github.com/tacticlaunch/cursor-bank)**; see **`NOTICE`** in the package.

---

## Summary

| You want… | Run |
|-----------|-----|
| Copilot + starter memory files | `npx github-copilot-memory-bank@latest init` |
| Same repo in **Cursor** too | Add **`--cursor-rules`** |
| Custom folder for memory | **`--bank-dir <path>`** |
| Preview only | **`--dry-run`** |
| Refresh templates / Cursor rules | **`--force`** (with care) |

The memory bank only works if **you maintain it** and **commit** it—this CLI just gets you to a consistent, documented starting point.
