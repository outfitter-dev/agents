# CLI Patterns

Deep dive into @outfitter/cli patterns.

## Creating a CLI

```typescript
import { createCLI } from "@outfitter/cli";

const cli = createCLI({
  name: "myapp",
  version: "1.0.0",
  description: "My CLI application",
});

cli.program.addCommand(listCommand);
cli.program.addCommand(getCommand);
cli.program.parse();
```

## Command Builder

Type-safe command construction:

```typescript
import { command } from "@outfitter/cli";

export const myCommand = command("my-command")
  .description("What this command does")
  .argument("<id>", "Required resource ID")
  .argument("[name]", "Optional name")
  .option("-l, --limit <n>", "Limit results", parseInt)
  .option("-v, --verbose", "Enable verbose output")
  .option("-t, --tags <tags...>", "Filter by tags")
  .action(async ({ args, flags }) => {
    // args.id: string
    // args.name: string | undefined
    // flags.limit: number | undefined
    // flags.verbose: boolean
    // flags.tags: string[] | undefined
  })
  .build();
```

## Output Modes

### Automatic Detection

```typescript
import { output } from "@outfitter/cli";

await output(data);  // Human for TTY, JSON for pipes
```

### Mode Priority

1. Explicit `mode` option
2. `OUTFITTER_JSONL=1` env var
3. `OUTFITTER_JSON=1` env var
4. `OUTFITTER_JSON=0` forces human
5. TTY detection fallback

### Forcing Modes

```typescript
// Force JSON
await output(data, { mode: "json" });

// Force human
await output(data, { mode: "human" });

// JSONL for streaming
for await (const item of items) {
  await output(item, { mode: "jsonl" });
}

// Output to stderr
await output(errorData, { stream: process.stderr });
```

### Custom Formatters

```typescript
await output(data, {
  formatters: {
    human: (data) => formatTable(data),
    json: (data) => JSON.stringify(data, null, 2),
  },
});
```

## Error Handling

### Exit with Error

```typescript
import { exitWithError } from "@outfitter/cli";

const result = await handler(input, ctx);

if (result.isErr()) {
  exitWithError(result.error);  // Exit code from error category
}
```

### Exit Code Mapping

| Category | Exit Code |
|----------|-----------|
| validation | 1 |
| not_found | 2 |
| conflict | 3 |
| permission | 4 |
| timeout | 5 |
| rate_limit | 6 |
| network | 7 |
| internal | 8 |
| auth | 9 |
| cancelled | 130 |

### Custom Error Output

```typescript
import { formatError, getExitCode } from "@outfitter/cli";

if (result.isErr()) {
  const formatted = formatError(result.error, { verbose: flags.verbose });
  await output(formatted, { stream: process.stderr });
  process.exit(getExitCode(result.error.category));
}
```

## Pagination

### Cursor State

Cursors persist in XDG state directory:

```
$XDG_STATE_HOME/{toolName}/cursors/{command}/cursor.json
```

### Using Pagination

```typescript
import { loadCursor, saveCursor, clearCursor } from "@outfitter/cli";

const options = { command: "list", toolName: "myapp" };

// Load previous cursor
const state = loadCursor(options);

// Fetch data with cursor
const results = await listItems({
  cursor: state?.cursor,
  limit: 20,
});

// Save for --next
if (results.hasMore) {
  saveCursor(results.nextCursor, options);
}

// Clear on --reset
if (flags.reset) {
  clearCursor(options);
}
```

### Cursor Expiration

```typescript
const state = loadCursor({
  ...options,
  maxAgeMs: 30 * 60 * 1000,  // 30 minutes
});
```

### Pagination Command Pattern

```typescript
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

## Input Parsing

### Stdin Reading

```typescript
import { readStdin } from "@outfitter/cli";

const input = await readStdin();  // Returns string or null if no stdin
```

### Piped Detection

```typescript
import { isPiped } from "@outfitter/cli";

if (isPiped()) {
  const data = await readStdin();
} else {
  // Interactive mode
}
```

## Progress Indicators

```typescript
import { createSpinner, createProgressBar } from "@outfitter/ui";

// Spinner
const spinner = createSpinner("Loading...");
spinner.start();
// ... work
spinner.succeed("Done!");

// Progress bar
const progress = createProgressBar({ total: 100 });
for (let i = 0; i <= 100; i++) {
  progress.update(i);
}
progress.stop();
```

## Best Practices

1. **Handler first** - Business logic in handler, CLI is thin adapter
2. **Output modes** - Support both human and JSON output
3. **Exit codes** - Use `exitWithError` for consistent codes
4. **Pagination** - Use cursor state for `--next` functionality
5. **Stdin support** - Handle piped input gracefully
6. **TTY detection** - Adapt behavior for interactive vs piped
