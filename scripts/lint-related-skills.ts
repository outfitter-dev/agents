#!/usr/bin/env bun
/**
 * Lint metadata.related-skills bidirectionality across all SKILL.md files.
 *
 * Validates that if skill A lists skill B in metadata.related-skills,
 * skill B must also list skill A.
 *
 * Usage:
 *   bun scripts/lint-related-skills.ts [path]
 *
 * Examples:
 *   bun scripts/lint-related-skills.ts                # Lint all SKILL.md files
 *   bun scripts/lint-related-skills.ts outfitter/     # Lint specific plugin
 */

import { Glob } from "bun";
import { statSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

/**
 * Parsed skill metadata from SKILL.md frontmatter.
 */
interface SkillInfo {
  /** File path to SKILL.md */
  path: string;
  /** Skill name from frontmatter or directory name */
  name: string;
  /** Related skills listed in metadata */
  relatedSkills: string[];
}

/**
 * A bidirectionality violation in related-skills metadata.
 */
interface Violation {
  /** Skill that declares the relationship */
  sourceSkill: string;
  /** Path to source skill's SKILL.md */
  sourcePath: string;
  /** Skill referenced in related-skills */
  targetSkill: string;
  /** Description of the violation */
  message: string;
}

/**
 * Get the indentation level of a line (number of spaces).
 */
function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

/**
 * Parse YAML frontmatter from markdown content.
 * Handles nested structures like metadata.related-skills.
 */
function parseYamlFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = match[1].split("\n");
  const result: Record<string, unknown> = {};
  const stack: Array<{ indent: number; obj: Record<string, unknown>; key?: string }> = [
    { indent: -1, obj: result },
  ];

  let currentArray: string[] | null = null;
  let arrayIndent = -1;

  for (const line of lines) {
    // Skip empty lines
    if (line.trim() === "") continue;

    const indent = getIndent(line);
    const trimmed = line.trim();

    // Check for array item
    if (trimmed.startsWith("- ")) {
      const value = trimmed.slice(2).trim();
      if (currentArray !== null) {
        currentArray.push(value);
      }
      continue;
    }

    // If we were collecting an array, we're done with it
    if (currentArray !== null && indent <= arrayIndent) {
      currentArray = null;
      arrayIndent = -1;
    }

    // Parse key: value
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    // Pop stack until we find the right parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;

    if (value === "" || value === "|" || value === ">") {
      // This could be a nested object or an array
      // We'll find out on the next line
      const newObj: Record<string, unknown> = {};
      parent[key] = newObj;
      stack.push({ indent, obj: newObj, key });

      // Check next lines to see if it's an array
      const lineIndex = lines.indexOf(line);
      if (lineIndex < lines.length - 1) {
        const nextLine = lines[lineIndex + 1];
        if (nextLine.trim().startsWith("- ")) {
          // It's an array
          currentArray = [];
          arrayIndent = indent;
          parent[key] = currentArray;
          stack.pop(); // Don't need the object
        }
      }
    } else {
      parent[key] = value;
    }
  }

  return result;
}

/**
 * Extract skill name from frontmatter or derive from path.
 */
function getSkillName(frontmatter: Record<string, unknown>, skillPath: string): string {
  // Prefer name from frontmatter
  if (typeof frontmatter.name === "string" && frontmatter.name) {
    return frontmatter.name;
  }
  // Fall back to directory name (parent of SKILL.md)
  return basename(dirname(skillPath));
}

/**
 * Extract related-skills array from frontmatter.
 * Looks in metadata.related-skills (nested structure).
 */
function getRelatedSkills(frontmatter: Record<string, unknown>): string[] {
  // Check metadata.related-skills (the nested format)
  const metadata = frontmatter.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const metadataObj = metadata as Record<string, unknown>;
    const related = metadataObj["related-skills"];
    if (Array.isArray(related)) {
      return related.map((s) => String(s).trim()).filter((s) => s.length > 0);
    }
  }

  // Also check top-level related_skills for backwards compatibility
  const topLevel = frontmatter["related-skills"] || frontmatter.related_skills;
  if (Array.isArray(topLevel)) {
    return topLevel.map((s) => String(s).trim()).filter((s) => s.length > 0);
  }

  return [];
}

/**
 * Find all SKILL.md files and parse their metadata.
 */
