---
name: typescript-dev
description: This skill should be used when writing TypeScript, eliminating any types, implementing Zod validation, or when strict type safety is needed. Covers modern TS 5.5+ features and runtime validation patterns.
metadata:
  version: "1.0.0"
---

# TypeScript Development

Type-safe code = compile-time errors = runtime confidence.

<when_to_use>

- Writing new TypeScript code
- Eliminating `any` types
- Using modern TypeScript 5.5+ features
- Validating API inputs/outputs with Zod
- Implementing Result types and discriminated unions
- Creating branded types for domain concepts

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

**Version requirements**: TS 5.2+ (`using`), TS 5.4+ (`NoInfer`), TS 5.5+ (inferred predicates)

</config>

## Core Patterns

<eliminating_any>

`any` defeats the type system. Use `unknown` + guards.

```typescript
// ❌ NEVER
function process(data: any) { return data.value; }

// ✅ ALWAYS
function process(data: unknown): string {
  if (!hasValue(data)) throw new TypeError('Invalid');
  return data.value.toString();
}

function hasValue(v: unknown): v is { value: unknown } {
  return typeof v === 'object' && v !== null && 'value' in v;
}
```

Validate at boundaries:

```typescript
async function fetchUser(id: string): Promise<User> {
  const data: unknown = await fetch(`/api/users/${id}`).then(r => r.json());
  return UserSchema.parse(data);
}
```

</eliminating_any>

<result_types>

Exceptions hide errors from types. Result makes them explicit.

```typescript
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

type UserError =
  | { readonly type: 'not-found'; readonly id: string }
  | { readonly type: 'network'; readonly message: string };

async function getUser(id: string): Promise<Result<User, UserError>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (response.status === 404)
      return { ok: false, error: { type: 'not-found', id } };
    if (!response.ok)
      return { ok: false, error: { type: 'network', message: response.statusText } };
    return { ok: true, value: await response.json() };
  } catch (e) {
    return { ok: false, error: { type: 'network', message: String(e) } };
  }
}

// Caller must handle
const result = await getUser(id);
if (!result.ok) {
  switch (result.error.type) {
    case 'not-found': return showNotFound(result.error.id);
    case 'network': return showError(result.error.message);
  }
}
return renderUser(result.value);
```

See [result-pattern.md](references/result-pattern.md) for utilities (`map`, `flatMap`, `combine`).

</result_types>

<discriminated_unions>

Prevent illegal state combinations.

```typescript
// ❌ Allows { status: 'loading', data: user, error: 'Failed' }
type Request = { status: 'idle'|'loading'|'success'|'error'; data?: User; error?: string; };

// ✅ Only valid states
type RequestState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: User }
  | { readonly status: 'error'; readonly error: string };

function render(state: RequestState): JSX.Element {
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

Prevent mixing incompatible primitives.

```typescript
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;

function createUserId(value: string): UserId {
  if (!/^user-\d+$/.test(value)) throw new TypeError(`Invalid: ${value}`);
  return value as UserId;
}

const userId = createUserId('user-123');
// getUser(productId); // ❌ Type error
getUser(userId);       // ✅ Works
```

Security:

```typescript
type SanitizedHtml = Brand<string, 'SanitizedHtml'>;

function sanitize(raw: string): SanitizedHtml {
  return escapeHtml(raw) as SanitizedHtml;
}

function render(html: SanitizedHtml): void {
  element.innerHTML = html; // Type proves sanitization
}
```

See [branded-types.md](references/branded-types.md) for advanced patterns.

</branded_types>

## Modern TypeScript (5.2+)

<resource_management>

`using` for automatic cleanup (TS 5.2+):

```typescript
class DatabaseConnection implements Disposable {
  [Symbol.dispose]() { this.close(); }
}

function query() {
  using conn = new DatabaseConnection();
  return conn.query('SELECT * FROM users');
} // Automatically closed

async function asyncWork() {
  await using resource = new AsyncResource();
} // Disposed with await
```

Use for: connections, file handles, locks, transactions.

</resource_management>

<satisfies_operator>

Validate type without widening (TS 4.9+):

```typescript
const config = {
  port: 3000,
  host: 'localhost'
} satisfies Record<string, string | number>;

config.port // number (not string | number)

const routes = {
  home: '/',
  user: '/user/:id'
} as const satisfies Record<string, string>;

type HomeRoute = typeof routes.home; // '/'
```

</satisfies_operator>

<const_type_parameters>

Preserve literals through generics (TS 5.0+):

```typescript
function makeTuple<const T extends readonly unknown[]>(...args: T): T {
  return args;
}
const result = makeTuple('a', 'b', 'c'); // ['a', 'b', 'c'] not string[]
```

</const_type_parameters>

<inferred_predicates>

TS 5.5+ auto-infers type predicates:

```typescript
function isString(x: unknown) {
  return typeof x === 'string';
}
// Inferred: (x: unknown) => x is string

