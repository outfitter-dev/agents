# Agent Frontmatter

YAML frontmatter schema for agent files.

## Required Fields

### `name`

Agent identifier. Should match filename without `.md`.

```yaml
name: security-reviewer
```

### `description`

When to use + trigger keywords + examples. Most critical field for discovery.

**Format:**

```yaml
description: |
  Use this agent when [trigger conditions]. Triggers on [keywords].

  <example>
  Context: [Situation]
  user: "[User message]"
  assistant: "[Claude's delegation response]"
  </example>
```

**Checklist:**
- Starts with "Use this agent when..."
- Includes 3-5 trigger keywords
- Has 3-4 examples covering: typical use, edge case, verb triggers
- Specific, not vague

**Example:**

```yaml
description: |
  Use this agent for security vulnerability detection in code.
  Triggers on security audits, OWASP, injection, XSS, auth review.

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
```

## Optional Fields

### `model`

Model selection. Default: `sonnet` (NOT inherited automatically).

```yaml
model: inherit  # Use parent's model (recommended)
model: haiku    # Fast/cheap - simple tasks, quick exploration
model: sonnet   # Balanced - standard tasks (default if omitted)
model: opus     # Complex reasoning, high-stakes decisions
```

**Guidance:**
- `inherit` — Recommended default. Adapts to parent's model context
- `haiku` — Fast exploration, simple pattern matching, low-latency
- `sonnet` — Good default. Balanced cost/capability
- `opus` — Deeper reasoning, higher quality output, complex analysis

**When to use `opus`:** Nuanced judgment, multi-step reasoning, security/architecture review, complex refactoring, irreversible decisions, when quality matters more than speed.

**When `sonnet` is fine:** Straightforward implementation, standard review, test generation, docs.

### `skills`

Skills to auto-load. **Critical:** Subagents do NOT inherit skills from parent.

```yaml
skills: tdd, debugging, type-safety
```

If your agent needs specific skills, you must explicitly list them here.

### `permissionMode`

Control permission handling for automation scenarios.

```yaml
permissionMode: default           # Standard permission handling
permissionMode: acceptEdits       # Auto-accept edit operations
permissionMode: bypassPermissions # Skip permission prompts entirely
permissionMode: plan              # Planning mode permissions
```

Use `acceptEdits` or `bypassPermissions` for CI/CD or batch processing agents.

### `tools`

Restrict tool access. Default: inherits full access from parent.

```yaml
# Read-only analysis
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet

# With git history
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash(git show:*), Bash(git diff:*)

# Research agent
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, WebSearch, WebFetch
```

See [tools.md](tools.md) for detailed patterns.

### `color`

Status line color for this agent.

```yaml
color: orange
```

## File Naming

- Kebab-case: `security-reviewer.md`, `api-tester.md`
- No spaces or special characters
- Extension must be `.md`
- Filename = agent identifier

```
agents/security-reviewer.md     → subagent_type: "security-reviewer"
agents/db-migrator.md           → subagent_type: "db-migrator"
```

## File Locations

| Scope | Path | Priority |
|-------|------|----------|
| Project | `.claude/agents/` | Highest |
| Personal | `~/.claude/agents/` | Medium |
| Plugin | `<plugin>/agents/` | Lowest |

Project-level agents take precedence over personal agents. This allows team-specific agents to override personal defaults.

## Minimal Example

```markdown
---
name: code-formatter
description: |
  Use this agent for code formatting tasks.

  <example>
  Context: User wants code formatted.
  user: "Format the utils module"
  assistant: "I'll use the code-formatter agent."
  </example>
model: inherit
---

# Code Formatter

Format code according to project style guide.
```

## Standard Example

```markdown
---
name: auth-security-reviewer
description: |
  Use this agent when reviewing authentication implementations.
  Triggers on auth flow review, token security, session management.

  <example>
  Context: User wants auth code reviewed.
  user: "Review the login flow for security issues"
  assistant: "I'll use the auth-security-reviewer agent."
  </example>

  <example>
  Context: User mentions specific auth concern.
  user: "Check our JWT token handling"
  assistant: "I'll delegate to the auth-security-reviewer agent."
  </example>
model: inherit
---

# Authentication Security Reviewer

## Expertise
- OAuth 2.0 and OIDC
- JWT tokens
- Session management

## Process
1. Analyze authentication flow
2. Check token handling
3. Verify session security
4. Report findings with severity
```
