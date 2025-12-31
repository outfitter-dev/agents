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
name: agent-name
description: Use this agent when [trigger conditions]. Triggers on [keywords].\n\n<example>\nContext: When this applies.\nuser: "User message"\nassistant: "Response explaining agent delegation"\n</example>
model: inherit
---

# Agent Name

Agent instructions and context.

## Sections
- Core Identity
- Skill Loading (if router agent)
- Process / Workflow
- Output format
- Constraints / Edge Cases
```

**Note**: Most agents should NOT specify `tools` — they inherit from parent. Only specify when restricting access.

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

### Required Fields

#### `name`

**Type**: `string`
**Required**: Yes
**Purpose**: Agent identifier (should match filename without `.md`)

```yaml
name: security-reviewer
```

#### `description`

**Type**: `string`
**Required**: Yes
**Purpose**: When to use this agent + examples

The description should include:
1. Trigger conditions ("Use this agent when...")
2. Keywords that invoke the agent
3. 3-4 examples showing user → assistant delegation

**Format options:**

```yaml
# Escaped newlines (compact)
description: Use this agent when reviewing code for security vulnerabilities.\n\n<example>\nContext: User wants security review.\nuser: "Check this auth code"\nassistant: "I'll use the security-reviewer agent."\n</example>

# YAML multiline (readable)
description: |
  Use this agent when reviewing code for security vulnerabilities.

  <example>
  Context: User wants security review.
  user: "Check this auth code"
  assistant: "I'll use the security-reviewer agent."
  </example>
```

### Optional Fields

#### `model`

**Type**: `string`
**Required**: Optional
**Default**: Inherits from parent
**Purpose**: Override model selection

```yaml
# Preferred: inherit from parent conversation
model: inherit

# Or specify when needed:
model: haiku   # Fast, simple tasks
model: sonnet  # Balanced (default)
model: opus    # Complex reasoning
```

**Best practice**: Use `model: inherit` unless you have a specific reason to override.

#### `tools`

**Type**: `string` (comma-separated)
**Required**: Optional
**Default**: Inherits from parent (full access)
**Purpose**: Restrict which tools the agent can use

**Philosophy**: Don't over-restrict. Only specify when there's a safety reason.

**Baseline tools** (include when restricting):
```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite
```

**Common patterns:**

```yaml
# Standard agent — DON'T specify tools, inherit full access

# Read-only analysis
tools: Glob, Grep, Read, Skill, Task, TodoWrite

# Read-only with git history
tools: Glob, Grep, Read, Skill, Task, TodoWrite, Bash(git show:*), Bash(git diff:*)

# Research agent
tools: Glob, Grep, Read, Skill, Task, TodoWrite, WebSearch, WebFetch
```

**Tool restriction syntax:**

```yaml
# Full tool access
Bash

# Restrict to command family
Bash(git *)

# Restrict to specific subcommand
Bash(git status:*)

