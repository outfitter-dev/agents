---
description: [YOUR_DESCRIPTION] (e.g., "Fix a specific issue by number")
argument-hint: [YOUR_ARG_HINT] (e.g., "<issue-number>" or "<file1> <file2>")
---

# [YOUR_COMMAND_NAME]

[YOUR_PROMPT_WITH_ARGUMENTS]

## Examples:

### Using $ARGUMENTS (all arguments as single string)

Fix issues: $ARGUMENTS

# Usage: /fix-issues 123 456 789

# $ARGUMENTS = "123 456 789"

### Using $1, $2, $3 (individual arguments)

Review PR #$1 with priority $2 and assign to $3

# Usage: /review-pr 456 high alice

# $1="456", $2="high", $3="alice"

### Combining arguments with file references

Compare @$1 with @$2 and summarize differences

# Usage: /compare src/old.ts src/new.ts

# Will read both files and compare them

## Your implementation:

[REPLACE WITH YOUR COMMAND LOGIC]
