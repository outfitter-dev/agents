# Zod OpenAPI Integration

Schema-first API development with automatic OpenAPI specification generation.

## Installation

```bash
bun add @hono/zod-openapi
bun add @hono/swagger-ui
```

## Basic Setup

```typescript
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

const app = new OpenAPIHono();

// Define routes (see below)

// Generate OpenAPI spec
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
});

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

export default app;
```

## Schema Definition

### Basic Schemas

```typescript
// Register schemas for reuse
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.string().datetime(),
}).openapi('User'); // Register with name

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
}).openapi('CreateUser');

const UpdateUserSchema = CreateUserSchema.partial().openapi('UpdateUser');

const ErrorSchema = z.object({
  error: z.string(),
  details: z.record(z.any()).optional(),
}).openapi('Error');
```

### Schema with Examples

```typescript
const ProductSchema = z.object({
  id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  name: z.string().min(1).max(200).openapi({
    example: 'Laptop',
  }),
  price: z.number().positive().openapi({
    example: 999.99,
  }),
  category: z.enum(['electronics', 'clothing', 'books']).openapi({
    example: 'electronics',
  }),
  tags: z.array(z.string()).optional().openapi({
    example: ['gaming', 'portable'],
  }),
}).openapi('Product');
```

### Schema with Descriptions

```typescript
const PostSchema = z.object({
  id: z.string().uuid().describe('Unique post identifier'),
  title: z.string().min(1).max(200).describe('Post title'),
  content: z.string().min(1).describe('Post content (markdown supported)'),
  published: z.boolean().default(false).describe('Publication status'),
  author: UserSchema.describe('Post author'),
  tags: z.array(z.string()).optional().describe('Post tags for categorization'),
  createdAt: z.string().datetime().describe('Creation timestamp'),
  updatedAt: z.string().datetime().describe('Last update timestamp'),
}).openapi('Post');
```

## Route Definition

### GET Route

```typescript
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
        'application/json': { schema: UserSchema },
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

app.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid('param'); // Typed!

  const user = db.query('SELECT * FROM users WHERE id = ?').get(id);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user, 200);
});
```

### POST Route

```typescript
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
        'application/json': { schema: UserSchema },
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

app.openapi(createUserRoute, async (c) => {
  const data = c.req.valid('json'); // Typed as CreateUserSchema!

  const hashedPassword = await Bun.password.hash(data.password);

  const user = db.query(`
    INSERT INTO users (id, email, name, password)
    VALUES (?, ?, ?, ?)
    RETURNING id, email, name, role, created_at as createdAt
  `).get(crypto.randomUUID(), data.email, data.name, hashedPassword);

  return c.json(user, 201);
});
```

### PUT/PATCH Routes

```typescript
const updateUserRoute = createRoute({
  method: 'put',
  path: '/users/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': { schema: UpdateUserSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: UserSchema },
      },
      description: 'User updated',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: 'User not found',
    },
  },
  tags: ['Users'],
});

app.openapi(updateUserRoute, async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');

  const user = db.query(`
    UPDATE users
    SET email = COALESCE(?, email),
        name = COALESCE(?, name)
    WHERE id = ?
    RETURNING id, email, name, role, created_at as createdAt
  `).get(data.email || null, data.name || null, id);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user, 200);
});
```

### DELETE Route

```typescript
const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/users/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            deleted: z.boolean(),
            user: UserSchema,
          }),
        },
      },
      description: 'User deleted',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: 'User not found',
    },
  },
  tags: ['Users'],
});

app.openapi(deleteUserRoute, (c) => {
  const { id } = c.req.valid('param');

  const user = db.query('DELETE FROM users WHERE id = ? RETURNING *').get(id);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ deleted: true, user }, 200);
});
```

## Query Parameters

