#!/usr/bin/env bun
/**
 * Lint hooks.json files for correct structure.
 *
 * Validates:
 * - hooks.json has root-level "hooks" wrapper (required for Claude Code)
 * - plugin.json does NOT have "hooks" field (auto-discovery pattern)
 * - Event types are valid (PreToolUse, PostToolUse, etc.)
 *
 * Usage:
 *   bun scripts/lint/claude-plugin/hooks.ts [path]
 *
 * Examples:
 *   bun scripts/lint/claude-plugin/hooks.ts                # Lint all plugins
 *   bun scripts/lint/claude-plugin/hooks.ts outfitter/     # Lint specific plugin
 */

import { Glob } from "bun";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

/**
 * A hooks validation violation.
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
 * Result of hooks validation.
 */
export interface LintResult {
  /** Whether validation passed (no errors) */
  passed: boolean;
  /** All violations found */
  violations: Violation[];
}

/** Valid hook event types in Claude Code */
const VALID_HOOK_EVENTS = new Set([
  "PreToolUse",
  "PostToolUse",
  "Stop",
  "SubagentStop",
  "SessionStart",
  "SessionEnd",
  "UserPromptSubmit",
  "PreCompact",
  "Notification",
]);

/**
 * Validate a hooks.json file structure.
 */
function validateHooksJson(filePath: string): Violation[] {
  const violations: Violation[] = [];

  try {
    const content = readFileSync(filePath, "utf-8");
    const json = JSON.parse(content);

    // Check for root-level "hooks" wrapper (REQUIRED)
    if (!json.hooks) {
      violations.push({
        file: filePath,
        severity: "error",
        message:
          'hooks.json must have root-level "hooks" wrapper: { "hooks": { "PreToolUse": [...] } }',
      });
      return violations;
    }

    // Validate hook event types
    for (const eventType of Object.keys(json.hooks)) {
      if (!VALID_HOOK_EVENTS.has(eventType)) {
        violations.push({
          file: filePath,
          severity: "error",
          message: `Invalid hook event type: "${eventType}". Valid types: ${[...VALID_HOOK_EVENTS].join(", ")}`,
        });
      }

      // Validate hook array structure
      const hooks = json.hooks[eventType];
      if (!Array.isArray(hooks)) {
        violations.push({
          file: filePath,
          severity: "error",
          message: `"${eventType}" must be an array of hook configurations`,
        });
        continue;
      }

      // Validate each hook entry
      for (let i = 0; i < hooks.length; i++) {
        const hook = hooks[i];
        if (!hook.matcher && !hook.hooks) {
          violations.push({
            file: filePath,
            severity: "warning",
            message: `${eventType}[${i}]: hook entry should have "matcher" and "hooks" fields`,
          });
        }
      }
    }
  } catch (error) {
    violations.push({
      file: filePath,
      severity: "error",
      message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  return violations;
}

/**
 * Validate a plugin.json file doesn't have hooks field.
 */
function validatePluginJson(filePath: string): Violation[] {
  const violations: Violation[] = [];

  try {
    const content = readFileSync(filePath, "utf-8");
    const json = JSON.parse(content);

    // plugin.json should NOT have "hooks" field - hooks are auto-discovered
    if (json.hooks !== undefined) {
      violations.push({
        file: filePath,
        severity: "error",
        message:
          'plugin.json should NOT have "hooks" field. Hooks are auto-discovered from hooks/hooks.json',
      });
    }
  } catch (error) {
    // JSON parse errors are handled by other validators
  }

  return violations;
}

/**
 * Find and validate all hooks-related files in a path.
 */
export async function lintHooks(searchPath: string): Promise<LintResult> {
  const violations: Violation[] = [];
  const resolvedPath = resolve(searchPath);

  // Find all hooks.json files
  const hooksGlob = new Glob("**/hooks/hooks.json");
  for await (const file of hooksGlob.scan({
    cwd: resolvedPath,
    absolute: true,
    onlyFiles: true,
  })) {
    if (file.includes("node_modules") || file.includes(".git")) continue;
    violations.push(...validateHooksJson(file));
  }

  // Find all plugin.json files and check they don't have hooks field
  const pluginGlob = new Glob("**/.claude-plugin/plugin.json");
  for await (const file of pluginGlob.scan({
    cwd: resolvedPath,
    absolute: true,
    onlyFiles: true,
  })) {
    if (file.includes("node_modules") || file.includes(".git")) continue;
    violations.push(...validatePluginJson(file));
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

  // Validate search path exists
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

  console.log(`\nLinting hooks in ${relativePath(resolve(searchPath))}...\n`);

  const result = await lintHooks(searchPath);

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
    console.log("✓ No hooks issues found\n");
  } else {
    console.log(`Found ${errors} error(s), ${warnings} warning(s)\n`);
  }

  process.exit(result.passed ? 0 : 1);
}

// Run if executed directly
if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
