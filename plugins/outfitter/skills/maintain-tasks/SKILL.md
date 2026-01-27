---
name: maintain-tasks
description: Task management for session continuity. Use when coordinating multi-step work, managing subagent assignments, or preserving intent across compaction. Triggers on "track tasks", "manage work", "coordinate agents", or when complex work requires sequencing.
user-invocable: false
---

# Task Management for Session Continuity

Tasks are your **working memory that survives compaction**. Use them to maintain intent, sequence, and coordination across the natural lifecycle of a session.

## Tasks vs Issue Trackers

| Tool | Purpose | Scope |
|------|---------|-------|
| **Tasks** | Session/project working memory | Current effort, active coordination |
| **Linear/GitHub** | Team-visible project management | Cross-session, multi-person tracking |

Tasks are NOT a replacement for filing issues. They are your **local execution state** — what you're doing now, what comes next, who (which agent) is responsible.

**Sync pattern:**
1. Pull work from Linear/GitHub into Tasks for execution
2. Work through Tasks within the session
3. Update Linear/GitHub at completion boundaries

## Why Tasks Survive Compaction

When context compacts, conversation history gets summarized. But Tasks persist in full:

- Task subjects and descriptions remain intact
- Dependencies (`blockedBy`, `blocks`) preserved
- Status (`pending`, `in_progress`, `completed`) preserved
- **Subagent assignments preserved** (critical — see below)

This means after compaction, you can read TaskList and know exactly where you were, what's next, and who's responsible.

## Subagent Assignment (Critical)

**Always assign subagents explicitly in task subjects.**

After compaction, nuanced instructions like "have the reviewer check this" can lose fidelity. Explicit assignment survives:

```
[engineer] Implement auth refresh endpoint
[reviewer] Review auth implementation for security
[tester] Validate auth flow end-to-end
```

The `[agent-name]` prefix is not decoration — it's **recoverable intent**. After compaction, you can scan TaskList and immediately know which agent handles each task.

### Assignment Patterns

```
# Explicit agent assignment
[engineer] Build the feature
[analyst] Research the approach
[reviewer] Check for issues
[tester] Validate behavior

# Background agents (include task ID for retrieval)
[reviewer:background] Security audit (task-id: abc123)

# Resumable agents (include agent ID)
[analyst] Continue research (resume: a7227ac)
```

## Task Dependencies

Use `blockedBy` and `blocks` to encode sequence:

```
Task 1: [analyst] Research auth patterns
Task 2: [engineer] Implement auth flow (blockedBy: 1)
Task 3: [reviewer] Review implementation (blockedBy: 2)
Task 4: [tester] Validate auth (blockedBy: 3)
```

After compaction, dependencies tell you what's actionable (no blockers) vs what's waiting.

## Required Discipline

### When Starting Work

1. **Check TaskList first** — understand current state
2. **Create tasks for non-trivial work** — 3+ steps means use Tasks
3. **Set status to `in_progress`** before beginning
4. **Assign subagent explicitly** in the subject

### When Completing Work

1. **Mark completed immediately** — don't batch
2. **Add discovered follow-ups** as new tasks
3. **Check for unblocked tasks** — completing one may unblock others

### Before Compaction

As context fills, ensure Tasks reflect:
- What's done (completed tasks)
- What's active (single `in_progress` task)
- What's discovered (new tasks from implementation)
- What's blocked and why

## Task Structure

```
Subject: [agent] Imperative action description
Description:
  - Context needed to execute
  - Acceptance criteria
  - Any constraints or considerations
ActiveForm: Present continuous for spinner ("Implementing auth flow")
```

**Subject format:** `[agent-name] Verb the thing`
- `[engineer] Implement JWT refresh logic`
- `[reviewer] Audit auth module for vulnerabilities`
- `[analyst] Research rate limiting approaches`

**Description includes:**
- Enough context for the assigned agent to proceed independently
- Clear done criteria
- Dependencies or blockers if not captured in `blockedBy`

## Coordination Patterns

### Sequential Handoff

```
1. [analyst] Research → creates findings
2. [engineer] Implement → uses findings (blockedBy: 1)
3. [reviewer] Review → checks implementation (blockedBy: 2)
4. [tester] Validate → confirms behavior (blockedBy: 3)
```

### Parallel Execution

```
1. [engineer] Implement feature A
2. [engineer] Implement feature B
3. [tester] Integration tests (blockedBy: 1, 2)
```

Tasks 1 and 2 can run in parallel; Task 3 waits for both.

### Iterative Refinement

```
1. [engineer] Initial implementation
2. [reviewer] Review round 1 (blockedBy: 1)
3. [engineer] Address feedback (blockedBy: 2)
4. [reviewer] Review round 2 (blockedBy: 3)
```

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|--------------|--------------|-----------------|
| No agent assignment | Lost after compaction | Always prefix with `[agent]` |
| Vague subjects | Can't recover intent | Specific, actionable subjects |
| Batching completions | State becomes stale | Mark done immediately |
| Skipping for "quick" tasks | Consistency matters | If 3+ steps, use Tasks |
| No dependencies | Unclear sequence | Encode with `blockedBy` |

## Rules

ALWAYS:
- Assign subagent explicitly in task subject: `[agent] Task description`
- Use dependencies to encode sequence
- Mark `in_progress` before starting, `completed` when done
- Check TaskList after compaction to recover state

NEVER:
- Use Tasks as a replacement for Linear/GitHub issues
- Leave multiple tasks `in_progress` simultaneously
- Skip agent assignment ("the main agent will figure it out")
- Batch task completions at end of work
