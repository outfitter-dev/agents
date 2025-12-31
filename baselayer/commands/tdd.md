---
description: Implement a feature or fix using test-driven development (Red-Green-Refactor)
argument-hint: [feature or bug to implement]
---

# Test-Driven Development

Implement the requested feature using strict TDD methodology.

## Instructions

- Consider the recent conversation history, your context, and the feature or fix to be implemented.
- Specific user instructions should be followed unless they are contradictory to the task at hand. $ARGUMENTS

## Steps

1. **Load** — Use the Skill tool and load the **baselayer:test-driven-development** skill
2. **Consider** — Ultrathink and analyze the feature, break it into testable behaviors, and plan the RED-GREEN-REFACTOR cycles
3. **Dispatch or Execute** — Choose execution path based on available tools:
   - **If Task tool available**: Dispatch the **baselayer:tester** subagent in background mode, passing along feature requirements and testing strategy
   - **If Task tool unavailable**: Execute the TDD methodology directly using the loaded skill
4. **Monitor** — If subagent dispatched, use TaskOutput to retrieve results when ready

## The Cycle

```
RED → GREEN → REFACTOR (repeat)
```

1. RED — write a failing test that defines the expected behavior
2. GREEN — write minimal code to make the test pass
3. REFACTOR — clean up while keeping tests green

## Context Handoff (for subagent dispatch)

When dispatching to the tester subagent, include:
- Feature requirements and acceptance criteria
- First testable behavior to implement
- Existing test patterns in the codebase
- Any constraints (framework, coverage requirements)

## Rules

- Never write production code without a failing test first
- Each cycle should take 5-15 minutes
- Commit at each green state
- Tests are first-class code — no shortcuts

Do NOT write implementation code before you have a failing test.
