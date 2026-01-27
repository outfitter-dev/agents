# Stack Testing

Test patterns for @outfitter/* packages.

## Test Structure

```
src/
├── handlers/
│   └── get-user.ts
└── __tests__/
    ├── get-user.test.ts
    └── __snapshots__/
        └── get-user.test.ts.snap
```

## Handler Testing

Test handlers directly without transport layer:

```typescript
import { describe, test, expect } from "bun:test";
import { createContext } from "@outfitter/contracts";
import { getUser } from "../handlers/get-user.js";

describe("getUser", () => {
  test("returns user when found", async () => {
    const ctx = createContext({});
    const result = await getUser({ id: "user-1" }, ctx);

    expect(result.isOk()).toBe(true);
    expect(result.value).toEqual({
      id: "user-1",
      name: "Alice",
    });
  });

  test("returns NotFoundError when user missing", async () => {
    const ctx = createContext({});
    const result = await getUser({ id: "missing" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("NotFoundError");
    expect(result.error.resourceId).toBe("missing");
  });

  test("returns ValidationError for invalid input", async () => {
    const ctx = createContext({});
    const result = await getUser({ id: "" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("ValidationError");
  });
});
```

## Test Fixtures

Use `createFixture` for deep-merged test data:

```typescript
import { createFixture } from "@outfitter/testing";

interface User {
  id: string;
  name: string;
  email: string;
  settings: { theme: string; notifications: boolean };
}

const createUser = createFixture<User>({
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  settings: { theme: "light", notifications: true },
});

test("user with custom settings", async () => {
  const user = createUser({ settings: { theme: "dark" } });
  // user.settings.notifications is still true (deep merge)
});
```

## Temporary Directories

Use `withTempDir` for isolated file operations:

```typescript
import { withTempDir } from "@outfitter/testing";

test("writes config file", async () => {
  await withTempDir(async (dir) => {
    const result = await writeConfig({ dir, data: { key: "value" } }, ctx);

    expect(result.isOk()).toBe(true);
    const content = await Bun.file(`${dir}/config.json`).json();
    expect(content).toEqual({ key: "value" });
  });
});
```

## Environment Mocking

Use `withEnv` for environment variable testing:

```typescript
import { withEnv } from "@outfitter/testing";

test("uses custom log level", async () => {
  await withEnv({ LOG_LEVEL: "debug" }, async () => {
    const config = loadConfig();
    expect(config.logLevel).toBe("debug");
  });
});
```

## CLI Testing

Use `createCliHarness` for CLI command testing:

```typescript
import { createCliHarness } from "@outfitter/testing";
import { listCommand } from "../commands/list.js";

const harness = createCliHarness(listCommand);

test("lists items in JSON mode", async () => {
  const result = await harness.run(["--json"]);

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain('"items"');
});

test("exits with error for invalid flag", async () => {
  const result = await harness.run(["--invalid"]);

  expect(result.exitCode).toBe(1);
  expect(result.stderr).toContain("Unknown option");
});
```

## MCP Testing

Use `createMcpHarness` for MCP tool testing:

```typescript
import { createMcpHarness } from "@outfitter/testing";
import { searchTool } from "../tools/search.js";

const harness = createMcpHarness(searchTool);

test("returns search results", async () => {
  const result = await harness.invoke({
    query: "test",
    limit: 10,
  });

  expect(result.isOk()).toBe(true);
  expect(result.value.results).toHaveLength(3);
});

test("validates input schema", async () => {
  const result = await harness.invoke({
    query: "",  // Invalid: min length 1
  });

  expect(result.isErr()).toBe(true);
  expect(result.error._tag).toBe("ValidationError");
});
```

## Context Mocking

Create mock context with logger spy:

```typescript
import { createContext } from "@outfitter/contracts";
import { createMockLogger } from "@outfitter/testing";

test("logs debug messages", async () => {
  const mockLogger = createMockLogger();
  const ctx = createContext({ logger: mockLogger });

  await myHandler({ id: "1" }, ctx);

  expect(mockLogger.calls.debug).toContainEqual([
    "Processing",
    { id: "1" },
  ]);
});
```

## Snapshot Testing

Use Bun's snapshot testing:

```typescript
import { expect, test } from "bun:test";

test("output matches snapshot", async () => {
  const result = await formatOutput(data);
  expect(result).toMatchSnapshot();
});
```

Snapshots stored in `__snapshots__/*.snap`.

## Result Assertions

Custom matchers for Result types:

```typescript
// Check success
expect(result.isOk()).toBe(true);
expect(result.value).toEqual(expected);

// Check failure
expect(result.isErr()).toBe(true);
expect(result.error._tag).toBe("NotFoundError");
expect(result.error.category).toBe("not_found");

// Error details
expect(result.error.details).toMatchObject({
  field: "email",
});
```

## Running Tests

```bash
# All tests
bun test

# Single file
bun test src/__tests__/get-user.test.ts

# Watch mode
bun test --watch

# With coverage
bun test --coverage

# Update snapshots
bun test --update-snapshots
```

## Best Practices

1. **Test handlers directly** - Skip transport layer for unit tests
2. **Use fixtures** - Create reusable test data with `createFixture`
3. **Isolate side effects** - Use `withTempDir` and `withEnv`
4. **Mock context** - Inject mock logger to verify logging
5. **Test error paths** - Verify correct error types and categories
6. **Snapshot outputs** - Use snapshots for complex output verification
