# Workflow: Debug Bun Runtime

Systematically debug Bun-specific runtime issues.

<required_reading>

**Read these reference files NOW:**
1. [../../../debugging/SKILL.md](../../debugging/SKILL.md) - Four-stage debugging framework

</required_reading>

<prerequisites>

- Issue reproduced consistently
- Minimal reproduction case identified (if possible)
- Bun version known (`bun --version`)

</prerequisites>

<process>

## Step 1: Identify If Bun-Specific

First, determine if the issue is Bun-specific or general:

```bash
# Check Bun version
bun --version

# Run with Node.js for comparison (if applicable)
node --experimental-strip-types src/index.ts
# Or with tsx
npx tsx src/index.ts
```

**If issue only occurs in Bun:** Continue with this workflow
**If issue occurs in both:** Load the general **debugging** skill instead

## Step 2: Check Known Issues

Search Bun's GitHub issues:

```bash
# Search via GitHub CLI
gh search issues "your error message" --repo oven-sh/bun --state open

# Or visit directly
open "https://github.com/oven-sh/bun/issues?q=your+error+message"
```

Check Bun version compatibility:

```bash
# Update to latest
bun upgrade

# Or use specific version
bun upgrade --version 1.x.x
```

## Step 3: Use Bun.inspect for Deep Logging

```typescript
// Replace console.log with Bun.inspect for complex objects
console.log(Bun.inspect(complexObject, {
  depth: 10,
  colors: true,
  showHidden: false,
}));

// Inspect specific types
console.log('Request:', Bun.inspect(request));
console.log('Response:', Bun.inspect(response));
console.log('Error:', Bun.inspect(error));
```

## Step 4: Isolate Bun API Issues

### File System Issues

```typescript
// Debug file operations
const file = Bun.file('./data.json');
console.log('File exists:', await file.exists());
console.log('File size:', file.size);
console.log('File type:', file.type);

// Compare with Node.js
import { readFile, stat } from 'node:fs/promises';
const nodeContent = await readFile('./data.json', 'utf-8');
const bunContent = await Bun.file('./data.json').text();
console.log('Content matches:', nodeContent === bunContent);
```

### SQLite Issues

```typescript
import { Database } from 'bun:sqlite';

// Enable verbose mode
const db = new Database(':memory:', { strict: true });

// Check SQLite version
const version = db.query('SELECT sqlite_version()').get();
console.log('SQLite version:', version);

// Debug query issues
const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
console.log('SQL:', stmt.toString());
console.log('Parameters:', stmt.paramsCount);
```

### HTTP/Server Issues

```typescript
// Debug incoming requests
app.use('*', async (c, next) => {
  console.log('Request:', {
    method: c.req.method,
    url: c.req.url,
    headers: Object.fromEntries(c.req.raw.headers),
  });

  const start = Bun.nanoseconds();
  await next();
  const duration = (Bun.nanoseconds() - start) / 1_000_000;

  console.log('Response:', {
    status: c.res.status,
    duration: `${duration.toFixed(2)}ms`,
  });
});
```

### WebSocket Issues

```typescript
websocket: {
  open(ws) {
    console.log('WS Open:', Bun.inspect(ws.data));
  },
  message(ws, msg) {
    console.log('WS Message:', {
      type: typeof msg,
      length: msg.length,
      preview: msg.toString().slice(0, 100),
    });
  },
  close(ws, code, reason) {
    console.log('WS Close:', { code, reason });
  },
  error(ws, error) {
    console.log('WS Error:', Bun.inspect(error));
  },
}
```

## Step 5: Check Memory and Performance

```typescript
// Memory usage
function logMemory() {
  const usage = process.memoryUsage();
  console.log('Memory:', {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
  });
}

// Call periodically
setInterval(logMemory, 5000);

// Performance timing
const start = Bun.nanoseconds();
// ... operation ...
console.log(`Took ${(Bun.nanoseconds() - start) / 1_000_000}ms`);
```

## Step 6: Create Minimal Reproduction

```typescript
// Create a standalone file that demonstrates the issue
// minimal-repro.ts

const result = // ... minimal code that shows the bug
console.log('Expected:', 'expected value');
console.log('Actual:', result);

// Run it
// bun run minimal-repro.ts
```

## Step 7: Report or Workaround

**If confirmed Bun bug:**

```bash
# Create issue with reproduction
gh issue create --repo oven-sh/bun --title "Bug: description" --body "
## Bun version
$(bun --version)

## Platform
$(uname -a)

## Reproduction
\`\`\`typescript
// minimal code
\`\`\`

## Expected
...

## Actual
...
"
```

**If workaround needed:**

```typescript
// Document the workaround
// WORKAROUND: Bun issue #1234 - description
// Remove when fixed in Bun vX.Y.Z
const result = workaroundCode();
```

</process>

<cross_references>

**For systematic investigation:** Load the **debugging** skill for the four-stage framework:
1. Observe symptoms
2. Form hypotheses
3. Test hypotheses
4. Implement fix

This workflow covers Bun-specific patterns; the debugging skill provides general methodology.

</cross_references>

<common_issues>

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| "Module not found" | Package not Bun-compatible | Use Bun-native or polyfill |
| SQLite "database locked" | Missing WAL mode | `PRAGMA journal_mode = WAL` |
| WebSocket "upgrade failed" | Missing return undefined | Return `undefined` on success |
| Memory growing | Unclosed connections/files | Ensure cleanup in finally blocks |
| Slow startup | Large dependencies | Use `bun build --compile` |
| Type errors with Bun APIs | Outdated `@types/bun` | `bun add -d @types/bun@latest` |

</common_issues>

<anti_patterns>

Avoid:
- Assuming issue is Bun-specific without testing in Node.js
- Ignoring version differences (upgrade first)
- Filing issues without minimal reproduction
- Using `try/catch` that swallows error details
- Debugging production without reproduction locally

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Root cause identified (Bun bug, config issue, or code bug)
- [ ] Minimal reproduction created
- [ ] Fix implemented OR workaround documented OR issue filed
- [ ] Verification test confirms fix works

</success_criteria>
