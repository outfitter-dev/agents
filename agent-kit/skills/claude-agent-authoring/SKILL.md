---
name: claude-agent-authoring
description: Creates specialized subagents for Claude Code with proper configuration, capabilities, tool restrictions, and Task tool integration. Use when building specialized agents, editing agent files, creating subagents for specific tasks, or when users mention agent development, subagent configuration, or Task tool usage. Different from Skills - agents are invoked via Task tool.
version: 1.0.0
---

# Claude Agent Authoring

Create specialized subagents that extend Claude Code with focused expertise and capabilities.

## Overview

**Agents vs Skills**: This is critical to understand:

| Aspect         | Agents (This Skill)                                | Skills                                 |
| -------------- | -------------------------------------------------- | -------------------------------------- |
| **Purpose**    | Specialized subagents with focused expertise       | Capability packages with instructions  |
| **Invocation** | Task tool (`subagent_type` parameter)              | Automatic (model-triggered by context) |
| **Location**   | `agents/` directory                                | `skills/` directory                    |
| **Structure**  | Single `.md` file with frontmatter                 | Directory with `SKILL.md` + resources  |
| **Scope**      | Narrow, specialized tasks                          | Broad capabilities                     |
| **Use case**   | "Ask security expert to audit", "Use tester agent" | "Work with PDFs", "Review code"        |

**Key distinction**: Agents are invoked explicitly through the Task tool, Skills are discovered and used automatically.

## Quick Start

### Using Templates

Start with a template from `templates/`:

| Template                | Use When                                            |
| ----------------------- | --------------------------------------------------- |
| `templates/basic.md`    | Simple agents with focused expertise                |
| `templates/advanced.md` | Full-featured agents with all configuration options |

```bash
# Copy template to start a new agent
cp templates/basic.md agents/my-agent.md
```

### Invoking Agents

Agents are invoked through the Task tool:

```json
{
  "description": "Review auth code for security issues",
  "prompt": "Analyze the authentication implementation for vulnerabilities",
  "subagent_type": "security-reviewer"
}
```

## Agent Configuration

### Frontmatter

| Field            | Required | Purpose                                               | Example             |
| ---------------- | -------- | ----------------------------------------------------- | ------------------- |
| `name`           | Yes      | Agent identifier (matches filename)                   | `security-reviewer` |
| `description`    | Yes      | When to use + examples (see format below)             | See examples        |
| `model`          | No       | Model selection (see below)                           | `inherit`           |
| `tools`          | No       | Restrict tool usage (omit to inherit)                 | `Read, Grep, Glob`  |
| `skills`         | No       | Skills to auto-load (subagents do NOT inherit skills) | `tdd, debugging`    |
| `permissionMode` | No       | Permission handling mode                              | `acceptEdits`       |
| `color`          | No       | Status line color                                     | `orange`            |

### Model Selection

```yaml
model: inherit  # Use parent's model (recommended default)
model: haiku    # Fast/cheap - simple tasks, quick exploration
model: sonnet   # Balanced - standard tasks (default if omitted)
model: opus     # Complex reasoning, high-stakes decisions
```

**Guidance:**
- `inherit` — Recommended default. Adapts to parent's model context
- `haiku` — Fast exploration, simple pattern matching, low-latency responses
- `sonnet` — Good default for most agents. Balanced cost/capability
- `opus` — Deeper reasoning, higher quality output, complex analysis

**When to use `opus`:**
- Tasks requiring nuanced judgment or multi-step reasoning
- Security auditors (subtle vulnerabilities, threat modeling)
- Architecture reviewers (system-wide implications, tradeoff analysis)
- Complex refactoring (reasoning about many interacting changes)
- Agents making irreversible decisions (migrations, API contracts)
- When output quality matters more than speed/cost

**When `sonnet` is fine:**
- Straightforward implementation tasks
- Standard code review
- Test generation
- Documentation and formatting

### Permission Mode

```yaml
permissionMode: default           # Standard permission handling
permissionMode: acceptEdits       # Auto-accept edit operations
permissionMode: bypassPermissions # Skip permission prompts entirely
permissionMode: plan              # Planning mode permissions
```

Use `acceptEdits` or `bypassPermissions` for automation-focused agents (CI/CD, batch processing).

### Skills Field

