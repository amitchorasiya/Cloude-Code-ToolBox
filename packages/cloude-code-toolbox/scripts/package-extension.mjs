/**
 * Stages the monorepo root README as packages/cloude-code-toolbox/README.md for vsce
 * (copies screenshots into media/readme/ so images work offline and in VSIX without relying
 * on raw.githubusercontent.com), rewrites repo links to github.com, runs vsce package,
 * then restores the extension README and removes media/readme/.
 *
 * Bridge CLIs are `file:../…` symlinks during dev; `vsce` runs `npm list --production`, which
 * fails for symlinked packages’ nested deps. We temporarily repoint `package.json` to `npm pack`
 * tarballs under `.vsix-bridge-tgz/`, run `npm install`, then `vsce package`, then restore.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXT_ROOT = path.join(__dirname, "..");
const MONOREPO_ROOT = path.join(EXT_ROOT, "..", "..");
const PACKAGES_DIR = path.join(EXT_ROOT, "..");
const STASH = path.join(__dirname, ".README.extension.md.stash");
const TGZ_DIR = path.join(EXT_ROOT, ".vsix-bridge-tgz");

const BRIDGE_FOLDERS = [
  "cursor-rules-to-claude",
  "cloude-code-memory-bank",
  "cursor-mcp-vscode-port",
];

const GITHUB_REPO = "https://github.com/amitchorasiya/Cloude-Code-ToolBox";

/** README image paths bundled into the VSIX (resolved relative to extension root). */
const README_MEDIA_PREFIX = "media/readme";

/**
 * Copy monorepo /screenshots/*.png into extension media/readme/ for vsce.
 * VS Code resolves README images relative to the extension package; raw GitHub URLs often
 * break for VSIX-only installs or before push.
 */
function copyScreenshotsForVsixReadme(monorepoScreenshotsDir, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(monorepoScreenshotsDir)) {
    console.warn("[package-extension] No screenshots dir:", monorepoScreenshotsDir);
    return;
  }
  const names = fs.readdirSync(monorepoScreenshotsDir).filter((f) => f.endsWith(".png"));
  for (const name of names) {
    fs.copyFileSync(
      path.join(monorepoScreenshotsDir, name),
      path.join(destDir, name),
    );
  }
  if (names.length === 0) {
    console.warn("[package-extension] No .png files in", monorepoScreenshotsDir);
  }
}

function transformRootReadmeForMarketplace(text) {
  let s = text;
  s = s.replaceAll("](screenshots/", `](${README_MEDIA_PREFIX}/`);
  s = s.replaceAll("](LICENSE)", `](${GITHUB_REPO}/blob/main/LICENSE)`);
  s = s.replaceAll(
    "](.vscode/launch.json)",
    `](${GITHUB_REPO}/blob/main/.vscode/launch.json)`,
  );
  s = s.replaceAll(
    "](.github/workflows/extension-ci.yml)",
    `](${GITHUB_REPO}/blob/main/.github/workflows/extension-ci.yml)`,
  );
  s = s.replaceAll(
    "](packages/cloude-code-toolbox/README.md#settings)",
    `](${GITHUB_REPO}/blob/main/packages/cloude-code-toolbox/README.md#settings)`,
  );
  s = s.replaceAll(
    "](packages/cloude-code-toolbox/README.md)",
    `](${GITHUB_REPO}/blob/main/packages/cloude-code-toolbox/README.md)`,
  );
  s = s.replaceAll(
    "](packages/cloude-code-toolbox/LICENSE)",
    `](${GITHUB_REPO}/blob/main/packages/cloude-code-toolbox/LICENSE)`,
  );
  s = s.replaceAll(
    "](packages/cloude-code-toolbox/)",
    `](${GITHUB_REPO}/tree/main/packages/cloude-code-toolbox/)`,
  );
  s = s.replaceAll(
    "](packages/cursor-mcp-vscode-port/)",
    `](${GITHUB_REPO}/tree/main/packages/cursor-mcp-vscode-port/)`,
  );
  s = s.replaceAll("](memory-bank/)", `](${GITHUB_REPO}/tree/main/memory-bank/)`);
  s = s.replaceAll("](README.md)", `](${GITHUB_REPO}/blob/main/README.md)`);
  s = s.replaceAll("](docs/", `](${GITHUB_REPO}/blob/main/docs/`);
  s = s.replaceAll("](diagrams/", `](${GITHUB_REPO}/blob/main/diagrams/`);
  return s;
}

