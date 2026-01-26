#!/usr/bin/env bun
/**
 * Lint plugin structure and configuration.
 *
 * Validates:
 * - Standalone plugins: .claude-plugin/plugin.json inside plugin directory
 * - Marketplace plugins: .claude-plugin/marketplace.json at repo root
 * - Required plugin.json fields: name, version, description
 * - Plugin structure conventions
 *
 * Usage:
 *   bun scripts/lint/claude-plugin/plugins.ts [path]
 *
 * Examples:
 *   bun scripts/lint/claude-plugin/plugins.ts                # Lint all plugins
 *   bun scripts/lint/claude-plugin/plugins.ts outfitter/     # Lint specific plugin
 */

import { Glob } from "bun";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

/**
 * A plugin validation violation.
 */
export interface Violation {
  /** File path where violation was found */
  file: string;
  /** Severity of the issue */
  severity: "error" | "warning";
  /** Description of the issue */
  message: string;
}

/**
 * Result of plugin validation.
 */
export interface LintResult {
  /** Whether validation passed (no errors) */
  passed: boolean;
  /** All violations found */
  violations: Violation[];
}

/**
 * Structure of plugin.json configuration.
 */
interface PluginJson {
  name: string;
  version: string;
  description: string;
  author?: { name: string; email?: string; url?: string };
  keywords?: string[];
  hooks?: unknown; // Should NOT be present
}

/**
 * Structure of marketplace.json configuration.
 */
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

/**
 * Validate a plugin.json file.
 */
