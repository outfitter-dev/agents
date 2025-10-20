---
name: claude-agent-authoring
description: Creates specialized subagents for Claude Code with proper configuration, capabilities, tool restrictions, and Task tool integration. Use when building specialized agents, creating subagents for specific tasks, or when users mention agent development, subagent configuration, or Task tool usage. Different from Skills - agents are invoked via Task tool.
version: 1.0.0
---

# Claude Agent Authoring

Create specialized subagents that extend Claude Code with focused expertise and capabilities.

## Overview

**Agents vs Skills**: This is critical to understand:

| Aspect | Agents (This Skill) | Skills |
|--------|---------------------|---------|
| **Purpose** | Specialized subagents with focused expertise | Capability packages with instructions |
| **Invocation** | Task tool (`subagent_type` parameter) | Automatic (model-triggered by context) |
| **Location** | `agents/` directory | `skills/` directory |
| **Structure** | Single `.md` file with frontmatter | Directory with `SKILL.md` + resources |
| **Scope** | Narrow, specialized tasks | Broad capabilities |
| **Use case** | "Ask security expert to audit", "Use tester agent" | "Work with PDFs", "Review code" |

**Key distinction**: Agents are invoked explicitly through the Task tool, Skills are discovered and used automatically.

## Quick Start

### Basic Agent

```bash
# Create a simple agent
mkdir -p agents
cat > agents/security-reviewer.md << 'EOF'
---
description: Security expert specializing in vulnerability detection and secure coding practices
capabilities:
  - Security vulnerability analysis
  - Authentication and authorization review
  - Input validation and sanitization checks
  - Dependency vulnerability scanning
  - OWASP Top 10 compliance review
---

# Security Reviewer Agent

You are a security expert focused on identifying vulnerabilities and security issues.

## Expertise

- OWASP Top 10 vulnerabilities
- Common security patterns and anti-patterns
- Authentication/authorization best practices
- Secure coding standards
- Dependency security

## Approach

1. Analyze code for security vulnerabilities
2. Check for proper input validation
3. Review authentication/authorization
4. Examine dependency security
5. Provide actionable remediation steps

## Output Format

For each finding:
- **Severity**: Critical/High/Medium/Low
- **Location**: File and line number
- **Description**: What's vulnerable
- **Impact**: Potential consequences
- **Remediation**: How to fix
EOF
```

### Agent with Tool Restrictions

```markdown
---
description: Read-only code analyst for safe analysis without modifications
capabilities:
  - Code analysis
  - Pattern detection
  - Dependency review
allowed-tools: Read, Grep, Glob, Bash(git show:*), Bash(git diff:*)
---

# Code Analyst Agent

You perform read-only code analysis without making any changes.

[Agent instructions here...]
```

### Invoking Agents

Agents are invoked through the Task tool:

```typescript
// In main conversation, Claude uses Task tool:
{
  "task": "Review this authentication code for security issues",
  "subagent_type": "security-reviewer",
  "context": ["src/auth/", "Additional context here"]
}
```

## Agent Configuration

### Frontmatter

| Field | Required | Purpose | Example |
|-------|----------|---------|---------|
| `description` | Yes | What the agent specializes in | `"Security expert for vulnerability detection"` |
| `capabilities` | Recommended | List of specific skills | `["SQL injection detection", "XSS prevention"]` |
| `allowed-tools` | Optional | Restrict tool usage | `"Read, Grep, Glob"` |
| `model` | Optional | Specific model to use | `"claude-3-5-haiku-20241022"` |

### Description Best Practices

```markdown
---
# ❌ Too vague
description: Helps with testing

# ✅ Specific and clear
description: Testing specialist focused on unit tests, integration tests, and test coverage analysis

# ❌ Missing specialization
description: Code reviewer

# ✅ Shows expertise
description: Performance-focused code reviewer specializing in identifying bottlenecks, memory leaks, and optimization opportunities
---
```

### Capabilities List

List specific capabilities to help Claude understand when to invoke the agent:

```yaml
capabilities:
  - Unit test generation
  - Integration test design
  - Test coverage analysis
  - Mock and stub creation
  - Test-driven development guidance
  - Flaky test identification
```

