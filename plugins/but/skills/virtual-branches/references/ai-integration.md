# AI Integration Reference

GitButler provides hooks, MCP server, and GUI features for AI agent integration.

---

## Lifecycle Hooks

GitButler CLI commands that can be called from AI agent lifecycle hooks.

### Claude Code Hooks

Add to `.claude/hooks.json`:

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

**Hook commands:**

| Command | Trigger | Purpose |
|---------|---------|---------|
| `but claude pre-tool` | Before Edit/Write | Prepare workspace, snapshot |
| `but claude post-tool` | After Edit/Write | Auto-assign changes |
| `but claude stop` | Session ends | Finalize commits, cleanup |

### Cursor Hooks

```json
{
  "hooks": {
    "after-edit": "but cursor after-edit",
    "stop": "but cursor stop"
  }
}
```

**Hook commands:**

| Command | Purpose |
|---------|---------|
| `but cursor after-edit` | Auto-assign/commit after Cursor edits |
| `but cursor stop` | Finalize when task completes |

---

## MCP Server

Start GitButler's MCP server for programmatic agent access:

```bash
but mcp
```

### Available Tool

**`gitbutler_update_branches`**

Updates commits based on prompt and changes. Designed for async processing:

1. Agent calls after making code changes
2. GitButler records changes + prompt immediately (returns fast)
3. Processing happens asynchronously to create commits

**Input schema:**

```typescript
{
  prompt: string  // Description of changes made
}
```

**Current limitations:**

- No branch creation via MCP
- No stack management
- No push/submit operations
- No branch navigation
- No restack commands

**Future roadmap (from GitButler docs):**

- Auto-absorbing changes into existing commits
- Creating new branches based on prompt theme
- Creating stacked branches
- More sophisticated commit organization

---

## Agents Tab (GUI)

GitButler GUI provides an Agents Tab for Claude Code integration:

1. **Branch-Agent Binding**: Each virtual branch can be tied to an agent session
2. **Parallel Execution**: Multiple agents run simultaneously, isolated by branch
3. **Automatic Commit Management**: Agent work auto-committed to their branch
4. **Session Persistence**: Agent context preserved across restarts

### Setup

1. Open GitButler GUI for repo: `but gui`
2. Navigate to Agents Tab
3. Create agent sessions tied to virtual branches
4. Configure which branches each agent can modify

---

## Agent Workflow Patterns

### Pattern 1: Hook-Based Auto-Commit

Let GitButler handle commits automatically:

```bash
# Agent instruction
"Never use the git commit command after a task is finished"
```

PostToolUse hook creates commits automatically.

### Pattern 2: Explicit Agent Commits

Agent controls commit timing:

```bash
# Agent creates branch
but branch new agent-feature

# Agent makes changes...

# Agent assigns and commits explicitly
but rub <file-id> agent-feature
but commit agent-feature -m "feat: implementation"
```

### Pattern 3: Multi-Agent with Marks

Set up auto-assignment for agent branches:

```bash
# Agent A's branch receives new changes
but mark agent-a-auth

# Agent B's branch receives new changes
but mark agent-b-api
```

---

## Key Agent Instructions

When configuring agents to work with GitButler:

1. **Never use `git commit`** - Breaks GitButler state
2. **Never use `git add`** - GitButler manages index
3. **Never use `git checkout`** - All branches always applied
4. **Always return to workspace** after any git operations: `git checkout gitbutler/workspace`
5. **Use `but status` to find file IDs** before using `but rub`

---

## Troubleshooting

### Agent commit "orphaned"

**Cause:** Agent used `git commit` instead of `but commit`.

**Solution:**

```bash
git reflog  # Find orphaned commit
but branch new recovered-work
# Manually apply changes or cherry-pick
```

### MCP server not responding

**Cause:** Feature may be behind experimental flag.

**Solution:**

1. Check GitButler version (0.16+)
2. Enable experimental features in GUI settings
3. Restart `but mcp`

### Hooks not triggering

**Verify:**

1. Hook file location correct (`.claude/hooks.json`)
2. JSON syntax valid
3. `but` command in PATH
4. GitButler initialized in repo

---

## References

- [GitButler MCP Server Docs](https://docs.gitbutler.com/features/ai-integration/mcp-server)
- [Claude Code Hooks Docs](https://docs.gitbutler.com/features/ai-integration/claude-code-hooks)
- [Cursor Hooks Docs](https://docs.gitbutler.com/features/ai-integration/cursor-hooks)
- [Agents Tab Blog Post](https://blog.gitbutler.com/agents-tab)
