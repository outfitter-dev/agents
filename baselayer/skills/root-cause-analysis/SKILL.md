---
name: root-cause-analysis
version: 1.0.0
description: This skill should be used when diagnosing failures, investigating incidents, finding root causes, or when "root cause", "diagnosis", "investigate", or "--rca" are mentioned.
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
| What are the constraints? | Time budget, what can't be modified |

## Confidence Thresholds

| Level | State | Action |
|-------|-------|--------|
| 0-2 | Symptom unclear or can't reproduce | Keep gathering info |
| 3 | Good context, some gaps | Can start hypothesis phase |
| 4+ | Clear picture | Proceed to investigation |

At level 3+, transition to hypothesis formation. Below level 3, keep gathering context.

</discovery_phase>

<hypothesis_formation>

## Quality Criteria

| Good Hypothesis | Weak Hypothesis |
|-----------------|-----------------|
| Testable | Too broad ("something's wrong") |
| Falsifiable | Untestable |
| Specific | Contradicts evidence |
| Plausible | Assumes conclusion |

## Multiple Working Hypotheses

Generate 2-4 competing theories:
1. List each hypothesis with supporting/contradicting evidence
2. Rank by likelihood (evidence support, parsimony, testability)
3. Design tests to differentiate between them

</hypothesis_formation>

<evidence_gathering>

## Observation Collection

| Category | What to Gather |
|----------|----------------|
| Error manifestation | Exact symptoms, messages, states |
| Reproduction steps | Minimal sequence triggering issue |
| System state | Logs, variables, config at failure time |
| Environment | Versions, platform, dependencies |
| Timing | When started, frequency, patterns |

## Breadcrumb Analysis

Trace backwards from symptom:
1. **Last known good state** — what was working?
2. **First observable failure** — when did it break?
3. **Changes between** — what's different?
4. **Root trigger** — first thing that went wrong

</evidence_gathering>

<hypothesis_testing>

## Test Design

For each hypothesis:
1. **Prediction** — if true, what should we observe?
2. **Test method** — how to verify?
3. **Expected result** — what confirms/refutes?
4. **Time budget** — when to move on?

## Testing Priorities

| Priority | Strategy |
|----------|----------|
| **First** | Quick, non-destructive, local tests |
| **Second** | Most likely causes, common failures |
| **Third** | Edge cases, rare failures |

## Execution Loop

Baseline → Single variable change → Observe → Document → Iterate

</hypothesis_testing>

<elimination_methodology>

Three core techniques:

| Technique | When to Use |
|-----------|-------------|
| **Binary Search** | Large problem space, ordered changes |
| **Variable Isolation** | Multiple variables, need causation |
| **Process of Elimination** | Finite set of possible causes |

See [elimination-techniques.md](references/elimination-techniques.md) for detailed methods.

</elimination_methodology>

<time_boxing>

| Phase | Duration | Exit Condition |
|-------|----------|----------------|
| Discovery | 5-10 min | Questions answered, can reproduce |
| Hypothesis | 10-15 min | 2-4 testable theories ranked |
| Testing | 15-30 min per hypothesis | Confirmed or ruled out |
| Fix | Variable | Root cause addressed |
| Verification | 10-15 min | Fix confirmed, prevention documented |

If stuck beyond 2x estimate → step back, seek fresh perspective, or escalate.

</time_boxing>

<audit_trail>

Log every step:

```
[TIME] PHASE: Action → Result
[10:15] DISCOVERY: Gathered error logs → Found NullPointerException
[10:22] HYPOTHESIS: User object not initialized
[10:28] TEST: Added null check logging → Confirmed user is null
```

Benefits: Prevents revisiting same ground, enables handoff, catches circular investigation.

See [documentation-templates.md](references/documentation-templates.md) for full templates.

</audit_trail>

<common_pitfalls>

Watch for these patterns:

| Trap | Counter |
|------|---------|
| "I already looked at that" | Re-examine with fresh evidence |
| "That can't be the issue" | Test anyway, let evidence decide |
| "We need to fix this quickly" | Methodical investigation is faster |
| Confirmation bias | Actively seek disconfirming evidence |
| Correlation = causation | Test direct causal mechanism |

See [pitfalls.md](references/pitfalls.md) for detailed resistance patterns and recovery.

</common_pitfalls>

<confidence_calibration>

| Level | Indicators |
|-------|------------|
| **High** | Consistent reproduction, clear cause-effect, multiple confirmations, fix verified |
| **Moderate** | Reproduces mostly, strong correlation, single confirmation |
| **Low** | Inconsistent reproduction, unclear correlation, unverified hypothesis |

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

**Deep-dive documentation**:
- [elimination-techniques.md](references/elimination-techniques.md) — binary search, variable isolation, process of elimination
- [pitfalls.md](references/pitfalls.md) — cognitive biases and resistance patterns
- [documentation-templates.md](references/documentation-templates.md) — investigation logs and RCA reports

**Related skills**:
- [debugging-and-diagnosis](../debugging-and-diagnosis/SKILL.md) — code-specific debugging (loads this skill)
- [codebase-analysis](../codebase-analysis/SKILL.md) — uses for code investigation
- [report-findings](../report-findings/SKILL.md) — presenting investigation results

</references>