function packBridgeTarballs(destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const folder of BRIDGE_FOLDERS) {
    const src = path.join(PACKAGES_DIR, folder);
    const pj = path.join(src, "package.json");
    if (!fs.existsSync(pj)) {
      throw new Error(`[package-extension] Missing bridge package: ${src}`);
    }
    execSync(`npm pack --pack-destination "${destDir}"`, { cwd: src, stdio: "inherit" });
  }
}

function pickTarballForPackage(destDir, npmName) {
  const files = fs
    .readdirSync(destDir)
    .filter((f) => f.endsWith(".tgz") && f.startsWith(`${npmName}-`));
  if (files.length === 0) {
    throw new Error(`[package-extension] No .tgz for "${npmName}" in ${destDir}`);
  }
  files.sort();
  return path.join(destDir, files[files.length - 1]);
}

/**
 * Rewrites extension dependencies to file:.vsix-bridge-tgz/<name>-<ver>.tgz. Returns original file text.
 */
function switchExtensionDepsToTarballs(tgzDir) {
  const pkgPath = path.join(EXT_ROOT, "package.json");
  const original = fs.readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(original);
  if (!pkg.dependencies) {
    throw new Error("[package-extension] package.json has no dependencies");
  }
  for (const folder of BRIDGE_FOLDERS) {
    const meta = JSON.parse(
      fs.readFileSync(path.join(PACKAGES_DIR, folder, "package.json"), "utf8"),
    );
    const name = meta.name;
    const abs = pickTarballForPackage(tgzDir, name);
    const rel = path.relative(EXT_ROOT, abs).split(path.sep).join("/");
    pkg.dependencies[name] = `file:${rel}`;
  }
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  return original;
}

const extensionReadme = path.join(EXT_ROOT, "README.md");
const rootReadme = path.join(MONOREPO_ROOT, "README.md");
const monorepoScreenshots = path.join(MONOREPO_ROOT, "screenshots");
const readmeMediaDir = path.join(EXT_ROOT, README_MEDIA_PREFIX);

if (!fs.existsSync(rootReadme)) {
  console.error("Missing monorepo README:", rootReadme);
  process.exit(1);
}

fs.copyFileSync(extensionReadme, STASH);
let exitCode = 0;
let pkgJsonOriginal = null;
try {
  copyScreenshotsForVsixReadme(monorepoScreenshots, readmeMediaDir);
  const body = transformRootReadmeForMarketplace(fs.readFileSync(rootReadme, "utf8"));
  fs.writeFileSync(extensionReadme, body, "utf8");
  execSync(
    "npx --yes @resvg/resvg-js-cli resources/icon-marketplace.svg resources/marketplace-icon.png --fit-width 128 --fit-height 128",
    { cwd: EXT_ROOT, stdio: "inherit" },
  );

  fs.rmSync(TGZ_DIR, { recursive: true, force: true });
  packBridgeTarballs(TGZ_DIR);
  pkgJsonOriginal = switchExtensionDepsToTarballs(TGZ_DIR);
  // Keep devDependencies (TypeScript, @vscode/vsce) — `vscode:prepublish` runs `tsc` during vsce pack.
  execSync("npm install --no-audit --no-fund", { cwd: EXT_ROOT, stdio: "inherit" });
  // Keep README image links as `media/readme/…` (bundled in the VSIX). Default vsce rewrites
  // relative image URLs to github.com/.../raw/HEAD/... at repo root, which breaks monorepos
  // (and 404s when media/readme is not committed).
  execSync("npx vsce package --no-rewrite-relative-links", {
    cwd: EXT_ROOT,
    stdio: "inherit",
  });
} catch (e) {
  console.error(e);
  exitCode = typeof e?.status === "number" ? e.status : 1;
} finally {
  if (pkgJsonOriginal !== null) {
    try {
      fs.writeFileSync(path.join(EXT_ROOT, "package.json"), pkgJsonOriginal);
      execSync("npm install --no-audit --no-fund", { cwd: EXT_ROOT, stdio: "inherit" });
    } catch (re) {
      console.error("[package-extension] Failed to restore package.json / npm install:", re);
    }
  }
  fs.rmSync(TGZ_DIR, { recursive: true, force: true });
  fs.rmSync(readmeMediaDir, { recursive: true, force: true });
  if (fs.existsSync(STASH)) {
    fs.copyFileSync(STASH, extensionReadme);
    fs.unlinkSync(STASH);
  }
}

process.exit(exitCode);
