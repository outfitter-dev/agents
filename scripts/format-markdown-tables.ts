#!/usr/bin/env bun
/**
 * Format markdown tables for consistent spacing and alignment.
 *
 * Fixes:
 * - Separator lines: `|---|---|` -> `| --- | --- |`
 * - Column alignment: Pads cells to match widest content in each column
 *
 * Usage:
 *   bun scripts/format-markdown-tables.ts [path]           # Dry-run (lint mode)
 *   bun scripts/format-markdown-tables.ts --fix [path]     # Auto-fix
 *   bun scripts/format-markdown-tables.ts --check [path]   # Exit 1 if issues found
 *
 * Examples:
 *   bun scripts/format-markdown-tables.ts                           # Check all .md files
 *   bun scripts/format-markdown-tables.ts baselayer/                 # Check specific dir
 *   bun scripts/format-markdown-tables.ts --fix agent-kit/          # Fix specific dir
 *   bun scripts/format-markdown-tables.ts --fix path/to/file.md     # Fix single file
 */

import { Glob } from "bun";
import { statSync } from "fs";

interface TableIssue {
  file: string;
  line: number;
  message: string;
  before: string;
  after: string;
}

interface FormatResult {
  content: string;
  issues: TableIssue[];
  changed: boolean;
}

// Match a table separator line (line with only |, -, :, and spaces)
const SEPARATOR_PATTERN = /^\|[\s\-:|]+\|$/;

// Match a table row (starts and ends with |)
const TABLE_ROW_PATTERN = /^\|.+\|$/;

function isTableRow(line: string): boolean {
  return TABLE_ROW_PATTERN.test(line.trim());
}

function isSeparatorRow(line: string): boolean {
  return SEPARATOR_PATTERN.test(line.trim());
}

function parseCells(line: string): string[] {
  // Remove leading/trailing pipes and split by |
  const trimmed = line.trim();
  const inner = trimmed.slice(1, -1); // Remove first and last |
  return inner.split("|").map((cell) => cell.trim());
}

function parseSeparatorCell(cell: string): { align: "left" | "center" | "right" | "none"; width: number } {
  const trimmed = cell.trim();
  const leftColon = trimmed.startsWith(":");
  const rightColon = trimmed.endsWith(":");
  const dashes = trimmed.replace(/:/g, "");

  let align: "left" | "center" | "right" | "none" = "none";
  if (leftColon && rightColon) align = "center";
  else if (leftColon) align = "left";
  else if (rightColon) align = "right";

  return { align, width: dashes.length };
}

function formatSeparatorCell(align: "left" | "center" | "right" | "none", width: number): string {
  const dashes = "-".repeat(Math.max(width, 3));
  switch (align) {
    case "left": return `:${dashes}`;
    case "right": return `${dashes}:`;
    case "center": return `:${dashes}:`;
    default: return dashes;
  }
}

function formatTable(lines: string[], startLine: number, filePath: string): { formatted: string[]; issues: TableIssue[] } {
  const issues: TableIssue[] = [];

  if (lines.length < 2) {
    return { formatted: lines, issues };
  }

  // Parse all rows to find column widths
  const allCells: string[][] = [];
  let separatorIndex = -1;
  const separatorAligns: ("left" | "center" | "right" | "none")[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isSeparatorRow(line)) {
      separatorIndex = i;
      const sepCells = parseCells(line);
      for (const cell of sepCells) {
        const { align } = parseSeparatorCell(cell);
        separatorAligns.push(align);
      }
      allCells.push(sepCells.map(() => "---")); // Placeholder
    } else {
      allCells.push(parseCells(line));
    }
  }

  if (separatorIndex === -1) {
    return { formatted: lines, issues };
  }

  // Calculate max width for each column
  const columnCount = Math.max(...allCells.map((row) => row.length));
  const columnWidths: number[] = new Array(columnCount).fill(3); // Minimum 3 for ---

  for (const row of allCells) {
    for (let col = 0; col < row.length; col++) {
      const cell = row[col];
      if (cell !== "---") { // Skip separator placeholders
        columnWidths[col] = Math.max(columnWidths[col], cell.length);
      }
    }
  }

  // Format each row
  const formatted: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    let formattedLine: string;

    if (i === separatorIndex) {
      // Format separator row
      const sepParts: string[] = [];
      for (let col = 0; col < columnCount; col++) {
        const align = separatorAligns[col] || "none";
        const sepCell = formatSeparatorCell(align, columnWidths[col]);
        sepParts.push(sepCell);
      }
      formattedLine = "| " + sepParts.join(" | ") + " |";
    } else {
      // Format content row
      const cells = allCells[i];
      const paddedCells: string[] = [];
      for (let col = 0; col < columnCount; col++) {
        const cell = cells[col] || "";
        const padded = cell.padEnd(columnWidths[col]);
        paddedCells.push(padded);
      }
      formattedLine = "| " + paddedCells.join(" | ") + " |";
    }

    if (formattedLine !== originalLine) {
      issues.push({
        file: filePath,
        line: startLine + i,
        message: "Table formatting",
        before: originalLine,
        after: formattedLine,
      });
    }

    formatted.push(formattedLine);
  }

  return { formatted, issues };
}