async function findSkills(searchPath: string): Promise<SkillInfo[]> {
  const skills: SkillInfo[] = [];
  const glob = new Glob("**/SKILL.md");

  for await (const file of glob.scan({
    cwd: searchPath,
    absolute: true,
    onlyFiles: true,
  })) {
    // Skip common excludes
    if (
      file.includes("node_modules") ||
      file.includes(".git") ||
      file.includes(".beads") ||
      file.includes("templates/") ||
      file.includes(".archive")
    ) {
      continue;
    }

    try {
      const content = await Bun.file(file).text();
      const frontmatter = parseYamlFrontmatter(content);

      if (!frontmatter) {
        continue;
      }

      const name = getSkillName(frontmatter, file);
      const relatedSkills = getRelatedSkills(frontmatter);

      skills.push({
        path: file,
        name,
        relatedSkills,
      });
    } catch (error) {
      console.error(`Warning: Failed to parse ${file}: ${error}`);
    }
  }

  return skills;
}

/**
 * Build a map of skill name -> SkillInfo for quick lookups.
 */
function buildSkillMap(skills: SkillInfo[]): Map<string, SkillInfo> {
  const map = new Map<string, SkillInfo>();
  for (const skill of skills) {
    if (map.has(skill.name)) {
      console.error(
        `Warning: Duplicate skill name "${skill.name}" found at:\n` +
          `  - ${map.get(skill.name)!.path}\n` +
          `  - ${skill.path}`
      );
    }
    map.set(skill.name, skill);
  }
  return map;
}

/**
 * Validate bidirectional relationships.
 */
function validateBidirectionality(
  skills: SkillInfo[],
  skillMap: Map<string, SkillInfo>
): Violation[] {
  const violations: Violation[] = [];

  for (const skill of skills) {
    for (const related of skill.relatedSkills) {
      const targetSkill = skillMap.get(related);

      if (!targetSkill) {
        // Target skill doesn't exist - this is a warning, not a bidirectionality violation
        violations.push({
          sourceSkill: skill.name,
          sourcePath: skill.path,
          targetSkill: related,
          message: `"${skill.name}" references non-existent skill "${related}"`,
        });
        continue;
      }

      // Check if target skill lists source skill
      if (!targetSkill.relatedSkills.includes(skill.name)) {
        violations.push({
          sourceSkill: skill.name,
          sourcePath: skill.path,
          targetSkill: related,
          message: `"${skill.name}" lists "${related}" but "${related}" does not list "${skill.name}"`,
        });
      }
    }
  }

  return violations;
}

/**
 * Format path relative to cwd for cleaner output.
 */
function relativePath(absolutePath: string): string {
  return absolutePath.replace(process.cwd() + "/", "");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const paths = args.filter((arg) => !arg.startsWith("--"));
  const searchPath = resolve(paths[0] || ".");

  // Validate search path
  try {
    const stat = statSync(searchPath);
    if (!stat.isDirectory()) {
      console.error(`Error: ${searchPath} is not a directory`);
      process.exit(1);
    }
  } catch {
    console.error(`Error: Path not found: ${searchPath}`);
    process.exit(1);
  }

  console.log(`\nScanning for SKILL.md files in ${relativePath(searchPath)}...\n`);

  // Find all skills
  const skills = await findSkills(searchPath);
  const skillsWithRelated = skills.filter((s) => s.relatedSkills.length > 0);

  console.log(`Found ${skills.length} skills, ${skillsWithRelated.length} with metadata.related-skills\n`);

  if (skillsWithRelated.length === 0) {
    console.log("No skills with metadata.related-skills found. Nothing to validate.\n");
    process.exit(0);
  }

  // Build lookup map
  const skillMap = buildSkillMap(skills);

  // Validate bidirectionality
  const violations = validateBidirectionality(skills, skillMap);

  // Separate missing skills from bidirectionality violations
  const missingSkills = violations.filter((v) => v.message.includes("non-existent"));
  const bidirectionalViolations = violations.filter((v) => !v.message.includes("non-existent"));

  // Report missing skill references
  if (missingSkills.length > 0) {
    console.log("Missing skill references:");
    console.log("-".repeat(50));
    for (const v of missingSkills) {
      console.log(`  ${relativePath(v.sourcePath)}:`);
      console.log(`    ${v.message}`);
    }
    console.log();
  }

  // Report bidirectionality violations
  if (bidirectionalViolations.length > 0) {
    console.log("Bidirectionality violations:");
    console.log("-".repeat(50));
    for (const v of bidirectionalViolations) {
      console.log(`  ${relativePath(v.sourcePath)}:`);
      console.log(`    ${v.message}`);
    }
    console.log();
  }

  // Summary
  console.log("-".repeat(50));
  if (violations.length === 0) {
    console.log(`\nAll ${skillsWithRelated.length} skill relationships are bidirectional.\n`);
    process.exit(0);
  } else {
    console.log(
      `\nFound ${violations.length} issue(s): ` +
        `${missingSkills.length} missing reference(s), ` +
        `${bidirectionalViolations.length} bidirectionality violation(s)\n`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
