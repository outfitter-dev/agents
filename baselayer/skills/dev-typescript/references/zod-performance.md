# Performance Optimization

Strategies for optimizing Zod validation performance in production applications.

## Schema Caching

### Module-level caching

Always create schemas at module level, never in functions or render loops.

```typescript
// ❌ BAD - Recreates schema every call
function validateUser(data: unknown) {
  const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string()
  });
  return UserSchema.safeParse(data);
}

// ✅ GOOD - Schema created once at module load
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
});

function validateUser(data: unknown) {
  return UserSchema.safeParse(data);
}
```

### React component caching

```typescript
// ❌ BAD - Schema recreated every render
function UserForm() {
  const schema = z.object({
    email: z.string().email(),
    name: z.string()
  });

  const { register } = useForm({
    resolver: zodResolver(schema)
  });

  return <form>...</form>;
}

// ✅ GOOD - Schema defined outside component
const FormSchema = z.object({
  email: z.string().email(),
  name: z.string()
});

function UserForm() {
  const { register } = useForm({
    resolver: zodResolver(FormSchema)
  });

  return <form>...</form>;
}

// ✅ ALSO GOOD - useMemo for dynamic schemas
function DynamicForm({ includePhone }: { includePhone: boolean }) {
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(),
        name: z.string(),
        ...(includePhone && { phone: z.string() })
      }),
    [includePhone]
  );

  const { register } = useForm({
    resolver: zodResolver(schema)
  });

  return <form>...</form>;
}
```

### Schema composition caching

```typescript
// ❌ BAD - Composition happens every time
function getUpdateSchema(fields: string[]) {
  let schema = UserSchema;
  for (const field of fields) {
    schema = schema.extend({ [field]: z.string() });
  }
  return schema;
}

// ✅ GOOD - Cache composed schemas
const schemaCache = new Map<string, z.ZodType>();

function getUpdateSchema(fields: string[]): z.ZodType {
  const key = fields.sort().join(",");

  if (!schemaCache.has(key)) {
    let schema = UserSchema;
    for (const field of fields) {
      schema = schema.extend({ [field]: z.string() });
    }
    schemaCache.set(key, schema);
  }

  return schemaCache.get(key)!;
}
```

## Lazy Evaluation

### Lazy schemas for optional paths

Use `z.lazy()` for expensive schemas that may not be needed.

```typescript
// ❌ Eager - Creates entire nested schema even if optional field not present
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  profile: z
    .object({
      bio: z.string(),
      avatar: z.string().url(),
      settings: z.object({
        theme: z.enum(["light", "dark"]),
        notifications: z.object({
          email: z.boolean(),
          push: z.boolean(),
          sms: z.boolean()
        })
      })
    })
    .optional()
});

// ✅ Lazy - Only creates nested schema if profile exists
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  profile: z
    .lazy(() =>
      z.object({
        bio: z.string(),
        avatar: z.string().url(),
        settings: z.object({
          theme: z.enum(["light", "dark"]),
          notifications: z.object({
            email: z.boolean(),
            push: z.boolean(),
            sms: z.boolean()
          })
        })
      })
    )
    .optional()
});
```

### Conditional lazy loading

```typescript
// Only validate expensive fields when needed
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Lazy load detailed specs only if present
  detailedSpecs: z
    .lazy(() =>
      z.object({
        dimensions: z.object({
          length: z.number(),
          width: z.number(),
          height: z.number()
        }),
        materials: z.array(z.string()),
        certifications: z.array(
          z.object({
            name: z.string(),
            issuedBy: z.string(),
            expiresAt: z.coerce.date()
          })
        )
      })
    )
    .optional()
});
```

## parse() vs safeParse()

### Performance characteristics

```typescript
// parse() - Faster when validation succeeds (no Result allocation)
try {
  const user = UserSchema.parse(data);
  // Use user
} catch (error) {
  // Handle error (slower path due to exception)
  if (error instanceof z.ZodError) {
    console.error(error.issues);
  }
}

// safeParse() - Consistent performance, always allocates Result
const result = UserSchema.safeParse(data);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error (no exception overhead)
  console.error(result.error.issues);
}
```

### When to use each

