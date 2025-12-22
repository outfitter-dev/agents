# Skills Suite Integration Plan

## Overview

This document provides a step-by-step plan to migrate seven existing user skills into the Agentish toolkit plugin. Based on the analysis in [ANALYSIS.md](ANALYSIS.md), we're migrating proven, production-ready skills rather than building from SPEC.md.

---

## Migration Strategy

### Phased Approach

**Phase 1: Core Skill Lifecycle** (Days 1-3)
- Skill authoring, validation, and review
- Highest impact, most frequently used
- Foundation for other skills

**Phase 2: Agent Lifecycle** (Days 4-5)
- Agent authoring and validation
- Complements skill lifecycle
- Separate domain with distinct needs

**Phase 3: Discovery & Tooling** (Days 6-7)
- Skill discovery, flag listing
- Supporting infrastructure
- Enhances discoverability

**Phase 4: Testing & Documentation** (Days 8-10)
- End-to-end testing
- Documentation updates
- Migration guide for users

---

## Phase 1: Core Skill Lifecycle

### Skills to Migrate
1. `skills-authoring` (was `agent-skills-authoring`)
2. `skill-validation` (was `agent-skill-validation`)
3. `skill-review` (was `agent-skill-review`)

### Directory Structure

```
plugins/toolkit/
├── skills/
│   ├── skills-authoring/
│   │   ├── SKILL.md
│   │   ├── templates/
│   │   │   ├── simple-skill.md
│   │   │   ├── tool-restricted-skill.md
│   │   │   ├── multi-file-skill.md
│   │   │   └── script-based-skill.md
│   │   ├── examples/
│   │   │   ├── commit-message-generation.md
│   │   │   ├── code-review.md
│   │   │   └── pdf-processing.md
│   │   └── scripts/
│   │       └── audit-skill-flags.sh
│   │
│   ├── skill-validation/
│   │   └── SKILL.md
│   │
│   └── skill-review/
│       └── SKILL.md
│
└── references/
    └── skill-validation/
        ├── yaml-schema.md
        ├── description-guidelines.md
        ├── naming-conventions.md
        └── best-practices-checklist.md
```

### Migration Steps

#### Step 1.1: Create Shared Validation References

**Action**: Extract validation docs from user skill to shared location

**Source**: `~/.config/claude/skills/agent-skills-authoring/validation/*.md`

**Target**: `plugins/toolkit/references/skill-validation/*.md`

**Files to Extract**:
```bash
mkdir -p plugins/toolkit/references/skill-validation

# Copy validation docs
cp ~/.config/claude/skills/agent-skills-authoring/validation/yaml-schema.md \
   plugins/toolkit/references/skill-validation/

cp ~/.config/claude/skills/agent-skills-authoring/validation/description-guidelines.md \
   plugins/toolkit/references/skill-validation/

cp ~/.config/claude/skills/agent-skills-authoring/validation/naming-conventions.md \
   plugins/toolkit/references/skill-validation/

cp ~/.config/claude/skills/agent-skills-authoring/validation/best-practices-checklist.md \
   plugins/toolkit/references/skill-validation/
```

**Updates Required**: None (these are standalone reference docs)

---

#### Step 1.2: Migrate `skills-authoring`

**Source**: `~/.config/claude/skills/agent-skills-authoring/`

**Target**: `plugins/toolkit/skills/skills-authoring/`

**Changes Required**:

1. **SKILL.md frontmatter**:
```yaml
# OLD
name: Agent Skill Authoring
description: Creates or updates Claude Code Skills with proper YAML frontmatter, progressive disclosure, and best practices. Supports simple, tool-restricted, multi-file, and script-based Skills. Use when creating new Skills, adding capabilities to Skills, authoring skills, extending Claude's capabilities, or when the user mentions creating a Skill, skill development, or includes `--create-skill` or `--new-skill` flag.

# NEW
name: Skill Authoring
description: Creates or updates Claude Code Skills with proper YAML frontmatter, progressive disclosure, and best practices. Supports simple, tool-restricted, multi-file, and script-based Skills. Use when creating new Skills, adding capabilities to Skills, authoring skills, extending Claude's capabilities, or when `--create-skill` or `--new-skill` flag is included.
```

