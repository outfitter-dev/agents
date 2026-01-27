# Handler Template

Transport-agnostic business logic returning `Result<T, E>`.

## Template

```typescript
import {
  Result,
  ValidationError,
  NotFoundError,
  createValidator,
  type Handler,
  type HandlerContext,
} from "@outfitter/contracts";
import { z } from "zod";

// ============================================================================
// Input Schema
// ============================================================================

const InputSchema = z.object({
  // Required fields
  id: z.string().min(1, "ID is required"),

  // Optional fields with defaults
  includeDeleted: z.boolean().default(false),

  // Optional fields without defaults
  limit: z.number().int().positive().optional(),
});

type Input = z.infer<typeof InputSchema>;

// ============================================================================
// Output Type
// ============================================================================

interface Output {
  id: string;
  name: string;
  createdAt: Date;
}

// ============================================================================
// Error Types
// ============================================================================

type HandlerErrors = ValidationError | NotFoundError;

// ============================================================================
// Validator
// ============================================================================

const validateInput = createValidator(InputSchema);

// ============================================================================
// Handler Implementation
// ============================================================================

export const myHandler: Handler<unknown, Output, HandlerErrors> = async (
  rawInput,
  ctx
) => {
  // 1. Validate input
  const inputResult = validateInput(rawInput);
  if (inputResult.isErr()) return inputResult;
  const input = inputResult.value;

  // 2. Log entry
  ctx.logger.debug("Processing request", {
    id: input.id,
    requestId: ctx.requestId,
  });

  // 3. Business logic
  const resource = await fetchResource(input.id, {
    includeDeleted: input.includeDeleted,
  });

  if (!resource) {
    return Result.err(new NotFoundError("resource", input.id));
  }

  // 4. Log success
  ctx.logger.debug("Request completed", { id: input.id });

  // 5. Return result
  return Result.ok(resource);
};

// ============================================================================
// Helper Functions (private)
// ============================================================================

async function fetchResource(
  id: string,
  options: { includeDeleted: boolean }
): Promise<Output | null> {
  // Implementation
  return null;
}
```

## Checklist

- [ ] Input validated with `createValidator`
- [ ] Handler signature includes all error types
- [ ] Uses `ctx.logger` for logging
- [ ] Returns `Result.ok()` or `Result.err()`
- [ ] No thrown exceptions
- [ ] Context passed to nested handlers

## Test Template

```typescript
import { describe, test, expect } from "bun:test";
import { createContext } from "@outfitter/contracts";
import { myHandler } from "../handlers/my-handler.js";

describe("myHandler", () => {
  const ctx = createContext({});

  test("returns success for valid input", async () => {
    const result = await myHandler({ id: "valid-id" }, ctx);

    expect(result.isOk()).toBe(true);
    expect(result.value).toMatchObject({ id: "valid-id" });
  });

  test("returns NotFoundError for missing resource", async () => {
    const result = await myHandler({ id: "missing" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("NotFoundError");
    expect(result.error.resourceId).toBe("missing");
  });

  test("returns ValidationError for invalid input", async () => {
    const result = await myHandler({ id: "" }, ctx);

    expect(result.isErr()).toBe(true);
    expect(result.error._tag).toBe("ValidationError");
  });
});
```
