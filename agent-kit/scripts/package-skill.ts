#!/usr/bin/env bun

/**
 * Package a Claude skill for distribution
 *
 * Usage: bun run package-skill.ts <skill-dir> [output-dir]
 *
 * Creates a .skill.zip file ready for sharing or marketplace submission.
 */

import * as fs from "node:fs";
import { homedir } from "node:os";
import * as path from "node:path";
import { $ } from "bun";

interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Extract a YAML value from frontmatter, handling multiline values
 * Supports: single line, quoted, block scalars (| and >), and folded continuation
 */
function extractYamlValue(frontmatter: string, key: string): string | null {
	const lines = frontmatter.split("\n");
	let value = "";
	let capturing = false;
	let blockStyle: "|" | ">" | null = null;
	let baseIndent = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (!capturing) {
			// Look for the key
			const keyMatch = line.match(new RegExp(`^${key}:\\s*(.*)$`));
			if (keyMatch) {
				const restOfLine = keyMatch[1].trim();

				// Check for block scalar indicators
				if (restOfLine === "|" || restOfLine === ">") {
					blockStyle = restOfLine as "|" | ">";
					capturing = true;
					// Find base indent from next non-empty line
					for (let j = i + 1; j < lines.length; j++) {
						if (lines[j].trim()) {
							baseIndent = lines[j].match(/^(\s*)/)?.[1].length || 0;
							break;
						}
					}
					continue;
				}

				// Check for quoted value
				const quotedMatch = restOfLine.match(/^["'](.*)["']$/);
				if (quotedMatch) {
					return quotedMatch[1];
				}

				// Single line value (may continue if next line is indented)
				if (restOfLine) {
					value = restOfLine;
					// Check if next line continues (indented)
					const nextLine = lines[i + 1];
					if (nextLine && /^\s+\S/.test(nextLine)) {
						capturing = true;
						baseIndent = nextLine.match(/^(\s*)/)?.[1].length || 2;
					} else {
						return value;
					}
				}
			}
		} else {
			// Capturing multiline value
			const indent = line.match(/^(\s*)/)?.[1].length || 0;

			// Stop if we hit a new key (no indent or less indent with colon)
			if (line.trim() && indent < baseIndent && /^\s*\w+:/.test(line)) {
				break;
			}

			// Stop on empty line followed by non-indented content (for non-block)
			if (!blockStyle && !line.trim()) {
				const nextLine = lines[i + 1];
				if (nextLine && !/^\s/.test(nextLine)) {
					break;
				}
			}

			// Add the line content
			const content = line.slice(Math.min(indent, baseIndent));
			if (blockStyle === ">") {
				// Folded: newlines become spaces
				value += (value && content.trim() ? " " : "") + content.trim();
			} else {
				// Literal or plain continuation
				value += (value ? "\n" : "") + content;
			}
		}
	}

	return value.trim() || null;
}

interface PackageResult {
	status: "success" | "error" | "validation_failed";
	outputFile?: string;
	sizeBytes?: number;
	sizeHuman?: string;
	errors?: string[];
	warnings?: string[];
}

function validateSkill(skillDir: string): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check SKILL.md exists
	const skillMdPath = path.join(skillDir, "SKILL.md");
	if (!fs.existsSync(skillMdPath)) {
		errors.push("Missing SKILL.md");
		return { valid: false, errors, warnings };
	}

	const content = fs.readFileSync(skillMdPath, "utf-8");

	// Check frontmatter
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) {
		errors.push("Missing YAML frontmatter (---\\n...\\n---)");
	} else {
		const frontmatter = frontmatterMatch[1];

		if (!frontmatter.includes("name:")) {
			errors.push("Frontmatter missing 'name' field");
		}

		// Check description using proper YAML parsing
		const description = extractYamlValue(frontmatter, "description");
		if (!description) {
			errors.push("Frontmatter missing 'description' field");
		} else {
			if (description.length < 50) {
				warnings.push(
					"Description seems short (<50 chars). Include capabilities and trigger contexts.",
				);
			}
			if (description.toLowerCase().includes("todo")) {
				errors.push("Description contains TODO placeholder");
			}
		}
	}

	// Check for TODO/placeholder markers
	if (content.includes("TODO")) {
		warnings.push("SKILL.md contains TODO markers");
	}

	if (/\{\{[A-Z_]+\}\}/.test(content)) {
		errors.push("SKILL.md contains {{PLACEHOLDER}} markers");
	}

	// Check line count
	const lineCount = content.split("\n").length;
	if (lineCount > 500) {
		warnings.push(
			`SKILL.md is ${lineCount} lines. Consider splitting into references/.`,
		);
	}

	// Check for extraneous files
	const badFiles = ["README.md", "CHANGELOG.md", "CONTRIBUTING.md"];
	for (const f of badFiles) {
		if (fs.existsSync(path.join(skillDir, f))) {
			warnings.push(`Found ${f} — skills shouldn't include human-facing docs`);
		}
	}

	// Check for broken references
	const refMatches = content.matchAll(/\[.*?\]\(([^)]+)\)/g);
	for (const match of refMatches) {
		const ref = match[1];
		if (!ref.startsWith("http") && !ref.startsWith("#")) {
			const refPath = path.join(skillDir, ref);
			if (!fs.existsSync(refPath)) {
				errors.push(`Broken reference: ${ref}`);
			}
		}
	}

	// Check scripts are executable
	const scriptsDir = path.join(skillDir, "scripts");
	if (fs.existsSync(scriptsDir)) {
		for (const script of fs.readdirSync(scriptsDir)) {
			const scriptPath = path.join(scriptsDir, script);
			const stats = fs.statSync(scriptPath);
			if (stats.isFile() && !(stats.mode & 0o111)) {
				warnings.push(`Script not executable: scripts/${script}`);
			}

			// Check for hardcoded paths in scripts
			if (script.endsWith(".ts") || script.endsWith(".sh")) {
				const scriptContent = fs.readFileSync(scriptPath, "utf-8");
				if (/["'`]\/Users\//.test(scriptContent)) {
					errors.push(`scripts/${script}: Contains hardcoded /Users/ path`);
				}
				if (/["'`]\/home\/(?!claude)/.test(scriptContent)) {
					errors.push(`scripts/${script}: Contains hardcoded /home/ path`);
				}
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

async function packageSkill(
	skillDir: string,
	outputDir: string,
): Promise<PackageResult> {
	const skillName = path.basename(skillDir);
	const outputFile = path.join(outputDir, `${skillName}.skill.zip`);

	// Validate first
	const validation = validateSkill(skillDir);

	if (!validation.valid) {
		return {
			status: "validation_failed",
			errors: validation.errors,
			warnings: validation.warnings,
		};
	}

	// Create zip (exclude common junk files)
	try {
		await $`cd ${skillDir} && zip -r ${path.resolve(outputFile)} . \
      -x "*.DS_Store" \
      -x "__MACOSX/*" \
      -x "*.git*" \
      -x "node_modules/*" \
      -x "*.log"`.quiet();
	} catch (e) {
		return {
			status: "error",
			errors: [`Failed to create zip: ${e instanceof Error ? e.message : e}`],
		};
	}

	const stats = fs.statSync(outputFile);

	return {
		status: "success",
		outputFile,
		sizeBytes: stats.size,
		sizeHuman: `${(stats.size / 1024).toFixed(1)} KB`,
		warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
	};
}

function showUsage(): void {
	console.log(
		JSON.stringify(
			{
				usage: "package-skill.ts <skill-dir> [output-dir]",
				description:
					"Package a skill directory into a distributable .skill.zip file",
				examples: [
					"bun run package-skill.ts ./my-skill",
					"bun run package-skill.ts ./my-skill ./dist",
				],
				notes: [
					"Validates skill before packaging",
					"Excludes .git, node_modules, .DS_Store",
					"Output defaults to current directory",
				],
			},
			null,
			2,
		),
	);
}

// Main
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
	showUsage();
	process.exit(0);
}

const [skillDir, outputDir = "."] = args;

if (!skillDir) {
	showUsage();
	process.exit(1);
}

// Expand ~ to home directory
const expandedSkillDir = skillDir.replace(/^~/, homedir());
const expandedOutputDir = outputDir.replace(/^~/, homedir());

if (!fs.existsSync(expandedSkillDir)) {
	console.log(
		JSON.stringify({
			status: "error",
			errors: [`Skill directory not found: ${skillDir}`],
		}),
	);
	process.exit(1);
}

if (!fs.existsSync(expandedOutputDir)) {
	fs.mkdirSync(expandedOutputDir, { recursive: true });
}

const result = await packageSkill(expandedSkillDir, expandedOutputDir);
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "success" ? 0 : 1);
