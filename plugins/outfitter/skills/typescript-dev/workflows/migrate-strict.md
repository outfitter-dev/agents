# Workflow: Migrate to Strict Mode

Enable TypeScript strict mode incrementally without breaking the build.

<when_to_use>

- Project doesn't have `strict: true`
- Upgrading legacy TypeScript project
- Improving type safety gradually
- Preparing codebase for safer refactoring

</when_to_use>

<process>

## Step 1: Assess Current State

```bash
# Check current config
cat tsconfig.json | grep -A 20 "compilerOptions"

# Count current errors
tsc --noEmit 2>&1 | wc -l

# Find any types
rg ":\s*any" --type ts | wc -l
```

## Step 2: Enable Flags in Order

Enable flags incrementally, fixing errors between each:

| Order | Flag | Impact |
|-------|------|--------|
| 1 | `strictNullChecks` | Highest - null/undefined explicit |
| 2 | `strictFunctionTypes` | Medium - function param variance |
| 3 | `strictBindCallApply` | Low - bind/call/apply typed |
| 4 | `strictPropertyInitialization` | Medium - class properties |
| 5 | `noImplicitAny` | High - no implicit any |
| 6 | `noImplicitThis` | Low - this must be typed |
| 7 | `alwaysStrict` | Low - emit "use strict" |
| 8 | `strict: true` | Enables all above + future |

## Step 3: Enable `strictNullChecks` First

This is the most impactful and should be done first:

```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

**Common fixes:**

```typescript
// Error: Object is possibly 'undefined'
const user = users[0];
user.name; // Error!

// Fix 1: Optional chaining
user?.name;

// Fix 2: Non-null check
if (user) {
  user.name; // OK
}

// Fix 3: Default value
const user = users[0] ?? defaultUser;
```

## Step 4: Enable `noImplicitAny`

```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

**Common fixes:**

```typescript
// Error: Parameter 'x' implicitly has 'any' type
function process(x) { return x; }

// Fix: Add type annotation
function process(x: unknown): unknown { return x; }

// Or with specific type
function process(x: User): ProcessedUser { return transform(x); }
```

## Step 5: Enable Remaining Flags

After fixing nulls and anys, enable the rest:

```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

## Step 6: Replace with `strict: true`

Once all individual flags pass, consolidate:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Step 7: Add Extra Strict Flags

These aren't part of `strict` but recommended:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
}
```

## Step 8: Verify

```bash
# Should show 0 errors
tsc --noEmit

# Should show 0 results
rg ":\s*any" --type ts
rg "@ts-ignore" --type ts
```

</process>

<per_file_opt_out>

For stubborn files, temporarily opt out:

```typescript
// @ts-nocheck (entire file - use sparingly)

// Or specific lines
// @ts-expect-error Migration in progress
const legacyCode: any = oldFunction();
```

Track opt-outs and remove them:

```bash
# Find all opt-outs
rg "@ts-nocheck|@ts-ignore|@ts-expect-error" --type ts
```

</per_file_opt_out>

<common_issues>

| Issue | Cause | Fix |
|-------|-------|-----|
| "possibly undefined" everywhere | `strictNullChecks` | Add checks or `!` assertion |
| Class property errors | `strictPropertyInitialization` | Initialize in constructor or use `!` |
| Function param errors | `strictFunctionTypes` | Fix variance or use explicit types |
| Third-party lib errors | Bad types | Use `skipLibCheck` or patch types |

</common_issues>

<anti_patterns>

Avoid:
- Enabling `strict: true` all at once (too many errors)
- Using `@ts-ignore` instead of fixing types
- Skipping `strictNullChecks` (most important)
- Leaving `skipLibCheck: true` forever

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] `strict: true` enabled
- [ ] Extra strict flags enabled
- [ ] No `@ts-ignore` or `@ts-nocheck`
- [ ] No implicit `any` types
- [ ] `tsc --noEmit` passes with 0 errors

</success_criteria>

<next_steps>

- Eliminate remaining any: `workflows/eliminate-any.md`
- Add runtime validation: `workflows/add-zod-validation.md`
- Write type tests: `workflows/write-type-tests.md`

</next_steps>
