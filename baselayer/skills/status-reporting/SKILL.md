---
name: status-reporting
version: 1.0.0
description: Generic pattern for generating comprehensive status reports by gathering data from version control, code review platforms, issue trackers, and CI/CD systems, then aggregating and presenting in scannable format. Use when checking project status, starting sessions, reviewing activity, or when status report, sitrep, project overview, or what's changed are mentioned. Supports natural language time constraints and stack-aware organization.
---

# Status Reporting

Gather → aggregate → present pattern for comprehensive project status across VCS, PRs, issues, CI.

<when_to_use>

- Starting work sessions (context refresh)
- Checking project/team activity
- Understanding PR/stack relationships
- Quick status overview before planning
- Reviewing recent changes across systems
- Understanding what's blocking progress

NOT for: deep-dive into specific items (use native tools), real-time monitoring, single-source queries

</when_to_use>

<core_pattern>

**Three-phase workflow**:

1. **Gather** — collect data from multiple sources
2. **Aggregate** — combine, filter, cross-reference by time/stack/status
3. **Present** — format for quick scanning and actionable insights

Key principles:
- Multi-source integration (VCS + code review + issues + CI)
- Time-aware filtering (natural language → query params)
- Stack-aware organization (group by branch hierarchy)
- Scannable output (visual indicators, relative times)
- Actionable insights (highlight blockers, failures, attention needed)

</core_pattern>

<workflow>

**Phase 1: Parse Constraints**

Extract time constraints from natural language:
- "last X hours" → `-Xh`
- "past X days" / "last X days" → `-Xd`
- "yesterday" → `-1d`
- "this morning" / "today" → `-12h`
- "this week" → `-7d`
- "since {date}" → calculate days back

Store as query-compatible format for each source.

**Phase 2: Gather Data**

For each available source, run parallel queries:

1. **Version Control State**
   - Current branch/stack structure
   - Recent commits (filtered by time)
   - Branch relationships (parent/child, dependencies)
   - Working directory status

2. **Code Review Status**
   - Open PRs/MRs with metadata (state, author, timestamps)
   - CI/CD check status (passing, failing, in-progress)
   - Review decisions (approved, changes requested, pending)
   - Comment/review activity (counts, recent)

3. **Issue Tracking**
   - Recently updated issues (filtered by time)
   - Issue status and assignments
   - Priority and labels
   - Related to current repo/project

4. **CI/CD Details**
   - Recent pipeline runs
   - Success/failure counts
   - Timing information
   - Error summaries for failures

Handle missing sources gracefully — skip sections if unavailable.

**Phase 3: Aggregate Data**

Cross-reference and organize:
- Group PRs by stack position (if stack-aware VCS)
- Filter all sources by time constraint
- Correlate issues with PRs/branches when possible
- Identify blockers (failed CI, blocking reviews, dependencies)
- Calculate relative timestamps ("2 hours ago", "3 days ago")

**Phase 4: Present Report**

Format for scanning:
- Hierarchical sections (VCS → PRs → Issues → CI)
- Visual indicators (✓ ✗ ⏳ for status)
- Relative timestamps for recency
- Highlight attention-needed items
- Include links for deep-dive
- Summary counts at top of sections

</workflow>

<time_parsing>

**Natural Language → Query Parameters**

Common patterns:

| User Input | Conversion | Notes |
|------------|------------|-------|
| "last 6 hours" | `-6h` | Hours format |
| "past 2 days" | `-2d` | Days format |
| "yesterday" | `-1d` | Single day back |
| "this morning" | `-12h` | Approximate to half-day |
| "this week" | `-7d` | Full week |
| "last week" | `-7d` or `-14d` | Clarify if needed |
| "since Monday" | Calculate days | Convert to `-Xd` |
| "last 24 hours" | `-24h` or `-1d` | Normalize |

**Implementation approach**:
1. Parse user input with regex patterns
2. Extract numeric value and unit
3. Convert to source-specific format
4. Default to reasonable period if ambiguous (e.g., 7 days)
5. Pass to each source query

**Format targets**:
- CLI tools: `-Xh` or `-Xd` flags
- APIs: ISO 8601 relative (`-P7D`) or absolute timestamps
- MCP tools: `updatedAt: "-P{X}D"` format

</time_parsing>

<data_sources>

**Version Control Systems**

Gather:
- Stack/branch visualization (if supported)
- Commit history with authors and timestamps
- Working directory state (clean, modified, ahead/behind)

Stack-aware systems (Graphite, git-stack):
- Hierarchical branch relationships
- PR status per branch
- Current position in stack

Standard git:
- Current branch
- Recent commits (log with time filter)
- Remote tracking status

**Code Review Platforms**

Gather:
- Open PRs/MRs (title, number, author, timestamps)
- CI check status (success, failure, pending counts)
- Review status (approved, changes requested, no reviews)
- Comment/review activity

