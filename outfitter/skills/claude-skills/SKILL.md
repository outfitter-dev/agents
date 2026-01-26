---
name: claude-skills
description: This skill should be used when creating Claude Code skills with Claude-specific features like allowed-tools, context modes (fork/inherit), argument-hint, or model overrides. Triggers on "Claude skill", "allowed-tools", "context fork", "skill arguments".
metadata:
  version: "1.0.0"
  related-skills:
    - skills-dev
    - claude-plugins
    - claude-commands
    - claude-hooks
allowed-tools: Read Write Edit Grep Glob Bash TaskCreate TaskUpdate TaskList TaskGet
---

# Claude Code Skills

## Steps

1. Load the `outfitter:skills-dev` skill
2. Consider the Claude Code-specific features that extend the base specification within this skill

## Frontmatter Extensions

Claude Code extends the base Agent Skills frontmatter:

| Field | Type | Description |
|-------|------|-------------|
| `allowed-tools` | string | Space-separated tools that run without permission prompts |
| `user-invocable` | boolean | Default `true`. Set `false` to prevent `/skill-name` access |
| `disable-model-invocation` | boolean | Prevents auto-activation; requires manual Skill tool invocation |
| `context` | string | `inherit` (default) or `fork` for isolated subagent execution |
| `agent` | string | Agent for `context: fork` (e.g., `Explore`, `outfitter:analyst`) |
| `model` | string | Override model: `haiku`, `sonnet`, or `opus` |
| `hooks` | object | Lifecycle hooks: `on-activate`, `on-complete` |
| `argument-hint` | string | Hint shown after `/skill-name` (e.g., `[file path]`) |

### Example

```yaml
---
name: code-review
version: 1.0.0
description: Reviews code for bugs, security, and best practices. Use when reviewing PRs, auditing code, or before merging.
allowed-tools: Read Grep Glob Bash(git diff *)
argument-hint: [file or directory]
model: sonnet
---
```

## Tool Restrictions

Use `allowed-tools` to specify which tools run without permission prompts.

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

---

## User Invocable Skills

Skills are callable as `/skill-name` by default. Use `user-invocable: false` for auto-activate-only skills.

```yaml
---
name: code-review
description: Reviews code for bugs and best practices...
argument-hint: [file or PR number]
---
```

Users invoke with `/code-review src/auth.ts` or wait for auto-activation.

### Disabling Slash Command Access

```yaml
---
name: internal-validator
description: Validates internal state when specific patterns are detected...
user-invocable: false
---
```

### Arguments

The `argument-hint` field provides context in the command picker:

```yaml
argument-hint: [error message or bug description]
```

Arguments available via `$ARGUMENTS` in skill body.

---

## String Substitutions

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

Commands execute when Claude loads the skill; output replaces the syntax.

**Use cases**: Current branch state, environment info, dynamic config, recent history.

---

## Context Modes

The `context` field controls execution environment.

### inherit (default)

Skill runs in main conversation context with access to history and prior tool results.

```yaml
context: inherit
```

### fork

Skill runs in isolated subagent context. Useful for:
- Preventing context pollution
- Parallel execution
- Specialized processing that shouldn't affect main conversation

```yaml
context: fork
agent: outfitter:analyst
model: haiku
```

When `context: fork`, specify:
- `agent`: Which agent handles the fork
- `model`: Override model for forked context

**In Steps sections**: Use "delegate by loading" language for delegated skills (they run agents, not load instructions):

```markdown
3. Delegate by loading the `outfitter:security-audit` skill for vulnerability scan
```

See [context-modes.md](references/context-modes.md) for patterns.

---

## Testing

```bash
claude --debug
```

Debug output shows:
- `Loaded skill: skill-name from path` — Skill discovered
- `Error loading skill: reason` — Loading failed
- `Considering skill: skill-name` — Activation evaluated
- `Skill allowed-tools: [list]` — Tool restrictions applied

### Testing Process

1. **Verify loading**: `claude --debug` and check for load messages
2. **Test discovery**: Ask something that should trigger the skill
3. **Verify tool restrictions**: Confirm permitted tools run without prompts
4. **Test with real data**: Run actual workflows

### Force Skill Reload

Skills are cached per session. To reload after changes:

```
/clear
```

---

## Troubleshooting

### Skill Not Loading

Check file location:

```bash
# Personal skills
ls ~/.claude/skills/my-skill/SKILL.md

# Project skills
ls .claude/skills/my-skill/SKILL.md

# Plugin skills
ls <plugin-path>/skills/my-skill/SKILL.md
```

Validate YAML frontmatter:

```bash
# Check for tabs (YAML requires spaces)
grep -P "\t" SKILL.md
```

### Skill Not Activating

Improve description specificity:

```yaml
# Before (too vague)
description: Helps with files

# After (specific with triggers)
description: Parse and validate JSON files including schema validation. Use when working with JSON data, .json files, or configuration files.
```

Add trigger keywords users naturally say: file types (`.pdf`, `.json`), actions (`parse`, `validate`), domains (`API`, `database`).

### Tool Permission Errors

Tool names are case-sensitive:

```yaml
# Correct
allowed-tools: Read Grep Glob

# Wrong
allowed-tools: read grep glob
```

Bash patterns need wildcards:

```yaml
# Correct
allowed-tools: Bash(git *)

# Wrong (matches nothing)
allowed-tools: Bash(git)
```

MCP tools use double underscores:

```yaml
# Correct
allowed-tools: mcp__memory__store

# Wrong
allowed-tools: mcp_memory_store
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

### With Hooks

Hooks can suggest skill usage:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)|Edit(*.ts)",
        "hooks": [{ "type": "command", "command": "echo 'Consider typescript-linter skill'" }]
      }
    ]
  }
}
```

### Using Skill Tool

Load skills programmatically:

```
Use the Skill tool to invoke the pdf-processor skill
```

Useful for forcing activation, chaining skills, loading for agents.

See [integration.md](references/integration.md) for advanced patterns.

---

## Master-Clone Architecture

**For orchestrating specialized work with context isolation:**

**Master Agent**: Coordinates, maintains conversation context, delegates specialized tasks
**Clone Agents**: Isolated context, loads specific skill, returns focused output

```
User request
   |
Master agent decides: needs security analysis
   |
Launch clone agent with security-audit skill
   |
Clone returns findings (only findings in main context)
   |
Master synthesizes and continues
```

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

## References

| Reference | Content |
|-----------|---------|
| [context-modes.md](references/context-modes.md) | Fork vs inherit patterns |
| [integration.md](references/integration.md) | Commands, hooks, MCP integration |
| [performance.md](references/performance.md) | Token impact, optimization |
