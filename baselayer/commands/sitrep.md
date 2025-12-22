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

## Quick Start (Script-Based)

For fastest results, run the sitrep script:

```bash
# Run from the skills directory
./baselayer/skills/status-reporting/scripts/sitrep.ts

# With options
./sitrep.ts -t 7d                    # Last 7 days
./sitrep.ts -s github,beads          # Specific sources only
./sitrep.ts --format=text            # Human-readable output
```

The script runs all gatherers in parallel and returns structured JSON (default) or formatted text.

---

!`cat baselayer/skills/status-reporting/SKILL.md`

## Available References

Load these as needed based on detected/requested services:

| Service | Reference | When to Load |
|---------|-----------|--------------|
| Graphite | `baselayer/skills/status-reporting/references/graphite.md` | `gt` CLI available or user requests |
| GitHub | `baselayer/skills/status-reporting/references/github.md` | `gh` CLI available or user requests |
| Linear | `baselayer/skills/status-reporting/references/linear.md` | Linear MCP available or user requests |
| Beads | `baselayer/skills/status-reporting/references/beads.md` | `.beads/` directory exists or user requests |

## Scripts

The `scripts/` directory contains Bun scripts for automated data gathering:

| Script | Purpose |
|--------|---------|
| `sitrep.ts` | Orchestrator — runs all gatherers, aggregates results |
| `gatherers/graphite.ts` | Graphite stack and branch data |
| `gatherers/github.ts` | GitHub PRs and CI status |
| `gatherers/linear.ts` | Linear issues via Claude CLI headless mode |
| `gatherers/beads.ts` | Local beads issues |
| `lib/time.ts` | Time parsing utilities |
| `lib/types.ts` | Shared type definitions |

---

Begin by:
1. Parse time constraints from arguments (default: 24h)
2. **Option A (fast)**: Run `./scripts/sitrep.ts -t {time}` and present results
3. **Option B (manual)**: Detect available services and gather individually
4. Execute the Gather → Aggregate → Present workflow