**Guidelines**:
- Be specific: "SQL injection detection" not "security"
- Action-oriented: "Generate API docs" not "documentation"
- 5-10 capabilities per agent
- Focus on expertise, not generic tasks

## Agent Scopes

### Personal Agents (`~/.claude/agents/`)
- Available across all your projects
- Individual workflow and preferences
- Show "(user)" in agent list

### Project Agents (`agents/`)
- Shared with team via git
- Team-specific specializations
- Show "(project)" in agent list

### Plugin Agents (`plugin/agents/`)
- Bundled with plugins
- Distributed via marketplaces
- Show "(plugin-name)" in agent list

## Writing Effective Agents

### 1. Define Clear Expertise

```markdown
---
description: API testing specialist for REST and GraphQL endpoints
capabilities:
  - REST API endpoint testing
  - GraphQL query validation
  - Authentication flow testing
  - Rate limiting verification
  - API contract validation
---

# API Testing Agent

You are an expert in API testing with deep knowledge of REST and GraphQL.

## Your Expertise

**REST APIs:**
- HTTP methods and status codes
- Request/response validation
- Authentication (Bearer, API Key, OAuth)
- Error handling patterns

**GraphQL:**
- Query and mutation testing
- Schema validation
- Resolver testing
- Error handling

**Testing Approach:**
1. Analyze API specification
2. Generate test cases
3. Validate responses
4. Check error scenarios
5. Document findings
```

### 2. Provide Structured Instructions

```markdown
# Performance Testing Agent

## Process

### Step 1: Baseline Analysis
- Identify performance-critical paths
- Establish baseline metrics
- Document current performance

### Step 2: Load Testing
- Define load scenarios
- Configure load parameters
- Execute load tests
- Collect metrics

### Step 3: Analysis
- Identify bottlenecks
- Analyze resource usage
- Compare against baselines
- Generate recommendations

### Step 4: Reporting
- Performance summary
- Bottleneck details
- Optimization recommendations
- Implementation priorities
```

### 3. Specify Output Format

```markdown
# Deployment Agent

## Output Format

**Deployment Plan:**
```yaml
environment: [staging|production]
steps:
  - name: Pre-flight checks
    status: [pending|complete|failed]
    details: [...]
  - name: Build
    status: [...]
    details: [...]
checks:
  - Tests passing: [yes|no]
  - Dependencies updated: [yes|no]
  - Migrations ready: [yes|no]
rollback_plan: [...]
```

**Status Updates:**
- ✅ Success: [description]
- ⚠️ Warning: [description]
- ❌ Error: [description]
```

### 4. Include Context and Constraints

```markdown
# Database Migration Agent

## Context Awareness

**Before proceeding, verify:**
- Current database schema version
- Pending migrations
- Data volume (affects migration time)
- Backup status
- Rollback procedures

## Constraints

**Safety rules:**
- Never drop tables without explicit confirmation
- Always test migrations on staging first
- Verify data integrity before and after
- Keep rollback scripts ready
- Document all schema changes

**Performance considerations:**
- Large tables: Use batched operations
- Production: Schedule during low traffic
- Indexes: Create concurrently when possible
- Foreign keys: Add after data migration
```

## Tool Restrictions

Limit agent capabilities for safety:

```markdown
---
description: Security auditor for read-only security analysis
allowed-tools: Read, Grep, Glob, Bash(git *)
---

# Security Auditor

You perform security analysis without making any code changes.

**Tool Access:**
- ✅ Read: Review code
- ✅ Grep: Search patterns
- ✅ Glob: Find files
- ✅ Git: Check history
- ❌ Write: No file modifications
- ❌ Edit: No code changes
- ❌ Bash (general): Limited to git only
```

### Common Tool Restriction Patterns

**Read-only analysis:**
```yaml
allowed-tools: Read, Grep, Glob, Bash(git show:*), Bash(git diff:*)
```

**Testing agents:**
```yaml
allowed-tools: Read, Bash(bun test:*), Bash(npm test:*), Write(__tests__/**)
```

**Documentation agents:**
```yaml
allowed-tools: Read, Grep, Glob, Write(docs/**), Write(*.md)
```

**Deployment agents:**
```yaml
allowed-tools: Bash(kubectl *), Bash(docker *), Bash(git *), Read
```

