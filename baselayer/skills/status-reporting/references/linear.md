# Linear Integration

Tool-specific patterns for integrating Linear issue tracking into status reports via Linear MCP server.

## Overview

Linear provides issue tracking with team-based organization, project management, and rich metadata. Status reports should surface recently active issues relevant to current work context.

## Linear MCP Tools

Access Linear data through MCP tools:

```typescript
// List issues with filters
await mcp__linear__list_issues({
  orderBy: 'updatedAt',
  limit: 10,
  updatedAt: '-P7D',        // ISO 8601 relative duration
  team: 'TEAM-UUID',        // Team ID (preferred) or name
  includeArchived: false
});

// Get issue details
await mcp__linear__get_issue({
  issueId: 'BLZ-123'
});

// Search issues
await mcp__linear__search_issues({
  query: 'authentication',
  limit: 20
});
```

## Data Gathering

### Issue Listing

```typescript
interface LinearIssue {
  identifier: string;      // "BLZ-123"
  title: string;
  state: {
    name: string;          // "In Progress", "Done", etc.
    type: string;          // "started", "completed", etc.
  };
  priority: number;        // 0-4 (0=none, 1=urgent, 2=high, 3=normal, 4=low)
  assignee?: {
    name: string;
    email: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
  url: string;
}

async function fetchRecentIssues(
  teamId: string,
  daysBack: number = 7,
  limit: number = 10
): Promise<LinearIssue[]> {
  const result = await mcp__linear__list_issues({
    team: teamId,
    orderBy: 'updatedAt',
    updatedAt: `-P${daysBack}D`,
    limit,
    includeArchived: false
  });

  return result.issues;
}
```

### Context-Aware Filtering

Map repository to Linear team/project:

```typescript
interface LinearContext {
  filterBy: 'team' | 'project' | 'query';
  teamId?: string;        // Preferred: UUID
  team?: string;          // Fallback: team name
  project?: string;
  query?: string;
}

interface RepoMapping {
  path: string;
  pattern?: boolean;      // If true, path supports wildcards
  linear: LinearContext;
}

interface LinearConfig {
  mappings: RepoMapping[];
  defaults: {
    daysBack: number;
    limit: number;
  };
}
```

Example configuration:

```json
{
  "mappings": [
    {
      "path": "/Users/mg/Developer/outfitter/blz",
      "linear": {
        "filterBy": "team",
        "teamId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "team": "BLZ"
      }
    },
    {
      "path": "/Users/mg/Developer/*",
      "pattern": true,
      "linear": {
        "filterBy": "query",
        "query": "outfitter"
      }
    }
  ],
  "defaults": {
    "daysBack": 7,
    "limit": 10
  }
}
```

### Context Resolution

```typescript
async function resolveLinearContext(cwd: string, config: LinearConfig): Promise<LinearContext | null> {
  // Try exact path match first
  for (const mapping of config.mappings) {
    if (!mapping.pattern && mapping.path === cwd) {
      return mapping.linear;
    }
  }

  // Try pattern match
  for (const mapping of config.mappings) {
    if (mapping.pattern) {
      const regex = new RegExp('^' + mapping.path.replace(/\*/g, '.*') + '$');
      if (regex.test(cwd)) {
        return mapping.linear;
      }
    }
  }

  // Fallback: query-based search using repo name
  const repoName = await getRepoName(cwd);
  if (repoName) {
    return {
      filterBy: 'query',
      query: repoName.split('/')[1] // Extract short name from "owner/repo"
    };
  }

  return null;
}
```

## Time Filtering

Convert natural language time constraints to ISO 8601 duration:

```typescript
function convertToISO8601Duration(timeConstraint: string): string {
  // Parse constraints like "-24h", "-7d", "-3w"
  const match = timeConstraint.match(/^-(\d+)([hdw])$/);
  if (!match) {
    throw new Error(`Invalid time constraint: ${timeConstraint}`);
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  // Convert to ISO 8601 Period format
  switch (unit) {
    case 'h': {
      // Hours: use PT{n}H
      return `-PT${num}H`;
    }
    case 'd': {
      // Days: use P{n}D
      return `-P${num}D`;
    }
    case 'w': {
      // Weeks: convert to days
      return `-P${num * 7}D`;
    }
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}

// Examples:
// "-24h" → "-PT24H"
// "-7d"  → "-P7D"
// "-2w"  → "-P14D"
```

## Presentation Templates

### Issue Section

