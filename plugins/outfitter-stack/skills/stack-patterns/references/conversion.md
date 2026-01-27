# Conversion Patterns

Patterns for converting existing code to Outfitter Stack conventions.

## Exceptions to Result

Convert throw-based error handling to Result types.

**Before:**
```typescript
async function getUser(id: string): Promise<User> {
  const user = await db.users.findById(id);
  if (!user) throw new Error(`Not found: ${id}`);
  return user;
}
```

**After:**
```typescript
import { Result, NotFoundError, type Handler } from "@outfitter/contracts";

const getUser: Handler<{ id: string }, User, NotFoundError> = async (input, ctx) => {
  const user = await db.users.findById(input.id);
  if (!user) return Result.err(new NotFoundError("user", input.id));
  return Result.ok(user);
};
```

## Console to Structured Logging

Replace console calls with structured logging via context.

**Before:**
```typescript
console.log("Processing", userId);
console.error("Failed to process", error);
console.warn("Deprecated API usage");
```

**After:**
```typescript
ctx.logger.info("Processing", { userId });
ctx.logger.error("Failed to process", { error: error.message });
ctx.logger.warn("Deprecated API usage", { api: "oldEndpoint" });
```

### Logging Level Mapping

| Console Method | Logger Method | When to Use |
|----------------|---------------|-------------|
| `console.log` | `ctx.logger.info` | Normal operations |
| `console.debug` | `ctx.logger.debug` | Development debugging |
| `console.warn` | `ctx.logger.warn` | Unexpected but handled |
| `console.error` | `ctx.logger.error` | Failures requiring attention |

## Hardcoded Paths to XDG

Replace hardcoded home directory paths with XDG-compliant paths.

**Before:**
```typescript
import os from "node:os";
import path from "node:path";

const configPath = path.join(os.homedir(), ".myapp", "config.json");
const cachePath = path.join(os.homedir(), ".cache", "myapp");
const dataPath = path.join(os.homedir(), ".local", "share", "myapp");
```

**After:**
```typescript
import { getConfigDir, getCacheDir, getDataDir } from "@outfitter/config";
import path from "node:path";

const configPath = path.join(getConfigDir("myapp"), "config.json");
const cachePath = getCacheDir("myapp");
const dataPath = getDataDir("myapp");
```

### XDG Path Functions

| Function | Default Path | Env Override |
|----------|--------------|--------------|
| `getConfigDir(app)` | `~/.config/{app}` | `XDG_CONFIG_HOME` |
| `getCacheDir(app)` | `~/.cache/{app}` | `XDG_CACHE_HOME` |
| `getDataDir(app)` | `~/.local/share/{app}` | `XDG_DATA_HOME` |
| `getStateDir(app)` | `~/.local/state/{app}` | `XDG_STATE_HOME` |

## Error Taxonomy Mapping

Map existing custom errors to the 10 taxonomy categories.

| Original Pattern | Outfitter Error | Category |
|------------------|-----------------|----------|
| `NotFoundError` | `NotFoundError` | `not_found` |
| `InvalidInputError` | `ValidationError` | `validation` |
| `DuplicateError` | `ConflictError` | `conflict` |
| `UnauthorizedError` | `AuthError` | `auth` |
| `ForbiddenError` | `PermissionError` | `permission` |
| `TimeoutError` | `TimeoutError` | `timeout` |
| `RateLimitError` | `RateLimitError` | `rate_limit` |
| `ConnectionError` | `NetworkError` | `network` |
| Generic `Error` | `InternalError` | `internal` |
| `AbortError` | `CancelledError` | `cancelled` |

### Mapping by Error Name Keywords

| Keyword in Error Name | Maps To |
|-----------------------|---------|
| `notfound`, `missing` | `NotFoundError` |
| `validation`, `invalid`, `input` | `ValidationError` |
| `conflict`, `duplicate`, `exists` | `ConflictError` |
| `permission`, `forbidden` | `PermissionError` |
| `timeout` | `TimeoutError` |
| `ratelimit`, `rate`, `throttle` | `RateLimitError` |
| `network`, `connection` | `NetworkError` |
| `auth`, `unauthorized`, `unauthenticated` | `AuthError` |
| `cancel`, `abort` | `CancelledError` |

## Compatibility Layer

Wrap legacy throwing code during transition with a Result-returning wrapper.

```typescript
import { Result, InternalError } from "@outfitter/contracts";

/**
 * Wraps a synchronous function that may throw, returning a Result.
 */
function wrapSync<T>(fn: () => T): Result<T, InternalError> {
  try {
    return Result.ok(fn());
  } catch (error) {
    return Result.err(new InternalError(
      error instanceof Error ? error.message : "Unknown error",
      { cause: error }
    ));
  }
}

/**
 * Wraps an async function that may throw, returning a Result.
 */
async function wrapAsync<T>(fn: () => Promise<T>): Promise<Result<T, InternalError>> {
  try {
    return Result.ok(await fn());
  } catch (error) {
    return Result.err(new InternalError(
      error instanceof Error ? error.message : "Unknown error",
      { cause: error }
    ));
  }
}
```

### Usage Example

```typescript
// Wrap a third-party library call
const result = await wrapAsync(() => thirdPartyApi.fetch(id));

if (result.isErr()) {
  ctx.logger.error("Third-party API failed", { error: result.error });
  return result;
}

const data = result.value;
```

## Try-Catch to Result

Convert try-catch blocks to Result chains.

**Before:**
```typescript
async function processOrder(orderId: string): Promise<Order> {
  try {
    const order = await fetchOrder(orderId);
    const validated = validateOrder(order);
    const processed = await processPayment(validated);
    return processed;
  } catch (error) {
    console.error("Order processing failed", error);
    throw error;
  }
}
```

**After:**
```typescript
const processOrder: Handler<{ orderId: string }, Order, OrderError> = async (input, ctx) => {
  const orderResult = await fetchOrder(input.orderId, ctx);
  if (orderResult.isErr()) return orderResult;

  const validatedResult = validateOrder(orderResult.value);
  if (validatedResult.isErr()) return validatedResult;

  const processedResult = await processPayment(validatedResult.value, ctx);
  if (processedResult.isErr()) return processedResult;

  return Result.ok(processedResult.value);
};
```

## Conversion Strategy

1. **New code first** - All new code uses stack patterns
2. **Leaf functions** - Start with functions that don't call others
3. **Bottom-up** - Convert dependencies before dependents
4. **Feature boundaries** - Complete one feature at a time
5. **Test coverage** - Add tests before converting
