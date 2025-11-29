---
name: Type Safety
description: Enforces strict TypeScript type safety patterns, eliminates `any` types, implements proper error handling with Result types and discriminated unions, creates branded types for security, leverages TypeScript 5.7+ features, and ensures illegal states are unrepresentable. Use when reviewing code for type safety, refactoring legacy JavaScript/loose TypeScript to strict patterns, implementing error boundaries, modernizing code to use latest TypeScript features, or when `--type-safe`, `--strict-types`, or `--type-check` flags are mentioned.
---

# Type Safety

Comprehensive TypeScript type safety patterns and practices for building correct, maintainable code through the type system.

## Quick Start

**Type safety priorities** (in order):
1. **Correct** → Type-safe, no runtime type errors
2. **Clear** → Self-documenting through types
3. **Precise** → No `any`, proper unions, branded types

**Core principle**: Make illegal states unrepresentable through the type system.

## Foundational Rules

### Non-Negotiable Standards

**Always**:
- Strict TypeScript configuration enabled
- Type-only imports: `import type { User } from './types'`
- Const assertions for literal types: `as const`
- Exhaustive pattern matching with `assertNever`
- Runtime validation at system boundaries
- Branded types for sensitive/domain data
- Template literals over string concatenation
- Arrow functions over function expressions

**Never**:
- `any` type (use `unknown` + type guards)
- `@ts-ignore` (fix types or document impossibility)
- TypeScript enums (use const assertions)
- Non-null assertions `!` (use type guards)
- `var` declarations (use `const`/`let`)
- Empty interfaces or type parameters
- Primitive type aliases
- Namespace imports (use named imports)
- Import cycles
- Magic numbers (use named constants)

## TypeScript Configuration

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

## Eliminating `any`

### Problem: `any` defeats the type system

```typescript
// ❌ NEVER
function processData(data: any) {
  return data.value.toString(); // Runtime error waiting to happen
}
```

### Solution: Use `unknown` + type guards

```typescript
// ✅ ALWAYS
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

### Common Refactoring Patterns

**API responses**:
```typescript
// ❌ Before
async function fetchUser(id: string): Promise<any> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ✅ After
type User = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
};

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();
  return validateUser(data);
}

function validateUser(data: unknown): User {
  if (!isUser(data)) {
    throw new TypeError('Invalid user data');
  }
  return data;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'email' in value && typeof value.email === 'string' &&
    'name' in value && typeof value.name === 'string'
  );
}
```

**Event handlers**:
```typescript
// ❌ Before
function handleClick(event: any) {
  console.log(event.target.value);
}

// ✅ After
function handleClick(event: MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.value);
}
```

## Result Types for Error Handling

### Problem: Exceptions hide error cases from types

```typescript
// ❌ Type doesn't show this can fail
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('User not found'); // Hidden from type system
  }
  return response.json();
}
```

### Solution: Result type makes errors explicit

```typescript
// ✅ Type shows all possible outcomes
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
        return {
          ok: false,
          error: { type: 'not-found', id }
        };
      }
      return {
        ok: false,
        error: { type: 'network', message: response.statusText }
      };
    }

    const data: unknown = await response.json();
    if (!isUser(data)) {
      return {
        ok: false,
        error: { type: 'invalid-data', details: 'Invalid user shape' }
      };
    }

    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: {
        type: 'network',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

// Usage forces error handling
async function loadUserProfile(id: string) {
  const result = await getUser(id);

  if (!result.ok) {
    // TypeScript knows result.error exists
    switch (result.error.type) {
      case 'not-found':
        return showNotFound(result.error.id);
      case 'network':
        return showNetworkError(result.error.message);
      case 'invalid-data':
        return showDataError(result.error.details);
      default:
        return assertNever(result.error);
    }
  }

  // TypeScript knows result.value exists
  return renderUser(result.value);
}
```

## Discriminated Unions

### Problem: Multiple states represented loosely

```typescript
// ❌ Illegal states possible
type Request = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: User;
  error?: string;
};

// This is legal but nonsensical:
const bad: Request = {
  status: 'loading',
  data: user,      // Data while loading?
  error: 'Failed'  // Error while loading?
};
```

### Solution: Discriminated union makes illegal states unrepresentable

```typescript
// ✅ Only valid states possible
type RequestState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: User }
  | { readonly status: 'error'; readonly error: string };

// Now this won't compile:
// const bad: RequestState = {
//   status: 'loading',
//   data: user  // ❌ Type error!
// };

