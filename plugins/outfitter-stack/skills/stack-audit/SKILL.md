---
name: stack-audit
version: 0.1.0
description: Scan codebase for Outfitter Stack adoption candidates. Identifies throw statements, console usage, hardcoded paths, and custom errors. Use when assessing adoption scope or checking readiness.
context: fork
agent: stacker
allowed-tools: Read Grep Glob Bash(rg *) Bash(bun *)
---

# Stack Audit

Scan a codebase to identify Outfitter Stack adoption candidates and generate an audit report.

## Quick Start

**Option 1: Run the scanner** (recommended for large projects)

```bash
bun run plugins/outfitter-stack/skills/stack-audit/scripts/init-audit.ts [project-root]
```

Generates `.outfitter/adopt/` with:
- `audit-report.md` - Scan results and scope
- `plan/` - Stage-by-stage task files

**Option 2: Manual scan** (smaller projects)

Run the audit commands below to understand scope.

## Audit Commands

### Critical Issues - Exceptions

```bash
# Count throw statements
rg "throw (new |[a-zA-Z])" --type ts -c

# List throw locations
rg "throw (new |[a-zA-Z])" --type ts -n

# Count try-catch blocks
rg "(try \{|catch \()" --type ts -c
```

### Console Usage

```bash
# Count console statements
rg "console\.(log|error|warn|debug|info)" --type ts -c

# List console locations
rg "console\.(log|error|warn|debug|info)" --type ts -n
```

### Hardcoded Paths

```bash
# Homedir usage
rg "(homedir\(\)|os\.homedir)" --type ts -c

# Tilde paths
rg "~/\." --type ts -c

# Combined path issues
rg "(homedir|~\/\.)" --type ts -n
```

### Custom Error Classes

```bash
# Find custom error classes
rg "class \w+Error extends Error" --type ts -n

# Count usage of custom errors
rg "new MyCustomError\(" --type ts -c
```

## Generated Structure

```
.outfitter/adopt/
├── audit-report.md           # Scan results, scope, recommendations
└── plan/
    ├── 00-overview.md        # Status dashboard, dependencies
    ├── 01-foundation.md      # Dependencies, context, logger
    ├── 02-handlers.md        # Handler conversions
    ├── 03-errors.md          # Error taxonomy mappings
    ├── 04-paths.md           # XDG path migrations
    ├── 05-adapters.md        # CLI/MCP transport layers
    ├── 06-documents.md       # Documentation updates
    └── 99-unknowns.md        # Items requiring review
```

## Migration Stages

| Stage | Blocked By | Focus |
|-------|------------|-------|
| 1. Foundation | - | Install packages, create context/logger |
| 2. Handlers | Foundation | Convert throw to Result |
| 3. Errors | Handlers | Map to error taxonomy |
| 4. Paths | - | XDG paths, securePath |
| 5. Adapters | Handlers | CLI/MCP wrappers |
| 6. Documents | All | Update docs to reflect patterns |
| 99. Unknowns | - | Review anytime |

## Audit Report Fields

| Field | Description |
|-------|-------------|
| Exceptions | `throw` statements to convert to Result |
| Try/Catch | Error handling blocks to restructure |
| Console | Logging to convert to structured logging |
| Paths | Hardcoded paths to convert to XDG |
| Error Classes | Custom errors to map to taxonomy |
| Handlers | Functions with throws to convert |
| Unknowns | Complex patterns requiring review |

## Error Taxonomy Reference

When mapping errors, use this reference:

| Original | Outfitter | Category |
|----------|-----------|----------|
| `NotFoundError` | `NotFoundError` | `not_found` |
| `InvalidInputError` | `ValidationError` | `validation` |
| `DuplicateError` | `ConflictError` | `conflict` |
| `UnauthorizedError` | `AuthError` | `auth` |
| `ForbiddenError` | `PermissionError` | `permission` |
| Generic `Error` | `InternalError` | `internal` |

## Effort Estimation

| Count | Effort Level |
|-------|--------------|
| 0 | None |
| 1-5 | Low |
| 6-15 | Medium |
| 16+ | High |

## Interpreting Results

### High-Priority Items

- Functions with 3+ throw statements (complex error handling)
- Files with 3+ try-catch blocks (may need restructuring)
- Custom error classes with high usage counts

### Medium-Priority Items

- Isolated throw statements (simple conversions)
- Console logging (straightforward migration)
- Hardcoded paths (mechanical replacement)

### Low-Priority Items

- Documentation updates (can happen last)
- Test file updates (follow handler changes)

## Next Steps After Audit

1. Review `audit-report.md` for accuracy
2. Adjust priorities in `plan/00-overview.md`
3. Begin with Stage 1 (Foundation)
4. Load `outfitter-stack:stack-patterns` for conversion guidance
5. Load `outfitter-stack:stack-templates` for scaffolding

## Constraints

**Always:**
- Run audit before planning adoption
- Review unknowns for complex patterns
- Estimate effort before committing

**Never:**
- Skip the audit phase
- Underestimate try-catch complexity
- Ignore custom error classes

## Related Skills

- `outfitter-stack:stack-patterns` - Target patterns reference
- `outfitter-stack:stack-templates` - Component templates
- `outfitter-stack:stack-review` - Verify compliance
