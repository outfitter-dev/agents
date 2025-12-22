---
name: root-cause-analysis
version: 1.0.0
description: Systematic problem investigation through hypothesis formation, evidence gathering, and elimination methodology. Use when diagnosing failures, investigating incidents, finding root causes, or when root-cause, diagnosis, investigate, or --rca are mentioned. Micro-skill loaded by debugging-and-diagnosis, codebase-analysis, and other investigation skills.
---

# Root Cause Analysis

Symptom → hypothesis formation → evidence gathering → elimination → root cause → verified fix.

<when_to_use>
- Diagnosing system failures or unexpected behavior
- Investigating incidents or outages
- Finding the actual cause vs surface symptoms
- Preventing recurrence through understanding
- Any situation where "why did this happen?" needs answering

NOT for: known issues with documented fixes, simple configuration errors, guessing without evidence
</when_to_use>

<discovery_phase>
## Core Questions

| Question | Why it matters |
|----------|----------------|
| What's the symptom? | Exact manifestation of the problem |
| When did it start? | First occurrence, patterns in timing |
| Can you reproduce it? | Consistently, intermittently, specific conditions |
| What changed recently? | Deployments, config, dependencies, environment |
| What have you tried? | Previous fix attempts, their results |
| What are the constraints? | Time budget, what can't be modified, rollback options |

## Confidence Thresholds

| Level | Discovery State | Action |
|-------|-----------------|--------|
| `░░░░░` 0 | Symptom unclear | Keep gathering info, don't investigate yet |
| `▓░░░░` 1 | Symptom clear, can't reproduce | Focus on reproduction |
| `▓▓░░░` 2 | Can reproduce, context unclear | Gather environment/history |
| `▓▓▓░░` 3 | Good context, some gaps | Can start hypothesis phase |
| `▓▓▓▓░` 4+ | Clear picture | Proceed to investigation |

At level 3+, transition from discovery to hypothesis formation. Below level 3, keep gathering context.
</discovery_phase>

<hypothesis_formation>
## Hypothesis Quality

Good hypothesis:
- **Testable** — can design experiment to verify
- **Falsifiable** — can prove it wrong
- **Specific** — points to concrete cause
- **Plausible** — consistent with evidence

Weak hypothesis:
- **Too broad** — "something's wrong with the system"
- **Untestable** — "maybe cosmic rays"
- **Contradicts evidence** — ignores known facts
- **Assumes conclusion** — "X is broken because X always breaks"

## Multiple Working Hypotheses

Generate 2–4 competing theories:
1. List each hypothesis
2. Note supporting evidence
3. Note contradicting evidence
4. Rank by likelihood
5. Design tests to differentiate

## Ranking Criteria

- **Evidence support** — how much data backs this?
- **Parsimony** — simplest explanation?
- **Prior probability** — how often does this cause this symptom?
- **Testability** — can verify quickly?
</hypothesis_formation>

<evidence_gathering>
## Observation Collection

Gather concrete data:
- **Error manifestation** — exact symptoms, messages, states
- **Reproduction steps** — minimal sequence triggering issue
- **System state** — logs, variables, config at failure time
- **Environment** — versions, platform, dependencies
- **Timing** — when it started, frequency, patterns

## Symptom Classification

Distinguish:
- **Primary symptom** — what user/system experiences
- **Secondary symptoms** — cascading effects
- **Red herrings** — coincidental but unrelated
- **Intermittent vs consistent** — failure pattern

## Breadcrumb Analysis

Trace backwards from symptom:
1. **Last known good state** — what was working?
2. **First observable failure** — when did it break?
3. **Changes between** — what's different?
4. **Correlation vs causation** — timing vs actual cause
5. **Root trigger** — first thing that went wrong
</evidence_gathering>

<hypothesis_testing>
## Experimental Design

For each hypothesis:
1. **Prediction** — if true, what should we observe?
2. **Test method** — how to check?
3. **Expected result** — what confirms/refutes?
4. **Time budget** — how long to spend?
5. **Stop condition** — when to move on?

## Testing Strategies

**Simplest first**:
- Quick tests before slow tests
- Non-destructive before destructive
- Local before remote

**Highest probability first**:
- Most likely cause before edge cases
- Common failures before rare failures
- Recent changes before old components

**Elimination approach**:
- Binary search problem space
- Isolate variables one at a time
- Narrow scope systematically

## Test Execution

1. **Baseline** — confirm issue still present
2. **Single variable** — change one thing
3. **Observe** — what happened?
4. **Document** — record result before next test
5. **Iterate** — adjust hypothesis or try next test
</hypothesis_testing>

<elimination_methodology>
## Binary Search

