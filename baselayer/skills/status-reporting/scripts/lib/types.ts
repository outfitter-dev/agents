/**
 * Shared types for status-reporting gatherers
 */

export type GathererStatus = "success" | "unavailable" | "error"

export interface GathererResult<T = unknown> {
  source: string
  status: GathererStatus
  data?: T
  error?: string
  reason?: string
  timestamp: string
}

// Beads types
export interface BeadsIssue {
  id: string
  title: string
  description?: string
  status: "open" | "in_progress" | "blocked" | "closed"
  issue_type: "bug" | "feature" | "task" | "epic" | "chore"
  priority: 0 | 1 | 2 | 3 | 4
  assignee?: string
  labels: string[]
  created_at: string
  updated_at: string
  closed_at?: string
  dependency_count: number
  dependent_count: number
}

export interface BeadsStats {
  total: number
  open: number
  in_progress: number
  blocked: number
  closed: number
  ready: number
  average_lead_time?: number
}

export interface BeadsData {
  stats: BeadsStats
  inProgress: BeadsIssue[]
  ready: BeadsIssue[]
  blocked: BeadsIssue[]
  recentlyClosed: BeadsIssue[]
}

// GitHub types
export interface GitHubPR {
  number: number
  title: string
  state: "OPEN" | "CLOSED" | "MERGED"
  isDraft: boolean
  author: { login: string }
  updatedAt: string
  url: string
  headRefName: string
  statusCheckRollup?: {
    state: "SUCCESS" | "FAILURE" | "PENDING" | "EXPECTED"
    contexts?: Array<{
      name: string
      state: string
      conclusion?: string
    }>
  }
  reviewDecision?: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null
}

export interface GitHubWorkflowRun {
  name: string
  status: string
  conclusion: string | null
  createdAt: string
  url: string
}

export interface GitHubData {
  repo: string
  openPRs: GitHubPR[]
  recentRuns: GitHubWorkflowRun[]
}

// Graphite types
export interface GraphiteBranch {
  name: string
  prNumber?: number
  prStatus?: "draft" | "open" | "ready" | "merged" | "closed"
  prUrl?: string
  parent?: string
  children: string[]
  isCurrent: boolean
  needsRestack: boolean
  needsSubmit: boolean
  commitCount: number
}

export interface GraphiteData {
  currentBranch: string
  trunk: string
  branches: GraphiteBranch[]
  stacks: string[][] // Each stack as array of branch names
}

// Linear types
export interface LinearIssue {
  identifier: string
  title: string
  state: {
    name: string
    type: string
  }
  priority: number
  assignee?: { name: string }
  labels: Array<{ name: string }>
  createdAt: string
  updatedAt: string
  url: string
}

export interface LinearData {
  team?: string
  issues: LinearIssue[]
}

// Aggregated result
export interface SitrepResult {
  timeConstraint: string
  timestamp: string
  sources: string[]
  results: {
    graphite?: GathererResult<GraphiteData>
    github?: GathererResult<GitHubData>
    linear?: GathererResult<LinearData>
    beads?: GathererResult<BeadsData>
  }
}
