# Deep Dive: Result/Either Pattern

The Result pattern makes errors explicit in type signatures, forcing callers to handle failures at compile time. It's an alternative to exception-based error handling that provides better type safety and composability.

## The Problem with Exceptions

```typescript
// ❌ Error not visible in type
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('User not found'); // Invisible to caller
  }
  return response.json();
}

// Caller has no idea this can throw
const user = await getUser('123'); // Can throw! But TypeScript doesn't warn
```

Problems:
- **Hidden failure modes**: Types don't show what can fail
- **Easy to forget**: Nothing forces error handling
- **Poor error context**: Generic `Error` loses information
- **Control flow**: Exceptions bypass normal flow
- **Composition**: Hard to chain error-prone operations

## The Result Type

```typescript
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Benefits:
- **Explicit errors**: Return type shows operation can fail
- **Forced handling**: Caller must check `ok` to access value
- **Rich error types**: Use discriminated unions for specific errors
- **Composable**: Easy to chain with `map`, `flatMap`, etc.
- **Type-safe**: TypeScript narrows based on `ok` check

## Basic Usage

```typescript
// Error type for specific failures
type UserError =
  | { readonly type: 'not-found'; readonly id: string }
  | { readonly type: 'network'; readonly message: string }
  | { readonly type: 'validation'; readonly details: string };

// ✅ Error visible in return type
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
        error: { type: 'validation', details: 'Invalid user data' }
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

// Caller must handle errors
const result = await getUser('123');

if (!result.ok) {
  // TypeScript knows result.error exists
  switch (result.error.type) {
    case 'not-found':
      console.error(`User ${result.error.id} not found`);
      break;
    case 'network':
      console.error(`Network error: ${result.error.message}`);
      break;
    case 'validation':
      console.error(`Invalid data: ${result.error.details}`);
      break;
  }
  return;
}

// TypeScript knows result.value exists and is User
console.log(result.value.name);
```

## Utility Functions

### Map

Transform success value, preserve error:

```typescript
function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.ok) {
    return result;
  }
  return { ok: true, value: fn(result.value) };
}

// Usage
const userResult = await getUser('123');
const nameResult = map(userResult, user => user.name);
// Result<string, UserError>
```

### FlatMap (Chain)

Chain operations that return Results:

```typescript
function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (!result.ok) {
    return result;
  }
  return fn(result.value);
}

// Usage
const userResult = await getUser('123');
const postsResult = flatMap(userResult, user => getPosts(user.id));
// Result<Post[], UserError>
```

### MapError

Transform error type:

```typescript
function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (result.ok) {
    return result;
  }
  return { ok: false, error: fn(result.error) };
}

// Convert specific error to generic
const genericResult = mapError(
  userResult,
  error => new Error(`User error: ${error.type}`)
);
// Result<User, Error>
```

### Match

Pattern match on Result:

```typescript
function match<T, E, U>(
  result: Result<T, E>,
  patterns: {
    ok: (value: T) => U;
    error: (error: E) => U;
  }
): U {
  if (result.ok) {
    return patterns.ok(result.value);
  }
  return patterns.error(result.error);
}

// Usage
const message = match(userResult, {
  ok: user => `Welcome, ${user.name}!`,
  error: error => `Error: ${error.type}`
});
```

### Unwrap (Use Sparingly)

Get value or throw:

```typescript
function unwrap<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(`Unwrap failed: ${JSON.stringify(result.error)}`);
  }
  return result.value;
}

// Only use when you're certain of success
const user = unwrap(await getUser('123'));
```

### UnwrapOr

Get value or default:

```typescript
function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (!result.ok) {
    return defaultValue;
  }
  return result.value;
}

