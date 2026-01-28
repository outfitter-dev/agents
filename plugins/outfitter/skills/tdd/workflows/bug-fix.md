# Workflow: Bug Fix with TDD

Fix bugs using TDD methodology: reproduce with test first, then fix.

<when_to_use>

- Bug reported that needs fixing
- Regression discovered
- Edge case found in production
- Test coverage gap identified

</when_to_use>

<process>

## Step 1: Reproduce Bug

Before writing any code, understand and reproduce:

1. What are the exact reproduction steps?
2. What input triggers the bug?
3. What's the expected vs actual behavior?
4. Can you trigger it consistently?

## Step 2: Write Failing Test (RED)

Write a test that captures the bug:

```typescript
import { describe, test, expect } from 'bun:test';

describe('Calculator', () => {
  test('handles division by zero gracefully', () => {
    // This test reproduces the bug
    const result = divide(10, 0);

    // Expected behavior (not current broken behavior)
    expect(result).toMatchObject({
      type: 'error',
      code: 'DIVISION_BY_ZERO'
    });
  });
});
```

```rust
#[test]
fn handles_division_by_zero() {
    let result = divide(10, 0);

    assert!(matches!(result, Err(CalcError::DivisionByZero)));
}
```

## Step 3: Verify Test Fails

```bash
bun test calculator.test.ts
# Expected: FAIL
```

The test must fail for the RIGHT reason:
- Bug behavior demonstrated ✓
- Syntax error ✗
- Wrong test setup ✗

If test passes, the bug isn't what you think it is. Investigate further.

## Step 4: Fix with Minimal Code (GREEN)

Apply the smallest fix that makes the test pass:

```typescript
// Before (buggy)
function divide(a: number, b: number): number {
  return a / b;  // Returns Infinity for b=0
}

// After (fixed)
type DivideResult =
  | { type: 'success'; value: number }
  | { type: 'error'; code: string };

function divide(a: number, b: number): DivideResult {
  if (b === 0) {
    return { type: 'error', code: 'DIVISION_BY_ZERO' };
  }
  return { type: 'success', value: a / b };
}
```

## Step 5: Verify All Tests Pass

```bash
# Bug fix test passes
bun test calculator.test.ts
# Expected: PASS

# All existing tests still pass (no regressions)
bun test
# Expected: All PASS
```

## Step 6: Refactor if Needed

If the fix introduced duplication or the code could be cleaner:

```typescript
// Extract error creation
const divisionError = (): DivideResult => ({
  type: 'error',
  code: 'DIVISION_BY_ZERO'
});
```

Run tests after any refactoring.

## Step 7: Commit

```bash
git add -A
git commit -m "fix: handle division by zero gracefully

Root cause: divide() returned Infinity when divisor was 0
Fix: Return error Result instead of performing division

Closes #42"
```

</process>

<bug_fix_checklist>

- [ ] Bug reproduced locally
- [ ] Failing test written capturing the bug
- [ ] Test fails for the right reason
- [ ] Minimal fix applied
- [ ] Bug fix test passes
- [ ] All other tests pass
- [ ] Refactored if needed
- [ ] Commit message includes root cause

</bug_fix_checklist>

<edge_cases>

**Test passes before fix:**
The bug isn't what you think. Investigate more. Your test might not capture the actual bug condition.

**Fix breaks other tests:**
The bug was load-bearing. Other code depended on the buggy behavior. Update those tests too.

**Can't reproduce:**
Intermittent bug? Check for:
- Race conditions
- Environment differences
- State leakage between tests
- Timing dependencies

</edge_cases>

<anti_patterns>

Avoid:
- Fixing without a failing test first
- Changing unrelated code
- Skipping regression check
- Commit message without root cause
- "Quick fix" without understanding

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Bug reproduced with failing test
- [ ] Fix applied and test passes
- [ ] No regressions (all tests pass)
- [ ] Root cause documented in commit
- [ ] Committed: `fix: [bug description]`

</success_criteria>

<commit_template>

```
fix: {brief description of the fix}

Root cause: {what was actually wrong}
Fix: {what the change does}

Closes #{issue-number}
```

</commit_template>
