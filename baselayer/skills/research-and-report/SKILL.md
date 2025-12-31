---
name: research-and-report
version: 2.0.0
description: Systematic technical research combining multi-source discovery with evidence-based analysis. Delivers authoritative recommendations backed by credible sources. Use when researching best practices, evaluating technologies, comparing approaches, discovering documentation, troubleshooting with authoritative sources, or when research, documentation, evaluation, comparison, or `--research` are mentioned.
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

TodoWrite format:

```text
- Analyze Request → { scope definition }
- Discover Sources → { multi-source strategy }
- Gather Information → { key areas }
- Synthesize Findings → { comparison/evaluation }
- Compile Report → { deliverable type }
```

Situational (insert when triggered):
- Gather Information → if gaps discovered during synthesis

Workflow:
- Start: Create "Analyze Request" as `in_progress`
- Transition: Mark current `completed`, add next `in_progress`
- Simple queries: Skip directly to "Gather Information" if unambiguous
- Gaps during synthesis: Add new "Gather Information" task
- Early termination: Skip to "Compile Report" + `△ Caveats`

</phases>

<methodology>

Five-phase systematic approach:

**1. Question Phase** — Define scope and success criteria
- Decision to be made?
- Evaluation parameters? (performance, maintainability, security, adoption)
- Constraints? (timeline, expertise, infrastructure)
- Context already known?

Query types:
- Installation/Setup → prerequisites, commands, configuration
- Problem Resolution → error patterns, solutions, workarounds
- API Reference → signatures, parameters, return values
- Technology Evaluation → framework comparison, tool selection
- Best Practices → industry standards, proven patterns
- Implementation → code examples, patterns, methodologies

**2. Discovery Phase** — Multi-source retrieval

Source selection by use case:

| Use Case | Primary | Secondary | Tertiary |
|----------|---------|-----------|----------|
| Official docs | context7 | octocode | firecrawl |
| Troubleshooting | octocode issues | firecrawl community | context7 guides |
| Code examples | octocode repos | firecrawl tutorials | context7 examples |
| Technology eval | Parallel all | Cross-reference | Validate |

Progressive pattern:
1. Package discovery → `octocode.packageSearch` + `context7.resolve-library-id`
2. Multi-source parallel → `context7.get-library-docs` + `octocode.githubSearchCode` + `firecrawl.search`
3. Intelligent fallback → if context7 fails, try octocode issues → firecrawl alternatives

**3. Evaluation Phase** — Analyze against criteria

| Criterion | Metrics |
|-----------|---------|
| Performance | Benchmarks, latency, throughput, memory |
| Maintainability | Code complexity, docs quality, community activity |
| Security | CVEs, audits, compliance (OWASP, CWE) |
| Adoption | Downloads, production usage, industry patterns |
| Ecosystem | Integrations, plugins, tooling |

Source authority hierarchy:
1. Official Documentation → creators/maintainers
2. Standards Bodies → RFCs, W3C, IEEE, ISO
3. Benchmark Studies → performance comparisons
4. Case Studies → real-world implementations
5. Community Consensus → adoption patterns, surveys

**4. Comparison Phase** — Systematic tradeoff analysis

Comparison matrix:

```
| Criterion   | Option A | Option B | Option C |
|-------------|----------|----------|----------|
| Performance | 10k/s    | 15k/s    | 8k/s     |
| Learning    | Moderate | Steep    | Gentle   |
| Ecosystem   | Large    | Medium   | Small    |
```

For each option document:
- Strengths → what it excels at + evidence
- Weaknesses → limitations + edge cases
- Best fit → when this is the right choice
- Deal breakers → when this fails

**5. Recommendation Phase** — Clear guidance with rationale

Structure:
- Primary Recommendation → clear statement + rationale + confidence
- Alternatives → when to consider + tradeoffs
- Implementation → next steps + pitfalls + validation
- Limitations → edge cases + gaps + assumptions

</methodology>

<quality_control>

Before delivering findings:
- Version is latest stable
- Docs match user context (language, framework)
- Critical info cross-referenced across sources
- Code examples complete and runnable

</quality_control>

<tools>

Multi-source orchestration:

**context7** — Official library documentation
- `resolve-library-id(name)` → get doc ID
- `get-library-docs(id, topic)` → focused retrieval
- Best for: API references, official guides
- Optimize: Use specific topics, avoid broad queries

**octocode** — GitHub repository intelligence
- `packageSearch(name)` → repo metadata
- `githubSearchCode(query)` → real implementations
- `githubSearchIssues(query)` → troubleshooting
- `githubViewRepoStructure(owner/repo)` → structure
- Best for: Code examples, community solutions, package discovery

**firecrawl** — Web documentation and community
- `search(query)` → web results
- `scrape(url, formats=['markdown'])` → extract content
- `map(url)` → discover structure before crawling
- Best for: Tutorials, Stack Overflow, blog posts, benchmarks
- Optimize: Use `onlyMainContent=true`, `maxAge` for caching

Parallel execution pattern:

```javascript
await Promise.all([
  context7.resolve(name),
  octocode.packageSearch(name),
  firecrawl.search(query)
]).then(consolidateResults)
```

Fallback chain:

```
context7 fails → octocode issues → firecrawl alternatives
Empty docs → broader topic → web search
Rate limit → alternate MCP → manual search guidance
```