function validatePluginJson(filePath: string): Violation[] {
  const violations: Violation[] = [];

  try {
    const content = readFileSync(filePath, "utf-8");
    const json: PluginJson = JSON.parse(content);

    // Required fields
    if (!json.name) {
      violations.push({
        file: filePath,
        severity: "error",
        message: 'Missing required field: "name"',
      });
    }

    if (!json.version) {
      violations.push({
        file: filePath,
        severity: "error",
        message: 'Missing required field: "version"',
      });
    }

    if (!json.description) {
      violations.push({
        file: filePath,
        severity: "error",
        message: 'Missing required field: "description"',
      });
    }

    // Should NOT have hooks field (auto-discovery)
    if (json.hooks !== undefined) {
      violations.push({
        file: filePath,
        severity: "error",
        message:
          'plugin.json should NOT have "hooks" field. Hooks are auto-discovered from hooks/hooks.json',
      });
    }

    // Recommended fields
    if (!json.author) {
      violations.push({
        file: filePath,
        severity: "warning",
        message: 'Missing recommended field: "author"',
      });
    }

    if (!json.keywords || json.keywords.length === 0) {
      violations.push({
        file: filePath,
        severity: "warning",
        message: 'Missing recommended field: "keywords"',
      });
    }

    // Validate version format (semver)
    if (json.version && !/^\d+\.\d+\.\d+/.test(json.version)) {
      violations.push({
        file: filePath,
        severity: "warning",
        message: `Version "${json.version}" does not follow semver format (MAJOR.MINOR.PATCH)`,
      });
    }
  } catch (error) {
    violations.push({
      file: filePath,
      severity: "error",
      message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  return violations;
}

/**
 * Validate a marketplace.json file.
 */
function validateMarketplaceJson(filePath: string): Violation[] {
  const violations: Violation[] = [];

  try {
    const content = readFileSync(filePath, "utf-8");
    const json: MarketplaceJson = JSON.parse(content);

    // Required fields
    if (!json.name) {
      violations.push({
        file: filePath,
        severity: "error",
        message: 'Missing required field: "name"',
      });
    }

    if (!json.plugins || !Array.isArray(json.plugins)) {
      violations.push({
        file: filePath,
        severity: "error",
        message: 'Missing or invalid "plugins" array',
      });
      return violations;
    }

    // Validate each plugin entry
    for (const plugin of json.plugins) {
      if (!plugin.name) {
        violations.push({
          file: filePath,
          severity: "error",
          message: 'Plugin entry missing "name"',
        });
      }

      if (!plugin.source) {
        violations.push({
          file: filePath,
          severity: "error",
          message: `Plugin "${plugin.name}" missing "source"`,
        });
      }

      if (!plugin.version) {
        violations.push({
          file: filePath,
          severity: "warning",
          message: `Plugin "${plugin.name}" missing "version"`,
        });
      }

      // Validate source doesn't escape repo
      if (plugin.source) {
        const normalized = plugin.source.replace(/^\.\//, "");
        if (normalized.includes("..") || normalized.startsWith("/")) {
          violations.push({
            file: filePath,
            severity: "error",
            message: `Plugin "${plugin.name}" has invalid source path: "${plugin.source}"`,
          });
        }
      }
    }
  } catch (error) {
    violations.push({
      file: filePath,
      severity: "error",
      message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  return violations;
}

/**
 * Validate plugin directory structure.
 */
function validatePluginStructure(pluginPath: string): Violation[] {
  const violations: Violation[] = [];
  const pluginName = basename(pluginPath);

  // Check for README
  if (!existsSync(join(pluginPath, "README.md"))) {
    violations.push({
      file: pluginPath,
      severity: "warning",
      message: `Plugin "${pluginName}" missing README.md`,
    });
  }

  // Check skills directory structure
  const skillsPath = join(pluginPath, "skills");
  if (existsSync(skillsPath)) {
    const skills = readdirSync(skillsPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const skill of skills) {
      const skillMdPath = join(skillsPath, skill, "SKILL.md");
      if (!existsSync(skillMdPath)) {
        violations.push({
          file: join(skillsPath, skill),
          severity: "error",
          message: `Skill directory "${skill}" missing SKILL.md`,
        });
      }
    }
  }

  return violations;
}

/**
 * Find and validate all plugin configurations in a path.
 */
export async function lintPlugins(searchPath: string): Promise<LintResult> {
  const violations: Violation[] = [];
  const resolvedPath = resolve(searchPath);

  // Check for marketplace.json at root
  const marketplacePath = join(resolvedPath, ".claude-plugin/marketplace.json");
  if (existsSync(marketplacePath)) {
    violations.push(...validateMarketplaceJson(marketplacePath));

    // Validate each plugin referenced in marketplace
    try {
      const marketplace: MarketplaceJson = JSON.parse(
        readFileSync(marketplacePath, "utf-8")
      );

      for (const plugin of marketplace.plugins || []) {
        const normalized = plugin.source.replace(/^\.\//, "");
        const pluginPath = join(resolvedPath, normalized);

        if (!existsSync(pluginPath)) {
          violations.push({
            file: marketplacePath,
            severity: "error",
            message: `Plugin "${plugin.name}" source not found: ${plugin.source}`,
          });
          continue;
        }

        // Validate plugin.json inside plugin directory
        const pluginJsonPath = join(pluginPath, ".claude-plugin/plugin.json");
        if (existsSync(pluginJsonPath)) {
          violations.push(...validatePluginJson(pluginJsonPath));
        } else {
          violations.push({
            file: pluginPath,
            severity: "error",
            message: `Plugin "${plugin.name}" missing .claude-plugin/plugin.json`,
          });
        }

        // Validate plugin structure
        violations.push(...validatePluginStructure(pluginPath));
      }
    } catch {
      // Parse errors handled by validateMarketplaceJson
    }
  } else {
    // Look for standalone plugins
    const pluginGlob = new Glob("**/.claude-plugin/plugin.json");
    for await (const file of pluginGlob.scan({
      cwd: resolvedPath,
      absolute: true,
      onlyFiles: true,
    })) {
      if (file.includes("node_modules") || file.includes(".git")) continue;
      violations.push(...validatePluginJson(file));

      // Validate plugin structure
      const pluginPath = dirname(dirname(file)); // Go up from .claude-plugin/plugin.json
      violations.push(...validatePluginStructure(pluginPath));
    }
  }

  const hasErrors = violations.some((v) => v.severity === "error");

  return {
    passed: !hasErrors,
    violations,
  };
}

/**
 * Format path relative to cwd for cleaner output.
 */
function relativePath(absolutePath: string): string {
  return absolutePath.replace(process.cwd() + "/", "");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const paths = args.filter((arg) => !arg.startsWith("--"));
  const searchPath = paths[0] || ".";

  try {
    const stat = statSync(searchPath);
    if (!stat.isDirectory()) {
      console.error(`Error: ${searchPath} is not a directory`);
      process.exit(1);
    }
  } catch {
    console.error(`Error: Path not found: ${searchPath}`);
    process.exit(1);
  }

  console.log(`\nLinting plugins in ${relativePath(resolve(searchPath))}...\n`);

  const result = await lintPlugins(searchPath);

  // Group violations by file
  const byFile = new Map<string, Violation[]>();
  for (const v of result.violations) {
    const existing = byFile.get(v.file) || [];
    existing.push(v);
    byFile.set(v.file, existing);
  }

  // Output results
  for (const [file, fileViolations] of byFile) {
    console.log(`${relativePath(file)}:`);
    for (const v of fileViolations) {
      const prefix = v.severity === "error" ? "✗" : "△";
      console.log(`  ${prefix} ${v.message}`);
    }
    console.log();
  }

  // Summary
  const errors = result.violations.filter((v) => v.severity === "error").length;
  const warnings = result.violations.filter(
    (v) => v.severity === "warning"
  ).length;

  if (result.violations.length === 0) {
    console.log("✓ No plugin issues found\n");
  } else {
    console.log(`Found ${errors} error(s), ${warnings} warning(s)\n`);
  }

  process.exit(result.passed ? 0 : 1);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
