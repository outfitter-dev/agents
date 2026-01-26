#!/usr/bin/env bun
/**
 * Lint SKILL.md files for correct frontmatter and structure.
 *
 * Validates:
 * - Required fields: name, description
 * - Field formats and lengths
 * - Redundant fields (e.g., user-invocable: true is default)
 * - Line count recommendations
 *
 * Usage:
 *   bun scripts/lint/claude-plugin/skills.ts [path]
 *
 * Examples:
 *   bun scripts/lint/claude-plugin/skills.ts                # Lint all skills
 *   bun scripts/lint/claude-plugin/skills.ts outfitter/     # Lint specific plugin
 */

import { Glob } from "bun";
import { readFileSync, statSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * A skill validation violation.
 */
export interface Violation {
  /** File path where violation was found */
  file: string;
  /** Severity of the issue */
  severity: "error" | "warning";
  /** Description of the issue */
  message: string;
}

/**
 * Result of skill validation.
 */
export interface LintResult {
  /** Whether validation passed (no errors) */
  passed: boolean;
  /** All violations found */
  violations: Violation[];
}

const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const RESERVED_WORDS = ["anthropic", "claude"];
const MAX_LINES = 500;
const MAX_DESCRIPTION_LENGTH = 1024;
const MIN_DESCRIPTION_LENGTH = 10;

/** Base spec fields (cross-platform) */
const BASE_FIELDS = new Set([
  "name",
  "description",
  "version",
  "license",
  "compatibility",
  "metadata",
]);

/** Claude-specific extension fields */
const CLAUDE_FIELDS = new Set([
  "allowed-tools",
  "user-invocable",
  "disable-model-invocation",
  "context",
  "agent",
  "model",
  "hooks",
  "argument-hint",
]);

/**
 * Extract YAML frontmatter from markdown content.
 */
function extractFrontmatter(content: string): {
  yaml: string | null;
  lineCount: number;
} {
  const lines = content.split("\n");
  const lineCount = lines.length;

  if (!lines[0]?.trim().startsWith("---")) {
    return { yaml: null, lineCount };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { yaml: null, lineCount };
  }

  const yaml = lines.slice(1, endIndex).join("\n");
  return { yaml, lineCount };
}

/**
 * Validate a single SKILL.md file.
 */
function validateSkillFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = readFileSync(filePath, "utf-8");
  const { yaml, lineCount } = extractFrontmatter(content);

  // Check for frontmatter
  if (yaml === null) {
    violations.push({
      file: filePath,
      severity: "error",
      message: "Missing or invalid frontmatter. SKILL.md must start with ---",
    });
    return violations;
  }

  // Check for tabs
  if (yaml.includes("\t")) {
    violations.push({
      file: filePath,
      severity: "error",
      message: "YAML contains tabs. Use spaces for indentation",
    });
  }

  // Parse YAML
  let frontmatter: Record<string, unknown>;
  try {
    frontmatter = parseYaml(yaml) as Record<string, unknown>;
  } catch (e) {
    violations.push({
      file: filePath,
      severity: "error",
      message: `YAML parse error: ${e instanceof Error ? e.message : String(e)}`,
    });
    return violations;
  }

  if (!frontmatter || typeof frontmatter !== "object") {
    violations.push({
      file: filePath,
      severity: "error",
      message: "Frontmatter must be a YAML object",
    });
    return violations;
  }

  // Required fields
  if (!frontmatter.name) {
    violations.push({
      file: filePath,
      severity: "error",
      message: "Missing required field: name",
    });
  }

  if (!frontmatter.description) {
    violations.push({
      file: filePath,
      severity: "error",
      message: "Missing required field: description",
    });
  }

  // Name validation
  if (typeof frontmatter.name === "string") {
    const name = frontmatter.name;

    if (!NAME_PATTERN.test(name)) {
      violations.push({
        file: filePath,
        severity: "error",
        message: `Invalid name format: "${name}". Must be lowercase, numbers, hyphens only`,
      });
    }

    if (name.length < 2 || name.length > 64) {
      violations.push({
        file: filePath,
        severity: "error",
        message: `Name length must be 2-64 characters. Got: ${name.length}`,
      });
    }

    // Reserved word check - warning only, as skills ABOUT Claude/Anthropic are legitimate
    for (const reserved of RESERVED_WORDS) {
      if (name.toLowerCase().includes(reserved)) {
        violations.push({
          file: filePath,
          severity: "warning",
          message: `Name contains reserved word "${reserved}". Ensure this skill is ABOUT ${reserved}, not impersonating official products`,
        });
      }
    }

    // Directory match check
    const parentDir = basename(dirname(filePath));
    if (parentDir !== name && parentDir !== "skills") {
      violations.push({
        file: filePath,
        severity: "warning",
        message: `Name "${name}" does not match parent directory "${parentDir}"`,
      });
    }
  }

  // Description validation
  if (typeof frontmatter.description === "string") {
    const desc = frontmatter.description;

    if (desc.length < MIN_DESCRIPTION_LENGTH) {
      violations.push({
        file: filePath,
        severity: "error",
        message: `Description too short: ${desc.length} chars. Minimum: ${MIN_DESCRIPTION_LENGTH}`,
      });
    }

    if (desc.length > MAX_DESCRIPTION_LENGTH) {
      violations.push({
        file: filePath,
        severity: "error",
        message: `Description too long: ${desc.length} chars. Maximum: ${MAX_DESCRIPTION_LENGTH}`,
      });
    }
  }

  // Check for redundant user-invocable: true (true is the default)
  if (frontmatter["user-invocable"] === true) {
    violations.push({
      file: filePath,
      severity: "warning",
      message:
        'Redundant "user-invocable: true" (true is the default). Remove or only use "user-invocable: false"',
    });
  }

  // Check for top-level version (should be under metadata per agentskills.io spec)
  if (frontmatter.version !== undefined) {
    violations.push({
      file: filePath,
      severity: "warning",
      message:
        'Top-level "version" should be under "metadata.version" per agentskills.io spec',
    });
  }

  // Check for custom fields at top level
  const allKnownFields = new Set([...BASE_FIELDS, ...CLAUDE_FIELDS]);
  for (const key of Object.keys(frontmatter)) {
    if (!allKnownFields.has(key)) {
      violations.push({
        file: filePath,
        severity: "warning",
        message: `Custom field "${key}" should be nested under "metadata"`,
      });
    }
  }

  // Line count warning
  if (lineCount > MAX_LINES) {
    violations.push({
      file: filePath,
      severity: "warning",
      message: `SKILL.md has ${lineCount} lines (recommended max: ${MAX_LINES}). Consider moving details to references/`,
    });
  }

  return violations;
}

