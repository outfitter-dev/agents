#!/usr/bin/env bun
/**
 * GitHub gatherer for status-reporting
 *
 * Collects data via `gh` CLI:
 * - Open PRs with CI status and review decisions
 * - Recent workflow runs
 */

import { parseArgs } from "node:util"
import { parseTimeConstraint, toCutoffDate } from "../lib/time"
import type { GathererResult, GitHubData, GitHubPR, GitHubWorkflowRun } from "../lib/types"

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    time: { type: "string", short: "t", default: "24h" },
    repo: { type: "string", short: "r" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(`
github.ts - Gather GitHub PR and CI data

Usage:
  ./github.ts [options]

Options:
  -t, --time <constraint>   Time constraint (24h, 7d, 2w) [default: 24h]
  -r, --repo <owner/repo>   Repository [default: current repo]
  -h, --help               Show this help

Output:
  JSON GathererResult with GitHubData
`)
  process.exit(0)
}

interface GhOutput<T> {
  success: boolean
  data?: T
  error?: string
}

async function runGh<T>(args: string[]): Promise<GhOutput<T>> {
  const repoArgs = values.repo ? ["-R", values.repo] : []

  const proc = Bun.spawn(["gh", ...repoArgs, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  })

  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    return { success: false, error: stderr || `gh exited with code ${exitCode}` }
  }

  try {
    const data = JSON.parse(stdout)
    return { success: true, data }
  } catch {
    return { success: false, error: `Failed to parse gh output: ${stdout}` }
  }
}

async function checkGhAvailable(): Promise<boolean> {
  const proc = Bun.spawn(["which", "gh"], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  return exitCode === 0
}

async function checkGhAuth(): Promise<boolean> {
  const proc = Bun.spawn(["gh", "auth", "status"], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  return exitCode === 0
}

async function getRepoName(): Promise<string | null> {
  if (values.repo) return values.repo

  const proc = Bun.spawn(["gh", "repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], {
    stdout: "pipe",
    stderr: "pipe",
  })

  const stdout = await new Response(proc.stdout).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) return null
  return stdout.trim()
}

// GraphQL query for PRs with status checks
const PR_QUERY_FIELDS = [
  "number",
  "title",
  "state",
  "isDraft",
  "author",
  "updatedAt",
  "url",
  "headRefName",
  "statusCheckRollup",
  "reviewDecision",
].join(",")

async function gatherGitHubData(): Promise<GathererResult<GitHubData>> {
  const timestamp = new Date().toISOString()

  // Check gh CLI availability
  const ghAvailable = await checkGhAvailable()
  if (!ghAvailable) {
    return {
      source: "github",
      status: "unavailable",
      reason: "gh CLI not installed",
      timestamp,
    }
  }

  // Check authentication
  const ghAuth = await checkGhAuth()
  if (!ghAuth) {
    return {
      source: "github",
      status: "unavailable",
      reason: "gh CLI not authenticated (run: gh auth login)",
      timestamp,
    }
  }

  // Get repo name
  const repo = await getRepoName()
  if (!repo) {
    return {
      source: "github",
      status: "unavailable",
      reason: "Not in a GitHub repository",
      timestamp,
    }
  }

  // Parse time constraint
  let timeMs: number
  try {
    timeMs = parseTimeConstraint(values.time!)
  } catch (e) {
    return {
      source: "github",
      status: "error",
      error: e instanceof Error ? e.message : "Invalid time constraint",
      timestamp,
    }
  }

  const cutoff = toCutoffDate(timeMs)
  const cutoffDate = cutoff.toISOString().split("T")[0] // YYYY-MM-DD for search

  // Gather data in parallel
  const [prsResult, runsResult] = await Promise.all([
    // Get open PRs (no date filter needed - we want all open)
    runGh<GitHubPR[]>([
      "pr",
      "list",
      "--state=open",
      "--json",
      PR_QUERY_FIELDS,
      "--limit=20",
    ]),
    // Get recent workflow runs
    runGh<GitHubWorkflowRun[]>([
      "run",
      "list",
      "--json",
      "name,status,conclusion,createdAt,url",
      "--limit=20",
    ]),
  ])

  if (!prsResult.success && !runsResult.success) {
    return {
      source: "github",
      status: "error",
      error: prsResult.error || runsResult.error || "Failed to fetch GitHub data",
      timestamp,
    }
  }

  // Transform PR data to match our types
  const openPRs: GitHubPR[] = (prsResult.data || []).map((pr: Record<string, unknown>) => ({
    number: pr.number as number,
    title: pr.title as string,
    state: pr.state as "OPEN" | "CLOSED" | "MERGED",
    isDraft: pr.isDraft as boolean,
    author: pr.author as { login: string },
    updatedAt: pr.updatedAt as string,
    url: pr.url as string,
    headRefName: pr.headRefName as string,
    statusCheckRollup: pr.statusCheckRollup as GitHubPR["statusCheckRollup"],
    reviewDecision: pr.reviewDecision as GitHubPR["reviewDecision"],
  }))

  // Filter workflow runs by time
  const allRuns = runsResult.data || []
  const recentRuns: GitHubWorkflowRun[] = allRuns
    .filter((run: Record<string, unknown>) => new Date(run.createdAt as string) >= cutoff)
    .map((run: Record<string, unknown>) => ({
      name: run.name as string,
      status: run.status as string,
      conclusion: run.conclusion as string | null,
      createdAt: run.createdAt as string,
      url: run.url as string,
    }))

  return {
    source: "github",
    status: "success",
    data: {
      repo,
      openPRs,
      recentRuns,
    },
    timestamp,
  }
}

// Main execution
const result = await gatherGitHubData()
console.log(JSON.stringify(result, null, 2))
