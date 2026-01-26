# Tool Selection Guide

MCP server selection matrix and usage patterns for research tasks.

## Available Tools

### context7 - Library Documentation

Official documentation retrieval.

**Functions**:
- `resolve-library-id(name)` — Get documentation identifier
- `get-library-docs(id, topic)` — Retrieve focused documentation

**Best for**:
- API references
- Official guides
- Configuration options
- Migration documentation

**Optimization tips**:
- Use specific topics (e.g., "authentication", "installation")
- Avoid overly broad queries
- Check version alignment

### octocode - GitHub Intelligence

Repository and code search.

**Functions**:
- `packageSearch(name)` — Find repository metadata
- `githubSearchCode(query)` — Search for code patterns
- `githubSearchIssues(query)` — Find issues and discussions
- `githubViewRepoStructure(owner/repo)` — Explore repository layout

**Best for**:
- Real code examples
- Community solutions
- Package discovery
- Troubleshooting via issues

**Optimization tips**:
- Use specific search queries with language qualifiers
- Check issue status (open vs closed)
- Look at recent activity for relevance

### firecrawl - Web Documentation

Web content extraction.

**Functions**:
- `search(query)` — Web search for documentation
- `scrape(url, formats=['markdown'])` — Extract page content
- `map(url)` — Discover site structure

**Best for**:
- Tutorials and guides
- Stack Overflow answers
- Blog posts and articles
- Benchmark reports

**Optimization tips**:
- Use `onlyMainContent=true` to reduce noise
- Set `maxAge` for cache efficiency
- Use `map` before deep crawling

## Selection Matrix by Use Case

| Use Case | Primary | Secondary | Tertiary |
|----------|---------|-----------|----------|
| Official docs | context7 | octocode | firecrawl |
| Troubleshooting | octocode issues | firecrawl community | context7 guides |
| Code examples | octocode repos | firecrawl tutorials | context7 examples |
| Technology evaluation | All parallel | Cross-reference | Validate |
| Package discovery | octocode | context7 | firecrawl |
| Performance research | firecrawl | octocode | context7 |

## Execution Patterns

### Parallel Execution

Run independent queries simultaneously:

```javascript
await Promise.all([
  context7.resolve(name),
  octocode.packageSearch(name),
  firecrawl.search(query)
]).then(consolidateResults)
```

Use when:
- Sources are independent
- Comprehensive coverage needed
- Time is limited

### Sequential with Fallback

Try sources in order, fall back on failure:

```
context7 fails → octocode issues → firecrawl alternatives
Empty docs → broader topic → web search
Rate limit → alternate MCP → manual search guidance
```

Use when:
- Primary source usually sufficient
- Need to conserve API calls
- Specific answer expected

### Progressive Refinement

Start broad, narrow based on results:

```
1. Package discovery (octocode.packageSearch)
2. Official docs (context7.resolve + get-library-docs)
3. Code examples if needed (octocode.githubSearchCode)
4. Community solutions if stuck (firecrawl.search)
```

Use when:
- Exploring unfamiliar territory
- Building comprehensive understanding
- Research question is evolving

## Query Formulation

### For context7

```
Topic: "authentication"     ✓ Focused
Topic: "everything"         ✗ Too broad
Topic: "jwt token refresh"  ✓ Specific
```

### For octocode

```
Code: "useAuth hook react"          ✓ Specific pattern
Code: "authentication"              ✗ Too broad
Issues: "error NEXT_PUBLIC_ env"    ✓ Specific error
```

### For firecrawl

```
Search: "hono vs express benchmark 2024"  ✓ Specific, dated
Search: "best web framework"              ✗ Too generic
Search: "nextjs 14 server actions guide"  ✓ Version-specific
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Rate limit | Wait, try alternate tool |
| Not found | Broaden query, try different tool |
| Timeout | Retry with simpler query |
| Empty results | Check query formulation, try synonyms |

## Tool Combination Patterns

### Library Installation Research

```
1. octocode.packageSearch(name) → repo info, version
2. context7.resolve-library-id(name) → doc ID
3. context7.get-library-docs(id, "installation") → official guide
```

### Error Resolution Research

```
1. octocode.githubSearchIssues(error_pattern) → related issues
2. context7.get-library-docs(id, "troubleshooting") → official fixes
3. firecrawl.search(error_message) → community solutions
```

### Technology Comparison Research

```
Parallel for each option:
  - context7 (official docs)
  - octocode (GitHub activity, issues)
  - firecrawl (benchmarks, case studies)
Then: Cross-reference, create matrix
```
