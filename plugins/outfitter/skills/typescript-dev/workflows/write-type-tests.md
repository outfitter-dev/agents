# Workflow: Write Type Tests

Write compile-time tests to verify your types work correctly.

<when_to_use>

- Library/package with exported types
- Complex generic types
- Conditional types
- Type utilities
- When types are part of your public API

</when_to_use>

<process>

## Step 1: Choose a Type Testing Library

| Library | Install | Best For |
|---------|---------|----------|
| **expect-type** | `bun add -D expect-type` | Most expressive, recommended |
| **tsd** | `bun add -D tsd` | Declaration file testing |
| Built-in | None | Simple assertions |

## Step 2: Create Type Test File

```typescript
// types.test-d.ts (or *.test.ts with type tests)
import { expectTypeOf } from 'expect-type';
import type { MyType, MyFunction } from './index';
```

## Step 3: Test Type Equality

```typescript
import { expectTypeOf } from 'expect-type';

// Test exact type
expectTypeOf<MyType>().toEqualTypeOf<{ id: string; name: string }>();

// Test assignability (looser)
expectTypeOf<MyType>().toMatchTypeOf<{ id: string }>();

// Test not equal
expectTypeOf<MyType>().not.toEqualTypeOf<{ id: number }>();
```

## Step 4: Test Function Types

```typescript
// Test parameter types
expectTypeOf<typeof myFunction>().parameter(0).toEqualTypeOf<string>();

// Test return type
expectTypeOf<typeof myFunction>().returns.toEqualTypeOf<User>();

// Test async return type
expectTypeOf<typeof asyncFunction>().returns.resolves.toEqualTypeOf<User>();
```

## Step 5: Test Generic Types

```typescript
// Test generic instantiation
expectTypeOf<Result<string, Error>>().toEqualTypeOf<
  | { ok: true; value: string }
  | { ok: false; error: Error }
>();

// Test type inference
const result = createOk('hello');
expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
```

## Step 6: Test Error Cases

```typescript
// Test that invalid types are rejected
// @ts-expect-error - Should not accept number
const invalid: UserId = 123;

// @ts-expect-error - Missing required property
const user: User = { name: 'John' };

// @ts-expect-error - Wrong property type
const config: Config = { port: 'not-a-number' };
```

## Step 7: Run Type Tests

```bash
# With expect-type (runs during normal tsc)
tsc --noEmit

# With tsd
tsd

# In CI
tsc --noEmit && tsd
```

</process>

<expect_type_api>

```typescript
import { expectTypeOf } from 'expect-type';

// Equality
expectTypeOf<A>().toEqualTypeOf<B>();      // Exact match
expectTypeOf<A>().toMatchTypeOf<B>();      // A assignable to B
expectTypeOf<A>().not.toEqualTypeOf<B>();  // Not equal

// Primitives
expectTypeOf<T>().toBeString();
expectTypeOf<T>().toBeNumber();
expectTypeOf<T>().toBeBoolean();
expectTypeOf<T>().toBeNull();
expectTypeOf<T>().toBeUndefined();
expectTypeOf<T>().toBeNever();
expectTypeOf<T>().toBeAny();
expectTypeOf<T>().toBeUnknown();

// Objects
expectTypeOf<T>().toHaveProperty('name');
expectTypeOf<T>().toBeObject();
expectTypeOf<T>().toBeArray();

// Functions
expectTypeOf<F>().toBeFunction();
expectTypeOf<F>().toBeCallableWith(arg1, arg2);
expectTypeOf<F>().parameter(0).toEqualTypeOf<string>();
expectTypeOf<F>().returns.toEqualTypeOf<number>();

// Generics
expectTypeOf<typeof generic>().toBeCallableWith<[string]>();
```

</expect_type_api>

<examples>

### Testing Result Type

```typescript
// result.test-d.ts
import { expectTypeOf } from 'expect-type';
import { Result, ok, err } from './result';

// Test constructors
expectTypeOf(ok('hello')).toEqualTypeOf<Result<string, never>>();
expectTypeOf(err(new Error())).toEqualTypeOf<Result<never, Error>>();

// Test type narrowing
declare const result: Result<string, Error>;

if (result.ok) {
  expectTypeOf(result.value).toBeString();
} else {
  expectTypeOf(result.error).toEqualTypeOf<Error>();
}
```

### Testing Branded Types

```typescript
// brand.test-d.ts
import { expectTypeOf } from 'expect-type';
import type { UserId, Email } from './brand';

// Test that branded types are not interchangeable
declare const userId: UserId;
declare const email: Email;

// @ts-expect-error - Cannot assign UserId to Email
const wrongAssignment: Email = userId;

// Test that branded types work with their base
expectTypeOf<UserId>().toMatchTypeOf<string>();
```

### Testing API Response Types

```typescript
// api.test-d.ts
import { expectTypeOf } from 'expect-type';
import { getUser } from './api';

// Test async function return type
expectTypeOf<typeof getUser>()
  .returns
  .resolves
  .toEqualTypeOf<Result<User, ApiError>>();

// Test parameter type
expectTypeOf<typeof getUser>()
  .parameter(0)
  .toEqualTypeOf<UserId>();
```

</examples>

<anti_patterns>

Avoid:
- Only testing runtime, not types
- Using `any` in type tests
- Skipping error case tests
- Not testing public API types
- Using `as` assertions in type tests

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Type test file created (*.test-d.ts)
- [ ] All exported types have tests
- [ ] Generic instantiation tested
- [ ] Error cases tested with `@ts-expect-error`
- [ ] Type tests run in CI
- [ ] `tsc --noEmit` passes

</success_criteria>

<next_steps>

- Debug failing type tests: `workflows/debug-types.md`
- Add runtime tests: Load **tdd** skill
- Document types: `references/tsdoc-patterns.md`

</next_steps>
