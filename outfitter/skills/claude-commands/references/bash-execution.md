# Bash Execution Reference

Complete guide to executing shell commands within Claude Code slash commands.

## Overview

The `!` prefix executes bash commands and includes their output in the command context before Claude processes it.

```markdown
Current branch: !`git branch --show-current`
```

---

## Syntax

### Basic Execution

```markdown
!`command here`
```

The command runs, and output replaces the `!`backtick block.

### Examples

```markdown
## Git Context
Branch: !`git branch --show-current`
Status: !`git status --short`
User: !`git config user.email`
```

**Output** (example):

```markdown
## Git Context
Branch: main
Status: M  src/app.ts
?? new-file.ts
User: developer@example.com
```

---

## Command Types

### Simple Commands

```markdown
Current directory: !`pwd`
Node version: !`node --version`
Current user: !`whoami`
Date: !`date +%Y-%m-%d`
```

### Pipelines

```markdown
Recent authors:
!`git log --format='%an' -20 | sort | uniq -c | sort -rn`

TypeScript files:
!`find src -name '*.ts' | wc -l`

Large files:
!`find . -type f -size +1M | head -10`
```

### Complex Commands

```markdown
Test results:
!`bun test --reporter=json 2>&1 | jq '.summary'`

Open PRs:
!`gh pr list --limit 5 --json number,title,author | jq '.[] | "\(.number): \(.title) by \(.author.login)"'`

Code stats:
!`git diff --stat HEAD~10..HEAD | tail -3`
```

### Multi-line Commands

```markdown
Environment check:
!`echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "bun: $(bun --version 2>/dev/null || echo 'not installed')"`
```

---

## Output Handling

### Character Budget

**Default limit**: 15,000 characters per command

**Configure via environment variable**:

```bash
export SLASH_COMMAND_TOOL_CHAR_BUDGET=30000
```

**Exceeding budget**:
- Output truncated with warning
- Command still executes
- Consider limiting output in command

### Limiting Output

```markdown
# Limit lines
Recent commits: !`git log --oneline -10`

# Truncate with head
Large output: !`cat big-file.txt | head -50`

# Filter relevant lines
Errors only: !`bun test 2>&1 | grep -E "FAIL|Error"`

# Summary instead of full
Stats only: !`git diff --stat | tail -1`
```

### Error Handling

**Stderr is captured**:

```markdown
Result: !`some-command 2>&1`
```

**Conditional execution**:

```markdown
Status: !`git status 2>&1 || echo "Not a git repository"`

File check: !`[ -f config.json ] && cat config.json || echo "No config found"`
```

**Exit codes**:

```markdown
Test result:
!`bun test && echo "All tests passed" || echo "Tests failed"`
```

---

## Patterns

### Git Workflows

```markdown
## Repository State

Branch: !`git branch --show-current`
Commits ahead: !`git rev-list --count origin/main..HEAD`
Last commit: !`git log -1 --format='%h %s (%ar)'`

## Changes

Staged: !`git diff --staged --stat`
Unstaged: !`git diff --stat`
Untracked: !`git ls-files --others --exclude-standard`
```

### Project Analysis

```markdown
## Project Structure

!`tree -L 2 -I 'node_modules|.git' 2>/dev/null || find . -maxdepth 2 -type d | head -20`

## Dependencies

!`cat package.json | jq '.dependencies | keys | length'` dependencies
!`cat package.json | jq '.devDependencies | keys | length'` dev dependencies

## Scripts

!`cat package.json | jq -r '.scripts | to_entries[] | "- \(.key): \(.value)"'`
```

### GitHub Integration

```markdown
## Issue Details

!`gh issue view $1 --json title,body,labels,assignees | jq -r '
  "Title: \(.title)\n" +
  "Labels: \(.labels | map(.name) | join(", "))\n" +
  "Assignees: \(.assignees | map(.login) | join(", "))\n\n" +
  "Body:\n\(.body)"
'`

## Recent PRs

!`gh pr list --limit 5 --json number,title,state | jq -r '.[] | "#\(.number) [\(.state)] \(.title)"'`
```

### Environment Validation

```markdown
## Prerequisites

Node: !`node --version 2>&1 || echo "NOT INSTALLED"`
Docker: !`docker --version 2>&1 || echo "NOT INSTALLED"`
kubectl: !`kubectl version --client --short 2>&1 || echo "NOT INSTALLED"`

## Configuration

AWS: !`aws sts get-caller-identity --query Account 2>&1 || echo "Not configured"`
```

---

## Arguments in Bash

Use command arguments in shell commands:

```markdown
---
argument-hint: <file-path>
---

## File Info

Path: $1
Size: !`ls -lh "$1" | awk '{print $5}'`
Lines: !`wc -l < "$1"`
Type: !`file "$1"`

## Content Preview

!`head -20 "$1"`
```

**Important**: Quote arguments to handle spaces:

```markdown
!`cat "$1"`      # Correct
!`cat $1`        # Breaks with spaces in path
```

---

## Conditional Logic

### If/Else

```markdown
## Environment Check

!`if [ "$1" = "production" ]; then
  echo "WARNING: Production deployment"
  echo "Requires additional approval"
else
  echo "Environment: $1"
  echo "Ready to proceed"
fi`
```

### Case Statements

```markdown
## Action Selection

!`case "$1" in
  deploy)
    echo "Deploying..."
    ;;
  rollback)
    echo "Rolling back..."
    ;;
  status)
    echo "Checking status..."
    ;;
  *)
    echo "Unknown action: $1"
    echo "Valid: deploy, rollback, status"
    ;;
esac`
```

---

## Security Considerations

### Avoid Command Injection

```markdown
# Dangerous - user input directly in command
!`cat $1`

# Safer - validate input first
!`[[ "$1" =~ ^[a-zA-Z0-9_/-]+\.ts$ ]] && cat "$1" || echo "Invalid file path"`
```

### Read-Only Commands

Use `allowed-tools` to restrict capabilities:

```yaml
---
allowed-tools: Bash(git show:*), Bash(git diff:*), Bash(git log:*), Read
---
```

### Limit Destructive Operations

```yaml
---
description: Safe code review
allowed-tools: Read, Grep, Glob
---

# No bash execution - read-only review
```

---

## Common Errors

### Missing Backticks

```markdown
# Wrong
!git status

# Correct
!`git status`
```

### Broken Quotes

```markdown
# Wrong (unbalanced quotes)
!`echo "Hello`

# Correct
!`echo "Hello"`
```

### Unsafe Variable Expansion

```markdown
# Wrong (no quotes)
!`cat $1`

# Correct (quoted)
!`cat "$1"`
```

### Exceeding Output Limit

```markdown
# Wrong (huge output)
!`cat very-large-file.log`

# Correct (limited)
!`tail -100 very-large-file.log`
```

---

## Best Practices

1. **Test commands in terminal first**
2. **Quote all variables** for safety
3. **Limit output** to relevant portions
4. **Handle errors** with `2>&1` or `||`
5. **Use `allowed-tools`** to restrict access
6. **Validate arguments** before using in commands
7. **Provide context** about what commands do
