# Handler Test Template

Test handlers directly without transport layer using Bun test runner.

## Template

```typescript
import { describe, test, expect, beforeEach } from "bun:test";
import { createContext, type HandlerContext } from "@outfitter/contracts";
import { myHandler } from "../handlers/my-handler.js";

describe("myHandler", () => {
  let ctx: HandlerContext;

  beforeEach(() => {
    ctx = createContext({});
  });

  // ============================================================================
  // Success Cases
  // ============================================================================

  test("returns success for valid input", async () => {
    const result = await myHandler({ id: "valid-id" }, ctx);

    expect(result.isOk()).toBe(true);
    expect(result.value).toMatchObject({
      id: "valid-id",
      // Add expected properties
    });
  });

  test("returns success with optional parameters", async () => {
    const result = await myHandler(
      { id: "valid-id", includeDeleted: true },
      ctx
    );

    expect(result.isOk()).toBe(true);
    // Assert on optional behavior
  });

  // ============================================================================
  // Error Cases
  // ============================================================================

  test("returns NotFoundError for missing resource", async () => {
    const result = await myHandler({ id: "missing" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("NotFoundError");
    expect(result.error.resourceType).toBe("resource");
    expect(result.error.resourceId).toBe("missing");
  });

  test("returns ValidationError for empty id", async () => {
    const result = await myHandler({ id: "" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("ValidationError");
  });

  test("returns ValidationError for missing required field", async () => {
    const result = await myHandler({} as any, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("ValidationError");
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  test("handles special characters in id", async () => {
    const result = await myHandler({ id: "user-123/test" }, ctx);

    // Assert expected behavior
  });

  test("respects cancellation signal", async () => {
    const controller = new AbortController();
    const ctxWithSignal = createContext({ signal: controller.signal });

    controller.abort();
    const result = await myHandler({ id: "valid-id" }, ctxWithSignal);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("CancelledError");
  });
});
```

## Checklist

- [ ] Test success cases with valid input
- [ ] Test all error types in handler signature
- [ ] Test validation errors for invalid/missing input
- [ ] Test edge cases (special characters, empty arrays, etc.)
- [ ] Test cancellation if handler supports it
- [ ] Use `createContext({})` for test context
- [ ] Check `result.isOk()` / `result.isErr()` before accessing value/error
- [ ] Use `_tag` for error type discrimination

## Result Assertions

### Success Assertions

```typescript
// Check success
expect(result.isOk()).toBe(true);

// Access value (type-safe after isOk check)
expect(result.value.id).toBe("expected-id");

// Match object structure
expect(result.value).toMatchObject({
  id: "expected-id",
  name: expect.any(String),
});

// Array assertions
expect(result.value.items).toHaveLength(3);
expect(result.value.items[0]).toMatchObject({ type: "expected" });
```

### Error Assertions

```typescript
// Check error
expect(result.isErr()).toBe(true);

// Check error type
expect(result.error._tag).toBe("NotFoundError");

// Check error category
expect(result.error.category).toBe("not_found");

// Check error properties
expect(result.error.resourceType).toBe("user");
expect(result.error.resourceId).toBe("123");

// Check error message
expect(result.error.message).toContain("not found");

// Check error details
expect(result.error.details).toMatchObject({
  field: "email",
});
```

## Testing with Mock Logger

```typescript
import { createMockLogger } from "@outfitter/testing";

test("logs debug messages", async () => {
  const mockLogger = createMockLogger();
  const ctx = createContext({ logger: mockLogger });

  await myHandler({ id: "123" }, ctx);

  expect(mockLogger.calls.debug).toContainEqual([
    "Processing",
    { id: "123" },
  ]);
});
```

## Testing with Fixtures

```typescript
import { createFixture } from "@outfitter/testing";

interface User {
  id: string;
  name: string;
  email: string;
  settings: { theme: string };
}

const createUser = createFixture<User>({
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  settings: { theme: "light" },
});

test("processes user with custom settings", async () => {
  const user = createUser({ settings: { theme: "dark" } });
  // user.name is still "Test User" (deep merge)
  // user.settings.theme is "dark"
});
```

## Testing with Temporary Directories

```typescript
import { withTempDir } from "@outfitter/testing";

test("writes config file", async () => {
  await withTempDir(async (dir) => {
    const ctx = createContext({ workspaceRoot: dir });
    const result = await writeConfigHandler({ data: { key: "value" } }, ctx);

    expect(result.isOk()).toBe(true);

    const content = await Bun.file(`${dir}/config.json`).json();
    expect(content).toEqual({ key: "value" });
  });
});
```

## Running Tests

```bash
# All tests
bun test

# Single file
bun test src/__tests__/my-handler.test.ts

# Watch mode
bun test --watch

# With coverage
bun test --coverage

# Filter by name
bun test --filter "returns success"
```
