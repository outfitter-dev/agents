#!/usr/bin/env bun
/**
 * Unified Claude Code Plugin Linter
 *
 * Runs all plugin-related linters and reports combined results.
 *
 * Usage:
 *   bun scripts/lint-claude-plugin.ts [options] [path]
 *
 * Options:
 *   --hooks     Only run hooks linter
 *   --skills    Only run skills linter
 *   --plugins   Only run plugins linter
 *   --help      Show this help message
 *
 * Examples:
 *   bun scripts/lint-claude-plugin.ts                # Run all linters
 *   bun scripts/lint-claude-plugin.ts --hooks        # Only lint hooks
 *   bun scripts/lint-claude-plugin.ts outfitter/     # Lint specific directory
 */

import { resolve } from "node:path";
import { statSync } from "node:fs";
import {
  lintHooks,
  lintSkills,
  lintPlugins,
  type HooksLintResult,
  type SkillsLintResult,
  type PluginsLintResult,
} from "./lint/claude-plugin";

type LintResult = HooksLintResult | SkillsLintResult | PluginsLintResult;

interface CombinedResult {
  passed: boolean;
  hooks: HooksLintResult | null;
  skills: SkillsLintResult | null;
  plugins: PluginsLintResult | null;
  totalErrors: number;
  totalWarnings: number;
}

function relativePath(absolutePath: string): string {
  return absolutePath.replace(process.cwd() + "/", "");
}

function printHelp(): void {
  console.log(`
Claude Code Plugin Linter

Usage:
  bun scripts/lint-claude-plugin.ts [options] [path]

Options:
  --hooks     Only run hooks linter
  --skills    Only run skills linter
  --plugins   Only run plugins linter
  --help      Show this help message

Examples:
  bun scripts/lint-claude-plugin.ts                # Run all linters
  bun scripts/lint-claude-plugin.ts --hooks        # Only lint hooks
  bun scripts/lint-claude-plugin.ts outfitter/     # Lint specific directory

Linters:
  hooks     Validates hooks.json format (must have "hooks" wrapper)
            Ensures plugin.json doesn't have hooks field (auto-discovery)

  skills    Validates SKILL.md frontmatter (name, description, version)
            Checks for redundant fields (user-invocable: true)
            Warns on file length > 500 lines

  plugins   Validates plugin.json required fields
            Validates marketplace.json structure
            Checks plugin directory conventions
`);
}

function printViolations(
  title: string,
  result: LintResult | null
): void {
  if (!result || result.violations.length === 0) return;

  console.log(`\n${title}`);
  console.log("─".repeat(50));

  // Group by file
  const byFile = new Map<string, typeof result.violations>();
  for (const v of result.violations) {
    const existing = byFile.get(v.file) || [];
    existing.push(v);
    byFile.set(v.file, existing);
  }

  for (const [file, violations] of byFile) {
    console.log(`\n${relativePath(file)}:`);
    for (const v of violations) {
      const prefix = v.severity === "error" ? "✗" : "△";
      console.log(`  ${prefix} ${v.message}`);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle help
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  // Parse options
  const runHooks = args.includes("--hooks");
  const runSkills = args.includes("--skills");
  const runPlugins = args.includes("--plugins");
  const runAll = !runHooks && !runSkills && !runPlugins;

  // Get search path
  const paths = args.filter((arg) => !arg.startsWith("--"));
  const searchPath = paths[0] || ".";

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

  const resolvedPath = resolve(searchPath);
  console.log(`\n🔍 Linting Claude Code plugins in ${relativePath(resolvedPath)}\n`);

  const result: CombinedResult = {
    passed: true,
    hooks: null,
    skills: null,
    plugins: null,
    totalErrors: 0,
    totalWarnings: 0,
  };

  // Run selected linters
  if (runAll || runHooks) {
    console.log("Checking hooks...");
    result.hooks = await lintHooks(searchPath);
    if (!result.hooks.passed) result.passed = false;
  }

  if (runAll || runSkills) {
    console.log("Checking skills...");
    result.skills = await lintSkills(searchPath);
    if (!result.skills.passed) result.passed = false;
  }

  if (runAll || runPlugins) {
    console.log("Checking plugins...");
    result.plugins = await lintPlugins(searchPath);
    if (!result.plugins.passed) result.passed = false;
  }

  // Count totals
  const allViolations = [
    ...(result.hooks?.violations || []),
    ...(result.skills?.violations || []),
    ...(result.plugins?.violations || []),
  ];

  result.totalErrors = allViolations.filter((v) => v.severity === "error").length;
  result.totalWarnings = allViolations.filter((v) => v.severity === "warning").length;

  // Print results
  printViolations("Hooks Issues", result.hooks);
  printViolations("Skills Issues", result.skills);
  printViolations("Plugins Issues", result.plugins);

  // Summary
  console.log("\n" + "═".repeat(50));

  if (result.totalErrors === 0 && result.totalWarnings === 0) {
    console.log("\n✅ All checks passed\n");
  } else if (result.totalErrors === 0) {
    console.log(`\n✓ Passed with ${result.totalWarnings} warning(s)\n`);
  } else {
    console.log(
      `\n❌ Failed: ${result.totalErrors} error(s), ${result.totalWarnings} warning(s)\n`
    );
  }

  process.exit(result.passed ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
