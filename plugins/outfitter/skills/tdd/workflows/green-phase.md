# Workflow: GREEN Phase

Implement minimum code to make tests pass. Focus on correctness, not elegance.

<when_to_use>

- Tests written and failing
- Ready to implement feature
- After RED phase completion

</when_to_use>

<process>

## Step 1: Review Failing Tests

Read each test to understand what's expected:
- What inputs are provided?
- What outputs are expected?
- What edge cases are tested?

```bash
# See current failures
bun test --verbose
```

## Step 2: Implement Minimal Code (TypeScript)

Write the simplest code that makes tests pass:

```typescript
type AuthResult =
  | { type: 'success'; user: User }
  | { type: 'error'; code: string };

async function authenticate(creds: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  // Handle edge case first
  if (!creds.password) {
    return { type: 'error', code: 'MISSING_PASSWORD' };
  }

  // Find user
  const user = await findUserByEmail(creds.email);
  if (!user) {
    return { type: 'error', code: 'INVALID_CREDENTIALS' };
  }

  // Verify password
  const match = await comparePassword(creds.password, user.passwordHash);
  if (!match) {
    return { type: 'error', code: 'INVALID_CREDENTIALS' };
  }

  return { type: 'success', user };
}
```

## Step 3: Implement Minimal Code (Rust)

```rust
pub fn authenticate(creds: &Credentials) -> Result<AuthResult, AuthError> {
    // Handle edge case first
    if creds.password.is_empty() {
        return Err(AuthError::MissingPassword);
    }

    // Find user
    let user = find_user_by_email(&creds.email)
        .ok_or(AuthError::InvalidCredentials)?;

    // Verify password
    if !compare_password(&creds.password, &user.password_hash) {
        return Err(AuthError::InvalidCredentials);
    }

    Ok(AuthResult::Success { user })
}
```

## Step 4: Run Tests Frequently

```bash
# TypeScript/Bun
bun test --watch  # Continuous feedback

# Rust
cargo test        # After each change
```

Run after every small change. Don't write too much code before testing.

## Step 5: Verify All Pass

```bash
# All tests should pass
bun test
# Expected: ✓ All tests pass

# No regressions
bun test --coverage
```

## Step 6: Commit

```bash
git add -A
git commit -m "feat: implement user authentication"
```

</process>

<guidelines>

**Do:**
- Focus on passing tests, not perfect code
- Explicit types where aids clarity
- Straightforward solutions first
- Hardcode if it passes the test (refactor generalizes)
- Run tests frequently

**Don't:**
- Optimize prematurely
- Add features not covered by tests
- Refactor during GREEN (that's next phase)
- Gold-plate the implementation

</guidelines>

<when_stuck>

If tests won't pass:

1. Re-read the test - is your understanding correct?
2. Add debug logging
3. Check one test at a time
4. Simplify - can you hardcode to pass?

If hardcoding works, you understand the requirement. Now generalize.

</when_stuck>

<anti_patterns>

Avoid:
- Over-engineering before tests pass
- Adding untested features
- Refactoring during GREEN
- Ignoring failing tests
- Writing "clean" code that doesn't pass

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] All tests pass
- [ ] No regressions in existing tests
- [ ] Implementation is minimal and straightforward
- [ ] Committed: `feat: implement [feature]`
- [ ] Ready to transition to REFACTOR phase

</success_criteria>

<next_steps>

- All tests pass: Load `workflows/refactor-phase.md`
- Task done: Mark "Green" `completed`, create "Refactor" `in_progress`

</next_steps>
