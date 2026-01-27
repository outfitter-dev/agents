---
name: claude-commands
description: This skill should be used when creating slash commands, writing command files, or when "/command", ".claude/commands", "$ARGUMENTS", or "create command" are mentioned.
metadata:
  version: "2.0.0"
  related-skills:
    - claude-hooks
    - claude-plugins
    - skills-dev
allowed-tools: Read Write Edit Grep Glob Bash TaskCreate TaskUpdate TaskList TaskGet
---

# Claude Command Authoring

Create custom slash commands that extend Claude Code with reusable prompts and workflows.

## Commands vs Skills

**Critical distinction**:

| Aspect         | Commands (This Skill)                   | Skills                                 |
| -------------- | --------------------------------------- | -------------------------------------- |
| **Purpose**    | Reusable prompts invoked by users       | Capability packages auto-triggered     |
| **Invocation** | Explicit: `/command-name args`          | Automatic (model-triggered by context) |
| **Location**   | `commands/` directory                   | `skills/` directory with `SKILL.md`    |
| **Structure**  | Single `.md` file                       | Directory with resources               |
| **Arguments**  | `$1`, `$2`, `$ARGUMENTS`                | No argument system                     |

Commands are user-initiated. Skills are model-initiated.

---

## Quick Start

### Basic Command

Create `.claude/commands/review.md`:

```markdown
---
description: Review code for best practices and issues
---

Review the following code for:
- Code quality and readability
- Potential bugs or edge cases
- Performance considerations
- Security concerns
```

Use with: `/review`

### Command with Arguments

Create `.claude/commands/fix-issue.md`:

```markdown
---
description: Fix a specific GitHub issue
argument-hint: <issue-number>
---

Fix issue #$1 following our coding standards.
Review the issue, implement a fix, add tests, and create a commit.
```

Use with: `/fix-issue 123`

### Command with Context

Create `.claude/commands/commit.md`:

```markdown
---
description: Create git commit from staged changes
allowed-tools: Bash(git *)
---

## Context
<!-- NOTE: Place "!" before the opening backtick for preprocessing to work -->
Current branch: `git branch --show-current`
Staged changes: `git diff --staged`
Recent commits: `git log --oneline -5`

## Task

Create a commit with a clear message based on the staged changes.
```

Use with: `/commit`

---

## Workflow Overview

1. **Discovery** - Define purpose, scope, and target users
2. **Design** - Choose features and configuration
3. **Implementation** - Write frontmatter and content
4. **Validation** - Verify against quality standards

---

## Stage 1: Discovery

Before writing code, clarify:

- **Purpose**: What task does this command automate?
- **Scope**: Project-specific or personal workflow?
- **Arguments**: What inputs does it need?
- **Tools**: What operations will it perform?

**Key questions**:
- Will this be shared with the team (project) or personal use?
- Does it require bash execution or file references?
- Should tool access be restricted for safety?

---

## Stage 2: Design

### Command Scopes

| Scope | Location | Visibility | Use Case |
|-------|----------|------------|----------|
| Project | `.claude/commands/` | Team via git | Shared workflows |
| Personal | `~/.claude/commands/` | You only | Individual preferences |
| Plugin | `<plugin>/commands/` | Plugin users | Distributed via marketplace |

Project commands show "(project)" in `/help`. Personal show "(user)".

### Core Features

| Feature | Syntax | Purpose |
|---------|--------|---------|
| Arguments | `$1`, `$2`, `$ARGUMENTS` | Dynamic input from user |
| Bash execution | `!`backtick`command`backtick | Include shell output in context |
| File references | `@path/to/file` | Include file contents |
| Tool restrictions | `allowed-tools:` | Limit Claude's capabilities |

### Frontmatter Schema

```yaml
---
description: Brief description for /help      # Required for discovery
argument-hint: <required> [optional]          # Shown in autocomplete
allowed-tools: Read, Grep, Bash(git *)        # Restrict tool access
model: claude-3-5-haiku-20241022             # Override model
disable-model-invocation: true                # Prevent SlashCommand tool
---
```

See [frontmatter.md](references/frontmatter.md) for complete schema.

---

## Stage 3: Implementation

### File Structure

```markdown
---
description: Deploy to environment with validation
argument-hint: <environment> [--skip-tests]
allowed-tools: Bash(*), Read
---

# Deployment

Target: $1
Options: $2

## Pre-flight Checks
<!-- NOTE: Place "!" before the opening backtick for preprocessing to work -->
Environment: `echo "$1" | grep -E "^(staging|production)$" || echo "Invalid"`
Tests: `[[ "$2" == *"--skip-tests"* ]] && echo "Skipped" || bun test`

## Task

Based on validation above, proceed with deployment or explain issues.
```

### Argument Patterns

**Positional arguments** (`$1`, `$2`, `$3`):

```markdown
Compare file $1 with file $2 and summarize differences.
```

Usage: `/compare old.ts new.ts`

**All arguments** (`$ARGUMENTS`):

```markdown
Fix the following issues: $ARGUMENTS
```

Usage: `/fix memory leak in auth slow query in search`

**Combined with file references**:

```markdown
Analyze this file: @$1
```

Usage: `/analyze src/main.ts`

See [arguments.md](references/arguments.md) for advanced patterns.

### Bash Execution

