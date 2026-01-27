---
description: Quick audit of current file or directory for Outfitter Stack compliance
argument-hint: [file or directory]
allowed-tools: Read Grep Glob Bash(rg *)
---

# Stack Audit

Audit the specified file or directory (or current directory if not provided) for @outfitter/* pattern compliance.

## Target

Path: $ARGUMENTS

## Quick Scans

### Thrown Exceptions

!`rg "throw new" --type ts -c ${ARGUMENTS:-.} 2>/dev/null || echo "0 matches"`

### Console Usage

!`rg "console\.(log|error|warn)" --type ts -c ${ARGUMENTS:-.} 2>/dev/null || echo "0 matches"`

### Hardcoded Paths

!`rg "(homedir|~\/\.)" --type ts -c ${ARGUMENTS:-.} 2>/dev/null || echo "0 matches"`

### Custom Error Classes

!`rg "class \w+Error extends Error" --type ts ${ARGUMENTS:-.} 2>/dev/null || echo "No custom errors found"`

## Task

Based on the scan results above, provide a compliance report:

1. **Summary** - PASS, WARNINGS, or FAIL based on issue count
2. **Critical Issues** - Thrown exceptions, unvalidated paths
3. **High Issues** - Console logging, hardcoded paths, custom errors
4. **Recommendations** - Specific fixes for each issue category

Use the `outfitter-stack:stack-review` skill for detailed compliance checklist reference.

## Report Format

```markdown
## Stack Compliance: [target]

**Status**: PASS | WARNINGS | FAIL
**Issues**: X critical, Y high

### Critical
- [file:line count] Issue description

### High
- [file:line count] Issue description

### Fix Priority
1. First priority fix
2. Second priority fix
```
