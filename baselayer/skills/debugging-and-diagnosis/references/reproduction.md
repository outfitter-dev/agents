# Reproduction Techniques

Reliable reproduction is the foundation of effective debugging. If you can't reproduce the bug consistently, you can't verify your fix works.

## Minimal Reproduction

Goal: Smallest possible code that demonstrates the bug.

### Process

1. Start with full failing case
2. Remove one thing at a time
3. After each removal, verify bug still occurs
4. Continue until nothing else can be removed
5. Result: minimal reproduction case

### Example

**Initial failing case** (500 lines):

```typescript
// Complex app with many features
// Bug: Login fails
```

**Minimal reproduction** (15 lines):

```typescript
import { authenticate } from './auth';

// Bug occurs when password contains special chars
const result = await authenticate({
  username: 'test@example.com',
  password: 'p@ssw0rd!',
});
// Expected: success
// Actual: fails with "Invalid credentials"
```

### Benefits

- Isolates exact cause
- Eliminates red herrings
- Makes debugging tractable
- Helps others reproduce
- Creates focused test case

## Reproduction Checklist

Create checklist for consistent reproduction:

```markdown
## Environment
- [ ] OS/platform: macOS 14.1
- [ ] Node version: 20.10.0
- [ ] Package versions: see package.json
- [ ] Environment variables: NODE_ENV=production

## Setup
- [ ] Database state: Empty database with schema v2.3
- [ ] File system state: No cache files
- [ ] Configuration: Default config.json
- [ ] Prerequisites: Redis running on localhost:6379

## Steps to Reproduce
1. [ ] Start server: `npm run start`
2. [ ] Navigate to `/login`
3. [ ] Enter credentials with special chars in password
4. [ ] Click "Login"

## Expected vs Actual
**Expected**: User logged in successfully
**Actual**: Error message "Invalid credentials" (password is correct)

## Additional Context
- Bug does NOT occur with alphanumeric passwords
- Bug started after upgrading bcrypt from 5.0.0 to 5.1.0
- Affects 3% of login attempts based on logs
```

### Template

```markdown
## Environment
- [ ] OS/platform: _____
- [ ] Language/runtime version: _____
- [ ] Dependency versions: _____
- [ ] Environment variables: _____

## Setup
- [ ] Database state: _____
- [ ] File system state: _____
- [ ] Configuration: _____
- [ ] Prerequisites: _____

## Steps to Reproduce
1. [ ] _____
2. [ ] _____
3. [ ] _____

## Expected vs Actual
**Expected**: _____
**Actual**: _____

## Additional Context
- _____
```

## Automated Reproduction

Convert manual steps to automated test.

### Benefits

- Runs in CI/CD
- Documents exact conditions
- Verifies fix automatically
- Prevents regression

### Example: Manual to Automated

**Manual steps**:
1. Create user with ID "test-123"
2. Set user email to null
3. Call getUserDisplay(user)
4. Observe crash

**Automated test**:

```typescript
describe('getUserDisplay', () => {
  it('reproduces crash with null email', () => {
    // Setup
    const userWithNullEmail = {
      id: 'test-123',
      name: 'Test User',
      email: null, // This triggers the bug
    };

    // Execute - currently crashes
    expect(() => getUserDisplay(userWithNullEmail)).toThrow(
      TypeError // Will be fixed to throw proper validation error
    );
  });
});
```

After fix:

```typescript
expect(() => getUserDisplay(userWithNullEmail)).toThrow(
  'User email is required'
);
```

## Reproduction Patterns by Bug Type

### Runtime Errors

Focus on input values:

```typescript
// Reproduce with specific input that triggers error
const problematicInput = {
  value: undefined, // Causes crash
  nested: { field: null },
};

expect(() => process(problematicInput)).toThrow(TypeError);
```

### Logic Bugs

Focus on edge cases:

```typescript
// Reproduce with boundary conditions
expect(calculateTotal([])).toBe(0); // Empty array
expect(calculateTotal([5])).toBe(5); // Single item
expect(calculateTotal([5, -3])).toBe(2); // Negative values
expect(calculateTotal([0.1, 0.2])).toBe(0.3); // Floating point
```

### Integration Failures

Mock external dependencies:

