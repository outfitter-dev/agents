# Workflow: Test Hypothesis

Test one specific idea with minimal change. Confirm or reject before trying another.

<when_to_use>

- Have specific, evidence-based hypothesis
- Ready to test a single theory
- Need to confirm root cause
- Previous hypothesis disproven, trying next

</when_to_use>

<process>

## Step 1: Form Single Hypothesis

Template: **"X is the root cause because Y"**

Requirements:
- Must explain all observed symptoms
- Must be testable with small change
- Must be based on evidence from stages 1-2
- Must be specific, not vague

**Bad hypotheses (too vague):**
- "Maybe it's a race condition"
- "Could be caching or permissions"
- "Probably something with the database"

**Good hypotheses (specific, testable):**
- "Fails because expects number but receives string when API returns empty array"
- "Race condition: fetchData() called before initializeClient() completes"
- "Memory leak: event listeners in useEffect never removed in cleanup"

## Step 2: Design Minimal Test

Smallest change to test hypothesis:

```typescript
// Before: hypothesis - missing null check
const value = data.user.name;

// Test: add defensive check
const value = data.user?.name ?? 'unknown';
```

Requirements:
- Change ONE variable
- Preserve everything else
- Make reversible
- Document what you changed

## Step 3: Execute and Observe

1. Apply the change
2. Run reproduction steps exactly
3. Observe carefully - don't assume
4. Document results

```bash
# Run specific test
bun test auth.test.ts --verbose

# Or full reproduction
./reproduce-bug.sh
```

## Step 4: Evaluate Result

| Outcome | Next Step |
|---------|-----------|
| **Fixed** | Confirm across all cases, proceed to Verify Fix |
| **Not fixed** | Form NEW hypothesis, document what was learned |
| **Partially fixed** | Adjust hypothesis, may be multiple causes |
| **Made worse** | Revert immediately, hypothesis wrong |

**If not fixed:**
1. Revert the change
2. Document: "Tested X, result was Y"
3. What did this test reveal?
4. Form new hypothesis based on new evidence

## Step 5: Circuit Breaker

After 3 failed hypotheses: **STOP**

This means:
- Problem isn't what you think
- Architecture may be wrong
- Using wrong pattern entirely
- Need fresh perspective

Actions:
- Document all 3 hypotheses and results
- Escalate or seek second opinion
- Consider redesign vs fix

</process>

<hypothesis_tracking>

Track all hypotheses tested:

| # | Hypothesis | Test | Result | Learning |
|---|------------|------|--------|----------|
| 1 | Missing null check | Added ?. | Not fixed | Values always present |
| 2 | Race condition in init | Added await | Partially fixed | Timing involved |
| 3 | Event listener leak | Added cleanup | Fixed | Root cause confirmed |

</hypothesis_tracking>

<anti_patterns>

Avoid:
- Testing multiple changes at once
- Vague hypotheses ("maybe it's...")
- Skipping documentation of failed tests
- Continuing past 3 failures without pause
- Random trial and error ("let's try this")

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Hypothesis stated in "X because Y" format
- [ ] Single minimal change made
- [ ] Test executed with careful observation
- [ ] Result documented
- [ ] Either: root cause confirmed OR new hypothesis formed
- [ ] Ready for Verify Fix OR iterating with new hypothesis

</success_criteria>

<next_steps>

- Root cause confirmed: Load `workflows/verify-fix.md`
- Hypothesis disproven: Stay here, form new hypothesis
- 3 failures reached: Escalate, seek help
- Need more evidence: Load `workflows/collect-evidence.md`

</next_steps>
