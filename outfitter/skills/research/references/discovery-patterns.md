# Discovery Patterns

Detailed workflows for common research scenarios.

## Library Installation

Getting started with a new library.

### Workflow

```
1. Package discovery
2. Documentation retrieval
3. Installation guide
4. Synthesis
```

### Steps

**1. Package Discovery**

```
octocode.packageSearch(name)
→ Repository URL
→ Latest version
→ Dependencies
→ Popularity metrics
```

**2. Documentation Retrieval**

```
context7.resolve-library-id(name)
→ Documentation identifier

context7.get-library-docs(id, topic="installation")
→ Official installation guide
```

**3. Installation Synthesis**

Compress findings into:
- Prerequisites (runtime, dependencies)
- Installation commands
- Framework-specific integration
- Common pitfalls during setup

### Output Structure

```markdown
## Installation: {Library}

**Prerequisites**:
- {runtime requirement}
- {peer dependencies}

**Install**:
\`\`\`bash
{package manager command}
\`\`\`

**Configuration**:
{minimal config to get started}

**Verify**:
{how to confirm successful installation}

**Common Issues**:
- {issue} → {solution}
```

## Error Resolution

Diagnosing and fixing errors.

### Workflow

```
1. Parse error
2. Search issues
3. Check official docs
4. Find community solutions
5. Synthesize
```

### Steps

**1. Parse Error**

```
Extract from error message:
- Error code/type
- Key terms
- Stack trace patterns
- Library/framework context
```

**2. Search Issues**

```
octocode.githubSearchIssues(pattern)
→ Related GitHub issues
→ Resolution status
→ Workarounds
```

**3. Official Troubleshooting**

```
context7.get-library-docs(id, topic="troubleshooting")
→ Known issues
→ Official fixes
→ Migration notes
```

**4. Community Solutions**

```
firecrawl.search(error_message)
→ Stack Overflow answers
→ Blog solutions
→ Forum discussions
```

**5. Synthesis**

Rank solutions by:
- Source authority (official > community)
- Recency (newer often better)
- Vote count/acceptance
- Relevance to specific context

### Output Structure

```markdown
## Error: {Error Message/Code}

**Cause**: {root cause explanation}

**Solution** (Recommended):
{step-by-step fix}

**Alternative Solutions**:
1. {alternative approach}
2. {alternative approach}

**Prevention**:
{how to avoid this in future}

**Sources**:
- [GitHub Issue](url)
- [Stack Overflow](url)
```

## API Exploration

Understanding library APIs.

### Workflow

```
1. Get documentation ID
2. Retrieve API reference
3. Find real usage examples
4. Structure findings
```

### Steps

**1. Documentation ID**

```
context7.resolve-library-id(name)
→ Documentation identifier
```

**2. API Reference**

```
context7.get-library-docs(id, topic="api")
→ Function signatures
→ Parameters
→ Return types
→ Examples
```

**3. Real Usage**

```
octocode.githubSearchCode("import { functionName } from 'library'")
→ Production usage patterns
→ Common configurations
→ Edge case handling
```

### Output Structure

```markdown
## API: {Function/Component}

**Signature**:
\`\`\`typescript
{type signature}
\`\`\`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| {param} | {type} | {yes/no} | {description} |

**Returns**: {return type and description}

**Example**:
\`\`\`typescript
{usage example}
\`\`\`

**Common Patterns**:
- {pattern}: {when to use}

**Gotchas**:
- {common mistake}
```

## Technology Comparison

Evaluating options for a decision.

### Workflow

```
1. Parallel discovery for each option
2. Cross-reference findings
3. Build comparison matrix
4. Generate recommendation
```

### Steps

**1. Parallel Discovery**

For each option, simultaneously:

```
context7: Official documentation, features
octocode: GitHub activity, issues, community
firecrawl: Benchmarks, case studies, reviews
```

**2. Cross-Reference**

Compare across sources:
- Feature claims vs reality
- Performance benchmarks
- Community health indicators
- Known limitations

**3. Build Matrix**

| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Performance | {metric} | {metric} | {metric} |
| Learning curve | {level} | {level} | {level} |
| Ecosystem | {size} | {size} | {size} |
| Maintenance | {status} | {status} | {status} |

**4. Recommend**

Based on:
- User's stated priorities
- Evidence from research
- Trade-off analysis

### Output Structure

```markdown
## Comparison: {Category}

**Options Evaluated**:
1. {Option A} — {brief description}
2. {Option B} — {brief description}

**Matrix**:
| Criterion | Option A | Option B |
|-----------|----------|----------|
| {criterion} | {value} | {value} |

**Recommendation**: {Option}

**Rationale**: {why this option wins for this context}

**When to Choose Alternative**:
- Choose {Option B} when {condition}

**Sources**:
- {source list}
```

## Best Practices Research

Finding recommended approaches.

### Workflow

```
1. Official guidance
2. Expert opinions
3. Community patterns
4. Synthesize with context
```

### Steps

**1. Official Guidance**

```
context7.get-library-docs(id, topic="best-practices")
→ Recommended patterns
→ Anti-patterns to avoid
→ Performance tips
```

**2. Expert Opinions**

```
firecrawl.search("{topic} best practices {year}")
→ Expert blog posts
→ Conference talks
→ Industry guides
```

**3. Community Patterns**

```
octocode.githubSearchCode("{pattern}")
→ How production code implements
→ Common approaches
→ Variations
```

**4. Contextualize**

Filter recommendations by:
- User's stack/constraints
- Scale requirements
- Team expertise
- Project stage

### Output Structure

```markdown
## Best Practices: {Topic}

**Recommended Approach**:
{primary recommendation}

**Why**:
{rationale with evidence}

**Implementation**:
\`\`\`typescript
{example code}
\`\`\`

**Avoid**:
- {anti-pattern} — {why}

**Context Matters**:
- For {context A}: {variation}
- For {context B}: {variation}

**Sources**:
- [Official Guide](url)
- [Expert Article](url)
```