**Important:** Subagents do NOT inherit skills from the parent conversation. Use the `skills` field to preload skills:

```yaml
skills: tdd, debugging, type-safety
```

### Description Format

Descriptions should include:
1. **When to use**: Trigger conditions and keywords
2. **Examples**: 3-4 examples showing user request → assistant delegation

**Format**: Use escaped newlines (`\n\n`) with `<example>` tags:

```yaml
---
name: testing-specialist
description: Use this agent for test creation, coverage analysis, and TDD guidance. Triggers on test generation, coverage improvement, or when users mention unit tests, integration tests, or mocking.\n\n<example>\nContext: User wants to add tests to existing code.\nuser: "Add unit tests for the user service"\nassistant: "I'll use the testing-specialist agent to generate comprehensive unit tests."\n</example>\n\n<example>\nContext: User mentions coverage goals.\nuser: "We need 90% test coverage on the auth module"\nassistant: "I'll delegate to the testing-specialist agent to analyze gaps and generate tests."\n</example>
model: inherit
---
```

**Alternative**: Use YAML multiline (`|`) for readability:

```yaml
---
name: testing-specialist
description: |
  Use this agent for test creation, coverage analysis, and TDD guidance.

  <example>
  Context: User wants to add tests.
  user: "Add unit tests for the user service"
  assistant: "I'll use the testing-specialist agent to generate comprehensive unit tests."
  </example>
model: inherit
---
```

**Description Guidelines**:
- Start with "Use this agent when..." or trigger conditions
- Include 3-4 examples covering: typical use, edge case, verb triggers
- Mention specific keywords users might say

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

**Use TodoWrite while authoring.** Creating an agent involves multiple steps—use TodoWrite to track progress.

<initial_todo_template>

- [ ] Define agent purpose and expertise
- [ ] Write frontmatter (name, description with examples, tools, model)
- [ ] Write agent body (identity, instructions, output format)
- [ ] Validate with claude-agent-validation skill
- [ ] Test invocation via Task tool

</initial_todo_template>

This keeps you on track and ensures you don't skip steps like validation.

### 1. Define Clear Expertise

```markdown
---
name: api-tester
description: Use this agent for API testing of REST and GraphQL endpoints. Triggers on API validation, endpoint testing, or when users mention REST, GraphQL, authentication flows, or rate limiting.\n\n<example>\nContext: User wants API endpoint validation.\nuser: "Test the user API endpoints"\nassistant: "I'll use the api-tester agent to validate the REST endpoints."\n</example>\n\n<example>\nContext: User mentions GraphQL testing.\nuser: "Validate our GraphQL queries"\nassistant: "I'll delegate to the api-tester agent for GraphQL validation."\n</example>
model: inherit
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

## Tool Configuration

### Default Philosophy

**Don't over-restrict tools.** Agents work best with appropriate access. Only restrict when there's a specific safety reason.

**Baseline tools** (generally always allow):

```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite
```

These enable: file discovery, searching, reading, skill loading, sub-agent delegation, and task tracking.

**Layer in as needed:**
- `Write`, `Edit` — for agents that modify code
- `Bash` — for agents that run commands (no need for `Bash(*)`, just `Bash`)
- `Bash(git *)` — restrict to specific command families only when warranted
- `WebSearch`, `WebFetch` — for research agents

### When to Restrict Tools

**Only restrict when:**
- Agent's purpose is explicitly read-only analysis
- There's a specific safety concern (e.g., audit trail requirements)
- You want to prevent accidental modifications

**Don't restrict when:**
- The agent needs flexibility to complete its task
- You're just being "cautious" without specific reason

### Example: Read-Only Analysis Agent

```markdown
---
name: security-auditor
description: Use this agent for read-only security analysis. Triggers on security audits, vulnerability scanning, or code security review.\n\n<example>\nContext: User wants security review without changes.\nuser: "Audit the auth code for vulnerabilities"\nassistant: "I'll use the security-auditor agent to analyze security without modifications."\n</example>
tools: Glob, Grep, Read, Skill, Task, TodoWrite, Bash(git diff:*), Bash(git log:*)
model: inherit
---
```

### Common Tool Patterns

**Standard agent (most cases):**

```yaml
# Don't specify tools — inherits full access from parent
```

**Implementation agent:**

```yaml
tools: Glob, Grep, Read, Write, Edit, Bash, Skill, Task, TodoWrite
```

**Read-only analysis:**

```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite
```

**Research agent:**

```yaml
tools: Glob, Grep, Read, Skill, Task, TodoWrite, WebSearch, WebFetch
```

## Agent Types and Patterns

### Analysis Agents

Focus on examination without modification:

```markdown
---
name: performance-analyzer
description: Use this agent for performance analysis, bottleneck identification, and optimization recommendations. Triggers on performance profiling, memory leak detection, or bundle size analysis.\n\n<example>\nContext: User reports slow application.\nuser: "The app is running slow, find out why"\nassistant: "I'll use the performance-analyzer agent to identify bottlenecks."\n</example>
model: inherit
---