// Exhaustive pattern matching
function renderRequest(state: RequestState): JSX.Element {
  switch (state.status) {
    case 'idle':
      return <div>Ready</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      // TypeScript knows state.data exists
      return <div>{state.data.name}</div>;
    case 'error':
      // TypeScript knows state.error exists
      return <div>Error: {state.error}</div>;
    default:
      return assertNever(state);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}
```

## Branded Types

### Problem: Primitive types used for domain concepts

```typescript
// ❌ Easy to mix up IDs
type UserId = string;
type ProductId = string;

function getUser(id: UserId): Promise<User> { /* ... */ }
function getProduct(id: ProductId): Promise<Product> { /* ... */ }

const userId: UserId = 'user-123';
const productId: ProductId = 'prod-456';

// These are just strings, so this compiles:
await getUser(productId); // ❌ Wrong ID type, but TypeScript allows it!
```

### Solution: Branded types prevent mixing

```typescript
// ✅ Compile-time brand prevents mixing
declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & {
  readonly [__brand]: TBrand;
};

type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;

// Smart constructors enforce validation
function createUserId(value: string): UserId {
  if (!/^user-\d+$/.test(value)) {
    throw new TypeError(`Invalid user ID format: ${value}`);
  }
  return value as UserId;
}

function createProductId(value: string): ProductId {
  if (!/^prod-\d+$/.test(value)) {
    throw new TypeError(`Invalid product ID format: ${value}`);
  }
  return value as ProductId;
}

// Now this won't compile:
const userId = createUserId('user-123');
const productId = createProductId('prod-456');

// await getUser(productId); // ❌ Type error: ProductId not assignable to UserId
await getUser(userId); // ✅ Works
```

### Security with Branded Types

```typescript
// Prevent injection attacks through types
type SanitizedHtml = Brand<string, 'SanitizedHtml'>;
type SqlQuery = Brand<string, 'SqlQuery'>;

function sanitizeHtml(raw: string): SanitizedHtml {
  // Actual sanitization logic
  return escapeHtml(raw) as SanitizedHtml;
}

function renderHtml(html: SanitizedHtml): void {
  document.body.innerHTML = html; // Safe - branded type guarantees sanitization
}

// This won't compile:
const userInput = '<script>alert("xss")</script>';
// renderHtml(userInput); // ❌ Type error: string not assignable to SanitizedHtml

// Must sanitize first:
const safe = sanitizeHtml(userInput);
renderHtml(safe); // ✅ Works
```

## TypeScript 5.7+ Features

### Const Type Parameters (5.0+)

```typescript
// ✅ Preserve literal types through functions
function makeTuple<const T extends readonly unknown[]>(...args: T): T {
  return args;
}

// Type is ['a', 'b', 'c'], not string[]
const tuple = makeTuple('a', 'b', 'c');
```

### `satisfies` Operator (5.0+)

```typescript
// ✅ Type-check without losing specificity
type Color = 'red' | 'green' | 'blue';

const palette = {
  primary: 'red',
  secondary: 'green',
  accent: 'blue'
} satisfies Record<string, Color>;

// Type is still literal 'red', not Color
type Primary = typeof palette.primary; // 'red'
```

### `using` Declarations (5.2+)

```typescript
// ✅ Automatic resource cleanup
class DatabaseConnection implements Disposable {
  [Symbol.dispose]() {
    this.close();
  }

  close() {
    // Cleanup logic
  }
}

function queryDatabase() {
  using connection = new DatabaseConnection();
  // Connection automatically closed at end of scope
  return connection.query('SELECT * FROM users');
}
```

### Improved Type Narrowing (5.5+)

```typescript
// ✅ Better control flow analysis
function processValue(value: string | number | null) {
  if (typeof value === 'string') {
    // TypeScript 5.5+ narrows better in nested conditions
    if (value.length > 0) {
      return value.toUpperCase(); // Still knows it's string
    }
  }
}
```

### Template String Pattern Inference (5.7+)

```typescript
// ✅ Infer patterns from template literals
type EventName<T extends string> = `on${Capitalize<T>}`;

function addEventListener<T extends string>(
  event: EventName<T>,
  handler: () => void
): void {
  // handler logic
}

addEventListener('onClick', () => {}); // ✅ Works
// addEventListener('click', () => {}); // ❌ Type error
```

## Precise Type Utilities

### Readonly Deep

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

type User = {
  id: string;
  profile: {
    email: string;
    settings: {
      theme: string;
    };
  };
};

type ImmutableUser = DeepReadonly<User>;
// All nested properties are readonly
```

### Precise Picks

```typescript
// ❌ Imprecise
type UserSummary = Partial<User>;

// ✅ Precise - only what's needed
type UserSummary = DeepReadonly<Pick<User, 'id' | 'email'>>;
```

### NonNullable Refinement

```typescript
// Filter out null/undefined from unions
type SafeString = NonNullable<string | null | undefined>; // string

// Custom version for arrays
type NonNullableArray<T> = Array<NonNullable<T>>;
```

## Type Guards

### User-Defined Type Guards

```typescript
// ✅ Explicit type narrowing
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

// Usage
function process(data: unknown) {
  if (isStringArray(data)) {
    // TypeScript knows data is string[]
    return data.map(s => s.toUpperCase());
  }
}
```

### Assertion Functions

```typescript
// ✅ Throw if condition fails, narrow type otherwise
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError('Value must be a string');
  }
}

function process(data: unknown) {
  assertIsString(data);
  // TypeScript knows data is string after assertion
  return data.toUpperCase();
}
```

## Handling Indexed Access

### Problem: Unchecked array/object access

```typescript
// ❌ TypeScript assumes this exists
const users: User[] = getUsers();
const first = users[0]; // Type: User (but could be undefined!)

const config: Record<string, string> = getConfig();
const apiKey = config.apiKey; // Type: string (but could be undefined!)
```

### Solution: noUncheckedIndexedAccess

```typescript
// tsconfig.json: "noUncheckedIndexedAccess": true

const users: User[] = getUsers();
const first = users[0]; // Type: User | undefined ✅

// Must handle undefined
if (first !== undefined) {
  processUser(first);
}

// Or use optional chaining
processUser(first?.id);
```

## Error Boundary Pattern (React)

```typescript
type ErrorBoundaryState =
  | { readonly hasError: false }
  | { readonly hasError: true; readonly error: Error };

class ErrorBoundary extends React.Component<
  { readonly children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { readonly children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      // TypeScript knows state.error exists
      return <ErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Common Patterns

### Option Type

```typescript
type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

function fromNullable<T>(value: T | null | undefined): Option<T> {
  if (value === null || value === undefined) {
    return { some: false };
  }
  return { some: true, value };
}

function map<T, U>(
  option: Option<T>,
  fn: (value: T) => U
): Option<U> {
  if (!option.some) {
    return option;
  }
  return { some: true, value: fn(option.value) };
}
```

### Builder Pattern

```typescript
class UserBuilder {
  private constructor(
    private readonly data: Partial<User>
  ) {}

  static create(): UserBuilder {
    return new UserBuilder({});
  }

  withId(id: string): this {
    return new UserBuilder({ ...this.data, id }) as this;
  }

  withEmail(email: string): this {
    return new UserBuilder({ ...this.data, email }) as this;
  }

  withName(name: string): this {
    return new UserBuilder({ ...this.data, name }) as this;
  }

  build(): User {
    const { id, email, name } = this.data;

    if (!id || !email || !name) {
      throw new Error('Missing required user fields');
    }

    return { id, email, name };
  }
}

// Usage
const user = UserBuilder.create()
  .withId('123')
  .withEmail('user@example.com')
  .withName('John Doe')
  .build();
```

## Code Review Checklist

When reviewing code for type safety:

**Type System Usage**:
- [ ] No `any` types (use `unknown` + guards)
- [ ] No `@ts-ignore` (fix or document)
- [ ] No TypeScript enums (use const assertions)
- [ ] No non-null assertions `!` (use guards)
- [ ] Type-only imports used (`import type`)

**Error Handling**:
- [ ] Errors explicit in return types (Result/Either)
- [ ] Discriminated unions for state machines
- [ ] Exhaustive switch statements with `assertNever`
- [ ] Runtime validation at boundaries

**Type Precision**:
- [ ] Branded types for domain/sensitive data
- [ ] Precise types (not `Partial<User>`)
- [ ] Readonly where appropriate
- [ ] Template literals for patterns

**Modern Features**:
- [ ] Const assertions for literals
- [ ] `satisfies` for type checking
- [ ] `using` for resource cleanup
- [ ] Proper type narrowing

**Configuration**:
- [ ] `strict: true` enabled
- [ ] `noUncheckedIndexedAccess: true`
- [ ] `exactOptionalPropertyTypes: true`
- [ ] No unsafe compiler options

## Anti-Patterns to Flag

**Type Shortcuts**:
```typescript
// ❌ Defeats type system
const user = data as User;

// ✅ Validate at runtime
const user = validateUser(data);
```

**Missing Readonly**:
```typescript
// ❌ Mutable when shouldn't be
type Config = { apiKey: string };

// ✅ Immutable
type Config = { readonly apiKey: string };
```

**Loose Unions**:
```typescript
// ❌ No discrimination
type Response = { data?: User; error?: string };

// ✅ Discriminated
type Response =
  | { readonly ok: true; readonly data: User }
  | { readonly ok: false; readonly error: string };
```

## Resources

**TypeScript Handbook**:
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

**Advanced Patterns**:
- [Branded Types](https://github.com/kourge/ts-brand)
- [Effect-TS](https://effect.website/) - Functional error handling
- [Zod](https://zod.dev/) - Runtime validation with type inference

## Summary

Type safety isn't just about preventing bugs - it's about:
1. **Correctness**: Making invalid states impossible
2. **Clarity**: Types as documentation
3. **Confidence**: Refactor fearlessly
4. **Maintainability**: Future developers understand intent

Start with strict configuration, eliminate `any`, use discriminated unions for state, brand sensitive types, and leverage modern TypeScript features. The type system is your ally in building correct software.
