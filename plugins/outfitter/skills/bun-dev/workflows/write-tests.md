# Workflow: Write Tests

Write tests using bun:test with Red-Green-Refactor methodology.

<required_reading>

**Read these reference files NOW:**
1. [testing.md](../references/testing.md) - Assertions, mocking, snapshots, best practices
2. [../../tdd/SKILL.md](../../tdd/SKILL.md) - Red-Green-Refactor methodology

</required_reading>

<prerequisites>

- Bun project with code to test
- Test requirements understood (what behavior to verify)
- Decision on test scope (unit, integration, e2e)

</prerequisites>

<process>

## Step 1: Create Test File Structure

```bash
# Convention: test files next to source files
# src/utils.ts -> src/utils.test.ts
# src/db/users.ts -> src/db/users.test.ts

# Or in dedicated test directory
mkdir -p tests
```

Create test file:

```typescript
// src/utils.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';

describe('UtilityFunction', () => {
  test.todo('should handle basic case');
  test.todo('should handle edge case');
  test.todo('should throw on invalid input');
});
```

## Step 2: RED - Write Failing Test First

```typescript
import { describe, test, expect } from 'bun:test';
import { formatDate } from './utils';

describe('formatDate', () => {
  test('formats ISO date to readable string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');

    expect(result).toBe('January 15, 2024');
  });

  test('handles invalid date', () => {
    expect(() => formatDate('not-a-date')).toThrow('Invalid date');
  });
});
```

Run to confirm failure:

```bash
bun test src/utils.test.ts
# Expected: FAIL - formatDate is not implemented
```

## Step 3: GREEN - Implement Minimum Code

```typescript
// src/utils.ts
export function formatDate(isoString: string): string {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

Run to confirm passing:

```bash
bun test src/utils.test.ts
# Expected: PASS
```

## Step 4: REFACTOR - Improve While Keeping Green

```typescript
// Refactor to be more robust
export function formatDate(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
```

Run tests to confirm still passing:

```bash
bun test src/utils.test.ts
# Expected: PASS
```

## Step 5: Add Integration Tests

For database code:

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { UserRepository } from './repositories/users';

describe('UserRepository', () => {
  let db: Database;
  let repo: UserRepository;

  beforeEach(() => {
    // Fresh in-memory database per test
    db = new Database(':memory:');
    db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL
      )
    `);
    repo = new UserRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  test('creates user with generated ID', () => {
    const user = repo.create({ email: 'test@example.com', name: 'Test' });

    expect(user.id).toBeDefined();
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);  // UUID format
    expect(user.email).toBe('test@example.com');
  });

  test('finds user by ID', () => {
    const created = repo.create({ email: 'test@example.com', name: 'Test' });

    const found = repo.findById(created.id);

    expect(found).toEqual(created);
  });

  test('returns null for non-existent user', () => {
    const found = repo.findById('non-existent-id');

    expect(found).toBeNull();
  });

  test('enforces unique email constraint', () => {
    repo.create({ email: 'test@example.com', name: 'Test' });

    expect(() => {
      repo.create({ email: 'test@example.com', name: 'Test 2' });
    }).toThrow();
  });
});
```

## Step 6: Add API Tests (with Hono testClient)

```typescript
import { describe, test, expect } from 'bun:test';
import { testClient } from 'hono/testing';
import { app } from './app';

describe('API Routes', () => {
  const client = testClient(app);

  test('GET /health returns ok', async () => {
    const res = await client.health.$get();

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  test('POST /users creates user', async () => {
    const res = await client.users.$post({
      json: { email: 'test@example.com', name: 'Test User' },
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.email).toBe('test@example.com');
  });

  test('POST /users validates input', async () => {
    const res = await client.users.$post({
      json: { email: 'invalid-email', name: '' },
    });

    expect(res.status).toBe(400);
  });
});
```

## Step 7: Run Tests with Coverage

```bash
# Run all tests
bun test

# Run specific file
bun test src/utils.test.ts

# Run tests matching pattern
bun test --test-name-pattern "creates user"

# Watch mode (re-run on changes)
bun test --watch

# With coverage report
bun test --coverage

# Fail fast (stop on first failure)
bun test --bail
```

</process>

<cross_references>

**For TDD methodology:** Load the **tdd** skill for:
- Red-Green-Refactor discipline
- When to write tests
- Test naming conventions
- Coverage goals

**For mocking patterns:** See [testing.md](../references/testing.md) for:
- `mock()` and `spyOn()` usage
- Mocking fetch
- Mocking modules

</cross_references>

<test_patterns>

| Pattern | Use For | Example |
|---------|---------|---------|
| `describe` blocks | Group related tests | `describe('UserService', () => {...})` |
| `beforeEach` | Fresh state per test | Database setup |
| `afterEach` | Cleanup | Close connections |
| `test.todo` | Planned tests | Document what to test |
| `test.skip` | Temporarily disable | Flaky or WIP tests |
| `:memory:` database | Fast isolated tests | No file I/O |

</test_patterns>

<anti_patterns>

Avoid:
- Shared mutable state between tests
- Tests that depend on execution order
- Testing implementation details instead of behavior
- Skipping the RED phase (test must fail first)
- Giant test files (split by feature/module)
- Not cleaning up resources (connections, files)

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Test file created with `describe`/`test` structure
- [ ] RED: Tests fail before implementation
- [ ] GREEN: Tests pass after implementation
- [ ] REFACTOR: Code improved, tests still pass
- [ ] `bun test` runs without errors
- [ ] Coverage meets project standards (if required)

</success_criteria>
