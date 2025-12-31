---
name: claude-skill-authoring
description: Creates and updates Agent Skills (SKILL.md directories) with proper YAML frontmatter, progressive disclosure patterns, and tool restrictions. Use when creating skills, authoring Agent Skills, building reusable capabilities, or when users mention skills, SKILL.md, skill development, agent capabilities, or progressive disclosure.
version: 1.0.0
---

# Claude Agent Skill Authoring

Create Agent Skills that package expertise into discoverable, reusable capabilities for Claude Code.

## Overview

Agent Skills are different from slash commands and plugins:

- **Slash Commands**: User-invoked prompts (`/command`)
- **Agent Skills**: Model-invoked capabilities (Claude decides when to use them)
- **Plugins**: Bundles of commands, skills, hooks, and MCP servers

Skills consist of a `SKILL.md` file with instructions plus optional supporting files.

## Key Features

- **Model-Invoked**: Claude autonomously activates skills based on context
- **Progressive Disclosure**: Main file under 500 lines, details in supporting files
- **Tool Restrictions**: Limit tool access with `allowed-tools`
- **Discoverable**: Good descriptions enable automatic discovery
- **Multi-File**: Organize with REFERENCE.md, EXAMPLES.md, scripts/

## Quick Start

### Basic Skill (Single File)

```bash
# Create skill directory
mkdir -p .claude/skills/my-skill
cd .claude/skills/my-skill

# Create SKILL.md
cat > SKILL.md << 'EOF'
---
name: My Skill Name
description: What this skill does and when to use it. Include trigger keywords.
---

# My Skill Name

## Instructions

Step-by-step guidance for Claude on how to use this skill.

## Examples

Concrete examples showing skill usage.
EOF
```

### Skill with Tool Restrictions

```markdown
---
name: Safe Code Reviewer
description: Review code for best practices without making changes. Use when reviewing code, checking quality, or auditing codebase.
allowed-tools: Read, Grep, Glob
---

# Safe Code Reviewer

## Review Checklist

1. Code organization and structure
2. Error handling
3. Performance considerations
4. Security concerns
5. Test coverage

When activated, analyze code using read-only tools only.
```

### Multi-File Skill

```
my-skill/
├── SKILL.md (required - main instructions)
├── REFERENCE.md (optional - detailed documentation)
├── EXAMPLES.md (optional - comprehensive examples)
├── scripts/
│   └── helper.sh (optional - utility scripts)
└── templates/
    └── config.yaml (optional - templates)
```

## Skill Scopes

### Personal Skills (`~/.claude/skills/`)

- Available across all your projects
- Individual workflows and preferences
- Not shared with team

### Project Skills (`.claude/skills/`)

- Shared with your team via git
- Team-specific workflows
- Project conventions

### Plugin Skills (`plugin/skills/`)

- Bundled with plugins
- Distributed via marketplaces
- Automatically available when plugin installed

## SKILL.md Structure

### Required: Frontmatter

```yaml
---
name: skill-name
description: What it does and when to use it, with trigger keywords
---
```

### Optional Frontmatter Fields

```yaml
---
name: skill-name
description: Detailed description with trigger keywords
allowed-tools: Read, Grep, Glob, Bash(git *)
version: 1.0.0
---
```

### Content Organization

```markdown
# Skill Name

## Quick Start
Brief introduction and basic usage

## Instructions
Step-by-step guidance for Claude

## Examples
Concrete usage examples

## Advanced Usage
See [REFERENCE.md](REFERENCE.md) for detailed documentation
See [EXAMPLES.md](EXAMPLES.md) for more examples
```

## Critical: Writing Descriptions

**The description field is essential for skill discovery.**

### Poor Description

```yaml
description: Helps with documents
```

### Good Description

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

### Description Requirements

1. **What**: Clearly state what the skill does
2. **When**: Explain when Claude should use it
3. **Triggers**: Include keywords users might mention
4. **Specificity**: Be concrete, not vague

### Examples

**Excel Analysis:**

```yaml
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when working with Excel files, spreadsheets, or analyzing tabular data in .xlsx format.
```

**Git Workflows:**

