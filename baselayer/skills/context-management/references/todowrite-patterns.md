# TodoWrite Patterns

Deep patterns for using TodoWrite as your persistent state layer.

> **TL;DR**: TodoWrite survives compaction—your reasoning doesn't. One `in_progress` at a time. Mark completed immediately. Encode decisions in completed todos (`→ selected jose`). Before compaction, detail your current state in the `in_progress` todo. Track background agents with IDs.

## Why TodoWrite Matters for Context Management

TodoWrite survives context compaction. When context resets, you lose:
- Your reasoning chains
- Files you read
- Intermediate conclusions
- Decisions you made

But TodoWrite persists. It's your memory across compaction events.

## Core Principles

1. **Create immediately** — When scope is clear, write todos
2. **One in_progress** — Only one active task at a time
3. **Complete as you go** — Mark done immediately, don't batch
4. **Expand dynamically** — Add todos as you discover work
5. **Reflect reality** — List should match actual work remaining
6. **Encode decisions** — Completed todos should capture what was decided

## Initial Template Pattern

Start with a baseline, expand as scope becomes clear:

```
- [ ] Understand request and determine scope
- [ ] { expand: add specific work items here }
- [ ] Execute primary task
- [ ] { expand: add follow-up items discovered }
- [ ] Synthesize and report
```

The `{ expand: ... }` markers show where dynamic additions happen.

## Evolution Example

**Initial** (after reading request):

```
- [ ] Understand request → security review of auth module
- [ ] Identify files to review
```

**After scope discovery**:

```
- [x] Understand request → security review of auth module
- [x] Identify files → 3 files in src/auth/
- [ ] Load security-engineering skill
- [ ] Check JWT token handling
- [ ] Check session management
- [ ] Check password hashing
- [ ] Synthesize findings
- [ ] Compile report
```

**During execution** (discovered issue):

```
- [x] Understand request → security review of auth module
- [x] Identify files → 3 files in src/auth/
- [x] Load security-engineering skill
- [x] Check JWT token handling
- [x] Check session management → found issue
- [ ] Investigate session fixation vulnerability  ← discovered
- [ ] Check password hashing
- [ ] Synthesize findings
- [ ] Compile report
```

## Agent-Specific Templates

### Implementation Tasks

```
- [ ] Understand requirements
- [ ] Explore existing patterns
- [ ] Plan implementation approach
- [ ] { expand: per-component todos }
- [ ] Write tests (TDD: tests first)
- [ ] Implement
- [ ] Verify tests pass
- [ ] Self-review for quality
```

### Review Tasks

```
- [ ] Detect review type and scope
- [ ] Load primary skill
- [ ] { expand: per-concern todos }
- [ ] Load additional skills if needed
- [ ] Synthesize findings
- [ ] Compile report with severity ranking
```

### Research Tasks

```
- [ ] Clarify research question
- [ ] Identify sources
- [ ] { expand: per-source todos }
- [ ] Cross-reference findings
- [ ] Synthesize with citations
```

### Debugging Tasks

```
- [ ] Reproduce the issue
- [ ] Gather evidence (logs, errors, state)
- [ ] Form hypothesis
- [ ] { expand: investigation steps }
- [ ] Validate root cause
- [ ] Implement fix
- [ ] Verify fix resolves issue
```

### Multi-Agent Tasks

```
- [ ] Plan orchestration (which agents, what order)
- [ ] [analyst] Research phase
- [ ] [senior-dev] Implementation phase (after research)
- [ ] [ranger] Review phase (after impl)
- [ ] [tester] Validation phase (after review)
- [ ] Synthesize results
```

## Encoding Decisions

Completed todos should capture what was decided, not just what was done.

**Bad** (no decision context):
```
- [x] Research auth libraries
```

**Good** (decision encoded):
```
- [x] Research auth libraries → selected jose (already in deps, ES module support)
```

**Bad** (vague):
```
- [x] Set up endpoint
```

**Good** (specific):
```
- [x] Set up refresh endpoint → POST /api/auth/refresh (matches existing patterns)
```

## Pre-Compaction State Capture

When context is filling, update your `in_progress` todo with maximum detail:

```
- [ ] [in_progress] Implementing token refresh flow
    - File: src/auth/refresh.ts
    - Current line: 42
    - Done: validateToken(), extractClaims()
    - Next: rotateToken() implementation
    - Note: Using jose library, RS256 algorithm
    - Blocked: Need JWKS endpoint URL from config
```

This level of detail lets you resume exactly where you left off.

## Tracking Background Agents

Include agent IDs so you can resume them later:

```
- [ ] [ranger] Security review auth module (agent-id: abc123, background)
- [ ] [analyst] Impact analysis (agent-id: def456, background)
- [ ] Collect review results (waiting on: abc123, def456)
```

When agents complete, update:

```
- [x] [ranger] Security review auth module (agent-id: abc123) → 2 issues found
- [x] [analyst] Impact analysis (agent-id: def456) → 3 files affected
- [ ] Address security issues from ranger review
```

## When to Expand

Add todos when you discover:
- **New files** to process
- **New concerns** to address
- **Follow-up investigations** from findings
- **Dependencies** that must complete first
- **Validation steps** needed
- **Blockers** requiring resolution

## Status Management

```
pending      → Work not started
in_progress  → Currently working (one at a time)
completed    → Done (mark immediately)
```

If blocked:
1. Create a new todo for the blocker
2. Either keep blocked task `in_progress` (if actively working around it) or revert to `pending`
3. Never mark a blocked task completed

## Visibility Goal

**Anyone reading your todo list should understand:**
- What you're currently doing
- What remains to be done
- What you've completed
- What decisions were made
- What's blocking progress
