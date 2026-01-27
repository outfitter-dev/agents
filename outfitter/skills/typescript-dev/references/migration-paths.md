# Migration Paths for TypeScript Modern Features

Strategies for adopting TypeScript 5.5+ features in existing codebases.

## Upgrade Strategy Overview

### Stage 1: Foundation (Week 1)

1. Update TypeScript version
2. Run type checking, fix any new errors
3. Update tsconfig.json with recommended options
4. Verify build pipeline compatibility

### Stage 2: Automated Refactoring (Week 2)

1. Remove redundant type predicates (let TS 5.5+ infer)
2. Replace manual cleanup with `using` where applicable
3. Convert type assertions to `satisfies` where beneficial

### Stage 3: Manual Improvements (Weeks 3-4)

1. Adopt const type parameters for literal preservation
2. Use template literal types for advanced patterns
3. Leverage new compiler options (path rewriting, etc.)

### Stage 4: Validation (Week 5)

1. Test thoroughly in development and staging
2. Monitor bundle sizes
3. Verify runtime behavior unchanged
4. Update documentation

## Detailed Migration Paths

### Migrating from TypeScript 4.x to 5.5+

#### Step 1: Update Dependencies

```bash
npm install -D typescript@^5.5.0

# Or with pnpm
pnpm add -D typescript@^5.5.0

# Or with yarn
yarn add -D typescript@^5.5.0
```

#### Step 2: Update tsconfig.json

```json
{
  "compilerOptions": {
    // Update target and lib
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],

    // Modern module resolution
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Strict mode (if not already enabled)
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // New 5.5+ options
    "verbatimModuleSyntax": true,

    // Performance
    "incremental": true,
    "skipLibCheck": true
  }
}
```

#### Step 3: Fix Breaking Changes

**Control Flow Analysis:**

```typescript
❌ May break in TS 5.5+
function process(value: string | null) {
  if (Math.random() > 0.5) {
    value = 'hello';
  }
  return value.toUpperCase(); // Error: value might be null
}

✅ Fix with proper narrowing
function process(value: string | null) {
  const result = Math.random() > 0.5 ? 'hello' : value;
  if (result === null) {
    return '';
  }
  return result.toUpperCase();
}
```

**Type Predicate Conflicts:**

```typescript
❌ Manual predicate may conflict with inference
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

✅ Remove manual annotation, let TS infer
function isString(x: unknown) {
  return typeof x === 'string';
}
// TypeScript 5.5+ infers: x is string
```

### Migrating to `using` Keyword

#### Identify Candidates

Search codebase for `try/finally` patterns:

```bash
# Find potential candidates
grep -r "try.*finally" src/
```

#### Pattern 1: Database Connections

**Before:**

```typescript
async function queryDatabase() {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('SELECT * FROM users');
    return result;
  } finally {
    conn.release();
  }
}
```

**After:**

```typescript
class PooledConnection implements AsyncDisposable {
  constructor(private conn: Connection) {}

  async [Symbol.asyncDispose]() {
    this.conn.release();
  }

  query(sql: string) {
    return this.conn.query(sql);
  }
}

async function queryDatabase() {
  await using conn = await pool.getConnection();
  return conn.query('SELECT * FROM users');
}
```

#### Pattern 2: File Handles

**Before:**

```typescript
function readConfig() {
  const fd = fs.openSync('config.json', 'r');
  try {
    const buffer = Buffer.alloc(1024);
    fs.readSync(fd, buffer, 0, 1024, 0);
    return JSON.parse(buffer.toString('utf8'));
  } finally {
    fs.closeSync(fd);
  }
}
```

**After:**

```typescript
class FileHandle implements Disposable {
  private fd: number;

  constructor(path: string, mode: string) {
    this.fd = fs.openSync(path, mode);
  }

  [Symbol.dispose]() {
    fs.closeSync(this.fd);
  }

  read(size: number): string {
    const buffer = Buffer.alloc(size);
    fs.readSync(this.fd, buffer, 0, size, 0);
    return buffer.toString('utf8');
  }
}

function readConfig() {
  using file = new FileHandle('config.json', 'r');
  return JSON.parse(file.read(1024));
}
```

#### Pattern 3: Locks

**Before:**

```typescript
async function criticalSection() {
  await mutex.acquire();
  try {
    // Critical section
    sharedState.value++;
  } finally {
    mutex.release();
  }
}
```