```typescript
const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
}).openapi('Pagination');

const listUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  request: {
    query: PaginationSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(UserSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
            totalPages: z.number(),
          }),
        },
      },
      description: 'Users list',
    },
  },
  tags: ['Users'],
});

app.openapi(listUsersRoute, (c) => {
  const { page, limit } = c.req.valid('query'); // Typed with defaults!

  const offset = (page - 1) * limit;

  const users = db.query(
    'SELECT * FROM users LIMIT ? OFFSET ?'
  ).all(limit, offset);

  const total = db.query('SELECT COUNT(*) as count FROM users')
    .get() as { count: number };

  return c.json({
    users,
    total: total.count,
    page,
    limit,
    totalPages: Math.ceil(total.count / limit),
  });
});
```

## Headers

```typescript
const protectedRoute = createRoute({
  method: 'get',
  path: '/protected',
  request: {
    headers: z.object({
      authorization: z.string().openapi({
        example: 'Bearer token123',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ protected: z.boolean() }),
        },
      },
      description: 'Success',
    },
    401: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: 'Unauthorized',
    },
  },
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
});

app.openapi(protectedRoute, (c) => {
  const { authorization } = c.req.valid('header');

  // Verify token...

  return c.json({ protected: true });
});
```

## Security Schemes

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
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
      oauth2: {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: {
              'read:users': 'Read user data',
              'write:users': 'Create and update users',
            },
          },
        },
      },
    },
  },
});

// Use in routes
const secureRoute = createRoute({
  method: 'get',
  path: '/secure',
  security: [
    { bearerAuth: [] },
    { apiKey: [] },
  ],
  // ...
});
```

## Response Types

### Multiple Content Types

```typescript
const getFileRoute = createRoute({
  method: 'get',
  path: '/files/{id}',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            name: z.string(),
            url: z.string(),
          }),
        },
        'application/octet-stream': {
          schema: z.instanceof(Blob),
        },
      },
      description: 'File metadata or content',
    },
  },
});

app.openapi(getFileRoute, (c) => {
  const { id } = c.req.valid('param');
  const accept = c.req.header('accept');

  const file = findFile(id);

  if (accept?.includes('application/octet-stream')) {
    return c.body(file.stream());
  }

  return c.json({ id: file.id, name: file.name, url: file.url });
});
```

### Status Code Unions

```typescript
const route = createRoute({
  method: 'post',
  path: '/action',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ success: z.literal(true) }),
        },
      },
      description: 'Success',
    },
    202: {
      content: {
        'application/json': {
          schema: z.object({ accepted: z.literal(true) }),
        },
      },
      description: 'Accepted for processing',
    },
    400: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: 'Bad request',
    },
  },
});

app.openapi(route, async (c) => {
  const result = await processAction();

  if (result.immediate) {
    return c.json({ success: true }, 200);
  }

  return c.json({ accepted: true }, 202);
});
```

## Nested Resources

```typescript
const getPostCommentsRoute = createRoute({
  method: 'get',
  path: '/posts/{postId}/comments',
  request: {
    params: z.object({
      postId: z.string().uuid(),
    }),
    query: PaginationSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            comments: z.array(CommentSchema),
            total: z.number(),
          }),
        },
      },
      description: 'Comments list',
    },
    404: {
      content: {
        'application/json': { schema: ErrorSchema },
      },
      description: 'Post not found',
    },
  },
  tags: ['Comments'],
});

const createCommentRoute = createRoute({
  method: 'post',
  path: '/posts/{postId}/comments',
  request: {
    params: z.object({
      postId: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            content: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: CommentSchema },
      },
      description: 'Comment created',
    },
  },
  tags: ['Comments'],
});
```

## Grouping Routes

```typescript
// Create separate apps for different resources
const usersApp = new OpenAPIHono();

usersApp.openapi(getUserRoute, getUserHandler);
usersApp.openapi(createUserRoute, createUserHandler);
usersApp.openapi(updateUserRoute, updateUserHandler);
usersApp.openapi(deleteUserRoute, deleteUserHandler);

const postsApp = new OpenAPIHono();

postsApp.openapi(getPostRoute, getPostHandler);
postsApp.openapi(createPostRoute, createPostHandler);

// Combine
const app = new OpenAPIHono()
  .route('/users', usersApp)
  .route('/posts', postsApp);

