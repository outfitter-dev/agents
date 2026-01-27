#!/usr/bin/env bun
/**
 * Syncs package.json versions to marketplace.json after `changeset version` runs.
 *
 * - Reads each plugin's package.json version
 * - Updates corresponding entry in marketplace.json
 * - Updates metadata.version to match highest plugin version
 * - Skips external plugins (those with object source)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = import.meta.dirname ? join(import.meta.dirname, "..") : process.cwd();
const MARKETPLACE_PATH = join(ROOT, ".claude-plugin/marketplace.json");

// Local plugins tracked by changesets
const LOCAL_PLUGINS = ["outfitter", "but", "gt", "cli-dev", "outfitter-stack"];

interface Plugin {
	name: string;
	source: string | object;
	version?: string;
	[key: string]: unknown;
}

interface Marketplace {
	metadata: { version: string; [key: string]: unknown };
	plugins: Plugin[];
	[key: string]: unknown;
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path: string, data: unknown): void {
	writeFileSync(path, JSON.stringify(data, null, "\t") + "\n");
}

function main() {
	const marketplace = readJson<Marketplace>(MARKETPLACE_PATH);
	let highestVersion = "0.0.0";

	for (const pluginName of LOCAL_PLUGINS) {
		const pkgPath = join(ROOT, "plugins", pluginName, "package.json");

		let pkg: { version: string };
		try {
			pkg = readJson<{ version: string }>(pkgPath);
		} catch {
			console.warn(`⚠ Skipping ${pluginName}: no package.json found`);
			continue;
		}

		const version = pkg.version;
		if (!version) {
			console.warn(`⚠ Skipping ${pluginName}: no version in package.json`);
			continue;
		}

		// Update plugin version in marketplace.json
		const plugin = marketplace.plugins.find((p) => p.name === pluginName);
		if (plugin && typeof plugin.source === "string") {
			const oldVersion = plugin.version;
			plugin.version = version;
			if (oldVersion !== version) {
				console.log(`✓ ${pluginName}: ${oldVersion} → ${version}`);
			}
		}

		// Track highest version for metadata
		if (compareVersions(version, highestVersion) > 0) {
			highestVersion = version;
		}
	}

	// Update metadata.version to highest
	const oldMetaVersion = marketplace.metadata.version;
	if (oldMetaVersion !== highestVersion) {
		marketplace.metadata.version = highestVersion;
		console.log(`✓ metadata.version: ${oldMetaVersion} → ${highestVersion}`);
	}

	writeJson(MARKETPLACE_PATH, marketplace);
	console.log("✓ marketplace.json synced");
}

/**
 * Compare semver versions. Returns:
 * - positive if a > b
 * - negative if a < b
 * - 0 if equal
 */
function compareVersions(a: string, b: string): number {
	const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
	const [bMajor, bMinor, bPatch] = b.split(".").map(Number);

	if (aMajor !== bMajor) return aMajor - bMajor;
	if (aMinor !== bMinor) return aMinor - bMinor;
	return aPatch - bPatch;
}

main();
