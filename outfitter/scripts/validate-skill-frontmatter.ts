#!/usr/bin/env bun
/**
 * validate-skill-frontmatter.ts
 *
 * Validates SKILL.md frontmatter against the Agent Skills specification.
 * Designed for use as a PreToolUse hook for Write/Edit operations on SKILL.md files.
 *
 * Exit codes:
 *   0 - Valid (warnings may be on stderr)
 *   2 - Block (critical errors)
 *
 * Usage:
 *   bun validate-skill-frontmatter.ts <path-to-SKILL.md>
 *   echo '---\nname: test\n---' | bun validate-skill-frontmatter.ts --stdin
 */

import { readFileSync, statSync } from "fs";
import { basename, dirname } from "path";
import { parse as parseYaml } from "yaml";

// Import context detection (if available)
const RESERVED_WORDS = ["anthropic", "claude"];
const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const MAX_LINES = 500;
const MAX_DESCRIPTION_LENGTH = 1024;
const MIN_DESCRIPTION_LENGTH = 10;

/**
 * Result of skill frontmatter validation.
 */
interface ValidationResult {
  /** Whether the frontmatter passes all required checks */
  valid: boolean;
  /** Blocking errors that must be fixed */
  errors: string[];
  /** Non-blocking warnings for improvement */
  warnings: string[];
  /** Parsed frontmatter if YAML was valid */
  frontmatter: Record<string, unknown> | null;
}

/**
 * Expected structure of SKILL.md frontmatter.
 */
interface SkillFrontmatter {
  name?: string;
  description?: string;
  version?: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, unknown>;
  "allowed-tools"?: string;
  "user-invocable"?: boolean;
  "disable-model-invocation"?: boolean;
  context?: string;
  agent?: string;
  model?: string;
  hooks?: Record<string, string>;
  "argument-hint"?: string;
  [key: string]: unknown;
}

// Base spec fields (cross-platform)
const BASE_FIELDS = new Set([
  "name",
  "description",
  "version",
  "license",
  "compatibility",
  "metadata",
]);

// Claude-specific extension fields
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
 * Extracts YAML frontmatter from markdown content.
 * @param content - Full markdown file content
 * @returns Object with extracted YAML string and total line count
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
 * Checks if a file path indicates Claude Code context.
 * @param path - File path to check
 * @returns True if path matches Claude skill locations
 */
function detectClaudeContext(path: string): boolean {
  const patterns = [
    /\.claude-plugin\//,
    /\.claude\/skills\//,
    /\/\.claude\/skills\//,
  ];
  return patterns.some((p) => p.test(path));
}

/**
 * Validates SKILL.md content against the Agent Skills specification.
 * @param content - Full SKILL.md file content
 * @param filePath - Path to the file (used for context detection)
 * @returns Validation result with errors, warnings, and parsed frontmatter
 */
