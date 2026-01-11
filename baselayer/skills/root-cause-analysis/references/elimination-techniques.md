# Elimination Techniques

Systematic methods for narrowing problem scope.

## Binary Search

Halving the problem space with each test.

### When to Use

- Large problem space
- Changes have clear ordering (time, code versions, config options)
- Tests are quick relative to problem size

### Process

```
1. Identify range: known-good state → known-bad state
2. Test midpoint: does issue exist here?
3. Narrow range: move to half containing issue
4. Repeat: until single change identified
```

### Example: Git Bisect

```bash
# Automated binary search through commits
git bisect start
git bisect bad HEAD           # Current commit is bad
git bisect good v1.2.0        # Known good version
git bisect run ./test.sh      # Automatically find breaking commit
```

### Example: Configuration

```
50 config options, one causes issue

Round 1: Test with first 25 options only
  → Issue present → problem in first 25
Round 2: Test with first 12 options only
  → Issue absent → problem in options 13-25
Round 3: Test with options 13-18
  → Issue present → problem in 13-18
...continue until single option found
```

### Efficiency

| Problem Size | Binary Search Steps | Linear Search Steps |
|--------------|---------------------|---------------------|
| 10 items | ~4 | 10 |
| 100 items | ~7 | 100 |
| 1000 items | ~10 | 1000 |

## Variable Isolation

Changing one thing at a time.

### When to Use

- Multiple variables could be cause
- Interactions between variables possible
- Need to establish clear causation

### Process

```
1. Baseline: measure with all defaults
2. Change X only: measure impact
3. Revert X, change Y only: measure impact
4. Repeat for each variable
5. If interactions suspected: test combinations
```

### Example: Performance Degradation

```
Suspects: new library version, config change, increased data volume

Test 1: Revert library only → no change → not library
Test 2: Revert config only → improvement → config contributes
Test 3: Reduce data volume → improvement → data also contributes
Test 4: Both config + data → full improvement → both factors

Root cause: Config change + data growth interaction
```

### Common Mistakes

- Changing multiple variables at once
- Not reverting between tests
- Assuming first positive result is complete answer
- Not testing combinations when interactions possible

## Process of Elimination

Systematically ruling out possibilities.

### When to Use

- Finite set of possible causes
- Can definitively rule things out
- Structured environment

### Process

```
Start with: All possible causes
For each possibility:
  - Design test to rule out
  - Execute test
  - If ruled out: remove from list
  - If not ruled out: keep on list
Continue until: single possibility remains
```

### Documentation Format

```
Possible causes:
✗ Component A — ruled out: reproduced without A present
✗ Component B — ruled out: tested in isolation, worked
✗ External factor — ruled out: reproduced in clean environment
○ Component C — not yet tested
✓ Component D — confirmed: removing D fixes issue
```

### Example: Integration Failure

```
System: API → Queue → Worker → Database

Test 1: Call API directly, bypass queue
  → Issue persists → not queue-related

Test 2: Worker processes test message
  → Success → worker + database OK

Test 3: Examine API-to-queue handoff
  → Found: message format incorrect

Root cause: API serialization bug
```

## Divide and Conquer

Breaking complex system into testable segments.

### When to Use

- Complex multi-component systems
- Don't know which area to focus on
- Want to parallelize investigation

### Process

```
1. Map system components
2. Identify boundaries between components
3. Test at each boundary: is data correct here?
4. Find boundary where data becomes incorrect
5. Focus investigation on that component
```

### Example: Data Pipeline

```
Source → Ingestion → Transform → Validation → Storage → API

Check at each stage:
- After Ingestion: data correct ✓
- After Transform: data correct ✓
- After Validation: data INCORRECT ✗

Root cause is in Validation stage.
```

## Environment Bisection

Isolating environment-specific factors.

### When to Use

- "Works on my machine" situations
- Environment-dependent bugs
- Deployment issues

### Process

```
1. List environment differences (OS, versions, config, resources)
2. Create minimal diff between working and failing
3. Test with progressive alignment
4. Identify minimum difference causing failure
```

### Difference Checklist

| Category | Working | Failing |
|----------|---------|---------|
| OS/Version | | |
| Runtime version | | |
| Dependencies | | |
| Config files | | |
| Environment variables | | |
| Network/ports | | |
| Permissions | | |
| Resource limits | | |

## Technique Selection Guide

| Situation | Recommended Technique |
|-----------|----------------------|
| Many commits to check | Binary search (git bisect) |
| Multiple config options | Variable isolation |
| Finite component list | Process of elimination |
| Multi-stage pipeline | Divide and conquer |
| "Works elsewhere" | Environment bisection |
| Unknown scope | Start with divide and conquer, then specialize |

## Combining Techniques

Often multiple techniques used together:

```
1. Divide and conquer: narrow to subsystem
2. Process of elimination: rule out components in subsystem
3. Variable isolation: identify specific configuration
4. Binary search: find when it broke
```

Each technique narrows scope; combine for efficiency.
