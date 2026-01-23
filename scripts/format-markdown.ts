#!/usr/bin/env bun
/**
 * Unified markdown formatter for Claude Code files.
 *
 * Runs formatting tools in sequence:
 * 1. format-markdown-tables.ts - Table alignment and separator spacing
 * 2. Custom fixes (XML tag spacing, etc.)
 * 3. markdownlint-cli2 --fix - Standard markdown linting
 *
 * Usage:
 *   bun scripts/format-markdown.ts [path]           # Format files
 *   bun scripts/format-markdown.ts --check [path]   # Check only (exit 1 if issues)
 *   bun scripts/format-markdown.ts --dry-run [path] # Show what would change
 *
 * Examples:
 *   bun scripts/format-markdown.ts                           # Format all .md files
 *   bun scripts/format-markdown.ts outfitter/                  # Format specific dir
 *   bun scripts/format-markdown.ts path/to/file.md           # Format single file
 *   bun scripts/format-markdown.ts --check                   # CI mode
 */

import { spawn } from "bun";
import { statSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";

const SCRIPTS_DIR = dirname(new URL(import.meta.url).pathname);

interface FormatResult {
  step: string;
  success: boolean;
  output: string;
  changed: boolean;
}

async function runCommand(
  cmd: string[],
  description: string
): Promise<FormatResult> {
  const proc = spawn({
    cmd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  const output = stdout + stderr;
  const changed = output.includes("Fixed") || output.includes("fixed");

  return {
    step: description,
    success: exitCode === 0,
    output: output.trim(),
    changed,
  };
}

async function checkToolAvailable(tool: string): Promise<boolean> {
  try {
    const proc = spawn({
      cmd: ["which", tool],
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

async function formatTables(
  path: string,
  dryRun: boolean
): Promise<FormatResult> {
  const script = join(SCRIPTS_DIR, "format-markdown-tables.ts");
  const args = ["bun", script];

  if (!dryRun) {
    args.push("--fix");
  }
  args.push(path);

  return runCommand(args, "Table formatting");
}

async function formatXmlTags(
  path: string,
  dryRun: boolean
): Promise<FormatResult> {
  const script = join(SCRIPTS_DIR, "lint-xml-tags.ts");

  if (!existsSync(script)) {
    return {
      step: "XML tag formatting",
      success: true,
      output: "Skipped (script not found)",
      changed: false,
    };
  }

  const args = ["bun", script];
  if (!dryRun) {
    args.push("--fix");
  }
  args.push(path);

  return runCommand(args, "XML tag formatting");
}

async function runMarkdownlint(
  path: string,
  dryRun: boolean,
  isFile: boolean
): Promise<FormatResult> {
  // Check if markdownlint-cli2 is available
  const hasMarkdownlint = await checkToolAvailable("markdownlint-cli2");

  if (!hasMarkdownlint) {
    return {
      step: "markdownlint-cli2",
      success: true,
      output: "Skipped (markdownlint-cli2 not installed)\nInstall: bun add -g markdownlint-cli2",
      changed: false,
    };
  }

  const args = ["markdownlint-cli2"];
  if (!dryRun) {
    args.push("--fix");
  }

  // Always ignore config globs - we specify our own targets
  args.push("--no-globs");

  // Handle path - literal file (: prefix) or glob pattern for directories
  if (isFile) {
    args.push(`:${path}`); // : prefix = literal file path
  } else {
    args.push(join(path, "**/*.md"));
  }

  return runCommand(args, "markdownlint-cli2");
}

function printResult(result: FormatResult, verbose: boolean) {
  const icon = result.success ? "✓" : "✗";
  const color = result.success ? "\x1b[32m" : "\x1b[31m";
  const reset = "\x1b[0m";

  console.log(`${color}${icon}${reset} ${result.step}`);

  if (verbose || !result.success) {
    if (result.output) {
      const indented = result.output
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n");
      console.log(indented);
    }
  } else if (result.changed) {
    console.log("  Files formatted");
  }
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const dryRun = args.includes("--dry-run") || check;
  const verbose = args.includes("--verbose") || args.includes("-v");
  const paths = args.filter((arg) => !arg.startsWith("-"));
  const targetPath = resolve(paths[0] || ".");

  // Detect if target is a file or directory
  let isFile = false;
  try {
    const stat = statSync(targetPath);
    isFile = stat.isFile();
  } catch {
    console.error(`Error: Path not found: ${targetPath}`);
    process.exit(1);
  }

  const mode = check ? "check" : dryRun ? "dry-run" : "format";
  console.log(`\x1b[34mMarkdown Formatter\x1b[0m (${mode} mode)`);
  console.log(`Target: ${targetPath}\n`);

  const results: FormatResult[] = [];

  // Step 1: Format tables
  console.log("Running formatters...\n");
  results.push(await formatTables(targetPath, dryRun));
  printResult(results[results.length - 1], verbose);

  // Step 2: Format XML tags
  results.push(await formatXmlTags(targetPath, dryRun));
  printResult(results[results.length - 1], verbose);

  // Step 3: Run markdownlint
  results.push(await runMarkdownlint(targetPath, dryRun, isFile));
  printResult(results[results.length - 1], verbose);

  // Summary
  console.log("");
  const failures = results.filter((r) => !r.success);
  const changes = results.filter((r) => r.changed);

  if (failures.length > 0) {
    console.log(`\x1b[31m✗ ${failures.length} step(s) failed\x1b[0m`);
    process.exit(1);
  } else if (check && changes.length > 0) {
    console.log(`\x1b[33m⚠ ${changes.length} step(s) would make changes\x1b[0m`);
    console.log("Run without --check to apply fixes");
    process.exit(1);
  } else if (changes.length > 0) {
    console.log(`\x1b[32m✓ Formatting complete (${changes.length} step(s) made changes)\x1b[0m`);
  } else {
    console.log("\x1b[32m✓ All files formatted correctly\x1b[0m");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
