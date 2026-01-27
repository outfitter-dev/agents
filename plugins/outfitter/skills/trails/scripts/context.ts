#!/usr/bin/env bun

/**
 * Trail context utilities
 *
 * Shared utilities for session context, timestamps, and directory resolution.
 * Used by handoff, log, and other trail scripts.
 *
 * @module trail/context
 */

export interface TrailContext {
	/** Current session ID */
	sessionId: string;
	/** Parent session ID if this is a subagent */
	parentSessionId?: string;
	/** Whether this is a subagent context */
	isSubagent: boolean;
	/** Current timestamp */
	timestamp: Date;
	/** Date directory name (YYYY-MM-DD) */
	dateDir: string;
	/** Full timestamp for filenames (YYYYMMDDhhmm) */
	timeRoot: string;
}

/**
 * Format date as YYYY-MM-DD for directory names
 */
export function formatDateDir(date: Date): string {
	return date.toISOString().split("T")[0];
}

/**
 * Format date as YYYYMMDDhhmm for filename roots
 */
export function formatTimeRoot(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${year}${month}${day}${hours}${minutes}`;
}

/**
 * Format date as ISO 8601 for frontmatter
 */
export function formatISO(date: Date): string {
	return date.toISOString();
}

/**
 * Format time as HH:mm for display
 */
export function formatTime(date: Date): string {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

/**
 * Build trail context from environment and options
 */
export function buildContext(options?: {
	sessionId?: string;
	parentSessionId?: string;
	timestamp?: Date;
}): TrailContext {
	const timestamp = options?.timestamp ?? new Date();
	const sessionId = options?.sessionId ?? "unknown";
	const parentSessionId = options?.parentSessionId;

	return {
		sessionId,
		parentSessionId,
		isSubagent: !!parentSessionId,
		timestamp,
		dateDir: formatDateDir(timestamp),
		timeRoot: formatTimeRoot(timestamp),
	};
}

/**
 * Get the trail root directory (project root where .trail/ lives)
 *
 * For plugin use, this returns process.cwd() since the plugin scripts
 * run in the context of the user's project.
 */
export function getTrailRoot(): string {
	return process.cwd();
}

/**
 * Get the notes directory for a given date
 */
export function getNotesDir(
	dateDir: string,
	parentSessionId?: string,
): string {
	const root = getTrailRoot();
	const base = `${root}/.trail/notes/${dateDir}`;

	// If subagent, nest under parent session directory
	if (parentSessionId) {
		return `${base}/${parentSessionId}`;
	}

	return base;
}
