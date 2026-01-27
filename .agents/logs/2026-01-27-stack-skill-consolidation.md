# Stack Plugin Skill Consolidation

**Date:** 2026-01-27
**Scope:** `plugins/stack/`

## Summary

Consolidated 6 reference skills into 1 `outfitter-stack` skill with 8 references. Updated all workflow skills and agents to reference the new structure.

**Before:** 13 skills
**After:** 8 skills

## Rationale

The stack plugin had grown to include many granular reference skills for individual packages (`outfitter-cli`, `outfitter-mcp`, `outfitter-logging`, `outfitter-testing`, `outfitter-daemon`) plus the core `stack-patterns` skill. This made the skill table unwieldy and scattered related content across multiple entry points.

Consolidating into a single `outfitter-stack` skill with references provides:
- Single entry point for all Stack pattern documentation
- Progressive disclosure via references (core patterns first, deep dives on demand)
- Cleaner skill table in README
- Unified trigger keywords for discovery

## Changes

### Created

```
plugins/stack/skills/outfitter-stack/
├── SKILL.md                    # Core patterns (from stack-patterns)
└── references/
    ├── handler.md              # Handler contract details
    ├── errors.md               # Error taxonomy details
    ├── results.md              # Result utilities
    ├── cli.md                  # @outfitter/cli deep dive
    ├── mcp.md                  # @outfitter/mcp deep dive
    ├── logging.md              # @outfitter/logging deep dive
    ├── testing.md              # @outfitter/testing deep dive
    └── daemon.md               # @outfitter/daemon deep dive
```

### Deleted

- `plugins/stack/skills/stack-patterns/`
- `plugins/stack/skills/outfitter-cli/`
- `plugins/stack/skills/outfitter-mcp/`
- `plugins/stack/skills/outfitter-logging/`
- `plugins/stack/skills/outfitter-testing/`
- `plugins/stack/skills/outfitter-daemon/`

### Updated

| File | Changes |
|------|---------|
| `stack-implement/SKILL.md` | Related Skills: `stack:stack-patterns` → `stack:outfitter-stack` |
| `stack-architecture/SKILL.md` | Related Skills: `stack:stack-patterns` → `stack:outfitter-stack` |
| `stack-review/SKILL.md` | Related Skills: `stack:stack-patterns` → `stack:outfitter-stack` |
| `stack-debug/SKILL.md` | Related Skills: `stack:stack-patterns` → `stack:outfitter-stack` |
| `stack-adoption/SKILL.md` | Phase refs + Related Skills updated |
| `README.md` | Skills table rewritten, agent renamed |
| `agents/stacker.md` | Skill routing table updated, skills list cleaned |

### Agent Rename

The agent was renamed from `outfitter` to `stacker`:
- `agents/outfitter.md` → `agents/stacker.md`
- Frontmatter `agent:` field updated in all workflow skills

## Final Structure

```
plugins/stack/skills/
├── outfitter-stack/          # Reference skill (consolidated)
├── stack-adoption/           # Workflow: migrate to stack
├── stack-architecture/       # Workflow: design handlers
├── stack-debug/              # Workflow: troubleshoot issues
├── stack-feedback/           # Workflow: report issues
├── stack-implement/          # Workflow: TDD implementation
├── stack-review/             # Workflow: compliance audit
└── stack-scaffold/           # Workflow: component templates
```

## Verification

- `rg "stack:outfitter-cli|stack:outfitter-mcp|stack:outfitter-logging|stack:outfitter-testing|stack:outfitter-daemon|stack:stack-patterns"` returns no matches
- `outfitter-stack/` contains SKILL.md + 8 reference files
- All workflow skills updated with correct `agent: stacker` frontmatter
