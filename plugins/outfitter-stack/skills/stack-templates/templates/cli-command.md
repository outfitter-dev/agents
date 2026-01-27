# CLI Command Template

Commander.js command that wraps a handler.

## Template

```typescript
import { command, output, exitWithError } from "@outfitter/cli";
import { createContext } from "@outfitter/contracts";
import { myHandler } from "../handlers/my-handler.js";

export const myCommand = command("my-command")
  // ========================================================================
  // Metadata
  // ========================================================================
  .description("Brief description of what this command does")

  // ========================================================================
  // Arguments (positional)
  // ========================================================================
  .argument("<id>", "Required resource ID")
  .argument("[name]", "Optional name")

  // ========================================================================
  // Options (flags)
  // ========================================================================
  .option("-l, --limit <n>", "Maximum number of results", parseInt)
  .option("-v, --verbose", "Enable verbose output")
  .option("-t, --tags <tags...>", "Filter by tags (multiple allowed)")
  .option("--include-deleted", "Include deleted items")
  .option("-o, --output <format>", "Output format", "table")

  // ========================================================================
  // Action
  // ========================================================================
  .action(async ({ args, flags }) => {
    // Create context
    const ctx = createContext({});

    // Call handler
    const result = await myHandler(
      {
        id: args.id,
        name: args.name,
        limit: flags.limit,
        tags: flags.tags,
        includeDeleted: flags.includeDeleted,
      },
      ctx
    );

    // Handle error
    if (result.isErr()) {
      exitWithError(result.error);
    }

    // Output success
    await output(result.value);
  })

  // ========================================================================
  // Build
  // ========================================================================
  .build();
```

## Registration

```typescript
import { createCLI } from "@outfitter/cli";
import { myCommand } from "./commands/my-command.js";
import { otherCommand } from "./commands/other-command.js";

const cli = createCLI({
  name: "myapp",
  version: "1.0.0",
  description: "My CLI application",
});

// Register commands
cli.program.addCommand(myCommand);
cli.program.addCommand(otherCommand);

// Parse and execute
cli.program.parse();
```

## Checklist

- [ ] Description is clear and concise
- [ ] Arguments use `<required>` and `[optional]` syntax
- [ ] Options have short and long forms where appropriate
- [ ] Numeric options use `parseInt` or `parseFloat`
- [ ] Handler is called with structured input
- [ ] Errors use `exitWithError()` for correct exit codes
- [ ] Success uses `await output()` for format detection

## Patterns

### Pagination Support

```typescript
import { loadCursor, saveCursor, clearCursor } from "@outfitter/cli";

export const listCommand = command("list")
  .option("-n, --next", "Continue from previous position")
  .option("--reset", "Reset pagination cursor")
  .option("-l, --limit <n>", "Results per page", parseInt, 20)
  .action(async ({ flags }) => {
    const paginationOpts = { command: "list", toolName: "myapp" };

    if (flags.reset) {
      clearCursor(paginationOpts);
      console.log("Cursor reset");
      return;
    }

    const cursor = flags.next ? loadCursor(paginationOpts)?.cursor : undefined;
    const ctx = createContext({});
    const result = await listHandler({ cursor, limit: flags.limit }, ctx);

    if (result.isErr()) {
      exitWithError(result.error);
    }

    await output(result.value.items);

    if (result.value.nextCursor) {
      saveCursor(result.value.nextCursor, paginationOpts);
      console.log("\nUse --next for more results");
    }
  })
  .build();
```

### Subcommands

```typescript
import { Command } from "commander";

const userCommand = new Command("user")
  .description("User management commands");

userCommand.addCommand(
  command("create")
    .argument("<email>", "User email")
    .action(async ({ args }) => { /* ... */ })
    .build()
);

userCommand.addCommand(
  command("delete")
    .argument("<id>", "User ID")
    .option("--force", "Skip confirmation")
    .action(async ({ args, flags }) => { /* ... */ })
    .build()
);

cli.program.addCommand(userCommand);
```

### Interactive Prompts

```typescript
import { confirm, text, select } from "@clack/prompts";

export const deleteCommand = command("delete")
  .argument("<id>", "Resource ID")
  .option("--force", "Skip confirmation")
  .action(async ({ args, flags }) => {
    if (!flags.force) {
      const confirmed = await confirm({
        message: `Delete resource ${args.id}?`,
      });

      if (!confirmed) {
        console.log("Cancelled");
        return;
      }
    }

    // Proceed with deletion
  })
  .build();
```

## Test Template

```typescript
import { describe, test, expect } from "bun:test";
import { createCliHarness } from "@outfitter/testing";
import { myCommand } from "../commands/my-command.js";

const harness = createCliHarness(myCommand);

describe("my-command", () => {
  test("outputs JSON with --json flag", async () => {
    const result = await harness.run(["test-id", "--json"]);

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ id: "test-id" });
  });

  test("exits with error for missing resource", async () => {
    const result = await harness.run(["missing-id"]);

    expect(result.exitCode).toBe(2); // not_found
    expect(result.stderr).toContain("not found");
  });

  test("validates required arguments", async () => {
    const result = await harness.run([]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("required");
  });
});
```
