# Quick Start Guide

Fast track to using Claude Code templates.

## 30-Second Quick Start

```bash
# 1. Choose a template (from outfitter/templates/)
ls slash-commands/  # or hooks/, skills/, agents/

# 2. Copy it
cp slash-commands/simple.md ~/.claude/commands/my-command.md

# 3. Edit it (replace [YOUR_*] placeholders)
# 4. Use it
claude
/my-command
```

## Template Quick Reference

### Slash Commands

```bash
# Simple command
cp slash-commands/simple.md .claude/commands/review.md

# With arguments ($1, $2, $ARGUMENTS)
cp slash-commands/with-args.md .claude/commands/fix-issue.md

# With bash execution (!`git status`)
cp slash-commands/with-bash.md .claude/commands/commit.md

# With file references (@src/file.ts)
cp slash-commands/with-files.md .claude/commands/analyze.md
```

**Location**: `.claude/commands/` (project) or `~/.claude/commands/` (personal)

### Hooks

```bash
# Auto-formatter (PostToolUse)
cp -r hooks/post-tool-use-formatter/ .claude/hooks/formatter/
chmod +x .claude/hooks/formatter/format.sh

# File validator (PreToolUse)
cp -r hooks/pre-tool-use-validator/ .claude/hooks/validator/
chmod +x .claude/hooks/validator/validate.sh

# Add context (UserPromptSubmit)
cp -r hooks/user-prompt-context/ .claude/hooks/context/
chmod +x .claude/hooks/context/add-context.sh

# Bash validator (PreToolUse, TypeScript)
cp -r hooks/bash-validator/ .claude/hooks/bash/
chmod +x .claude/hooks/bash/validate-bash.ts
```

**Then add to** `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/formatter/format.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Skills

```bash
# Simple skill
cp -r skills/simple-skill/ .claude/skills/my-skill/

# Complex skill with docs
cp -r skills/multi-file-skill/ .claude/skills/my-complex-skill/

# Skill with helper scripts
cp -r skills/skill-with-scripts/ .claude/skills/my-scripted-skill/
chmod +x .claude/skills/my-scripted-skill/scripts/*.sh
```

**Location**: `.claude/skills/` (project) or `~/.claude/skills/` (personal)

**Critical**: Edit the `description` field - it controls discovery!

### Agents

```bash
# Code reviewer
cp agents/code-reviewer.md .claude/agents/

# Test specialist
cp agents/test-specialist.md .claude/agents/

# Documentation generator
cp agents/documentation-generator.md .claude/agents/
```

**Location**: `.claude/agents/` (project) or `~/.claude/agents/` (personal)

## Common Tasks

### Create a Git Commit Command

```bash
# 1. Copy template
cp slash-commands/with-bash.md .claude/commands/commit.md

# 2. Edit .claude/commands/commit.md
# Replace:
#   [YOUR_DESCRIPTION] → "Create a git commit from staged changes"
#   [YOUR_ALLOWED_TOOLS] → "Bash(git *)"
#   [YOUR_BASH_COMMANDS] → Git commands you want
#   [YOUR_INSTRUCTIONS_USING_THE_BASH_OUTPUT_ABOVE] → "Create commit with clear message"

# 3. Use it
claude
/commit
```

### Create an Auto-Formatter Hook

```bash
# 1. Copy template
cp -r hooks/post-tool-use-formatter/ .claude/hooks/

# 2. Make executable
chmod +x .claude/hooks/format.sh

# 3. Configure in .claude/settings.json
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

# 4. Test - write a .ts file and watch it format
```

### Create a Custom Skill

```bash
# 1. Copy template
cp -r skills/simple-skill/ .claude/skills/pdf-processor/

# 2. Edit .claude/skills/pdf-processor/SKILL.md
# Replace:
#   [YOUR_SKILL_NAME] → "pdf-processor"
#   [YOUR_DESCRIPTION] → "Extract text from PDF files. Use when working with PDFs, documents, or when user mentions PDF extraction."
#   [CORE_CAPABILITY] → Complete the instructions

# 3. Test - mention "PDF" in your prompt to activate
claude
"Can you help me extract text from a PDF?"
```

## Placeholder Reference

Replace these in templates:

- `[YOUR_DESCRIPTION]` - Brief description
- `[YOUR_COMMAND_NAME]` - Name
- `[YOUR_PROMPT_INSTRUCTIONS]` - Instructions
- `[YOUR_ARG_HINT]` - Argument hint (e.g., `<file>`)
- `[YOUR_ALLOWED_TOOLS]` - Tool restrictions
- `[YOUR_SKILL_NAME]` - Skill name
- `[CORE_CAPABILITY]` - What it does
- `[language]` - Programming language
- `[CODE_EXAMPLE]` - Working code

## Testing

### Test a Command

```bash
claude
/help                    # Should see your command
/your-command arg1 arg2  # Run it
# Press Ctrl+R for transcript mode to see details
```

### Test a Hook

```bash
# Test script manually first
echo '{"tool_name":"Write","tool_input":{"file_path":"test.ts"}}' | ./.claude/hooks/your-hook.sh

# Then test with Claude
claude --debug  # See hook execution
# Trigger the hook (e.g., write a file)
```

### Test a Skill

```bash
# Check it loads
claude --debug  # Look for skill loading messages

# Test discovery
claude
# Use trigger keywords from description
```

## Troubleshooting

### Command not found

- Check: `.claude/commands/name.md` (correct location?)
- Check: Lowercase filename, `.md` extension
- Fix: Restart Claude

### Hook not firing

- Check: Matcher syntax in settings.json
- Check: Script is executable (`chmod +x`)
- Fix: Test script manually, enable debug mode

### Skill not activating

- Check: Description has specific trigger keywords
- Check: YAML frontmatter valid (no tabs!)
- Fix: Use trigger keywords explicitly in prompt

### Permission denied

```bash
# Make all scripts executable
find .claude/hooks -name "*.sh" -exec chmod +x {} \;
find .claude/skills -name "*.sh" -exec chmod +x {} \;
```

## File Locations

| Component | Project | Personal | Plugin |
|-----------|---------|----------|--------|
| Commands | `.claude/commands/` | `~/.claude/commands/` | `commands/` |
| Hooks (config) | `.claude/settings.json` | `~/.claude/settings.json` | `hooks/hooks.json` |
| Hooks (scripts) | `.claude/hooks/` | `~/.claude/hooks/` | `scripts/` |
| Skills | `.claude/skills/` | `~/.claude/skills/` | `skills/` |
| Agents | `.claude/agents/` | `~/.claude/agents/` | `agents/` |

## Next Steps

1. **Read**: [README.md](README.md) for detailed documentation
2. **Review**: [SUMMARY.md](SUMMARY.md) for complete overview
3. **Customize**: Replace placeholders with your content
4. **Test**: Run in Claude and iterate

## Help

- **Debug mode**: `claude --debug`
- **View hooks**: `/hooks` in Claude
- **View commands**: `/help` in Claude
- **Test manually**: Use transcript mode (Ctrl+R)

---

**Quick Reference**: Keep this file handy while building Claude Code components!
