# Argument Handling Reference

Complete guide to handling arguments in Claude Code slash commands.

## Overview

Commands can accept arguments from users and use them in the prompt content.

```
/fix-issue 123 high
         |   |
         $1  $2
```

---

## Syntax

### Positional Arguments (`$1`, `$2`, `$3`, ...)

Access individual arguments by position:

```markdown
Process file $1 with config $2 and output to $3
```

**Usage**:

```
/process data.csv config.json output.txt
```

**Result**:

```
Process file data.csv with config config.json and output to output.txt
```

### All Arguments (`$ARGUMENTS`)

Access all arguments as a single string:

```markdown
Fix the following issues: $ARGUMENTS
```

**Usage**:

```
/fix memory leak in auth module slow query in search
```

**Result**:

```
Fix the following issues: memory leak in auth module slow query in search
```

---

## Parsing Rules

### Whitespace Separation

Arguments are separated by whitespace:

```
/cmd foo bar baz
     |   |   |
     $1  $2  $3
```

### Quoted Strings

Preserve spaces with quotes:

```
/cmd "foo bar" baz
     |         |
     $1        $2
     (foo bar)  (baz)
```

### Missing Arguments

Missing arguments resolve to empty string:

```
/deploy staging
        |       |
        $1      $2
     (staging) ("")
```

---

## Patterns

### Required Arguments

Use `<brackets>` in `argument-hint`:

```yaml
---
description: Create feature branch
argument-hint: <branch-name>
---

Create branch: feature/$1
```

### Optional Arguments

Use `[brackets]` in `argument-hint`:

```yaml
---
description: Deploy to environment
argument-hint: <environment> [--skip-tests]
---

Deploy to $1
Options: $2
```

### Default Values

Handle defaults in command content:

```markdown
---
description: Deploy (defaults to staging)
argument-hint: [environment]
---

# Deployment

Target: ${1:-staging}

Deploy to ${1:-staging} environment.
If no environment specified, staging is used.
```

**Note**: This is contextual interpretation, not shell expansion.

### Multiple Arguments

```yaml
---
description: Compare two files
argument-hint: <file1> <file2>
---

Compare these files:
- First: $1
- Second: $2

Provide detailed comparison.
```

### Variadic Arguments

Use `$ARGUMENTS` for any number:

```yaml
---
description: Review multiple files
argument-hint: <files...>
---

Review these files: $ARGUMENTS

For each file, check:
1. Code quality
2. Security issues
3. Performance
```

**Usage**: `/review src/a.ts src/b.ts src/c.ts`

---

## Combining with Features

### Arguments + File References

Include file contents using argument value:

```yaml
---
description: Explain a file
argument-hint: <file-path>
---

# File Analysis

**File**: @$1

Provide detailed explanation of this file.
```

**Usage**: `/explain src/auth/login.ts`

### Arguments + Bash Execution

Use arguments in shell commands:

```yaml
---
description: Show git history for file
argument-hint: <file-path>
---

## Git History

!`git log --oneline -10 -- $1`

## Recent Changes

!`git diff HEAD~5 -- $1`
```

**Usage**: `/history src/main.ts`

### Arguments in Conditional Logic

```yaml
---
description: Deploy to environment
argument-hint: <environment>
---

# Deployment

Target: $1

## Validation
!`case "$1" in
  production)
    echo "PRODUCTION - requires approval"
    ;;
  staging)
    echo "Staging - auto-approved"
    ;;
  *)
    echo "Unknown environment: $1"
    ;;
esac`

Based on validation, proceed appropriately.
```

---

## Validation

### Check Required Arguments

```markdown
## Validation

Environment: $1

**First**, verify the environment argument is provided and valid.
If missing or invalid, explain the error and valid options.

**Valid environments**: staging, production
```

### Validate Argument Format

```markdown
## Issue Validation

Issue number: $1

Verify issue #$1:
- Must be a number
- Must exist in the repository
- Must not be closed

!`gh issue view $1 --json state,title 2>&1 || echo "Issue not found"`
```

---

## Edge Cases

### Empty Arguments

```markdown
# Handler for missing arguments

Target: $1

If no target specified above, prompt user for required information.
```

### Quoted Arguments with Spaces

```
/search "error message with spaces"
```

`$1` = `error message with spaces` (quotes stripped)

### Special Characters

Arguments may contain special characters:

```
/fix "issue: TypeError"
```

`$1` = `issue: TypeError`

### Mixed Positional and ARGUMENTS

Use both when needed:

```yaml
---
description: Run command on files
argument-hint: <command> <files...>
---

Command: $1
Files: $ARGUMENTS

# Note: $ARGUMENTS includes ALL arguments including $1
# For just remaining args, parse manually:

Run $1 on the following files (everything after first argument).
```

---

## Best Practices

1. **Document expected arguments** in command content
2. **Validate early** before proceeding
3. **Provide defaults** for optional arguments
4. **Quote in bash** when arguments might have spaces
5. **Handle missing arguments** gracefully

```yaml
---
description: Complete workflow
argument-hint: <branch-name> [--skip-tests]
---

# Workflow

Branch: $1
Skip tests: $2

## Validation

1. Verify branch name provided (required)
2. Check if branch exists
3. Validate optional flags

If validation fails, explain what's missing.
```
