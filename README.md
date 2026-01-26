# Outfitter Agents

Official Claude Code plugins for disciplined software development.

## What's This?

This repository hosts the **Outfitter Marketplace** — a curated collection of Claude Code plugins providing development methodology, tooling, and workflow skills.

## Installation

```bash
# Add the Outfitter marketplace
/plugin marketplace add outfitter-dev/agents

# Browse available plugins
/plugin
```

## Available Plugins

### outfitter

Core development methodology and Claude Code extensibility. Includes TDD, debugging, architecture, research, plus skills/plugins/agents/hooks authoring.

```bash
/plugin install outfitter@outfitter
```

**35 skills** including:
- Test-driven development (Red-Green-Refactor)
- Systematic debugging (root cause first)
- Architecture design with tradeoff analysis
- Technical research with citations
- TypeScript, Bun, Hono, React patterns
- Plugin, skill, agent, command, hook authoring
- Claude Code and Codex configuration

**10 agents**: quartermaster, analyst, debugger, engineer, librarian, reviewer, scout, skeptic, specialist, tester

[See outfitter/README.md](outfitter/README.md)

---

### but

GitButler virtual branch workflows for parallel development and multi-agent collaboration.

```bash
/plugin install but@outfitter
```

**4 skills** for:
- Virtual branch management
- Multi-agent concurrent development
- Stacked branch workflows
- Branch completion and merging

**1 agent**: gitbutler-expert

[See but/README.md](but/README.md)

---

### gt

Graphite stacked PR workflows for trunk-based development.

```bash
/plugin install gt@outfitter
```

**Skills** for:
- Stacked PR management
- Trunk-based development with `gt` commands

[See gt/README.md](gt/README.md)

---

### cli-dev

CLI development skills: argument parsing, help text, subcommands.

```bash
/plugin install cli-dev@outfitter
```

[See cli-dev/README.md](cli-dev/README.md)

## Quick Start

For most projects, start with outfitter:

```bash
# Add marketplace and install foundation
/plugin marketplace add outfitter-dev/agents
/plugin install outfitter@outfitter

# Add GitButler if using virtual branches
/plugin install but@outfitter

# Add Graphite if using stacked PRs
/plugin install gt@outfitter
```

## Repository Structure

```
agents/
├── .claude-plugin/
│   └── marketplace.json    # Plugin catalog
├── outfitter/              # Core methodology + extensibility (35 skills, 10 agents)
├── but/                    # GitButler workflows (4 skills, 1 agent)
├── gt/                     # Graphite workflows
├── cli-dev/                # CLI development
├── SECURITY.md             # Security model and review guidelines
└── README.md
```

## Security & Capabilities

Plugins are code. Review what you install. See [SECURITY.md](SECURITY.md) for the full threat model.

| Plugin | Filesystem | Shell | Scripts | Notes |
|--------|------------|-------|---------|-------|
| outfitter | read/write | yes | yes | Includes scaffolding scripts |
| but | read | yes | no | Runs `but`/`git` commands |
| gt | read | yes | no | Runs `gt`/`git` commands |
| cli-dev | read | no | no | Instructions-only |

## Skills Reference

### outfitter - Development Methodology

| Skill | Description |
|-------|-------------|
| tdd | Test-driven development with Red-Green-Refactor |
| debugging | Systematic root cause investigation |
| codebase-recon | Evidence-based investigation methodology |
| architecture | System design with technology selection |
| research | Multi-source technical research with citations |
| pathfinding | Collaborative Q&A for unclear requirements |
| simplify | Pushback against over-engineering |
| codify | Extract reusable patterns from conversations |
| code-review | Pre-commit quality gate checklist |
| scenarios | End-to-end testing without mocks |
| software-craft | Engineering judgment and decision principles |
| typescript-dev | TypeScript patterns and strict typing |
| bun-dev | Bun runtime APIs and patterns |
| hono-dev | Type-safe Hono API development |
| react-dev | React 18-19 TypeScript patterns |
| performance | Profiling and optimization |
| security | Security auditing and vulnerability detection |

### outfitter - Claude Code Extensibility

| Skill | Description |
|-------|-------------|
| skills-dev | Agent Skills authoring (cross-platform spec + Claude extensions via `references/claude-code.md`) |
| claude-plugins | Create, validate, and distribute Claude Code plugins |
| claude-agents | Create and validate Claude Code agents |
| claude-commands | Create Claude Code slash commands |
| claude-hooks | Create Claude Code hooks |
| claude-rules | Project rules in .claude/rules/ |
| claude-config | Manage Claude Code/Desktop configuration |
| codex-config | Manage Codex CLI configuration |

### but - GitButler

| Skill | Description |
|-------|-------------|
| virtual-branches | Core GitButler workflow patterns |
| multi-agent | Coordinate multiple AI agents |
| stacks | Stacked branches with `--anchor` |
| complete-branch | Safely merge virtual branches to main |

### gt - Graphite

| Skill | Description |
|-------|-------------|
| stacks | Stacked PR workflows with `gt` commands |

## Plugin Development

Want to build your own Claude Code plugin?

1. **Install outfitter**: Get the plugin authoring skills

   ```bash
   /plugin install outfitter@outfitter
   ```

2. **Use the extensibility skills**: `claude-plugins`, `skills-dev`, `claude-agents`, etc.

3. **Submit a PR**: Add your plugin to `.claude-plugin/marketplace.json`

See [outfitter/README.md](outfitter/README.md) for detailed guidance.

## Links

- **Outfitter**: <https://github.com/outfitter-dev>
- **Issues**: <https://github.com/outfitter-dev/agents/issues>

## License

MIT License - see [LICENSE](LICENSE) for details.
