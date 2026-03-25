## Real-world use cases: why each capability exists

Below, each capability lists **what people do without the Toolbox**, **how the feature helps in practice**, and a **concrete example**. The summary table at the end is a quick index.

---

### Intelligence — Context Pack

**Without it:** You manually copy file paths from Explorer, paste chunks of `git diff` or `git log`, drag in Problems panel text, and guess how much context Claude Code needs. Prompts vary by person; it is easy to paste secrets, huge logs, or the wrong branch.

**How it helps:** A guided flow builds a **bounded** context bundle (paths, optional git/diagnostics) with explicit toggles, so Claude Code gets enough signal without noise or oversharing.

**Example:** *You need Claude Code to suggest a safe migration for `packages/api/src/checkout.ts`. Without Context Pack you paste three unrelated files and half of `git diff main`. With Context Pack you include that file, the two interfaces it imports, and a trimmed diff for the feature branch only—Claude Code answers in one pass instead of three follow-ups.*

---

### Unified MCP & skills hub

**Without it:** You jump between `.vscode/mcp.json`, user-level MCP JSON, READMEs, and browser tabs for the registry. New hires ask “which MCPs are we using?” and you grep the repo.

**How it helps:** One sidebar shows **installed servers**, **registry search**, **skills roots**, and workspace tiles—aligned with what is on disk.

**Example:** *A contractor opens the repo on Monday. Instead of a 20-minute screen share walking through five files, they open **Cloude Code ToolBox → MCP & skills** and see the same servers and skill folders the team actually uses.*

---

### MCP & Skills awareness (+ optional merge into `CLAUDE.md`)

**Without it:** Claude Code’s workspace context in **`CLAUDE.md`** and **`.claude/`** lags behind real MCP and skill changes unless you update by hand. Drift is invisible until the model confidently gives wrong advice.

**How it helps:** A generated **awareness report** lists MCP + skills; optionally it can merge a replaceable block into instructions so committed docs match reality.

**Example:** *You add a Postgres MCP server for local dev. Two weeks later instructions still say “we only use filesystem tools.” Awareness surfaces the mismatch; merging updates **`CLAUDE.md`** so onboarding docs and Claude Code stay aligned.*

---

### Intelligence — Readiness

**Without it:** “Are we Claude-ready?” is answered in Slack with thumbs-up emoji or a wiki checklist from last quarter.

**How it helps:** A short, repo-aware summary highlights missing or inconsistent pieces (instructions, MCP, memory bank, etc.) before a review or release.

**Example:** *Before a compliance review, the lead runs readiness and sees that **`CLAUDE.md`** or legacy `copilot-instructions.md` exists but workspace `mcp.json` is empty—catching a gap before auditors ask.*

---

### Auto-scan on workspace open

**Without it:** Every developer must remember to run awareness or merge after pulling; most don’t until something breaks.

**How it helps:** Opening the folder can **refresh** awareness (and optional instruction merge) on a debounced schedule, gated by settings.

**Example:** *After a merge that adds a new skill root, the next person who opens the repo gets an updated awareness path without running a command they never memorized.*

---

### Hygiene — scan for secret-shaped patterns

**Without it:** Tokens in `mcp.json` rely on code review luck or repo-wide scanners that may not treat local JSON as first-class.

**How it helps:** A focused scan targets **MCP and instruction** files (including legacy Copilot paths) and surfaces secret-shaped strings early.

**Example:** *A dev pastes a staging API key into `mcp.json` “just to test.” The hygiene scan flags it in Output before the branch is pushed.*

---

### Notepad → memory-bank

**Without it:** Session notes live in Slack threads, scratch files, or personal Notion—lost to the team and to the next session.

**How it helps:** Pushes toolbox notepad content into **`memory-bank/`** markdown with a predictable layout the team can commit.

**Example:** *After debugging a flaky auth flow, you capture decisions in the notepad and push to `memory-bank/decisions.md` so the next on-call does not rediscover the same root cause.*

---

### New `SKILL.md` stub

**Without it:** Everyone copies old `SKILL.md` files from other repos; frontmatter and paths drift, and discovery breaks.

**How it helps:** Scaffolds a new skill file with consistent structure under your chosen skills root.

**Example:** *You add a “deploy checklist” skill under `.github/skills/`; the stub includes valid frontmatter so humans, the hub, and downstream tools recognize it immediately.*

---

### Verification checklist

**Without it:** “Done with setup” means different things; Confluence checklists do not live next to the repo.

**How it helps:** A checklist tied to the **workspace workflow** records that humans actually verified key steps.

**Example:** *Release policy requires “MCP reviewed” and “instructions updated.” The checklist lives in-editor so PR reviewers see it was acknowledged for this repo.*

---

### Bundled MCP recipe merge

**Without it:** First-time MCP setup means reading three docs and hand-typing JSON—often wrong `command`, `env`, or `args`.

**How it helps:** Merges a **known-good sample** into `mcp.json` as a teaching path, not a black box.

**Example:** *Workshop demo: merge the sample server block in two clicks, then tweak the API key placeholder—participants get a running server instead of twenty minutes of typos.*

---

### Run first test-like task

**Without it:** After editing configs you manually hunt **Terminal → Run Task** or guess task labels from `tasks.json`.

