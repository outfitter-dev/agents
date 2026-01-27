#!/usr/bin/env bun
/**
 * Create GitHub issues for stack-feedback skill
 *
 * Usage:
 *   bun scripts/create-issue.ts --type bug --title "..." --package "@outfitter/result" ...
 *
 * Options:
 *   --type         Issue type (bug, enhancement, docs, unclear-pattern, dx,
 *                  migration-pattern, conversion-helper, compatibility, migration-docs)
 *   --title        Issue title (prefix added automatically)
 *   --submit       Actually create the issue (default: dry-run)
 *   --help         Show this help message
 *
 * All other options are passed as template fields (e.g., --package, --description)
 */

import { parseArgs } from "util";
import { templates, templateTypes, type IssueTemplate } from "../templates";

const REPO = "outfitter-dev/outfitter";

/**
 * Detect the origin repo from git remote.
 * Returns GitHub owner/repo format or null if not detectable.
 */
async function detectOriginRepo(): Promise<string | null> {
  try {
    const proc = Bun.spawn(["git", "remote", "get-url", "origin"], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      if (stderr) console.error("git remote error:", stderr.trim());
      return null;
    }

    const url = stdout.trim();

    // Handle SSH format: git@github.com:owner/repo.git
    const sshMatch = url.match(/git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/);
    if (sshMatch) {
      return sshMatch[1];
    }

    // Handle HTTPS format: https://github.com/owner/repo.git
    const httpsMatch = url.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/);
    if (httpsMatch) {
      return httpsMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

interface ParsedArgs {
  type?: string;
  title?: string;
  submit?: boolean;
  help?: boolean;
  [key: string]: string | boolean | undefined;
}

function showHelp(): void {
  console.log(`
stack-feedback: Create GitHub issues for Outfitter Stack feedback

USAGE
  bun scripts/create-issue.ts --type <type> --title <title> [--field value]... [--submit]

OPTIONS
  --type <type>     Issue type (required)
  --title <title>   Issue title without prefix (required)
  --submit          Create issue (default: dry-run mode)
  --help            Show this help

ISSUE TYPES
${templateTypes.map((t) => `  ${t}`).join("\n")}

TEMPLATE FIELDS
  Each issue type has required and optional fields. Pass them as --fieldName "value".
  Use --type <type> without other args to see required fields.

EXAMPLES
  # Dry-run a bug report
  bun scripts/create-issue.ts \\
    --type bug \\
    --title "Result.unwrap throws on valid input" \\
    --package "@outfitter/result" \\
    --description "When calling unwrap on Ok, it throws" \\
    --actual "Throws TypeError"

  # Submit an enhancement request
  bun scripts/create-issue.ts \\
    --type enhancement \\
    --title "Add Result.tap helper" \\
    --package "@outfitter/result" \\
    --description "Helper to run side effects without unwrapping" \\
    --useCase "Logging without breaking chains" \\
    --submit
`);
}

function showTypeHelp(template: IssueTemplate): void {
  console.log(`
Type: ${template.type}
Labels: ${template.labels.join(", ")}
Title prefix: ${template.titlePrefix}

Required fields:
${template.requiredFields.map((f) => `  --${f}`).join("\n")}

Optional fields:
${template.optionalFields.map((f) => `  --${f}`).join("\n")}
`);
}

function interpolate(template: string, fields: Record<string, string>): string {
  let result = template;

  // Replace all {placeholder} patterns
  const placeholderRegex = /\{(\w+)\}/g;
  result = result.replace(placeholderRegex, (match, fieldName) => {
    const value = fields[fieldName];
    if (value !== undefined && value !== "") {
      return value;
    }
    // Remove the section if the field is empty
    return "_No information provided_";
  });

  return result;
}

function escapeForShell(str: string): string {
  // Escape single quotes for shell
  return str.replace(/'/g, "'\\''");
}

function buildGhCommand(
  title: string,
  labels: string[],
  body: string
): string {
  const labelArgs = labels.map((l) => `--label '${l}'`).join(" ");
  const escapedTitle = escapeForShell(title);
  const escapedBody = escapeForShell(body);

  return `gh issue create --repo ${REPO} --title '${escapedTitle}' ${labelArgs} --body '${escapedBody}'`;
}

async function createIssue(
  title: string,
  labels: string[],
  body: string
): Promise<string> {
  const proc = Bun.spawn(
    [
      "gh",
      "issue",
      "create",
      "--repo",
      REPO,
      "--title",
      title,
      ...labels.flatMap((l) => ["--label", l]),
      "--body",
      body,
    ],
    {
      stdout: "pipe",
      stderr: "pipe",
    }
  );

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`gh issue create failed: ${stderr}`);
  }

  return stdout.trim();
}

async function main(): Promise<void> {
  // Parse known options first, collect rest as fields
  const args = process.argv.slice(2);

  // Handle --help early
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    showHelp();
    process.exit(0);
  }

  // Build options object for parseArgs
  const options: Record<string, { type: "string" | "boolean" }> = {
    type: { type: "string" },
    title: { type: "string" },
    submit: { type: "boolean" },
    help: { type: "boolean" },
  };

  // Add all possible template fields as string options
  const allFields = new Set<string>();
  for (const template of Object.values(templates)) {
    for (const field of [...template.requiredFields, ...template.optionalFields]) {
      allFields.add(field);
      options[field] = { type: "string" };
    }
  }

  let parsed: ParsedArgs;
  try {
    const result = parseArgs({
      args,
      options,
      strict: false, // Allow unknown options
    });
    parsed = result.values as ParsedArgs;
  } catch (error) {
    console.error("Error parsing arguments:", error);
    process.exit(1);
  }

  // Validate type
  const issueType = parsed.type;
  if (!issueType) {
    console.error("Error: --type is required");
    console.error(`Available types: ${templateTypes.join(", ")}`);
    process.exit(1);
  }

  const template = templates[issueType];
  if (!template) {
    console.error(`Error: Unknown type '${issueType}'`);
    console.error(`Available types: ${templateTypes.join(", ")}`);
    process.exit(1);
  }

  // If only type provided, show type help
  if (!parsed.title && Object.keys(parsed).length <= 1) {
    showTypeHelp(template);
    process.exit(0);
  }

  // Validate title
  if (!parsed.title) {
    console.error("Error: --title is required");
    process.exit(1);
  }

  // Collect field values
  const fields: Record<string, string> = {};
  for (const field of [...template.requiredFields, ...template.optionalFields]) {
    const value = parsed[field];
    if (typeof value === "string") {
      fields[field] = value;
    }
  }

  // Validate required fields
  const missingFields = template.requiredFields.filter(
    (f) => !fields[f] || fields[f] === ""
  );
  if (missingFields.length > 0) {
    console.error(`Error: Missing required fields: ${missingFields.join(", ")}`);
    showTypeHelp(template);
    process.exit(1);
  }

  // Build issue
  const fullTitle = `${template.titlePrefix} ${parsed.title}`;
  let body = interpolate(template.bodyTemplate, fields);

  // Add origin repo context if detectable
  const originRepo = await detectOriginRepo();
  if (originRepo && originRepo !== REPO) {
    // Insert before the footer
    const footerMarker = "---\n\n*Created via";
    if (body.includes(footerMarker)) {
      body = body.replace(
        footerMarker,
        `## Discovered In\n\n[\`${originRepo}\`](https://github.com/${originRepo})\n\n${footerMarker}`
      );
    }
  }

  if (parsed.submit) {
    // Submit mode: actually create the issue
    try {
      const url = await createIssue(fullTitle, template.labels, body);
      console.log(`Created issue: ${url}`);
    } catch (error) {
      console.error("Failed to create issue:", error);
      process.exit(1);
    }
  } else {
    // Dry-run mode: output JSON with command
    const command = buildGhCommand(fullTitle, template.labels, body);
    const output = {
      command,
      title: fullTitle,
      labels: template.labels,
      body,
    };
    console.log(JSON.stringify(output, null, 2));
  }
}

main();
