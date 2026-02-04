---
name: check-status
description: This skill should be used when checking project status, starting sessions, reviewing activity, or when "sitrep", "status report", or "what's changed" are mentioned.
metadata:
  version: "1.0.1"
---

# Status Reporting

Gather -> aggregate -> present pattern for comprehensive project status across VCS, PRs, issues, CI.

<when_to_use>

- Starting work sessions (context refresh)
- Checking project/team activity
- Understanding PR/stack relationships
- Quick status overview before planning
- Reviewing recent changes across systems
- Understanding blockers

NOT for: deep-dive into specific items, real-time monitoring, single-source queries

</when_to_use>

<core_pattern>

**Three-stage workflow**:

1. **Gather** - collect from multiple sources
2. **Aggregate** - combine, filter, cross-reference by time/stack/status
3. **Present** - format for scanning with actionable insights

Key principles:
- Multi-source integration (VCS + code review + issues + CI)
- Time-aware filtering (natural language -> query params)
- Stack-aware organization (group by branch hierarchy)
- Scannable output (visual indicators, relative times)
- Actionable insights (highlight blockers, failures)

</core_pattern>

<workflow>

**Stage 1: Parse Constraints**

Extract time from natural language:
- "last X hours" -> `-Xh`
- "past X days" / "last X days" -> `-Xd`
- "yesterday" -> `-1d`
- "this morning" / "today" -> `-12h`
- "this week" -> `-7d`
- "since {date}" -> calculate days back

Default: 7 days if unspecified.

**Stage 2: Gather Data**

Run parallel queries for each available source:

1. **VCS State** - branch/stack structure, recent commits, working dir status
2. **Code Review** - open PRs, CI status, review decisions, activity
3. **Issues** - recently updated, status, priority, assignments
4. **CI/CD** - pipeline runs, success/failure, error summaries

Skip unavailable sources gracefully.

**Stage 3: Aggregate**

Cross-reference and organize:
- Group PRs by stack position (if stack-aware)
- Filter all by time constraint
- Correlate issues with PRs/branches
- Identify blockers (failed CI, blocking reviews)
- Calculate relative timestamps

**Stage 4: Present**

Format for scanning:
- Hierarchical sections (VCS -> PRs -> Issues -> CI)
- Visual indicators (`✓` `✗` `⏳` for status)
- Relative timestamps for recency
- Highlight attention-needed items
- Include links for deep-dive

See [templates.md](references/templates.md) for section formats.

</workflow>

<data_sources>

**VCS** - stack visualization, commit history, working dir state
- Stack-aware (Graphite, git-stack): hierarchical branch relationships
- Standard git: branch, log, remote tracking

**Code Review** - PRs/MRs, CI checks, reviews, comments
- Platforms: GitHub, GitLab, Bitbucket, Gerrit

**Issues** - recent updates, metadata, repo relationships
- Platforms: Linear, Jira, GitHub Issues, GitLab Issues

**CI/CD** - runs, success/failure, timing, errors
- Platforms: GitHub Actions, GitLab CI, CircleCI, Jenkins

Tool-specific: [graphite.md](references/graphite.md), [github.md](references/github.md), [linear.md](references/linear.md), [beads.md](references/beads.md)

</data_sources>

<aggregation>

**Cross-Referencing**:
1. PRs to branches (by name)
2. Issues to PRs (by ID in title/body)
3. CI runs to PRs (by number/SHA)
4. Issues to repos (by reference)

**Stack-Aware Organization**:
- Group PRs by hierarchy
- Show parent/child relationships
- Indicate current position
- Highlight blockers in stack order

**Filtering**:
- Time: apply to all sources, use most recent update
- Status: prioritize action-needed, open before closed

**Relative Timestamps**:
- < 1 hour: "X minutes ago"
- < 24 hours: "X hours ago"
- < 7 days: "X days ago"
- >= 7 days: "X weeks ago" or absolute

</aggregation>

<presentation>

**Visual Indicators**:
- `✓` success | `✗` failure | `⏳` pending | `⏸` draft | `🔴` blocker
- `▓▓▓░░` progress (3/5)
- `◇` minor | `◆` moderate | `◆◆` severe

**Output Structure**:

```
=== STATUS REPORT: {repo} ===
Generated: {timestamp}
{Time filter if applicable}

{VCS_SECTION}
{PR_SECTION}
{ISSUE_SECTION}
{CI_SECTION}

⚠️ ATTENTION NEEDED
{blockers and action items}
```

See [templates.md](references/templates.md) for detailed section templates.

</presentation>

<scripts>

Use `scripts/sitrep.ts` for automated gathering:

```bash
./scripts/sitrep.ts              # All sources, 24h default
./scripts/sitrep.ts -t 7d        # Last 7 days
./scripts/sitrep.ts -s github    # Specific sources
./scripts/sitrep.ts --format=text
```

Outputs JSON (structured) or text (human-readable). Reduces agent tool calls 80%+.

See [implementation.md](references/implementation.md) for script structure and patterns.

</scripts>

<dependencies>

**Required**: VCS tool (git, gt, jj), shell access

**Optional** (graceful degradation):
- Code review CLI (gh, glab)
- Issue tracker MCP/API
- CI/CD platform API

Works with ANY available subset.

</dependencies>

<rules>

ALWAYS:
- Parse time constraints before queries
- Execute queries in parallel
- Handle missing sources gracefully
- Use relative timestamps
- Highlight actionable items
- Provide links for deep-dive
- Format for scanning

NEVER:
- Fail entirely if one source unavailable
- Block on slow queries (use timeouts)
- Expose credentials
- Dump raw data without organization

</rules>

<integration>

**As session starter**:
1. Generate report (understand state)
2. Identify attention-needed items
3. Plan work (prioritize by blockers)
4. Return periodically (track progress)

**Cross-skill references**:
- Failing CI -> [debugging](../debugging/SKILL.md)
- Before planning -> use report for context
- When blocked -> check dependencies

**Automation**: daily standup, pre-commit hooks, PR creation context

</integration>

<references>

Tool integrations:
- [graphite.md](references/graphite.md) - Graphite stack and PR queries
- [github.md](references/github.md) - GitHub CLI patterns
- [linear.md](references/linear.md) - Linear MCP integration
- [beads.md](references/beads.md) - Local issue tracking

Implementation:
- [templates.md](references/templates.md) - Output templates and formatting
- [implementation.md](references/implementation.md) - Patterns, scripts, anti-patterns

Examples:
- [EXAMPLES.md](EXAMPLES.md) - Usage examples and sample output

Formatting:

</references>
