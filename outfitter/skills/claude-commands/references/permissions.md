# Tool Permissions Reference

Complete guide to restricting tool access in Claude Code slash commands.

## Overview

The `allowed-tools` frontmatter field restricts which tools Claude can use when executing a command. This provides safety boundaries for automated workflows.

```yaml
---
allowed-tools: Read, Grep, Glob, Bash(git *)
---
```

---

## How It Works

### Without `allowed-tools`

Commands inherit tool permissions from the conversation:
- Claude may ask for permission to use new tools
- User can approve/deny as normal
- No automatic restrictions

### With `allowed-tools`

Only listed tools are available without asking:
- Tools in the list work immediately
- Unlisted tools are blocked or require permission
- Overrides conversation settings for this command

---

## Tool Names

Tools are case-sensitive. Use exact names:

| Tool | Purpose |
|------|---------|
| `Read` | Read file contents |
| `Write` | Create/overwrite files |
| `Edit` | Modify existing files |
| `Grep` | Search file contents |
| `Glob` | Find files by pattern |
| `Bash` | Execute shell commands |
| `Task` | Create subagent tasks |
| `Skill` | Invoke skills |
| `TaskCreate` | Create tasks |
| `TaskUpdate` | Update task status |
| `TaskList` | List tasks |
| `TaskGet` | Get task details |
| `WebSearch` | Search the web |
| `WebFetch` | Fetch web content |
| `SlashCommand` | Invoke other commands |

---

## Bash Patterns

Bash requires special pattern syntax to restrict which commands can run.

### All Bash Commands

```yaml
allowed-tools: Bash(*)
```

### Command Family

```yaml
# All git commands
allowed-tools: Bash(git *)

# All npm commands
allowed-tools: Bash(npm *)

# All bun commands
allowed-tools: Bash(bun *)
```

### Specific Commands

```yaml
# Only git status, diff, log
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*)

# Only read operations
allowed-tools: Bash(cat:*), Bash(ls:*), Bash(find:*)
```

### Multiple Command Families

```yaml
allowed-tools: Bash(git *), Bash(npm *), Bash(docker *)
```

---

## Common Patterns

### Read-Only Analysis

Safe for code review and analysis:

```yaml
allowed-tools: Read, Grep, Glob
```

**Use cases**: Code review, security audit, documentation analysis

### Read-Only with Git

Add git read commands for version control context:

```yaml
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*)
```

**Use cases**: PR review, change analysis

### Git Workflow

Full git access for commit/branch operations:

```yaml
allowed-tools: Read, Write, Edit, Bash(git *)
```

**Use cases**: Commit creation, branch management, rebasing

### Development Workflow

Standard development with restricted bash:

```yaml
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(bun *), Bash(npm *)
```

**Use cases**: Feature development, testing, building

### Full Access

When no restrictions needed:

```yaml
# Option 1: Explicit full access
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(*), Task, Skill, TaskCreate, TaskUpdate, TaskList, TaskGet

# Option 2: Omit field entirely (inherits all)
# (no allowed-tools field)
```

### Research Commands

Web access for documentation lookup:

```yaml
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
```

**Use cases**: API research, documentation lookup

---

## Safety Patterns

### Prevent File Modifications

```yaml
# No Write or Edit
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
```

### Prevent Bash Execution

```yaml
# No Bash at all
allowed-tools: Read, Write, Edit, Grep, Glob
```

### Prevent Destructive Git

```yaml
# No push, force, reset
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
```

### Restrict to Specific Scripts

```yaml
# Only run specific scripts
allowed-tools: Bash(bun run test:*), Bash(bun run lint:*), Bash(bun run build:*)
```

---

## Permission Hierarchy

### Command vs Conversation

1. Command's `allowed-tools` takes precedence
2. Tools not in list require explicit permission
3. User can still deny even allowed tools

### Command vs Skill

If command invokes a skill:
- Skill's tool restrictions may also apply
- Most restrictive wins

### Subagent Permissions

If using `Task` tool:
- Subagent inherits command's permissions
- Unless subagent has its own restrictions

---

## Testing Permissions

### Verify Restrictions

```bash
# Create test command
cat > .claude/commands/test-perms.md << 'EOF'
---
description: Test permissions
allowed-tools: Read, Grep
---
Try to write a file. This should fail or ask permission.
EOF

# Test
/test-perms
```

### Debug Mode

```bash
claude --debug
```

Shows tool permission checks in output.

---

## Common Errors

### Case Sensitivity

```yaml
# Wrong
allowed-tools: read, grep, glob

# Correct
allowed-tools: Read, Grep, Glob
```

### Missing Comma Separator

```yaml
# Wrong
allowed-tools: Read Grep Glob

# Correct
allowed-tools: Read, Grep, Glob
```

### Invalid Bash Pattern

```yaml
# Wrong (missing colon)
allowed-tools: Bash(git status*)

# Correct
allowed-tools: Bash(git status:*)

# Also correct (space pattern)
allowed-tools: Bash(git *)
```

### Incomplete Tool List

```yaml
# Problem: Can read but not find files
allowed-tools: Read

# Better: Include discovery tools
allowed-tools: Read, Grep, Glob
```

---

## Best Practices

### 1. Principle of Least Privilege

Only grant tools needed for the specific task:

```yaml
# Good: Minimal for code review
allowed-tools: Read, Grep, Glob

# Avoid: Everything for code review
allowed-tools: Read, Write, Edit, Bash(*), ...
```

### 2. Document Restrictions

Explain why tools are restricted:

```markdown
---
description: Safe security audit (read-only)
allowed-tools: Read, Grep, Glob
---

# Security Audit

This command performs read-only analysis.
No modifications will be made.
```

### 3. Test Thoroughly

Before sharing with team:
- Test with expected inputs
- Verify blocked operations fail gracefully
- Check edge cases

### 4. Combine with disable-model-invocation

For dangerous operations:

```yaml
---
description: Deploy to production
allowed-tools: Bash(kubectl *), Bash(docker *)
disable-model-invocation: true
---
```

### 5. Include Baseline Tools

When restricting, include common needs:

```yaml
# Baseline for most commands
allowed-tools: Grep, Glob, Read

# Add what's specifically needed
allowed-tools: Grep, Glob, Read, Bash(git *)
```
