---
name: test-driven-development
version: 1.1.0
description: Guides test-driven development methodology using Red-Green-Refactor cycles with modern TypeScript/Bun and Rust tooling. Use when implementing features with TDD, writing tests first, refactoring with test coverage, or when TDD, test-first, red-green-refactor, testing methodology, or --tdd flag are mentioned. Covers test quality standards, mutation testing, and both TypeScript and Rust workflows.
---

# Test-Driven Development

Applies disciplined test-driven development methodology to write tests first, implement minimal code to pass, and refactor systematically while leveraging modern TypeScript/Bun and Rust capabilities.

## Core Philosophy

Test-driven development with strategic flexibility:

- **Red-Green-Refactor** as the primary workflow
- **Test quality over quantity** - focus on behavior, not implementation
- **Incremental progress** - small, focused cycles that build toward the solution
- **Type safety throughout** - tests should be as type-safe as production code
- **Fast feedback loops** - leverage modern tooling for instant validation

## Progress Tracking

Use TodoWrite to show TDD cycle progression. Create todos at session start, update as you advance through phases.

**Core Phases:**

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Red Phase** | Session start | "Writing failing test" |
| **Green Phase** | Test written and failing | "Implementing code" |
| **Refactor Phase** | Tests passing | "Refactoring code" |
| **Verify** | Refactor complete | "Verifying implementation" |

**Workflow:**
- On session start: Create "Red Phase" as `in_progress`
- On phase transition: Mark current phase `completed`, add next phase as `in_progress`
- After each phase completes, run tests before advancing
- Multiple RED-GREEN-REFACTOR cycles: Return to "Red Phase" for next feature

**Edge Cases:**
- **High quality start**: If existing tests are comprehensive, start at "Refactor Phase" after confirming tests pass
- **Bug fix**: Start at "Red Phase" with failing test that reproduces bug
- **No regression**: Tests must continue passing through Refactor and Verify phases

## The TDD Cycle

### Overview

```
RED → GREEN → REFACTOR → RED → ...
 ↓      ↓         ↓
Test  Impl    Improve
Fails Passes  Quality
```

Each cycle should be 5-15 minutes. Longer cycles indicate the step is too large.

### Detailed Workflow

#### 1. Test Assessment Phase (First iteration only)

Before writing new tests:

```bash
# TypeScript/Bun
bun test --coverage

# Rust
cargo test
cargo tarpaulin --out Html  # or cargo-llvm-cov
```

**Analyze**:
- Run existing test suite with coverage
- Identify gaps in test coverage and test quality
- Check for test smells: overly complex setup, brittle assertions, testing internals
- Review test organization and naming conventions
- Note any tests that should be improved or refactored

**Common Test Smells**:
- Setup longer than test itself
- Multiple unrelated assertions in one test
- Tests coupled to implementation details (testing private methods)
- Unclear test names that don't describe behavior
- Tests that depend on execution order
- Flaky tests that pass/fail inconsistently

#### 2. RED Phase (Write Failing Tests)

Write tests that define the desired behavior before any implementation exists.

**Phase Start**: Create "Red Phase" as `in_progress` (if starting session)

**Guidelines**:
- Write 3-5 related tests that fully specify one feature
- Use type system to make invalid test states unrepresentable
- Each test should test one specific behavior
- Run tests to verify they fail for the right reason
- Use descriptive test names that form sentences

**TypeScript Example**:

```typescript
import { describe, test, expect } from 'bun:test'

describe('UserAuthentication', () => {
  // Use const assertions for test data
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

  test('rejects missing password', async () => {
    const result = await authenticate({
      email: 'user@example.com',
      password: '',
    })
    expect(result).toMatchObject({
      type: 'error',
      code: 'MISSING_PASSWORD',
    })
  })

  test.todo('implements rate limiting after failed attempts')
})
```

