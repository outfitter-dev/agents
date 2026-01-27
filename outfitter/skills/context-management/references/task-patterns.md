# Task Patterns

Deep patterns for using Tasks as your persistent state layer.

> **TL;DR**: Tasks survive compaction—your reasoning doesn't. One `in_progress` at a time. Mark completed immediately. Encode decisions in task descriptions. Before compaction, detail your current state. Track background agents with IDs in metadata.

## Why Tasks Matter for Context Management

Tasks survive context compaction. When context resets, you lose:
- Your reasoning chains
- Files you read
- Intermediate conclusions
- Decisions you made

But Tasks persist. They're your memory across compaction events.

## Core Principles

1. **Create immediately** — When scope is clear, `TaskCreate`
2. **One in_progress** — Only one active task at a time
3. **Complete as you go** — `TaskUpdate` to completed immediately, don't batch
4. **Expand dynamically** — `TaskCreate` as you discover work
5. **Reflect reality** — `TaskList` should match actual work remaining
6. **Encode decisions** — Completed task descriptions should capture what was decided

## Initial Pattern

Start with baseline tasks, expand as scope becomes clear:

```
TaskCreate: "Understand request and determine scope"
TaskCreate: "Execute primary task"
TaskCreate: "Synthesize and report"
```

Expand dynamically as you discover specific work items.

## Evolution Example

**Initial** (after reading request):

```
#1: "Understand request" → completed, description: "security review of auth module"
#2: "Identify files to review" → in_progress
```

**After scope discovery**:

```
#1: completed - "Understand request → security review of auth module"
#2: completed - "Identify files → 3 files in src/auth/"
#3: pending - "Load security skill"
#4: pending - "Check JWT token handling"
#5: pending - "Check session management"
#6: pending - "Check password hashing"
#7: pending - "Synthesize findings"
#8: pending - "Compile report"
```

**During execution** (discovered issue):

```
#5: completed - "Check session management → found issue"
#9: pending - "Investigate session fixation vulnerability" ← TaskCreate for discovery
```

## Agent-Specific Templates

### Implementation Tasks

```
- Understand requirements
- Explore existing patterns
- Plan implementation approach
- { expand: per-component tasks }
- Write tests (TDD: tests first)
- Implement
- Verify tests pass
- Self-review for quality
```

### Review Tasks

```
- Detect review type and scope
- Load primary skill
- { expand: per-concern tasks }
- Load additional skills if needed
- Synthesize findings
- Compile report with severity ranking
```

### Research Tasks

```
- Clarify research question
- Identify sources
- { expand: per-source tasks }
- Cross-reference findings
- Synthesize with citations
```

### Debugging Tasks

```
- Reproduce the issue
- Gather evidence (logs, errors, state)
- Form hypothesis
- { expand: investigation steps }
- Validate root cause
- Implement fix
- Verify fix resolves issue
```

### Multi-Agent Tasks

Use `[agent-name]` prefix in task subjects and `blockedBy` for dependencies:

```
#1: "[analyst] Research stage" - pending
#2: "[engineer] Implementation stage" - pending, blockedBy: #1
#3: "[reviewer] Review stage" - pending, blockedBy: #2
#4: "[tester] Validation stage" - pending, blockedBy: #3
#5: "Synthesize results" - pending, blockedBy: #4
```

## Encoding Decisions

Completed task descriptions should capture what was decided, not just what was done.

**Bad** (no decision context):

```
Task: "Research auth libraries" - completed
Description: (empty)
```

**Good** (decision encoded):

```
Task: "Research auth libraries" - completed
Description: "Selected jose (already in deps, ES module support)"
```

## Pre-Compaction State Capture

When context is filling, `TaskUpdate` your `in_progress` task with maximum detail:

```
Task: "Implementing token refresh flow" - in_progress
Description:
  - File: src/auth/refresh.ts
  - Current line: 42
  - Done: validateToken(), extractClaims()
  - Next: rotateToken() implementation
  - Note: Using jose library, RS256 algorithm
  - Blocked: Need JWKS endpoint URL from config
```

This level of detail lets you resume exactly where you left off.

## Tracking Background Agents

Include agent IDs in task metadata so you can resume them later:

```
Task: "[reviewer] Security review auth module"
Status: pending
Metadata: { agentId: "abc123", background: true }
```

When agents complete, `TaskUpdate`:

```
Task: "[reviewer] Security review auth module" - completed
Description: "2 issues found"
Metadata: { agentId: "abc123" }
```

Then `TaskCreate` for follow-up:

```
Task: "Address security issues from reviewer"
Status: pending
```

## When to TaskCreate

Add tasks when you discover:
- **New files** to process
- **New concerns** to address
- **Follow-up investigations** from findings
- **Dependencies** that must complete first (use `addBlockedBy`)
- **Validation steps** needed
- **Blockers** requiring resolution

## Status Management

```
pending      → Work not started
in_progress  → Currently working (one at a time)
completed    → Done (mark immediately)
```

If blocked:
1. `TaskCreate` for the blocker
2. Use `addBlockedBy` to link
3. Either keep blocked task `in_progress` or revert to `pending`
4. Never mark a blocked task completed

## Visibility Goal

**Anyone reading your task list should understand:**
- What you're currently doing (in_progress task)
- What remains to be done (pending tasks)
- What you've completed (completed tasks with descriptions)
- What decisions were made (in descriptions)
- What's blocking progress (blockedBy relationships)
