#!/usr/bin/env bun
/**
 * detect.ts - Detect available project tools
 *
 * Quick pre-flight check for sitrep service availability.
 * Returns JSON with boolean availability for each tool.
 *
 * Usage:
 *   ./detect.ts              # JSON output
 *   ./detect.ts --format=text # Human-readable output
 */

import { parseArgs } from "node:util";

interface DetectResult {
	graphite: boolean;
	github: boolean;
	linear: boolean;
	beads: boolean;
	details: {
		graphite?: string;
		github?: string;
		linear?: string;
		beads?: string;
	};
}

const { values } = parseArgs({
	args: Bun.argv.slice(2),
	options: {
		format: { type: "string", short: "f", default: "json" },
		help: { type: "boolean", short: "h" },
	},
});

if (values.help) {
	console.log(`
detect.ts - Detect available project tools for sitrep

Usage:
  ./detect.ts [options]

Options:
  -f, --format <fmt>   Output format: json, text [default: json]
  -h, --help          Show this help

Output:
  JSON object with boolean availability for each service:
  - graphite: gt CLI installed and initialized
  - github: gh CLI installed and authenticated
  - linear: Linear MCP available (checks for mcp tools)
  - beads: .beads/ directory exists in current project
`);
	process.exit(0);
}

async function commandExists(cmd: string): Promise<boolean> {
	const proc = Bun.spawn(["command", "-v", cmd], {
		stdout: "pipe",
		stderr: "pipe",
	});
	await proc.exited;
	return proc.exitCode === 0;
}

async function runCommand(
	cmd: string[],
): Promise<{ success: boolean; output: string }> {
	const proc = Bun.spawn(cmd, {
		stdout: "pipe",
		stderr: "pipe",
	});
	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();
	await proc.exited;
	return {
		success: proc.exitCode === 0,
		output: stdout || stderr,
	};
}

async function detectGraphite(): Promise<{ available: boolean; detail?: string }> {
	if (!(await commandExists("gt"))) {
		return { available: false, detail: "gt CLI not installed" };
	}

	// Check if initialized in this repo
	const { success } = await runCommand(["gt", "state"]);
	if (!success) {
		return { available: false, detail: "gt not initialized in this repo" };
	}

	return { available: true, detail: "gt CLI ready" };
}

async function detectGitHub(): Promise<{ available: boolean; detail?: string }> {
	if (!(await commandExists("gh"))) {
		return { available: false, detail: "gh CLI not installed" };
	}

	// Check auth status
	const { success, output } = await runCommand(["gh", "auth", "status"]);
	if (!success) {
		return { available: false, detail: "gh not authenticated" };
	}

	// Extract account info if available
	const match = output.match(/Logged in to .+ as (\S+)/);
	const user = match ? match[1] : "authenticated";
	return { available: true, detail: `gh CLI ready (${user})` };
}

async function detectLinear(): Promise<{ available: boolean; detail?: string }> {
	// Linear detection is tricky - we check for the MCP tool availability
	// In Claude Code context, this would be detected via tool availability
	// For script context, we check if claude CLI exists and has linear configured

	if (!(await commandExists("claude"))) {
		return { available: false, detail: "claude CLI not installed" };
	}

	// We can't easily detect MCP availability from a script
	// Return unknown/check-at-runtime
	return { available: false, detail: "Linear MCP - check at runtime" };
}

async function detectBeads(): Promise<{ available: boolean; detail?: string }> {
	const beadsDir = Bun.file(".beads/metadata.json");
	const exists = await beadsDir.exists();

	if (!exists) {
		return { available: false, detail: ".beads/ not initialized" };
	}

	return { available: true, detail: "beads initialized" };
}

async function detect(): Promise<DetectResult> {
	const [graphite, github, linear, beads] = await Promise.all([
		detectGraphite(),
		detectGitHub(),
		detectLinear(),
		detectBeads(),
	]);

	return {
		graphite: graphite.available,
		github: github.available,
		linear: linear.available,
		beads: beads.available,
		details: {
			graphite: graphite.detail,
			github: github.detail,
			linear: linear.detail,
			beads: beads.detail,
		},
	};
}

function formatText(result: DetectResult): string {
	const lines: string[] = ["PROJECT TOOLS", ""];

	const status = (available: boolean) => (available ? "✓" : "✗");

	lines.push(`${status(result.graphite)} Graphite: ${result.details.graphite}`);
	lines.push(`${status(result.github)} GitHub: ${result.details.github}`);
	lines.push(`${status(result.linear)} Linear: ${result.details.linear}`);
	lines.push(`${status(result.beads)} Beads: ${result.details.beads}`);

	const available = [
		result.graphite && "graphite",
		result.github && "github",
		result.linear && "linear",
		result.beads && "beads",
	].filter(Boolean);

	lines.push("");
	lines.push(
		available.length > 0
			? `Available: ${available.join(", ")}`
			: "No tools detected",
	);

	return lines.join("\n");
}

async function main() {
	const result = await detect();

	if (values.format === "text") {
		console.log(formatText(result));
	} else {
		console.log(JSON.stringify(result, null, 2));
	}
}

main().catch((err) => {
	console.error("Error:", err.message);
	process.exit(1);
});
