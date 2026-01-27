# Confidence

Confidence reflects certainty that you can deliver the requested outcome with the available information.

## Philosophy

Balance two goals:
1. **Gather enough** to deliver quality results
2. **Avoid over-questioning** that frustrates user

Consider:
- **Clarity**: How well-defined is the ask?
- **Risk**: What happens if assumptions are wrong?
- **Complexity**: How many moving parts?
- **Ambiguity**: How many valid interpretations?

## Level Overview

| Bar       | Level | Name         | Internal % |
| --------- | ----- | ------------ | ---------- |
| `░░░░░`   | 0     | **Prepping** | 0–19%      |
| `▓░░░░`   | 1     | **Scouting** | 20–39%     |
| `▓▓░░░`   | 2     | **Exploring**| 40–59%     |
| `▓▓▓░░`   | 3     | **Charting** | 60–74%     |
| `▓▓▓▓░`   | 4     | **Mapped**   | 75–89%     |
| `▓▓▓▓▓`   | 5     | **Ready**    | 90–100%    |

## Stage Transitions

Confidence levels trigger stage transitions. Stages always advance, never regress.

### Stage-Confidence Mapping

| Level | Stage | activeForm |
|-------|-------|------------|
| 0–1 | Prep | "Prepping" |
| 2–3 | Explore | "Exploring" |
| 4 | Clarify | "Clarifying" |
| 5 | Deliver | "Delivering" |

### Rules

1. **No regression**: If confidence drops (4 → 3), stay in current stage
2. **Skip when starting high**: Level 5 start → go directly to Deliver
3. **Stage independence**: Confidence can fluctuate within a stage
4. **Early delivery**: User can request delivery at any stage → add `△ Caveats`

### Edge Cases

**High start**: Clear requirements → Start at Ready, go directly to Deliver

**Confidence drop**: Reach Mapped (4), enter Clarify, then realize gap (drops to 3) → Stay in Clarify, ask targeted questions

**Rapid ascent**: Start at Exploring (2) → one answer jumps to Mapped (4) → next to Ready (5) → transition through stages quickly

### Level 0: Prepping `░░░░░`

**Stage**: Prep

**When**: Request completely unclear, no domain context, pure guessing

**Ask**: Scope, constraints, goals, background

**Example**: "Make it better" with no context about what "it" is.

### Level 1: Scouting `▓░░░░`

**Stage**: Prep

**When**: Vague direction, domain clear but specifics aren't

**Ask**: What system? How big? What's in place?

**Example**: "Improvements to the dashboard" — which kind?

### Level 2: Exploring `▓▓░░░`

**Stage**: Explore

**When**: General area understood, lack critical details, multiple approaches possible

**Ask**: Which approach? What about X? What matters most? Speed vs quality?

**Example**: "Authentication" — method, scale, existing system unknown.

### Level 3: Charting `▓▓▓░░`

**Stage**: Explore

**When**: Reasonable understanding, could deliver with notable assumptions

**Do**:
1. Summarize (3 bullets max)
2. Ask 2–3 targeted questions toward level 4–5
3. If user proceeds early → add `△ Caveats`

**Example**: OAuth login — general approach known, need providers + fallback strategy.

### Level 4: Mapped `▓▓▓▓░`

**Stage**: Clarify

**When**: Solid understanding, few clarifications would reach Ready, low risk

**Do**: Offer choice — "Can proceed, but 1–2 more questions would reach full confidence. Continue or deliver now?"

**Example**: New API endpoint — data model understood, need error handling approach.

### Level 5: Ready `▓▓▓▓▓`

**Stage**: Deliver

**When**: Clear understanding, no major assumptions, minimal risk

**Do**: Produce artifact immediately, succinct next steps, no more questions unless something emerges

**Example**: "Add logout button to header" — clear, specific, low-risk.

## Special Cases

### Starting Confidence

Start honest. Don't artificially start low if the request is clear.

- **Clear request** → level 4–5
- **Vague request** → level 0–2

### Delivering Below Level 5

User wants quick delivery at lower confidence:

1. Confirm they want to proceed
2. Add `△ Caveats` section
3. List assumptions, concerns, unknowns

### Calibration

- Deliver at 5, goes well → calibrated
- Deliver at 5, miss the mark → overconfident
- Stay at 0–2 too long → underconfident

## Tuning

Percentage boundaries can adjust based on risk tolerance:
- **Higher risk tolerance** → shift boundaries down
- **Lower risk tolerance** → shift boundaries up
