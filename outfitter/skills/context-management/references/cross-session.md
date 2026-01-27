# Cross-Session Patterns

Persisting state across conversation sessions using episodic memory.

## The Session Boundary Problem

Tasks survive **context compaction** but not **session boundaries**. When a conversation ends:
- Task state is gone
- Agent IDs are invalid
- Decisions are forgotten

For work spanning multiple sessions, use episodic memory MCP server.

## When to Use Cross-Session Persistence

**Use episodic memory when**:
- Project spans multiple days
- Complex refactor with many steps
- Work will be interrupted (meetings, context switches)
- Handing off to another agent or future self
- Key decisions need to survive sessions

**Just use Tasks when**:
- Single-session task
- Work completes within conversation
- No significant decisions to preserve

## Saving Session State

At session end or before extended pause:

```json
{
  "tool": "episodic-memory:save",
  "content": {
    "project": "auth-refresh-implementation",
    "timestamp": "2024-01-15T14:30:00Z",
    "status": "in_progress",
    "completed": [
      "JWT validation logic",
      "Refresh endpoint structure",
      "Token claims extraction"
    ],
    "remaining": [
      "Token rotation logic",
      "Refresh window handling",
      "Integration tests",
      "Security review"
    ],
    "decisions": {
      "library": "jose (already in deps)",
      "algorithm": "RS256 (per existing patterns)",
      "refresh_window": "5 minutes before expiry",
      "rotation": "enabled (single-use refresh tokens)"
    },
    "files_modified": [
      "src/auth/refresh.ts",
      "src/auth/middleware.ts",
      "src/auth/types.ts"
    ],
    "current_focus": {
      "file": "src/auth/refresh.ts",
      "line": 42,
      "task": "Implement rotateToken() function"
    },
    "blockers": [],
    "notes": "Using existing JWKS endpoint at /api/auth/.well-known/jwks.json"
  }
}
```

## Restoring Session State

At new session start:

```json
{
  "tool": "episodic-memory:search",
  "query": "auth refresh implementation"
}
```

Then:
1. Read the returned state
2. Reconstruct tasks from saved data using `TaskCreate`
3. Resume from `current_focus`

## What to Save

| Category | Why |
|----------|-----|
| Completed work | Know what's done |
| Remaining work | Know what's left |
| Decisions made | Don't re-decide |
| Files modified | Know where changes live |
| Current focus | Resume exactly |
| Blockers | Know what's blocking |
| Notes | Context that might be needed |

## What NOT to Save

- Full file contents (they're in the repo)
- Detailed reasoning (too verbose)
- Every intermediate step (only milestones)
- Transient state (temp variables, debug output)

Save the **minimum needed to resume**.

## Hooks for Auto-Persistence

Configure hooks to auto-save state at session boundaries:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": {
          "tool": "exit"
        },
        "action": "Save session state to episodic memory"
      }
    ]
  }
}
```

See outfitter's **claude-hooks** skill for hook configuration details.

## Multi-Day Project Pattern

For longer projects:

**Day 1 (end)**:

```json
{
  "project": "api-redesign",
  "stage": "research",
  "completed": ["Identified 12 endpoints", "Documented current patterns"],
  "remaining": ["Design new patterns", "Plan migration"],
  "key_findings": "Inconsistent error handling across endpoints"
}
```

**Day 2 (start)**: Search for "api-redesign"
**Day 2 (end)**:

```json
{
  "project": "api-redesign",
  "stage": "design",
  "completed": ["New error pattern designed", "Migration strategy outlined"],
  "remaining": ["Implement error utilities", "Migrate endpoints"],
  "decisions": {"error_format": "RFC 7807 Problem Details"}
}
```

**Day 3**: Search, see full history, continue implementation.

## Integration with External Trackers

Episodic memory is your **session-level** state. External trackers handle **project-level** state:

| Tool | Scope | When to Update |
|------|-------|----------------|
| Tasks | Within conversation | Every task completion |
| Episodic memory | Across sessions | Session boundaries |
| Linear/GitHub | Project lifetime | Stage completions |

Workflow:
1. Pull task from Linear/GitHub
2. Track in Tasks during session
3. Save to episodic memory at session end
4. Update Linear/GitHub at stage completion
