# Error Handling

Centralized error handling with `HTTPException` and `onError`.

## HTTPException

Throw typed HTTP errors with status codes and optional metadata.

### Basic Usage

```typescript
import { HTTPException } from 'hono/http-exception';

app.get('/users/:id', (c) => {
  const user = findUser(c.req.param('id'));

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  return c.json({ user });
});
```

### With Cause

```typescript
app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  const user = findUser(id);

  if (!user) {
    throw new HTTPException(404, {
      message: 'User not found',
      cause: { userId: id, timestamp: Date.now() }
    });
  }

  return c.json({ user });
});
```

### Status Codes

```typescript
// 400 Bad Request
throw new HTTPException(400, { message: 'Invalid request' });

// 401 Unauthorized
throw new HTTPException(401, { message: 'Missing or invalid token' });

// 403 Forbidden
throw new HTTPException(403, { message: 'Insufficient permissions' });

// 404 Not Found
throw new HTTPException(404, { message: 'Resource not found' });

// 409 Conflict
throw new HTTPException(409, { message: 'Email already registered' });

// 422 Unprocessable Entity
throw new HTTPException(422, { message: 'Validation failed' });

// 429 Too Many Requests
throw new HTTPException(429, { message: 'Rate limit exceeded' });

// 500 Internal Server Error
throw new HTTPException(500, { message: 'Internal server error' });

// 503 Service Unavailable
throw new HTTPException(503, { message: 'Service temporarily unavailable' });
```

## Custom Error Classes

Extend `HTTPException` for domain-specific errors.

### Common Error Classes

```typescript
import { HTTPException } from 'hono/http-exception';

export class ValidationError extends HTTPException {
  constructor(message: string, issues?: Record<string, string>) {
    super(400, {
      message,
      cause: issues,
    });
  }
}

export class UnauthorizedError extends HTTPException {
  constructor(message = 'Unauthorized') {
    super(401, { message });
  }
}

export class ForbiddenError extends HTTPException {
  constructor(message = 'Forbidden') {
    super(403, { message });
  }
}

export class NotFoundError extends HTTPException {
  constructor(resource: string, id?: string) {
    super(404, {
      message: `${resource} not found`,
      cause: id ? { [resource.toLowerCase() + 'Id']: id } : undefined,
    });
  }
}

export class ConflictError extends HTTPException {
  constructor(message: string, details?: Record<string, any>) {
    super(409, {
      message,
      cause: details,
    });
  }
}

export class RateLimitError extends HTTPException {
  constructor(retryAfter: number) {
    super(429, {
      message: 'Too many requests',
      cause: { retryAfter },
    });
  }
}
```

### Usage

```typescript
// Not found
app.get('/posts/:id', (c) => {
  const post = findPost(c.req.param('id'));

  if (!post) {
    throw new NotFoundError('Post', c.req.param('id'));
  }

  return c.json({ post });
});

// Unauthorized
app.use('/api/*', (c, next) => {
  const token = c.req.header('authorization');

  if (!token) {
    throw new UnauthorizedError('Missing authorization header');
  }

  return next();
});

// Forbidden
app.delete('/posts/:id', (c) => {
  const user = c.get('user');
  const post = findPost(c.req.param('id'));

  if (post.authorId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You can only delete your own posts');
  }

  deletePost(post.id);
  return c.json({ deleted: true });
});

// Conflict
app.post('/users', async (c) => {
  const { email } = await c.req.json();

  const existing = findUserByEmail(email);

  if (existing) {
    throw new ConflictError('Email already registered', { email });
  }

  const user = createUser({ email });
  return c.json({ user }, 201);
});
```

## Centralized Error Handler

Use `onError` to handle all errors in one place.

### Basic Handler

```typescript
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

app.onError((err, c) => {
  console.error('Error:', err);

  // HTTPException (includes custom classes)
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      ...(err.cause && { details: err.cause })
    }, err.status);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation failed',
      issues: err.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
    }, 400);
  }

  // Generic errors
  return c.json({
    error: 'Internal server error'
  }, 500);
});
```

### Production-Safe Handler

