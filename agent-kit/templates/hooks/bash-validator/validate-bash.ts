#!/usr/bin/env bun

/**
 * Pre-Tool-Use Hook: Validate bash commands before execution
 * This hook blocks dangerous bash commands and suggests safer alternatives
 */

import { stderr, stdin, stdout } from "node:process";

interface HookInput {
	session_id: string;
	transcript_path: string;
	cwd: string;
	hook_event_name: string;
	tool_name: string;
	tool_input: {
		command?: string;
		description?: string;
	};
}

// Validation rules: [regex, error message, suggested alternative]
const VALIDATION_RULES: [RegExp, string, string][] = [
	[
		/\brm\s+-rf\s+\/(?:\s|$)/,
		"Extremely dangerous: 'rm -rf /' would delete the entire filesystem",
		"Specify the exact directory to delete, never use '/' as target",
	],
	[
		/\b(grep|find)\b(?!.*\|)/,
		"Prefer 'rg' (ripgrep) for faster, better search",
		"Use Grep tool or 'rg' command instead of 'grep' or 'find'",
	],
	[
		/>\s*\/dev\/sda/,
		"Dangerous: Writing directly to block device",
		"This could corrupt the disk. Verify you meant to do this.",
	],
	[
		/:()\s*{\s*:|;}\s*;/,
		"Fork bomb detected: This will crash the system",
		"Remove this malicious command",
	],
	[
		/mkfs\./,
		"Dangerous: Creating filesystem will destroy data",
		"Ensure you're targeting the correct device",
	],
	[
		/dd\s+if=.*\s+of=\/dev\//,
		"Dangerous: Writing to block device with dd",
		"Verify the target device is correct before proceeding",
	],
];

// Read stdin
const chunks: Buffer[] = [];
for await (const chunk of stdin) {
	chunks.push(chunk);
}

const input: HookInput = JSON.parse(Buffer.concat(chunks).toString());

// Extract command
const command = input.tool_input?.command;

if (!command) {
	stderr.write("No command provided\n");
	process.exit(1);
}

// Validate against rules
const issues: string[] = [];

for (const [pattern, message, suggestion] of VALIDATION_RULES) {
	if (pattern.test(command)) {
		issues.push(`❌ ${message}\n   Suggestion: ${suggestion}`);
	}
}

// If issues found, block execution
if (issues.length > 0) {
	stderr.write("BLOCKED: Dangerous bash command detected\n\n");
	stderr.write(`Command: ${command}\n\n`);
	stderr.write("Issues:\n");
	for (const issue of issues) {
		stderr.write(`${issue}\n\n`);
	}
	stderr.write("Please revise the command and try again.\n");
	process.exit(2); // Exit 2 = block operation and show error to Claude
}

// Additional warnings (non-blocking)
const warnings: string[] = [];

// Warn about sudo usage
if (/\bsudo\b/.test(command)) {
	warnings.push("⚠️  Warning: Command uses 'sudo' (elevated privileges)");
}

// Warn about curl | sh pattern
if (/curl.*\|.*sh/.test(command) || /wget.*\|.*sh/.test(command)) {
	warnings.push("⚠️  Warning: Piping to shell is risky - verify the source");
}

if (warnings.length > 0) {
	stdout.write(`${warnings.join("\n")}\n`);
}

// Approve
stdout.write(`✓ Bash command validated: ${command.slice(0, 60)}...\n`);
process.exit(0);