```typescript
// ✅ Use parse() for internal data (high success rate)
function processInternalEvent(event: unknown) {
  // Events from our own system should always be valid
  const validated = EventSchema.parse(event);
  return handleEvent(validated);
}

// ✅ Use safeParse() for external data (may fail)
function processUserInput(input: unknown) {
  const result = InputSchema.safeParse(input);
  if (!result.success) {
    return { error: formatErrors(result.error) };
  }
  return { data: result.data };
}

// ✅ Use safeParse() in loops (avoid exception overhead)
function validateMany(items: unknown[]) {
  const results = items.map((item) => ItemSchema.safeParse(item));
  const valid = results.filter((r) => r.success).map((r) => r.data);
  const invalid = results.filter((r) => !r.success);
  return { valid, invalid };
}
```

## Batch Validation

### Array validation optimization

```typescript
// ❌ BAD - Validates items individually
const results = items.map((item) => UserSchema.safeParse(item));

// ✅ GOOD - Single validation for entire array
const ArraySchema = z.array(UserSchema);
const result = ArraySchema.safeParse(items);

if (!result.success) {
  // result.error contains all validation errors with paths
  console.error(result.error.issues);
}

// Access validated array
const validatedItems = result.success ? result.data : [];
```

### Early termination

```typescript
// Stop at first error for quick feedback
function validateUntilError(items: unknown[]) {
  for (const item of items) {
    const result = ItemSchema.safeParse(item);
    if (!result.success) {
      return { success: false, error: result.error };
    }
  }
  return { success: true };
}

// Collect all errors
function validateAll(items: unknown[]) {
  const ArraySchema = z.array(ItemSchema);
  return ArraySchema.safeParse(items);
}
```

## Partial Parsing

### Validate only needed fields

When working with large objects, validate only the fields you need.

```typescript
// Large database row with 50+ columns
const DatabaseRow = z.object({
  id: z.string(),
  // ... 50+ fields
});

// ❌ BAD - Validates all 50+ fields
function getUserId(row: unknown) {
  const validated = DatabaseRow.parse(row);
  return validated.id;
}

// ✅ GOOD - Only validates needed fields
const IdOnlySchema = DatabaseRow.pick({ id: true });

function getUserId(row: unknown) {
  const validated = IdOnlySchema.parse(row);
  return validated.id;
}

// ✅ EVEN BETTER - Direct field validation
const IdSchema = z.object({ id: z.string() });

function getUserId(row: unknown) {
  const validated = IdSchema.parse(row);
  return validated.id;
}
```

### Progressive validation

```typescript
// Validate cheap fields first, expensive ones later
function validateProgressively(data: unknown) {
  // Step 1: Validate shape and basic types
  const BasicSchema = z.object({
    id: z.string(),
    type: z.enum(["user", "admin"]),
    email: z.string()
  });

  const basic = BasicSchema.safeParse(data);
  if (!basic.success) {
    return basic; // Fail fast
  }

  // Step 2: Validate format (more expensive)
  const FormatSchema = BasicSchema.extend({
    email: z.string().email(), // regex validation
    id: z.string().uuid() // more complex regex
  });

  const format = FormatSchema.safeParse(data);
  if (!format.success) {
    return format;
  }

  // Step 3: Expensive async validation (if needed)
  // ...

  return format;
}
```

## Avoid Re-validation

### Memoize validation results

```typescript
// ❌ BAD - Validates on every render
function UserProfile({ data }: { data: unknown }) {
  const result = UserSchema.safeParse(data);

  if (!result.success) {
    return <ErrorDisplay error={result.error} />;
  }

  return <Profile user={result.data} />;
}

// ✅ GOOD - Memoize validation
function UserProfile({ data }: { data: unknown }) {
  const result = useMemo(
    () => UserSchema.safeParse(data),
    [data]
  );

  if (!result.success) {
    return <ErrorDisplay error={result.error} />;
  }

  return <Profile user={result.data} />;
}

// ✅ BETTER - Validate before rendering
const result = UserSchema.safeParse(data);
if (!result.success) {
  return <ErrorDisplay error={result.error} />;
}
return <UserProfile user={result.data} />;
```

### Type assertions after validation

```typescript
// Validate once, then use type assertion
const result = UserSchema.safeParse(data);

if (!result.success) {
  throw new Error("Invalid user data");
}

// Now we know it's valid, can use assertion
const user = data as User; // Safe because we validated

// Better: just use result.data
const user = result.data;
```

## Refinement Performance

### Avoid expensive refinements

```typescript
// ❌ BAD - Expensive regex in refinement
const EmailSchema = z.string().refine(
  (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
  "Invalid email"
);

// ✅ GOOD - Use built-in validator
const EmailSchema = z.string().email();

// ❌ BAD - Database call in synchronous refinement
const UniqueEmailSchema = z.string().email().refine((email) => {
  // This blocks!
  const existing = db.users.findByEmailSync(email);
  return !existing;
});

// ✅ GOOD - Use async refinement
const UniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const existing = await db.users.findByEmail(email);
    return !existing;
  },
  { message: "Email already exists" }
);

// Must use parseAsync
await UniqueEmailSchema.parseAsync(email);
```

