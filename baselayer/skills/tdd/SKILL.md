---
name: Test-Driven Development
version: 2.0.0
description: Applies disciplined test-driven development using Red-Green-Refactor cycles with modern TypeScript/Bun and Rust tooling. Use when implementing features with TDD, writing tests first, refactoring with test coverage, bug fixes requiring test reproduction, or when TDD, test-first, red-green-refactor, testing methodology, or --tdd flag are mentioned. Covers test quality, mutation testing, and both TypeScript and Rust workflows.
---

# Test-Driven Development

Disciplined test-driven development — write tests first, implement minimal code to pass, refactor systematically.

<when_to_use>
- Implementing new features with TDD methodology
- Complex business logic requiring test coverage
- Critical paths — authentication, payments, data integrity
- Bug fixes — reproduce with test, fix, verify
- Refactoring — ensure behavior preservation
- API design — use tests to define interface

NOT for: exploratory coding, UI prototypes, static configuration, trivial glue code
</when_to_use>

<phases>
Track with TodoWrite. Phases advance through RED-GREEN-REFACTOR cycle.

| Phase | Trigger | activeForm |
|-------|---------|------------|
| Red | Session start or cycle restart | "Writing failing test" |
| Green | Test written and failing | "Implementing code" |
| Refactor | Tests passing | "Refactoring code" |
| Verify | Refactor complete | "Verifying implementation" |

TodoWrite format:
```text
- Write failing test for { feature }
- Implement { feature } to pass tests
- Refactor { aspect being improved }
- Verify { what's being checked }
```

Workflow:
- Start: Create "Red" phase as `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- After each phase: Run tests before advancing
- Multiple cycles: Return to "Red" for next feature

Edge cases:
- High quality start: If existing tests comprehensive, start at "Refactor" after confirming tests pass
- Bug fix: Start at "Red" with failing test reproducing bug
- No regression: Tests must continue passing through Refactor and Verify
</phases>

<cycle>
Core loop:

```
RED → GREEN → REFACTOR → RED → ...
 ↓      ↓         ↓
Test  Impl    Improve
Fails Passes  Quality
```

Each cycle: 5–15 minutes. Longer → step too large, break down further.

Philosophy:
- **Red-Green-Refactor** as primary workflow
- **Test quality over quantity** — behavior, not implementation
- **Incremental progress** — small focused cycles
- **Type safety throughout** — tests as type-safe as production
- **Fast feedback loops** — leverage modern tooling
</cycle>

<red_phase>
Write tests defining desired behavior before implementation exists.

Start: Create "Red Phase" as `in_progress` if starting session

Guidelines:
- Write 3–5 related tests fully specifying one feature
- Use type system to make invalid test states unrepresentable
- Each test → one specific behavior
- Run tests → verify they fail for right reason
- Descriptive test names forming sentences

TypeScript pattern:
```typescript
import { describe, test, expect } from 'bun:test'

describe('UserAuthentication', () => {
  const validCredentials = {
    email: 'user@example.com',
    password: 'SecurePass123!',
  } as const

  test('authenticates with valid credentials', async () => {
    const result = await authenticate(validCredentials)
    expect(result).toMatchObject({
      type: 'success',
      user: expect.objectContaining({ email: validCredentials.email }),
    })
  })

  test('rejects invalid credentials', async () => {
    const result = await authenticate({
      email: 'wrong@example.com',
      password: 'wrong',
    })
    expect(result).toMatchObject({
      type: 'error',
      code: 'INVALID_CREDENTIALS',
    })
  })

  test.todo('implements rate limiting after failed attempts')
})
```

Rust pattern:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn authenticates_with_valid_credentials() {
        let credentials = Credentials {
            email: "user@example.com".to_string(),
            password: "SecurePass123!".to_string(),
        };

        let result = authenticate(&credentials);
        assert!(matches!(result, Ok(AuthResult::Success { .. })));
    }

    #[test]
    fn rejects_invalid_credentials() {
        let credentials = Credentials {
            email: "wrong@example.com".to_string(),
            password: "wrong".to_string(),
        };

        let result = authenticate(&credentials);
        assert!(matches!(result, Err(AuthError::InvalidCredentials)));
    }
}
```

Commit: `test: add failing tests for [feature]`

Transition: Mark "Red Phase" `completed`, create "Green Phase" as `in_progress`
</red_phase>

<green_phase>
Implement minimum code needed to make tests pass.

Guidelines:
- Focus on passing tests, not perfect code
- Explicit types over inference where aids clarity
- Straightforward solutions first — optimize in refactor
- Hardcode values if makes test pass — refactor will generalize
- Run tests frequently to verify progress