2. **Update validation references**:
```markdown
# OLD (in SKILL.md)
See [validation/yaml-schema.md](validation/yaml-schema.md)

# NEW
See [../../references/skill-validation/yaml-schema.md](../../references/skill-validation/yaml-schema.md)
```

**Find/Replace Operations**:
```bash
# In SKILL.md
s|validation/yaml-schema.md|../../references/skill-validation/yaml-schema.md|g
s|validation/description-guidelines.md|../../references/skill-validation/description-guidelines.md|g
s|validation/naming-conventions.md|../../references/skill-validation/naming-conventions.md|g
s|validation/best-practices-checklist.md|../../references/skill-validation/best-practices-checklist.md|g

# Update skill name references
s|agent-skills-authoring|skills-authoring|g
s|agent-skill-validation|skill-validation|g
s|agent-skill-review|skill-review|g
```

3. **Migrate supporting files**:
```bash
# Create directory
mkdir -p plugins/toolkit/skills/skills-authoring/{templates,examples,scripts}

# Copy SKILL.md (with updates applied)
# Copy templates
cp -r ~/.config/claude/skills/agent-skills-authoring/templates/* \
   plugins/toolkit/skills/skills-authoring/templates/

# Copy examples
cp -r ~/.config/claude/skills/agent-skills-authoring/examples/* \
   plugins/toolkit/skills/skills-authoring/examples/

# Copy audit script
cp ~/.config/claude/skills/agent-skills-authoring/scripts/audit-skill-flags.sh \
   plugins/toolkit/skills/skills-authoring/scripts/
```

4. **Update audit script paths**:
```bash
# In audit-skill-flags.sh
# Change: SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
# To: SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
# (Adjust to find toolkit root from scripts/)
```

**Test**:
```bash
# Test skill can be read
cat plugins/toolkit/skills/skills-authoring/SKILL.md | head -20

# Test references resolve
# Check that ../../references/skill-validation/*.md exist from skill dir

# Test audit script
bash plugins/toolkit/skills/skills-authoring/scripts/audit-skill-flags.sh --json
```

---

#### Step 1.3: Migrate `skill-validation`

**Source**: `~/.config/claude/skills/agent-skill-validation/`

**Target**: `plugins/toolkit/skills/skill-validation/`

**Changes Required**:

1. **SKILL.md frontmatter**:
```yaml
# OLD
name: Agent Skill Validation
description: Validates Claude Code skills against best practices, YAML schema, naming conventions, description quality, file structure, and progressive disclosure patterns. Checks frontmatter syntax, third-person descriptions, trigger keywords, 500-line threshold, and tool restrictions. Use when validating skills, checking skill quality, ensuring skills follow conventions, or before committing skills. Use after creating or modifying skills. Use when `--check-skill` or `--validate-skill` is included by the user.
allowed-tools: Read, Grep, Glob

# NEW
name: Skill Validation
description: Validates Claude Code skills against best practices, YAML schema, naming conventions, description quality, file structure, and progressive disclosure patterns. Checks frontmatter syntax, third-person descriptions, trigger keywords, 500-line threshold, and tool restrictions. Use when validating skills, checking skill quality, ensuring skills follow conventions, or before committing skills. Use after creating or modifying skills. Use when `--validate-skill` or `--check-skill` is included.
allowed-tools: Read, Grep, Glob
```

2. **Update cross-skill references**:
```markdown
# OLD
Check against [../agent-skills-authoring/validation/yaml-schema.md](../agent-skills-authoring/validation/yaml-schema.md)

# NEW
Check against [../../references/skill-validation/yaml-schema.md](../../references/skill-validation/yaml-schema.md)
```

**Find/Replace Operations**:
```bash
# Update validation reference paths
s|../agent-skills-authoring/validation/|../../references/skill-validation/|g

# Update skill name references
s|agent-skills-authoring|skills-authoring|g
s|agent-skill-validation|skill-validation|g
s|agent-skill-review|skill-review|g
```

