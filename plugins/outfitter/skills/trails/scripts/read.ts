#!/usr/bin/env bun

/**
 * Read trail notes
 *
 * Read recent handoffs, logs, or all notes from the trail.
 * Supports filtering by type, date range, and output formatting.
 *
 * @example Read today's handoffs
 * bun read.ts --type handoff
 *
 * @example Read last 3 days of all notes
 * bun read.ts --days 3
 *
 * @example Read recent logs with limited output
 * bun read.ts --type log --lines 50
 *
 * @module trail/read
 */

import { parseArgs } from "util";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { formatDateDir, getTrailRoot } from "./context.ts";
import { parseFilename } from "./filename.ts";

/**
 * Type of trail notes to filter by.
 */
type NoteType = "handoff" | "log" | "all";

/**
 * Options for reading trail notes.
 */
interface ReadOptions {
	/** Filter by note type */
	type: NoteType;
	/** Number of days to look back */
	days: number;
	/** Max lines to output (null for unlimited) */
	lines: number | null;
	/** Whether to strip YAML frontmatter */
	noFrontmatter: boolean;
}

/**
 * Get recent date directories
 */
function getRecentDates(days: number): string[] {
	const dates: string[] = [];
	const now = new Date();

	for (let i = 0; i < days; i++) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		dates.push(formatDateDir(d));
	}

	return dates;
}

/**
 * Find all note files in a directory (recursive for subagent dirs)
 */
function findNotes(
	baseDir: string,
	type: NoteType,
	prefix = "",
): { path: string; filename: string }[] {
	const notes: { path: string; filename: string }[] = [];

	if (!existsSync(baseDir)) return notes;

	const entries = readdirSync(baseDir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(baseDir, entry.name);

		if (entry.isDirectory()) {
			// Recurse into subagent directories
			notes.push(...findNotes(fullPath, type, entry.name));
		} else if (entry.name.endsWith(".md")) {
			const parsed = parseFilename(entry.name);
			if (!parsed) continue;

			// Filter by type
			if (type === "handoff" && parsed.prefix !== "handoff") continue;
			if (type === "log" && parsed.prefix === "handoff") continue;

			notes.push({
				path: fullPath,
				filename: prefix ? `${prefix}/${entry.name}` : entry.name,
			});
		}
	}

	// Sort by filename (which starts with timestamp)
	return notes.sort((a, b) => a.filename.localeCompare(b.filename));
}

/**
 * Strip YAML frontmatter from content
 */
function stripFrontmatter(content: string): string {
	const lines = content.split("\n");
	if (lines[0] !== "---") return content;

	let endIndex = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i] === "---") {
			endIndex = i;
			break;
		}
	}

	if (endIndex === -1) return content;

	let startIndex = endIndex + 1;
	while (startIndex < lines.length && lines[startIndex].trim() === "") {
		startIndex++;
	}

	return lines.slice(startIndex).join("\n");
}

/**
 * Limit output to N lines
 */
function limitLines(
	content: string,
	maxLines: number,
): { output: string; truncated: number } {
	const lines = content.split("\n");

	if (lines.length <= maxLines) {
		return { output: content, truncated: 0 };
	}

	const output = lines.slice(0, maxLines).join("\n");
	const truncated = lines.length - maxLines;

	return { output, truncated };
}

/**
 * Parse CLI arguments
 */
function parseCliArgs(): ReadOptions {
	const { values } = parseArgs({
		args: Bun.argv.slice(2),
		options: {
			type: {
				type: "string",
				short: "t",
				default: "all",
			},
			days: {
				type: "string",
				short: "d",
				default: "1",
			},
			lines: {
				type: "string",
				short: "n",
			},
			"no-frontmatter": {
				type: "boolean",
				short: "f",
				default: false,
			},
			help: {
				type: "boolean",
				short: "h",
			},
		},
		strict: true,
		allowPositionals: false,
	});

	if (values.help) {
		console.log(`
Usage: bun read.ts [options]

Options:
  -t, --type <type>     Note type: handoff, log, all (default: all)
  -d, --days <n>        Number of days to include (default: 1)
  -n, --lines <n>       Max lines to output
  -f, --no-frontmatter  Strip YAML frontmatter
  -h, --help            Show this help message

Examples:
  bun read.ts                           # Today's notes
  bun read.ts --type handoff            # Today's handoffs only
  bun read.ts --days 3                  # Last 3 days
  bun read.ts --type log --lines 100    # Recent logs, max 100 lines
`);
		process.exit(0);
	}

	const type = values.type as NoteType;
	if (!["handoff", "log", "all"].includes(type)) {
		console.error(`Error: Invalid type "${type}". Use: handoff, log, all`);
		process.exit(1);
	}

	return {
		type,
		days: parseInt(values.days ?? "1", 10),
		lines: values.lines ? parseInt(values.lines, 10) : null,
		noFrontmatter: values["no-frontmatter"] ?? false,
	};
}

/**
 * Main entry point
 */
async function main() {
	const options = parseCliArgs();
	const trailRoot = getTrailRoot();
	const notesRoot = join(trailRoot, ".trail", "notes");

	// Find notes for recent dates
	const dates = getRecentDates(options.days);
	const allNotes: { path: string; filename: string; date: string }[] = [];

	for (const date of dates) {
		const dateDir = join(notesRoot, date);
		const notes = findNotes(dateDir, options.type);
		allNotes.push(...notes.map((n) => ({ ...n, date })));
	}

	if (allNotes.length === 0) {
		const typeLabel = options.type === "all" ? "notes" : `${options.type}s`;
		console.error(`No ${typeLabel} found for the last ${options.days} day(s)`);
		process.exit(1);
	}

	// Read and combine notes
	let combined = "";
	let currentDate = "";

	for (const note of allNotes) {
		// Add date header when date changes
		if (note.date !== currentDate) {
			if (combined) combined += "\n\n---\n\n";
			combined += `## ${note.date}\n\n`;
			currentDate = note.date;
		}

		let content = await Bun.file(note.path).text();

		if (options.noFrontmatter) {
			content = stripFrontmatter(content);
		}

		combined += `**File**: ${note.filename}\n\n${content.trim()}\n\n`;
	}

	// Apply line limit
	if (options.lines !== null) {
		const { output, truncated } = limitLines(combined, options.lines);
		console.log(output);
		if (truncated > 0) {
			console.error(`\n... (${truncated} more lines)`);
		}
	} else {
		console.log(combined);
	}
}

main().catch(console.error);
