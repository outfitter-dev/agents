# Root Cause Analysis

Techniques for systematic debugging, investigation, and evidence-based problem solving.

## Before You Start

### Discovery Questions

Use [pathfinding](../pathfinding/SKILL.md) for structured discovery — one question at a time, confidence tracking, clear threshold before proceeding.

**Answer sourcing priority:**

1. **Orchestrating agent** — if launched by analyst/developer agent, query them first for context they already have
2. **Available tools** — check logs, git history, error output before asking
3. **User** — fall back to user only when agent/tools can't answer

Goal: maximize autonomy while maintaining accuracy. Don't ask the user what you can discover.

**Core questions to cover:**

| Question | Why it matters |
|----------|----------------|
| What's the symptom? | Exact error, unexpected behavior, user report |
| When did it start? | First occurrence, patterns in timing |
| Can you reproduce it? | Consistently, intermittently, specific conditions |
| What changed recently? | Deployments, config, dependencies, data |
| What have you tried? | Previous fix attempts, their results |
| What are the constraints? | Time budget, can't modify X, rollback options |

**Confidence thresholds:**

| Level | Discovery State | Action |
|-------|-----------------|--------|
| `░░░░░` 0 | Symptom unclear | Keep asking, don't investigate yet |
| `▓░░░░` 1 | Symptom clear, can't reproduce | Focus on reproduction |
| `▓▓░░░` 2 | Can reproduce, context unclear | Gather environment/history |
| `▓▓▓░░` 3 | Good context, some gaps | Can start hypothesis phase |
| `▓▓▓▓░` 4+ | Clear picture | Proceed to investigation |

At level 3+, transition from discovery to hypothesis formation. Below level 3, keep gathering context — investigating without sufficient discovery leads to thrashing.

### Announcement Protocol

Declare scope before starting — creates accountability, prevents scope creep:

```
Starting investigation of [SYMPTOM].
Expected duration: [TIME ESTIMATE].
Investigation scope: [FILES/SYSTEMS/AREAS].
```

At completion:

```
Investigation complete.
Root cause: [CAUSE]
Evidence: [SUMMARY]
Confidence: [LEVEL]
```

If investigation extends beyond estimate, pause and re-scope.

### Time-Boxed Phases

Prevent endless hypothesis generation:

| Phase | Duration | Exit Condition |
|-------|----------|----------------|
| Discovery | 5–10 min | Questions answered, can reproduce |
| Hypothesis | 10–15 min | 2–4 testable theories ranked |
| Testing | 15–30 min per hypothesis | Confirmed or ruled out |
| Fix | Variable | Root cause addressed |
| Verification | 10–15 min | Fix confirmed, regression test added |

If stuck in any phase beyond 2x estimate → step back, seek fresh perspective, or escalate.

## Deterministic Boundary

### Separate Hypothesis from Evidence

**Hypothesis generation** (non-deterministic):
- Creative thinking, pattern recognition
- Drawing on experience and intuition
- Generating possible explanations

**Evidence gathering** (deterministic):
- Reproducible observations
- Logged data, concrete outputs
- Same steps → same results

Keep these distinct. Never let hypothesis bias evidence collection. Gather evidence first, then interpret.

### Investigation as Audit Trail

Log every step for replay and review:

```
[10:15] Checked error logs → found stack trace pointing to auth.ts:42
[10:18] Hypothesis: JWT validation failing on expired tokens
[10:22] Test: Sent request with fresh token → same error
[10:25] Hypothesis ruled out, JWT not the issue
[10:28] Checked network logs → 504 timeout from auth service
[10:32] New hypothesis: upstream service degradation
```

Benefits:
- Prevents revisiting same ground
- Enables handoff to others
- Creates learning artifact
- Catches circular investigation

## Evidence Trail Following

### Observation Collection

Gather concrete data:
- **Error messages** — exact text, stack traces
- **Reproduction steps** — minimal sequence triggering issue
- **System state** — logs, variables, config at failure time
- **Environment** — versions, platform, dependencies
- **Timing** — when it started, frequency, patterns

### Symptom Classification

