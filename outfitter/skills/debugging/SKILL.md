---
name: debugging
version: 1.1.0
description: Systematic debugging methodology using evidence-based investigation to identify root causes. Use when encountering bugs, errors, unexpected behavior, failing tests, or intermittent issues. Enforces four-phase framework (root cause investigation, pattern analysis, hypothesis testing, implementation) with the iron law NO FIXES WITHOUT ROOT CAUSE FIRST. Covers runtime errors, logic bugs, integration failures, and performance issues. Useful when debugging, troubleshooting, investigating failures, or when --debug flag is mentioned.
---

# Systematic Debugging

A methodical approach to debugging that enforces evidence-based investigation before attempting fixes.

## The Iron Law

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

Never propose solutions, "quick fixes", or "try this" without first understanding the root cause through systematic investigation.

## Quick Start

When encountering a bug:

1. Create "Collect Evidence" todo as `in_progress` via TodoWrite
2. **Reproduce** - Get exact steps to trigger the issue consistently
3. **Investigate** - Gather evidence about what's actually happening
4. **Analyze** - Compare working vs broken, find all differences
5. **Test hypothesis** - Form single specific hypothesis and test minimally
6. **Implement** - Write failing test, then fix
7. On phase transitions, update todos (see Progress Tracking)

## Progress Tracking

Use TodoWrite to show debugging progression. Create todos at session start, update as you advance through the investigation.

**Core Phases:**

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Collect Evidence** | Session start | "Collecting evidence" |
| **Isolate Variables** | Evidence gathered, reproduction confirmed | "Isolating variables" |
| **Formulate Hypotheses** | Problem isolated, patterns identified | "Formulating hypotheses" |
| **Test Hypothesis** | Hypothesis formulated | "Testing hypothesis" |
| **Verify Fix** | Fix identified and implemented | "Verifying fix" |

**Situational Phase** (add when needed):

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Iterate** | Hypothesis disproven | "Iterating on findings" |

**Workflow:**
- On session start: Create "Collect Evidence" as `in_progress`
- On phase transition: Mark current phase `completed`, add next phase as `in_progress`
- "Iterate" phase loops back to "Test Hypothesis" when added
- After 3 failed hypotheses: Consider escalation (see Escalation Criteria)

**Edge Cases:**
- **Quick fixes**: If root cause is immediately obvious from error message, may skip directly from "Collect Evidence" to "Verify Fix" (still create failing test)
- **Complex bugs**: May loop between "Test Hypothesis" and "Iterate" multiple times before reaching "Verify Fix"
- **Need more evidence**: If hypothesis testing reveals gaps, return to "Collect Evidence" (mark "Iterate" complete, create new "Collect Evidence" task)
- **No regression**: Phases advance forward through investigation; if you need to gather more evidence, add a new task rather than regressing phases

## The Four-Phase Framework

### Phase 1: Root Cause Investigation

**Goal**: Understand what's actually happening, not what you think is happening.

**Phase transition**: Mark "Collect Evidence" complete and add "Isolate Variables" as `in_progress` when you have reproduction steps and initial evidence.

**Steps**:

1. **Read error messages completely**
   - Error messages often contain the solution
   - Read stack traces top to bottom
   - Note file paths, line numbers, variable names
   - Look for "caused by" chains

2. **Reproduce consistently**
   - Document exact steps to trigger the bug
   - Note what inputs cause it vs don't cause it
   - Check if it's intermittent (timing, race conditions)
   - Verify it happens in clean environment

3. **Check recent changes**
   - `git diff` - what changed since it last worked?
   - `git log --since="yesterday"` - recent commits
   - Dependency updates - package.json/Cargo.toml changes
   - Config changes - environment variables, settings files
   - External factors - API changes, database schema

4. **Gather evidence systematically**
   - Add logging at key points in data flow
   - Print variable values at each transformation
   - Log function entry/exit with parameters
   - Capture timestamps for timing issues
   - Save intermediate state for inspection

5. **Trace data flow backward**
   - Where does the bad value come from?
   - Track it backward through transformations
   - Find the first place it becomes wrong
   - Identify the transformation that broke it

**Red flags indicating you need more investigation**:
- "I think maybe X is the problem"
- "Let's try changing Y"
- "It might be related to Z"
- Starting to write code

