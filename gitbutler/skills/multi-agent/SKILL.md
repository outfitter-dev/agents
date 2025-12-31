---
name: GitButler Multi-Agent
version: 2.0.0
description: Coordinate multiple AI agents working concurrently in the same workspace using GitButler's virtual branch model. Use for parallel development, sequential handoffs, and commit transfer patterns without checkout overhead.
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

<core_advantage>

**Traditional Git Problem:**
- Agents must work in separate worktrees (directory coordination)
- Constant branch switching (context loss, file churn)
- Late conflict detection (only at merge time)

**GitButler Solution:**
- Multiple branches stay applied simultaneously
- Single shared workspace, zero checkout operations
- Immediate conflict detection (shared working tree)
- Each agent manipulates their own lane

</core_advantage>

<patterns>

## Pattern 1: Parallel Feature Development

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

## Pattern 2: Sequential Handoff

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

## Pattern 3: Cross-Agent Commit Transfer

```bash
# Instant ownership transfer
but rub <commit-sha> agent-b-branch  # Agent A → Agent B
but rub <commit-sha> agent-a-branch  # Agent B → Agent A
```

</patterns>

<naming>

## Branch Naming Convention

```
<agent-name>-<task-type>-<brief-description>

Examples:
- claude-feat-user-auth
- droid-fix-api-timeout
- codex-refactor-database-layer
```

Makes ownership immediately visible in `but status` and `but log`.

</naming>

<ai_integration>

## AI Integration Methods

**1. Agents Tab (Claude Code)**
- GUI-based launcher tied to branches
- Each virtual branch = independent session
- Automatic commit management per session
- Parallel agent execution with branch isolation

**2. Lifecycle Hooks**

```json
{
  "hooks": {
    "PreToolUse": [{"matcher": "Edit|MultiEdit|Write", "hooks": [{"type": "command", "command": "but claude pre-tool"}]}],
    "PostToolUse": [{"matcher": "Edit|MultiEdit|Write", "hooks": [{"type": "command", "command": "but claude post-tool"}]}],
    "Stop": [{"matcher": "", "hooks": [{"type": "command", "command": "but claude stop"}]}]
  }
}
```

**3. MCP Server**

```bash
but mcp  # Enables programmatic agent integration
```

**Key Instruction for Agents:**
> "Never use the git commit command after a task is finished"

Let GitButler manage commits via hooks or MCP.

</ai_integration>

<coordination>

## Coordination Protocols

**Status Broadcasting:**

```bash
# File-based coordination
but status > /tmp/agent-$(whoami)-status.txt

# Or use Linear/GitHub comments
# "[AGENT-A] Completed auth module, committed to claude-auth-feature"
```

**Snapshot Cadence:**

```bash
# Before risky operations
but snapshot --message "Before merging conflicting branches"

# If it breaks
but undo
```

**Concurrent Safety:**
1. Snapshot before risky operations
2. Broadcast status regularly to other agents
3. Respect 🔒 locks — files assigned to other branches
4. Use `but --json` for programmatic state inspection

</coordination>

<rub_power>

## The `but rub` Power Tool

Single command handles four critical multi-agent operations:

| Operation | Example | Use Case |
|-----------|---------|----------|
| **Assign** | `but rub m6 claude-branch` | Organize files to branches post-hoc |
| **Move** | `but rub abc1234 other-branch` | Transfer work between agents |
| **Squash** | `but rub newer older` | Clean up history |
| **Amend** | `but rub file commit` | Fix existing commits |

</rub_power>

<comparison>

## vs Other Workflows

| Aspect | Graphite | Git Worktrees | GitButler |
|--------|----------|---------------|-----------|
| Multi-agent concurrency | Serial | N directories | Parallel ✓ |
| Post-hoc organization | Difficult | Difficult | `but rub` ✓ |
| PR Submission | `gt submit` ✓ | Manual | GUI only |
| Physical layout | 1 directory | N × repo | 1 directory ✓ |
| Context switching | `gt checkout` | `cd` | None ✓ |
| Conflict detection | Late (merge) | Late (merge) | Early ✓ |
| Disk usage | 1 × repo | N × repo | 1 × repo ✓ |

</comparison>

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

<troubleshooting>

## Common Issues

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

</troubleshooting>

<limitations>

## Current Limitations

- **No PR submission CLI** — use `gh pr create` after organizing
- **Overlapping file edits** — adjacent lines can only go to one branch
- **No stack navigation CLI** — no `gt up`/`gt down` equivalent

**Recommendation:** Use for exploratory multi-agent work. For production automation requiring PR submission, consider Graphite until CLI matures.

</limitations>

<references>

- [version-control skill](../version-control/SKILL.md) — core GitButler workflows
- [stack-workflows skill](../stack-workflows/SKILL.md) — stacked branches
- [GitButler AI Docs](https://docs.gitbutler.com/features/ai-integration/) — official AI integration
- [Agents Tab Blog](https://blog.gitbutler.com/agents-tab) — Claude Code integration details

</references>
