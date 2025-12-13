---
name: gitbutler-multi-agent
description: Enables AI agents to collaborate concurrently using GitButler's virtual branches, supporting parallel feature development, sequential handoffs, and commit transfer patterns without checkout overhead or workspace duplication.
---

# GitButler Multi-Agent Coordination

Coordinate multiple AI agents working concurrently in the same workspace using GitButler's virtual branch model.

## When to Use This Skill

- Multiple agents need to work on different features simultaneously
- Sequential agent handoffs (Agent A → Agent B) without checkout overhead
- Commit ownership transfer between agents
- Parallel execution with early conflict detection
- Post-hoc reorganization of multi-agent work

## Quick Start

### Parallel Feature Development

```bash
# Agent A: Create auth feature
but branch new agent-a-auth
echo "auth code" > auth.ts
but rub auth.ts agent-a-auth
but commit agent-a-auth -m "feat: add authentication"

# Agent B: Create API (simultaneously, same workspace!)
but branch new agent-b-api
echo "api code" > api.ts
but rub api.ts agent-b-api
but commit agent-b-api -m "feat: add API endpoints"

# Result: Two independent features, zero conflicts
```

### Sequential Handoff

```bash
# Agent A: Initial implementation
but branch new initial-impl
# ... code ...
but commit initial-impl -m "feat: initial implementation"

# Agent B: Takes ownership and refines
but rub <agent-a-commit> refinement-branch
# ... improve code ...
but commit refinement-branch -m "refactor: optimize implementation"

# Agent A's branch now empty, Agent B owns the work
```

### Cross-Agent Commit Transfer

```bash
# Agent A transfers commit to Agent B's branch
but rub <commit-sha> agent-b-branch

# Agent B transfers commit to Agent A's branch
but rub <commit-sha> agent-a-branch

# Commits instantly change ownership
```

## Core Concepts

### Virtual Branch Cohabitation

**Problem with traditional Git**:
- Agents must work in separate worktrees (directory coordination)
- Constant branch switching (context loss, file churn)
- Late conflict detection (only at merge time)

**GitButler's virtual branches**:
- Multiple branches stay applied simultaneously
- Single shared workspace, zero checkout operations
- Immediate conflict detection (shared working tree)
- Each agent manipulates their own lane

### The `but rub` Power Tool

Single command handles four critical operations:

| Operation | Example | Use Case |
|-----------|---------|----------|
| **Assign** | `but rub m6 claude-branch` | Organize files to branches post-hoc |
| **Move** | `but rub abc1234 other-branch` | Transfer work between agents |
| **Squash** | `but rub newer older` | Clean up history |
| **Amend** | `but rub file commit` | Fix existing commits |

## Essential Patterns

### 1. Branch Naming Convention

```
<agent-name>-<task-type>-<brief-description>

Examples:
- claude-feat-user-auth
- droid-fix-api-timeout
- codex-refactor-database-layer
```

Makes ownership immediately visible in `but status` and `but log`.

### 2. Immediate File Assignment

```bash
# Bad: File sits in unassigned changes
echo "content" > new-file.md
# ... later, forgot which branch it belongs to

# Good: Assign immediately
echo "content" > new-file.md
but rub new-file.md my-branch
```

### 3. Status Broadcasting Protocol

**For concurrent agent coordination**:

```bash
# File-based coordination
but status > /tmp/agent-$(whoami)-status.txt

# Or use Linear comments
# "[AGENT-A] Completed auth module, committed to claude-auth-feature"
```

### 4. Snapshot Cadence

```bash
# Before risky operations
but snapshot --message "Before merging conflicting branches"
but rub <conflict-commit> <branch>

# If it breaks
but undo
```

## Multi-Agent Workflows

### Parallel Execution (Agent A ∥ Agent B)

**Killer feature**: Agents work on overlapping files without blocking.

```bash
# Both agents create files simultaneously
# Both commit to different branches
# Zero conflicts despite same directory
# Status shows branches clearly separated
```

