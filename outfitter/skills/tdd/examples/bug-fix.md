# TDD Session: Bug Fix

TDD workflow for fixing a production bug with test reproduction first.

## Bug Report

**Issue**: Division by zero crashes calculator service
**Reporter**: User reported 500 error when calculating percentage with zero total
**Stack Trace**:

```
Error: Division by zero
  at calculatePercentage (calculator.ts:45)
  at handler (api/stats.ts:23)
```

**Priority**: High — causes service crash

## TDD Workflow

### Task Setup

```text
1. Write failing test reproducing bug [in_progress]
2. Fix bug with minimal code [pending]
3. Refactor if needed [pending]
4. Verify fix [pending]
```

## RED Phase: Reproduce Bug (4 min)

Confidence: `▓▓░░░` → Can reproduce, know the fix

First, understand the current implementation:

**Read**: `src/calculator/percentage.ts`

```typescript
export function calculatePercentage(value: number, total: number): number {
  return (value / total) * 100
}
```

Issue clear: No validation for zero total.

**Write failing test**: `src/calculator/percentage.test.ts`

```typescript
import { describe, test, expect } from 'bun:test'
import { calculatePercentage } from './percentage'

describe('calculatePercentage', () => {
  // Existing tests
  test('calculates percentage correctly', () => {
    expect(calculatePercentage(25, 100)).toBe(25)
    expect(calculatePercentage(50, 200)).toBe(25)
  })

  // NEW: Bug reproduction test
  test('handles division by zero gracefully', () => {
    const result = calculatePercentage(10, 0)

    expect(result).toBe(0)
    // OR throw error approach:
    // expect(() => calculatePercentage(10, 0)).toThrow('Total cannot be zero')
  })

  test('handles zero value with valid total', () => {
    expect(calculatePercentage(0, 100)).toBe(0)
  })
})
```

**Run test**: `bun test percentage.test.ts`

```
calculatePercentage
  ✓ calculates percentage correctly
  ✗ handles division by zero gracefully
    Expected: 0
    Received: Infinity
  ✓ handles zero value with valid total

1 failing
```

Bug reproduced successfully — test fails as expected.

**Commit**: `test: add failing test for division by zero bug`

**Task Update**:

```text
1. Write failing test reproducing bug [completed]
2. Fix bug with minimal code [in_progress]
3. Refactor if needed [pending]
4. Verify fix [pending]
```

## GREEN Phase: Fix Bug (3 min)

Confidence: `▓▓▓▓░` → Know exact fix needed

**Update**: `src/calculator/percentage.ts`

```typescript
export function calculatePercentage(value: number, total: number): number {
  // Fix: Handle division by zero
  if (total === 0) {
    return 0
  }

  return (value / total) * 100
}
```

**Run tests**: `bun test percentage.test.ts`

```
calculatePercentage
  ✓ calculates percentage correctly
  ✓ handles division by zero gracefully
  ✓ handles zero value with valid total

3 passing
```

All tests pass — bug fixed.

**Verify no regressions**: `bun test`

```
All test suites passing (23 tests total)
```

No other tests broken — safe fix.

**Commit**: `fix: handle division by zero in percentage calculation`

**Task Update**:

```text
1. Write failing test reproducing bug [completed]
2. Fix bug with minimal code [completed]
3. Refactor if needed [in_progress]
4. Verify fix [pending]
```

## REFACTOR Phase: Consider Improvements (5 min)

Current fix works but could be more robust. Consider:

1. Should negative totals be handled?
2. Should we return error instead of 0?
3. Type safety improvements?

**Decision**: Add input validation, use Result type for better error handling.

**Refactored**: `src/calculator/percentage.ts`

```typescript
type PercentageResult =
  | { type: 'success'; value: number }
  | { type: 'error'; code: 'ZERO_TOTAL' | 'NEGATIVE_TOTAL' }

export function calculatePercentage(
  value: number,
  total: number
): PercentageResult {
  // Validate total
  if (total === 0) {
    return { type: 'error', code: 'ZERO_TOTAL' }
  }

  if (total < 0) {
    return { type: 'error', code: 'NEGATIVE_TOTAL' }
  }

  return {
    type: 'success',
    value: (value / total) * 100,
  }
}
```

**Update tests** to match new signature:

```typescript
describe('calculatePercentage', () => {
  test('calculates percentage correctly', () => {
    const result1 = calculatePercentage(25, 100)
    const result2 = calculatePercentage(50, 200)

    expect(result1).toEqual({ type: 'success', value: 25 })
    expect(result2).toEqual({ type: 'success', value: 25 })
  })

  test('returns error for division by zero', () => {
    const result = calculatePercentage(10, 0)

    expect(result).toEqual({
      type: 'error',
      code: 'ZERO_TOTAL',
    })
  })

  test('returns error for negative total', () => {
    const result = calculatePercentage(10, -100)

    expect(result).toEqual({
      type: 'error',
      code: 'NEGATIVE_TOTAL',
    })
  })

  test('handles zero value with valid total', () => {
    const result = calculatePercentage(0, 100)

    expect(result).toEqual({ type: 'success', value: 0 })
  })
})
```