Distinguish:
- **Primary symptom** — what user experiences
- **Secondary symptoms** — cascading effects
- **Red herrings** — coincidental but unrelated
- **Intermittent vs consistent** — failure pattern

### Breadcrumb Analysis

Trace backwards from symptom:
1. **Last known good state** — what was working?
2. **First observable failure** — when did it break?
3. **Changes between** — what's different?
4. **Correlation vs causation** — timing vs actual cause
5. **Root trigger** — first thing that went wrong

## Hypothesis Formation

### Hypothesis Quality

Good hypothesis:
- **Testable** — can design experiment to verify
- **Falsifiable** — can prove it wrong
- **Specific** — points to concrete cause
- **Plausible** — consistent with evidence

Weak hypothesis:
- **Too broad** — "something's wrong with the database"
- **Untestable** — "maybe cosmic rays flipped a bit"
- **Contradicts evidence** — "user error" when logs show system fault
- **Assumes conclusion** — "the cache is broken because cache is always broken"

### Multiple Working Hypotheses

Generate 2–4 competing theories:
1. List each hypothesis
2. Note supporting evidence
3. Note contradicting evidence
4. Rank by likelihood
5. Design tests to differentiate

### Hypothesis Ranking

Criteria:
- **Evidence support** — how much data backs this?
- **Parsimony** — simplest explanation?
- **Prior probability** — how often does this cause this symptom?
- **Testability** — can verify quickly?

## Hypothesis Testing

### Experimental Design

For each hypothesis:
1. **Prediction** — if true, what should we observe?
2. **Test method** — how to check?
3. **Expected result** — what confirms/refutes?
4. **Time budget** — how long to spend?
5. **Stop condition** — when to move on?

### Testing Strategies

**Simplest first**:
- Quick tests before slow tests
- Non-destructive before destructive
- Local before remote

**Highest probability first**:
- Most likely cause before edge cases
- Common failures before rare failures
- Recent changes before old code

**Elimination approach**:
- Binary search problem space
- Isolate variables one at a time
- Narrow scope systematically

### Test Execution

1. **Baseline** — confirm issue still present
2. **Single variable** — change one thing
3. **Observe** — what happened?
4. **Document** — record result before next test
5. **Iterate** — adjust hypothesis or try next test

## Reproduction Strategies

### Minimal Reproduction

Reduce to simplest case:
1. **Start with full scenario** — known failure case
2. **Remove one element** — still fails?
3. **Repeat** — eliminate all non-essential parts
4. **Result** — minimal steps to trigger issue

Benefits:
- Faster to run tests
- Clearer which variable matters
- Easier to communicate to others
- Simpler to fix

### Controlled Environment

Isolate variables:
- **Clean environment** — fresh install, no customizations
- **Known versions** — specific library/runtime versions
- **Fixed data** — same inputs every time
- **Consistent state** — reset between runs

### Reproduction Reliability

Aim for 100% reproduction rate:
- **Intermittent failures** — increase sample size, look for timing/race conditions
- **Environment-specific** — compare working vs broken environments
- **Data-dependent** — identify triggering input patterns

## Elimination Methodology

### Binary Search Debugging

For large codebases or long histories:
1. **Identify range** — good version, bad version
2. **Test midpoint** — does issue exist here?
3. **Narrow range** — move to half with issue
4. **Repeat** — until single change identified

Works for:
- Git bisect (finding breaking commit)
- Removing code sections (which module fails)
- Commenting out config (which setting matters)

### Variable Isolation

Test one change at a time:
1. **Baseline** — measure with all defaults
2. **Change X** — measure impact
3. **Revert X, change Y** — measure impact
4. **Repeat** for each variable
5. **Combinations** if interactions suspected

### Process of Elimination

What it's NOT:
- ✗ Not the database (tested with different DB)
- ✗ Not the network (reproduced locally)
- ✗ Not the input data (fails with various inputs)
- ✓ Must be in processing logic

Systematically rule out possibilities until one remains.

## Confidence Calibration

### Evidence Strength

**Strong evidence** (▓▓▓▓▓):
- Consistent reproduction
- Clear cause → effect demonstrated
- Multiple independent confirmations
- Prediction verified

