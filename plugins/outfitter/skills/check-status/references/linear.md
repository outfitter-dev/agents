# Linear Integration

Tool-specific patterns for integrating Linear issue tracking into status reports via the **streamlinear MCP server** (`github:obra/streamlinear`).

> **Important**: This guide is specifically for the streamlinear MCP, not the official Linear MCP. The streamlinear server uses a single `mcp__linear__linear` tool with action-based dispatch rather than separate tools per operation.

## Overview

Linear provides issue tracking with team-based organization, project management, and rich metadata. Status reports should surface recently active issues relevant to current work context.

## Streamlinear MCP Tool

All Linear operations go through a single tool with an `action` parameter:

```typescript
// Search your active issues
await mcp__linear__linear({
  action: 'search'
});

// Search with text query
await mcp__linear__linear({
  action: 'search',
  query: 'authentication bug'
});

// Search with filters
await mcp__linear__linear({
  action: 'search',
  query: {
    team: 'BLZ',
    state: 'In Progress',
    assignee: 'me'
  }
});

// Get issue details
await mcp__linear__linear({
  action: 'get',
  id: 'BLZ-123'  // Also accepts URLs or UUIDs
});

// Update issue
await mcp__linear__linear({
  action: 'update',
  id: 'BLZ-123',
  state: 'Done'
});

// Add comment
await mcp__linear__linear({
  action: 'comment',
  id: 'BLZ-123',
  body: 'Fixed in commit abc123'
});

// Create issue
await mcp__linear__linear({
  action: 'create',
  title: 'Bug title',
  team: 'BLZ',
  body: 'Description here',
  priority: 2
});

// Raw GraphQL for advanced queries
await mcp__linear__linear({
  action: 'graphql',
  graphql: 'query { teams { nodes { id key name } } }'
});
```

## Action Reference

| Action | Purpose | Key Parameters |
|--------|---------|----------------|
| `search` | Find issues | `query` (string or object with filters) |
| `get` | Issue details | `id` (identifier, URL, or UUID) |
| `update` | Change issue | `id`, `state`, `priority`, `assignee`, `labels` |
| `comment` | Add comment | `id`, `body` |
| `create` | New issue | `title`, `team`, `body`, `priority`, `labels` |
| `graphql` | Raw queries | `graphql`, `variables` |
| `help` | Full docs | (none) |

## Priority Values

| Value | Meaning |
|-------|---------|
| 0 | None |
| 1 | Urgent |
| 2 | High |
| 3 | Medium |
| 4 | Low |

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

async function fetchTeamIssues(teamKey: string): Promise<LinearIssue[]> {
  const result = await mcp__linear__linear({
    action: 'search',
    query: { team: teamKey }
  });

  return result.issues;
}

async function fetchMyActiveIssues(): Promise<LinearIssue[]> {
  const result = await mcp__linear__linear({
    action: 'search'
  });

  return result.issues;
}
```

### Advanced Queries with GraphQL

For complex filtering not supported by the search action, use GraphQL:

```typescript
// Get all teams
async function listTeams(): Promise<Array<{id: string, key: string, name: string}>> {
  const result = await mcp__linear__linear({
    action: 'graphql',
    graphql: 'query { teams { nodes { id key name } } }'
  });

  return result.teams.nodes;
}

// Get issues updated in last N days across all teams
async function fetchRecentIssues(daysBack: number = 7): Promise<LinearIssue[]> {
  const result = await mcp__linear__linear({
    action: 'graphql',
    graphql: `
      query {
        viewer {
          assignedIssues(
            filter: { state: { type: { nin: ["completed", "canceled"] } } }
            first: 30
            orderBy: updatedAt
          ) {
            nodes {
              identifier
              title
              state { name type }
              team { key }
              priority
              updatedAt
              url
            }
          }
        }
      }
    `
  });

  return result.viewer.assignedIssues.nodes;
}

