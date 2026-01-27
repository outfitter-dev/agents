# Workflow Pattern Example: Systematic Debugging

Demonstrates identifying, specifying, and implementing a workflow pattern.

## Pattern Identification

<evidence>

User: "I have a bug where users can't log in after password reset."

Agent flow:
1. Asked for error message and reproduction steps
2. Created minimal reproduction case, confirmed bug
3. Added logging, inspected state, reviewed recent changes
4. Identified root cause: password hash using wrong algorithm
5. Implemented fix, added regression test
6. Bug resolved

Pattern: Systematic debugging - structured investigation, not trial-and-error.

</evidence>

<classification>

Type: Workflow (multi-step sequence with clear stages)

Why not orchestration: Doesn't primarily coordinate external tools
Why not heuristic: Not a decision rule, but a procedural process

</classification>

## Pattern Specification

```yaml
name: systematic-debugging
type: workflow
description: Structured root cause investigation

stages:
  - name: Reproduction
    goal: Create reliable, minimal reproduction
    actions:
      - Gather error messages, logs, stack traces
      - Document exact steps to trigger
      - Reduce to minimal reproduction case
      - Verify reproducibility
    exit_criteria: Can trigger bug on demand

  - name: Investigation
    goal: Form hypothesis about root cause
    actions:
      - Add logging at suspected points
      - Use debugger to inspect state
      - Review recent changes (git log, blame)
      - Check related issues/PRs
    exit_criteria: Specific, testable hypothesis

  - name: Validation
    goal: Confirm fix works without regressions
    actions:
      - Implement minimal fix
      - Test against reproduction case
      - Run full test suite
    exit_criteria: Fix resolves bug, no new failures

  - name: Prevention
    goal: Prevent future recurrence
    actions:
      - Add regression test
      - Document root cause in commit
    exit_criteria: Test would fail if bug reoccurs

quality_criteria:
  - Each stage has clear outputs
  - Don't skip reproduction for "fixes"
  - Don't accept fixes without root cause
  - Always add regression test

anti_patterns:
  - Random trial-and-error
  - Fixing symptoms instead of root cause
  - No regression tests
  - Incomplete reproduction
```

## Component Recommendation

<analysis>

Invocation: User-triggered (bug report, debugging request)
Automation: Cannot be fully automated (requires judgment)
Domain Expertise: General software engineering

Decision: **SKILL**

</analysis>

<rationale>

SKILL because:
- User invokes when encountering bugs
- Requires judgment (hypothesis formation, fix validation)
- Not specialized domain (any engineer should debug)
- Benefits from progressive disclosure

Not COMMAND: Can't be scripted, requires contextual decisions
Not AGENT: General engineering, not specialized domain
Not HOOK: User-invoked, not event-triggered

</rationale>

<composite>

COMMAND: `/reproduce-bug` — automate running reproduction steps
COMMAND: `/run-regression-tests` — run tests related to bug area
HOOK: post-fix — warn if no regression test added

</composite>

## Implementation Sketch

### File Structure

```text
skills/
  systematic-debugging/
    SKILL.md
    examples/
      auth-bug.md
      race-condition.md
    references/
      debugging-tools.md
      common-patterns.md
```

### Key Sections

**Quick Start**:
1. Reproduce: Create minimal, reliable reproduction
2. Investigate: Form hypothesis using logging/debugging
3. Validate: Implement fix, verify no regressions
4. Prevent: Add regression test, document learnings

**Hypothesis Documentation**:

```text
Hypothesis: Password reset uses bcrypt, login uses SHA-256,
causing hashes to never match.

Evidence:
- resetPassword() calls bcrypt.hash()
- login() calls crypto.createHash('sha256')
- Logged hashes have different formats

Test: Change login to use bcrypt.compare()
```

**Regression Test**:

```typescript
it('allows login with new password after reset', async () => {
  const user = await createTestUser('test@example.com');
  await resetPassword(user.email);
  const newPassword = getLatestResetToken(user.email);

  const result = await login(user.email, newPassword);
  expect(result.success).toBe(true);
});
```

## Anti-Patterns

**Random trial and error**:
- ✗ "Let me try changing this and see"
- ✓ "Based on logs, I hypothesize X. Let me test that."

**Fixing symptoms**:
- ✗ "Skip password verification for reset users"
- ✓ "Fix root cause: inconsistent hashing algorithms"

**No regression test**:
- ✗ Fix, commit, move on
- ✓ Add test that fails if bug reoccurs

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Time to resolution | Varies (30min–5hr) | Consistent (1–2hr) |
| Regression rate | ~15% | <5% |
| First-fix success | ~40% | ~75% |
