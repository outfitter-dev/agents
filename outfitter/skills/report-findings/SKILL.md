---
name: report-findings
description: This skill should be used when synthesizing multi-source research, presenting findings with attribution, or when "report", "findings", or "synthesis" are mentioned.
metadata:
  version: "1.1.0"
  related-skills:
    - research
    - codebase-recon
    - patterns
---

# Report Findings

Multi-source gathering → authority assessment → cross-reference → synthesize → present with confidence.

<when_to_use>

- Synthesizing research from multiple sources
- Presenting findings with proper attribution
- Comparing options with structured analysis
- Assessing source credibility
- Documenting research conclusions

NOT for: single-source summaries, opinion without evidence, rushing to conclusions

</when_to_use>

<source_authority>

| Tier | Confidence | Types | Use For |
|------|------------|-------|---------|
| **1: Primary** | 90-100% | Official docs, original research, direct observation | Factual claims, guarantees |
| **2: Secondary** | 70-90% | Expert analysis, established publications, official guides | Best practices, patterns |
| **3: Community** | 50-70% | Q&A sites, blogs, wikis, anecdotal evidence | Workarounds, pitfalls |
| **4: Unverified** | 0-50% | Unattributed, outdated, content farms, unchecked AI | Initial leads only |

See [source-tiers.md](references/source-tiers.md) for detailed assessment criteria.

</source_authority>

<cross_referencing>

## Two-Source Minimum

Never rely on single source for critical claims:
1. Find claim in initial source
2. Seek confirmation in independent source
3. If sources conflict → investigate further
4. If sources agree → moderate confidence
5. If 3+ sources agree → high confidence

## Conflict Resolution

When sources disagree:
1. **Check dates** — newer information often supersedes
2. **Compare authority** — higher tier beats lower tier
3. **Verify context** — might both be right in different scenarios
4. **Test empirically** — verify through direct observation if possible
5. **Document uncertainty** — flag if unresolved

## Triangulation

For complex questions, seek alignment across:
- **Official sources** — what should happen
- **Direct evidence** — what actually happens
- **Community reports** — what people experience

All three align → high confidence. Mismatches → investigate the gap.

</cross_referencing>

<comparison_analysis>

Three comparison methods:

| Method | When to Use |
|--------|-------------|
| **Feature Matrix** | Side-by-side capability comparison |
| **Trade-off Analysis** | Strengths/weaknesses/use cases per option |
| **Weighted Matrix** | Quantitative scoring with importance weights |

See [comparison-methods.md](references/comparison-methods.md) for templates and examples.

</comparison_analysis>

<synthesis_techniques>

## Extract Themes

Across sources, identify:
- **Consensus** — what everyone agrees on
- **Disagreements** — where opinions differ
- **Edge cases** — nuanced situations

## Present Findings

1. **Main answer** — clear, actionable
2. **Supporting evidence** — cite 2-3 strongest sources
3. **Caveats** — limitations, context-specific notes
4. **Alternatives** — other valid approaches

</synthesis_techniques>

<confidence_calibration>

| Level | Indicator | Criteria |
|-------|-----------|----------|
| **High** | 90-100% | 3+ tier-1 sources agree, empirically verified |
| **Moderate** | 60-89% | 2 tier-2 sources agree, some empirical support |
| **Low** | Below 60% | Single source or tier-3 only, unverified |

Flag remaining uncertainties even at high confidence.

</confidence_calibration>

<output_format>

Standard report structure:

```markdown
## Summary
{ 1-2 sentence answer }

## Key Findings
1. {FINDING} — evidence: {SOURCE}

## Comparison (if applicable)
{ matrix or trade-off analysis }

## Confidence Assessment
Overall: {LEVEL} {PERCENTAGE}%

## Sources
- [Source](url) — tier {N}

## Caveats
{ uncertainties, gaps, assumptions }
```

See [output-template.md](references/output-template.md) for full template with guidelines.

</output_format>

<rules>

ALWAYS:
- Assess source authority before citing
- Cross-reference critical claims (2+ sources)
- Include confidence levels with findings
- Cite sources with proper attribution
- Flag uncertainties

NEVER:
- Cite single source for critical claims
- Present tier-4 sources as authoritative
- Skip confidence calibration
- Hide conflicting sources
- Omit caveats when uncertainty exists

</rules>

<references>

- [source-tiers.md](references/source-tiers.md) — detailed authority assessment
- [comparison-methods.md](references/comparison-methods.md) — comparison templates
- [output-template.md](references/output-template.md) — full report structure

**Research vs Report-Findings**:
- `research` skill covers the full investigation workflow using MCP tools
- This skill (`report-findings`) covers synthesis, source assessment, and presentation

Load this skill during research synthesis stage, or standalone for any task requiring multi-source synthesis with proper attribution.

</references>