# File pattern restrictions
Write(tests/**), Write(*.test.ts)
```

#### `color`

**Type**: `string`
**Required**: Optional
**Purpose**: Status line color for this agent

```yaml
color: orange
```

## Agent Configuration

### Minimal Agent

```markdown
---
name: code-formatter
description: Use this agent for code formatting tasks.\n\n<example>\nContext: User wants code formatted.\nuser: "Format the utils module"\nassistant: "I'll use the code-formatter agent."\n</example>
model: inherit
---

# Code Formatter

Format code according to project style guide.

Run formatter on provided files and report results.
```

**When to use:** Quick, focused agents for simple tasks.

### Standard Agent

```markdown
---
name: auth-security-reviewer
description: Use this agent when reviewing authentication implementations for security issues. Triggers on auth flow review, token security analysis, or session management validation.\n\n<example>\nContext: User wants auth code reviewed.\nuser: "Review the login flow for security issues"\nassistant: "I'll use the auth-security-reviewer agent to analyze the authentication implementation."\n</example>\n\n<example>\nContext: User mentions specific auth concern.\nuser: "Check our JWT token handling"\nassistant: "I'll delegate to the auth-security-reviewer agent for token security analysis."\n</example>
model: inherit
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
name: db-migration
description: Use this agent for database schema migrations with rollback capability. Triggers on migration generation, rollback script creation, or schema versioning.\n\n<example>\nContext: User needs database migration.\nuser: "Create a migration to add user preferences table"\nassistant: "I'll use the db-migration agent to generate forward and rollback scripts."\n</example>\n\n<example>\nContext: User needs rollback.\nuser: "Roll back the last migration"\nassistant: "I'll delegate to the db-migration agent to execute the rollback safely."\n</example>
model: inherit
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

## Description Examples

The description field drives agent invocation. Good examples help Claude understand when to use the agent.

### Example Format

Each example should have:
- **Context**: Brief situation description
- **user**: What the user says
- **assistant**: How Claude explains the delegation

```yaml
description: |
  Use this agent when [trigger conditions].

  <example>
  Context: [Situation]
  user: "[User message]"
  assistant: "[Claude's delegation response]"
  </example>
```

### Example Coverage

Include 3-4 examples covering:
1. **Typical use case** — most common invocation
2. **Specific trigger** — keyword-based invocation
3. **Edge case** — less obvious but valid use
4. **Verb trigger** — action words that invoke agent

```yaml
description: |
  Use this agent for security vulnerability detection in code.

  <example>
  Context: User wants security review.
  user: "Review this auth code for vulnerabilities"
  assistant: "I'll use the security-reviewer agent to analyze for security issues."
  </example>

  <example>
  Context: User mentions specific vulnerability type.
  user: "Check for SQL injection in the user service"
  assistant: "I'll delegate to the security-reviewer agent for SQL injection analysis."
  </example>

  <example>
  Context: User uses audit verb.
  user: "Audit the payment module"
  assistant: "I'll use the security-reviewer agent to audit the payment code."
  </example>
```

### Trigger Keywords

Include terms users naturally say in your description:
- Action verbs: "review", "check", "audit", "analyze", "test"
- Domain terms: "security", "performance", "auth", "API"
- Specific technologies: "GraphQL", "JWT", "PostgreSQL"

## Tool Configuration

### Default: Inherit from Parent

Most agents should NOT specify `tools`. They inherit full access from the parent conversation.

```markdown
---
name: code-reviewer
description: ...
model: inherit
---
# No tools field — inherits full access
```

### When to Restrict Tools

Only restrict when:
- Agent's purpose is explicitly read-only
- There's a specific safety concern
- You want to prevent accidental modifications

### Baseline Tools

When restricting, always include these baseline tools:
```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite
```

These enable: file discovery, searching, reading, skill loading, sub-agent delegation, and task tracking.

### Common Patterns

**Read-only analysis:**
```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite
```

**Read-only with git history:**
```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite, Bash(git show:*), Bash(git diff:*)
```

**Research agent:**
```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite, WebSearch, WebFetch
```

**Implementation agent:**
```yaml
tools: Glob, Grep, Read, Write, Edit, Bash, Skill, Task, TodoWrite
```

### Pattern Matching

Tool restrictions support patterns:

```yaml
# Full tool access
Bash

# Restrict to command family
Bash(git *)

# Restrict to specific subcommand
Bash(git status:*)

# File path patterns
Write(tests/**/*.ts)
Write(__tests__/**/*)

# MCP tools
mcp__server__tool
mcp__server__*
```

### Testing Tool Restrictions

```markdown
# Create test agent with restricted tools
cat > agents/test-readonly.md << 'EOF'
---
name: test-readonly
description: Test read-only agent.\n\n<example>\nContext: Testing.\nuser: "Test"\nassistant: "Testing read-only agent."\n</example>
tools: Glob, Grep, Read, Skill, Task, TodoWrite
model: inherit
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
# ✅ Good: Keywords + examples in description
description: |
  React testing specialist using Jest and React Testing Library.
  Triggers on component testing, Jest test creation, or RTL usage.

  <example>
  Context: User wants to test a React component
  user: "Write tests for the UserProfile component"
  assistant: "I'll use the react-tester agent to create tests."
  </example>