**Moderate evidence** (▓▓▓░░):
- Reproduces most times
- Correlation strong but not proven causal
- Single confirmation
- Prediction partially verified

**Weak evidence** (▓░░░░):
- Inconsistent reproduction
- Correlation unclear
- Unverified hypothesis
- Prediction untested

### Confidence During Investigation

Track confidence as you investigate:

**Prepping** (░░░░░):
- Issue vague, no reproduction yet
- Many possible causes
- No evidence gathered

**Scouting** (▓░░░░):
- Can reproduce sometimes
- Narrowed to subsystem
- Observational data collected

**Exploring** (▓▓░░░):
- Reliable reproduction
- 3–5 hypotheses formed
- Some tests run

**Charting** (▓▓▓░░):
- Likely cause identified
- Most alternatives ruled out
- Fix approach clear but not validated

**Mapped** (▓▓▓▓░):
- Root cause confirmed
- Fix implemented
- Needs testing in full context

**Ready** (▓▓▓▓▓):
- Fix verified
- Regression test added
- Confident in solution

## Investigation Patterns

### Top-Down

Start at symptom, drill down:
1. **User report** — what's broken?
2. **UI layer** — is error showing correctly?
3. **API layer** — is request/response correct?
4. **Business logic** — is processing correct?
5. **Data layer** — is data valid?

### Bottom-Up

Start at foundation, build up:
1. **Data** — is stored data correct?
2. **Data access** — can we query it correctly?
3. **Business logic** — does processing work?
4. **API** — does interface work?
5. **UI** — does display work?

### Meet-in-Middle

Attack from both ends:
1. **Input validation** — is input correct?
2. **Output validation** — is output correct?
3. **Trace execution** — where does it diverge?
4. **Focus on divergence point** — root cause often there

## Common Pitfalls

### Resistance Patterns to Reject

Rationalizations that lead to guess-and-check debugging:

| Thought | Why it's wrong |
|---------|----------------|
| "I already looked at that" | Memory is unreliable; re-examine with fresh evidence |
| "That can't be the issue" | Assumptions block investigation; test anyway |
| "We need to fix this quickly" | Pressure leads to random changes, not solutions |
| "The logs don't show anything" | Absence of evidence ≠ evidence of absence |
| "It worked before" | Systems change; past behavior doesn't guarantee current |
| "Let me just try this one thing" | Random trial without hypothesis wastes time |
| "I know this codebase" | Familiarity breeds blind spots |

When you catch yourself thinking these → pause, return to methodology.

### Confirmation Bias

Avoid:
- Seeing only evidence supporting pet hypothesis
- Ignoring contradictory data
- Stopping investigation once you find "a" cause

Counter:
- Actively seek disconfirming evidence
- Test alternative hypotheses
- Ask "what would prove me wrong?"

### Correlation ≠ Causation

Avoid:
- "It started when we deployed X" → X caused it
- "Happens on Tuesdays" → something about Tuesdays

Counter:
- Test direct causal mechanism
- Look for confounding variables
- Verify by removing supposed cause

### Premature Conclusion

Avoid:
- Fixing first idea without testing
- Assuming common cause without verification
- Skipping reproduction step

Counter:
- Reproduce reliably first
- Test hypothesis before implementing fix
- Verify fix actually resolves root cause

## Documentation

### Investigation Log

Capture as you go:
- **Timestamp** — when each step taken
- **Action** — what was tested
- **Result** — what was observed
- **Conclusion** — what this tells us
- **Next step** — what to try next

### Root Cause Report

At conclusion:
1. **Summary** — what was broken, what fixed it
2. **Root cause** — ultimate source of issue
3. **Contributing factors** — what made it worse
4. **Evidence** — data supporting conclusion
5. **Prevention** — how to avoid recurrence

### Lessons Learned

Extract patterns:
- **Early indicators** — what could have caught this sooner?
- **Investigation efficiency** — what worked well/poorly?
- **Knowledge gaps** — what did we not know?
- **Process improvements** — how to prevent similar issues?
