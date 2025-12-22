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

!`cat baselayer/skills/status-reporting/SKILL.md`

## Available References

Load these as needed based on detected/requested services:

| Service | Reference | When to Load |
|---------|-----------|--------------|
| Graphite | `baselayer/skills/status-reporting/references/graphite.md` | `gt` CLI available or user requests |
| GitHub | `baselayer/skills/status-reporting/references/github.md` | `gh` CLI available or user requests |
| Linear | `baselayer/skills/status-reporting/references/linear.md` | Linear MCP available or user requests |
| Beads | `baselayer/skills/status-reporting/references/beads.md` | `.beads/` directory exists or user requests |

---

Begin by:
1. Parse time constraints from arguments (default: 24h)
2. Detect available services (check for gt, gh, Linear MCP, .beads/)
3. Filter to requested services if specified
4. Execute the Gather → Aggregate → Present workflow
