#!/usr/bin/env bash
# Rebuild VS Code (.vsix) and IntelliJ (.zip) artifacts from the monorepo root.
# Usage:
#   ./scripts/rebuild-extensions.sh
#   REBUILD_SKIP_TESTS=1 ./scripts/rebuild-extensions.sh   # faster: no vitest
# Requires: Node 20+, JDK 21+ (for Gradle), network on first Gradle run.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Cloude Code ToolBox — rebuild VSIX + IntelliJ plugin"
echo "    Root: $ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "error: node not found (need Node 20+)" >&2
  exit 1
fi
if ! command -v java >/dev/null 2>&1; then
  echo "error: java not found (need JDK 21 for IntelliJ build; see packages/cloude-code-toolbox-intellij/README.md)" >&2
  exit 1
fi

if [[ "${REBUILD_SKIP_TESTS:-}" == "1" ]]; then
  echo "==> compile (VS Code extension)"
  npm run compile
else
  echo "==> compile + test (VS Code extension)"
  npm run compile
  npm test
fi

echo "==> export hub HTML for IntelliJ JCEF (packages/cloude-code-toolbox → cloude-code-toolbox-intellij/resources)"
node packages/cloude-code-toolbox/scripts/export-hub-for-intellij.mjs

echo "==> package VS Code extension (.vsix)"
npm run package

echo "==> build IntelliJ plugin (.zip)"
npm run package:intellij

echo ""
echo "Done. Typical outputs:"
echo "  VS Code:   packages/cloude-code-toolbox/*.vsix"
echo "  IntelliJ:  packages/cloude-code-toolbox-intellij/build/distributions/*.zip"
if command -v ls >/dev/null 2>&1; then
  echo ""
  echo "Latest VSIX:"
  ls -1t "$ROOT/packages/cloude-code-toolbox"/*.vsix 2>/dev/null | head -3 || true
  echo "IntelliJ ZIP:"
  ls -1 "$ROOT/packages/cloude-code-toolbox-intellij/build/distributions"/*.zip 2>/dev/null || true
fi
