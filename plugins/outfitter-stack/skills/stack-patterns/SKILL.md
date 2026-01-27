---
name: stack-patterns
version: 0.1.0
description: Reference for Outfitter Stack patterns including Result types, Handler contract, Error taxonomy, and @outfitter/* package conventions. Use when learning the stack, looking up patterns, understanding packages, or when "Result", "Handler", "error taxonomy", "OutfitterError", "CLI output", "pagination", "MCP server", "MCP tool", "structured logging", "redaction", "test handler", "daemon", "IPC", or "@outfitter/*" are mentioned.
allowed-tools: Read Grep Glob
---

# Outfitter Stack Patterns

Primary reference for @outfitter/* package conventions.

## Handler Contract

Handlers are pure functions that:
- Accept typed input and context
- Return `Result<TOutput, TError>`
- Know nothing about transport (CLI flags, HTTP headers, MCP tool schemas)

```typescript
type Handler<TInput, TOutput, TError extends OutfitterError> = (
  input: TInput,
  ctx: HandlerContext
) => Promise<Result<TOutput, TError>>;
```

### Example

```typescript
import { Result, NotFoundError, type Handler } from "@outfitter/contracts";

export const getUser: Handler<{ id: string }, User, NotFoundError> = async (input, ctx) => {
  ctx.logger.debug("Fetching user", { userId: input.id });
  const user = await db.users.findById(input.id);

  if (!user) {
    return Result.err(new NotFoundError("user", input.id));
  }
  return Result.ok(user);
};
```

**Why?** Testability (just call the function), reusability (same handler for CLI/MCP/HTTP), type safety (explicit types), composability (handlers wrap handlers).

## Result Types

Uses `Result<T, E>` from `better-result` for explicit error handling.

```typescript
import { Result } from "@outfitter/contracts";

// Create
const ok = Result.ok({ name: "Alice" });
const err = Result.err(new NotFoundError("user", "123"));

// Check
if (result.isOk()) {
  console.log(result.value);  // TypeScript knows T
} else {
  console.log(result.error);  // TypeScript knows E
}

// Pattern match
const message = result.match({
  ok: (user) => `Found ${user.name}`,
  err: (error) => `Error: ${error.message}`,
});

// Combine
const combined = combine2(result1, result2);  // tuple or first error
```

## Error Taxonomy

Ten categories map to exit codes and HTTP status:

| Category | Exit | HTTP | When to Use |
|----------|------|------|-------------|
| `validation` | 1 | 400 | Invalid input, schema failures |
| `not_found` | 2 | 404 | Resource doesn't exist |
| `conflict` | 3 | 409 | Already exists, version mismatch |
| `permission` | 4 | 403 | Forbidden action |
| `timeout` | 5 | 504 | Operation took too long |
| `rate_limit` | 6 | 429 | Too many requests |
| `network` | 7 | 503 | Connection failures |
| `internal` | 8 | 500 | Unexpected errors, bugs |
| `auth` | 9 | 401 | Authentication required |
| `cancelled` | 130 | 499 | User interrupted (Ctrl+C) |

```typescript
import { ValidationError, NotFoundError, getExitCode } from "@outfitter/contracts";

new ValidationError("Invalid email", { field: "email" });
new NotFoundError("user", "user-123");

getExitCode(error.category);   // 2 for not_found
getStatusCode(error.category); // 404 for not_found
```

## Validation

Use Zod with `createValidator` for type-safe validation returning Results:

```typescript
import { createValidator } from "@outfitter/contracts";
import { z } from "zod";

const InputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const validateInput = createValidator(InputSchema);

// In handler
const inputResult = validateInput(rawInput);
if (inputResult.isErr()) return inputResult;
const input = inputResult.value;  // typed as z.infer<typeof InputSchema>
```

## Context

`HandlerContext` carries cross-cutting concerns:

```typescript
import { createContext } from "@outfitter/contracts";

const ctx = createContext({
  logger: myLogger,           // structured logger
  config: resolvedConfig,     // merged configuration
  signal: controller.signal,  // cancellation
  workspaceRoot: "/project",
});

// ctx.requestId is auto-generated UUIDv7 for tracing
```

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | `string` | Auto-generated UUIDv7 |
| `logger` | `Logger` | Structured logger |
| `config` | `ResolvedConfig` | Merged config |
| `signal` | `AbortSignal` | Cancellation signal |
| `workspaceRoot` | `string` | Project root |
| `cwd` | `string` | Current directory |

## Package Reference

| Package | Purpose | When to Use |
|---------|---------|-------------|
| `@outfitter/contracts` | Result types, errors, Handler contract | Always (foundation) |
| `@outfitter/cli` | CLI commands, output modes, Commander.js | CLI applications |
| `@outfitter/mcp` | MCP server, tool registration, Zod schemas | AI agent tools |
| `@outfitter/config` | XDG paths, config loading, env handling | Configuration needed |
| `@outfitter/logging` | Structured logging, sinks, redaction | Logging needed |
| `@outfitter/daemon` | Background services, IPC, health checks | Long-running services |
| `@outfitter/file-ops` | Secure paths, atomic writes, file safety | File operations |
| `@outfitter/state` | Pagination, cursor state | Paginated data |
| `@outfitter/testing` | Test harnesses, fixtures, Bun test | Testing |

**Selection guidance:**

- All projects start with `@outfitter/contracts`
- CLI apps add `@outfitter/cli`
- MCP servers add `@outfitter/mcp`
- Projects with config add `@outfitter/config`
- File operations need `@outfitter/file-ops` for safety

## Domain Error Mapping

Map your domain errors to the 10 taxonomy categories:

| Domain Error | Stack Category | Error Class | Exit | HTTP |
|--------------|----------------|-------------|------|------|
| Not found | `not_found` | `NotFoundError` | 2 | 404 |
| Invalid input | `validation` | `ValidationError` | 1 | 400 |
| Already exists | `conflict` | `ConflictError` | 3 | 409 |
| No permission | `permission` | `PermissionError` | 4 | 403 |
| Auth required | `auth` | `AuthError` | 9 | 401 |
| Timed out | `timeout` | `TimeoutError` | 5 | 504 |
| Connection failed | `network` | `NetworkError` | 7 | 503 |
| Limit exceeded | `rate_limit` | `RateLimitError` | 6 | 429 |
| Bug/unexpected | `internal` | `InternalError` | 8 | 500 |
| User cancelled | `cancelled` | `CancelledError` | 130 | 499 |

**Mapping examples:**

```typescript
// "User not found" -> NotFoundError
new NotFoundError("user", userId);

// "Invalid email format" -> ValidationError
new ValidationError("Invalid email", { field: "email" });

// "User already exists" -> ConflictError
new ConflictError("Email already registered", { email });

// "Cannot delete admin" -> PermissionError
new PermissionError("Cannot delete admin users");

// Unexpected errors -> InternalError
new InternalError("Database connection failed", { cause: error });
```

## Bun-First APIs

Prefer Bun-native APIs:

| Need | Bun API |
|------|---------|
| Hashing | `Bun.hash()` |
| Globbing | `Bun.Glob` |
| Semver | `Bun.semver` |
| Shell | `Bun.$` |
| Colors | `Bun.color()` |
| String width | `Bun.stringWidth()` |
| SQLite | `bun:sqlite` |
| UUID v7 | `Bun.randomUUIDv7()` |

## References

### Core Patterns

- [Handler Contract](references/handler.md)
- [Error Taxonomy](references/errors.md)
- [Result Utilities](references/results.md)
- [Conversion Patterns](references/conversion.md)

### Package Deep Dives

- [CLI Patterns](references/cli.md) - Output modes, pagination, Commander.js
- [MCP Patterns](references/mcp.md) - Tool registration, resources, schemas
- [Logging Patterns](references/logging.md) - Structured logging, sinks, redaction
- [Testing Patterns](references/testing.md) - Test harnesses, fixtures
- [Daemon Patterns](references/daemon.md) - Lifecycle, IPC, health checks
