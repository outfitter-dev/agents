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
| **outfitter** | Core methodology + Claude Code extensibility (TDD, debugging, architecture, research, plugins, skills, agents) |
| **but** | GitButler virtual branch workflows for parallel development |
| **gt** | Graphite stacked PR workflows for trunk-based development |
| **cli-dev** | CLI development: argument parsing, help text, subcommands |

## Working with Skills

Skills are markdown-based instruction sets that guide agent behavior for specific tasks.

### Finding Skills

| Plugin | Path | Contains |
|--------|------|----------|
| outfitter | `outfitter/skills/` | TDD, debugging, pathfinding, plugin authoring |
| but | `but/skills/` | GitButler virtual branch workflows |
| gt | `gt/skills/` | Graphite stacked PR workflows |
| cli-dev | `cli-dev/skills/` | CLI development patterns |

```bash
# List all skills
find . -name "SKILL.md" -not -path "*/node_modules/*"
```

### Loading Skills into Context

To use a skill, read the `SKILL.md` file into context. Skills use **progressive disclosure**:

| Step | File | Contains |
|------|------|----------|
| 1. Core | `SKILL.md` | YAML frontmatter + workflow |
| 2. Deep-dive | `references/*.md` | Detailed patterns, edge cases |
| 3. Examples | `examples/` or `EXAMPLES.md` | Concrete worked patterns |

```bash
# Example: load the pathfinding skill
cat outfitter/skills/pathfinding/SKILL.md

# If you need more detail on confidence levels
cat outfitter/skills/pathfinding/references/confidence.md
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

| Tool | Purpose |
|------|---------|
| Bun | Runtime and package manager |
| Biome | Linting and formatting |
| `.claude/rules/FORMATTING.md` | Skill output formatting conventions |
