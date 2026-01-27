---
name: tdd
description: This skill should be used when implementing features with TDD, writing tests first, or refactoring with test coverage. Applies disciplined Red-Green-Refactor cycles with TypeScript/Bun and Rust tooling.
metadata:
  version: "2.1.0"
---

# Test-Driven Development

Write tests first, implement minimal code to pass, refactor systematically.

<when_to_use>

- New features with TDD methodology
- Complex business logic requiring coverage
- Critical paths: auth, payments, data integrity
- Bug fixes: reproduce with test, fix, verify
- Refactoring: ensure behavior preservation
- API design: tests define the interface

NOT for: exploratory coding, UI prototypes, static config, trivial glue code

</when_to_use>

<stages>

Load the **maintain-tasks** skill for stage tracking. Advance through RED-GREEN-REFACTOR cycle.

| Stage | Trigger | activeForm |
|-------|---------|------------|
| Red | Session start / cycle restart | "Writing failing test" |
| Green | Test written and failing | "Implementing code" |
| Refactor | Tests passing | "Refactoring code" |
| Verify | Refactor complete | "Verifying implementation" |

Task format:

```text
- Write failing test for { feature }
- Implement { feature } to pass tests
- Refactor { aspect }
- Verify { what's being checked }
```

Workflow:
- Start: Create "Red" stage `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- After each stage: Run tests before advancing
- Multiple cycles: Return to "Red" for next feature

Edge cases:
- Good existing tests: Start at "Refactor" after confirming pass
- Bug fix: Start at "Red" with failing test reproducing bug
- No regression: Tests must continue passing through all stages

</stages>

<cycle>

```
RED --> GREEN --> REFACTOR --> RED --> ...
 |       |          |
Test   Impl      Improve
Fails  Passes   Quality
```

Each cycle: 5-15 min. Longer = step too large, decompose.

Philosophy:
- Red-Green-Refactor as primary workflow
- Test quality over quantity - behavior, not implementation
- Incremental progress - small focused cycles
- Type safety throughout - tests as type-safe as production

</cycle>

<red_phase>

Write tests defining desired behavior before implementation exists.

Guidelines:
- 3-5 related tests fully specifying one feature
- Type system makes invalid states unrepresentable
- Each test = one specific behavior
- Run tests, verify fail for right reason
- Descriptive names forming sentences

TypeScript:

```typescript
import { describe, test, expect } from 'bun:test'

describe('UserAuthentication', () => {
  test('authenticates with valid credentials', async () => {
    const result = await authenticate({ email: 'user@example.com', password: 'SecurePass123!' })
    expect(result).toMatchObject({ type: 'success', user: expect.objectContaining({ email: 'user@example.com' }) })
  })

  test('rejects invalid credentials', async () => {
    const result = await authenticate({ email: 'wrong@example.com', password: 'wrong' })
    expect(result).toMatchObject({ type: 'error', code: 'INVALID_CREDENTIALS' })
  })

  test.todo('implements rate limiting after failed attempts')
})
```

Rust:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn authenticates_with_valid_credentials() {
        let creds = Credentials { email: "user@example.com".into(), password: "SecurePass123!".into() };
        assert!(matches!(authenticate(&creds), Ok(AuthResult::Success { .. })));
    }

    #[test]
    fn rejects_invalid_credentials() {
        let creds = Credentials { email: "wrong@example.com".into(), password: "wrong".into() };
        assert!(matches!(authenticate(&creds), Err(AuthError::InvalidCredentials)));
    }
}
```

Commit: `test: add failing tests for [feature]`

Transition: Mark "Red" `completed`, create "Green" `in_progress`

</red_phase>

<green_phase>

Implement minimum code to make tests pass.

Guidelines:
- Focus on passing tests, not perfect code
- Explicit types where aids clarity
- Straightforward solutions first
- Hardcode if passes test - refactor generalizes
- Run tests frequently

TypeScript:

```typescript
type AuthResult = { type: 'success'; user: User } | { type: 'error'; code: string }

async function authenticate(creds: { email: string; password: string }): Promise<AuthResult> {
  if (!creds.password) return { type: 'error', code: 'MISSING_PASSWORD' }
  const user = await findUserByEmail(creds.email)
  if (!user) return { type: 'error', code: 'INVALID_CREDENTIALS' }
  const match = await comparePassword(creds.password, user.passwordHash)
  if (!match) return { type: 'error', code: 'INVALID_CREDENTIALS' }
  return { type: 'success', user }
}
```

Rust:

