# Command Frontmatter Reference

Complete reference for all frontmatter fields in Claude Code slash commands.

## Overview

Frontmatter is optional YAML metadata at the start of command files. It configures how the command appears in `/help`, what tools it can use, and how it behaves.

```yaml
---
description: Brief description for /help
argument-hint: <required> [optional]
allowed-tools: Read, Grep, Glob
model: haiku
disable-model-invocation: true
---
```

---

## Fields

### `description`

**Type**: string
**Default**: First line of command content
**Purpose**: Brief explanation shown in `/help` list

```yaml
description: Deploy application to target environment with health checks
```

**Best practices**:
- Keep under 80 characters
- Action-oriented (start with verb)
- Specific about what it does
- Avoid vague terms like "helps with" or "stuff"

**Examples**:

```yaml
# Good
description: Create git commit from staged changes with conventional format
description: Review PR for security vulnerabilities and best practices
description: Generate API documentation from TypeScript source files

# Bad
description: Deploy stuff
description: Helps with git
description: Command for reviewing things
```

---

### `argument-hint`

**Type**: string
**Default**: none
**Purpose**: Show expected arguments in autocomplete

```yaml
argument-hint: <environment> [--skip-tests] [--no-notify]
```

**Conventions**:
- `<required>` - Required arguments (angle brackets)
- `[optional]` - Optional arguments (square brackets)
- `--flag` - Boolean flags
- `<arg1|arg2>` - Alternatives (pipe-separated)

**Examples**:

```yaml
# Single required argument
argument-hint: <issue-number>

# Multiple arguments
argument-hint: <file1> <file2>

# Optional with defaults
argument-hint: [environment=staging]

# Flags
argument-hint: <branch> [--force] [--no-verify]

# Alternatives
argument-hint: <staging|production>
```

---

### `allowed-tools`

**Type**: string (comma-separated)
**Default**: Inherits from conversation
**Purpose**: Restrict which tools Claude can use

```yaml
allowed-tools: Read, Grep, Glob, Bash(git *)
```

**Tool names** (case-sensitive):

**File Operations**

| Tool | Purpose | Returns |
|------|---------|---------|
| `Read` | Read file contents, images, PDFs, Jupyter notebooks | File content with line numbers |
| `Write` | Create new files or overwrite existing files | Confirmation |
| `Edit` | Make targeted string replacements in existing files | Updated file snippet |
| `MultiEdit` | Multiple edits to a single file in one atomic operation | Updated file |
| `NotebookEdit` | Edit, insert, or delete Jupyter notebook cells | Updated notebook |
| `LS` | List directory contents | Directory listing |

**Search & Discovery**

| Tool | Purpose | Returns |
|------|---------|---------|
| `Grep` | Search file contents using regex patterns | Matching lines, file paths, or counts |
| `Glob` | Find files by name/path glob patterns (e.g., `**/*.ts`) | List of matching file paths |

**Execution**

| Tool | Purpose | Returns |
|------|---------|---------|
| `Bash` | Execute shell commands with optional timeout | Command stdout/stderr |
| `Task` | Launch subagents for complex, parallel, or specialized work | Agent result or task ID (if background) |
| `TaskOutput` | Retrieve output from background tasks | Task output and status |
| `KillShell` | Terminate a running background shell process | Confirmation |

**Context & Skills**

| Tool | Purpose | Returns |
|------|---------|---------|
| `Skill` | Load a skill's instructions into context | Skill content |
| `TaskCreate` | Create tasks for tracking progress | Task ID |
| `TaskUpdate` | Update task status (in_progress, completed) | Confirmation |
| `TaskList` | List all tasks | Task summaries |
| `TaskGet` | Get full task details | Task details |

**Planning**

| Tool | Purpose | Returns |
|------|---------|---------|
| `EnterPlanMode` | Transition to plan mode for complex implementation tasks | User approval prompt |
| `ExitPlanMode` | Signal plan completion and request user approval | Plan review prompt |

**User Interaction**