### Phase 2: Pattern Analysis

**Goal**: Learn from what works to understand what's broken.

**Phase transition**: Mark "Isolate Variables" complete and add "Formulate Hypotheses" as `in_progress` when you've identified key differences between working and broken cases.

**Steps**:

1. **Find working examples in same codebase**
   - Search for similar functionality that works
   - Grep for similar patterns: `rg "pattern"`
   - Look for tests that pass vs fail
   - Check git history for when it last worked

2. **Read reference implementations completely**
   - Don't skim - read every line
   - Understand the full context
   - Note all dependencies and imports
   - Check configuration and setup

3. **Identify every difference**
   - Line by line comparison working vs broken
   - Different imports or dependencies?
   - Different function signatures?
   - Different error handling?
   - Different data flow or transformations?
   - Different configuration or environment?

4. **Understand dependencies**
   - What libraries/packages are involved?
   - What versions are in use?
   - What external services are called?
   - What shared state exists?
   - What assumptions are made?

**Questions to answer**:
- Why does the working version work?
- What's fundamentally different in the broken version?
- Are there edge cases the working version handles?
- What invariants does the working version maintain?

### Phase 3: Hypothesis Testing

**Goal**: Test one specific idea with minimal changes.

**Phase transition**: Mark "Formulate Hypotheses" complete and add "Test Hypothesis" as `in_progress` when you have a specific, evidence-based hypothesis.

**Steps**:

1. **Form single, specific hypothesis**
   - Template: "I think X is the root cause because Y"
   - Must explain all observed symptoms
   - Must be testable with small change
   - Must be based on evidence from phases 1-2

2. **Design minimal test**
   - Smallest possible change to test hypothesis
   - Change exactly ONE variable
   - Preserve everything else
   - Make it reversible

3. **Execute test**
   - Apply the change
   - Run the reproduction steps
   - Observe the results carefully
   - Document what happened

4. **Verify or pivot**
   - **If fixed**: Confirm it works across all cases, proceed to "Verify Fix"
   - **If not fixed**: Mark "Test Hypothesis" complete, add "Iterate" as `in_progress`, form NEW hypothesis
   - **If partially fixed**: Add "Iterate" to investigate what remains
   - **Never**: Try random variations hoping one works

**Bad hypothesis examples**:
- "Maybe it's a race condition" (too vague)
- "Could be caching or permissions" (multiple causes)
- "Probably something with the database" (no evidence)

**Good hypothesis examples**:
- "The function fails because it expects a number but receives a string when the API returns empty results"
- "The race condition occurs because fetchData() is called before initializeClient() completes, causing the uninitialized error"
- "The memory leak happens because event listeners are added in useEffect but never removed in cleanup"

### Phase 4: Implementation

**Goal**: Fix the root cause permanently with verification.

**Phase transition**: Mark "Test Hypothesis" complete and add "Verify Fix" as `in_progress` when you've confirmed the hypothesis and are ready to implement the permanent fix.

**Steps**:

1. **Create failing test case**
   - Write test that reproduces the bug
   - Verify it fails before fix
   - Should pass after fix
   - Captures exact scenario that was broken

2. **Implement single fix**
   - Address the identified root cause
   - No additional "improvements"
   - No refactoring "while you're there"
   - Just fix the specific problem

3. **Verify fix works**
   - Failing test now passes
   - All existing tests still pass
   - Manual reproduction steps no longer trigger bug
   - No new errors or warnings introduced

4. **Circuit breaker: 3 failed fixes**
   - If you've tried 3+ fixes and none worked: STOP
   - Problem isn't the hypothesis - problem is the architecture
   - The code may be using the wrong pattern entirely
   - Escalate or redesign instead of more fixes

**After fixing**:
- Mark "Verify Fix" as `completed`
- Add defensive validation at multiple layers
- Document why the bug occurred
- Consider if similar bugs exist elsewhere
- Update documentation if behavior was misunderstood

## Bug Type Playbooks

### Runtime Errors (crashes, exceptions)

**Investigation focus**:
- Stack trace analysis (which line, which function)
- Variable state at crash point
- Input values that trigger crash
- Environment differences (dev vs prod)

