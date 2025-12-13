---
description: Analyze conversation to identify and capture reusable patterns as skills, commands, agents, or hooks
argument-hint: [optional: pattern to focus on, or omit to scan conversation]
---

# Patternify

Transform productive workflows, tool orchestrations, and decision heuristics into reusable Claude Code components.

## Pattern Hint

$ARGUMENTS

## How It Works

1. **Analyze** — Scan conversation for repeatable patterns
2. **Classify** — Determine pattern type (workflow, orchestration, heuristic)
3. **Map** — Choose component type (skill, command, agent, hook)
4. **Specify** — Refine pattern with clarifying questions
5. **Generate** — Create component files

## The Process

### Phase 1: Pattern Detection

If `$ARGUMENTS` provided, focus analysis on that hint. Otherwise, scan for all pattern types.

Look for:
- Multi-step sequences with defined phases (workflows)
- Tool coordination achieving complex goals (orchestration)
- Decision rules with contextual exceptions (heuristics)

### Phase 2: Classification

**Pattern Type**:
- Workflow: Multi-step process with phases
- Orchestration: Tool coordination
- Heuristic: Decision rule with exceptions

**Component Type** (from pattern type):
```text
Is it a multi-step process?
├─ Yes → Requires judgment? → SKILL (not fully automatable)
│        Fully automatable? → COMMAND (scripted)
└─ No → Event-triggered? → HOOK
         Requires expertise? → AGENT
         User-initiated? → COMMAND
```

### Phase 3: Specification

Use pathfinding to refine understanding:
- What triggers this pattern?
- What are the key steps?
- What's the expected output?
- Edge cases or variations?
- Prerequisites or context needed?

Reach confidence level 4+ before generating.

### Phase 4: Location

Choose where to create:
- **Plugin**: `{plugin}/skills/{name}/` — shareable via marketplace
- **Project**: `.claude/skills/{name}/` — team-shared
- **Personal**: `~/.claude/skills/{name}/` — global personal toolkit

### Phase 5: Generation

Generate appropriate files:

```text
Skill:    {location}/skills/{name}/SKILL.md + references/
Command:  {location}/commands/{name}.md
Agent:    {location}/agents/{name}.md
Hook:     {location}/hooks/{name}.sh + hooks.json
```

## Quality Criteria

Before generating, validate:
- **Specific**: Clear trigger and scope
- **Repeatable**: Works across contexts
- **Valuable**: Worth the overhead (saves >5 min)
- **Documented**: Others can understand
- **Scoped**: Single responsibility

Skip if: <3 occurrences, context-dependent, simpler inline.

---

Load the patternify skill for the complete methodology, pattern type details, and component mapping decision tree.

Begin by analyzing conversation for repeatable patterns. If hint provided, focus on that area; otherwise scan broadly.
