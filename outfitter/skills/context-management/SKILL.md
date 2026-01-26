---
name: context-management
description: Manage context window, survive compaction, persist state. Use when planning long tasks, coordinating agents, approaching context limits, or when "context", "compaction", "tasks", or "persist state" are mentioned.
user-invocable: false
metadata:
  version: "1.0.0"
  related-skills:
    - subagents
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
- Task state (full task list persists)
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

<tasks>

## Tasks: Your Survivable State

Tasks are not just a tracker — they're your **persistent memory layer**. Use TaskCreate, TaskUpdate, TaskList, and TaskGet to manage state that survives compaction.

### What Goes in Tasks

| Category | Example |
|----------|---------|
| Current work | `Implementing auth refresh flow` (status: in_progress) |
| Completed work | `JWT validation logic added to middleware` (status: completed) |
| Discovered work | `Handle token expiry edge case` (status: pending) |
| Key decisions | Embed in task description: "Using RS256 per security review" |
| Agent handoffs | `[reviewer] Review auth implementation` + metadata: `{agentId: "abc123"}` |
| Blockers | Create blocker task, use `blockedBy` field |

### Task Discipline

**Exactly one `in_progress`** at any time. Call `TaskUpdate` to mark `in_progress` before starting.

**Mark complete immediately**. Don't batch completions — `TaskUpdate` with `completed` as you finish.

**Include agent IDs** for resumable sessions in task metadata.

**Expand dynamically**. `TaskCreate` as you discover work; don't front-load everything.

**Action-oriented subjects**. Use verbs: "Implement X", "Fix Y", "Review Z"

### Status Flow

```
pending → in_progress → completed
                ↓
         (blocked → TaskCreate for blocker, add blockedBy)
```

If blocked, don't mark complete. Create a new task for the blocker and link with `addBlockedBy`.

### Pre-Compaction Pattern

As context fills, ensure tasks capture progress. Use TaskUpdate to add details to in_progress task description:

```
Task: Implementing token refresh
Description:
  - Refresh endpoint: POST /api/auth/refresh
  - Token rotation: enabled
  - Refresh window: 5 minutes before expiry
  - Remaining: validation logic
```

Decisions embedded in completed task descriptions. Current state detailed in active task. Future work queued as pending.

</tasks>

<pre_compaction>

## Pre-Compaction Checklist

Run through this when context is filling (you'll notice: slower responses, repetition, degraded reasoning):

1. **Capture progress** — What's done? `TaskUpdate` completed tasks with outcomes in description.

2. **Record decisions** — What did you decide? Why? Put in task descriptions.

3. **Note current state** — Where exactly are you in the current task? `TaskUpdate` the `in_progress` task with specifics.

4. **Queue discovered work** — What did you find that needs doing? `TaskCreate` as pending.

5. **Mark dependencies** — What needs what? Use `addBlockedBy` in `TaskUpdate`.

6. **Include agent IDs** — Any background agents? Record IDs in task metadata.

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
- [ ] [reviewer] Security review auth module (after tests)
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

> **Note**: Plugin agents require the `plugin:agent-name` format (e.g., `outfitter:reviewer`). Built-in agents (`Explore`, `Plan`, `general-purpose`) work without prefix. Use `/agents` to see available agents.

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
{ "subagent_type": "outfitter:reviewer", "run_in_background": true, "prompt": "Security review..." }
{ "subagent_type": "outfitter:analyst", "run_in_background": true, "prompt": "Performance review..." }
```

Main agent: stays lean, collects results when ready.

**Background execution** — For independent work:

```json
{
  "subagent_type": "outfitter:tester",
  "run_in_background": true,
  "prompt": "Run integration tests for auth module"
}
```

Continue other work; retrieve with `TaskOutput` later.

### Task Integration

Track delegated work in tasks:

```
[analyst] Research caching strategies (pending, metadata: {taskId: "def456"})
[engineer] Implement cache layer (pending, blockedBy: analyst task)
[reviewer] Review cache implementation (pending, blockedBy: engineer task)
[tester] Validate cache behavior (pending, blockedBy: reviewer task)
```

When background agents complete, `TaskUpdate` status and process results.

### What NOT to Delegate

- Direct user Q&A needing conversation history
- Simple edits to files already in context
- Final synthesis requiring your judgment

</delegation>

<cross_session>

## Cross-Session Patterns

For work spanning multiple sessions, use episodic memory MCP server.

> **Prerequisites**: Cross-session patterns require an episodic-memory MCP server to be configured. If unavailable, skip this section — Tasks handle single-session persistence.

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

Then reconstruct tasks from saved state using `TaskCreate`.

### When to Use Cross-Session

- Multi-day projects
- Complex refactors with many steps
- Work that will be interrupted
- Handing off to future sessions

For single-session work, Tasks alone suffice.

</cross_session>

<workflow>

## Workflow Integration

### At Task Start

1. `TaskCreate` with initial scope
2. If complex: use Plan subagent to explore, preserve main context
3. `TaskUpdate` first task to `in_progress`

### During Execution

1. `TaskUpdate` as work progresses
2. Delegate exploration to subagents
3. Mark completed immediately (no batching)
4. `TaskCreate` for discovered work
5. Note decisions in completed task descriptions

### Approaching Compaction

1. Run pre-compaction checklist
2. Ensure current state captured in `in_progress` task description
3. Record any background agent IDs in task metadata

### After Compaction

1. `TaskList` to read task state (it persists)
2. Resume from `in_progress` task
3. Use saved details to continue without re-exploration

### At Task Completion

1. `TaskUpdate` final tasks to complete with outcomes in description
2. If multi-session: save to episodic memory
3. Report summary to user

</workflow>

<rules>

ALWAYS:
- Use Tasks for any work over 2-3 steps
- `TaskUpdate` before significant actions
- Mark completed immediately, not batched
- Include agent IDs in task metadata for resumable sessions
- Delegate exploration to subagents (preserves main context)
- Record decisions in completed task descriptions
- Run pre-compaction checklist when context fills

NEVER:
- Rely on conversation history surviving compaction
- Keep large research results in main context (delegate or summarize)
- Have multiple `in_progress` tasks simultaneously
- Stop early due to context concerns (persist state instead)
- Batch multiple completions together
- Leave tasks vague ("do the thing" → "Implement refresh endpoint")

</rules>

<references>

- [task-patterns.md](references/task-patterns.md) — deep patterns and templates
- [delegation-patterns.md](references/delegation-patterns.md) — context-preserving delegation
- [cross-session.md](references/cross-session.md) — episodic memory integration
- subagents skill — agent orchestration patterns

</references>
