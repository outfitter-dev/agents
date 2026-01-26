# Claude Code Extensions

> **Note**: For comprehensive Claude Code skill development, load the `outfitter:claude-skills` skill. This reference provides a quick overview.

Claude Code-specific implementation details for Agent Skills. For cross-platform concepts (structure, frontmatter, validation), load the `outfitter:skills-dev` skill.

## Table of Contents

- [Frontmatter Extensions](#frontmatter-extensions)
- [Tool Restrictions](#tool-restrictions)
- [User Invocable Skills](#user-invocable-skills)
- [String Substitutions](#string-substitutions)
- [Dynamic Context Injection](#dynamic-context-injection)
- [Context Modes](#context-modes)
- [Testing with Debug Mode](#testing-with-debug-mode)
- [Troubleshooting](#troubleshooting)
- [Integration Patterns](#integration-patterns)
- [Master-Clone Architecture](#master-clone-architecture)
- [Hook-Based Validation](#hook-based-validation)
- [Skill + MCP Integration](#skill--mcp-integration)

---

## Frontmatter Extensions

Claude Code extends the base Agent Skills specification with additional frontmatter fields:

| Field | Type | Description |
|-------|------|-------------|
| `allowed-tools` | string | Space-separated list of tools the skill can use without permission prompts |
| `user-invocable` | boolean | Default `true`. Set to `false` to prevent slash command access |
| `disable-model-invocation` | boolean | Prevents automatic activation; requires manual invocation via Skill tool |
| `context` | string | `inherit` (default) or `fork` for isolated subagent execution |
| `agent` | string | Agent to use when skill is invoked (e.g., `outfitter:analyst`) |
| `model` | string | Override model: `haiku`, `sonnet`, or `opus` |
| `hooks` | object | Lifecycle hooks: `on-activate`, `on-complete` |
| `argument-hint` | string | Hint text shown after `/skill-name` (e.g., `[file path]`) |

### Example

```yaml
---
name: code-review
version: 1.0.0
description: Reviews code for bugs, security issues, and best practices. Use when reviewing PRs, auditing code, or before merging.
allowed-tools: Read Grep Glob Bash(git diff *)
argument-hint: [file or directory]
model: sonnet
---
```

> **Note:** `user-invocable` defaults to `true`, so skills are callable as `/skill-name` by default. Only set `user-invocable: false` if you want to prevent slash command access.

---

## Tool Restrictions

Use `allowed-tools` to specify which tools Claude can use when a skill is active. Listed tools run without permission prompts.

### Syntax

```yaml
# Space-separated list
allowed-tools: Read Grep Glob

# With Bash patterns
allowed-tools: Read Write Bash(git *) Bash(npm run *)

# MCP tools (double underscore format)
allowed-tools: Read mcp__linear__create_issue mcp__memory__store
```

### Bash Pattern Syntax

| Pattern | Meaning | Example |
|---------|---------|---------|
| `Bash(git *)` | All git commands | `git status`, `git commit` |
| `Bash(git add:*)` | Specific subcommand | `git add .`, `git add file.ts` |
| `Bash(npm run *:*)` | Nested patterns | `npm run test:unit` |

### Common Patterns

```yaml
# Read-only analysis
allowed-tools: Read Grep Glob

# File modifications
allowed-tools: Read Edit Write

# Git operations
allowed-tools: Read Write Bash(git *)

# Testing workflows
allowed-tools: Read Write Bash(bun test:*) Bash(npm test:*)

# Full development
allowed-tools: Read Edit Write Bash(git *) Bash(bun *) Bash(npm *)
```

### Tool Names (Case-Sensitive)

| Tool | Purpose |
|------|---------|
| `Read` | Read files |
| `Write` | Write new files |
| `Edit` | Edit existing files |
| `Grep` | Search file contents |
| `Glob` | Find files by pattern |
| `Bash` | Execute bash commands |
| `WebFetch` | Fetch web content |
| `WebSearch` | Search the web |

### Behavior

- **With `allowed-tools`**: Listed tools run without permission prompts
- **Without `allowed-tools`**: Inherits conversation permissions; Claude may ask

---

## User Invocable Skills

Skills are callable as slash commands by default (`user-invocable: true`). Use `user-invocable: false` to prevent slash command access for skills that should only be auto-activated.

```yaml
---
name: code-review
description: Reviews code for bugs and best practices...
argument-hint: [file or PR number]
---
```

Users can invoke with `/code-review src/auth.ts` or wait for auto-activation based on the description.

### Disabling Slash Command Access

For skills that should only activate automatically (not manually invoked):

```yaml
---
name: internal-validator
description: Validates internal state when specific patterns are detected...
user-invocable: false
---
```

### With Arguments

The `argument-hint` field provides context in the command picker:

```yaml
argument-hint: [error message or bug description]
```

Arguments are available in the skill body via `$ARGUMENTS`.

---

## String Substitutions

Claude Code supports these substitution patterns in skill content:

| Pattern | Replaced With |
|---------|---------------|
| `$ARGUMENTS` | User input after `/skill-name` |
| `${CLAUDE_SESSION_ID}` | Current session identifier |
| `${CLAUDE_PLUGIN_ROOT}` | Path to the plugin root directory |

### Example

```markdown
# Debug Skill

Investigating: $ARGUMENTS

Session: ${CLAUDE_SESSION_ID}

Use the debugging script:
${CLAUDE_PLUGIN_ROOT}/scripts/debug-helper.ts
```

---

## Dynamic Context Injection

Use backtick-command syntax to inject dynamic content:

```markdown
## Current Git Status

`git status`

## Recent Changes

`git log --oneline -5`
```

When Claude loads the skill, these commands execute and their output replaces the command syntax.

**Use cases:**
- Current branch state
- Environment information
- Dynamic configuration
- Recent history

---

## Context Modes

The `context` field controls how skills execute:

### inherit (default)

Skill runs in the main conversation context. Has access to conversation history and prior tool results.

```yaml
context: inherit
```

### fork

Skill runs in an isolated subagent context. Useful for:
- Preventing context pollution
- Parallel execution
- Specialized processing that shouldn't affect main conversation

```yaml
context: fork
agent: outfitter:analyst
model: haiku
```

When `context: fork`, the skill can specify:
- `agent`: Which agent type handles the fork
- `model`: Override model for the forked context

---

## Testing with Debug Mode

```bash
claude --debug
```

Debug output shows:
- `Loaded skill: skill-name from path` — Skill discovered
- `Error loading skill: reason` — Loading failed
- `Considering skill: skill-name` — Activation being evaluated
- `Skill allowed-tools: [list]` — Tool restrictions applied

### Testing Process

1. **Verify loading**: Run `claude --debug` and check for load messages
2. **Test discovery**: Ask Claude something that should trigger the skill
3. **Verify tool restrictions**: Confirm permitted tools run without prompts
4. **Test with real data**: Run actual workflows

### Example Test Session

```bash
# Start debug session
claude --debug

# In conversation, trigger the skill naturally:
# "Can you help me process this PDF file?"

# Look for:
# "Considering skill: pdf-processor"
# "Activated skill: pdf-processor"
```

### Force Skill Reload

Skills are cached per session. To reload after changes:

```
/clear
```

---

## Troubleshooting

### Skill Not Loading

**Check file location:**

```bash
# Personal skills
ls ~/.claude/skills/my-skill/SKILL.md

# Project skills
ls .claude/skills/my-skill/SKILL.md

# Plugin skills
ls <plugin-path>/skills/my-skill/SKILL.md
```

**Validate YAML frontmatter:**

```bash
# Check for tabs (YAML requires spaces)
grep -P "\t" SKILL.md

# Validate syntax
bun run outfitter/scripts/validate-skill-frontmatter.ts SKILL.md
```

**Check file permissions:**

```bash
chmod 644 SKILL.md
chmod +x scripts/*.sh
```

### Skill Not Activating

**Improve description specificity:**

```yaml
# Before (too vague)
description: Helps with files

# After (specific with triggers)
description: Parse and validate JSON files including schema validation. Use when working with JSON data, .json files, or configuration files.
```

**Add trigger keywords** that users naturally say:
- File types: `.pdf`, `.json`, `.xlsx`
- Actions: `parse`, `validate`, `test`, `analyze`
- Domains: `API`, `database`, `spreadsheet`

### Tool Permission Errors

**Tool names are case-sensitive:**

```yaml
# Correct
allowed-tools: Read Grep Glob

# Wrong
allowed-tools: read grep glob
```

**Bash patterns need wildcards:**

```yaml
# Correct
allowed-tools: Bash(git *)

# Wrong (matches nothing)
allowed-tools: Bash(git)
```

**MCP tools use double underscores:**

```yaml
# Correct
allowed-tools: mcp__memory__store

# Wrong
allowed-tools: mcp_memory_store
```

### Script Execution Errors

**Ensure executable:**

```bash
chmod +x scripts/*.sh
```

**Use portable shebang:**

```bash
#!/usr/bin/env bash  # Recommended
#!/bin/bash          # Also works
```

**Use ${CLAUDE_PLUGIN_ROOT} for paths:**

```markdown
# Correct
${CLAUDE_PLUGIN_ROOT}/scripts/process.sh input.txt

# Wrong (breaks portability)
/Users/me/.claude/skills/my-skill/scripts/process.sh
```

---

## Integration Patterns

### With Commands

Skills activate automatically when commands need their expertise:

**Command** (`.claude/commands/analyze-pdf.md`):

```markdown
---
description: Analyze PDF file
---

Analyze this PDF file: $ARGUMENTS

Use the PDF processing skill for extraction and analysis.
```

When user runs `/analyze-pdf report.pdf`, Claude recognizes the PDF context and activates the skill.

### With Hooks

Hooks can suggest skill usage:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)|Edit(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Consider using typescript-linter skill'"
          }
        ]
      }
    ]
  }
}
```

### Using Skill Tool

Load skills programmatically with the Skill tool:

```
Use the Skill tool to invoke the pdf-processor skill
```

This is useful for:
- Forcing specific skill activation
- Chaining skills together
- Loading skills for agents

---

## Master-Clone Architecture

**For orchestrating specialized work with context isolation:**

**Master Agent**: Coordinates, maintains conversation context, delegates specialized tasks
**Clone Agents**: Isolated context, loads specific skill, returns focused output

```
User request
   ↓
Master agent decides: needs security analysis
   ↓
Launch clone agent with security-audit skill
   ↓
Clone returns findings (only findings in main context)
   ↓
Master synthesizes and continues
```

**Advantage over inline execution**: Master preserves main conversation context; specialist work happens in isolated bubble.

### Implementation

```yaml
---
name: security-audit
context: fork
agent: outfitter:reviewer
model: sonnet
---
```

Or via Task tool:

```json
{
  "description": "Security audit of auth module",
  "prompt": "Review src/auth/ for vulnerabilities using security-audit skill",
  "subagent_type": "outfitter:reviewer",
  "run_in_background": true
}
```

---

## Hook-Based Validation

Use hooks to enforce constraints at decision points.

### PreToolUse Hook Example

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write(**/SKILL.md)|Edit(**/SKILL.md)",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate-skill-frontmatter.ts",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Use Cases

- Prevent destructive operations
- Enforce testing requirements
- Validate configuration before deployment
- Check security constraints
- Validate skill frontmatter before saving

### Block at Submit Pattern

```typescript
export async function blockAtSubmit() {
  const issues = await runStaticAnalysis();
  const testsPassing = await runTestSuite();
  const securityClear = await runSecurityAudit();

  return {
    block: issues.length > 0 || !testsPassing || !securityClear,
    reason: formatBlockingIssues(issues)
  };
}
```

---

## Skill + MCP Integration

**Pattern**: Skills provide workflows, MCP servers provide data/tools.

### Example Architecture

- **MCP Server**: Linear API access (issues, projects, users)
- **Skill**: Project standup workflow (what data to pull, how to format, communication patterns)

```yaml
---
name: linear-standup
description: Generates team standup reports from Linear issues
allowed-tools: mcp__linear__get_issues mcp__linear__get_projects
---

# Linear Standup Skill

Use the Linear MCP server to:
1. Fetch issues by status and assignee
2. Group by project and priority
3. Format as standup report
```

### Why Separate

- MCP handles authentication, rate limiting, data access
- Skill handles business logic, formatting, workflows
- Easier to reuse across similar domains

---

## Performance Tips

### Keep SKILL.md Small

Token impact of skill size:
- 300 lines ≈ 2,000 tokens
- 1,500 lines ≈ 10,000 tokens

Each activation loads the full SKILL.md. Use progressive disclosure.

### Tool Restrictions Speed Up Execution

Without restrictions: Claude asks permission for each tool.
With restrictions: Listed tools run immediately.

```yaml
# Fast (no prompts for these tools)
allowed-tools: Read Grep Glob
```

---

## Quick Reference

```bash
# Find all skills
find ~/.claude/skills .claude/skills -name "SKILL.md" 2>/dev/null

# Validate YAML
bun run outfitter/scripts/validate-skill-frontmatter.ts SKILL.md

# Check for tabs
grep -P "\t" SKILL.md

# Test in debug mode
claude --debug
```

---

## Related Resources

For comprehensive guidance, load the relevant skill:

- Claude Code skills: `outfitter:claude-skills`
- Cross-platform skills: `outfitter:skills-dev`
- Plugin development: `outfitter:claude-plugins`
- Hook integration: `outfitter:claude-hooks`
- Command integration: `outfitter:claude-commands`

Reference docs in this directory:

- [best-practices.md](best-practices.md) — Community patterns and testing strategies
- [patterns.md](patterns.md) — Advanced skill patterns and degrees of freedom
