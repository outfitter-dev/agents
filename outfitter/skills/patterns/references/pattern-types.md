# Pattern Types

Classification system for different types of reusable patterns.

## Workflow Pattern

Sequential process with defined stages.

**Characteristics**:
- Sequential stages with clear transitions
- Decision points triggering next steps
- Quality gates or validation checkpoints
- Repeatable across similar contexts

**Example structure**:

```
Stage 1 → Validation → Stage 2 → Validation → Stage 3 → Complete
```

**When to codify as workflow**:
- Steps always occur in same order
- Each stage has clear entry/exit criteria
- Others can follow the sequence
- Consistent outcomes when followed

**Template**:

```markdown
# Workflow: {Name}

## Stages
1. {Stage} — {purpose}, exit when {condition}
2. {Stage} — {purpose}, exit when {condition}
3. {Stage} — {purpose}, exit when {condition}

## Quality Gates
- Before Stage 2: {validation}
- Before Stage 3: {validation}

## Exit Criteria
{how to know workflow is complete}
```

## Orchestration Pattern

Coordinates multiple components or actors.

**Characteristics**:
- Coordinates multiple components or actors
- Manages state across sub-tasks
- Routes work based on conditions
- Aggregates results

**Example structure**:

```
Input → Router → [Component A, Component B, Component C] → Aggregator → Output
```

**When to codify as orchestration**:
- Multiple independent actors
- Complex routing logic
- State needs tracking across components
- Results need aggregation

**Template**:

```markdown
# Orchestration: {Name}

## Components
- {Component A} — {responsibility}
- {Component B} — {responsibility}

## Routing
- When {condition} → route to {component}
- When {condition} → route to {component}

## State Management
{how state is tracked across components}

## Aggregation
{how results are combined}
```

## Heuristic Pattern

Decision-making guideline or rule of thumb.

**Characteristics**:
- Decision-making guideline
- Condition → action mapping
- Context-sensitive application
- Often has exceptions

**Example structure**:

```
If {condition}, then {action}
Unless {exception}, in which case {alternative}
```

**When to codify as heuristic**:
- Repeated decision point
- Clear trigger condition
- Consistent recommended action
- Known exceptions

**Template**:

```markdown
# Heuristic: {Name}

## Rule
When {condition}, {action}.

## Rationale
{why this rule works}

## Exceptions
- When {exception}: {alternative action}

## Examples
- {Situation}: Applied heuristic, {outcome}
```

## Anti-Pattern

Common mistake that leads to problems.

**Characteristics**:
- Common mistake leading to rework
- Inefficiency despite seeming reasonable
- Causes specific failure modes
- Has better alternative

**Example structure**:

```
Appears reasonable → Causes {problem} → Better approach: {alternative}
```

**When to codify as anti-pattern**:
- Seen same mistake 3+ times
- Clear negative consequence
- Better alternative exists
- Others might make same mistake

**Template**:

```markdown
# Anti-Pattern: {Name}

## The Pattern
{what people commonly do}

## Why It Seems Right
{why this approach is tempting}

## What Goes Wrong
{negative consequences}

## Better Approach
{recommended alternative}

## How to Recognize
{warning signs you're falling into this}
```

## Pattern Selection Matrix

| Pattern Type | Key Indicator | Use When |
|--------------|---------------|----------|
| Workflow | Sequential steps | Process has clear stages |
| Orchestration | Multiple actors | Coordination needed |
| Heuristic | Decision point | Repeated judgment calls |
| Anti-Pattern | Repeated failure | Want to prevent mistakes |

## Hybrid Patterns

Some patterns combine types:

- **Workflow + Heuristics**: Process with embedded decision rules
- **Orchestration + Workflow**: Coordinated multi-stage process
- **Heuristic + Anti-Pattern**: "Do X, avoid Y" guidance

Choose primary classification based on dominant characteristic.
