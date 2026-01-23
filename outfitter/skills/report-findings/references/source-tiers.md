# Source Authority Tiers

Comprehensive guide to assessing source credibility and appropriate usage.

## Tier 1: Primary Sources (90-100% confidence)

Definitive, authoritative sources from creators or standards bodies.

**Types**:
- **Official documentation** — API references, guides from maintainers
- **Original research** — peer-reviewed studies, verified data
- **Direct observation** — first-hand evidence, tested behavior
- **Canonical references** — specifications, RFCs, standards documents

**Use for**:
- Factual claims about behavior
- API signatures and parameters
- Performance guarantees
- Version compatibility statements

**Characteristics**:
- Created by authoritative source
- Regularly maintained
- Clear versioning
- Accountable authors

**Examples**:
- React documentation from reactjs.org
- RFC 7231 for HTTP semantics
- MDN Web Docs for browser APIs
- TypeScript Handbook from typescriptlang.org

## Tier 2: Authoritative Secondary (70-90% confidence)

Expert analysis and recognized publications.

**Types**:
- **Expert analysis** — recognized authorities in field
- **Established publications** — reputable sources with editorial standards
- **Official guides** — sanctioned tutorials, not canonical reference
- **Conference materials** — talks from recognized experts

**Use for**:
- Best practices and patterns
- Architecture recommendations
- Trade-off analysis
- Implementation strategies

**Characteristics**:
- Author has demonstrated expertise
- Editorial review process
- Citations to primary sources
- Generally current

**Examples**:
- Martin Fowler's blog on architecture
- InfoQ articles with expert authors
- Conference talks from framework maintainers
- O'Reilly technical books

## Tier 3: Community Sources (50-70% confidence)

Collective wisdom and practical experience.

**Types**:
- **Community discussions** — Stack Overflow, GitHub discussions
- **Individual analysis** — technical blogs, personal research
- **Crowd-sourced content** — wikis, collaborative documentation
- **Anecdotal evidence** — reported experiences, case studies

**Use for**:
- Practical workarounds
- Common pitfalls and gotchas
- Real-world usage patterns
- Troubleshooting approaches

**Characteristics**:
- May be outdated
- Quality varies significantly
- Often context-specific
- Needs cross-referencing

**Examples**:
- Stack Overflow answers (highly voted)
- GitHub issue discussions
- Dev.to technical articles
- Reddit technical discussions

## Tier 4: Unverified (0-50% confidence)

Use only as starting points for investigation.

**Types**:
- **Unattributed content** — no clear author or source
- **Outdated material** — age unknown or clearly stale
- **Questionable provenance** — content farms, SEO-driven sites
- **Unchecked AI content** — generated without human verification

**Use for**:
- Initial leads only
- Must verify against higher tiers
- Never cite directly

**Warning signs**:
- No author attribution
- No dates or version numbers
- Multiple ads, clickbait titles
- Generic, shallow content
- Copied from other sources

## Tier Assessment Checklist

When evaluating a source:

| Factor | Higher Tier | Lower Tier |
|--------|-------------|------------|
| Author | Known expert | Anonymous/unknown |
| Publisher | Authoritative org | Content farm |
| Date | Recent, maintained | Old, no updates |
| Citations | Links to sources | No references |
| Depth | Detailed, nuanced | Surface-level |
| Accuracy | Verifiable claims | Unverifiable |

## Usage Guidelines

### For Critical Claims

Require Tier 1 or multiple Tier 2 sources:
- Security recommendations
- Performance guarantees
- Breaking changes
- Migration paths

### For Best Practices

Accept Tier 2, cross-reference with Tier 3:
- Architecture patterns
- Code organization
- Testing strategies
- Tooling choices

### For Troubleshooting

Start with Tier 3, verify against Tier 1-2:
- Error solutions
- Workarounds
- Configuration tips
- Environment setup

## Confidence Adjustments

Factors that increase confidence:
- Multiple independent sources agree
- Source is recent and maintained
- Claims are testable and verified
- Author has relevant expertise

Factors that decrease confidence:
- Single source only
- Source is outdated
- Claims contradict other sources
- Author expertise unclear