**Test**:
```bash
# Test skill can be read
cat plugins/toolkit/skills/skill-validation/SKILL.md | head -20

# Test it references correct validation docs
grep -o '../../references/skill-validation/.*\.md' \
  plugins/toolkit/skills/skill-validation/SKILL.md
```

---

#### Step 1.4: Migrate `skill-review`

**Source**: `~/.config/claude/skills/agent-skill-review/`

**Target**: `plugins/toolkit/skills/skill-review/`

**Changes Required**:

1. **SKILL.md frontmatter**:
```yaml
# OLD
name: Agent Skill Review
description: Reviews and improves existing Claude Code skills with specific, actionable suggestions for discoverability, clarity, conciseness, and progressive disclosure. Provides before/after comparisons, checks for third-person descriptions, validates 500-line threshold, and optionally applies improvements. Use when improving skills, enhancing skill quality, getting feedback on skills, optimizing skill discovery, or reducing token usage. Use after validating skills with agent-skill-validation. Use when `--check-skill` or `--review-skill` is included by the user.
allowed-tools: Read, Edit, Grep, Glob

# NEW
name: Skill Review
description: Reviews and improves existing Claude Code skills with specific, actionable suggestions for discoverability, clarity, conciseness, and progressive disclosure. Provides before/after comparisons, checks for third-person descriptions, validates 500-line threshold, and optionally applies improvements. Use when improving skills, enhancing skill quality, getting feedback on skills, optimizing skill discovery, or reducing token usage. Use after validating skills with skill-validation. Use when `--review-skill` or `--check-skill` is included.
allowed-tools: Read, Edit, Grep, Glob
```

2. **Update cross-skill references**:
```markdown
# OLD
Use agent-skill-validation first if...

# NEW
Use skill-validation first if...
```

**Find/Replace Operations**:
```bash
# Update validation reference paths
s|../agent-skills-authoring/validation/|../../references/skill-validation/|g

# Update skill name references
s|agent-skills-authoring|skills-authoring|g
s|agent-skill-validation|skill-validation|g
s|agent-skill-review|skill-review|g
```

**Test**:
```bash
# Test skill can be read
cat plugins/toolkit/skills/skill-review/SKILL.md | head -20

# Test Edit tool is preserved
grep "allowed-tools" plugins/toolkit/skills/skill-review/SKILL.md
```

---

## Phase 2: Agent Lifecycle

### Skills to Migrate
4. `agent-authoring` (keep name)
5. `agent-validation` (keep name)

### Directory Structure

```
plugins/toolkit/
├── skills/
│   ├── agent-authoring/
│   │   ├── SKILL.md
│   │   ├── EXAMPLES.md
│   │   └── REFERENCE.md
│   │
│   └── agent-validation/
│       ├── SKILL.md
│       ├── EXAMPLES.md
│       └── REFERENCE.md
│
└── references/
    └── agent-validation/
        ├── yaml-schema.md
        ├── description-guidelines.md
        └── system-prompt-guidelines.md
```

### Migration Steps

#### Step 2.1: Create Agent Validation References

**Action**: Extract agent-specific validation docs (if they exist) or create new ones

**Target**: `plugins/toolkit/references/agent-validation/*.md`

