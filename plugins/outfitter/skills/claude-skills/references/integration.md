# Integration Patterns

How skills integrate with commands, hooks, MCP servers, and agents.

## Skills + Commands

Commands can trigger skills implicitly through context.

### Pattern: Command as Entry Point

**Command** (`.claude/commands/audit-security.md`):

```markdown
---
description: Run security audit on codebase
allowed-tools: Read Grep Glob
---

Perform a security audit focusing on:
- Authentication flows
- Input validation
- SQL injection vectors

Use the security-audit skill methodology.
```

Claude recognizes the security context and activates the skill automatically.

### Pattern: Explicit Skill Loading

**Command**:

```markdown
---
description: Review PR with style checks
---

Use the Skill tool to load the code-review skill, then:
1. Review changes in the current PR
2. Check against style guidelines
3. Generate review comments
```

## Skills + Hooks

Hooks can trigger skill loading or suggest usage.

### PostToolUse Suggestion

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit(*.ts)|Write(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Consider running the typescript-linter skill'"
          }
        ]
      }
    ]
  }
}
```

### PreToolUse Validation

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write(**/SKILL.md)|Edit(**/SKILL.md)",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate-skill.ts"
          }
        ]
      }
    ]
  }
}
```

### Stop Hook for Quality Gates

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun run lint && bun test"
          }
        ]
      }
    ]
  }
}
```

## Skills + MCP Servers

**Pattern**: Skills provide workflows, MCP servers provide data/tools.

### Architecture

- **MCP Server**: Handles authentication, rate limiting, data access
- **Skill**: Handles business logic, formatting, workflows

### Example: Linear Integration

```yaml
---
name: linear-standup
description: Generates team standup reports from Linear issues
allowed-tools: mcp__linear__get_issues mcp__linear__get_projects
---

# Linear Standup

Use the Linear MCP server to:
1. Fetch issues by status and assignee
2. Group by project and priority
3. Format as standup report
```

### Example: Memory Integration

```yaml
---
name: context-saver
description: Saves important context to memory for later retrieval
allowed-tools: mcp__memory__store mcp__memory__retrieve
---

# Context Saver

When the user says "remember this" or similar:
1. Extract key information
2. Store via memory MCP server
3. Confirm what was saved
```

## Skills + Agents

Skills can specify agents for forked execution.

### Skill-Loaded Agent

```yaml
---
name: deep-analysis
context: fork
agent: outfitter:analyst
model: opus
description: Deep analysis requiring extensive reasoning
---

# Deep Analysis

Perform thorough analysis of the given topic...
```

When invoked, skill runs in a forked context using the analyst agent with opus model.

### Agent Loading Skills

Agents can load skills for specific capabilities:

```markdown
# Security Reviewer Agent

When reviewing code:
1. Load the security-patterns skill for vulnerability patterns
2. Apply patterns to codebase
3. Report findings with remediation
```

## Master-Clone Pattern

Orchestrate specialized work with context isolation.

```
User request
   |
Master agent (main context)
   |
+---> Fork: security-audit skill (isolated)
|        Returns: findings summary
|
+---> Fork: performance-analysis skill (isolated)
|        Returns: performance report
|
Master synthesizes results
   |
Response to user
```

### Implementation

**Skill 1** (`security-audit`):

```yaml
---
name: security-audit
context: fork
agent: outfitter:reviewer
---
```

**Skill 2** (`performance-analysis`):

```yaml
---
name: performance-analysis
context: fork
agent: outfitter:analyst
---
```

**Master agent invokes via Task tool:**

```json
[
  {
    "description": "Security audit",
    "prompt": "Run security-audit skill on src/auth/",
    "subagent_type": "outfitter:reviewer",
    "run_in_background": true
  },
  {
    "description": "Performance analysis",
    "prompt": "Run performance-analysis skill on src/api/",
    "subagent_type": "outfitter:analyst",
    "run_in_background": true
  }
]
```

## Chaining Skills

Skills can reference other skills for complex workflows.

### Sequential Chain

```markdown
# Code Review Skill

1. Load `code-quality` skill for static analysis
2. Load `security-patterns` skill for vulnerability check
3. Load `performance-tips` skill for optimization suggestions
4. Synthesize into unified review
```

### Conditional Loading

```markdown
# Smart Analyzer

Based on file type:
- `.ts`/`.tsx`: Load `typescript-patterns` skill
- `.rs`: Load `rust-patterns` skill
- `.py`: Load `python-patterns` skill

Then proceed with analysis.
```
