# Status Reporting Examples

## Basic Usage

No time filter - defaults to 7 days:

```
User: "Give me a status report"
Agent: {parses as default 7-day window}
       {gathers from available sources}
       {presents structured report}
```

## Time-Constrained

Natural language parsing:

```
User: "Status report for last 24 hours"
Agent: {parses "last 24 hours" → "-24h"}
       {applies to all source queries}
       {presents filtered report with "Last 24 hours" header}
```

## Multi-Source Report

Full context gathering:

```
Agent gathers:
  - Graphite stack (3 branches, 3 PRs)
  - GitHub PR status (2 passing CI, 1 failing)
  - Linear issues (5 updated recently)
  - CI details (12 runs, 2 failures)

Agent presents:
  - Stack visualization with PR status
  - PR details with CI/review state
  - Issue activity sorted by priority
  - CI summary with failure links
  - Attention section: 1 failing CI, 1 unassigned high-priority issue
```

## Graceful Degradation

Limited source availability:

```
Agent detects:
  - git available (no Graphite)
  - gh CLI available
  - No Linear MCP
  - No CI access

Agent presents:
  - Standard git status (branch, commits)
  - GitHub PR section (from gh CLI)
  - Note: "Linear and CI sections unavailable"
```

## Sample Output

```
=== STATUS REPORT: my-project ===
Generated: 2024-01-15 14:30 UTC
Time filter: Last 24 hours

📊 GRAPHITE STACK
main
├─ feature/auth: ✓ synced [3 commits]
│  PR #42: Open | CI: ✓ 8/8 | Reviews: ⏳ 0/1
│  Updated: 2 hours ago
└─ feature/auth-refresh: ✓ synced [2 commits]
   PR #43: Draft | CI: ⏳ running
   Updated: 30 minutes ago

🔀 PULL REQUESTS (2 open)
PR #42: Add JWT authentication [Open]
  Author: @dev | Updated: 2 hours ago
  CI: ✓ 8/8 checks | Reviews: ⏳ awaiting review

PR #43: Token refresh flow [Draft]
  Author: @dev | Updated: 30 minutes ago
  CI: ⏳ 3/8 checks running

📋 ISSUES (3 updated)
AUTH-123: Implement refresh tokens [In Progress]
  Priority: High | Assignee: @dev
  Updated: 1 hour ago

AUTH-124: Add rate limiting [Todo]
  Priority: Medium | Assignee: unassigned
  Updated: 4 hours ago

🔧 CI/CD (5 runs)
Success: 3 | Failed: 1 | In Progress: 1

Recent Failures:
  lint-check: ESLint found 2 errors
  https://github.com/org/repo/actions/runs/123

⚠️  ATTENTION NEEDED
◆  PR #42: Awaiting review for 2 hours
◇  AUTH-124: High priority, unassigned
```
