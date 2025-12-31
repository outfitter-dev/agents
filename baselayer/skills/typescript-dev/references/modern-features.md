# TypeScript 5.5-5.7 Features Reference

Comprehensive reference for TypeScript 5.5, 5.6, and 5.7 features with migration guidance.

## TypeScript 5.5 (June 2024)

### Inferred Type Predicates

TypeScript 5.5+ automatically infers type predicates from boolean-returning functions.

**Before (Manual Annotation):**

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

**After (Automatic Inference):**

```typescript
function isString(value: unknown) {
  return typeof value === 'string';
}
// TypeScript infers: value is string
```

**Inference Rules:**

1. Function returns boolean
2. Single parameter
3. Body contains type-narrowing expression
4. No explicit return type annotation

**Supported Patterns:**

```typescript
// typeof checks
function isNumber(x: unknown) {
  return typeof x === 'number';
}

// instanceof checks
function isError(x: unknown) {
  return x instanceof Error;
}

// Truthiness checks
function isDefined<T>(x: T | undefined) {
  return x !== undefined;
}

// Property existence
function hasId(x: unknown) {
  return typeof x === 'object' && x !== null && 'id' in x;
}

// Discriminated union narrowing
type Action = { type: 'add' } | { type: 'remove' };

function isAddAction(action: Action) {
  return action.type === 'add';
}
```

**When Manual Annotation Still Needed:**

```typescript
// Multiple parameters
function isGreater(a: number, b: number): boolean {
  return a > b;
}

// Negation predicates
function isNotNull<T>(x: T | null): x is T {
  return x !== null;
}

// Complex logic requiring documentation
function isValidUser(user: unknown): user is User {
  // Complex validation logic
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'name' in user &&
    typeof user.id === 'number' &&
    typeof user.name === 'string'
  );
}
```

### Regex Syntax Checking

TypeScript 5.5+ validates regex syntax at compile time.

```typescript
✅ Valid regex
const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

❌ Invalid regex caught at compile time
const invalidPattern = /^[a-z/; // Error: Unterminated character class

❌ Invalid escape sequence
const badEscape = /\k/; // Error: Invalid escape sequence
```

**Benefits:**

- Catch regex errors at compile time
- Improve regex clarity with type checking
- Better IDE support for regex patterns

### Control Flow Narrowing Improvements

Enhanced narrowing in edge cases:

```typescript
function processValue(value: string | number | null) {
  if (value) {
    // TS 5.5: value is string | number (excludes null and empty string)
    // TS 5.4: value is string | number | null (didn't exclude null)
  }
}

function checkArray<T>(arr: T[] | null) {
  if (arr?.length) {
    // TS 5.5: arr is T[] (excluded null)
    // TS 5.4: arr is T[] | null
  }
}
```

### JSDoc @import Tag

Import types in JSDoc comments:

```typescript
/**
 * @import { User } from './types'
 * @param {User} user - The user object
 */
function processUser(user) {
  // user has User type from import
}
```

**Benefits:**

- Type imports in JavaScript files
- Better JSDoc-based type checking
- Gradual TypeScript migration path

## TypeScript 5.6 (September 2024)

### Iterator Helper Methods

Native support for iterator helpers with proper typing.

**Array Iterator Methods:**

```typescript
const numbers = [1, 2, 3, 4, 5];

// map
const doubled = numbers.values()
  .map(x => x * 2)
  .toArray();
// [2, 4, 6, 8, 10]

// filter
const evens = numbers.values()
  .filter(x => x % 2 === 0)
  .toArray();
// [2, 4]

// take
const firstThree = numbers.values()
  .take(3)
  .toArray();
// [1, 2, 3]

// drop
const skipTwo = numbers.values()
  .drop(2)
  .toArray();
// [3, 4, 5]

// flatMap
const nested = [[1, 2], [3, 4]];
const flat = nested.values()
  .flatMap(x => x)
  .toArray();
// [1, 2, 3, 4]
```

**Chaining:**

