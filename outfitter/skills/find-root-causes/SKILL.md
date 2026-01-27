---
name: find-root-causes
description: This skill should be used when diagnosing failures, investigating incidents, finding root causes, or when "root cause", "diagnosis", "investigate", or "--rca" are mentioned.
agent: debugger
context: fork
metadata:
  version: "2.0.0"
  related-skills:
    - debugging
    - codebase-recon
    - report-findings
---

# Root Cause Analysis

Delegated investigation: symptom → hypothesis → elimination → root cause → prevention.

## Steps

1. Load the `outfitter:debugging` skill for systematic investigation
2. Apply elimination techniques from this skill's references
3. Document investigation trail using RCA templates
4. Deliver root cause report with prevention recommendations

<when_to_use>

- Diagnosing system failures or unexpected behavior
- Investigating incidents or outages
- Finding the actual cause vs surface symptoms
- Preventing recurrence through understanding
- Post-incident reviews requiring formal documentation

NOT for: known issues with documented fixes, simple configuration errors, routine debugging (use `debugging` skill directly)

</when_to_use>

<rca_focus>

This skill extends `debugging` with formal RCA practices:

| Aspect | Debugging | Root Cause Analysis |
|--------|-----------|---------------------|
| Scope | Fix the immediate issue | Understand why it happened |
| Output | Working code | RCA report + prevention |
| Documentation | Investigation notes | Formal templates |
| Goal | Resolution | Prevention of recurrence |

Use `debugging` for day-to-day bug fixes. Use `find-root-causes` for incidents requiring formal investigation and documentation.

</rca_focus>

<elimination_techniques>

Three core techniques for narrowing to root cause:

| Technique | When to Use | Method |
|-----------|-------------|--------|
| **Binary Search** | Large problem space, ordered changes | Bisect the change range |
| **Variable Isolation** | Multiple variables, need causation | Control all but one |
| **Process of Elimination** | Finite set of possible causes | Rule out systematically |

See [elimination-techniques.md](references/elimination-techniques.md) for detailed methods and examples.

</elimination_techniques>

<documentation>

## Investigation Trail

Log every step for handoff and pattern recognition:

```
[TIME] STAGE: Action → Result
[10:15] DISCOVERY: Gathered error logs → Found NullPointerException
[10:22] HYPOTHESIS: User object not initialized
[10:28] TEST: Added null check logging → Confirmed user is null
```

## RCA Report Structure

1. **Summary** — one-sentence root cause
2. **Timeline** — events leading to incident
3. **Impact** — what was affected, duration
4. **Root Cause** — why it happened (not just what)
5. **Contributing Factors** — conditions that enabled it
6. **Prevention** — changes to prevent recurrence
7. **Detection** — how to catch it earlier next time

See [documentation-templates.md](references/documentation-templates.md) for full templates.

</documentation>

<common_pitfalls>

| Trap | Counter |
|------|---------|
| "I already looked at that" | Re-examine with fresh evidence |
| "That can't be the issue" | Test anyway, let evidence decide |
| "We need to fix this quickly" | Methodical investigation is faster |
| Confirmation bias | Actively seek disconfirming evidence |
| Correlation = causation | Test direct causal mechanism |

See [pitfalls.md](references/pitfalls.md) for detailed resistance patterns and recovery.

</common_pitfalls>

<rules>

ALWAYS:
- Load debugging skill for systematic investigation methodology
- Use elimination techniques to narrow root cause
- Document investigation trail as you go
- Produce formal RCA report for incidents
- Include prevention recommendations
- Identify contributing factors, not just root cause

NEVER:
- Skip formal documentation for incidents
- Stop at "what happened" without "why"
- Propose fixes without understanding root cause
- Omit prevention recommendations
- Blame individuals (focus on systems)

</rules>

<references>

- [elimination-techniques.md](references/elimination-techniques.md) — binary search, variable isolation, process of elimination
- [pitfalls.md](references/pitfalls.md) — cognitive biases and resistance patterns
- [documentation-templates.md](references/documentation-templates.md) — investigation logs and RCA reports

</references>