**New Files to Create** (these don't exist in user skills, need to be written):

1. **yaml-schema.md**: Agent-specific YAML schema (name, description, tools, model, color)
2. **description-guidelines.md**: How to write agent descriptions (different from skill descriptions)
3. **system-prompt-guidelines.md**: Best practices for system prompts

**TODO**: Write these reference docs based on agent-authoring and agent-validation content.

---

#### Step 2.2: Migrate `agent-authoring`

**Source**: `~/.config/claude/skills/agent-authoring/`

**Target**: `plugins/toolkit/skills/agent-authoring/`

**Changes Required**:

1. **SKILL.md frontmatter**: Keep name as-is (no changes needed)

2. **Add references to shared docs** (if EXAMPLES.md or REFERENCE.md exist):
```bash
# Copy supporting files
cp ~/.config/claude/skills/agent-authoring/EXAMPLES.md \
   plugins/toolkit/skills/agent-authoring/ 2>/dev/null || true

cp ~/.config/claude/skills/agent-authoring/REFERENCE.md \
   plugins/toolkit/skills/agent-authoring/ 2>/dev/null || true
```

3. **Update cross-references**:
```markdown
# Add references to agent-validation if mentioned
s|agent-validation skill|agent-validation skill (see ../agent-validation/)|g
```

**Test**:
```bash
cat plugins/toolkit/skills/agent-authoring/SKILL.md | head -20
```

---

#### Step 2.3: Migrate `agent-validation`

**Source**: `~/.config/claude/skills/agent-validation/`

**Target**: `plugins/toolkit/skills/agent-validation/`

**Changes Required**:

1. **SKILL.md frontmatter**: Keep name as-is

2. **Add references to validation docs**:
```markdown
# Link to shared agent validation references
Check against [../../references/agent-validation/yaml-schema.md](../../references/agent-validation/yaml-schema.md)
```

**Find/Replace Operations**:
```bash
# If references to agent-authoring exist, ensure paths are relative
s|../agent-authoring/|../agent-authoring/|g
```

**Test**:
```bash
cat plugins/toolkit/skills/agent-validation/SKILL.md | head -20
```

---

## Phase 3: Discovery & Tooling

### Skills to Migrate
6. `skill-flags` (was `agent-skill-list-flags`)
7. `discover-skills` (was `find-skills`)

### Directory Structure

```
plugins/toolkit/
├── skills/
│   ├── skill-flags/
│   │   └── SKILL.md
│   │
│   └── discover-skills/
│       └── SKILL.md
│
└── scripts/
    └── find-skills.ts  (reference existing agentish script)
```

### Migration Steps

#### Step 3.1: Migrate `skill-flags`

**Source**: `~/.config/claude/skills/agent-skill-list-flags/`

**Target**: `plugins/toolkit/skills/skill-flags/`

**Changes Required**:

1. **SKILL.md frontmatter**:
```yaml
# OLD
name: Agent Skill List Flags
description: Lists all available skill flags with intelligent grouping and categorization. Shows project flags first, then global flags. Groups related flags under logical headings like "Skill Development", "Git & Source Control", "Code Analysis", etc. Use when discovering available flags, exploring skill capabilities, or when `--list-flags` is included.

# NEW
name: Skill Flags
description: Lists all available skill flags with intelligent grouping and categorization. Shows project flags first, then global flags. Groups related flags under logical headings like "Skill Development", "Git & Source Control", "Code Analysis", etc. Use when discovering available flags, exploring skill capabilities, or when `--list-flags` is included.
```

2. **Update audit script reference**:
```markdown
# OLD
bash ~/.claude/skills/agent-skills-authoring/scripts/audit-skill-flags.sh --json

# NEW
bash ../../scripts/audit-skill-flags.sh --json
# OR (if script stays in skills-authoring)
bash ../skills-authoring/scripts/audit-skill-flags.sh --json
```

**Decision Point**: Where should `audit-skill-flags.sh` live?
- **Option A**: `plugins/toolkit/scripts/audit-skill-flags.sh` (shared utility)
- **Option B**: `plugins/toolkit/skills/skills-authoring/scripts/audit-skill-flags.sh` (owned by authoring)

**Recommendation**: Option B (keep with skills-authoring), but reference from skill-flags.

**Find/Replace**:
```bash
s|agent-skills-authoring|skills-authoring|g
```

**Test**:
```bash
cat plugins/toolkit/skills/skill-flags/SKILL.md | head -20
```

---

#### Step 3.2: Migrate `discover-skills`

**Source**: `~/.config/claude/skills/find-skills/`

**Target**: `plugins/toolkit/skills/discover-skills/`

**Changes Required**:

1. **SKILL.md frontmatter**:
```yaml
# OLD
name: Find Skills
description: Discovers and recommends available skills based on user queries or task context. Searches across user, project, and plugin sources with intelligent filtering. Use when exploring available capabilities, searching for skills by keyword, looking for the right skill for a task, or when "find skills", "what skills", "available skills", "list skills", or `--find-skills` flag are mentioned.

# NEW
name: Discover Skills
description: Discovers and recommends available skills based on user queries or task context. Searches across user, project, and plugin sources with intelligent filtering. Use when exploring available capabilities, searching for skills by keyword, looking for the right skill for a task, or when "find skills", "what skills", "available skills", "list skills", "discover skills", or `--discover-skills` flag are mentioned.
```

2. **Update find-skills.ts reference**:
```markdown
# OLD
bun run /Users/mg/Developer/agentish/scripts/find-skills.ts --text

# NEW
bun run ../../scripts/find-skills.ts --text
```

**Test**:
```bash
cat plugins/toolkit/skills/discover-skills/SKILL.md | head -20

# Test script path resolves
ls plugins/toolkit/skills/discover-skills/../../scripts/find-skills.ts
```

---

## Phase 4: Testing & Documentation

### Integration Testing

#### Test 1: Skill Discovery
```bash
# From toolkit directory
bun run scripts/find-skills.ts --source project --text

# Should show all 7 migrated skills
# Expected: skills-authoring, skill-validation, skill-review, agent-authoring, agent-validation, skill-flags, discover-skills
```

#### Test 2: Flag Discovery
```bash
# Should find flags across all skills
bun run skills/skills-authoring/scripts/audit-skill-flags.sh --json

# Expected flags:
# --create-skill, --new-skill (skills-authoring)
# --validate-skill, --check-skill (skill-validation)
# --review-skill, --check-skill (skill-review)
# --create-agent, --new-agent (agent-authoring)
# --validate-agent, --check-agent (agent-validation)
# --list-flags (skill-flags)
# --discover-skills, --find-skills (discover-skills)
```

#### Test 3: Cross-References
```bash
# Validate all internal links resolve
cd plugins/toolkit

# Check skills-authoring references
find skills/skills-authoring -name "*.md" -exec grep -l "\.\./" {} \;

# Test each reference manually
# Example: skills/skills-authoring/SKILL.md -> ../../references/skill-validation/yaml-schema.md
ls references/skill-validation/yaml-schema.md
```

#### Test 4: Skill Triggering (Manual)

Test each skill's trigger patterns with Claude Code:

```
# Skill Authoring
"Help me create a new skill --create-skill"
"I want to author a Claude skill"

# Skill Validation
"Validate this skill --validate-skill"
"Check if my skill follows best practices --check-skill"

# Skill Review
"Review and improve this skill --review-skill"
"Get feedback on my skill quality"

# Agent Authoring
"Create a new agent --create-agent"
"Help me author a subagent"

# Agent Validation
"Validate my agent --validate-agent"
"Check if this agent is well-formed"

# Skill Flags
"What flags are available? --list-flags"
"List all skill trigger flags"

# Discover Skills
"What skills are available? --discover-skills"
"Find skills for PDF processing"
```

---

### Documentation Updates

#### Update `plugins/toolkit/README.md`

Add section:
```markdown
## Skills

The toolkit plugin provides comprehensive skills for creating, validating, and managing Claude Code skills and agents.

### Skill Lifecycle
- **skills-authoring** (`--create-skill`) - Create and update skills with best practices
- **skill-validation** (`--validate-skill`) - Validate skills against quality standards
- **skill-review** (`--review-skill`) - Review and improve existing skills

### Agent Lifecycle
- **agent-authoring** (`--create-agent`) - Create and update Claude Code agents
- **agent-validation** (`--validate-agent`) - Validate agents against best practices

### Discovery
- **skill-flags** (`--list-flags`) - List all available skill trigger flags
- **discover-skills** (`--discover-skills`) - Find skills across all sources

For detailed documentation, see each skill's SKILL.md.
```

---

#### Update `.claude-plugin/plugin.json`

Ensure plugin.json includes all skills:
```json
{
  "name": "toolkit",
  "description": "Agentish toolkit plugin with skills for skill/agent management",
  "version": "1.0.0",
  "skills": [
    "skills/skills-authoring",
    "skills/skill-validation",
    "skills/skill-review",
    "skills/agent-authoring",
    "skills/agent-validation",
    "skills/skill-flags",
    "skills/discover-skills"
  ]
}
```

---

#### Create Migration Guide for Users

**File**: `plugins/toolkit/MIGRATION.md`

```markdown
# Migration Guide: User Skills → Toolkit Plugin

If you were using these skills from your personal `~/.claude/skills/` directory, they've been migrated to the toolkit plugin with new names.

## Name Changes

| Old Name | New Name | New Flag |
|----------|----------|----------|
| `agent-skills-authoring` | `skills-authoring` | `--create-skill` |
| `agent-skill-validation` | `skill-validation` | `--validate-skill` |
| `agent-skill-review` | `skill-review` | `--review-skill` |
| `agent-authoring` | `agent-authoring` | `--create-agent` (unchanged) |
| `agent-validation` | `agent-validation` | `--validate-agent` (unchanged) |
| `agent-skill-list-flags` | `skill-flags` | `--list-flags` |
| `find-skills` | `discover-skills` | `--discover-skills` |

## What Changed

**Skill Names**: Removed `agent-` prefix from skill-focused tools (kept for agent-focused tools).

**References**: Updated to use shared validation references in `references/skill-validation/`.

**Functionality**: All features preserved, no breaking changes.

## What Stayed the Same

**Trigger Flags**: All `--flag` triggers still work.

**Tool Access**: Validation is still read-only, review can still edit.

**Capabilities**: No features removed, all examples and references intact.

## Transition Steps

### Option 1: Keep Both (Recommended During Transition)

Keep your personal skills while using the plugin:
- Personal skills in `~/.claude/skills/` (your customizations)
- Plugin skills in plugin (standard implementations)
- No conflicts (Claude will prefer user skills)

### Option 2: Remove Personal Skills

If you haven't customized them:
```bash
# Backup first
mv ~/.config/claude/skills/agent-skills-authoring ~/.config/claude/skills.backup/
mv ~/.config/claude/skills/agent-skill-validation ~/.config/claude/skills.backup/
mv ~/.config/claude/skills/agent-skill-review ~/.config/claude/skills.backup/
mv ~/.config/claude/skills/agent-skill-list-flags ~/.config/claude/skills.backup/
mv ~/.config/claude/skills/find-skills ~/.config/claude/skills.backup/

# Plugin skills will now be used
```

### Option 3: Customize Plugin Skills

Fork the plugin and customize:
```bash
cd ~/.claude/plugins/agentish
# Make changes to skills in plugins/toolkit/skills/
# Commit to your fork
```

## Testing

After migration, test each skill:
```bash
# Skill authoring
--create-skill

# Validation
--validate-skill

# Review
--review-skill

# Flags
--list-flags

# Discovery
--discover-skills
```

## Rollback

If you encounter issues:
```bash
# Restore from backup
mv ~/.config/claude/skills.backup/* ~/.config/claude/skills/

# Or disable plugin temporarily
/plugin disable toolkit@agentish
```

## Questions?

Open an issue: https://github.com/galligan/agentish/issues
```

---

## Post-Migration Validation

### Checklist

**File Structure**:
- [ ] All 7 skills migrated to `plugins/toolkit/skills/`
- [ ] Shared references in `plugins/toolkit/references/`
- [ ] Scripts preserved in appropriate locations
- [ ] No broken symlinks or missing files

**Content**:
- [ ] All SKILL.md frontmatter updated (names, descriptions)
- [ ] All cross-references use relative paths
- [ ] All skill name references updated
- [ ] Validation references point to shared location

**Functionality**:
- [ ] `find-skills.ts` discovers all 7 skills
- [ ] `audit-skill-flags.sh` finds all flags
- [ ] No flag conflicts detected
- [ ] All flags trigger correct skills

**Integration**:
- [ ] `plugin.json` lists all skills
- [ ] README documents all skills
- [ ] MIGRATION.md guides users
- [ ] Examples still work

**Testing**:
- [ ] Each skill triggers correctly
- [ ] Cross-skill workflows work (validate → review)
- [ ] Scripts execute without errors
- [ ] References resolve correctly

---

## Rollback Plan

If migration fails:

1. **Preserve user skills**: Keep `~/.config/claude/skills/` untouched
2. **Remove plugin changes**: Delete `plugins/toolkit/skills/` changes
3. **Restore from git**: `git checkout plugins/toolkit/`
4. **Verify user skills work**: Test from personal skills directory

**Safety**: Migration is additive. User skills remain functional throughout.

---

## Timeline

| Phase | Duration | Tasks | Validation |
|-------|----------|-------|------------|
| Phase 1 | 2-3 days | Core skill lifecycle | Skills trigger, references resolve |
| Phase 2 | 1-2 days | Agent lifecycle | Agent skills work independently |
| Phase 3 | 1-2 days | Discovery tools | Flag listing, skill discovery work |
| Phase 4 | 2-3 days | Testing & docs | All tests pass, docs complete |
| **Total** | **6-10 days** | | End-to-end validation |

---

## Success Criteria

**Must Have**:
✅ All 7 skills migrated and functional
✅ No broken references or missing files
✅ All trigger flags work correctly
✅ Cross-skill workflows function (validate → review)
✅ Documentation complete (README, MIGRATION.md)

**Should Have**:
✅ Shared validation references reduce duplication
✅ Flag audit script works from plugin context
✅ Migration guide helps users transition
✅ No conflicts with user skills

**Nice to Have**:
⭐ Enhanced documentation with examples
⭐ Additional tests for edge cases
⭐ Performance benchmarks (cache effectiveness)
⭐ Video walkthrough of migration

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Create migration branch**: `git checkout -b feature/migrate-user-skills`
3. **Execute Phase 1**: Start with core skill lifecycle
4. **Validate Phase 1**: Test before moving to Phase 2
5. **Iterate**: Complete phases sequentially
6. **Final validation**: Run complete test suite
7. **Merge**: Create PR with migration summary
8. **Communicate**: Update users via changelog/docs

---

## Appendix: File Mapping

### Complete Source → Target Mapping

```
USER SKILLS → PLUGIN SKILLS

~/.config/claude/skills/agent-skills-authoring/
├── SKILL.md → plugins/toolkit/skills/skills-authoring/SKILL.md
├── validation/*.md → plugins/toolkit/references/skill-validation/*.md
├── templates/*.md → plugins/toolkit/skills/skills-authoring/templates/*.md
├── examples/*.md → plugins/toolkit/skills/skills-authoring/examples/*.md
└── scripts/audit-skill-flags.sh → plugins/toolkit/skills/skills-authoring/scripts/audit-skill-flags.sh

~/.config/claude/skills/agent-skill-validation/
└── SKILL.md → plugins/toolkit/skills/skill-validation/SKILL.md

~/.config/claude/skills/agent-skill-review/
└── SKILL.md → plugins/toolkit/skills/skill-review/SKILL.md

~/.config/claude/skills/agent-authoring/
├── SKILL.md → plugins/toolkit/skills/agent-authoring/SKILL.md
├── EXAMPLES.md → plugins/toolkit/skills/agent-authoring/EXAMPLES.md (if exists)
└── REFERENCE.md → plugins/toolkit/skills/agent-authoring/REFERENCE.md (if exists)

~/.config/claude/skills/agent-validation/
├── SKILL.md → plugins/toolkit/skills/agent-validation/SKILL.md
├── EXAMPLES.md → plugins/toolkit/skills/agent-validation/EXAMPLES.md (if exists)
└── REFERENCE.md → plugins/toolkit/skills/agent-validation/REFERENCE.md (if exists)

~/.config/claude/skills/agent-skill-list-flags/
└── SKILL.md → plugins/toolkit/skills/skill-flags/SKILL.md

~/.config/claude/skills/find-skills/
└── SKILL.md → plugins/toolkit/skills/discover-skills/SKILL.md
```

### Total Files to Migrate

**Core Files**: 7 SKILL.md files
**Supporting Docs**: 4 validation references + templates + examples
**Scripts**: 1 audit script + reference to find-skills.ts
**Documentation**: README updates, MIGRATION.md, plugin.json

**Estimated Total**: ~50-60 files (including templates and examples)