**Why this works**:
1. No artificial serialization - agents don't wait
2. Hunk-level tracking - GitButler assigns file hunks separately
3. Early conflict detection - overlapping hunks surface immediately

### Sequential Hand-offs (Agent A → Agent B)

**Before GitButler**:
```bash
# Agent A finishes work
git checkout -b feature-a
git commit -m "Initial work"
git push

# Agent B takes over
git fetch
git checkout feature-a
```

**With GitButler**:
```bash
# Agent A finishes work on their branch
but rub <commit> agent-b-branch  # Transfer ownership instantly

# Agent B continues in same workspace
# No checkout, no fetch, no directory change
```

### Review + Fix Cycle

```bash
# Agent A: Reviewer finds issues
but branch new fixes-for-feature-x
# ... make fixes ...
but commit fixes-for-feature-x -m "fix: address review feedback"

# Agent B: Original author
# Sees fixes immediately in shared workspace
# Can cherry-pick or squash fixes into original branch
but rub <fix-commit> original-feature-x
```

## Critical Rules

### Mixed-Tool Hazard

**Critical warning**: Using `git` commands directly corrupts GitButler state.

```bash
# Don't do this
but branch new my-feature
git commit -m "Changes"  # ❌ BREAKS GITBUTLER

# Must do this
but branch new my-feature
but commit my-feature -m "Changes"  # ✅ Maintains state
```

### Unassigned Changes Drift

**Detection**:
```bash
but status | grep -A100 "Unassigned Changes"
```

**Prevention**: Immediate assignment discipline.

### Concurrent Safety

1. **Snapshot before risky operations**
2. **Broadcast status regularly** to other agents
3. **Respect 🔒 locks** - files assigned to other branches
4. **Use `but --json`** for programmatic state inspection

## GitButler vs. Other Workflows

### vs. Graphite

| Aspect | Graphite | GitButler | Winner |
|--------|----------|-----------|--------|
| **Multi-agent concurrency** | Serial (checkout required) | Parallel (virtual branches) ✅ | GitButler |
| **Post-hoc organization** | Difficult | `but rub` trivial ✅ | GitButler |
| **PR Submission** | `gt submit --stack` ✅ | GUI only ❌ | Graphite |
| **Automation completeness** | Full CLI coverage ✅ | Partial CLI ❌ | Graphite |

**Verdict**: GitButler for exploratory multi-agent development; Graphite for production automation.

### vs. Git Worktrees

| Aspect | Worktrees | GitButler | Winner |
|--------|-----------|-----------|--------|
| **Physical layout** | N directories | 1 directory ✅ | GitButler |
| **Context switching** | `cd` required | None ✅ | GitButler |
| **Conflict detection** | Late (merge time) | Early (shared workspace) ✅ | GitButler |
| **Disk usage** | N × repo size | 1 × repo size ✅ | GitButler |

## Current Limitations

### CLI Coverage Gaps

**Missing operations**:
- ❌ PR submission (no `gt submit --stack` equivalent)
- ❌ Stack navigation (no `gt up`/`gt down`)
- ❌ Remote push with stack metadata
- ❌ Interactive branch selection

**Workaround**: Use GitHub CLI (`gh pr create`) after organizing with GitButler.

### File Path Issues

**Problem**: Filenames with dashes fail as range operators

```bash
❌ but rub file-with-dashes.md branch  # Fails
✅ but rub m6 branch  # Only solution: use generated ID
```

## Summary

GitButler's virtual branch model is **transformative for multi-agent collaboration**. Key advantages:

✅ **Parallel execution** - Multiple agents, same workspace, zero blocking
✅ **Instant transfers** - `but rub` moves commits between agents atomically
✅ **Early conflicts** - Shared workspace surfaces issues immediately
✅ **Post-hoc organization** - Code first, organize later

**Current gaps**: PR submission, file path handling, complete JSON API

**Recommendation**: Use for exploratory multi-agent work. For production automation requiring PR submission, consider Graphite until CLI matures.