```
📋 LINEAR ISSUES (Recent Activity - {team_name})
{count} issues updated in last {period}

{issue_identifier}: {title} [{state}]
  Priority: {priority_label} | Assignee: {assignee_name}
  Labels: {label_list}
  Updated: {relative_time}
  {issue_url}
```

### Priority Formatting

```typescript
function formatPriority(priority: number): string {
  const labels: Record<number, string> = {
    0: '○ None',
    1: '🔴 Urgent',
    2: '🟠 High',
    3: '🟡 Normal',
    4: '🟢 Low'
  };

  return labels[priority] || '○ None';
}
```

### Example Output

```
📋 LINEAR ISSUES (Recent Activity - BLZ Team)
5 issues updated in last 7 days

BLZ-162: Implement authentication middleware [In Progress]
  Priority: 🟠 High | Assignee: Alice Smith
  Labels: backend, security
  Updated: 3 hours ago
  https://linear.app/outfitter/issue/BLZ-162

BLZ-161: Fix user validation bug [Done]
  Priority: 🔴 Urgent | Assignee: Bob Jones
  Labels: bug, backend
  Updated: 5 hours ago
  https://linear.app/outfitter/issue/BLZ-161

BLZ-158: Update dependencies [Todo]
  Priority: 🟢 Low | Assignee: Unassigned
  Labels: maintenance
  Updated: 2 days ago
  https://linear.app/outfitter/issue/BLZ-158
```

## Cross-Referencing

### Link Issues to PRs

Extract issue references from PR titles/bodies:

```typescript
function extractIssueReferences(text: string): string[] {
  // Pattern: "BLZ-123" or "[BLZ-123]" or "BLZ-123:"
  const pattern = /\[?([A-Z]{2,}-\d+)\]?:?/g;
  const matches = text.matchAll(pattern);

  return Array.from(matches, m => m[1]);
}

async function linkIssuesToPRs(
  issues: LinearIssue[],
  prs: GitHubPR[]
): Promise<Map<string, GitHubPR[]>> {
  const issueMap = new Map<string, GitHubPR[]>();

  for (const issue of issues) {
    const relatedPRs = prs.filter(pr => {
      const refs = extractIssueReferences(pr.title + ' ' + pr.body);
      return refs.includes(issue.identifier);
    });

    if (relatedPRs.length > 0) {
      issueMap.set(issue.identifier, relatedPRs);
    }
  }

  return issueMap;
}
```

### Annotate Issues with PR Status

```
📋 LINEAR ISSUES (with PR Status)

BLZ-162: Implement authentication middleware [In Progress]
  Priority: 🟠 High | Assignee: Alice Smith
  PRs: #156 (✓ Approved, CI passing)
  Updated: 3 hours ago

BLZ-161: Fix user validation bug [Done]
  Priority: 🔴 Urgent | Assignee: Bob Jones
  PRs: #155 (✗ CI failing, changes requested)
  Updated: 5 hours ago
```

## Advanced Queries

### Filter by State Type

```typescript
async function fetchIssuesByState(
  teamId: string,
  stateType: 'unstarted' | 'started' | 'completed' | 'canceled'
): Promise<LinearIssue[]> {
  // Note: Linear MCP might not support direct state type filtering
  // Fetch all and filter client-side
  const allIssues = await fetchRecentIssues(teamId, 30, 50);

  return allIssues.filter(issue => issue.state.type === stateType);
}
```

### Search Across Teams

```typescript
async function searchAllTeams(query: string): Promise<LinearIssue[]> {
  const result = await mcp__linear__search_issues({
    query,
    limit: 50
  });

  return result.issues;
}
```

### Filter by Label

```typescript
function filterByLabels(issues: LinearIssue[], labels: string[]): LinearIssue[] {
  return issues.filter(issue => {
    const issueLabels = issue.labels.map(l => l.name.toLowerCase());
    return labels.some(label => issueLabels.includes(label.toLowerCase()));
  });
}
```

## Performance Optimization

### Caching

Cache Linear queries to reduce MCP calls:

```typescript
interface LinearCache {
  timestamp: Date;
  issues: LinearIssue[];
  teamId: string;
  ttl: number;
}

function getCachedIssues(teamId: string, ttl = 300000): LinearIssue[] | null {
  const cache = loadCache();
  if (
    cache &&
    cache.teamId === teamId &&
    Date.now() - cache.timestamp.getTime() < ttl
  ) {
    return cache.issues;
  }
  return null;
}
```

### Parallel Fetching

For multi-team contexts:

```typescript
async function fetchMultipleTeams(teamIds: string[]): Promise<LinearIssue[]> {
  const results = await Promise.allSettled(
    teamIds.map(id => fetchRecentIssues(id))
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<LinearIssue[]>).value);
}
```

