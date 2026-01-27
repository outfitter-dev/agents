# MCP Tool Template

Zod-schema-based tool for MCP servers returning `Result<T, E>`.

## Template

```typescript
import { Result, ValidationError, NotFoundError } from "@outfitter/contracts";
import { z } from "zod";

// ============================================================================
// Input Schema
// ============================================================================

const InputSchema = z.object({
  // Always use .describe() for AI understanding
  query: z.string().min(1).describe("The search term to look for"),

  // Provide defaults where sensible
  limit: z.number().int().positive().default(10)
    .describe("Maximum number of results to return"),

  // Use enums for fixed choices
  sortBy: z.enum(["name", "date", "relevance"]).default("relevance")
    .describe("Field to sort results by"),

  // Mark optional fields explicitly
  tags: z.array(z.string()).optional()
    .describe("Filter results by these tags"),

  // Boolean options
  includeArchived: z.boolean().default(false)
    .describe("Whether to include archived items"),
});

// ============================================================================
// Output Type
// ============================================================================

interface SearchResult {
  id: string;
  title: string;
  score: number;
}

interface Output {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

type ToolErrors = ValidationError | NotFoundError;

// ============================================================================
// Tool Definition
// ============================================================================

export const searchTool = {
  name: "search_items",
  description: `Search for items in the database.

Use this tool when the user wants to:
- Find items by keyword
- Search for specific content
- List items matching criteria

Returns matching items with relevance scores.`,

  inputSchema: InputSchema,

  handler: async (
    input: z.infer<typeof InputSchema>
  ): Promise<Result<Output, ToolErrors>> => {
    // Business logic
    const results = await performSearch({
      query: input.query,
      limit: input.limit,
      sortBy: input.sortBy,
      tags: input.tags,
      includeArchived: input.includeArchived,
    });

    return Result.ok({
      results,
      total: results.length,
      hasMore: results.length === input.limit,
    });
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

async function performSearch(options: {
  query: string;
  limit: number;
  sortBy: string;
  tags?: string[];
  includeArchived: boolean;
}): Promise<SearchResult[]> {
  // Implementation
  return [];
}
```

## Registration

```typescript
import { createMcpServer } from "@outfitter/mcp";
import { searchTool } from "./tools/search.js";
import { createTool } from "./tools/create.js";

const server = createMcpServer({
  name: "my-server",
  version: "0.1.0",
  description: "MCP server for item management",
});

// Register tools
server.registerTool(searchTool);
server.registerTool(createTool);

// Start server
server.start();
```

## Checklist

- [ ] Every schema field has `.describe()` for AI understanding
- [ ] Sensible defaults with `.default()` where appropriate
- [ ] Description explains WHEN to use the tool
- [ ] Returns `Result`, not raw values
- [ ] Error types from taxonomy

## Patterns

### Tool with Context

```typescript
export const myTool = {
  name: "my_tool",
  description: "Tool with context access",
  inputSchema: InputSchema,

  handler: async (input, ctx) => {
    // Log invocation
    ctx.logger.debug("Tool invoked", { input });

    // Call handler
    const result = await myHandler(input, ctx);

    // Log outcome
    if (result.isErr()) {
      ctx.logger.error("Tool failed", { error: result.error });
    }

    return result;
  },
};
```

### CRUD Tool Set

```typescript
// List
export const listItemsTool = {
  name: "list_items",
  description: "List all items. Use when user wants to see available items.",
  inputSchema: z.object({
    limit: z.number().default(20).describe("Max items to return"),
    offset: z.number().default(0).describe("Number of items to skip"),
  }),
  handler: async (input) => { /* ... */ },
};

// Get
export const getItemTool = {
  name: "get_item",
  description: "Get a specific item by ID. Use when user asks about a specific item.",
  inputSchema: z.object({
    id: z.string().describe("The item ID to retrieve"),
  }),
  handler: async (input) => { /* ... */ },
};

// Create
export const createItemTool = {
  name: "create_item",
  description: "Create a new item. Use when user wants to add something new.",
  inputSchema: z.object({
    name: z.string().describe("Name for the new item"),
    description: z.string().optional().describe("Optional description"),
  }),
  handler: async (input) => { /* ... */ },
};

// Update
export const updateItemTool = {
  name: "update_item",
  description: "Update an existing item. Use when user wants to modify an item.",
  inputSchema: z.object({
    id: z.string().describe("The item ID to update"),
    name: z.string().optional().describe("New name"),
    description: z.string().optional().describe("New description"),
  }),
  handler: async (input) => { /* ... */ },
};

// Delete
export const deleteItemTool = {
  name: "delete_item",
  description: "Delete an item. Use when user wants to remove an item.",
  inputSchema: z.object({
    id: z.string().describe("The item ID to delete"),
  }),
  handler: async (input) => { /* ... */ },
};
```

### Deferred Loading

```typescript
server.registerDeferredTool({
  name: "heavy_analysis",
  description: "Perform heavy analysis (loads on demand)",

  load: async () => {
    // Only loaded when tool is first called
    const { analysisTool } = await import("./tools/analysis.js");
    return analysisTool;
  },
});
```

## Test Template

```typescript
import { describe, test, expect } from "bun:test";
import { createMcpHarness } from "@outfitter/testing";
import { searchTool } from "../tools/search.js";

const harness = createMcpHarness(searchTool);

describe("search_items", () => {
  test("returns results for valid query", async () => {
    const result = await harness.invoke({
      query: "test",
      limit: 5,
    });

    expect(result.isOk()).toBe(true);
    expect(result.value.results).toBeInstanceOf(Array);
  });

  test("uses default limit", async () => {
    const result = await harness.invoke({ query: "test" });

    expect(result.isOk()).toBe(true);
    // Default limit is 10
  });

  test("returns ValidationError for empty query", async () => {
    const result = await harness.invoke({ query: "" });

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("ValidationError");
  });
});
```

## Schema Best Practices

```typescript
// DO: Use descriptive field names
query: z.string().describe("Search query")

// DON'T: Cryptic names
q: z.string()

// DO: Provide sensible defaults
limit: z.number().default(10)

// DON'T: Require every field
limit: z.number()

// DO: Use enums for fixed options
format: z.enum(["json", "csv", "xml"])

// DON'T: Accept any string
format: z.string()

// DO: Validate ranges
page: z.number().int().min(1).max(100)

// DON'T: Accept any number
page: z.number()
```
