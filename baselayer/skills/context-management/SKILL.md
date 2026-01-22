---
name: context-management
version: 1.0.0
description: Manage context window, survive compaction, persist state. Use when planning long tasks, coordinating agents, approaching context limits, or when "context", "compaction", "todowrite", or "persist state" are mentioned.
user-invocable: false
metadata:
  related-skills:
    - subagent-coordination
    - pathfinding
---

# Context Management

Manage your context window, survive compaction, persist state across turns.

<when_to_use>

- Planning long-running or multi-step tasks
- Coordinating multiple subagents
- Approaching context limits (degraded responses, repetition)
- Need to preserve state across compaction or sessions
- Orchestrating complex workflows with handoffs

NOT for: simple single-turn tasks, quick Q&A, tasks completing in one response

</when_to_use>

<problem>

Claude Code operates in a ~128K token context window that compacts automatically as it fills. When compaction happens:

**What survives**:
- TodoWrite state (full task list persists)
- Tool results (summarized)
- User messages (recent ones)
- System instructions

**What disappears**:
- Your reasoning and analysis
- Intermediate exploration results
- File contents you read (unless in tool results)
- Decisions you made but didn't record

**The consequence**: Without explicit state management, you "wake up" after compaction with amnesia — you know what to do, but not what you've done or decided.

</problem>

<todowrite>

## TodoWrite: Your Survivable State

TodoWrite is not just a task tracker — it's your **persistent memory layer**. Treat it as the single source of truth for task state.

### What Goes in TodoWrite

| Category | Example |
|----------|---------|
| Current work | `- [ ] [in_progress] Implementing auth refresh flow` |
| Completed work | `- [x] JWT validation logic added to middleware` |
| Discovered work | `- [ ] Handle token expiry edge case (found during impl)` |
| Key decisions | `- [x] Using RS256 for JWT signing (per security review)` |
| Agent handoffs | `- [ ] [ranger] Review auth implementation (agent-id: abc123)` |
| Blockers | `- [ ] Resolve: Missing JWKS endpoint configuration` |

### TodoWrite Discipline

**Exactly one `in_progress`** at any time. Multiple active tasks signal unclear focus.

**Mark complete immediately**. Don't batch completions — mark done as you finish.

**Include agent IDs** for resumable sessions. Format: `(agent-id: {ID})`

**Expand dynamically**. Add todos as you discover work; don't front-load everything.

**Action-oriented descriptions**. Use verbs: "Implement X", "Fix Y", "Review Z"

### Status Flow

```
pending → in_progress → completed
                ↓
         (blocked → new task for blocker)
```

If blocked, don't mark complete. Create a new todo for the blocker and keep the blocked task `in_progress` or revert to `pending`.

### Pre-Compaction Pattern

As context fills, update TodoWrite to capture:

```
- [x] Explored auth patterns → using middleware approach
- [x] JWT library selected → jose (per existing usage)
- [ ] [in_progress] Implementing token refresh
    - Refresh endpoint: /api/auth/refresh
    - Token rotation: enabled
    - Refresh window: 5 minutes before expiry
- [ ] Add tests for refresh flow
- [ ] [ranger] Security review (after impl)
```

Notice: Decisions embedded in completed todos. Current state detailed in active todo. Future work queued.

</todowrite>

<pre_compaction>

## Pre-Compaction Checklist

