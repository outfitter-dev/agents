# Race Condition Debugging Session

This example demonstrates debugging an intermittent issue using the four-stage framework.

## The Bug

User reports: "Cache occasionally returns stale data. Works most of the time, but sometimes shows old values after updates."

## Stage 1: Collect Evidence

**Task state**: "Collecting evidence" (in_progress)

### Read Error Description

No error messages — behavior is wrong but silent:
- Expected: Updated value from cache
- Actual: Old value returned (intermittently)
- Frequency: ~5% of requests after update

### Reproduce Consistently

Initial attempts fail — bug is intermittent:
- Sometimes works correctly
- Sometimes returns stale data
- No obvious pattern

Run test 100 times to find pattern:

```bash
for i in {1..100}; do
  npm test -- --grep "cache update" > /dev/null || echo "Failed: $i"
done

# Results:
# Failed: 3
# Failed: 17
# Failed: 28
# Failed: 41
# Failed: 59
# Failed: 72
# Failed: 88
# Failed: 94
```

Failure rate: ~8% (8 failures out of 100 runs)

### Check Recent Changes

```bash
git log --since="1 week ago" --oneline src/cache/

# f8d3c21 Optimize cache reads with async/await
# 9a2b741 Add cache prewarming on startup
# c4e5d67 Implement cache TTL refresh
```

Recent changes to cache implementation — possible cause.

### Gather Evidence with Timestamps

Add detailed timing logs:

```typescript
export async function updateCache(key: string, value: any): Promise<void> {
  console.log(`[${Date.now()}] updateCache START: ${key}`);

  await cache.set(key, value);
  console.log(`[${Date.now()}] updateCache cache.set COMPLETE: ${key}`);

  await invalidateRelated(key);
  console.log(`[${Date.now()}] updateCache invalidateRelated COMPLETE: ${key}`);
}

export async function getCache(key: string): Promise<any> {
  console.log(`[${Date.now()}] getCache START: ${key}`);

  const value = await cache.get(key);
  console.log(`[${Date.now()}] getCache COMPLETE: ${key}`, value);

  return value;
}
```

### Timeline Analysis

Captured logs from a failure:

```
[1702500123450] updateCache START: user:123
[1702500123455] updateCache cache.set COMPLETE: user:123
[1702500123456] getCache START: user:123          <-- Read started
[1702500123458] getCache COMPLETE: user:123 [OLD] <-- Returned old value
[1702500123460] updateCache invalidateRelated COMPLETE: user:123
```

**Key finding**: `getCache` started (1456) AFTER `cache.set` completed (1455) but BEFORE `invalidateRelated` completed (1460). Returned stale data.

**Transition**: Evidence gathered showing timing issue. Mark "Collect Evidence" complete, add "Isolate Variables" as in_progress.

## Stage 2: Isolate Variables

**Task state**: "Isolating variables" (in_progress)

### Find Working Examples

Check how other cache operations handle this:

```typescript
// Working example - authentication cache
export async function updateAuthCache(userId: string, token: string): Promise<void> {
  const key = `auth:${userId}`;

  // Atomic operation - no race window
  await cache.set(key, token, { ttl: 3600 });
}
```

Difference: No separate invalidation step, single atomic operation.

### Read Recent Optimization Commit

The optimization commit (f8d3c21):

**Before** (synchronous, blocking):

```typescript
export function updateCache(key: string, value: any): void {
  cache.set(key, value);        // Synchronous
  invalidateRelated(key);       // Synchronous
  // Both complete before function returns
}
```

**After** (async, non-blocking):

```typescript
export async function updateCache(key: string, value: any): Promise<void> {
  await cache.set(key, value);      // Async - completes
  await invalidateRelated(key);     // Async - still pending
  // Function returns here, but invalidation still running
}
```

### Identify Differences

Working code:
- Single atomic operation
- No race window
- Consistent state

Broken code:
- Two-step process
- Race window between set and invalidate
- Inconsistent state possible

### Understand the Flow

1. `updateCache('user:123', newData)` starts
2. `cache.set` completes — new data in cache
3. **Race window starts**
4. `getCache('user:123')` called from different request
5. Reads from cache — gets new data
6. BUT cache has stale related entries
7. Related entries override with old data
8. **Race window ends**
9. `invalidateRelated` completes

**Root cause hypothesis forming**: The async optimization introduced a race window between setting the value and invalidating related entries.

**Transition**: Pattern identified. Mark "Isolate Variables" complete, add "Formulate Hypotheses" as in_progress.

## Stage 3: Formulate Hypotheses & Test

**Task state**: "Formulating hypotheses" (in_progress)

### Form Hypothesis

**Hypothesis**: "Cache returns stale data because the async optimization (f8d3c21) introduced a race window. When `updateCache` sets a value but hasn't yet invalidated related entries, concurrent `getCache` calls can read the new value while related entries are still stale, causing those stale entries to be returned instead."

Evidence:
- Timeline shows `getCache` called during race window
- Worked before async optimization
- Fails ~8% of time (when timing hits race window)
- Working code uses atomic operations

**Transition**: Hypothesis formed. Mark "Formulate Hypotheses" complete, add "Test Hypothesis" as in_progress.

**Task state**: "Testing hypothesis" (in_progress)

