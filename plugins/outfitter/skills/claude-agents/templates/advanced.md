---
name: { agent-name }
description: |
  Use this agent when { trigger conditions }. Triggers on { keywords }.

  To encourage proactive use, include "PROACTIVELY" or "MUST BE USED" if appropriate.

  <example>
  Context: { typical use case }
  user: "{ user message }"
  assistant: "I'll use the { agent-name } agent to { action }."
  </example>

  <example>
  Context: { edge case or specific trigger }
  user: "{ user message }"
  assistant: "I'll delegate to the { agent-name } agent for { action }."
  </example>

  <example>
  Context: { verb-triggered scenario }
  user: "{ action verb } the { target }"
  assistant: "I'll use the { agent-name } agent to handle this."
  </example>
# Model selection:
#   inherit - use parent's model (recommended default)
#   haiku   - fast/cheap, simple tasks, exploration
#   sonnet  - balanced, standard tasks (default if omitted)
#   opus    - deeper reasoning, higher quality, complex analysis
model: inherit

# Permission mode (optional):
#   default          - standard permission handling
#   acceptEdits      - auto-accept edit operations
#   bypassPermissions - skip permission prompts entirely
#   plan             - planning mode permissions
# permissionMode: default

# Skills to auto-load (subagents do NOT inherit skills from parent):
# skills: skill1, skill2

# Tool restrictions (omit to inherit full access from parent):
# tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
---

# { Agent Name }

{ One paragraph identity statement describing role, expertise, and philosophy. }

## Core Identity

**Role**: { What this agent does }
**Scope**: { Boundaries of responsibility }
**Philosophy**: { Guiding principle }

## Expertise

**Primary:**

- { Core domain expertise 1 }
- { Core domain expertise 2 }

**Secondary:**

- { Supporting expertise 1 }
- { Supporting expertise 2 }

## Process

### Step 1: { Stage Name }

- { Action item }
- { Action item }

### Step 2: { Stage Name }

- { Action item }
- { Action item }

### Step 3: { Stage Name }

- { Action item }
- { Action item }

### Step 4: { Reporting Stage }

- { Output action }
- { Documentation action }

## Output Format

**{ Report/Finding Type }:**

```yaml
{ field }: { description }
{ field }: { description }
status: [pending|complete|failed]
details: [...]
```

**Status indicators:**

- Success: { description }
- Warning: { description }
- Error: { description }

## Constraints

**Always:**

- { Required behavior 1 }
- { Required behavior 2 }

**Never:**

- { Prohibited action 1 }
- { Prohibited action 2 }

## What I Don't Do

- { Out of scope item 1 }
- { Out of scope item 2 }
- { Clarification about boundaries }

## Example Tasks

**Good tasks for me:**

- "{ Example task 1 }"
- "{ Example task 2 }"

**Not ideal for me:**

- "{ Task better suited for another agent }"
- "{ Task outside scope }"
