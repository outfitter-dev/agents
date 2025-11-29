---
name: research
version: 1.1.0
description: Comprehensive research methodology for technical questions, documentation discovery, technology evaluation, and solution comparison. Combines systematic investigation with multi-source documentation retrieval (context7, octocode, firecrawl) and TodoWrite progress tracking. Use when researching best practices, evaluating technologies, comparing approaches, discovering documentation, troubleshooting with authoritative sources, or when research, documentation, evaluation, comparison, or `--research` flag are mentioned.
---

# Research

Systematic technical research combining evidence-based investigation with efficient documentation discovery. Provides authoritative recommendations backed by credible sources while minimizing context usage through intelligent compression.

## Quick Start

1. Create "Analyze Request" todo as `in_progress` via TodoWrite
2. Define research scope and success criteria
3. Update todos as you progress through phases (see Progress Tracking)
4. Execute multi-source discovery (context7, octocode, firecrawl)
5. Synthesize findings and provide recommendations
6. Mark "Compile Report" complete when research delivered

Research follows a structured five-phase approach:

1. **Question Phase**: Define what needs to be discovered and success criteria
2. **Discovery Phase**: Find relevant sources using context7, octocode, and firecrawl
3. **Evaluation Phase**: Analyze options against defined criteria
4. **Comparison Phase**: Create systematic comparisons showing tradeoffs
5. **Recommendation Phase**: Provide clear recommendations with supporting evidence

## Progress Tracking

Use TodoWrite to show research progression. Create todos at session start, update as you advance.

**Core Phases:**

| Phase | Trigger | activeForm |
|-------|---------|------------|
| **Analyze Request** | Session start | "Analyzing research request" |
| **Discover Sources** | Request understood, criteria defined | "Discovering sources" |
| **Gather Information** | Sources identified | "Gathering information" |
| **Synthesize Findings** | Information gathered | "Synthesizing findings" |
| **Compile Report** | Synthesis complete | "Compiling report" |

**Workflow:**
- On session start: Create "Analyze Request" as `in_progress`
- On phase transition: Mark current phase `completed`, add next phase as `in_progress`
- Only one phase should be `in_progress` at a time

**Edge Cases:**
- **Simple queries**: If request is unambiguous and narrow (e.g., "How to install X?"), complete "Analyze Request" immediately and skip to "Gather Information"
- **Parallel discovery**: During "Discover Sources", you may execute multiple source lookups concurrently — track as single phase
- **Iterative deepening**: If "Synthesize Findings" reveals gaps requiring more gathering, add new "Gather Information" task as `in_progress` while keeping "Synthesize Findings" as `pending`
- **Early termination**: If sources are unavailable or query is unanswerable, complete current phase and skip to "Compile Report" with limitations documented

## Research Methodology

### 1. Question Phase

Clearly define the research scope before discovery:

**Define Success Criteria:**
- What decision needs to be made?
- What evaluation parameters matter? (performance, maintainability, security, adoption)
- What constraints apply? (timeline, expertise, existing infrastructure)
- What context is already known?

**Identify Query Type:**
- Installation/Setup: Prerequisites, commands, configuration
- Problem Resolution: Error patterns, solutions, workarounds
- API Reference: Signatures, parameters, return values
- Technology Evaluation: Framework comparison, tool selection
- Best Practices: Industry standards, proven patterns
- Implementation: Code examples, patterns, methodologies

**Phase Transition**: Once research scope and success criteria are defined, mark "Analyze Request" as `completed` and create "Discover Sources" as `in_progress`. For simple/narrow queries, skip directly to "Gather Information".

### 2. Discovery Phase

Use multi-source documentation retrieval for comprehensive coverage:

**Source Selection Strategy:**

For official library documentation:
- Primary: `context7` (always resolve library ID first)
- Secondary: `octocode` (GitHub docs, repository structure)
- Tertiary: `firecrawl` (external tutorials, web documentation)

For troubleshooting/community knowledge:
- Primary: `octocode` (search issues, PRs, discussions)
- Secondary: `firecrawl` (blog posts, Stack Overflow, community sites)
- Tertiary: `context7` (official troubleshooting guides)

