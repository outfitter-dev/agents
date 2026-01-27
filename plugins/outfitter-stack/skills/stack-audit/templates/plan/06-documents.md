# Stage 6: Documents

**Status:** ⬜ Not Started
**Blocked By:** All other stages
**Unlocks:** None (final stage)

## Objective

Update documentation to reflect new patterns and APIs.

## Files to Update

{{#each DOC_FILES}}
### {{this.file}}

- **Type:** {{this.type}}
- **Issues:** {{this.issues}}

#### Updates Needed

{{#each this.updates}}
- [ ] {{this}}
{{/each}}

---

{{/each}}

## README Updates

- [ ] Update installation instructions (add @outfitter/* packages)
- [ ] Update API examples (Result types, not exceptions)
- [ ] Update error handling section
- [ ] Add migration notes for consumers (if library)

### Example API Section

```markdown
## Usage

\`\`\`typescript
import { getUser } from "mylib";
import { createContext } from "@outfitter/contracts";

const ctx = createContext();
const result = await getUser({ id: "123" }, ctx);

if (result.isOk()) {
  console.log(result.value);
} else {
  console.error(result.error.message);
}
\`\`\`
```

## TSDoc/JSDoc Updates

Update function documentation to reflect Result return types:

```typescript
/**
 * Fetches a user by ID.
 *
 * @param input - The input containing the user ID
 * @param ctx - Handler context
 * @returns Result with User on success, NotFoundError if user doesn't exist
 *
 * @example
 * const result = await getUser({ id: "123" }, ctx);
 * if (result.isOk()) {
 *   console.log(result.value.name);
 * }
 */
```

## CHANGELOG Entry

```markdown
## [X.Y.Z] - {{DATE}}

### Changed

- **BREAKING**: All handlers now return `Result<T, E>` instead of throwing
- **BREAKING**: Error types use Outfitter taxonomy
- Paths now use XDG conventions

### Added

- Structured logging with `@outfitter/logging`
- Input validation with Zod schemas

### Migration

See [MIGRATION.md](./MIGRATION.md) for upgrade guide.
```

## Migration Guide (if library)

- [ ] Create `MIGRATION.md` for consumers
- [ ] Document breaking changes
- [ ] Provide before/after examples
- [ ] List error type mappings

## Inline Comments

Review and update comments that reference old patterns:

- [ ] Remove `// throws XError` comments
- [ ] Update `@throws` JSDoc tags to `@returns Result`
- [ ] Fix examples in code comments

## Completion Checklist

- [ ] README reflects new API patterns
- [ ] TSDoc/JSDoc updated for all public APIs
- [ ] CHANGELOG entry added
- [ ] Migration guide created (if library)
- [ ] Inline comments reviewed
- [ ] Examples compile and work

## Notes

{{DOC_NOTES}}
