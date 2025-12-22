# Zod Integration Patterns

Runtime validation integrated with frameworks and infrastructure.

## API Validation

### Hono + Zod

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin']).default('user')
});

const app = new Hono()
  .post('/users', zValidator('json', UserSchema), async (c) => {
    const user = c.req.valid('json'); // Typed as z.infer<typeof UserSchema>
    const created = await createUser(user);
    return c.json(created, 201);
  })
  .get('/users/:id', zValidator('param', z.object({ id: z.string().uuid() })), async (c) => {
    const { id } = c.req.valid('param');
    const user = await getUser(id);
    return c.json(user);
  });
```

### Query Parameters

```typescript
const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).default('asc')
});

app.get('/users', zValidator('query', QuerySchema), async (c) => {
  const { page, limit, sort, order } = c.req.valid('query');
  // All values typed and validated
});
```

### Request Headers

```typescript
const AuthHeaderSchema = z.object({
  authorization: z.string().startsWith('Bearer ')
});

app.use('/api/*', zValidator('header', AuthHeaderSchema), async (c, next) => {
  const { authorization } = c.req.valid('header');
  const token = authorization.slice(7);
  // Validate token...
  await next();
});
```

## Form Validation

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type FormData = z.infer<typeof FormSchema>;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema)
  });

  const onSubmit = (data: FormData) => {
    // data is typed and validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <input type="password" {...register('confirmPassword')} />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}
```

## Environment Variables

```typescript
const EnvSchema = z.object({
  // Required
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),

  // With defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Optional
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional()
});

// Validate once at startup
function loadEnv() {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
```

## Database Integration

### Type-Safe Queries

```typescript
import { Database } from 'bun:sqlite';
import { z } from 'zod';

const UserRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  created_at: z.string().transform(s => new Date(s))
});

type UserRow = z.infer<typeof UserRowSchema>;

function getUser(db: Database, id: string): UserRow | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

  if (!row) return null;

  const result = UserRowSchema.safeParse(row);
  if (!result.success) {
    throw new Error(`Invalid user row: ${result.error.message}`);
  }

  return result.data;
}

function getAllUsers(db: Database): UserRow[] {
  const rows = db.prepare('SELECT * FROM users').all();
  return z.array(UserRowSchema).parse(rows);
}
```

### Insert Validation

```typescript
const UserInsertSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8)
});

async function createUser(db: Database, input: unknown): Promise<UserRow> {
  const data = UserInsertSchema.parse(input);

  const hashedPassword = await Bun.password.hash(data.password);
  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO users (id, email, name, password)
    VALUES (?, ?, ?, ?)
  `).run(id, data.email, data.name, hashedPassword);

  return getUser(db, id)!;
}
```

## Configuration Files

```typescript
const ConfigSchema = z.object({
  server: z.object({
    port: z.number().int().positive(),
    host: z.string().default('localhost'),
    cors: z.object({
      origins: z.array(z.string().url()),
      credentials: z.boolean().default(false)
    }).optional()
  }),
  database: z.object({
    url: z.string(),
    poolSize: z.number().int().min(1).max(100).default(10)
  }),
  features: z.record(z.boolean()).default({})
});

type Config = z.infer<typeof ConfigSchema>;

async function loadConfig(path: string): Promise<Config> {
  const file = Bun.file(path);
  const content = await file.json();
  return ConfigSchema.parse(content);
}
```

## Webhook Payloads

```typescript
const GitHubPushEvent = z.object({
  ref: z.string(),
  repository: z.object({
    id: z.number(),
    full_name: z.string(),
    private: z.boolean()
  }),
  commits: z.array(z.object({
    id: z.string(),
    message: z.string(),
    author: z.object({
      name: z.string(),
      email: z.string()
    })
  })),
  pusher: z.object({
    name: z.string(),
    email: z.string()
  })
});

app.post('/webhooks/github', async (c) => {
  const payload = await c.req.json();
  const event = c.req.header('X-GitHub-Event');

  if (event === 'push') {
    const result = GitHubPushEvent.safeParse(payload);
    if (!result.success) {
      return c.json({ error: 'Invalid payload' }, 400);
    }
    await handlePush(result.data);
  }

  return c.json({ ok: true });
});
```

## File Uploads

```typescript
const FileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 10 * 1024 * 1024, 'File must be under 10MB')
    .refine(
      f => ['image/jpeg', 'image/png', 'image/gif'].includes(f.type),
      'File must be JPEG, PNG, or GIF'
    )
});

app.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const result = FileUploadSchema.safeParse(body);

  if (!result.success) {
    return c.json({ errors: result.error.flatten() }, 400);
  }

  const { file } = result.data;
  const filename = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
  await Bun.write(`./uploads/${filename}`, file);

  return c.json({ filename }, 201);
});
```

## Error Response Formatting

```typescript
function formatZodError(error: z.ZodError): {
  message: string;
  errors: Array<{ field: string; message: string }>;
} {
  return {
    message: 'Validation failed',
    errors: error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }))
  };
}

app.onError((err, c) => {
  if (err instanceof z.ZodError) {
    return c.json(formatZodError(err), 400);
  }
  // Handle other errors...
});
```

## Async Validation

```typescript
const UniqueEmailSchema = z.string().email()
  .refine(
    async (email) => {
      const existing = await db.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).get(email);
      return !existing;
    },
    { message: 'Email already registered' }
  );

// Must use parseAsync for async refinements
const result = await UniqueEmailSchema.safeParseAsync(email);
```
