---
name: Patternify
version: 1.1.0
description: Analyze conversation to identify and capture reusable patterns as skills, commands, agents, or hooks. Use when spotting repeatable workflows, orchestration sequences, or decision heuristics worth codifying. Triggers on pattern(s), capture, codify, reusable, workflow, or `--patternify`.
---

# Patternify

Conversation analysis → reusable pattern → correct component.

<when_to_use>

- Spotting repeated behavior worth codifying
- User explicitly wants to capture a workflow
- Recognizing orchestration sequences in conversation
- Identifying decision heuristics being applied

NOT for: one-off tasks, simple questions, well-documented existing patterns

</when_to_use>

<pattern_types>

| Type | Purpose | Example |
|------|---------|---------|
| Workflow | Multi-step sequences | Debug → Test → Fix → Verify |
| Orchestration | Tool coordination | Git + Linear + PR automation |
| Heuristic | Decision rules | "When X, do Y because Z" |

Workflows: Step-by-step processes with defined phases and transitions.
Orchestration: Tool combinations that work together for a goal.
Heuristics: Conditional logic and decision trees for common situations.

</pattern_types>

<component_mapping>

Match pattern type to implementation:

```text
Is it a multi-step process with phases?
├─ Yes → Does it need tool restrictions?
│        ├─ Yes → Skill (with allowed_tools)
│        └─ No → Skill
└─ No → Is it a simple entry point?
         ├─ Yes → Command (thin wrapper → Skill)
         └─ No → Is it autonomous/long-running?
                  ├─ Yes → Agent
                  └─ No → Is it reactive to events?
                           ├─ Yes → Hook
                           └─ No → Probably doesn't need codifying
```

Composites:
- Skill + Command: Skill holds logic, command provides entry point
- Skill + Hook: Skill holds logic, hook triggers automatically
- Agent + Skill: Agent orchestrates, skill provides methodology

</component_mapping>

<specification>

Pattern spec format (YAML):

```yaml
name: pattern-name
type: workflow | orchestration | heuristic
trigger: when to apply
phases:  # workflow
  - name: phase-name
    actions: [...]
    exit_criteria: condition
tools:   # orchestration
  - tool: name
    role: purpose
    sequence: order
rules:   # heuristic
  - condition: when
    action: what
    rationale: why
quality:
  specific: true | false
  repeatable: true | false
  valuable: true | false
  documented: true | false
  scoped: true | false
```

All five quality checks must pass before codifying.

</specification>

<workflow>

1. Identify: Spot repeatable behavior in conversation
   - For deep analysis, load [codebase-analysis](../codebase-analysis/SKILL.md) skill and use [pattern-analysis](../pattern-analysis/SKILL.md) techniques
   - Extract success, frustration, workflow, and request signals
   - Look for 3+ occurrences of similar behavior
2. Classify: Workflow, Orchestration, or Heuristic?
3. Map: Which component(s) should implement it?
4. Specify: Document with pattern spec format
5. Quality: Validate against SRVDS criteria
6. Implement: Create the component(s)

TodoWrite phases:

```text
- Identify { pattern description }
- Classify { pattern type }
- Map { component decision }
- Specify { pattern name }
- Implement { component type }
```

</workflow>

<quality>

SRVDS criteria — all must pass:

| Check | Question | Red Flag |
|-------|----------|----------|
| Specific | Clear trigger + scope? | "Sometimes useful" |
| Repeatable | Works across contexts? | One-off solution |
| Valuable | Worth the overhead? | Saves < 5 minutes |
| Documented | Can others understand? | Tribal knowledge |
| Scoped | Single responsibility? | Kitchen sink |

Skip if: < 3 occurrences, context-dependent, simpler inline

</quality>

<anti_patterns>

- Premature abstraction: Codifying after first occurrence
- Over-specification: 50-line spec for 5-line pattern
- Wrong component: Hook when Skill needed, Agent when Command suffices
- Missing trigger: Pattern exists but no clear activation
- Scope creep: Pattern grows to handle edge cases

</anti_patterns>

<rules>

ALWAYS:
- Identify pattern type before choosing component
- Validate all SRVDS criteria
- Start with minimal implementation
- Document trigger conditions clearly
- Test pattern in at least 2 contexts

NEVER:
- Codify after single occurrence
- Create Agent when Skill suffices
- Skip quality validation
- Implement without clear trigger
- Add "might need later" features

</rules>

<references>

- [codebase-analysis](../codebase-analysis/SKILL.md) — core investigation methodology
- [pattern-analysis](../pattern-analysis/SKILL.md) — signal extraction techniques
- [pattern-types.md](references/pattern-types.md) — extended examples by type
- [component-mapping.md](references/component-mapping.md) — decision tree details
- [examples/](examples/) — captured pattern examples

</references>
