# Testing Patterns

Type-safe testing with `testClient` — no HTTP server required.

## Basic Setup

```typescript
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { testClient } from 'hono/testing';
import { Hono } from 'hono';
import { Database } from 'bun:sqlite';

// Simple app for testing
const createApp = () => {
  return new Hono()
    .get('/health', (c) => c.json({ status: 'ok' }))
    .get('/error', () => {
      throw new Error('Test error');
    });
};

describe('Basic Tests', () => {
  test('GET /health returns 200', async () => {
    const app = createApp();
    const client = testClient(app);

    const res = await client.health.$get();

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({ status: 'ok' });
  });

  test('GET /error returns 500', async () => {
    const app = createApp();
    const client = testClient(app);

    const res = await client.error.$get();

    expect(res.status).toBe(500);
  });
});
```

## Testing CRUD Operations

```typescript
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

describe('Posts API', () => {
  let db: Database;
  let app: Hono;
  let client: ReturnType<typeof testClient>;

  beforeEach(() => {
    // In-memory database for each test
    db = new Database(':memory:');
    db.run(`
      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create app with database
    app = new Hono()
      .get('/posts', (c) => {
        const posts = db.query('SELECT * FROM posts').all();
        return c.json({ posts });
      })
      .get('/posts/:id', (c) => {
        const post = db.query('SELECT * FROM posts WHERE id = ?').get(c.req.param('id'));
        if (!post) {
          throw new HTTPException(404, { message: 'Post not found' });
        }
        return c.json({ post });
      })
      .post('/posts', zValidator('json', CreatePostSchema), (c) => {
        const data = c.req.valid('json');
        const post = db.query(
          'INSERT INTO posts (id, title, content) VALUES (?, ?, ?) RETURNING *'
        ).get(crypto.randomUUID(), data.title, data.content);
        return c.json({ post }, 201);
      })
      .delete('/posts/:id', (c) => {
        const post = db.query('DELETE FROM posts WHERE id = ? RETURNING *').get(c.req.param('id'));
        if (!post) {
          throw new HTTPException(404, { message: 'Post not found' });
        }
        return c.json({ deleted: true, post });
      });

    client = testClient(app);
  });

  afterEach(() => {
    db.close();
  });

  test('GET /posts returns empty array initially', async () => {
    const res = await client.posts.$get();

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.posts).toEqual([]);
  });

  test('POST /posts creates post', async () => {
    const res = await client.posts.$post({
      json: {
        title: 'Test Post',
        content: 'This is a test post',
      }
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.post).toMatchObject({
      title: 'Test Post',
      content: 'This is a test post',
    });
    expect(data.post.id).toBeTruthy();
    expect(data.post.created_at).toBeTruthy();
  });

  test('POST /posts validates input', async () => {
    const res = await client.posts.$post({
      json: { title: '' } as any // Invalid input
    });

    expect(res.status).toBe(400);

    const error = await res.json();
    expect(error).toHaveProperty('error');
  });

  test('GET /posts/:id returns post', async () => {
    // Create post first
    const createRes = await client.posts.$post({
      json: { title: 'Test', content: 'Content' }
    });
    const { post } = await createRes.json();

    // Get post
    const res = await client.posts[':id'].$get({
      param: { id: post.id }
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.post).toEqual(post);
  });

  test('GET /posts/:id returns 404 for non-existent post', async () => {
    const res = await client.posts[':id'].$get({
      param: { id: 'non-existent' }
    });

    expect(res.status).toBe(404);

    const error = await res.json();
    expect(error.error).toBe('Post not found');
  });

  test('DELETE /posts/:id deletes post', async () => {
    // Create post
    const createRes = await client.posts.$post({
      json: { title: 'Test', content: 'Content' }
    });
    const { post } = await createRes.json();

    // Delete post
    const deleteRes = await client.posts[':id'].$delete({
      param: { id: post.id }
    });

    expect(deleteRes.status).toBe(200);

    const deleteData = await deleteRes.json();
    expect(deleteData.deleted).toBe(true);

    // Verify deletion
    const getRes = await client.posts[':id'].$get({
      param: { id: post.id }
    });

    expect(getRes.status).toBe(404);
  });

  test('GET /posts returns created posts', async () => {
    // Create multiple posts
    await client.posts.$post({ json: { title: 'Post 1', content: 'Content 1' } });
    await client.posts.$post({ json: { title: 'Post 2', content: 'Content 2' } });
    await client.posts.$post({ json: { title: 'Post 3', content: 'Content 3' } });

    const res = await client.posts.$get();
    const data = await res.json();

    expect(data.posts).toHaveLength(3);
    expect(data.posts.map((p: any) => p.title)).toEqual(['Post 1', 'Post 2', 'Post 3']);
  });
});
```

## Testing Authentication

```typescript
import { createFactory } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