For code examples:
- Primary: `octocode` (real implementations, repository examples)
- Secondary: `firecrawl` (tutorial sites, CodePen, Gists)
- Tertiary: `context7` (official examples in documentation)

For technology evaluation:
- Parallel search across all sources
- Cross-reference multiple sources for validation
- Prioritize benchmark studies and case studies

**Progressive Discovery Pattern:**

Step 1: Package/Library Discovery
```
JavaScript/Python:
- octocode.packageSearch(name) → repo URL, version, deps
- context7.resolve-library-id(name) → official docs ID

Rust:
- Search crates.io → crate page, repo, version
- octocode.githubViewRepoStructure(repo) → structure
```

Step 2: Multi-Source Retrieval (parallel execution)
```
CONCURRENT:
- context7.get-library-docs(id, topic=focused_topic)
- octocode.githubSearchCode(queryTerms)
- octocode.githubSearchIssues(query)
- firecrawl.search(query) for web content

THEN:
- octocode.githubGetFileContent(path) from search results
- firecrawl.scrape(url) for specific tutorials
- context7.get-library-docs with refined topics
```

Step 3: Intelligent Fallback Chain
```
IF context7 fails:
  → octocode.githubSearchIssues(repo, question)
  → octocode.githubSearchCode(expanded_terms)
  → firecrawl.search(query) for alternatives

IF no official docs:
  → Focus on community resources via firecrawl
  → Extract patterns from real implementations
  → Search GitHub issues for solutions
```

**Phase Transition**: Once relevant sources are identified, mark "Discover Sources" as `completed` and create "Gather Information" as `in_progress`.

### 3. Evaluation Phase

Analyze discovered options systematically:

**Evaluation Criteria:**

Performance:
- Quantified benchmarks (throughput, latency, memory)
- Load testing results from authoritative sources
- Scalability characteristics

Maintainability:
- Code complexity and readability
- Documentation quality and completeness
- Community activity and support

Security:
- Known vulnerabilities and CVEs
- Security audit results
- Compliance with standards (OWASP, CWE)

Adoption:
- Download statistics and trends
- Production usage at scale
- Industry adoption patterns

Ecosystem:
- Integration capabilities
- Available plugins/extensions
- Tooling support

**Source Authority Hierarchy:**

Prioritize sources in this order:
1. Official Documentation: Primary source from creators/maintainers
2. Standards Bodies: RFCs, W3C, IEEE, ISO specifications
3. Benchmark Studies: Performance comparisons, load testing results
4. Case Studies: Real-world implementations, post-mortems
5. Community Consensus: Adoption patterns, survey results, expert opinions

**Phase Transition**: Once information is gathered and evaluated, mark "Gather Information" as `completed` and create "Synthesize Findings" as `in_progress`. If gaps are discovered during synthesis, add a new "Gather Information" task (see Edge Cases).

### 4. Comparison Phase

Create systematic comparisons showing tradeoffs:

**Comparison Matrix Format:**

| Feature/Criterion | Option A | Option B | Option C |
|-------------------|----------|----------|----------|
| Performance       | 10k req/s | 15k req/s | 8k req/s |
| Learning Curve    | Moderate | Steep | Gentle |
| Ecosystem Size    | Large | Medium | Small |
| Adoption          | High | Growing | Niche |
| License           | MIT | Apache 2.0 | GPL |

**Tradeoff Analysis:**

For each option, document:
- Strengths: What it excels at with supporting evidence
- Weaknesses: Limitations and edge cases
- Best fit: When this option is the right choice
- Deal breakers: Scenarios where this option fails

**Phase Transition**: Once synthesis and comparison are complete, mark "Synthesize Findings" as `completed` and create "Compile Report" as `in_progress`.

### 5. Recommendation Phase

Provide clear recommendations with detailed rationale:

**Recommendation Structure:**

Primary Recommendation:
- Clear statement of recommended approach
- Detailed rationale with supporting evidence
- Confidence level (high/medium/low)

