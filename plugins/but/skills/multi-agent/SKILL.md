---
name: gitbutler-multi-agent
description: This skill should be used when coordinating multiple AI agents working concurrently, handling agent handoffs, transferring commits between agents, or when "multi-agent", "concurrent agents", "parallel agents", "agent collaboration", or "parallel execution" are mentioned with GitButler. Provides virtual branch patterns for parallel execution without coordination overhead.
metadata:
  version: "1.0.0"
  author: outfitter
  category: version-control
  related-skills:
    - gitbutler-virtual-branches
    - gitbutler-stacks
    - multi-agent-vcs
---

# GitButler Multi-Agent Coordination

Multiple agents → virtual branches → parallel execution → zero coordination overhead.

<when_to_use>

- Multiple agents working on different features simultaneously
- Sequential agent handoffs (Agent A → Agent B)
- Commit ownership transfer between agents
- Parallel execution with early conflict detection
- Post-hoc reorganization of multi-agent work

NOT for: single-agent workflows (use standard GitButler), projects needing PR automation (Graphite better)

</when_to_use>

## Core Advantage

**Traditional Git Problem:**
- Agents must work in separate worktrees (directory coordination)
- Constant branch switching (context loss, file churn)
- Late conflict detection (only at merge time)

**GitButler Solution:**
- Multiple branches stay applied simultaneously
- Single shared workspace, zero checkout operations
- Immediate conflict detection (shared working tree)
- Each agent manipulates their own lane

## Workflow Patterns

### Pattern 1: Parallel Feature Development

```bash
# Agent 1
but branch new agent-1-auth
echo "auth code" > auth.ts
but rub auth.ts agent-1-auth
but commit agent-1-auth -m "feat: add authentication"

# Agent 2 (simultaneously, same workspace!)
but branch new agent-2-api
echo "api code" > api.ts
but rub api.ts agent-2-api
but commit agent-2-api -m "feat: add API endpoints"

# Result: Two independent features, zero conflicts
```

### Pattern 2: Sequential Handoff

```bash
# Agent A: Initial implementation
but branch new initial-impl
# ... code ...
but commit initial-impl -m "feat: initial implementation"

# Agent B: Takes ownership and refines
but rub <agent-a-commit> refinement-branch
# ... improve code ...
but commit refinement-branch -m "refactor: optimize implementation"
```

### Pattern 3: Cross-Agent Commit Transfer

```bash
# Instant ownership transfer
but rub <commit-sha> agent-b-branch  # Agent A → Agent B
but rub <commit-sha> agent-a-branch  # Agent B → Agent A
```

### Pattern 4: Agent Code Review Cycle

Reviewer agent commits fixes separately, then swap/merge:

```bash
# Author agent implements
but branch new author-impl
but commit author-impl -m "feat: implement feature"

# Reviewer agent creates sibling branch for fixes
but branch new reviewer-fixes
# ... reviewer makes fixes ...
but commit reviewer-fixes -m "fix: address review feedback"

# Adopt reviewer fixes into author branch
but rub <reviewer-commit> author-impl

# Clean audit trail, final branch has both
```

### Pattern 5: Agent Swarm (Many Agents, One Branch)

Multiple agents contribute to a single feature:

```bash
but branch new shared-feature

# Agent A assigns their work
but rub <a-file-id> shared-feature

# Agent B assigns their work
but rub <b-file-id> shared-feature

# Agent C assigns their work
but rub <c-file-id> shared-feature

# Single commit with all contributions
but commit shared-feature -m "feat: collaborative implementation"
```

Use with Workspace Rules (`but mark`) for auto-assignment to branches.

### Pattern 6: Exploratory Development

Compare multiple approaches in parallel:

```bash
# Parent branch with shared setup
but branch new perf-parent
but commit perf-parent -m "chore: benchmark setup"

# Strategy A
but branch new perf-strategy-a --anchor perf-parent
but commit perf-strategy-a -m "perf: try caching approach"

# Strategy B
but branch new perf-strategy-b --anchor perf-parent
but commit perf-strategy-b -m "perf: try batching approach"

# Run benchmarks on each, keep winner
but rub <winning-commit> perf-parent
```

### Pattern 7: Emergency Hotfix (Feature Work Continues)

Ship a fix without disturbing ongoing multi-agent work:

```bash
# Create isolated hotfix branch
but branch new hotfix-urgent
but rub <file-id> hotfix-urgent
but commit hotfix-urgent -m "fix: prod outage"

# Push and create PR
but push hotfix-urgent
but pr new hotfix-urgent

# Other agents continue unaffected in their lanes
```

## Branch Naming Convention

```
<agent-name>-<task-type>-<brief-description>

Examples:
- claude-feat-user-auth
- droid-fix-api-timeout
- codex-refactor-database-layer
```

Makes ownership immediately visible in `but status`.

## AI Integration Methods

### 1. Agents Tab (GUI)

- Branch-agent binding in GitButler GUI
- Each virtual branch = independent agent session
- Automatic commit management per session
- Parallel execution with branch isolation
- Access: `but gui` then navigate to Agents Tab

### 2. Lifecycle Hooks (CLI)