### Design Minimal Test

Add artificial delay to widen race window and make bug consistent:

```typescript
export async function updateCache(key: string, value: any): Promise<void> {
  await cache.set(key, value);

  // TESTING: Widen race window
  await new Promise(resolve => setTimeout(resolve, 100));

  await invalidateRelated(key);
}
```

### Execute Test

Run test 100 times with widened race window:

```bash
for i in {1..100}; do
  npm test -- --grep "cache update" > /dev/null || echo "Failed: $i"
done

# Results: 67 failures (67%)
```

Failure rate increased dramatically with wider race window. Confirms timing-based hypothesis.

### Test Solution

Make operations atomic by ensuring no reads during update:

```typescript
export async function updateCache(key: string, value: any): Promise<void> {
  // Acquire lock to prevent concurrent reads
  const lock = await cache.lock(key);

  try {
    await cache.set(key, value);
    await invalidateRelated(key);
  } finally {
    await lock.release();
  }
}
```

Run 100 times:

```bash
# Results: 0 failures (0%)
```

**Result**: Hypothesis confirmed. Lock prevents race condition.

**Transition**: Solution verified. Mark "Test Hypothesis" complete, add "Verify Fix" as in_progress.

## Stage 4: Verify Fix

**Task state**: "Verifying fix" (in_progress)

### Create Failing Test

```typescript
describe('updateCache race condition', () => {
  it('prevents stale data during concurrent update and read', async () => {
    // Setup initial data
    await cache.set('user:123', 'old-value');
    await cache.set('related:123', 'old-related');

    // Simulate race: update and read concurrently
    const [updateResult, readResult] = await Promise.all([
      updateCache('user:123', 'new-value'),
      getCache('user:123'),
    ]);

    // Read should either see old (before update) or new (after update)
    // but never a mix of new + stale related
    const finalValue = await getCache('user:123');

    expect(finalValue).not.toBe('old-related'); // Should not see stale
    expect(['old-value', 'new-value']).toContain(finalValue);
  });
});
```

Test fails without lock, passes with lock.

### Implement Fix

Lock-based solution has performance cost. Consider alternative:

```typescript
export async function updateCache(key: string, value: any): Promise<void> {
  // Generate update ID to track consistency
  const updateId = crypto.randomUUID();

  // Set all values atomically with transaction
  await cache.multi()
    .set(key, value)
    .set(`${key}:updateId`, updateId)
    .invalidate(getRelatedKeys(key))
    .exec();
}
```

This uses cache transaction (multi/exec) for atomicity without explicit locking.

### Verify Fix Works

Run comprehensive tests:

```bash
# Run 1000 times to ensure no failures
for i in {1..1000}; do
  npm test -- --grep "cache update" > /dev/null || echo "Failed: $i"
done

# Results: 0 failures
```

All tests pass:
- Race condition test passes
- Existing tests pass
- Load test shows no performance degradation
- No deadlocks or timeouts

### Document Fix

```typescript
/**
 * Updates cache value atomically with related entries.
 *
 * Bug fix (2024-12-12): Prevented race condition during updates.
 * Root cause: Async optimization (f8d3c21) introduced race window
 * between setting value and invalidating related entries. Concurrent
 * reads during this window could return inconsistent data.
 *
 * Prevention: Use cache transactions (multi/exec) to ensure atomicity.
 * All cache updates and invalidations complete together or not at all.
 */
export async function updateCache(key: string, value: any): Promise<void> {
  const updateId = crypto.randomUUID();

  await cache.multi()
    .set(key, value)
    .set(`${key}:updateId`, updateId)
    .invalidate(getRelatedKeys(key))
    .exec();
}
```

### Additional Defense

Add monitoring to detect inconsistency:

```typescript
export async function getCache(key: string): Promise<any> {
  const [value, updateId] = await Promise.all([
    cache.get(key),
    cache.get(`${key}:updateId`),
  ]);

  // Verify related entries have matching updateId
  const relatedKeys = getRelatedKeys(key);
  for (const relatedKey of relatedKeys) {
    const relatedUpdateId = await cache.get(`${relatedKey}:updateId`);

    if (relatedUpdateId !== updateId) {
      // Log inconsistency for monitoring
      console.warn(`Cache inconsistency detected: ${key}`);
      // Trigger cache refresh
      await refreshCache(key);
    }
  }

  return value;
}
```

**Transition**: Fix verified and monitoring added. Mark "Verify Fix" complete.

**Task state**: All tasks completed.

## Summary

**What broke**: Cache occasionally returned stale data after updates

**Root cause**: Async optimization introduced race window between setting value and invalidating related entries. Concurrent reads during this window could read new value but get stale related data.

**The fix**:
1. Use cache transactions (multi/exec) for atomic updates
2. All updates and invalidations complete atomically
3. Added monitoring to detect inconsistencies

**Prevention**:
- Use atomic operations for multi-step cache updates
- Test concurrent operations explicitly
- Add timing logs to expose race conditions
- Monitor for cache inconsistency in production

## Lessons

- Intermittent bugs require many test runs to find pattern
- Timing logs revealed race window
- Widening race window made bug consistent for testing
- Async optimization can introduce race conditions
- Atomic operations eliminate race windows
- Transaction support in cache library enables atomicity without locks
