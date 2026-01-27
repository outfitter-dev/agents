# Common Pitfalls

Cognitive biases and resistance patterns that derail root cause investigation.

## Resistance Patterns

Rationalizations that prevent finding root cause:

| Thought | Why It's Wrong | Counter |
|---------|----------------|---------|
| "I already looked at that" | Memory is unreliable under pressure | Re-examine with fresh evidence |
| "That can't be the issue" | Assumptions block investigation | Test anyway, let evidence decide |
| "We need to fix this quickly" | Pressure leads to random changes | Methodical investigation is faster |
| "The logs don't show anything" | Absence of evidence != evidence of absence | Consider what logs might be missing |
| "It worked before" | Systems change constantly | Past behavior doesn't guarantee current |
| "Let me just try this one thing" | Random trial without hypothesis wastes time | Form hypothesis first |

### Warning Signs

You're falling into resistance when:
- Same thoughts recurring without new evidence
- Feeling defensive about previous conclusions
- Avoiding re-testing areas you "already checked"
- Making changes without understanding why they might work

### Recovery

When you catch yourself:
1. Pause the investigation
2. Write down current assumptions
3. Challenge each assumption with "how do I know this?"
4. Return to methodology

## Confirmation Bias

Tendency to see evidence supporting existing beliefs.

### Manifestations

- Seeing only evidence supporting pet hypothesis
- Dismissing contradictory data as "noise"
- Stopping investigation once "a" cause is found
- Interpreting ambiguous evidence favorably

### Counter-Strategies

**Actively seek disconfirmation**:
- Ask "what would prove me wrong?"
- Design tests specifically to disprove hypothesis
- Have someone else review your reasoning

**Test alternative hypotheses**:
- Even when confident in one theory
- Especially when confident in one theory
- Give each hypothesis fair testing time

**Document objectively**:
- Record all evidence, not just supporting evidence
- Note your confidence level before and after tests
- Track hypothesis changes over time

## Correlation vs Causation

Mistaking timing for cause.

### Common Mistakes

| Observation | Faulty Conclusion |
|-------------|-------------------|
| "It started when X changed" | X caused it |
| "Happens at specific time" | Time is the cause |
| "Only affects user Y" | User Y is doing something wrong |
| "Works after restart" | Memory/state is the issue |

### Verification Steps

1. **Test direct causal mechanism** — Can you explain HOW X causes the symptom?
2. **Look for confounding variables** — What else changed or varies?
3. **Verify by removing supposed cause** — Does removing X fix it?
4. **Test in isolation** — Does X cause it when nothing else varies?

### Example

Observation: "Bug only appears on Mondays"

Bad conclusion: "Something about Monday causes the bug"

Better investigation:
- What's different on Monday? (traffic patterns, batch jobs, fresh caches)
- Is it Monday specifically or "first day after weekend"?
- Does it happen on holidays?
- What runs over the weekend?

## Anchoring

Over-reliance on first piece of information.

### Manifestations

- First hypothesis dominates thinking
- Initial symptom description defines investigation
- Early evidence weighted more heavily
- Difficulty abandoning initial direction

### Counter-Strategies

- Explicitly generate 3+ hypotheses before testing any
- Weight evidence by quality, not order discovered
- Periodically re-read original problem statement
- Ask "what if my first assumption is wrong?"

## Availability Heuristic

Over-weighting recent or memorable experiences.

### Manifestations

- "This looks like the bug we had last week"
- Assuming familiar problems over unfamiliar ones
- Checking usual suspects first (sometimes good, often biasing)

### Counter-Strategies

- Consider base rates (how often does this actually happen?)
- Check if "familiar" actually matches evidence
- Maintain systematic approach even when "obvious"

## Premature Closure

Stopping investigation too early.

### Warning Signs

- Relief when finding "a" cause
- Desire to move to fix stage quickly
- Skipping verification steps
- Not testing alternative hypotheses

### Prevention

- Multiple working hypotheses rule
- Require explicit disconfirmation of alternatives
- Verification stage mandatory before declaring root cause
- Ask "what else could cause this symptom?"

## Sunk Cost Fallacy

Continuing failed approach due to invested effort.

### Manifestations

- "We've spent hours on this theory, it must be right"
- Reluctance to abandon promising-but-wrong direction
- Adding complexity to failing hypothesis instead of reconsidering

### Counter-Strategies

- Time-box hypothesis testing
- Set explicit abandon criteria before starting
- Treat investigation time as learning, not investment
- Ask "if I started fresh, would I pursue this?"

## Escalation Protocol

When you recognize you're stuck in a pitfall:

1. **Acknowledge** — Name the bias or pattern
2. **Document** — Write down current state and reasoning
3. **Reset** — Return to discovery stage
4. **Reframe** — Look at problem from different angle
5. **Seek outside perspective** — Fresh eyes often see what you miss

If stuck for > 2x expected time, mandatory escalation or perspective shift.
