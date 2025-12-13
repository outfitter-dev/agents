# Question Format: Deep Dive

## The Anatomy of a Good Question

**Components**:
1. **Q[n]**: Question number (for tracking)
2. **Question**: Clear, specific, focused on one decision
3. **Why it matters**: One sentence explaining impact
4. **Options**: 2–4 meaningful choices
5. **Nuance**: Brief context for each option
6. **Recommendation** (optional): Your lean with reasoning

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

## Recommendations (⭐)

Use recommendations when:
- You have genuine expertise or insight
- One option clearly fits better for typical cases
- The user seems uncertain or asks for guidance

**Don't use recommendations when**:
- It's purely a user preference (e.g., color scheme)
- You don't have enough context yet
- All options are equally valid

**Good recommendation**:
- **⭐ Recommendation:** Best starting point for most apps due to simplicity and broad ecosystem support

**Weak recommendation**:
- **⭐ Recommendation:** I like this one
- **⭐ Recommendation:** Most popular

## Selection Rule Nuance

When the user replies with just a number:
- Treat it as selecting that option
- They may add modifications: "2, but with caching"
- They may combine: "2 and 3 together"
- They may ask for clarification: "What's the difference between 1 and 2?"

All of these are valid. The number is a shorthand, not a constraint.

## Cadence: Adaptive Questioning

### Balanced Baseline

**Default approach**:
- Clear question
- One-sentence "why it matters"
- 2–4 options with brief nuance
- Recommendation if you have one

This works for ~80% of questions.

### When to Expand

**Add richer context when**:
- Ambiguity is high (multiple valid interpretations)
- Risk is significant (wrong choice has big impact)
- User seems uncertain or asks for more detail
- Technical complexity requires explanation

**How to expand**:
- Longer "why it matters" explanation
- More detailed trade-offs for each option
- Examples or analogies
- Links to relevant documentation

### When to Simplify

**Be more concise when**:
- The question is straightforward
- User has shown expertise in this area
- You're on question 6+ in the session
- User has indicated they want to move faster

**How to simplify**:
- Skip nuance if options are self-explanatory
- Drop recommendation if all options are equally valid
- Shorter "why it matters"
