# Slash Command Reference

Comprehensive reference for Claude Code slash command authoring.

## Table of Contents

1. [File Format](#file-format)
2. [Frontmatter Schema](#frontmatter-schema)
3. [Argument Syntax](#argument-syntax)
4. [Bash Execution](#bash-execution)
5. [File References](#file-references)
6. [Tool Permissions](#tool-permissions)
7. [SlashCommand Tool](#slashcommand-tool)
8. [Environment Variables](#environment-variables)
9. [Discovery & Loading](#discovery--loading)
10. [Advanced Patterns](#advanced-patterns)

## File Format

### Basic Structure

```markdown
---
# YAML frontmatter (optional)
description: Brief description
argument-hint: <arg1> [arg2]
allowed-tools: Tool1, Tool2
model: model-identifier
disable-model-invocation: false
---

# Command Title (optional)

Command content goes here. This is the prompt that will be sent to Claude.

You can use:
- $1, $2, $3 for individual arguments
- $ARGUMENTS for all arguments
- !`command` for bash execution
- @file.txt for file contents
```

### Naming Conventions

**File naming:**
- Use kebab-case: `create-branch.md`, `deploy-staging.md`
- No spaces or special characters
- Extension must be `.md`
- Command name derived from filename (without `.md`)

**Examples:**
- `review-pr.md` → `/review-pr`
- `git/status.md` → `/status` (namespace: git)
- `deploy.md` → `/deploy`

## Frontmatter Schema

All fields are optional. Order doesn't matter.

### `description`

**Type**: string
**Default**: First line of command content
**Purpose**: Brief explanation shown in `/help`

```yaml
description: Deploy application to target environment with health checks
```

**Best practices:**
- Keep under 80 characters
- Action-oriented (verb first)
- Specific about what it does

### `argument-hint`

**Type**: string
**Default**: none
**Purpose**: Show expected arguments in autocomplete

```yaml
argument-hint: <environment> [--skip-tests] [--no-notify]
```

**Conventions:**
- `<required>` - Required arguments
- `[optional]` - Optional arguments
- `--flag` - Boolean flags
- `<arg1|arg2>` - Alternatives

### `allowed-tools`

**Type**: string (comma-separated)
**Default**: Inherits from conversation
**Purpose**: Restrict which tools Claude can use

```yaml
# Single tool
allowed-tools: Read

# Multiple tools
allowed-tools: Read, Grep, Glob

# Bash with wildcards
allowed-tools: Bash(git *), Bash(npm *), Read, Write

# Complex patterns
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git status:*)
```

**Tool name format:**
- Exact match: `Read`, `Write`, `Edit`
- Bash with pattern: `Bash(command *)`
- Bash specific: `Bash(git status:*)`

### `model`

**Type**: string
**Default**: Inherits from conversation
**Purpose**: Override model for this command

```yaml
# Use faster model for simple tasks
model: claude-3-5-haiku-20241022

# Use specific version
model: claude-sonnet-4-5-20250929
```

**Use cases:**
- Simple commands → Haiku (faster, cheaper)
- Complex analysis → Opus (more capable)
- Specific features → Particular version

### `disable-model-invocation`

**Type**: boolean
**Default**: false
**Purpose**: Prevent SlashCommand tool from invoking this command

```yaml
disable-model-invocation: true
```

**Use when:**
- Command requires user interaction
- Command has side effects that shouldn't be automated
- Testing or debugging

## Argument Syntax

### Individual Arguments

```markdown
Process file $1 with config $2 and output to $3
```

**Behavior:**
- Positional: `$1` = first arg, `$2` = second arg, etc.
- Whitespace-separated: `/cmd foo bar baz`
- Quotes preserved: `/cmd "foo bar" baz` → `$1="foo bar"`, `$2="baz"`
- Missing args: Empty string

**Example:**

```bash
/deploy staging --skip-tests
# $1 = "staging"
# $2 = "--skip-tests"
# $3 = ""
```

### All Arguments

```markdown
Process all items: $ARGUMENTS
```

**Behavior:**
- Contains all arguments as single string
- Preserves whitespace and quotes
- Empty if no arguments provided

**Example:**

```bash
/fix-issues 123 456 789 "urgent bug"
# $ARGUMENTS = "123 456 789 \"urgent bug\""
```

### Argument Validation

Commands don't have built-in validation. Implement in command content:

```markdown
---
description: Deploy to environment
argument-hint: <environment>
---

# Deployment

## Validation

Environment: $1

First, validate the environment:
- Must be one of: development, staging, production
- Must have valid credentials configured
- Must have healthy cluster status

If validation fails, explain the issue and stop.
If validation passes, proceed with deployment...
```

### Dynamic Arguments

Combine arguments with bash and file references:

```markdown
---
description: Compare git branches
argument-hint: <branch1> <branch2>
---

# Branch Comparison

Branch 1: $1
Branch 2: $2

## Differences
!`git diff $1..$2 --stat`

## Commits
!`git log $1..$2 --oneline`
```

### Default Values

Handle missing arguments in command content:

```markdown
---
description: Deploy to environment (defaults to staging)
argument-hint: [environment]
---

# Deployment

Target environment: ${1:-staging}

Deploy the application to ${1:-staging} environment.

If no environment specified, staging is used.
```

**Note**: Claude will process this contextually, not as shell expansion.

## Bash Execution

### Syntax

```markdown
!`command here`
```

**Execution:**
- Runs before command is processed
- Output captured and included in context
- stderr shown if command fails
- Exit codes handled automatically

### Simple Commands

```markdown
Current directory: !`pwd`
Current user: !`whoami`
Git branch: !`git branch --show-current`
```

### Complex Commands

```markdown
Recent commits:
!`git log --oneline --graph -10`

Open PRs:
!`gh pr list --limit 5 --json number,title,author`

Test results:
!`bun test --reporter=json | jq '.summary'`
```

### Multiple Commands

```markdown
## Git Status
!`git status`

## Staged Changes
!`git diff --staged`

## Branch Info
!`git branch -vv`

## Remote Status
!`git remote show origin`
```

### Pipelines

```markdown
Active branches:
!`git branch --format='%(refname:short)' | grep -v '^main$'`

Recent test files:
!`find . -name '*.test.ts' -mtime -7 | head -10`

Code statistics:
!`git diff --stat HEAD~10..HEAD | tail -1`
```

### Conditional Execution

```markdown
## Check if PR exists
!`gh pr view --json number 2>&1 || echo "No PR found"`

## Safe directory check
!`[ -d .git ] && echo "Git repository" || echo "Not a git repository"`
```

### Character Budget

**Default**: 15,000 characters per command
**Configure**: `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable

```bash
# In ~/.claude/settings.json or .claude/settings.json
export SLASH_COMMAND_TOOL_CHAR_BUDGET=30000
```

**Exceeding budget:**
- Output truncated with warning
- Consider limiting output:

  ```markdown
  Recent commits (limited):
  !`git log --oneline -20`
  ```

### Error Handling

**Command failure:**

```markdown
# This captures errors
Files changed: !`git diff --stat 2>&1 || echo "Error getting diff"`

# This stops on error
Files changed: !`git diff --stat`
# If git diff fails, command execution stops
```

**Quoting:**

```markdown
# ✅ Correct
!`echo "Hello $USER"`

# ❌ Incorrect (breaks markdown)
!`echo "Hello $USER`
```

## File References

### Syntax

```markdown
@path/to/file
@$1
@$2
```

**Behavior:**
- Includes entire file contents
- Path relative to project root
- File read at command execution time
- Large files may be truncated

### Basic Usage

```markdown
Review this file: @src/main.ts

Compare these implementations:
- Old: @src/old-version.ts
- New: @src/new-version.ts
```

### With Arguments

```markdown
---
description: Explain a file
argument-hint: <file-path>
---

# File Explanation

**File**: @$1

Provide detailed explanation of this file.
```

Usage: `/explain src/utils/helpers.ts`

### Multiple Files

```markdown
---
description: Compare files
argument-hint: <file1> <file2> [file3]
---

# File Comparison

## File 1
@$1

## File 2
@$2

## File 3 (optional)
@$3

Compare these files and explain differences.
```

### Glob Patterns

File references don't support globs directly. Use bash instead:

```markdown
# ❌ Not supported
@src/**/*.ts

# ✅ Use bash + argument
Files to review: !`find src -name '*.ts' -type f`

Then review each file listed above.
```

Or use multiple commands:

```bash
# First: Find files
/find-files src ts

# Then: Review with argument
/review-file src/found/file.ts
```

### Binary Files

File references work with text files. For binary files:

```markdown
# ❌ Binary file (produces gibberish)
Image contents: @image.png

# ✅ File info instead
Image info: !`file image.png`
Image size: !`ls -lh image.png`
```

## Tool Permissions

### Inheritance

Without `allowed-tools`, commands inherit conversation permissions:

```markdown
---
description: Review code
---
Review the codebase for issues.
```

**Behavior:**
- Uses conversation's allowed tools
- May ask for permission for new tools
- User can approve/deny as normal

### Explicit Permissions

```markdown
---
description: Safe code review
allowed-tools: Read, Grep, Glob
---
Review the codebase for issues without making changes.
```

**Behavior:**
- Only specified tools allowed without asking
- Other tools blocked or require permission
- Overrides conversation settings

### Common Patterns

**Read-only commands:**

```yaml
allowed-tools: Read, Grep, Glob, Bash(git show:*), Bash(git diff:*)
```

**Git workflow commands:**

```yaml
allowed-tools: Bash(git *), Read, Write
```

**Safe analysis:**

```yaml
allowed-tools: Read, Grep, Glob, Bash(find:*), Bash(wc:*)
```

**File modifications:**

```yaml
allowed-tools: Read, Edit, Write, Bash(bun run format:*)
```

### Wildcards

**Bash patterns:**

```yaml
# Allow all git commands
Bash(git *)

# Allow specific git commands
Bash(git add:*), Bash(git commit:*), Bash(git status:*)

# Allow npm/bun commands
Bash(npm *), Bash(bun *)
```

**Restrictions:**
- Wildcards only work with Bash tool
- Other tools use exact names
- Matching is pattern-based

### Testing Permissions

```bash
# 1. Create command with restrictions
cat > .claude/commands/test-perms.md << 'EOF'
---
allowed-tools: Read
---
Try to write a file. This should fail or ask permission.
EOF

# 2. Test command
/test-perms

# 3. Try restricted operation
# Should ask permission or be blocked
```

## SlashCommand Tool

The SlashCommand tool allows Claude to invoke commands programmatically.

### Default Behavior

**Enabled by default:**
- Claude can use `/command` during conversation
- Useful for chaining commands
- Respects command frontmatter

### Disabling Globally

```bash
# In Claude Code
/permissions

# Add to deny list:
SlashCommand
```

### Disabling Per Command

```markdown
---
description: Interactive command
disable-model-invocation: true
---

This command requires user interaction and shouldn't be automated.
```

### Character Budget

```bash
# Set environment variable
export SLASH_COMMAND_TOOL_CHAR_BUDGET=30000

# Default: 15,000 characters
```

**Exceeding budget:**
- Output truncated
- Warning shown to user
- Command still executes

### Use Cases

**Allow:**
- Informational commands
- Read-only operations
- Automated workflows

**Disable:**
- Interactive commands
- Destructive operations
- Commands with side effects

## Environment Variables

### Available Variables

**In command content:**
- `$1`, `$2`, `$3`, ... - Individual arguments
- `$ARGUMENTS` - All arguments
- `$CLAUDE_PROJECT_DIR` - Project root directory

**In bash commands:**
All standard environment variables plus:
- `CLAUDE_PROJECT_DIR` - Project root
- Custom variables from `.claude/settings.json`

**For plugin commands:**
- `${CLAUDE_PLUGIN_ROOT}` - Plugin installation directory (in command files)

See [Environment Variables Reference](../../shared/rules/ENV-VARS.md) for the full guide.

### Using in Bash

```markdown
Project root: !`echo $CLAUDE_PROJECT_DIR`

Custom variable: !`echo $MY_CUSTOM_VAR`

Check environment:
!`env | grep CLAUDE`
```

### Setting Variables

**In settings.json:**

```json
{
  "env": {
    "MY_DEPLOY_TARGET": "staging",
    "MY_SLACK_CHANNEL": "#deployments"
  }
}
```

**In command:**

```markdown
---
description: Deploy using environment config
---

Deploying to: !`echo $MY_DEPLOY_TARGET`
Notifying: !`echo $MY_SLACK_CHANNEL`

Proceed with deployment...
```

## Discovery & Loading

### Loading Order

1. **Plugin commands** (from installed plugins)
2. **Project commands** (`.claude/commands/`)
3. **Personal commands** (`~/.claude/commands/`)

### Name Resolution

**Conflict resolution:**
- Plugin commands: `/plugin-name:command`
- Project commands: `/command` (takes precedence)
- Personal commands: `/command` (fallback)

**Namespacing:**

```
.claude/commands/frontend/component.md
→ /component (namespace: frontend)
→ /frontend/component (explicit)
```

### Reloading

Commands are loaded when:
- Claude Code starts
- Session cleared (`/clear`)
- Files modified (automatic reload)

**Force reload:**

```bash
# Clear session
/clear

# Or restart Claude Code
```

### Discovery

**List all commands:**

```bash
/help
```

**Check specific command:**

```bash
/help command-name
```

## Advanced Patterns

### Multi-step Workflows

```markdown
---
description: Complete feature workflow
argument-hint: <issue-number>
---

# Feature Development Workflow

Issue: $1

## Step 1: Create Branch
Branch name: !`echo "feature/$1"`

Create branch `feature/$1` from main:
!`git checkout main && git pull && git checkout -b feature/$1`

## Step 2: Link Issue
Update issue #$1 with branch information:
!`gh issue comment $1 --body "Working on feature/$1"`

## Step 3: Implementation Plan

Based on issue #$1, provide implementation plan:
1. Files to modify
2. Tests to write
3. Documentation to update

Wait for my approval before proceeding with implementation.
```

### Conditional Logic

```markdown
---
description: Deploy with environment check
argument-hint: <environment>
---

# Deployment

Target: $1

## Environment Check
!`case "$1" in
  production)
    echo "⚠️ PRODUCTION deployment requires approval"
    echo "STATUS: manual-approval-required"
    ;;
  staging)
    echo "✓ Staging deployment approved"
    echo "STATUS: approved"
    ;;
  *)
    echo "❌ Unknown environment: $1"
    echo "STATUS: invalid"
    ;;
esac`

## Action

Based on the status above:
- If manual-approval-required: Stop and request explicit confirmation
- If approved: Proceed with deployment
- If invalid: Explain error and valid options
```

### Error Handling

```markdown
---
description: Safe deployment with validation
---

# Deployment Pipeline

## Validation
!`./scripts/validate-deployment.sh 2>&1`

Check the validation output above.

**If validation passed:**
1. Proceed with deployment
2. Run health checks
3. Notify team

**If validation failed:**
1. Stop deployment
2. Explain errors
3. Suggest fixes
```

### Template Generation

```markdown
---
description: Generate component from template
argument-hint: <component-name>
---

# Component Generator

Component: $1

Generate a new React component with:

**File**: `src/components/$1.tsx`
```typescript
interface ${1}Props {
  // TODO: Add props
}

export function $1({ }: ${1}Props) {
  return (
    <div className="$1">
      {/* TODO: Implement component */}
    </div>
  );
}
```

**Test**: `src/components/$1.test.tsx`

```typescript
import { describe, it, expect } from 'bun:test';
import { $1 } from './$1';

describe('$1', () => {
  it('renders without crashing', () => {
    // TODO: Add tests
  });
});
```

Create both files and open them for editing.

```

### Integration with Hooks

Commands can trigger hooks via tool usage:

```markdown
---
description: Format and commit
allowed-tools: Bash(git *), Edit, Write
---

# Format and Commit

## Changes
!`git diff`

1. Format changed files (triggers PostToolUse hook)
2. Review formatting changes
3. Create commit

This workflow integrates with your PostToolUse hooks for automatic formatting.
```

### Chaining Commands

```markdown
---
description: Full PR workflow
argument-hint: <branch-name>
---

# PR Workflow

1. First, create branch:
   `/create-branch $1`

2. Then, after implementation:
   `/run-tests`

3. Finally:
   `/create-pr $1`

Follow these steps in order, waiting for each to complete.
```

### Dynamic Content

```markdown
---
description: Context-aware review
---

# Intelligent Code Review

## Repository Context
!`git remote get-url origin`

## Recent Activity
!`git log --since="1 week ago" --pretty=format:"%h %s" --author="$(git config user.email)"`

## Current State
!`git status --short`

Based on the repository type and recent activity, perform a focused code review:
- For frontend: Focus on component structure, styling, accessibility
- For backend: Focus on API design, error handling, database queries
- For both: Security, testing, documentation
```

## See Also

- [EXAMPLES.md](EXAMPLES.md) - Real-world command examples
- [scripts/scaffold-command.sh](scripts/scaffold-command.sh) - Command generator
- [scripts/validate-command.sh](scripts/validate-command.sh) - Command validator
