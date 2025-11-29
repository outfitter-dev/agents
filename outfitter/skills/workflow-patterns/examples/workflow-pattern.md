# Workflow Pattern Example: Systematic Debugging

This example demonstrates how to identify, specify, and implement a workflow pattern.

## Pattern Identification

### Evidence from Conversation

**User request**:
> "I have a bug where users can't log in after password reset. Can you help me debug this?"

**Agent conversation flow**:
1. Agent: "Let me reproduce the issue first. Can you share the error message and steps to trigger it?"
2. User provides reproduction steps
3. Agent creates minimal reproduction case, confirms bug
4. Agent adds logging, inspects state, reviews recent changes
5. Agent identifies root cause: password hash comparison using wrong algorithm
6. Agent implements fix, adds regression test
7. Bug resolved

**Pattern observed**: Systematic approach to debugging - not random trial and error, but structured investigation.

### Pattern Type Classification

**Type**: Workflow (multi-step sequence with clear phases)

**Why not orchestration?**: Doesn't primarily coordinate external tools
**Why not heuristic?**: Not a decision rule, but a procedural process

## Pattern Specification

```yaml
name: systematic-debugging
title: Systematic Debugging Workflow
type: workflow
description: Structured approach to investigating and resolving bugs through reproduction, investigation, validation, and prevention phases.

triggers:
  - Bug report received from user or QA
  - Test failure in CI/CD pipeline
  - Unexpected behavior observed in production
  - Error logs indicate application malfunction

steps:
  - phase: Reproduction
    goal: Create reliable, minimal reproduction of the bug
    actions:
      - Gather error messages, logs, and stack traces
      - Document exact steps to trigger the bug
      - Reduce to minimal reproduction case
      - Verify bug reproduces consistently
    outputs:
      - Reproduction script or step-by-step instructions
      - Confirmation that bug is reproducible
    success_criteria:
      - Can trigger bug on demand
      - Reproduction is minimal (no extraneous steps)

  - phase: Investigation
    goal: Form and test hypotheses about root cause
    actions:
      - Add logging at suspected failure points
      - Use debugger to inspect program state
      - Review recent code changes (git log, git blame)
      - Check for related issues or PRs
      - Review error handling and edge cases
    outputs:
      - Hypothesis about root cause
      - Evidence supporting hypothesis
    success_criteria:
      - Have specific, testable hypothesis
      - Can explain why bug occurs

  - phase: Validation
    goal: Confirm fix resolves issue without regressions
    actions:
      - Implement minimal fix targeting root cause
      - Test fix against reproduction case
      - Run full test suite to check for regressions
      - Verify fix works in different scenarios
    outputs:
      - Confirmed fix that resolves bug
      - No new test failures
    success_criteria:
      - Reproduction case no longer triggers bug
      - All existing tests still pass
      - Fix is minimal and targeted

  - phase: Prevention
    goal: Prevent future recurrence and document learnings
    actions:
      - Add regression test covering the bug
      - Document root cause and fix in commit message
      - Consider architectural improvements to prevent similar bugs
      - Update documentation if user-facing issue
    outputs:
      - Regression test in test suite
      - Clear commit message explaining bug and fix
      - Optional: architectural improvements
    success_criteria:
      - Test would fail if bug reoccurs
      - Future developers can understand the fix

quality_criteria:
  - Each phase has clear outputs
  - Don't skip reproduction to jump to "fixes"
  - Don't accept fixes without understanding root cause
  - Always add regression test

anti_patterns:
  - Random trial-and-error ("try changing X and see what happens")
  - Fixing symptoms instead of root cause
  - Not adding regression tests
  - Incomplete reproduction (works sometimes but not always)
```

## Component Recommendation

### Analysis

**Invocation**: User-triggered (user reports bug or asks for help debugging)

**Automation**: Cannot be fully automated
- Reproduction requires understanding user context
- Investigation requires analyzing code and forming hypotheses
- Validation requires judgment on whether fix is correct
- Prevention requires architectural thinking

**Domain Expertise**: General software engineering (not specialized domain)

**Decision**: SKILL

### Rationale

