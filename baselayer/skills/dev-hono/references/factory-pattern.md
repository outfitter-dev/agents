# Factory Pattern — Context Typing

`createFactory<Env>()` provides type-safe context variables across middleware and routes.

## Environment Definition

```typescript
import { createFactory } from 'hono/factory';
import type { Database } from 'bun:sqlite';

type Env = {
  Variables: {
    user: {
      id: string;
      email: string;
      role: 'admin' | 'user' | 'guest';
    };
    requestId: string;
    db: Database;
    session: {
      id: string;
      expiresAt: Date;
    };
  };
  Bindings: {
    // Cloudflare Workers bindings (if deploying to CF)
    DB: D1Database;
    BUCKET: R2Bucket;
    API_KEY: string;
  };
};

export const factory = createFactory<Env>();
```

## Typed Middleware

### Basic Middleware

```typescript
// Request ID middleware
export const requestIdMiddleware = factory.createMiddleware(async (c, next) => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  c.set('requestId', requestId);

  await next();

  // Add to response
  c.res.headers.set('x-request-id', requestId);
});

// Database middleware
export const dbMiddleware = factory.createMiddleware(async (c, next) => {
  const db = new Database('app.db');
  c.set('db', db);

  try {
    await next();
  } finally {
    db.close(); // Cleanup
  }
});
```

### Authentication Middleware

```typescript
import { HTTPException } from 'hono/http-exception';

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new HTTPException(401, { message: 'Missing authorization token' });
  }

  // Verify token (simplified)
  const payload = await verifyJWT(token);

  if (!payload) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }

  const db = c.get('db');
  const user = db.query('SELECT * FROM users WHERE id = ?').get(payload.userId);

  if (!user) {
    throw new HTTPException(401, { message: 'User not found' });
  }

  c.set('user', {
    id: user.id,
    email: user.email,
    role: user.role,
  });

  await next();
});

// Optional auth — doesn't throw if no token
export const optionalAuthMiddleware = factory.createMiddleware(async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      const payload = await verifyJWT(token);
      const db = c.get('db');
      const user = db.query('SELECT * FROM users WHERE id = ?').get(payload.userId);

      if (user) {
        c.set('user', {
          id: user.id,
          email: user.email,
          role: user.role,
        });
      }
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }

  await next();
});
```

### Authorization Middleware

```typescript
type Role = 'admin' | 'user' | 'guest';

export const requireRole = (requiredRole: Role) => {
  return factory.createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    // Admin has access to everything
    if (user.role === 'admin') {
      await next();
      return;
    }

    // Check role hierarchy
    const roleHierarchy: Record<Role, number> = {
      guest: 0,
      user: 1,
      admin: 2,
    };

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      throw new HTTPException(403, {
        message: `${requiredRole} access required`,
      });
    }

    await next();
  });
};

// Resource ownership check
export const requireOwnership = (resourceKey: 'userId' | 'authorId' = 'userId') => {
  return factory.createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    // Admin bypasses ownership check
    if (user.role === 'admin') {
      await next();
      return;
    }

    // Get resource ID from path params
    const resourceUserId = c.req.param(resourceKey);

    if (user.id !== resourceUserId) {
      throw new HTTPException(403, { message: 'Access denied' });
    }

    await next();
  });
};
```

### Session Middleware

```typescript
export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
  const sessionId = c.req.header('x-session-id');

  if (!sessionId) {
    throw new HTTPException(401, { message: 'Missing session' });
  }

  const db = c.get('db');
  const session = db.query(
    'SELECT * FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP'
  ).get(sessionId);

  if (!session) {
    throw new HTTPException(401, { message: 'Invalid or expired session' });
  }

  c.set('session', {
    id: session.id,
    expiresAt: new Date(session.expires_at),
  });

  // Extend session on activity
  db.run(
    'UPDATE sessions SET expires_at = datetime(CURRENT_TIMESTAMP, "+1 hour") WHERE id = ?',
    [sessionId]
  );

  await next();
});
```

## Typed Handlers

### Basic Handlers

```typescript
// Single handler
const getProfile = factory.createHandlers((c) => {
  const user = c.get('user'); // Fully typed!
  const requestId = c.get('requestId');

  return c.json({
    user,
    requestId,
  });
});

// Multiple handlers (middleware + handler)
const getUsers = factory.createHandlers(
  // Middleware
  async (c, next) => {
    console.log('Fetching users...');
    await next();
  },
  // Handler
  async (c) => {
    const db = c.get('db');
    const users = db.query('SELECT id, email, role FROM users').all();

    return c.json({ users });
  }
);
```

