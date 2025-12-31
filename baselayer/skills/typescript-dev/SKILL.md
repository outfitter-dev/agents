---
name: typescript-dev
version: 1.0.0
description: Comprehensive TypeScript patterns including strict type safety, modern TS 5.5+ features, and Zod runtime validation. Use when writing TypeScript, validating data, modernizing code, eliminating any types, implementing Result patterns, or when TypeScript, Zod, strict types, or --ts-dev flag mentioned.
---

# TypeScript Development

Type-safe code → compile-time errors → runtime confidence.

<when_to_use>

- Writing new TypeScript code
- Eliminating `any` types and improving type precision
- Using modern TypeScript 5.5+ features
- Validating API inputs/outputs with Zod
- Implementing Result types and discriminated unions
- Creating branded types for domain concepts
- Form and environment variable validation
- Modernizing codebase patterns

NOT for: runtime-only logic unrelated to types, non-TypeScript projects

</when_to_use>

<config>

**tsconfig.json** strict settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": false
  }
}
```

**Version requirements**:
- TS 5.2+: `using`, `await using`, Disposable
- TS 5.4+: NoInfer utility type
- TS 5.5+: Inferred type predicates
- TS 5.6+: Iterator helpers
- TS 5.7+: Path rewriting

</config>

## Core Type Patterns

<eliminating_any>

Problem: `any` defeats the type system.

```typescript
// ❌ NEVER
function processData(data: any) {
  return data.value.toString(); // Runtime error waiting
}

// ✅ ALWAYS — unknown + type guard
function processData(data: unknown): string {
  if (!isDataWithValue(data)) {
    throw new TypeError('Invalid data structure');
  }
  return data.value.toString();
}

function isDataWithValue(value: unknown): value is { value: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value
  );
}
```

**Common patterns**:

API responses:

```typescript
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();
  return validateUser(data); // Validate at boundary
}
```

Event handlers:

```typescript
// ❌ any event
function handleClick(event: any) { ... }

// ✅ Specific type
function handleClick(event: MouseEvent<HTMLButtonElement>) { ... }
```

</eliminating_any>

<result_types>

Problem: Exceptions hide error cases from types.

```typescript
// Type shows all possible outcomes
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

type UserError =
  | { readonly type: 'not-found'; readonly id: string }
  | { readonly type: 'network'; readonly message: string }
  | { readonly type: 'invalid-data'; readonly details: string };

async function getUser(id: string): Promise<Result<User, UserError>> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, error: { type: 'not-found', id } };
      }
      return { ok: false, error: { type: 'network', message: response.statusText } };
    }

    const data: unknown = await response.json();
    if (!isUser(data)) {
      return { ok: false, error: { type: 'invalid-data', details: 'Invalid shape' } };
    }

    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: { type: 'network', message: error instanceof Error ? error.message : 'Unknown' }
    };
  }
}

// Usage forces error handling
const result = await getUser(id);
if (!result.ok) {
  switch (result.error.type) {
    case 'not-found': return showNotFound(result.error.id);
    case 'network': return showNetworkError(result.error.message);
    case 'invalid-data': return showDataError(result.error.details);
    default: return assertNever(result.error);
  }
}
return renderUser(result.value);
```

See [result-pattern.md](references/result-pattern.md) for utilities.

</result_types>

<discriminated_unions>

Problem: Loose types allow illegal state combinations.

```typescript
// ❌ Illegal states possible
type Request = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: User;
  error?: string;
};
// { status: 'loading', data: user, error: 'Failed' } is legal but nonsensical

// ✅ Only valid states possible
type RequestState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: User }
  | { readonly status: 'error'; readonly error: string };

