---
name: research
description: This skill should be used when researching best practices, evaluating technologies, comparing approaches, or when "research", "evaluation", or "comparison" are mentioned.
metadata:
  version: "2.1.0"
  related-skills:
    - report-findings
    - codebase-recon
---

# Research

Systematic investigation → evidence-based analysis → authoritative recommendations.

## Steps

1. Define scope and evaluation criteria
2. Discover sources using MCP tools (context7, octocode, firecrawl)
3. Gather information with multi-source approach
4. Load the `outfitter:report-findings` skill for synthesis
5. Compile report with confidence levels and citations

<when_to_use>

- Technology evaluation and comparison
- Documentation discovery and troubleshooting
- Best practices and industry standards research
- Implementation guidance with authoritative sources

NOT for: quick lookups, well-known patterns, time-critical debugging without investigation stage

</when_to_use>

<stages>

Load the **maintain-tasks** skill for stage tracking. Stages advance only, never regress.

| Stage | Trigger | activeForm |
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

</stages>

<methodology>

Five-stage systematic approach:

**1. Question Stage** — Define scope
- Decision to be made?
- Evaluation parameters? (performance, maintainability, security, adoption)
- Constraints? (timeline, expertise, infrastructure)

**2. Discovery Stage** — Multi-source retrieval

| Use Case | Primary | Secondary | Tertiary |
|----------|---------|-----------|----------|
| Official docs | context7 | octocode | firecrawl |
| Troubleshooting | octocode issues | firecrawl community | context7 guides |
| Code examples | octocode repos | firecrawl tutorials | context7 examples |
| Technology eval | Parallel all | Cross-reference | Validate |

**3. Evaluation Stage** — Analyze against criteria

| Criterion | Metrics |
|-----------|---------|
| Performance | Benchmarks, latency, throughput, memory |
| Maintainability | Code complexity, docs quality, community activity |
| Security | CVEs, audits, compliance |
| Adoption | Downloads, production usage, industry patterns |

**4. Comparison Stage** — Systematic tradeoff analysis

For each option: Strengths → Weaknesses → Best fit → Deal breakers

**5. Recommendation Stage** — Clear guidance with rationale

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
- One stage `in_progress` at a time
- Use multi-source approach (context7, octocode, firecrawl)
- Provide direct citations with links
- Cross-reference critical information
- Include confidence levels and limitations

NEVER:
- Skip "Analyze Request" stage without defining scope
- Single-source when multi-source available
- Deliver recommendations without citations
- Include deprecated approaches without flagging
- Omit limitations and edge cases

</rules>

<references>

- [source-hierarchy.md](references/source-hierarchy.md) — authority evaluation details
- [tool-selection.md](references/tool-selection.md) — MCP server decision matrix
- [discovery-patterns.md](references/discovery-patterns.md) — detailed research workflows

**Research vs Report-Findings**:
- This skill (`research`) covers the full investigation workflow using MCP tools
- `report-findings` skill covers synthesis, source assessment, and presentation

Use `research` for technology evaluation, documentation discovery, and best practices research. Load `report-findings` during synthesis stage for source authority assessment and confidence calibration.

</references>
