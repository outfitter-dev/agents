---
name: claude-agent-validation
version: 1.0.0
description: Validates and reviews Claude Code agents against best practices. Checks YAML syntax, naming conventions, description quality, system prompt effectiveness, and tool configuration. Provides improvement suggestions and optionally applies fixes. Use when validating agents, reviewing agent quality, checking agents before commit, or when `--validate-agent` is mentioned.
tools: Read, Edit, Grep, Glob, Skill, TodoWrite
---

# Claude Agent Validation

Validate and review Claude Code agents against best practices and quality standards. Combines validation (catch errors) and review (suggest improvements) in one pass.

## Quick Start

1. Locate the agent file to check
2. Run validation checks (YAML, naming, description, tools, model)
3. Run review checks (prompt quality, clarity, effectiveness)
4. Report findings with specific fixes
5. Optionally apply improvements

## Instructions

### Step 1: Locate and Read the Agent

```bash
# User agents
~/.claude/agents/[agent-name].md

# Project agents
.claude/agents/[agent-name].md
```

Use Read to examine:
- Complete agent file
- YAML frontmatter
- System prompt content

### Step 2: Create Validation Checklist

Use TodoWrite to track validation phases. Expand as you discover issues.

<initial_todo_template>

- [ ] Locate and read agent file
- [ ] Validate YAML frontmatter syntax
- [ ] Check naming conventions
- [ ] Evaluate description quality
- [ ] Review system prompt effectiveness
- [ ] Validate tool configuration
- [ ] Check model configuration
- [ ] { expand: per-issue todos as discovered }
- [ ] Generate validation report
- [ ] Propose fixes for critical issues

</initial_todo_template>

**Todo discipline**: Mark `in_progress` as you start each check. Mark `completed` immediately when done. Add specific issue todos as you find problems (e.g., "Fix missing trigger keywords in description").

### Step 2b: Load Related Skills (Optional)

For comprehensive validation, load the authoring skill for reference patterns:

```
Skill tool: agent-kit:claude-agent-authoring
```

This provides detailed guidance on frontmatter schema, tool patterns, and description quality. See especially:
- `references/frontmatter.md` - Field requirements
- `references/tools.md` - Tool configuration patterns
- `references/todowrite.md` - TodoWrite usage patterns

### Step 3: Run Validation Checks

#### A. YAML Frontmatter

**Required Fields**:
- [ ] `name` present and non-empty
- [ ] `description` present and non-empty

**Syntax**:
- [ ] Opens with `---` on line 1
- [ ] Closes with `---` before content
- [ ] Uses spaces (not tabs) for indentation
- [ ] Special characters quoted if needed

**Optional Fields**:
- [ ] `tools` (if present) uses comma-separated valid tool names
- [ ] `model` (if present) is `sonnet`, `opus`, `haiku`, or `inherit`
- [ ] `color` (if present) is a valid color name

#### B. Naming Conventions

- [ ] Uses kebab-case (lowercase-with-hyphens)
- [ ] Follows `[role]-[specialty]` or `[specialty]` pattern
- [ ] Is specific, not generic
- [ ] Is concise (1-3 words, max 4)
- [ ] Matches filename (without .md extension)

**Good**: `code-reviewer`, `test-runner`, `debugger`
**Bad**: `helper`, `my-agent`, `the-best-agent`

#### C. Description Quality

**Structure**:
- [ ] WHAT: Explains what the agent does
- [ ] WHEN: States when to invoke it
- [ ] TRIGGERS: Includes 3-5 trigger keywords

**Quality**:
- [ ] Specific about agent's purpose
- [ ] Notes proactive invocation if applicable ("use PROACTIVELY")
- [ ] Clear about scope

**Anti-patterns**:
- "Helps with code" - Too vague
- No trigger conditions - Unclear when it activates
- Missing keywords - Won't be invoked automatically

#### D. System Prompt Quality

**Structure**:
- [ ] Has clear role definition
- [ ] Describes what happens when invoked
- [ ] Provides step-by-step process
- [ ] Includes key practices or guidelines
- [ ] Specifies output format

**Quality**:
- [ ] Specific and actionable instructions
- [ ] Includes concrete examples or checklists
- [ ] Sets clear constraints (what NOT to do)
- [ ] Appropriate detail level
- [ ] Single responsibility focus

**Anti-patterns**:
- "You are helpful" - Too vague
- No process - Doesn't explain approach
- Missing constraints - No boundaries
- No examples - Abstract without concrete guidance
- Scope creep - Trying to do too many things

#### E. Tool Configuration

**Field syntax**:
- [ ] Field name is `tools:` (not `allowed-tools:` or other variants)
- [ ] Comma-separated list of tool names
- [ ] Tool names case-sensitive and correctly spelled

**Valid tool formats**:

