---
description: Generate comprehensive status report across VCS, PRs, issues, and CI/CD
argument-hint: [time range and/or services: graphite, github, linear, beads, all]
---

# Situation Report

Generate a scannable status report for the current project.

## Arguments

$ARGUMENTS

Parse arguments for:
- **Time range**: "last 24 hours", "since yesterday", "past week" (default: 24h)
- **Services**: graphite, github, linear, beads, all (default: auto-detect available)

---

Load the status-reporting skill and begin by:
1. Parsing time constraints from arguments (default: 24h)
2. Detecting available services (Graphite, GitHub, Linear, Beads)
3. Executing the Gather → Aggregate → Present workflow

## Quick Start (Script-Based)

For fastest results, run the sitrep script:

```bash
# From the plugin
bun run ${CLAUDE_PLUGIN_ROOT}/skills/status-reporting/scripts/sitrep.ts

# With options
bun run ${CLAUDE_PLUGIN_ROOT}/skills/status-reporting/scripts/sitrep.ts -t 7d
bun run ${CLAUDE_PLUGIN_ROOT}/skills/status-reporting/scripts/sitrep.ts -s github,beads
bun run ${CLAUDE_PLUGIN_ROOT}/skills/status-reporting/scripts/sitrep.ts --format=text
```

The script runs all gatherers in parallel and returns structured JSON (default) or formatted text.

## Available References

Load these from the status-reporting skill as needed based on detected/requested services:

| Service | Reference | When to Load |
|---------|-----------|--------------|
| Graphite | `references/graphite.md` | `gt` CLI available or user requests |
| GitHub | `references/github.md` | `gh` CLI available or user requests |
| Linear | `references/linear.md` | Linear MCP available or user requests |
| Beads | `references/beads.md` | `.beads/` directory exists or user requests |

## Scripts

The skill's `scripts/` directory contains Bun scripts for automated data gathering:

| Script | Purpose |
|--------|---------|
| `sitrep.ts` | Orchestrator — runs all gatherers, aggregates results |
| `gatherers/graphite.ts` | Graphite stack and branch data |
| `gatherers/github.ts` | GitHub PRs and CI status |
| `gatherers/linear.ts` | Linear issues via Claude CLI headless mode |
| `gatherers/beads.ts` | Local beads issues |
| `lib/time.ts` | Time parsing utilities |
| `lib/types.ts` | Shared type definitions |
