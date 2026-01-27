#!/usr/bin/env bun

/**
 * Create a handoff note
 *
 * Handoffs are structured session notes with Done/State/Next sections.
 * They serve as both a session log and continuity document.
 *
 * @example
 * bun handoff.ts --session f4b8aa3a
 *
 * @example With parent session (subagent)
 * bun handoff.ts --session b2c3d4e5 --parent f4b8aa3a
 *
 * @module trail/handoff
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
import { buildFilename, truncateSessionId } from "./filename.ts";

/**
 * Options for creating a handoff note.
 */
interface HandoffOptions {
	/** Current session ID (required) */
	sessionId: string;
	/** Parent session ID if this is a subagent */
	parentSessionId?: string;
}

/**
 * Generate handoff content with frontmatter
 */
function generateHandoffContent(
	ctx: ReturnType<typeof buildContext>,
	options: HandoffOptions,
): string {
	const time = formatTime(ctx.timestamp);
	const created = formatISO(ctx.timestamp);
	const sessionShort = truncateSessionId(options.sessionId);

	let frontmatter = `---
created: ${created}
type: handoff
session: ${options.sessionId}`;

	if (options.parentSessionId) {
		frontmatter += `\nparent-session: ${options.parentSessionId}`;
	}

	frontmatter += `
---

# Handoff ${ctx.dateDir} ${time}

> Session \`${sessionShort}\`${options.parentSessionId ? ` (child of \`${truncateSessionId(options.parentSessionId)}\`)` : ""}

## Done

- { What was accomplished }

## State

- { Current state of work }

## Next

- [ ] { What should happen next }
`;

	return frontmatter;
}

/**
 * Parse CLI arguments
 */
function parseCliArgs(): HandoffOptions {
	const { values } = parseArgs({
		args: Bun.argv.slice(2),
		options: {
			session: {
				type: "string",
				short: "s",
			},
			parent: {
				type: "string",
				short: "p",
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
Usage: bun handoff.ts [options]

Options:
  -s, --session <id>    Session ID (required)
  -p, --parent <id>     Parent session ID (if subagent)
  -h, --help            Show this help message

Examples:
  bun handoff.ts --session f4b8aa3a
  bun handoff.ts --session b2c3d4e5 --parent f4b8aa3a
`);
		process.exit(0);
	}

	if (!values.session) {
		console.error("Error: --session is required");
		process.exit(1);
	}

	return {
		sessionId: values.session,
		parentSessionId: values.parent,
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
		prefix: "handoff",
		root: ctx.timeRoot,
		suffix: truncateSessionId(options.sessionId),
	});
	const filePath = join(notesDir, filename);

	// Ensure directory exists
	await mkdir(notesDir, { recursive: true });

	// Check if file exists
	const file = Bun.file(filePath);
	if (await file.exists()) {
		console.error(`Error: Handoff already exists: ${filePath}`);
		process.exit(1);
	}

	// Generate and write content
	const content = generateHandoffContent(ctx, options);
	await Bun.write(filePath, content);

	console.log(`Created: ${filePath}`);
}

main().catch(console.error);
