# Logging Patterns

Deep dive into @outfitter/logging patterns.

## Creating a Logger

```typescript
import { createLogger, createConsoleSink } from "@outfitter/logging";

const logger = createLogger({
  name: "my-app",
  level: "info",
  sinks: [createConsoleSink()],
  redaction: { enabled: true },
});
```

## Log Levels

| Level | Method | Use For |
|-------|--------|---------|
| `trace` | `logger.trace()` | Very detailed debugging |
| `debug` | `logger.debug()` | Development debugging |
| `info` | `logger.info()` | Normal operations |
| `warn` | `logger.warn()` | Unexpected but handled |
| `error` | `logger.error()` | Failures requiring attention |
| `fatal` | `logger.fatal()` | Unrecoverable failures |

Level hierarchy: `trace` < `debug` < `info` < `warn` < `error` < `fatal`

Setting level to `info` hides `trace` and `debug`.

## Structured Logging

Always use metadata objects:

```typescript
// GOOD: Structured metadata
logger.info("User created", {
  userId: user.id,
  email: user.email,
  duration: performance.now() - start,
});

// BAD: String concatenation
logger.info("User " + user.name + " created in " + duration + "ms");
```

## Child Loggers

Add context that persists across calls:

```typescript
import { createChildLogger } from "@outfitter/logging";

const requestLogger = createChildLogger(logger, {
  requestId: ctx.requestId,
  handler: "createUser",
});

// All logs include requestId and handler
requestLogger.info("Processing");           // Has requestId, handler
requestLogger.debug("Validated input");     // Has requestId, handler
requestLogger.info("User created", { userId }); // Has requestId, handler, userId
```

## Redaction

### Enable Redaction

```typescript
const logger = createLogger({
  name: "my-app",
  level: "info",
  sinks: [createConsoleSink()],
  redaction: { enabled: true },
});

logger.info("Config", {
  apiKey: "secret-123",     // Logged as "[REDACTED]"
  password: "hunter2",      // Logged as "[REDACTED]"
  email: "user@example.com" // Not redacted
});
```

### Default Redaction Patterns

Automatically redacted:
- `password`, `pwd`
- `apiKey`, `api_key`
- `secret`, `secretKey`
- `token`, `accessToken`
- `auth`, `authorization`
- `key` (when containing sensitive data)
- `credential`, `credentials`

### Custom Patterns

```typescript
const logger = createLogger({
  name: "my-app",
  redaction: {
    enabled: true,
    patterns: [
      "password",
      "apiKey",
      "myCustomSecret",
      "internalToken",
    ],
  },
});
```

### Deep Redaction

Nested values are also redacted:

```typescript
logger.info("Request", {
  headers: {
    authorization: "Bearer token",  // Redacted
  },
  body: {
    user: {
      password: "secret",  // Redacted
    },
  },
});
```

## Sinks

### Console Sink

```typescript
import { createConsoleSink } from "@outfitter/logging";

const consoleSink = createConsoleSink({
  colorize: true,           // ANSI colors
  prettyPrint: true,        // Formatted output
  timestampFormat: "iso",   // ISO 8601 timestamps
});
```

### File Sink

```typescript
import { createFileSink } from "@outfitter/logging";

const fileSink = createFileSink({
  path: "/var/log/myapp/app.log",
  maxSize: 10 * 1024 * 1024,  // 10MB
  maxFiles: 5,                 // Keep 5 rotated files
});
```

### Multiple Sinks

```typescript
const logger = createLogger({
  name: "my-app",
  level: "debug",
  sinks: [
    createConsoleSink({ level: "info" }),     // Console: info+
    createFileSink({                           // File: debug+
      path: "/var/log/myapp/debug.log",
      level: "debug",
    }),
  ],
});
```

### Custom Sink

```typescript
const customSink = {
  log: (record) => {
    // Send to external service
    externalService.send({
      level: record.level,
      message: record.message,
      metadata: record.metadata,
      timestamp: record.timestamp,
    });
  },
};

const logger = createLogger({
  name: "my-app",
  sinks: [customSink],
});
```

## Environment Configuration

```typescript
const logger = createLogger({
  name: "my-app",
  level: process.env.LOG_LEVEL || "info",
  sinks: [
    createConsoleSink({
      colorize: process.stdout.isTTY,
      prettyPrint: process.env.NODE_ENV !== "production",
    }),
  ],
});
```

## Handler Context Integration

```typescript
import { createContext } from "@outfitter/contracts";
import { createLogger, createChildLogger } from "@outfitter/logging";

const baseLogger = createLogger({ name: "my-app", level: "info" });

export function createHandlerContext() {
  const ctx = createContext({ logger: baseLogger });

  // Child logger with requestId
  return {
    ...ctx,
    logger: createChildLogger(baseLogger, { requestId: ctx.requestId }),
  };
}

// In handler
const myHandler: Handler<Input, Output, Error> = async (input, ctx) => {
  ctx.logger.info("Processing", { input });  // Includes requestId
  // ...
};
```

## Performance

### Conditional Logging

```typescript
// Level check before expensive operations
if (logger.isEnabled("debug")) {
  const expensiveData = computeDebugInfo();
  logger.debug("Debug info", { data: expensiveData });
}
```

### Lazy Evaluation

```typescript
logger.debug("State", () => ({
  // Only computed if debug level is enabled
  memory: process.memoryUsage(),
  connections: getActiveConnections(),
}));
```

## Best Practices

1. **Structured metadata** - Always use objects, not string concatenation
2. **Child loggers** - Add request context that persists
3. **Enable redaction** - Prevent secrets from leaking
4. **Level per environment** - Debug in dev, info in prod
5. **Request IDs** - Include for tracing across handlers
6. **Lazy evaluation** - Avoid expensive computations at disabled levels