function findAndFormatTables(content: string, filePath: string): FormatResult {
  const lines = content.split("\n");
  const result: string[] = [];
  const allIssues: TableIssue[] = [];

  let i = 0;
  let inCodeBlock = false;

  while (i < lines.length) {
    const line = lines[i];

    // Track code blocks
    if (line.trim().startsWith("```") || line.trim().startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      i++;
      continue;
    }

    // Skip content inside code blocks
    if (inCodeBlock) {
      result.push(line);
      i++;
      continue;
    }

    // Check if this starts a table
    if (isTableRow(line)) {
      // Collect all consecutive table rows
      const tableLines: string[] = [];
      const tableStart = i + 1; // 1-indexed line number

      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }

      // Format the table
      const { formatted, issues } = formatTable(tableLines, tableStart, filePath);
      result.push(...formatted);
      allIssues.push(...issues);
    } else {
      result.push(line);
      i++;
    }
  }

  const newContent = result.join("\n");
  return {
    content: newContent,
    issues: allIssues,
    changed: newContent !== content,
  };
}

async function processFile(filePath: string, fix: boolean): Promise<TableIssue[]> {
  const content = await Bun.file(filePath).text();
  const { content: formatted, issues, changed } = findAndFormatTables(content, filePath);

  if (fix && changed) {
    await Bun.write(filePath, formatted);
  }

  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes("--fix");
  const check = args.includes("--check");
  const paths = args.filter((arg) => !arg.startsWith("--"));
  const searchPath = paths[0] || ".";

  // Check if searchPath is a file or directory
  let files: string[] = [];

  try {
    const stat = statSync(searchPath);
    if (stat.isFile()) {
      files = [searchPath];
    } else {
      const glob = new Glob("**/*.md");
      for await (const file of glob.scan({
        cwd: searchPath,
        absolute: true,
        onlyFiles: true,
      })) {
        if (
          file.includes("node_modules") ||
          file.includes(".git") ||
          file.includes(".beads")
        ) {
          continue;
        }
        files.push(file);
      }
    }
  } catch {
    console.error(`Error: Path not found: ${searchPath}`);
    process.exit(1);
  }

  let totalIssues = 0;
  let filesWithIssues = 0;

  for (const filePath of files) {
    const issues = await processFile(filePath, fix);

    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.length;

      if (!fix) {
        const relativePath = filePath.replace(process.cwd() + "/", "");
        console.log(`\n${relativePath}:`);
        for (const issue of issues) {
          console.log(`  Line ${issue.line}:`);
          console.log(`    - ${issue.before}`);
          console.log(`    + ${issue.after}`);
        }
      } else {
        const relativePath = filePath.replace(process.cwd() + "/", "");
        console.log(`Fixed: ${relativePath} (${issues.length} tables)`);
      }
    }
  }

  console.log("");
  if (fix) {
    if (totalIssues > 0) {
      console.log(`Fixed ${totalIssues} table(s) in ${filesWithIssues} file(s)`);
    } else {
      console.log(`Checked ${files.length} file(s) - no issues found`);
    }
  } else {
    if (totalIssues > 0) {
      console.log(`Found ${totalIssues} table(s) to format in ${filesWithIssues} file(s)`);
      console.log("Run with --fix to auto-fix");
      if (check) {
        process.exit(1);
      }
    } else {
      console.log(`Checked ${files.length} file(s) - all tables formatted correctly`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