**Rust Example**:

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
        assert!(matches!(
            result,
            Err(AuthError::InvalidCredentials)
        ));
    }

    #[test]
    fn rejects_empty_password() {
        let credentials = Credentials {
            email: "user@example.com".to_string(),
            password: "".to_string(),
        };

        let result = authenticate(&credentials);
        assert!(matches!(
            result,
            Err(AuthError::MissingPassword)
        ));
    }
}
```

**Commit**: `test: add failing tests for [feature]`

**Phase Transition**: Mark "Red Phase" as `completed`, create "Green Phase" as `in_progress`

#### 3. GREEN Phase (Make Tests Pass)

Implement the minimum code needed to make tests pass.

**Guidelines**:
- Focus on making tests pass, not perfect code
- Use explicit types rather than inference where it aids clarity
- Implement straightforward solutions first (optimize later in refactor)
- Hardcode values if that makes the test pass (refactor will generalize)
- Run tests frequently to verify progress

**TypeScript Example**:

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

**Rust Example**:

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

**Verify**:
```bash
# TypeScript
bun test

# Rust
cargo test
```

**Commit**: `feat: implement [feature] to pass tests`

**Phase Transition**: Mark "Green Phase" as `completed`, create "Refactor Phase" as `in_progress`

#### 4. REFACTOR Phase (Improve Design)

Enhance code quality without changing behavior. Tests must continue to pass.

**Guidelines**:
- Extract common patterns into well-named functions
- Apply SOLID principles where appropriate
- Improve type definitions using discriminated unions, branded types
- Ensure no test behavior changes
- Run tests after each refactoring step
- Consider mutation testing to verify test quality

**TypeScript Refactoring Example**:

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

// Extract password comparison
async function verifyPassword(
  password: string,
  hash: PasswordHash
): Promise<boolean> {
  return await comparePassword(password, hash)
}

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

**Rust Refactoring Example**:

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

#[derive(Debug, Clone)]
pub struct PasswordHash(String);

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

**Verify Refactoring**:
```bash
# TypeScript - run tests and check mutation score
bun test
bun x stryker run

# Rust - run tests and check coverage
cargo test
cargo tarpaulin
```

**Commit**: `refactor: [improvement description]`

**Phase Transition**: Mark "Refactor Phase" as `completed`, create "Verify" as `in_progress`

**Final Verification**: Run full test suite with coverage and mutation testing to confirm quality. Mark "Verify" as `completed` when all checks pass.

## Test Quality Standards

### Modern TypeScript Patterns

**Discriminated Unions for Test Scenarios**:
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

**Type-Safe Test Builders**:
```typescript
class TestUserBuilder {
  private user: Partial<User> = {}

  withEmail(email: string): this {
    this.user.email = email
    return this
  }

