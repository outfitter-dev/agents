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

> **Note:** UI components merged into `@outfitter/cli`. Import from `@outfitter/cli` directly.

```typescript
import { createSpinner, createProgressBar } from "@outfitter/cli";

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

## Formatting Utilities

### Date Range Parsing

Parse human-readable date ranges:

```typescript
import { parseDateRange } from "@outfitter/cli";

const range = parseDateRange("last 7 days");
// { start: Date, end: Date }

const range2 = parseDateRange("2026-01-01..2026-01-31");
// { start: Date, end: Date }

// Supported formats:
// - "last N days/weeks/months"
// - "today", "yesterday", "this week", "this month"
// - "YYYY-MM-DD..YYYY-MM-DD" (range)
// - "YYYY-MM-DD" (single day)
```

### Duration Formatting

Format milliseconds as human-readable duration:

```typescript
import { formatDuration } from "@outfitter/cli";

formatDuration(1500);       // "1.5s"
formatDuration(65000);      // "1m 5s"
formatDuration(3661000);    // "1h 1m 1s"
formatDuration(90061000);   // "1d 1h 1m"
```

### Byte Formatting

Format bytes as human-readable sizes:

```typescript
import { formatBytes } from "@outfitter/cli";

formatBytes(1024);         // "1 KB"
formatBytes(1536);         // "1.5 KB"
formatBytes(1048576);      // "1 MB"
formatBytes(1073741824);   // "1 GB"
```

### Pluralization

Pluralize words based on count:

```typescript
import { pluralize } from "@outfitter/cli";

pluralize(1, "file");      // "1 file"
pluralize(5, "file");      // "5 files"
pluralize(0, "item");      // "0 items"

// Custom plural form
pluralize(2, "person", "people");  // "2 people"
```

### Slugification

Convert strings to URL-safe slugs:

```typescript
import { slugify } from "@outfitter/cli";

slugify("Hello World");           // "hello-world"
slugify("My New Feature!");       // "my-new-feature"
slugify("Café Résumé");           // "cafe-resume"
```

### Custom Renderers

Register custom output renderers for specific data types:

```typescript
import { registerRenderer, output } from "@outfitter/cli";

interface User {
  id: string;
  name: string;
  email: string;
}

registerRenderer<User>("user", {
  human: (user) => `${user.name} <${user.email}>`,
  json: (user) => JSON.stringify(user),
});

// Now output() will use your renderer when type matches
await output(user, { type: "user" });
```

## Best Practices

1. **Handler first** - Business logic in handler, CLI is thin adapter
2. **Output modes** - Support both human and JSON output
3. **Exit codes** - Use `exitWithError` for consistent codes
4. **Pagination** - Use cursor state for `--next` functionality
5. **Stdin support** - Handle piped input gracefully
6. **TTY detection** - Adapt behavior for interactive vs piped
