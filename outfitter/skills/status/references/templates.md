# Presentation Templates

Output formats and section templates for status reports.

## Output Structure

```
=== STATUS REPORT: {repo-name} ===
Generated: {timestamp}
{Time filter: "Last 24 hours" if applicable}

{VCS_SECTION}
{PR_SECTION}
{ISSUE_SECTION}
{CI_SECTION}
```

## Visual Indicators

**Status**:
- `✓` success, passing, approved
- `✗` failure, failed, rejected
- `⏳` in-progress, pending
- `⏸` paused, draft
- `🔴` blocker, critical

**Progress** (use `░▓`):
- `▓▓▓░░` — 3/5 checks passing

**Severity** (use `◇◆`):
- `◇` minor, informational
- `◆` moderate, needs attention
- `◆◆` severe, blocking

## Section Templates

### VCS Section (Stack-Aware)

```
📊 {VCS_NAME} STACK
{visual tree with branch relationships}
  ├─ {branch}: {status} [{commit_count} commits]
  │  PR #{num}: {pr_status} | CI: {ci_status}
  │  Updated: {relative_time}
```

### VCS Section (Standard)

```
📊 VERSION CONTROL
Current branch: {branch}
Status: {clean | modified | ahead X, behind Y}
Recent commits: {count} in last {period}
```

### PR Section

```
🔀 PULL REQUESTS ({open_count} open)
PR #{num}: {title} [{state}]
  Author: {author} | Updated: {relative_time}
  CI: {status_indicator} {pass}/{total} checks
  Reviews: {status_indicator} {approved}/{total} reviewers
  {blocker indicator if applicable}
```

### Issue Section

```
📋 ISSUES (Recent Activity)
{issue_key}: {title} [{status}]
  Priority: {priority} | Assignee: {assignee}
  Updated: {relative_time}
  {link}
```

### CI Section

```
🔧 CI/CD ({total} runs)
Success: {success_count} | Failed: {failed_count} | In Progress: {pending_count}

{if failures exist:}
Recent Failures:
  {workflow_name}: {error_summary}
  {link to run}
```

### Attention Section

Highlight action-needed items at top:

```
⚠️  ATTENTION NEEDED
◆◆ PR #123: CI failing for 2 days (blocks deployment)
◆  Issue BLZ-45: High priority, unassigned
◇  Branch feature/old: No activity for 14 days
```

## Formatting Guidelines

- Limit line length: 80-120 chars
- Align columns for tabular data
- Use indentation for hierarchy
- Preserve links for clickability
- Relative timestamps for recency