```typescript
app.onError((err, c) => {
  const isDev = Bun.env.NODE_ENV !== 'production';

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  // HTTPException
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      ...(err.cause && { details: err.cause })
    }, err.status);
  }

  // Zod validation
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation failed',
      issues: err.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
    }, 400);
  }

  // Generic errors — sanitize in production
  return c.json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack })
  }, 500);
});
```

### Structured Error Logging

```typescript
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn';
  message: string;
  stack?: string;
  context: {
    path: string;
    method: string;
    headers?: Record<string, string>;
    user?: string;
  };
}

app.onError((err, c) => {
  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: err instanceof HTTPException && err.status < 500 ? 'warn' : 'error',
    message: err.message,
    stack: err.stack,
    context: {
      path: c.req.path,
      method: c.req.method,
      user: c.get('user')?.id,
    },
  };

  // Log to external service (e.g., Sentry, LogRocket)
  if (log.level === 'error') {
    logToExternalService(log);
  } else {
    console.warn(JSON.stringify(log));
  }

  // Return response
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  return c.json({ error: 'Internal server error' }, 500);
});
```

## Validation Errors

Handle Zod validation errors with detailed messages.

### Basic Zod Error Handling

```typescript
import { zValidator } from '@hono/zod-validator';
import { ZodError, z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed'),
});

app.post('/posts', zValidator('json', CreatePostSchema), (c) => {
  const data = c.req.valid('json');
  // Data is validated
  return c.json({ post: createPost(data) }, 201);
});

// Handle validation errors in onError
app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation failed',
      issues: err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
    }, 400);
  }

  // Other errors...
});
```

### Custom Validation Messages

```typescript
const EmailSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .refine(
      (email) => email.endsWith('@example.com'),
      'Email must be from example.com domain'
    ),
});

app.post('/validate-email', zValidator('json', EmailSchema), (c) => {
  const { email } = c.req.valid('json');
  return c.json({ valid: true, email });
});
```

### Field-Level Error Formatting

```typescript
app.onError((err, c) => {
  if (err instanceof ZodError) {
    // Group errors by field
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of err.issues) {
      const field = issue.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }

    return c.json({
      error: 'Validation failed',
      fields: fieldErrors,
    }, 400);
  }

  // Other errors...
});

// Example response:
// {
//   "error": "Validation failed",
//   "fields": {
//     "email": ["Invalid email address"],
//     "password": ["Password must be at least 8 characters"],
//     "tags": ["Maximum 5 tags allowed"]
//   }
// }
```

## Not Found Handler

Handle 404 errors for undefined routes.

```typescript
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
  }, 404);
});
```

## Error Recovery

### Graceful Degradation

```typescript
app.get('/data', async (c) => {
  try {
    // Try primary data source
    const data = await fetchFromPrimaryAPI();
    return c.json({ data, source: 'primary' });
  } catch (primaryErr) {
    console.warn('Primary API failed, trying backup:', primaryErr);

    try {
      // Fall back to secondary source
      const data = await fetchFromBackupAPI();
      return c.json({ data, source: 'backup' });
    } catch (backupErr) {
      console.error('Both APIs failed:', backupErr);

      // Return cached data if available
      const cached = getCachedData();
      if (cached) {
        return c.json({ data: cached, source: 'cache' });
      }

      throw new HTTPException(503, {
        message: 'Service temporarily unavailable',
      });
    }
  }
});
```

### Retry Logic

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry logic failed');
}

app.get('/external-data', async (c) => {
  try {
    const data = await retryOperation(() => fetchExternalAPI());
    return c.json({ data });
  } catch (err) {
    throw new HTTPException(503, {
      message: 'External service unavailable',
    });
  }
});
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();

      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }

      return result;
    } catch (err) {
      this.failures++;
      this.lastFailure = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'open';
      }

      throw err;
    }
  }
}

const apiCircuitBreaker = new CircuitBreaker();

