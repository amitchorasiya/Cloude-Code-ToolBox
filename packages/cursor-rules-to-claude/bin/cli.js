#!/usr/bin/env node
"use strict";

const path = require("path");
const { convert } = require("../lib/convert");

function printHelp() {
  console.log(`cursor-rules-to-claude — Cursor .cursor/rules → CLAUDE.md + .claude/rules

Usage:
  npx cursor-rules-to-claude [options]

Options:
  --cwd <dir>       Workspace root (default: current directory)
  --rules-dir <rel> Rules directory relative to cwd (default: .cursor/rules)
  --dry-run         Print actions without writing files
  --no-banner       Omit generator banner comments in output files
  -h, --help        Show help

Outputs:
  CLAUDE.md              — rules with alwaysApply: true (replaceable block)
  .claude/rules/*.md     — scoped rules (globs in HTML comments)
`);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const opts = {
    root: process.cwd(),
    rulesDir: undefined,
    dryRun: argv.includes("--dry-run"),
    noBanner: argv.includes("--no-banner"),
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--cwd") {
      opts.root = path.resolve(argv[++i] || "");
      if (!argv[i]) {
        console.error("cursor-rules-to-claude: --cwd requires a path");
        process.exit(1);
      }
    } else if (a === "--rules-dir") {
      opts.rulesDir = argv[++i];
      if (!opts.rulesDir) {
        console.error("cursor-rules-to-claude: --rules-dir requires a path");
        process.exit(1);
      }
    }
  }

  try {
    opts.root = path.resolve(opts.root);
    const result = await convert(opts);
    console.log(result.message);
    if (result.dryRun) {
      for (const w of result.scopedWrites) {
        console.log("  write:", path.relative(opts.root, w.dest));
      }
      if (result.alwaysPath) {
        console.log("  write:", path.relative(opts.root, result.alwaysPath));
      }
    }
  } catch (e) {
    console.error("cursor-rules-to-claude:", e.message || e);
    process.exit(1);
  }
}

main();
