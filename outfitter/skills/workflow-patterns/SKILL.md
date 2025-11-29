---
name: workflow-patterns
version: 1.0.0
description: Identifies reusable patterns from conversations and workflows, classifying them as workflows, tool orchestration, or heuristics, then recommends appropriate Claude Code component types (Skills, Commands, Agents, Hooks). Use when the user asks to "capture this pattern", "turn this into a skill", "patternify", "extract workflow", or when analyzing conversation output for componentization.
---

# Workflow Patterns

Capture reusable patterns from conversations and map them to the right Claude Code components.

## Quick Start

1. **Identify the pattern type** - Is this a multi-step workflow, novel tool orchestration, or a decision heuristic?
2. **Extract pattern elements** - Document triggers, steps, tools involved, and decision logic
3. **Map to component type** - Use the decision tree to select Skill, Command, Agent, or Hook
4. **Generate component structure** - Create the appropriate YAML frontmatter and implementation

## Pattern Types

### Workflows

Multi-step sequences with clear phases, typically triggered by user intent and executed linearly.

**Characteristics**:
- Clear start/end states
- Sequential or branching steps
- Well-defined success criteria
- Repeatable process

**Examples**:
- Debugging: investigate → hypothesize → test → verify
- Feature development: understand → design → implement → test
- PR creation: analyze changes → draft description → push → create PR

**Best component**: Skill (user-invoked, provides guidance) or Command (automated execution)

**When to add a Command**: If the workflow can be fully automated without agent judgment
**When to add an Agent**: If the workflow requires specialized domain knowledge throughout execution

### Orchestration

Novel combinations of tools or coordination patterns that solve specific problems.

**Characteristics**:
- Combines multiple tools in non-obvious ways
- Synchronizes parallel operations
- Manages external system interactions
- Handles complex state management

**Examples**:
- Git + Linear integration (status updates on commit)
- Parallel test execution with result aggregation
- Multi-service deployment with rollback coordination

**Best component**: Skill (manual orchestration) or Hook (event-driven automation)

**When to add a Hook**: If the orchestration should trigger automatically on events (git commit, file change)
**When to add an Agent**: If orchestration requires ongoing decision-making across multiple services

### Heuristics

Decision rules or problem-solving approaches that guide behavior without strict procedures.

**Characteristics**:
- Condition-based logic
- Contextual decision-making
- Trade-off evaluation
- Pattern recognition

**Examples**:
- "Use map + batch_scrape for token control, not crawl"
- "Split PRs over 300 LOC unless mechanical"
- "Request specialist review for security-critical code"

**Best component**: Skill (embedded guidance) or Hook (automated enforcement)

**When to add a Hook**: If the heuristic can be checked programmatically (LOC count, file patterns)
**When to add a Command**: If the heuristic should trigger specific validation/analysis tools

## Component Mapping

### Decision Tree

```
Pattern identified
    |
    ├─ User-invoked? ────────────────────────┐
    │   YES                                   │
    │   |                                     │
    │   ├─ Requires expertise? ───────────────┤
    │   │   YES → Agent                       │
    │   │   NO  → Skill or Command            │
    │   │         |                           │
    │   │         ├─ Fully automatable? ──────┤
    │   │             YES → Command           │
    │   │             NO  → Skill             │
    │                                         │
    └─ Event-triggered? ──────────────────────┘
        YES
        |
        ├─ Modifies behavior? ────────────────┐
            YES → Hook                        │
            NO  → Consider if needed          │
```

### Component Characteristics

| Component | Best For | Invocation | Autonomy |
|-----------|----------|------------|----------|
| **Skill** | Workflows, guidance, orchestration patterns | User request or flag | Agent-assisted, requires judgment |
| **Command** | Automated workflows, parameter-driven tasks | Slash command | Fully automated script |
| **Agent** | Domain expertise, specialized knowledge | User switches context | High autonomy, specialized system prompt |
| **Hook** | Event-driven automation, guardrails | Git events, file changes | Automated validation/action |

### Composite Patterns

**Skill + Command**: Skill provides guidance; Command automates specific steps
- Example: TDD skill + `/run-tests` command

