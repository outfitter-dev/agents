---
name: multi-agent-vcs
description: This skill should be used when dispatching subagents for parallel development, coordinating multi-branch implementations, or when "parallel agents", "orchestrator commits", "subagent filesystem only", "multi-agent git", or "prevent stack corruption" are mentioned. Prevents stack corruption through orchestrator-only git policy.
metadata:
  version: "1.0.0"
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

Add to subagent prompts when dispatching parallel work:

```
IMPORTANT: Do NOT perform any git operations (commit, push, branch creation).
Write code to the filesystem only. The orchestrator handles all git state.
Report which files you created/modified when done.
```

## Task Integration

Track git operations explicitly in task lists:

```
# Stage: Parallel Implementation
- [ ] [engineer] Implement config module (filesystem only)
- [ ] [engineer] Implement logging module (filesystem only)
- [ ] [engineer] Implement state module (filesystem only)
- [ ] ORCHESTRATOR: Stage and commit implementations
  - Stage config/ → commit to feature/config
  - Stage logging/ → commit to feature/logging
  - Stage state/ → commit to feature/state
```

The `ORCHESTRATOR:` prefix makes it clear which tasks involve git operations.

## Graphite-Specific Commands

When using Graphite for stacked PRs, the orchestrator handles all git operations:

```bash
# After subagents complete, orchestrator commits to each branch

# For feature/config branch
gt checkout feature/config
git add packages/config/
gt modify -am "feat(config): implement module"

# For feature/logging branch
gt checkout feature/logging
git add packages/logging/
gt modify -am "feat(logging): implement module"

# Alternative: Use absorb from top of stack
# Graphite routes staged files to the branch that owns them
gt top
git add .
gt absorb

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