# Keywords embedded: react, testing, jest, react testing library
# Clear triggers: "test react component", "jest tests", "RTL"

# ❌ Bad: Vague description, no examples
description: Testing helper

# Keywords: testing (too generic)
# No examples = hard to trigger specifically
```

### Debug Discovery

```bash
# Enable debug mode
claude --debug

# Look for agent loading messages:
# "Loading agent: security-reviewer"
# "Agent description parsed"
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
name: performance-analyzer
description: Use this agent for performance bottleneck identification and analysis. Triggers on profiling, bundle size analysis, or memory leak detection.\n\n<example>\nContext: User reports performance issue.\nuser: "The app is slow"\nassistant: "I'll use the performance-analyzer agent to identify bottlenecks."\n</example>
model: inherit
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
name: component-builder
description: Use this agent for React component creation following design system. Triggers on component generation or TypeScript interface design.\n\n<example>\nContext: User wants a new component.\nuser: "Create a modal dialog component"\nassistant: "I'll use the component-builder agent to create the modal."\n</example>
model: inherit
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
name: quality-reviewer
description: Use this agent for code quality review with focus on maintainability. Triggers on code smell detection, complexity analysis, or SOLID principles review.\n\n<example>\nContext: User wants code reviewed.\nuser: "Review this PR"\nassistant: "I'll use the quality-reviewer agent to evaluate the code."\n</example>
model: inherit
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
name: tdd-specialist
description: Use this agent for test suite generation with TDD focus. Triggers on unit test generation, coverage improvement, or edge case identification.\n\n<example>\nContext: User needs tests.\nuser: "Create tests for the auth service"\nassistant: "I'll use the tdd-specialist agent to generate tests."\n</example>
model: inherit
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
name: ts-migrator
description: Use this agent for JavaScript to TypeScript migration. Triggers on type annotation, interface generation, or type error resolution.\n\n<example>\nContext: User wants to add types.\nuser: "Migrate this module to TypeScript"\nassistant: "I'll use the ts-migrator agent to add type annotations."\n</example>
model: inherit
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
name: k8s-deployer
description: Use this agent for Kubernetes deployment tasks. Triggers on manifest creation, deployment orchestration, or rollback execution.\n\n<example>\nContext: User wants to deploy.\nuser: "Deploy to staging"\nassistant: "I'll use the k8s-deployer agent to handle the deployment."\n</example>
tools: Glob, Grep, Read, Skill, Task, TodoWrite, Bash(kubectl *), Bash(docker *)
model: inherit
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
name: doc-researcher
description: Use this agent for documentation research and synthesis. Triggers on documentation search, API reference lookup, or best practice identification.\n\n<example>\nContext: User needs documentation.\nuser: "Find docs on React hooks"\nassistant: "I'll use the doc-researcher agent to find documentation."\n</example>
tools: Glob, Grep, Read, Skill, Task, TodoWrite, WebSearch, WebFetch
model: inherit
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

2. **Tool philosophy:**
```yaml
# Default: inherit from parent (don't over-restrict)
model: inherit

# If agent needs specific tools, use baseline + extras
tools: Glob, Grep, Read, Skill, Task, TodoWrite, WebSearch

# Full bash when needed (prefer over Bash(*))
tools: Glob, Grep, Read, Skill, Task, TodoWrite, Bash
```

3. **Focused description:**
```yaml
# ❌ Too many triggers (hard to invoke correctly)
description: Does everything related to code...

# ✅ Focused description (clear when to invoke)
description: |
  SQL injection vulnerability detector. Triggers on
  SQL security review, injection detection, or query validation.
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
