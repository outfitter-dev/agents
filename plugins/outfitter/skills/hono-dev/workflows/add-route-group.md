# Workflow: Add Route Group

Add a new route module while preserving full type inference.

<required_reading>

**Read these reference files NOW:**
1. [factory-pattern.md](../references/factory-pattern.md) - Multi-module structure section

</required_reading>

<prerequisites>

- Existing Hono app using factory pattern (or chained pattern)
- Factory exported from shared location (if using factory pattern)
- Understanding of how `.route()` mounts sub-apps

</prerequisites>

<process>

## Step 1: Create Route File

Create a new file in your routes directory:

```typescript
// src/routes/users.ts
import { factory } from '../factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';

// Schemas
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const UpdateUserSchema = CreateUserSchema.partial();

// Route group using factory (access to typed context)
export const usersRoute = factory.createApp()
  .get('/', (c) => {
    const db = c.get('db');
    const users = db.query('SELECT id, email, name FROM users').all();
    return c.json({ users });
  })

  .get('/:id', (c) => {
    const db = c.get('db');
    const user = db.query('SELECT * FROM users WHERE id = ?')
      .get(c.req.param('id'));

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json({ user });
  })

  .post('/', zValidator('json', CreateUserSchema), (c) => {
    const db = c.get('db');
    const data = c.req.valid('json');

    const user = db.query(`
      INSERT INTO users (id, email, name)
      VALUES (?, ?, ?)
      RETURNING *
    `).get(crypto.randomUUID(), data.email, data.name);

    return c.json({ user }, 201);
  })

  .put('/:id', zValidator('json', UpdateUserSchema), (c) => {
    const db = c.get('db');
    const data = c.req.valid('json');

    const user = db.query(`
      UPDATE users
      SET email = COALESCE(?, email),
          name = COALESCE(?, name)
      WHERE id = ?
      RETURNING *
    `).get(data.email || null, data.name || null, c.req.param('id'));

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json({ user });
  })

  .delete('/:id', (c) => {
    const db = c.get('db');
    const user = db.query('DELETE FROM users WHERE id = ? RETURNING *')
      .get(c.req.param('id'));

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json({ deleted: true });
  });
```

## Step 2: Export Route for Type Safety

The route must be exported for mounting AND type inference:

```typescript
// At end of src/routes/users.ts
export { usersRoute };
```

## Step 3: Mount with .route() in Main App

```typescript
// src/index.ts
import { factory } from './factory';
import { usersRoute } from './routes/users';
import { postsRoute } from './routes/posts';

const app = factory.createApp()
  // Global middleware
  .use('*', requestIdMiddleware)
  .use('*', dbMiddleware)

  // Health check
  .get('/health', (c) => c.json({ status: 'ok' }))

  // Mount route groups
  .route('/users', usersRoute)
  .route('/posts', postsRoute);

// Export type AFTER all routes mounted
export type AppType = typeof app;
export default app;
```

## Step 4: Verify AppType Includes New Routes

```typescript
// In a separate test file or client
import type { AppType } from './index';
import { hc } from 'hono/client';

const client = hc<AppType>('http://localhost:3000');

// These should all type-check:
client.users.$get();
client.users[':id'].$get({ param: { id: '123' } });
client.users.$post({ json: { email: 'a@b.com', name: 'Test' } });
client.posts.$get();  // Other routes also typed
```

## Step 5: Adding Protected Routes Within Group

To add auth-required routes within a route group:

```typescript
// src/routes/users.ts
import { authMiddleware, requireRole } from '../middleware/auth';

export const usersRoute = factory.createApp()
  // Public routes
  .get('/', publicListHandler)
  .get('/:id', publicGetHandler)

  // Protected routes (auth required)
  .use(authMiddleware)
  .post('/', createHandler)
  .put('/:id', updateHandler)

  // Admin-only routes
  .use(requireRole('admin'))
  .delete('/:id', deleteHandler);
```

</process>

<anti_patterns>

Avoid:
- **Breaking chain in route file**: Keep all routes chained with `.get().post().put()`
- **Using `new Hono()` in route files**: Use `factory.createApp()` to preserve context types
- **Mounting routes after exporting AppType**: Mount ALL routes BEFORE export
- **Forgetting to export the route**: Must export for both mounting and types
- **Path duplication**: Don't include base path in route handlers (`/` not `/users`)

```typescript
// BAD: Breaking chain
export const usersRoute = factory.createApp();
usersRoute.get('/', handler);  // Types lost!

// GOOD: Keep chain intact
export const usersRoute = factory.createApp()
  .get('/', handler);
```

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Route file uses `factory.createApp()` (if factory pattern)
- [ ] All routes chained without breaking
- [ ] Route exported from file
- [ ] Route mounted with `.route('/path', routeGroup)` in main app
- [ ] AppType exported AFTER route mounting
- [ ] RPC client can access new routes with full type inference
- [ ] Context variables (db, user, etc.) accessible in route handlers

</success_criteria>

<next_steps>

After adding route groups:
- Add custom middleware for the group: [add-middleware.md](./add-middleware.md)
- Add OpenAPI documentation: [add-openapi.md](./add-openapi.md)
- Write tests: [write-tests.md](./write-tests.md)

</next_steps>
