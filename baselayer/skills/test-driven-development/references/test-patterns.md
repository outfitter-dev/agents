# Test Patterns Reference

Comprehensive test patterns for TypeScript/Bun and Rust.

## TypeScript/Bun Patterns

### Basic Test Structure

```typescript
import { describe, test, expect } from 'bun:test'

describe('Module or Feature Name', () => {
  test('describes specific behavior', () => {
    // Arrange
    const input = createTestInput()

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toBe(expected)
  })
})
```

### Discriminated Unions for Test Scenarios

Use discriminated unions to make test scenarios type-safe:

```typescript
type TestScenario =
  | { type: 'success'; input: ValidInput; expected: Output }
  | { type: 'error'; input: InvalidInput; expectedError: ErrorCode }
  | { type: 'edge-case'; input: EdgeInput; expected: Output }

test.each<TestScenario>([
  {
    type: 'success',
    input: { value: 100 },
    expected: { result: 100 },
  },
  {
    type: 'error',
    input: { value: -1 },
    expectedError: 'NEGATIVE_VALUE',
  },
  {
    type: 'edge-case',
    input: { value: 0 },
    expected: { result: 0 },
  },
])('handles $type scenario', async (scenario) => {
  const result = await processValue(scenario.input)

  if (scenario.type === 'success' || scenario.type === 'edge-case') {
    expect(result).toEqual(scenario.expected)
  } else {
    expect(result.error).toBe(scenario.expectedError)
  }
})
```

### Type-Safe Test Builders

Create fluent builders for complex test data:

```typescript
class UserBuilder {
  private data: Partial<User> = {
    id: 'test-id',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date('2024-01-01'),
  }

  withId(id: string): this {
    this.data.id = id
    return this
  }

  withEmail(email: string): this {
    this.data.email = email
    return this
  }

  withRole(role: UserRole): this {
    this.data.role = role
    return this
  }

  asAdmin(): this {
    return this.withRole('admin')
  }

  build(): User {
    return this.data as User
  }
}

// Usage
const adminUser = new UserBuilder()
  .withEmail('admin@example.com')
  .asAdmin()
  .build()
```

Generic builder for flexibility:

```typescript
class Builder<T> {
  constructor(private defaults: T) {}

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.defaults = { ...this.defaults, [key]: value }
    return this
  }

  build(): T {
    return { ...this.defaults }
  }
}

// Usage
const userBuilder = new Builder<User>({
  id: 'test-id',
  email: 'test@example.com',
  role: 'user',
})

const admin = userBuilder.with('role', 'admin').build()
```

### Const Assertions for Test Data

Type-safe test data with const assertions:

```typescript
const validInputs = [
  { input: 'hello', expected: 'HELLO' },
  { input: 'world', expected: 'WORLD' },
  { input: '', expected: '' },
] as const

test.each(validInputs)(
  'transforms $input to $expected',
  ({ input, expected }) => {
    expect(transform(input)).toBe(expected)
  }
)
```

### Async Testing Patterns

Promise rejection:

```typescript
test('rejects with error for invalid input', async () => {
  const promise = fetchUser('invalid-id')

  await expect(promise).rejects.toThrow(UserNotFoundError)
  await expect(promise).rejects.toThrow('User not found')
})
```

Async/await with error handling:

```typescript
test('handles async errors gracefully', async () => {
  const result = await processData('invalid').catch(err => ({
    error: err.message,
  }))

  expect(result.error).toBe('Invalid data')
})
```

Timeout handling:

```typescript
test('times out slow operations', async () => {
  const promise = slowOperation()

  await expect(
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 100)
      ),
    ])
  ).rejects.toThrow('Timeout')
})
```

### Mocking with Bun

Module mocking:

```typescript
import { mock } from 'bun:test'

// Mock entire module
mock.module('./database', () => ({
  query: mock(() => Promise.resolve({ rows: [] })),
  connect: mock(() => Promise.resolve()),
}))

// Use in test
test('handles database errors', async () => {
  const { query } = await import('./database')

  query.mockImplementationOnce(() => Promise.reject(new Error('DB Error')))

  const result = await fetchUsers()
  expect(result.error).toBe('DB Error')
})
```

Function mocking:

```typescript
const mockFetch = mock(async (url: string) => ({
  ok: true,
  json: async () => ({ data: 'test' }),
}))

test('fetches data successfully', async () => {
  const result = await fetchData('https://api.example.com', mockFetch)

  expect(mockFetch).toHaveBeenCalledWith('https://api.example.com')
  expect(result.data).toBe('test')
})
```

### Snapshot Testing

Simple snapshots:

```typescript
test('serializes user correctly', () => {
  const user = new UserBuilder().build()

  expect(JSON.stringify(user, null, 2)).toMatchSnapshot()
})
```

Inline snapshots:

