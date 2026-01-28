# MCP Server Patterns

Deep dive into @outfitter/mcp patterns.

## Creating a Server

```typescript
import { createMcpServer, defineTool } from "@outfitter/mcp";

const server = createMcpServer({
  name: "my-server",
  version: "0.1.0",
  description: "Server for AI agents",
});

// Register tools before start
server.registerTool(searchTool);
server.registerTool(createTool);

// Start server
server.start();
```

## Tool Definition

### Using defineTool()

The `defineTool()` helper provides full type inference from the Zod schema:

```typescript
import { defineTool } from "@outfitter/mcp";
import { Result, ValidationError } from "@outfitter/contracts";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string().min(1).describe("Search query"),
  limit: z.number().int().positive().default(10).describe("Max results"),
});

export const searchTool = defineTool({
  name: "search",
  description: "Search for items. Use when user asks to find or search.",
  inputSchema: InputSchema,

  handler: async (input): Promise<Result<SearchOutput, ValidationError>> => {
    // input is automatically typed from InputSchema
    const results = await performSearch(input.query, input.limit);
    return Result.ok({ results, total: results.length });
  },
});
```

### Schema Best Practices

```typescript
const InputSchema = z.object({
  // Always use .describe() for AI understanding
  query: z.string().describe("The search term to look for"),

  // Provide defaults where sensible
  limit: z.number().default(10).describe("Maximum number of results"),

  // Use enums for fixed choices
  sortBy: z.enum(["name", "date", "relevance"]).default("relevance")
    .describe("Field to sort results by"),

  // Mark optional fields explicitly
  tags: z.array(z.string()).optional().describe("Filter by tags"),
});
```

### Tool with Context

```typescript
export const myTool = defineTool({
  name: "my_tool",
  description: "Tool description",
  inputSchema: InputSchema,

  handler: async (input, ctx) => {
    ctx.logger.debug("Tool invoked", { input });

    const result = await myHandler(input, ctx);

    if (result.isErr()) {
      ctx.logger.error("Tool failed", { error: result.error });
    }

    return result;
  },
});
```

## Resources

### Static Resource

```typescript
server.registerResource({
  uri: "config://settings",
  name: "Configuration",
  description: "Current server configuration",
  mimeType: "application/json",

  read: async () => {
    return JSON.stringify(config, null, 2);
  },
});
```

### Dynamic Resource

```typescript
server.registerResource({
  uri: "data://users/{id}",
  name: "User Data",
  description: "User information by ID",
  mimeType: "application/json",

  read: async (uri) => {
    const id = uri.split("/").pop();
    const user = await getUser(id);
    return JSON.stringify(user);
  },
});
```

### Resource List

```typescript
server.registerResourceList({
  uri: "data://users",
  name: "Users",
  description: "List of all users",

  list: async () => {
    const users = await getAllUsers();
    return users.map(u => ({
      uri: `data://users/${u.id}`,
      name: u.name,
      description: u.email,
    }));
  },
});
```

## Prompts

```typescript
server.registerPrompt({
  name: "analyze",
  description: "Analyze data with specific focus",
  arguments: [
    { name: "focus", description: "What to focus on", required: true },
    { name: "depth", description: "Analysis depth", required: false },
  ],

  get: async (args) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyze with focus on: ${args.focus}. Depth: ${args.depth || "normal"}`,
          },
        },
      ],
    };
  },
});
```

## Error Handling

### Returning Errors

```typescript
handler: async (input) => {
  if (!input.query) {
    return Result.err(new ValidationError("Query is required"));
  }

  const item = await findItem(input.id);
  if (!item) {
    return Result.err(new NotFoundError("item", input.id));
  }

  return Result.ok(item);
}
```

### Error Categories in MCP

| Category | MCP Behavior |
|----------|--------------|
| validation | Tool returns error with details |
| not_found | Tool returns error with resource info |
| internal | Tool returns generic error, logs full error |

## Server Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "bun",
      "args": ["run", "/path/to/server.ts"]
    }
  }
}
```

### With Environment Variables

```json
{
  "mcpServers": {
    "my-server": {
      "command": "bun",
      "args": ["run", "/path/to/server.ts"],
      "env": {
        "API_KEY": "secret",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Deferred Tool Loading

For tools that are expensive to load:

```typescript
import { defineDeferredTool } from "@outfitter/mcp";

const heavyTool = defineDeferredTool({
  name: "heavy_tool",
  description: "Expensive tool loaded on demand",

  load: async () => {
    const { heavyTool } = await import("./heavy-tool.js");
    return heavyTool;
  },
});

// Deferred tools use the same registerTool() API - the server
// detects the deferred wrapper and handles lazy loading internally
server.registerTool(heavyTool);
```

## Testing MCP Servers

```typescript
import { createMcpHarness } from "@outfitter/testing";

const harness = createMcpHarness(myTool);

test("tool returns results", async () => {
  const result = await harness.invoke({ query: "test" });

  expect(result.isOk()).toBe(true);
  expect(result.value.results).toHaveLength(3);
});
```

## Best Practices

1. **Descriptive schemas** - Use `.describe()` on every field
2. **Sensible defaults** - Provide `.default()` where appropriate
3. **Error categories** - Use taxonomy errors for proper handling
4. **Logging** - Log tool invocations for debugging
5. **Deferred loading** - Lazy load expensive tools
6. **Test harnesses** - Use `createMcpHarness` for testing