type Env = {
  Variables: {
    user: { id: string; role: 'admin' | 'user' };
  };
};

const factory = createFactory<Env>();

// Mock token verification
const mockUsers = new Map([
  ['valid-token', { id: 'user-123', role: 'user' as const }],
  ['admin-token', { id: 'admin-456', role: 'admin' as const }],
]);

const authMiddleware = factory.createMiddleware(async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new HTTPException(401, { message: 'Missing token' });
  }

  const user = mockUsers.get(token);

  if (!user) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }

  c.set('user', user);
  await next();
});

const requireAdmin = factory.createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Admin access required' });
  }

  await next();
});

describe('Authentication', () => {
  const app = factory.createApp()
    .get('/public', (c) => c.json({ public: true }))
    .use('/protected/*', authMiddleware)
    .get('/protected/profile', (c) => {
      const user = c.get('user');
      return c.json({ user });
    })
    .use('/protected/admin/*', requireAdmin)
    .get('/protected/admin/dashboard', (c) => {
      return c.json({ admin: true });
    });

  const client = testClient(app);

  test('Public route accessible without auth', async () => {
    const res = await client.public.$get();

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.public).toBe(true);
  });

  test('Protected route requires auth', async () => {
    const res = await client.protected.profile.$get();

    expect(res.status).toBe(401);

    const error = await res.json();
    expect(error.error).toBe('Missing token');
  });

  test('Protected route accepts valid token', async () => {
    const res = await client.protected.profile.$get({}, {
      headers: { Authorization: 'Bearer valid-token' }
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user).toEqual({ id: 'user-123', role: 'user' });
  });

  test('Protected route rejects invalid token', async () => {
    const res = await client.protected.profile.$get({}, {
      headers: { Authorization: 'Bearer invalid-token' }
    });

    expect(res.status).toBe(401);

    const error = await res.json();
    expect(error.error).toBe('Invalid token');
  });

  test('Admin route requires admin role', async () => {
    const res = await client.protected.admin.dashboard.$get({}, {
      headers: { Authorization: 'Bearer valid-token' }
    });

    expect(res.status).toBe(403);

    const error = await res.json();
    expect(error.error).toBe('Admin access required');
  });

  test('Admin route accepts admin token', async () => {
    const res = await client.protected.admin.dashboard.$get({}, {
      headers: { Authorization: 'Bearer admin-token' }
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.admin).toBe(true);
  });
});
```

## Testing Middleware

```typescript
import { logger } from 'hono/logger';

describe('Middleware', () => {
  test('Logger middleware logs requests', async () => {
    const logs: string[] = [];

    // Custom logger that captures logs
    const customLogger = (message: string) => {
      logs.push(message);
    };

    const app = new Hono()
      .use('*', logger(customLogger))
      .get('/test', (c) => c.json({ ok: true }));

    const client = testClient(app);

    await client.test.$get();

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some(log => log.includes('GET'))).toBe(true);
    expect(logs.some(log => log.includes('/test'))).toBe(true);
  });

  test('Custom middleware runs before handler', async () => {
    const executionOrder: string[] = [];

    const app = new Hono()
      .use('*', async (c, next) => {
        executionOrder.push('middleware-before');
        await next();
        executionOrder.push('middleware-after');
      })
      .get('/test', (c) => {
        executionOrder.push('handler');
        return c.json({ ok: true });
      });

    const client = testClient(app);

    await client.test.$get();

    expect(executionOrder).toEqual([
      'middleware-before',
      'handler',
      'middleware-after',
    ]);
  });

  test('Middleware can modify context', async () => {
    type Env = {
      Variables: {
        requestId: string;
        timestamp: number;
      };
    };

    const factory = createFactory<Env>();

    const contextMiddleware = factory.createMiddleware(async (c, next) => {
      c.set('requestId', crypto.randomUUID());
      c.set('timestamp', Date.now());
      await next();
    });

    const app = factory.createApp()
      .use('*', contextMiddleware)
      .get('/test', (c) => {
        return c.json({
          requestId: c.get('requestId'),
          timestamp: c.get('timestamp'),
        });
      });

    const client = testClient(app);

    const res = await client.test.$get();
    const data = await res.json();

    expect(data.requestId).toBeTruthy();
    expect(typeof data.requestId).toBe('string');
    expect(data.timestamp).toBeTruthy();
    expect(typeof data.timestamp).toBe('number');
  });
});
```

## Testing Error Handling

```typescript
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

