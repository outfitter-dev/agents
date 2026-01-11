---
name: claude-rules-authoring
version: 1.0.0
description: This skill should be used when creating rule files, organizing conventions, or when ".claude/rules/", "FORMATTING.md", "create rule", or "project conventions" are mentioned.
allowed-tools: Read Write Edit Grep Glob
---

# Claude Rules Authoring

Create reusable instruction files in `.claude/rules/` for project conventions.

## Rules vs CLAUDE.md

| Aspect | CLAUDE.md | .claude/rules/ |
|--------|-----------|----------------|
| Loading | Automatic at session start | On-demand via reference |
| Content | Project setup, key commands | Reusable conventions |
| Size | Concise (~200-500 lines) | Can be detailed |
| Scope | This specific project | Patterns across files |

**Put in CLAUDE.md**: One-off instructions, project-specific commands, key file locations.

**Put in rules/**: Formatting conventions, architecture patterns, workflow guidelines, commit standards.

## File Conventions

### Naming

- **UPPERCASE.md** - All caps with `.md` extension
- **Topic-focused** - One concern per file
- **Kebab-case for multi-word** - `API-PATTERNS.md`, `CODE-REVIEW.md`

**Good**: `FORMATTING.md`, `TESTING.md`, `COMMITS.md`
**Bad**: `formatting.md`, `MyRules.md`, `everything.md`

### Structure

```
.claude/rules/
├── FORMATTING.md      # Code style, output conventions
├── TESTING.md         # Test patterns, coverage requirements
├── COMMITS.md         # Commit message format, PR conventions
├── ARCHITECTURE.md    # Component structure, file organization
└── SECURITY.md        # Security guidelines, auth patterns
```

## Content Structure

Rules files should be scannable and actionable:

```markdown
# Topic Name

Brief description of what this covers.

## Section 1

| Pattern | Example | Notes |
|---------|---------|-------|
| ... | ... | ... |

## Section 2

**Do:**
- Specific guideline

**Don't:**
- Anti-pattern to avoid

## Examples

{ concrete examples }
```

## Referencing Rules

### From CLAUDE.md

Reference rules explicitly - they're not auto-loaded:

```markdown
# CLAUDE.md

## Code Style
Follow `.claude/rules/FORMATTING.md` for all code conventions.

## Testing
See `.claude/rules/TESTING.md` for TDD patterns.
```

### Cross-file References

Use `@` syntax to include content from other files:

```markdown
# .claude/rules/FORMATTING.md

@../../baselayer/shared/rules/FORMATTING.md
```

This keeps rules DRY by pointing to authoritative sources.

## Plugin Shared Rules

Plugins can provide shared rules in `shared/rules/`:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
└── shared/
    └── rules/
        ├── FORMATTING.md
        └── PATTERNS.md
```

Projects reference via relative paths or `@` includes.

## Quick Start

### Create a New Rule

1. Identify the convention scope (formatting, testing, commits, etc.)
2. Create `TOPIC.md` in `.claude/rules/`
3. Write scannable content with tables, do/don't lists
4. Reference from CLAUDE.md

### Validate a Rule

- [ ] Filename is UPPERCASE.md
- [ ] Single focused topic
- [ ] Scannable structure (tables, lists)
- [ ] Referenced from CLAUDE.md
- [ ] No duplicate content with CLAUDE.md

## Anti-Patterns

**Don't:**
- Create rules for one-off instructions (use CLAUDE.md)
- Duplicate content between CLAUDE.md and rules/
- Create catch-all files like `EVERYTHING.md`
- Expect rules to auto-load (they must be referenced)

**Do:**
- Keep each rule file focused on one topic
- Use tables and lists for scannability
- Reference shared rules via `@` when available
- Document why, not just what

## Related Skills

- **claude-code-configuration** - CLAUDE.md and settings.json
- **claude-plugin-development** - Plugin structure including shared/rules/
