---
name: claude-agents
description: This skill should be used when creating agents, writing agent frontmatter, configuring subagents, or when "create agent", "agent.md", "subagent", or "Task tool" are mentioned.
metadata:
  version: "1.0.0"
  related-skills:
    - skills-dev
    - claude-plugins
    - claude-hooks
---

# Claude Agent Development

Create and validate specialized subagents that extend Claude Code with focused expertise.

## Agents vs Skills

**Critical distinction**:

| Aspect         | Agents (This Skill)                         | Skills                                 |
| -------------- | ------------------------------------------- | -------------------------------------- |
| **Purpose**    | Specialized subagents with focused expertise | Capability packages with instructions  |
| **Invocation** | Task tool (`subagent_type` parameter)       | Automatic (model-triggered by context) |
| **Location**   | `agents/` directory                         | `skills/` directory                    |
| **Structure**  | Single `.md` file with frontmatter          | Directory with `SKILL.md` + resources  |

See [agent-vs-skill.md](references/agent-vs-skill.md) for details.

## Quick Start

### Using Templates

Copy a template from `templates/`:

| Template          | Use When                                     |
| ----------------- | -------------------------------------------- |
| `basic.md`        | Simple agents with focused expertise         |
| `advanced.md`     | Full-featured agents with all config options |

### Scaffolding

```bash
./scripts/scaffold-agent.sh security-reviewer -t reviewer
```

## Workflow Overview

1. **Discovery** - Define purpose, scope, and triggers
2. **Design** - Choose archetype and configuration
3. **Implementation** - Write frontmatter and instructions
4. **Validation** - Verify against quality standards

---

## Stage 1: Discovery

Before writing code, clarify:

- **Purpose**: What specialized expertise does this agent provide?
- **Triggers**: What keywords/phrases should invoke it?
- **Scope**: What does it do? What does it NOT do?
- **Location**: Personal (`~/.claude/agents/`), project (`agents/`), or plugin?

**Key questions**:
- Is this a specialized role or a general capability? (Role = agent, Capability = skill)
- What user phrases should trigger this agent?
- What tools does it need access to?

---

## Stage 2: Design

### Agent Archetypes

| Type | Purpose | Typical Tools |
|------|---------|---------------|
| **Analyzer** | Examine without modifying | `Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet` |
| **Implementer** | Build and modify code | Full access (inherit) |
| **Reviewer** | Provide feedback | `Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet` |
| **Tester** | Create and manage tests | `Glob, Grep, Read, Write, Edit, Bash, ...` |
| **Researcher** | Find and synthesize info | `..., WebSearch, WebFetch` |
| **Deployer** | Handle infrastructure | `..., Bash(kubectl *), Bash(docker *)` |

See [agent-types.md](references/agent-types.md) for details.

### Frontmatter Schema

```yaml
---
name: agent-name           # Required: kebab-case, matches filename
description: |             # Required: when to use + triggers + examples
  Use this agent when [conditions]. Triggers on [keywords].

  <example>
  Context: [Situation]
  user: "[User message]"
  assistant: "I'll use the agent-name agent to [action]."
  </example>
model: inherit             # Optional: inherit|haiku|sonnet|opus
tools: Glob, Grep, Read    # Optional: restrict tools (default: inherit all)
skills: tdd, debugging     # Optional: skills to auto-load (NOT inherited)
permissionMode: default    # Optional: default|acceptEdits|bypassPermissions
---
```

See [frontmatter.md](references/frontmatter.md) for complete schema.

### Model Selection

| Model | When to Use |
|-------|-------------|
| `inherit` | Recommended default - adapts to parent context |
| `haiku` | Fast exploration, simple tasks, low-latency |
| `sonnet` | Balanced cost/capability (default if omitted) |
| `opus` | Nuanced judgment, security/architecture review, irreversible decisions |

### Tool Configuration

**Philosophy**: Don't over-restrict. Only limit tools when there's a specific safety reason.

**Baseline** (always include when restricting):

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

See [tools.md](references/tools.md) for patterns.

---

## Stage 3: Implementation

### Agent File Structure

```markdown
---
name: security-reviewer
description: |
  Use this agent for security vulnerability detection.
  Triggers on security audits, OWASP, injection, XSS.

  <example>
  Context: User wants security review.
  user: "Review auth code for vulnerabilities"
  assistant: "I'll use the security-reviewer agent."
  </example>
model: inherit
---

# Security Reviewer

You are a security expert specializing in [expertise].

## Expertise

- Domain expertise 1
- Domain expertise 2

## Process

### Step 1: [Stage Name]
- Action item
- Action item

### Step 2: [Stage Name]
- Action item

## Output Format

For each finding:
- **Severity**: critical|high|medium|low
- **Location**: file:line
- **Issue**: Description
- **Remediation**: How to fix

## Constraints

**Always:**
- Required behavior

**Never:**
- Prohibited action
```

### Description Guidelines

Descriptions are the most critical field for agent discovery:

1. **Start with trigger conditions**: "Use this agent when..."
2. **Include 3-5 trigger keywords**: specific terms users would say
3. **Add 2-3 examples**: showing user request -> assistant delegation
4. **Be specific**: avoid vague descriptions like "helps with code"

