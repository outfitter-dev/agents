---
description: Systematic debugging with root cause investigation - no random trial-and-error
argument-hint: [bug description or error message]
---

# Systematic Debugging

Start a methodical debugging session using the four-stage investigation framework with iterative review.

## Instructions

- Consider the recent conversation history, your context, and the problem to be debugged.
- Specific user instructions should be followed unless they are contradictory to the task at hand. $ARGUMENTS

## Steps

1. **Load** — Use the Skill tool and load the **outfitter:debugging** skill
2. **Consider** — Ultrathink and analyze the problem, consider available evidence, potential causes, and investigation approach
3. **Dispatch or Execute** — Choose execution path based on available tools:
   - **If Task tool available**: Run the debug loop (see below)
   - **If Task tool unavailable**: Execute the debugging methodology directly using the loaded skill

## Debug Loop (when Task tool available)

Run iterative cycles until the issue is resolved:

```
┌─────────────────────────────────────────────────────────┐
│  1. INVESTIGATE — Dispatch outfitter:debugger           │
│     └─ Collect evidence, form hypothesis, propose fix   │
│                          ↓                              │
│  2. REVIEW — Dispatch outfitter:reviewer                │
│     └─ Validate fix, check for regressions, verify      │
│        root cause addressed (not just symptoms)         │
│                          ↓                              │
│  3. EVALUATE — Check review outcome                     │
│     └─ If approved → Done                               │
│     └─ If issues found → Back to step 1 with feedback   │
└─────────────────────────────────────────────────────────┘
```

### Loop Execution

1. **Dispatch debugger** (background) — Pass error context, evidence, any prior feedback
2. **Retrieve results** — Use TaskOutput to get proposed fix and rationale
3. **Dispatch reviewer** (background) — Pass the proposed fix and debugger's findings for code review
4. **Retrieve review** — Use TaskOutput to get validation results
5. **Evaluate**:
   - **Approved**: Report success, document root cause and fix
   - **Issues found**: Loop back to debugger with reviewer feedback
   - **Max iterations (3)**: Escalate to user with findings so far

### Context Accumulation

Each loop iteration passes forward:
- Original error context
- Investigation findings from debugger
- Review feedback from reviewer
- Cumulative hypotheses tested

## The Iron Law

NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

If you catch yourself wanting to "just try something" — stop. Return to investigation.

## Context Handoff (for initial dispatch)

When dispatching to the debugger subagent, include:
- Exact error messages or unexpected behavior
- Stack traces if available
- Recent changes (git diff context)
- Reproduction steps if known
- Any hypotheses already formed
- Prior loop feedback (if iterating)
