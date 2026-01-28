# File Operations Patterns

Deep dive into @outfitter/file-ops patterns for safe file handling.

## Secure Paths

Prevent path traversal attacks with `securePath`:

```typescript
import { securePath } from "@outfitter/file-ops";

const path = securePath("/data", userInput);
// Throws if userInput tries to escape /data via ../
```

## Atomic Writes

Write files atomically to prevent corruption:

```typescript
import { writeFileAtomic } from "@outfitter/file-ops";

await writeFileAtomic("/path/to/file.json", JSON.stringify(data, null, 2));
// Writes to temp file, then renames (atomic on POSIX)
```

## File Locking

### Exclusive Lock

For write operations that need exclusive access:

```typescript
import { withExclusiveLock } from "@outfitter/file-ops";

const result = await withExclusiveLock("/path/to/file.lock", async () => {
  const data = await Bun.file("/path/to/data.json").json();
  data.counter += 1;
  await writeFileAtomic("/path/to/data.json", JSON.stringify(data));
  return data;
});

if (result.isErr()) {
  // Lock acquisition failed or operation threw
}
```

### Shared Lock (Reader-Writer)

Use `withSharedLock()` for read operations that can run concurrently:

```typescript
import { withSharedLock, withExclusiveLock } from "@outfitter/file-ops";

// Multiple readers can hold shared locks simultaneously
const readResult = await withSharedLock("/path/to/data.lock", async () => {
  return await Bun.file("/path/to/data.json").json();
});

// Writers need exclusive lock (blocks readers)
const writeResult = await withExclusiveLock("/path/to/data.lock", async () => {
  const data = await Bun.file("/path/to/data.json").json();
  data.updated = Date.now();
  await writeFileAtomic("/path/to/data.json", JSON.stringify(data));
  return data;
});
```

**Lock fairness note:** Reader-writer locks can cause starvation. With many concurrent readers, writers may wait indefinitely (and vice versa). For high-contention scenarios, consider using exclusive locks only or implementing application-level queuing.

### Lock Options

```typescript
await withExclusiveLock("/path/to/file.lock", operation, {
  timeout: 5000,      // Max wait time in ms (default: 10000)
  retryDelay: 100,    // Delay between retries (default: 50)
  staleThreshold: 60000,  // Consider lock stale after this many ms
});
```

### Lock File Conventions

- Use `.lock` extension for lock files
- Place lock files alongside the protected resource
- Use consistent lock file paths across all accessors

```typescript
// Good: Lock file next to data file
const dataPath = "/data/users.json";
const lockPath = "/data/users.json.lock";

// Good: Named lock in XDG state
import { getStatePath } from "@outfitter/config";
const lockPath = getStatePath("myapp", "db.lock");
```

## Safe Directory Operations

### Ensure Directory Exists

```typescript
import { ensureDir } from "@outfitter/file-ops";

await ensureDir("/path/to/nested/dir");
// Creates all parent directories if needed
```

### Safe Removal

```typescript
import { safeRemove } from "@outfitter/file-ops";

await safeRemove("/path/to/file-or-dir");
// No error if doesn't exist, removes recursively if dir
```

## Temp Files

### Create Temp File

```typescript
import { createTempFile } from "@outfitter/file-ops";

const tempPath = await createTempFile("myapp", ".json");
// Returns path like /tmp/myapp-abc123.json
```

### With Cleanup

```typescript
import { withTempFile } from "@outfitter/file-ops";

const result = await withTempFile("myapp", ".json", async (tempPath) => {
  await Bun.write(tempPath, JSON.stringify(data));
  return await processFile(tempPath);
});
// Temp file automatically cleaned up
```

## Best Practices

1. **Always use atomic writes** for critical data
2. **Lock before read-modify-write** operations
3. **Use shared locks** for read-only operations to improve concurrency
4. **Validate paths** with `securePath` before using user input
5. **Clean up temp files** with `withTempFile` pattern
6. **Use XDG paths** from `@outfitter/config` for state/cache files
