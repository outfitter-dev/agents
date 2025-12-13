# Question Format

## Anatomy of a Good Question

**Components**:
1. **Q{N}**: Question number (for tracking)
2. **Question**: Clear, specific, focused on one decision
3. **Why it matters**: One sentence explaining impact
4. **Options**: 2–4 meaningful choices
5. **Nuance**: Brief context for each option
6. **★ Recommendation** (optional): Your lean with reasoning

## Delivery via EnterPlanMode

Use `EnterPlanMode` for each question — enables keyboard navigation.

**Structure**:
- **Prose above tool**: context, reasoning, ★ recommendation
- **Inside tool**: options only (concise, scannable)

Don't bury recommendations inside the tool — keep them visible in prose.

## Crafting Options

### Option Count Guidelines

**2 options**: Use when choices are binary or you want to keep it simple
- Good: "Web app or mobile app?"
- Avoid: Forcing false dichotomy when more options exist

**3 options**: Sweet spot for most questions
- Good: Covers main approaches plus one alternative
- Avoid: Making options too similar

**4 options**: Use when you need a combination or "other"
- Good: Three distinct approaches + a hybrid option
- Avoid: Analysis paralysis with too many choices

### Option Quality

**Good options**:
- Mutually exclusive (can pick only one)
- Collectively exhaustive (covers reasonable space)
- Clearly differentiated (not subtle variations)
- Actionable (leads to concrete next steps)

**Bad options**:
- Overlapping: "Option 1: Use React. Option 2: Use modern framework."
- Too similar: "Option 1: 100ms timeout. Option 2: 150ms timeout."
- Vague: "Option 1: Do it the normal way."
- Open-ended: "Option 1: Whatever you think is best."

## Why It Matters

The one-sentence explanation serves multiple purposes:
1. **Context**: Helps user understand why you're asking
2. **Priority**: Shows this isn't arbitrary
3. **Decision framing**: Clarifies what depends on this choice
4. **Respect**: Demonstrates you're not just asking for the sake of asking

**Good examples**:
- "Why it matters — determines database schema design"
- "Why it matters — affects performance characteristics and scaling strategy"
- "Why it matters — impacts user experience for first-time visitors"

**Weak examples**:
- "Why it matters — I need to know"
- "Why it matters — this is important"
- "Why it matters — because"

## Adding Nuance

Each option should include helpful context:

**Good nuance**:
- Trade-offs: "Faster to implement but less flexible long-term"
- Implications: "Requires HTTPS and external dependency"
- Prerequisites: "Need existing user database"
- Typical use case: "Best for high-traffic applications"

**Weak nuance**:
- Restating the obvious: "Uses OAuth" (when option says OAuth)
- Generic statements: "Good option"
- No information: Just the option name with no context

## Recommendations (★)

Use recommendations when:
- You have genuine expertise or insight
- One option clearly fits better for typical cases
- User seems uncertain or asks for guidance

**Don't recommend when**:
- Purely user preference (e.g., color scheme)
- Not enough context yet
- All options equally valid

**Good**: `1. React [★] — mature ecosystem *best starting point for most teams*`

**Weak**:
- ★ I like this one
- ★ Most popular
- Recommendation buried in prose above options

## User Replies

Number is a shorthand, not a constraint:
- `2` → selects option 2
- `2, but with caching` → selection + modification
- `2 and 3` → combo
- `What's the difference?` → clarification request

All valid.

## Adaptive Cadence

**Baseline** (~80% of questions):
- Clear question + one-sentence "why"
- 2–4 options with brief nuance
- Inline `[★]` on recommended option
- Optional: `[★] { expanded reasoning }` in prose above if helpful

**Expand when**:
- High ambiguity or risk
- User uncertain or asks for detail
- Technical complexity needs explanation

**Simplify when**:
- Straightforward question
- User shows expertise
- Question 6+ in session
- User wants to move faster
