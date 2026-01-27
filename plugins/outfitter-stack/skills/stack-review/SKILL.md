---
name: stack-review
version: 0.1.0
description: Audits code for Outfitter Stack compliance including Result types, error handling, logging patterns, and path safety. Use for pre-commit reviews, code quality checks, migration validation, or when "audit", "check compliance", "review stack", or "stack patterns" are mentioned.
context: fork
agent: stacker
allowed-tools: Read Grep Glob Bash(rg *)
---

# Stack Compliance Review

Audit code for @outfitter/* pattern compliance.

## 6-Step Audit Process

### Step 1: Scan for Anti-Patterns

Run searches to identify issues:

```bash
# Thrown exceptions (Critical)
rg "throw new" --type ts

# try/catch control flow (Critical)
rg "try \{" --type ts

# Console usage (High)
rg "console\.(log|error|warn)" --type ts

# Hardcoded paths (High)
rg "(homedir|~\/\.)" --type ts

# Custom error classes (Medium)
rg "class \w+Error extends Error" --type ts
```

### Step 2: Review Handler Signatures

Check each handler for:

- Returns `Result<T, E>` not `Promise<T>`
- Has context parameter as second argument
- Error types explicitly listed in union
- Uses `Handler<TInput, TOutput, TError>` type

```bash
# Find handlers
rg "Handler<" --type ts -A 2

# Find missing context
rg "Handler<.*> = async \(input\)" --type ts
```

### Step 3: Check Error Usage

Verify errors:

- Use `@outfitter/contracts` classes
- Have correct category for use case
- Include appropriate details
- Are returned via `Result.err()`, not thrown

### Step 4: Validate Logging

Check logging:

- Uses `ctx.logger`, not console
- Metadata is object, not string concatenation
- Sensitive fields would be redacted
- Child loggers used for request context

### Step 5: Check Path Safety

Verify paths:

- User paths validated with `securePath()`
- XDG helpers used (`getConfigDir`, etc.)
- Atomic writes for file modifications
- No hardcoded home paths

### Step 6: Review Context

Check context:

- `createContext()` at entry points
- Context passed through handler chain
- `requestId` used for tracing

## Quick Audit

```bash
# Critical issues (count)
rg "throw new|catch \(" --type ts -c

# Console usage (count)
rg "console\.(log|error|warn)" --type ts -c

# Handler patterns
rg "Handler<" --type ts -A 2
```

## Checklist

### Result Types

- [ ] Handlers return `Result<T, E>`, not thrown exceptions
- [ ] Errors use taxonomy classes (`ValidationError`, `NotFoundError`, etc.)
- [ ] Result checks use `isOk()` / `isErr()`, not try/catch
- [ ] Combined results use `combine2`, `combine3`, etc.

**Anti-patterns:**

```typescript
// BAD: Throwing
if (!user) throw new Error("Not found");

// GOOD: Result.err
if (!user) return Result.err(new NotFoundError("user", id));

// BAD: try/catch for control flow
try { await handler(input, ctx); } catch (e) { ... }

// GOOD: Result checking
const result = await handler(input, ctx);
if (result.isErr()) { ... }
```

### Error Taxonomy

- [ ] Errors from `@outfitter/contracts`
- [ ] `category` matches use case
- [ ] `_tag` used for pattern matching

| Category | Use For |
|----------|---------|
| `validation` | Invalid input, schema failures |
| `not_found` | Resource doesn't exist |
| `conflict` | Already exists, version mismatch |
| `permission` | Forbidden action |
| `internal` | Unexpected errors, bugs |

### Logging

- [ ] Uses `ctx.logger`, not `console.log`
- [ ] Metadata is object, not string concatenation
- [ ] Sensitive fields redacted

**Anti-patterns:**

```typescript
// BAD
console.log("User " + user.name);
logger.info("Config: " + JSON.stringify(config));

// GOOD
ctx.logger.info("Processing", { userId: user.id });
ctx.logger.debug("Config loaded", { config });  // redaction enabled
```

### Path Safety

- [ ] User paths validated with `securePath()`
- [ ] No hardcoded `~/.` paths
- [ ] XDG paths via `@outfitter/config`
- [ ] Atomic writes for file modifications

**Anti-patterns:**

```typescript
// BAD
const configPath = path.join(os.homedir(), ".myapp", "config.json");
const userFile = path.join(baseDir, userInput);  // traversal risk!

// GOOD
const configDir = getConfigDir("myapp");
const result = securePath(userInput, workspaceRoot);
await atomicWriteJson(configPath, data);
```

### Context Propagation

- [ ] `createContext()` at entry points
- [ ] Context passed through handler chain
- [ ] `requestId` used for tracing

### Validation

- [ ] Uses `createValidator()` with Zod
- [ ] Validation at handler entry
- [ ] Validation errors returned, not thrown

### Output

- [ ] CLI uses `await output()` with mode detection
- [ ] `exitWithError()` for error exits
- [ ] Exit codes from error categories

## Audit Commands

```bash
# Find thrown exceptions
rg "throw new" --type ts

# Find console usage
rg "console\.(log|error|warn)" --type ts

# Find hardcoded paths
rg "(homedir|~\/\.)" --type ts

# Find custom errors
rg "class \w+Error extends Error" --type ts

# Find handlers without context
rg "Handler<.*> = async \(input\)" --type ts
```

## Severity Levels

| Level | Examples |
|-------|----------|
| **Critical** | Thrown exceptions, unvalidated paths, missing error handling |
| **High** | Console logging, hardcoded paths, missing context |
| **Medium** | Missing type annotations, non-atomic writes |
| **Low** | Style issues, missing documentation |

## Report Format

```markdown
## Stack Compliance: [file/module]

**Status**: PASS | WARNINGS | FAIL
**Issues**: X critical, Y high, Z medium

### Critical
1. [file:line] Issue description

### High
1. [file:line] Issue description

### Recommendations
- Recommendation with fix
```

## Related Skills

- `outfitter-stack:stack-patterns` — Correct patterns reference
- `outfitter-stack:stack-audit` — Scan codebase for adoption scope
- `outfitter-stack:stack-debug` — Troubleshooting issues