const strings = values.filter(isString); // string[]
```

</inferred_predicates>

<template_literals>

Pattern matching at type level:

```typescript
type Route = `/${string}`;
type ApiRoute = `/api/v${number}/${string}`;

type ExtractParams<T extends string> =
  T extends `${string}:${infer P}/${infer R}` ? P | ExtractParams<`/${R}`>
  : T extends `${string}:${infer P}` ? P : never;

type Params = ExtractParams<'/user/:id/post/:postId'>; // 'id' | 'postId'
```

See [modern-features.md](references/modern-features.md) for TS 5.5-5.8.

</template_literals>

## Zod Validation

Schema = runtime validation + TypeScript type.

<zod_core>

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100)
});

type User = z.infer<typeof UserSchema>;

// safeParse preferred
const result = UserSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
  return;
}
const user = result.data;
```

</zod_core>

<zod_patterns>

**Discriminated unions** (preferred over z.union):

```typescript
const ApiResponse = z.discriminatedUnion("type", [
  z.object({ type: z.literal("success"), data: z.unknown() }),
  z.object({ type: z.literal("error"), code: z.string(), message: z.string() })
]);
```

**Environment variables**:

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000)
});
const env = EnvSchema.parse(process.env);
```

**API validation (Hono)**:

```typescript
import { zValidator } from '@hono/zod-validator';

app.post('/users', zValidator('json', UserSchema), (c) => {
  const user = c.req.valid('json');
  return c.json(user);
});
```

See:
- [zod-building-blocks.md](references/zod-building-blocks.md) - primitives, refinements, transforms
- [zod-schemas.md](references/zod-schemas.md) - composition patterns
- [zod-integration.md](references/zod-integration.md) - API/form/env integration

</zod_patterns>

## Type Guards

```typescript
// User-defined
function isString(v: unknown): v is string {
  return typeof v === 'string';
}

// Assertion
function assertString(v: unknown): asserts v is string {
  if (typeof v !== 'string') throw new TypeError('Expected string');
}

// With noUncheckedIndexedAccess
const users: User[] = getUsers();
const first = users[0]; // User | undefined
if (first !== undefined) processUser(first);
```

See [advanced-types.md](references/advanced-types.md) for utilities.

## TSDoc

Types show structure. TSDoc shows intent. Critical for AI agents.

```typescript
/**
 * Authenticates user and returns session token.
 * @param credentials - User login credentials
 * @returns Session token valid for 24 hours
 * @throws {AuthenticationError} Invalid credentials
 * @example
 * const token = await authenticate({ email, password });
 */
export async function authenticate(credentials: Credentials): Promise<SessionToken>;
```

Document: all exports, parameters with constraints, thrown errors, non-obvious returns.

See [tsdoc-patterns.md](references/tsdoc-patterns.md) for comprehensive guide.

<rules>

ALWAYS:
- Strict TypeScript config enabled
- Type-only imports: `import type { User } from './types'`
- Const assertions for literal types
- Exhaustive matching with `assertNever`
- Runtime validation at boundaries (Zod)
- Branded types for domain/sensitive data
- Result types for error-prone operations
- `satisfies` for literal inference
- `using` for resources with cleanup
- TSDoc on all exports

NEVER:
- `any` (use `unknown` + guards)
- `@ts-ignore` (fix types or document)
- TypeScript enums (use const assertions or z.enum)
- Non-null assertions `!` (use guards)
- Loose state (use discriminated unions)
- Hidden errors (use Result)

PREFER:
- safeParse over parse
- z.discriminatedUnion over z.union
- Inferred predicates (TS 5.5+)
- Const type parameters for literals

</rules>

<references>

**Type Patterns:**
- [result-pattern.md](references/result-pattern.md) - Result/Either utilities
- [branded-types.md](references/branded-types.md) - advanced branded patterns
- [advanced-types.md](references/advanced-types.md) - template literals, utilities

**Modern Features:**
- [modern-features.md](references/modern-features.md) - TS 5.5-5.8
- [migration-paths.md](references/migration-paths.md) - upgrading TypeScript

**Zod:**
- [zod-building-blocks.md](references/zod-building-blocks.md) - primitives, transforms
- [zod-schemas.md](references/zod-schemas.md) - composition patterns
- [zod-integration.md](references/zod-integration.md) - API, forms, env

**TSDoc:**
- [tsdoc-patterns.md](references/tsdoc-patterns.md) - documentation patterns

**Examples:**
- [api-response.md](examples/api-response.md) - end-to-end type-safe API
- [form-validation.md](examples/form-validation.md) - Zod + React Hook Form
- [resource-management.md](examples/resource-management.md) - using declarations
- [state-machine.md](examples/state-machine.md) - discriminated union patterns

</references>
