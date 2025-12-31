---
name: skill-validation
version: 1.0.0
description: Validates and reviews skills against the Agent Skills specification. Checks YAML syntax, naming conventions, description quality, file structure, and best practices. Provides improvement suggestions with before/after examples and optionally applies fixes. Use when validating skills, reviewing skill quality, checking skills before commit, or when `--check-skill`, `--validate-skill`, or `--review-skill` is mentioned.
allowed-tools: Read Edit Grep Glob TodoWrite
---

# Skill Validation

Validate and review skills against the [Agent Skills specification](https://agentskills.io/specification). Combines validation (catch errors) and review (suggest improvements) in one pass.

## Quick Start

1. Locate the skill to check
2. Run validation checks (syntax, structure, requirements)
3. Run review checks (discoverability, clarity, conciseness)
4. Report findings with specific fixes
5. Optionally apply improvements

## Instructions

### Step 1: Locate and Read the Skill

```bash
# Personal skills
~/.claude/skills/[skill-name]/SKILL.md

# Project skills
.claude/skills/[skill-name]/SKILL.md
```

Use Read to examine:
- SKILL.md content (especially YAML frontmatter)
- Supporting files (if any)
- Directory structure

### Step 2: Create Validation Checklist

Use TodoWrite to track validation and review items. This ensures thorough coverage and shows progress.

### Step 3: Run Validation Checks

#### A. YAML Frontmatter

**Required Fields**:
- [ ] `name` present and non-empty
- [ ] `description` present and non-empty

**Syntax**:
- [ ] Opens with `---` on line 1
- [ ] Closes with `---` before Markdown content
- [ ] Uses spaces (not tabs) for indentation
- [ ] Special characters quoted if needed

**Optional Fields** (if present):
- [ ] `allowed-tools` uses space-delimited tool names
- [ ] `license`, `compatibility`, `metadata` properly formatted

#### B. Naming Conventions

- [ ] Lowercase letters, numbers, hyphens only
- [ ] 1-64 characters
- [ ] Must match parent directory name
- [ ] No `--` or leading/trailing hyphens
- [ ] Cannot contain `anthropic` or `claude`
- [ ] Capability-focused (not agent-focused like `-agent`, `-helper`)

#### C. Description Quality

**Structure**:
- [ ] WHAT: Explains capabilities
- [ ] WHEN: States trigger conditions ("Use when...")
- [ ] TRIGGERS: Includes 3-5 keywords users would mention

**Voice**:
- [ ] Uses third-person (not "I can" or "you can")
- [ ] Within 1024 character limit

**Anti-patterns**:
- ❌ "Helps with files" → Too vague
- ❌ "I can help you..." → First-person
- ❌ "You can use this to..." → Second-person
- ❌ "An agent that..." → Agent-focused

#### D. File Structure

- [ ] SKILL.md exists
- [ ] All referenced files exist
- [ ] File paths use forward slashes
- [ ] Directory structure is logical (`references/`, `scripts/`, `assets/`)

#### E. Best Practices

- [ ] SKILL.md body under 500 lines
- [ ] Has Instructions section
- [ ] Has Examples section (recommended)
- [ ] Examples are concrete and runnable
- [ ] Single responsibility (one focused capability)
- [ ] Progressive disclosure (details in supporting files)
- [ ] Assumes Claude knows common concepts

### Step 4: Run Review Checks

After validation passes, review for improvements:

#### Discoverability

- Is description maximally discoverable?
- Are trigger keywords comprehensive?
- Would Claude know when to activate?

#### Conciseness

- Does each paragraph justify its token cost?
- Could details move to supporting files?
- Is there over-explanation of common concepts?

#### Clarity

- Are instructions step-by-step and actionable?
- Are examples concrete and runnable?
- Is the structure logical and scannable?

### Step 5: Generate Report

```markdown
# Skill Check Report: [Skill Name]

## Summary
- **Status**: PASS / FAIL / WARNINGS
- **Location**: [path]
- **Issues**: [count critical] / [count warnings]

## Validation Results

### YAML Frontmatter
✅ | ❌ | ⚠️ [Status and details]

### Naming Conventions
✅ | ❌ | ⚠️ [Status and details]

### Description Quality
✅ | ❌ | ⚠️ [Status and details]

### File Structure
✅ | ❌ | ⚠️ [Status and details]

### Best Practices
✅ | ❌ | ⚠️ [Status and details]

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

For each issue, show:
1. **Current**: What it is now
2. **Problem**: Why it's an issue
3. **Fix**: Specific improvement
4. **Impact**: How it helps

#### Example Fix: Vague Description

**Current**:

```yaml
description: Helps with PDF files
```

**Problem**: Too vague, no triggers, missing capabilities

**Fix**:

```yaml
description: Extracts text and tables from PDF files, fills forms, merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Impact**: Specific capabilities, trigger conditions, discoverable keywords.

#### Example Fix: Wrong Voice

**Current**:

```yaml
description: I can help you process data files and convert formats
```

**Problem**: First-person voice; descriptions inject into system prompt

**Fix**:

```yaml
description: Processes data files and converts between formats (CSV, JSON, XML). Use when working with data files or format conversion.
```

**Impact**: Third-person voice, specific formats, trigger conditions.

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

- **✅ PASS**: No issues
- **⚠️ WARNINGS**: Non-critical issues that should be fixed
- **❌ FAIL**: Critical issues that must be fixed

## Priority Levels

**Critical (must fix)**:
- Invalid YAML syntax
- Missing required fields
- Broken file references

**Important (should fix)**:
- Vague descriptions
- Wrong voice (first/second person)
- Missing trigger keywords
- Poor naming

**Nice-to-have**:
- Additional examples
- Better organization
- Enhanced documentation

## Troubleshooting

```bash
# Find all skills
find ~/.claude/skills .claude/skills -name "SKILL.md" 2>/dev/null

# Check for tabs in YAML
grep -P "\t" SKILL.md

# Find broken links
grep -oE '\[[^]]+\]\([^)]+\)' SKILL.md | while read link; do
  file=$(echo "$link" | sed 's/.*(\(.*\))/\1/')
  [ ! -f "$file" ] && echo "Missing: $file"
done

# View raw frontmatter
head -n 15 SKILL.md
```

## Integration

**After creating a skill**:

```
skills-authoring → skill-validation → iterate until passing
```

**Before committing**:

```
skill-validation → fix critical issues → commit
```

## Reference

For cross-tool compatibility and implementation details, see:
- [Agent Skills Specification](https://agentskills.io/specification)
- [skills-authoring references](../skills-authoring/references/)