This is a **Skill** because:
1. User invokes it when encountering bugs
2. Requires agent judgment throughout (hypothesis formation, fix validation)
3. Not specialized domain knowledge (any engineer should debug)
4. Benefits from progressive disclosure (show relevant debugging techniques based on context)

**Not a Command** because: Cannot be fully scripted - requires contextual decisions at each phase

**Not an Agent** because: Debugging is general engineering skill, not specialized domain requiring unique system prompt

**Not a Hook** because: User-invoked, not event-triggered

### Composite Enhancement

Consider adding:

**COMMAND: `/reproduce-bug`**
- Automates running reproduction steps
- Captures logs and state
- Mechanical execution of known reproduction

**COMMAND: `/run-regression-tests`**
- Automatically runs tests related to bug area
- Reports coverage impact

**HOOK: post-fix validation**
- After bug fix committed, automatically checks for regression test
- Warns if no test added

## Generated Component Structure

### File Structure

```
skills/
  systematic-debugging/
    SKILL.md              # Main skill file
    examples/
      auth-bug.md         # Example: authentication bug
      race-condition.md   # Example: concurrency bug
      memory-leak.md      # Example: resource leak
    references/
      debugging-tools.md  # Debuggers, profilers, logging
      common-patterns.md  # Frequent bug patterns and solutions
```

### SKILL.md (excerpt)

```markdown
---
name: systematic-debugging
description: Provides structured debugging workflow for investigating and resolving bugs through reproduction, investigation, validation, and prevention. Use when encountering bugs, test failures, or unexpected behavior that needs systematic investigation.
---

# Systematic Debugging

Debug issues methodically using a four-phase approach: Reproduction → Investigation → Validation → Prevention.

## Quick Start

1. **Reproduce**: Create minimal, reliable reproduction of the bug
2. **Investigate**: Form hypothesis about root cause using logging and debugging tools
3. **Validate**: Implement fix and verify it resolves issue without regressions
4. **Prevent**: Add regression test and document learnings

## Phase 1: Reproduction

Create a minimal, reliable way to trigger the bug.

### Actions

**Gather information**:
- Collect error messages and stack traces
- Review logs around the time of failure
- Document user-reported steps to reproduce
- Check environment details (OS, browser, versions)

**Create reproduction case**:
- Start with user-reported steps
- Remove unnecessary steps (minimize)
- Verify bug reproduces consistently (100% of the time if possible)
- Document exact sequence that triggers bug

**Output**: Script or documented steps that reliably trigger the bug

### Example

```typescript
// Minimal reproduction script
import { resetPassword, login } from './auth';

async function reproduceBug() {
  const user = await createTestUser('test@example.com');

  // Reset password
  await resetPassword(user.email);
  const newPassword = getLatestResetToken(user.email);

  // Try to login with new password
  const result = await login(user.email, newPassword);

  // BUG: This fails with "Invalid credentials"
  console.assert(result.success === true, 'Login should succeed');
}
```

## Phase 2: Investigation

Form and test hypotheses about the root cause.

### Investigation Techniques

**Add strategic logging**:
```typescript
// Add logs at suspected failure points
logger.debug('Password hash during reset:', { hash });
logger.debug('Password hash during login:', { hash });
// Compare to see if they differ
```

**Use debugger**:
- Set breakpoints at failure points
- Inspect variable state
- Step through execution
- Check call stack

**Review recent changes**:
```bash
# What changed recently in this code?
git log -p --since="2 weeks ago" -- src/auth/

# Who last modified this line?
git blame src/auth/password.ts
```

**Check for related issues**:
- Search issue tracker for similar bugs
- Review merged PRs that touched this code
- Check if tests cover this scenario

### Hypothesis Formation

Document your hypothesis:
```
Hypothesis: Password reset uses bcrypt to hash the new password,
but login comparison uses SHA-256, causing hashes to never match.

Evidence:
- resetPassword() calls bcrypt.hash()
- login() calls crypto.createHash('sha256')
- Hashes logged during both operations are different formats