| Platform | Commands |
|----------|----------|
| **Claude Code** | `but claude pre-tool`, `but claude post-tool`, `but claude stop` |
| **Cursor** | `but cursor after-edit`, `but cursor stop` |

Example Claude Code hooks config (`.claude/hooks.json`):

```json
{
  "hooks": {
    "PostToolUse": [{"matcher": "Edit|Write", "hooks": [{"type": "command", "command": "but claude post-tool"}]}],
    "Stop": [{"matcher": "", "hooks": [{"type": "command", "command": "but claude stop"}]}]
  }
}
```

### 3. MCP Server

```bash
but mcp  # Start MCP server for programmatic access
```

Exposes `gitbutler_update_branches` tool for async commit processing.

### 4. Workspace Rules (Auto-Assignment)

```bash
but mark agent-auth-branch
but mark agent-api-branch
```

New changes auto-route to the marked branch.

**Key Instruction for All Agents:**
> "Never use the git commit command after a task is finished"

For detailed hook configs and MCP schemas, see `references/ai-integration.md`.

## The `but rub` Power Tool

Single command handles four critical multi-agent operations:

| Operation | Example | Use Case |
|-----------|---------|----------|
| **Assign** | `but rub m6 claude-branch` | Organize files to branches post-hoc |
| **Move** | `but rub abc1234 other-branch` | Transfer work between agents |
| **Squash** | `but rub newer older` | Clean up history |
| **Amend** | `but rub file commit` | Fix existing commits |

## Coordination Protocols

**Status Broadcasting:**

```bash
# File-based coordination
but status > /tmp/agent-$(whoami)-status.txt

# Or use Linear/GitHub comments
# "[AGENT-A] Completed auth module, committed to claude-auth-feature"
```

**Concurrent Safety:**
1. Snapshot before risky operations
2. Broadcast status regularly to other agents
3. Respect 🔒 locks — files assigned to other branches
4. Use `but --json` for programmatic state inspection

## vs Other Workflows

| Aspect | Graphite | Git Worktrees | GitButler |
|--------|----------|---------------|-----------|
| Multi-agent concurrency | Serial | N directories | Parallel ✓ |
| Post-hoc organization | Difficult | Difficult | `but rub` ✓ |
| PR Submission | `gt submit` ✓ | Manual | `but push` + `but pr new` ✓ |
| Physical layout | 1 directory | N × repo | 1 directory ✓ |
| Context switching | `gt checkout` | `cd` | None ✓ |
| Conflict detection | Late (merge) | Late (merge) | Early ✓ |
| Disk usage | 1 × repo | N × repo | 1 × repo ✓ |

## Decision Framework: When to Use What

### Use GitButler when:

- Multiple agents work in same repo simultaneously
- Exploratory development (organize code after writing)
- Frequent reorganization of commits between branches
- Visual organization preferred (GUI + CLI)
- Early conflict detection matters

### Use Graphite when:

- Fully automated CLI workflows (scripted end-to-end)
- Terminal-first teams
- Established stacked PR practices
- Need `gt up`/`gt down` stack navigation

### Use Git Worktrees when:

- Complete branch isolation required
- Different dependencies per branch
- CI/CD needs separate checkouts

**Don't mix in same repo** - Choose one model per repository.

<rules>

ALWAYS:
- Use unique branch names per agent: `<agent>-<type>-<desc>`
- Assign files immediately after creating: `but rub <id> <branch>`
- Snapshot before coordinated operations
- Broadcast status to other agents when completing work
- Check for 🔒 locked files before modifying

NEVER:
- Use `git commit` — breaks GitButler state
- Let files sit in "Unassigned Changes" — assign immediately
- Modify files locked to other branches
- Mix git and but commands during active agent sessions

</rules>

## Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Agent commit "orphaned" | Used `git commit` | Find with `git reflog`, recover |
| Files in wrong branch | Forgot assignment | `but rub <id> <correct-branch>` |
| Conflicting edits | Overlapping files | Reassign hunks to different branches |
| Lost agent work | Branch deleted | `but undo` or restore from oplog |

## Recovery

```bash
# Find orphaned commits
git reflog

# Recover agent work
but oplog
but undo

# Extract from snapshot
git show <snapshot>:index/path/to/file.txt
```

## Limitations

- **Overlapping file edits** — adjacent lines can only go to one branch
- **No stack navigation CLI** — no `gt up`/`gt down` equivalent (all branches always applied)
- **MCP server limited** — only `gitbutler_update_branches` tool currently exposed

<references>

### Reference Files

- **`references/ai-integration.md`** — Detailed hook configs, MCP schemas, troubleshooting

### Related Skills

- [gitbutler-virtual-branches](../virtual-branches/SKILL.md) — Core GitButler workflows
- [gitbutler-stacks](../stacks/SKILL.md) — Stacked branches
- **outfitter:multi-agent-vcs** — Tool-agnostic multi-agent policy (invoke with Skill tool)

### External

- [GitButler AI Docs](https://docs.gitbutler.com/features/ai-integration/) — Official AI integration
- [Agents Tab Blog](https://blog.gitbutler.com/agents-tab) — Claude Code integration details

</references>
