#!/usr/bin/env bun

/**
 * Initialize a new Claude skill from template or scratch
 *
 * Usage:
 *   bun run init-skill.ts <skill-name> <output-dir>
 *   bun run init-skill.ts <skill-name> <output-dir> --template <template-name>
 *
 * Templates: api-wrapper, document-processor, dev-workflow, research-synthesizer, simple
 */

import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATES_DIR = path.join(SCRIPT_DIR, "../templates/skill-archetypes");

interface InitResult {
  status: "success" | "error";
  skillDir?: string;
  template?: string;
  files?: string[];
  nextSteps?: string[];
  error?: string;
  availableTemplates?: string[];
}

function getAvailableTemplates(): string[] {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs.readdirSync(TEMPLATES_DIR).filter((f) =>
    fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory()
  );
}

function copyDir(src: string, dest: string): string[] {
  const copiedFiles: string[] = [];
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copiedFiles.push(...copyDir(srcPath, destPath));
    } else {
      fs.copyFileSync(srcPath, destPath);
      copiedFiles.push(path.relative(dest, destPath) || entry.name);
    }
  }

  return copiedFiles;
}

function toTitleCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createMinimalSkill(skillName: string, outputDir: string): InitResult {
  const skillDir = path.join(outputDir, skillName);

  if (fs.existsSync(skillDir)) {
    return {
      status: "error",
      error: `Directory already exists: ${skillDir}`,
    };
  }

  fs.mkdirSync(skillDir, { recursive: true });

  const titleName = toTitleCase(skillName);
  const skillMd = `---
name: ${titleName}
description: TODO - Describe what this skill does and when to use it. Include trigger keywords users might mention.
---

# ${titleName}

## Quick Start

TODO: Fastest path to value (3-5 lines)

## Instructions

When this skill is activated:

1. **Step 1**
   - Detail

2. **Step 2**
   - Detail

## Examples

### Example 1: Basic Usage

\`\`\`
TODO: Add concrete example
\`\`\`

## Best Practices

- TODO: Add best practices

## Related Skills

- TODO: Add related skills if any
`;

  fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillMd);

  return {
    status: "success",
    skillDir,
    files: ["SKILL.md"],
    nextSteps: [
      "Edit SKILL.md frontmatter - description is critical for discovery",
      "Replace all TODO placeholders with actual content",
      "Add examples that demonstrate real usage",
      "Run validate-claude-skill to check quality",
    ],
  };
}

function createFromTemplate(
  skillName: string,
  outputDir: string,
  templateName: string
): InitResult {
  const templateDir = path.join(TEMPLATES_DIR, templateName);
  const availableTemplates = getAvailableTemplates();

  if (!fs.existsSync(templateDir)) {
    return {
      status: "error",
      error: `Template '${templateName}' not found`,
      availableTemplates,
    };
  }

  const skillDir = path.join(outputDir, skillName);

  if (fs.existsSync(skillDir)) {
    return {
      status: "error",
      error: `Directory already exists: ${skillDir}`,
    };
  }

  const files = copyDir(templateDir, skillDir);

  // Make scripts executable
  const scriptsDir = path.join(skillDir, "scripts");
  if (fs.existsSync(scriptsDir)) {
    for (const script of fs.readdirSync(scriptsDir)) {
      const scriptPath = path.join(scriptsDir, script);
      fs.chmodSync(scriptPath, 0o755);
    }
  }

  return {
    status: "success",
    skillDir,
    template: templateName,
    files,
    nextSteps: [
      "Replace all {{PLACEHOLDERS}} in SKILL.md with actual values",
      "Update scripts/ with your specific logic",
      "Craft a strong description for discoverability",
      "Test with real inputs",
      "Run validate-claude-skill to check quality",
    ],
  };
}

function showUsage(): void {
  const templates = getAvailableTemplates();
  console.log(
    JSON.stringify(
      {
        usage: "init-skill.ts <skill-name> <output-dir> [--template <name>]",
        examples: [
          "bun run init-skill.ts my-skill ~/.claude/skills",
          "bun run init-skill.ts github-api .claude/skills --template api-wrapper",
        ],
        availableTemplates: templates,
        templateDescriptions: {
          "api-wrapper": "For wrapping external APIs (REST, GraphQL)",
          "document-processor": "For working with file formats (PDF, DOCX, etc)",
          "dev-workflow": "For automating development tasks (git, CI, etc)",
          "research-synthesizer": "For gathering and synthesizing information",
          simple: "Minimal skill without scripts",
        },
      },
      null,
      2
    )
  );
}

// Main
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  showUsage();
  process.exit(0);
}

const templateIdx = args.indexOf("--template");
let template: string | null = null;

if (templateIdx !== -1) {
  template = args[templateIdx + 1];
  args.splice(templateIdx, 2);
}

const [skillName, outputDir] = args;

if (!skillName || !outputDir) {
  showUsage();
  process.exit(1);
}

// Validate skill name
if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(skillName) && skillName.length > 2) {
  console.log(
    JSON.stringify({
      status: "error",
      error: "Skill name must be kebab-case (lowercase with hyphens)",
      examples: ["my-skill", "github-api", "pdf-processor"],
    })
  );
  process.exit(1);
}

// Expand ~ to home directory
const expandedOutputDir = outputDir.replace(/^~/, process.env.HOME || "~");

let result: InitResult;

if (template) {
  result = createFromTemplate(skillName, expandedOutputDir, template);
} else {
  result = createMinimalSkill(skillName, expandedOutputDir);
}

console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "success" ? 0 : 1);
