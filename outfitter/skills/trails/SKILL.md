---
name: trails
description: This skill should be used when creating session handoffs, logging research findings, or reading previous trail notes. Triggers include "handoff", "session continuity", "log note", "trail notes", or when ending a session.
metadata:
  version: "1.0.0"
---

# Trail

Session continuity through structured handoffs and freeform logs.

<when_to_use>

- End of session — create handoff for continuity
- During research — capture findings in logs
- Subagent work — preserve context with parent session linking
- Any time you need to leave a trail for future sessions

</when_to_use>

## Commands

| Command | Purpose |
|---------|---------|
| `/trail:handoff` | Create structured handoff note for session continuity |
| `/trail:log <slug>` | Create freeform timestamped log note |
| `/trail:read [options]` | Read recent trail notes |

## Handoff Format

Handoffs are the atomic unit of session continuity. Create one at the end of each session.

```markdown
# Handoff

> YYYY-MM-DD HH:MM · Session `<short-id>`

## Done

- Completed item 1
- Completed item 2

## State

Current state of work:
- What's in progress
- What's blocked
- Key decisions made

## Next

- [ ] First priority task
- [ ] Second priority task
- [ ] Lower priority item
```

### Handoff Principles

- **Done**: Past tense, concrete accomplishments
- **State**: Present tense, current situation
- **Next**: Checkboxes for actionable items
- **Scannable**: Someone should grasp the session in 30 seconds
- **Honest**: Note blockers, uncertainties, and open questions

## Log Format

Logs are freeform notes for capturing anything worth preserving.

```markdown
# Title Derived From Slug

> YYYY-MM-DD HH:MM · Session `<short-id>`

[Freeform content - research findings, technical discoveries,
meeting notes, ideas, observations, etc.]
```

### Log Use Cases

- Research findings and documentation
- Technical discoveries and gotchas
- Meeting notes and decisions
- Ideas and observations
- Debugging sessions and root causes

### Log Principles

- **Descriptive slug**: Will become the title if none provided
- **Tag liberally**: Use frontmatter tags for discoverability
- **Link context**: Reference issues, PRs, or other notes
- **Future-proof**: Write for someone (including future you) with no context

## Subagent Context

When working as a subagent, pass the parent session ID to group related notes:

```bash
# Handoff with parent context
bun ${CLAUDE_PLUGIN_ROOT}/skills/trails/scripts/handoff.ts \
  --session "$CHILD_SESSION" \
  --parent "$PARENT_SESSION"

# Log with parent context
bun ${CLAUDE_PLUGIN_ROOT}/skills/trails/scripts/log.ts \
  --slug "api-findings" \
  --session "$CHILD_SESSION" \
  --parent "$PARENT_SESSION"
```

This creates notes in a subdirectory: `.trail/notes/YYYY-MM-DD/<parent-session>/`

## Reading Notes

```bash
# Today's notes (all types)
/trail:read

# Just handoffs
/trail:read --type handoff

# Just logs
/trail:read --type log

# Last 3 days
/trail:read --days 3

# Limit output
/trail:read --lines 100
```

## Directory Structure

```
.trail/
├── notes/
│   └── YYYY-MM-DD/
│       ├── handoff-YYYYMMDDhhmm-<session>.md
│       ├── YYYYMMDDhhmm-<slug>.md
│       └── <parent-session>/        # Subagent notes
│           ├── handoff-YYYYMMDDhhmm-<child>.md
│           └── YYYYMMDDhhmm-<slug>.md
├── plans/                           # Implementation plans
└── artifacts/                       # Research, ADRs, etc.
```

## Filename Convention

Pattern: `[prefix-]YYYYMMDDhhmm[-suffix].md`

| Type | Prefix | Suffix | Example |
|------|--------|--------|---------|
| Handoff | `handoff` | session ID | `handoff-202601221430-f4b8aa3a.md` |
| Log | none | slug | `202601221430-api-research.md` |

The timestamp (`YYYYMMDDhhmm`) is the anchor — files remain sortable and portable even if moved.

## Session Start Ritual

When resuming work:

1. Run `/trail:read --type handoff` to see recent handoffs
2. Check the **Next** section for pending tasks
3. Continue where the previous session left off

## Session End Ritual

Before ending a session:

1. Run `/trail:handoff` to create a handoff note
2. Fill in **Done**, **State**, and **Next** sections
3. Be specific enough that a fresh session can continue seamlessly
