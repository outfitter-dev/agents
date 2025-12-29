---
description: [YOUR_DESCRIPTION] (e.g., "Create a git commit from staged changes")
allowed-tools: [YOUR_ALLOWED_TOOLS] (e.g., "Bash(git *)")
---

# [YOUR_COMMAND_NAME]

## Context

Current branch: !`git branch --show-current`

Recent commits: !`git log --oneline -5`

[YOUR_BASH_COMMANDS]
Examples:
- Git diff: !`git diff --staged`
- Git status: !`git status`
- File listing: !`ls -la src/`
- Test results: !`bun test`
- Environment info: !`node --version`

## Task

[YOUR_INSTRUCTIONS_USING_THE_BASH_OUTPUT_ABOVE]

Example:
Based on the staged changes shown above, create a single commit with:
1. Clear, concise commit message (max 50 chars)
2. Detailed body explaining the changes
3. Reference any related issues

## Notes

- The `!` prefix executes bash commands before the prompt runs
- Output is captured and included in the prompt context
- Commands producing >15k chars are truncated (adjust with SLASH_COMMAND_TOOL_CHAR_BUDGET)
- Use allowed-tools to restrict which tools Claude can use