```rust
pub fn authenticate(creds: &Credentials) -> Result<AuthResult, AuthError> {
    if creds.password.is_empty() { return Err(AuthError::MissingPassword); }
    let user = find_user_by_email(&creds.email).ok_or(AuthError::InvalidCredentials)?;
    if !compare_password(&creds.password, &user.password_hash) {
        return Err(AuthError::InvalidCredentials);
    }
    Ok(AuthResult::Success { user })
}
```

Verify: `bun test` / `cargo test`

Commit: `feat: implement [feature] to pass tests`

Transition: Mark "Green" `completed`, create "Refactor" `in_progress`

</green_phase>

<refactor_phase>

Enhance code quality without changing behavior. Tests must continue passing.

Guidelines:
- Extract common patterns into well-named functions
- Apply SOLID principles where appropriate
- Improve types: discriminated unions, branded types
- No test behavior changes
- Run tests after each step

TypeScript:

```typescript
// Extract validation
function validateCredentials(creds: { email: string; password: string }): AuthResult | null {
  if (!creds.password) return { type: 'error', code: 'MISSING_PASSWORD' }
  if (!isValidEmail(creds.email)) return { type: 'error', code: 'INVALID_EMAIL' }
  return null
}

// Branded types for safety
type Email = string & { readonly __brand: 'Email' }
```

Rust:

```rust
// Extract validation
fn validate_credentials(creds: &Credentials) -> Result<(), AuthError> {
    if creds.password.is_empty() { return Err(AuthError::MissingPassword); }
    if !is_valid_email(&creds.email) { return Err(AuthError::InvalidEmail); }
    Ok(())
}

// Newtype for safety
pub struct Email(String);
```

Verify: `bun test` / `cargo test`

Commit: `refactor: [improvement description]`

Transition: Mark "Refactor" `completed`, create "Verify" `in_progress`

Final: Run full suite. Mark "Verify" `completed` when all checks pass.

</refactor_phase>

<organization>

Follow project conventions, defaulting to:

TypeScript/Bun:

```
src/{module}/{name}.ts          # Implementation
src/{module}/{name}.test.ts     # Unit tests colocated
src/{module}/__fixtures__/      # Test data
tests/integration/              # Integration tests
tests/e2e/                      # End-to-end tests
```

Rust:

```
src/{module}/mod.rs             # #[cfg(test)] mod tests { ... }
tests/integration/              # Integration tests
tests/fixtures/                 # Test data
```

</organization>

<quality>

| Metric | Target |
|--------|--------|
| Line coverage | >=80% (90% critical paths) |
| Mutation score | >=75% |
| Unit test time | <5s |

Test characteristics:
- Single clear assertion per test
- No execution order dependencies
- Descriptive names forming sentences
- Behavior focus, not implementation

Smells to avoid:
- Setup longer than test
- Multiple unrelated assertions
- Coupling to implementation details
- Flaky tests

See [quality-metrics.md](references/quality-metrics.md) for coverage and mutation testing details.

</quality>

<bug_fixes>

TDD workflow for bugs:

1. Write failing test reproducing bug (Start "Red" `in_progress`)
2. Verify fails for right reason
3. Fix with minimal code (Transition to "Green")
4. Verify passes, all others still pass
5. Refactor if needed (Transition to "Refactor" or skip to "Verify")
6. Commit: `fix: [bug description] with test coverage`

Example:

```typescript
// 1. Failing test
test('handles division by zero gracefully', () => {
  expect(divide(10, 0)).toMatchObject({ type: 'error', code: 'DIVISION_BY_ZERO' })
})

// 3. Fix
function divide(a: number, b: number): Result {
  if (b === 0) return { type: 'error', code: 'DIVISION_BY_ZERO' }
  return { type: 'success', value: a / b }
}
```

</bug_fixes>

<rules>

ALWAYS:
- Track progress with Tasks (load **maintain-tasks** skill)
- Write tests before implementation (RED first)
- Run tests after each stage
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
bun x stryker run           # Mutation testing

# Rust
cargo test                  # Run all tests
cargo test --test NAME      # Specific integration test
cargo tarpaulin             # Coverage report
cargo mutants               # Mutation testing
cargo test -- --nocapture   # Show println! output
```

</quick_reference>

<references>

- [test-patterns.md](references/test-patterns.md) - Discriminated unions, builders, mocking, parameterized tests, async patterns for TypeScript and Rust
- [quality-metrics.md](references/quality-metrics.md) - Coverage analysis, mutation testing setup, CI integration, thresholds
- [feature-implementation.md](examples/feature-implementation.md) - Full TDD session walkthrough
- [bug-fix.md](examples/bug-fix.md) - TDD workflow for bug fixes

</references>
