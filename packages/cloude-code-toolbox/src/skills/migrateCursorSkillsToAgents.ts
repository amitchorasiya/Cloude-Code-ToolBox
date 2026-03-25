import * as fs from "node:fs/promises";
import * as path from "node:path";

export const CURSOR_SKILLS_SEGMENTS = [".cursor", "skills"] as const;
export const GITHUB_SKILLS_SEGMENTS = [".github", "skills"] as const;
export const COPILOT_USER_SKILLS_SEGMENTS = [".copilot", "skills"] as const;
export const AGENTS_SKILLS_SEGMENTS = [".agents", "skills"] as const;

export function cursorSkillsDir(base: string): string {
  return path.join(base, ...CURSOR_SKILLS_SEGMENTS);
}

export function githubSkillsDir(base: string): string {
  return path.join(base, ...GITHUB_SKILLS_SEGMENTS);
}

export function copilotUserSkillsDir(base: string): string {
  return path.join(base, ...COPILOT_USER_SKILLS_SEGMENTS);
}

export function agentsSkillsDir(base: string): string {
  return path.join(base, ...AGENTS_SKILLS_SEGMENTS);
}

/** Subfolders of `skillsRootDir` that contain SKILL.md. */
export async function listSkillFoldersAtRoot(skillsRootDir: string): Promise<{ name: string; abs: string }[]> {
  const out: { name: string; abs: string }[] = [];
  try {
    const entries = await fs.readdir(skillsRootDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) {
        continue;
      }
      const abs = path.join(skillsRootDir, e.name);
      try {
        await fs.access(path.join(abs, "SKILL.md"));
      } catch {
        continue;
      }
      out.push({ name: e.name, abs });
    }
  } catch {
    /* missing or unreadable */
  }
  return out;
}

/** @deprecated Use listSkillFoldersAtRoot(cursorSkillsRoot) */
export async function listCursorSkillFolders(cursorSkillsRoot: string): Promise<{ name: string; abs: string }[]> {
  return listSkillFoldersAtRoot(cursorSkillsRoot);
}

export type MigrateSkillMode = "copy" | "move";

export type MigrateOneResult = "migrated" | "skipped" | "error";

/**
 * Copy or move one skill folder into `.agents/skills/<name>`.
 * Skips if destination folder already exists.
 */
export async function migrateOneSkillFolder(
  srcFolderAbs: string,
  agentsSkillsParent: string,
  name: string,
  mode: MigrateSkillMode
): Promise<MigrateOneResult> {
  const dest = path.join(agentsSkillsParent, name);
  try {
    await fs.access(dest);
    return "skipped";
  } catch {
    /* ok — dest does not exist */
  }
  try {
    await fs.mkdir(agentsSkillsParent, { recursive: true });
    await fs.cp(srcFolderAbs, dest, { recursive: true });
    if (mode === "move") {
      await fs.rm(srcFolderAbs, { recursive: true, force: true });
    }
    return "migrated";
  } catch {
    return "error";
  }
}

export type ScopeRun = {
  /** Source skills directory scanned (e.g. …/.cursor/skills or …/.github/skills). */
  skillsSourcePath: string;
  found: number;
  migrated: number;
  skipped: number;
  errors: number;
};

export async function runSkillsMigrationFromRoot(
  baseDir: string,
  sourceSegments: readonly string[],
  mode: MigrateSkillMode
): Promise<ScopeRun> {
  const skillsSourcePath = path.join(baseDir, ...sourceSegments);
  const agentsRoot = agentsSkillsDir(baseDir);
  const folders = await listSkillFoldersAtRoot(skillsSourcePath);
  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  for (const f of folders) {
    const r = await migrateOneSkillFolder(f.abs, agentsRoot, f.name, mode);
    if (r === "migrated") {
      migrated++;
    } else if (r === "skipped") {
      skipped++;
    } else {
      errors++;
    }
  }
  return {
    skillsSourcePath,
    found: folders.length,
    migrated,
    skipped,
    errors,
  };
}

export async function runMigrationForRoot(baseDir: string, mode: MigrateSkillMode): Promise<ScopeRun> {
  return runSkillsMigrationFromRoot(baseDir, CURSOR_SKILLS_SEGMENTS, mode);
}

export async function runCopilotGithubSkillsMigrationForRoot(
  baseDir: string,
  mode: MigrateSkillMode
): Promise<ScopeRun> {
  return runSkillsMigrationFromRoot(baseDir, GITHUB_SKILLS_SEGMENTS, mode);
}

export async function runCopilotUserSkillsMigrationForRoot(
  baseDir: string,
  mode: MigrateSkillMode
): Promise<ScopeRun> {
  return runSkillsMigrationFromRoot(baseDir, COPILOT_USER_SKILLS_SEGMENTS, mode);
}
