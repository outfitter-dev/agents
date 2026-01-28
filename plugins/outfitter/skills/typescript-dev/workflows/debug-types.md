# Workflow: Debug TypeScript Type Errors

Systematically debug complex TypeScript type errors.

<when_to_use>

- Cryptic type errors you don't understand
- Generic type constraints failing
- Conditional types behaving unexpectedly
- Inferred types not matching expectations
- Type narrowing not working

</when_to_use>

<process>

## Step 1: Read the Error Carefully

TypeScript errors have a structure:

```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'.
  Type 'A' is not assignable to type 'B'.
    Property 'c' is missing in type 'D' but required in type 'E'.
```

Work from **bottom to top** - the deepest line is the actual problem.

## Step 2: Simplify to Minimal Reproduction

```typescript
// Create a minimal test file
// types-debug.ts

// Copy ONLY the types involved
type A = { ... };
type B = { ... };

// Copy the failing expression
const x: A = { ... };
const y: B = x; // Does this fail?
```

If it doesn't fail in isolation, the problem is in how types flow together.

## Step 3: Expand Complex Types

Use a debug utility to see what a type actually resolves to:

```typescript
// Debug utility - expands type for inspection
type Debug<T> = { [K in keyof T]: T[K] };
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// Usage
type MyComplexType = SomeGeneric<Foo, Bar>;
type Revealed = Debug<MyComplexType>;
//   ^? Hover to see expanded type
```

## Step 4: Check Common Causes

### Conditional Type Branch

```typescript
type Result<T> = T extends string ? 'string' : 'other';

// Problem: T is union, result is union
type R = Result<string | number>; // 'string' | 'other', not one or the other

// Fix: Wrap in tuple to prevent distribution
type Result<T> = [T] extends [string] ? 'string' : 'other';
```

### Generic Constraint

```typescript
// Problem: T is not constrained
function getLength<T>(arr: T): number {
  return arr.length; // Error: length doesn't exist on T
}

// Fix: Add constraint
function getLength<T extends { length: number }>(arr: T): number {
  return arr.length;
}
```

### Inference Not Working

```typescript
// Problem: Inference happens too early
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

// T inferred from arr, but fn's parameter might be wider

// Fix: NoInfer utility (TS 5.4+)
function map<T, U>(arr: T[], fn: (item: NoInfer<T>) => U): U[] {
  return arr.map(fn);
}
```

### Type Narrowing Lost

```typescript
// Problem: Reassigning breaks narrowing
let result = getData();
if (result.ok) {
  result = transform(result.value); // Narrowing lost!
}

// Fix: Separate variables
const initial = getData();
if (!initial.ok) return initial;
const transformed = transform(initial.value);
```

## Step 5: Use IDE Features

**Hover for type info:**
- Hover over variables to see inferred type
- Hover over generic parameters to see constraints

**Go to definition:**
- Jump to type definitions to understand structure
- Check library `.d.ts` files for expected types

**Quick fixes:**
- TypeScript suggests fixes - review before accepting
- "Add missing properties" can reveal what's expected

## Step 6: Test the Fix

```typescript
// After fixing, verify with explicit annotations
const result: ExpectedType = expression;
// If this compiles, the types match
```

</process>

<debugging_techniques>

### Print Type at Compile Time

```typescript
// Force type error to see the type
type Print<T> = T extends never ? 'unreachable' : T;
type Revealed = Print<MyType>;

// Or use a helper that errors with the type
declare function reveal<T>(t: T): never;
reveal(myValue); // Error message shows the type
```

### Check Distributive Behavior

```typescript
// Does the type distribute over unions?
type Test<T> = T extends any ? [T] : never;

// If T is A | B, result is [A] | [B], not [A | B]
```

### Verify Constraints

```typescript
// Is T actually what you expect?
function debug<T extends SomeConstraint>(t: T): T {
  // Add a type assertion to verify
  const check: SomeConstraint = t; // Should compile
  return t;
}
```

</debugging_techniques>

<common_errors>

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| "Type 'X' is not assignable to type 'Y'" | Missing property or wrong type | Check property shapes |
| "Type 'X' has no index signature" | Object used with dynamic keys | Add index signature or use Map |
| "Cannot use 'new' with expression" | Constructor type issue | Use `new (...args) => T` |
| "'T' could be instantiated with arbitrary type" | Generic too loose | Add constraint |
| "Excessive stack depth" | Recursive type issue | Add termination condition |

</common_errors>

<anti_patterns>

Avoid:
- Adding `as any` to silence errors
- Using `@ts-ignore` without understanding the issue
- Widening types just to make it compile
- Skipping minimal reproduction (wastes time)

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Error understood (not just suppressed)
- [ ] Root cause identified
- [ ] Fix maintains type safety
- [ ] No `any` or `@ts-ignore` introduced
- [ ] Types compile without errors

</success_criteria>

<references>

- **Cross-reference:** For systematic investigation approach, load the **debugging** skill
- TypeScript Playground: https://www.typescriptlang.org/play
- TS Error Translator: https://ts-error-translator.vercel.app/

</references>