## Error Handling

### MCP Availability

```typescript
async function checkLinearMCPAvailable(): Promise<boolean> {
  try {
    // Test with minimal query
    await mcp__linear__list_issues({ limit: 1 });
    return true;
  } catch (error) {
    console.warn('Linear MCP not available:', error.message);
    return false;
  }
}
```

### Graceful Degradation

```typescript
async function fetchLinearIssuesSafe(
  context: LinearContext | null
): Promise<LinearIssue[] | null> {
  if (!context) {
    console.log('No Linear context for current repo');
    return null;
  }

  const available = await checkLinearMCPAvailable();
  if (!available) {
    console.log('Linear MCP not available, skipping issue section');
    return null;
  }

  try {
    return await fetchRecentIssues(context.teamId || '', 7, 10);
  } catch (error) {
    console.error('Failed to fetch Linear issues:', error);
    return null;
  }
}
```

## Configuration Management

### Config File Location

Store mapping config in skill directory or user config:

```
~/.config/claude/status-reporting/linear-config.json
```

Or project-specific:

```
.claude/linear-mapping.json
```

### Loading Configuration

```typescript
async function loadLinearConfig(): Promise<LinearConfig> {
  const configPaths = [
    // User config
    path.join(os.homedir(), '.config/claude/status-reporting/linear-config.json'),
    // Project config
    path.join(process.cwd(), '.claude/linear-mapping.json')
  ];

  for (const configPath of configPaths) {
    if (await fileExists(configPath)) {
      const content = await Bun.file(configPath).text();
      return JSON.parse(content);
    }
  }

  // Return defaults
  return {
    mappings: [],
    defaults: {
      daysBack: 7,
      limit: 10
    }
  };
}
```

## Best Practices

### Team ID vs Team Name

Prefer team UUID over name:
- UUIDs are stable (don't change if team renamed)
- Names may have casing/spacing variations
- UUIDs are more efficient for API queries

Get team UUID:
```typescript
// Via Linear MCP search or list teams
const teams = await mcp__linear__list_teams();
const blzTeam = teams.find(t => t.name === 'BLZ');
const teamId = blzTeam.id; // Use this in config
```

### Relative Time Display

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
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}
```

### Issue Prioritization

Show high-priority and urgent issues first:

```typescript
function sortIssuesByPriority(issues: LinearIssue[]): LinearIssue[] {
  return issues.sort((a, b) => {
    // Lower number = higher priority (1=urgent, 2=high, 3=normal, 4=low)
    // 0=none goes to end
    const priorityA = a.priority === 0 ? 99 : a.priority;
    const priorityB = b.priority === 0 ? 99 : b.priority;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Same priority: sort by updated time (most recent first)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
```

## Integration Points

### With GitHub (see github.md)

Correlate Linear issues with GitHub PRs:

```typescript
async function correlateLinearWithGitHub(
  issues: LinearIssue[],
  prs: GitHubPR[]
): Promise<void> {
  for (const issue of issues) {
    // Find PRs referencing this issue
    const relatedPRs = prs.filter(pr => {
      const refs = extractIssueReferences(pr.title + ' ' + (pr.body || ''));
      return refs.includes(issue.identifier);
    });

    if (relatedPRs.length > 0) {
      issue.relatedPRs = relatedPRs;
    }
  }
}
```

### With Graphite (see graphite.md)

Show Linear issues alongside stack:

```typescript
async function annotateStackWithLinear(
  stack: StackNode[],
  issues: LinearIssue[]
): Promise<void> {
  for (const node of stack) {
    if (!node.prTitle) continue;

    const refs = extractIssueReferences(node.prTitle);
    node.linearIssues = issues.filter(issue =>
      refs.includes(issue.identifier)
    );
  }
}
```

## Troubleshooting

### Linear MCP Not Found

```bash
# Verify Linear MCP server is installed and configured
# Check Claude Code MCP settings
```

### No Issues Returned

```typescript
// Debug: Check team ID
const teams = await mcp__linear__list_teams();
console.log('Available teams:', teams);

// Debug: Try broader query
const allIssues = await mcp__linear__search_issues({
  query: '',
  limit: 100
});
console.log('Total issues accessible:', allIssues.length);
```

### Team ID Not Working

```typescript
// Fall back to team name
await mcp__linear__list_issues({
  team: 'BLZ',  // Use name instead of UUID
  orderBy: 'updatedAt',
  limit: 10
});
```
