#!/usr/bin/env bun
/**
 * sitrep.ts - Status report orchestrator
 *
 * Entry point for gathering status data from multiple sources.
 * Runs gatherers in parallel, aggregates results, outputs JSON or text.
 *
 * Usage:
 *   ./sitrep.ts                          # All sources, 24h default
 *   ./sitrep.ts -t 7d                    # All sources, last 7 days
 *   ./sitrep.ts -s github,beads          # Specific sources only
 *   ./sitrep.ts -t 24h -s graphite       # Combined
 *   ./sitrep.ts --format=text            # Human-readable output
 */

import { parseArgs } from "node:util"
import { formatTimeConstraint, toRelativeTime } from "./lib/time"
import type {
  BeadsData,
  GathererResult,
  GitHubData,
  GraphiteData,
  LinearData,
  SitrepResult,
} from "./lib/types"

const SOURCES = ["graphite", "github", "linear", "beads"] as const
type Source = (typeof SOURCES)[number]

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    time: { type: "string", short: "t", default: "24h" },
    sources: { type: "string", short: "s" },
    format: { type: "string", short: "f", default: "json" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(`
sitrep.ts - Generate status report across multiple sources

Usage:
  ./sitrep.ts [options]

Options:
  -t, --time <constraint>   Time constraint (24h, 7d, 2w) [default: 24h]
  -s, --sources <list>      Comma-separated sources: graphite,github,linear,beads,all
                            [default: auto-detect available]
  -f, --format <fmt>        Output format: json, text [default: json]
  -h, --help               Show this help

Examples:
  ./sitrep.ts                          # All available sources, last 24 hours
  ./sitrep.ts -t 7d                    # Last 7 days
  ./sitrep.ts -s github,beads          # Only GitHub and Beads
  ./sitrep.ts --format=text            # Human-readable output

Sources:
  graphite  - Stack structure, branches, PR status (requires gt CLI)
  github    - Open PRs, CI status, workflow runs (requires gh CLI)
  linear    - Issues from Linear (requires Linear MCP in Claude settings)
  beads     - Local issues from .beads/ directory
`)
  process.exit(0)
}

// Get script directory for running gatherers
const scriptDir = import.meta.dir

async function runGatherer<T>(source: Source): Promise<GathererResult<T>> {
  const gathererPath = `${scriptDir}/gatherers/${source}.ts`
  const args = [gathererPath, "-t", values.time!]

  const proc = Bun.spawn(["bun", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  })

  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    return {
      source,
      status: "error",
      error: stderr || `Gatherer exited with code ${exitCode}`,
      timestamp: new Date().toISOString(),
    }
  }

  try {
    return JSON.parse(stdout) as GathererResult<T>
  } catch {
    return {
      source,
      status: "error",
      error: `Failed to parse gatherer output: ${stdout.slice(0, 200)}`,
      timestamp: new Date().toISOString(),
    }
  }
}

function parseSources(): Source[] {
  if (!values.sources || values.sources === "all") {
    return [...SOURCES]
  }

  const requested = values.sources.split(",").map((s) => s.trim().toLowerCase())
  const valid: Source[] = []

  for (const s of requested) {
    if (SOURCES.includes(s as Source)) {
      valid.push(s as Source)
    } else {
      console.error(`Warning: Unknown source "${s}", skipping`)
    }
  }

  return valid.length > 0 ? valid : [...SOURCES]
}

async function gatherAll(sources: Source[]): Promise<SitrepResult> {
  const timestamp = new Date().toISOString()

  // Run all gatherers in parallel
  const promises = sources.map(async (source) => {
    switch (source) {
      case "graphite":
        return { source, result: await runGatherer<GraphiteData>(source) }
      case "github":
        return { source, result: await runGatherer<GitHubData>(source) }
      case "linear":
        return { source, result: await runGatherer<LinearData>(source) }
      case "beads":
        return { source, result: await runGatherer<BeadsData>(source) }
    }
  })

  const settled = await Promise.allSettled(promises)

  // Build results object
  const results: SitrepResult["results"] = {}

  for (const item of settled) {
    if (item.status === "fulfilled") {
      const { source, result } = item.value
      results[source] = result
    }
  }

  return {
    timeConstraint: values.time!,
    timestamp,
    sources,
    results,
  }
}

