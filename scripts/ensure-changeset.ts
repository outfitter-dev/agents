#!/usr/bin/env bun
/**
 * Ensures a changeset exists for the current branch if plugin files changed.
 *
 * Usage:
 *   bun scripts/ensure-changeset.ts [commit-message]
 *
 * If no commit message provided, reads from .git/COMMIT_EDITMSG or HEAD commit.
 *
 * Logic:
 *   1. Get current branch and parent branch
 *   2. Diff against parent to find files changed in this branch only
 *   3. Filter for plugin directories
 *   4. Parse conventional commit → bump type
 *   5. Create/update .changeset/{branch-name}.md
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = import.meta.dirname ? join(import.meta.dirname, "..") : process.cwd();
const CHANGESET_DIR = join(ROOT, ".changeset");

// Local plugins that need changesets
const PLUGIN_DIRS = ["outfitter", "but", "gt", "cli-dev"];

// Conventional commit types that skip changesets
const SKIP_TYPES = new Set(["chore", "test", "ci", "build"]);

// Type to bump mapping
const TYPE_TO_BUMP: Record<string, "major" | "minor" | "patch"> = {
	feat: "minor",
	fix: "patch",
	perf: "patch",
	refactor: "patch",
	docs: "patch",
	style: "patch",
};

interface ParsedCommit {
	type: string;
	scope: string | null;
	breaking: boolean;
	description: string;
	body: string;
}

interface ChangesetData {
	plugins: Map<string, "major" | "minor" | "patch">;
	description: string;
}

function exec(cmd: string): string {
	try {
		return execSync(cmd, { cwd: ROOT, encoding: "utf-8" }).trim();
	} catch {
		return "";
	}
}

function getCurrentBranch(): string {
	return exec("git rev-parse --abbrev-ref HEAD");
}

function getParentBranch(): string {
	// Try gt parent first (Graphite)
	const gtParent = exec("gt parent 2>/dev/null");
	if (gtParent && !gtParent.includes("error")) {
		return gtParent;
	}

	// Fall back to main/master
	const defaultBranch = exec("git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null")
		.replace("refs/remotes/origin/", "") || "main";
	return defaultBranch;
}

function getChangedFiles(parentBranch: string): string[] {
	// Get files changed in current branch vs parent
	// Include both committed and staged changes
	const committed = exec(`git diff --name-only ${JSON.stringify(parentBranch)}...HEAD 2>/dev/null`);
	const staged = exec("git diff --name-only --cached");

	const files = new Set<string>();
	for (const f of committed.split("\n").filter(Boolean)) files.add(f);
	for (const f of staged.split("\n").filter(Boolean)) files.add(f);

	return Array.from(files);
}

function getAffectedPlugins(files: string[]): string[] {
	const plugins = new Set<string>();

	for (const file of files) {
		for (const plugin of PLUGIN_DIRS) {
			if (file.startsWith(`${plugin}/`)) {
				plugins.add(plugin);
			}
		}
	}

	return Array.from(plugins).sort();
}

function getCommitMessage(arg?: string): string {
	// Priority: CLI arg > COMMIT_EDITMSG > HEAD commit
	if (arg) return arg;

	const commitMsgFile = join(ROOT, ".git", "COMMIT_EDITMSG");
	if (existsSync(commitMsgFile)) {
		return readFileSync(commitMsgFile, "utf-8").trim();
	}

	return exec("git log -1 --format=%B HEAD");
}

function parseConventionalCommit(message: string): ParsedCommit {
	const lines = message.split("\n");
	const firstLine = lines[0] || "";
	const body = lines.slice(1).join("\n").trim();

	// Parse: type(scope)!: description
	// Regex: ^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$
	const match = firstLine.match(/^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/);

	if (!match) {
		// Not a conventional commit, treat as patch with full message as description
		return {
			type: "patch",
			scope: null,
			breaking: false,
			description: firstLine,
			body,
		};
	}

	const [, type, scope, bang, description] = match;
	const breaking = bang === "!" || body.includes("BREAKING CHANGE:");

	return {
		type: type.toLowerCase(),
		scope: scope || null,
		breaking,
		description,
		body,
	};
}

function getBumpType(parsed: ParsedCommit): "major" | "minor" | "patch" | "skip" {
	if (parsed.breaking) return "major";
	if (SKIP_TYPES.has(parsed.type)) return "skip";
	return TYPE_TO_BUMP[parsed.type] || "patch";
}

function sanitizeBranchName(branch: string): string {
	// Convert branch name to valid filename
	return branch.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function getChangesetPath(branch: string): string {
	const sanitized = sanitizeBranchName(branch);
	return join(CHANGESET_DIR, `${sanitized}.md`);
}

function readExistingChangeset(path: string): ChangesetData | null {
	if (!existsSync(path)) return null;

	const content = readFileSync(path, "utf-8");
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return null;

	const [, frontmatter, description] = match;
	const plugins = new Map<string, "major" | "minor" | "patch">();

	for (const line of frontmatter.split("\n")) {
		const pkgMatch = line.match(/^"([^"]+)":\s*(major|minor|patch)$/);
		if (pkgMatch) {
			plugins.set(pkgMatch[1], pkgMatch[2] as "major" | "minor" | "patch");
		}
	}

	return { plugins, description: description.trim() };
}

function writeChangeset(path: string, data: ChangesetData): void {
	const frontmatter = Array.from(data.plugins.entries())
		.map(([pkg, bump]) => `"${pkg}": ${bump}`)
		.join("\n");

	const content = `---\n${frontmatter}\n---\n\n${data.description}\n`;
	writeFileSync(path, content);
}

function mergeBump(
	existing: "major" | "minor" | "patch" | undefined,
	incoming: "major" | "minor" | "patch"
): "major" | "minor" | "patch" {
	const order = { major: 3, minor: 2, patch: 1 };
	if (!existing) return incoming;
	return order[existing] >= order[incoming] ? existing : incoming;
}

function main() {
	const branch = getCurrentBranch();

	if (branch === "main" || branch === "master" || branch === "HEAD") {
		console.log("⏭ Skipping changeset on trunk branch");
		process.exit(0);
	}

	const parent = getParentBranch();
	const files = getChangedFiles(parent);
	const plugins = getAffectedPlugins(files);

	if (plugins.length === 0) {
		console.log("⏭ No plugin changes detected");
		process.exit(0);
	}

	const message = getCommitMessage(process.argv[2]);
	const parsed = parseConventionalCommit(message);
	const bump = getBumpType(parsed);

	if (bump === "skip") {
		// Clean up stale changeset if one exists from previous non-skip commits
		const changesetPath = getChangesetPath(branch);
		if (existsSync(changesetPath)) {
			unlinkSync(changesetPath);
			execSync(`git add ${JSON.stringify(changesetPath)}`, { cwd: ROOT });
			console.log(`🗑 Removed stale changeset: ${changesetPath}`);
		}
		console.log(`⏭ Skipping changeset for ${parsed.type}: commit`);
		process.exit(0);
	}

	const changesetPath = getChangesetPath(branch);
	const existing = readExistingChangeset(changesetPath);

	// Build new changeset data
	const data: ChangesetData = {
		plugins: existing?.plugins || new Map(),
		description: parsed.description,
	};

	// Update/add affected plugins with appropriate bump
	for (const plugin of plugins) {
		const currentBump = data.plugins.get(plugin);
		data.plugins.set(plugin, mergeBump(currentBump, bump));
	}

	writeChangeset(changesetPath, data);

	// Stage the changeset
	execSync(`git add ${JSON.stringify(changesetPath)}`, { cwd: ROOT });

	const pluginList = plugins.map((p) => `${p}:${bump}`).join(", ");
	console.log(`✓ Changeset updated: ${pluginList}`);
	console.log(`  → ${changesetPath}`);
}

main();