Alternative Options:
- When to consider alternatives
- Tradeoffs to be aware of
- Migration considerations if switching

Implementation Guidance:
- Practical next steps
- Common pitfalls to avoid
- Success criteria and validation

Limitations:
- Edge cases where recommendation may not apply
- Areas requiring further investigation
- Assumptions made in analysis

**Phase Transition**: Once final report is compiled and delivered, mark "Compile Report" as `completed`.

## Context Compression

Achieve 70-85% token reduction while maintaining accuracy:

**Token Budget Allocation:**

| Query Type      | Token Budget | Compression Target |
|-----------------|--------------|-------------------|
| Quick Reference | 800 tokens   | 85% reduction     |
| Installation    | 1200 tokens  | 80% reduction     |
| Troubleshooting | 1500 tokens  | 75% reduction     |
| Comprehensive   | 2000 tokens  | 70% reduction     |

**Compression Techniques:**

1. Semantic Extraction: Remove everything except query-relevant content
2. Code Prioritization: Replace verbose explanations with working code
3. Hierarchy Enforcement: Essential > Important > Nice-to-have > Reference
4. Deduplication: Merge similar information from multiple sources
5. Format Optimization: Use structured bullets over paragraphs
6. Aggressive Boilerplate Removal: Navigation, ads, redundant content

**Quality Assurance Before Output:**

Accuracy Check:
- Verify version is latest stable
- Confirm documentation matches user's context
- Cross-reference critical information across sources

Compression Validation:
- Ensure within token budget for query type
- Verify no critical information lost
- Confirm code examples are complete and runnable

Relevance Scoring:
- Essential (100%): Include always
- Important (70%): Include for comprehensive queries
- Supplementary (40%): Include only if space allows
- Remove anything scoring below 40% relevance

## Response Structure

Structure all research responses as follows:

```markdown
## Research Summary

Brief overview of what was investigated, methodology used, and sources consulted.

## Options Discovered

Present 2-4 viable approaches with concise descriptions:

1. **Option A**: Brief description, key characteristics
2. **Option B**: Brief description, key characteristics
3. **Option C**: Brief description, key characteristics

## Comparison Matrix

| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Key metrics in tabular format for easy comparison |

## Recommendation

### Primary Recommendation: [Option Name]

**Rationale**: Detailed reasoning with supporting evidence

**Strengths**:
- Specific advantages with quantified data when available

**Tradeoffs**:
- Acknowledged limitations and considerations

**Confidence**: High/Medium/Low with explanation

### Alternative Considerations

When primary recommendation may not fit:
- Scenario X: Consider Option Y because...
- Scenario Z: Consider Option W because...

## Implementation Guidance

**Next Steps**:
1. Specific action items
2. Configuration recommendations
3. Validation criteria

**Common Pitfalls**:
- Pitfall 1: How to avoid
- Pitfall 2: How to avoid

**Migration Considerations** (if applicable):
- Path from current state to recommended solution

## Authoritative Sources

- **Official Documentation**: [Direct links to primary sources]
- **Benchmarks**: [Performance comparison links]
- **Case Studies**: [Real-world implementation examples]
- **Community Resources**: [Relevant discussions, blog posts]

---

> Context Usage: XXX tokens (XX% compression achieved)
> Sources: context7 | octocode | firecrawl
```

## Research Focus Areas

**Best Practices:**
- Industry standards and specifications
- Proven patterns and methodologies
- Community consensus and conventions
- Established architectural patterns

**Technology Evaluation:**
- Framework and library comparisons
- Tool selection criteria
- Performance characteristics
- Ecosystem maturity and support

**Standards Compliance:**
- RFC specifications
- W3C, IEEE, ISO standards
- Regulatory requirements
- Security standards (OWASP, CWE)

**Prior Art Analysis:**
- Existing solutions and approaches
- Case studies and post-mortems
- Lessons learned from production
- Migration experiences and patterns

**Modern Approaches:**
- Recent developments and trends
- Emerging patterns and practices
- Evolution from legacy approaches
- Cutting-edge techniques with caveats

