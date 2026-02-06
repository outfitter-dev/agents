# Multi-Agent AI Integration Reference

Detailed configuration and patterns for multi-agent workflows with GitButler.

---

## Hook Configuration by Platform

### Claude Code

File: `.claude/hooks.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "but claude pre-tool"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "but claude post-tool"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "but claude stop"
          }
        ]
      }
    ]
  }
}
```

| Hook | Purpose |
|------|---------|
| `but claude pre-tool` | Snapshot before changes |
| `but claude post-tool` | Auto-assign changes to agent's branch |
| `but claude stop` | Finalize commits, cleanup |

### Cursor

```json
{
  "hooks": {
    "after-edit": "but cursor after-edit",
    "stop": "but cursor stop"
  }
}
```

---

## MCP Server

### Starting

```bash
but mcp
```

### Available Tool

**`gitbutler_update_branches`**

```typescript
{
  prompt: string  // Description of changes
}
```

Returns immediately; commits processed asynchronously.

### Current Limitations

- Single tool available
- No branch creation
- No stack operations
- No push/PR operations

---

## Multi-Agent Coordination Strategies

### Strategy 1: Branch-Per-Agent

Each agent owns dedicated branch(es):

```bash
# Agent A owns auth domain
but branch new agent-a-auth
but mark agent-a-auth

# Agent B owns api domain
but branch new agent-b-api
but mark agent-b-api

# New changes auto-route to marked branch
```

**Best for:** Independent parallel development

### Strategy 2: Shared Branch with Turn-Taking

Agents share branch, coordinate via file-based status:

```bash
# File-based coordination
but status > /tmp/agent-$(whoami)-status.txt

# Other agents check before modifying
```

**Best for:** Sequential refinement of same feature

### Strategy 3: Stack-Per-Agent

Agents own stack levels:

```bash
# Agent A: Foundation layer
but branch new foundation
but commit foundation -m "feat: foundation"

# Agent B: Build on foundation
but branch new feature --anchor foundation
but commit feature -m "feat: feature layer"

# Agent C: Tests on top
but branch new tests --anchor feature
but commit tests -m "test: comprehensive tests"
```

**Best for:** Layered architecture development

### Strategy 4: Review Pairs

Author and reviewer agents work in parallel:

```bash
# Author implements
but branch new author-impl

# Reviewer creates sibling for fixes
but branch new reviewer-fixes

# Swap commits as needed
but rub <commit> <other-branch>
```

**Best for:** Code review cycles

---

## Status Broadcasting

### File-Based

```bash
# Broadcast status
but status > /tmp/agent-status-$(hostname)-$(date +%s).txt

# Other agents poll status files
```

### Issue Tracker Comments

```markdown
[AGENT-A] Completed auth module
- Branch: agent-a-auth
- Commits: abc1234
- Ready for review
```

### JSON for Programmatic Inspection

```bash
# Machine-readable status
but status --json | jq '.stacks'
but show feature-branch --json | jq '.commits'
```

---

## Agent Instructions Template

Add to agent system prompt:

```
## GitButler Rules

1. NEVER use `git commit` - use `but commit`
2. NEVER use `git add` - GitButler manages staging
3. NEVER use `git checkout` - all branches always applied
4. ALWAYS check file IDs with `but status` before `but rub`
5. ALWAYS snapshot before risky operations: `but oplog snapshot`
6. Return to workspace after git ops: `git checkout gitbutler/workspace`

## Your Branch
- Name: {agent-branch-name}
- Pattern: {file-pattern}

Assign your changes: `but rub <file-id> {agent-branch-name}`
Commit your work: `but commit {agent-branch-name} -m "your message"`
```

---

## Troubleshooting Multi-Agent

### Agents modifying same files

**Symptom:** Overlapping hunks in unassigned changes

**Solution:**
1. Assign non-overlapping hunks to respective branches
2. For overlapping lines: coordinate which agent owns them
3. Use `but mark` rules for clearer ownership

### Lost agent work

**Recovery:**

```bash
# Check oplog
but oplog

# Undo if recent
but undo

# Or restore from snapshot
but oplog restore <snapshot-id>
```

### Agent committed with git

**Symptom:** Orphaned commit not in GitButler

**Recovery:**

```bash
git reflog  # Find orphaned commit
# Create new branch from it
git branch recovered <commit-sha>
# Return to GitButler
git checkout gitbutler/workspace
```

---

## References

- [GitButler MCP Docs](https://docs.gitbutler.com/features/ai-integration/mcp-server)
- [Claude Code Hooks Docs](https://docs.gitbutler.com/features/ai-integration/claude-code-hooks)
- [Cursor Hooks Docs](https://docs.gitbutler.com/features/ai-integration/cursor-hooks)
