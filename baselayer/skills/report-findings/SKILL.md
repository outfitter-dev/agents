---
name: report-findings
version: 1.0.0
description: Structure and present research findings with source authority assessment, cross-referencing, and confidence calibration. Use when synthesizing multi-source research, presenting findings, comparing options, or when report, findings, synthesis, sources, or --report are mentioned. Micro-skill loaded by research-and-report, codebase-analysis, and other investigation skills.
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

## Tier 1: Primary Sources (90–100% confidence)

- **Official documentation** — authoritative source material
- **Original research** — peer-reviewed, verified data
- **Direct observation** — first-hand evidence
- **Canonical references** — definitive specifications

Use for: factual claims, behavior guarantees, canonical information

## Tier 2: Authoritative Secondary (70–90% confidence)

- **Expert analysis** — recognized authorities in field
- **Established publications** — reputable sources with editorial standards
- **Official guides** — sanctioned but not canonical
- **Conference materials** — from recognized experts

Use for: best practices, patterns, trade-off analysis

## Tier 3: Community Sources (50–70% confidence)

- **Community discussions** — Q&A sites, forums
- **Individual analysis** — blogs, personal research
- **Crowd-sourced content** — wikis, collaborative docs
- **Anecdotal evidence** — reported experiences

Use for: practical workarounds, common pitfalls, usage examples

## Tier 4: Unverified (0–50% confidence)

- **Unattributed content** — no clear source
- **Outdated material** — age unknown or clearly stale
- **Questionable provenance** — content farms, SEO-driven
- **Unchecked AI content** — generated without verification

Use for: initial leads only, must verify against higher tiers

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
5. **Document uncertainty** — flag with △ if unresolved

## Triangulation

For complex questions:
- **Official sources** — what should happen
- **Direct evidence** — what actually happens
- **Community reports** — what people experience

All three align → high confidence
Mismatches → investigate the gap

</cross_referencing>

<comparison_analysis>

## Feature Comparison Matrix

| Feature | Option A | Option B | Option C |
|---------|----------|----------|----------|
| Criterion 1 | High | Medium | Low |
| Criterion 2 | Medium | High | High |
| Criterion 3 | Large | Small | Medium |

## Trade-off Analysis

For each option, capture:
- **Strengths** — what it does well
- **Weaknesses** — what it struggles with
- **Use cases** — when to choose this
- **Deal-breakers** — when to avoid this

## Weighted Decision Matrix

1. List criteria (importance factors)
2. Assign weights (1–5 importance)
3. Score each option (1–5 on each criterion)
4. Calculate: Σ(weight × score)
5. Highest total → recommended option

</comparison_analysis>

<citation_requirements>

## When to Cite

Always cite for:
- **Specific claims** — quantitative statements, statistics
- **Best practices** — recommended approaches
- **Breaking changes** — behavioral shifts
- **Warnings** — risks, vulnerabilities, concerns

## Citation Format

Inline references:
- `[Source Name](URL)` — linked citation
- `[Source Name]` — reference to listed source
- Direct attribution in prose

## Source Attribution

In findings:

```markdown
## Research Findings

Based on:
- [Primary Source](url)
- [Secondary Source](url)
- [Community Discussion](url)

△ Note: { caveats about sources }
```

</citation_requirements>

<research_workflow>

## Breadth-First Discovery

1. **Formulate question** — clear, specific
2. **Identify keywords** — search terms
3. **Survey landscape** — skim 5–10 sources
4. **Cluster findings** — group similar perspectives
5. **Identify gaps** — what's missing?

## Depth-First Investigation

1. **Select promising source** — highest authority
2. **Read thoroughly** — understand fully
3. **Follow references** — cited sources
4. **Validate claims** — cross-check
5. **Synthesize** — extract key insights

## Iterative Refinement

1. **Initial answer** — based on first pass
2. **Identify uncertainty** — what's unclear?
3. **Targeted research** — fill specific gaps
4. **Update answer** — incorporate findings
5. **Repeat** until confidence threshold met

</research_workflow>

<synthesis_techniques>

## Common Themes

Across sources, extract:
- **Consensus** — what everyone agrees on
- **Disagreements** — where opinions differ
- **Edge cases** — nuanced situations
- **Evolution** — how thinking has changed

## Pattern Recognition

Look for:
- **Repeated recommendations** — multiple sources suggest same approach
- **Consistent warnings** — multiple sources flag same pitfall
- **Recurring examples** — same patterns shown
- **Aligned trade-offs** — similar benefit/cost analysis

## Structured Summary

Present findings:
1. **Main answer** — clear, actionable
2. **Supporting evidence** — cite 2–3 strongest sources
3. **Caveats** — limitations, context-specific notes
4. **Alternatives** — other valid approaches
5. **Further reading** — for deeper dive

</synthesis_techniques>

<confidence_calibration>

Research quality affects confidence:

**High confidence** (▓▓▓▓▓):
- 3+ tier-1 sources agree
- Empirically verified
- Current/maintained sources

**Moderate confidence** (▓▓▓░░):
- 2 tier-2 sources agree
- Some empirical support
- Recent but not authoritative

**Low confidence** (▓░░░░):
- Single source or tier-3 only
- Unverified claims
- Outdated information

△ Flag remaining uncertainties even at high confidence

</confidence_calibration>

<output_format>

## Findings Report

### Summary

{ 1-2 sentence answer to research question }

### Key Findings

1. {FINDING} — evidence: {SOURCE}
2. {FINDING} — evidence: {SOURCE}

### Comparison (if applicable)

{ matrix or trade-off analysis }

### Confidence Assessment

Overall: {BAR} {PERCENTAGE}%

High confidence areas:
- {AREA} — {REASON}

Lower confidence areas:
- {AREA} — {REASON}

### Sources

- [Source 1](url) — tier {N}
- [Source 2](url) — tier {N}

### △ Caveats

{ uncertainties, gaps, assumptions }

</output_format>

<rules>

ALWAYS:
- Assess source authority before citing
- Cross-reference critical claims (2+ sources)
- Include confidence levels with findings
- Cite sources with proper attribution
- Flag uncertainties with △

NEVER:
- Cite single source for critical claims
- Present tier-4 sources as authoritative
- Skip confidence calibration
- Hide conflicting sources
- Omit caveats section when uncertainty exists

</rules>

<references>

Related skills:
- [research-and-report](../research-and-report/SKILL.md) — full research workflow (loads this skill)
- [codebase-analysis](../codebase-analysis/SKILL.md) — uses for technical research synthesis
- [pattern-analysis](../pattern-analysis/SKILL.md) — identifying patterns in findings

</references>
