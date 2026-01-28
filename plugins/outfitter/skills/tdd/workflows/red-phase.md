# Workflow: RED Phase

Write tests defining desired behavior before implementation exists.

<when_to_use>

- Starting new feature with TDD
- Beginning a bug fix (reproduce with test)
- Adding coverage to untested code
- Defining API contract

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/test-patterns.md - mocking, builders, async patterns

</required_reading>

<process>

## Step 1: Define Test Scope

- 3-5 related tests fully specifying one feature
- Type system makes invalid states unrepresentable
- Each test = one specific behavior
- Descriptive names forming sentences

Good test names:
- `authenticates with valid credentials`
- `rejects expired tokens`
- `handles network timeout gracefully`

Bad test names:
- `test1`
- `auth test`
- `it works`

## Step 2: Write Tests (TypeScript)

```typescript
import { describe, test, expect } from 'bun:test';

describe('UserAuthentication', () => {
  test('authenticates with valid credentials', async () => {
    const result = await authenticate({
      email: 'user@example.com',
      password: 'SecurePass123!'
    });

    expect(result).toMatchObject({
      type: 'success',
      user: expect.objectContaining({ email: 'user@example.com' })
    });
  });

  test('rejects invalid credentials', async () => {
    const result = await authenticate({
      email: 'wrong@example.com',
      password: 'wrong'
    });

    expect(result).toMatchObject({
      type: 'error',
      code: 'INVALID_CREDENTIALS'
    });
  });

  test('handles missing password', async () => {
    const result = await authenticate({
      email: 'user@example.com',
      password: ''
    });

    expect(result).toMatchObject({
      type: 'error',
      code: 'MISSING_PASSWORD'
    });
  });

  test.todo('implements rate limiting after failed attempts');
});
```

## Step 3: Write Tests (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn authenticates_with_valid_credentials() {
        let creds = Credentials {
            email: "user@example.com".into(),
            password: "SecurePass123!".into()
        };

        let result = authenticate(&creds);

        assert!(matches!(result, Ok(AuthResult::Success { .. })));
    }

    #[test]
    fn rejects_invalid_credentials() {
        let creds = Credentials {
            email: "wrong@example.com".into(),
            password: "wrong".into()
        };

        let result = authenticate(&creds);

        assert!(matches!(result, Err(AuthError::InvalidCredentials)));
    }

    #[test]
    fn handles_missing_password() {
        let creds = Credentials {
            email: "user@example.com".into(),
            password: "".into()
        };

        let result = authenticate(&creds);

        assert!(matches!(result, Err(AuthError::MissingPassword)));
    }
}
```

## Step 4: Run and Verify Failure

```bash
# TypeScript/Bun
bun test auth.test.ts

# Rust
cargo test authenticate
```

**Critical**: Verify tests fail for the RIGHT reason:
- Missing implementation ✓
- Syntax error ✗
- Wrong assertion ✗

If test passes before implementation, the test is wrong.

## Step 5: Commit

```bash
git add -A
git commit -m "test: add failing tests for user authentication"
```

</process>

<test_characteristics>

Good tests have:
- Single clear assertion per test
- No execution order dependencies
- Descriptive names forming sentences
- Focus on behavior, not implementation
- Proper setup/teardown

</test_characteristics>

<anti_patterns>

Avoid:
- Writing implementation before tests
- Testing implementation details
- Vague test names like "test1"
- Multiple unrelated assertions per test
- Tests that pass before implementation
- Coupling to internal state

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] 3-5 tests written for the feature
- [ ] Tests run and fail for the right reason
- [ ] Test names form readable sentences
- [ ] Each test has single clear assertion
- [ ] Committed: `test: add failing tests for [feature]`
- [ ] Ready to transition to GREEN phase

</success_criteria>

<next_steps>

- Tests written and failing: Load `workflows/green-phase.md`
- Task done: Mark "Red" `completed`, create "Green" `in_progress`

</next_steps>
