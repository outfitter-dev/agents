#!/usr/bin/env bun
/**
 * Migrate SKILL.md files to move top-level `version` to `metadata.version`
 * per agentskills.io specification.
 *
 * Usage:
 *   bun scripts/migrate-skill-version.ts [--dry-run] [path]
 */

import { Glob } from "bun";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function relativePath(absolutePath: string): string {
  return absolutePath.replace(process.cwd() + "/", "");
}

function migrateFile(filePath: string, dryRun: boolean): boolean {
  const content = readFileSync(filePath, "utf-8");

  // Check if file has frontmatter
  if (!content.startsWith("---\n")) {
    return false;
  }

  const endIndex = content.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return false;
  }

  const frontmatter = content.slice(4, endIndex);
  const body = content.slice(endIndex + 5);

  // Check if there's a top-level version
  const versionMatch = frontmatter.match(/^version:\s*(.+)$/m);
  if (!versionMatch) {
    return false;
  }

  const version = versionMatch[1].trim().replace(/^["']|["']$/g, "");

  // Remove top-level version
  let newFrontmatter = frontmatter.replace(/^version:\s*.+\n?/m, "");

  // Check if metadata exists
  const metadataMatch = newFrontmatter.match(/^metadata:\s*$/m);

  if (metadataMatch) {
    // Find metadata section and add version to it
    const metadataIndex = newFrontmatter.indexOf("metadata:");
    const afterMetadata = newFrontmatter.slice(metadataIndex + 9);

    // Find the indentation of metadata items
    const indentMatch = afterMetadata.match(/\n(\s+)\S/);
    const indent = indentMatch ? indentMatch[1] : "  ";

    // Insert version after metadata:
    newFrontmatter =
      newFrontmatter.slice(0, metadataIndex + 9) +
      `\n${indent}version: "${version}"` +
      afterMetadata;
  } else {
    // Add metadata section with version
    newFrontmatter = newFrontmatter.trimEnd() + `\nmetadata:\n  version: "${version}"\n`;
  }

  // Clean up any double newlines in frontmatter
  newFrontmatter = newFrontmatter.replace(/\n{3,}/g, "\n\n").trim();

  const newContent = `---\n${newFrontmatter}\n---\n${body}`;

  if (dryRun) {
    console.log(`Would update: ${relativePath(filePath)}`);
    console.log(`  version: ${version} -> metadata.version: "${version}"`);
  } else {
    writeFileSync(filePath, newContent);
    console.log(`Updated: ${relativePath(filePath)}`);
  }

  return true;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const paths = args.filter((arg) => !arg.startsWith("--"));
  const searchPath = resolve(paths[0] || ".");

  console.log(
    `\n${dryRun ? "[DRY RUN] " : ""}Migrating SKILL.md version to metadata.version...\n`
  );

  const glob = new Glob("**/SKILL.md");
  let updated = 0;
  let skipped = 0;

  for await (const file of glob.scan({
    cwd: searchPath,
    absolute: true,
    onlyFiles: true,
  })) {
    if (
      file.includes("node_modules") ||
      file.includes(".git") ||
      file.includes(".archive") ||
      file.includes("templates/")
    ) {
      continue;
    }

    if (migrateFile(file, dryRun)) {
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Done.`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped} (no top-level version)\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
