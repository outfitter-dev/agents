---
name: debugging
description: This skill should be used when encountering bugs, errors, failing tests, or unexpected behavior. Provides systematic debugging with evidence-based root cause investigation using a four-stage framework.
metadata:
  version: "2.2.0"
  related-skills:
    - maintain-tasks
    - find-root-causes
    - codebase-recon
---

# Systematic Debugging

Evidence-based investigation -> root cause -> verified fix.

## Steps

1. Load the `outfitter:maintain-tasks` skill for stage tracking
2. Collect evidence (reproduce, gather symptoms)
3. Isolate variables (narrow scope)
4. Formulate and test hypotheses
5. Implement fix with failing test first
6. Verify fix resolves the issue

For formal incident investigation requiring RCA documentation, use `find-root-causes` skill instead (it loads this skill and adds formal RCA methodology).

<when_to_use>

- Bugs, errors, exceptions, crashes
- Unexpected behavior or wrong results
- Failing tests (unit, integration, e2e)
- Intermittent or timing-dependent failures
- Performance issues (slow, memory leaks, high CPU)
- Integration failures (API, database, external services)

NOT for: obvious fixes, feature requests, architecture planning

</when_to_use>

<iron_law>

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

Never propose solutions or "try this" without understanding root cause through systematic investigation.

</iron_law>

<stages>

See Steps section for skill dependencies. Stages advance forward only.

| Stage | Trigger | activeForm |
|-------|---------|------------|
| Collect Evidence | Session start | "Collecting evidence" |
| Isolate Variables | Evidence gathered | "Isolating variables" |
| Formulate Hypotheses | Problem isolated | "Formulating hypotheses" |
| Test Hypothesis | Hypothesis formed | "Testing hypothesis" |
| Verify Fix | Fix identified | "Verifying fix" |

**Situational** (insert when triggered):
- Iterate -> Hypothesis disproven, loops back with new hypothesis

