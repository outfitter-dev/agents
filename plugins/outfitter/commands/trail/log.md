---
description: Create a timestamped log note
argument-hint: <slug>
allowed-tools: Read Edit
---

# Log

Creating log note with slug: **$ARGUMENTS**

!`bun ${CLAUDE_PLUGIN_ROOT}/skills/trails/scripts/log.ts --slug "$ARGUMENTS" --session "${CLAUDE_SESSION_ID}"`

Read the created log file. This is a freeform note for capturing:

- Research findings
- Technical discoveries
- Meeting notes
- Ideas and observations

Add relevant content and tags as needed.
