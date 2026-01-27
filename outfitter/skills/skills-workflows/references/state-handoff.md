# State Handoff Patterns

How to pass state between workflow steps without relying on conversation context.

## Why File-Based State

| Problem | File-Based Solution |
|---------|---------------------|
| Context compaction loses history | Files persist |
| Forked skills have no conversation access | Files are accessible |
| State scattered across messages | Single source of truth |
| Hard to audit what happened | Artifacts are reviewable |

## Core Pattern

```text
Skill A writes → artifacts/step-a.md
                        ↓
Skill B reads artifacts/step-a.md → writes artifacts/step-b.md
                                            ↓
Skill C reads artifacts/step-b.md → ...
```

Each skill:
1. Reads previous artifact(s)
2. Does its work
3. Writes its own artifact
4. Updates context.md with decisions

## Artifact Structure

### Standard Header

```markdown
# {Step Name}: {Brief Description}

**Generated**: {timestamp}
**Input**: artifacts/{previous-step}.md
**Status**: complete | partial | blocked

---
```

### Sections by Step Type

**Triage/Analysis artifacts:**
```markdown
## Problem Statement
{clear definition}

## Scope
- Files: {list}
- Modules: {list}

## Findings
{what was discovered}

## Risks
- {risk 1}
- {risk 2}

## Next Steps
- [ ] {action 1}
- [ ] {action 2}
```

**Plan artifacts:**
```markdown
## Goal
{what we're trying to achieve}

## Approach
{chosen approach with rationale}

## Task Breakdown
1. {task 1}
2. {task 2}
3. {task 3}

## Test Plan
- [ ] {test 1}
- [ ] {test 2}

## Rollback Plan
{how to undo if needed}
```

**Review artifacts:**
```markdown
## Summary
{brief assessment}

## Findings
| Severity | Issue | Location | Recommendation |
|----------|-------|----------|----------------|
| {sev} | {desc} | {loc} | {rec} |

## Concerns
- {concern 1}
- {concern 2}

## Approval
- [ ] Ready to proceed
- [ ] Needs revision
```

**Test artifacts:**
```markdown
## Commands Run
```bash
{command 1}
{command 2}
```

## Results
| Suite | Pass | Fail | Skip |
|-------|------|------|------|
| {name} | {n} | {n} | {n} |

## Failures
### {test name}
- Error: {message}
- Fix: {resolution}

## Coverage
{coverage summary}
```

## context.md Pattern

The shared context.md tracks living state across all steps:

```markdown
# Current Context

## Task
{what we're working on}

## Decisions Made
- {decision 1} — {rationale}
- {decision 2} — {rationale}

## Current Focus
{what step we're on, what's next}

## Blockers
- {blocker if any}

## Open Questions
- {question if any}

---
Last updated: {timestamp}
```

### Update Pattern

Each skill appends to decisions and updates current focus:

```markdown
## Decisions Made
- {existing decisions}
- Chose X over Y for {reason} — from /plan  ← NEW
```

## constraints.md Pattern

Static project constraints, rarely changed:

```markdown
# Project Constraints

## Security
- No secrets in code
- All inputs validated
- {project-specific rules}

## Style
- {linting rules}
- {naming conventions}

## Performance
- {latency budgets}
- {size limits}

## Testing
- {coverage requirements}
- {required test types}
```

## Gates Between Steps

Use artifact existence as gates:

```markdown
---
name: ship
---

# Prerequisites

Check these artifacts exist and show success:
- artifacts/test-report.md: all tests passing
- artifacts/review-notes.md: no blocking issues
- artifacts/preflight.md: all checks green

If any missing or failing, do not proceed.
```

### Gate Validation Patterns

```markdown
# In skill body:

Before proceeding, verify:
1. artifacts/plan.md exists
2. All tasks in plan.md are checked off
3. artifacts/test-report.md shows no failures

If any check fails:
- Report what's missing
- Do not proceed
- Suggest next step
```

## Parallel Workflow Branches

When workflow branches, use namespaced artifacts:

```text
artifacts/
  triage.md
  plan.md
  security/
    audit.md
    review.md
  performance/
    profile.md
    review.md
  final-review.md  ← merges both branches
```

### Merge Pattern

```markdown
---
name: final-review
---

Read and merge:
- artifacts/security/review.md
- artifacts/performance/review.md

Synthesize into artifacts/final-review.md with:
- Combined findings
- Priority ranking
- Unified recommendation
```

## Failure Recovery

When a step fails, artifacts capture state for recovery:

```markdown
# artifacts/implement.md

## Status: blocked

## Completed
- [x] Task 1
- [x] Task 2

## Blocked On
- Task 3: {error message}

## Recovery Steps
1. {fix suggestion}
2. Retry /implement

## Context Preserved
- Last working state at commit abc123
- Rollback with: git checkout abc123
```

## Tips

### Keep Artifacts Focused

One purpose per artifact. If an artifact does multiple things, split it.

### Include Timestamps

```markdown
**Generated**: 2026-01-26T10:30:00Z
```

Helps track freshness and debugging.

### Link to Source

```markdown
## Findings
Issue in `src/auth/login.ts:42` — missing validation
```

Specific file:line references for easy navigation.

### Self-Contained

Each artifact should be understandable without reading others:

```markdown
# Review: Authentication Refactor

**Context**: Refactoring auth module to use JWT (from artifacts/plan.md)

## Scope Reviewed
- src/auth/*.ts
- src/middleware/auth.ts
```

### Version Artifacts When Needed

```text
artifacts/
  plan-v1.md
  plan-v2.md  ← after revision
  plan-final.md
```

Or use git to track history and keep single files.