### Handlers with Validation

```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
});

const updateProfile = factory.createHandlers(
  zValidator('json', UpdateProfileSchema),
  async (c) => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const db = c.get('db');

    const updated = db.query(`
      UPDATE users
      SET name = COALESCE(?, name),
          bio = COALESCE(?, bio)
      WHERE id = ?
      RETURNING *
    `).get(data.name || null, data.bio || null, user.id);

    return c.json({ user: updated });
  }
);
```

## App Assembly

### Simple App

```typescript
const app = factory.createApp()
  // Global middleware
  .use('*', requestIdMiddleware)
  .use('*', dbMiddleware)

  // Public routes
  .get('/health', (c) => c.json({ status: 'ok' }))
  .post('/auth/login', loginHandler)

  // Protected routes
  .use('/api/*', authMiddleware)
  .get('/api/profile', ...getProfile)
  .put('/api/profile', ...updateProfile)

  // Admin routes
  .use('/api/admin/*', requireRole('admin'))
  .get('/api/admin/users', ...getUsers);

export type AppType = typeof app;
export default app;
```

### Multi-Module App

```typescript
// routes/users.ts
import { factory } from '../factory';
import { requireRole } from '../middleware/auth';

export const usersRoute = factory.createApp()
  .get('/', async (c) => {
    const db = c.get('db');
    const users = db.query('SELECT id, email, role FROM users').all();
    return c.json({ users });
  })
  .get('/:id', async (c) => {
    const db = c.get('db');
    const user = db.query('SELECT id, email, role FROM users WHERE id = ?')
      .get(c.req.param('id'));

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json({ user });
  })
  .use(requireRole('admin')) // Admin-only routes below
  .delete('/:id', async (c) => {
    const db = c.get('db');
    const user = db.query('DELETE FROM users WHERE id = ? RETURNING *')
      .get(c.req.param('id'));

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json({ deleted: true, user });
  });

// routes/posts.ts
import { factory } from '../factory';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export const postsRoute = factory.createApp()
  .get('/', async (c) => {
    const db = c.get('db');
    const posts = db.query('SELECT * FROM posts ORDER BY created_at DESC').all();
    return c.json({ posts });
  })
  .post('/', zValidator('json', CreatePostSchema), async (c) => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const db = c.get('db');

    const post = db.query(`
      INSERT INTO posts (id, user_id, title, content)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `).get(crypto.randomUUID(), user.id, data.title, data.content);

    return c.json({ post }, 201);
  })
  .get('/:id', async (c) => {
    const db = c.get('db');
    const post = db.query('SELECT * FROM posts WHERE id = ?')
      .get(c.req.param('id'));

    if (!post) {
      throw new HTTPException(404, { message: 'Post not found' });
    }

    return c.json({ post });
  });

// index.ts
import { factory } from './factory';
import { usersRoute } from './routes/users';
import { postsRoute } from './routes/posts';

const app = factory.createApp()
  .use('*', requestIdMiddleware)
  .use('*', dbMiddleware)

  // Mount routes
  .route('/users', usersRoute)
  .route('/posts', postsRoute);

export type AppType = typeof app;
export default app;
```

## Type Propagation

### Extending Environment

```typescript
// base-env.ts
export type BaseEnv = {
  Variables: {
    requestId: string;
    db: Database;
  };
};

// auth-env.ts
import type { BaseEnv } from './base-env';

export type AuthEnv = BaseEnv & {
  Variables: BaseEnv['Variables'] & {
    user: {
      id: string;
      role: 'admin' | 'user';
    };
  };
};

// Usage
const authFactory = createFactory<AuthEnv>();

export const authRoute = authFactory.createApp()
  .get('/profile', (c) => {
    const user = c.get('user'); // Typed!
    const requestId = c.get('requestId'); // Also typed!
    const db = c.get('db'); // Also typed!

    return c.json({ user, requestId });
  });
```

### Merging Environments

```typescript
type Env1 = {
  Variables: {
    foo: string;
  };
};

type Env2 = {
  Variables: {
    bar: number;
  };
};

type MergedEnv = {
  Variables: Env1['Variables'] & Env2['Variables'];
};

const factory = createFactory<MergedEnv>();

const app = factory.createApp()
  .get('/test', (c) => {
    const foo = c.get('foo'); // string
    const bar = c.get('bar'); // number

    return c.json({ foo, bar });
  });
```

## Advanced Patterns

### Conditional Middleware