TypeScript pattern:
```typescript
type AuthResult =
  | { type: 'success'; user: User }
  | { type: 'error'; code: string }

async function authenticate(credentials: {
  email: string
  password: string
}): Promise<AuthResult> {
  // Minimal implementation to pass tests
  if (!credentials.password) {
    return { type: 'error', code: 'MISSING_PASSWORD' }
  }

  const user = await findUserByEmail(credentials.email)
  if (!user) {
    return { type: 'error', code: 'INVALID_CREDENTIALS' }
  }

  const passwordMatch = await comparePassword(
    credentials.password,
    user.passwordHash
  )
  if (!passwordMatch) {
    return { type: 'error', code: 'INVALID_CREDENTIALS' }
  }

  return { type: 'success', user }
}
```

Rust pattern:
```rust
#[derive(Debug, PartialEq)]
pub enum AuthResult {
    Success { user: User },
}

#[derive(Debug, thiserror::Error, PartialEq)]
pub enum AuthError {
    #[error("Invalid credentials")]
    InvalidCredentials,
    #[error("Password cannot be empty")]
    MissingPassword,
}

pub fn authenticate(credentials: &Credentials) -> Result<AuthResult, AuthError> {
    if credentials.password.is_empty() {
        return Err(AuthError::MissingPassword);
    }

    let user = find_user_by_email(&credentials.email)
        .ok_or(AuthError::InvalidCredentials)?;

    let password_match = compare_password(&credentials.password, &user.password_hash);
    if !password_match {
        return Err(AuthError::InvalidCredentials);
    }

    Ok(AuthResult::Success { user })
}
```

Verify:
```bash
# TypeScript
bun test

# Rust
cargo test
```

Commit: `feat: implement [feature] to pass tests`

Transition: Mark "Green Phase" `completed`, create "Refactor Phase" as `in_progress`
</green_phase>

<refactor_phase>
Enhance code quality without changing behavior. Tests must continue passing.

Guidelines:
- Extract common patterns into well-named functions
- Apply SOLID principles where appropriate
- Improve type definitions — discriminated unions, branded types
- No test behavior changes
- Run tests after each refactoring step
- Consider mutation testing to verify test quality

TypeScript refactoring pattern:
```typescript
// Extract validation
function validateCredentials(credentials: {
  email: string
  password: string
}): AuthResult | null {
  if (!credentials.password) {
    return { type: 'error', code: 'MISSING_PASSWORD' }
  }
  if (!isValidEmail(credentials.email)) {
    return { type: 'error', code: 'INVALID_EMAIL' }
  }
  return null
}

// Improve type safety with branded types
type Email = string & { readonly __brand: 'Email' }
type PasswordHash = string & { readonly __brand: 'PasswordHash' }

// Cleaner main function
async function authenticate(credentials: {
  email: string
  password: string
}): Promise<AuthResult> {
  const validationError = validateCredentials(credentials)
  if (validationError) return validationError

  const user = await findUserByEmail(credentials.email)
  if (!user) {
    return { type: 'error', code: 'INVALID_CREDENTIALS' }
  }

  const isValid = await verifyPassword(credentials.password, user.passwordHash)
  if (!isValid) {
    return { type: 'error', code: 'INVALID_CREDENTIALS' }
  }

  return { type: 'success', user }
}
```

Rust refactoring pattern:
```rust
// Extract validation
fn validate_credentials(credentials: &Credentials) -> Result<(), AuthError> {
    if credentials.password.is_empty() {
        return Err(AuthError::MissingPassword);
    }
    if !is_valid_email(&credentials.email) {
        return Err(AuthError::InvalidEmail);
    }
    Ok(())
}

// Use newtype pattern for type safety
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Email(String);

impl Email {
    pub fn new(email: String) -> Result<Self, AuthError> {
        if is_valid_email(&email) {
            Ok(Email(email))
        } else {
            Err(AuthError::InvalidEmail)
        }
    }
}

// Cleaner main function
pub fn authenticate(credentials: &Credentials) -> Result<AuthResult, AuthError> {
    validate_credentials(credentials)?;

    let user = find_user_by_email(&credentials.email)
        .ok_or(AuthError::InvalidCredentials)?;

    verify_password(&credentials.password, &user.password_hash)
        .then_some(AuthResult::Success { user })
        .ok_or(AuthError::InvalidCredentials)
}
```

Verify refactoring:
```bash
# TypeScript - run tests and check mutation score
bun test
bun x stryker run

# Rust - run tests and check coverage
cargo test
cargo tarpaulin
```

Commit: `refactor: [improvement description]`

Transition: Mark "Refactor Phase" `completed`, create "Verify" as `in_progress`

Final verification: Run full test suite with coverage and mutation testing. Mark "Verify" `completed` when all checks pass.
</refactor_phase>

<patterns>
Modern TypeScript patterns:

Discriminated unions for test scenarios:
```typescript
type TestScenario =
  | { type: 'success'; data: User }
  | { type: 'error'; error: AuthError }
  | { type: 'rate-limited'; retryAfter: number }

test.each<TestScenario>([
  { type: 'success', data: mockUser },
  { type: 'error', error: new AuthError('Invalid') },
  { type: 'rate-limited', retryAfter: 60 },
])('handles scenario: $type', async (scenario) => {
  // Test each scenario
})
```

Type-safe test builders:
```typescript
class TestUserBuilder {
  private user: Partial<User> = {}

  withEmail(email: string): this {
    this.user.email = email
    return this
  }

  build(): User {
    return {
      id: 'test-id',
      email: 'test@example.com',
      role: 'user',
      ...this.user,
    } satisfies User
  }
}
```

Const assertions for test data:
```typescript
const testCases = [
  { input: 'hello', expected: 'HELLO' },
  { input: 'world', expected: 'WORLD' },
] as const

test.each(testCases)('transforms $input to $expected', ({ input, expected }) => {
  expect(transform(input)).toBe(expected)
})
```

Bun speed patterns:

Focused tests during development:
```typescript
test.only('current feature under development', () => {
  // Fast feedback on current work
})

test.skip('slow integration test', () => {
  // Run in CI but not during TDD
})
```

Watch mode:
```bash
bun test --watch
bun test --watch user.service.test.ts
```

Parallel execution:
```typescript
describe.concurrent('Independent Operations', () => {
  test('operation 1', async () => {
    // Runs in parallel
  })
})
```

Rust test patterns:

Property-based testing:
```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn password_hash_is_deterministic(password in "[a-zA-Z0-9]{8,32}") {
        let hash1 = hash_password(&password);
        let hash2 = hash_password(&password);
        prop_assert_eq!(hash1, hash2);
    }
}
```

Async testing:
```rust
#[tokio::test]
async fn authenticates_user_async() {
    let credentials = Credentials {
        email: "user@example.com".to_string(),
        password: "password".to_string(),
    };

    let result = authenticate_async(&credentials).await;
    assert!(result.is_ok());
}
```

Documentation as tests:
```rust
/// Authenticates a user with credentials.
///
/// # Examples
///
/// ```
/// use auth::{authenticate, Credentials};
///
/// let creds = Credentials {
///     email: "user@example.com".to_string(),
///     password: "password".to_string(),
/// };
/// let result = authenticate(&creds);
/// assert!(result.is_ok());
/// ```
pub fn authenticate(credentials: &Credentials) -> Result<AuthResult, AuthError> {
    // Implementation
}
```
</patterns>

<organization>
Follow project conventions, defaulting to:

TypeScript/Bun:
```
src/
├── user/
│   ├── user.service.ts
│   ├── user.service.test.ts    # Unit tests colocated
│   └── __fixtures__/
│       └── users.ts             # Test data
tests/
├── integration/
│   └── user-api.test.ts         # Integration tests
└── e2e/
    └── user-flow.test.ts        # End-to-end tests
```

Rust:
```
src/
├── user/
│   ├── mod.rs
│   └── service.rs
│       └── #[cfg(test)] mod tests { ... }  # Unit tests in module
tests/
├── integration/
│   └── user_api.rs              # Integration tests
└── fixtures/
    └── users.rs                 # Test data
```
</organization>

<quality>
Standards to maintain:

Coverage metrics:
- Line coverage: ≥80% (90% for critical paths)
- Mutation score: ≥75% (via Stryker for TypeScript)
- Test execution time: <5 seconds for unit tests

Test characteristics:
- Single clear assertion per test
- No execution order dependencies
- Descriptive names forming sentences
- Behavior focus, not implementation

Test smells to avoid:
- Setup longer than test itself
- Multiple unrelated assertions
- Coupling to implementation details
- Unclear test names
- Flaky tests passing/failing inconsistently
</quality>

<mutation_testing>
Verify test quality with mutation testing.

TypeScript:
```bash
# Install Stryker
bun add -d @stryker-mutator/core @stryker-mutator/typescript-checker

# Run mutation testing
bun x stryker run
```

Configuration (`stryker.conf.json`):
```json
{
  "mutate": ["src/**/*.ts", "!src/**/*.test.ts"],
  "testRunner": "bun",
  "coverageAnalysis": "perTest",
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  }
}
```

Rust:
```bash
# Install cargo-mutants
cargo install cargo-mutants

