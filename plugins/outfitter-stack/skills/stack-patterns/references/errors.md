# Error Taxonomy

Ten error categories that map to exit codes (CLI) and HTTP status codes (API).

## Categories

| Category | Exit | HTTP | Class | When to Use |
|----------|------|------|-------|-------------|
| `validation` | 1 | 400 | `ValidationError` | Invalid input, schema failures, constraint violations |
| `not_found` | 2 | 404 | `NotFoundError` | Resource doesn't exist |
| `conflict` | 3 | 409 | `ConflictError` | Already exists, version mismatch, optimistic lock failure |
| `permission` | 4 | 403 | `PermissionError` | Forbidden action, insufficient privileges |
| `timeout` | 5 | 504 | `TimeoutError` | Operation took too long |
| `rate_limit` | 6 | 429 | `RateLimitError` | Too many requests, quota exceeded |
| `network` | 7 | 503 | `NetworkError` | Connection failures, DNS errors, unreachable hosts |
| `internal` | 8 | 500 | `InternalError` | Unexpected errors, bugs, unhandled cases |
| `auth` | 9 | 401 | `AuthError` | Authentication required, invalid credentials |
| `cancelled` | 130 | 499 | `CancelledError` | User interrupted (Ctrl+C), operation aborted |

## Error Classes

All errors extend `OutfitterError` and have:

```typescript
interface OutfitterError {
  readonly _tag: string;           // Discriminator for pattern matching
  readonly category: ErrorCategory; // One of the 10 categories
  readonly message: string;         // Human-readable message
  readonly details?: unknown;       // Additional context
}
```

### ValidationError

```typescript
import { ValidationError } from "@outfitter/contracts";

// Basic
new ValidationError("Invalid email format");

// With details
new ValidationError("Validation failed", {
  field: "email",
  value: "not-an-email",
  constraint: "email",
});

// From Zod
const result = schema.safeParse(input);
if (!result.success) {
  return Result.err(new ValidationError("Invalid input", {
    issues: result.error.issues,
  }));
}
```

### NotFoundError

```typescript
import { NotFoundError } from "@outfitter/contracts";

// Resource type and ID
new NotFoundError("user", "user-123");

// Access properties
error.resourceType;  // "user"
error.resourceId;    // "user-123"
error.message;       // "user not found: user-123"
```

### ConflictError

```typescript
import { ConflictError } from "@outfitter/contracts";

// Already exists
new ConflictError("User already exists", { email: "user@example.com" });

// Version mismatch
new ConflictError("Version mismatch", {
  expected: 5,
  actual: 7,
});
```

### PermissionError

```typescript
import { PermissionError } from "@outfitter/contracts";

new PermissionError("Cannot delete admin users", {
  action: "delete",
  resource: "user",
  resourceId: "admin-1",
});
```

### TimeoutError

```typescript
import { TimeoutError } from "@outfitter/contracts";

new TimeoutError("Database query timed out", {
  operation: "findUsers",
  timeoutMs: 5000,
});
```

### RateLimitError

```typescript
import { RateLimitError } from "@outfitter/contracts";

new RateLimitError("API rate limit exceeded", {
  limit: 100,
  window: "1m",
  retryAfter: 30,
});
```

### NetworkError

```typescript
import { NetworkError } from "@outfitter/contracts";

new NetworkError("Failed to connect to API", {
  host: "api.example.com",
  code: "ECONNREFUSED",
});
```

### InternalError

```typescript
import { InternalError } from "@outfitter/contracts";

// Wrap unexpected errors
try {
  await riskyOperation();
} catch (error) {
  return Result.err(new InternalError("Unexpected error", { cause: error }));
}
```

### AuthError

```typescript
import { AuthError } from "@outfitter/contracts";

new AuthError("Invalid API key");
new AuthError("Token expired", { expiredAt: "2024-01-01T00:00:00Z" });
```

### CancelledError

```typescript
import { CancelledError } from "@outfitter/contracts";

if (ctx.signal.aborted) {
  return Result.err(new CancelledError("Operation cancelled by user"));
}
```

## Pattern Matching

Use `_tag` for type-safe error handling:

```typescript
if (result.isErr()) {
  switch (result.error._tag) {
    case "ValidationError":
      console.log("Invalid input:", result.error.details);
      break;
    case "NotFoundError":
      console.log(`${result.error.resourceType} not found`);
      break;
    case "ConflictError":
      console.log("Conflict:", result.error.message);
      break;
    default:
      console.log("Error:", result.error.message);
  }
}
```

## Exit Code Mapping

```typescript
import { getExitCode } from "@outfitter/contracts";

const exitCode = getExitCode(error.category);
process.exit(exitCode);
```

## HTTP Status Mapping

```typescript
import { getStatusCode } from "@outfitter/contracts";

const status = getStatusCode(error.category);
res.status(status).json({ error: error.message });
```

## Creating Custom Errors

Extend the base classes for domain-specific errors:

```typescript
import { ValidationError } from "@outfitter/contracts";

export class EmailValidationError extends ValidationError {
  constructor(email: string) {
    super("Invalid email format", { email, field: "email" });
  }
}
```

The category is inherited, so exit codes and HTTP status work automatically.
