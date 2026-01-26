# Plugin Architecture

## Structure

```
{plugin}/
├── .claude-plugin/
│   └── plugin.json      # name, version, description, keywords
├── skills/              # SKILL.md + references/ + examples/
├── agents/              # {name}.md subagents (optional)
├── commands/            # {name}.md slash commands (optional)
├── hooks/               # Event-triggered automation (optional)
├── scripts/             # Shared utility scripts (optional)
├── templates/           # Reusable templates (optional)
├── shared/
│   └── rules/           # Common rules for this plugin (optional)
└── README.md
```

Only `.claude-plugin/`, `skills/`, and `README.md` are required.

## Marketplace Registration

`/.claude-plugin/marketplace.json` at repo root:

```json
{
  "name": "marketplace-name",
  "owner": {
    "name": "Organization Name",
    "email": "contact@example.com"
  },
  "metadata": {
    "description": "Marketplace description",
    "version": "1.0.0",
    "homepage": "https://github.com/org/repo",
    "repository": "https://github.com/org/repo"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./path",
      "description": "Plugin description",
      "version": "1.0.0",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

## Available Plugins

| Plugin | Purpose |
|--------|---------|
| **outfitter** | Core methodology + extensibility: TDD, debugging, architecture, research, pathfinding, plus plugin/skill/agent authoring |
| **but** | GitButler virtual branch workflows, multi-agent collaboration |
| **gt** | Graphite stacked PR workflows, trunk-based development |
| **cli-dev** | CLI development: argument parsing, help text, subcommands |

## Layer Strategy

**outfitter**: Universal skills (tdd, debugging, type-safety, pathfinding, extensibility)
**domain plugins**: Tool-specific (but, gt, cli-dev)
**user overrides**: `~/.claude/` and project `.claude/`

Hierarchy: user → project → plugin → outfitter

## Component Decision Tree

```
Reusable pattern detected
├── Multi-step with judgment? → SKILL
├── Fully automatable? → COMMAND
├── Specialized expertise? → AGENT
└── Event-triggered? → HOOK
```

## Skill Structure

```
skills/{name}/
├── SKILL.md           # Core methodology (<500 lines)
├── references/        # Deep dives, patterns
└── examples/          # Worked examples
```

Keep SKILL.md focused. Move details to references/.

## Cross-Referencing

Skills reference skills: "Consider using the **outfitter:tdd** skill for this task."
Agents load skills: "Load TDD skill with Skill tool"
Commands invoke skills: "Load the **debugging** skill and begin by..."
