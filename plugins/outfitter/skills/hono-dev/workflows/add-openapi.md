# Workflow: Add OpenAPI Documentation

Add OpenAPI/Swagger documentation to an existing Hono API.

<required_reading>

**Read these reference files NOW:**
1. [zod-openapi.md](../references/zod-openapi.md) - Complete OpenAPI integration patterns

</required_reading>

<prerequisites>

- Existing Hono API (any pattern)
- Zod schemas for request/response validation
- Dependencies: `bun add @hono/zod-openapi @hono/swagger-ui`

</prerequisites>

<process>

## Step 1: Install Dependencies

```bash
bun add @hono/zod-openapi @hono/swagger-ui
```

## Step 2: Convert to OpenAPIHono

Replace `Hono` or `factory.createApp()` with `OpenAPIHono`:

```typescript
// BEFORE
import { Hono } from 'hono';
const app = new Hono();

// AFTER
import { OpenAPIHono } from '@hono/zod-openapi';

type Env = {
  Variables: {
    user?: { id: string; role: string };
    db: Database;
  };
};

const app = new OpenAPIHono<Env>();
```

**With factory pattern** (for typed middleware):

```typescript
import { createFactory } from 'hono/factory';
import { OpenAPIHono } from '@hono/zod-openapi';

type Env = {
  Variables: {
    user?: { id: string; role: string };
    db: Database;
  };
};

// Factory for middleware
const factory = createFactory<Env>();

// OpenAPIHono for routes
const app = new OpenAPIHono<Env>();

// Middleware still uses factory
const authMiddleware = factory.createMiddleware(async (c, next) => {
  // ...
});

// Apply middleware
app.use('/api/*', authMiddleware);
```

## Step 3: Register Schemas with .openapi()

```typescript
import { z } from '@hono/zod-openapi';

// Register schemas with names for $ref
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
}).openapi('User');

const CreateUserSchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  name: z.string().min(1).max(100).openapi({ example: 'John Doe' }),
}).openapi('CreateUser');

const ErrorSchema = z.object({
  error: z.string(),
  details: z.record(z.any()).optional(),
}).openapi('Error');
```

## Step 4: Define Routes with createRoute()

```typescript
import { createRoute } from '@hono/zod-openapi';

const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        param: { name: 'id', in: 'path' },
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: z.object({ user: UserSchema }) },
      },
      description: 'User found',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: 'User not found',
    },
  },
  tags: ['Users'],
  summary: 'Get user by ID',
  description: 'Retrieves a single user by their UUID',
});

const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  request: {
    body: {
      content: {
        'application/json': { schema: CreateUserSchema },
      },
      description: 'User data',
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: z.object({ user: UserSchema }) },
      },
      description: 'User created',
    },
    400: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: 'Validation error',
    },
  },
  tags: ['Users'],
  summary: 'Create new user',
});
```

## Step 5: Implement Route Handlers

```typescript
app.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid('param');  // Typed!
  const db = c.get('db');

  const user = db.query('SELECT * FROM users WHERE id = ?').get(id);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user }, 200);
});

app.openapi(createUserRoute, async (c) => {
  const data = c.req.valid('json');  // Typed as CreateUserSchema!
  const db = c.get('db');

  const user = db.query(`
    INSERT INTO users (id, email, name, created_at)
    VALUES (?, ?, ?, datetime('now'))
    RETURNING *
  `).get(crypto.randomUUID(), data.email, data.name);

  return c.json({ user }, 201);
});
```

## Step 6: Add /docs and /openapi.json Routes

```typescript
import { swaggerUI } from '@hono/swagger-ui';

// OpenAPI spec endpoint
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development' },
    { url: 'https://api.example.com', description: 'Production' },
  ],
  tags: [
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Posts', description: 'Blog post endpoints' },
  ],
});

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }));
```

## Step 7: Add Security Schemes (Optional)

```typescript
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
});

// Use in protected routes
const protectedRoute = createRoute({
  method: 'get',
  path: '/protected',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { /* ... */ },
    401: { /* ... */ },
  },
});
```

## Step 8: Verify

```bash
# Start server
bun run src/server.ts

# Check OpenAPI spec
curl http://localhost:3000/openapi.json | jq .

# Open Swagger UI in browser
open http://localhost:3000/docs
```

**Verify in Swagger UI:**
- All routes appear with correct methods
- Request/response schemas are documented
- "Try it out" works for each endpoint
- Examples are shown for request bodies

</process>

<anti_patterns>

Avoid:
- **Forgetting .openapi() on schemas**: Schema names won't appear in spec
- **Mixing regular routes with OpenAPI routes**: Undocumented routes confuse consumers
- **Hardcoding examples in descriptions**: Use `.openapi({ example: ... })` instead
- **Skipping error responses**: Document 400, 401, 404, 500 responses
- **Using `any` in schemas**: Breaks type inference and documentation

```typescript
// BAD: Schema without name
const UserSchema = z.object({ id: z.string() });

// GOOD: Schema registered with name
const UserSchema = z.object({ id: z.string() }).openapi('User');
```

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] @hono/zod-openapi and @hono/swagger-ui installed
- [ ] App uses OpenAPIHono instead of Hono
- [ ] Schemas registered with `.openapi('Name')`
- [ ] Routes defined with `createRoute()`
- [ ] All routes have response schemas (including errors)
- [ ] `/openapi.json` returns valid OpenAPI 3.1 spec
- [ ] `/docs` shows Swagger UI with all routes
- [ ] "Try it out" works in Swagger UI

</success_criteria>

<next_steps>

After adding OpenAPI:
- Ship with documentation: [ship-with-docs.md](./ship-with-docs.md)
- Write tests: [write-tests.md](./write-tests.md)

</next_steps>
