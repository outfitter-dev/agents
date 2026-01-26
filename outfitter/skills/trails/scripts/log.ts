#!/usr/bin/env bun

/**
 * Create a log note
 *
 * Logs are freeform timestamped notes for capturing research, findings,
 * and other session work. Designed to be composable with other skills/commands.
 *
 * @example Basic log with slug
 * bun log.ts --slug api-research --session f4b8aa3a
 *
 * @example With parent session (subagent)
 * bun log.ts --slug findings --session b2c3d4e5 --parent f4b8aa3a
 *
 * @example With title
 * bun log.ts --slug api-research --title "API Research Notes" --session f4b8aa3a
 *
 * @module trail/log
 */

import { parseArgs } from "util";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import {
	buildContext,
	formatISO,
	formatTime,
	getNotesDir,
} from "./context.ts";
import { buildFilename, slugify, truncateSessionId } from "./filename.ts";

/**
 * Options for creating a log note.
 */
interface LogOptions {
	/** URL-safe slug for the log */
	slug: string;
	/** Current session ID */
	sessionId: string;
	/** Parent session ID if this is a subagent */
	parentSessionId?: string;
	/** Custom title (defaults to derived from slug) */
	title?: string;
}

/**
 * Generate log content with frontmatter
 */
function generateLogContent(
	ctx: ReturnType<typeof buildContext>,
	options: LogOptions,
): string {
	const time = formatTime(ctx.timestamp);
	const created = formatISO(ctx.timestamp);
	const sessionShort = truncateSessionId(options.sessionId);

	// Use title if provided, otherwise derive from slug
	const title =
		options.title ??
		options.slug
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

	let frontmatter = `---
created: ${created}
type: log
session: ${options.sessionId}`;

	if (options.parentSessionId) {
		frontmatter += `\nparent-session: ${options.parentSessionId}`;
	}

	frontmatter += `
tags: []
---

# ${title}

> ${ctx.dateDir} ${time} · Session \`${sessionShort}\`

`;

	return frontmatter;
}

/**
 * Parse CLI arguments
 */
function parseCliArgs(): LogOptions {
	const { values } = parseArgs({
		args: Bun.argv.slice(2),
		options: {
			slug: {
				type: "string",
				short: "l",
			},
			session: {
				type: "string",
				short: "s",
			},
			parent: {
				type: "string",
				short: "p",
			},
			title: {
				type: "string",
				short: "t",
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
Usage: bun log.ts [options]

Options:
  -l, --slug <slug>     Slug for the log (required)
  -s, --session <id>    Session ID (required)
  -p, --parent <id>     Parent session ID (if subagent)
  -t, --title <title>   Custom title (default: derived from slug)
  -h, --help            Show this help message

Examples:
  bun log.ts --slug api-research --session f4b8aa3a
  bun log.ts --slug findings --session b2c3d4e5 --parent f4b8aa3a
  bun log.ts --slug api-research --title "API Research Notes" --session f4b8aa3a
`);
		process.exit(0);
	}

	if (!values.slug) {
		console.error("Error: --slug is required");
		process.exit(1);
	}

	if (!values.session) {
		console.error("Error: --session is required");
		process.exit(1);
	}

	return {
		slug: slugify(values.slug),
		sessionId: values.session,
		parentSessionId: values.parent,
		title: values.title,
	};
}

/**
 * Main entry point
 */
async function main() {
	const options = parseCliArgs();
	const ctx = buildContext({
		sessionId: options.sessionId,
		parentSessionId: options.parentSessionId,
	});

	// Build paths
	const notesDir = getNotesDir(ctx.dateDir, options.parentSessionId);
	const filename = buildFilename({
		root: ctx.timeRoot,
		suffix: options.slug,
	});
	const filePath = join(notesDir, filename);

	// Ensure directory exists
	await mkdir(notesDir, { recursive: true });

	// Check if file exists
	const file = Bun.file(filePath);
	if (await file.exists()) {
		console.error(`Error: Log already exists: ${filePath}`);
		process.exit(1);
	}

	// Generate and write content
	const content = generateLogContent(ctx, options);
	await Bun.write(filePath, content);

	console.log(`Created: ${filePath}`);
}

main().catch(console.error);