## Agent Types and Patterns

### Analysis Agents

Focus on examination without modification:

```markdown
---
description: Performance analyzer identifying bottlenecks and optimization opportunities
capabilities:
  - Performance profiling
  - Memory leak detection
  - Bundle size analysis
  - Database query optimization
  - Rendering performance analysis
allowed-tools: Read, Grep, Glob, Bash(*)
---

# Performance Analyzer

Analyze application performance and identify optimization opportunities.

[Instructions focused on analysis, measurement, reporting]
```

### Implementation Agents

Specialized in building specific features:

```markdown
---
description: React component builder following team design system
capabilities:
  - React component generation
  - TypeScript interface design
  - Component testing
  - Storybook documentation
  - Accessibility compliance
allowed-tools: Read, Write, Edit, Bash(bun *)
---

# Component Builder

Build React components following the team's design system and best practices.

[Instructions for component structure, testing, documentation]
```

### Review Agents

Provide focused feedback:

```markdown
---
description: Code quality reviewer focusing on maintainability and best practices
capabilities:
  - Code smell detection
  - Complexity analysis
  - DRY principle compliance
  - SOLID principle review
  - Naming convention check
allowed-tools: Read, Grep, Glob
---

# Code Quality Reviewer

Review code for quality, maintainability, and adherence to best practices.

[Instructions for review criteria, scoring, reporting]
```

### Testing Agents

Specialized in test creation:

```markdown
---
description: Test-driven development specialist creating comprehensive test suites
capabilities:
  - Unit test generation
  - Integration test design
  - Test coverage improvement
  - Edge case identification
  - Mock object creation
allowed-tools: Read, Write, Edit, Bash(bun test:*)
---

# TDD Specialist

Create comprehensive test suites following test-driven development practices.

[Instructions for test structure, coverage, best practices]
```

## Invoking Agents via Task Tool

### Basic Invocation

From the main conversation, Claude uses the Task tool:

```json
{
  "task": "Review authentication code for security vulnerabilities",
  "subagent_type": "security-reviewer"
}
```

### With Context

```json
{
  "task": "Generate unit tests for the authentication service",
  "subagent_type": "testing-specialist",
  "context": [
    "Focus on edge cases and error handling",
    "Use existing test patterns from tests/auth/",
    "Target 90% coverage"
  ]
}
```

### With Files

```json
{
  "task": "Optimize database queries in user service",
  "subagent_type": "performance-optimizer",
  "context": [
    "@src/services/user-service.ts",
    "Current query time: 2.3s",
    "Target: <500ms"
  ]
}
```

## Testing Agents

### Manual Testing

```bash
# 1. Create agent file
# agents/test-agent.md

# 2. In Claude Code main conversation
"Can you use the test-agent to analyze this code?"

# 3. Claude will invoke via Task tool
# Monitor the subagent's work

# 4. Review results when subagent completes
```

### Verify Agent Discovery

```bash
# Agents are loaded from:
# - ~/.claude/agents/ (personal)
# - ./agents/ (project)
# - Plugins (installed)

# Check debug output
claude --debug
```

### Test Tool Restrictions

```bash
# 1. Create agent with allowed-tools
# 2. Ask Claude to use the agent
# 3. Verify agent requests permission for restricted tools
# 4. Check that allowed tools don't require permission
```

## Best Practices

### 1. Single Responsibility

```markdown
# ✅ Focused agent
description: SQL injection vulnerability detector

# ❌ Too broad
description: Security expert handling all security issues
```

**Why**: Focused agents are easier to invoke correctly and maintain clear boundaries.

### 2. Clear Invocation Triggers

Include specific keywords in description and capabilities:

```yaml
description: GraphQL schema validator and query analyzer
capabilities:
  - GraphQL schema validation
  - Query complexity analysis
  - Resolver performance review
  - GraphQL subscription testing
```

**Why**: Helps Claude decide when to invoke this agent vs others.

### 3. Document Limitations

```markdown
## What I Don't Do

- ❌ Implement fixes (I only identify issues)
- ❌ Modify production databases
- ❌ Make breaking schema changes
- ✅ Analyze and recommend
- ✅ Generate migration scripts for review
```

**Why**: Sets clear expectations for both Claude and users.

