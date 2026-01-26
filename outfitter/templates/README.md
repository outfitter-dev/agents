# Claude Code Templates

Copy-paste ready templates for all Claude Code component types. These templates follow best practices from the [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/overview).

## Directory Structure

```
templates/
├── slash-commands/     # Custom command templates
├── hooks/              # Event hook templates
├── skills/             # Agent skill templates
├── agents/             # Specialized agent templates
└── README.md           # This file
```

## Quick Start

### Using Templates

1. **Choose a template** that matches your needs
2. **Copy to appropriate location**:
   - Slash commands: `.claude/commands/` or `~/.claude/commands/`
   - Hooks: `.claude/hooks/` (scripts) + `.claude/settings.json` (config)
   - Skills: `.claude/skills/` or `~/.claude/skills/`
   - Agents: `.claude/agents/` or `~/.claude/agents/`
3. **Replace placeholders** (search for `[YOUR_*]`)
4. **Test and iterate**

### Example: Create a Slash Command

```bash
# 1. Copy template
cp templates/slash-commands/simple.md .claude/commands/review.md

# 2. Edit the file, replace placeholders:
#    [YOUR_DESCRIPTION] → "Review code for best practices"
#    [YOUR_COMMAND_NAME] → "Code Review"
#    [YOUR_PROMPT_INSTRUCTIONS] → Your instructions

# 3. Test it
claude
/review
```

## Templates Overview

### Slash Commands

Located in `slash-commands/`:

| Template | Use Case | Features |
|----------|----------|----------|
| `simple.md` | Basic command with no args | Simple prompt template |
| `with-args.md` | Command with arguments | `$1`, `$2`, `$ARGUMENTS` |
| `with-bash.md` | Command executing bash | `!` prefix for bash execution |
| `with-files.md` | Command reading files | `@` prefix for file references |

**Quick reference**:
- **Arguments**: `$1`, `$2`, `$ARGUMENTS`
- **Bash execution**: `!`git status``
- **File references**: `@src/file.ts`
- **Frontmatter**: `description`, `argument-hint`, `allowed-tools`

### Hooks

Located in `hooks/`:

| Template | Hook Type | Use Case |
|----------|-----------|----------|
| `post-tool-use-formatter/` | PostToolUse | Auto-format files after Write/Edit |
| `pre-tool-use-validator/` | PreToolUse | Validate operations before execution |
| `user-prompt-context/` | UserPromptSubmit | Add context to every prompt |
| `bash-validator/` | PreToolUse | Validate bash commands (Bun/TypeScript) |

**Each hook template includes**:
- `hooks.json` - Configuration with matchers
- Script file - Working implementation (Bash or TypeScript)
- Security best practices built-in
- Error handling patterns

**Installing a hook**:

```bash
# 1. Copy script to project
cp -r templates/hooks/post-tool-use-formatter/ .claude/hooks/

# 2. Add configuration to .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/format.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}

# 3. Make script executable
chmod +x .claude/hooks/format.sh
```

### Skills

Located in `skills/`:

| Template | Complexity | Use Case |
|----------|------------|----------|
| `simple-skill/` | Simple | Single-file skill |
| `multi-file-skill/` | Complex | Skill with reference docs |
| `skill-with-scripts/` | Advanced | Skill using helper scripts |

**Skill template features**:
- Complete `SKILL.md` with frontmatter
- Best practices for descriptions
- Tool restrictions examples
- Progressive disclosure patterns
- Helper scripts (for advanced template)

**Creating a skill**:

```bash
# 1. Choose template
cp -r templates/skills/simple-skill/ .claude/skills/my-skill/

# 2. Rename template and edit
mv .claude/skills/my-skill/SKILL.template.md .claude/skills/my-skill/SKILL.md
# Replace all [YOUR_*] placeholders
# Update name and description (critical for discovery!)

# 3. Test
claude
# Skill will activate when description keywords are mentioned
```

### Agents

Located in `agents/`:

| Template | Specialization | Use Case |
|----------|---------------|----------|
| `code-reviewer.md` | Code review | Security, performance, quality analysis |
| `test-specialist.md` | Testing | TDD, test writing, coverage analysis |
| `documentation-generator.md` | Documentation | API docs, guides, architecture docs |