```yaml
description: Automate git workflows including branch management, commit formatting, and PR creation. Use when managing git repositories, creating branches, or handling commits.
```

**API Testing:**

```yaml
description: Test REST APIs with validation and reporting. Use when testing APIs, endpoints, or HTTP services, or when user mentions API testing or endpoint validation.
```

## Tool Restrictions with allowed-tools

Limit which tools Claude can use when skill is active:

```yaml
---
name: Read-Only Analyzer
description: Analyze code without making modifications
allowed-tools: Read, Grep, Glob
---
```

**Benefits:**
- Prevents accidental modifications
- Faster execution (no permission prompts)
- Clear intent (read-only vs. modification)

**Common Patterns:**

```yaml
# Read-only skills
allowed-tools: Read, Grep, Glob

# Git operations
allowed-tools: Bash(git *), Read, Write

# Safe bash commands
allowed-tools: Bash(find:*), Bash(wc:*), Read

# File modifications
allowed-tools: Read, Edit, Write

# Complete workflow
allowed-tools: Read, Edit, Write, Bash(git *), Bash(bun test:*)
```

## Progressive Disclosure

**Keep SKILL.md under 500 lines** by referencing supporting files:

```markdown
# My Complex Skill

## Quick Start
Basic usage instructions here (keep brief)

## Common Operations
Most frequent use cases

## Advanced Topics
For detailed information:
- See [REFERENCE.md](REFERENCE.md) for complete API documentation
- See [EXAMPLES.md](EXAMPLES.md) for real-world examples
- See [scripts/README.md](scripts/README.md) for utility scripts

## Scripts
Run helper scripts:
```bash
./scripts/analyze.sh input.txt
./scripts/format-output.py results.json
```

```

## Supporting Files

### REFERENCE.md (Optional)
- Complete API documentation
- Detailed configuration options
- Integration guides
- Troubleshooting

### EXAMPLES.md (Optional)
- Real-world use cases
- Common patterns
- Step-by-step tutorials
- Edge cases

### scripts/ Directory (Optional)
- Utility scripts
- Helper functions
- Data processors
- Must be executable: `chmod +x scripts/*.sh`

### templates/ Directory (Optional)
- Configuration templates
- Code templates
- File structure examples

## Best Practices

### 1. Focused Skills

**Good: Focused**
```

✅ pdf-form-filling
✅ excel-pivot-tables
✅ api-endpoint-testing

```

**Bad: Too Broad**
```

❌ document-processing
❌ data-analysis
❌ testing

```

### 2. Clear Descriptions

```yaml
# ❌ Vague
description: Helps with files

# ✅ Specific
description: Process JSON files including parsing, validation, transformation, and formatting. Use when working with JSON data or when user mentions JSON processing.
```

### 3. Progressive Disclosure

```markdown
# ✅ Good: Brief main file
Quick start (20 lines)
Common operations (50 lines)
Reference to REFERENCE.md for details

# ❌ Bad: Everything in SKILL.md
Complete documentation (2000 lines)
All examples (500 lines)
Every edge case (300 lines)
```

### 4. Tool Restrictions

```yaml
# ✅ Appropriate restrictions
allowed-tools: Read, Grep, Glob  # For analysis skills

# ❌ Too restrictive
allowed-tools: Read  # Can't search effectively

# ❌ Too permissive
# (no allowed-tools when Read-only intent)
```

### 5. Version Management

```yaml
---
name: my-skill
description: Skill description
version: 1.2.0  # Semantic versioning
---
```

Add changelog in SKILL.md content:

```markdown
## Version History

### 1.2.0 (2025-10-20)
- Added support for TypeScript
- Improved error handling

### 1.1.0 (2025-09-15)
- Initial release
```

## Testing Skills

### 1. Check Discovery

```bash
# Enable debug mode
claude --debug

# Look for skill loading messages
# Should see: "Loaded skill: my-skill from ..."
```

### 2. Test Natural Invocation

```
# Ask Claude something that should trigger your skill
"Can you help me process this PDF?"

# For PDF skill, Claude should activate it automatically
```

### 3. Verify Tool Restrictions

```
# If skill has allowed-tools: [Read, Grep, Glob]
# Ask Claude to analyze a file
# Should NOT ask permission for Read/Grep/Glob
# SHOULD ask permission for Edit/Write
```

