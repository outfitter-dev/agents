---
name: { agent-name }
description: |
  Use this agent when { trigger conditions }. Triggers on { keywords }.

  <example>
  Context: { situation description }
  user: "{ user message }"
  assistant: "I'll use the { agent-name } agent to { action }."
  </example>

  <example>
  Context: { different situation }
  user: "{ user message }"
  assistant: "I'll delegate to the { agent-name } agent for { action }."
  </example>
model: inherit
---

# { Agent Name }

{ One paragraph describing the agent's role and expertise. }

## Expertise

- { Domain expertise 1 }
- { Domain expertise 2 }
- { Domain expertise 3 }

## Approach

1. { First step }
2. { Second step }
3. { Third step }
4. { Output/reporting step }

## Output Format

For each { finding/result }:
- **{ Label 1 }**: { Description }
- **{ Label 2 }**: { Description }
- **{ Label 3 }**: { Description }
