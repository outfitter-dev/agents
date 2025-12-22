# Pattern Analysis

Techniques for identifying reusable patterns from conversations, workflows, and code.

## Signal Identification

Patterns emerge from repeated signals across sessions.

### Success Signals

Look for:
- **Workflow completion** — task finished smoothly, no backtracking
- **Positive feedback** — user confirms "that worked well" or "exactly what I needed"
- **Repetition** — same approach used 3+ times across different contexts
- **Efficiency** — solved problem faster/cleaner than alternatives

### Frustration Signals

Watch for:
- **Backtracking** — undoing previous work, starting over
- **Clarification loops** — multiple rounds to understand intent
- **Rework** — implementing, then replacing with different approach
- **Confusion markers** — "wait, not that" or "let me explain again"

### Workflow Signals

Identify:
- **Sequence consistency** — same steps in same order
- **Decision points** — recurring choices at specific moments
- **Quality gates** — checkpoints before proceeding
- **Exit conditions** — how task completion is determined

## Pattern Classification

### Workflow Pattern

**Characteristics**:
- Sequential phases with clear transitions
- Decision points triggering next steps
- Quality gates or validation checkpoints
- Repeatable across similar contexts

**Example**: Red-Green-Refactor (TDD workflow)

### Orchestration Pattern

**Characteristics**:
- Coordinates multiple tools or agents
- Manages state across sub-tasks
- Routes work based on conditions
- Aggregates results

**Example**: Multi-agent code review with specialist routing

### Heuristic Pattern

**Characteristics**:
- Decision-making guideline
- Condition → action mapping
- Context-sensitive application
- Often has exceptions

**Example**: "If token count > 60%, narrow scope before proceeding"

### Anti-Pattern

**Characteristics**:
- Common mistake leading to rework
- Inefficiency despite seeming reasonable
- Causes specific failure modes
- Has better alternative

**Example**: Reading entire file when structure map suffices

## Evidence Thresholds

### Codification Criteria

Don't codify after first occurrence. Require:
- **3+ instances** — minimum repetition to establish pattern
- **Multiple contexts** — works across different scenarios
- **Clear boundaries** — know when to apply vs not apply
- **Measurable benefit** — improves outcome compared to ad-hoc approach

### Quality Indicators

Strong patterns show:
- **Consistency** — same structure each time
- **Transferability** — others can follow it
- **Robustness** — handles edge cases gracefully
- **Efficiency** — saves time/tokens/effort

Weak patterns show:
- **Variation** — changes significantly each use
- **Expertise dependency** — only works for specific person
- **Fragility** — breaks on slight deviation
- **Overhead** — costs more than value provided

## Quality Criteria Extraction

### From Success Cases

Analyze what made successful outcomes work:
1. **Identify outcome** — what was delivered?
2. **Trace approach** — what steps led there?
3. **Extract principles** — what rules were followed?
4. **Generalize** — how does this apply elsewhere?

### From Failure Cases

Learn from unsuccessful attempts:
1. **Identify failure** — what went wrong?
2. **Trace cause** — which decision caused it?
3. **Extract constraint** — what rule was violated?
4. **Prevent** — how to catch this earlier?

### Comparative Analysis

When multiple approaches exist:
1. **Enumerate options** — list all approaches tried
2. **Compare outcomes** — which worked better?
3. **Isolate variables** — what was different?
4. **Extract criteria** — when to use each?

## Pattern Documentation

### Minimum Viable Pattern

Capture:
- **Name** — memorable, descriptive
- **When** — trigger conditions
- **What** — core workflow or rule
- **Why** — problem it solves

### Full Pattern

Add:
- **How** — detailed steps
- **Examples** — concrete cases
- **Variations** — adaptations for different contexts
- **Anti-patterns** — common mistakes
- **References** — supporting material

## Pattern Testing

Before codifying, validate:
1. **Apply deliberately** — use in next similar case
2. **Track variance** — note any deviations needed
3. **Measure impact** — better outcome than before?
4. **Refine** — adjust based on feedback

## Progressive Formalization

**Observation** (1–2 instances):
- Note in session memory
- "This worked well, watch for recurrence"

**Hypothesis** (3+ instances):
- Draft informal guideline
- Test consciously in next case
- Gather feedback

**Codification** (validated pattern):
- Create skill or reference doc
- Include examples and constraints
- Make discoverable (keywords, metadata)

**Refinement** (ongoing):
- Update based on usage
- Add edge cases
- Improve clarity
