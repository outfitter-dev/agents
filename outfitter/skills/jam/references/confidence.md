# Confidence: Deep Dive

Confidence reflects your subjective, context-dependent certainty that you can deliver the requested outcome with the available information.

## Philosophy

The confidence system balances two goals:
1. **Gather enough information** to deliver quality results
2. **Avoid over-questioning** that frustrates the user

Your confidence assessment should consider:
- **Clarity of requirements**: How well-defined is the ask?
- **Risk of failure**: What happens if assumptions are wrong?
- **Complexity**: How many moving parts are involved?
- **Ambiguity**: How many valid interpretations exist?

## Interval Details

## Phase Transitions

Confidence thresholds trigger phase transitions in the jam workflow. Phases track progression through the session and always move forward, never backward.

### Phase-Confidence Relationship

| Confidence Range | Phase | Active Form |
|------------------|-------|-------------|
| 🚫 0–59, 🔴 60–75 | **Gather Context** | "Gathering context" |
| 🟡 76–85 | **Synthesize Requirements** | "Synthesizing requirements" |
| 🟢 86–100 | **Provide Deliverables** | "Providing deliverables" |

### Key Thresholds

- **76**: Transition from "Gather Context" → "Synthesize Requirements"
- **86**: Transition from "Synthesize Requirements" → "Provide Deliverables"

### Progression Rules

1. **Phases only advance, never regress**: If confidence drops from 🟡 back to 🔴, stay in the current phase (don't move backward to "Gather Context")
2. **Skip phases when starting high**: If initial confidence is 🟢 (86+), proceed directly to "Provide Deliverables"
3. **Phase independence**: Confidence can fluctuate within a phase without changing the phase
4. **Early delivery**: Users can request delivery at any phase; add **⚠️ Residual Uncertainty** section if below 🟢

### Edge Case Examples

**High start (86+)**: User provides crystal-clear requirements → Start at 🟢, proceed directly to "Provide Deliverables"

**Confidence drop**: You reach 🟡 (80) and enter "Synthesize Requirements", then realize something is unclear (confidence drops to 70) → Stay in "Synthesize Requirements" phase, ask targeted questions

**Rapid ascent**: Start at 🔴 (65), one answer brings you to 🟡 (78), next answer brings you to 🟢 (90) → Transition through all phases quickly

### 🚫 0–59 (Insufficient)
**Cannot proceed. Request foundational details.**

**Phase context**: Gather Context

**When to use**:
- The request is completely unclear
- You have no idea what domain/context this is about
- Multiple fundamental assumptions would be required
- Proceeding would be pure guessing

**What to ask**:
- Scope: "What are we trying to accomplish?"
- Constraints: "What are the boundaries/limitations?"
- Goals: "What success looks like?"
- Context: "What's the background/motivation?"

**Example**: User says "Make it better" with no context about what "it" is.

### 🔴 60–75 (Low)
**Ask clarifying questions. Do not proceed to delivery.**

**Phase context**: Gather Context

**When to use**:
- You understand the general area but lack critical details
- Multiple approaches exist and choice depends on unknown factors
- Key decisions require user input
- Assumptions carry moderate risk

**What to ask**:
- Specific choices: "Which approach?"
- Missing details: "What about X scenario?"
- Priorities: "What matters most?"
- Trade-offs: "Speed vs. quality?"

**Example**: User wants "authentication" but you don't know the method, scale, or existing system.

### 🟡 76–85 (Medium)
**Provide 3-bullet summary, then either fork toward 🟢 or run missing pieces check.**

**Phase context**: Synthesize Requirements (transition from Gather Context)

**When to use**:
- You have a solid understanding of the request
- A few clarifications would push you to High
- You could deliver now but with some assumptions
- Risk is low-to-moderate

**What to do**:
1. Summarize your understanding (3 bullets max)
2. Either:
   - Ask 2–3 targeted questions to reach 🟢
   - Proceed to delivery if user confirms summary

**Example**: User wants OAuth login, you know the general approach, but need to confirm providers and fallback strategy.

### 🟢 86–100 (High)
**Proceed to delivery.**

**Phase context**: Provide Deliverables (transition from Synthesize Requirements)

**When to use**:
- You clearly understand what's needed
- You can deliver without major assumptions
- Risk of misalignment is minimal
- You have enough context to proceed confidently

**What to do**:
- Produce the requested artifact immediately
- Follow with succinct next steps
- No more questions unless something emerges during delivery

**Example**: User wants "add a logout button to the header" - clear, specific, low-risk.

## Special Cases

### Starting Confidence
Begin at your honest assessment. Don't artificially start low if the request is clear.

**Clear request** → Start at 🟡 or 🟢
**Vague request** → Start at 🚫 or 🔴

### Delivering Below 🟢
Sometimes users want quick delivery even at lower confidence. This is fine, but:
1. Confirm they want to proceed
2. Include **⚠️ Residual Uncertainty** section
3. List assumptions, risks, and open questions

### Calibration Over Time
Your confidence scoring will improve with practice. Pay attention to:
- When you deliver at 🟢 and it goes well → you're calibrated
- When you deliver at 🟢 and miss the mark → you were overconfident
- When you stay in 🔴 too long → you may be underconfident

## Tuning Thresholds

Current defaults:
- 🚫 0–59 (Insufficient)
- 🔴 60–75 (Low)
- 🟡 76–85 (Medium)
- 🟢 86–100 (High)

**Higher risk tolerance** (willing to deliver with more uncertainty):
- 🚫 0–49
- 🔴 50–69
- 🟡 70–84
- 🟢 85–100

**Lower risk tolerance** (need more certainty):
- 🚫 0–69
- 🔴 70–79
- 🟡 80–89
- 🟢 90–100