app.get('/api/data', async (c) => {
  try {
    const data = await apiCircuitBreaker.execute(() => fetchExternalAPI());
    return c.json({ data });
  } catch (err) {
    if (err.message === 'Circuit breaker is open') {
      throw new HTTPException(503, {
        message: 'Service temporarily unavailable',
      });
    }
    throw err;
  }
});
```

## Database Error Handling

### SQLite Errors

```typescript
app.post('/users', async (c) => {
  const { email, name } = await c.req.json();
  const db = c.get('db');

  try {
    const user = db.query(
      'INSERT INTO users (id, email, name) VALUES (?, ?, ?) RETURNING *'
    ).get(crypto.randomUUID(), email, name);

    return c.json({ user }, 201);
  } catch (err: any) {
    // SQLite unique constraint violation
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new ConflictError('Email already registered', { email });
    }

    // SQLite foreign key constraint
    if (err.message.includes('FOREIGN KEY constraint failed')) {
      throw new ValidationError('Invalid reference');
    }

    // Generic database error
    console.error('Database error:', err);
    throw new HTTPException(500, { message: 'Database error' });
  }
});
```

### Transaction Rollback

```typescript
app.post('/transfer', async (c) => {
  const { fromId, toId, amount } = await c.req.json();
  const db = c.get('db');

  try {
    db.transaction(() => {
      // Deduct from sender
      const sender = db.query(
        'UPDATE accounts SET balance = balance - ? WHERE id = ? RETURNING balance'
      ).get(amount, fromId);

      if (!sender || sender.balance < 0) {
        throw new ValidationError('Insufficient funds');
      }

      // Add to recipient
      db.query(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?'
      ).run(amount, toId);
    })();

    return c.json({ success: true });
  } catch (err) {
    if (err instanceof ValidationError) {
      throw err;
    }

    console.error('Transfer failed:', err);
    throw new HTTPException(500, { message: 'Transfer failed' });
  }
});
```

## Async Error Handling

### Promise Rejection

```typescript
// ❌ Unhandled promise rejection
app.get('/data', (c) => {
  fetchData().then(data => {
    // This won't work — response already sent
    return c.json({ data });
  });

  return c.json({ loading: true }); // Wrong!
});

// ✅ Await async operations
app.get('/data', async (c) => {
  const data = await fetchData();
  return c.json({ data });
});

// ✅ Explicit error handling
app.get('/data', async (c) => {
  try {
    const data = await fetchData();
    return c.json({ data });
  } catch (err) {
    throw new HTTPException(500, { message: 'Failed to fetch data' });
  }
});
```

### Parallel Operations

```typescript
app.get('/dashboard', async (c) => {
  try {
    const [user, posts, stats] = await Promise.all([
      fetchUser(c.get('user').id),
      fetchUserPosts(c.get('user').id),
      fetchUserStats(c.get('user').id),
    ]);

    return c.json({ user, posts, stats });
  } catch (err) {
    console.error('Dashboard fetch failed:', err);
    throw new HTTPException(500, { message: 'Failed to load dashboard' });
  }
});
```

### Timeout Handling

```typescript
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
}

app.get('/slow-api', async (c) => {
  try {
    const data = await withTimeout(fetchSlowAPI(), 5000); // 5s timeout
    return c.json({ data });
  } catch (err) {
    if (err.message === 'Operation timed out') {
      throw new HTTPException(504, { message: 'Gateway timeout' });
    }
    throw err;
  }
});
```

## Error Response Format

### Consistent Structure

```typescript
interface ErrorResponse {
  error: string;
  details?: Record<string, any>;
  timestamp?: string;
  requestId?: string;
}

app.onError((err, c) => {
  const response: ErrorResponse = {
    error: err.message,
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  };

  if (err instanceof HTTPException && err.cause) {
    response.details = err.cause;
  }

  const status = err instanceof HTTPException ? err.status : 500;

  return c.json(response, status);
});
```

### API-Specific Formats

```typescript
// JSON:API format
app.onError((err, c) => {
  return c.json({
    errors: [{
      status: err instanceof HTTPException ? err.status.toString() : '500',
      title: err.message,
      detail: err instanceof HTTPException ? err.cause : undefined,
    }]
  }, err instanceof HTTPException ? err.status : 500);
});

// RFC 7807 Problem Details
app.onError((err, c) => {
  return c.json({
    type: 'about:blank',
    title: err.message,
    status: err instanceof HTTPException ? err.status : 500,
    detail: err instanceof HTTPException ? JSON.stringify(err.cause) : undefined,
    instance: c.req.path,
  }, err instanceof HTTPException ? err.status : 500);
});
```