**After:**

```typescript
class MutexLock implements AsyncDisposable {
  constructor(private mutex: Mutex) {}

  async [Symbol.asyncDispose]() {
    this.mutex.release();
  }
}

class Mutex {
  async acquire(): Promise<MutexLock> {
    await this.internalAcquire();
    return new MutexLock(this);
  }

  release() {
    // Release logic
  }

  private async internalAcquire() {
    // Acquire logic
  }
}

async function criticalSection() {
  await using lock = await mutex.acquire();
  sharedState.value++;
}
```

### Migrating to `satisfies`

#### Identify Candidates

Look for:

1. Type assertions that lose precision
2. Explicit type annotations on config objects
3. Places where autocomplete is poor

```bash
# Find type assertions
grep -r "as const" src/
grep -r ": typeof" src/
```

#### Pattern 1: Config Objects

**Before:**

```typescript
const config: Config = {
  port: 3000,
  host: 'localhost',
  features: {
    analytics: true,
    darkMode: false
  }
};

// Type: Config
// config.features.unknownKey works (no error!)
```

**After:**

```typescript
const config = {
  port: 3000,
  host: 'localhost',
  features: {
    analytics: true,
    darkMode: false
  }
} satisfies Config;

// Type: { port: number; host: string; features: { ... } }
// config.features.unknownKey errors!
```

#### Pattern 2: Route Definitions

**Before:**

```typescript
const routes: Record<string, RouteConfig> = {
  home: { path: '/', handler: 'home' },
  user: { path: '/user/:id', handler: 'user' }
};

// Type: Record<string, RouteConfig>
routes.home.path; // string (too wide)
```

**After:**

```typescript
const routes = {
  home: { path: '/', handler: 'home' },
  user: { path: '/user/:id', handler: 'user' }
} satisfies Record<string, RouteConfig>;

// Type: { home: { path: string; ... }, user: { ... } }
routes.home.path; // string (but autocomplete shows exact keys)
```

#### Pattern 3: As Const with Validation

**Before:**

```typescript
const colors = {
  primary: '#007bff',
  secondary: '#6c757d'
} as const;

// Type: { readonly primary: '#007bff'; readonly secondary: '#6c757d' }
// But no validation against Color schema
```

**After:**

```typescript
const colors = {
  primary: '#007bff',
  secondary: '#6c757d'
} as const satisfies Record<string, `#${string}`>;

// Type: { readonly primary: '#007bff'; readonly secondary: '#6c757d' }
// Validated: all values match #xxxxxx pattern
```

### Migrating to Const Type Parameters

#### Identify Candidates

Look for generic functions that return input types:

```bash
# Find generic functions
grep -r "function.*<.*extends" src/
```

#### Pattern 1: Array Builders

**Before:**

```typescript
function tuple<T extends readonly unknown[]>(...args: T): T {
  return args;
}

const result = tuple('a', 'b', 'c');
// Type: (string | 'a' | 'b' | 'c')[] (widened)
```

**After:**

```typescript
function tuple<const T extends readonly unknown[]>(...args: T): T {
  return args;
}

const result = tuple('a', 'b', 'c');
// Type: ['a', 'b', 'c'] (exact)
```

#### Pattern 2: Object Builders

**Before:**

```typescript
function defineConfig<T extends Record<string, any>>(config: T): T {
  return config;
}

const config = defineConfig({
  port: 3000,
  host: 'localhost'
});
// Type: { port: number; host: string } (widened)
```

**After:**

```typescript
function defineConfig<const T extends Record<string, any>>(config: T): T {
  return config;
}

const config = defineConfig({
  port: 3000,
  host: 'localhost'
});
// Type: { readonly port: 3000; readonly host: 'localhost' } (exact)
```

### Migrating to Path Rewriting (TS 5.7+)

#### Step 1: Enable in tsconfig.json

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "rewriteRelativeImportExtensions": true
  }
}
```

#### Step 2: Update Imports

**Before:**

```typescript
// May work but inconsistent
import { helper } from './utils';
import { config } from '../config/index';
```

**After:**

```typescript
// Explicit, clear intent
import { helper } from './utils.ts';
import { config } from '../config/index.ts';

// Emits:
// import { helper } from './utils.js';
// import { config } from '../config/index.js';
```

