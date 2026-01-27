# Migration Overview

**Project:** {{PROJECT_NAME}}
**Started:** {{DATE}}
**Last Updated:** {{DATE}}

## Status Dashboard

| Stage | Status | Progress | Blocked By |
|-------|--------|----------|------------|
| 1. Foundation | ⬜ Not Started | 0/4 | — |
| 2. Handlers | ⬜ Not Started | 0/{{HANDLER_COUNT}} | Foundation |
| 3. Errors | ⬜ Not Started | 0/{{ERROR_CLASS_COUNT}} | Handlers |
| 4. Paths | ⬜ Not Started | 0/{{PATH_COUNT}} | — |
| 5. Adapters | ⬜ Not Started | 0/{{ADAPTER_COUNT}} | Handlers |
| 6. Documents | ⬜ Not Started | 0/{{DOC_COUNT}} | All |
| 99. Unknowns | ⬜ Review | 0/{{UNKNOWN_COUNT}} | — |

**Status Key:** ⬜ Not Started · 🟡 In Progress · ✅ Complete · 🔴 Blocked · ⏭️ Skipped

## Stage Dependencies

```
┌─────────────┐
│ Foundation  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Handlers   │────▶│  Adapters   │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   Errors    │
└─────────────┘

┌─────────────┐
│   Paths     │ (independent)
└─────────────┘

┌─────────────┐
│  Documents  │ (after all stages)
└─────────────┘

┌─────────────┐
│  Unknowns   │ (review anytime)
└─────────────┘
```

## Recommended Order

1. **Foundation** — Must be first (context, logger)
2. **Paths** — Can run parallel with Handlers
3. **Handlers** — Core conversion work
4. **Errors** — After handlers identify error cases
5. **Adapters** — After handlers are converted
6. **Unknowns** — Review throughout, resolve before Documents
7. **Documents** — Last, after code is stable

## Progress Log

| Date | Stage | Work Done | Notes |
|------|-------|-----------|-------|
| {{DATE}} | — | Generated migration plan | Initial scan |

## Decisions

| Decision | Rationale | Date |
|----------|-----------|------|

## Blockers

| Blocker | Stage | Status | Resolution |
|---------|-------|--------|------------|

## Completion Criteria

- [ ] All handlers return `Result<T, E>`
- [ ] No `throw` statements in application code
- [ ] No `console.log` in production code
- [ ] All paths use XDG conventions
- [ ] All user paths validated with `securePath()`
- [ ] CLI uses `output()` and `exitWithError()`
- [ ] Documentation reflects new patterns
- [ ] All unknowns resolved or documented
- [ ] Tests updated and passing