Test: Change login to use bcrypt.compare() instead
```

## Phase 3: Validation

Implement fix and verify it works.

### Implementation

```typescript
// Before (broken)
async function login(email: string, password: string) {
  const user = await findUser(email);
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash === user.passwordHash) {
    return { success: true };
  }
  return { success: false };
}

// After (fixed)
async function login(email: string, password: string) {
  const user = await findUser(email);
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (isValid) {
    return { success: true };
  }
  return { success: false };
}
```

### Validation Steps

1. Run reproduction script - should now pass
2. Run full test suite - should not break anything
3. Test edge cases:
   - Login with old password (should fail)
   - Login with new password (should succeed)
   - Multiple password resets
   - Case sensitivity

## Phase 4: Prevention

Add regression test and document.

### Regression Test

```typescript
describe('Password Reset', () => {
  it('allows login with new password after reset', async () => {
    // This test would have caught the bug
    const user = await createTestUser('test@example.com');

    await resetPassword(user.email);
    const newPassword = getLatestResetToken(user.email);

    const result = await login(user.email, newPassword);
    expect(result.success).toBe(true);
  });

  it('prevents login with old password after reset', async () => {
    const user = await createTestUser('test@example.com');
    const oldPassword = 'original-password';

    await resetPassword(user.email);

    const result = await login(user.email, oldPassword);
    expect(result.success).toBe(false);
  });
});
```

### Commit Message

```
fix: use bcrypt for password comparison in login

The login function was using SHA-256 for password comparison while
resetPassword uses bcrypt for hashing. This caused all password reset
flows to fail authentication.

Changed login to use bcrypt.compare() for consistent password verification.

Added regression tests for password reset flow.

Fixes #123
```

## Anti-Patterns to Avoid

**Random trial and error**:
❌ "Let me try changing this and see if it works"
✅ "Based on the logs, I hypothesize X. Let me test that hypothesis."

**Fixing symptoms**:
❌ "I'll just skip password verification for reset users"
✅ "I'll fix the root cause: inconsistent hashing algorithms"

**No regression test**:
❌ Fix the bug, commit, move on
✅ Add test that would fail if bug reoccurs

**Incomplete reproduction**:
❌ "It fails sometimes, but I'm not sure exactly when"
✅ "It fails 100% of the time when following these exact steps"

## Progressive Disclosure

### When Bug is Complex

For complex bugs (race conditions, memory leaks, distributed systems), see:
- [Concurrency Debugging](references/concurrency-debugging.md)
- [Memory Profiling](references/memory-profiling.md)
- [Distributed Tracing](references/distributed-debugging.md)

### Tools Deep Dive

- [Debuggers](references/debugging-tools.md#debuggers) - lldb, gdb, Chrome DevTools
- [Profilers](references/debugging-tools.md#profilers) - CPU, memory, network
- [Logging](references/debugging-tools.md#logging) - Structured logging, log levels
```

## Integration with Other Components

### Used alongside

**validate-claude-skill**: After creating debugging skill, validate it meets quality criteria

**conversation-analysis**: Debugging patterns identified from successful debug sessions

**code-review**: Debugging skill used during PR review to investigate issues

### Invocation patterns

**Direct user request**:
> "I have a bug where X happens, can you help debug it?"

**Flag trigger**:
> "Help me debug this issue --systematic-debugging"

**Implicit trigger**:
- User describes unexpected behavior
- Agent recognizes debugging scenario
- Agent follows systematic debugging workflow

## Success Metrics

Track effectiveness of this workflow pattern:

**Time to resolution**: How long from bug report to fix?
- Before pattern: Varies widely (30 min to 5+ hours)
- With pattern: More consistent (1-2 hours typical)

**Regression rate**: How often does same bug reoccur?
- Before pattern: ~15% of bugs reoccur
- With pattern: <5% (due to regression tests)

**First-fix success**: How often does first attempted fix work?
- Before pattern: ~40% (lots of trial and error)
- With pattern: ~75% (hypotheses guide targeted fixes)

## Conclusion

This workflow pattern provides structure to debugging, reducing random trial-and-error and increasing fix quality. Implement as a Skill for guided debugging assistance.