| Tool | Purpose | Returns |
|------|---------|---------|
| `AskUserQuestion` | Present choices or gather input with structured options | User's selection(s) or custom input |
| `SlashCommand` | Invoke slash commands programmatically (controlled via `disable-model-invocation`) | Command result |

**Web**

| Tool | Purpose | Returns |
|------|---------|---------|
| `WebSearch` | Search the web for current information | Search results with URLs |
| `WebFetch` | Fetch URL content and process with AI | Processed/summarized content |

**MCP Tools**

MCP (Model Context Protocol) tools follow the naming pattern `mcp__<server>__<tool>`. Examples:
- `mcp__github__create_issue` - GitHub MCP server
- `mcp__memory__search` - Memory MCP server
- `mcp__filesystem__read` - Filesystem MCP server

Use regex patterns to match MCP tools: `mcp__.*__.*` matches all MCP tools.

**Bash patterns**:

```yaml
# All bash commands
allowed-tools: Bash(*)

# All git commands
allowed-tools: Bash(git *)

# Specific git commands only
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git status:*)

# Multiple command types
allowed-tools: Bash(git *), Bash(npm *), Bash(bun *)
```

**Common patterns**:

```yaml
# Read-only analysis
allowed-tools: Read, Grep, Glob

# Git workflow
allowed-tools: Read, Write, Edit, Bash(git *)

# Safe code review
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git show:*)

# Full development
allowed-tools: Read, Write, Edit, Bash(*), Grep, Glob
```

**Behavior**:
- Without `allowed-tools`: inherits conversation permissions
- With `allowed-tools`: only listed tools allowed without asking
- Other tools blocked or require explicit permission

---

### `model`

**Type**: string
**Default**: Inherits from conversation
**Purpose**: Override model for this command

```yaml
model: haiku
```

**Available models**:

```yaml
# Fast, low-cost (simple tasks)
model: haiku

# Balanced (default for most)
model: sonnet

# Most capable (complex analysis)
model: opus
```

**Use cases**:
- Simple commands (formatting, simple lookups) -> haiku
- Standard development tasks -> sonnet (default)
- Complex analysis, security review -> opus

---

### `disable-model-invocation`

**Type**: boolean
**Default**: false
**Purpose**: Prevent SlashCommand tool from invoking this command automatically

```yaml
disable-model-invocation: true
```

**When to use**:
- Interactive commands requiring user input
- Destructive operations (delete, deploy to production)
- Commands with side effects that shouldn't be automated
- Testing or debugging commands

**Behavior**:
- When `true`: Command can only be invoked explicitly by user
- When `false` (default): Claude can invoke via SlashCommand tool

---

## Complete Example

```yaml
---
description: Deploy application with full validation pipeline
argument-hint: <environment> [--skip-tests] [--force]
allowed-tools: Read, Bash(kubectl *), Bash(docker *), Bash(git *)
model: sonnet
disable-model-invocation: true
---

# Deployment Pipeline

Environment: $1
Options: $ARGUMENTS

## Pre-flight Checks
...
```

---

## Validation Checklist

- [ ] Frontmatter opens with `---` on line 1
- [ ] Frontmatter closes with `---` before content
- [ ] Uses spaces, not tabs
- [ ] Special characters in strings are quoted
- [ ] Field names are lowercase with hyphens
- [ ] Tool names in `allowed-tools` are case-sensitive
- [ ] Model identifier is valid if specified
- [ ] Description is action-oriented and specific

---

## Common Errors

**Tab characters**:

```yaml
# Bad (tabs)
description: Deploy to staging

# Good (spaces)
description: Deploy to staging
```

**Unquoted special characters**:

```yaml
# Bad (colon in value)
description: Review: code quality check

# Good (quoted)
description: "Review: code quality check"
```

**Wrong tool names**:

```yaml
# Bad (lowercase)
allowed-tools: read, grep, glob

# Good (proper case)
allowed-tools: Read, Grep, Glob
```

**Invalid model**:

```yaml
# Bad (non-existent)
model: gpt-4

# Good (valid Claude model)
model: haiku
```