# Run mutation testing
cargo mutants
```

Mutation testing identifies:
- Weak assertions not verifying behavior
- Missing edge case tests
- Dead code not actually used
</mutation_testing>

<common_patterns>
Async operations:

TypeScript:
```typescript
test('handles async errors gracefully', async () => {
  const promise = fetchUserData('invalid-id')
  await expect(promise).rejects.toThrow(UserNotFoundError)
})
```

Rust:
```rust
#[tokio::test]
async fn handles_async_errors() {
    let result = fetch_user_data("invalid-id").await;
    assert!(matches!(result, Err(UserError::NotFound)));
}
```

Mocking dependencies:

TypeScript:
```typescript
import { mock } from 'bun:test'

mock.module('./database', () => ({
  query: mock(() => Promise.resolve({ rows: [] })),
}))

test('handles empty database', async () => {
  const users = await findAllUsers()
  expect(users).toEqual([])
})
```

Rust:
```rust
#[cfg(test)]
mod tests {
    use mockall::mock;

    mock! {
        Database {}
        impl Database {
            fn query(&self, sql: &str) -> Result<Vec<Row>, DbError>;
        }
    }

    #[test]
    fn handles_empty_database() {
        let mut mock_db = MockDatabase::new();
        mock_db.expect_query().returning(|_| Ok(vec![]));

        let users = find_all_users(&mock_db);
        assert_eq!(users.len(), 0);
    }
}
```

Error path testing:

TypeScript:
```typescript
describe('Error Handling', () => {
  test('throws specific error for invalid input', () => {
    expect(() => processData(null)).toThrow(ValidationError)
    expect(() => processData(null)).toThrow('Input cannot be null')
  })
})
```

Rust:
```rust
#[test]
fn returns_error_for_invalid_input() {
    let result = process_data(None);
    assert!(matches!(result, Err(ProcessError::ValidationError(_))));
}
```

Parameterized tests:

TypeScript:
```typescript
test.each([
  { input: 5, expected: 25 },
  { input: -3, expected: 9 },
  { input: 0, expected: 0 },
])('square($input) returns $expected', ({ input, expected }) => {
  expect(square(input)).toBe(expected)
})
```

Rust:
```rust
#[test]
fn test_square() {
    let cases = vec![(5, 25), (-3, 9), (0, 0)];

    for (input, expected) in cases {
        assert_eq!(square(input), expected);
    }
}
```
</common_patterns>

<bug_fixes>
TDD workflow for bug fixes:

1. Write failing test reproducing bug (Start "Red Phase" as `in_progress`)
2. Verify test fails for right reason
3. Fix bug with minimal code changes (Transition to "Green Phase")
4. Verify test passes and all other tests still pass
5. Refactor if needed (Transition to "Refactor Phase" if refactoring, otherwise skip to "Verify")
6. Commit: `fix: [bug description] with test coverage`
7. Final verification (Mark "Verify" as `completed` after confirming all tests pass)

Example:
```typescript
// 1. Write failing test
test('handles division by zero gracefully', () => {
  expect(divide(10, 0)).toMatchObject({
    type: 'error',
    code: 'DIVISION_BY_ZERO',
  })
})

// 2. Verify it fails (divide doesn't check for zero)
// 3. Fix implementation
function divide(a: number, b: number): Result {
  if (b === 0) {
    return { type: 'error', code: 'DIVISION_BY_ZERO' }
  }
  return { type: 'success', value: a / b }
}

// 4. Verify test passes
// 5. Refactor if needed
```
</bug_fixes>

<rules>
ALWAYS:
- Track progress with TodoWrite phases
- Write tests before implementation (RED first)
- Run tests after each phase to verify state
- Verify tests fail for right reason in RED phase
- Keep each cycle 5–15 minutes max
- Use descriptive test names forming sentences
- Test behavior, not implementation
- Each test → one reason to fail
- Include mutation testing for quality verification

NEVER:
- Skip directly to implementation without tests
- Change test behavior during refactoring
- Test implementation details or private methods
- Allow tests to depend on execution order
- Write flaky tests that pass/fail inconsistently
- Mark phase complete without running tests
- Write multiple unrelated assertions per test
</rules>

<quick_reference>
Commands:

```bash
# TypeScript/Bun
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test --coverage         # Coverage report
bun x stryker run          # Mutation testing
bun test --only            # Run only .only tests

# Rust
cargo test                 # Run all tests
cargo test --test NAME     # Run specific integration test
cargo tarpaulin           # Coverage report
cargo mutants             # Mutation testing
cargo test -- --nocapture # Show println! output
```
</quick_reference>

<references>
- [feature-implementation.md](examples/feature-implementation.md) — TDD session for new feature
- [bug-fix.md](examples/bug-fix.md) — TDD workflow for bug fix
- [test-patterns.md](references/test-patterns.md) — TypeScript and Rust test patterns
- [quality-metrics.md](references/quality-metrics.md) — coverage and mutation testing
- [FORMATTING.md](../../shared/rules/FORMATTING.md) — formatting conventions
</references>
