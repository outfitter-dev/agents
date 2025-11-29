# Consolidation from Agentish to Outfitter

**Date:** 2025-11-28
**Context:** Migration and consolidation of Claude Code plugin development ecosystem

## Background

The `agentish` repo (`galligan/agentish`) was originally being built as a Claude Code marketplace for agent-driven development. During planning, we discovered:

1. **Anthropic's official `plugin-dev`** plugin (from `claude-code-plugins` marketplace) already provides comprehensive creation capabilities:
   - 7 skills for creating plugins, skills, commands, hooks, agents
   - 3 specialized agents
   - Well-documented and maintained

2. **Existing `outfitter-dev/agents`** repo already had a `claude-dev` plugin with 13 skills covering both creation and validation

3. **No plugin dependency system** exists in Claude Code - plugins are independent

## Decision: Consolidate into Outfitter

Rather than duplicate Anthropic's work or maintain two repos, we consolidated everything into `outfitter-dev/agents` with clear separation of concerns:

### Ecosystem Architecture

```
Creating plugins/skills/etc:  Anthropic's plugin-dev (claude-code-plugins)
Validating components:        claude-dev@outfitter
General utilities:            outfitter@outfitter
```

## Changes Made

### 1. Created `outfitter` Plugin

New plugin for general-purpose development utilities:

```
outfitter/
├── .claude-plugin/plugin.json
├── commands/
│   └── jam.md                    # /outfitter:jam command
└── skills/
    └── jam/
        ├── SKILL.md              # Full skill (migrated from brainstorm)
        ├── references/
        │   ├── confidence.md     # Confidence interval deep-dive
        │   └── questions.md      # Question crafting guidance
        └── examples/
            └── auth-system.md    # Example session
```

**Jam** is an adaptive Q&A workflow with confidence tracking:
- Asks one question at a time with 2-4 options
- Tracks confidence using emoji intervals (🚫🔴🟡🟢)
- Delivers solution at 🟢 High confidence (≥86%)
- Includes structured reflection after each answer

### 2. Trimmed `claude-dev` Plugin

Removed creation-focused skills (Anthropic's plugin-dev covers these):
- `create-claude-command`
- `create-claude-hook`
- `create-claude-plugin`
- `create-claude-skill`
- `create-claude-subagent`
- `distribute-claude-plugin`

Kept validation and config management:
- `validate-claude-plugin`
- `validate-claude-command`
- `validate-claude-hook`
- `validate-claude-skill`
- `validate-claude-subagent`
- `setup-plugin-marketplace`
- `manage-claude-config`

Updated README to:
- Focus on validation and config management
- Recommend Anthropic's plugin-dev for creation
- Document the complementary relationship

### 3. Updated Marketplace

`marketplace.json` now includes:
- `outfitter` - General utilities (jam, etc.)
- `claude-dev` - Validation and config management
- `blz` - Documentation search (external source)

### 4. Deprecated Agentish

Updated `agentish` repo README and CLAUDE.md:
- Clear deprecation notice
- Redirect to `outfitter-dev/agents`
- Installation instructions for new location

## Installation Instructions

```bash
# Add Outfitter marketplace
/plugin marketplace add outfitter-dev/agents

# Install plugins
/plugin install outfitter@outfitter
/plugin install claude-dev@outfitter

# For creating plugins (Anthropic's official)
/plugin marketplace add anthropics/claude-code-plugins
/plugin install plugin-dev@claude-code-plugins
```

## Key Concepts

### Jam Skill

Confidence intervals:
- 🚫 **Unknown** (0-59): Major gaps, foundational questions needed
- 🔴 **Low** (60-75): Significant uncertainty, key decisions pending
- 🟡 **Medium** (76-85): Reasonable clarity, minor gaps remain
- 🟢 **High** (86-100): Ready to deliver

Workflow:
1. Ask exactly one question with 2-4 options
2. User responds (number, modification, or clarification)
3. Restate understanding + update confidence
4. Repeat until 🟢 or user requests delivery

### Plugin Naming

When installed, commands get namespace prefixes:
- `/outfitter:jam` - Jam session command
- `/claude-dev:validate:skill` - Skill validation (if nested)

## Files Modified/Created

**Created:**
- `/outfitter/.claude-plugin/plugin.json`
- `/outfitter/commands/jam.md`
- `/outfitter/skills/jam/SKILL.md`
- `/outfitter/skills/jam/references/confidence.md`
- `/outfitter/skills/jam/references/questions.md`
- `/outfitter/skills/jam/examples/auth-system.md`

**Modified:**
- `/.claude-plugin/marketplace.json`
- `/claude-dev/README.md`

**Deleted (from claude-dev/skills/):**
- `create-claude-command/`
- `create-claude-hook/`
- `create-claude-plugin/`
- `create-claude-skill/`
- `create-claude-subagent/`
- `distribute-claude-plugin/`

## Future Considerations

- The `jam` skill could be enhanced with more examples
- Consider adding more general utilities to the `outfitter` plugin
- May want to add CI/validation scripts to the repo
- Could explore whether blz should be brought in-tree or kept as external reference
