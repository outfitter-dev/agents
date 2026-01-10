# Claude Code Implementation

Claude Code-specific implementation details for Agent Skills. For cross-platform concepts, see the main [SKILL.md](../SKILL.md).

## Tool Restrictions

Use `allowed-tools` to limit which tools Claude can use when a skill is active.

### Syntax

```yaml
# Comma-separated list
allowed-tools: Read, Grep, Glob

# With Bash patterns
allowed-tools: Read, Write, Bash(git *), Bash(npm run *)

# MCP tools
allowed-tools: Read, mcp__memory__store, mcp__memory__retrieve
```

### Bash Pattern Syntax

| Pattern | Meaning | Example |
| ------- | ------- | ------- |
| `Bash(git *)` | All git commands | `git status`, `git commit` |
| `Bash(git add:*)` | Specific subcommand | `git add .`, `git add file.ts` |
| `Bash(npm run *:*)` | Nested patterns | `npm run test:unit` |

**Common patterns:**

```yaml
# Read-only analysis
allowed-tools: Read, Grep, Glob

# File modifications
allowed-tools: Read, Edit, Write

# Git operations
allowed-tools: Read, Write, Bash(git *)

# Testing workflows
allowed-tools: Read, Write, Bash(bun test:*), Bash(npm test:*)

# Full development
allowed-tools: Read, Edit, Write, Bash(git *), Bash(bun *), Bash(npm *)
```

### Tool Names (Case-Sensitive)

| Tool | Purpose |
| ---- | ------- |
| `Read` | Read files |
| `Write` | Write new files |
| `Edit` | Edit existing files |
| `Grep` | Search file contents |
| `Glob` | Find files by pattern |
| `Bash` | Execute bash commands |
| `WebFetch` | Fetch web content |
| `WebSearch` | Search the web |

**MCP tools** use format: `mcp__servername__toolname`

```yaml
allowed-tools: mcp__linear__create_issue, mcp__memory__store
```

### Behavior

- **With `allowed-tools`**: Listed tools run without permission prompts
- **Without `allowed-tools`**: Inherits conversation permissions; Claude may ask

## Testing Skills

### Debug Mode

```bash
claude --debug
```

Debug output shows:
- `Loaded skill: skill-name from path` - Skill discovered
- `Error loading skill: reason` - Loading failed
- `Considering skill: skill-name` - Activation being evaluated
- `Skill allowed-tools: [list]` - Tool restrictions applied

### Testing Process

1. **Verify loading**: Run `claude --debug` and check for load messages
2. **Test discovery**: Ask Claude something that should trigger the skill
3. **Verify tool restrictions**: Confirm permitted tools run without prompts
4. **Test with real data**: Run actual workflows

### Example Test

```bash
# Start debug session
claude --debug

# In conversation, trigger the skill naturally:
# "Can you help me process this PDF file?"

# Look for:
# "Considering skill: pdf-processor"
# "Activated skill: pdf-processor"
```

## Troubleshooting

### Skill Not Loading

**Check file location:**

```bash
# Personal skills
ls ~/.claude/skills/my-skill/SKILL.md

# Project skills
ls .claude/skills/my-skill/SKILL.md
```

**Validate YAML frontmatter:**

```bash
# Check for tabs (YAML requires spaces)
grep -P "\t" SKILL.md

# Verify YAML syntax
python3 -c "import yaml; yaml.safe_load(open('SKILL.md').read().split('---')[1])"
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

**Try explicit mention:**

```
# Instead of:
"Process this JSON file"

# Try:
"Use the JSON processing skill to validate this file"
```

### Tool Permission Errors

**Tool names are case-sensitive:**

```yaml
# Correct
allowed-tools: Read, Grep, Glob

# Wrong
allowed-tools: read, grep, glob
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

**Use relative paths in skill instructions:**

```markdown
# Correct
./scripts/process.sh input.txt

# Wrong (breaks portability)
/Users/me/.claude/skills/my-skill/scripts/process.sh
```

## Integration with Commands

Skills activate automatically when commands need their expertise:

**Command** (`.claude/commands/analyze-pdf.md`):

```markdown
---
description: Analyze PDF file
---

Analyze this PDF file: $1

Use the PDF processing skill for extraction and analysis.
```

**Skill** (`.claude/skills/pdf-processor/SKILL.md`):

```yaml
---
name: pdf-processor
description: Extract text and tables from PDFs. Use when working with PDF files.
allowed-tools: Read, Write, Bash(pdftotext:*)
---
```

When user runs `/analyze-pdf report.pdf`, Claude recognizes the PDF context and activates the skill.

## Integration with Hooks

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

Claude sees the suggestion and may activate the referenced skill.

## Performance Tips

### Keep SKILL.md Small

Token impact of skill size:
- 300 lines ~= 2,000 tokens
- 1,500 lines ~= 10,000 tokens

Each activation loads the full SKILL.md. Use progressive disclosure.

### Tool Restrictions Speed Up Execution

Without restrictions: Claude asks permission for each tool.
With restrictions: Listed tools run immediately.

```yaml
# Fast (no prompts for these tools)
allowed-tools: Read, Grep, Glob
```

### Force Skill Reload

Skills are cached per session. To reload after changes:

```
/clear
```

## Quick Reference

```bash
# Find all skills
find ~/.claude/skills .claude/skills -name "SKILL.md" 2>/dev/null

# Validate YAML
python3 -c "import yaml; yaml.safe_load(open('SKILL.md').read().split('---')[1])"

# Check for tabs
grep -P "\t" SKILL.md

# Test in debug mode
claude --debug
```
