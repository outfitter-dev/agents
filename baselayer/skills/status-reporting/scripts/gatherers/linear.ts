#!/usr/bin/env bun
/**
 * Linear gatherer for status-reporting
 *
 * Collects Linear issue data via Claude CLI headless mode (MCP)
 * - Checks if Linear MCP is configured
 * - Queries recent issues via claude --print
 */

import { parseArgs } from "node:util"
import { homedir } from "node:os"
import { toISOPeriod, parseTimeConstraint } from "../lib/time"
import type { GathererResult, LinearData, LinearIssue } from "../lib/types"

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    time: { type: "string", short: "t", default: "24h" },
    team: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(`
linear.ts - Gather Linear issue data

Usage:
  ./linear.ts [options]

Options:
  -t, --time <constraint>   Time constraint (24h, 7d, 2w) [default: 24h]
  --team <team-key>         Linear team key to filter by
  -h, --help               Show this help

Output:
  JSON GathererResult with LinearData

Note:
  Requires Linear MCP to be configured in Claude settings.
  Uses 'claude --print' headless mode to query via MCP.
`)
  process.exit(0)
}

async function checkLinearMCPConfigured(): Promise<boolean> {
  // Check both user and project settings
  const settingsPaths = [
    `${homedir()}/.claude/settings.json`,
    `${homedir()}/.claude/settings.local.json`,
    ".claude/settings.json",
    ".claude/settings.local.json",
  ]

  for (const path of settingsPaths) {
    const file = Bun.file(path)
    if (await file.exists()) {
      try {
        const content = await file.json()
        // Check for Linear in mcpServers
        if (content.mcpServers) {
          const servers = Object.keys(content.mcpServers)
          if (servers.some((s) => s.toLowerCase().includes("linear"))) {
            return true
          }
        }
      } catch {
        // Continue checking other files
      }
    }
  }

  return false
}

async function checkClaudeCliAvailable(): Promise<boolean> {
  const proc = Bun.spawn(["which", "claude"], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  return exitCode === 0
}

async function queryLinearViaClaude(timeMs: number, team?: string): Promise<LinearIssue[] | null> {
  const period = toISOPeriod(timeMs)

  // Build the prompt for Claude
  const teamFilter = team ? ` for team ${team}` : ""
  const prompt = `Use the Linear MCP tools to list issues updated in the last ${Math.round(timeMs / (60 * 60 * 1000))} hours${teamFilter}.

Return ONLY a JSON array of issues with this structure (no other text):
[
  {
    "identifier": "TEAM-123",
    "title": "Issue title",
    "state": { "name": "In Progress", "type": "started" },
    "priority": 2,
    "assignee": { "name": "Person Name" },
    "labels": [{ "name": "label1" }],
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "url": "https://linear.app/..."
  }
]

If no issues found, return an empty array [].`

  try {
    const proc = Bun.spawn(
      ["claude", "--print", prompt, "--output-format", "json", "--max-turns", "3"],
      {
        stdout: "pipe",
        stderr: "pipe",
        timeout: 60000, // 60 second timeout
      }
    )

    const stdout = await new Response(proc.stdout).text()
    const exitCode = await proc.exited

    if (exitCode !== 0) {
      return null
    }

    // Try to parse the response
    // Claude's JSON output may include a wrapper, extract the issues array
    const parsed = JSON.parse(stdout)

    // Handle different response formats
    if (Array.isArray(parsed)) {
      return parsed as LinearIssue[]
    }

    // If wrapped in a result object
    if (parsed.result && Array.isArray(parsed.result)) {
      return parsed.result as LinearIssue[]
    }

    // If wrapped in content
    if (parsed.content) {
      const content = typeof parsed.content === "string" ? parsed.content : JSON.stringify(parsed.content)
      // Try to extract JSON array from content
      const match = content.match(/\[[\s\S]*\]/)
      if (match) {
        return JSON.parse(match[0]) as LinearIssue[]
      }
    }

    return []
  } catch {
    return null
  }
}

async function gatherLinearData(): Promise<GathererResult<LinearData>> {
  const timestamp = new Date().toISOString()

  // Check if Linear MCP is configured
  const mcpConfigured = await checkLinearMCPConfigured()
  if (!mcpConfigured) {
    return {
      source: "linear",
      status: "unavailable",
      reason: "Linear MCP not configured in Claude settings",
      timestamp,
    }
  }

  // Check if Claude CLI is available
  const claudeAvailable = await checkClaudeCliAvailable()
  if (!claudeAvailable) {
    return {
      source: "linear",
      status: "unavailable",
      reason: "Claude CLI not installed",
      timestamp,
    }
  }

  // Parse time constraint
  let timeMs: number
  try {
    timeMs = parseTimeConstraint(values.time!)
  } catch (e) {
    return {
      source: "linear",
      status: "error",
      error: e instanceof Error ? e.message : "Invalid time constraint",
      timestamp,
    }
  }

  // Query Linear via Claude
  const issues = await queryLinearViaClaude(timeMs, values.team)

  if (issues === null) {
    return {
      source: "linear",
      status: "error",
      error: "Failed to query Linear via Claude CLI",
      timestamp,
    }
  }

  return {
    source: "linear",
    status: "success",
    data: {
      team: values.team,
      issues,
    },
    timestamp,
  }
}

// Main execution
const result = await gatherLinearData()
console.log(JSON.stringify(result, null, 2))
