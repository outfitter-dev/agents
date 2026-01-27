---
name: patterns
description: This skill should be used when recognizing recurring themes, identifying patterns in work or data, or when "pattern", "recurring", or "repeated" are mentioned. For implementation, see codify skill.
metadata:
  version: "1.1.0"
  related-skills:
    - codify
    - codebase-recon
    - report-findings
---

# Pattern Identification

Observe signals → classify patterns → validate with evidence → document findings.

## Steps

1. Collect signals from conversation, code, or data
2. Classify pattern type (workflow, orchestration, heuristic, anti-pattern)
3. Validate against evidence threshold (3+ instances, multiple contexts)
4. Document pattern with constraints and examples
5. If implementation needed, delegate by loading the `outfitter:codify` skill

<when_to_use>

- Recognizing recurring themes in work or data
- Codifying best practices from experience
- Extracting workflows from repeated success
- Identifying anti-patterns from repeated failures
- Building decision frameworks from observations

NOT for: single occurrences, unvalidated hunches, premature abstraction

</when_to_use>

<signal_identification>

Watch for these signal categories:

| Category | Watch For | Indicates |
|----------|-----------|-----------|
| **Success** | Completion, positive feedback, repetition, efficiency | Pattern worth codifying |
| **Frustration** | Backtracking, clarification loops, rework, confusion | Anti-pattern to document |
| **Workflow** | Sequence consistency, decision points, quality gates | Process pattern |
| **Orchestration** | Multi-component coordination, state management, routing | Coordination pattern |

See [signal-types.md](references/signal-types.md) for detailed taxonomy.

</signal_identification>

<pattern_classification>

Four primary pattern types:

| Type | Characteristics | Use When |
|------|-----------------|----------|
| **Workflow** | Sequential stages, clear transitions, quality gates | Process has ordered steps |
| **Orchestration** | Coordinates components, manages state, routes work | Multiple actors involved |
| **Heuristic** | Condition → action mapping, context-sensitive | Repeated decisions |
| **Anti-Pattern** | Common mistake, causes rework, has better alternative | Preventing failures |

See [pattern-types.md](references/pattern-types.md) for templates and examples.

</pattern_classification>

<evidence_thresholds>

## Codification Criteria

Don't codify after first occurrence. Require:
- **3+ instances** — minimum repetition to establish pattern
- **Multiple contexts** — works across different scenarios
- **Clear boundaries** — know when to apply vs not apply
- **Measurable benefit** — improves outcome compared to ad-hoc approach

## Quality Indicators

| Strong Pattern | Weak Pattern |
|----------------|--------------|
| Consistent structure | Varies each use |
| Transferable to others | Requires specific expertise |
| Handles edge cases | Breaks on deviation |
| Saves time/effort | Overhead exceeds value |

</evidence_thresholds>

<progressive_formalization>

**Observation** (1-2 instances):
- Note for future reference
- "This worked well, watch for recurrence"

**Hypothesis** (3+ instances):
- Draft informal guideline
- Test consciously in next case

**Codification** (validated pattern):
- Create formal documentation
- Include examples and constraints

**Refinement** (ongoing):
- Update based on usage
- Add edge cases

</progressive_formalization>

<workflow>

Loop: Observe → Classify → Validate → Document

1. **Collect signals** — note successes, failures, recurring behaviors
2. **Classify pattern type** — workflow, orchestration, heuristic, anti-pattern
3. **Check evidence threshold** — 3+ instances? Multiple contexts?
4. **Extract quality criteria** — what makes it work?
5. **Document pattern** — name, when, what, why
6. **Test deliberately** — apply consciously, track variance
7. **Refine** — adjust based on feedback

</workflow>

<rules>

ALWAYS:
- Require 3+ instances before codifying
- Validate across multiple contexts
- Document both when to use AND when not to
- Include concrete examples
- Track pattern effectiveness over time

NEVER:
- Codify after single occurrence
- Abstract without evidence
- Ignore context-sensitivity
- Skip validation step
- Assume transferability without testing

</rules>

<references>

- [signal-types.md](references/signal-types.md) — detailed signal taxonomy
- [pattern-types.md](references/pattern-types.md) — pattern templates and examples

**Identification vs Implementation**:
- This skill (`patterns`) identifies and documents patterns
- `codify` skill implements patterns as Claude Code components (skills, commands, hooks, agents)

Use `patterns` to answer "what patterns exist?" Use `codify` to answer "how do I turn this into a reusable component?"

</references>
