# Research Analysis

Techniques for multi-source research with authority assessment, cross-referencing, and synthesis.

## Source Authority Levels

### Tier 1: Primary Sources

**Official documentation**:
- Library/framework official docs
- API reference from maintainer
- RFC specifications
- Academic papers (peer-reviewed)

**Confidence**: 90–100%

**Use for**: API contracts, behavior guarantees, canonical information

### Tier 2: Authoritative Secondary

**Reputable technical sources**:
- Established tech blogs (engineering.company.com)
- Conference talks by maintainers
- Books by recognized experts
- Official tutorials

**Confidence**: 70–90%

**Use for**: Best practices, architectural patterns, trade-off analysis

### Tier 3: Community Sources

**Developer community**:
- Stack Overflow (high-vote answers)
- GitHub issues/discussions
- Developer blogs (individual)
- Reddit technical subreddits

**Confidence**: 50–70%

**Use for**: Practical workarounds, common pitfalls, usage examples

### Tier 4: Unverified

**Questionable sources**:
- Low-quality content farms
- Outdated tutorials (no dates)
- Unattributed code snippets
- AI-generated content (unchecked)

**Confidence**: 0–50%

**Use for**: Initial leads only, must verify against higher tiers

## Cross-Referencing Methodology

### Two-Source Minimum

Never rely on single source for critical decisions:
1. Find claim in initial source
2. Seek confirmation in independent source
3. If sources conflict → investigate further
4. If sources agree → moderate confidence
5. If 3+ sources agree → high confidence

### Conflict Resolution

When sources disagree:
1. **Check dates** — newer information often supersedes
2. **Compare authority** — official docs beat blog posts
3. **Verify context** — might both be right in different scenarios
4. **Test empirically** — run code, measure behavior
5. **Document uncertainty** — flag with △ if unresolved

### Triangulation

For complex questions:
- **Official docs** — what should happen
- **Source code** — what actually happens
- **Community discussions** — what people experience

All three align → high confidence
Mismatches → investigate the gap

## Version Compatibility Checking

### Version-Specific Research

Always note versions:
- Library version (e.g., React 18 vs 17)
- Language version (e.g., TypeScript 5.0 vs 4.9)
- Platform version (e.g., Node 20 vs 18)
- Framework version (e.g., Next.js 14 vs 13)

### Compatibility Matrix

Track dependencies:
```
Library A v2.0
├─ requires Library B ^3.0
├─ compatible with Library C 4.x
└─ breaks with Library D <1.5
```

### Migration Awareness

When versions differ:
- **Breaking changes** — what no longer works?
- **Deprecations** — what to avoid in new code?
- **New features** — what's now possible?
- **Performance changes** — faster/slower/different?

## Comparison Matrix Construction

### Feature Comparison

| Feature | Option A | Option B | Option C |
|---------|----------|----------|----------|
| Performance | High | Medium | Low |
| Ease of use | Medium | High | High |
| Community | Large | Small | Medium |
| Maturity | Stable | Beta | Stable |

### Trade-off Analysis

For each option, capture:
- **Strengths** — what it does well
- **Weaknesses** — what it struggles with
- **Use cases** — when to choose this
- **Deal-breakers** — when to avoid this

### Scoring Framework

Weighted decision matrix:
1. List criteria (performance, ease, cost, etc.)
2. Assign weights (1–5 importance)
3. Score each option (1–5 on each criterion)
4. Calculate: Σ(weight × score)
5. Highest total → recommended option

## Citation Requirements

### When to Cite

Always cite for:
- **Specific claims** — "X is 3x faster than Y" → cite benchmark
- **Best practices** — "Use pattern Z" → cite expert recommendation
- **Breaking changes** — "Feature removed in v3" → cite changelog
- **Security concerns** — "Vulnerable to X" → cite CVE or disclosure

### Citation Format

Inline references:
- `[Official docs](https://example.com/docs)`
- `[React 18 Changelog](https://github.com/.../CHANGELOG.md)`
- `[Stack Overflow: Handling race conditions](https://stackoverflow.com/q/...)`

### Source Attribution

In generated content:
```markdown
## Research Findings

Based on:
- [React 18 Documentation](https://react.dev/blog/2022/03/29/react-v18)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Vercel Engineering Blog](https://vercel.com/blog/...)

△ Note: Community best practices evolving rapidly as of 2024
```

## Research Workflow

### Breadth-First Discovery

1. **Formulate question** — clear, specific
2. **Identify keywords** — search terms
3. **Survey landscape** — skim 5–10 sources
4. **Cluster findings** — group similar perspectives
5. **Identify gaps** — what's missing?

### Depth-First Investigation

1. **Select promising source** — highest authority
2. **Read thoroughly** — understand fully
3. **Follow references** — cited sources
4. **Validate claims** — cross-check
5. **Synthesize** — extract key insights

### Iterative Refinement

1. **Initial answer** — based on first pass
2. **Identify uncertainty** — what's unclear?
3. **Targeted research** — fill specific gaps
4. **Update answer** — incorporate findings
5. **Repeat** until confidence threshold met

## Synthesis Techniques

### Common Themes

Across sources, extract:
- **Consensus** — what everyone agrees on
- **Disagreements** — where opinions differ
- **Edge cases** — nuanced situations
- **Evolution** — how thinking has changed

### Pattern Recognition

Look for:
- **Repeated recommendations** — multiple sources suggest same approach
- **Consistent warnings** — multiple sources flag same pitfall
- **Recurring examples** — same code patterns shown
- **Aligned trade-offs** — similar benefit/cost analysis

### Structured Summary

Present findings:
1. **Main answer** — clear, actionable
2. **Supporting evidence** — cite 2–3 strongest sources
3. **Caveats** — limitations, version-specific notes
4. **Alternatives** — other valid approaches
5. **Further reading** — for deeper dive

## Confidence Calibration

Research quality affects confidence:

**High confidence** (▓▓▓▓▓):
- 3+ tier-1 sources agree
- Empirically verified
- Current/maintained documentation

**Moderate confidence** (▓▓▓░░):
- 2 tier-2 sources agree
- Some empirical testing
- Recent but not authoritative

**Low confidence** (▓░░░░):
- Single source or tier-3 only
- Unverified claims
- Outdated information

△ Flag remaining uncertainties even at high confidence
