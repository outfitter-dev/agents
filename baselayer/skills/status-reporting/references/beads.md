# Beads Integration

Local issue tracking with dependency awareness. Complements remote platforms (GitHub, Linear) with project-scoped work items stored in `.beads/`.

## Overview

Beads provides:
- Local-first issue tracking (no remote dependency)
- Dependency graphs between issues
- Status workflow (open → in_progress → blocked → closed)
- Priority levels and type classification
- Assignee tracking for team awareness

**Key difference from Linear/GitHub**: Beads tracks work items at the project level, not org-wide. Data lives in `.beads/` directory.

## Core Commands for Status Reporting

### Stats Overview

```bash
bd stats
```

Returns project-level metrics:
- Total issues, open/closed counts
- In-progress and blocked counts
- Ready items (unblocked, actionable)
- Average lead time

**Use for**: Top-level summary section, health indicators.

### List Issues

```bash
bd list                           # All issues (default limit: 20)
bd list --status=open             # Filter by status
bd list --status=in_progress      # Active work
bd list --status=blocked          # Stuck items
bd list --priority=1              # Urgent only (1=urgent, 4=low)
bd list --type=bug                # Filter by type
bd list --assignee=alice          # Filter by assignee
bd list --limit=10                # Pagination
```

**Statuses**: `open`, `in_progress`, `blocked`, `closed`
**Types**: `bug`, `feature`, `task`, `epic`, `chore`
**Priority**: 1 (urgent) → 4 (low), 0 (none)

**Use for**: Recent activity, filtered views, assignee workload.

### Ready Items

```bash
bd ready                          # Unblocked items ready for work
bd ready --limit=5                # Top 5 actionable
bd ready --priority=1             # Urgent and ready
bd ready --assignee=alice         # Ready for specific person
```

Returns issues with zero blocking dependencies.

**Use for**: "What to work on next" section, actionable items.

### Blocked Items

```bash
bd blocked
```

Returns issues in blocked status with their blocking dependencies.

**Use for**: Dependency visibility, bottleneck identification.

### Issue Details

```bash
bd show <issue-id>                # Full details with dependencies
```

Returns:
- Full description, design notes, acceptance criteria
- Blocking/blocked-by relationships
- Activity history

**Use for**: Deep dive on specific blocked items.

## Data Schema

```typescript
interface BeadsIssue {
  id: string;                     // e.g., "AG-1", "BLZ-42"
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'blocked' | 'closed';
  issue_type: 'bug' | 'feature' | 'task' | 'epic' | 'chore';
  priority: 0 | 1 | 2 | 3 | 4;    // 1=urgent, 4=low, 0=unset
  assignee?: string;
  labels: string[];
  created_at: string;             // ISO 8601
  updated_at: string;             // ISO 8601
  closed_at?: string;
  dependency_count: number;       // Issues blocking this
  dependent_count: number;        // Issues this blocks
}

interface BeadsStats {
  total: number;
  open: number;
  in_progress: number;
  blocked: number;
  closed: number;
  ready: number;                  // Unblocked and actionable
  average_lead_time?: number;     // Days from open to close
}
```

## Time Filtering

Beads lacks native time-based filtering. Apply client-side filtering on `updated_at`:

```typescript
// Filter to issues updated within time range
function filterByTime(issues: BeadsIssue[], hoursBack: number): BeadsIssue[] {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hoursBack);

  return issues.filter(issue =>
    new Date(issue.updated_at) >= cutoff
  );
}

// Example: last 24 hours
const recentIssues = filterByTime(allIssues, 24);
```

**Recommendation**: Fetch with higher limit, filter client-side, then present top N.

## Gathering Pattern

```typescript
async function gatherBeadsData(timeHours: number = 24) {
  // 1. Get overview stats
  const stats = await bd.stats();

  // 2. Get in-progress work
  const inProgress = await bd.list({
    status: 'in_progress',
    limit: 10
  });

  // 3. Get ready items (actionable)
  const ready = await bd.ready({ limit: 5 });

  // 4. Get blocked items with dependencies
  const blocked = await bd.blocked();

  // 5. Get recently closed (for velocity)
  const closed = await bd.list({
    status: 'closed',
    limit: 10
  });
  const recentlyClosed = filterByTime(closed, timeHours);

  return { stats, inProgress, ready, blocked, recentlyClosed };
}
```

## Presentation Template

