#!/usr/bin/env bun

/**
 * test-hook.ts - Test Claude Code hook scripts with sample input
 *
 * Usage:
 *   ./test-hook.ts <hook-script> [options]
 *   ./test-hook.ts validate-bash.sh --event PreToolUse --tool Bash
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "bun";

// ANSI colors
const colors = {
	red: "\x1b[0;31m",
	green: "\x1b[0;32m",
	yellow: "\x1b[1;33m",
	blue: "\x1b[0;34m",
	reset: "\x1b[0m",
};

// Hook input interface
interface HookInput {
	session_id: string;
	transcript_path: string;
	cwd: string;
	hook_event_name: string;
	tool_name?: string;
	tool_input?: Record<string, unknown>;
	reason?: string;
}

// Test options
interface TestOptions {
	event: string;
	tool?: string;
	filePath?: string;
	content?: string;
	command?: string;
	reason?: string;
	customInput?: string;
	verbose: boolean;
	timeout: number;
}

// Show help
function showHelp() {
	console.log(`Usage: test-hook.ts <hook-script> [options]

Test Claude Code hook scripts with sample input.

Arguments:
  hook-script         Path to hook script to test

Options:
  -e, --event         Event type (default: PreToolUse)
                      PreToolUse, PostToolUse, UserPromptSubmit, Notification,
                      Stop, SubagentStop, PreCompact, SessionStart, SessionEnd
  -t, --tool          Tool name (e.g., Write, Edit, Bash)
  -f, --file          File path for tool input
  -c, --content       File content for Write tool
  --command           Command for Bash tool
  -r, --reason        Reason for session events
  --input             Custom JSON input (overrides all other options)
  --timeout           Timeout in milliseconds (default: 5000)
  -v, --verbose       Verbose output
  -h, --help          Show this help

Examples:
  # Test PreToolUse hook with Bash tool
  ./test-hook.ts validate-bash.sh -e PreToolUse -t Bash --command "rm -rf /"

  # Test PostToolUse hook with Write tool
  ./test-hook.ts format-code.sh -e PostToolUse -t Write -f test.ts -c "console.log('test');"

  # Test with custom JSON input
  ./test-hook.ts my-hook.sh --input '{"tool_name":"Write","tool_input":{"file_path":"test.txt"}}'

  # Test SessionStart hook
  ./test-hook.ts welcome.sh -e SessionStart -r startup

Event Types:
  PreToolUse        - Before tool execution (can block)
  PostToolUse       - After tool completes successfully
  UserPromptSubmit  - When user submits prompt
  Notification      - When notification sent
  Stop              - When main agent finishes
  SubagentStop      - When subagent finishes
  PreCompact        - Before conversation compacts
  SessionStart      - When session starts/resumes
  SessionEnd        - When session ends
`);
}

// Parse arguments
function parseArgs(): { scriptPath: string; options: TestOptions } {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
		showHelp();
		process.exit(0);
	}

	const scriptPath = args[0];
	const options: TestOptions = {
		event: "PreToolUse",
		verbose: false,
		timeout: 5000,
	};

	for (let i = 1; i < args.length; i++) {
		const arg = args[i];
		const next = args[i + 1];

		switch (arg) {
			case "-e":
			case "--event":
				options.event = next;
				i++;
				break;
			case "-t":
			case "--tool":
				options.tool = next;
				i++;
				break;
			case "-f":
			case "--file":
				options.filePath = next;
				i++;
				break;
			case "-c":
			case "--content":
				options.content = next;
				i++;
				break;
			case "--command":
				options.command = next;
				i++;
				break;
			case "-r":
			case "--reason":
				options.reason = next;
				i++;
				break;
			case "--input":
				options.customInput = next;
				i++;
				break;
			case "--timeout": {
				const parsed = parseInt(next, 10);
				if (Number.isNaN(parsed) || parsed <= 0) {
					console.error(
						`${colors.red}Error: --timeout must be a positive number${colors.reset}`,
					);
					process.exit(1);
				}
				options.timeout = parsed;
				i++;
				break;
			}
			case "-v":
			case "--verbose":
				options.verbose = true;
				break;
			default:
				console.error(
					`${colors.red}Error: Unknown option ${arg}${colors.reset}`,
				);
				process.exit(1);
		}
	}

	return { scriptPath, options };
}

// Generate sample input based on event and options
function generateInput(options: TestOptions): HookInput {
	const baseInput: HookInput = {
		session_id: `test-session-${Date.now()}`,
		transcript_path: "/tmp/transcript.jsonl",
		cwd: process.cwd(),
		hook_event_name: options.event,
	};

	// Add tool-specific fields
	if (options.tool) {
		baseInput.tool_name = options.tool;

		// Generate appropriate tool_input
		switch (options.tool) {
			case "Write":
				baseInput.tool_input = {
					file_path: options.filePath || "/tmp/test-file.txt",
					content: options.content || "Test content",
				};
				break;

			case "Edit":
				baseInput.tool_input = {
					file_path: options.filePath || "/tmp/test-file.txt",
					old_string: "old",
					new_string: "new",
					replace_all: false,
				};
				break;

			case "Read":
				baseInput.tool_input = {
					file_path: options.filePath || "/tmp/test-file.txt",
					offset: 0,
					limit: 2000,
				};
				break;

			case "Bash":
				baseInput.tool_input = {
					command: options.command || "echo 'test'",
					description: "Test bash command",
				};
				break;

			case "Grep":
				baseInput.tool_input = {
					pattern: "test",
					path: options.filePath || ".",
				};
				break;

			default:
				baseInput.tool_input = {
					file_path: options.filePath,
				};
		}
	}

	// Add reason for session events
	if (["SessionStart", "SessionEnd", "PreCompact"].includes(options.event)) {
		baseInput.reason = options.reason || "test";
	}

	return baseInput;
}

// Run hook script with input
async function runHook(
	scriptPath: string,
	input: HookInput,
	timeout: number,
	verbose: boolean,
): Promise<{
	exitCode: number | null;
	stdout: string;
	stderr: string;
	timedOut: boolean;
}> {
	const inputJson = JSON.stringify(input, null, 2);

	if (verbose) {
		console.log(`${colors.blue}Input JSON:${colors.reset}`);
		console.log(inputJson);
		console.log();
	}

	// Spawn process
	const proc = spawn({
		cmd: [scriptPath],
		stdin: "pipe",
		stdout: "pipe",
		stderr: "pipe",
		env: {
			...process.env,
			CLAUDE_PROJECT_DIR: process.cwd(),
		},
	});

	// Write input to stdin
	proc.stdin.write(inputJson);
	proc.stdin.end();

	let timedOut = false;

	const timeoutId = setTimeout(() => {
		timedOut = true;
		proc.kill();
	}, timeout);

	try {
		const result = await proc.exited;
		clearTimeout(timeoutId);

		const stdout = await new Response(proc.stdout).text();
		const stderr = await new Response(proc.stderr).text();

		return {
			exitCode: timedOut ? null : result,
			stdout,
			stderr,
			timedOut,
		};
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

// Main function
async function main() {
	const { scriptPath, options } = parseArgs();

	// Validate script path
	const resolvedPath = resolve(scriptPath);
	if (!existsSync(resolvedPath)) {
		console.error(
			`${colors.red}Error: Script not found: ${scriptPath}${colors.reset}`,
		);
		process.exit(1);
	}

	// Check if executable
	const stats = statSync(resolvedPath);
	if (!(stats.mode & 0o111)) {
		console.error(
			`${colors.yellow}Warning: Script is not executable${colors.reset}`,
		);
		console.error(`Run: chmod +x ${scriptPath}`);
		console.log();
	}

	console.log(
		`${colors.blue}Testing hook script: ${scriptPath}${colors.reset}`,
	);
	console.log();

	// Generate or parse input
	let input: HookInput;
	if (options.customInput) {
		try {
			input = JSON.parse(options.customInput);
			console.log(`${colors.blue}Using custom input${colors.reset}`);
		} catch (_error) {
			console.error(
				`${colors.red}Error: Invalid JSON in --input${colors.reset}`,
			);
			process.exit(1);
		}
	} else {
		input = generateInput(options);
		console.log(
			`${colors.blue}Generated input for ${options.event}${options.tool ? ` with ${options.tool}` : ""}${colors.reset}`,
		);
	}

	if (options.verbose) {
		console.log();
	}

	// Run hook
	console.log(`${colors.blue}Running hook...${colors.reset}`);
	console.log();

	const startTime = Date.now();
	let result: Awaited<ReturnType<typeof runHook>>;

	try {
		result = await runHook(
			resolvedPath,
			input,
			options.timeout,
			options.verbose,
		);
	} catch (error) {
		console.error(`${colors.red}✗ Hook execution failed${colors.reset}`);
		console.error(error);
		process.exit(1);
	}

	const duration = Date.now() - startTime;

	// Display results
	console.log(`${colors.blue}=== Results ===${colors.reset}`);
	console.log();

	// Handle timeout
	if (result.timedOut) {
		console.log(
			`${colors.red}✗ Hook timed out after ${options.timeout}ms${colors.reset}`,
		);
		console.log();
	}

	// Exit code
	const exitCode = result.exitCode ?? -1;
	let exitCodeColor = colors.green;
	let exitCodeLabel = "Success";

	if (result.timedOut) {
		exitCodeColor = colors.red;
		exitCodeLabel = "Timeout (killed)";
	} else if (exitCode === 2) {
		exitCodeColor = colors.red;
		exitCodeLabel = "Blocked (exit 2)";
	} else if (exitCode !== 0) {
		exitCodeColor = colors.yellow;
		exitCodeLabel = "Warning (non-zero)";
	}

	console.log(
		`${exitCodeColor}Exit Code: ${exitCode} - ${exitCodeLabel}${colors.reset}`,
	);
	console.log(`Duration: ${duration}ms`);
	console.log();

	// Stdout
	if (result.stdout) {
		console.log(`${colors.green}Stdout:${colors.reset}`);
		console.log(result.stdout);
		console.log();
	} else {
		console.log(`${colors.blue}Stdout: (empty)${colors.reset}`);
		console.log();
	}

	// Stderr
	if (result.stderr) {
		console.log(`${colors.yellow}Stderr:${colors.reset}`);
		console.log(result.stderr);
		console.log();
	} else {
		console.log(`${colors.blue}Stderr: (empty)${colors.reset}`);
		console.log();
	}

	// Summary
	console.log(`${colors.blue}=== Summary ===${colors.reset}`);
	console.log();

	if (exitCode === 0) {
		console.log(`${colors.green}✓ Hook executed successfully${colors.reset}`);
		if (result.stdout) {
			console.log("  Stdout will be shown to user");
		}
	} else if (exitCode === 2) {
		console.log(
			`${colors.red}✗ Hook blocked operation (exit 2)${colors.reset}`,
		);
		if (result.stderr) {
			console.log("  Stderr will be shown to Claude");
		}
	} else {
		console.log(
			`${colors.yellow}⚠ Hook returned warning (exit ${exitCode})${colors.reset}`,
		);
		if (result.stderr) {
			console.log("  Stderr will be shown to user");
		}
	}

	// Performance warning
	if (duration > 1000) {
		console.log(
			`${colors.yellow}⚠ Hook took ${duration}ms (>1s)${colors.reset}`,
		);
		console.log("  Consider optimizing for faster execution");
	}

	console.log();

	// Exit with same code as hook
	process.exit(exitCode === 0 ? 0 : 1);
}

// Run main
main().catch((error) => {
	console.error(`${colors.red}Fatal error:${colors.reset}`, error);
	process.exit(1);
});
