# Workflow: Eliminate Any Types

Systematically remove `any` from your codebase for full type safety.

<when_to_use>

- Codebase has `any` types that should be specific
- Upgrading from JavaScript to TypeScript
- Improving type coverage
- Preparing for strict mode

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/advanced-types.md (type guards section)

</required_reading>

<process>

## Step 1: Find All `any` Types

```bash
# Find explicit any
tsc --noEmit 2>&1 | grep -i "any"

# Search for any in source
rg ":\s*any" --type ts
rg "as any" --type ts
```

## Step 2: Categorize Each `any`

| Category | Example | Solution |
|----------|---------|----------|
| **Lazy** | `const x: any = getData()` | Add proper type |
| **Unknown data** | `fetch().json()` | Use `unknown` + validation |
| **Third-party** | Bad library types | Use module augmentation |
| **Intentional** | Complex metaprogramming | Document with `// eslint-disable-line` |

## Step 3: Replace with Specific Types

**Lazy `any` → Proper type:**

```typescript
// ❌ BEFORE
const config: any = loadConfig();
config.port; // No type checking!

// ✅ AFTER
interface Config {
  port: number;
  host: string;
}
const config: Config = loadConfig();
config.port; // Type checked!
```

**Unknown data → `unknown` + validation:**

```typescript
// ❌ BEFORE
async function fetchUser(id: string): Promise<any> {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

// ✅ AFTER
async function fetchUser(id: string): Promise<User> {
  const data: unknown = await fetch(`/api/users/${id}`).then(r => r.json());
  return UserSchema.parse(data); // Zod validation
}
```

**Type assertion `as any` → Type guard:**

```typescript
// ❌ BEFORE
function process(value: unknown) {
  const str = value as any as string;
  return str.toUpperCase();
}

// ✅ AFTER
function process(value: unknown): string {
  if (typeof value !== 'string') {
    throw new TypeError(`Expected string, got ${typeof value}`);
  }
  return value.toUpperCase();
}
```

## Step 4: Add Type Guards for Unknown

```typescript
// User-defined type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

// Usage
const data: unknown = await response.json();
if (!isUser(data)) {
  throw new Error('Invalid user data');
}
// data is now typed as User
```

## Step 5: Document Intentional `any`

For rare cases where `any` is truly needed:

```typescript
// Intentional any: Complex proxy implementation requires dynamic typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createProxy<T extends Record<string, any>>(target: T): T {
  // ...
}
```

## Step 6: Verify

```bash
# Count remaining any
rg ":\s*any" --type ts | wc -l

# Run type check
tsc --noEmit
```

</process>

<common_patterns>

### Event Handlers

```typescript
// ❌ BEFORE
onClick: (e: any) => void

// ✅ AFTER
onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
```

### JSON Data

```typescript
// ❌ BEFORE
const data: any = JSON.parse(text);

// ✅ AFTER
const data: unknown = JSON.parse(text);
const validated = DataSchema.parse(data);
```

### Error Catching

```typescript
// ❌ BEFORE
catch (e: any) {
  console.error(e.message);
}

// ✅ AFTER
catch (e: unknown) {
  if (e instanceof Error) {
    console.error(e.message);
  } else {
    console.error('Unknown error:', e);
  }
}
```

### Third-Party Libraries

```typescript
// When library has bad types, augment
declare module 'bad-library' {
  export interface Options {
    timeout: number;
    retries: number;
  }
  export function init(options: Options): void;
}
```

</common_patterns>

<anti_patterns>

Avoid:
- Replacing `any` with `unknown` without adding guards
- Using `@ts-ignore` instead of fixing types
- Adding `any` to make errors go away
- Skipping validation for "trusted" data

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] All `any` types categorized
- [ ] Lazy `any` replaced with specific types
- [ ] Unknown data uses `unknown` + validation
- [ ] Type guards added for runtime checks
- [ ] Remaining `any` documented and justified
- [ ] `tsc --noEmit` passes

</success_criteria>

<next_steps>

- Enable strict mode: `workflows/migrate-strict.md`
- Add runtime validation: `workflows/add-zod-validation.md`
- Debug complex types: `workflows/debug-types.md`

</next_steps>
