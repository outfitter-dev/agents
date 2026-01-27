# Debugging Integration

Connect debugging to broader development workflow.

## Test-Driven Debugging

Debugging follows TDD pattern:

1. Write test that reproduces bug (RED - fails)
2. Fix the bug (GREEN - passes)
3. Confirm fix works and prevents regression

The failing test becomes regression protection.

## Defensive Programming After Fix

Add validation at multiple layers:

```typescript
function processUser(userId: string): User {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be non-empty string');
  }

  // Fetch with error handling
  const user = await fetchUser(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Output validation
  if (!user.email || !user.name) {
    throw new Error('Invalid user data: missing required fields');
  }

  return user;
}
```

Key layers:
- Input validation (reject bad data early)
- Operation error handling (catch failures)
- Output validation (ensure correct results)
- Invariant assertions (verify assumptions)

## Post-Fix Documentation

After fixing, document:

1. **What broke**: Symptom description
2. **Root cause**: Why it happened
3. **The fix**: What changed
4. **Prevention**: How to avoid in future

Example:

```typescript
/**
 * Processes user data from API.
 *
 * Bug fix (2024-01-15): Added validation for missing email field.
 * Root cause: API sometimes returns partial user objects when
 * user hasn't completed onboarding.
 * Prevention: Always validate required fields before processing.
 */
```

## Anti-Patterns

Common debugging mistakes to avoid:

**Random Walk** - trying different things hoping one works
- Why it fails: Wastes time, may mask real issue
- Instead: Follow stages 1-2 to understand system

**Quick Fix** - stopping symptom without finding root cause
- Why it fails: Bug will resurface or manifest differently
- Instead: Use stage 1 to find root cause before fixing

**Cargo Cult** - copying code without understanding why
- Why it fails: May not apply to your context
- Instead: Use stage 2 to understand working examples

**Shotgun Approach** - changing multiple things simultaneously
- Why it fails: Can't tell which change fixed it
- Instead: Test one hypothesis at a time

## Escalation Triggers

When to ask for help:

1. After 3 failed fix attempts - architecture may be wrong
2. No clear reproduction - need more context/access
3. External system issues - need vendor/team involvement
4. Security implications - need security expertise
5. Data corruption risks - need backup/recovery planning