describe('Error Handling', () => {
  test('HTTPException returns correct status and message', async () => {
    const app = new Hono()
      .get('/error', () => {
        throw new HTTPException(418, { message: "I'm a teapot" });
      })
      .onError((err, c) => {
        if (err instanceof HTTPException) {
          return c.json({ error: err.message }, err.status);
        }
        return c.json({ error: 'Internal error' }, 500);
      });

    const client = testClient(app);

    const res = await client.error.$get();

    expect(res.status).toBe(418);

    const error = await res.json();
    expect(error.error).toBe("I'm a teapot");
  });

  test('Validation errors handled correctly', async () => {
    const Schema = z.object({
      email: z.string().email(),
      age: z.number().int().positive(),
    });

    const app = new Hono()
      .post('/validate', zValidator('json', Schema), (c) => {
        const data = c.req.valid('json');
        return c.json({ data });
      })
      .onError((err, c) => {
        if (err instanceof ZodError) {
          return c.json({
            error: 'Validation failed',
            issues: err.issues,
          }, 400);
        }
        return c.json({ error: 'Internal error' }, 500);
      });

    const client = testClient(app);

    const res = await client.validate.$post({
      json: { email: 'invalid', age: -1 } as any
    });

    expect(res.status).toBe(400);

    const error = await res.json();
    expect(error.error).toBe('Validation failed');
    expect(error.issues).toBeTruthy();
    expect(Array.isArray(error.issues)).toBe(true);
  });

  test('Generic errors sanitized in production', async () => {
    const originalEnv = process.env.NODE_ENV;

    const app = new Hono()
      .get('/error', () => {
        throw new Error('Sensitive internal error');
      })
      .onError((err, c) => {
        const isDev = process.env.NODE_ENV !== 'production';
        return c.json({
          error: isDev ? err.message : 'Internal server error'
        }, 500);
      });

    const client = testClient(app);

    // Development mode
    process.env.NODE_ENV = 'development';
    let res = await client.error.$get();
    let error = await res.json();
    expect(error.error).toBe('Sensitive internal error');

    // Production mode
    process.env.NODE_ENV = 'production';
    res = await client.error.$get();
    error = await res.json();
    expect(error.error).toBe('Internal server error');

    // Restore
    process.env.NODE_ENV = originalEnv;
  });
});
```

## Integration Testing with Database

```typescript
describe('Integration Tests', () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(':memory:');

    // Create schema
    db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  });

  afterEach(() => {
    db.close();
  });

  test('Full user and post workflow', async () => {
    const app = new Hono()
      .post('/users', zValidator('json', z.object({
        email: z.string().email(),
        name: z.string(),
      })), (c) => {
        const data = c.req.valid('json');
        const user = db.query(
          'INSERT INTO users (id, email, name) VALUES (?, ?, ?) RETURNING *'
        ).get(crypto.randomUUID(), data.email, data.name);
        return c.json({ user }, 201);
      })
      .get('/users/:id/posts', (c) => {
        const posts = db.query(
          'SELECT * FROM posts WHERE user_id = ?'
        ).all(c.req.param('id'));
        return c.json({ posts });
      })
      .post('/posts', zValidator('json', z.object({
        userId: z.string(),
        title: z.string(),
        content: z.string(),
      })), (c) => {
        const data = c.req.valid('json');
        const post = db.query(
          'INSERT INTO posts (id, user_id, title, content) VALUES (?, ?, ?, ?) RETURNING *'
        ).get(crypto.randomUUID(), data.userId, data.title, data.content);
        return c.json({ post }, 201);
      });

    const client = testClient(app);

    // Create user
    const userRes = await client.users.$post({
      json: { email: 'alice@example.com', name: 'Alice' }
    });
    expect(userRes.status).toBe(201);
    const { user } = await userRes.json();

    // Create posts for user
    await client.posts.$post({
      json: { userId: user.id, title: 'Post 1', content: 'Content 1' }
    });
    await client.posts.$post({
      json: { userId: user.id, title: 'Post 2', content: 'Content 2' }
    });

    // Get user's posts
    const postsRes = await client.users[':id'].posts.$get({
      param: { id: user.id }
    });

    expect(postsRes.status).toBe(200);

    const { posts } = await postsRes.json();
    expect(posts).toHaveLength(2);
    expect(posts.map((p: any) => p.title)).toEqual(['Post 1', 'Post 2']);
  });

  test('Transaction rollback on error', async () => {
    const app = new Hono()
      .post('/bulk-create', zValidator('json', z.object({
        users: z.array(z.object({ email: z.string(), name: z.string() }))
      })), (c) => {
        const data = c.req.valid('json');

        try {
          db.transaction(() => {
            for (const user of data.users) {
              db.run(
                'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
                [crypto.randomUUID(), user.email, user.name]
              );
            }
          })();

          return c.json({ created: data.users.length }, 201);
        } catch (err) {
          throw new HTTPException(400, { message: 'Bulk create failed' });
        }
      });

    const client = testClient(app);

    // Attempt to create users with duplicate email
    const res = await client['bulk-create'].$post({
      json: {
        users: [
          { email: 'alice@example.com', name: 'Alice' },
          { email: 'alice@example.com', name: 'Alice Duplicate' }, // Duplicate!
        ]
      }
    });

    expect(res.status).toBe(400);

    // Verify no users were created
    const count = db.query('SELECT COUNT(*) as count FROM users').get() as { count: number };
    expect(count.count).toBe(0);
  });
});
```

## Mocking Patterns

```typescript
describe('Mocking', () => {
  test('Mock external API calls', async () => {
    // Mock fetch
    const originalFetch = global.fetch;
    global.fetch = async (url: string | URL | Request) => {
      return new Response(JSON.stringify({ mocked: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const app = new Hono()
      .get('/proxy', async (c) => {
        const res = await fetch('https://api.example.com/data');
        const data = await res.json();
        return c.json({ data });
      });

    const client = testClient(app);

    const res = await client.proxy.$get();
    const data = await res.json();

    expect(data.data.mocked).toBe(true);

    // Restore
    global.fetch = originalFetch;
  });

  test('Mock database with interface', async () => {
    interface IDatabase {
      query(sql: string): { get(id: string): any };
    }

    class MockDatabase implements IDatabase {
      private data = new Map([
        ['1', { id: '1', name: 'Alice' }],
        ['2', { id: '2', name: 'Bob' }],
      ]);

      query(sql: string) {
        return {
          get: (id: string) => this.data.get(id),
        };
      }
    }

    const mockDb = new MockDatabase();

    const app = new Hono()
      .get('/users/:id', (c) => {
        const user = mockDb.query('SELECT * FROM users WHERE id = ?').get(c.req.param('id'));
        if (!user) {
          throw new HTTPException(404, { message: 'User not found' });
        }
        return c.json({ user });
      });

    const client = testClient(app);

    const res = await client.users[':id'].$get({ param: { id: '1' } });
    const data = await res.json();

    expect(data.user.name).toBe('Alice');
  });
});
```