**Agent template features**:
- Complete role definition
- Detailed process workflows
- Best practices and patterns
- Output format guidelines
- Tool restrictions

**Using an agent template**:

```bash
# 1. Copy to project
cp templates/agents/code-reviewer.md .claude/agents/

# 2. Customize if needed
# Agents work out of the box, but you can adjust to your needs

# 3. Claude will use agents automatically when appropriate
```

## Template Customization Guide

### Common Placeholders

Replace these in all templates:

- `[YOUR_DESCRIPTION]` - Brief description of functionality
- `[YOUR_COMMAND_NAME]` - Name of the command/skill/agent
- `[YOUR_PROMPT_INSTRUCTIONS]` - Core instructions
- `[YOUR_ARG_HINT]` - Hint for arguments (e.g., `<file-path>`)
- `[YOUR_ALLOWED_TOOLS]` - Tool restrictions (e.g., `Read, Grep, Glob`)
- `[YOUR_SKILL_NAME]` - Name for skills
- `[CORE_CAPABILITY]` - What the skill/agent does
- `[language]` - Programming language for examples
- `[CODE_EXAMPLE]` - Working code example

### Frontmatter Fields

#### Slash Commands

```yaml
---
description: Brief description (shown in /help)
argument-hint: <arg1> [optional-arg2]
allowed-tools: Bash(git *), Read, Write
model: claude-3-5-haiku-20241022  # Optional: specific model
disable-model-invocation: false    # Optional: prevent SlashCommand tool
---
```

#### Skills

```yaml
---
name: skill-name
description: What the skill does and when to use it. Include trigger keywords.
allowed-tools: Read, Grep, Glob  # Optional: restrict tools
version: 1.0.0                    # Optional: version tracking
---
```

#### Agents

```yaml
---
description: What this agent specializes in
capabilities:
  - Capability 1
  - Capability 2
allowed-tools: Read, Write, Edit  # Optional: restrict tools
---
```

### Best Practices for Customization

#### 1. Write Specific Descriptions

```yaml
# ❌ Too vague
description: Helps with files

# ✅ Specific with triggers
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when users mention PDFs, forms, or document extraction.
```

#### 2. Include Working Examples

Always provide code examples that:
- Actually work (test them!)
- Are realistic (not just `foo`/`bar`)
- Include comments explaining non-obvious parts
- Show common use cases

#### 3. Follow the AAA Pattern for Examples

```typescript
// Arrange: Setup
const items = [{ price: 10 }, { price: 20 }];

// Act: Execute
const result = calculateTotal(items);

// Assert: Verify
expect(result).toBe(30);
```

#### 4. Security in Hooks

Always include:

```bash
set -euo pipefail  # Fail on errors, undefined vars, pipe failures

# Quote variables
rm "$FILE_PATH"  # ✅ Safe
rm $FILE_PATH    # ❌ Unsafe

# Validate inputs
if echo "$FILE_PATH" | grep -q '\.\.'; then
  echo "Path traversal detected" >&2
  exit 2
fi
```

## Testing Your Components

### Testing Slash Commands

```bash
# 1. Create command
cp templates/slash-commands/simple.md .claude/commands/test.md

# 2. Edit and customize
# ...

# 3. Test in Claude
claude
/help                    # Verify it's listed
/test                    # Run the command
# Ctrl+R for transcript mode to see detailed execution
```

### Testing Hooks

```bash
# 1. Install hook
cp -r templates/hooks/post-tool-use-formatter/ .claude/hooks/
chmod +x .claude/hooks/format.sh

# 2. Add to settings.json
# ...

# 3. Test manually first
echo '{"tool_name":"Write","tool_input":{"file_path":"test.ts"}}' | .claude/hooks/format.sh

# 4. Test with Claude
claude
# Write a .ts file and watch hook execute
```

### Testing Skills

```bash
# 1. Create skill
cp -r templates/skills/simple-skill/ .claude/skills/my-test-skill/

# 2. Rename and customize
mv .claude/skills/my-test-skill/SKILL.template.md .claude/skills/my-test-skill/SKILL.md
# Focus on a SPECIFIC, CLEAR description with trigger keywords

# 3. Test discovery
claude --debug  # Check skill loading logs

# 4. Test activation
claude
# Use trigger keywords from description in your prompt
```