/**
 * Find and validate all SKILL.md files in a path.
 */
export async function lintSkills(searchPath: string): Promise<LintResult> {
  const violations: Violation[] = [];
  const resolvedPath = resolve(searchPath);

  const glob = new Glob("**/SKILL.md");
  for await (const file of glob.scan({
    cwd: resolvedPath,
    absolute: true,
    onlyFiles: true,
  })) {
    if (
      file.includes("node_modules") ||
      file.includes(".git") ||
      file.includes(".beads") ||
      file.includes("templates/") ||
      file.includes(".archive")
    ) {
      continue;
    }
    violations.push(...validateSkillFile(file));
  }

  const hasErrors = violations.some((v) => v.severity === "error");

  return {
    passed: !hasErrors,
    violations,
  };
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
  const searchPath = paths[0] || ".";

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

  console.log(`\nLinting skills in ${relativePath(resolve(searchPath))}...\n`);

  const result = await lintSkills(searchPath);

  // Group violations by file
  const byFile = new Map<string, Violation[]>();
  for (const v of result.violations) {
    const existing = byFile.get(v.file) || [];
    existing.push(v);
    byFile.set(v.file, existing);
  }

  // Output results
  for (const [file, fileViolations] of byFile) {
    console.log(`${relativePath(file)}:`);
    for (const v of fileViolations) {
      const prefix = v.severity === "error" ? "✗" : "△";
      console.log(`  ${prefix} ${v.message}`);
    }
    console.log();
  }

  // Summary
  const errors = result.violations.filter((v) => v.severity === "error").length;
  const warnings = result.violations.filter(
    (v) => v.severity === "warning"
  ).length;

  if (result.violations.length === 0) {
    console.log("✓ No skill issues found\n");
  } else {
    console.log(`Found ${errors} error(s), ${warnings} warning(s)\n`);
  }

  process.exit(result.passed ? 0 : 1);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