**Skill + Hook**: Skill describes workflow; Hook enforces quality gates
- Example: PR workflow skill + pre-push hook for PR size validation

**Agent + Skill**: Agent embodies expertise; Skills extend capabilities
- Example: Security agent + vulnerability-scanning skill

**Command + Agent**: Command triggers; Agent provides implementation
- Example: `/implement-feature` command switches to feature-dev agent

## Pattern Specification

Document patterns in YAML format for consistent capture and generation.

### Required Fields

```yaml
name: pattern-name
title: Human Readable Title
type: workflow | orchestration | heuristic
description: What problem does this solve? When should it be used?
```

### Workflow-Specific Fields

```yaml
type: workflow
steps:
  - phase: Understanding
    actions:
      - Read requirements
      - Ask clarifying questions
    outputs:
      - Clear specification
  - phase: Implementation
    actions:
      - Write code
      - Add tests
    outputs:
      - Working feature

triggers:
  - User requests feature implementation
  - Bug needs systematic debugging
```

### Orchestration-Specific Fields

```yaml
type: orchestration
tools_involved:
  - Bash (git commands)
  - Linear API
  - Grep (search for issue references)

coordination:
  - Extract issue IDs from commit messages
  - Query Linear API for issue status
  - Update Linear with commit SHA and status

external_systems:
  - name: Linear
    api: REST
    auth: API key
```

### Heuristic-Specific Fields

```yaml
type: heuristic
condition: PR diff exceeds 300 effective LOC
action: Recommend splitting into stack or separate PRs
rationale: Large PRs increase review time and reduce quality
exceptions:
  - Mechanical changes (formatting, renames)
  - Generated code (lockfiles, migrations)
  - Emergency hotfixes
```

## Quality Criteria

### Good Pattern

- **Specific**: Clear triggers and conditions
- **Repeatable**: Works consistently across similar situations
- **Valuable**: Saves significant time or reduces errors
- **Documented**: Evidence from actual usage
- **Scoped**: Solves one problem well

### Poor Pattern

- **Vague**: "Help with code" or "Be better at X"
- **One-off**: Only applies to single unique situation
- **Trivial**: "Use grep to search files" (already known)
- **Undocumented**: No examples or evidence
- **Bloated**: Tries to solve everything at once

## Integration

This skill works in conjunction with conversation-analysis:

1. **conversation-analysis** extracts successful patterns from chat history
2. **workflow-patterns** (this skill) classifies the pattern type and maps to component
3. **Component-specific skills** generate the actual implementation:
   - validate-claude-skill
   - validate-claude-command
   - validate-claude-subagent
   - validate-claude-hook

Use this skill when you have identified a pattern (manually or via conversation-analysis) and need to determine what kind of Claude Code component to create.

## Works Well With

| Skill/Component | Integration Pattern |
|-----------------|---------------------|
| **conversation-analysis** | Chain: conversation-analysis extracts signals → this skill classifies and maps |
| **pattern-analyzer agent** | Loaded by agent to provide classification and component mapping logic |
| **jam** | Use jam to refine pattern specification before generating components |
| **validate-claude-**** | After generating components, validate against best practices |
| **/patternify command** | Orchestrates the full pattern extraction → classification → generation flow |

## When to Go Deeper

**Uncertain about pattern type?** See [Pattern Types](references/pattern-types.md) for extended examples, anti-patterns, and hybrid pattern guidance.

**Complex component decision?** See [Component Mapping](references/component-mapping.md) for detailed decision trees with edge cases and common mistakes.

**Learning from real implementations?** See the examples directory for complete worked patterns with full specifications and generated components.

## Additional Resources

- **Pattern Types**: `references/pattern-types.md` — Extended taxonomy with anti-patterns
- **Component Mapping**: `references/component-mapping.md` — Detailed decision logic and edge cases
- **Workflow Example**: `examples/workflow-pattern.md` — Complete workflow implementation
- **Orchestration Example**: `examples/orchestration-pattern.md` — Complete orchestration implementation
- **Heuristic Example**: `examples/heuristic-pattern.md` — Complete heuristic implementation