```typescript
export const conditionalAuth = (condition: (c: Context) => boolean) => {
  return factory.createMiddleware(async (c, next) => {
    if (condition(c)) {
      // Apply auth
      await authMiddleware(c, next);
    } else {
      // Skip auth
      await next();
    }
  });
};

// Usage
const app = factory.createApp()
  .use('/api/*', conditionalAuth((c) => {
    // Skip auth for health checks
    return c.req.path !== '/api/health';
  }))
  .get('/api/health', (c) => c.json({ status: 'ok' }))
  .get('/api/profile', (c) => {
    const user = c.get('user'); // May be undefined
    return c.json({ user });
  });
```

### Middleware Composition

```typescript
const composeMiddleware = (...middlewares: MiddlewareHandler[]) => {
  return factory.createMiddleware(async (c, next) => {
    const execute = async (index: number) => {
      if (index >= middlewares.length) {
        await next();
        return;
      }

      await middlewares[index](c, async () => {
        await execute(index + 1);
      });
    };

    await execute(0);
  });
};

// Usage
const app = factory.createApp()
  .use('/api/*', composeMiddleware(
    requestIdMiddleware,
    dbMiddleware,
    authMiddleware
  ))
  .get('/api/profile', (c) => {
    // All middleware ran
    const requestId = c.get('requestId');
    const db = c.get('db');
    const user = c.get('user');

    return c.json({ user, requestId });
  });
```

### Scoped Factories

```typescript
// Public routes — no auth
const publicFactory = createFactory<{
  Variables: {
    requestId: string;
    db: Database;
  };
}>();

export const publicRoute = publicFactory.createApp()
  .get('/status', (c) => {
    // No user available here
    return c.json({ status: 'ok' });
  });

// Protected routes — auth required
const protectedFactory = createFactory<{
  Variables: {
    requestId: string;
    db: Database;
    user: { id: string; role: string };
  };
}>();

export const protectedRoute = protectedFactory.createApp()
  .get('/profile', (c) => {
    const user = c.get('user'); // Always available!
    return c.json({ user });
  });

// Combine
const app = factory.createApp()
  .use('*', requestIdMiddleware)
  .use('*', dbMiddleware)
  .route('/public', publicRoute)
  .use('/protected/*', authMiddleware)
  .route('/protected', protectedRoute);
```

### Dependency Injection

```typescript
interface IDatabase {
  query(sql: string): any;
}

interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

type Env = {
  Variables: {
    db: IDatabase;
    cache: ICache;
    user: { id: string };
  };
};

const factory = createFactory<Env>();

// Inject dependencies
const createApp = (db: IDatabase, cache: ICache) => {
  return factory.createApp()
    .use('*', async (c, next) => {
      c.set('db', db);
      c.set('cache', cache);
      await next();
    })
    .get('/users/:id', async (c) => {
      const cache = c.get('cache');
      const db = c.get('db');
      const id = c.req.param('id');

      // Try cache first
      const cached = await cache.get(`user:${id}`);
      if (cached) {
        return c.json(JSON.parse(cached));
      }

      // Fetch from DB
      const user = db.query('SELECT * FROM users WHERE id = ?').get(id);

      // Cache result
      await cache.set(`user:${id}`, JSON.stringify(user));

      return c.json({ user });
    });
};

// Usage
const db = new Database('app.db');
const cache = new RedisClient();

const app = createApp(db, cache);
```

## Common Pitfalls

```typescript
// ❌ Wrong: Variables set but not in type
type Env = {
  Variables: {
    user: { id: string };
  };
};

const factory = createFactory<Env>();

const app = factory.createApp()
  .use('*', async (c, next) => {
    c.set('requestId', crypto.randomUUID()); // Type error!
    await next();
  });


// ✅ Correct: Include all variables in type
type Env = {
  Variables: {
    user: { id: string };
    requestId: string; // Added!
  };
};


// ❌ Wrong: Using base Hono with factory
import { Hono } from 'hono';

const app = new Hono() // Lost types!
  .use(authMiddleware) // Middleware expects typed context
  .get('/profile', (c) => {
    const user = c.get('user'); // Type error!
  });


// ✅ Correct: Use factory.createApp()
const app = factory.createApp()
  .use(authMiddleware)
  .get('/profile', (c) => {
    const user = c.get('user'); // Fully typed!
  });


// ❌ Wrong: Middleware doesn't use factory
const authMiddleware = async (c: Context, next: Next) => {
  c.set('user', { id: '123' }); // Lost types!
  await next();
};


// ✅ Correct: Use factory.createMiddleware
const authMiddleware = factory.createMiddleware(async (c, next) => {
  c.set('user', { id: '123' }); // Typed!
  await next();
});
```
