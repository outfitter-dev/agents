# Comparison Methods

Structured approaches for evaluating and comparing options.

## Feature Comparison Matrix

Side-by-side feature comparison.

### Structure

```markdown
| Feature | Option A | Option B | Option C |
|---------|----------|----------|----------|
| Criterion 1 | Value | Value | Value |
| Criterion 2 | Value | Value | Value |
| Criterion 3 | Value | Value | Value |
```

### Best Practices

- Use consistent value types (all quantitative or all qualitative)
- Include units for numeric values
- Mark unknown/unavailable as "N/A" or "Unknown"
- Highlight standout values (best in bold)
- Keep to 5-8 most important criteria

### Example

```markdown
| Capability | Express | Fastify | Hono |
|------------|---------|---------|------|
| Requests/sec | 15k | 30k | **60k** |
| TypeScript | Plugin | Native | **Native** |
| Bundle size | 500KB | 350KB | **14KB** |
| Learning curve | Low | Medium | Low |
```

## Trade-off Analysis

Deeper evaluation of strengths and weaknesses.

### Per-Option Analysis

For each option, document:

**Strengths**:
- What it does well
- Unique advantages
- Best use cases

**Weaknesses**:
- Limitations
- Edge cases it handles poorly
- Known issues

**Use cases**:
- When to choose this option
- Ideal scenarios

**Deal-breakers**:
- When to definitely avoid
- Hard constraints it violates

### Template

```markdown
## Option: {Name}

**Strengths**:
- {Advantage 1} — {evidence/detail}
- {Advantage 2} — {evidence/detail}

**Weaknesses**:
- {Limitation 1} — {impact}
- {Limitation 2} — {impact}

**Best for**:
- {Use case 1}
- {Use case 2}

**Avoid when**:
- {Constraint 1}
- {Constraint 2}
```

## Weighted Decision Matrix

Quantitative scoring for complex decisions.

### Process

1. **List criteria** — identify evaluation factors
2. **Assign weights** — 1-5 importance scale
3. **Score options** — 1-5 on each criterion
4. **Calculate totals** — Sum(weight x score)
5. **Interpret results** — highest total is recommended

### Template

```markdown
| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Performance | 5 | 4 (20) | 5 (25) | 3 (15) |
| Ease of use | 3 | 5 (15) | 3 (9) | 4 (12) |
| Ecosystem | 4 | 5 (20) | 3 (12) | 2 (8) |
| Cost | 2 | 3 (6) | 4 (8) | 5 (10) |
| **Total** | | **61** | **54** | **45** |
```

### Weight Guidelines

| Weight | Meaning |
|--------|---------|
| 5 | Critical — must have |
| 4 | Important — strong preference |
| 3 | Moderate — nice to have |
| 2 | Minor — slight preference |
| 1 | Low — barely factors in |

### Score Guidelines

| Score | Meaning |
|-------|---------|
| 5 | Excellent — best in class |
| 4 | Good — above average |
| 3 | Adequate — meets needs |
| 2 | Poor — below expectations |
| 1 | Failing — does not meet need |

## Pros/Cons List

Simple qualitative comparison.

### Structure

```markdown
## Option: {Name}

### Pros
- {Benefit 1}
- {Benefit 2}

### Cons
- {Drawback 1}
- {Drawback 2}

### Verdict
{Summary recommendation}
```

### When to Use

- Quick informal comparisons
- Binary decisions (2 options)
- Early-stage exploration
- When quantification isn't meaningful

## Decision Criteria Framework

Structured approach for defining what matters.

### Categories

**Functional Requirements**:
- Features needed
- Capabilities required
- Integration points

**Non-Functional Requirements**:
- Performance benchmarks
- Scalability needs
- Security requirements

**Operational Concerns**:
- Maintenance burden
- Monitoring/observability
- Deployment complexity

**Business Factors**:
- Cost (license, infrastructure)
- Vendor lock-in risk
- Team expertise

### Prioritization

Categorize criteria:

| Priority | Meaning | Impact on Decision |
|----------|---------|-------------------|
| Must-have | Non-negotiable | Eliminates options |
| Should-have | Strong preference | Heavy weighting |
| Nice-to-have | Bonus features | Light weighting |

## Method Selection Guide

| Situation | Recommended Method |
|-----------|-------------------|
| Quick comparison | Feature matrix |
| Complex decision | Weighted matrix |
| Stakeholder alignment | Trade-off analysis |
| Binary choice | Pros/cons list |
| Requirements gathering | Criteria framework |
