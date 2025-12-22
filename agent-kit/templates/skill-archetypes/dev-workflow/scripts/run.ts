#!/usr/bin/env bun

/**
 * {{WORKFLOW}} Workflow Runner
 *
 * Usage: bun run run.ts <command> [options]
 */

import { $ } from "bun";

interface RunOptions {
  dryRun: boolean;
  verbose: boolean;
  force: boolean;
}

interface RunResult {
  status: "success" | "error" | "dry-run";
  message: string;
  details?: unknown;
}

function parseOptions(args: string[]): {
  command: string;
  options: RunOptions;
  args: string[];
} {
  const options: RunOptions = {
    dryRun: false,
    verbose: false,
    force: false,
  };

  const positional: string[] = [];

  for (const arg of args) {
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--verbose") options.verbose = true;
    else if (arg === "--force") options.force = true;
    else positional.push(arg);
  }

  return {
    command: positional[0] || "",
    options,
    args: positional.slice(1),
  };
}

async function confirm(message: string): Promise<boolean> {
  process.stdout.write(`${message} [y/N] `);
  const response = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });
  return response.toLowerCase() === "y";
}

async function run(
  cmd: string,
  options: RunOptions
): Promise<{ stdout: string; exitCode: number }> {
  if (options.verbose) console.error(`[verbose] Running: ${cmd}`);
  if (options.dryRun) {
    console.error(`[dry-run] Would execute: ${cmd}`);
    return { stdout: "", exitCode: 0 };
  }

  const result = await $`${{ raw: cmd }}`.quiet();
  return { stdout: result.stdout.toString(), exitCode: result.exitCode };
}

// Command implementations — replace with actual logic

async function exampleSafeCommand(options: RunOptions): Promise<RunResult> {
  const { stdout } = await run("echo 'This is safe'", options);

  return {
    status: options.dryRun ? "dry-run" : "success",
    message: "Safe command completed",
    details: { output: stdout.trim() },
  };
}

async function exampleDestructiveCommand(
  options: RunOptions
): Promise<RunResult> {
  if (!options.force && !options.dryRun) {
    const confirmed = await confirm(
      "This will do something destructive. Continue?"
    );
    if (!confirmed) {
      return { status: "error", message: "Aborted by user" };
    }
  }

  const { stdout } = await run("echo 'Doing destructive thing'", options);

  return {
    status: options.dryRun ? "dry-run" : "success",
    message: "Destructive command completed",
    details: { output: stdout.trim() },
  };
}

// CLI handler
async function main() {
  const { command, options } = parseOptions(process.argv.slice(2));

  let result: RunResult;

  try {
    switch (command) {
      case "safe":
        result = await exampleSafeCommand(options);
        break;
      case "destructive":
        result = await exampleDestructiveCommand(options);
        break;
      default:
        result = {
          status: "error",
          message: JSON.stringify({
            usage: "run.ts <safe|destructive> [--dry-run] [--verbose] [--force]",
            commands: {
              safe: "Run a safe operation",
              destructive: "Run a destructive operation (requires confirmation)",
            },
            options: {
              "--dry-run": "Preview without executing",
              "--verbose": "Show detailed output",
              "--force": "Skip confirmations",
            },
          }),
        };
    }
  } catch (error) {
    result = {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "error" ? 1 : 0);
}

main();
