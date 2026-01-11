# Implementation Patterns

Technical patterns for status report generation.

## Parallel Queries

Execute source queries concurrently:

```typescript
const [vcsData, prData, issueData, ciData] = await Promise.allSettled([
  fetchVCSState(timeFilter),
  fetchPRStatus(timeFilter),
  fetchIssues(timeFilter),
  fetchCIStatus(timeFilter)
]);

// Handle each result (success or failure)
// Skip sections where source unavailable
```

## Error Handling

Graceful degradation:
- Source unavailable → skip section, note in output
- Partial data → show available, note gaps
- API rate limits → use cached data, note staleness
- Auth failures → prompt for credentials or skip

## Caching Strategy

For expensive queries:
- Cache with timestamp
- Reuse if fresh (< 5 min)
- Allow bypass with flag
- Clear on explicit refresh

## Scripts

The `scripts/` directory contains Bun scripts for data gathering:

```
scripts/
├── sitrep.ts           # Entry point - orchestrates gatherers
├── gatherers/
│   ├── graphite.ts     # Graphite stack data
│   ├── github.ts       # GitHub PRs, CI status
│   ├── linear.ts       # Linear issues (via Claude CLI headless)
│   └── beads.ts        # Beads local issues
└── lib/
    ├── time.ts         # Time parsing utilities
    └── types.ts        # Shared type definitions
```

**Usage**:

```bash
./scripts/sitrep.ts                     # All sources, 24h default
./scripts/sitrep.ts -t 7d               # All sources, last 7 days
./scripts/sitrep.ts -s github,beads     # Specific sources only
./scripts/sitrep.ts --format=text       # Human-readable output
```

**Output formats**: `json` (default, structured) | `text` (human-readable)

**Benefits**:
- Single command, parallel gathering
- Graceful degradation
- Consistent JSON schema
- Reduces agent tool calls 80%+

## Extensibility

### Adding New Sources

1. Create reference doc in `references/`
2. Define data schema
3. Implement query function with time filter
4. Add aggregation logic
5. Design presentation template
6. Update workflow docs

### Custom Aggregations

Optional sections when data available:
- Velocity metrics (PRs merged/day)
- Team activity (commits by author)
- Quality indicators (test coverage trends)
- Deployment frequency

### Tool-Specific Docs

Reference documents should cover:
- Optimal CLI/API calls
- Response parsing
- Rate limit handling
- Auth patterns
- Caching recommendations

## Context Awareness

Map repos to relevant filters:

```json
{
  "mappings": [
    {
      "path": "/absolute/path/to/repo",
      "filters": {
        "issues": { "team": "TEAM-ID" },
        "labels": ["repo-name"]
      }
    },
    {
      "path": "/path/with/*",
      "pattern": true,
      "filters": {
        "issues": { "project": "PROJECT-ID" }
      }
    }
  ],
  "defaults": {
    "time_period": "7d",
    "issue_limit": 10,
    "pr_limit": 20
  }
}
```

**Lookup strategy**:
1. Exact path match
2. Pattern match (wildcards)
3. Repo name extraction
4. Default filters

**Config location**: `~/.config/claude/status-reporting/config.json`

## Anti-Patterns

### Sequential Queries

**Problem**: Waiting for each source before next
**Why fails**: Slow, blocks on failures
**Instead**: `Promise.allSettled()` for parallel

### Rigid Source Requirements

**Problem**: Failing if expected source missing
**Why fails**: Breaks in different environments
**Instead**: Detect available, skip unavailable

### Absolute Timestamps Only

**Problem**: Raw dates without context
**Why fails**: Hard to scan for recency
**Instead**: Relative ("2 hours ago") with absolute in detail

### Unstructured Output

**Problem**: Dumping all data without organization
**Why fails**: Not scannable, misses insights
**Instead**: Templates with hierarchy and indicators
