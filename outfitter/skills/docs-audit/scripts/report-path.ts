#!/usr/bin/env bun
/**
 * report-path.ts - Generate report paths with timestamp and session ID
 *
 * Constructs standardized report filenames following the pattern:
 *   {timestamp}-{type}-{sessionShort}.md
 *   {timestamp}-{type}/  (for multi-file)
 *
 * Usage:
 *   ./report-path.ts                           # Uses CLAUDE_SESSION_ID env var
 *   ./report-path.ts --session abc123-def456   # Explicit session ID
 *   ./report-path.ts --type docs-audit         # Report type (default: docs-audit)
 *   ./report-path.ts --multi                   # Output directory path instead of file
 *   ./report-path.ts --base .pack/reports      # Base directory (default: .pack/reports)
 *   ./report-path.ts --json                    # Output as JSON with all components
 *   ./report-path.ts --scaffold                # Create directory structure
 *   ./report-path.ts --scaffold --multi        # Scaffold multi-file with placeholders
 */

import { parseArgs } from "util";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

/**
 * Components of a report path.
 */
interface ReportPathComponents {
  /** Timestamp as YYYYMMDDhhmm */
  timestamp: string;
  /** ISO 8601 timestamp for frontmatter */
  timestampISO: string;
  /** Report type (e.g., "docs-audit") */
  type: string;
  /** Full session ID (or empty) */
  sessionFull: string;
  /** First 8 chars of session ID (or empty) */
  sessionShort: string;
  /** Just the filename */
  filename: string;
  /** Full path including base */
  path: string;
  /** Whether this is a directory mode report */
  isMulti: boolean;
}

/**
 * Gets current timestamp in both formatted and ISO formats.
 * @returns Object with formatted (YYYYMMDDhhmm) and ISO timestamps
 */
function getTimestamp(): { formatted: string; iso: string } {
  const now = new Date();
  const formatted = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");

  return {
    formatted,
    iso: now.toISOString(),
  };
}

/**
 * Truncates session ID to first 8 characters.
 * @param sessionId - Full session ID
 * @returns First 8 characters of session ID
 */
function getShortSessionId(sessionId: string): string {
  if (!sessionId) return "";
  // Handle UUIDs (take first segment) or just first 8 chars
  const firstSegment = sessionId.split("-")[0];
  return firstSegment.length >= 8 ? firstSegment.slice(0, 8) : firstSegment;
}

/**
 * Builds a filename from components.
 * @param timestamp - Formatted timestamp
 * @param type - Report type
 * @param sessionShort - Short session ID
 * @param isMulti - Whether this is a multi-file report
 * @returns Filename or directory name
 */
function buildFilename(
  timestamp: string,
  type: string,
  sessionShort: string,
  isMulti: boolean
): string {
  // Multi-file mode: no session in directory name (session tracked in frontmatter)
  // Single-file mode: session suffix for parallel disambiguation
  if (isMulti) {
    return `${timestamp}-${type}`;
  }
  const parts = [timestamp, type];
  if (sessionShort) {
    parts.push(sessionShort);
  }
  return `${parts.join("-")}.md`;
}

// Multi-file report structure
const MULTI_FILE_STRUCTURE = [
  { name: "summary.md", description: "Overall findings and links to other reports" },
  { name: "markdown-docs.md", description: "Analysis of docs/, README, etc." },
  { name: "docstrings.md", description: "TSDoc/JSDoc/docstring coverage" },
  { name: "recommendations.md", description: "Prioritized actionable recommendations" },
  { name: "meta.json", description: "Session metadata (structured)" },
] as const;

/**
 * Generates YAML frontmatter for report file.
 * @param components - Report path components
 * @param fileType - Type of file within report
 * @returns Frontmatter string
 */
function generateFrontmatter(components: ReportPathComponents, fileType: string): string {
  return `---
type: ${components.type}
file_type: ${fileType}
generated: ${components.timestampISO}
timestamp: "${components.timestamp}"
session: "${components.sessionFull}"
session_short: "${components.sessionShort}"
status: pending
---

`;
}

/**
 * Generates meta.json content for multi-file reports.
 * @param components - Report path components
 * @returns JSON string
 */
