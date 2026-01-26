#!/usr/bin/env bun
/**
 * discover-docs.ts - Markdown documentation discovery with git metadata
 *
 * Extracts a compact manifest of all markdown files with git history,
 * activity status, and related code file tracking for staleness detection.
 *
 * Usage:
 *   ./discover-docs.ts                      # All markdown files
 *   ./discover-docs.ts --path src/          # Specific directory
 *   ./discover-docs.ts --limit 20           # Limit results
 *   ./discover-docs.ts --sort staleness     # Sort by staleness (default)
 *   ./discover-docs.ts --sort alpha         # Sort alphabetically
 *   ./discover-docs.ts --format json        # JSON output (default)
 *   ./discover-docs.ts --format text        # Human-readable output
 */

import { $ } from "bun";
import { parseArgs } from "util";
import { stat } from "node:fs/promises";

/**
 * Documentation file with git metadata.
 */
interface DocFile {
  /** File path relative to repo root */
  path: string;
  /** Short SHA of last commit touching this file */
  lastCommitSha: string;
  /** ISO date of last commit */
  lastCommitDate: string;
  /** Author name of last commit */
  lastAuthor: string;
  /** Days since last modification */
  daysAgo: number;
  /** Activity classification based on age */
  activityStatus: "active" | "recent" | "idle" | "stale" | "ancient";
  /** Line count */
  lines: number;
  /** File size in bytes */
  bytes: number;
  /** Code files modified in same commits */
  relatedCodeFiles: string[];
}

/**
 * Discovery manifest with all markdown files.
 */
interface Manifest {
  /** Generation timestamp */
  generated: string;
  /** Repository root path */
  repoRoot: string;
  /** Whether this is a git repository */
  isGitRepo: boolean;
  /** Total files discovered */
  totalFiles: number;
  /** Documentation files with metadata */
  files: DocFile[];
}

// Activity status thresholds (days)
const ACTIVITY_THRESHOLDS = {
  active: 7,
  recent: 30,
  idle: 90,
  stale: 365,
  // ancient: > 365
} as const;

/**
 * Gets activity status classification based on days since last modification.
 * @param daysAgo - Days since last modification
 * @returns Activity status classification
 */
function getActivityStatus(daysAgo: number): DocFile["activityStatus"] {
  if (daysAgo < ACTIVITY_THRESHOLDS.active) return "active";
  if (daysAgo < ACTIVITY_THRESHOLDS.recent) return "recent";
  if (daysAgo < ACTIVITY_THRESHOLDS.idle) return "idle";
  if (daysAgo < ACTIVITY_THRESHOLDS.stale) return "stale";
  return "ancient";
}

function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
}

async function isGitRepo(): Promise<boolean> {
  try {
    await $`git rev-parse --is-inside-work-tree`.quiet();
    return true;
  } catch {
    return false;
  }
}

async function getRepoRoot(): Promise<string> {
  try {
    const result = await $`git rev-parse --show-toplevel`.quiet();
    return result.text().trim();
  } catch {
    return process.cwd();
  }
}

async function findMarkdownFiles(searchPath?: string): Promise<string[]> {
  const pattern = searchPath
    ? `${searchPath.replace(/\/$/, "")}/**/*.md*`
    : "**/*.md*";

  try {
    // Use git ls-files if in a git repo (respects .gitignore)
    const result = await $`git ls-files --cached --others --exclude-standard "${pattern}"`.quiet();
    return result
      .text()
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  } catch {
    // Fallback to find command
    const result = await $`find ${searchPath || "."} -name "*.md" -o -name "*.mdx" 2>/dev/null`.quiet();
    return result
      .text()
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  }
}

async function getGitInfo(
  filePath: string
): Promise<Pick<DocFile, "lastCommitSha" | "lastCommitDate" | "lastAuthor" | "daysAgo">> {
  try {
    // Get last commit info: short SHA, ISO date, author name
    const result = await $`git log -1 --format="%h|%aI|%an" -- "${filePath}"`.quiet();
    const output = result.text().trim();

    if (!output) {
      // File not yet committed
      return {
        lastCommitSha: "uncommitted",
        lastCommitDate: new Date().toISOString(),
        lastAuthor: "unknown",
        daysAgo: 0,
      };
    }

    const [sha, date, author] = output.split("|");
    const commitDate = new Date(date);
    const daysAgo = daysBetween(commitDate, new Date());

    return {
      lastCommitSha: sha,
      lastCommitDate: date,
      lastAuthor: author,
      daysAgo,
    };
  } catch {
    return {
      lastCommitSha: "unknown",
      lastCommitDate: new Date().toISOString(),
      lastAuthor: "unknown",
      daysAgo: 0,
    };
  }
}

async function getFileStats(filePath: string): Promise<Pick<DocFile, "lines" | "bytes">> {
  try {
    const stats = await stat(filePath);
    const bytes = stats.size;

    // Count lines
    const file = Bun.file(filePath);
    const content = await file.text();
    const lines = content.split("\n").length;

    return { lines, bytes };
  } catch {
    return { lines: 0, bytes: 0 };
  }
}

