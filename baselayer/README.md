# Baselayer

Foundational skills and utilities recommended as a base for all Outfitter plugins.

## Purpose

Baselayer contains the core development skills that every project benefits from. Install this first, then add domain-specific plugins as needed.

Skills here are:

- Generally applicable across all development contexts
- Not tied to a specific tool or workflow (gitbutler, waymark, etc.)
- Represent proven development patterns and practices

## Structure

```
baselayer/
├── .claude-plugin/
│   └── plugin.json
├── skills/           # Core development skills
├── commands/         # Common slash commands
├── agents/           # Shared agents
└── README.md
```

## Installation

Install baselayer as your foundation, then add specialized plugins:

```
/plugin install baselayer@outfitter
/plugin install outfitter@outfitter    # Additional utilities
/plugin install gitbutler@outfitter    # If using GitButler
```

## Adding to Baselayer

When moving a skill/command/agent here:

1. Move the resource to the appropriate directory
2. Remove it from the original plugin
3. Update both plugins' versions
4. Document the change in release notes