```typescript
test('formats error message', () => {
  const error = new ValidationError('Invalid email')

  expect(error.message).toMatchInlineSnapshot(`"Invalid email"`)
})
```

### Parameterized Tests

Basic parameterization:

```typescript
test.each([
  [1, 1],
  [2, 4],
  [3, 9],
  [4, 16],
])('square(%i) returns %i', (input, expected) => {
  expect(square(input)).toBe(expected)
})
```

Object-based parameterization:

```typescript
test.each([
  { input: 5, expected: 25, description: 'positive number' },
  { input: -3, expected: 9, description: 'negative number' },
  { input: 0, expected: 0, description: 'zero' },
])('square($input) for $description', ({ input, expected }) => {
  expect(square(input)).toBe(expected)
})
```

### Focused Testing

Run specific tests:

```typescript
// Only run this test
test.only('current feature under development', () => {
  // Fast feedback during active development
})

// Skip slow tests during TDD
test.skip('slow integration test', () => {
  // Run in CI but not during rapid TDD cycles
})

// Mark test as work in progress
test.todo('implement rate limiting')
```

### Parallel Test Execution

Run independent tests in parallel:

```typescript
describe.concurrent('Independent Operations', () => {
  test('operation 1', async () => {
    const result = await independentOp1()
    expect(result).toBeDefined()
  })

  test('operation 2', async () => {
    const result = await independentOp2()
    expect(result).toBeDefined()
  })

  test('operation 3', async () => {
    const result = await independentOp3()
    expect(result).toBeDefined()
  })
})
```

### Error Testing Patterns

Exception testing:

```typescript
test('throws error for invalid input', () => {
  expect(() => processData(null)).toThrow(ValidationError)
  expect(() => processData(null)).toThrow('Input cannot be null')
})
```

Error result testing:

```typescript
test('returns error result for invalid input', () => {
  const result = processData(null)

  expect(result.type).toBe('error')
  if (result.type === 'error') {
    expect(result.code).toBe('INVALID_INPUT')
    expect(result.message).toContain('null')
  }
})
```

## Rust Patterns

### Basic Test Structure

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_functionality() {
        // Arrange
        let input = setup_test_input();

        // Act
        let result = function_under_test(input);

        // Assert
        assert_eq!(result, expected);
    }
}
```

### Property-Based Testing

Using `proptest`:

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
    fn email_validation_never_panics(email in ".*") {
        let result = validate_email(&email);
        // Should always return Ok or Err, never panic
        prop_assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn parse_then_serialize_is_identity(value in 0..1000) {
        let serialized = serialize_value(value);
        let parsed = parse_value(&serialized).unwrap();
        prop_assert_eq!(value, parsed);
    }
}
```

### Test Builders