Execute commands and include output. The `!` must precede the opening backtick for preprocessing to work:

```markdown
## Git Context
<!-- NOTE: Place "!" before the opening backtick for preprocessing to work -->
Branch: `git branch --show-current`
Status: `git status --short`
Diff: `git diff --stat`

Based on the above, suggest next steps.
```

**Important**: Output is truncated at 15,000 characters by default. Use `SLASH_COMMAND_TOOL_CHAR_BUDGET` to adjust.

See [bash-execution.md](references/bash-execution.md) for patterns.

### File References

Include file contents directly:

```markdown
Review this configuration:
- Package: @package.json
- TypeScript: @tsconfig.json
- User input: @$1
```

See [file-references.md](references/file-references.md) for details.

### Tool Permissions

Restrict what Claude can do:

```yaml
# Read-only analysis
allowed-tools: Read, Grep, Glob

# Git operations only
allowed-tools: Bash(git *), Read

# Full bash with restrictions
allowed-tools: Bash(bun *), Bash(npm *), Read, Write, Edit
```

See [permissions.md](references/permissions.md) for patterns.

---

## Stage 4: Validation

After creating a command, validate against these checklists.

### Frontmatter Checks

- [ ] Opens with `---` on line 1, closes with `---`
- [ ] `description` present and action-oriented
- [ ] `argument-hint` uses `<required>` and `[optional]` syntax
- [ ] `allowed-tools` uses correct names (case-sensitive)
- [ ] Uses spaces (not tabs) for indentation

### Naming Conventions

- [ ] Kebab-case filename: `my-command.md`
- [ ] No spaces or special characters
- [ ] Action-oriented: verb-noun pattern preferred
- [ ] Concise: 1-3 words

**Good**: `review-pr.md`, `deploy-staging.md`, `fix-issue.md`
**Bad**: `my command.md`, `DoStuff.md`, `helper.md`

### Description Quality

- [ ] Action-oriented (starts with verb)
- [ ] Specific about what it does
- [ ] Under 80 characters
- [ ] Helpful for `/help` discovery

**Good**: "Deploy to staging with health checks and Slack notification"
**Bad**: "Deploy stuff" or "Helps with deployment"

### Content Quality

- [ ] Clear instructions for Claude
- [ ] Proper argument handling if used
- [ ] Bash commands validated (test in terminal first)
- [ ] File paths relative to project root
- [ ] Error handling for edge cases

### Validation Report Format

```markdown
# Command Validation: [command-name]

## Summary
- **Status**: PASS | FAIL | WARNINGS
- **Location**: [path]
- **Issues**: [count]

## Critical Issues (must fix)
1. [Issue with fix]

## Warnings (should fix)
1. [Issue with fix]

## Strengths
- [What's done well]
```

---

## Namespacing

Organize commands in subdirectories:

```
.claude/commands/
+-- frontend/
|   +-- component.md      # /component (project:frontend)
|   +-- styling.md        # /styling (project:frontend)
+-- backend/
|   +-- migration.md      # /migration (project:backend)
+-- review.md             # /review (project)
```

The namespace appears in `/help` but commands are invoked without prefix: `/component` or `/frontend/component`.

See [namespacing.md](references/namespacing.md) for organization patterns.

---

## Testing Commands

1. **Create** the command file
2. **Verify** with `/help` - should see your command listed
3. **Test** basic invocation: `/your-command`
4. **Test** with arguments: `/your-command arg1 arg2`
5. **Verify** tool restrictions if using `allowed-tools`

### Debug Mode

```bash
claude --debug
```

Shows command loading and execution details.

---

## Troubleshooting

### Command Not Found

- Verify file location: `.claude/commands/name.md`
- Check filename: lowercase, `.md` extension, no spaces
- Restart Claude Code or use `/clear`

### Arguments Not Working

- Use `$1`, `$2` not `{1}`, `{2}`
- Use `$ARGUMENTS` for all arguments
- Quote arguments with spaces: `/cmd "arg with spaces"`

### Bash Commands Failing

- Use `!` before backticks: `` !`command` ``
- Test command in terminal first
- Check output length (15k char limit)
- Verify `allowed-tools` includes `Bash`

### Tool Restrictions Not Applied

- Check YAML syntax (no tabs, proper quoting)
- Tool names are case-sensitive: `Read` not `read`
- Use wildcards for bash: `Bash(git *)`

---

## References

| Reference | Content |
|-----------|---------|
| [frontmatter.md](references/frontmatter.md) | Complete frontmatter schema and fields |
| [arguments.md](references/arguments.md) | Argument handling and patterns |
| [bash-execution.md](references/bash-execution.md) | Shell command execution |
| [file-references.md](references/file-references.md) | File inclusion syntax |
| [permissions.md](references/permissions.md) | Tool restriction patterns |
| [namespacing.md](references/namespacing.md) | Directory organization |
| [sdk-integration.md](references/sdk-integration.md) | Agent SDK usage |
| [community.md](references/community.md) | Community examples and resources |

See [EXAMPLES.md](EXAMPLES.md) for complete real-world examples.
See `scripts/` for scaffolding and validation utilities.

---

## Related Skills

- **claude-hook-authoring**: Add automation triggers to command workflows
- **claude-plugin-development**: Bundle commands into distributable plugins
- **claude-code-configuration**: Configure Claude Code settings globally