function generateMetaJson(components: ReportPathComponents): string {
  return JSON.stringify(
    {
      type: components.type,
      generated: components.timestampISO,
      timestamp: components.timestamp,
      session: components.sessionFull,
      session_short: components.sessionShort,
      path: components.path,
      status: "pending",
      files: MULTI_FILE_STRUCTURE.map((f) => f.name),
    },
    null,
    2
  );
}

/**
 * Creates directory structure and placeholder files for report.
 * @param components - Report path components
 * @returns Array of created paths
 */
async function scaffoldReport(components: ReportPathComponents): Promise<string[]> {
  const created: string[] = [];

  if (components.isMulti) {
    // Create directory and placeholder files
    await mkdir(components.path, { recursive: true });
    created.push(components.path);

    for (const file of MULTI_FILE_STRUCTURE) {
      const filePath = `${components.path}/${file.name}`;
      if (!existsSync(filePath)) {
        let content: string;

        if (file.name.endsWith(".json")) {
          // JSON files get structured metadata
          content = generateMetaJson(components);
        } else {
          // Markdown files get frontmatter + placeholder
          const fileType = file.name.replace(".md", "");
          const frontmatter = generateFrontmatter(components, fileType);
          content = `${frontmatter}# ${file.description}\n\n<!-- TODO: Populate during audit -->\n`;
        }

        await writeFile(filePath, content);
        created.push(filePath);
      }
    }
  } else {
    // Create base directory only
    const baseDir = components.path.substring(0, components.path.lastIndexOf("/"));
    await mkdir(baseDir, { recursive: true });
    created.push(baseDir);
  }

  return created;
}

/**
 * Generates report path components from options.
 * @param options - Report path options
 * @returns Report path components
 */
function generateReportPath(options: {
  session?: string;
  type?: string;
  base?: string;
  multi?: boolean;
}): ReportPathComponents {
  const sessionFull = options.session || process.env.CLAUDE_SESSION_ID || "";
  const sessionShort = getShortSessionId(sessionFull);
  const type = options.type || "docs-audit";
  const base = options.base || ".pack/reports";
  const isMulti = options.multi || false;

  const { formatted: timestamp, iso: timestampISO } = getTimestamp();
  const filename = buildFilename(timestamp, type, sessionShort, isMulti);
  const path = `${base}/${filename}`;

  return {
    timestamp,
    timestampISO,
    type,
    sessionFull,
    sessionShort,
    filename,
    path,
    isMulti,
  };
}

// Main
async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      session: { type: "string", short: "s" },
      type: { type: "string", short: "t", default: "docs-audit" },
      base: { type: "string", short: "b", default: ".pack/reports" },
      multi: { type: "boolean", short: "m" },
      scaffold: { type: "boolean" },
      json: { type: "boolean", short: "j" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
report-path.ts - Generate report paths with timestamp and session ID

Usage:
  ./report-path.ts [options]

Options:
  --session, -s <id>   Session ID (defaults to CLAUDE_SESSION_ID env var)
  --type, -t <type>    Report type (default: docs-audit)
  --base, -b <dir>     Base directory (default: .pack/reports)
  --multi, -m          Directory mode (no session suffix, files inside)
  --scaffold           Create directory structure (with placeholders for --multi)
  --json, -j           Output as JSON with all components
  --help, -h           Show this help

Examples:
  ./report-path.ts
  # Output: .pack/reports/202601251900-docs-audit.md

  ./report-path.ts --session abc12345-def-ghi
  # Output: .pack/reports/202601251900-docs-audit-abc12345.md

  ./report-path.ts --multi
  # Output: .pack/reports/202601251900-docs-audit

  ./report-path.ts --scaffold --multi --session abc123
  # Creates: .pack/reports/202601251900-docs-audit/
  #          .pack/reports/202601251900-docs-audit/summary.md
  #          .pack/reports/202601251900-docs-audit/markdown-docs.md
  #          ...

  ./report-path.ts --json
  # Output: {"timestamp":"202601251900","sessionShort":"abc12345",...}
`);
    process.exit(0);
  }

  const result = generateReportPath({
    session: values.session,
    type: values.type,
    base: values.base,
    multi: values.multi,
  });

  if (values.scaffold) {
    const created = await scaffoldReport(result);
    if (values.json) {
      console.log(JSON.stringify({ ...result, scaffolded: created }, null, 2));
    } else {
      console.log(`Scaffolded: ${result.path}`);
      for (const path of created) {
        console.log(`  ${path}`);
      }
    }
  } else if (values.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.path);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
