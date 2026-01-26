# Findings Report Template

Standard structure for presenting research findings.

## Full Report Template

```markdown
## Research Summary

{ 1-2 sentence answer to research question }

## Key Findings

1. **{FINDING}** — evidence: {SOURCE}
2. **{FINDING}** — evidence: {SOURCE}
3. **{FINDING}** — evidence: {SOURCE}

## Comparison (if applicable)

| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| { criterion } | { value } | { value } | { value } |

## Recommendation

### Primary: {Option Name}

**Rationale**: { detailed reasoning with evidence }

**Confidence**: {HIGH/MEDIUM/LOW} — { explanation }

### Alternatives

- **{Option B}** — choose when { condition }
- **{Option C}** — choose when { condition }

## Confidence Assessment

Overall: {BAR} {PERCENTAGE}%

**High confidence areas**:
- { area } — { reason }

**Lower confidence areas**:
- { area } — { reason }

## Sources

- [Source 1](url) — tier {N}, { brief description }
- [Source 2](url) — tier {N}, { brief description }
- [Source 3](url) — tier {N}, { brief description }

## Caveats

- { uncertainty or limitation }
- { assumption made }
- { gap in research }
```

## Compact Report Template

For smaller findings or sub-reports.

```markdown
## {Topic}

**Finding**: { main conclusion }

**Evidence**:
- { source 1 }: { key point }
- { source 2 }: { key point }

**Confidence**: { level } — { brief rationale }

{ caveat if applicable }
```

## Section Guidelines

### Research Summary

- Lead with the answer
- 1-2 sentences maximum
- Make it actionable

**Good**: "Use Hono for new API projects; it offers 4x better performance than Express with TypeScript-first design."

**Bad**: "This report examines various web frameworks and their characteristics."

### Key Findings

- Number findings for reference
- Each finding = one clear statement
- Always cite source
- Order by importance or logical flow

### Comparison

- Use feature matrix for side-by-side
- Highlight standout values
- Include only decision-relevant criteria
- See [comparison-methods.md](comparison-methods.md)

### Recommendation

- State primary recommendation clearly
- Explain why (rationale with evidence)
- Include confidence level
- Provide alternatives with conditions

### Confidence Assessment

Use visual confidence bars:

```
High:     (90-100%)
Moderate: (60-89%)
Low:      (below 60%)
```

Explain what drives confidence up or down.

### Sources

- List all cited sources
- Include tier assessment
- Provide direct links
- See [source-tiers.md](source-tiers.md)

### Caveats

Include when:
- Research has gaps
- Sources conflict
- Time constraints limited depth
- Findings are context-dependent

Use indicator for visibility.

## Formatting Conventions

### Emphasis

- **Bold** for key terms and findings
- `code` for technical terms
- Links for sources

### Visual Indicators

- `HIGH/MEDIUM/LOW` — confidence levels
- Progress bars for visual confidence
- — caveats and warnings
- Tables for comparisons

### Citations

Inline: `[Source Name](url)`
Reference style: See Sources section at end

## Quality Checklist

Before delivering findings:

- [ ] Summary answers the question directly
- [ ] All findings have source citations
- [ ] Confidence level stated with rationale
- [ ] Caveats section present if uncertainty exists
- [ ] Sources include tier assessment
- [ ] Recommendation is actionable
- [ ] Alternatives provided with conditions
