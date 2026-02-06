---
name: tdd
description: This skill should be used when implementing features with TDD, writing tests first, or refactoring with test coverage. Applies disciplined Red-Green-Refactor cycles with TypeScript/Bun and Rust tooling.
metadata:
  version: "3.0.0"
---

# Test-Driven Development

Write tests first, implement minimal code to pass, refactor systematically.

<philosophy>

```
RED --> GREEN --> REFACTOR --> RED --> ...
 |       |          |
Test   Impl      Improve
Fails  Passes   Quality
```

Each cycle: 5-15 min. Longer = step too large, decompose.

</philosophy>

<when_to_use>

- New features with TDD methodology
- Complex business logic requiring coverage
- Critical paths: auth, payments, data integrity
- Bug fixes: reproduce with test, fix, verify
- Refactoring: ensure behavior preservation
- API design: tests define the interface

NOT for: exploratory coding, UI prototypes, static config, trivial glue code

</when_to_use>

<intake>

Where are you in the TDD cycle?

1. **Starting new feature** — need to write failing tests
2. **Tests written** — ready to implement
3. **Tests passing** — ready to refactor
4. **Fixing a bug** — need TDD bug fix workflow

</intake>

<routing>

| Response | Workflow | activeForm |
|----------|----------|------------|
| 1, "new", "starting", "feature" | workflows/red-phase.md | "Writing failing test" |
| 2, "tests written", "implement" | workflows/green-phase.md | "Implementing code" |
| 3, "passing", "refactor", "clean" | workflows/refactor-phase.md | "Refactoring code" |
| 4, "bug", "fix", "regression" | workflows/bug-fix.md | "Reproducing bug" |

</routing>

<stages>

Load the **maintain-tasks** skill for cycle tracking.

| Stage | Trigger | activeForm |
|-------|---------|------------|
| Red | Session start / cycle restart | "Writing failing test" |
| Green | Test written and failing | "Implementing code" |
| Refactor | Tests passing | "Refactoring code" |
| Verify | Refactor complete | "Verifying implementation" |

**Workflow:**
- Start: Create "Red" stage `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- After each stage: Run tests before advancing
- Multiple cycles: Return to "Red" for next feature

**Edge cases:**
- Good existing tests: Start at "Refactor" after confirming pass
- Bug fix: Start at "Red" with failing test reproducing bug
- No regression: Tests must continue passing through all stages

</stages>

<rules>

ALWAYS:
- Load **maintain-tasks** skill for cycle tracking
- Write tests before implementation (RED first)
- Run tests after each phase
- Verify tests fail for right reason in RED
- Keep cycles 5-15 min max
- Descriptive test names forming sentences
- Test behavior, not implementation
- Each test = one reason to fail

NEVER:
- Skip to implementation without tests
- Change test behavior during refactoring
- Test implementation details or private methods
- Allow tests to depend on execution order
- Write flaky tests
- Mark stage complete without running tests
- Multiple unrelated assertions per test

</rules>

<quick_reference>

```bash
# TypeScript/Bun
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test --coverage         # Coverage report
bun test --only             # Run only .only tests

# Rust
cargo test                  # Run all tests
cargo test --test NAME      # Specific integration test
cargo tarpaulin             # Coverage report
cargo test -- --nocapture   # Show println! output
```

</quick_reference>

<quality>

| Metric | Target |
|--------|--------|
| Line coverage | ≥80% (90% critical paths) |
| Mutation score | ≥75% |
| Unit test time | <5s |

</quality>

<organization>

**TypeScript/Bun:**
```
src/{module}/{name}.ts          # Implementation
src/{module}/{name}.test.ts     # Unit tests colocated
tests/integration/              # Integration tests
```

**Rust:**
```
src/{module}/mod.rs             # #[cfg(test)] mod tests { ... }
tests/integration/              # Integration tests
```

</organization>

<references>

**Workflows:**
- workflows/red-phase.md — Write failing tests
- workflows/green-phase.md — Implement to pass
- workflows/refactor-phase.md — Improve quality
- workflows/bug-fix.md — TDD for bug fixes

**References:**
- references/test-patterns.md — Mocking, builders, async, parameterized
- references/quality-metrics.md — Coverage, mutation testing, CI

**Examples:**
- examples/feature-implementation.md — Full TDD session walkthrough
- examples/bug-fix.md — TDD workflow for bug fixes

</references>
