---
description: Create a handoff note for session continuity
allowed-tools: Read Edit
---

# Handoff

Creating handoff note for this session.

!`bun ${CLAUDE_PLUGIN_ROOT}/skills/trails/scripts/handoff.ts --session "${CLAUDE_SESSION_ID}"`

Read the created handoff file and fill in the sections:

- **Done**: What was accomplished this session
- **State**: Current state of work (in progress, blocked, etc.)
- **Next**: What should happen next (use checkboxes)

Keep entries scannable — someone should grasp the session in 30 seconds.
