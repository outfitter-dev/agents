# Middleware Patterns

Common middleware patterns for Hono APIs.

## Built-in Middleware

### Logger

```typescript
import { logger } from 'hono/logger';

app.use('*', logger());

// Custom log function
app.use('*', logger((message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
}));
```

### CORS

```typescript
import { cors } from 'hono/cors';

// Basic CORS
app.use('/api/*', cors());

// Configured CORS
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'https://example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// Dynamic origin
app.use('/api/*', cors({
  origin: (origin) => {
    if (origin.endsWith('.example.com')) {
      return origin;
    }
    return null;
  },
}));
```

### Compress

```typescript
import { compress } from 'hono/compress';

app.use('*', compress());
```

### Secure Headers

```typescript
import { secureHeaders } from 'hono/secure-headers';

app.use('*', secureHeaders());
```

### Bearer Auth

```typescript
import { bearerAuth } from 'hono/bearer-auth';

app.use('/api/*', bearerAuth({
  token: Bun.env.API_TOKEN!,
}));

// Multiple tokens
app.use('/api/*', bearerAuth({
  token: [Bun.env.API_TOKEN!, Bun.env.ADMIN_TOKEN!],
}));

// Custom verification
app.use('/api/*', bearerAuth({
  verifyToken: async (token, c) => {
    const user = await verifyJWT(token);
    if (user) {
      c.set('user', user);
      return true;
    }
    return false;
  },
}));
```

### Basic Auth

```typescript
import { basicAuth } from 'hono/basic-auth';

app.use('/admin/*', basicAuth({
  username: 'admin',
  password: Bun.env.ADMIN_PASSWORD!,
}));
```

## Custom Middleware with Factory

### Authentication

```typescript
import { createFactory } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

type Env = {
  Variables: {
    user: { id: string; email: string; role: 'admin' | 'user' };
  };
};

const factory = createFactory<Env>();

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new HTTPException(401, { message: 'Missing authorization token' });
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }

  c.set('user', {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  });

  await next();
});
```

### Optional Authentication

```typescript
export const optionalAuth = factory.createMiddleware(async (c, next) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      const payload = await verifyJWT(token);
      if (payload) {
        c.set('user', {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        });
      }
    } catch {
      // Invalid token, continue without user
    }
  }

  await next();
});
```

### Role-Based Access Control

```typescript
export const requireRole = (requiredRole: 'admin' | 'user') => {
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

    if (user.role !== requiredRole) {
      throw new HTTPException(403, { message: `${requiredRole} access required` });
    }

    await next();
  });
};

// Usage
app.use('/api/admin/*', requireRole('admin'));
```

### Resource Ownership

```typescript
export const requireOwnership = (paramName = 'userId') => {
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

    const resourceUserId = c.req.param(paramName);

    if (user.id !== resourceUserId) {
      throw new HTTPException(403, { message: 'Access denied' });
    }

    await next();
  });
};

// Usage
app.delete('/users/:userId', requireOwnership('userId'), deleteUser);
```

### Request ID

```typescript
export const requestIdMiddleware = factory.createMiddleware(async (c, next) => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  c.set('requestId', requestId);

  await next();

  c.res.headers.set('x-request-id', requestId);
});
```

### Request Timing

```typescript
export const timingMiddleware = factory.createMiddleware(async (c, next) => {
  const start = Bun.nanoseconds();

  await next();

  const duration = (Bun.nanoseconds() - start) / 1_000_000;
  c.res.headers.set('x-response-time', `${duration.toFixed(2)}ms`);

  console.log(`${c.req.method} ${c.req.path} - ${duration.toFixed(2)}ms`);
});
```

### Rate Limiting

```typescript
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
        throw new HTTPException(429, {
          message: 'Rate limit exceeded',
          cause: { retryAfter },
        });
      }
    }

    await next();
  });
};

// Usage: 100 requests per minute
app.use('/api/*', rateLimiter(100, 60 * 1000));
```

### Database Connection

```typescript
import { Database } from 'bun:sqlite';

export const dbMiddleware = factory.createMiddleware(async (c, next) => {
  const db = new Database('app.db');
  c.set('db', db);

  try {
    await next();
  } finally {
    db.close();
  }
});

// With connection pooling
class DatabasePool {
  private pool: Database[] = [];

  get(): Database {
    return this.pool.pop() || new Database('app.db');
  }

  release(db: Database) {
    this.pool.push(db);
  }
}

const pool = new DatabasePool();

export const pooledDbMiddleware = factory.createMiddleware(async (c, next) => {
  const db = pool.get();
  c.set('db', db);

  try {
    await next();
  } finally {
    pool.release(db);
  }
});
```

### Caching

```typescript
const cache = new Map<string, { data: any; expiresAt: number }>();

export const cacheMiddleware = (ttlMs: number) => {
  return factory.createMiddleware(async (c, next) => {
    if (c.req.method !== 'GET') {
      await next();
      return;
    }

    const key = c.req.url;
    const cached = cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      return c.json(cached.data);
    }

    await next();

    // Cache response after handler
    const response = c.res.clone();
    const data = await response.json();

    cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  });
};

// Usage: 5 minute cache
app.get('/api/public-data', cacheMiddleware(5 * 60 * 1000), handler);
```

### Request Validation

```typescript
import { z } from 'zod';

export const validateRequest = <T extends z.ZodType>(schema: T) => {
  return factory.createMiddleware(async (c, next) => {
    try {
      const body = await c.req.json();
      schema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: 'Validation failed',
          cause: err.issues,
        });
      }
      throw err;
    }

    await next();
  });
};
```

## Middleware Composition

```typescript
// Compose multiple middleware
const apiMiddleware = factory.createMiddleware(async (c, next) => {
  // Request ID
  c.set('requestId', crypto.randomUUID());

  // Timing start
  const start = Bun.nanoseconds();

  await next();

  // Timing end
  const duration = (Bun.nanoseconds() - start) / 1_000_000;
  c.res.headers.set('x-request-id', c.get('requestId'));
  c.res.headers.set('x-response-time', `${duration.toFixed(2)}ms`);
});

// Apply composed middleware
app.use('/api/*', apiMiddleware);
```

## Conditional Middleware

```typescript
export const conditionalAuth = (condition: (c: Context) => boolean) => {
  return factory.createMiddleware(async (c, next) => {
    if (condition(c)) {
      await authMiddleware(c, next);
    } else {
      await next();
    }
  });
};

// Skip auth for health checks
app.use('/api/*', conditionalAuth((c) => c.req.path !== '/api/health'));
```

## Middleware Order

```typescript
const app = factory.createApp()
  // Global middleware (runs for all routes)
  .use('*', logger())
  .use('*', requestIdMiddleware)
  .use('*', timingMiddleware)

  // API middleware
  .use('/api/*', cors())
  .use('/api/*', dbMiddleware)

  // Public routes (before auth middleware)
  .get('/api/health', (c) => c.json({ status: 'ok' }))
  .post('/api/auth/login', loginHandler)

  // Protected routes
  .use('/api/*', authMiddleware)
  .get('/api/profile', profileHandler)
  .get('/api/users', usersHandler)

  // Admin routes
  .use('/api/admin/*', requireRole('admin'))
  .get('/api/admin/stats', statsHandler);
```
