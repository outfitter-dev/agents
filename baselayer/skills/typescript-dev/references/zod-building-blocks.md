# Zod Building Blocks

Primitives, refinements, objects, and transforms.

## Primitives

```typescript
z.string()
z.number()
z.boolean()
z.date()
z.unknown()  // prefer over z.any()
z.null()
z.undefined()
z.void()
z.bigint()
z.symbol()
```

## String Refinements

```typescript
z.string().min(1)           // non-empty
z.string().max(100)         // max length
z.string().length(10)       // exact length
z.string().email()          // email format
z.string().uuid()           // UUID format
z.string().url()            // URL format
z.string().cuid()           // CUID format
z.string().cuid2()          // CUID2 format
z.string().ulid()           // ULID format
z.string().regex(/pattern/) // custom pattern
z.string().trim()           // trim whitespace
z.string().toLowerCase()    // lowercase
z.string().toUpperCase()    // uppercase
z.string().datetime()       // ISO datetime
z.string().ip()             // IP address
z.string().base64()         // base64 encoded
```

## Number Refinements

```typescript
z.number().int()            // integer
z.number().positive()       // > 0
z.number().negative()       // < 0
z.number().nonnegative()    // >= 0
z.number().nonpositive()    // <= 0
z.number().min(0).max(100)  // range
z.number().multipleOf(5)    // divisibility
z.number().finite()         // not Infinity
z.number().safe()           // safe integer range
```

## Literals and Enums

```typescript
// Single literal
z.literal("admin")
z.literal(42)
z.literal(true)

// Enum from array (preferred)
z.enum(["admin", "user", "guest"])

// Native enum (avoid if possible)
enum Status { Active, Inactive }
z.nativeEnum(Status)
```

## Arrays and Tuples

```typescript
z.array(z.string())              // string[]
z.array(z.number()).nonempty()   // [number, ...number[]]
z.array(z.string()).min(1)       // at least 1
z.array(z.string()).max(10)      // at most 10
z.array(z.string()).length(5)    // exactly 5

z.tuple([z.string(), z.number()]) // [string, number]
z.tuple([z.string()]).rest(z.number()) // [string, ...number[]]
```

## Optional and Nullable

```typescript
z.string().optional()       // string | undefined
z.string().nullable()       // string | null
z.string().nullish()        // string | null | undefined
z.string().default("value") // never undefined - defaults to "value"
```

## Objects

```typescript
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().optional()
});

type User = z.infer<typeof UserSchema>;
```

### Object Modifiers

```typescript
UserSchema.partial()           // all fields optional
UserSchema.required()          // all fields required
UserSchema.deepPartial()       // nested fields optional too
UserSchema.pick({ id: true })  // select fields
UserSchema.omit({ email: true }) // exclude fields
UserSchema.extend({ role: z.string() }) // add fields
```

### Extra Property Handling

```typescript
UserSchema.strict()      // error on extra fields
UserSchema.passthrough() // keep extra fields
UserSchema.strip()       // remove extra fields (default)
```

## Records and Maps

```typescript
z.record(z.string())                    // Record<string, string>
z.record(z.string(), z.number())        // Record<string, number>
z.map(z.string(), z.object({...}))      // Map<string, object>
z.set(z.string())                       // Set<string>
```

## Unions

```typescript
// Regular union (try first, then second)
z.union([z.string(), z.number()])

// Discriminated union (preferred - type-safe narrowing)
z.discriminatedUnion("type", [
  z.object({ type: z.literal("success"), data: z.string() }),
  z.object({ type: z.literal("error"), code: z.number() })
])
```

## Coercion

Parse from different types (useful for form/query params):

```typescript
z.coerce.string()   // anything -> string
z.coerce.number()   // "42" -> 42, "" -> 0
z.coerce.boolean()  // "true" -> true, "" -> false
z.coerce.date()     // "2024-01-01" -> Date
z.coerce.bigint()   // "123" -> 123n
```

## Transforms

```typescript
// Simple transform
const trimmed = z.string().transform(s => s.trim());

// Transform with type change
const parsed = z.string().transform(s => parseInt(s, 10));
// Input: string, Output: number

// Preprocess (run before validation)
const normalized = z.preprocess(
  val => String(val).toLowerCase(),
  z.enum(["yes", "no"])
);
```

## Refinements

```typescript
// Simple refinement
const positive = z.number().refine(n => n > 0, "Must be positive");

// Multiple refinements
const strongPassword = z.string()
  .min(8)
  .refine(s => /[A-Z]/.test(s), "Need uppercase")
  .refine(s => /[0-9]/.test(s), "Need number");

// superRefine for complex validation
const passwordMatch = z.object({
  password: z.string(),
  confirm: z.string()
}).superRefine((data, ctx) => {
  if (data.password !== data.confirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ["confirm"]
    });
  }
});
```

## Async Refinements

```typescript
const uniqueEmail = z.string().email().refine(
  async (email) => {
    return !(await checkEmailExists(email));
  },
  { message: "Email already exists" }
);

// Must use parseAsync/safeParseAsync
const result = await uniqueEmail.safeParseAsync(email);
```

## Lazy (Recursive)

```typescript
type Category = {
  name: string;
  subcategories: Category[];
};

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(CategorySchema)
  })
);
```

## Pipeline

Chain transformations with intermediate validation:

```typescript
const stringToDate = z.string()
  .pipe(z.coerce.date())
  .pipe(z.date().min(new Date()));
```

## Effects (Deprecated)

Use `.transform()`, `.refine()`, or `.superRefine()` instead.

## Best Practices

**Prefer safeParse**: Returns Result-like object

```typescript
const result = schema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
  return;
}
use(result.data);
```

**Prefer discriminatedUnion**: Better error messages, performance

```typescript
// Slow, unclear errors
z.union([SchemaA, SchemaB])

// Fast, precise errors
z.discriminatedUnion("type", [SchemaA, SchemaB])
```

**Avoid z.any()**: Use z.unknown() and narrow

```typescript
// Bad
z.any()

// Good
z.unknown()
```

**Export schema and type together**:

```typescript
export const UserSchema = z.object({...});
export type User = z.infer<typeof UserSchema>;
```
