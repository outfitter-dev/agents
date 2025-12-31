#!/usr/bin/env bun

import { parseArgs } from "node:util";
import type { Category, OutputFormat, ToolCheckResult } from "./types.ts";
import { checkSearchTools } from "./checkers/search.ts";
import { checkJsonTools } from "./checkers/json.ts";
import { checkViewerTools } from "./checkers/viewers.ts";
import { checkNavigationTools } from "./checkers/navigation.ts";
import { checkHttpTools } from "./checkers/http.ts";

interface CheckerFunction {
  (): Promise<ToolCheckResult[]>;
}

const CHECKERS: Record<Category, CheckerFunction> = {
  search: checkSearchTools,
  json: checkJsonTools,
  viewers: checkViewerTools,
  navigation: checkNavigationTools,
  http: checkHttpTools,
};

/**
 * Parse command-line arguments
 */
function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      category: {
        type: "string",
        short: "c",
      },
      format: {
        type: "string",
        short: "f",
        default: "text",
      },
    },
    strict: true,
    allowPositionals: false,
  });

  const category = values.category as Category | undefined;
  const format = (values.format || "text") as OutputFormat;

  // Validate category if provided
  if (category && !Object.keys(CHECKERS).includes(category)) {
    console.error(
      `Invalid category: ${category}. Valid categories: ${Object.keys(CHECKERS).join(", ")}`,
    );
    process.exit(1);
  }

  // Validate format
  if (format !== "json" && format !== "text") {
    console.error(`Invalid format: ${format}. Valid formats: json, text`);
    process.exit(1);
  }

  return { category, format };
}

/**
 * Run checkers based on category filter
 */
async function runCheckers(
  category?: Category,
): Promise<Map<Category, ToolCheckResult[]>> {
  const categoriesToRun = category
    ? [category]
    : (Object.keys(CHECKERS) as Category[]);

  const results = await Promise.allSettled(
    categoriesToRun.map(async (cat) => {
      const checker = CHECKERS[cat];
      const tools = await checker();
      return { category: cat, tools };
    }),
  );

  const toolsByCategory = new Map<Category, ToolCheckResult[]>();

  for (const result of results) {
    if (result.status === "fulfilled") {
      toolsByCategory.set(result.value.category, result.value.tools);
    } else {
      console.error(`Error checking tools: ${result.reason}`);
    }
  }

  return toolsByCategory;
}

/**
 * Format results as JSON
 */
function formatJson(toolsByCategory: Map<Category, ToolCheckResult[]>): string {
  const output: Record<string, ToolCheckResult[]> = {};

  for (const [category, tools] of toolsByCategory) {
    output[category] = tools;
  }

  return JSON.stringify(output, null, 2);
}

/**
 * Format results as human-readable text
 */
function formatText(toolsByCategory: Map<Category, ToolCheckResult[]>): string {
  const lines: string[] = ["◆ Available Tools", ""];

  let totalTools = 0;
  let availableTools = 0;

  for (const [category, tools] of toolsByCategory) {
    lines.push(`  ${category}`);

    for (const tool of tools) {
      totalTools++;
      if (tool.available) {
        availableTools++;
        const versionStr = tool.version ? ` ${tool.version}` : "";
        const replacesStr = tool.replaces ? ` (replaces ${tool.replaces})` : "";
        lines.push(
          `    ✓ ${tool.name}${versionStr} — ${tool.description}${replacesStr}`,
        );
      } else {
        lines.push(`    ✗ ${tool.name} — ${tool.description}`);
        // Show installation hint (prefer brew, then cargo, then apt)
        const installCmd =
          tool.install.brew || tool.install.cargo || tool.install.apt;
        if (installCmd) {
          lines.push(`      → ${installCmd}`);
        }
      }
    }

    lines.push("");
  }

  lines.push(`◇ Summary: ${availableTools}/${totalTools} tools available`);

  return lines.join("\n");
}

/**
 * Main entry point
 */
async function main() {
  const { category, format } = parseCliArgs();

  const toolsByCategory = await runCheckers(category);

  const output =
    format === "json"
      ? formatJson(toolsByCategory)
      : formatText(toolsByCategory);

  console.log(output);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
