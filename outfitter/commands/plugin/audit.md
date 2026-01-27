---
description: Audit plugin and optionally apply auto-fixes
argument-hint: [plugin path]
allowed-tools: Read Write Edit Grep Glob Bash Task Skill
---

# Plugin Audit

$ARGUMENTS

## Steps

1. Delegate by loading the `outfitter:claude-plugin-audit` skill for plugin analysis
2. Review findings and identify auto-fixable issues
3. If auto-fixable issues exist, offer to apply fixes
4. For applied fixes, verify each change
5. Enter Plan mode
6. Present remaining issues that need manual attention with the `AskUserQuestion`

## Workflow

### Stage 1: Audit

Run the plugin audit skill on the target path. If no path provided, use current directory.

Capture:
- Critical issues (blocking)
- Warnings (should fix)
- Info (suggestions)
- Which issues are auto-fixable

### Stage 2: Auto-Fix Decision

If auto-fixable issues found:

```text
Found {N} auto-fixable issues:
- {issue 1}
- {issue 2}

Apply automatic fixes? (will show each change)
```

Use `AskUserQuestion` with options:
1. Apply all auto-fixes
2. Review each fix individually
3. Skip auto-fixes, show manual issues only

### Stage 3: Apply Fixes

For each auto-fix:
1. Show the proposed change
2. Apply the fix
3. Verify the fix worked

Use Tasks to what was fixed vs what remains.

### Stage 4: Follow-Up

Present remaining issues that need manual attention:

```text
## Remaining Issues

### Critical (must fix manually)
- {issue with guidance}

### Warnings (recommended)
- {issue with guidance}

## Next Steps
- {specific action items}
```

## Output

Final summary:

```text
# Plugin Audit Complete

**Plugin**: {name}
**Auto-fixes applied**: {N}
**Remaining issues**: {N} critical, {N} warnings

{next steps or "Plugin is ready for distribution"}
```
