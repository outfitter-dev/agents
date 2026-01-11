---
name: research-and-report
version: 2.0.0
description: This skill should be used when researching best practices, evaluating technologies, comparing approaches, or when "research", "evaluation", or "comparison" are mentioned.
---

# Research

Systematic investigation → evidence-based analysis → authoritative recommendations.

<when_to_use>

- Technology evaluation and comparison
- Documentation discovery and troubleshooting
- Best practices and industry standards research
- Implementation guidance with authoritative sources

NOT for: quick lookups, well-known patterns, time-critical debugging without investigation phase

</when_to_use>

<phases>

Track with TodoWrite. Phases advance only, never regress.

| Phase | Trigger | activeForm |
|-------|---------|------------|
| Analyze Request | Session start | "Analyzing research request" |
| Discover Sources | Criteria defined | "Discovering sources" |
| Gather Information | Sources identified | "Gathering information" |
| Synthesize Findings | Information gathered | "Synthesizing findings" |
| Compile Report | Synthesis complete | "Compiling report" |

Workflow:
- Start: Create "Analyze Request" as `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- Simple queries: Skip directly to "Gather Information" if unambiguous
- Gaps during synthesis: Add new "Gather Information" task
- Early termination: Skip to "Compile Report" with caveats

</phases>

<methodology>

Five-phase systematic approach:

**1. Question Phase** — Define scope
- Decision to be made?
- Evaluation parameters? (performance, maintainability, security, adoption)
- Constraints? (timeline, expertise, infrastructure)

**2. Discovery Phase** — Multi-source retrieval

| Use Case | Primary | Secondary | Tertiary |
|----------|---------|-----------|----------|
| Official docs | context7 | octocode | firecrawl |
| Troubleshooting | octocode issues | firecrawl community | context7 guides |
| Code examples | octocode repos | firecrawl tutorials | context7 examples |
| Technology eval | Parallel all | Cross-reference | Validate |

**3. Evaluation Phase** — Analyze against criteria

| Criterion | Metrics |
|-----------|---------|
| Performance | Benchmarks, latency, throughput, memory |
| Maintainability | Code complexity, docs quality, community activity |
| Security | CVEs, audits, compliance |
| Adoption | Downloads, production usage, industry patterns |

**4. Comparison Phase** — Systematic tradeoff analysis

For each option: Strengths → Weaknesses → Best fit → Deal breakers

**5. Recommendation Phase** — Clear guidance with rationale

Primary recommendation → Alternatives → Implementation steps → Limitations

</methodology>

<tools>

Three MCP servers for multi-source research:

| Tool | Best For | Key Functions |
|------|----------|---------------|
| **context7** | Official docs, API refs | `resolve-library-id`, `get-library-docs` |
| **octocode** | Code examples, issues | `packageSearch`, `githubSearchCode`, `githubSearchIssues` |
| **firecrawl** | Tutorials, benchmarks | `search`, `scrape`, `map` |

Execution patterns:
- **Parallel**: Run independent queries simultaneously for speed
- **Fallback**: context7 → octocode → firecrawl if primary fails
- **Progressive**: Start broad, narrow based on findings

See [tool-selection.md](references/tool-selection.md) for detailed usage.

</tools>

<discovery_patterns>

Common research workflows:

| Scenario | Approach |
|----------|----------|
| **Library Installation** | Package search → Official docs → Installation guide |
| **Error Resolution** | Parse error → Search issues → Official troubleshooting → Community solutions |
| **API Exploration** | Documentation ID → API reference → Real usage examples |
| **Technology Comparison** | Parallel all sources → Cross-reference → Build matrix → Recommend |

See [discovery-patterns.md](references/discovery-patterns.md) for detailed workflows.

</discovery_patterns>

<findings_format>

Two output modes:

**Evaluation Mode** (recommendations):
```
Finding: { assertion }
Source: { authoritative source with link }
Confidence: High/Medium/Low — { rationale }
```

**Discovery Mode** (gathering):
```
Found: { what was discovered }
Source: { where from with link }
Notes: { context or caveats }
```

</findings_format>

<response_structure>

```markdown
## Research Summary
Brief overview — what investigated, sources consulted.

## Options Discovered
1. **Option A** — description
2. **Option B** — description

## Comparison Matrix
| Criterion | Option A | Option B |
|-----------|----------|----------|

## Recommendation
### Primary: [Option Name]
**Rationale**: reasoning + evidence
**Confidence**: level + explanation

### Alternatives
When to choose differently.

## Implementation Guidance
Next steps, common pitfalls, validation.

## Sources
- Official, benchmarks, case studies, community
```

</response_structure>

<quality>

**Always include**:
- Direct citations with links
- Confidence levels and limitations
- Context about when recommendations may not apply

**Always validate**:
- Version is latest stable
- Documentation matches user context
- Critical info cross-referenced
- Code examples complete and runnable

**Proactively flag**:
- Deprecated approaches with modern alternatives
- Missing prerequisites
- Common pitfalls and gotchas
- Related tools in ecosystem

</quality>

<rules>

ALWAYS:
- Create "Analyze Request" todo at session start
- One phase `in_progress` at a time
- Use multi-source approach (context7, octocode, firecrawl)
- Provide direct citations with links
- Cross-reference critical information
- Include confidence levels and limitations

NEVER:
- Skip "Analyze Request" phase without defining scope
- Single-source when multi-source available
- Deliver recommendations without citations
- Include deprecated approaches without flagging
- Omit limitations and edge cases

</rules>

<references>

**Deep-dive documentation**:
- [source-hierarchy.md](references/source-hierarchy.md) — authority evaluation details
- [tool-selection.md](references/tool-selection.md) — MCP server decision matrix
- [discovery-patterns.md](references/discovery-patterns.md) — detailed research workflows

**Related resources**:
- [FORMATTING.md](../../shared/rules/FORMATTING.md) — formatting conventions

</references>