function validate(
  content: string,
  filePath: string
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    frontmatter: null,
  };

  const { yaml, lineCount } = extractFrontmatter(content);

  // Check for YAML syntax
  if (yaml === null) {
    result.valid = false;
    result.errors.push(
      "Missing or invalid frontmatter. SKILL.md must start with --- and have closing ---"
    );
    return result;
  }

  // Check for tabs (YAML requires spaces)
  if (yaml.includes("\t")) {
    result.valid = false;
    result.errors.push(
      "YAML contains tabs. Use spaces for indentation (YAML specification requirement)"
    );
  }

  // Parse YAML
  let frontmatter: SkillFrontmatter;
  try {
    frontmatter = parseYaml(yaml) as SkillFrontmatter;
    result.frontmatter = frontmatter;
  } catch (e) {
    result.valid = false;
    result.errors.push(
      `YAML parse error: ${e instanceof Error ? e.message : String(e)}`
    );
    return result;
  }

  if (!frontmatter || typeof frontmatter !== "object") {
    result.valid = false;
    result.errors.push("Frontmatter must be a YAML object");
    return result;
  }

  // Required fields
  if (!frontmatter.name) {
    result.valid = false;
    result.errors.push("Missing required field: name");
  }

  if (!frontmatter.description) {
    result.valid = false;
    result.errors.push("Missing required field: description");
  }

  // Name validation
  if (frontmatter.name) {
    const name = frontmatter.name;

    // Pattern check
    if (!NAME_PATTERN.test(name)) {
      result.valid = false;
      result.errors.push(
        `Invalid name format: '${name}'. Must be lowercase, numbers, hyphens only. Pattern: ${NAME_PATTERN}`
      );
    }

    // Length check
    if (name.length < 2 || name.length > 64) {
      result.valid = false;
      result.errors.push(
        `Name length must be 2-64 characters. Got: ${name.length}`
      );
    }

    // Reserved words
    for (const reserved of RESERVED_WORDS) {
      if (name.toLowerCase().includes(reserved)) {
        result.valid = false;
        result.errors.push(
          `Name cannot contain reserved word: '${reserved}'. Found in: '${name}'`
        );
      }
    }

    // Directory match (if file path provided)
    if (filePath && filePath !== "--stdin") {
      const parentDir = basename(dirname(filePath));
      if (parentDir !== name && parentDir !== "skills") {
        result.warnings.push(
          `Name '${name}' does not match parent directory '${parentDir}'. Consider renaming for consistency.`
        );
      }
    }
  }

  // Description validation
  if (frontmatter.description) {
    const desc = frontmatter.description;

    if (desc.length < MIN_DESCRIPTION_LENGTH) {
      result.valid = false;
      result.errors.push(
        `Description too short: ${desc.length} chars. Minimum: ${MIN_DESCRIPTION_LENGTH}`
      );
    }

    if (desc.length > MAX_DESCRIPTION_LENGTH) {
      result.valid = false;
      result.errors.push(
        `Description too long: ${desc.length} chars. Maximum: ${MAX_DESCRIPTION_LENGTH}`
      );
    }

    // Quality warnings
    const hasWhat = /\b(extracts?|process(es)?|creates?|generates?|validates?|manages?|handles?|analyzes?|reviews?|debugs?|implements?)\b/i.test(desc);
    const hasWhen = /\b(use when|when working|when the user|when you need)\b/i.test(desc);

    if (!hasWhat) {
      result.warnings.push(
        "Description should include WHAT the skill does (verbs like 'extracts', 'processes', 'creates')"
      );
    }

    if (!hasWhen) {
      result.warnings.push(
        "Description should include WHEN to use it (e.g., 'Use when working with...')"
      );
    }
  }

  // Check for custom fields at top level (should be under metadata)
  const allKnownFields = new Set([...BASE_FIELDS, ...CLAUDE_FIELDS]);
  for (const key of Object.keys(frontmatter)) {
    if (!allKnownFields.has(key)) {
      result.warnings.push(
        `Custom field '${key}' should be nested under 'metadata'. Top-level custom fields may cause parsing issues.`
      );
    }
  }

  // Line count warning
  if (lineCount > MAX_LINES) {
    result.warnings.push(
      `SKILL.md has ${lineCount} lines (recommended max: ${MAX_LINES}). Consider moving details to references/.`
    );
  }

  // Claude context recommendations
  const isClaudeContext = detectClaudeContext(filePath);
  if (isClaudeContext) {
    if (!frontmatter["allowed-tools"]) {
      result.warnings.push(
        "Claude context detected. Consider adding 'allowed-tools' for tool permissions."
      );
    }
  }

  return result;
}

/**
 * Formats validation result for human-readable console output.
 * @param result - Validation result to format
 * @param path - Original file path for display
 */
function formatOutput(result: ValidationResult, path: string): void {
  const status = result.valid
    ? result.warnings.length > 0
      ? "WARNINGS"
      : "PASS"
    : "FAIL";

  console.log(`# Skill Validation: ${basename(dirname(path))}`);
  console.log(`**Status**: ${status}`);
  console.log(
    `**Issues**: ${result.errors.length} errors, ${result.warnings.length} warnings`
  );

  if (result.errors.length > 0) {
    console.log("\n## Errors (must fix)");
    for (const error of result.errors) {
      console.log(`- ${error}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log("\n## Warnings (should fix)");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (result.valid && result.warnings.length === 0) {
    console.log("\n✓ All checks passed");
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`Usage: validate-skill-frontmatter.ts <path-to-SKILL.md>

Validates SKILL.md frontmatter against Agent Skills specification.

Options:
  --stdin    Read content from stdin
  --json     Output as JSON
  --quiet    Only output on errors
  --help     Show this help message

Exit codes:
  0 - Valid (warnings may be present)
  2 - Invalid (blocking errors)
`);
    process.exit(0);
  }

  let content: string;
  let filePath: string;
  const outputJson = args.includes("--json");
  const quiet = args.includes("--quiet");

  if (args.includes("--stdin")) {
    // Read from stdin for hook usage
    const chunks: Buffer[] = [];
    for await (const chunk of Bun.stdin.stream()) {
      chunks.push(Buffer.from(chunk));
    }
    content = Buffer.concat(chunks).toString("utf-8");
    filePath = "--stdin";
  } else {
    filePath = args.find((a) => !a.startsWith("--")) || "";
    try {
      content = readFileSync(filePath, "utf-8");
    } catch (e) {
      console.error(`Error reading file: ${filePath}`);
      process.exit(2);
    }
  }

  const result = validate(content, filePath);

  if (outputJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (!quiet || !result.valid || result.warnings.length > 0) {
    formatOutput(result, filePath);
  }

  // Exit code: 0 for valid (even with warnings), 2 for blocking errors
  process.exit(result.valid ? 0 : 2);
}

main();