Platforms: GitHub, GitLab, Bitbucket, Gerrit

**Issue Trackers**

Gather:
- Recently updated issues (filtered by time)
- Issue metadata (status, assignee, priority, labels)
- Relationship to current repo/project
- Links to issues

Platforms: Linear, Jira, GitHub Issues, GitLab Issues

**CI/CD Systems**

Gather:
- Recent pipeline/workflow runs
- Success/failure breakdown
- Duration and timing information
- Error messages for failures

Platforms: GitHub Actions, GitLab CI, CircleCI, Jenkins

See [graphite.md](references/graphite.md), [github.md](references/github.md), [linear.md](references/linear.md), [beads.md](references/beads.md) for tool-specific implementations.

</data_sources>

<aggregation>

**Cross-Referencing Strategy**

Link related items across sources:
1. Match PRs to branches (by branch name)
2. Match issues to PRs (by issue ID in PR title/body)
3. Match CI runs to PRs (by PR number/commit SHA)
4. Match issues to repos (by repo reference in issue)

**Stack-Aware Organization**

For stack-aware VCS (Graphite):
- Group PRs by stack hierarchy
- Show parent/child relationships
- Indicate current position
- Highlight blockers in stack order

For standard workflows:
- Group by branch name patterns
- Sort by recency or priority

**Filtering Logic**

Time-based:
- Apply time constraint to all sources
- Use most recent update timestamp
- Include items active within window

Status-based:
- Prioritize action-needed items (failing CI, blocking reviews)
- Show open/in-progress before closed/merged
- Surface blockers prominently

**Relative Timestamps**

Convert absolute timestamps to relative:
- < 1 hour: "X minutes ago"
- < 24 hours: "X hours ago"
- < 7 days: "X days ago"
- >= 7 days: "X weeks ago" or absolute date

Provides quick sense of recency.

</aggregation>

<presentation>

**Output Structure**

```
=== STATUS REPORT: {repo-name} ===
Generated: {timestamp}
{Time filter: "Last 24 hours" if applicable}

{VCS_SECTION}
{PR_SECTION}
{ISSUE_SECTION}
{CI_SECTION}
```

**Visual Indicators**

Status:
- ✓ — success, passing, approved
- ✗ — failure, failed, rejected
- ⏳ — in-progress, pending
- ⏸ — paused, draft
- 🔴 — blocker, critical

Progress (use ░▓ from formatting conventions):
- ▓▓▓░░ — 3/5 checks passing

Severity (use ◇◆ from formatting conventions):
- ◇ — minor, informational
- ◆ — moderate, needs attention
- ◆◆ — severe, blocking

**Section Templates**

VCS Section (stack-aware):
```
📊 {VCS_NAME} STACK
{visual tree with branch relationships}
  ├─ {branch}: {status} [{commit_count} commits]
  │  PR #{num}: {pr_status} | CI: {ci_status}
  │  Updated: {relative_time}
```

VCS Section (standard):
```
📊 VERSION CONTROL
Current branch: {branch}
Status: {clean | modified | ahead X, behind Y}
Recent commits: {count} in last {period}
```

PR Section:
```
🔀 PULL REQUESTS ({open_count} open)
PR #{num}: {title} [{state}]
  Author: {author} | Updated: {relative_time}
  CI: {status_indicator} {pass}/{total} checks
  Reviews: {status_indicator} {approved}/{total} reviewers
  {blocker indicator if applicable}
```

Issue Section:
```
📋 ISSUES (Recent Activity)
{issue_key}: {title} [{status}]
  Priority: {priority} | Assignee: {assignee}
  Updated: {relative_time}
  {link}
```

CI Section:
```
🔧 CI/CD ({total} runs)
Success: {success_count} | Failed: {failed_count} | In Progress: {pending_count}

{if failures exist:}
Recent Failures:
  {workflow_name}: {error_summary}
  {link to run}
```

**Actionable Insights**

Highlight at top or in dedicated section:
- Blocked PRs (failing CI, pending reviews)
- High-priority issues needing attention
- Long-running branches without activity
- Failed CI needing investigation

Example:
```
⚠️  ATTENTION NEEDED
◆◆ PR #123: CI failing for 2 days (blocks deployment)
◆  Issue BLZ-45: High priority, unassigned
◇  Branch feature/old: No activity for 14 days
```

</presentation>

<context_awareness>

**Repository Context Mapping**

For multi-repo workflows, map current directory to relevant filters:

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

**Lookup Strategy**:
1. Check for exact path match
2. Check for pattern match (wildcard support)
3. Fall back to repo name extraction
4. Apply default filters

**Configuration Location**:
Store in skill directory or user config (e.g., `~/.config/claude/status-reporting/config.json`)

</context_awareness>

<dependencies>

**Required**:
- VCS tool (git, gt, jj, etc.)
- Shell access for command execution