// Text formatting helpers
function formatTextReport(result: SitrepResult): string {
  const lines: string[] = []
  const timeLabel = formatTimeConstraint(result.timeConstraint)

  lines.push(`SITREP — ${timeLabel}`)
  lines.push(`Generated: ${new Date(result.timestamp).toLocaleString()}`)
  lines.push("")

  // Graphite section
  if (result.results.graphite) {
    const g = result.results.graphite
    if (g.status === "success" && g.data) {
      const data = g.data as GraphiteData
      lines.push(`📊 GRAPHITE (${data.stacks.length} stacks, ${data.branches.length} branches)`)
      lines.push(`   Current: ${data.currentBranch}`)

      for (const branch of data.branches) {
        const current = branch.isCurrent ? " ●" : ""
        const pr = branch.prNumber ? ` PR #${branch.prNumber}` : ""
        const status = branch.prStatus ? ` [${branch.prStatus}]` : ""
        const flags: string[] = []
        if (branch.needsRestack) flags.push("needs restack")
        if (branch.needsSubmit) flags.push("needs submit")
        const flagStr = flags.length > 0 ? ` (${flags.join(", ")})` : ""

        lines.push(`   ${branch.name}${current}${pr}${status}${flagStr}`)
      }
      lines.push("")
    } else if (g.status === "unavailable") {
      lines.push(`📊 GRAPHITE: ${g.reason}`)
      lines.push("")
    }
  }

  // GitHub section
  if (result.results.github) {
    const gh = result.results.github
    if (gh.status === "success" && gh.data) {
      const data = gh.data as GitHubData
      lines.push(`🔀 GITHUB (${data.openPRs.length} open PRs)`)
      lines.push(`   Repo: ${data.repo}`)

      for (const pr of data.openPRs) {
        const draft = pr.isDraft ? " [draft]" : ""
        const ci = pr.statusCheckRollup?.state
          ? ` CI: ${pr.statusCheckRollup.state.toLowerCase()}`
          : ""
        const review = pr.reviewDecision ? ` Review: ${pr.reviewDecision.toLowerCase()}` : ""
        const time = toRelativeTime(pr.updatedAt)

        lines.push(`   #${pr.number}: ${pr.title}${draft}`)
        lines.push(`      ${ci}${review} — ${time}`)
      }

      if (data.recentRuns.length > 0) {
        const failed = data.recentRuns.filter((r) => r.conclusion === "failure").length
        const passed = data.recentRuns.filter((r) => r.conclusion === "success").length
        lines.push(`   Workflow runs: ${passed} passed, ${failed} failed`)
      }
      lines.push("")
    } else if (gh.status === "unavailable") {
      lines.push(`🔀 GITHUB: ${gh.reason}`)
      lines.push("")
    }
  }

  // Linear section
  if (result.results.linear) {
    const lin = result.results.linear
    if (lin.status === "success" && lin.data) {
      const data = lin.data as LinearData
      lines.push(`📋 LINEAR (${data.issues.length} issues)`)

      for (const issue of data.issues.slice(0, 10)) {
        const assignee = issue.assignee ? ` @${issue.assignee.name}` : ""
        const time = toRelativeTime(issue.updatedAt)

        lines.push(`   ${issue.identifier}: ${issue.title}`)
        lines.push(`      [${issue.state.name}]${assignee} — ${time}`)
      }
      lines.push("")
    } else if (lin.status === "unavailable") {
      lines.push(`📋 LINEAR: ${lin.reason}`)
      lines.push("")
    }
  }

  // Beads section
  if (result.results.beads) {
    const b = result.results.beads
    if (b.status === "success" && b.data) {
      const data = b.data as BeadsData
      const { stats } = data

      lines.push(
        `📝 BEADS (${stats.total} total, ${stats.open} open, ${stats.in_progress} active, ${stats.blocked} blocked)`
      )

      if (data.inProgress.length > 0) {
        lines.push("   In Progress:")
        for (const issue of data.inProgress) {
          const time = toRelativeTime(issue.updated_at)
          lines.push(`      ${issue.id}: ${issue.title} — ${time}`)
        }
      }

      if (data.ready.length > 0) {
        lines.push("   Ready to Work:")
        for (const issue of data.ready.slice(0, 5)) {
          const priority = ["", "🔴", "🟠", "🟡", "⚪"][issue.priority] || ""
          lines.push(`      ${priority} ${issue.id}: ${issue.title}`)
        }
      }

      if (data.blocked.length > 0) {
        lines.push(`   Blocked (${data.blocked.length}):`)
        for (const issue of data.blocked.slice(0, 3)) {
          lines.push(`      ⛔ ${issue.id}: ${issue.title}`)
        }
      }

      if (data.recentlyClosed.length > 0) {
        lines.push(`   Recently Closed (${data.recentlyClosed.length}):`)
        for (const issue of data.recentlyClosed.slice(0, 3)) {
          const time = toRelativeTime(issue.closed_at || issue.updated_at)
          lines.push(`      ✓ ${issue.id}: ${issue.title} — ${time}`)
        }
      }
      lines.push("")
    } else if (b.status === "unavailable") {
      lines.push(`📝 BEADS: ${b.reason}`)
      lines.push("")
    }
  }

  return lines.join("\n")
}

// Main execution
async function main() {
  const sources = parseSources()
  const result = await gatherAll(sources)

  if (values.format === "text") {
    console.log(formatTextReport(result))
  } else {
    console.log(JSON.stringify(result, null, 2))
  }
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
