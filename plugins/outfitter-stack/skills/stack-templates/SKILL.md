---
name: stack-templates
version: 0.1.0
description: Templates for creating handlers, CLI commands, MCP tools, and daemon services following Outfitter Stack conventions. Use when scaffolding new components, creating handlers, adding commands, or when "create handler", "new command", "add tool", "scaffold", "template", or "daemon service" are mentioned.
context: fork
agent: stacker
allowed-tools: Read Write Edit Glob Grep
argument-hint: [component type]
---

# Stack Templates

Templates for creating @outfitter/* components.

## Component Types

| Type | Package | Template |
|------|---------|----------|
| Handler | `@outfitter/contracts` | [handler](#handler) |
| Handler Test | `@outfitter/testing` | [handler-test](#handler-test) |
| CLI Command | `@outfitter/cli` | [cli-command](#cli-command) |
| MCP Tool | `@outfitter/mcp` | [mcp-tool](#mcp-tool) |
| Daemon | `@outfitter/daemon` | [daemon-service](#daemon-service) |

## Handler

Transport-agnostic business logic returning `Result<T, E>`:

```typescript
import {
  Result,
  ValidationError,
  NotFoundError,
  createValidator,
  type Handler,
} from "@outfitter/contracts";
import { z } from "zod";

// 1. Input schema
const InputSchema = z.object({
  id: z.string().min(1),
});
type Input = z.infer<typeof InputSchema>;

// 2. Output type
interface Output {
  id: string;
  name: string;
}

// 3. Validator
const validateInput = createValidator(InputSchema);

// 4. Handler
export const myHandler: Handler<unknown, Output, ValidationError | NotFoundError> = async (
  rawInput,
  ctx
) => {
  const inputResult = validateInput(rawInput);
  if (inputResult.isErr()) return inputResult;
  const input = inputResult.value;

  ctx.logger.debug("Processing", { id: input.id });

  const resource = await fetchResource(input.id);
  if (!resource) {
    return Result.err(new NotFoundError("resource", input.id));
  }

  return Result.ok(resource);
};
```

## Handler Test

Test handlers directly without transport layer:

```typescript
import { describe, test, expect } from "bun:test";
import { createContext } from "@outfitter/contracts";
import { myHandler } from "../handlers/my-handler.js";

describe("myHandler", () => {
  test("returns success for valid input", async () => {
    const ctx = createContext({});
    const result = await myHandler({ id: "valid-id" }, ctx);

    expect(result.isOk()).toBe(true);
    expect(result.value).toMatchObject({ id: "valid-id" });
  });

  test("returns NotFoundError for missing resource", async () => {
    const ctx = createContext({});
    const result = await myHandler({ id: "missing" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("NotFoundError");
    expect(result.error.resourceId).toBe("missing");
  });

  test("returns ValidationError for invalid input", async () => {
    const ctx = createContext({});
    const result = await myHandler({ id: "" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("ValidationError");
  });
});
```

## CLI Command

Commander.js command calling a handler:

```typescript
import { command, output, exitWithError } from "@outfitter/cli";
import { createContext } from "@outfitter/contracts";
import { myHandler } from "../handlers/my-handler.js";

export const myCommand = command("my-command")
  .description("What this command does")
  .argument("<id>", "Resource ID")
  .option("-l, --limit <n>", "Limit results", parseInt)
  .action(async ({ args, flags }) => {
    const ctx = createContext({});

    const result = await myHandler({ id: args.id, limit: flags.limit }, ctx);

    if (result.isErr()) {
      exitWithError(result.error);
    }

    await output(result.value);
  })
  .build();
```

Register in CLI:

```typescript
import { createCLI } from "@outfitter/cli";
import { myCommand } from "./commands/my-command.js";

const cli = createCLI({ name: "myapp", version: "1.0.0" });
cli.program.addCommand(myCommand);
cli.program.parse();
```

## MCP Tool

Use `defineTool()` for type-safe tool definitions with automatic schema inference:

```typescript
import { defineTool } from "@outfitter/mcp";
import { Result, ValidationError } from "@outfitter/contracts";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string().describe("Search query"),
  limit: z.number().int().positive().default(10).describe("Max results"),
});

interface Output {
  results: Array<{ id: string; title: string }>;
  total: number;
}

export const myTool = defineTool({
  name: "my_tool",
  description: "Tool description for AI agent",
  inputSchema: InputSchema,

  handler: async (input): Promise<Result<Output, ValidationError>> => {
    // input is automatically typed as z.infer<typeof InputSchema>
    const results = await search(input.query, input.limit);
    return Result.ok({ results, total: results.length });
  },
});
```

Register in server:

```typescript
import { createMcpServer } from "@outfitter/mcp";
import { myTool } from "./tools/my-tool.js";

const server = createMcpServer({ name: "my-server", version: "0.1.0" });
server.registerTool(myTool);
server.start();
```

## Daemon Service

Background service with health checks and IPC:

```typescript
import {
  createDaemon,
  createIpcServer,
  createHealthChecker,
  getSocketPath,
  getLockPath,
} from "@outfitter/daemon";
import { createLogger, createConsoleSink } from "@outfitter/logging";
import { Result } from "@outfitter/contracts";

const logger = createLogger({
  name: "my-daemon",
  level: "info",
  sinks: [createConsoleSink()],
  redaction: { enabled: true },
});

const daemon = createDaemon({
  name: "my-daemon",
  pidFile: getLockPath("my-daemon"),
  logger,
  shutdownTimeout: 10000,
});

const healthChecker = createHealthChecker([
  {
    name: "memory",
    check: async () => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      return used < 500
        ? Result.ok(undefined)
        : Result.err(new Error(`High memory: ${used.toFixed(2)}MB`));
    },
  },
]);

const ipcServer = createIpcServer(getSocketPath("my-daemon"));

ipcServer.onMessage(async (msg) => {
  const message = msg as { type: string };
  switch (message.type) {
    case "status": return { status: "ok", uptime: process.uptime() };
    case "health": return await healthChecker.check();
    default: return { error: "Unknown command" };
  }
});

daemon.onShutdown(async () => {
  logger.info("Shutting down...");
  await ipcServer.close();
});

async function main() {
  const startResult = await daemon.start();
  if (startResult.isErr()) {
    logger.error("Failed to start", { error: startResult.error });
    process.exit(1);
  }
  await ipcServer.listen();
  logger.info("Started", { socket: getSocketPath("my-daemon") });
}

main();
```

## Best Practices

1. **Handler First** - Write handler before adapter (CLI/MCP/API)
2. **Validate Early** - Use `createValidator` at handler entry
3. **Type Errors** - List all error types in handler signature
4. **Context Propagation** - Pass context through all handler calls
5. **Test Handlers** - Test handlers directly without transport layer

## References

- [templates/handler.md](templates/handler.md)
- [templates/handler-test.md](templates/handler-test.md)
- [templates/cli-command.md](templates/cli-command.md)
- [templates/mcp-tool.md](templates/mcp-tool.md)
- [templates/daemon-service.md](templates/daemon-service.md)
