# Workflow: Build New API

Create a typed Hono API with proper structure from scratch.

<required_reading>

**Read these reference files NOW:**
1. [factory-pattern.md](../references/factory-pattern.md) - Context typing with createFactory

</required_reading>

<prerequisites>

- Bun installed (`bun --version`)
- Project directory exists or will be created
- Dependencies: `bun add hono zod @hono/zod-validator`

</prerequisites>

<process>

## Step 1: Choose Pattern

Decide based on your needs:

| Pattern | When to Use |
|---------|-------------|
| **Chained** | Simple APIs, no shared context variables |
| **Factory** | Need typed context (user, db, requestId) across middleware and routes |

**Chained pattern** (simpler):
```typescript
import { Hono } from 'hono';

const app = new Hono()
  .get('/health', (c) => c.json({ status: 'ok' }));

export type AppType = typeof app;
export default app;
```

**Factory pattern** (recommended for most APIs):
```typescript
import { createFactory } from 'hono/factory';
import type { Database } from 'bun:sqlite';

type Env = {
  Variables: {
    requestId: string;
    db: Database;
    user?: { id: string; role: 'admin' | 'user' };
  };
};

export const factory = createFactory<Env>();
```

## Step 2: Define Env Type (Factory Pattern)

Add all context variables your API will need:

```typescript
// src/factory.ts
import { createFactory } from 'hono/factory';
import type { Database } from 'bun:sqlite';

type Env = {
  Variables: {
    // Request tracking
    requestId: string;

    // Database
    db: Database;

    // Auth (optional - set by auth middleware)
    user?: {
      id: string;
      email: string;
      role: 'admin' | 'user';
    };
  };
};

export const factory = createFactory<Env>();
export type { Env };
```

## Step 3: Create App with Health Check

```typescript
// src/index.ts
import { factory } from './factory';
import { HTTPException } from 'hono/http-exception';

const app = factory.createApp()
  // Global middleware
  .use('*', async (c, next) => {
    c.set('requestId', crypto.randomUUID());
    await next();
    c.res.headers.set('x-request-id', c.get('requestId'));
  })

  // Health check (always first route)
  .get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      requestId: c.get('requestId'),
    });
  });
```

## Step 4: Export AppType for RPC Client

**Critical:** Export type AFTER all routes are added.

```typescript
// At the END of your main app file
export type AppType = typeof app;
export default app;
```

## Step 5: Add Error Handler

```typescript
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

// Add before export
app.onError((err, c) => {
  const requestId = c.get('requestId');
  const isDev = Bun.env.NODE_ENV !== 'production';

  // Log error
  console.error(`[${requestId}] Error:`, err);

  // HTTPException (includes custom error classes)
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      requestId,
      ...(err.cause && { details: err.cause }),
    }, err.status);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation failed',
      requestId,
      issues: err.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    }, 400);
  }

  // Generic errors - sanitize in production
  return c.json({
    error: isDev ? err.message : 'Internal server error',
    requestId,
    ...(isDev && { stack: err.stack }),
  }, 500);
});

app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
    requestId: c.get('requestId'),
  }, 404);
});
```

## Step 6: Create Server Entry Point

```typescript
// src/server.ts
import app from './index';

const port = Number(Bun.env.PORT) || 3000;

console.log(`Starting server on port ${port}...`);

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
```

## Step 7: Verify

```bash
# Start server
bun run src/server.ts

# Test health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","requestId":"..."}

# Test 404
curl http://localhost:3000/nonexistent
# {"error":"Not found","path":"/nonexistent","requestId":"..."}
```

</process>

<anti_patterns>

Avoid:
- **Breaking the chain**: Never use `app.get()` without chaining (types are lost)
- **Exporting AppType too early**: Export AFTER all routes are defined
- **Using `new Hono()` with factory middleware**: Use `factory.createApp()` instead
- **Mixing factory and non-factory**: Pick one pattern and use consistently
- **Forgetting error handler**: Unhandled errors expose stack traces

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] App uses chained routes OR factory pattern consistently
- [ ] Env type defined with all needed context variables
- [ ] Health check route returns 200 with requestId
- [ ] AppType exported AFTER all routes
- [ ] Error handler catches HTTPException and ZodError
- [ ] 404 handler returns JSON (not HTML)
- [ ] `bun run src/server.ts` starts without errors
- [ ] `curl /health` returns valid JSON

</success_criteria>

<next_steps>

After completing this workflow:
- Add route groups: [add-route-group.md](./add-route-group.md)
- Add custom middleware: [add-middleware.md](./add-middleware.md)
- Add OpenAPI docs: [add-openapi.md](./add-openapi.md)

</next_steps>
