#!/usr/bin/env node
/**
 * cloude-code-memory-bank — scaffold memory bank + CLAUDE.md context block
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const TEMPLATES = join(PKG_ROOT, "templates");

const MARKER_BEGIN = "<!-- cloude-code-memory-bank:begin -->";
const MARKER_END = "<!-- cloude-code-memory-bank:end -->";

const CURSOR_RULE_FILES = ["memory-bank.mdc", "core.mdc"];

function usage() {
  console.log(`cloude-code-memory-bank — scaffold a memory bank for Claude Code / VS Code

Usage:
  npx cloude-code-memory-bank init [options]

Options:
  --cwd <dir>              Project root (default: current directory)
  --bank-dir <path>        Memory bank folder relative to cwd (default: memory-bank)
  --dry-run                Print actions without writing files
  --force                  Overwrite existing memory-bank markdown and Cursor rule files
  --cursor-rules           Also install .cursor/rules/*.mdc (Plan/Act + memory bank rules for Cursor)
  --no-claude-md           Do not create or update CLAUDE.md
  --claude-md-replace      Replace entire CLAUDE.md (default: merge block)
  -h, --help               Show help

Examples:
  npx cloude-code-memory-bank init
  npx cloude-code-memory-bank init --cursor-rules
  npx cloude-code-memory-bank init --bank-dir docs/memory-bank --dry-run
`);
}

function parseArgs(argv) {
  const args = {
    _: [],
    cwd: process.cwd(),
    bankDir: "memory-bank",
    dryRun: false,
    force: false,
    claudeMd: true,
    claudeMdReplace: false,
    cursorRules: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { help: true };
    if (a === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (a === "--force") {
      args.force = true;
      continue;
    }
    if (a === "--cursor-rules") {
      args.cursorRules = true;
      continue;
    }
    if (a === "--no-claude-md" || a === "--no-copilot") {
      args.claudeMd = false;
      continue;
    }
    if (a === "--claude-md-replace" || a === "--copilot-replace") {
      args.claudeMdReplace = true;
      continue;
    }
    if (a === "--cwd") {
      args.cwd = argv[++i] ?? args.cwd;
      continue;
    }
    if (a === "--bank-dir") {
      args.bankDir = argv[++i] ?? args.bankDir;
      continue;
    }
    if (a.startsWith("-")) {
      console.error(`Unknown option: ${a}`);
      process.exit(1);
    }
    args._.push(a);
  }
  return args;
}

function normalizeBankPath(bankDir) {
  return bankDir.replace(/^[/\\]+/, "").replace(/[/\\]+$/g, "");
}

function bankPathForInstructions(cwd, bankDirNorm) {
  const rel = relative(cwd, join(cwd, bankDirNorm));
  const use = rel && !rel.startsWith("..") ? rel : bankDirNorm;
  const posix = use.split(/[/\\]/).join("/");
  return posix.startsWith(".") ? posix : `./${posix}`;
}

function mergeClaudeMd(existing, block) {
  const text = existing;
  if (!text.includes(MARKER_BEGIN)) {
    const sep = text.trimEnd().length ? "\n\n" : "";
    return `${text.trimEnd()}${sep}${block}\n`;
  }
  const re = new RegExp(`${escapeRe(MARKER_BEGIN)}[\\s\\S]*?${escapeRe(MARKER_END)}`, "m");
  return text.replace(re, block.trimEnd());
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function installCursorRules({ cwd, bankDisplay, dryRun, force }) {
  const destDir = join(cwd, ".cursor", "rules");
  const srcDir = join(TEMPLATES, "cursor-rules");

  if (!existsSync(srcDir)) {
    console.error(`Missing templates: ${srcDir}`);
    process.exit(1);
  }

  const available = new Set(readdirSync(srcDir));
  for (const name of CURSOR_RULE_FILES) {
    if (!available.has(name)) {
      console.error(`Missing Cursor rule template: ${join(srcDir, name)}`);
      process.exit(1);
    }
    const src = join(srcDir, name);
    const dest = join(destDir, name);
    if (existsSync(dest) && !force) {
      console.log(`skip (exists): ${dest}`);
      continue;
    }
    let body = readFileSync(src, "utf8");
    body = body.replaceAll("{{BANK_PATH}}", bankDisplay);
    if (dryRun) {
      console.log(`[dry-run] write ${dest}`);
      continue;
    }
    mkdirSync(destDir, { recursive: true });
    writeFileSync(dest, body, "utf8");
    console.log(`wrote ${dest}`);
  }
}

function applyClaudeMd({ cwd, bankDisplay, dryRun, claudeMdReplace }) {
  const claudePath = join(cwd, "CLAUDE.md");
  const tplPath = join(TEMPLATES, "claude-snippet.md");
  let tpl = readFileSync(tplPath, "utf8");
  tpl = tpl.replaceAll("{{BANK_PATH}}", bankDisplay);

  const block = `${MARKER_BEGIN}
${tpl.trim()}
${MARKER_END}`;

  if (dryRun) {
    console.log(`[dry-run] update ${claudePath} (merge or replace)`);
    return;
  }

  if (!existsSync(claudePath)) {
    writeFileSync(claudePath, `${block}\n`, "utf8");
    console.log(`wrote ${claudePath}`);
    return;
  }

  const existing = readFileSync(claudePath, "utf8");
  if (claudeMdReplace) {
    writeFileSync(claudePath, `${block}\n`, "utf8");
    console.log(`replaced ${claudePath}`);
    return;
  }

  const merged = mergeClaudeMd(existing, block);
  writeFileSync(claudePath, merged, "utf8");
  console.log(`merged memory-bank section into ${claudePath}`);
}

function main() {
  const raw = process.argv.slice(2);
  if (raw.length === 0 || raw[0] === "-h" || raw[0] === "--help") {
    usage();
    process.exit(0);
  }
  if (raw[0] !== "init") {
    console.error("Unknown command. Use: cloude-code-memory-bank init\nRun with --help for options.");
    process.exit(1);
  }

  const parsed = parseArgs(raw.slice(1));
  if (parsed.help) {
    usage();
    process.exit(0);
  }

  const cwd = parsed.cwd;
  const bankDirNorm = normalizeBankPath(parsed.bankDir);
  const bankRoot = join(cwd, bankDirNorm);
  const bankDisplay = bankPathForInstructions(cwd, bankDirNorm);

  const bankFiles = [
    "projectbrief.md",
    "productContext.md",
    "activeContext.md",
    "systemPatterns.md",
    "techContext.md",
    "progress.md",
  ];

  for (const name of bankFiles) {
    const dest = join(bankRoot, name);
    const src = join(TEMPLATES, "memory-bank", name);
    if (!existsSync(src)) {
      console.error(`Missing template: ${src}`);
      process.exit(1);
    }
    if (existsSync(dest) && !parsed.force) {
      console.log(`skip (exists): ${dest}`);
      continue;
    }
    let body = readFileSync(src, "utf8");
    body = body.replaceAll("{{BANK_PATH}}", bankDisplay);
    if (parsed.dryRun) {
      console.log(`[dry-run] copy template -> ${dest}`);
      continue;
    }
    mkdirSync(bankRoot, { recursive: true });
    writeFileSync(dest, body, "utf8");
    console.log(`wrote ${dest}`);
  }

  if (parsed.claudeMd) {
    applyClaudeMd({
      cwd,
      bankDisplay,
      dryRun: parsed.dryRun,
      claudeMdReplace: parsed.claudeMdReplace,
    });
  }

  if (parsed.cursorRules) {
    installCursorRules({
      cwd,
      bankDisplay,
      dryRun: parsed.dryRun,
      force: parsed.force,
    });
  }
}

main();
