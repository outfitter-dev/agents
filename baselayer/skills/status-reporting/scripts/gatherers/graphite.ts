#!/usr/bin/env bun
/**
 * Graphite gatherer for status-reporting
 *
 * Collects stack and branch data via `gt` CLI:
 * - Stack structure and hierarchy
 * - Branch PR status
 * - Restack/submit needs
 * - Recent commits via git
 */

import { parseArgs } from "node:util"
import { parseTimeConstraint, toGitSince } from "../lib/time"
import type { GathererResult, GraphiteBranch, GraphiteData } from "../lib/types"

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    time: { type: "string", short: "t", default: "24h" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(`
graphite.ts - Gather Graphite stack data

Usage:
  ./graphite.ts [options]

Options:
  -t, --time <constraint>   Time constraint for commits (24h, 7d, 2w) [default: 24h]
  -h, --help               Show this help

Output:
  JSON GathererResult with GraphiteData
`)
  process.exit(0)
}

interface CmdOutput {
  success: boolean
  stdout: string
  stderr: string
}

async function runCmd(cmd: string, args: string[]): Promise<CmdOutput> {
  const proc = Bun.spawn([cmd, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  })

  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  const exitCode = await proc.exited

  return { success: exitCode === 0, stdout, stderr }
}

async function checkGtAvailable(): Promise<boolean> {
  const result = await runCmd("which", ["gt"])
  return result.success
}

async function checkGitRepo(): Promise<boolean> {
  const result = await runCmd("git", ["rev-parse", "--git-dir"])
  return result.success
}

// Parse gt log output to extract branch data
interface GtLogEntry {
  branch: string
  pr?: {
    number: number
    url: string
    state: string
    isDraft: boolean
  }
  parent?: string
  needsRestack: boolean
  needsSubmit: boolean
  isCurrent: boolean
}

async function getGtState(): Promise<{
  branches: GraphiteBranch[]
  stacks: string[][]
  currentBranch: string
  trunk: string
} | null> {
  // Get structured state from gt
  const result = await runCmd("gt", ["log", "--json"])

  if (!result.success) {
    // Try alternate: gt state
    const stateResult = await runCmd("gt", ["state"])
    if (!stateResult.success) return null

    // Parse text output as fallback
    return parseGtStateText(stateResult.stdout)
  }

  try {
    const data = JSON.parse(result.stdout)
    return parseGtLogJson(data)
  } catch {
    return null
  }
}

function parseGtLogJson(data: unknown): {
  branches: GraphiteBranch[]
  stacks: string[][]
  currentBranch: string
  trunk: string
} {
  // gt log --json returns array of branch entries
  const entries = Array.isArray(data) ? data : []

  const branchMap = new Map<string, GraphiteBranch>()
  let currentBranch = "main"
  const trunk = "main"

  for (const entry of entries) {
    const branch: GraphiteBranch = {
      name: entry.branch || entry.name || "",
      prNumber: entry.pr?.number,
      prStatus: mapPrState(entry.pr?.state, entry.pr?.isDraft),
      prUrl: entry.pr?.url,
      parent: entry.parent,
      children: [],
      isCurrent: entry.isCurrent || entry.current || false,
      needsRestack: entry.needsRestack || false,
      needsSubmit: entry.needsSubmit || false,
      commitCount: entry.commitCount || entry.commits?.length || 0,
    }

    if (branch.isCurrent) {
      currentBranch = branch.name
    }

    branchMap.set(branch.name, branch)
  }

  // Build children relationships
  for (const branch of branchMap.values()) {
    if (branch.parent && branchMap.has(branch.parent)) {
      branchMap.get(branch.parent)!.children.push(branch.name)
    }
  }

  // Build stacks (branches that share a root)
  const stacks = buildStacks(branchMap, trunk)

  return {
    branches: Array.from(branchMap.values()),
    stacks,
    currentBranch,
    trunk,
  }
}

