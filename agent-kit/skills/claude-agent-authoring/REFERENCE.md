# Agent Authoring Reference

Comprehensive reference for Claude Code agent development.

## Table of Contents

1. [Agent vs Skill](#agent-vs-skill)
2. [File Format](#file-format)
3. [Frontmatter Schema](#frontmatter-schema)
4. [Agent Configuration](#agent-configuration)
5. [Capabilities](#capabilities)
6. [Tool Restrictions](#tool-restrictions)
7. [Task Tool Integration](#task-tool-integration)
8. [Discovery & Loading](#discovery--loading)
9. [Agent Types](#agent-types)
10. [Best Practices](#best-practices)
11. [Performance Considerations](#performance-considerations)
12. [Multi-Agent Patterns](#multi-agent-patterns)

## Agent vs Skill

### Critical Distinction

**Agents** and **Skills** serve different purposes and work differently:

| Characteristic | Agents | Skills |
|---------------|--------|--------|
| **File Location** | `agents/*.md` | `skills/*/SKILL.md` |
| **Structure** | Single Markdown file | Directory with resources |
| **Invocation** | Explicit via Task tool | Automatic via context |
| **Invocation Parameter** | `subagent_type` in Task | N/A |
| **Scope** | Narrow, specialized expertise | Broad capability |
| **User Trigger** | "Use X agent to..." | Automatic on keywords |
| **Model Trigger** | Task tool decision | Skill discovery system |
| **Tool Access** | Can inherit or restrict | Can inherit or restrict |
| **Context** | Subagent conversation | Main conversation |

### When to Use Agents vs Skills

**Use an Agent when:**
- You need specialized expertise for specific task types
- The task requires a different context or conversation thread
- You want to compartmentalize work (security review, testing, etc.)
- The specialization is so narrow it shouldn't pollute main context
- You want clear handoff between roles (review, implement, test)

**Use a Skill when:**
- You want to add capabilities available throughout conversation
- The expertise applies to many different task types
- You want Claude to autonomously decide when to use it
- The capability is a tool or technique, not a role
- You want resources (scripts, templates) bundled

**Examples:**

```markdown
# Agent Example: Security Reviewer
agents/security-reviewer.md
- Specialized role: Security expert
- Invoked explicitly: "Use security-reviewer to audit this"
- Narrow focus: Just security review
- Separate context: Dedicated review thread

# Skill Example: PDF Processing
skills/pdf-processing/SKILL.md
- Broad capability: Work with PDFs
- Invoked automatically: "Extract text from this PDF"
- Wide applicability: Any PDF task
- Same context: Main conversation continues
```

### Combined Usage

You can use both together:

```markdown
# Skill: claude-code-review (capability)
skills/claude-code-review/SKILL.md
- Provides code review techniques
- Available in all conversations
- Claude uses when reviewing code

# Agent: security-reviewer (specialized role)
agents/security-reviewer.md
- Uses code review techniques from skill
- Focused exclusively on security
- Invoked for security-specific reviews
```

## File Format

### Basic Structure

```markdown
---
# YAML frontmatter
description: Brief description of agent specialization
capabilities:
  - Capability 1
  - Capability 2
  - Capability 3
allowed-tools: Tool1, Tool2, Tool3
model: model-identifier
---

# Agent Name

Agent instructions and context.

## Sections
- Expertise
- Process
- Output format
- Constraints
```

### File Naming

**Conventions:**
- Use kebab-case: `security-reviewer.md`, `api-tester.md`
- No spaces or special characters
- Extension must be `.md`
- Filename used as agent identifier

**Examples:**
```
agents/security-reviewer.md     → subagent_type: "security-reviewer"
agents/db-migrator.md           → subagent_type: "db-migrator"
agents/performance-tester.md    → subagent_type: "performance-tester"
```

### File Location

**Scopes:**

1. **Personal**: `~/.claude/agents/`
   - Available across all projects
   - Individual preferences
   - Not shared with team

2. **Project**: `<project-root>/agents/`
   - Shared via git
   - Team-specific agents
   - Version controlled

3. **Plugin**: `<plugin-root>/agents/`
   - Bundled with plugin
   - Distributed via marketplace
   - Installed with plugin

**Loading Priority:**
1. Plugin agents (lowest priority)
2. Project agents (medium priority)
3. Personal agents (highest priority)

## Frontmatter Schema

All frontmatter fields are optional except `description`.

### `description`

**Type**: `string`
**Required**: Yes
**Purpose**: Brief explanation of agent's specialization

```yaml
description: Security expert specializing in OWASP Top 10 vulnerability detection
```

**Best Practices:**
- Start with role/specialty: "Security expert", "Testing specialist"
- Include specific focus: "OWASP Top 10", "React components"
- Keep under 100 characters
- Use keywords that trigger invocation

**Examples:**

```yaml
# ✅ Good: Specific and clear
description: TypeScript migration specialist converting JavaScript to TypeScript with proper types

# ✅ Good: Shows expertise area
description: Database performance optimizer for PostgreSQL query optimization

# ❌ Too vague
description: Helper agent

# ❌ Too generic
description: Code reviewer

# ✅ Better: Add specialization
description: Code quality reviewer focusing on SOLID principles and design patterns
```

### `capabilities`

**Type**: `array` of `string`
**Required**: Recommended
**Purpose**: List specific capabilities to aid invocation decision

```yaml
capabilities:
  - SQL injection detection
  - XSS vulnerability identification
  - Authentication flow review
  - Authorization check validation
  - Secure session management review
```

**Guidelines:**
- 5-10 capabilities per agent
- Be specific: "JWT token validation" not "security"
- Action-oriented: "Generate test cases" not "testing"
- Match user language: "API testing" not "HTTP request validation"
- Cover agent's full scope

**Format Patterns:**

```yaml
# Task-oriented (recommended)
capabilities:
  - Unit test generation
  - Integration test design
  - Test coverage analysis

# Feature-oriented
capabilities:
  - React component creation
  - TypeScript interface design
  - Component testing

# Domain-oriented
capabilities:
  - PostgreSQL query optimization
  - Index design
  - Query plan analysis
```

**Bad Examples:**

```yaml
# ❌ Too generic
capabilities:
  - Coding
  - Testing
  - Debugging

# ❌ Too granular
capabilities:
  - Check if function has return type
  - Verify variable naming
  - Count lines of code

# ✅ Right level of detail
capabilities:
  - TypeScript type annotation
  - Code style compliance
  - Complexity analysis
```

### `allowed-tools`

**Type**: `string` (comma-separated)
**Required**: Optional
**Default**: Inherits from main conversation
**Purpose**: Restrict which tools the agent can use

```yaml
# Single tool
allowed-tools: Read

# Multiple tools
allowed-tools: Read, Grep, Glob

# Bash with wildcards
allowed-tools: Bash(git *), Read, Write

# Bash with specific commands
allowed-tools: Bash(git status:*), Bash(git diff:*), Read
```

**Tool Name Format:**

```yaml
# Exact tool name
Read, Write, Edit, Grep, Glob, WebSearch, WebFetch

# Bash with wildcard (any git command)
Bash(git *)

# Bash with specific subcommand
Bash(git status:*)

# Bash with multiple patterns
Bash(git *), Bash(npm *), Bash(bun *)

# File pattern restrictions
Write(tests/**), Write(*.test.ts)
```

**Common Patterns:**

```yaml
# Read-only analysis
allowed-tools: Read, Grep, Glob

# Read-only with git history
allowed-tools: Read, Grep, Glob, Bash(git show:*), Bash(git diff:*)

# Testing agent
allowed-tools: Read, Write, Bash(bun test:*), Bash(npm test:*)

# Documentation agent
allowed-tools: Read, Grep, Write(docs/**), Write(*.md)

# Deployment agent
allowed-tools: Bash(kubectl *), Bash(docker *), Read

# Full access (default behavior)
# Don't specify allowed-tools field
```

**Security Implications:**

```yaml
# ⚠️ Dangerous: Full bash access
allowed-tools: Bash(*)

# ✅ Safer: Limited bash access
allowed-tools: Bash(git *), Bash(npm test:*)

# ✅ Safest: No bash
allowed-tools: Read, Grep, Glob

# ⚠️ Be careful with Write
allowed-tools: Write  # Can modify any file

# ✅ Better: Restrict write patterns
allowed-tools: Write(tests/**), Write(__tests__/**)
```

### `model`

**Type**: `string`
**Required**: Optional
**Default**: Inherits from main conversation
**Purpose**: Use specific model for this agent

```yaml
# Use faster model for simple tasks
model: claude-3-5-haiku-20241022

# Use specific version
model: claude-sonnet-4-5-20250929

# Use most capable model
model: claude-opus-4-20250514
```

**When to Use:**

```yaml
# Simple analysis → Haiku (faster, cheaper)
model: claude-3-5-haiku-20241022
# Use for: linting, formatting, simple validation

# Standard tasks → Sonnet (balanced)
model: claude-sonnet-4-5-20250929
# Use for: code review, testing, refactoring

# Complex reasoning → Opus (most capable)
model: claude-opus-4-20250514
# Use for: architecture design, complex debugging
```

## Agent Configuration

### Minimal Agent

```markdown
---
description: Simple code formatter
---

# Code Formatter

Format code according to project style guide.

Run formatter on provided files and report results.
```

**When to use:** Quick, focused agents for simple tasks.

### Standard Agent

```markdown
---
description: Security reviewer for authentication flows
capabilities:
  - Authentication mechanism review
  - Session management validation
  - Token security analysis
  - Password policy checking
allowed-tools: Read, Grep, Glob
---

# Authentication Security Reviewer

Review authentication implementations for security issues.

## Expertise
- OAuth 2.0 and OIDC
- JWT tokens
- Session management
- Password security

## Process
1. Analyze authentication flow
2. Check token handling
3. Verify session security
4. Review password policies
5. Report findings with severity

## Output
- **Critical**: Immediate security risks
- **High**: Important issues requiring attention
- **Medium**: Best practice improvements
- **Low**: Optional enhancements
```

**When to use:** Most agents should follow this pattern.

### Complex Agent

```markdown
---
description: Database migration specialist with rollback capability
capabilities:
  - Forward migration generation
  - Rollback script creation
  - Data integrity validation
  - Migration testing
  - Schema versioning
allowed-tools: Read, Write, Bash(psql:*), Bash(git *)
model: claude-sonnet-4-5-20250929
---

# Database Migration Agent

Handle database schema migrations safely with rollback capability.

## Prerequisites

Before starting any migration:
1. ✅ Database backup exists
2. ✅ Staging environment tested
3. ✅ Rollback plan documented
4. ✅ Downtime window (if needed) scheduled

## Process

### Phase 1: Analysis
1. Read current schema
2. Understand desired changes
3. Identify breaking changes
4. Plan data transformations
5. Estimate migration time

### Phase 2: Script Generation
1. Write forward migration
2. Write rollback migration
3. Add data validation checks
4. Include timing estimates
5. Document manual steps

### Phase 3: Validation
1. Test on copy of production data
2. Verify data integrity
3. Check performance impact
4. Validate rollback procedure
5. Review with team

### Phase 4: Execution Support
1. Pre-migration checklist
2. Execute with monitoring
3. Post-migration validation
4. Document results
5. Archive migration artifacts

## Output Format

**Migration Plan:**
```yaml
version: YYYYMMDDHHMMSS
description: Brief description
breaking_changes: [list]
estimated_duration: "X minutes"
rollback_available: true/false
```

**Forward Migration:**
```sql
-- Migration: description
-- Version: timestamp
-- Rollback: see rollback.sql

BEGIN;
-- SQL statements here
COMMIT;
```

**Rollback Migration:**
```sql
-- Rollback for: description
-- Version: timestamp

BEGIN;
-- Reverse SQL statements
COMMIT;
```

## Safety Rules

**Never do:**
- ❌ Drop tables without explicit confirmation
- ❌ Delete data without backup verification
- ❌ Modify production without staging test
- ❌ Skip data validation steps

**Always do:**
- ✅ Generate rollback scripts
- ✅ Validate on test data
- ✅ Include timing estimates
- ✅ Document breaking changes
- ✅ Provide manual verification steps

## Error Handling

If migration fails:
1. **Stop immediately**
2. **Rollback if transaction is open**
3. **Preserve error state**
4. **Document failure point**
5. **Report to team**
6. **Don't retry automatically**
```

**When to use:** Agents requiring complex workflows or safety protocols.

## Capabilities

### Purpose

Capabilities help Claude decide when to invoke an agent. They should be:
- **Specific**: Clear, focused capabilities
- **Discoverable**: Match user language
- **Complete**: Cover agent's full scope
- **Distinct**: Different from other agents

### Writing Good Capabilities

**Pattern: Action + Domain + Detail**

```yaml
# Good: Specific action in specific domain
capabilities:
  - React component generation with TypeScript
  - Component unit test creation
  - Storybook story generation
  - Accessibility compliance checking

# Bad: Too vague
capabilities:
  - React stuff
  - Frontend work
```

**Pattern: Problem-Oriented**

```yaml
# Good: Describes what problems are solved
capabilities:
  - SQL injection vulnerability detection
  - XSS attack prevention review
  - CSRF protection validation
  - Authentication bypass prevention

# Bad: Too technical
capabilities:
  - Input sanitization
  - Output encoding
```

**Pattern: Task-Oriented**

```yaml
# Good: Describes concrete tasks
capabilities:
  - Generate API endpoint tests
  - Create integration test suites
  - Mock external service dependencies
  - Validate error handling paths

# Bad: Too abstract
capabilities:
  - Testing
  - Quality assurance
```

### Capability Scope

**Narrow Scope** (5-7 capabilities):
```yaml
# Specialized agent: GraphQL Testing
capabilities:
  - GraphQL query validation
  - Mutation testing
  - Subscription testing
  - Schema validation
  - Resolver testing
```

**Medium Scope** (7-10 capabilities):
```yaml
# Balanced agent: API Testing
capabilities:
  - REST endpoint testing
  - GraphQL query testing
  - Authentication flow validation
  - Rate limiting verification
  - Error response validation
  - Request/response schema validation
  - Mock server configuration
  - Integration test generation
```

**Avoid Broad Scope** (>10 capabilities):
```yaml
# ❌ Too broad: Split into multiple agents
capabilities:
  - API testing
  - Unit testing
  - Integration testing
  - E2E testing
  - Performance testing
  - Security testing
  - Load testing
  - Accessibility testing
  - Visual regression testing
  - Database testing
  - # ... too many!
```

### Capability Keywords

**Effective Keywords:**

Include terms users might naturally use:

```yaml
# User says: "test my API"
capabilities:
  - API testing
  - API endpoint validation
  - REST API testing

# User says: "check security"
capabilities:
  - Security vulnerability detection
  - Security audit
  - Security review

# User says: "optimize database"
capabilities:
  - Database optimization
  - Query performance tuning
  - Database query optimization
```

### Capability Anti-Patterns

```yaml
# ❌ Too granular (merge related items)
capabilities:
  - Check variable names
  - Check function names
  - Check class names
  - Check constant names
# ✅ Better
capabilities:
  - Code naming convention validation

# ❌ Overlapping (remove duplicates)
capabilities:
  - Test generation
  - Create tests
  - Write tests
# ✅ Better
capabilities:
  - Test generation

# ❌ Implementation details (focus on outcomes)
capabilities:
  - Uses Jest framework
  - Runs npm test
  - Generates coverage reports
# ✅ Better
capabilities:
  - Unit test creation
  - Test coverage analysis
```

## Tool Restrictions

### Inheritance Model

```markdown
# Agent with no tool restrictions
---
description: Code reviewer
---
# Inherits tools from main conversation
# Can request additional tools with permission

# Agent with tool restrictions
---
description: Read-only code analyzer
allowed-tools: Read, Grep, Glob
---
# Can only use specified tools without permission
# Other tools blocked or require permission
```

### Restriction Strategies

**Full Restriction** (safest):
```yaml
allowed-tools: Read, Grep, Glob
```
- Cannot modify anything
- Cannot run commands
- Pure analysis only

**Read + Git** (safe historical analysis):
```yaml
allowed-tools: Read, Grep, Glob, Bash(git show:*), Bash(git diff:*)
```
- Can read files
- Can check git history
- Cannot modify anything

**Read + Write Limited** (targeted modifications):
```yaml
allowed-tools: Read, Grep, Write(tests/**), Write(__tests__/**)
```
- Can read any file
- Can only write to test directories

**Read + Test Commands** (test creation):
```yaml
allowed-tools: Read, Write, Bash(bun test:*), Bash(npm test:*)
```
- Can read and write
- Can run tests only
- Cannot run arbitrary commands

**Deployment Tools** (infrastructure):
```yaml
allowed-tools: Bash(kubectl *), Bash(docker *), Bash(git *), Read
```
- Can manage infrastructure
- Can read configs
- Cannot modify code

### Pattern Matching

Tool restrictions support patterns:

```yaml
# Exact match
allowed-tools: Read

# Wildcard match (any subcommand)
Bash(git *)

# Specific subcommand
Bash(git status:*)

# Multiple patterns
Bash(git *), Bash(npm test:*), Bash(bun *)

# File path patterns
Write(tests/**/*.ts)
Write(__tests__/**/*)
Write(*.test.ts)

# MCP tools
mcp__server__tool
mcp__server__*
```

### Testing Tool Restrictions

```markdown
# Create test agent
cat > agents/test-readonly.md << 'EOF'
---
description: Test read-only agent
allowed-tools: Read
---
Try to write a file - should fail or ask permission.
EOF

# Invoke and test
# Agent should be unable to write without permission
```

## Task Tool Integration

### How Agents Are Invoked

Agents are invoked through the Task tool from the main conversation:

```typescript
// Main conversation: User asks Claude to review code
// Claude decides to use specialized agent
// Claude uses Task tool:

{
  "task": "Review authentication code for security vulnerabilities",
  "subagent_type": "security-reviewer",
  "context": [
    "Focus on session management",
    "Check JWT token handling"
  ]
}
```

### Task Tool Parameters

**Required:**
- `task`: Description of what the agent should do
- `subagent_type`: Agent identifier (filename without `.md`)

**Optional:**
- `context`: Array of strings providing additional context

### Context Passing

```typescript
// Minimal invocation
{
  "task": "Review this code",
  "subagent_type": "security-reviewer"
}

// With file references
{
  "task": "Review authentication implementation",
  "subagent_type": "security-reviewer",
  "context": [
    "@src/auth/auth.service.ts",
    "@src/auth/jwt.service.ts"
  ]
}

// With detailed context
{
  "task": "Generate unit tests",
  "subagent_type": "testing-specialist",
  "context": [
    "Target 90% coverage",
    "Use existing patterns from tests/",
    "Focus on edge cases",
    "@src/services/user.service.ts"
  ]
}

// With previous findings
{
  "task": "Fix security issues found in previous review",
  "subagent_type": "security-fixer",
  "context": [
    "Previous findings:",
    "- SQL injection in user query",
    "- XSS vulnerability in profile page",
    "@src/services/user.service.ts",
    "@src/routes/profile.ts"
  ]
}
```

### Agent Response Flow

```
1. User makes request
   ↓
2. Claude (main) decides agent needed
   ↓
3. Claude uses Task tool with subagent_type
   ↓
4. Agent conversation starts
   ↓
5. Agent completes task
   ↓
6. Results returned to main conversation
   ↓
7. Main Claude incorporates results
   ↓
8. Response to user
```

### Multi-Agent Workflows

```typescript
// Sequential agents
// 1. Review agent
{
  "task": "Review code for issues",
  "subagent_type": "code-reviewer"
}

// 2. After review, use fixer agent
{
  "task": "Fix issues found: [list of issues]",
  "subagent_type": "code-fixer",
  "context": ["Previous review findings: ..."]
}

// 3. After fixes, use test agent
{
  "task": "Generate tests for fixed code",
  "subagent_type": "testing-specialist",
  "context": ["@fixed-files"]
}
```

### Agent Chaining Patterns

**Sequential Processing:**
```
User Request
  → Analyzer Agent (identify issues)
    → Fixer Agent (implement fixes)
      → Tester Agent (verify fixes)
        → Reviewer Agent (final review)
          → Results to user
```

**Parallel Processing:**
```
User Request
  ├→ Security Agent (security review)
  ├→ Performance Agent (performance review)
  ├→ Quality Agent (code quality review)
  └→ Test Agent (test coverage review)

All results aggregated → User
```

**Specialized Consultation:**
```
Main Claude (implementation)
  → Security Agent (consult on auth pattern)
    → Results back to Main Claude
      → Main Claude continues implementation
```

## Discovery & Loading

### Loading Order

1. **Scan directories:**
   - Plugin agents: `<plugin-root>/agents/*.md`
   - Project agents: `<project-root>/agents/*.md`
   - Personal agents: `~/.claude/agents/*.md`

2. **Parse frontmatter:**
   - Validate YAML syntax
   - Extract description, capabilities, tools
   - Build agent registry

3. **Priority resolution:**
   - Personal > Project > Plugin
   - Later overwrites earlier (same name)

### Agent Discovery

**How Claude finds agents:**

1. **User request analysis:**
   - Parse user intent
   - Identify task type
   - Extract keywords

2. **Agent matching:**
   - Compare request keywords with capabilities
   - Match task type with agent descriptions
   - Check agent availability

3. **Agent selection:**
   - Rank by relevance
   - Consider tool requirements
   - Select best match

4. **Invocation:**
   - Use Task tool
   - Pass context
   - Monitor execution

### Naming for Discovery

```yaml
# ✅ Good: Includes keywords in description
description: React testing specialist using Jest and React Testing Library

# Keywords: react, testing, jest, react testing library
# Triggers: "test react component", "jest tests", "RTL"

# ❌ Bad: Vague description
description: Testing helper

# Keywords: testing (too generic)
# Hard to trigger specifically

# ✅ Good: Specific capabilities
capabilities:
  - React component testing
  - Jest test creation
  - React Testing Library usage
  - Component snapshot testing

# ❌ Bad: Generic capabilities
capabilities:
  - Testing
  - Quality
```

### Debug Discovery

```bash
# Enable debug mode
claude --debug

# Look for agent loading messages:
# "Loading agent: security-reviewer"
# "Agent capabilities: [...]"
# "Agent match score: X"

# Check agent invocation:
# "Invoking agent: security-reviewer"
# "Agent task: Review code..."
```

### Reload Agents

```bash
# Changes to agent files are detected automatically
# Force reload:
/clear  # Clears conversation and reloads agents

# Or restart Claude Code
```

## Agent Types

### Analysis Agents

**Purpose:** Examine and report without modifying

```markdown
---
description: Performance bottleneck identifier and analyzer
capabilities:
  - Performance profiling analysis
  - Bundle size analysis
  - Memory leak detection
  - Rendering performance review
allowed-tools: Read, Grep, Glob, Bash(*)
---

**Characteristics:**
- Read-only operations
- Detailed reporting
- Recommendations but no implementation
- Metrics and measurements

**Example tasks:**
- "Analyze app performance"
- "Find memory leaks"
- "Review bundle size"
```

### Implementation Agents

**Purpose:** Build and modify code

```markdown
---
description: React component builder following design system
capabilities:
  - React component generation
  - TypeScript interface design
  - Component styling
  - Prop validation
allowed-tools: Read, Write, Edit
---

**Characteristics:**
- Creates new code
- Modifies existing code
- Follows templates/patterns
- Implements specifications

**Example tasks:**
- "Create new component"
- "Implement feature X"
- "Build API endpoint"
```

### Review Agents

**Purpose:** Provide feedback and suggestions

```markdown
---
description: Code quality reviewer with focus on maintainability
capabilities:
  - Code smell detection
  - Complexity analysis
  - SOLID principles review
  - Naming convention check
allowed-tools: Read, Grep, Glob
---

**Characteristics:**
- Evaluates existing code
- Provides specific feedback
- Rates/scores quality
- Suggests improvements

**Example tasks:**
- "Review this PR"
- "Check code quality"
- "Evaluate architecture"
```

### Testing Agents

**Purpose:** Create and manage tests

```markdown
---
description: Test suite generator with TDD focus
capabilities:
  - Unit test generation
  - Integration test design
  - Test coverage improvement
  - Edge case identification
allowed-tools: Read, Write, Bash(bun test:*), Bash(npm test:*)
---

**Characteristics:**
- Generates test code
- Runs test suites
- Analyzes coverage
- Identifies gaps

**Example tasks:**
- "Create tests for X"
- "Improve test coverage"
- "Add edge case tests"
```

### Migration Agents

**Purpose:** Transform code from one form to another

```markdown
---
description: JavaScript to TypeScript migration specialist
capabilities:
  - Type annotation addition
  - Interface generation
  - Generic type implementation
  - Type error resolution
allowed-tools: Read, Write, Edit
---

**Characteristics:**
- Systematic transformation
- Preserves functionality
- Gradual approach
- Validation at each step

**Example tasks:**
- "Migrate to TypeScript"
- "Update to new API"
- "Refactor to new pattern"
```

### Deployment Agents

**Purpose:** Handle deployment and infrastructure

```markdown
---
description: Kubernetes deployment specialist
capabilities:
  - Kubernetes manifest creation
  - Deployment orchestration
  - Health check validation
  - Rollback execution
allowed-tools: Bash(kubectl *), Bash(docker *), Read
---

**Characteristics:**
- Infrastructure operations
- Deployment procedures
- Safety checks
- Monitoring integration

**Example tasks:**
- "Deploy to staging"
- "Rollback deployment"
- "Check cluster health"
```

### Research Agents

**Purpose:** Find information and synthesize knowledge

```markdown
---
description: Documentation researcher and synthesizer
capabilities:
  - Documentation search
  - API reference lookup
  - Example code extraction
  - Best practice identification
allowed-tools: WebSearch, WebFetch, Read
---

**Characteristics:**
- Information gathering
- Source verification
- Synthesis and summary
- Citation and linking

**Example tasks:**
- "Research how to X"
- "Find examples of Y"
- "What's the best practice for Z"
```

## Best Practices

### 1. Single Responsibility

**Do:** Create focused agents
```yaml
# ✅ Focused
description: SQL injection vulnerability detector

# ❌ Too broad
description: Security expert for all issues
```

**Why:** Easier to invoke correctly, maintain, and understand

### 2. Clear Boundaries

**Do:** Define what agent does and doesn't do
```markdown
## Scope

**I handle:**
- ✅ Security vulnerability detection
- ✅ Secure coding recommendations
- ✅ Risk assessment

**I don't handle:**
- ❌ Implementation of fixes
- ❌ Performance optimization
- ❌ General code review
```

**Why:** Prevents confusion and improves invocation accuracy

### 3. Consistent Output Format

**Do:** Define structured output
```markdown
## Output Format

**For each vulnerability:**
```yaml
severity: critical|high|medium|low
location: file:line
description: What's vulnerable
impact: Consequences
remediation: How to fix
cwe: CWE number if applicable
```
```

**Why:** Makes results predictable and parseable

### 4. Safety First

**Do:** Include safety checks
```markdown
## Safety Protocol

Before modifying production:
1. ✅ Backup verified
2. ✅ Tested in staging
3. ✅ Rollback plan ready
4. ✅ Team notified
5. ⚠️ STOP and get explicit approval
```

**Why:** Prevents accidents and data loss

### 5. Version Agents

**Do:** Track agent versions
```markdown
---
description: TypeScript migrator v2.1
---

# TypeScript Migrator v2.1

**Changelog:**
- v2.1: Added decorator support
- v2.0: Improved generic inference
- v1.0: Initial release
```

**Why:** Track improvements and maintain compatibility

### 6. Document Examples

**Do:** Show example invocations
```markdown
## Example Tasks

**Good:**
- "Review auth.service.ts for security issues"
- "Check JWT implementation"
- "Audit session management"

**Not ideal:**
- "Review everything" (too broad)
- "Fix bugs" (not my role)
```

**Why:** Helps users work effectively with agent

### 7. Progressive Disclosure

**Do:** Start simple, add detail as needed
```markdown
# Quick Start
Simple example

## Basic Usage
Common patterns

## Advanced
Complex scenarios

## Reference
Complete details
```

**Why:** Easier to understand and maintain

### 8. Test Agents

**Do:** Test agent behavior
```bash
# Create test scenarios
# Verify tool restrictions
# Check output format
# Validate error handling
```

**Why:** Ensure agent works as expected

## Performance Considerations

### Agent Overhead

**Cost factors:**
- Agent loading time
- Context switching
- Tool invocations
- Model inference

**Optimization strategies:**

1. **Right-size agent:**
```yaml
# ❌ Heavyweight model for simple task
model: claude-opus-4-20250514
# Task: Format code

# ✅ Appropriate model
model: claude-3-5-haiku-20241022
```

2. **Restrict tools:**
```yaml
# ❌ Unlimited bash access
allowed-tools: Bash(*)

# ✅ Limited to necessary commands
allowed-tools: Bash(git status:*), Bash(git diff:*)
```

3. **Focused capabilities:**
```yaml
# ❌ Too many capabilities (15+)
capabilities: [long list]

# ✅ Focused list (5-7)
capabilities:
  - Core capability 1
  - Core capability 2
  - Core capability 3
```

### Context Size

**Minimize context passed to agent:**

```typescript
// ❌ Too much context
{
  "task": "Review code",
  "subagent_type": "reviewer",
  "context": [
    "@entire-codebase",  // Too much!
    "All git history",
    "All documentation"
  ]
}

// ✅ Focused context
{
  "task": "Review authentication code",
  "subagent_type": "security-reviewer",
  "context": [
    "@src/auth/auth.service.ts",
    "Focus on JWT validation"
  ]
}
```

### Agent Reuse

**Prefer sequential reuse over parallel:**

```typescript
// ❌ Parallel (multiple agent contexts)
- Security agent reviewing
- Performance agent reviewing
- Quality agent reviewing

// ✅ Sequential (one agent at a time)
1. Security agent reviews → results
2. Performance agent reviews → results
3. Quality agent reviews → results
```

**Why:** Lower memory overhead, clearer results

### Caching

Agents benefit from prompt caching:
- Description and instructions cached
- Repeated invocations faster
- Tool restrictions cached

**Maximize caching:**
- Keep agent instructions stable
- Don't dynamically generate agent content
- Reuse agents frequently

## Multi-Agent Patterns

### Sequential Processing

```
User: "Prepare this code for production"

1. Security Agent
   → Security review → Issues found

2. Fixer Agent (with security issues)
   → Fix security issues → Code updated

3. Test Agent (with updated code)
   → Generate tests → Tests created

4. Performance Agent
   → Performance review → Optimizations

5. Quality Agent
   → Final review → Approved
```

**Implementation:**
```typescript
// Main Claude orchestrates:
1. Task(security-reviewer, "Review code")
2. Wait for results
3. Task(code-fixer, "Fix issues: [results]")
4. Wait for fixes
5. Task(test-generator, "Generate tests")
// ... continue
```

### Parallel Review

```
User: "Comprehensive code review"

┌─ Security Agent → Security report
├─ Performance Agent → Performance report
├─ Quality Agent → Quality report
└─ Test Agent → Coverage report

Main Claude aggregates all reports → User
```

**When to use:** Independent reviews, fast results

### Specialist Consultation

```
Main Claude implementing feature
  ↓
  Question about security pattern
  ↓
Task(security-expert, "Best pattern for X?")
  ↓
Security agent responds
  ↓
Main Claude continues with answer
```

**When to use:** Need expert input during implementation

### Iterative Refinement

```
1. Implementation Agent
   → Creates initial implementation

2. Review Agent
   → Reviews, finds issues

3. Implementation Agent (with feedback)
   → Fixes issues

4. Review Agent
   → Verifies fixes

5. Repeat until approved
```

**When to use:** High-quality requirements, iterative improvement

### Hierarchical Agents

```
Coordinator Agent
  ├→ Backend Agent
  │   ├→ API Agent
  │   └→ Database Agent
  └→ Frontend Agent
      ├→ Component Agent
      └→ Styling Agent
```

**When to use:** Complex projects, clear decomposition

## See Also

- [SKILL.md](SKILL.md) - Agent authoring guide
- [EXAMPLES.md](EXAMPLES.md) - Real-world agent examples
- [scripts/scaffold-agent.sh](scripts/scaffold-agent.sh) - Agent generator
