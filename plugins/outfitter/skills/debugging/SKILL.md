---
name: debugging
description: This skill should be used when encountering bugs, errors, failing tests, or unexpected behavior. Provides systematic debugging with evidence-based root cause investigation using a four-stage framework.
metadata:
  version: "3.0.0"
  related-skills:
    - maintain-tasks
    - find-root-causes
    - codebase-recon
---

# Systematic Debugging

Evidence-based investigation -> root cause -> verified fix.

<iron_law>

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

Never propose solutions or "try this" without understanding root cause through systematic investigation.

</iron_law>

<when_to_use>

- Bugs, errors, exceptions, crashes
- Unexpected behavior or wrong results
- Failing tests (unit, integration, e2e)
- Intermittent or timing-dependent failures
- Performance issues (slow, memory leaks, high CPU)
- Integration failures (API, database, external services)

NOT for: obvious fixes, feature requests, architecture planning

For formal incident investigation requiring RCA documentation, use `find-root-causes` skill instead.

</when_to_use>

<intake>

What debugging stage are you at?

1. **Starting fresh** — need to collect evidence and reproduce
2. **Have symptoms** — ready to isolate and narrow scope
3. **Have hypothesis** — ready to test a specific theory
4. **Have confirmed fix** — ready to implement and verify

</intake>

<routing>

| Response | Workflow | When |
|----------|----------|------|
| 1, "starting", "new bug", "fresh" | workflows/collect-evidence.md | No investigation yet |
| 2, "symptoms", "isolate", "narrow" | workflows/isolate-variables.md | Have evidence, need to narrow |
| 3, "hypothesis", "theory", "test" | workflows/test-hypothesis.md | Have specific guess to test |
| 4, "fix", "verify", "confirmed" | workflows/verify-fix.md | Root cause known |

</routing>

<stages>

Load the **maintain-tasks** skill for stage tracking. Stages advance forward only.

| Stage | Trigger | activeForm |
|-------|---------|------------|
| Collect Evidence | Session start | "Collecting evidence" |
| Isolate Variables | Evidence gathered | "Isolating variables" |
| Formulate Hypotheses | Problem isolated | "Formulating hypotheses" |
| Test Hypothesis | Hypothesis formed | "Testing hypothesis" |
| Verify Fix | Fix identified | "Verifying fix" |

**Workflow:**
- Start: "Collect Evidence" as `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- Failed hypothesis: Add "Iterate" task, form new hypothesis
- Quick fixes: If root cause obvious from error, skip to "Verify Fix" (still create failing test)
- Circuit breaker: After 3 failed hypotheses → escalate

</stages>

<red_flags>

STOP and return to Stage 1 if you catch yourself:

- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "I don't fully understand but this might work"
- "One more fix attempt" (already tried 2+)
- "Let me try a few different things"
- Proposing solutions before gathering evidence

ALL mean: STOP. Load `workflows/collect-evidence.md`.

</red_flags>

<rules>

ALWAYS:
- Load **maintain-tasks** skill for stage tracking
- Follow four-stage framework
- Update todos on stage transitions
- Create failing test before fix
- Test single hypothesis at a time
- Document root cause after fix

NEVER:
- Propose fixes without understanding root cause
- Skip evidence gathering
- Test multiple hypotheses simultaneously
- Skip failing test case
- Continue after 3 failed fixes without escalation

</rules>

<references>

**Workflows:**
- workflows/collect-evidence.md — Stage 1: Reproduce and gather evidence
- workflows/isolate-variables.md — Stage 2: Narrow scope, find differences
- workflows/test-hypothesis.md — Stage 3: Test one specific theory
- workflows/verify-fix.md — Stage 4: Implement and verify fix

**References:**
- references/playbooks.md — Bug-type specific investigations
- references/evidence-patterns.md — Diagnostic techniques
- references/reproduction.md — Reproduction strategies
- references/integration.md — Workflow integration, anti-patterns

**Examples:**
- examples/race-condition.md — Debugging timing issues
- examples/runtime-error.md — Debugging runtime errors

</references>