function parseGtStateText(text: string): {
  branches: GraphiteBranch[]
  stacks: string[][]
  currentBranch: string
  trunk: string
} {
  // Fallback parser for text output
  const lines = text.split("\n").filter((l) => l.trim())
  const branches: GraphiteBranch[] = []
  let currentBranch = "main"

  for (const line of lines) {
    // Look for branch indicators like "◉ branch-name" or "○ branch-name"
    const match = line.match(/[◉○●◐]\s+(\S+)/)
    if (match) {
      const name = match[1]
      const isCurrent = line.includes("◉") || line.includes("●")
      if (isCurrent) currentBranch = name

      branches.push({
        name,
        children: [],
        isCurrent,
        needsRestack: line.includes("restack"),
        needsSubmit: line.includes("submit"),
        commitCount: 0,
      })
    }
  }

  return {
    branches,
    stacks: branches.length > 0 ? [branches.map((b) => b.name)] : [],
    currentBranch,
    trunk: "main",
  }
}

function mapPrState(
  state?: string,
  isDraft?: boolean
): "draft" | "open" | "ready" | "merged" | "closed" | undefined {
  if (!state) return undefined
  if (isDraft) return "draft"

  switch (state.toLowerCase()) {
    case "open":
      return "open"
    case "merged":
      return "merged"
    case "closed":
      return "closed"
    default:
      return "open"
  }
}

function buildStacks(branchMap: Map<string, GraphiteBranch>, trunk: string): string[][] {
  const stacks: string[][] = []
  const visited = new Set<string>()

  // Find root branches (parent is trunk or undefined)
  const roots = Array.from(branchMap.values()).filter(
    (b) => !b.parent || b.parent === trunk || !branchMap.has(b.parent)
  )

  for (const root of roots) {
    if (visited.has(root.name)) continue

    const stack: string[] = []
    const queue = [root.name]

    while (queue.length > 0) {
      const name = queue.shift()!
      if (visited.has(name)) continue

      visited.add(name)
      stack.push(name)

      const branch = branchMap.get(name)
      if (branch) {
        queue.push(...branch.children)
      }
    }

    if (stack.length > 0) {
      stacks.push(stack)
    }
  }

  return stacks
}

async function getRecentCommits(timeMs: number): Promise<number> {
  const since = toGitSince(timeMs)
  const result = await runCmd("git", ["log", `--since=${since}`, "--oneline"])

  if (!result.success) return 0
  return result.stdout.split("\n").filter((l) => l.trim()).length
}

async function gatherGraphiteData(): Promise<GathererResult<GraphiteData>> {
  const timestamp = new Date().toISOString()

  // Check prerequisites
  const gtAvailable = await checkGtAvailable()
  if (!gtAvailable) {
    return {
      source: "graphite",
      status: "unavailable",
      reason: "gt CLI not installed",
      timestamp,
    }
  }

  const isGitRepo = await checkGitRepo()
  if (!isGitRepo) {
    return {
      source: "graphite",
      status: "unavailable",
      reason: "Not in a git repository",
      timestamp,
    }
  }

  // Parse time constraint
  let timeMs: number
  try {
    timeMs = parseTimeConstraint(values.time!)
  } catch (e) {
    return {
      source: "graphite",
      status: "error",
      error: e instanceof Error ? e.message : "Invalid time constraint",
      timestamp,
    }
  }

  // Get graphite state
  const state = await getGtState()
  if (!state) {
    return {
      source: "graphite",
      status: "error",
      error: "Failed to parse gt output",
      timestamp,
    }
  }

  // Get recent commit count (informational)
  const _recentCommits = await getRecentCommits(timeMs)

  return {
    source: "graphite",
    status: "success",
    data: {
      currentBranch: state.currentBranch,
      trunk: state.trunk,
      branches: state.branches,
      stacks: state.stacks,
    },
    timestamp,
  }
}

// Main execution
const result = await gatherGraphiteData()
console.log(JSON.stringify(result, null, 2))
