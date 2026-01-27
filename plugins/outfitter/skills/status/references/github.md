# GitHub Integration

Tool-specific patterns for integrating GitHub PR status, CI checks, and review state into status reports.

## Overview

GitHub provides comprehensive PR metadata, CI/CD integration, and code review state. Status reports should extract actionable insights from PR state, check runs, and review decisions.

## Core Commands

### GitHub CLI (gh)

Primary tool for GitHub integration:

```bash
# List PRs with full metadata
gh pr list --json number,title,state,author,updatedAt,statusCheckRollup,reviewDecision

# Get specific PR details
gh pr view 123 --json number,title,state,statusCheckRollup,reviews,comments

# Check run details
gh pr checks 123

# Review status
gh pr status
```

### Repository Context

```bash
# Get current repo info
gh repo view --json nameWithOwner,defaultBranch

# Output: {"nameWithOwner": "owner/repo", "defaultBranch": "main"}
```

## Data Gathering

### PR List with Metadata

```typescript
interface GitHubPR {
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  isDraft: boolean;
  author: { login: string };
  updatedAt: string;
  statusCheckRollup: {
    state: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'EXPECTED';
    contexts: CheckContext[];
  };
  reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
}

async function fetchOpenPRs(): Promise<GitHubPR[]> {
  const result = await exec(
    'gh pr list --json number,title,state,isDraft,author,updatedAt,statusCheckRollup,reviewDecision --limit 100'
  );

  return JSON.parse(result);
}
```

### CI Check Status

```typescript
interface CheckContext {
  name: string;
  state: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'EXPECTED';
  conclusion: 'SUCCESS' | 'FAILURE' | 'NEUTRAL' | 'CANCELLED' | 'SKIPPED' | null;
  targetUrl?: string;
}

function analyzeCheckStatus(pr: GitHubPR): {
  passing: number;
  failing: number;
  pending: number;
  total: number;
  failedChecks: string[];
} {
  const contexts = pr.statusCheckRollup?.contexts || [];

  const passing = contexts.filter(c =>
    c.state === 'SUCCESS' || c.conclusion === 'SUCCESS'
  ).length;

  const failing = contexts.filter(c =>
    c.state === 'FAILURE' || c.conclusion === 'FAILURE'
  ).length;

  const pending = contexts.filter(c =>
    c.state === 'PENDING' || c.state === 'EXPECTED'
  ).length;

  const failedChecks = contexts
    .filter(c => c.state === 'FAILURE' || c.conclusion === 'FAILURE')
    .map(c => c.name);

  return {
    passing,
    failing,
    pending,
    total: contexts.length,
    failedChecks
  };
}
```

### Review State

```typescript
interface ReviewSummary {
  approved: number;
  changesRequested: number;
  commented: number;
  pending: number;
  decision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | 'NONE';
}

function summarizeReviews(pr: GitHubPR): ReviewSummary {
  // reviewDecision is aggregate state from GitHub
  const decision = pr.reviewDecision || 'NONE';

  // For detailed review counts, fetch full reviews:
  // gh pr view {number} --json reviews

  return {
    decision,
    // These would come from detailed review fetch if needed
    approved: decision === 'APPROVED' ? 1 : 0,
    changesRequested: decision === 'CHANGES_REQUESTED' ? 1 : 0,
    commented: 0,
    pending: decision === 'REVIEW_REQUIRED' ? 1 : 0
  };
}
```

## Time Filtering

Filter PRs by update time:

```typescript
async function fetchRecentPRs(since: string): Promise<GitHubPR[]> {
  // Convert time constraint to Date
  const cutoffDate = parseTimeConstraint(since); // "-24h" → Date

  // Fetch all open PRs
  const allPRs = await fetchOpenPRs();

  // Filter by updatedAt
  return allPRs.filter(pr => {
    const updatedAt = new Date(pr.updatedAt);
    return updatedAt >= cutoffDate;
  });
}
```

Alternative: Use GitHub API search:

```bash
# Search PRs updated since date
gh pr list --search "updated:>2024-01-15"

# Search with multiple criteria
gh pr list --search "is:open updated:>2024-01-15 -is:draft"
```

## Presentation Templates

### PR Section

```
🔀 PULL REQUESTS ({open_count} open, {recent_count} active)

PR #{number}: {title} [{state}]
  Author: {author} | Updated: {relative_time}
  CI: {ci_indicator} {passing}/{total} checks {failing_names}
  Reviews: {review_indicator} {review_summary}
  {blocker_indicator}
  {pr_url}
```

### CI Status Indicators