**Workflow:**
- Start: "Collect Evidence" as `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- Failed hypothesis: Add "Iterate" task
- Quick fixes: If root cause obvious from error, skip to "Verify Fix" (still create failing test)
- Need more evidence: Add new evidence task (don't regress stages)
- Circuit breaker: After 3 failed hypotheses -> escalate

</stages>

<quick_start>

1. Create "Collect Evidence" todo as `in_progress`
2. Reproduce - exact steps to trigger consistently
3. Investigate - gather evidence about what's happening
4. Analyze - compare working vs broken, find differences
5. Test hypothesis - single specific hypothesis, minimal test
6. Implement - failing test first, then fix
7. Update todos on stage transitions

</quick_start>

<stage_1_root_cause>

Goal: Understand what's actually happening.

Transition: Mark complete when you have reproduction steps and initial evidence.

**Read error messages completely**
- Stack traces top to bottom
- Note file paths, line numbers, variable names
- Look for "caused by" chains

**Reproduce consistently**
- Document exact trigger steps
- Note inputs that cause vs don't cause
- Check if intermittent (timing, race conditions)
- Verify in clean environment

**Check recent changes**
- `git diff` - what changed?
- `git log --since="yesterday"` - recent commits
- Dependency updates
- Config/environment changes

**Gather evidence**
- Add logging at key points
- Print variable values at transformations
- Log function entry/exit with parameters
- Capture timestamps for timing issues

**Trace data flow backward**
- Where does bad value come from?
- Track through transformations
- Find first place it becomes wrong

Red flags (return to evidence gathering):
- "I think maybe X is the problem"
- "Let's try changing Y"
- "It might be related to Z"
- Starting to write code before understanding

</stage_1_root_cause>

<stage_2_pattern_analysis>

Goal: Learn from working code to understand broken code.

Transition: Mark complete when key differences identified.

**Find working examples**
- Search for similar functionality that works
- `rg "pattern"` for similar patterns
- Look for passing vs failing tests
- Check git history for when it worked

**Read references completely**
- Every line, not skimming
- Full context
- All dependencies/imports
- Configuration and setup

**Identify every difference**
- Line by line working vs broken
- Different imports?
- Different function signatures?
- Different error handling?
- Different data flow?
- Different configuration?

**Understand dependencies**
- Libraries/packages involved
- Versions in use
- External services
- Shared state
- Assumptions made

Questions to answer:
- Why does working version work?
- What's fundamentally different?
- Edge cases working version handles?
- Invariants working version maintains?

</stage_2_pattern_analysis>

<stage_3_hypothesis_testing>

Goal: Test one specific idea with minimal change.

Transition: Mark complete when specific, evidence-based hypothesis formed.

**Form single hypothesis**
- Template: "X is root cause because Y"
- Must explain all symptoms
- Must be testable with small change
- Must be based on evidence from stages 1-2

**Design minimal test**
- Smallest change to test hypothesis
- Change ONE variable
- Preserve everything else
- Make reversible

**Execute and verify**
- Apply change
- Run reproduction steps
- Observe carefully
- Document results

**Outcomes:**
- Fixed: Confirm across all cases, proceed to Verify Fix
- Not fixed: Mark complete, add "Iterate", form NEW hypothesis
- Partially fixed: Add "Iterate" for remaining issues
- Never: Random variations hoping one works

Bad hypotheses (too vague):
- "Maybe it's a race condition"
- "Could be caching or permissions"
- "Probably something with the database"

Good hypotheses (specific, testable):
- "Fails because expects number but receives string when API returns empty"
- "Race condition: fetchData() called before initializeClient() completes"
- "Memory leak: event listeners in useEffect never removed in cleanup"

</stage_3_hypothesis_testing>

<stage_4_implementation>

Goal: Fix root cause permanently with verification.

Transition: Root cause confirmed, ready for permanent fix.

**Create failing test**
- Write test reproducing bug
- Verify fails before fix
- Should pass after fix
- Captures exact broken scenario

**Implement single fix**
- Address identified root cause
- No additional "improvements"
- No refactoring "while you're there"
- Just fix the problem

**Verify fix**
- Failing test now passes
- Existing tests still pass
- Manual reproduction no longer triggers bug
- No new errors/warnings

**Circuit breaker**
If 3+ fixes tried without success: STOP
- Problem isn't hypothesis - problem is architecture
- May be using wrong pattern entirely
- Escalate or redesign

**After fixing:**
- Mark "Verify Fix" completed
- Add defensive validation
- Document root cause
- Consider similar bugs elsewhere

</stage_4_implementation>

<red_flags>

STOP and return to Stage 1 if you catch yourself:

- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "I don't fully understand but this might work"
- "One more fix attempt" (already tried 2+)
- "Let me try a few different things"
- Proposing solutions before gathering evidence
- Skipping failing test case
- Fixing symptoms instead of root cause

ALL mean: STOP. Add new "Collect Evidence" task.

</red_flags>

<escalation>

When to escalate:

1. After 3 failed fix attempts - architecture may be wrong
2. No clear reproduction - need more context/access
3. External system issues - need vendor/team involvement
4. Security implications - need security expertise
5. Data corruption risks - need backup/recovery planning

</escalation>

<completion>

Before claiming "fixed":

- [ ] Root cause identified with evidence
- [ ] Failing test case created
- [ ] Fix addresses root cause only
- [ ] Test now passes
- [ ] All existing tests pass
- [ ] Manual reproduction no longer triggers bug
- [ ] No new warnings/errors
- [ ] Root cause documented
- [ ] Prevention measures considered
- [ ] "Verify Fix" marked completed

**Understanding the bug is more valuable than fixing it quickly.**

</completion>

<rules>

ALWAYS:
- Create "Collect Evidence" todo at session start
- Follow four-stage framework
- Update todos on stage transitions
- Create failing test before fix
- Test single hypothesis at a time
- Document root cause after fix
- Mark "Verify Fix" complete only after tests pass

NEVER:
- Propose fixes without understanding root cause
- Skip evidence gathering
- Test multiple hypotheses simultaneously
- Skip failing test case
- Fix symptoms instead of root cause
- Continue after 3 failed fixes without escalation
- Regress stages - add new tasks if needed

</rules>

<references>

- [playbooks.md](references/playbooks.md) - bug-type specific investigations
- [evidence-patterns.md](references/evidence-patterns.md) - diagnostic techniques
- [reproduction.md](references/reproduction.md) - reproduction techniques
- [integration.md](references/integration.md) - workflow integration, anti-patterns

</references>