  withRole(role: UserRole): this {
    this.user.role = role
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

// Usage
const adminUser = new TestUserBuilder()
  .withEmail('admin@example.com')
  .withRole('admin')
  .build()
```

**Const Assertions for Test Data**:
```typescript
const testCases = [
  { input: 'hello', expected: 'HELLO' },
  { input: 'world', expected: 'WORLD' },
  { input: '', expected: '' },
] as const

test.each(testCases)('transforms $input to $expected', ({ input, expected }) => {
  expect(transform(input)).toBe(expected)
})
```

### Leveraging Bun's Speed

**Focused Tests During Development**:
```typescript
// Run only this test during active development
test.only('current feature under development', () => {
  // Fast feedback on current work
})

// Skip slow integration tests during TDD cycles
test.skip('slow integration test', () => {
  // Run in CI but not during TDD
})
```

**Watch Mode for Instant Feedback**:
```bash
# Terminal: Auto-run tests on file changes
bun test --watch

# Run specific test file
bun test --watch user.service.test.ts
```

**Parallel Test Execution**:
```typescript
describe.concurrent('Independent Operations', () => {
  test('operation 1', async () => {
    // Runs in parallel
  })

  test('operation 2', async () => {
    // Runs in parallel
  })
})
```

### Rust Test Quality Patterns

**Property-Based Testing**:
```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn password_hash_is_deterministic(password in "[a-zA-Z0-9]{8,32}") {
        let hash1 = hash_password(&password);
        let hash2 = hash_password(&password);
        prop_assert_eq!(hash1, hash2);
    }

    #[test]
    fn email_validation_handles_all_ascii(email in "[a-z]+@[a-z]+\\.[a-z]+") {
        let result = validate_email(&email);
        prop_assert!(result.is_ok() || result.is_err());
    }
}
```

**Async Testing**:
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

#[tokio::test]
#[should_panic(expected = "timeout")]
async fn times_out_slow_operations() {
    tokio::time::timeout(
        Duration::from_millis(100),
        very_slow_operation()
    ).await.expect("timeout");
}
```

**Documentation as Tests**:
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

## Test Organization

Follow project conventions, defaulting to:

**TypeScript/Bun**:
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

**Rust**:
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

## Quality Metrics

Maintain these standards:

- **Line Coverage**: ≥80% (90% for critical paths)
- **Mutation Score**: ≥75% (via Stryker for TypeScript)
- **Test Execution Time**: <5 seconds for unit tests
- **Test Clarity**: Each test has a single clear assertion
- **Test Independence**: Tests don't depend on execution order

## Common Patterns

### Testing Async Operations

**TypeScript**:
```typescript
test('handles async errors gracefully', async () => {
  const promise = fetchUserData('invalid-id')
  await expect(promise).rejects.toThrow(UserNotFoundError)
})

test('resolves with data on success', async () => {
  const result = await fetchUserData('valid-id')
  expect(result).toMatchObject({ id: 'valid-id' })
})
```

**Rust**:
```rust
#[tokio::test]
async fn handles_async_errors() {
    let result = fetch_user_data("invalid-id").await;
    assert!(matches!(result, Err(UserError::NotFound)));
}

#[tokio::test]
async fn resolves_with_data() {
    let result = fetch_user_data("valid-id").await;
    assert!(result.is_ok());
    let user = result.unwrap();
    assert_eq!(user.id, "valid-id");
}
```

### Mocking External Dependencies

**TypeScript**:
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

**Rust**:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
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
        mock_db.expect_query()
            .returning(|_| Ok(vec![]));

        let users = find_all_users(&mock_db);
        assert_eq!(users.len(), 0);
    }
}
```

### Snapshot Testing

**TypeScript**:
```typescript
test('serializes user correctly', () => {
  const user = new TestUserBuilder()
    .withEmail('test@example.com')
    .withRole('admin')
    .build()

  expect(serialize(user)).toMatchSnapshot()
})
```

**Rust**:
```rust
#[test]
fn serializes_user_correctly() {
    let user = User {
        id: "test-id".to_string(),
        email: "test@example.com".to_string(),
        role: Role::Admin,
    };

    let serialized = serde_json::to_string_pretty(&user).unwrap();
    insta::assert_snapshot!(serialized);
}
```

## When to Apply TDD

### Strong TDD Cases

Apply strict TDD when:
- **Complex business logic**: Calculation engines, validation rules, state machines
- **Critical paths**: Authentication, payment processing, data integrity
- **Bug fixes**: Write failing test for bug, fix, verify test passes
- **API design**: Use tests to explore and define API before implementation
- **Refactoring**: Ensure behavior preservation during restructuring

### Flexible TDD Cases

Consider lighter testing when:
- **Exploratory coding**: Spike solutions, proof-of-concepts
- **UI/visual work**: Integration tests may be more valuable
- **Glue code**: Simple wiring between components
- **Configuration**: Static configuration files

Even in flexible cases, add tests before marking work complete.

## Mutation Testing

Verify test quality with mutation testing:

**TypeScript**:
```bash
# Install Stryker
bun add -d @stryker-mutator/core @stryker-mutator/typescript-checker

# Run mutation testing
bun x stryker run
```

**Configuration** (`stryker.conf.json`):
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

**Rust**:
```bash
# Install cargo-mutants
cargo install cargo-mutants