// Safe fallback
const user = unwrapOr(await getUser('123'), guestUser);
```

## Advanced Patterns

### Combining Multiple Results

```typescript
function combine<T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<
  { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
  T[number] extends Result<unknown, infer E> ? E : never
> {
  const values: unknown[] = [];

  for (const result of results) {
    if (!result.ok) {
      return result as any;
    }
    values.push(result.value);
  }

  return { ok: true, value: values as any };
}

// Usage
const [userResult, postsResult, settingsResult] = await Promise.all([
  getUser('123'),
  getPosts('123'),
  getSettings('123')
]);

const combined = combine([userResult, postsResult, settingsResult]);

if (!combined.ok) {
  // Handle first error
  return handleError(combined.error);
}

// All values available
const [user, posts, settings] = combined.value;
```

### Async Result Utilities

```typescript
async function asyncMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<U>
): Promise<Result<U, E>> {
  if (!result.ok) {
    return result;
  }
  const value = await fn(result.value);
  return { ok: true, value };
}

async function asyncFlatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  if (!result.ok) {
    return result;
  }
  return fn(result.value);
}

// Pipeline async operations
const result = await getUser('123')
  .then(r => asyncFlatMap(r, user => getPosts(user.id)))
  .then(r => asyncMap(r, posts => posts.filter(p => p.published)));
```

### ResultBuilder for Chaining

```typescript
class ResultBuilder<T, E> {
  constructor(private readonly result: Result<T, E>) {}

  static of<T, E>(result: Result<T, E>): ResultBuilder<T, E> {
    return new ResultBuilder(result);
  }

  map<U>(fn: (value: T) => U): ResultBuilder<U, E> {
    return new ResultBuilder(map(this.result, fn));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): ResultBuilder<U, E> {
    return new ResultBuilder(flatMap(this.result, fn));
  }

  mapError<F>(fn: (error: E) => F): ResultBuilder<T, F> {
    return new ResultBuilder(mapError(this.result, fn));
  }

  async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<ResultBuilder<U, E>> {
    const result = await asyncMap(this.result, fn);
    return new ResultBuilder(result);
  }

  async flatMapAsync<U>(
    fn: (value: T) => Promise<Result<U, E>>
  ): Promise<ResultBuilder<U, E>> {
    const result = await asyncFlatMap(this.result, fn);
    return new ResultBuilder(result);
  }

  unwrap(): T {
    return unwrap(this.result);
  }

  unwrapOr(defaultValue: T): T {
    return unwrapOr(this.result, defaultValue);
  }

  match<U>(patterns: { ok: (value: T) => U; error: (error: E) => U }): U {
    return match(this.result, patterns);
  }

  get value(): Result<T, E> {
    return this.result;
  }
}

// Fluent API
const name = ResultBuilder.of(await getUser('123'))
  .map(user => user.name)
  .map(name => name.toUpperCase())
  .unwrapOr('Guest');
```

### Validation Accumulation

Collect all validation errors instead of failing fast:

```typescript
type ValidationError = {
  readonly field: string;
  readonly message: string;
};

type ValidationResult<T> = Result<T, readonly ValidationError[]>;