### Best Practices

**Single Responsibility**

```yaml
# Good: Focused
description: SQL injection vulnerability detector

# Bad: Too broad
description: Security expert handling all issues
```

**Document Boundaries**

```markdown
## What I Don't Do
- I analyze, not implement fixes
- I review, not build from scratch
```

**Consistent Output Format**

Define structured output so results are predictable and parseable.

---

## Stage 4: Validation

After creating an agent, validate against these checklists.

### YAML Frontmatter Checks

- [ ] Opens with `---` on line 1
- [ ] Closes with `---` before content
- [ ] `name` present and matches filename (without `.md`)
- [ ] `description` present and non-empty
- [ ] Uses spaces (not tabs) for indentation
- [ ] `tools` uses comma-separated valid tool names
- [ ] `model` is valid: `sonnet`, `opus`, `haiku`, or `inherit`

### Naming Conventions

- [ ] Kebab-case (lowercase-with-hyphens)
- [ ] Follows `[role]-[specialty]` or `[specialty]` pattern
- [ ] Specific, not generic
- [ ] Concise (1-3 words, max 4)

**Good**: `code-reviewer`, `test-runner`, `security-auditor`
**Bad**: `helper`, `my-agent`, `the-best-agent`

### Description Quality

- [ ] **WHAT**: Explains what the agent does
- [ ] **WHEN**: States when to invoke it
- [ ] **TRIGGERS**: Includes 3-5 trigger keywords
- [ ] **EXAMPLES**: Has 2-3 example conversations
- [ ] Specific about agent's purpose (not vague)
- [ ] Clear about scope

**Anti-patterns**:
- "Helps with code" - too vague
- No trigger conditions
- Missing keywords

### System Prompt Quality

- [ ] Clear role definition
- [ ] Step-by-step process
- [ ] Key practices or guidelines
- [ ] Output format specification
- [ ] Specific and actionable instructions
- [ ] Constraints (what NOT to do)
- [ ] Single responsibility focus

**Anti-patterns**:
- "You are helpful" - too vague
- No process defined
- Missing constraints
- Scope creep

### Tool Configuration

- [ ] Field name is `tools:` (not `allowed-tools:`)
- [ ] Comma-separated list
- [ ] Tool names correctly spelled and case-sensitive
- [ ] Includes baseline tools if restricting: `Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet`
- [ ] Tools appropriate for agent's purpose

**Common patterns**:

```yaml
# Read-only
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet

# Read-only + git
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash(git show:*), Bash(git diff:*)

# Research
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, WebSearch, WebFetch

# Full access
# (omit field to inherit all)
```

### Validation Report Format

```markdown
# Agent Validation Report: [Agent Name]

## Summary
- **Status**: PASS | FAIL | WARNINGS
- **Location**: [path]
- **Issues**: [count critical] / [count warnings]

## Critical Issues (must fix)
1. [Issue with specific fix]

## Warnings (should fix)
1. [Issue with specific fix]

## Strengths
- [What's done well]
```

---

## Agent Scopes

| Scope | Location | Priority | Visibility |
|-------|----------|----------|------------|
| Project | `agents/` | Highest | Team via git |
| Personal | `~/.claude/agents/` | Medium | You only |
| Plugin | `<plugin>/agents/` | Lowest | Plugin users |

Project agents override personal agents with the same name.

---

## Testing Agents

### Manual Testing

1. Create agent file in `agents/`
2. In Claude Code: "Use the [agent-name] agent to [task]"
3. Claude invokes via Task tool
4. Review results

### Verify Discovery

Agents are loaded from:
- `~/.claude/agents/` (personal)
- `./agents/` (project)
- Plugins (installed)

Debug with: `claude --debug`

---

## Troubleshooting

### Agent Not Being Invoked

- Check file location: `agents/agent-name.md`
- Validate YAML frontmatter syntax
- Make description more specific with trigger keywords
- Add example conversations

### Wrong Agent Invoked

- Make description more distinct
- Add specific trigger keywords
- Include negative examples (what NOT to use it for)

### Agent Has Wrong Tools

Prefer `model: inherit` to use parent's tool access. Only specify `tools:` when agent needs different access.

---

## References

| Reference | Content |
|-----------|---------|
| [agent-vs-skill.md](references/agent-vs-skill.md) | Agents vs Skills distinction |
| [frontmatter.md](references/frontmatter.md) | YAML schema and fields |
| [tools.md](references/tools.md) | Tool configuration patterns |
| [task-tool.md](references/task-tool.md) | Task tool integration |
| [discovery.md](references/discovery.md) | How agents are found and loaded |
| [agent-types.md](references/agent-types.md) | Archetypes: analysis, implementation, etc. |
| [patterns.md](references/patterns.md) | Best practices and multi-agent patterns |
| [tasks.md](references/tasks.md) | Task tool patterns for agents |
| [advanced-features.md](references/advanced-features.md) | Resumable agents, CLI config |

See [EXAMPLES.md](EXAMPLES.md) for complete real-world agent examples.
See `templates/` for starter templates.

---

## Related Skills

- **skills-development**: Create Skills (different from agents)
- **claude-plugin-development**: Bundle agents into plugins
