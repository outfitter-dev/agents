# Runtime Error Debugging Session

This example demonstrates systematic debugging of a runtime error using the four-stage framework.

## The Bug

User reports: "Application crashes when processing certain user profiles with `TypeError: Cannot read property 'email' of undefined`"

## Stage 1: Collect Evidence

**Task state**: "Collecting evidence" (in_progress)

### Read Error Message

```
TypeError: Cannot read property 'email' of undefined
    at formatUserDisplay (src/users/formatter.ts:42:23)
    at UserProfile (src/components/UserProfile.tsx:18:15)
    at processProfiles (src/services/profileService.ts:67:8)
```

Stack trace points to line 42 in formatter.ts accessing `.email` on undefined value.

### Reproduce Consistently

Steps to reproduce:
1. Load user profile page
2. Navigate to profile ID: `user-incomplete-123`
3. Error occurs consistently for this user
4. Works fine for other users (e.g., `user-complete-456`)

### Check Recent Changes

```bash
git log --since="2 days ago" --oneline src/users/formatter.ts
# No recent changes to formatter.ts

git log --since="2 days ago" --oneline src/services/
# 3d7a921 Optimize profile fetch to reduce API calls
```

Recent commit optimized profile fetching. Potential cause.

### Gather Evidence

Added logging to formatter.ts:

```typescript
export function formatUserDisplay(user: User): string {
  console.log('[DEBUG] formatUserDisplay input:', JSON.stringify(user));

  // Line 42 - where error occurs
  const email = user.email.toLowerCase();
  // ...
}
```

Output:

```
[DEBUG] formatUserDisplay input: {"id":"user-incomplete-123","name":"Test User"}
TypeError: Cannot read property 'email' of undefined
```

**Key finding**: User object missing `email` field entirely.

### Trace Data Flow Backward

Where does user object come from?

```typescript
// profileService.ts:67
const display = formatUserDisplay(profile.user);
```

Check profile.user:

```typescript
console.log('[DEBUG] profile object:', JSON.stringify(profile));
// Output: {"id":"prof-123","user":{"id":"user-incomplete-123","name":"Test User"}}
```

User object from API is missing email field.

**Transition**: Evidence gathered, reproduction confirmed. Mark "Collect Evidence" complete, add "Isolate Variables" as in_progress.

## Stage 2: Isolate Variables

**Task state**: "Isolating variables" (in_progress)

### Find Working Examples

Check working user profile:

```typescript
// user-complete-456 returns:
{"id":"user-complete-456","name":"Complete User","email":"user@example.com"}

// user-incomplete-123 returns:
{"id":"user-incomplete-123","name":"Test User"}
```

Difference: Some users don't have email field in API response.

### Read Reference Implementation

Found similar code that handles missing fields:

```typescript
// src/auth/userValidator.ts
export function validateUser(user: Partial<User>): User {
  if (!user.email) {
    throw new Error('User must have email');
  }
  return user as User;
}
```

This validates email exists before using it.

### Identify Differences

Working code:
- Validates email exists before access
- Handles Partial<User> type
- Throws clear error if missing

Broken code:
- Assumes email always exists
- Direct property access
- No validation

### Understand Dependencies

Recent optimization commit changed from:

```typescript
// Old: Fetched full user details
const user = await fetchFullUser(userId);
```

To:

```typescript
// New: Uses cached profile data
const user = profile.user; // May be incomplete
```

**Root cause hypothesis forming**: Optimization changed data source from full user fetch to cached profile, which may have incomplete user data.

**Transition**: Key differences identified. Mark "Isolate Variables" complete, add "Formulate Hypotheses" as in_progress.

## Stage 3: Formulate Hypotheses & Test

**Task state**: "Formulating hypotheses" (in_progress)

### Form Hypothesis

**Hypothesis**: "The function fails because the optimization commit (3d7a921) changed from fetching full user objects to using cached profile data, which doesn't include email for users who haven't completed onboarding. The formatter assumes email always exists, causing undefined access."

