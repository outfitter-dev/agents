# Workflow: Verify Fix

Implement permanent fix with proper verification. Root cause must be confirmed before entering this stage.

<when_to_use>

- Root cause confirmed through hypothesis testing
- Ready to implement permanent fix
- Need to create regression test
- Preparing to merge fix

</when_to_use>

<prerequisites>

Before this workflow:
- Root cause identified with evidence
- Hypothesis tested and confirmed
- Fix approach validated

If root cause unclear, return to `workflows/test-hypothesis.md`.

</prerequisites>

<process>

## Step 1: Create Failing Test

Write test that reproduces the bug:

```typescript
import { describe, test, expect } from 'bun:test';

describe('AuthService', () => {
  test('handles empty API response without crashing', () => {
    // This test should FAIL before the fix
    const result = authService.processResponse({ users: [] });

    expect(result.ok).toBe(true);
    expect(result.value).toEqual([]);
  });
});
```

Verify the test:
1. Run before fix - must FAIL
2. Fail for the right reason (bug, not syntax)
3. Will pass after fix

```bash
bun test auth.test.ts
# Expected: FAIL
```

## Step 2: Implement Single Fix

Address ONLY the identified root cause:

```typescript
// Before (broken)
function processResponse(response: ApiResponse) {
  return response.users[0].name; // Crashes when empty
}

// After (fixed)
function processResponse(response: ApiResponse) {
  if (response.users.length === 0) {
    return { ok: true, value: [] };
  }
  return { ok: true, value: response.users.map(u => u.name) };
}
```

**Do NOT:**
- Add "improvements" unrelated to the bug
- Refactor surrounding code
- Add extra error handling "just in case"
- Change anything not required for the fix

## Step 3: Verify Fix

Run the tests:

```bash
# New test passes
bun test auth.test.ts
# Expected: PASS

# All existing tests still pass
bun test
# Expected: All PASS

# Manual reproduction no longer triggers bug
./reproduce-bug.sh
# Expected: Works correctly
```

Check for side effects:
- No new warnings
- No new errors
- Performance not degraded
- Other features unaffected

## Step 4: Document Root Cause

Add comment or update documentation:

```typescript
// Fix for issue #123: processResponse crashed on empty array
// Root cause: Missing length check before array access
// See: https://github.com/org/repo/issues/123
function processResponse(response: ApiResponse) {
```

Or in commit message:

```
fix: handle empty API response in processResponse

Root cause: Array access without length check caused crash
when API returned empty users array.

Closes #123
```

## Step 5: Consider Prevention

After fixing, ask:
- Could this happen elsewhere?
- Should we add a lint rule?
- Is there a pattern to apply?
- Should we update documentation?

```bash
# Check for similar patterns
rg "response\.[a-z]+\[0\]" --type ts
```

</process>

<completion_checklist>

Before claiming "fixed":

- [ ] Root cause identified with evidence
- [ ] Failing test case created
- [ ] Fix addresses root cause ONLY
- [ ] New test passes
- [ ] All existing tests pass
- [ ] Manual reproduction no longer triggers bug
- [ ] No new warnings/errors
- [ ] Root cause documented (comment or commit)
- [ ] Prevention measures considered
- [ ] Ready to commit/merge

</completion_checklist>

<anti_patterns>

Avoid:
- Skipping the failing test
- Fixing symptoms instead of root cause
- Adding unrelated "improvements"
- Marking complete before all tests pass
- Forgetting to document root cause

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Failing test exists and was verified to fail
- [ ] Fix implemented, test now passes
- [ ] All other tests still pass
- [ ] Manual verification successful
- [ ] Root cause documented
- [ ] Commit message explains the fix

</success_criteria>

<commit_template>

```
fix: {brief description}

Root cause: {what was actually wrong}
Fix: {what the change does}

Closes #{issue}
```

</commit_template>