function validateName(name: string): ValidationResult<string> {
  const errors: ValidationError[] = [];

  if (name.length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (name.length > 50) {
    errors.push({ field: 'name', message: 'Name too long' });
  }

  if (errors.length > 0) {
    return { ok: false, error: errors };
  }

  return { ok: true, value: name };
}

function validateEmail(email: string): ValidationResult<string> {
  const errors: ValidationError[] = [];

  if (!email.includes('@')) {
    errors.push({ field: 'email', message: 'Invalid email' });
  }

  if (errors.length > 0) {
    return { ok: false, error: errors };
  }

  return { ok: true, value: email };
}

// Combine validations, accumulating errors
function validateUser(data: {
  name: string;
  email: string;
}): ValidationResult<{ name: string; email: string }> {
  const nameResult = validateName(data.name);
  const emailResult = validateEmail(data.email);

  const errors: ValidationError[] = [];

  if (!nameResult.ok) {
    errors.push(...nameResult.error);
  }

  if (!emailResult.ok) {
    errors.push(...emailResult.error);
  }

  if (errors.length > 0) {
    return { ok: false, error: errors };
  }

  return {
    ok: true,
    value: {
      name: nameResult.value,
      email: emailResult.value
    }
  };
}
```

## Integration with Libraries

### Zod + Result

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
});

type ZodError = z.ZodError;

function parseUser(data: unknown): Result<User, ZodError> {
  const result = UserSchema.safeParse(data);

  if (!result.success) {
    return { ok: false, error: result.error };
  }

  return { ok: true, value: result.data };
}
```

### Effect-TS

Effect library has built-in Result-like types (`Effect`, `Either`):

```typescript
import { Effect } from 'effect';

// Effect<User, UserError>
const getUserEffect = Effect.tryPromise({
  try: () => fetch('/api/users/123').then(r => r.json()),
  catch: (error) => ({ type: 'network' as const, error })
});
```

## React Integration

```typescript
// Hook returning Result
function useUser(id: string): Result<User, UserError> | null {
  const [result, setResult] = React.useState<Result<User, UserError> | null>(null);

  React.useEffect(() => {
    getUser(id).then(setResult);
  }, [id]);

  return result;
}

// Component
function UserProfile({ id }: { id: string }) {
  const result = useUser(id);

  if (result === null) {
    return <div>Loading...</div>;
  }

  return match(result, {
    ok: user => <div>{user.name}</div>,
    error: error => <ErrorDisplay error={error} />
  });
}
```

## Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('getUser', () => {
  it('returns ok result for valid user', async () => {
    const result = await getUser('123');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('123');
    }
  });

  it('returns not-found error for missing user', async () => {
    const result = await getUser('999');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('not-found');
      expect(result.error.id).toBe('999');
    }
  });
});

describe('map', () => {
  it('transforms success value', () => {
    const result: Result<number, string> = { ok: true, value: 5 };
    const mapped = map(result, n => n * 2);

    expect(mapped).toEqual({ ok: true, value: 10 });
  });

  it('preserves error', () => {
    const result: Result<number, string> = { ok: false, error: 'fail' };
    const mapped = map(result, n => n * 2);

    expect(mapped).toEqual({ ok: false, error: 'fail' });
  });
});
```

## Performance Considerations

Results add a small wrapper object:

```typescript
// Slightly more allocation than throwing
return { ok: true, value: user }; // One object allocation

// vs

return user; // No wrapper
```

But:
- Negligible in most cases
- No try/catch overhead
- Easier to optimize (JIT-friendly)
- Predictable control flow

## Migration Strategy

1. **Start with new code**: Use Result for all new error-prone functions

2. **Wrap existing APIs**:

   ```typescript
   function safeGetUser(id: string): Promise<Result<User, Error>> {
     return getUser(id)
       .then(value => ({ ok: true, value }) as const)
       .catch(error => ({ ok: false, error }) as const);
   }
   ```

3. **Gradually convert**: Convert hot paths and security-critical code first

4. **Use builder pattern**: Make adoption gradual and ergonomic

## When to Use Result

**Use Result when:**
- Errors are expected part of domain logic (not found, validation)
- Caller should handle errors explicitly
- Composing multiple error-prone operations
- Testing error cases is important
- Type safety for errors matters

**Use exceptions when:**
- Truly exceptional, unrecoverable errors (out of memory, corruption)
- Interfacing with exception-based libraries
- Performance-critical hot paths (profile first!)

## Summary

Result pattern provides:
- **Type-safe errors**: Failures visible in types
- **Forced handling**: Can't ignore errors
- **Composability**: Easy to chain operations
- **Testability**: Explicit error cases
- **Maintainability**: Changes to errors surface as type errors

Combined with discriminated unions for error types, branded types for validation state, and exhaustive pattern matching, Result types are essential for robust TypeScript applications.