## Documentation Discovery Patterns

### Pattern 1: Library Installation

```
1. octocode.packageSearch("library-name")
   → Get repository URL, latest version, dependencies

2. context7.resolve-library-id("library-name")
   → Get official documentation ID

3. context7.get-library-docs(id, topic="installation quickstart")
   → Get official installation guide

4. octocode.githubViewRepoStructure(owner/repo)
   → Get advanced setup patterns

5. Compress and synthesize:
   → Extract commands
   → Merge prerequisites
   → Prioritize framework integration
   → Include common pitfalls
```

### Pattern 2: Error Resolution

```
1. Parse error message and extract key terms

2. octocode.githubSearchIssues(query="error pattern library")
   → Find related issues and discussions

3. context7.get-library-docs(id, topic="troubleshooting errors")
   → Get official troubleshooting guide

4. firecrawl.search(query="error message solution")
   → Find community solutions

5. Synthesize solutions:
   → Rank by frequency and authority
   → Provide code fixes
   → Include prevention strategies
```

### Pattern 3: API Exploration

```
1. context7.resolve-library-id("library")
   → Get documentation ID

2. context7.get-library-docs(id, topic="api configuration")
   → Get official API reference

3. octocode.githubSearchCode("config examples")
   → Find real-world usage

4. Compress and structure:
   → Create options table
   → Include common patterns
   → Remove verbose descriptions
   → Add practical examples
```

### Pattern 4: Technology Comparison

```
1. Parallel discovery across all options:
   - context7.get-library-docs for each option
   - octocode.packageSearch for adoption metrics
   - firecrawl.search for benchmarks and case studies

2. Cross-reference multiple sources:
   - Official docs for capabilities
   - GitHub for activity and issues
   - Web for independent benchmarks

3. Create comparison matrix:
   - Quantified metrics (performance, adoption)
   - Qualitative factors (DX, documentation)
   - Ecosystem considerations

4. Provide recommendation:
   - Clear primary choice with rationale
   - Alternatives for specific scenarios
   - Implementation guidance
```

## Advanced Techniques

### Parallel Search Optimization

Execute multiple searches concurrently when dealing with unknown or ambiguous queries:

```javascript
// Conceptual parallel execution
await Promise.all([
  context7.resolve-library-id(name),
  octocode.packageSearch(name),
  octocode.githubViewRepoStructure(repo),
  firecrawl.search(query)
]).then(consolidateResults)
```

### Caching Strategy

Maintain session-level cache for:
- Resolved library IDs (context7)
- Repository structures (octocode)
- Package metadata (octocode)
- Scraped web content (firecrawl with maxAge)
- Frequently accessed documentation sections

### Error Recovery Matrix

| Failure Type         | Primary Recovery        | Secondary Recovery      |
|---------------------|------------------------|------------------------|
| context7 timeout     | Use cached if <5min old | octocode + firecrawl    |
| No library ID found  | Try alternate names     | octocode package search |
| Empty documentation  | Broader topic search    | firecrawl web search    |
| Rate limit hit       | Use alternate MCP       | Provide manual search   |
| Dynamic content fail | firecrawl with actions  | Manual navigation guide |

### Firecrawl Optimization

**When to Use Firecrawl:**
- Web documentation (blogs, tutorials, Stack Overflow)
- Dynamic content requiring JavaScript interaction
- Structured data extraction from web pages
- Comprehensive web search for community knowledge
- Cached content for frequently accessed pages (500% faster with maxAge)

**Optimization Techniques:**
1. Format Selection: Use `formats=['markdown']` for documentation
2. Content Filtering: Use `onlyMainContent=true` to skip navigation/ads
3. Smart Caching: Set `maxAge=3600000` (1 hour) for stable content
4. Batch Operations: Use `firecrawl.map` to discover URLs before crawling
5. Actions for Dynamic Content: Use wait/click/scroll for interactive docs

## Quality Standards