// Generate combined OpenAPI spec
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Combined API',
    version: '1.0.0',
  },
});
```

## Tags and Organization

```typescript
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API with organized endpoints',
  },
  tags: [
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Posts',
      description: 'Blog post endpoints',
    },
    {
      name: 'Comments',
      description: 'Comment management',
    },
    {
      name: 'Admin',
      description: 'Administrative endpoints',
      externalDocs: {
        description: 'Admin guide',
        url: 'https://docs.example.com/admin',
      },
    },
  ],
});
```

## Custom Validation

```typescript
const EmailSchema = z.string().email().refine(
  (email) => email.endsWith('@example.com'),
  { message: 'Email must be from example.com domain' }
).openapi('CompanyEmail');

const PasswordSchema = z.string().min(8).refine(
  (password) => {
    // Complex password requirements
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    return hasUpper && hasLower && hasNumber && hasSpecial;
  },
  { message: 'Password must contain uppercase, lowercase, number, and special character' }
).openapi('StrongPassword');
```

## With Factory Pattern

```typescript
import { createFactory } from 'hono/factory';
import { OpenAPIHono } from '@hono/zod-openapi';

type Env = {
  Variables: {
    user: { id: string; role: string };
    db: Database;
  };
};

// Use OpenAPIHono directly (doesn't support factory.createApp)
const app = new OpenAPIHono<Env>();

// Create middleware with factory
const factory = createFactory<Env>();

const authMiddleware = factory.createMiddleware(async (c, next) => {
  // Auth logic...
  c.set('user', { id: '123', role: 'admin' });
  await next();
});

// Apply middleware
app.use('*', authMiddleware);

// Define routes
app.openapi(getUserRoute, (c) => {
  const user = c.get('user'); // Typed from Env!
  const db = c.get('db'); // Typed from Env!
  // ...
});
```

## Type Extraction

```typescript
import type { z } from 'zod';

// Extract inferred type from schema
type User = z.infer<typeof UserSchema>;

type CreateUserInput = z.infer<typeof CreateUserSchema>;

type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Use in application code
function saveUser(user: User) {
  // ...
}

function validateUser(input: CreateUserInput): User {
  // ...
}
```

## Testing OpenAPI Routes

```typescript
import { testClient } from 'hono/testing';

describe('OpenAPI Routes', () => {
  const client = testClient(app);

  test('POST /users validates schema', async () => {
    const res = await client.users.$post({
      json: {
        email: 'invalid-email', // Invalid!
        name: 'John',
        password: 'pass',
      }
    });

    expect(res.status).toBe(400);

    const error = await res.json();
    expect(error.error).toBeTruthy();
  });

  test('GET /openapi.json returns valid spec', async () => {
    const res = await client['openapi.json'].$get();

    expect(res.status).toBe(200);

    const spec = await res.json();

    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info).toBeTruthy();
    expect(spec.paths).toBeTruthy();
  });
});
```

## Common Patterns

### Reusable Error Responses

```typescript
const errorResponses = {
  400: {
    content: { 'application/json': { schema: ErrorSchema } },
    description: 'Bad request',
  },
  401: {
    content: { 'application/json': { schema: ErrorSchema } },
    description: 'Unauthorized',
  },
  403: {
    content: { 'application/json': { schema: ErrorSchema } },
    description: 'Forbidden',
  },
  404: {
    content: { 'application/json': { schema: ErrorSchema } },
    description: 'Not found',
  },
  500: {
    content: { 'application/json': { schema: ErrorSchema } },
    description: 'Internal server error',
  },
};

// Use in routes
const route = createRoute({
  method: 'get',
  path: '/resource',
  responses: {
    200: {
      content: { 'application/json': { schema: ResourceSchema } },
      description: 'Success',
    },
    ...errorResponses, // Spread common errors
  },
});
```

### Reusable Request Schemas

```typescript
const authHeaders = z.object({
  authorization: z.string(),
});

const route = createRoute({
  method: 'get',
  path: '/protected',
  request: {
    headers: authHeaders, // Reuse
  },
  // ...
});
```
