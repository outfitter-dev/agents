# Stage 3: Errors

**Status:** ⬜ Not Started
**Blocked By:** Handlers
**Unlocks:** Documents

## Objective

Replace custom error classes with Outfitter error taxonomy.

## Error Taxonomy Reference

| Category | Class | Exit | HTTP | Use For |
|----------|-------|------|------|---------|
| `validation` | `ValidationError` | 1 | 400 | Invalid input, schema failures |
| `not_found` | `NotFoundError` | 2 | 404 | Resource doesn't exist |
| `conflict` | `ConflictError` | 3 | 409 | Already exists, version mismatch |
| `permission` | `PermissionError` | 4 | 403 | Forbidden action |
| `timeout` | `TimeoutError` | 5 | 504 | Operation took too long |
| `rate_limit` | `RateLimitError` | 6 | 429 | Too many requests |
| `network` | `NetworkError` | 7 | 503 | Connection failures |
| `internal` | `InternalError` | 8 | 500 | Unexpected errors, bugs |
| `auth` | `AuthError` | 9 | 401 | Authentication required |
| `cancelled` | `CancelledError` | 130 | 499 | User interrupted |

## Error Classes to Migrate

{{#each ERROR_CLASSES}}
### {{this.name}}

- **File:** `{{this.file}}:{{this.line}}`
- **Usages:** {{this.usageCount}}
- **Suggested Mapping:** `{{this.suggestedMapping}}`

#### Migration

- [ ] Identify all usages of `{{this.name}}`
- [ ] Replace with `{{this.suggestedMapping}}`
- [ ] Update error metadata/details
- [ ] Remove original class definition
- [ ] Update tests

```typescript
// Before
throw new {{this.name}}({{this.exampleArgs}});

// After
return Result.err(new {{this.suggestedMapping}}({{this.newArgs}}));
```

---

{{/each}}

## Unmapped Errors

Errors that don't fit standard taxonomy:

{{#each UNMAPPED_ERRORS}}
- [ ] `{{this.name}}` — {{this.reason}}
{{/each}}

**Options for unmapped errors:**
1. Use `InternalError` with descriptive message
2. Create domain-specific error extending `OutfitterError`
3. Map to closest category with metadata

## Completion Checklist

- [ ] All custom errors mapped to taxonomy
- [ ] Original error classes removed
- [ ] Error messages include structured metadata
- [ ] Exit codes verified correct
- [ ] Tests updated

## Notes

{{ERROR_NOTES}}
