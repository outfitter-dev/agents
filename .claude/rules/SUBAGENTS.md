# Subagent Patterns

## Frontmatter

```yaml
---
name: agent-name
version: 1.0.0
description: |
  One-line purpose. Second line expands.

  <example>
  Context: When this applies
  user: "User message"
  assistant: "Response explaining agent delegation"
  </example>
---
```

3-4 examples covering: typical use, edge case, verb triggers.

## Core Sections

```markdown
# {Agent Name} Agent

One paragraph identity statement.

## Core Identity

**Role**: What this agent does
**Scope**: Boundaries of responsibility
**Philosophy**: Guiding principle

## Skill Loading Hierarchy

1. User preferences (CLAUDE.md, rules/) — ALWAYS override
2. Project context (existing patterns)
3. Skill defaults as fallback

## Available Skills

List skills agent can load with:
- **When to load**: trigger conditions
- **What it provides**: capability
- **Output format**: expected deliverable

## Routing / Decision Tree

```text
User asks about X → Load skill Y
User wants to Z → Load skill W
```

## Responsibilities

Numbered steps or categorized duties.

## Quality Checklist

Verification before delivery.

## Communication

Starting/during/completing patterns.

## Edge Cases

How to handle ambiguity, conflicts, missing context.
```

## Design Principles

**Generalist over specialist**: Few agents (5-7) loading many skills
**Router pattern**: Agents detect task type, load appropriate skill
**Skill holds methodology**: Agent orchestrates, skill executes
**User prefs win**: Hierarchy always checked before skill defaults

## Our Agents

| Agent | Verbs | Loads |
|-------|-------|-------|
| developer | build, fix, implement, refactor | tdd, type-safety, debugging |
| reviewer | review, critique, check, audit | code-review, expertise-* |
| analyst | investigate, research, explore | research-and-report, pathfinding, patternify |
| specialist | deploy, configure, CI/CD | domain-specific skills |
| tester | test, validate, verify, prove | scenario-testing, tdd |

## Anti-Patterns

- Embedding methodology in agent (put in skill instead)
- One agent per skill (use generalist + dynamic loading)
- Skipping user preference check
- Hardcoding tool/model constraints (inherit instead)
