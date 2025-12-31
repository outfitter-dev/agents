# Agent Skills Reference

Comprehensive reference for Claude Code Agent Skills development.

## Table of Contents

1. [What Are Agent Skills](#what-are-agent-skills)
2. [YAML Frontmatter Schema](#yaml-frontmatter-schema)
3. [Directory Structure](#directory-structure)
4. [File Naming Conventions](#file-naming-conventions)
5. [Progressive Disclosure](#progressive-disclosure)
6. [Skill Discovery Mechanisms](#skill-discovery-mechanisms)
7. [Tool Restrictions](#tool-restrictions)
8. [Integration with Commands](#integration-with-commands)
9. [Integration with Hooks](#integration-with-hooks)
10. [Personal vs Project vs Plugin Skills](#personal-vs-project-vs-plugin-skills)
11. [Advanced Patterns](#advanced-patterns)
12. [Performance Optimization](#performance-optimization)
13. [Debugging and Troubleshooting](#debugging-and-troubleshooting)

## What Are Agent Skills

### Definition

Agent Skills are **model-invoked capabilities** that Claude Code autonomously activates based on task context. Unlike slash commands (which users explicitly invoke), skills are discovered and used by Claude when relevant.

### Skills vs Commands vs Plugins

| Aspect | Agent Skills | Slash Commands | Plugins |
|--------|-------------|----------------|---------|
| **Invocation** | Model-triggered | User-triggered | Container |
| **Activation** | Automatic based on context | Explicit `/command` | N/A |
| **Structure** | Directory with SKILL.md | Single .md file | Multiple components |
| **Complexity** | Complex workflows | Simple prompts | Bundles of everything |
| **Discovery** | Via description matching | Listed in `/help` | Via marketplace |
| **Files** | Multiple files, scripts | Single file only | Commands, skills, hooks |

### When to Use Skills

**Use Agent Skills for:**
- Complex, reusable capabilities
- Domain-specific expertise (PDF processing, API testing)
- Workflows requiring multiple steps
- Capabilities with supporting scripts/tools
- Automatic discovery based on context

**Use Slash Commands for:**
- Simple, frequently-used prompts
- Quick team workflows
- Single-step operations
- User-directed actions

**Use Plugins for:**
- Distributing skills and commands together
- Team-wide standardization
- Marketplace distribution
- Bundling with MCP servers and hooks

## YAML Frontmatter Schema

### Complete Schema

```yaml
---
# REQUIRED FIELDS
name: skill-identifier

# REQUIRED: Critical for discovery
description: >
  What the skill does, when to use it, and trigger keywords.
  Must be specific and include user-facing terms.

# OPTIONAL FIELDS
allowed-tools: Read, Grep, Glob, Bash(git *)
version: 1.0.0
author: Your Name <email@example.com>
license: MIT
keywords: [tag1, tag2, tag3]
dependencies: [package1, package2]
---
```

### Field Definitions

#### name (required)

**Type**: string
**Format**: kebab-case, lowercase, hyphens only
**Purpose**: Unique identifier for the skill

```yaml
# ✅ Good
name: pdf-form-processor
name: git-workflow-automation
name: api-endpoint-tester

# ❌ Bad
name: PDF Form Processor  # Spaces not allowed
name: git_workflow        # Underscores not recommended
name: APITester           # CamelCase not recommended
```

**Rules:**
- Must be unique within scope (personal/project/plugin)
- Lowercase letters, numbers, hyphens only
- No spaces, underscores, or special characters
- Descriptive but concise

#### description (required)

**Type**: string or multi-line string
**Max Length**: No hard limit, but keep focused (~2-3 sentences)
**Purpose**: Enables skill discovery - most critical field

**Anatomy of a Good Description:**

1. **What it does**: Clear statement of capability
2. **When to use it**: Context for activation
3. **Trigger keywords**: Terms users might mention

```yaml
# Single-line format
description: Parse and validate JSON files including schema validation. Use when working with JSON data or .json files.

# Multi-line format (YAML literal block)
description: >
  Extract text, tables, and images from PDF files. Fill PDF forms with data.
  Merge multiple PDF documents. Use when working with PDF files, forms, or
  document extraction. Triggered by mentions of PDF, forms, or document processing.
```

**Formula:**

```
[Action verbs] + [Specific capabilities] + "Use when" + [Context] +
[Optional: Triggered by] + [Keywords]
```

**Examples:**

```yaml
# Excel Analysis
description: >
  Analyze Excel spreadsheets, create pivot tables, generate charts, and perform
  statistical analysis. Use when working with Excel files, spreadsheets, or
  analyzing tabular data in .xlsx/.xls format. Triggered by mentions of Excel,
  spreadsheets, pivot tables, or data analysis.

# API Testing
description: >
  Test REST APIs with request validation, response checking, and automated
  reporting. Supports authentication, headers, and parameterization. Use when
  testing APIs, endpoints, or HTTP services. Triggered by mentions of API
  testing, endpoint validation, or REST services.

# Git Workflows
description: >
  Automate git workflows including branch management, commit message formatting,
  PR creation, and merge conflict resolution. Use when managing git repositories,
  creating branches, or handling version control. Triggered by mentions of git,
  branches, commits, or version control.
```

**Avoid:**

```yaml
# ❌ Too vague
description: Helps with documents

# ❌ Missing "when" clause
description: Process PDF files and extract data

# ❌ No trigger keywords
description: A utility for spreadsheet analysis

# ❌ Too technical (not user-facing)
description: Implements PDF parsing using pypdf and pdfplumber libraries
```

#### allowed-tools (optional)

**Type**: string (comma-separated) or array
**Default**: Inherits from conversation
**Purpose**: Restrict which tools Claude can use

```yaml
# String format (preferred)
allowed-tools: Read, Grep, Glob

# Array format
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git *)

# Multiple bash patterns
allowed-tools: Read, Write, Bash(git *), Bash(npm run *), Bash(bun *)
```

**Tool Name Format:**

| Tool | Syntax | Example |
|------|--------|---------|
| Exact match | `ToolName` | `Read`, `Write`, `Edit` |
| Bash wildcard | `Bash(command *)` | `Bash(git *)` |
| Bash specific | `Bash(cmd:subcmd:*)` | `Bash(git add:*)` |
| MCP tools | `mcp__server__tool` | `mcp__memory__store` |

**Common Patterns:**

```yaml
# Read-only analysis
allowed-tools: Read, Grep, Glob

# File modifications
allowed-tools: Read, Edit, Write

# Git operations
allowed-tools: Read, Write, Bash(git *)

# Testing workflows
allowed-tools: Read, Write, Bash(bun test:*), Bash(npm test:*)

# Complete development workflow
allowed-tools: Read, Edit, Write, Bash(git *), Bash(bun *), Bash(npm *)

# MCP integration
allowed-tools: Read, mcp__memory__store, mcp__memory__retrieve
```

#### version (optional)

**Type**: string
**Format**: Semantic versioning (major.minor.patch)
**Purpose**: Track skill versions

```yaml
version: 1.0.0    # Initial release
version: 1.1.0    # New features (backward compatible)
version: 1.0.1    # Bug fixes
version: 2.0.0    # Breaking changes
```

**Changelog in SKILL.md:**

```markdown
## Version History

### 2.0.0 (2025-10-20)
- Breaking: Changed output format
- Added support for new API

### 1.1.0 (2025-09-15)
- Added batch processing
- Improved error handling

### 1.0.0 (2025-08-01)
- Initial release
```

#### author (optional)

**Type**: string or object
**Purpose**: Credit and contact information

```yaml
# Simple format
author: John Doe

# With email
author: John Doe <john@example.com>

# Object format
author:
  name: John Doe
  email: john@example.com
  url: https://github.com/johndoe
```

#### license (optional)

**Type**: string
**Purpose**: License identifier

```yaml
license: MIT
license: Apache-2.0
license: GPL-3.0
license: Proprietary
```

#### keywords (optional)

**Type**: array of strings
**Purpose**: Additional discovery metadata

```yaml
keywords: [pdf, forms, documents, extraction]
keywords: [testing, api, rest, validation]
keywords: [git, version-control, workflow]
```

#### dependencies (optional)

**Type**: array of strings
**Purpose**: Document required packages/tools

```yaml
dependencies: [pypdf, pdfplumber]
dependencies: [playwright, @playwright/test]
dependencies: [jq, yq, git]
```

**Note:** Claude will auto-install when possible, but documenting helps users.

### YAML Syntax Rules

**Critical:**
- Opening `---` on first line
- Closing `---` after frontmatter
- **No tabs** (YAML requires spaces)
- Use 2-space indentation
- Quote strings with special characters

**Valid:**

```yaml
---
name: my-skill
description: This is a description
allowed-tools: Read, Write
---
```

**Invalid:**

```yaml
---
name: my-skill
description: This is a description
 allowed-tools: Read, Write  # Tab instead of spaces
---
```

## Directory Structure

### Minimal Structure (Single File)

```
my-skill/
└── SKILL.md (required)
```

### Recommended Structure

```
my-skill/
├── SKILL.md          (required - main instructions, <500 lines)
├── REFERENCE.md      (optional - detailed documentation)
├── EXAMPLES.md       (optional - comprehensive examples)
└── README.md         (optional - skill overview)
```

### Complete Structure

```
my-skill/
├── SKILL.md          (required - main instructions)
├── REFERENCE.md      (optional - complete reference)
├── EXAMPLES.md       (optional - real-world examples)
├── README.md         (optional - overview and installation)
├── CHANGELOG.md      (optional - version history)
├── scripts/          (optional - utility scripts)
│   ├── README.md
│   ├── process.sh
│   ├── validate.py
│   └── format.js
├── templates/        (optional - file templates)
│   ├── config.yaml
│   ├── template.json
│   └── boilerplate.ts
├── docs/             (optional - additional documentation)
│   ├── api.md
│   ├── configuration.md
│   └── troubleshooting.md
└── tests/            (optional - test fixtures)
    ├── fixtures/
    └── test-data.json
```

### Directory Guidelines

**scripts/ Directory:**
- Must be executable: `chmod +x scripts/*.sh`
- Include README.md explaining each script
- Support `--help` flag
- Follow project conventions (Bash, Python, Node.js)

**templates/ Directory:**
- Configuration templates
- Code scaffolding templates
- File structure examples
- Should be self-documenting with comments

**docs/ Directory:**
- API documentation
- Configuration guides
- Troubleshooting guides
- Integration examples

**tests/ Directory:**
- Test fixtures
- Sample data
- Integration test examples
- Not executed automatically (documentation only)

## File Naming Conventions

### Required Files

**SKILL.md** (required)
- Must be exactly `SKILL.md` (case-sensitive)
- Contains frontmatter and main instructions
- Keep under 500 lines via progressive disclosure
- Primary file Claude reads

### Optional Supporting Files

**Standard names (recommended):**
- `REFERENCE.md` - Detailed reference documentation
- `EXAMPLES.md` - Comprehensive examples
- `README.md` - Skill overview and setup
- `CHANGELOG.md` - Version history
- `LICENSE.md` - License text

**Custom files:**
- Use descriptive names: `api-guide.md`, `configuration.md`
- Reference from SKILL.md
- Keep organized in subdirectories

### Script Naming

```
scripts/
├── process-data.sh      (kebab-case)
├── validate-input.py    (kebab-case)
├── format-output.js     (kebab-case)
└── helper-utils.sh      (kebab-case)
```

**Rules:**
- Lowercase, kebab-case
- Descriptive names
- Include file extension
- Executable permissions

### Template Naming

```
templates/
├── config.yaml          (lowercase)
├── api-template.json    (kebab-case)
├── component.tsx        (actual file extension)
└── docker-compose.yml   (lowercase with hyphens)
```

## Progressive Disclosure

### Principle

Keep `SKILL.md` focused and under 500 lines by referencing supporting files for details.

### Why Progressive Disclosure

**Benefits:**
- Faster skill loading and processing
- Clearer primary instructions
- Better organization
- Easier maintenance
- Reduced token usage

**Token Impact:**
- SKILL.md loaded automatically (counts toward context)
- Supporting files loaded on-demand (only when referenced)
- Claude requests additional files as needed

### Pattern: Main + Reference

**SKILL.md** (~300 lines):

```markdown
# Quick Start
Basic usage instructions

# Common Operations
Most frequent use cases

# Advanced
See [REFERENCE.md](REFERENCE.md) for:
- Complete API documentation
- Configuration options
- Advanced patterns
```

**REFERENCE.md** (~800 lines):

```markdown
# Complete API Reference
All functions, options, configurations

# Advanced Configuration
Detailed setup and customization

# Integration Guides
Integration with other tools
```

### Pattern: Main + Examples

**SKILL.md** (~250 lines):

```markdown
# Basic Example
Simple usage case

# Common Patterns
3-4 most common scenarios

# More Examples
See [EXAMPLES.md](EXAMPLES.md) for:
- Real-world use cases
- Edge cases
- Complex workflows
```

**EXAMPLES.md** (~600 lines):

```markdown
# Simple Examples
10-15 basic examples

# Advanced Examples
Complex, multi-step examples

# Real-World Case Studies
Actual project implementations
```

### Pattern: Main + Scripts

**SKILL.md** (~200 lines):

```markdown
# Usage
Basic instructions

# Helper Scripts
Run utility scripts:

```bash
# Process input file
./scripts/process.sh input.txt

# Validate configuration
./scripts/validate.py config.yaml

# Format output
./scripts/format.js results.json
```

See [scripts/README.md](scripts/README.md) for script documentation.

```

**scripts/README.md** (~400 lines):
```markdown
# Scripts Overview
Purpose and usage of each script

# process.sh
Detailed documentation for process.sh

# validate.py
Detailed documentation for validate.py
```

### Best Practices

**Do:**
- Keep SKILL.md under 500 lines
- Use clear section headers
- Link to supporting files with context
- Organize by frequency of use (common → advanced)

**Don't:**
- Put everything in SKILL.md
- Duplicate content across files
- Create unnecessary files (only when needed)
- Deep directory nesting (max 2-3 levels)

## Skill Discovery Mechanisms

### How Claude Discovers Skills

1. **Description Matching**: Claude reads skill descriptions
2. **Keyword Triggers**: Matches user input against trigger keywords
3. **Context Analysis**: Determines skill relevance to current task
4. **Activation Decision**: Autonomously decides to load skill

### Discovery Optimization

**1. Include User-Facing Terms**

```yaml
# ✅ Good (user terms)
description: >
  Process PDF files, extract text and tables, fill forms.
  Use when working with PDF documents.

# ❌ Bad (technical terms only)
description: >
  Implements PDF parsing using pypdf library with form-filling capability.
```

**2. Add File Extensions**

```yaml
description: >
  Parse and validate JSON files (.json) including schema validation.
  Use when working with JSON data or configuration files.
```

**3. Include Action Verbs**

```yaml
description: >
  Test, validate, and debug REST APIs. Create test suites, check responses,
  generate reports. Use when testing APIs or validating endpoints.
```

**4. Mention Related Concepts**

```yaml
description: >
  Analyze Excel spreadsheets (.xlsx, .xls), create pivot tables, generate
  charts, perform calculations. Use when working with Excel, spreadsheets,
  or tabular data analysis.
```

### Trigger Keyword Categories

**File Types:**
- `.pdf`, `.json`, `.xlsx`, `.csv`
- `PDF file`, `JSON data`, `spreadsheet`

**Actions:**
- `parse`, `validate`, `test`, `analyze`, `generate`, `format`
- `process`, `extract`, `transform`, `convert`

**Domains:**
- `API`, `database`, `spreadsheet`, `document`
- `git`, `version control`, `deployment`

**User Intent:**
- `when working with`, `when testing`, `when analyzing`
- `when user mentions`, `triggered by`

### Testing Discovery

**Method 1: Natural Language**

```
# Say to Claude:
"Can you help me process this PDF file?"

# Should trigger PDF-related skill
```

**Method 2: Debug Mode**

```bash
claude --debug

# Look for:
# "Considering skill: pdf-processor"
# "Activated skill: pdf-processor"
```

**Method 3: Explicit Mention**

```
# Say to Claude:
"Use the PDF processing skill to extract text"

# More likely to trigger correct skill
```

## Tool Restrictions

### Purpose of Tool Restrictions

**Benefits:**
1. **Safety**: Prevent accidental modifications
2. **Performance**: Skip permission prompts
3. **Clarity**: Explicit about capabilities
4. **Reliability**: Predictable behavior

### Restriction Patterns

#### Read-Only Skills

```yaml
allowed-tools: Read, Grep, Glob
```

**Use cases:**
- Code analysis
- Documentation review
- Security audits
- Quality checks

**Example:**

```yaml
---
name: code-reviewer
description: Review code for best practices and potential issues
allowed-tools: Read, Grep, Glob
---
```

#### Safe Modification Skills

```yaml
allowed-tools: Read, Edit, Write
```

**Use cases:**
- Formatting
- Refactoring
- Code generation
- File updates

#### Git Workflow Skills

```yaml
allowed-tools: Read, Write, Bash(git *)
```

**Use cases:**
- Branch management
- Commit creation
- PR workflows
- Repository analysis

#### Testing Skills

```yaml
allowed-tools: Read, Write, Bash(bun test:*), Bash(npm test:*)
```

**Use cases:**
- Test generation
- Test execution
- Coverage analysis
- Test reporting

#### Complete Development Skills

```yaml
allowed-tools: Read, Edit, Write, Bash(git *), Bash(bun *), Bash(npm *)
```

**Use cases:**
- Feature implementation
- Full development workflows
- CI/CD operations
- Project setup

### Bash Pattern Syntax

**Wildcards:**

```yaml
# Allow all git commands
Bash(git *)

# Allow all npm commands
Bash(npm *)

# Allow multiple command families
Bash(git *), Bash(npm *), Bash(bun *)
```

**Specific Commands:**

```yaml
# Allow specific git operations
Bash(git add:*), Bash(git commit:*), Bash(git push:*)

# Allow specific npm scripts
Bash(npm run build:*), Bash(npm run test:*)
```

**Restrictive Patterns:**

```yaml
# Only read-only git commands
Bash(git status:*), Bash(git log:*), Bash(git diff:*)

# Only safe file operations
Bash(cat:*), Bash(head:*), Bash(tail:*)
```

### Tool Name Reference

**Standard Tools:**
- `Read` - Read files
- `Write` - Write new files
- `Edit` - Edit existing files
- `Grep` - Search file contents
- `Glob` - Find files by pattern
- `Bash` - Execute bash commands
- `WebFetch` - Fetch web content
- `WebSearch` - Search the web

**MCP Tools:**

```yaml
# Format: mcp__servername__toolname
allowed-tools: mcp__memory__store, mcp__memory__retrieve
allowed-tools: mcp__linear__create_issue, mcp__linear__update_issue
```

### Inheritance Behavior

**Without allowed-tools:**
- Skill inherits conversation's tool permissions
- Claude may ask for permission for new tools
- User controls via `/permissions`

**With allowed-tools:**
- Only specified tools allowed without asking
- Other tools blocked or require permission
- Overrides conversation settings for this skill

## Integration with Commands

### Skills in Command Context

Skills can be referenced or triggered from slash commands:

**Method 1: Reference Skill Expertise**

`.claude/commands/analyze-pdf.md`:

```markdown
---
description: Analyze PDF file using PDF processing skill
---

# PDF Analysis

For this task, use the PDF processing skill to:
1. Extract text from the PDF
2. Identify tables and structure
3. Generate summary

File to analyze: $1
```

**Method 2: Explicit Skill Invocation**

```markdown
---
description: Use specialized skill for complex task
---

# Complex Analysis

This task requires the data-analysis skill. Activate it to:
- Load and parse data
- Perform statistical analysis
- Generate visualizations

The data-analysis skill has the necessary tools and expertise.
```

### Commands Triggering Skills

When a slash command is complex enough, Claude may automatically activate relevant skills:

```bash
# User runs:
/analyze-excel sales-data.xlsx

# Claude:
# 1. Reads slash command
# 2. Recognizes Excel analysis task
# 3. Automatically activates excel-analysis skill
# 4. Uses skill's expertise to complete command
```

### Coordination Pattern

**Command** (user-facing entry point):
- Clear, specific user instruction
- Simple argument passing
- Delegates to skills as needed

**Skill** (implementation):
- Complex logic and workflows
- Tool execution
- Reusable across commands

**Example:**

`.claude/commands/test-api.md`:

```markdown
---
description: Test API endpoint
argument-hint: <url>
---

Test the API endpoint: $1

Use the api-testing skill to perform comprehensive testing.
```

`.claude/skills/api-testing/SKILL.md`:

```yaml
---
name: api-testing
description: Test REST APIs with validation and reporting
allowed-tools: Bash(curl:*), Write
---

# API Testing

[Detailed testing implementation]
```

## Integration with Hooks

### Skills in Hook Context

Hooks can trigger skill usage or benefit from skill capabilities:

**PostToolUse Hook Example:**

`.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)|Edit(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Use the typescript-linter skill to check this file'"
          }
        ]
      }
    ]
  }
}
```

**Skill Activated by Hook:**

When the hook runs, Claude sees the suggestion and may activate the typescript-linter skill automatically.

### Skill-Aware Hooks

Design hooks that work well with skills:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Consider using code-review skill for final review'"
          }
        ]
      }
    ]
  }
}
```

## Personal vs Project vs Plugin Skills

### Personal Skills (`~/.claude/skills/`)

**Characteristics:**
- User-specific
- Available across all projects
- Not shared with team
- Personal preferences and workflows

**Use cases:**
- Individual coding style preferences
- Personal productivity tools
- Custom analysis workflows
- Experimental skills

**Example:**

```
~/.claude/skills/
├── my-code-style/
│   └── SKILL.md
└── personal-notes/
    └── SKILL.md
```

### Project Skills (`.claude/skills/`)

**Characteristics:**
- Team-shared via git
- Project-specific
- Committed to repository
- Team conventions and workflows

**Use cases:**
- Project-specific workflows
- Team coding standards
- Domain-specific tools
- CI/CD integration

**Example:**

```
.claude/skills/
├── project-testing/
│   └── SKILL.md
└── deployment/
    └── SKILL.md
```

**Git Integration:**

```bash
# Commit project skills
git add .claude/skills/
git commit -m "feat: add project testing skill"
git push
```

### Plugin Skills

**Characteristics:**
- Distributed via plugins
- Available when plugin installed
- Managed through plugin system
- Updated via plugin updates

**Use cases:**
- Reusable across projects
- Marketplace distribution
- Standardized tools
- Third-party integrations

**Structure:**

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── skill-one/
│   │   └── SKILL.md
│   └── skill-two/
│       └── SKILL.md
└── commands/
```

### Precedence and Overriding

**Loading order:**
1. Plugin skills (if installed)
2. Project skills (`.claude/skills/`)
3. Personal skills (`~/.claude/skills/`)

**Name conflicts:**
- Project skills override personal skills with same name
- Explicit namespacing: Use unique, descriptive names

**Best practice:**

```
# Personal: my-code-style
# Project: team-code-style
# Plugin: plugin-name-code-style
```

## Advanced Patterns

### Multi-Step Workflows

```yaml
---
name: feature-workflow
description: Complete feature development workflow from planning to deployment
allowed-tools: Read, Edit, Write, Bash(git *), Bash(bun *)
---

# Feature Development Workflow

## Step 1: Planning
- Review requirements
- Create implementation plan
- Identify dependencies

## Step 2: Implementation
- Generate code structure
- Implement features
- Add error handling

## Step 3: Testing
- Generate tests
- Run test suite
- Verify coverage

## Step 4: Documentation
- Update README
- Add API docs
- Update changelog

## Step 5: Git Workflow
- Create commit
- Push branch
- Open PR
```

### Conditional Logic Skills

```yaml
---
name: smart-deploy
description: Intelligent deployment with environment detection and validation
allowed-tools: Bash(*), Read
---

# Smart Deployment

## Environment Detection
1. Detect current environment (dev/staging/prod)
2. Determine appropriate deployment strategy
3. Run environment-specific validations

## Conditional Execution
- **Development**: Quick deploy, skip extensive tests
- **Staging**: Full test suite, validation checks
- **Production**: Manual approval, health checks, rollback plan

## Validation Rules
[Environment-specific validation logic]
```

### Skill Composition

**Main Skill delegates to other skills:**

```yaml
---
name: full-code-review
description: Comprehensive code review using multiple specialized skills
allowed-tools: Read, Grep, Glob
---

# Full Code Review

## Review Components

1. **Security Review**: Use security-audit skill
2. **Performance Review**: Use performance-analyzer skill
3. **Style Review**: Use code-style-checker skill
4. **Test Coverage**: Use test-coverage-analyzer skill

## Consolidated Report
Combine findings from all specialized reviews.
```

### Template-Based Skills

```yaml
---
name: component-generator
description: Generate React components from templates
allowed-tools: Read, Write
---

# Component Generator

## Templates
Located in `templates/` directory:
- `component.tsx` - Basic component
- `component-with-props.tsx` - Component with props interface
- `component-with-hooks.tsx` - Component with React hooks

## Generation Process
1. Select appropriate template
2. Substitute placeholders with actual names
3. Create component file
4. Create test file
5. Update exports
```

### Data Pipeline Skills

```yaml
---
name: data-pipeline
description: Multi-stage data processing pipeline
allowed-tools: Bash(*), Read, Write
---

# Data Pipeline

## Stage 1: Extraction
Extract data from source:
```bash
./scripts/extract.sh source.json raw-data.json
```

## Stage 2: Transformation

Transform data:

```bash
./scripts/transform.py raw-data.json transformed-data.json
```

## Stage 3: Validation

Validate transformed data:

```bash
./scripts/validate.sh transformed-data.json
```

## Stage 4: Loading

Load into destination:

```bash
./scripts/load.sh transformed-data.json
```

```

## Performance Optimization

### Skill Size Optimization

**Keep SKILL.md small:**
- Under 500 lines ideal
- Use progressive disclosure
- Reference external files
- Impacts context loading time

**Token usage:**
```

SKILL.md (300 lines) ≈ 2,000 tokens
SKILL.md (1,500 lines) ≈ 10,000 tokens

Difference: 8,000 tokens saved per skill activation

```

### Description Optimization

**Concise but complete:**
```yaml
# ❌ Too long (150 words)
description: >
  This skill provides comprehensive capabilities for processing various types
  of PDF documents including text extraction, table detection, form filling,
  document merging, page manipulation, and metadata editing. It supports
  multiple PDF versions and can handle encrypted files. The skill integrates
  with various PDF libraries and provides both programmatic and command-line
  interfaces. It can be used for document automation, data extraction, form
  processing, and document management workflows. [continues...]

# ✅ Concise (30 words)
description: >
  Extract text and tables from PDFs, fill forms, merge documents. Use when
  working with PDF files, forms, or document extraction. Supports encrypted
  PDFs and multiple versions.
```

### Tool Restriction Benefits

**Without restrictions:**
- Claude asks permission for each tool
- User must approve/deny
- Slower execution
- More interruptions

**With restrictions:**

```yaml
allowed-tools: Read, Grep, Glob
```

- No permission prompts for listed tools
- Faster execution
- Smoother workflow
- Clear intent

### Caching Strategy

**Skill loading:**
- Claude caches skill information
- Faster on subsequent activations
- Update trigger: File modification

**Force reload:**

```bash
# Clear session to reload skills
/clear
```

## Debugging and Troubleshooting

### Enable Debug Mode

```bash
claude --debug
```

**Output shows:**
- Skill loading: `Loaded skill: skill-name from path`
- Skill errors: `Error loading skill: reason`
- Skill activation: `Considering skill: skill-name`
- Tool restrictions: `Skill allowed-tools: [list]`

### Common Issues

#### Skill Not Loading

**Check 1: File location**

```bash
# Personal
ls -la ~/.claude/skills/my-skill/SKILL.md

# Project
ls -la .claude/skills/my-skill/SKILL.md
```

**Check 2: YAML syntax**

```bash
# Must have opening ---
# Must have closing ---
# No tabs
# Valid YAML
```

**Check 3: File permissions**

```bash
# SKILL.md should be readable
chmod 644 .claude/skills/my-skill/SKILL.md

# Scripts should be executable
chmod +x .claude/skills/my-skill/scripts/*.sh
```

#### Skill Not Activating

**Problem**: Claude doesn't use skill when expected

**Solution 1: Improve description**

```yaml
# Before
description: Helper for files

# After
description: Parse and validate JSON files including schema validation. Use when working with JSON data, .json files, or configuration files. Triggered by mentions of JSON, parsing, or validation.
```

**Solution 2: Add trigger keywords**

```yaml
description: >
  [What it does]. Use when [context]. Triggered by mentions of
  [keyword1], [keyword2], [keyword3], or [user terms].
```

**Solution 3: Explicit mention**

```
# Instead of:
"Process this JSON file"

# Try:
"Use the JSON processing skill to parse and validate this file"
```

#### Tool Permission Errors

**Problem**: Skill can't use required tools

**Check 1: Tool names (case-sensitive)**

```yaml
# ✅ Correct
allowed-tools: Read, Grep, Glob

# ❌ Wrong
allowed-tools: read, grep, glob
```

**Check 2: Bash patterns**

```yaml
# ✅ Correct
allowed-tools: Bash(git *)

# ❌ Wrong
allowed-tools: Bash(git)
```

**Check 3: MCP tool names**

```yaml
# ✅ Correct
allowed-tools: mcp__memory__store

# ❌ Wrong
allowed-tools: mcp_memory_store
```

#### Script Execution Errors

**Problem**: Scripts don't run

**Check 1: Executable permission**

```bash
chmod +x .claude/skills/my-skill/scripts/*.sh
```

**Check 2: Script paths**

```markdown
# ✅ Correct (relative to skill directory)
./scripts/process.sh

# ❌ Wrong (absolute path)
/Users/me/.claude/skills/my-skill/scripts/process.sh
```

**Check 3: Script shebang**

```bash
#!/usr/bin/env bash  # ✅ Portable
#!/bin/bash          # ✅ Works on most systems
#!/usr/bin/sh        # ✅ POSIX compatible

# ❌ May not work on all systems
#!/usr/local/bin/bash
```

### Validation Tools

**Use validation script:**

```bash
./scripts/validate-skill.sh .claude/skills/my-skill
```

**Manual validation:**

```bash
# Check YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.claude/skills/my-skill/SKILL.md').read().split('---')[1])"

# Check file structure
tree .claude/skills/my-skill

# Test script execution
.claude/skills/my-skill/scripts/test.sh --help
```

### Testing Checklist

- [ ] Skill loads without errors (`claude --debug`)
- [ ] YAML frontmatter valid
- [ ] Description specific with trigger keywords
- [ ] Tool restrictions appropriate
- [ ] Scripts executable and have --help
- [ ] Supporting files referenced correctly
- [ ] Activates on natural language trigger
- [ ] Tool permissions work as expected
- [ ] Progressive disclosure links work
- [ ] Version tracked if specified

## See Also

- [SKILL.md](SKILL.md) - Main skill authoring guide
- [EXAMPLES.md](EXAMPLES.md) - Real-world skill examples
- [scripts/scaffold-skill.sh](scripts/scaffold-skill.sh) - Create new skills
- [scripts/validate-skill.sh](scripts/validate-skill.sh) - Validate existing skills
