# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Outfitter Marketplace** - a collection of Claude Code plugins for developers. The repository hosts multiple plugins that can be installed individually.

## Commands

### Plugin installation (via Claude Code)

```bash
/plugin marketplace add outfitter-dev/agents  # Add marketplace
/plugin install <plugin-name>@outfitter       # Install a plugin
```

## Architecture

### Plugin Structure

Each plugin follows Claude Code's plugin structure with a `.claude-plugin/plugin.json` manifest:

```
<plugin-name>/
├── .claude-plugin/
│   └── plugin.json       # Plugin manifest (name, version, hooks, commands)
├── agents/               # Custom agents (markdown files)
├── commands/             # Slash commands (markdown files)
├── skills/               # Skills with SKILL.md entry points
├── hooks/                # Event hooks (TypeScript for complex logic)
└── README.md
```

### Available Plugins

| Plugin | Purpose |
|--------|---------|
| **baselayer** | Core development methodology: TDD, debugging, type safety, architecture, research |
| **claude-dev** | Authoring Claude Code plugins, marketplaces, and configuration |
| **gitbutler** | GitButler virtual branch workflows for parallel development |

## Working with Skills

Skills are markdown-based instruction sets that guide agent behavior for specific tasks.

### Finding Skills

```bash
# List all skills in the repo
find . -name "SKILL.md" -not -path "*/node_modules/*"

# Skills live under each plugin
baselayer/skills/     # TDD, debugging, pathfinding, etc.
claude-dev/skills/    # Plugin authoring, marketplace setup
gitbutler/skills/     # Version control workflows
```

### Loading Skills into Context

To use a skill, read the `SKILL.md` file into context. Skills use **progressive disclosure**:

1. **Start with SKILL.md** - Contains YAML frontmatter (name, description, triggers) plus the core workflow
2. **Load references on demand** - `references/` subdirectory has deep-dive docs
3. **Check examples** - `examples/` or `EXAMPLES.md` for concrete patterns

```bash
# Example: load the pathfinding skill
cat baselayer/skills/pathfinding/SKILL.md

# If you need more detail on confidence levels
cat baselayer/skills/pathfinding/references/confidence.md
```

### Skill Anatomy

```markdown
---
name: Skill Name
version: 1.0.0
description: When to use this skill, trigger keywords
---

# Skill Name

<when_to_use>
Conditions that should trigger this skill
</when_to_use>

<workflow>
Step-by-step process
</workflow>

<rules>
ALWAYS: mandatory behaviors
NEVER: prohibited actions
</rules>

<references>
Links to supporting docs
</references>
```

### Formatting Conventions

Skills and output should follow `.claude/rules/FORMATTING.md`:
- Use Unicode indicators (`░▓` for progress, `◇◆` for severity, `△` for caveats)
- Variables in `{ALL_CAPS}`, instructional prose in `{ lowercase with spaces }`
- XML tags for structural sections (`<workflow>`, `<rules>`, etc.)
- Avoid markdown emphasis in instructions; save it for user-facing output

## Marketplace Configuration

The root `.claude-plugin/marketplace.json` defines available plugins with source locations and metadata. Plugins can reference local directories (`./plugin-name`) or external GitHub repos.

## Conventions

- **Bun** is the runtime and package manager for TypeScript projects
- **Biome** for linting and formatting
- Skills should follow formatting conventions in `.claude/rules/FORMATTING.md`