Evidence supporting hypothesis:
- Error only occurs for specific users (incomplete profiles)
- Started after optimization commit
- Working users have email, broken users don't
- API response shows missing email field

**Transition**: Hypothesis formed. Mark "Formulate Hypotheses" complete, add "Test Hypothesis" as in_progress.

**Task state**: "Testing hypothesis" (in_progress)

### Design Minimal Test

Temporarily revert optimization to test hypothesis:

```typescript
// Change profile.user back to full fetch
const user = await fetchFullUser(profile.userId);
const display = formatUserDisplay(user);
```

### Execute Test

Run with reverted code:
- Error no longer occurs
- All users display correctly (including user-incomplete-123)
- Full fetch includes all required fields

**Result**: Hypothesis confirmed. The optimization exposed assumption that all user objects have email.

**Transition**: Hypothesis confirmed, ready to implement fix. Mark "Test Hypothesis" complete, add "Verify Fix" as in_progress.

## Stage 4: Verify Fix

**Task state**: "Verifying fix" (in_progress)

### Create Failing Test

```typescript
describe('formatUserDisplay', () => {
  it('handles users without email gracefully', () => {
    const incompleteUser = {
      id: 'user-123',
      name: 'Test User',
      // email intentionally missing
    };

    // This currently throws, should handle gracefully
    expect(() => formatUserDisplay(incompleteUser)).toThrow(
      'User email is required'
    );
  });
});
```

Test fails as expected (throws TypeError instead of clear error).

### Implement Fix

Two options identified:
1. Fetch full user data (removes optimization)
2. Handle missing email in formatter (preserves optimization)

Choose option 2 to preserve optimization and add defensive validation:

```typescript
export function formatUserDisplay(user: User): string {
  // Input validation
  if (!user.email || typeof user.email !== 'string') {
    throw new Error(`User email is required for display. User ID: ${user.id}`);
  }

  const email = user.email.toLowerCase();
  const name = user.name || 'Unknown';

  return `${name} <${email}>`;
}
```

### Verify Fix Works

Run tests:
- Failing test now passes (throws clear error message)
- All existing tests pass
- Manual reproduction: Clear error message instead of crash
- Profile service can catch error and handle incomplete users

### Document Fix

```typescript
/**
 * Formats user information for display.
 *
 * Bug fix (2024-12-12): Added email validation.
 * Root cause: Profile optimization (3d7a921) changed data source
 * from full user fetch to cached profile data. Some users haven't
 * completed onboarding and lack email field.
 * Prevention: Always validate required fields before access.
 *
 * @throws {Error} If user.email is missing or invalid
 */
export function formatUserDisplay(user: User): string {
  // ...
}
```

### Additional Defense

Update profile service to handle incomplete users:

```typescript
// src/services/profileService.ts
try {
  const display = formatUserDisplay(profile.user);
  return { ...profile, display };
} catch (error) {
  // User hasn't completed onboarding, fetch full details
  const fullUser = await fetchFullUser(profile.userId);
  const display = formatUserDisplay(fullUser);
  return { ...profile, display };
}
```

**Transition**: Fix verified and deployed. Mark "Verify Fix" complete.

**Task state**: All tasks completed.

## Summary

**What broke**: TypeError when accessing email property on undefined

**Root cause**: Optimization changed data source from full user fetch to cached profile data. Cached data incomplete for users who haven't finished onboarding.

**The fix**:
1. Added input validation in formatter
2. Profile service falls back to full fetch for incomplete users
3. Clear error messages guide developers

**Prevention**:
- Always validate required fields before access
- Consider data completeness when optimizing data fetching
- Add tests for incomplete/partial data scenarios

## Lessons

- Error message stack trace led directly to problem location
- Recent changes (git log) identified likely cause
- Comparing working vs broken cases revealed pattern
- Single hypothesis tested with minimal change
- Fix addresses root cause while preserving optimization
- Defensive validation at multiple layers prevents recurrence