# Performance Analyzer

Analyze application performance and identify optimization opportunities.

[Instructions focused on analysis, measurement, reporting]
```

### Implementation Agents

Specialized in building specific features:

```markdown
---
name: component-builder
description: Use this agent for React component creation following team design system. Triggers on component generation, TypeScript interface design, or Storybook documentation.\n\n<example>\nContext: User wants a new UI component.\nuser: "Create a modal dialog component"\nassistant: "I'll use the component-builder agent to create the modal following our design system."\n</example>
model: inherit
---

# Component Builder

Build React components following the team's design system and best practices.

[Instructions for component structure, testing, documentation]
```

### Review Agents

Provide focused feedback:

```markdown
---
name: quality-reviewer
description: Use this agent for code quality review focusing on maintainability and best practices. Triggers on code smell detection, complexity analysis, or SOLID principles review.\n\n<example>\nContext: User wants code quality feedback.\nuser: "Review this module for code smells"\nassistant: "I'll use the quality-reviewer agent to analyze code quality issues."\n</example>
model: inherit
---

# Code Quality Reviewer

Review code for quality, maintainability, and adherence to best practices.

[Instructions for review criteria, scoring, reporting]
```

### Testing Agents

Specialized in test creation:

```markdown
---
name: tdd-specialist
description: Use this agent for test-driven development and comprehensive test suite creation. Triggers on unit test generation, coverage improvement, or edge case identification.\n\n<example>\nContext: User needs tests for existing code.\nuser: "Create tests for the payment service"\nassistant: "I'll use the tdd-specialist agent to generate comprehensive tests."\n</example>
model: inherit
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
  "description": "Security review of auth code",
  "prompt": "Review authentication code for security vulnerabilities",
  "subagent_type": "security-reviewer"
}
```

### With Detailed Prompt

```json
{
  "description": "Generate auth service tests",
  "prompt": "Generate unit tests for the authentication service. Focus on edge cases and error handling. Use existing test patterns from `tests/auth/`. Target 90% coverage.",
  "subagent_type": "testing-specialist"
}
```

### Resumable Agents

Agents can be resumed to continue previous conversations:

```json
{
  "description": "Continue code analysis",
  "prompt": "Now examine the error handling patterns",
  "subagent_type": "code-analyzer",
  "resume": "abc123"
}
```

Each agent execution returns an `agentId`. Use this ID with the `resume` parameter to continue with full context from the previous conversation. Useful for:
- Long-running research broken into multiple sessions
- Iterative refinement without losing context
- Multi-step workflows with sequential context

## Testing Agents

### Manual Testing

```bash
# 1. Create agent file
# `agents/test-agent.md`

# 2. In Claude Code main conversation
"Can you use the test-agent to analyze this code?"

# 3. Claude will invoke via Task tool
# Monitor the subagent's work

# 4. Review results when subagent completes
```

### Verify Agent Discovery

```bash
# Agents are loaded from:
# - `~/.claude/agents/` (personal)
# - `./agents/` (project)
# - Plugins (installed)

