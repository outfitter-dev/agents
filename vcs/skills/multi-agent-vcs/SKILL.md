---
name: multi-agent-vcs
description: Coordinates version control operations when multiple AI agents work in parallel. Prevents stack corruption through orchestrator-only git policy. Use when dispatching subagents, parallel development, or when multi-agent git workflows are mentioned.
version: 1.0.0
metadata:
  author: outfitter
  category: version-control
---

# Multi-Agent Version Control

Tool-agnostic patterns for coordinating git operations across parallel AI agents.

<when_to_use>

- Dispatching subagents for parallel work
- Planning multi-branch implementations
- Recovering from parallel agent corruption
- Any workflow where multiple agents touch the filesystem

</when_to_use>

## The Problem

When parallel subagents perform git operations independently:

- **Mixed content** - Multiple features end up in wrong branches
- **Broken stacks** - Branches become siblings instead of parent-child
- **Mislabeled PRs** - PR titles don't match branch content
- **Hours of recovery** - Manual intervention required to fix structure

This happens because each agent sees the same starting state and creates branches independently, resulting in siblings instead of a proper stack.

## The Policy

> **Subagents MUST NOT perform git operations.**
>
> Only the **orchestrator** handles git state. Subagents write code to the filesystem and report completion.

<rules>

**ALWAYS:**
- Orchestrator creates branches before dispatching subagents
- Subagents write to filesystem only
- Subagents report which files they created/modified
- Orchestrator stages, commits, and pushes

**NEVER:**
- Subagents commit, push, or create branches
- Parallel git operations from different agents
- Background agents managing branch state

</rules>

## Correct Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR (main agent)                                  │
│  - Manages git state, branches, commits                     │
│  - Dispatches subagents for CODE ONLY                       │
│  - Collects results, stages files, commits to correct branch│
└─────────────────────────────────────────────────────────────┘
         │
         ├──► [subagent-1] Write feature-a.ts → filesystem only
         ├──► [subagent-2] Write feature-b.ts → filesystem only
         ├──► [subagent-3] Write feature-c.ts → filesystem only
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR collects, then:                               │
│  - Stages feature-a.ts → commits to branch-a                │
│  - Stages feature-b.ts → commits to branch-b                │
│  - Stages feature-c.ts → commits to branch-c                │
└─────────────────────────────────────────────────────────────┘
```

## Subagent Prompt Template

Include this when dispatching subagents for parallel work:

```
IMPORTANT: Do NOT perform any git operations (commit, push, branch creation).
Write code to the filesystem only. The orchestrator handles all git state.
Report which files you created/modified when done.
```

## TodoWrite Integration

Track git operations explicitly in todo lists:

```
# Phase: Parallel Implementation
- [ ] [senior-dev] Implement config module (filesystem only)
- [ ] [senior-dev] Implement logging module (filesystem only)
- [ ] [senior-dev] Implement state module (filesystem only)
- [ ] ORCHESTRATOR: Stage and commit implementations
  - Stage config/ → commit to feature/config
  - Stage logging/ → commit to feature/logging
  - Stage state/ → commit to feature/state
```

The `ORCHESTRATOR:` prefix makes it clear which tasks involve git operations.

## Graphite-Specific Commands

When using Graphite for stacked PRs:

```bash
# After subagents complete, orchestrator commits to specific branches
git add packages/config/
gt modify --into feature/config -m "feat(config): implement module"

git add packages/logging/
gt modify --into feature/logging -m "feat(logging): implement module"

# Restack and submit
gt restack
gt submit --stack
```

See [graphite-stacks](../graphite-stacks/SKILL.md) for full Graphite workflow.

## GitButler-Specific Commands

When using GitButler virtual branches:

```bash
# Subagents write files, orchestrator assigns to virtual branches
but branch create feature-a
but branch create feature-b

# Move files to appropriate branches
but move path/to/file.ts --to feature-a
but move path/to/other.ts --to feature-b

# Commit within each branch
but commit feature-a -m "feat: implement feature-a"
but commit feature-b -m "feat: implement feature-b"
```

## Recovery

When parallel agents have corrupted git state:

1. **Stop all agents** - Prevent further damage
2. **Assess damage** - Check branch structure (`gt status` or `git log --graph`)
3. **Stash work** - Save uncommitted changes
4. **Fix relationships** - Move branches to correct parents
5. **Redistribute files** - Commit files to correct branches
6. **Verify** - Check structure matches intent

For Graphite-specific recovery, see [recovery.md](../graphite-stacks/references/recovery.md).

## Sequential vs Parallel

| Approach | When | Git Handling |
| -------- | ---- | ------------ |
| Sequential | Dependent tasks | Each agent can commit (handoff) |
| Parallel | Independent tasks | Orchestrator-only commits |
| Background | Fire-and-forget | Never commits |

Sequential agents can safely commit because they hand off state explicitly. Parallel agents cannot because they don't see each other's changes.

## Enforcement

Currently relies on explicit instructions. Always include the git policy when:

- Dispatching parallel subagents
- Using background agents
- Coordinating multi-branch work

Future: Hook-based enforcement could intercept and block git operations from subagent contexts.

<references>

- [graphite-stacks](../graphite-stacks/SKILL.md) - Graphite-specific workflows
- [recovery.md](../graphite-stacks/references/recovery.md) - Stack corruption recovery

</references>
