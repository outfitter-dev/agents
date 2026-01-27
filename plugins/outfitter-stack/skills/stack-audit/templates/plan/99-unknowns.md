# Stage 99: Unknowns

**Status:** ⬜ Review Required
**Blocked By:** None
**Unlocks:** None (review throughout migration)

## Objective

Track items the scanner couldn't categorize or that need human judgment.

## Review Priority

| Priority | Meaning |
|----------|---------|
| 🔴 High | Blocks other work, needs immediate decision |
| 🟡 Medium | Should resolve before Documents stage |
| 🟢 Low | Can defer or skip with documentation |

## Unknowns

{{#each UNKNOWNS}}
### {{this.id}}: {{this.title}}

- **File:** `{{this.file}}:{{this.line}}`
- **Priority:** {{this.priority}}
- **Category:** {{this.category}}

#### Context

```typescript
{{this.code}}
```

#### Why Unknown

{{this.reason}}

#### Options

{{#each this.options}}
{{@index}}. {{this}}
{{/each}}

#### Decision

- [ ] Reviewed
- [ ] Decision: _____________
- [ ] Implemented

---

{{/each}}

## Common Unknown Categories

### Third-Party Libraries That Throw

Libraries that throw exceptions need wrapper decisions:

```typescript
// Option 1: Wrap at call site
const result = await wrapAsync(() => thirdPartyLib.doThing());

// Option 2: Create typed wrapper
const safeDoThing = wrapThirdParty(thirdPartyLib.doThing);
```

### Complex Try/Catch Blocks

Nested or multi-catch blocks that can't be auto-converted:

```typescript
// May need manual restructuring
try {
  await step1();
  await step2();
} catch (e) {
  if (e instanceof TypeA) { ... }
  else if (e instanceof TypeB) { ... }
  else { throw e; }
}
```

### Async Patterns

Unusual async patterns (Promise.race, Promise.allSettled with throws):

```typescript
// May need Result-aware alternatives
const results = await Promise.all(items.map(processItem));
```

### Domain-Specific Errors

Errors that don't map cleanly to taxonomy:

- Consider if they're really `ValidationError` with metadata
- Consider if they're `InternalError` with descriptive message
- Consider creating domain error extending `OutfitterError`

## Resolution Log

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|

## Stack Feedback

Issues discovered that should be reported to outfitter-dev/outfitter:

{{#each STACK_FEEDBACK}}
- [ ] {{this.title}} — {{this.type}}
{{/each}}

Use `outfitter-stack:stack-feedback` skill to create GitHub issues.

## Completion Checklist

- [ ] All unknowns reviewed
- [ ] Decisions documented
- [ ] High-priority items resolved
- [ ] Stack feedback reported
- [ ] Remaining items documented for future

## Notes

{{UNKNOWN_NOTES}}