Rust builder pattern:

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

    fn with_id(mut self, id: impl Into<String>) -> Self {
        self.id = Some(id.into());
        self
    }

    fn with_email(mut self, email: impl Into<String>) -> Self {
        self.email = Some(email.into());
        self
    }

    fn with_role(mut self, role: Role) -> Self {
        self.role = Some(role);
        self
    }

    fn as_admin(self) -> Self {
        self.with_role(Role::Admin)
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
#[test]
fn test_admin_permissions() {
    let admin = UserBuilder::new()
        .with_email("admin@example.com")
        .as_admin()
        .build();

    assert!(has_admin_access(&admin));
}
```

### Async Testing

Using `tokio::test`:

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

### Result Testing

Testing `Result` types:

```rust
#[test]
fn returns_error_for_invalid_input() {
    let result = process_data(None);

    assert!(result.is_err());
    assert!(matches!(result, Err(ProcessError::InvalidInput)));
}

#[test]
fn returns_success_for_valid_input() {
    let result = process_data(Some("valid"));

    assert!(result.is_ok());
    let value = result.unwrap();
    assert_eq!(value, "processed");
}
```

Using `assert_matches!` macro:

```rust
#[test]
fn authenticates_with_valid_credentials() {
    let result = authenticate(&valid_creds);

    assert!(matches!(result, Ok(AuthResult::Success { .. })));
}

#[test]
fn rejects_invalid_credentials() {
    let result = authenticate(&invalid_creds);

    assert!(matches!(result, Err(AuthError::InvalidCredentials)));
}
```

### Documentation Tests

Executable documentation:

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
///
/// let result = authenticate(&creds);
/// assert!(result.is_ok());
/// ```
///
/// # Errors
///
/// Returns `AuthError::InvalidCredentials` if credentials are invalid:
///
/// ```
/// use auth::{authenticate, Credentials, AuthError};
///
/// let bad_creds = Credentials {
///     email: "wrong@example.com".to_string(),
///     password: "wrong".to_string(),
/// };
///
/// let result = authenticate(&bad_creds);
/// assert!(matches!(result, Err(AuthError::InvalidCredentials)));
/// ```
pub fn authenticate(credentials: &Credentials) -> Result<AuthResult, AuthError> {
    // Implementation
}
```

### Snapshot Testing

Using `insta`:

```rust
use insta::assert_snapshot;

#[test]
fn serializes_user_correctly() {
    let user = User {
        id: "test-id".to_string(),
        email: "test@example.com".to_string(),
        role: Role::Admin,
    };

    let serialized = serde_json::to_string_pretty(&user).unwrap();
    assert_snapshot!(serialized);
}
```

### Parameterized Tests

Manual parameterization:

```rust
#[test]
fn test_square() {
    let test_cases = vec![
        (5, 25),
        (-3, 9),
        (0, 0),
        (10, 100),
    ];

    for (input, expected) in test_cases {
        assert_eq!(square(input), expected, "Failed for input {}", input);
    }
}
```

Using `rstest`:

```rust
use rstest::rstest;

#[rstest]
#[case(5, 25)]
#[case(-3, 9)]
#[case(0, 0)]
#[case(10, 100)]
fn test_square(#[case] input: i32, #[case] expected: i32) {
    assert_eq!(square(input), expected);
}
```

### Mock Objects

Using `mockall`:

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
            fn execute(&self, sql: &str) -> Result<u64, DbError>;
        }
    }

    #[test]
    fn handles_empty_database() {
        let mut mock_db = MockDatabase::new();
        mock_db
            .expect_query()
            .with(eq("SELECT * FROM users"))
            .returning(|_| Ok(vec![]));

        let users = find_all_users(&mock_db);
        assert_eq!(users.len(), 0);
    }

    #[test]
    fn handles_database_error() {
        let mut mock_db = MockDatabase::new();
        mock_db
            .expect_query()
            .returning(|_| Err(DbError::ConnectionLost));

        let result = find_all_users(&mock_db);
        assert!(result.is_err());
    }
}
```

### Error Testing

Custom error types:

```rust
#[test]
fn returns_custom_error() {
    let result = process_value(-1);

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert_eq!(err.to_string(), "Value cannot be negative");
}

#[test]
fn error_contains_context() {
    let result = parse_config("invalid");

    match result {
        Err(ConfigError::ParseError { line, message }) => {
            assert_eq!(line, 1);
            assert!(message.contains("invalid"));
        }
        _ => panic!("Expected ParseError"),
    }
}
```

### Integration Test Structure

Separate integration tests in `tests/` directory:

```rust
// tests/integration/user_api.rs
use my_crate::*;

#[tokio::test]
async fn test_user_registration_flow() {
    // Setup test database
    let db = setup_test_db().await;

    // Create user
    let user = register_user(&db, "test@example.com", "password").await.unwrap();

    // Verify user created
    let found = find_user(&db, user.id).await.unwrap();
    assert_eq!(found.email, "test@example.com");

    // Cleanup
    cleanup_test_db(db).await;
}
```

## Common Test Smells and Solutions

### Test Smell: Setup Longer Than Test

❌ Bad:

```typescript
test('processes order', () => {
  const user = { id: '1', email: 'test@example.com', role: 'user', /* 10 more fields */ }
  const product = { id: 'p1', name: 'Widget', price: 100, /* 8 more fields */ }
  const cart = { items: [{ product, quantity: 2 }], /* 5 more fields */ }
  const payment = { method: 'card', /* 6 more fields */ }

  const result = processOrder(user, cart, payment)
  expect(result.total).toBe(200)
})
```

✓ Good:

```typescript
test('processes order', () => {
  const order = new OrderBuilder().withQuantity(2).withPrice(100).build()

  const result = processOrder(order)
  expect(result.total).toBe(200)
})
```

### Test Smell: Multiple Unrelated Assertions

❌ Bad:

```typescript
test('user management', () => {
  expect(createUser('test@example.com')).toBeDefined()
  expect(findUser('1')).toEqual({ id: '1' })
  expect(deleteUser('1')).toBe(true)
})
```

✓ Good:

```typescript
test('creates user with valid email', () => {
  expect(createUser('test@example.com')).toBeDefined()
})

test('finds user by id', () => {
  expect(findUser('1')).toEqual({ id: '1' })
})

test('deletes user successfully', () => {
  expect(deleteUser('1')).toBe(true)
})
```

### Test Smell: Testing Implementation Details

❌ Bad:

```typescript
test('caches results internally', () => {
  const service = new UserService()
  service.fetchUser('1')

  expect(service._cache.has('1')).toBe(true) // Testing private implementation
})
```

✓ Good:

```typescript
test('returns cached user on second fetch', async () => {
  const service = new UserService()
  const spy = mock.fn()

  await service.fetchUser('1', spy)
  await service.fetchUser('1', spy)

  expect(spy).toHaveBeenCalledTimes(1) // Testing observable behavior
})
```