# Check debug output
claude --debug
```

### Test Tool Access

```bash
# 1. Create agent with tools field
# 2. Ask Claude to use the agent
# 3. Verify agent has access to specified tools
# 4. Check that tool inheritance works correctly
```

### Validate New Agents

After creating a new agent from scratch, load the **claude-agent-validation** skill to verify the agent follows correct conventions:

```text
# Load validation skill after creating agent
"Validate the new security-reviewer agent I just created"
```

The validation skill checks:
- Frontmatter schema (required fields, valid YAML)
- Description format (trigger conditions, examples)
- Tool configuration (appropriate restrictions)
- Agent body structure (clear expertise, instructions)

**Always validate before committing new agents to the repository.**

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

Include specific keywords and examples in description:

```yaml
description: |
  GraphQL schema validator and query analyzer. Triggers on schema validation,
  query complexity analysis, resolver performance, or subscription testing.

  <example>
  Context: User has GraphQL schema concerns
  user: "Can you validate my GraphQL schema?"
  assistant: "I'll use the graphql-validator agent to check the schema."
  </example>
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
name: ts-migration
description: |
  TypeScript migration specialist (v2.1). Handles JavaScript to TypeScript
  conversion, type definition generation, and generic type implementation.

  <example>
  Context: User wants to migrate JS to TS
  user: "Convert this file to TypeScript"
  assistant: "I'll use the ts-migration agent to convert the file."
  </example>
model: inherit
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
name: doc-researcher
description: |
  Documentation researcher finding answers in official docs. Triggers on
  documentation search, API reference lookup, or version compatibility questions.

  <example>
  Context: User needs API documentation
  user: "How do I use the fetch API with streaming?"
  assistant: "I'll use the doc-researcher agent to find the documentation."
  </example>
tools: Glob, Grep, Read, Skill, Task, TodoWrite, WebSearch, WebFetch
model: inherit
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
name: config-validator
description: |
  Configuration validator checking settings and schemas. Triggers on
  JSON/YAML validation, schema checking, or environment verification.

  <example>
  Context: User wants config validation
  user: "Validate my tsconfig.json"
  assistant: "I'll use the config-validator agent to check the configuration."
  </example>
tools: Glob, Grep, Read, Skill, Task, TodoWrite, Bash
model: inherit
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
name: db-migration
description: |
  Database migration specialist for safe schema changes. Triggers on
  migration script generation, rollback creation, or schema change requests.

  <example>
  Context: User needs a database migration
  user: "Create a migration to add a users table"
  assistant: "I'll use the db-migration agent to generate the migration."
  </example>
tools: Glob, Grep, Read, Skill, Task, TodoWrite, Edit, Write, Bash
model: inherit
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
3. Description: Specific with trigger keywords
4. Examples: Clear use cases in description

**Fix:**
- Make description more specific with trigger verbs
- Add example conversations in description
- Use clear task language when requesting

### Agent Has Wrong Tools

**Issue:** Agent needs different tool access

**Fix:**

```markdown
---
tools: Glob, Grep, Read, Skill, Task, TodoWrite
---
```

Note: Prefer `model: inherit` to use parent's tool access. Only specify `tools:` when agent needs different access.

### Agent Scope Too Broad

**Issue:** Agent tries to do too much

**Fix:**
- Split into multiple specialized agents
- Focus description on specific triggers
- Be specific about what agent does/doesn't do

### Agent Not Found

**Check:**
1. File extension is `.md`
2. File is in correct directory
3. No typos in filename
4. Frontmatter is valid

## References

Deep-dive documentation in `references/`:

| Reference                                               | Content                                            |
| ------------------------------------------------------- | -------------------------------------------------- |
| [agent-vs-skill.md](references/agent-vs-skill.md)       | Critical distinction between agents and skills     |
| [frontmatter.md](references/frontmatter.md)             | YAML schema, fields, description format            |
| [tools.md](references/tools.md)                         | Tool configuration and restriction patterns        |
| [task-tool.md](references/task-tool.md)                 | Task tool integration and context passing          |
| [discovery.md](references/discovery.md)                 | How agents are found and loaded                    |
| [agent-types.md](references/agent-types.md)             | Archetypes: analysis, implementation, review, etc. |
| [patterns.md](references/patterns.md)                   | Best practices and multi-agent patterns            |
| [performance.md](references/performance.md)             | Optimization and efficiency                        |
| [todowrite.md](references/todowrite.md)                 | TodoWrite patterns for agent visibility            |
| [advanced-features.md](references/advanced-features.md) | Resumable agents, CLI config, built-in agents      |

See [EXAMPLES.md](EXAMPLES.md) for complete real-world agent examples.
See `templates/` for starter templates.

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