async function getRelatedCodeFiles(docPath: string): Promise<string[]> {
  try {
    // Find code files that have been modified in the same commits as this doc
    // Look at last 10 commits that touched this file
    const result = await $`git log -10 --format="%H" -- "${docPath}"`.quiet();
    const commits = result.text().trim().split("\n").filter(Boolean);

    if (commits.length === 0) return [];

    const codeExtensions = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".py",
      ".rs",
      ".go",
      ".java",
      ".rb",
      ".c",
      ".cpp",
      ".h",
    ];
    const relatedFiles = new Set<string>();

    for (const commit of commits.slice(0, 5)) {
      // Limit to 5 commits for speed
      try {
        const filesResult = await $`git diff-tree --no-commit-id --name-only -r ${commit}`.quiet();
        const files = filesResult.text().trim().split("\n");

        for (const file of files) {
          if (file !== docPath && codeExtensions.some((ext) => file.endsWith(ext))) {
            relatedFiles.add(file);
          }
        }
      } catch {
        // Skip this commit if we can't get its files
      }
    }

    return Array.from(relatedFiles).slice(0, 10); // Limit to 10 related files
  } catch {
    return [];
  }
}

async function analyzeFile(filePath: string, useGit: boolean): Promise<DocFile> {
  const [gitInfo, fileStats, relatedCodeFiles] = await Promise.all([
    useGit ? getGitInfo(filePath) : Promise.resolve({
      lastCommitSha: "n/a",
      lastCommitDate: new Date().toISOString(),
      lastAuthor: "n/a",
      daysAgo: 0,
    }),
    getFileStats(filePath),
    useGit ? getRelatedCodeFiles(filePath) : Promise.resolve([]),
  ]);

  return {
    path: filePath,
    ...gitInfo,
    activityStatus: getActivityStatus(gitInfo.daysAgo),
    ...fileStats,
    relatedCodeFiles,
  };
}

function sortFiles(files: DocFile[], sortBy: "staleness" | "alpha"): DocFile[] {
  if (sortBy === "alpha") {
    return files.sort((a, b) => a.path.localeCompare(b.path));
  }

  // Sort by staleness (most stale first)
  return files.sort((a, b) => b.daysAgo - a.daysAgo);
}

function formatText(manifest: Manifest): string {
  const lines: string[] = [
    `Documentation Audit Discovery`,
    `Generated: ${manifest.generated}`,
    `Repo: ${manifest.repoRoot}`,
    `Git: ${manifest.isGitRepo ? "yes" : "no"}`,
    `Total files: ${manifest.totalFiles}`,
    ``,
    `Files:`,
    ``,
  ];

  const statusEmoji: Record<DocFile["activityStatus"], string> = {
    active: "🟢",
    recent: "🟡",
    idle: "🟠",
    stale: "🔴",
    ancient: "⚫",
  };

  for (const file of manifest.files) {
    lines.push(`${statusEmoji[file.activityStatus]} ${file.path}`);
    lines.push(`   SHA: ${file.lastCommitSha} | ${file.daysAgo}d ago | ${file.lastAuthor}`);
    lines.push(`   Size: ${file.lines} lines, ${file.bytes} bytes`);
    if (file.relatedCodeFiles.length > 0) {
      lines.push(`   Related: ${file.relatedCodeFiles.slice(0, 3).join(", ")}${file.relatedCodeFiles.length > 3 ? "..." : ""}`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

// Main
async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      path: { type: "string", short: "p" },
      limit: { type: "string", short: "l" },
      sort: { type: "string", short: "s", default: "staleness" },
      format: { type: "string", short: "f", default: "json" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
discover-docs.ts - Markdown documentation discovery

Usage:
  ./discover-docs.ts [options]

Options:
  --path, -p <dir>     Search in specific directory
  --limit, -l <n>      Limit number of results
  --sort, -s <by>      Sort by: staleness (default), alpha
  --format, -f <fmt>   Output format: json (default), text
  --help, -h           Show this help
`);
    process.exit(0);
  }

  const useGit = await isGitRepo();
  const repoRoot = await getRepoRoot();
  const files = await findMarkdownFiles(values.path);

  // Analyze files in parallel (batched for large repos)
  const batchSize = 20;
  const docFiles: DocFile[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((f) => analyzeFile(f, useGit)));
    docFiles.push(...results);
  }

  // Sort
  const sortBy = (values.sort === "alpha" ? "alpha" : "staleness") as "staleness" | "alpha";
  const sorted = sortFiles(docFiles, sortBy);

  // Limit
  const limit = values.limit ? parseInt(values.limit, 10) : sorted.length;
  const limited = sorted.slice(0, limit);

  const manifest: Manifest = {
    generated: new Date().toISOString(),
    repoRoot,
    isGitRepo: useGit,
    totalFiles: files.length,
    files: limited,
  };

  if (values.format === "text") {
    console.log(formatText(manifest));
  } else {
    console.log(JSON.stringify(manifest, null, 2));
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
