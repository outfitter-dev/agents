# Formatting Conventions

Conventions for interactive sessions using baselayer skills.

## Interactive Questions

Use `EnterPlanMode` for multi-option questions — enables keyboard navigation.

- **Prose above options**: context, "why it matters"
- **Inside options**: inline `[★]` + *italicized rationale* on recommendation
- **Escape hatch**: always include a "Something else" option

Pattern: `N. Option name [★] — description *why recommended*`

## TodoWrite

Give todos friendly, context-specific descriptions instead of generic phase names. The description should tell the user what's actually happening.

**Prefer**:

```text
- Prep auth system requirements (in_progress)
- Explore authentication approaches (pending)
- Clarify platform and fallback needs (pending)
- Deliver implementation plan (pending)
```

**Avoid**:

```text
- Gather Context (in_progress)
- Synthesize Requirements (pending)
- Provide Deliverables (pending)
```