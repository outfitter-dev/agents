---
name: pattern-analysis
version: 1.0.0
description: Identify and extract reusable patterns from repeated behaviors, workflows, and outcomes. Use when recognizing recurring themes, codifying best practices, extracting workflows from experience, or when pattern, recurring, repeated, or --pattern are mentioned. Micro-skill loaded by codebase-analysis, patternify, and other investigation skills.
---

# Pattern Analysis

Identify signals → classify patterns → validate with evidence → document for reuse.

<when_to_use>

- Recognizing recurring themes in work or data
- Codifying best practices from experience
- Extracting workflows from repeated success
- Identifying anti-patterns from repeated failures
- Building decision frameworks from observations

NOT for: single occurrences, unvalidated hunches, premature abstraction

</when_to_use>

<signal_identification>

## Success Signals

Look for:
- **Completion markers** — task finished smoothly, no backtracking
- **Positive feedback** — confirmation of value or effectiveness
- **Repetition** — same approach used 3+ times across different contexts
- **Efficiency** — solved problem faster/cleaner than alternatives

## Frustration Signals

Watch for:
- **Backtracking** — undoing previous work, starting over
- **Clarification loops** — multiple rounds to understand intent
- **Rework** — implementing, then replacing with different approach
- **Confusion markers** — misalignment between expectation and outcome

## Workflow Signals

Identify:
- **Sequence consistency** — same steps in same order
- **Decision points** — recurring choices at specific moments
- **Quality gates** — checkpoints before proceeding
- **Exit conditions** — how completion is determined

</signal_identification>

<pattern_classification>

## Workflow Pattern

**Characteristics**:
- Sequential phases with clear transitions
- Decision points triggering next steps
- Quality gates or validation checkpoints
- Repeatable across similar contexts

## Orchestration Pattern

**Characteristics**:
- Coordinates multiple components or actors
- Manages state across sub-tasks
- Routes work based on conditions
- Aggregates results

## Heuristic Pattern

**Characteristics**:
- Decision-making guideline
- Condition → action mapping
- Context-sensitive application
- Often has exceptions

## Anti-Pattern

**Characteristics**:
- Common mistake leading to rework
- Inefficiency despite seeming reasonable
- Causes specific failure modes
- Has better alternative

</pattern_classification>

<evidence_thresholds>

## Codification Criteria

Don't codify after first occurrence. Require:
- **3+ instances** — minimum repetition to establish pattern
- **Multiple contexts** — works across different scenarios
- **Clear boundaries** — know when to apply vs not apply
- **Measurable benefit** — improves outcome compared to ad-hoc approach

## Quality Indicators

Strong patterns show:
- **Consistency** — same structure each time
- **Transferability** — others can follow it
- **Robustness** — handles edge cases gracefully
- **Efficiency** — saves time/effort

Weak patterns show:
- **Variation** — changes significantly each use
- **Expertise dependency** — only works for specific person
- **Fragility** — breaks on slight deviation
- **Overhead** — costs more than value provided

</evidence_thresholds>

<quality_criteria_extraction>

## From Success Cases

Analyze what made successful outcomes work:
1. **Identify outcome** — what was delivered?
2. **Trace approach** — what steps led there?
3. **Extract principles** — what rules were followed?
4. **Generalize** — how does this apply elsewhere?

## From Failure Cases

Learn from unsuccessful attempts:
1. **Identify failure** — what went wrong?
2. **Trace cause** — which decision caused it?
3. **Extract constraint** — what rule was violated?
4. **Prevent** — how to catch this earlier?

## Comparative Analysis

When multiple approaches exist:
1. **Enumerate options** — list all approaches tried
2. **Compare outcomes** — which worked better?
3. **Isolate variables** — what was different?
4. **Extract criteria** — when to use each?

</quality_criteria_extraction>

<pattern_documentation>

## Minimum Viable Pattern

Capture:
- **Name** — memorable, descriptive
- **When** — trigger conditions
- **What** — core workflow or rule
- **Why** — problem it solves

## Full Pattern

Add:
- **How** — detailed steps
- **Examples** — concrete cases
- **Variations** — adaptations for different contexts
- **Anti-patterns** — common mistakes
- **References** — supporting material

</pattern_documentation>

<progressive_formalization>

**Observation** (1–2 instances):
- Note for future reference
- "This worked well, watch for recurrence"

**Hypothesis** (3+ instances):
- Draft informal guideline
- Test consciously in next case
- Gather feedback

**Codification** (validated pattern):
- Create formal documentation
- Include examples and constraints
- Make discoverable

**Refinement** (ongoing):
- Update based on usage
- Add edge cases
- Improve clarity

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

Related skills:
- [patternify](../patternify/SKILL.md) — pattern discovery from conversations
- [codebase-analysis](../codebase-analysis/SKILL.md) — uses pattern analysis for code investigation
- [report-findings](../report-findings/SKILL.md) — presenting discovered patterns

</references>
