# Stage 4: Paths

**Status:** ⬜ Not Started
**Blocked By:** None (can run parallel with Handlers)
**Unlocks:** Documents

## Objective

Replace hardcoded paths with XDG-compliant paths and add path security.

## XDG Directory Reference

| Function | Path | Purpose |
|----------|------|---------|
| `getConfigDir(name)` | `~/.config/{name}` | Configuration files |
| `getCacheDir(name)` | `~/.cache/{name}` | Cache files |
| `getDataDir(name)` | `~/.local/share/{name}` | Persistent data |
| `getStateDir(name)` | `~/.local/state/{name}` | Runtime state |

## Files to Migrate

{{#each PATH_FILES}}
### {{this.file}}

- **Line:** {{this.line}}
- **Current:** `{{this.current}}`
- **Pattern:** {{this.pattern}}

#### Migration

- [ ] Replace with XDG function
- [ ] Add `securePath()` if user-provided
- [ ] Update tests

```typescript
// Before
{{this.beforeCode}}

// After
{{this.afterCode}}
```

---

{{/each}}

## Path Security

For user-provided paths, use `securePath()`:

```typescript
import { securePath } from "@outfitter/file-ops";

const validatePath = (userPath: string, baseDir: string) => {
  const result = securePath(userPath, { base: baseDir });
  if (result.isErr()) {
    return Result.err(new ValidationError("Invalid path", { path: userPath }));
  }
  return Result.ok(result.value);
};
```

**Security checks:**
- Path traversal (`../`)
- Symlink following
- Base directory escape
- Null bytes

## Common Patterns

### Config File

```typescript
// Before
const configPath = path.join(os.homedir(), ".myapp", "config.json");

// After
import { getConfigDir } from "@outfitter/config";
const configPath = path.join(getConfigDir("myapp"), "config.json");
```

### Cache Directory

```typescript
// Before
const cacheDir = path.join(os.homedir(), ".cache", "myapp");

// After
import { getCacheDir } from "@outfitter/config";
const cacheDir = getCacheDir("myapp");
```

### User-Provided Path

```typescript
// Before
const filePath = args.file;
await fs.readFile(filePath);

// After
import { securePath } from "@outfitter/file-ops";
const pathResult = securePath(args.file, { base: process.cwd() });
if (pathResult.isErr()) return pathResult;
await fs.readFile(pathResult.value);
```

## Completion Checklist

- [ ] All `os.homedir()` replaced with XDG functions
- [ ] All `~/` literals replaced
- [ ] User-provided paths validated with `securePath()`
- [ ] Tests use `withTempDir()` fixture
- [ ] No hardcoded absolute paths

## Notes

{{PATH_NOTES}}
