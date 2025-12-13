# Plugin Architecture

## Structure

```
{plugin}/
├── .claude-plugin/
│   └── plugin.json      # name, version, description
├── skills/              # SKILL.md + references/ + examples/
├── commands/            # {name}.md slash commands
├── agents/              # {name}.md subagents
├── shared/
│   └── rules/           # Common rules for this plugin
└── README.md
```

## Marketplace Registration

`/.claude-plugin/marketplace.json` at repo root:

```json
{
  "name": "marketplace-name",
  "plugins": [
    { "name": "plugin-name", "source": "./path", "version": "1.0.0" }
  ]
}
```

## Layer Strategy

**baselayer**: Universal skills (tdd, debugging, type-safety, pathfinding)
**domain plugins**: Tool-specific (gitbutler, waymark, guardrails)
**user overrides**: `~/.claude/` and project `.claude/`

Hierarchy: user → project → plugin → baselayer

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

Skills reference skills: `[tdd/SKILL.md](../tdd/SKILL.md)`
Agents load skills: "Load TDD skill with Skill tool"
Commands invoke skills: "Load the debugging skill and begin by..."
