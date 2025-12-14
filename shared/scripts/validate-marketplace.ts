#!/usr/bin/env bun
/**
 * Marketplace Validation Script
 *
 * Validates:
 * - marketplace.json schema and structure
 * - plugin.json for each plugin
 * - SKILL.md frontmatter (name, version, description)
 * - File structure conventions
 *
 * Usage: bun run shared/scripts/validate-marketplace.ts
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

interface ValidationResult {
	passed: boolean;
	errors: string[];
	warnings: string[];
}

interface MarketplaceJson {
	name: string;
	owner?: { name: string; email?: string };
	metadata?: { description?: string; version?: string };
	plugins: Array<{
		name: string;
		source: string;
		description?: string;
		version?: string;
	}>;
}

interface PluginJson {
	name: string;
	version: string;
	description: string;
	author?: { name: string; email?: string; url?: string };
	keywords?: string[];
}

const REPO_ROOT = resolve(import.meta.dirname, "../..");

function log(message: string, type: "info" | "error" | "warning" | "success" = "info"): void {
	const prefix = {
		info: "  ",
		error: "✗ ",
		warning: "△ ",
		success: "✓ ",
	}[type];
	console.log(`${prefix}${message}`);
}

function parseYamlFrontmatter(content: string): Record<string, string> | null {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;

	const frontmatter: Record<string, string> = {};
	const lines = match[1].split("\n");

	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim();
			const value = line.slice(colonIndex + 1).trim();
			frontmatter[key] = value;
		}
	}

	return frontmatter;
}

function validateMarketplaceJson(): ValidationResult {
	const result: ValidationResult = { passed: true, errors: [], warnings: [] };
	const marketplacePath = join(REPO_ROOT, ".claude-plugin/marketplace.json");

	if (!existsSync(marketplacePath)) {
		result.passed = false;
		result.errors.push("marketplace.json not found at .claude-plugin/marketplace.json");
		return result;
	}

	try {
		const content = readFileSync(marketplacePath, "utf-8");
		const marketplace: MarketplaceJson = JSON.parse(content);

		// Required fields
		if (!marketplace.name) {
			result.passed = false;
			result.errors.push("marketplace.json: missing 'name' field");
		}

		if (!marketplace.plugins || !Array.isArray(marketplace.plugins)) {
			result.passed = false;
			result.errors.push("marketplace.json: missing or invalid 'plugins' array");
			return result;
		}

		// Validate each plugin entry
		for (const plugin of marketplace.plugins) {
			if (!plugin.name) {
				result.passed = false;
				result.errors.push("marketplace.json: plugin entry missing 'name'");
			}
			if (!plugin.source) {
				result.passed = false;
				result.errors.push(`marketplace.json: plugin '${plugin.name}' missing 'source'`);
			}
			if (!plugin.version) {
				result.warnings.push(`marketplace.json: plugin '${plugin.name}' missing 'version'`);
			}
		}
	} catch (error) {
		result.passed = false;
		result.errors.push(`marketplace.json: invalid JSON - ${error}`);
	}

	return result;
}

function validatePluginJson(pluginPath: string, pluginName: string): ValidationResult {
	const result: ValidationResult = { passed: true, errors: [], warnings: [] };
	const pluginJsonPath = join(pluginPath, ".claude-plugin/plugin.json");

	if (!existsSync(pluginJsonPath)) {
		result.passed = false;
		result.errors.push(`${pluginName}: missing .claude-plugin/plugin.json`);
		return result;
	}

	try {
		const content = readFileSync(pluginJsonPath, "utf-8");
		const pluginJson: PluginJson = JSON.parse(content);

		// Required fields
		if (!pluginJson.name) {
			result.passed = false;
			result.errors.push(`${pluginName}/plugin.json: missing 'name'`);
		}
		if (!pluginJson.version) {
			result.passed = false;
			result.errors.push(`${pluginName}/plugin.json: missing 'version'`);
		}
		if (!pluginJson.description) {
			result.passed = false;
			result.errors.push(`${pluginName}/plugin.json: missing 'description'`);
		}

		// Recommended fields
		if (!pluginJson.author) {
			result.warnings.push(`${pluginName}/plugin.json: missing 'author'`);
		}
		if (!pluginJson.keywords || pluginJson.keywords.length === 0) {
			result.warnings.push(`${pluginName}/plugin.json: missing 'keywords'`);
		}
	} catch (error) {
		result.passed = false;
		result.errors.push(`${pluginName}/plugin.json: invalid JSON - ${error}`);
	}

	return result;
}

function validateSkillFrontmatter(skillPath: string, pluginName: string, skillName: string): ValidationResult {
	const result: ValidationResult = { passed: true, errors: [], warnings: [] };
	const skillMdPath = join(skillPath, "SKILL.md");

	if (!existsSync(skillMdPath)) {
		result.passed = false;
		result.errors.push(`${pluginName}/${skillName}: missing SKILL.md`);
		return result;
	}

	const content = readFileSync(skillMdPath, "utf-8");
	const frontmatter = parseYamlFrontmatter(content);

	if (!frontmatter) {
		result.passed = false;
		result.errors.push(`${pluginName}/${skillName}/SKILL.md: missing YAML frontmatter`);
		return result;
	}

	// Required frontmatter fields
	if (!frontmatter.name) {
		result.passed = false;
		result.errors.push(`${pluginName}/${skillName}/SKILL.md: frontmatter missing 'name'`);
	}
	if (!frontmatter.version) {
		result.passed = false;
		result.errors.push(`${pluginName}/${skillName}/SKILL.md: frontmatter missing 'version'`);
	}
	if (!frontmatter.description) {
		result.passed = false;
		result.errors.push(`${pluginName}/${skillName}/SKILL.md: frontmatter missing 'description'`);
	}

	// Check description quality (should have trigger keywords)
	if (frontmatter.description && frontmatter.description.length < 50) {
		result.warnings.push(`${pluginName}/${skillName}/SKILL.md: description seems short (< 50 chars)`);
	}

	// Check file size (skills should be < 500 lines)
	const lines = content.split("\n").length;
	if (lines > 500) {
		result.warnings.push(`${pluginName}/${skillName}/SKILL.md: ${lines} lines (recommended < 500)`);
	}

	return result;
}

function validatePlugin(pluginPath: string, pluginName: string): ValidationResult {
	const result: ValidationResult = { passed: true, errors: [], warnings: [] };

	// Validate plugin.json
	const pluginJsonResult = validatePluginJson(pluginPath, pluginName);
	result.errors.push(...pluginJsonResult.errors);
	result.warnings.push(...pluginJsonResult.warnings);
	if (!pluginJsonResult.passed) result.passed = false;

	// Validate skills
	const skillsPath = join(pluginPath, "skills");
	if (existsSync(skillsPath)) {
		const skills = readdirSync(skillsPath, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);

		for (const skill of skills) {
			const skillResult = validateSkillFrontmatter(join(skillsPath, skill), pluginName, skill);
			result.errors.push(...skillResult.errors);
			result.warnings.push(...skillResult.warnings);
			if (!skillResult.passed) result.passed = false;
		}
	}

	// Check for README
	if (!existsSync(join(pluginPath, "README.md"))) {
		result.warnings.push(`${pluginName}: missing README.md`);
	}

	return result;
}

async function main(): Promise<void> {
	console.log("\n🔍 Validating Outfitter Marketplace\n");

	let totalErrors = 0;
	let totalWarnings = 0;

	// Validate marketplace.json
	console.log("Checking marketplace.json...");
	const marketplaceResult = validateMarketplaceJson();
	for (const error of marketplaceResult.errors) log(error, "error");
	for (const warning of marketplaceResult.warnings) log(warning, "warning");
	totalErrors += marketplaceResult.errors.length;
	totalWarnings += marketplaceResult.warnings.length;

	if (!marketplaceResult.passed) {
		console.log("\n❌ Marketplace validation failed. Fix errors above.\n");
		process.exit(1);
	}

	// Load marketplace to get plugin list
	const marketplacePath = join(REPO_ROOT, ".claude-plugin/marketplace.json");
	const marketplace: MarketplaceJson = JSON.parse(readFileSync(marketplacePath, "utf-8"));

	// Validate each plugin
	for (const plugin of marketplace.plugins) {
		const pluginPath = join(REPO_ROOT, plugin.source.replace("./", ""));
		console.log(`\nChecking ${plugin.name}...`);

		if (!existsSync(pluginPath)) {
			log(`Plugin directory not found: ${plugin.source}`, "error");
			totalErrors++;
			continue;
		}

		const pluginResult = validatePlugin(pluginPath, plugin.name);
		for (const error of pluginResult.errors) log(error, "error");
		for (const warning of pluginResult.warnings) log(warning, "warning");
		totalErrors += pluginResult.errors.length;
		totalWarnings += pluginResult.warnings.length;

		if (pluginResult.passed && pluginResult.errors.length === 0) {
			log(`${plugin.name} passed`, "success");
		}
	}

	// Summary
	console.log("\n" + "─".repeat(50));
	if (totalErrors === 0) {
		console.log(`\n✅ Validation passed with ${totalWarnings} warning(s)\n`);
		process.exit(0);
	} else {
		console.log(`\n❌ Validation failed: ${totalErrors} error(s), ${totalWarnings} warning(s)\n`);
		process.exit(1);
	}
}

main();