// Exhaustive pattern matching
function renderRequest(state: RequestState): JSX.Element {
  switch (state.status) {
    case 'idle': return <div>Ready</div>;
    case 'loading': return <div>Loading...</div>;
    case 'success': return <div>{state.data.name}</div>;
    case 'error': return <div>Error: {state.error}</div>;
    default: return assertNever(state);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled: ${JSON.stringify(value)}`);
}
```

</discriminated_unions>

<branded_types>

Problem: Primitive types allow mixing incompatible values.

```typescript
// ❌ Can mix user/product IDs
type UserId = string;
type ProductId = string;
await getUser(productId); // No error, but wrong!

// ✅ Branded types prevent mixing
declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;

function createUserId(value: string): UserId {
  if (!/^user-\d+$/.test(value)) {
    throw new TypeError(`Invalid user ID: ${value}`);
  }
  return value as UserId;
}

const userId = createUserId('user-123');
const productId = createProductId('prod-456');
// await getUser(productId); // ❌ Type error!
await getUser(userId); // ✅ Works
```

Security with branded types:

```typescript
type SanitizedHtml = Brand<string, 'SanitizedHtml'>;

function sanitizeHtml(raw: string): SanitizedHtml {
  return escapeHtml(raw) as SanitizedHtml;
}

function renderHtml(html: SanitizedHtml): void {
  document.body.innerHTML = html; // Safe
}

// renderHtml(userInput); // ❌ Type error
renderHtml(sanitizeHtml(userInput)); // ✅ Must sanitize first
```

See [branded-types.md](references/branded-types.md) for advanced patterns.

</branded_types>

## Modern TypeScript (5.5+)

<resource_management>

TS 5.2+ introduced `using` for automatic resource cleanup.

```typescript
class DatabaseConnection implements Disposable {
  [Symbol.dispose]() {
    this.close();
  }
  close() { /* cleanup */ }
}

function queryDatabase() {
  using connection = new DatabaseConnection();
  // Automatically closed when scope exits
  return connection.query('SELECT * FROM users');
}

// Async disposal
class AsyncResource implements AsyncDisposable {
  async [Symbol.asyncDispose]() {
    await this.asyncCleanup();
  }
}

async function asyncWork() {
  await using resource = new AsyncResource();
  // Automatically disposed with await when scope exits
}
```

Use for: database connections, file handles, locks, HTTP connections, transactions.

</resource_management>

<satisfies_operator>

TS 4.9+ validates type without widening inference.

```typescript
// ✅ Preserve literal types while validating
const config = {
  port: 3000,
  host: 'localhost',
  ssl: true
} satisfies Record<string, string | number | boolean>;

config.port // number (not string | number | boolean)

// Combine with as const for immutability
const routes = {
  home: '/',
  user: '/user/:id'
} as const satisfies Record<string, string>;

type HomeRoute = typeof routes.home; // '/'
```

Use `satisfies` when: config objects, route definitions, schema definitions, API response shapes.

</satisfies_operator>

<const_type_parameters>

TS 5.0+ preserves literal types through generics.

```typescript
// ✅ Preserve literal types
function makeTuple<const T extends readonly unknown[]>(...args: T): T {
  return args;
}

const result = makeTuple('a', 'b', 'c');
// Type: ['a', 'b', 'c'] (not string[])

// Route definitions
function defineRoutes<const T extends Record<string, string>>(routes: T): T {
  return routes;
}

const routes = defineRoutes({
  home: '/',
  user: '/user/:id'
});
// Type: { home: '/'; user: '/user/:id' }
```

</const_type_parameters>

<inferred_type_predicates>

TS 5.5+ automatically infers type predicates.

```typescript
// ✅ Automatic inference (TS 5.5+)
function isString(x: unknown) {
  return typeof x === 'string';
}
// TypeScript infers: (x: unknown) => x is string

const values: unknown[] = ['a', 1, 'b'];
const strings = values.filter(isString); // string[]

// Manual annotation still needed for negation
function isNotNull<T>(x: T | null): x is T {
  return x !== null;
}
```

</inferred_type_predicates>

<template_literals>

Advanced string pattern matching at type level.

```typescript
type Route = `/${string}`;
type ApiRoute = `/api/v${number}/${string}`;

// Pattern extraction
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
    ? Param
    : never;

type Params = ExtractParams<'/user/:id/post/:postId'>; // 'id' | 'postId'
```

See [modern-features.md](references/modern-features.md) for comprehensive coverage.

</template_literals>

## Zod Runtime Validation

<zod_fundamentals>

Schema = runtime validation + TypeScript type.

```typescript
import { z } from 'zod';

// ✅ Schema defines both validation and type
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100)
});

type User = z.infer<typeof UserSchema>;
// Type extracted from schema, always in sync

// safeParse returns Result-like object (preferred)
const result = UserSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
  return;
}
const user = result.data; // typed as User

// parse throws on failure
try {
  const user = UserSchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) { /* handle */ }
}
```

**Prefer safeParse**: explicit error handling, no exceptions.

</zod_fundamentals>

<zod_primitives>

```typescript
// Primitives
z.string()
z.number()
z.boolean()
z.date()
z.unknown()  // prefer over z.any()

// String refinements
z.string().min(1)           // non-empty
z.string().email()          // email format
z.string().uuid()           // UUID format
z.string().url()            // URL format
z.string().regex(/pattern/) // custom pattern
z.string().trim()           // trim whitespace

// Number refinements
z.number().int()            // integer
z.number().positive()       // > 0
z.number().min(0).max(100)  // range

// Literals and enums
z.literal("admin")
z.enum(["admin", "user", "guest"])

// Arrays
z.array(z.string())
z.array(z.number()).nonempty()

// Optional/nullable
z.string().optional()       // string | undefined
z.string().nullable()       // string | null
z.string().default("value") // never undefined
```

</zod_primitives>

<zod_objects>

```typescript
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().optional()
});

// Composition
const BaseSchema = z.object({ id: z.string() });
const ExtendedSchema = BaseSchema.extend({ name: z.string() });

// Pick/omit
const PublicUser = UserSchema.pick({ id: true, name: true });
const UserWithoutEmail = UserSchema.omit({ email: true });

// Partial for updates
const UserUpdate = UserSchema.partial();
const DeepPartial = UserSchema.deepPartial();

// Strict vs passthrough
UserSchema.strict().parse(data);      // Error on extra fields
UserSchema.passthrough().parse(data); // Keep extra fields
UserSchema.strip().parse(data);       // Remove extra (default)
```

</zod_objects>

<zod_discriminated_unions>

```typescript
// ✅ Discriminated union (preferred)
const Result = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("error"), error: z.string() })
]);

// API response pattern
const ApiResponse = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("success"),
    data: z.unknown(),
    timestamp: z.string().datetime()
  }),
  z.object({
    type: z.literal("error"),
    code: z.string(),
    message: z.string()
  }),
  z.object({
    type: z.literal("validation_error"),
    errors: z.array(z.object({
      field: z.string(),
      message: z.string()
    }))
  })
]);

type ApiResponse = z.infer<typeof ApiResponse>;
```

</zod_discriminated_unions>

<zod_transforms>

```typescript
// Coercion (parse from string)
z.coerce.number()  // "42" → 42
z.coerce.boolean() // "true" → true
z.coerce.date()    // "2024-01-01" → Date

// Custom transforms
const trimmedString = z.string().transform(s => s.trim());

// Transform with validation
const positiveNumber = z.number()
  .refine(n => n > 0, { message: "Must be positive" });

// Async refinement
const uniqueEmail = z.string().email()
  .refine(async (email) => {
    return !(await checkEmailExists(email));
  }, { message: "Email already exists" });
```

</zod_transforms>

<zod_integration>

**Environment variables**:

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().min(32)
});

