# Task Patterns

How agents should use Tasks to track work and maintain visibility.

## Why Tasks Matter

Tasks are powerful for agents because:
- **Visibility** — user sees exactly what agent is doing
- **Planning** — forces structured thinking before action
- **Recovery** — context survives compaction
- **Accountability** — clear record of progress and completion

## Core Principles

1. **TaskCreate immediately** — when scope is clear, create tasks
2. **One in_progress** — only one active task at a time
3. **Complete as you go** — `TaskUpdate` to completed immediately, don't batch
4. **Expand dynamically** — `TaskCreate` as you discover work
5. **Reflect reality** — `TaskList` should match actual work remaining

## Initial Pattern

Start with baseline tasks, expand as you discover scope:

```
TaskCreate: "Understand request and determine scope"
TaskCreate: "Execute primary task"
TaskCreate: "Synthesize and report"
```

Expand dynamically by calling `TaskCreate` as scope becomes clear.

## Evolution Example

**Initial** (after reading request):

```
#1: "Understand request" → description: "security review of auth module"
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
#9: pending - "Investigate session fixation vulnerability" (TaskCreate for discovery)
```

## Agent-Specific Templates

### Review Agent

```
- Detect review type and scope
- Load primary skill
- { expand: per-concern tasks }
- Load additional skills if needed
- Synthesize findings
- Compile report with severity ranking
```

### Implementation Agent

```
- Understand requirements
- Explore existing patterns
- Plan implementation approach
- { expand: per-component tasks }
- Write tests
- Implement
- Verify tests pass
```

### Research Agent

```
- Clarify research question
- Identify sources
- { expand: per-source tasks }
- Cross-reference findings
- Synthesize with citations
```

### Migration Agent

```
- Analyze current state
- Plan migration steps
- { expand: per-file/module tasks }
- Validate at each step
- Verify functionality preserved
```

## When to TaskCreate

Add tasks when you discover:
- **New files** to process
- **New concerns** to address
- **Follow-up investigations** from findings
- **Dependencies** that must complete first (use `addBlockedBy`)
- **Validation steps** needed

## Discipline Rules

**DO:**
- `TaskCreate` before starting work
- `TaskUpdate` to `in_progress` as you begin each task
- `TaskUpdate` to `completed` immediately when done
- Add specific tasks as scope becomes clear
- Keep subjects action-oriented

**DON'T:**
- Batch multiple completions together
- Leave task subjects vague ("do the thing")
- Have multiple `in_progress` at once
- Skip `TaskCreate` when discovering new work
- Mark blocked tasks as completed

## Status Management

```
pending      → Work not started
in_progress  → Currently working (one at a time)
completed    → Done (mark immediately)
```

If blocked:
- `TaskCreate` for the blocker
- Use `addBlockedBy` to link
- Keep blocked task pending or in_progress
- Never mark blocked task completed

## Visibility Goal

**Anyone reading your task list should understand:**
- What you're currently doing (in_progress)
- What remains to be done (pending)
- What you've completed (completed with descriptions)
- What decisions were made (in descriptions)

## Example: Complete Session

```
User: "Review this API for security issues"

Agent creates tasks:
#1: "Analyze request" - in_progress
#2: "Identify endpoints to review" - pending

Agent reads files, expands with TaskCreate:
#1: completed - "Analyze request → API security review"
#2: completed - "Identify endpoints → 5 endpoints in routes/"
#3-11: pending tasks for each endpoint and check

Agent works through, discovers issue:
#4: completed - "Review /auth/register endpoint → found issue"
#12: pending - "Investigate missing rate limit" (TaskCreate for discovery)

Agent completes:
- All tasks completed
- Final report delivered
```