Run through this when context is filling (you'll notice: slower responses, repetition, degraded reasoning):

1. **Capture progress** — What's done? Update completed todos with outcomes.

2. **Record decisions** — What did you decide? Why? Put in todo descriptions.

3. **Note current state** — Where exactly are you in the current task? Update `in_progress` todo with specifics.

4. **Queue discovered work** — What did you find that needs doing? Add as pending todos.

5. **Mark dependencies** — What needs what? Add notes: `(after: other-task)` or `(blocked-by: X)`

6. **Include agent IDs** — Any background agents? Record IDs for resumption.

### Example: Before Compaction

**Bad** (state will be lost):
```
- [x] Research auth approaches
- [ ] Implement auth
- [ ] Test auth
```

**Good** (state survives):
```
- [x] Research auth approaches → middleware + JWT (see src/auth/README.md)
- [ ] [in_progress] Implement JWT refresh flow
    - Using jose library (already in deps)
    - Endpoint: POST /api/auth/refresh
    - Handler started in src/auth/refresh.ts:15
    - Remaining: validation logic, token rotation
- [ ] Add refresh flow tests (after impl)
- [ ] [ranger] Security review auth module (after tests)
```

</pre_compaction>

<delegation>

## Delegation for Context Preservation

Main conversation context is precious. Every file you read, every search result, every intermediate thought consumes tokens. Subagents run in isolated contexts — only their final output returns.

### Default Stance

If a task can be delegated, delegate it.

### Delegation Decision Tree

```
Task arrives
├── Exploration/research? → Explore agent (always)
├── Multi-file reading? → Subagent (summarizes for you)
├── Independent subtask? → Background agent
├── Specialized expertise? → Domain agent (reviewer, tester, etc.)
└── Simple, focused, single-file? → Main agent (maybe)
```

> **Note**: Agent names like `ranger`, `analyst`, `tester`, `senior-dev` are examples. Substitute with agents available in your environment. Use `/agents` to see available agents.

### Context-Saving Patterns

**Research delegation** — Instead of reading 10 files:
```json
{
  "description": "Find auth implementation",
  "prompt": "Locate authentication-related files, summarize the auth flow",
  "subagent_type": "Explore"
}
```
Main agent receives: concise summary, not 10 file contents.

**Parallel review** — Instead of sequential analysis:
```json
// Single message, multiple calls, all run_in_background: true
{ "subagent_type": "ranger", "run_in_background": true, "prompt": "Security review..." }
{ "subagent_type": "analyst", "run_in_background": true, "prompt": "Performance review..." }
```
Main agent: stays lean, collects results when ready.

**Background execution** — For independent work:
```json
{
  "subagent_type": "tester",
  "run_in_background": true,
  "prompt": "Run integration tests for auth module"
}
```
Continue other work; retrieve with `TaskOutput` later.

### TodoWrite Integration

Track delegated work in todos:

```
- [ ] [analyst] Research caching strategies (background, task-id: def456)
- [ ] [senior-dev] Implement cache layer (after analyst)
- [ ] [ranger] Review cache implementation (after senior-dev)
- [ ] [tester] Validate cache behavior (after ranger approval)
```

When background agents complete, update todos and process results.

### What NOT to Delegate

- Direct user Q&A needing conversation history
- Simple edits to files already in context
- Final synthesis requiring your judgment

</delegation>

<cross_session>

## Cross-Session Patterns

For work spanning multiple sessions, use episodic memory MCP server.

> **Prerequisites**: Cross-session patterns require an episodic-memory MCP server to be configured. If unavailable, skip this section — TodoWrite handles single-session persistence.

### Saving State

At session end or before long pause:

```json
{
  "tool": "episodic-memory:save",
  "content": {
    "task": "Implementing auth refresh flow",
    "status": "in_progress",
    "completed": ["JWT validation", "Refresh endpoint structure"],
    "remaining": ["Token rotation logic", "Tests", "Security review"],
    "decisions": {
      "library": "jose",
      "algorithm": "RS256",
      "refresh_window": "5 minutes"
    },
    "files_modified": ["src/auth/refresh.ts", "src/auth/middleware.ts"],
    "next_steps": "Implement token rotation in refresh.ts:42"
  }
}
```

### Restoring State

At session start:

```json
{
  "tool": "episodic-memory:search",
  "query": "auth refresh implementation"
}
```

Then reconstruct TodoWrite from saved state.

### When to Use Cross-Session

- Multi-day projects
- Complex refactors with many steps
- Work that will be interrupted
- Handing off to future sessions

For single-session work, TodoWrite alone suffices.

</cross_session>

<workflow>

## Workflow Integration

### At Task Start

1. Create TodoWrite with initial scope
2. If complex: use Plan subagent to explore, preserve main context
3. Mark first task `in_progress`

### During Execution

1. Update todos as work progresses
2. Delegate exploration to subagents
3. Mark completed immediately (no batching)
4. Add discovered work as new pending todos
5. Note decisions in completed todo descriptions

### Approaching Compaction

1. Run pre-compaction checklist
2. Ensure current state captured in `in_progress` todo
3. Record any background agent IDs

### After Compaction

1. Read TodoWrite state (it persists)
2. Resume from `in_progress` task
3. Use saved details to continue without re-exploration

### At Task Completion

1. Mark final todos complete with outcomes
2. If multi-session: save to episodic memory
3. Report summary to user

</workflow>

<rules>

ALWAYS:
- Use TodoWrite for any task over 2-3 steps
- Update todos before significant actions
- Mark completed immediately, not batched
- Include agent IDs in todos for resumable sessions
- Delegate exploration to subagents (preserves main context)
- Record decisions in completed todo descriptions
- Run pre-compaction checklist when context fills

NEVER:
- Rely on conversation history surviving compaction
- Keep large research results in main context (delegate or summarize)
- Have multiple `in_progress` tasks simultaneously
- Stop early due to context concerns (persist state instead)
- Batch multiple completions together
- Leave todos vague ("do the thing" → "Implement refresh endpoint")

</rules>

<references>

- [todowrite-patterns.md](references/todowrite-patterns.md) — deep patterns and templates
- [delegation-patterns.md](references/delegation-patterns.md) — context-preserving delegation
- [cross-session.md](references/cross-session.md) — episodic memory integration
- [FORMATTING.md](../../shared/rules/FORMATTING.md) — formatting conventions
- subagent-coordination skill — agent orchestration patterns

</references>