```typescript
// Reproduce API failure
const mockApi = {
  fetchUser: vi.fn().mockRejectedValue(
    new Error('API timeout')
  ),
};

await expect(
  getUserProfile('123', mockApi)
).rejects.toThrow('Failed to fetch user');
```

### Intermittent Issues

Add timing/concurrency:

```typescript
// Reproduce race condition
const results = await Promise.all([
  updateUser('123', { name: 'Alice' }),
  updateUser('123', { name: 'Bob' }),
]);

// One update should fail or last write should win consistently
expect(results.filter(r => r.success)).toHaveLength(1);
```

### Performance Issues

Reproduce with scale:

```typescript
// Reproduce performance degradation
const largeDataset = Array.from(
  { length: 10000 },
  (_, i) => ({ id: i, data: 'x'.repeat(1000) })
);

const startTime = Date.now();
const result = processData(largeDataset);
const duration = Date.now() - startTime;

// Should complete in reasonable time
expect(duration).toBeLessThan(1000); // 1 second
```

## Flaky Test Handling

When test sometimes passes, sometimes fails:

### Techniques

**Run multiple times**:

```bash
# Run test 100 times to find pattern
for i in {1..100}; do
  npm test -- --grep "flaky test" || echo "Failed on run $i"
done
```

**Add delays to expose timing**:

```typescript
// If suspected race condition
await new Promise(resolve => setTimeout(resolve, 100));
// See if consistent delay changes behavior
```

**Check for shared state**:

```typescript
// Isolate test with fresh setup
beforeEach(() => {
  // Reset all state
  clearCache();
  resetDatabase();
  clearEventListeners();
});
```

**Log timing information**:

```typescript
console.log(`[${new Date().toISOString()}] Step 1 completed`);
console.log(`[${new Date().toISOString()}] Step 2 completed`);
// Look for timing patterns in failures
```

## Reproduction in Different Environments

Bugs may only occur in specific environments.

### Environment Matrix

Test across:
- Operating systems (macOS, Linux, Windows)
- Runtime versions (Node 18, 20, 22)
- Dependency versions (latest, locked)
- Environment modes (dev, staging, production)

### Docker Reproduction

Ensure consistent environment:

```dockerfile
FROM node:20.10.0

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Reproduce bug
RUN npm test -- --grep "bug reproduction"
```

Benefits:
- Consistent across machines
- Documents exact environment
- Easy for others to reproduce

## Documentation

When sharing reproduction:

### Include

1. **Exact steps** — numbered, detailed
2. **Expected behavior** — what should happen
3. **Actual behavior** — what actually happens
4. **Environment details** — versions, config
5. **Minimal code** — smallest failing example
6. **Screenshots/logs** — visual confirmation

### Template

```markdown
# Bug: {Brief Description}

## Reproduction

**Environment:**
- OS: macOS 14.1
- Runtime: Node.js 20.10.0
- Dependencies: see lockfile commit abc123

**Steps:**
1. Clone repo at commit abc123
2. Run `npm install`
3. Run `npm test -- --grep "specific test"`
4. Observe failure

**Expected:** Test passes
**Actual:** Test fails with "TypeError: ..."

**Minimal code:**
\`\`\`typescript
// 10 lines that trigger bug
\`\`\`

**Logs:**
\`\`\`
[full error output]
\`\`\`

## Additional Context
- Fails 100% of time with these steps
- Does not fail if X is changed to Y
- Started after commit abc123
```

## Common Pitfalls

### Non-deterministic Reproduction

**Problem**: Can't reproduce consistently

**Solutions**:
- Control randomness (seed random number generators)
- Control timing (use fixed delays, not timeouts)
- Control environment (Docker, locked dependencies)
- Control input (save exact input that triggers bug)

### Over-complex Reproduction

**Problem**: Reproduction requires too much setup

**Solutions**:
- Simplify to minimal case
- Mock external dependencies
- Use in-memory databases for tests
- Extract core logic that fails

### Environment-specific Bugs

**Problem**: "Works on my machine"

**Solutions**:
- Document exact environment (Docker)
- Check for environment variables
- Verify dependency versions match
- Test on clean install

## Summary

Reliable reproduction is critical for:
- Understanding the bug
- Verifying the fix
- Preventing regression
- Communicating the issue

Time invested in solid reproduction saves time in debugging and verification.
