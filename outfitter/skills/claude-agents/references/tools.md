# Tool Configuration

How to configure tool access for agents.

## Philosophy

**Don't over-restrict.** Agents work best with appropriate access. Only restrict when there's a specific safety reason.

## Default: Inherit

Most agents should NOT specify `tools`. They inherit full access from parent.

```markdown
---
name: code-reviewer
description: ...
model: inherit
---
# No tools field — inherits full access
```

## When to Restrict

Only restrict when:
- Agent's purpose is explicitly read-only
- Specific safety concern exists
- Want to prevent accidental modifications

**Don't restrict when:**
- Agent needs flexibility to complete task
- Being "cautious" without specific reason

## Baseline Tools

When restricting, always include these:

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

These enable: file discovery, searching, reading, skill loading, sub-agent delegation, task tracking.

## Common Patterns

**Read-only analysis:**

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

**Read-only with git history:**

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash(git show:*), Bash(git diff:*)
```

**Research agent:**

```yaml
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, WebSearch, WebFetch
```

**Implementation agent:**

```yaml
tools: Glob, Grep, Read, Write, Edit, Bash, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
```

## Pattern Matching Syntax

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

## Examples

### Security Auditor (read-only)

```markdown
---
name: security-auditor
description: Read-only security analysis.
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash(git diff:*), Bash(git log:*)
model: inherit
---
```

### Deployment Agent (specific commands)

```markdown
---
name: k8s-deployer
description: Kubernetes deployment tasks.
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash(kubectl *), Bash(docker *)
model: inherit
---
```

### Test Writer (file restrictions)

```markdown
---
name: test-writer
description: Writes tests only in test directories.
tools: Glob, Grep, Read, Skill, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Write(tests/**), Write(__tests__/**)
model: inherit
---
```

## Testing Tool Restrictions

1. Create agent with `tools` field
2. Ask Claude to use the agent
3. Verify agent has access to specified tools
4. Verify restricted tools require permission or fail