```
📋 BEADS ISSUES
{stats.total} total | {stats.open} open | {stats.in_progress} active | {stats.blocked} blocked

Ready to Work:
  {id}: {title} [{type}, {priority_label}]
  ...

In Progress:
  {id}: {title}
    Status: {status} | Updated: {relative_time} | Assignee: {assignee}
  ...

Blocked ({blocked.length}):
  {id}: {title}
    ⛔ Blocked by: {blocking_ids}
  ...

Recently Closed ({recentlyClosed.length}):
  ✓ {id}: {title} — closed {relative_time}
  ...
```

### Priority Labels

| Priority | Label | Indicator |
|----------|-------|-----------|
| 1 | urgent | 🔴 |
| 2 | high | 🟠 |
| 3 | normal | 🟡 |
| 4 | low | ⚪ |
| 0 | unset | — |

### Status Indicators

| Status | Indicator |
|--------|-----------|
| open | ◯ |
| in_progress | ◐ |
| blocked | ⛔ |
| closed | ✓ |

## Cross-Referencing

### With GitHub PRs

Match beads issue IDs in PR titles/branches:
- PR title: "AG-123: Implement feature" → links to beads AG-123
- Branch: `ag-123-feature` → links to beads AG-123

```typescript
function linkPRToBeads(prTitle: string, beadsIssues: BeadsIssue[]) {
  const match = prTitle.match(/^([A-Z]+-\d+):/);
  if (match) {
    return beadsIssues.find(i => i.id === match[1]);
  }
  return null;
}
```

### With Linear Issues

Beads `external_ref` field can store Linear issue URL:

```bash
bd update AG-123 --external-ref="https://linear.app/team/issue/TEAM-456"
```

Query: Check `external_ref` for Linear correlation.

### With Graphite Stacks

Match branch names to beads issues:
- Branch: `ag-123-feature` → beads issue AG-123
- Stack contains multiple branches → multiple linked issues

## Context Detection

Beads requires workspace context. Detect via:

```bash
# Check if beads initialized
ls .beads/issues.db 2>/dev/null && echo "beads available"

# Or via MCP
bd where-am-i
```

**Auto-detection**: Include beads in sitrep when `.beads/` directory exists in project root.

## MCP Tools Reference

When using beads via MCP server:

| Tool | Purpose |
|------|---------|
| `beads__stats` | Project metrics overview |
| `beads__list` | Query issues with filters |
| `beads__ready` | Unblocked, actionable items |
| `beads__blocked` | Blocked items with dependencies |
| `beads__show` | Single issue details |

**Context**: Call `beads__set_context` with workspace root before other operations.

## Error Handling

```typescript
// Handle uninitialized beads
try {
  const stats = await bd.stats();
} catch (e) {
  if (e.message.includes('not initialized')) {
    // Skip beads section, note in output
    return { available: false, reason: 'Beads not initialized' };
  }
  throw e;
}
```

**Common errors**:
- "Beads not initialized" → `.beads/` doesn't exist
- "No context set" → call `set_context` first
- "Issue not found" → invalid issue ID

## Best Practices

1. **Prioritize Ready Items**: Show unblocked work prominently — these are actionable now

2. **Highlight Blockers**: Blocked items with their dependencies help identify bottlenecks

3. **Time-Filter Thoughtfully**: Since filtering is client-side, fetch reasonable limits (20-50) then filter

4. **Cross-Reference PRs**: Link beads issues to PRs/branches when ID patterns match

5. **Show Velocity**: Recently closed items indicate progress, especially useful for standups

6. **Respect Priority**: Sort by priority within each section (urgent first)

7. **Assignee Context**: When user has assignee, highlight their work specifically

## Integration Points

| Source | Correlation | Use Case |
|--------|-------------|----------|
| GitHub PRs | Issue ID in title/branch | Link PRs to tracked work |
| Graphite stacks | Branch naming | Show stack progress per issue |
| Linear | external_ref field | Bridge local ↔ team tracking |

## Troubleshooting

**"Beads not initialized"**

```bash
bd init                           # Initialize in project root
bd init --prefix=PROJ             # Custom prefix (e.g., PROJ-1)
```

**"No issues found"**
- Check workspace context: `bd where-am-i`
- Verify `.beads/` exists in expected location

**"Wrong project context"**

```bash
bd set-context /path/to/project   # Set correct workspace
```

**Stale data**
- Beads data is local — always fresh
- No caching concerns unlike remote APIs