</tools>

<discovery_patterns>

**Library Installation**
1. `octocode.packageSearch(name)` → repo, version, deps
2. `context7.resolve-library-id(name)` → doc ID
3. `context7.get-library-docs(id, topic="installation")` → official guide
4. Compress → commands, prerequisites, framework integration, pitfalls

**Error Resolution**
1. Parse error → extract key terms
2. `octocode.githubSearchIssues(pattern)` → related issues
3. `context7.get-library-docs(id, topic="troubleshooting")` → official fixes
4. `firecrawl.search(error_message)` → community solutions
5. Synthesize → rank by authority, provide fixes, prevention

**API Exploration**
1. `context7.resolve-library-id(name)` → doc ID
2. `context7.get-library-docs(id, topic="api")` → reference
3. `octocode.githubSearchCode(examples)` → real usage
4. Structure → options table, patterns, examples

**Technology Comparison**
1. Parallel across all sources for each option
2. Cross-reference official docs + GitHub + web
3. Create matrix → quantified + qualitative factors
4. Recommend → primary + alternatives + implementation

</discovery_patterns>

<findings_format>

Two output modes based on research type:

**Evaluation Mode** (claims and recommendations):

```
Finding: { assertion or claim }
Source: { authoritative source with link }
Confidence: High/Medium/Low — { brief rationale }
Verify: { how to validate this finding }
```

**Discovery Mode** (searching and gathering):

```
Found: { what was discovered }
Source: { where it came from with link }
Notes: { relevant context or caveats }
```

Use Evaluation Mode when making recommendations or assertions.
Use Discovery Mode when gathering options or looking things up.
Mix modes as appropriate within a single research session.

</findings_format>

<response_structure>

```markdown
## Research Summary
Brief overview — what investigated, methodology, sources consulted.

## Options Discovered
1. **Option A** — description, key characteristics
2. **Option B** — description, key characteristics
3. **Option C** — description, key characteristics

## Comparison Matrix
| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Key metrics for easy comparison              |

## Recommendation

### Primary: [Option Name]
**Rationale**: Detailed reasoning + supporting evidence

**Strengths**:
- Specific advantages with quantified data when available

**Tradeoffs**:
- Acknowledged limitations and considerations

**Confidence**: High/Medium/Low with explanation

### Alternatives
When primary may not fit:
- Scenario X → Consider Option Y because...

## Implementation Guidance
**Next Steps**:
1. Specific action items
2. Configuration recommendations
3. Validation criteria

**Common Pitfalls**:
- Pitfall 1 → How to avoid
- Pitfall 2 → How to avoid

**Migration** (if applicable):
- Path from current to recommended

## Authoritative Sources
- **Official Docs**: [Direct links]
- **Benchmarks**: [Performance comparisons]
- **Case Studies**: [Real-world examples]
- **Community**: [Discussions, blog posts]

---

> Context Usage: XXX tokens (XX% compression achieved)
> Sources: context7 | octocode | firecrawl
```

</response_structure>

<quality>

Always include:
- Direct citations to authoritative sources with links
- Quantified comparisons when available (metrics, statistics)
- Acknowledged limitations and edge cases
- Context about when recommendations may not apply
- Confidence levels and areas needing further investigation

Always validate:
- Version is latest stable (no alpha/beta unless requested)
- Documentation matches user's framework/language/context
- Critical information cross-referenced across sources
- Code examples complete and runnable
- No critical information lost in compression

Always consider:
- User expertise level if apparent
- Project context (languages, frameworks, infrastructure)
- Previous failed attempts mentioned
- Constraints and requirements stated
- Security implications and best practices

</quality>

<proactive>

When detecting common patterns:

**Outdated Patterns**

```
User mentions deprecated approach
→ Flag deprecation
→ Suggest modern alternative
→ Provide migration path
```

**Missing Prerequisites**

```
Feature requires setup
→ Include prerequisite steps
→ Validate environment requirements
→ Provide configuration guidance
```

**Common Pitfalls**

```
Topic has known gotchas
→ Add prevention notes
→ Include troubleshooting tips
→ Reference common issues
```

**Related Tools**

```
Solution has complementary tools
→ Mention related libraries
→ Explain integration patterns
→ Provide ecosystem context
```

</proactive>

<rules>

ALWAYS:
- Create "Analyze Request" todo at session start
- Update todos when transitioning phases
- One phase `in_progress` at a time
- Mark phases `completed` before advancing
- Use multi-source approach (context7, octocode, firecrawl)
- Provide direct citations with links
- Cross-reference critical information
- Include confidence levels and limitations
- Validate code examples are complete and runnable

NEVER:
- Skip "Analyze Request" phase without defining scope
- Single-source when multi-source available
- Deliver recommendations without citations
- Include deprecated approaches without flagging
- Omit limitations and edge cases
- Regress phases — add new tasks if gaps discovered
- Leave "Compile Report" unmarked after delivering

</rules>

<references>

- [source-hierarchy.md](references/source-hierarchy.md) — authority evaluation details
- [tool-selection.md](references/tool-selection.md) — MCP server decision matrix
- [examples/](examples/) — research session examples
- [FORMATTING.md](../../shared/rules/FORMATTING.md) — formatting conventions

</references>
