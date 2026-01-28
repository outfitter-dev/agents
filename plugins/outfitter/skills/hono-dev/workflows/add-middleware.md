# Workflow: Add Custom Middleware

Create custom middleware with proper typing and context access.

<required_reading>

**Read these reference files NOW:**
1. [middleware.md](../references/middleware.md) - Auth, logging, CORS patterns
2. [factory-pattern.md](../references/factory-pattern.md) - Typed middleware with createFactory

</required_reading>

<prerequisites>

- Existing Hono app (preferably with factory pattern)
- Understanding of middleware execution order
- HTTPException for error handling

</prerequisites>

<process>

## Step 1: Understand Middleware Signature

```typescript
// Basic middleware signature
type MiddlewareHandler = (
  c: Context,           // Request/response context
  next: () => Promise<void>  // Call to continue chain
) => Promise<Response | void>;
```

**Execution flow:**
```
Request → Middleware (before next) → Handler → Middleware (after next) → Response
```

## Step 2: Create Typed Middleware with Factory

```typescript
// src/middleware/request-id.ts
import { factory } from '../factory';

export const requestIdMiddleware = factory.createMiddleware(async (c, next) => {
  // Before handler
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  c.set('requestId', requestId);  // Type-checked against Env!

  await next();

  // After handler
  c.res.headers.set('x-request-id', requestId);
});
```

## Step 3: Access Context Variables

```typescript
// src/middleware/auth.ts
import { factory } from '../factory';
import { HTTPException } from 'hono/http-exception';

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new HTTPException(401, { message: 'Missing authorization token' });
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }

  // Access database from context (set by earlier middleware)
  const db = c.get('db');
  const user = db.query('SELECT * FROM users WHERE id = ?').get(payload.userId);

  if (!user) {
    throw new HTTPException(401, { message: 'User not found' });
  }

  // Set user in context for downstream handlers
  c.set('user', {
    id: user.id,
    email: user.email,
    role: user.role,
  });

  await next();
});
```

## Step 4: Create Parameterized Middleware

```typescript
// src/middleware/rate-limit.ts
import { factory } from '../factory';
import { HTTPException } from 'hono/http-exception';

const rateLimits = new Map<string, { count: number; resetAt: number }>();

export const rateLimiter = (limit: number, windowMs: number) => {
  return factory.createMiddleware(async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const entry = rateLimits.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count++;

      if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        c.res.headers.set('Retry-After', retryAfter.toString());
        throw new HTTPException(429, {
          message: 'Rate limit exceeded',
          cause: { retryAfter },
        });
      }
    }

    await next();
  });
};

// Usage: rateLimiter(100, 60 * 1000) for 100 req/minute
```

## Step 5: Create Role-Based Middleware

```typescript
// src/middleware/roles.ts
import { factory } from '../factory';
import { HTTPException } from 'hono/http-exception';

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
```

## Step 6: Modify Request/Response

```typescript
// src/middleware/timing.ts
import { factory } from '../factory';

export const timingMiddleware = factory.createMiddleware(async (c, next) => {
  const start = Bun.nanoseconds();

  await next();

  const duration = (Bun.nanoseconds() - start) / 1_000_000;
  c.res.headers.set('x-response-time', `${duration.toFixed(2)}ms`);

  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow request: ${c.req.method} ${c.req.path} took ${duration.toFixed(2)}ms`);
  }
});
```

## Step 7: Chain Middleware Properly

```typescript
// src/index.ts
import { factory } from './factory';
import { requestIdMiddleware } from './middleware/request-id';
import { timingMiddleware } from './middleware/timing';
import { dbMiddleware } from './middleware/db';
import { authMiddleware } from './middleware/auth';
import { requireRole } from './middleware/roles';
import { rateLimiter } from './middleware/rate-limit';

const app = factory.createApp()
  // Global middleware (all routes)
  .use('*', requestIdMiddleware)
  .use('*', timingMiddleware)
  .use('*', dbMiddleware)

  // Rate limiting for API routes
  .use('/api/*', rateLimiter(100, 60 * 1000))

  // Public routes (no auth)
  .get('/health', (c) => c.json({ status: 'ok' }))
  .post('/auth/login', loginHandler)
  .post('/auth/register', registerHandler)

  // Protected routes (auth required)
  .use('/api/*', authMiddleware)
  .get('/api/profile', profileHandler)
  .get('/api/posts', postsHandler)

  // Admin routes
  .use('/api/admin/*', requireRole('admin'))
  .get('/api/admin/users', adminUsersHandler)
  .delete('/api/admin/users/:id', adminDeleteUserHandler);
```

## Step 8: Verify Middleware Execution

```typescript
// Test middleware order
const testMiddleware = factory.createMiddleware(async (c, next) => {
  console.log(`[Before] ${c.req.method} ${c.req.path}`);
  await next();
  console.log(`[After] ${c.req.method} ${c.req.path} - ${c.res.status}`);
});

// Run test request and check console output
```

</process>

<anti_patterns>

Avoid:
- **Forgetting `await next()`**: Request will hang
- **Using plain Context type**: Loses variable typing, use `factory.createMiddleware()`
- **Setting variables not in Env type**: TypeScript error at `c.set()`
- **Wrong middleware order**: Auth before db means no database access in auth
- **Modifying response before `next()`**: Use after `next()` for response modifications

```typescript
// BAD: No factory, no types
const authMiddleware = async (c: Context, next: Next) => {
  c.set('user', user);  // No type checking!
  await next();
};

// GOOD: Factory provides types
const authMiddleware = factory.createMiddleware(async (c, next) => {
  c.set('user', user);  // Type-checked against Env['Variables']
  await next();
});
```

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Middleware uses `factory.createMiddleware()` for type safety
- [ ] Context variables set correctly and type-checked
- [ ] `await next()` called in all middleware
- [ ] Error cases throw `HTTPException` with proper status
- [ ] Middleware order is logical (global -> route-specific -> auth -> roles)
- [ ] Response headers set AFTER `next()` if modifying response
- [ ] Parameterized middleware returns a middleware function

</success_criteria>

<next_steps>

After adding middleware:
- Add route groups: [add-route-group.md](./add-route-group.md)
- Write tests: [write-tests.md](./write-tests.md)
- Debug type issues: [debug-types.md](./debug-types.md)

</next_steps>
