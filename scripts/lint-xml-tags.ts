#!/usr/bin/env bun
/**
 * Lint XML tags in markdown files for proper blank line formatting.
 *
 * Checks that skill/instruction XML tags have proper blank lines for GitHub rendering:
 * - Opening XML tags have a blank line after them
 * - Closing XML tags have a blank line before them
 *
 * Ignores HTML tags and content inside code blocks.
 *
 * Usage:
 *   bun scripts/lint-xml-tags.ts [path]
 *   bun scripts/lint-xml-tags.ts --fix [path]
 *
 * Examples:
 *   bun scripts/lint-xml-tags.ts                    # Lint all .md files
 *   bun scripts/lint-xml-tags.ts outfitter/         # Lint specific directory
 *   bun scripts/lint-xml-tags.ts path/to/file.md    # Lint single file
 *   bun scripts/lint-xml-tags.ts --fix              # Auto-fix all issues
 *   bun scripts/lint-xml-tags.ts --fix file.md      # Fix single file
 */

import { Glob } from "bun";
import { statSync } from "fs";

/**
 * An XML tag formatting violation in a markdown file.
 */
interface Violation {
  /** File path where violation was found */
  file: string;
  /** Line number of the violation */
  line: number;
  /** The XML tag that has the issue */
  tag: string;
  /** Whether it's an opening or closing tag */
  type: "opening" | "closing";
  /** Description of the formatting issue */
  message: string;
}

// XML tag patterns - matches tags like <when_to_use>, </rules>, etc.
const OPENING_TAG = /^(\s*)<([a-z][a-z0-9_-]*)>\s*$/;
const CLOSING_TAG = /^(\s*)<\/([a-z][a-z0-9_-]*)>\s*$/;

// HTML tags to ignore - these are meant for inline/code use, not skill structure
const HTML_TAGS = new Set([
  // Common HTML elements
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
]);

// Additional tags to ignore (example/documentation patterns)
const IGNORE_TAGS = new Set([
  "example",
  "commentary",
  "turn",
  "user",
  "assistant",
  "snapshot-commit",
]);

function isBlankLine(line: string): boolean {
  return line.trim() === "";
}

function lintFile(content: string, filePath: string): Violation[] {
  const lines = content.split("\n");
  const violations: Violation[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Track code blocks (``` or ~~~)
    if (line.trim().startsWith("```") || line.trim().startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip content inside code blocks
    if (inCodeBlock) {
      continue;
    }

    // Check opening tags
    const openMatch = line.match(OPENING_TAG);
    if (openMatch) {
      const tag = openMatch[2];
      if (!IGNORE_TAGS.has(tag) && !HTML_TAGS.has(tag)) {
        const nextLine = lines[i + 1];
        if (nextLine !== undefined && !isBlankLine(nextLine)) {
          violations.push({
            file: filePath,
            line: lineNum,
            tag: `<${tag}>`,
            type: "opening",
            message: `Opening tag <${tag}> should have a blank line after it`,
          });
        }
      }
    }

    // Check closing tags
    const closeMatch = line.match(CLOSING_TAG);
    if (closeMatch) {
      const tag = closeMatch[2];
      if (!IGNORE_TAGS.has(tag) && !HTML_TAGS.has(tag)) {
        const prevLine = lines[i - 1];
        if (prevLine !== undefined && !isBlankLine(prevLine)) {
          violations.push({
            file: filePath,
            line: lineNum,
            tag: `</${tag}>`,
            type: "closing",
            message: `Closing tag </${tag}> should have a blank line before it`,
          });
        }
      }
    }
  }

  return violations;
}

function fixFile(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = result[result.length - 1];

    // Track code blocks (``` or ~~~)
    if (line.trim().startsWith("```") || line.trim().startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    // Skip modifications inside code blocks
    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Check if this is a closing tag that needs a blank line before
    const closeMatch = line.match(CLOSING_TAG);
    if (closeMatch && !IGNORE_TAGS.has(closeMatch[2]) && !HTML_TAGS.has(closeMatch[2])) {
      if (prevLine !== undefined && !isBlankLine(prevLine)) {
        result.push("");
      }
    }

    result.push(line);

    // Check if this is an opening tag that needs a blank line after
    const openMatch = line.match(OPENING_TAG);
    if (openMatch && !IGNORE_TAGS.has(openMatch[2]) && !HTML_TAGS.has(openMatch[2])) {
      const nextLine = lines[i + 1];
      if (nextLine !== undefined && !isBlankLine(nextLine)) {
        result.push("");
      }
    }
  }

  return result.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes("--fix");
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
        // Skip node_modules and other common excludes
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

  let totalViolations = 0;
  let fixedFiles = 0;

  for (const filePath of files) {
    const content = await Bun.file(filePath).text();
    const violations = lintFile(content, filePath);

    if (violations.length > 0) {
      if (fix) {
        const fixed = fixFile(content);
        await Bun.write(filePath, fixed);
        console.log(`Fixed: ${filePath} (${violations.length} issues)`);
        fixedFiles++;
      } else {
        for (const v of violations) {
          const relativePath = v.file.replace(process.cwd() + "/", "");
          console.log(`${relativePath}:${v.line}: ${v.message}`);
        }
      }
      totalViolations += violations.length;
    }
  }

  console.log("");
  if (fix) {
    console.log(`Fixed ${totalViolations} issues in ${fixedFiles} files`);
  } else if (totalViolations > 0) {
    console.log(`Found ${totalViolations} issues in ${files.length} files`);
    console.log("Run with --fix to auto-fix");
    process.exit(1);
  } else {
    console.log(`Checked ${files.length} files - no issues found`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