## Common Patterns

### Pattern 1: Command with Git Context

```markdown
---
description: Review recent changes
allowed-tools: Bash(git *), Read
---

# Recent Changes Review

## Context
Recent commits: !`git log --oneline -5`
Uncommitted changes: !`git diff`
Current branch: !`git branch --show-current`

## Task
Review the changes above and summarize:
1. What changed
2. Potential issues
3. Suggested improvements
```

### Pattern 2: Validation Hook

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Validate
if [[ -z "$FILE_PATH" ]]; then
  echo "Error: No file path" >&2
  exit 2  # Block and show to Claude
fi

# Check path traversal
if echo "$FILE_PATH" | grep -q '\.\.'; then
  echo "❌ Path traversal blocked" >&2
  exit 2
fi

echo "✓ Validation passed"
exit 0
```

### Pattern 3: Multi-File Skill

```
my-skill/
├── SKILL.md         # Essential info + quick start
├── REFERENCE.md     # Complete API documentation
├── EXAMPLES.md      # Real-world use cases
└── scripts/
    └── helper.sh    # Helper utilities
```

In `SKILL.md`:

```markdown
## Quick Start
[Essential info here]

## Advanced Usage
See [REFERENCE.md](REFERENCE.md) for complete API documentation.
See [EXAMPLES.md](EXAMPLES.md) for real-world examples.
```

## Troubleshooting

### Command Not Found

**Problem**: `/my-command` not recognized

**Solutions**:
1. Check file location: `.claude/commands/my-command.md`
2. Check filename: lowercase, no spaces, `.md` extension
3. Restart Claude Code

### Hook Not Firing

**Problem**: Hook doesn't execute

**Solutions**:
1. Verify matcher syntax in `settings.json`
2. Check script is executable: `chmod +x script.sh`
3. Test script manually with sample input
4. Enable debug mode: `claude --debug`

### Skill Not Activating

**Problem**: Skill doesn't trigger when expected

**Solutions**:
1. Check description is specific with trigger keywords
2. Verify YAML frontmatter syntax (no tabs!)
3. Enable debug mode: `claude --debug`
4. Test by explicitly mentioning trigger keywords

### Script Permission Errors

**Problem**: Permission denied when running scripts

**Solutions**:

```bash
# Make executable
chmod +x .claude/hooks/*.sh

# Check permissions
ls -la .claude/hooks/

# Verify shebang
head -1 script.sh  # Should be #!/usr/bin/env bash
```

## Advanced Customization

### Combining Templates

You can combine patterns from multiple templates:

```markdown
---
description: Deploy with validation
argument-hint: <environment>
allowed-tools: Bash(git *), Bash(docker *), Read
---

# Deploy Command

## Context
Git status: !`git status`
Docker images: !`docker images | head -5`

## Validation
Current environment: $1
Config file: @.env.$1

## Task
Deploy to $1 environment with:
1. Run tests
2. Build Docker image
3. Deploy to cluster
4. Verify health checks
```

### Creating Skill Suites

Organize related skills:

```
.claude/skills/
├── pdf-processing/
│   └── SKILL.md
├── excel-analysis/
│   └── SKILL.md
└── document-conversion/
    └── SKILL.md
```

### Hook Chains

Combine multiple hooks:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "./.claude/hooks/validate.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "./.claude/hooks/format.sh"
          },
          {
            "type": "command",
            "command": "./.claude/hooks/lint.sh"
          }
        ]
      }
    ]
  }
}
```

## Resources

- **Official Docs**: [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/overview)
- **Skills Reference**: [Agent Skills Overview](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview)
- **Authoring Skills**: See `claude-*` skills in outfitter for detailed guidance

## Contributing

Found an issue or want to improve a template?

1. Test your changes thoroughly
2. Ensure all placeholders are clearly marked
3. Include working examples
4. Update this README if adding new templates

## License

These templates are provided as-is for use with Claude Code.

---

**Last Updated**: 2025-10-20
**Template Version**: 1.0.0
**Compatible with**: Claude Code 1.0+