### 4. Provide Examples

```markdown
## Example Tasks

**Good tasks for me:**
- "Review this auth flow for security issues"
- "Check if this API is vulnerable to injection"
- "Analyze session management implementation"

**Not ideal for me:**
- "Review entire codebase" (too broad)
- "Fix all security issues" (I analyze, not implement)
- "Set up authentication" (I review, not build)
```

**Why**: Helps users understand how to effectively work with the agent.

### 5. Version Your Agents

```markdown
---
description: TypeScript migration specialist (v2.1)
capabilities:
  - JavaScript to TypeScript conversion
  - Type definition generation
  - Generic type implementation
---

# TypeScript Migration Agent v2.1

**Changelog:**
- v2.1: Added support for decorators
- v2.0: Improved generic type inference
- v1.0: Initial release
```

**Why**: Track improvements and maintain compatibility.

## Common Patterns

### Research Agent Pattern

```markdown
---
description: Documentation researcher finding answers in official docs
capabilities:
  - Documentation search
  - API reference lookup
  - Example code extraction
  - Version compatibility checking
allowed-tools: WebSearch, WebFetch, Read
---

# Documentation Researcher

Find answers in official documentation and reliable sources.

## Process
1. Identify query intent
2. Search official docs first
3. Cross-reference multiple sources
4. Extract relevant examples
5. Verify version compatibility
6. Provide cited answer
```

### Validation Agent Pattern

```markdown
---
description: Configuration validator checking settings and schemas
capabilities:
  - JSON/YAML validation
  - Schema compliance checking
  - Environment variable verification
  - Dependency compatibility checking
allowed-tools: Read, Bash(*)
---

# Configuration Validator

Validate configuration files and settings.

## Validation Steps
1. Parse configuration files
2. Check against schema
3. Verify required fields
4. Validate relationships
5. Check environment-specific settings
6. Report issues with fixes
```

### Migration Agent Pattern

```markdown
---
description: Database migration specialist for safe schema changes
capabilities:
  - Migration script generation
  - Rollback script creation
  - Data integrity verification
  - Migration testing
allowed-tools: Read, Write, Bash(*)
---

# Migration Agent

Handle database migrations safely.

## Safety Protocol
1. Analyze current schema
2. Generate forward migration
3. Generate rollback migration
4. Create test data scripts
5. Validate on copy of production data
6. Document breaking changes
```

## Troubleshooting

### Agent Not Being Invoked

**Check:**
1. Agent file location: `agents/agent-name.md`
2. Frontmatter syntax: Valid YAML
3. Description: Specific and clear
4. Capabilities: Relevant to task

**Fix:**
- Make description more specific
- Add relevant capabilities
- Use clear task language when requesting

### Agent Has Wrong Tools

**Issue:** Agent asks for tools it shouldn't use

**Fix:**
```markdown
---
allowed-tools: Read, Grep, Glob
---
```

### Agent Scope Too Broad

**Issue:** Agent tries to do too much

**Fix:**
- Split into multiple specialized agents
- Narrow capabilities list
- Be specific about what agent does/doesn't do

### Agent Not Found

**Check:**
1. File extension is `.md`
2. File is in correct directory
3. No typos in filename
4. Frontmatter is valid

## Advanced Patterns

See [REFERENCE.md](REFERENCE.md) for:
- Agent frontmatter schema details
- Task tool integration patterns
- Tool restriction patterns
- Agent discovery mechanics
- Performance considerations

See [EXAMPLES.md](EXAMPLES.md) for:
- Complete real-world agents
- Specialized agent examples
- Multi-agent workflows
- Team collaboration patterns

## Quick Reference

```bash
# Scaffold new agent
./scripts/scaffold-agent.sh security-reviewer "Security vulnerability detection"

# Agent locations
agents/          # Project agents (shared with team)
~/.claude/agents/  # Personal agents

# Invocation (in main Claude Code conversation)
"Use the security-reviewer agent to check auth code"

# Claude invokes via Task tool with subagent_type
```

## Related Skills

- **claude-skill-authoring**: Create Skills (different from agents!)
- **claude-plugin-authoring**: Bundle agents into plugins
- **claude-task-tool-usage**: Advanced Task tool patterns