```typescript
const result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .values()
  .filter(x => x % 2 === 0)  // [2, 4, 6, 8, 10]
  .map(x => x * 2)            // [4, 8, 12, 16, 20]
  .take(3)                    // [4, 8, 12]
  .toArray();
```

**Generator Support:**

```typescript
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const first10Fibs = fibonacci()
  .take(10)
  .toArray();
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### --noUncheckedSideEffectImports Flag

Enforces that all imports are used or side-effect-only.

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "noUncheckedSideEffectImports": true
  }
}
```

**Behavior:**

```typescript
❌ Unused import caught
import { helper } from './utils';
// Error: 'helper' is imported but never used

✅ Side-effect import allowed
import './polyfills';

✅ Used import allowed
import { helper } from './utils';
helper();
```

**Benefits:**

- Catch dead imports early
- Reduce bundle size
- Clarify side-effect imports

### Arbitrary Module Identifiers

Support for non-identifier module names:

```typescript
// Import from path with special characters
import data from './data-file.json' with { type: 'json' };

// Dynamic import with type assertion
const module = await import('./special-module', {
  with: { type: 'json' }
});
```

### Better --build Mode Performance

Improved incremental build performance:

- Faster project reference resolution
- Better caching for multi-project setups
- Reduced rebuild times for large monorepos

## TypeScript 5.7 (November 2024)

### Path Rewriting for Relative Imports

New compiler option for rewriting import extensions.

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true,
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

**Behavior:**

```typescript
// Source (.ts file)
import { helper } from './utils.ts';
import { config } from '../config/index.ts';

// Emitted (.js file)
import { helper } from './utils.js';
import { config } from '../config/index.js';
```

**Benefits:**

- Write .ts extensions in source
- Emit .js extensions for runtime
- Better ESM compatibility
- Clearer import intentions

**Requirements:**

- `module: "ESNext"` or `"NodeNext"`
- `moduleResolution: "bundler"` or `"NodeNext"`
- Only rewrites relative imports (not package imports)

### Init Checks for Readonly Properties

Stricter checking for readonly property initialization:

```typescript
class User {
  readonly id: number;
  readonly name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    // ✅ Both readonly properties initialized
  }
}

❌ Missing initialization caught
class InvalidUser {
  readonly id: number;

  constructor() {
    // Error: Property 'id' has no initializer and is not definitely assigned
  }
}
```

### Better Tuple Label Inference

Improved inference for tuple element labels:

```typescript
function createPair<T, U>(first: T, second: U) {
  return [first, second] as const;
}

const pair = createPair(1, 'hello');
// TS 5.7: readonly [first: 1, second: 'hello']
// TS 5.6: readonly [1, 'hello']
```

### Improved Error Messages

Better error messages for common mistakes:

**Before:**

```
Type '{ id: number; }' is not assignable to type 'User'.
  Property 'name' is missing in type '{ id: number; }'.
```

**After:**

```
Type '{ id: number; }' is missing the following properties from type 'User':
  - name (required)
  - email (required)
```

### Search-Based Loop Hoisting

Performance optimization for certain loop patterns:

```typescript
// Automatically optimized by compiler
function processArray(arr: number[]) {
  const length = arr.length; // Hoisted
  for (let i = 0; i < length; i++) {
    console.log(arr[i]);
  }
}
```

## Compiler Option Reference

### TypeScript 5.5+ Options

```json
{
  "compilerOptions": {
    // Existing strict options
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // New in 5.5
    "verbatimModuleSyntax": true  // Preserve exact import/export syntax
  }
}
```

### TypeScript 5.6+ Options

```json
{
  "compilerOptions": {
    // New in 5.6
    "noUncheckedSideEffectImports": true,  // Enforce import usage
    "allowImportingTsExtensions": true     // Allow .ts in imports (with bundler)
  }
}
```

### TypeScript 5.7+ Options

```json
{
  "compilerOptions": {
    // New in 5.7
    "rewriteRelativeImportExtensions": true,  // .ts → .js in output

    // Recommended combination for ESM
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM"]
  }
}
```

## Breaking Changes

### TypeScript 5.5 Breaking Changes