For large problem spaces:
1. **Identify range** — good state, bad state
2. **Test midpoint** — does issue exist here?
3. **Narrow range** — move to half with issue
4. **Repeat** — until single change identified

Works for: finding breaking changes, isolating components, narrowing scope

## Variable Isolation

Test one change at a time:
1. **Baseline** — measure with all defaults
2. **Change X** — measure impact
3. **Revert X, change Y** — measure impact
4. **Repeat** for each variable
5. **Combinations** if interactions suspected

## Process of Elimination

What it's NOT:
- ✗ Not component A (tested isolation)
- ✗ Not component B (reproduced without)
- ✗ Not external factor (reproduced in clean environment)
- ✓ Must be in remaining scope

Systematically rule out possibilities until one remains.
</elimination_methodology>

<time_boxing>
## Phase Durations

| Phase | Duration | Exit Condition |
|-------|----------|----------------|
| Discovery | 5–10 min | Questions answered, can reproduce |
| Hypothesis | 10–15 min | 2–4 testable theories ranked |
| Testing | 15–30 min per hypothesis | Confirmed or ruled out |
| Fix | Variable | Root cause addressed |
| Verification | 10–15 min | Fix confirmed, prevention documented |

If stuck in any phase beyond 2x estimate → step back, seek fresh perspective, or escalate.
</time_boxing>

<audit_trail>
## Investigation Log

Log every step for replay and review:

```
[TIME] Checked evidence → found specific data
[TIME] Hypothesis: possible cause based on evidence
[TIME] Test: what was tried → result observed
[TIME] Hypothesis ruled out/confirmed, reason
[TIME] New hypothesis based on new evidence
```

Benefits:
- Prevents revisiting same ground
- Enables handoff to others
- Creates learning artifact
- Catches circular investigation
</audit_trail>

<common_pitfalls>
## Resistance Patterns

Rationalizations that derail investigation:

| Thought | Why it's wrong |
|---------|----------------|
| "I already looked at that" | Memory unreliable; re-examine with fresh evidence |
| "That can't be the issue" | Assumptions block investigation; test anyway |
| "We need to fix this quickly" | Pressure leads to random changes, not solutions |
| "The logs don't show anything" | Absence of evidence ≠ evidence of absence |
| "It worked before" | Systems change; past behavior doesn't guarantee current |
| "Let me just try this one thing" | Random trial without hypothesis wastes time |

When you catch yourself thinking these → pause, return to methodology.

## Confirmation Bias

Avoid:
- Seeing only evidence supporting pet hypothesis
- Ignoring contradictory data
- Stopping investigation once you find "a" cause

Counter:
- Actively seek disconfirming evidence
- Test alternative hypotheses
- Ask "what would prove me wrong?"

## Correlation ≠ Causation

Avoid:
- "It started when X changed" → X caused it
- "Happens at specific time" → time is the cause

Counter:
- Test direct causal mechanism
- Look for confounding variables
- Verify by removing supposed cause
</common_pitfalls>

<documentation>
## Root Cause Report

At conclusion:
1. **Summary** — what was broken, what fixed it
2. **Root cause** — ultimate source of issue
3. **Contributing factors** — what made it worse
4. **Evidence** — data supporting conclusion
5. **Prevention** — how to avoid recurrence

## Lessons Learned

Extract patterns:
- **Early indicators** — what could have caught this sooner?
- **Investigation efficiency** — what worked well/poorly?
- **Knowledge gaps** — what did we not know?
- **Process improvements** — how to prevent similar issues?
</documentation>

<confidence_calibration>
**High confidence** (▓▓▓▓▓):
- Consistent reproduction
- Clear cause → effect demonstrated
- Multiple independent confirmations
- Fix verified working

**Moderate confidence** (▓▓▓░░):
- Reproduces most times
- Correlation strong but not proven causal
- Single confirmation
- Fix appears to work

**Low confidence** (▓░░░░):
- Inconsistent reproduction
- Correlation unclear
- Unverified hypothesis
- Fix untested
</confidence_calibration>

<rules>
ALWAYS:
- Gather sufficient context before hypothesizing
- Form multiple competing hypotheses
- Test systematically, one variable at a time
- Document investigation trail
- Verify fix actually addresses root cause
- Document for future prevention

NEVER:
- Jump to solutions without diagnosis
- Trust single hypothesis without testing alternatives
- Apply fixes without understanding cause
- Skip verification of fix
- Repeat same failed investigation steps
- Hide uncertainty about root cause
</rules>

<references>
Related skills:
- [debugging-and-diagnosis](../debugging-and-diagnosis/SKILL.md) — code-specific debugging (loads this skill)
- [codebase-analysis](../codebase-analysis/SKILL.md) — uses for code investigation
- [report-findings](../report-findings/SKILL.md) — presenting investigation results
</references>