**How it helps:** Offers a quick run of a sensible task to confirm the workspace still executes something real.

**Example:** *After MCP changes, you run the first test-like task and immediately see that `npm test` still passes—catching a broken path before you context-switch.*

---

### Port Cursor MCP (`npx`)

**Without it:** You open Cursor’s `mcp.json` and VS Code’s side by side, manually translating keys and env blocks—easy to mistype server names or args.

**How it helps:** Runs a published CLI via `npx` to **port** entries into the shape VS Code expects.

**Example:** *Team piloted MCP in Cursor; production standard is VS Code + Claude Code. Porting copies ten servers in one shot instead of an afternoon of copy-paste bugs.*

---

### Sync Cursor rules → `CLAUDE.md` (`npx`)

**Without it:** `.cursorrules` and `.github/copilot-instructions.md` diverge; someone bulk-copies and loses sections or merge markers.

**How it helps:** CLI sync preserves rules content into the instruction files you ship in git.

**Example:** *Security rules live in Cursor during spike; before merge to `main`, sync pushes the same constraints into `copilot-instructions.md` for everyone on Claude Code.*

---

### Init memory bank (`npx`)

**Without it:** Each repo invents its own `memory-bank/` layout from blog posts; agents and humans disagree on where “truth” lives.

**How it helps:** Scaffolds the **expected** folders and merges so memory bank matches ecosystem conventions.

**Example:** *Greenfield service: `npx` init creates `memory-bank/product.md`, `decisions.md`, etc., so the whole team—and Claude Code—know where to look.*

---

### Migrate skills `.cursor` → `.agents`

**Without it:** You `mv` folders by hand; relative paths and skill discovery break silently.

**How it helps:** Moves skills to the **`.agents`** layout with conventions preserved.

**Example:** *Upstream tooling now expects `.agents/skills/`; migration moves twenty skills without broken imports or duplicate roots.*

---

### Workspace kit tree

**Without it:** Onboarding is “open these five paths in Explorer” every time someone joins.

**How it helps:** A **per-repo** checklist surfaces rules, memory bank, instructions, MCP, and **One Click Setup** in one tree.

**Example:** *Intern’s first task: expand Workspace kit and click through missing items until the checklist is green—no tribal map of the repo.*

---

### Hub + palette (replaces Guide tree, 0.5.17+)

**Without it:** You rely on Command Palette search (“was it Cloude… Code… Toolbox?”) and miss features entirely.

**How it helps:** The **MCP & skills** hub **Workspace** tab lists grouped command tiles; the Command Palette still exposes every **`CloudeCodeToolBox.*`** command.

**Example:** *You forget the exact string for Intelligence readiness; open the hub **Workspace** tab, search “readiness”, run the tile.*

---

### Native MCP commands (registry / add / list)

**Without it:** You read release notes to find the right built-in VS Code command IDs for MCP.

**How it helps:** Toolbox **routes** you to the same native flows your VS Code version supports.

**Example:** *You want “add server” the Microsoft way; Toolbox opens the official path instead of a forked wizard that ages badly.*

---

### Turn OFF + stash (MCP / skills)

**Without it:** To disable a noisy server you delete JSON or comment invalidly, then fish config back from git blame.

**How it helps:** **Turn OFF** can remove or hide entries while **stashing** state for restore—see extension README/CHANGELOG for exact semantics.

**Example:** *A third-party MCP starts throwing auth errors during a demo; you turn it off for the session and restore afterward without losing the original block.*

---

### Quick reference table

| Capability | Without it (typical) | How it helps |
| --- | --- | --- |
| **Context Pack** | Manual paste collage of files, git, problems | Bounded, toggleable bundle for Claude Code |
| **MCP & skills hub** | Many files + tabs | One hub for servers, registry, skills |
| **Awareness + merge** | Stale `CLAUDE.md` / `.claude` context | Report + optional **`CLAUDE.md`** sync |
| **Readiness** | Subjective “we’re fine” | Repo-aware health snapshot |
| **Auto-scan** | Forgetting to refresh | Refresh on open (settings-gated) |
| **Hygiene scan** | Missed secrets in MCP JSON | Early warning in Output |
| **Notepad → memory-bank** | Notes lost in Slack | Durable `memory-bank/` markdown |
| **`SKILL.md` stub** | Copy-paste drift | Consistent new skill file |
| **Verification checklist** | External-only checklists | In-repo acknowledgment |
| **MCP recipe merge** | Hand-typed JSON errors | Safe starter merge |
| **Run test-like task** | Guess task names | Quick sanity run |
| **Port Cursor MCP** | Manual JSON translation | `npx` port CLI |
| **Sync Cursor rules** | Divergent rules files | `npx` / bundled CLI → **`CLAUDE.md`** |
| **Init memory bank** | Ad-hoc layout | Scaffold + merges |
| **Migrate `.cursor` → `.agents`** | Risky moves | Structured migration |
| **Workspace kit** | Five-place tour | One checklist tree |
| **Hub Workspace tab + palette** | Palette guesswork | Searchable command tiles + full command list |
| **Native MCP shortcuts** | Hunt command IDs | Router to built-ins |
| **Turn OFF + stash** | Delete or invalid JSON | Temporary off + restore |

---