```typescript
function formatCIStatus(checkSummary: ReturnType<typeof analyzeCheckStatus>): string {
  const { passing, failing, pending, total, failedChecks } = checkSummary;

  let indicator: string;
  if (failing > 0) {
    indicator = '✗';
  } else if (pending > 0) {
    indicator = '⏳';
  } else if (passing === total && total > 0) {
    indicator = '✓';
  } else {
    indicator = '○'; // No checks
  }

  let status = `${indicator} ${passing}/${total} checks`;

  if (failing > 0) {
    status += ` (failing: ${failedChecks.join(', ')})`;
  }

  return status;
}
```

### Review Status Indicators

```typescript
function formatReviewStatus(reviewSummary: ReviewSummary): string {
  const { decision } = reviewSummary;

  const indicators: Record<string, string> = {
    'APPROVED': '✓ Approved',
    'CHANGES_REQUESTED': '👀 Changes requested',
    'REVIEW_REQUIRED': '⏸ Awaiting review',
    'NONE': '○ No reviews'
  };

  return indicators[decision] || '○ No reviews';
}
```

### Example Output

```
🔀 PULL REQUESTS (3 open, 2 active in last 24h)

PR #156: Add authentication middleware [OPEN]
  Author: @alice | Updated: 3 hours ago
  CI: ✓ 4/4 checks passing
  Reviews: ✓ Approved
  https://github.com/owner/repo/pull/156

PR #155: Fix bug in user validation [OPEN]
  Author: @bob | Updated: 5 hours ago
  CI: ✗ 2/3 checks (failing: type-check, lint)
  Reviews: 👀 Changes requested
  ◆ Blocker: Failing CI needs fixing
  https://github.com/owner/repo/pull/155

PR #154: Update dependencies [OPEN] 🏷️ DRAFT
  Author: @dependabot | Updated: 2 days ago
  CI: ⏳ 1/2 checks pending
  Reviews: ⏸ Awaiting review
  https://github.com/owner/repo/pull/154
```

## Advanced Queries

### PR Comments and Activity

```bash
# Get comment counts
gh pr view 123 --json comments --jq '.comments | length'

# Recent activity (comments, reviews, commits)
gh pr view 123 --json timelineItems --jq '.timelineItems[] | select(.createdAt > "2024-01-15")'
```

### CI Run Details

```bash
# Get detailed check run info
gh run list --workflow=ci.yml --limit 10 --json status,conclusion,createdAt,displayTitle

# Download logs for failed runs
gh run view {run_id} --log-failed
```

### Cross-Repository Queries

For monorepos or multi-repo workflows:

```bash
# Query PRs across org
gh search prs --owner=org --state=open --json number,repository,title

# Filter by team
gh search prs --owner=org --team=@org/team-name --state=open
```

## Performance Optimization

### Batch Queries

Minimize API calls:

```typescript
async function fetchPRsBatch(prNumbers: number[]): Promise<GitHubPR[]> {
  // Single gh pr list call with all metadata
  const allPRs = await fetchOpenPRs();

  // Filter to requested PRs
  return allPRs.filter(pr => prNumbers.includes(pr.number));
}
```

### Caching

Cache PR data to avoid rate limits:

```typescript
interface PRCache {
  timestamp: Date;
  prs: GitHubPR[];
  ttl: number;
}

function getCachedPRs(ttl = 300000): GitHubPR[] | null {
  // Cache for 5 minutes by default
  const cache = loadCache();
  if (cache && Date.now() - cache.timestamp.getTime() < ttl) {
    return cache.prs;
  }
  return null;
}
```

### Parallel Fetching

```typescript
async function fetchCompletePRData(): Promise<PRData> {
  const [prs, repo, workflow_runs] = await Promise.all([
    fetchOpenPRs(),
    fetchRepoInfo(),
    fetchRecentWorkflowRuns()
  ]);

  return { prs, repo, workflow_runs };
}
```

## Cross-Referencing

### Link PRs to Branches

```typescript
function linkPRsToBranches(prs: GitHubPR[], branches: string[]): Map<string, GitHubPR> {
  // Fetch branch info for each PR
  const prBranchMap = new Map<string, GitHubPR>();

  for (const pr of prs) {
    // Get head ref (branch name) from PR
    const headRef = await exec(`gh pr view ${pr.number} --json headRefName --jq .headRefName`);
    prBranchMap.set(headRef.trim(), pr);
  }

  return prBranchMap;
}
```

### Link PRs to Issues