// Filter by state type
async function fetchIssuesByStateType(
  stateType: 'unstarted' | 'started' | 'completed' | 'canceled'
): Promise<LinearIssue[]> {
  const result = await mcp__linear__linear({
    action: 'graphql',
    graphql: `
      query($stateType: String!) {
        issues(
          filter: { state: { type: { eq: $stateType } } }
          first: 50
        ) {
          nodes {
            identifier
            title
            state { name type }
            team { key }
            priority
          }
        }
      }
    `,
    variables: { stateType }
  });

  return result.issues.nodes;
}
```

### Context-Aware Filtering

Map repository to Linear team/project:

```typescript
interface LinearContext {
  filterBy: 'team' | 'project' | 'query';
  team?: string;          // Team key (e.g., "BLZ")
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

## Presentation Templates

### Issue Section

```
LINEAR ISSUES (Recent Activity - {team_name})
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
    0: 'None',
    1: 'Urgent',
    2: 'High',
    3: 'Medium',
    4: 'Low'
  };

  return labels[priority] || 'None';
}
```

### Example Output

```
LINEAR ISSUES (Recent Activity - BLZ Team)
5 issues updated in last 7 days

BLZ-162: Implement authentication middleware [In Progress]
  Priority: High | Assignee: Alice Smith
  Labels: backend, security
  Updated: 3 hours ago
  https://linear.app/outfitter/issue/BLZ-162

BLZ-161: Fix user validation bug [Done]
  Priority: Urgent | Assignee: Bob Jones
  Labels: bug, backend
  Updated: 5 hours ago
  https://linear.app/outfitter/issue/BLZ-161

BLZ-158: Update dependencies [Todo]
  Priority: Low | Assignee: Unassigned
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
LINEAR ISSUES (with PR Status)

BLZ-162: Implement authentication middleware [In Progress]
  Priority: High | Assignee: Alice Smith
  PRs: #156 (Approved, CI passing)
  Updated: 3 hours ago

BLZ-161: Fix user validation bug [Done]
  Priority: Urgent | Assignee: Bob Jones
  PRs: #155 (CI failing, changes requested)
  Updated: 5 hours ago
```

## State Matching

The streamlinear MCP supports fuzzy state matching:

```typescript
// These all work:
await mcp__linear__linear({ action: 'update', id: 'BLZ-123', state: 'done' });
await mcp__linear__linear({ action: 'update', id: 'BLZ-123', state: 'Done' });
await mcp__linear__linear({ action: 'update', id: 'BLZ-123', state: 'in prog' });
await mcp__linear__linear({ action: 'update', id: 'BLZ-123', state: 'In Progress' });
```

## Error Handling

### MCP Availability

```typescript
async function checkLinearMCPAvailable(): Promise<boolean> {
  try {
    await mcp__linear__linear({ action: 'search' });
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
    if (context.filterBy === 'team' && context.team) {
      return await fetchTeamIssues(context.team);
    } else if (context.filterBy === 'query' && context.query) {
      const result = await mcp__linear__linear({
        action: 'search',
        query: context.query
      });
      return result.issues;
    }
    return await fetchMyActiveIssues();
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

### Team Key vs Team Name

Use team keys (e.g., "BLZ") rather than full names:
- Keys are shorter and less prone to typos
- The streamlinear MCP expects keys in query filters
- Keys are visible in issue identifiers (BLZ-123)

Get team keys:

```typescript
const result = await mcp__linear__linear({
  action: 'graphql',
  graphql: 'query { teams { nodes { id key name } } }'
});
// Returns: [{ id: "uuid", key: "BLZ", name: "BLZ Team" }, ...]
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

Verify the streamlinear MCP server is configured in `~/.claude.json`:

```json
{
  "mcpServers": {
    "linear": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:obra/streamlinear"]
    }
  }
}
```

Ensure `LINEAR_API_TOKEN` is set in your environment.

### No Issues Returned

```typescript
// Debug: Check available teams
const teams = await mcp__linear__linear({
  action: 'graphql',
  graphql: 'query { teams { nodes { id key name } } }'
});
console.log('Available teams:', teams);

// Debug: Try broader search
const allIssues = await mcp__linear__linear({
  action: 'search',
  query: ''
});
console.log('Total issues accessible:', allIssues.length);
```

### Authentication Issues

The streamlinear MCP reads `LINEAR_API_TOKEN` from environment. Verify it's set:

```bash
echo $LINEAR_API_TOKEN
```

Generate a new token at: <https://linear.app/settings/api>
