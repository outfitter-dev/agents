---
name: Jam
version: 1.1.0
description: This skill should be used when requirements are unclear or incomplete, exploring solution approaches, planning complex features, or when the user mentions brainstorm, jam, planning, requirements gathering, Q&A, clarification, `--brainstorm`, or `--jam`. Clarifies ambiguous requirements through adaptive Q&A with confidence tracking and TodoWrite progress tracking.
---

# Jam

Adaptive Q&A workflow that builds confidence before delivering solutions.

## Quick Start

1. Create "Gather Context" todo as `in_progress` via TodoWrite
2. Ask exactly one question at a time with 2–4 meaningful options
3. Restate the answer and update **Confidence** (🚫🔴🟡🟢)
4. On phase transitions, update todos (see Progress Tracking)
5. At 🟢 High (≥86), deliver the solution
6. If delivering below 🟢, include **⚠️ Residual Uncertainty** section

**Best for**:
- Ambiguous or unclear requirements
- Complex features needing exploration
- Greenfield projects with open questions

**Not for**:
- Time-critical bugs (use direct troubleshooting instead)
- Well-defined tasks with clear requirements
- Simple questions with obvious answers

## Progress Tracking

Use TodoWrite to show session progression. Create todos at session start, update as you advance.

**Core Phases:**

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Gather Context** | Session start | "Gathering context" |
| **Synthesize Requirements** | Reaching 🟡 | "Synthesizing requirements" |
| **Provide Deliverables** | Reaching 🟢 | "Providing deliverables" |

**Situational Phases** (add when needed):

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Resolve Conflicts** | Pushback 🟧 or 🟥 | "Resolving conflicts" |
| **Validate Assumptions** | High-risk assumptions before delivery | "Validating assumptions" |

**Workflow:**
- On session start: Create "Gather Context" as `in_progress`
- On phase transition: Mark current phase `completed`, add next phase as `in_progress`
- Situational phases insert before "Provide Deliverables" when triggered

**Edge Cases:**
- **High start**: If initial assessment is 🟡+, complete "Gather Context" after first Q&A exchange confirms understanding
- **Early delivery**: If user requests delivery before 🟢, skip to "Provide Deliverables" (include Residual Uncertainty)
- **No regression**: If confidence drops (e.g., 🟡 → 🔴), stay in current phase — phases only advance, never regress

## Core Workflow

**One question at a time**: After each answer: restate → update **Confidence** → ask next question or take threshold action.

**Cadence**: Adaptive with balanced baseline (clear question + one-sentence "why it matters"). Expand context only when ambiguity or risk appears.

**Pushback**: Adaptive escalation through three levels (see Pushback Protocol) based on contradiction severity. Always allow explicit override: *"Proceed anyway: <reason>"*.

## Confidence

Confidence reflects certainty that you can deliver the requested outcome with the available information.

### Quick Reference

| Interval | Icon | Action |
|----------|------|--------|
| **0–59** | 🚫 | Cannot proceed. Request foundational details. |
| **60–75** | 🔴 | Ask clarifying questions. Do not deliver. |
| **76–85** | 🟡 | Provide 3-bullet summary, then ask 2–3 targeted questions or proceed. |
| **86–100** | 🟢 | Proceed to delivery. |

**Starting Confidence**: Begin at your honest assessment. Don't artificially start low if the request is clear.

**Delivering Below 🟢**: If requested, proceed but include **⚠️ Residual Uncertainty** section.

For detailed guidance on confidence intervals, see [references/confidence.md](references/confidence.md).

## Question Format

**Structure**:
* **Q[n]:** Question text
  * *Why it matters — one sentence*
  * **1.** Option 1 (+ brief nuance)
  * **2.** Option 2 (+ brief nuance)
  * **3.** Option 3 (if needed)
  * **4.** Option 4 — combo or alternate (if needed)

**Guidelines**:
* Present 2–4 meaningful options
* Mark strongest option with **⭐ Recommendation** if you have a clear lean
* User can reply with just a number, add modifications, or combine options

For detailed guidance on crafting effective questions, see [references/questions.md](references/questions.md).

## Reflection Step (After Each Answer)

* **Restate**: User's answer integrated with prior context
* **Assumptions**: List only when materially affecting direction or carrying risk
* **Confidence Update**: New score with interval icon (*🟡 82 — Medium*)
* **Phase Check**: If confidence crossed 76 or 86, update todos (see Progress Tracking)
* **Next Action**:
  * 🚫 or 🔴: Ask clarifying questions
  * 🟡: Provide summary and fork toward 🟢 or check missing pieces
  * 🟢: Deliver or ask next best question

### State Output

After each answer, emit these fields:

* **Confidence:** numeric score and interval name
* **Assumptions:** bullet list (if any)
* **Open Questions:** bullet list
* **Decisions:** bullet list of what's decided
* **Risks:** key risks with brief impact notes

## Pushback Protocol

Escalate when user's choice conflicts with goals, constraints, or best practices:

* **Level 1 — Minor (🟦)**: Minor misalignment. Gently suggest alternatives with reasoning.
* **Level 2 — Major (🟧)**: Clear conflict. Strongly recommend alternative, explain risks, ask to proceed anyway. *Triggers "Resolve Conflicts" phase.*
* **Level 3 — Critical (🟥)**: High failure risk. Require mitigation or explicit override with reasoning. *Triggers "Resolve Conflicts" phase.*
* **Override Handling**: Accept **"Proceed anyway: <reason>"** and log decision in next Reflection Step. Mark "Resolve Conflicts" complete.

## Completion Protocol

### At 🟢 High (≥86)

Produce the requested artifact immediately (document, plan, code, outline). If no specific artifact requested, suggest appropriate one and proceed upon confirmation. Follow with succinct next steps.

Mark "Provide Deliverables" as `completed` after artifact is delivered.

### Delivering Below 🟢

If user requests early delivery, skip directly to "Provide Deliverables" phase.

Append **⚠️ Residual Uncertainty** section with:
* **Open questions**: List with short context
* **Assumed decisions**: What assumed and suggested defaults
* **Known risks**: Risk and likely impact
* **Deferred items**: What's postponed and when to revisit

Mark "Provide Deliverables" as `completed` after artifact is delivered.

## Critical Rules

**ALWAYS:**
* Create "Gather Context" todo at session start
* Ask exactly one question at a time and wait for response
* Restate answer and update Confidence before next move
* Update todos when crossing phase thresholds (76, 86)
* Disclose assumptions when they materially affect direction
* Mark strongest option with ⭐ when clear lean exists, explain why
* Apply Pushback Protocol when conflicts arise

**NEVER:**
* Proceed from 🔴 Low (60–75) without clarifying questions
* Hide uncertainty - include Residual Uncertainty when delivering below 🟢
* Stack multiple questions or bury decisions in long paragraphs
* Skip Reflection Step after receiving answer
* Regress phases — if confidence drops, stay in current phase and keep asking

## Customization

These parameters can be adjusted:

* **Max questions per session:** 8 (increase for more complex explorations, decrease for faster convergence)
* **Max bullets in Medium summaries:** 3 (increase for more context, decrease for brevity)
* **Confidence thresholds:** Can adjust interval boundaries (currently: 0–59, 60–75, 76–85, 86–100) based on risk tolerance

## Additional Resources

For detailed guidance, see:
- **[references/confidence.md](references/confidence.md)** - Deep dive on confidence intervals
- **[references/questions.md](references/questions.md)** - Crafting effective questions
- **[examples/](examples/)** - Complete session examples