#### Step 3: Update Build Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit"
  }
}
```

## Gradual Adoption Strategy

### Low-Risk Features (Adopt First)

1. **Inferred Type Predicates**: Drop in replacement, no runtime changes
2. **satisfies**: Better types, no runtime changes
3. **Const Type Parameters**: Better inference, no runtime changes

### Medium-Risk Features (Test Thoroughly)

1. **using/await using**: Runtime behavior changes, requires polyfill for older targets
2. **Path Rewriting**: Changes module resolution, test in staging first

### High-Risk Features (Careful Rollout)

1. **noUncheckedSideEffectImports**: May break existing imports
2. **Iterator Helpers**: Requires ES2015+ runtime, not available in older browsers

## Rollback Plan

If issues arise:

1. **Revert TypeScript version**: `npm install -D typescript@4.9.5`
2. **Restore old tsconfig**: Keep backup of working config
3. **Remove new syntax**: Search and replace `using` → `try/finally`
4. **Document issues**: Track what broke, why, and how to fix

## Testing Strategy

### Type-Level Tests

```typescript
// type-tests.ts
import { expectType, expectError } from 'tsd';

// Test inferred predicates
function isString(x: unknown) {
  return typeof x === 'string';
}

const value: unknown = 'hello';
if (isString(value)) {
  expectType<string>(value);
}

// Test satisfies
const config = {
  port: 3000
} satisfies { port: number };

expectType<{ port: number }>(config);
expectError(config.unknownKey);
```

### Runtime Tests

```typescript
// runtime-tests.ts
describe('Resource Management', () => {
  it('should dispose resources automatically', async () => {
    let disposed = false;

    class TestResource implements AsyncDisposable {
      async [Symbol.asyncDispose]() {
        disposed = true;
      }
    }

    {
      await using resource = new TestResource();
      expect(disposed).toBe(false);
    }

    expect(disposed).toBe(true);
  });
});
```

### Integration Tests

```typescript
// integration-tests.ts
describe('Modern TypeScript Features', () => {
  it('should work end-to-end', async () => {
    // Test using with real database
    await using db = await createConnection();
    const result = await db.query('SELECT 1');
    expect(result).toBeDefined();
  });

  it('should validate config with satisfies', () => {
    const config = loadConfig() satisfies AppConfig;
    expect(config.port).toBeGreaterThan(0);
  });
});
```

## Monitoring and Metrics

Track during migration:

1. **Build Times**: Should not increase significantly
2. **Bundle Sizes**: May decrease with better tree-shaking
3. **Type Errors**: Track new errors, ensure they're valid
4. **Runtime Performance**: No degradation expected

## Common Pitfalls

### Pitfall 1: Over-using `using`

```typescript
❌ Don't use for simple values
using x = 5; // Error: not disposable

✅ Only for resources with cleanup
using conn = new DatabaseConnection();
```

### Pitfall 2: Mixing satisfies and as const

```typescript
❌ Wrong order
const config = {
  port: 3000
} as const satisfies Config; // Error in some cases

✅ Correct order
const config = {
  port: 3000
} satisfies Config as const; // Or separate them
```

### Pitfall 3: Path Rewriting Without Bundler

```typescript
❌ Requires bundler or Node 16+ with ESM
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true,
    "moduleResolution": "node" // Wrong!
  }
}

✅ Use bundler resolution
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true,
    "moduleResolution": "bundler" // Correct
  }
}
```

## Version-Specific Migration Notes

### TypeScript 4.x → 5.5

- Focus: Type predicates, regex validation
- Risk: Low
- Time: 1-2 weeks

### TypeScript 5.0-5.4 → 5.5

- Focus: Inferred predicates
- Risk: Very low
- Time: 1 week

### TypeScript 5.5 → 5.6

- Focus: Iterator helpers, import checking
- Risk: Medium (runtime requirements)
- Time: 2-3 weeks

### TypeScript 5.6 → 5.7

- Focus: Path rewriting, readonly checks
- Risk: Medium (module resolution changes)
- Time: 2 weeks

## Resources

- Keep tsconfig backup: `cp tsconfig.json tsconfig.backup.json`
- Use `--noEmit` for type-only checks during migration
- Test in CI/CD pipeline before merging
- Document breaking changes for team
- Create migration guide for project-specific patterns
