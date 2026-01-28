# Workflow: Build New API

Create a Bun HTTP server with Hono from scratch.

<required_reading>

**Read these reference files NOW:**
1. [server-patterns.md](../references/server-patterns.md) - HTTP basics, middleware, streaming

</required_reading>

<prerequisites>

- Bun installed (`bun --version`)
- Empty project directory or existing monorepo location
- API requirements understood (routes, data models)

</prerequisites>

<process>

## Step 1: Initialize Project

```bash
# Create directory if needed
mkdir my-api && cd my-api

# Initialize with Bun
bun init -y

# Install dependencies
bun add hono zod @hono/zod-validator
```

## Step 2: Create Entry Point

Create `src/index.ts`:

```typescript
import { Hono } from 'hono';

const app = new Hono()
  .get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

export default app;
export type AppType = typeof app;

Bun.serve({
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
});

console.log(`Server running on port ${Bun.env.PORT || 3000}`);
```

## Step 3: Add Environment Validation

Create `src/env.ts`:

```typescript
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().optional(),
});

export const env = EnvSchema.parse(Bun.env);
```

Update `src/index.ts` to use validated env:

```typescript
import { env } from './env';

// ... app definition ...

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
```

## Step 4: Add Error Handler

```typescript
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

const app = new Hono()
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  })
  .get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
```

## Step 5: Add First Route Module

Create `src/routes/users.ts`:

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const usersRoutes = new Hono()
  .post('/', zValidator('json', CreateUserSchema), (c) => {
    const data = c.req.valid('json');
    // Create user logic...
    return c.json({ id: crypto.randomUUID(), ...data }, 201);
  })
  .get('/:id', (c) => {
    const id = c.req.param('id');
    // Get user logic...
    return c.json({ id, email: 'user@example.com', name: 'User' });
  });
```

Mount in `src/index.ts`:

```typescript
import { usersRoutes } from './routes/users';

const app = new Hono()
  .onError(/* ... */)
  .get('/health', /* ... */)
  .route('/users', usersRoutes);
```

## Step 6: Verify Server Starts

```bash
# Start development server
bun run --watch src/index.ts

# In another terminal, test health endpoint
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}

# Test user creation
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
# Expected: {"id":"...","email":"test@example.com","name":"Test User"}
```

</process>

<cross_references>

**For route patterns and type safety:** Load the **hono-dev** skill for:
- Factory pattern for shared context
- OpenAPI integration
- Type-safe route chaining

**For database integration:** Continue with [add-database.md](./add-database.md)

</cross_references>

<anti_patterns>

Avoid:
- Skipping environment validation (leads to runtime crashes)
- Forgetting error handler (unhandled errors crash server)
- Not exporting AppType (breaks RPC client type inference)
- String concatenation in SQL (use prepared statements)
- Hardcoding port numbers (use env vars)

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] `bun run src/index.ts` starts without errors
- [ ] `/health` endpoint returns JSON with status "ok"
- [ ] Environment variables are validated at startup
- [ ] Error handler catches and formats errors
- [ ] AppType is exported for RPC client use

</success_criteria>
