# TodoWrite Patterns

How agents should use TodoWrite to track work and maintain visibility.

## Why TodoWrite Matters

TodoWrite is powerful for agents because:
- **Visibility** — user sees exactly what agent is doing
- **Planning** — forces structured thinking before action
- **Recovery** — context survives interruptions
- **Accountability** — clear record of progress and completion

## Core Principles

1. **Create immediately** — when scope is clear, write todos
2. **One in_progress** — only one active task at a time
3. **Complete as you go** — mark done immediately, don't batch
4. **Expand dynamically** — add todos as you discover work
5. **Reflect reality** — list should match actual work remaining

## Initial Template Pattern

Start with a baseline, expand as you discover scope:

```markdown
<initial_todo_template>

- [ ] Understand request and determine scope
- [ ] { expand: add specific work items here }
- [ ] Execute primary task
- [ ] { expand: add follow-up items discovered }
- [ ] Synthesize and report

</initial_todo_template>
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

**During execution**:

```
- [x] Understand request → security review of auth module
- [x] Identify files → 3 files in src/auth/
- [x] Load security-engineering skill
- [x] Check JWT token handling
- [x] Check session management → found issue
- [ ] Investigate session fixation vulnerability
- [ ] Check password hashing
- [ ] Synthesize findings
- [ ] Compile report
```

## Agent-Specific Templates

### Review Agent

```
- [ ] Detect review type and scope
- [ ] Load primary skill
- [ ] { expand: per-concern todos }
- [ ] Load additional skills if needed
- [ ] Synthesize findings
- [ ] Compile report with severity ranking
```

### Implementation Agent

```
- [ ] Understand requirements
- [ ] Explore existing patterns
- [ ] Plan implementation approach
- [ ] { expand: per-component todos }
- [ ] Write tests
- [ ] Implement
- [ ] Verify tests pass
```

### Research Agent

```
- [ ] Clarify research question
- [ ] Identify sources
- [ ] { expand: per-source todos }
- [ ] Cross-reference findings
- [ ] Synthesize with citations
```

### Migration Agent

```
- [ ] Analyze current state
- [ ] Plan migration steps
- [ ] { expand: per-file/module todos }
- [ ] Validate at each step
- [ ] Verify functionality preserved
```

## When to Expand

Add todos when you discover:
- **New files** to process
- **New concerns** to address
- **Follow-up investigations** from findings
- **Dependencies** that must complete first
- **Validation steps** needed

## Discipline Rules

**DO:**
- Create todos before starting work
- Mark `in_progress` as you begin each item
- Mark `completed` immediately when done
- Add specific items as scope becomes clear
- Keep descriptions action-oriented

**DON'T:**
- Batch multiple completions together
- Leave todos vague ("do the thing")
- Have multiple `in_progress` at once
- Skip updating when discovering new work
- Delete incomplete todos (mark blocked or update)

## Status Management

```
pending      → Work not started
in_progress  → Currently working (one at a time)
completed    → Done (mark immediately)
```

If blocked, either:
- Add a new todo for the blocker
- Update the description to note the block
- Remove if no longer relevant

## Visibility Goal

**Anyone reading your todo list should understand:**
- What you're currently doing
- What remains to be done
- What you've completed
- Why items were added

## Example: Complete Session

```
User: "Review this API for security issues"

Agent creates:
- [ ] Analyze request → API security review
- [ ] Identify endpoints to review

Agent reads files, expands:
- [x] Analyze request → API security review
- [x] Identify endpoints → 5 endpoints in routes/
- [ ] Load security-engineering skill
- [ ] Review /auth/login endpoint
- [ ] Review /auth/register endpoint
- [ ] Review /users/:id endpoint
- [ ] Review /admin/* endpoints
- [ ] Review /api/webhooks endpoint
- [ ] Check rate limiting
- [ ] Check input validation patterns
- [ ] Synthesize findings
- [ ] Compile report

Agent works through, discovers issue:
- [x] Review /auth/login endpoint
- [x] Review /auth/register endpoint → found issue
- [ ] Investigate missing rate limit on register
- [ ] Review /users/:id endpoint
...

Agent completes:
- [x] All items completed
- Final report delivered
```