const env = EnvSchema.parse(process.env);
```

**API validation with Hono**:

```typescript
import { zValidator } from '@hono/zod-validator';

app.post('/users', zValidator('json', UserSchema), (c) => {
  const user = c.req.valid('json'); // typed as User
  return c.json(user);
});
```

See [zod-schemas.md](references/zod-schemas.md) and [zod-integration.md](references/zod-integration.md).

</zod_integration>

## Type Guards & Utilities

<type_guards>

```typescript
// User-defined type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

// Assertion functions
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError('Value must be a string');
  }
}

// With noUncheckedIndexedAccess
const users: User[] = getUsers();
const first = users[0]; // Type: User | undefined

if (first !== undefined) {
  processUser(first);
}
```

</type_guards>

<type_utilities>

```typescript
// DeepReadonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Option type
type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

function fromNullable<T>(value: T | null | undefined): Option<T> {
  if (value == null) return { some: false };
  return { some: true, value };
}

// NoInfer (TS 5.4+)
function createStore<T>(
  initial: T,
  middleware?: (value: NoInfer<T>) => NoInfer<T>
) {
  // middleware type won't influence T inference
}
```

</type_utilities>

<rules>

ALWAYS:
- Strict TypeScript configuration enabled
- Type-only imports: `import type { User } from './types'`
- Const assertions for literal types
- Exhaustive pattern matching with `assertNever`
- Runtime validation at system boundaries (Zod)
- Branded types for domain/sensitive data
- Result types for error-prone operations
- Use `satisfies` to preserve literal inference
- Use `using` for resources with cleanup

NEVER:
- `any` type (use `unknown` + guards)
- `@ts-ignore` (fix types or document)
- TypeScript enums (use const assertions or z.enum)
- Non-null assertions `!` (use guards)
- Loose state representations (use discriminated unions)
- Hidden error cases (use Result types)
- Manual cleanup when `using` applies

PREFER:
- safeParse over parse (explicit error handling)
- z.discriminatedUnion over z.union
- Inferred type predicates (TS 5.5+) over manual
- Const type parameters for literal preservation

</rules>

<references>

**Type Patterns:**
- [result-pattern.md](references/result-pattern.md) — Result/Either utilities
- [branded-types.md](references/branded-types.md) — advanced branded type patterns
- [advanced-types.md](references/advanced-types.md) — template literals, utilities

**Modern Features:**
- [modern-features.md](references/modern-features.md) — TS 5.5-5.8 features
- [migration-paths.md](references/migration-paths.md) — upgrading TypeScript

**Zod:**
- [zod-schemas.md](references/zod-schemas.md) — comprehensive schema patterns
- [zod-integration.md](references/zod-integration.md) — API, forms, env, database

**Examples:**
- [api-response.md](examples/api-response.md) — end-to-end type-safe API
- [form-validation.md](examples/form-validation.md) — Zod + React Hook Form
- [resource-management.md](examples/resource-management.md) — using declarations
- [state-machine.md](examples/state-machine.md) — discriminated union patterns

</references>
