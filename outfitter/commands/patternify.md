---
description: Analyze conversation to identify and capture reusable patterns as skills, commands, agents, or hooks
argument-hint: [optional: pattern to focus on, or omit to scan conversation]
---

# Patternify

Transform productive workflows, tool orchestrations, and decision heuristics into reusable Claude Code components.

## Instructions

- Consider the recent conversation history and any patterns that emerged.
- Specific user instructions should be followed unless they are contradictory to the task at hand. $ARGUMENTS

## Steps

1. **Load** — Use the Skill tool and load the **outfitter:patternify** skill
2. **Consider** — Ultrathink and analyze the conversation, identify candidate patterns, and assess reusability
3. **Dispatch or Execute** — Choose execution path based on available tools:
   - **If Task tool available**: Dispatch the **outfitter:pattern-analyzer** subagent in background mode, passing along the pattern hint (if any) and conversation context summary
   - **If Task tool unavailable**: Execute the pattern analysis methodology directly using the loaded skill
4. **Monitor** — If subagent dispatched, use TaskOutput to retrieve structured JSON findings
5. **Generate** — Based on findings, create the appropriate component files

## Context Handoff (for subagent dispatch)

When dispatching to the pattern-analyzer subagent, include:
- Pattern hint from arguments (if provided)
- Summary of productive workflows from conversation
- Key tool sequences and decision points observed
- User satisfaction signals ("that worked great")

## Pattern Types

- **Workflow**: Multi-step process with phases
- **Orchestration**: Tool coordination toward a goal
- **Heuristic**: Decision rule with exceptions

## Component Mapping

```text
Is it a multi-step process?
├─ Yes → Requires judgment? → SKILL (not fully automatable)
│        Fully automatable? → COMMAND (scripted)
└─ No → Event-triggered? → HOOK
         Requires expertise? → AGENT
         User-initiated? → COMMAND
```

## Output Locations

- **Plugin**: `**/{plugin}/skills/{name}/` — shareable via marketplace
- **Project**: `{CLAUDE_PROJECT_DIR}/.claude/skills/{name}/` — team-shared
- **Personal**: `~/.claude/skills/{name}/` — global personal toolkit

## Quality Criteria

Before generating, validate:
- **Specific**: Clear trigger and scope
- **Repeatable**: Works across contexts
- **Valuable**: Worth the overhead (saves >5 min)
- **Documented**: Others can understand
- **Scoped**: Single responsibility

Skip if: <3 occurrences, context-dependent, simpler inline.
