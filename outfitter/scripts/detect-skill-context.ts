#!/usr/bin/env bun
/**
 * detect-skill-context.ts
 *
 * Detects the execution context for a skill based on its file path.
 * Returns JSON with context type, reason, and recommendations.
 *
 * Usage:
 *   bun detect-skill-context.ts /path/to/SKILL.md
 *   bun detect-skill-context.ts --check  # Check current directory
 */

import { basename, dirname } from "path";

interface ContextResult {
  context: "claude" | "codex" | "cursor" | "github" | "generic";
  reason: string;
  recommendations: string[];
  path: string;
}

const CONTEXT_PATTERNS: Record<
  string,
  { patterns: RegExp[]; context: ContextResult["context"]; reason: string }
> = {
  claude: {
    patterns: [
      /\.claude-plugin\//,
      /\.claude\/skills\//,
      /\/\.claude\/skills\//,
      /~\/\.claude\/skills\//,
    ],
    context: "claude",
    reason: "Path contains Claude Code skill location",
  },
  codex: {
    patterns: [/\.codex\/skills\//, /codex-skills\//, /\.codex\//],
    context: "codex",
    reason: "Path contains Codex CLI skill location",
  },
  cursor: {
    patterns: [/\.cursor\/skills\//, /cursor-rules\//],
    context: "cursor",
    reason: "Path contains Cursor skill location",
  },
  github: {
    patterns: [/\.github\/skills\//, /\.github\/copilot\//],
    context: "github",
    reason: "Path contains GitHub Copilot skill location",
  },
};

const RECOMMENDATIONS: Record<string, string[]> = {
  claude: [
    "Consider adding 'allowed-tools' for tool permissions",
    "Consider 'user-invocable: true' for slash command access",
    "Use 'argument-hint' if skill accepts arguments",
    "Test with 'claude --debug' to verify loading",
  ],
  codex: [
    "Skills are invoked with $skill-name syntax",
    "Check codex discovery paths are configured",
  ],
  cursor: [
    "Cursor uses .cursorrules for project-level instructions",
    "Skills integrate via cursor-rules format",
  ],
  github: [
    "GitHub Copilot skills follow repository patterns",
    "Check .github/copilot-instructions.md for integration",
  ],
  generic: [
    "Stick to base spec fields: name, description, version, license, compatibility, metadata",
    "Platform-specific fields should be under metadata",
    "See https://agentskills.io/specification for cross-platform guidance",
  ],
};

function detectContext(path: string): ContextResult {
  const normalizedPath = path.replace(/\\/g, "/");

  for (const [, config] of Object.entries(CONTEXT_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(normalizedPath)) {
        return {
          context: config.context,
          reason: config.reason,
          recommendations: RECOMMENDATIONS[config.context] || [],
          path: normalizedPath,
        };
      }
    }
  }

  // Generic context - no specific platform detected
  return {
    context: "generic",
    reason: "No platform-specific path pattern detected",
    recommendations: RECOMMENDATIONS.generic,
    path: normalizedPath,
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`Usage: detect-skill-context.ts <path-to-SKILL.md>

Detects execution context for skills based on file path.

Options:
  --check    Check current directory for SKILL.md
  --help     Show this help message

Output: JSON with context, reason, recommendations, and path
`);
    process.exit(0);
  }

  let targetPath: string;

  if (args[0] === "--check") {
    // Look for SKILL.md in current directory
    targetPath = `${process.cwd()}/SKILL.md`;
  } else {
    targetPath = args[0];
  }

  const result = detectContext(targetPath);
  console.log(JSON.stringify(result, null, 2));
}

main();