**Run tests**: `bun test percentage.test.ts`

```
calculatePercentage
  ✓ calculates percentage correctly
  ✓ returns error for division by zero
  ✓ returns error for negative total
  ✓ handles zero value with valid total

4 passing
```

**Update usage** in `api/stats.ts`:

```typescript
// Before
const percentage = calculatePercentage(completed, total)
return { percentage }

// After
const result = calculatePercentage(completed, total)
if (result.type === 'error') {
  return { error: 'Invalid calculation', code: result.code }
}
return { percentage: result.value }
```

**Run all tests**: `bun test`

```
All tests passing (24 tests total)
```

No regressions — refactor successful.

**Commit**: `refactor: use Result type for percentage calculation errors`

**Task Update**:

```text
1. Write failing test reproducing bug [completed]
2. Fix bug with minimal code [completed]
3. Refactor if needed [completed]
4. Verify fix [in_progress]
```

## VERIFY Phase: Comprehensive Validation (4 min)

Run full test suite with coverage:

```bash
bun test --coverage
```

```
Coverage Summary:
  percentage.ts: 100% statements, 100% branches

All tests passing (24 total)
```

Run mutation testing on updated code:

```bash
bun x stryker run --mutate "src/calculator/percentage.ts"
```

```
Mutation Score: 100%
All mutants killed

Mutations tested:
  ✓ === → !== (killed by "returns error for division by zero")
  ✓ < → <= (killed by "returns error for negative total")
  ✓ / → * (killed by "calculates percentage correctly")
  ✓ 0 → 1 (killed by "handles zero value with valid total")
```

Perfect mutation score — tests thoroughly verify behavior.

**Integration test** to verify API fix:

```typescript
describe('GET /api/stats', () => {
  test('handles zero total gracefully', async () => {
    const response = await request(app)
      .get('/api/stats')
      .query({ completed: 10, total: 0 })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      error: 'Invalid calculation',
      code: 'ZERO_TOTAL',
    })
  })
})
```

**Run integration tests**: `bun test tests/integration/`

```
API Integration Tests
  ✓ handles zero total gracefully

All integration tests passing
```

**Task Update**:

```text
1. Write failing test reproducing bug [completed]
2. Fix bug with minimal code [completed]
3. Refactor if needed [completed]
4. Verify fix [completed]
```

## Session Summary

**Duration**: 16 minutes total
- RED: 4 min
- GREEN: 3 min
- REFACTOR: 5 min
- VERIFY: 4 min

**Bug**: Division by zero crash
**Fix**: Added validation with Result type
**Tests**: 4 new tests + 1 integration test
**Coverage**: 100% on changed code
**Mutation Score**: 100%

**Improvements beyond minimal fix**:
- Used discriminated union for error handling
- Added negative total validation
- Updated API to handle error results
- Added integration test

**Production deployment**:
- All tests passing
- No regressions detected
- Error handling verified
- Ready to deploy

## Key TDD Bug Fix Principles

1. **RED first**: Always reproduce bug with failing test before fixing
2. **Minimal GREEN**: Fix the immediate issue first
3. **Refactor for robustness**: Improve error handling and edge cases
4. **Verify thoroughly**: Run full suite + mutation tests + integration tests
5. **Document in test**: Test name describes the bug being fixed

## Anti-patterns Avoided

Avoided jumping straight to fix without test:

```typescript
// ❌ Wrong approach
// 1. See bug report
// 2. Add if (total === 0) return 0
// 3. Deploy and hope

// ✓ Correct TDD approach
// 1. Write failing test reproducing bug
// 2. Verify test fails
// 3. Add minimal fix
// 4. Verify test passes
// 5. Refactor for robustness
// 6. Verify with mutation testing
```

Avoided over-engineering initial fix:

```typescript
// ❌ Too complex for first fix
if (total === 0 || total < 0 || !isFinite(total) || isNaN(total)) {
  throw new ValidationError(...)
}

// ✓ Minimal fix first (GREEN phase)
if (total === 0) {
  return 0
}

// ✓ Then refactor with proper error handling (REFACTOR phase)
if (total === 0) {
  return { type: 'error', code: 'ZERO_TOTAL' }
}
```

## Commit History

```
test: add failing test for division by zero bug
fix: handle division by zero in percentage calculation
refactor: use Result type for percentage calculation errors
```

Clean, focused commits showing TDD progression.
