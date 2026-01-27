# Stage 1: Foundation

**Status:** ⬜ Not Started
**Blocked By:** None
**Unlocks:** Handlers, Errors, Adapters

## Objective

Install dependencies and create shared infrastructure (context, logger).

## Tasks

### 1.1 Install Dependencies

- [ ] Install core packages
  ```bash
  bun add @outfitter/contracts @outfitter/logging @outfitter/config
  ```

- [ ] Install optional packages (as needed)
  ```bash
  bun add @outfitter/cli      # CLI commands
  bun add @outfitter/mcp      # MCP server
  bun add @outfitter/file-ops # File operations
  bun add @outfitter/daemon   # Background services
  bun add @outfitter/testing  # Test harnesses
  ```

### 1.2 Create Logger

- [ ] Create `src/logger.ts`
  ```typescript
  import { createLogger, createConsoleSink } from "@outfitter/logging";

  export const logger = createLogger({
    name: "{{PROJECT_NAME}}",
    level: process.env.LOG_LEVEL || "info",
    sinks: [createConsoleSink()],
    redaction: { enabled: true },
  });
  ```

### 1.3 Create Context Factory

- [ ] Create `src/context.ts`
  ```typescript
  import { createContext } from "@outfitter/contracts";
  import { logger } from "./logger";

  export const createAppContext = () => createContext({ logger });
  export type AppContext = ReturnType<typeof createAppContext>;
  ```

### 1.4 Verify Setup

- [ ] Create smoke test
  ```typescript
  import { describe, it, expect } from "bun:test";
  import { createAppContext } from "../context";

  describe("foundation", () => {
    it("creates context with logger", () => {
      const ctx = createAppContext();
      expect(ctx.logger).toBeDefined();
      expect(ctx.requestId).toBeDefined();
    });
  });
  ```

- [ ] Run test: `bun test`

## Completion Checklist

- [ ] Core packages installed
- [ ] Logger created with redaction enabled
- [ ] Context factory created
- [ ] Smoke test passing

## Notes

{{FOUNDATION_NOTES}}
