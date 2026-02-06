# Workflow: Add Zod Validation

Add runtime validation at boundaries using Zod schemas.

<when_to_use>

- API endpoints receiving external data
- Environment variable validation
- User input from forms
- Configuration files
- Any untrusted data entering the system

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/zod-integration.md
2. references/zod-building-blocks.md

</required_reading>

<process>

## Step 1: Identify the Boundary

Boundaries are where untrusted data enters your system:

| Boundary | Example |
|----------|---------|
| API endpoint | `request.json()` |
| Environment | `process.env` |
| User input | Form data, URL params |
| External API | Third-party responses |
| File system | JSON/YAML config files |

## Step 2: Define the Schema

```typescript
import { z } from 'zod';

// Define schema with descriptions (critical for AI agents)
const UserInputSchema = z.object({
  email: z.string().email().describe('User email address'),
  name: z.string().min(1).max(100).describe('Display name'),
  age: z.number().int().positive().optional().describe('Optional age'),
});

// Infer TypeScript type from schema
type UserInput = z.infer<typeof UserInputSchema>;
```

## Step 3: Add Validation Call

**Prefer `safeParse` over `parse`:**

```typescript
// safeParse returns Result-like object (doesn't throw)
const result = UserInputSchema.safeParse(rawData);

if (!result.success) {
  // Handle validation errors explicitly
  console.error('Validation failed:', result.error.issues);
  return { ok: false, error: result.error };
}

// result.data is typed as UserInput
const validatedData = result.data;
```

## Step 4: Handle Parse Errors

```typescript
function formatZodError(error: z.ZodError): string {
  return error.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
}

// API handler example
app.post('/users', async (c) => {
  const body = await c.req.json();
  const result = UserInputSchema.safeParse(body);

  if (!result.success) {
    return c.json({
      error: 'Validation failed',
      details: result.error.issues,
    }, 400);
  }

  return c.json(await createUser(result.data));
});
```

## Step 5: Verify

1. Test with valid data - should pass
2. Test with invalid data - should fail with clear errors
3. Test edge cases - empty strings, null, undefined
4. Verify TypeScript catches invalid usage after validation

</process>

<examples>

### Environment Variables

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().min(32),
});

// Validate at startup - fail fast
const env = EnvSchema.parse(process.env);
export { env };
```

### Hono API Endpoint

```typescript
import { zValidator } from '@hono/zod-validator';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

app.post('/users',
  zValidator('json', CreateUserSchema),
  async (c) => {
    const data = c.req.valid('json'); // Typed!
    return c.json(await createUser(data));
  }
);
```

### Discriminated Union Response

```typescript
const ApiResponseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('success'),
    data: z.unknown(),
  }),
  z.object({
    type: z.literal('error'),
    code: z.string(),
    message: z.string(),
  }),
]);
```

</examples>

<anti_patterns>

Avoid:
- Using `parse` (throws) instead of `safeParse` (returns)
- Validating deep in the call stack instead of at boundaries
- Not handling validation errors explicitly
- Missing `.describe()` for AI-readable schemas
- Using `z.union` when `z.discriminatedUnion` works (slower)

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Schema defined with proper types and descriptions
- [ ] `safeParse` used at boundary (not `parse`)
- [ ] Validation errors handled explicitly
- [ ] TypeScript type inferred from schema
- [ ] Valid data passes, invalid data fails with clear errors
- [ ] No `any` types introduced

</success_criteria>

<next_steps>

- Add Result types for errors: `workflows/add-result-types.md`
- Debug type issues: `workflows/debug-types.md`
- See more Zod patterns: `references/zod-schemas.md`

</next_steps>