### 4. Test with Real Data

```
# Create test files
# Invoke skill naturally
# Verify behavior matches expectations
```

## Common Patterns

### Code Analysis

```markdown
---
name: code-complexity-analyzer
description: Analyze code complexity and suggest refactoring. Use when reviewing code complexity, finding code smells, or improving maintainability.
allowed-tools: Read, Grep, Glob
---

# Code Complexity Analyzer

## Analysis Criteria
1. Cyclomatic complexity
2. Function length
3. Nesting depth
4. Code duplication

Provide refactoring suggestions for complex code.
```

### Document Processing

```markdown
---
name: markdown-formatter
description: Format and lint Markdown documents following best practices. Use when working with Markdown files or when user mentions Markdown formatting or linting.
allowed-tools: Read, Edit, Write
---

# Markdown Formatter

## Formatting Rules
1. Consistent heading hierarchy
2. Proper list formatting
3. Code block language tags
4. Link validation

Apply formatting to Markdown files.
```

### Testing Workflows

```markdown
---
name: test-generator
description: Generate unit tests from code. Use when writing tests, adding test coverage, or when user mentions test generation.
allowed-tools: Read, Write, Bash(bun test:*)
---

# Test Generator

## Test Generation Strategy
1. Identify functions to test
2. Generate test cases
3. Add edge cases
4. Include error scenarios

Generate comprehensive test suites.
```

## Troubleshooting

### Skill Not Loading

**Check file location:**

```bash
# Personal skill
ls ~/.claude/skills/my-skill/SKILL.md

# Project skill
ls .claude/skills/my-skill/SKILL.md
```

**Validate YAML frontmatter:**

```bash
# Must have opening ---
# Must have closing ---
# No tabs (use spaces)
# Valid YAML syntax
```

### Claude Doesn't Use Skill

**Improve description specificity:**

```yaml
# Before: Too vague
description: Process files

# After: Specific with triggers
description: Parse and validate JSON files, including schema validation and formatting. Use when working with JSON data, .json files, or when user mentions JSON parsing or validation.
```

**Add trigger keywords:**
- File types: `.json`, `.xlsx`, `PDF`
- Actions: `parse`, `validate`, `format`, `test`
- Domains: `API`, `database`, `spreadsheet`

### Tool Permissions Issues

**Verify tool names (case-sensitive):**

```yaml
# ✅ Correct
allowed-tools: Read, Grep, Glob

# ❌ Incorrect
allowed-tools: read, grep, glob
```

**Check bash patterns:**

```yaml
# ✅ Correct
allowed-tools: Bash(git *), Bash(npm *)

# ❌ Incorrect
allowed-tools: Bash(git), Bash(npm)
```

### Skill Errors

**Enable debug mode:**

```bash
claude --debug
# Shows skill loading errors and issues
```

**Check dependencies:**
- Scripts must be executable: `chmod +x scripts/*.sh`
- Referenced files must exist: REFERENCE.md, EXAMPLES.md
- Paths use forward slashes: `scripts/helper.sh`

## Quick Reference

```bash
# Create new skill
mkdir -p .claude/skills/my-skill
./scripts/scaffold-skill.sh my-skill

# Validate skill
./scripts/validate-skill.sh .claude/skills/my-skill

# Test skill discovery
claude --debug
```

## Advanced Topics

See [REFERENCE.md](REFERENCE.md) for:
- Complete YAML frontmatter schema
- Directory structure conventions
- Progressive disclosure best practices
- Skill discovery mechanisms
- Integration with commands and hooks
- Personal vs project vs plugin skills

See [EXAMPLES.md](EXAMPLES.md) for:
- Simple single-file skills
- Multi-file skills with supporting docs
- Skills with utility scripts
- Skills with templates
- Read-only skills (tool restrictions)
- Complex workflow skills
- Real-world examples from various domains

## Related Skills

- **claude-command-authoring**: Create user-invoked commands
- **claude-hook-authoring**: Add automation with event hooks
- **claude-plugin-authoring**: Bundle skills into distributable plugins
- **claude-config-management**: Configure skill behavior globally
