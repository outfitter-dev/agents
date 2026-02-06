# GitButler Plugin

GitButler virtual branch workflows for parallel development, multi-agent coordination, and post-hoc commit organization.

## Skills

### virtual-branches

Core GitButler virtual branch operations. Use when working with GitButler's parallel development model, managing hunks across branches, or organizing uncommitted work.

**Triggers**: gitbutler, virtual branches, parallel development, hunk management

### stacks

Dependent branch chains and stack-based workflows. Use when building features that span multiple logical commits, managing branch dependencies, or preparing for sequential review.

**Triggers**: branch stacks, dependent branches, series, sequential PRs

### multi-agent

Coordination patterns for multiple AI agents sharing a GitButler workspace. Use when running parallel agent sessions, preventing conflicts, or establishing ownership protocols.

**Triggers**: multi-agent, parallel agents, workspace sharing, agent coordination

### complete-branch

End-to-end branch completion workflow from implementation through PR. Use when finishing a feature branch, preparing for review, or cleaning up before merge.

**Triggers**: complete branch, finish feature, prepare PR, branch cleanup

## Installation

```bash
/plugin install but@outfitter
```

## Requirements

- GitButler CLI (`but`) v0.19.0+ installed and configured
- Repository initialized with GitButler (`but setup`)