**Common causes**:
- Null/undefined access
- Type mismatches
- Array out of bounds
- Missing error handling
- Resource exhaustion

**Key techniques**:
- Add try-catch with detailed logging
- Validate assumptions with assertions
- Check for null/undefined before access
- Log input values before processing

### Logic Bugs (wrong result, unexpected behavior)

**Investigation focus**:
- Expected vs actual output comparison
- Data transformations step by step
- Conditional logic evaluation
- State changes over time

**Common causes**:
- Off-by-one errors
- Incorrect comparison operators
- Wrong order of operations
- Missing edge case handling
- State not reset between operations

**Key techniques**:
- Print intermediate values
- Step through with debugger
- Write test cases for edge cases
- Check loop boundaries carefully

### Integration Failures (API, database, external service)

**Investigation focus**:
- Request/response logging
- Network traffic inspection
- Authentication/authorization
- Data format mismatches
- Timing and timeouts

**Common causes**:
- API version mismatch
- Authentication token expired
- Wrong content-type headers
- Data serialization differences
- Network timeout too short
- Rate limiting

**Key techniques**:
- Log full request/response
- Test with curl/httpie directly
- Check API documentation version
- Verify credentials and permissions
- Monitor network timing

### Intermittent Issues (works sometimes, fails others)

**Investigation focus**:
- What's different when it fails?
- Timing dependencies
- Shared state/resources
- External conditions
- Concurrency issues

**Common causes**:
- Race conditions
- Cache inconsistency
- Clock/timezone issues
- Resource contention
- External service flakiness

**Key techniques**:
- Add timestamps to all logs
- Run many times to find pattern
- Check for async operations
- Look for shared mutable state
- Test under different loads

### Performance Issues (slow, memory leaks, high CPU)

**Investigation focus**:
- Profiling and metrics
- Resource usage over time
- Algorithm complexity
- Data volume scaling
- Memory allocation patterns

**Common causes**:
- N+1 queries
- Inefficient algorithms
- Memory leaks (unreleased resources)
- Excessive allocations
- Missing indexes
- Unbounded caching

**Key techniques**:
- Profile with appropriate tools
- Measure time/memory at checkpoints
- Test with various data sizes
- Check for cleanup in destructors
- Monitor resource usage trends

## Reproduction Techniques

### Minimal Reproduction

**Goal**: Smallest possible code that demonstrates the bug.

**Steps**:
1. Start with full failing case
2. Remove one thing at a time
3. After each removal, verify bug still occurs
4. Continue until nothing else can be removed
5. Result: minimal reproduction case

**Benefits**:
- Isolates the exact cause
- Eliminates red herrings
- Makes debugging tractable
- Helps others reproduce

### Reproduction Checklist

Create a checklist for consistent reproduction:

```
Environment:
- [ ] OS/platform: _____
- [ ] Language/runtime version: _____
- [ ] Dependency versions: _____
- [ ] Environment variables: _____

Setup:
- [ ] Database state: _____
- [ ] File system state: _____
- [ ] Configuration: _____
- [ ] Prerequisites: _____

Steps:
1. [ ] _____
2. [ ] _____
3. [ ] _____

Expected: _____
Actual: _____
```

### Automated Reproduction

Convert manual steps to automated test:

```typescript
test('reproduces bug with X input', async () => {
  // Setup
  const input = createProblematicInput();

  // Execute
  const result = await functionUnderTest(input);

  // Verify bug occurs
  expect(result).toBe(expectedButWrong); // Will fail when fixed
});
```

## Evidence Gathering Patterns

### Instrumentation

Add diagnostic logging without changing behavior:

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

### Binary Search Debugging

When the bug appeared in a range of commits:

```bash
# Find the commit that introduced the bug
git bisect start
git bisect bad                    # Current commit is bad
git bisect good <last-good-commit> # Known good commit

# Git will check out middle commit
# Test if bug exists, then:
git bisect bad   # if bug exists
git bisect good  # if bug doesn't exist

# Repeat until git identifies the exact commit
```

### Differential Analysis

Compare two versions side by side:

```bash
# Working version
git show <good-commit>:path/to/file.ts > file-working.ts

# Broken version
git show <bad-commit>:path/to/file.ts > file-broken.ts

# Detailed diff
diff -u file-working.ts file-broken.ts
```

