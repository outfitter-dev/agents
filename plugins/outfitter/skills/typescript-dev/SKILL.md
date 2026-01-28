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
- Debugging type errors
- Migrating to strict mode

NOT for: runtime-only logic unrelated to types, non-TypeScript projects

</when_to_use>

<intake>

What do you need help with?

1. **Build new module** — Create type-safe module from scratch
2. **Add validation** — Runtime validation with Zod at boundaries
3. **Add Result types** — Replace exceptions with explicit error handling
4. **Eliminate any** — Remove unsafe `any` types systematically
5. **Enable strict mode** — Migrate to strict TypeScript incrementally
6. **Debug type errors** — Fix complex/cryptic type errors
7. **Write type tests** — Compile-time tests for your types

</intake>

<routing>

| Response | Workflow | References |
|----------|----------|------------|
| 1, "new module", "from scratch" | workflows/build-type-safe-module.md | references/tsdoc-patterns.md |
| 2, "validation", "Zod", "safeParse" | workflows/add-zod-validation.md | references/zod-*.md |
| 3, "Result", "error handling" | workflows/add-result-types.md | references/result-pattern.md |
| 4, "any", "unknown", "eliminate" | workflows/eliminate-any.md | references/advanced-types.md |
| 5, "strict", "strictNullChecks" | workflows/migrate-strict.md | - |
| 6, "error", "debug", "not assignable" | workflows/debug-types.md | - |
| 7, "type test", "expect-type" | workflows/write-type-tests.md | - |

</routing>

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

<quick_reference>

### Eliminating any

```typescript
// ❌ NEVER
function process(data: any) { return data.value; }

// ✅ ALWAYS
function process(data: unknown): string {
  if (!hasValue(data)) throw new TypeError('Invalid');
  return data.value.toString();
}
```

### Result Types

```typescript
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// Caller must handle both cases
if (!result.ok) return handleError(result.error);
return result.value;
```

### Discriminated Unions

```typescript
type RequestState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: User }
  | { readonly status: 'error'; readonly error: string };
```

### Branded Types

```typescript
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };
type UserId = Brand<string, 'UserId'>;
```

### Zod Validation

```typescript
const result = UserSchema.safeParse(data);
if (!result.success) return handleError(result.error.issues);
const user = result.data; // Type-safe
```

### Modern TS Features

- `using conn = new Connection()` — auto-cleanup (5.2+)
- `satisfies Record<string, T>` — validate without widening (4.9+)
- `<const T>` — preserve literals through generics (5.0+)
- Inferred predicates — auto `x is string` (5.5+)

</quick_reference>

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

**Workflows:**
- workflows/build-type-safe-module.md — Create new modules
- workflows/add-zod-validation.md — Add runtime validation
- workflows/add-result-types.md — Error handling patterns
- workflows/eliminate-any.md — Remove any types
- workflows/migrate-strict.md — Enable strict mode
- workflows/debug-types.md — Fix type errors
- workflows/write-type-tests.md — Test your types

**Type Patterns:**
- references/result-pattern.md — Result/Either utilities
- references/branded-types.md — Advanced branded patterns
- references/advanced-types.md — Template literals, utilities

**Modern Features:**
- references/modern-features.md — TS 5.5-5.8
- references/migration-paths.md — Upgrading TypeScript

**Zod:**
- references/zod-building-blocks.md — Primitives, transforms
- references/zod-schemas.md — Composition patterns
- references/zod-integration.md — API, forms, env

**TSDoc:**
- references/tsdoc-patterns.md — Documentation patterns

**Examples:**
- examples/api-response.md — End-to-end type-safe API
- examples/form-validation.md — Zod + React Hook Form
- examples/resource-management.md — using declarations
- examples/state-machine.md — Discriminated union patterns

</references>