1. **Stricter Type Predicate Inference**

   ```typescript
   // May cause issues if relying on manual predicates
   function check(x: unknown) {
     return typeof x === 'string';
   }
   // Now inferred as type predicate automatically
   ```

2. **Better Control Flow Analysis**

   ```typescript
   // Some previously allowed code may now error
   let value: string | null = null;
   if (Math.random() > 0.5) {
     value = 'hello';
   }
   // Error: value might still be null
   ```

### TypeScript 5.6 Breaking Changes

1. **Iterator Helpers Require ES2015+ Target**

   ```json
   {
     "compilerOptions": {
       "target": "ES2015"  // Minimum for iterator helpers
     }
   }
   ```

2. **`noUncheckedSideEffectImports` May Break Existing Code**

   ```typescript
   // Now requires explicit side-effect imports
   import './styles.css';  // Must keep for side effects
   ```

### TypeScript 5.7 Breaking Changes

1. **Path Rewriting Changes Import Behavior**

   ```typescript
   // Source must use .ts extension
   import { x } from './mod.ts';  // Required

   import { x } from './mod';  // May error with rewriteRelativeImportExtensions
   ```

2. **Stricter Readonly Initialization**

   ```typescript
   // Must initialize all readonly properties
   class Example {
     readonly prop: string;
     constructor() {
       // Error: must assign this.prop
     }
   }
   ```

## Feature Compatibility Matrix

| Feature                            | TS Version | Runtime Requirement    | Transpile Target |
| ---------------------------------- | ---------- | ---------------------- | ---------------- |
| Inferred Type Predicates           | 5.5+       | Any                    | Any              |
| Regex Checking                     | 5.5+       | Any                    | Any              |
| Iterator Helpers                   | 5.6+       | ES2015+                | ES2015+          |
| `noUncheckedSideEffectImports`     | 5.6+       | Any                    | Any              |
| Path Rewriting                     | 5.7+       | ESM (Node 16+, bundler | ESNext           |
| Readonly Init Checks               | 5.7+       | Any                    | Any              |
| `using`/`await using` (earlier)    | 5.2+       | ES2022+ or polyfill    | ES2022+          |
| `satisfies` (earlier)              | 4.9+       | Any                    | Any              |
| Const Type Parameters (earlier)    | 5.0+       | Any                    | Any              |
| Template Literal Types (earlier)   | 4.1+       | Any (compile-time)     | Any              |

## Migration Checklist

### Upgrading to TypeScript 5.5

- [ ] Update TypeScript: `npm install -D typescript@^5.5.0`
- [ ] Review and remove manual type predicates where inference works
- [ ] Test regex patterns for compile-time validation
- [ ] Check control flow narrowing edge cases
- [ ] Update JSDoc imports if using JavaScript files

### Upgrading to TypeScript 5.6

- [ ] Update TypeScript: `npm install -D typescript@^5.6.0`
- [ ] Set `target: "ES2015"` or higher for iterator helpers
- [ ] Enable `noUncheckedSideEffectImports` gradually
- [ ] Review all imports for unused references
- [ ] Test iterator helper chains

### Upgrading to TypeScript 5.7

- [ ] Update TypeScript: `npm install -D typescript@^5.7.0`
- [ ] Enable `rewriteRelativeImportExtensions` if using ESM
- [ ] Update imports to use .ts extensions in source
- [ ] Check all readonly properties have initializers
- [ ] Review build output for correct .js extensions

## Performance Recommendations

### TypeScript 5.5+

- Use inferred type predicates (faster than manual)
- Enable `incremental: true` for faster rebuilds
- Use project references for monorepos

### TypeScript 5.6+

- Use iterator helpers over custom iteration (better optimization)
- Enable `noUncheckedSideEffectImports` to reduce bundle size
- Leverage improved `--build` mode for faster multi-project builds

### TypeScript 5.7+

- Use path rewriting for better ESM compatibility
- Take advantage of loop hoisting optimization
- Use tuple labels for better intellisense

## Resources

- [TypeScript 5.5 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/)
- [TypeScript 5.6 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/)
- [TypeScript 5.7 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript GitHub](https://github.com/microsoft/TypeScript)