### Early refinements

```typescript
// ❌ BAD - Expensive refinement runs even if basic validation fails
const Schema = z
  .string()
  .refine(expensiveCheck, "Expensive check failed")
  .min(1, "Required");

// ✅ GOOD - Cheap validation first
const Schema = z
  .string()
  .min(1, "Required")
  .refine(expensiveCheck, "Expensive check failed");
```

### Combine refinements

```typescript
// ❌ BAD - Multiple passes over data
const Password = z
  .string()
  .refine((val) => val.length >= 8, "Too short")
  .refine((val) => /[A-Z]/.test(val), "Need uppercase")
  .refine((val) => /[a-z]/.test(val), "Need lowercase")
  .refine((val) => /[0-9]/.test(val), "Need number");

// ✅ GOOD - Single pass with superRefine
const Password = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Too short"
    });
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Need uppercase"
    });
  }
  if (!/[a-z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Need lowercase"
    });
  }
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Need number"
    });
  }
});
```

## Transform Performance

### Minimize transformations

```typescript
// ❌ BAD - Multiple transform steps
const Schema = z
  .string()
  .transform((val) => val.toLowerCase())
  .transform((val) => val.trim())
  .transform((val) => val.replace(/\s+/g, "-"));

// ✅ GOOD - Single transform
const Schema = z.string().transform((val) =>
  val.toLowerCase().trim().replace(/\s+/g, "-")
);
```

### Preprocess for coercion

```typescript
// Preprocess is more efficient than transform for type coercion
const NumberSchema = z.preprocess(
  (val) => (typeof val === "string" ? Number(val) : val),
  z.number()
);

// Equivalent to z.coerce.number() but more explicit
```

## Benchmarking

### Measuring validation performance

```typescript
function benchmark(name: string, fn: () => void, iterations = 10000) {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const end = performance.now();
  const duration = end - start;
  const opsPerSecond = (iterations / duration) * 1000;

  console.log(`${name}: ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/sec)`);
}

// Compare different approaches
const data = { id: "123", email: "user@example.com", name: "John" };

benchmark("parse", () => {
  try {
    UserSchema.parse(data);
  } catch {}
});

benchmark("safeParse", () => {
  UserSchema.safeParse(data);
});

benchmark("pick", () => {
  UserSchema.pick({ id: true }).parse(data);
});
```

## Production Optimizations

### Schema compilation (future)

Zod doesn't currently support schema compilation, but you can prepare for it:

```typescript
// Define schemas at module level for potential future compilation
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
});

// If Zod adds .compile() in future:
// export const UserSchema = UserSchemaDefinition.compile();
```

### Conditional validation depth

```typescript
// In development: full validation
// In production: lighter validation

const strictMode = process.env.NODE_ENV === "development";

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  ...(strictMode && {
    // Extra validation only in development
    metadata: z.record(z.unknown()).refine(/* expensive check */),
    tags: z.array(z.string()).min(1)
  })
});
```

### Error formatting optimization

```typescript
// ❌ BAD - Formats all errors even if only showing first
function formatErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message
  }));
}

// ✅ GOOD - Format only what's needed
function formatFirstError(error: z.ZodError) {
  const first = error.issues[0];
  return {
    field: first.path.join("."),
    message: first.message
  };
}

// ✅ GOOD - Lazy formatting
function* formatErrorsLazy(error: z.ZodError) {
  for (const issue of error.issues) {
    yield {
      field: issue.path.join("."),
      message: issue.message
    };
  }
}

// Use only what you need
const errors = formatErrorsLazy(error);
const firstError = errors.next().value;
```

## Summary

**Key optimizations**:

1. Cache schemas at module level
2. Use `z.lazy()` for optional expensive schemas
3. Prefer `safeParse()` for user input, `parse()` for internal data
4. Validate arrays as a whole, not individually
5. Use `pick()`/`omit()` to validate only needed fields
6. Combine refinements into single `superRefine()`
7. Minimize transforms and combine them
8. Memoize validation results in React
9. Format errors lazily
10. Benchmark critical paths

**Typical gains**:
- Schema caching: 10-100x faster
- Batch validation: 2-5x faster
- Partial validation: 2-10x faster (depending on schema size)
- Combined refinements: 1.5-3x faster
