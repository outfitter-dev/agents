# Migration-Specific Feedback

When migrating existing code to Outfitter Stack, you may discover issues that are particularly relevant to the migration process.

## Migration-Specific Categories

| Category | When to Use |
|----------|-------------|
| `migration-pattern` | Common migration scenario lacks guidance |
| `conversion-helper` | Need a utility to convert from legacy pattern |
| `compatibility` | Breaking change or compatibility concern |
| `migration-docs` | Migration documentation gap |

## Migration Context Template

When creating issues discovered during migration, use this context format:

```markdown
## Context

Discovered during migration of **{PROJECT_NAME}** to Outfitter Stack.

**Migration stage:** {Foundation | Handlers | Errors | Paths | Adapters}
**Source pattern:** {What the code looked like before}
**Target pattern:** {What we're trying to achieve}
```

## Common Migration Feedback

### Pattern Gap: Throw to Result

```bash
gh issue create \
  --repo outfitter-dev/outfitter \
  --title "[migration] Guidance needed for X throw pattern" \
  --label "documentation" \
  --label "feedback" \
  --label "adoption" \
  --body "..."
```

### Missing Helper: Error Conversion

```bash
gh issue create \
  --repo outfitter-dev/outfitter \
  --title "[enhancement] Add helper to convert custom errors to taxonomy" \
  --label "enhancement" \
  --label "feedback" \
  --label "adoption" \
  --body "..."
```

### Compatibility Issue

```bash
gh issue create \
  --repo outfitter-dev/outfitter \
  --title "[bug] X doesn't work with common library Y" \
  --label "bug" \
  --label "feedback" \
  --label "adoption" \
  --body "..."
```

## Linking to Adoption Plan

When adopting, track feedback in `.outfitter/adopt/plan/99-unknowns.md`:

```markdown
## Stack Feedback (Migration)

- [ ] #123: Need guidance for async throw patterns — docs
- [ ] #124: Add wrapLegacy helper — enhancement
- [ ] #125: Compatibility with express middleware — bug
```

## After Migration

Once migration is complete, review all feedback issues and:

1. Close any that were resolved by workarounds
2. Add reproduction details now that you have working code
3. Prioritize based on how painful the issue was