# Run mutation testing
cargo mutants
```

Mutation testing helps identify:
- Weak assertions (tests that don't actually verify behavior)
- Missing edge case tests
- Dead code that isn't actually used

## Advanced Patterns

### Test Data Builders

**TypeScript**:
```typescript
class TestDataBuilder<T> {
  constructor(private defaults: T) {}

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.defaults[key] = value
    return this
  }

  build(): T {
    return { ...this.defaults }
  }
}

// Usage
const userBuilder = new TestDataBuilder<User>({
  id: 'test-id',
  email: 'test@example.com',
  role: 'user',
})

const admin = userBuilder.with('role', 'admin').build()
```

**Rust**:
```rust
#[derive(Default)]
struct UserBuilder {
    id: Option<String>,
    email: Option<String>,
    role: Option<Role>,
}

impl UserBuilder {
    fn new() -> Self {
        Self::default()
    }

    fn with_email(mut self, email: impl Into<String>) -> Self {
        self.email = Some(email.into());
        self
    }

    fn with_role(mut self, role: Role) -> Self {
        self.role = Some(role);
        self
    }

    fn build(self) -> User {
        User {
            id: self.id.unwrap_or_else(|| "test-id".to_string()),
            email: self.email.unwrap_or_else(|| "test@example.com".to_string()),
            role: self.role.unwrap_or(Role::User),
        }
    }
}

// Usage
let admin = UserBuilder::new()
    .with_email("admin@example.com")
    .with_role(Role::Admin)
    .build();
```

### Testing Error Paths

**TypeScript**:
```typescript
describe('Error Handling', () => {
  test('throws specific error for invalid input', () => {
    expect(() => processData(null)).toThrow(ValidationError)
    expect(() => processData(null)).toThrow('Input cannot be null')
  })

  test('returns error result for async failures', async () => {
    const result = await processDataAsync(null)
    expect(result).toMatchObject({
      type: 'error',
      code: 'VALIDATION_ERROR',
    })
  })
})
```

**Rust**:
```rust
#[test]
fn returns_error_for_invalid_input() {
    let result = process_data(None);
    assert!(matches!(result, Err(ProcessError::ValidationError(_))));
}

#[test]
fn error_message_is_descriptive() {
    let result = process_data(None);
    assert_eq!(
        result.unwrap_err().to_string(),
        "Input cannot be null"
    );
}
```

### Parameterized Tests

**TypeScript**:
```typescript
test.each([
  { input: 5, expected: 25 },
  { input: -3, expected: 9 },
  { input: 0, expected: 0 },
])('square($input) returns $expected', ({ input, expected }) => {
  expect(square(input)).toBe(expected)
})
```

**Rust**:
```rust
#[test]
fn test_square() {
    let cases = vec![
        (5, 25),
        (-3, 9),
        (0, 0),
    ];

    for (input, expected) in cases {
        assert_eq!(square(input), expected);
    }
}
```

## TDD for Bug Fixes

When fixing bugs:

1. **Write failing test** that reproduces the bug (Start "Red Phase" as `in_progress`)
2. **Verify test fails** for the right reason
3. **Fix the bug** with minimal code changes (Transition to "Green Phase")
4. **Verify test passes** and all other tests still pass
5. **Refactor** if needed to improve code quality (Transition to "Refactor Phase" if refactoring, otherwise skip to "Verify")
6. **Commit**: `fix: [bug description] with test coverage`
7. **Final verification** (Mark "Verify" as `completed` after confirming all tests pass)

**Example**:
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

## Remember

- **Track progress with TodoWrite** - update phases as you move through RED-GREEN-REFACTOR cycles
- **Tests are documentation** - write them clearly for future readers
- **Test behavior, not implementation** - focus on what, not how
- **Each test should have one reason to fail** - single responsibility
- **Use descriptive test names** - they should form readable sentences
- **Refactoring includes improving test code** - tests are first-class code
- **When stuck, write a failing test** - clarifies thinking and requirements
- **Fast feedback is crucial** - optimize test execution time
- **Green doesn't mean good** - use mutation testing to verify test quality

## Quick Reference

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
