#!/usr/bin/env bun
/**
 * Beads gatherer for status-reporting
 *
 * Collects local issue data from .beads/ directory
 * - Stats overview
 * - In-progress work
 * - Ready items (unblocked)
 * - Blocked items with dependencies
 * - Recently closed (filtered by time)
 */

import { parseArgs } from "node:util"
import { filterByTime, parseTimeConstraint, toRelativeTime } from "../lib/time"
import type { BeadsData, BeadsIssue, BeadsStats, GathererResult } from "../lib/types"

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    time: { type: "string", short: "t", default: "24h" },
    workspace: { type: "string", short: "w" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(`
beads.ts - Gather beads issue data

Usage:
  ./beads.ts [options]

Options:
  -t, --time <constraint>   Time constraint (24h, 7d, 2w) [default: 24h]
  -w, --workspace <path>    Workspace root [default: current directory]
  -h, --help               Show this help

Output:
  JSON GathererResult with BeadsData
`)
  process.exit(0)
}

interface BdOutput<T> {
  success: boolean
  data?: T
  error?: string
}

async function runBd<T>(args: string[]): Promise<BdOutput<T>> {
  const workspaceArgs = values.workspace ? ["--workspace-root", values.workspace] : []

  const proc = Bun.spawn(["bd", ...workspaceArgs, ...args, "--json"], {
    stdout: "pipe",
    stderr: "pipe",
  })

  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    return { success: false, error: stderr || `bd exited with code ${exitCode}` }
  }

  try {
    const data = JSON.parse(stdout)
    return { success: true, data }
  } catch {
    return { success: false, error: `Failed to parse bd output: ${stdout}` }
  }
}

async function checkBeadsAvailable(): Promise<boolean> {
  // Check if .beads directory exists
  const beadsDir = values.workspace
    ? `${values.workspace}/.beads`
    : ".beads"

  const file = Bun.file(`${beadsDir}/issues.db`)
  return file.exists()
}

async function gatherBeadsData(): Promise<GathererResult<BeadsData>> {
  const timestamp = new Date().toISOString()

  // Check if beads is available
  const available = await checkBeadsAvailable()
  if (!available) {
    return {
      source: "beads",
      status: "unavailable",
      reason: "Beads not initialized (.beads/ directory not found)",
      timestamp,
    }
  }

  // Parse time constraint
  let timeMs: number
  try {
    timeMs = parseTimeConstraint(values.time!)
  } catch (e) {
    return {
      source: "beads",
      status: "error",
      error: e instanceof Error ? e.message : "Invalid time constraint",
      timestamp,
    }
  }

  // Gather data in parallel
  const [statsResult, inProgressResult, readyResult, blockedResult, closedResult] =
    await Promise.all([
      runBd<BeadsStats>(["stats"]),
      runBd<BeadsIssue[]>(["list", "--status=in_progress", "--limit=10"]),
      runBd<BeadsIssue[]>(["ready", "--limit=10"]),
      runBd<BeadsIssue[]>(["blocked"]),
      runBd<BeadsIssue[]>(["list", "--status=closed", "--limit=20"]),
    ])

  // Check for fatal errors (stats should always work if beads is available)
  if (!statsResult.success) {
    return {
      source: "beads",
      status: "error",
      error: statsResult.error || "Failed to get beads stats",
      timestamp,
    }
  }

  // Build result, handling partial failures gracefully
  const stats = statsResult.data!
  const inProgress = inProgressResult.success ? inProgressResult.data! : []
  const ready = readyResult.success ? readyResult.data! : []
  const blocked = blockedResult.success ? blockedResult.data! : []
  const closed = closedResult.success ? closedResult.data! : []

  // Filter closed issues by time constraint (client-side)
  const recentlyClosed = filterByTime(closed, timeMs)

  return {
    source: "beads",
    status: "success",
    data: {
      stats,
      inProgress,
      ready,
      blocked,
      recentlyClosed,
    },
    timestamp,
  }
}

// Main execution
const result = await gatherBeadsData()
console.log(JSON.stringify(result, null, 2))
