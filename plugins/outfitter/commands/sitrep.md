---
description: Generate comprehensive status report across VCS, PRs, issues, and CI/CD
argument-hint: [time range and/or services: graphite, github, linear, beads, all]
---

# Situation Report

Generate a scannable status report for the current project.

## Steps

1. **Detect** — Load the `check-status` skill and run the detection script.
2. **Consider** — Parse the context below for time range and service filters. Ultrathink.
3. **Dispatch** — Launch the **outfitter:scout** agent via Task tool with detected services and context
4. **Retain** — Keep the agent ID for follow-up questions (use `resume` parameter)

## Guidance

- Pass detected services to scout so it knows what to query
- Default time range: 24 hours if not specified
- Lead with attention-needed items (blockers, failing CI, stale branches)
- Present for quick scanning — user should gain situational awareness in 30 seconds

## Context

- $ARGUMENTS
