# Evidence Gathering Patterns

Techniques for gathering diagnostic information without changing behavior.

## Instrumentation

Add diagnostic logging at key points:

```typescript
function processData(data: Data): Result {
  console.log('[DEBUG] processData input:', JSON.stringify(data));

  const transformed = transform(data);
  console.log('[DEBUG] after transform:', JSON.stringify(transformed));

  const validated = validate(transformed);
  console.log('[DEBUG] after validate:', JSON.stringify(validated));

  const result = finalize(validated);
  console.log('[DEBUG] processData result:', JSON.stringify(result));

  return result;
}
```

Key points to instrument:
- Function entry/exit with parameters and return values
- Before/after each transformation
- Error catch blocks
- State mutations

## Binary Search Debugging

Find commit that introduced bug:

```bash
git bisect start
git bisect bad                    # Current commit is bad
git bisect good <last-good-commit> # Known good commit

# Git checks out middle commit
# Test if bug exists, then:
git bisect bad   # if bug exists
git bisect good  # if bug doesn't exist

# Repeat until git identifies exact commit
```

## Differential Analysis

Compare versions side by side:

```bash
# Working version
git show <good-commit>:path/to/file.ts > file-working.ts

# Broken version
git show <bad-commit>:path/to/file.ts > file-broken.ts

# Detailed diff
diff -u file-working.ts file-broken.ts
```

## Timeline Analysis

Correlate events for timing issues:

```
12:00:01.123 - Request received
12:00:01.145 - Database query started
12:00:01.167 - Cache check started
12:00:01.169 - Cache hit returned  <-- Returned before DB!
12:00:01.234 - Database query completed
12:00:01.235 - Error: stale data   <-- Bug symptom
```

Pattern: Log timestamps at every step, look for unexpected ordering or delays.

## Print Debugging Checklist

When adding debug output:

- [ ] Log function entry with all parameters
- [ ] Log variable values before conditionals
- [ ] Log loop iteration values
- [ ] Log before/after external calls
- [ ] Log error details in catch blocks
- [ ] Include timestamps for timing issues
- [ ] Use consistent prefix (e.g., `[DEBUG]`) for easy removal

## State Snapshots

Capture intermediate state for inspection:

```typescript
// Save state at checkpoint
const checkpoint = {
  timestamp: Date.now(),
  state: structuredClone(currentState),
  lastOperation: 'after validation',
};
debugSnapshots.push(checkpoint);

// Later: inspect what state looked like at each point
```
