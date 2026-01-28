# Workflow: Write API Tests

Write type-safe API tests using `testClient` with TDD methodology.

<required_reading>

**Read these reference files NOW:**
1. [testing-patterns.md](../examples/testing-patterns.md) - Complete testClient examples

</required_reading>

<prerequisites>

- Existing Hono app with routes
- bun:test available (comes with Bun)
- Database setup for test isolation

</prerequisites>

<process>

## Step 1: Create Test File

```typescript
// src/routes/users.test.ts
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { testClient } from 'hono/testing';
import { Database } from 'bun:sqlite';
```

## Step 2: Set Up Test App

Create a test-specific app with isolated database:

```typescript
// src/routes/users.test.ts
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { testClient } from 'hono/testing';
import { Database } from 'bun:sqlite';
import { createTestApp } from '../test-utils';

describe('Users API', () => {
  let db: Database;
  let app: ReturnType<typeof createTestApp>;
  let client: ReturnType<typeof testClient<typeof app>>;

  beforeEach(() => {
    // Fresh in-memory database per test
    db = new Database(':memory:');
    db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create app with test database
    app = createTestApp(db);
    client = testClient(app);
  });

  afterEach(() => {
    db.close();
  });

  // Tests go here...
});
```

## Step 3: Write Failing Test First (RED)

Following TDD, write the test before implementing:

```typescript
test('GET /users returns empty array initially', async () => {
  const res = await client.users.$get();

  expect(res.status).toBe(200);

  const data = await res.json();
  expect(data.users).toEqual([]);
});

test('POST /users creates user and returns 201', async () => {
  const res = await client.users.$post({
    json: {
      email: 'alice@example.com',
      name: 'Alice',
    }
  });

  expect(res.status).toBe(201);

  const data = await res.json();
  expect(data.user).toMatchObject({
    email: 'alice@example.com',
    name: 'Alice',
  });
  expect(data.user.id).toBeTruthy();
});
```

## Step 4: Test Path Parameters

```typescript
test('GET /users/:id returns user', async () => {
  // Arrange: Create user first
  const createRes = await client.users.$post({
    json: { email: 'bob@example.com', name: 'Bob' }
  });
  const { user } = await createRes.json();

  // Act
  const res = await client.users[':id'].$get({
    param: { id: user.id }
  });

  // Assert
  expect(res.status).toBe(200);

  const data = await res.json();
  expect(data.user.email).toBe('bob@example.com');
});

test('GET /users/:id returns 404 for non-existent user', async () => {
  const res = await client.users[':id'].$get({
    param: { id: 'non-existent-id' }
  });

  expect(res.status).toBe(404);

  const error = await res.json();
  expect(error.error).toBe('User not found');
});
```

## Step 5: Test Query Parameters

```typescript
test('GET /users supports pagination', async () => {
  // Create 25 users
  for (let i = 0; i < 25; i++) {
    await client.users.$post({
      json: { email: `user${i}@example.com`, name: `User ${i}` }
    });
  }

  // Get page 2 with limit 10
  const res = await client.users.$get({
    query: { page: '2', limit: '10' }
  });

  const data = await res.json();
  expect(data.users).toHaveLength(10);
  expect(data.pagination.page).toBe(2);
  expect(data.pagination.totalPages).toBe(3);
});
```

## Step 6: Test Validation Errors

```typescript
test('POST /users returns 400 for invalid email', async () => {
  const res = await client.users.$post({
    json: {
      email: 'not-an-email',
      name: 'Test',
    } as any  // Cast to bypass client-side types
  });

  expect(res.status).toBe(400);

  const error = await res.json();
  expect(error.error).toBe('Validation failed');
  expect(error.issues).toBeTruthy();
});

test('POST /users returns 400 for missing required fields', async () => {
  const res = await client.users.$post({
    json: { email: 'valid@example.com' } as any
  });

  expect(res.status).toBe(400);
});
```

## Step 7: Test Authentication

```typescript
describe('Protected Routes', () => {
  test('GET /api/profile returns 401 without token', async () => {
    const res = await client.api.profile.$get();

    expect(res.status).toBe(401);

    const error = await res.json();
    expect(error.error).toBe('Missing authorization token');
  });

  test('GET /api/profile returns user with valid token', async () => {
    const res = await client.api.profile.$get({}, {
      headers: { Authorization: 'Bearer valid-token' }
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user).toBeTruthy();
  });

  test('GET /api/admin/users returns 403 for non-admin', async () => {
    const res = await client.api.admin.users.$get({}, {
      headers: { Authorization: 'Bearer user-token' }  // Non-admin token
    });

    expect(res.status).toBe(403);

    const error = await res.json();
    expect(error.error).toBe('Admin access required');
  });
});
```

## Step 8: Test Error Scenarios

```typescript
test('DELETE /users/:id returns 404 for non-existent user', async () => {
  const res = await client.users[':id'].$delete({
    param: { id: 'does-not-exist' }
  });

  expect(res.status).toBe(404);
});

test('POST /users returns 409 for duplicate email', async () => {
  // Create first user
  await client.users.$post({
    json: { email: 'duplicate@example.com', name: 'First' }
  });

  // Attempt duplicate
  const res = await client.users.$post({
    json: { email: 'duplicate@example.com', name: 'Second' }
  });

  expect(res.status).toBe(409);

  const error = await res.json();
  expect(error.error).toContain('already');
});
```

## Step 9: Run Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/routes/users.test.ts

# Run with watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

## Step 10: Implement to Make Tests Pass (GREEN)

Now implement the route handlers to make tests pass. See [build-new-api.md](./build-new-api.md) and [add-route-group.md](./add-route-group.md).

</process>

<anti_patterns>

Avoid:
- **Testing implementation details**: Test behavior, not internals
- **Shared state between tests**: Use `beforeEach` for fresh state
- **Not closing database**: Memory leaks in test runner
- **Skipping error cases**: Test 400, 401, 403, 404, 409, 500
- **Using production database**: Always use `:memory:` or test database
- **Forgetting `await res.json()`**: Response body must be awaited

```typescript
// BAD: Shared state
const db = new Database(':memory:');

// GOOD: Fresh per test
beforeEach(() => {
  db = new Database(':memory:');
});

afterEach(() => {
  db.close();
});
```

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Test file created with proper setup/teardown
- [ ] Database isolated per test (in-memory)
- [ ] Happy path tested (200, 201 responses)
- [ ] Error paths tested (400, 401, 403, 404, 409)
- [ ] Validation errors tested
- [ ] Authentication/authorization tested
- [ ] All tests pass with `bun test`

</success_criteria>

<cross_reference>

**For TDD methodology**, load the **tdd** skill.
This workflow covers Hono-specific testing patterns. The TDD skill provides Red-Green-Refactor methodology and test design principles.

</cross_reference>
