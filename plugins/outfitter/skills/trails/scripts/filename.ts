#!/usr/bin/env bun

/**
 * Trail filename utilities
 *
 * Build filenames with configurable prefix-root-suffix pattern.
 * Root is always the timestamp (YYYYMMDDhhmm), prefix and suffix are optional.
 *
 * @module trail/filename
 */

export interface FilenameOptions {
	/** Optional prefix (e.g., "handoff", "log") */
	prefix?: string;
	/** Timestamp root (YYYYMMDDhhmm) - required */
	root: string;
	/** Optional suffix (e.g., session ID, slug) */
	suffix?: string;
	/** File extension (default: "md") */
	ext?: string;
}

/**
 * Build a filename from parts
 *
 * Pattern: [prefix-]root[-suffix].ext
 *
 * @example
 * buildFilename({ root: "202601221430", prefix: "handoff", suffix: "f4b8aa3a" })
 * // => "handoff-202601221430-f4b8aa3a.md"
 *
 * @example
 * buildFilename({ root: "202601221445", suffix: "api-research" })
 * // => "202601221445-api-research.md"
 *
 * @example
 * buildFilename({ root: "202601221500", prefix: "handoff" })
 * // => "handoff-202601221500.md"
 */
export function buildFilename(options: FilenameOptions): string {
	const { prefix, root, suffix, ext = "md" } = options;

	const parts: string[] = [];

	if (prefix) {
		parts.push(prefix);
	}

	parts.push(root);

	if (suffix) {
		parts.push(suffix);
	}

	return `${parts.join("-")}.${ext}`;
}

/**
 * Parse a trail filename into its components
 *
 * Expects pattern: [prefix-]YYYYMMDDhhmm[-suffix].ext
 * The 12-digit timestamp is the anchor for parsing.
 */
export function parseFilename(filename: string): {
	prefix?: string;
	root: string;
	suffix?: string;
	ext: string;
} | null {
	// Remove extension
	const dotIndex = filename.lastIndexOf(".");
	if (dotIndex === -1) return null;

	const ext = filename.slice(dotIndex + 1);
	const base = filename.slice(0, dotIndex);

	// Find the 12-digit timestamp (YYYYMMDDhhmm)
	const timestampMatch = base.match(/(\d{12})/);
	if (!timestampMatch) return null;

	const root = timestampMatch[1];
	const rootIndex = base.indexOf(root);

	// Everything before timestamp is prefix
	const beforeRoot = base.slice(0, rootIndex);
	const prefix = beforeRoot.endsWith("-")
		? beforeRoot.slice(0, -1)
		: beforeRoot || undefined;

	// Everything after timestamp is suffix
	const afterRoot = base.slice(rootIndex + root.length);
	const suffix = afterRoot.startsWith("-")
		? afterRoot.slice(1)
		: afterRoot || undefined;

	return { prefix: prefix || undefined, root, suffix: suffix || undefined, ext };
}

/**
 * Slugify a string for use in filenames
 *
 * Converts to lowercase, replaces spaces/special chars with hyphens,
 * removes consecutive hyphens, trims hyphens from ends.
 */
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // Remove special chars except hyphens
		.replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
		.replace(/-+/g, "-") // Collapse consecutive hyphens
		.replace(/^-|-$/g, ""); // Trim hyphens from ends
}

/**
 * Truncate session ID for filename use
 *
 * Takes first 8 characters of session ID for brevity while maintaining uniqueness.
 */
export function truncateSessionId(sessionId: string): string {
	return sessionId.slice(0, 8);
}
