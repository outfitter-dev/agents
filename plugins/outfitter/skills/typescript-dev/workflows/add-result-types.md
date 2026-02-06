# Workflow: Add Result Types

Replace exceptions with explicit Result types for type-safe error handling.

<when_to_use>

- Functions that can fail in expected ways
- API calls, database operations, validation
- Code that currently uses try/catch
- When you want errors in the type signature

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/result-pattern.md

</required_reading>

<process>

## Step 1: Define Result Type

```typescript
// result.ts

/**
 * Result type for explicit error handling.
 * Forces callers to handle both success and failure cases.
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Result constructors.
 */
export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),
  err: <E>(error: E): Result<never, E> => ({ ok: false, error }),
} as const;
```

## Step 2: Define Error Discriminated Union

```typescript
// errors.ts

/**
 * User operation errors.
 * Discriminated union allows exhaustive handling.
 */
export type UserError =
  | { readonly type: 'not_found'; readonly userId: string }
  | { readonly type: 'validation'; readonly field: string; readonly message: string }
  | { readonly type: 'network'; readonly statusCode: number; readonly body: string };
```

## Step 3: Update Function Signature

**Before (throws):**
```typescript
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  return response.json();
}
```

**After (returns Result):**
```typescript
async function getUser(id: string): Promise<Result<User, UserError>> {
  const response = await fetch(`/api/users/${id}`);

  if (response.status === 404) {
    return Result.err({ type: 'not_found', userId: id });
  }

  if (!response.ok) {
    return Result.err({
      type: 'network',
      statusCode: response.status,
      body: await response.text(),
    });
  }

  const data = await response.json();
  const validated = UserSchema.safeParse(data);

  if (!validated.success) {
    return Result.err({
      type: 'validation',
      field: validated.error.issues[0]?.path.join('.') ?? 'unknown',
      message: validated.error.issues[0]?.message ?? 'Validation failed',
    });
  }

  return Result.ok(validated.data);
}
```

## Step 4: Update All Call Sites

```typescript
// Caller must handle Result explicitly
const result = await getUser(userId);

if (!result.ok) {
  // Handle error - TypeScript knows result.error exists
  switch (result.error.type) {
    case 'not_found':
      return showNotFound(result.error.userId);
    case 'validation':
      return showValidationError(result.error.field, result.error.message);
    case 'network':
      return showNetworkError(result.error.statusCode);
    default:
      // Exhaustive check
      const _exhaustive: never = result.error;
      throw new Error(`Unhandled error type: ${_exhaustive}`);
  }
}

// TypeScript knows result.value is User here
return renderUser(result.value);
```

## Step 5: Add Exhaustive Error Handling

```typescript
/**
 * Utility for exhaustive switch statements.
 */
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

// Usage in switch
switch (error.type) {
  case 'not_found': return handleNotFound(error);
  case 'validation': return handleValidation(error);
  case 'network': return handleNetwork(error);
  default: return assertNever(error);
}
```

## Step 6: Verify

1. All call sites updated (no unhandled Results)
2. Error types are discriminated unions
3. Switch statements are exhaustive
4. No try/catch around Result-returning functions

</process>

<result_utilities>

```typescript
// Optional utilities for working with Results

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),
  err: <E>(error: E): Result<never, E> => ({ ok: false, error }),

  /**
   * Map the success value.
   */
  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    result.ok ? Result.ok(fn(result.value)) : result,

  /**
   * Map the error value.
   */
  mapErr: <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> =>
    result.ok ? result : Result.err(fn(result.error)),

  /**
   * Chain operations that return Results.
   */
  flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> =>
    result.ok ? fn(result.value) : result,

  /**
   * Unwrap or throw (use sparingly, at boundaries only).
   */
  unwrap: <T, E>(result: Result<T, E>): T => {
    if (!result.ok) throw result.error;
    return result.value;
  },
} as const;
```

</result_utilities>

<anti_patterns>

Avoid:
- Mixing exceptions and Results in the same function
- Using `Result.unwrap()` deep in the call stack
- Generic `Error` type instead of discriminated unions
- Not updating all call sites
- Catching Results in try/catch (they don't throw)

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Result type defined
- [ ] Error types are discriminated unions with `type` field
- [ ] Function signatures return `Result<T, E>`
- [ ] All `throw` statements replaced with `Result.err()`
- [ ] All call sites handle Results explicitly
- [ ] Switch statements are exhaustive
- [ ] No unhandled Results

</success_criteria>

<next_steps>

- Add runtime validation: `workflows/add-zod-validation.md`
- Debug type issues: `workflows/debug-types.md`
- See advanced patterns: `references/result-pattern.md`

</next_steps>