**Always Include:**
- Direct citations to authoritative sources with links
- Quantified comparisons when available (metrics, statistics)
- Acknowledged limitations and edge cases
- Context about when recommendations may not apply
- Confidence levels and areas needing further investigation

**Always Validate:**
- Version is latest stable (no alpha/beta unless requested)
- Documentation matches user's framework/language/context
- Critical information cross-referenced across sources
- Code examples are complete and runnable
- No critical information lost in compression

**Always Consider:**
- User's expertise level if apparent from context
- Project context (languages, frameworks, infrastructure)
- Previous failed attempts mentioned
- Constraints and requirements stated
- Security implications and best practices

## Source Evaluation Criteria

When evaluating source credibility:

**Official Documentation (Highest Authority):**
- Published by library/framework creators
- Maintained in official repository
- Version-specific and up-to-date
- Directly accessible via context7 or official site

**Standards Bodies (High Authority):**
- RFCs (Internet Engineering Task Force)
- W3C specifications
- IEEE, ISO standards
- Industry-specific standards organizations

**Benchmark Studies (High Authority):**
- Reproducible methodology clearly documented
- Independent testing (not vendor-sponsored)
- Recent data (within last year preferred)
- Multiple scenarios tested

**Case Studies (Medium-High Authority):**
- Production implementation at scale
- Detailed post-mortems with metrics
- Lessons learned and recommendations
- Transparent about challenges and failures

**Community Consensus (Medium Authority):**
- Widespread adoption patterns
- Survey results from reputable sources
- Expert opinions from recognized authorities
- Consistent patterns across multiple sources

**Blog Posts/Tutorials (Medium-Low Authority):**
- Author's expertise and credentials
- Recency of publication
- Technical depth and accuracy
- Community validation (comments, shares)

## Citation and Attribution Practices

**Direct Citations:**
Always provide direct links to sources:
```markdown
According to the [PostgreSQL Documentation](https://postgresql.org/docs/current/...),
index performance improves by 3-5x when using partial indexes for sparse data.
```

**Benchmarks:**
Include methodology and context:
```markdown
[Independent benchmark by TechEmpower](https://link) shows Framework A achieving
15,000 req/s compared to Framework B's 10,000 req/s under equivalent load
(16 cores, 32GB RAM, PostgreSQL backend).
```

**Community Sources:**
Acknowledge when relying on community knowledge:
```markdown
Common pattern observed across multiple implementations
([Example 1](link), [Example 2](link), [Example 3](link))
```

**Confidence Indicators:**
Be explicit about certainty:
```markdown
High Confidence: Verified across official docs, benchmarks, and case studies
Medium Confidence: Supported by official docs and community consensus
Low Confidence: Limited sources, requires further validation
```

## Examples

### Example 1: Technology Comparison

Query: "Should I use PostgreSQL, MongoDB, or SQLite for my SaaS application?"

Research Process:
1. Define criteria: Performance, scalability, ACID compliance, query flexibility
2. Discover: context7 docs for each, firecrawl for benchmarks, octocode for adoption
3. Evaluate: Compare against SaaS requirements (multi-tenancy, transactions, scale)
4. Compare: Create matrix of features, performance, operational complexity
5. Recommend: PostgreSQL with detailed rationale and alternatives

### Example 2: Best Practices Discovery

Query: "What are the current best practices for REST API design?"

Research Process:
1. Define scope: API design principles, versioning, authentication, documentation
2. Discover: RFCs (HTTP specs), context7 (framework docs), firecrawl (case studies)
3. Evaluate: Authority of sources, recency, industry adoption
4. Synthesize: Common patterns across authoritative sources
5. Recommend: Structured best practices with supporting citations

### Example 3: Documentation Discovery

Query: "How do I configure React Query with Next.js App Router?"

Research Process:
1. Identify query type: Installation + configuration
2. Discover: octocode.packageSearch → context7.get-library-docs → firecrawl.search
3. Compress: Extract installation steps, configuration examples, Next.js specifics
4. Validate: Cross-reference official docs with community examples
5. Output: Compressed guide with working code (80% token reduction)

### Example 4: Error Resolution