```yaml
# Basic tools
tools: Read, Write, Edit, Bash, Glob, Grep, Skill, Task, TodoWrite

# Pattern restrictions (command family)
tools: Bash(git *), Bash(npm *)

# Pattern restrictions (specific subcommand)
tools: Bash(git status:*), Bash(git diff:*)

# File path patterns
tools: Write(tests/**), Write(src/**/*.ts)

# MCP tools
tools: mcp__server__tool, mcp__github__*
```

**Validation checks**:
- [ ] All tool names are valid Claude Code tools
- [ ] Pattern syntax is correct: `Tool(pattern)`
- [ ] Patterns use valid glob syntax
- [ ] Tools appropriate for agent's purpose

**Common patterns**:
- Read-only: `Glob, Grep, Read, Skill, Task, TodoWrite`
- Read-only + git: `Glob, Grep, Read, Skill, Task, TodoWrite, Bash(git show:*), Bash(git diff:*)`
- Full access: (omit field to inherit all)
- Research: `Glob, Grep, Read, Skill, Task, TodoWrite, WebSearch, WebFetch`

**Anti-patterns**:
- `allowed-tools:` — wrong field name
- Missing baseline tools (Skill, Task, TodoWrite)
- Over-restricting without reason

See **agent-kit:claude-agent-authoring** `references/tools.md` for detailed patterns.

#### F. Model Configuration

**If `model` field present**:
- [ ] Value is valid: `sonnet`, `opus`, `haiku`, or `inherit`
- [ ] Choice appropriate for task complexity

### Step 4: Run Review Checks

After validation passes, review for improvements:

#### Effectiveness

- Is the agent's purpose crystal clear?
- Would it be invoked at the right times?
- Does the prompt guide behavior effectively?

#### Conciseness

- Is the system prompt focused?
- Could instructions be clearer with fewer words?
- Are there redundant sections?

#### Clarity

- Are instructions step-by-step and actionable?
- Are examples concrete and helpful?
- Would another person understand the agent's role?

### Step 5: Generate Report

```markdown
# Agent Validation Report: [Agent Name]

## Summary
- **Status**: PASS / FAIL / WARNINGS
- **Location**: [path]
- **Issues**: [count critical] / [count warnings]

## Validation Results

### YAML Frontmatter
[Status and details]

### Naming Conventions
[Status and details]

### Description Quality
[Status and details]

### System Prompt
[Status and details]

### Tool Configuration
[Status and details]

### Model Configuration
[Status and details]

## Critical Issues (must fix)
1. [Issue with specific fix]

## Warnings (should fix)
1. [Issue with specific fix]

## Improvement Suggestions
1. [Suggestion with before/after]

## Strengths
- [What's done well]
```

### Step 6: Provide Specific Fixes

For each issue:
1. **Current**: What it is now
2. **Problem**: Why it's an issue
3. **Fix**: Specific improvement
4. **Impact**: How it helps

#### Example Fix: Vague Description

**Current**:

```yaml
description: Helps with debugging
```

**Problem**: Too vague, no trigger keywords

**Fix**:

```yaml
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
```

**Impact**: Specific purpose, trigger keywords, proactive invocation.

#### Example Fix: Vague System Prompt

**Current**:

```markdown
You are a helpful debugging assistant.
```

**Problem**: No process, no specifics

**Fix**:

```markdown
You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works
```

**Impact**: Clear process, actionable steps.

### Step 7: Apply Fixes (Optional)

Ask before making changes:

```
Found [N] issues:
- [Critical issues]
- [Warnings]
- [Suggestions]

Would you like me to apply these fixes?
```

If approved, use Edit to make changes.

## Status Levels

- **PASS**: No issues
- **WARNINGS**: Non-critical issues that should be fixed
- **FAIL**: Critical issues that must be fixed

## Priority Levels

**Critical (must fix)**:
- Invalid YAML syntax
- Missing required fields
- Unclear agent purpose

**Important (should fix)**:
- Vague descriptions
- Poor naming
- Missing process in prompt
- No trigger keywords

**Nice-to-have**:
- Additional examples
- Better organization
- Enhanced documentation

## Troubleshooting

```bash
# Find agent files
ls ~/.claude/agents/*.md
ls .claude/agents/*.md

# Search by name
find ~/.claude/agents .claude/agents -name "*.md" 2>/dev/null

# Check for tabs
grep -P "\t" ~/.claude/agents/agent-name.md

# View frontmatter
head -n 20 ~/.claude/agents/agent-name.md
```

## Integration

**After creating an agent**:

```
agent-kit:claude-agent-authoring → agent-kit:claude-agent-validation → iterate until passing
```

**Before committing**:

```
agent-kit:claude-agent-validation → fix critical issues → commit
```

## Related Skills

- **agent-kit:claude-agent-authoring** — Create agents (use before validation)
- **agent-kit:claude-skill-authoring** — Create skills (different from agents)