**Optional** (graceful degradation):
- Code review platform CLI (gh, glab, etc.)
- Issue tracker MCP/API access
- CI/CD platform API access
- Feedback/log aggregation tools

**Execution Environment**:
- Bun/Node for TypeScript scripts (if needed)
- Python for API integrations (if needed)
- Native CLIs for direct queries (preferred)

Skill should work with ANY available subset of sources.

</dependencies>

<implementation_patterns>

**Parallel Queries**

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

**Error Handling**

Graceful degradation:
- Source unavailable → skip section, note in output
- Partial data → show what's available, note gaps
- API rate limits → use cached data, note staleness
- Authentication failures → prompt for credentials or skip

**Caching Strategy**

For expensive queries:
- Cache results with timestamp
- Reuse if fresh enough (e.g., < 5 minutes old)
- Allow cache bypass with flag
- Clear cache on explicit refresh request

**Output Formatting**

Use consistent width for scanning:
- Limit line length (80-120 chars)
- Align columns for tabular data
- Use indentation for hierarchy
- Preserve links for clickability

</implementation_patterns>

<scripts>

**Automated Gatherers**

The `scripts/` directory contains Bun scripts that do the heavy lifting:

```
scripts/
├── sitrep.ts           # Entry point - orchestrates all gatherers
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

**Output Formats**:
- `json` (default) — structured data for agent consumption
- `text` — human-readable with visual indicators

**Benefits**:
- Single command gathers all data in parallel
- Graceful degradation (missing sources skipped)
- Consistent JSON schema across sources
- Reduces agent tool calls by 80%+

Run the script first, then format/present the results.

</scripts>

<extensibility>

**Adding New Sources**

To integrate additional data sources:

1. Create reference document in `references/`
2. Define data schema (what to gather)
3. Implement query function (with time filter)
4. Add aggregation logic (cross-referencing)
5. Design presentation template
6. Update main workflow documentation

**Custom Aggregations**

Examples:
- Velocity metrics (PRs merged per day)
- Team activity (commits by author)
- Quality indicators (test coverage trends)
- Deployment frequency

Add as optional sections when data available.

**Tool-Specific Optimizations**

Reference documents should cover:
- Optimal CLI commands/API calls
- Response parsing strategies
- Rate limit handling
- Authentication patterns
- Caching recommendations

</extensibility>

<rules>

ALWAYS:
- Parse time constraints before queries
- Execute source queries in parallel
- Handle missing sources gracefully
- Use relative timestamps in output
- Highlight actionable items
- Provide links for deep-dive
- Format for scanning (visual indicators, hierarchy)

NEVER:
- Fail entirely if one source unavailable
- Block on slow queries (use timeouts)
- Expose credentials in output
- Overwhelm with raw data dumps
- Skip error context when failures occur

</rules>

<anti_patterns>

**Sequential Queries** — waiting for each source before next

Why it fails: Slow, blocks on failures

Instead: Use `Promise.allSettled()` for parallel execution

**Rigid Source Requirements** — failing if expected source missing

Why it fails: Breaks in different environments

Instead: Detect available sources, skip unavailable

**Absolute Timestamps Only** — showing raw dates without context

Why it fails: Hard to scan for recency

Instead: Use relative timestamps ("2 hours ago") with absolute in hover/detail

**Unstructured Output** — dumping all data without organization

Why it fails: Not scannable, misses insights

Instead: Follow presentation templates with hierarchy and indicators

</anti_patterns>

<integration>

**Workflow Integration**

Status reporting as session starter:
1. Generate report (understand current state)
2. Identify attention-needed items
3. Plan work session (prioritize based on blockers)
4. Return to report periodically (track progress)

**Cross-Skill References**

- After identifying failing CI → load [debugging-and-diagnosis](../debugging-and-diagnosis/SKILL.md)
- Before planning work → use status report for context
- When blocked → reference status report for dependencies

**Automation Opportunities**

- Scheduled reports (daily standup context)
- Pre-commit hooks (check status before push)
- PR creation (include status context)
- Slack/notification integration

</integration>

<references>

- [graphite.md](references/graphite.md) — Graphite stack visualization and PR queries
- [github.md](references/github.md) — GitHub CLI patterns and API usage
- [linear.md](references/linear.md) — Linear MCP integration and context mapping
- [beads.md](references/beads.md) — Local issue tracking with dependencies
- [FORMATTING.md](../../shared/rules/FORMATTING.md) — Visual indicators and formatting conventions

</references>

<examples>

**Basic Usage** (no time filter):
```
User: "Give me a status report"
Agent: {parses as default 7-day window}
       {gathers from available sources}
       {presents structured report}
```

**Time-Constrained** (natural language):
```
User: "Status report for last 24 hours"
Agent: {parses "last 24 hours" → "-24h"}
       {applies to all source queries}
       {presents filtered report with "Last 24 hours" header}
```

**Multi-Source** (full context):
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

**Graceful Degradation** (limited sources):
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

</examples>