```typescript
function extractLinkedIssues(prBody: string): string[] {
  // Match: "Closes #123", "Fixes #456", "Resolves #789"
  const patterns = [
    /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)s?\s+#(\d+)/gi,
    /#(\d+)/g // Generic issue references
  ];

  const issueNumbers: string[] = [];
  for (const pattern of patterns) {
    const matches = prBody.matchAll(pattern);
    for (const match of matches) {
      issueNumbers.push(match[1]);
    }
  }

  return [...new Set(issueNumbers)]; // Deduplicate
}
```

## Error Handling

### Authentication

```typescript
async function ensureGitHubAuth(): Promise<boolean> {
  try {
    await exec('gh auth status');
    return true;
  } catch (error) {
    console.error('GitHub authentication required. Run: gh auth login');
    return false;
  }
}
```

### Rate Limiting

```typescript
async function checkRateLimit(): Promise<{ remaining: number; resetAt: Date }> {
  const result = await exec('gh api rate_limit --jq .rate');
  const data = JSON.parse(result);

  return {
    remaining: data.remaining,
    resetAt: new Date(data.reset * 1000)
  };
}

async function withRateLimitCheck<T>(fn: () => Promise<T>): Promise<T> {
  const limit = await checkRateLimit();

  if (limit.remaining < 10) {
    const waitTime = limit.resetAt.getTime() - Date.now();
    console.warn(`Rate limit low (${limit.remaining}). Resets in ${waitTime}ms`);
  }

  return fn();
}
```

### Repository Detection

```typescript
async function detectGitHubRepo(): Promise<string | null> {
  try {
    const result = await exec('gh repo view --json nameWithOwner --jq .nameWithOwner');
    return result.trim();
  } catch (error) {
    // Not in a GitHub repo or gh not configured
    return null;
  }
}
```

## Integration Points

### With Graphite (see graphite.md)

Enrich Graphite stack with GitHub PR details:

```typescript
async function enrichGraphiteStackWithGitHub(stack: StackNode[]): Promise<void> {
  const prNumbers = stack.map(n => n.prNumber).filter(Boolean);
  const prs = await fetchPRsBatch(prNumbers);

  for (const node of stack) {
    const pr = prs.find(p => p.number === node.prNumber);
    if (pr) {
      node.githubPR = pr;
      node.ciStatus = analyzeCheckStatus(pr);
      node.reviewStatus = summarizeReviews(pr);
    }
  }
}
```

### With CI/CD Tools

```typescript
async function fetchWorkflowRuns(since: string): Promise<WorkflowRun[]> {
  const cutoff = parseTimeConstraint(since);
  const cutoffISO = cutoff.toISOString();

  const result = await exec(
    `gh run list --json status,conclusion,createdAt,displayTitle,workflowName,url ` +
    `--created ">=${cutoffISO}" --limit 50`
  );

  return JSON.parse(result);
}
```

## Best Practices

### Minimize API Calls

- Use `--json` flag to fetch all needed fields in single call
- Cache results with appropriate TTL
- Use `gh pr list` once, filter in memory

### Handle Missing Data

```typescript
function safelyAccessPRData(pr: GitHubPR): {
  hasChecks: boolean;
  hasReviews: boolean;
  isComplete: boolean;
} {
  return {
    hasChecks: Boolean(pr.statusCheckRollup?.contexts?.length),
    hasReviews: Boolean(pr.reviewDecision),
    isComplete: Boolean(pr.statusCheckRollup && pr.reviewDecision)
  };
}
```

### Relative Timestamps

```typescript
function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}
```

## CLI Reference

Essential GitHub CLI commands:

```bash
# PR listing
gh pr list                              # All open PRs
gh pr list --limit 100                  # More PRs
gh pr list --json {fields}              # Structured output
gh pr list --search "query"             # Search PRs

# PR details
gh pr view {number}                     # Human-readable
gh pr view {number} --json {fields}     # Structured
gh pr checks {number}                   # CI checks
gh pr diff {number}                     # Show diff

# Repository info
gh repo view                            # Current repo
gh repo view --json {fields}            # Structured

# API access
gh api /repos/{owner}/{repo}/pulls      # Direct API
gh api rate_limit                       # Check limits

# Search
gh search prs {query}                   # Search PRs
gh search issues {query}                # Search issues
```

## Troubleshooting

### gh CLI Not Found

```bash
# Install GitHub CLI
# macOS: brew install gh
# Linux: See https://github.com/cli/cli#installation

# Verify installation
gh --version
```

### Not Authenticated

```bash
# Login to GitHub
gh auth login

# Check status
gh auth status
```

### Wrong Repository Context

```bash
# Verify current repo
gh repo view

# Switch to different repo
cd /path/to/repo

# Or specify repo explicitly
gh pr list --repo owner/repo
```
