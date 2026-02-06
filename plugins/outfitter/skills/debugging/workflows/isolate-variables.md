# Workflow: Isolate Variables

Learn from working code to understand broken code. Narrow scope to identify the critical difference.

<when_to_use>

- Have evidence and reproduction steps
- Need to narrow down the cause
- Multiple potential culprits
- Understanding code flow

</when_to_use>

<required_reading>

**Read these reference files:**
1. references/playbooks.md - bug-type specific investigations

</required_reading>

<process>

## Step 1: Find Working Examples

Search for similar functionality that works:

```bash
# Find similar patterns
rg "similar_function" --type ts

# Find passing tests for same functionality
rg "describe.*Auth" --type ts tests/

# Check git history for when it worked
git log --oneline --all -- src/auth/
```

Questions to answer:
- Is there a similar feature that works?
- Did this specific code work before?
- Are there passing tests for related functionality?

## Step 2: Read References Completely

Read working code carefully:
- Every line, not skimming
- Full context around the area
- All imports and dependencies
- Configuration and setup

Don't just search - read and understand.

## Step 3: Identify Every Difference

Line-by-line comparison working vs broken:

| Aspect | Working | Broken |
|--------|---------|--------|
| Imports | X | Y |
| Function signature | A | B |
| Error handling | try/catch | none |
| Data flow | sync | async |
| Config | prod | dev |

Check for:
- Different imports/dependencies
- Different function signatures
- Different error handling
- Different data flow (sync vs async)
- Different configuration
- Different environment

## Step 4: Understand Dependencies

Map what the broken code depends on:

```
broken_function
├── depends on: library_a (v2.1.0)
├── depends on: shared_state (global)
├── calls: external_api (rate limited?)
└── assumes: user is authenticated
```

For each dependency:
- Is the version correct?
- Is the state valid?
- Are assumptions met?

## Step 5: Create Minimal Test Case

Strip away everything non-essential:

```typescript
// Minimal reproduction
test('minimal repro', () => {
  // Only the broken behavior, nothing else
  const result = brokenFunction({ minimal: 'input' });
  expect(result).toBe(/* expected */);
});
```

If minimal case works, add back pieces until it breaks.

</process>

<questions_to_answer>

Before leaving this stage, answer:

- Why does the working version work?
- What's fundamentally different in the broken version?
- What edge cases does working version handle?
- What invariants does working version maintain?
- What's the minimal input that triggers the bug?

</questions_to_answer>

<anti_patterns>

Avoid:
- Skimming instead of reading
- Assuming you understand without verification
- Comparing only the obvious differences
- Ignoring configuration and environment

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Working example found or confirmed none exists
- [ ] Working code read and understood
- [ ] Key differences identified and documented
- [ ] Dependencies mapped
- [ ] Minimal test case created
- [ ] Ready to form specific hypothesis

</success_criteria>

<next_steps>

- Form hypothesis: Load `workflows/test-hypothesis.md`
- Need more evidence: Load `workflows/collect-evidence.md`

</next_steps>