Query: "Why am I getting 'Cannot read property of undefined' with Zustand persist?"

Research Process:
1. Parse error: Zustand + persist middleware + undefined property
2. Discover: octocode.githubSearchIssues → context7.get-library-docs(troubleshooting)
3. Analyze: Common causes, official solutions, community workarounds
4. Synthesize: Ranked solutions by frequency and authority
5. Output: Code fixes with prevention strategies

## Proactive Enhancements

When detecting common patterns in queries:

**Outdated Patterns:**
```
User query mentions deprecated approach
→ Flag deprecation
→ Suggest modern alternative
→ Provide migration path
```

**Missing Prerequisites:**
```
User asks about feature requiring setup
→ Include prerequisite steps
→ Validate environment requirements
→ Provide configuration guidance
```

**Common Pitfalls:**
```
Topic has known gotchas
→ Add prevention notes
→ Include troubleshooting tips
→ Reference common issues
```

**Related Tools:**
```
Primary solution has complementary tools
→ Mention related libraries
→ Explain integration patterns
→ Provide ecosystem context
```

## Performance Metrics

Track and optimize for:

**Token Efficiency:**
- Input tokens / Output tokens (target: >4x compression)
- Measured per query type (see Token Budget Allocation table)

**Source Coverage:**
- Percentage of queries using multi-source approach (target: >80%)
- Cross-referencing multiple sources for validation

**Cache Hit Rate:**
- Percentage of queries using cached data (target: >30%)
- Reduces latency and API usage

**Success Rate:**
- Percentage of queries fully resolved (target: >95%)
- Measured by user satisfaction and follow-up questions

## Tool Selection Reference

| Task Type              | Primary Tool                  | Secondary Tools                  |
|-----------------------|------------------------------|----------------------------------|
| Official API docs     | context7.get-library-docs     | octocode.githubViewRepoStructure |
| Package discovery     | octocode.packageSearch        | context7.resolve-library-id      |
| Code examples         | octocode.githubSearchCode     | firecrawl.search                 |
| Web tutorials         | firecrawl.search/scrape       | firecrawl.deep_research          |
| Repository docs       | octocode.githubViewRepoStructure | firecrawl.scrape              |
| Troubleshooting       | octocode.githubSearchIssues   | firecrawl.search                 |
| Technology comparison | Parallel across all sources   | Cross-reference for validation   |
| Standards/RFCs        | firecrawl.scrape              | context7 for implementations     |
| Benchmarks            | firecrawl.search              | octocode for test implementations|
| Case studies          | firecrawl.search              | octocode for code examples       |

## Critical Rules

**ALWAYS:**
- Create "Analyze Request" todo at session start
- Update todos when transitioning between phases
- Mark exactly one phase as `in_progress` at a time
- Mark phases `completed` before advancing to next phase
- Use multi-source approach (context7, octocode, firecrawl) for comprehensive coverage
- Provide direct citations to authoritative sources with links
- Cross-reference critical information across multiple sources
- Include confidence levels and limitations in recommendations
- Validate that code examples are complete and runnable
- Achieve target token compression (70-85%) for query type

**NEVER:**
- Skip "Analyze Request" phase — always define scope and criteria first
- Proceed with single-source research when multi-source is available
- Deliver recommendations without supporting citations
- Include outdated or deprecated approaches without flagging
- Omit limitations and edge cases from recommendations
- Exceed token budget without compression
- Regress phases — if new gaps discovered, add new "Gather Information" task
- Leave "Compile Report" unmarked after delivering final research

## Summary

This research skill combines:
- Systematic investigation methodology (5-phase approach)
- Multi-source documentation discovery (context7, octocode, firecrawl)
- Intelligent context compression (70-85% reduction)
- Evidence-based recommendations with proper citations
- Source credibility evaluation and authority hierarchy
- Comprehensive comparison frameworks
- Proactive enhancement patterns
- TodoWrite progress tracking for session visibility

Use this skill whenever you need thorough, authoritative research that minimizes context usage while maximizing information quality and decision support.