### Timeline Analysis

For intermittent issues, correlate events:

```
12:00:01.123 - Request received
12:00:01.145 - Database query started
12:00:01.167 - Cache check started
12:00:01.169 - Cache hit returned  <-- Returned before DB!
12:00:01.234 - Database query completed
12:00:01.235 - Error: stale data   <-- Bug symptom
```

## Red Flags - Return to Phase 1

If you catch yourself thinking or saying:

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)
- "Let me try a few different things"
- Proposing solutions before gathering evidence
- Skipping the failing test case
- Fixing symptoms instead of root cause

**ALL of these mean: STOP. Return to Phase 1.**

Add new "Collect Evidence" task and mark current task complete.

## Root Cause vs Symptoms

**Symptom**: The observable problem
**Root cause**: The underlying reason it happens

Example:
- **Symptom**: API returns 500 error
- **Proximate cause**: Database query timeout
- **Root cause**: Missing index on frequently queried column

Always fix the root cause, not symptoms.

## Common Anti-Patterns

### The Random Walk
Trying different things hoping one works without systematic investigation.

**Why it fails**: Wastes time, may mask real issue, doesn't build understanding.

**Instead**: Follow phases 1-2 to understand the system.

### The Quick Fix
Implementing a solution that stops the symptom without finding root cause.

**Why it fails**: Bug will resurface or manifest differently.

**Instead**: Use phase 1 to find root cause before fixing.

### The Cargo Cult
Copying code from Stack Overflow without understanding why it works.

**Why it fails**: May not apply to your context, introduces new issues.

**Instead**: Use phase 2 to understand working examples thoroughly.

### The Shotgun Approach
Changing multiple things simultaneously "to be sure".

**Why it fails**: Can't tell which change fixed it or if you introduced new bugs.

**Instead**: Use phase 3 to test one hypothesis at a time.

## Integration with Development Workflow

### Test-Driven Debugging

1. Write test that reproduces bug (fails)
2. Fix the bug
3. Test passes
4. Confirms fix works and prevents regression

### Defensive Programming After Fix

Add validation at multiple layers:

```typescript
function processUser(userId: string): User {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be non-empty string');
  }

  // Fetch with error handling
  const user = await fetchUser(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Output validation
  if (!user.email || !user.name) {
    throw new Error('Invalid user data: missing required fields');
  }

  return user;
}
```

### Documentation

After fixing, document:

1. **What broke**: Symptom description
2. **Root cause**: Why it happened
3. **The fix**: What changed
4. **Prevention**: How to avoid in future

Example:
```typescript
/**
 * Processes user data from API.
 *
 * Bug fix (2024-01-15): Added validation for missing email field.
 * Root cause: API sometimes returns partial user objects when
 * user hasn't completed onboarding.
 * Prevention: Always validate required fields before processing.
 */
```

## Escalation Criteria

When to ask for help or escalate:

1. **After 3 failed fix attempts** - Architecture may be wrong
2. **No clear reproduction** - Need more context/access
3. **External system issues** - Need vendor/team involvement
4. **Security implications** - Need security expertise
5. **Data corruption risks** - Need backup/recovery planning

## Critical Rules

**ALWAYS:**
* Create "Collect Evidence" todo at session start
* Follow the four-phase framework systematically
* Update todos when transitioning between phases
* Create failing test before implementing fix
* Test single hypothesis at a time
* Document root cause after fixing
* Mark "Verify Fix" complete only after all tests pass

**NEVER:**
* Propose fixes without understanding root cause
* Skip evidence gathering phase
* Test multiple hypotheses simultaneously
* Skip the failing test case
* Fix symptoms instead of root cause
* Continue after 3 failed fixes without escalation
* Regress phases — add new tasks if more investigation needed

## Summary Checklist

Before claiming "fixed":

- [ ] Root cause identified with evidence
- [ ] Failing test case created
- [ ] Fix implemented addressing root cause only
- [ ] Test now passes
- [ ] All existing tests still pass
- [ ] Manual reproduction steps no longer trigger bug
- [ ] No new warnings or errors introduced
- [ ] Root cause documented
- [ ] Prevention measures considered
- [ ] "Verify Fix" marked as completed

Remember: **Understanding the bug is more valuable than fixing it quickly.**
