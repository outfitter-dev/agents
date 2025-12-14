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

### baselayer

Core development methodology skills: TDD, debugging, architecture, research, and code quality.

```bash
/plugin install baselayer@outfitter
```

**18 skills** including:
- Test-driven development (Red-Green-Refactor)
- Systematic debugging (root cause first)
- Architecture design with tradeoff analysis
- Technical research with citations
- TypeScript, Bun, Hono, React patterns

**7 agents**: developer, analyst, reviewer, tester, specialist, skeptic, pattern-analyzer

[See baselayer/README.md](baselayer/README.md)

---

### gitbutler

GitButler virtual branch workflows for parallel development and multi-agent collaboration.

```bash
/plugin install gitbutler@outfitter
```

**4 skills** for:
- Virtual branch management
- Multi-agent concurrent development
- Stacked branch workflows
- Branch completion and merging

**1 agent**: gitbutler-expert

[See gitbutler/README.md](gitbutler/README.md)

---

### claude-dev

Skills for authoring Claude Code plugins, marketplaces, and configuration management.

```bash
/plugin install claude-dev@outfitter
```

**4 skills** for:
- Plugin structure and authoring
- Marketplace setup and management
- Claude configuration files
- Plugin distribution and versioning

[See claude-dev/README.md](claude-dev/README.md)

## Quick Start

For most projects, start with baselayer:

```bash
# Add marketplace and install foundation
/plugin marketplace add outfitter-dev/agents
/plugin install baselayer@outfitter

# Add GitButler if using virtual branches
/plugin install gitbutler@outfitter

# Add claude-dev if building plugins
/plugin install claude-dev@outfitter
```

## Repository Structure

```
agents/
├── .claude-plugin/
│   └── marketplace.json    # Plugin catalog
├── baselayer/              # Core methodology (18 skills, 7 agents)
├── gitbutler/              # Virtual branch workflows (4 skills, 1 agent)
├── claude-dev/             # Plugin authoring (4 skills)
├── shared/                 # Shared scripts and utilities
├── SECURITY.md             # Security model and review guidelines
└── README.md
```

## Security & Capabilities

Plugins are code. Review what you install. See [SECURITY.md](SECURITY.md) for the full threat model.

| Plugin | Filesystem | Shell | Scripts | Notes |
|--------|------------|-------|---------|-------|
| baselayer | read | no | no | Instructions-only |
| gitbutler | read | yes | no | Runs `but`/`git` commands |
| claude-dev | read/write | yes | yes | Scaffolding scripts |

## Skills Reference

| Plugin | Skill | Description |
|--------|-------|-------------|
| baselayer | tdd | Test-driven development with Red-Green-Refactor |
| baselayer | debugging | Systematic root cause investigation |
| baselayer | analysis | Evidence-based investigation methodology |
| baselayer | architect | System design with technology selection |
| baselayer | research | Multi-source technical research with citations |
| baselayer | pathfinding | Collaborative Q&A for unclear requirements |
| baselayer | challenge-complexity | Pushback against over-engineering |
| baselayer | patternify | Extract reusable patterns from conversations |
| baselayer | fresh-eyes-review | Pre-commit quality gate checklist |
| baselayer | scenario-testing | End-to-end testing without mocks |
| baselayer | senior-developer | Engineering judgment and decision principles |
| baselayer | conversation-analysis | Signal extraction from chat history |
| baselayer | dev-typescript | TypeScript patterns and strict typing |
| baselayer | dev-bun | Bun runtime APIs and patterns |
| baselayer | dev-hono | Type-safe Hono API development |
| baselayer | dev-react | React 18-19 TypeScript patterns |
| baselayer | expertise-performance | Profiling and optimization |
| baselayer | expertise-security | Security auditing and vulnerability detection |
| gitbutler | version-control | Core GitButler workflow patterns |
| gitbutler | multi-agent | Coordinate multiple AI agents |
| gitbutler | stack-workflows | Stacked branches with `--anchor` |
| gitbutler | complete-branch | Safely merge virtual branches to main |
| claude-dev | claude-plugin-authoring | Create Claude Code plugins |
| claude-dev | claude-plugin-marketplace-setup | Set up plugin marketplaces |
| claude-dev | claude-config-management | Manage Claude configuration files |
| claude-dev | claude-plugin-distribution | Package and distribute plugins |

## Plugin Development

Want to add your own plugin to the marketplace?

1. **Install claude-dev**: Get the plugin authoring skills
   ```bash
   /plugin install claude-dev@outfitter
   ```

2. **Create your plugin**: Use the skills to build your plugin

3. **Submit a PR**: Add your plugin to `.claude-plugin/marketplace.json`

See [claude-dev/README.md](claude-dev/README.md) for detailed guidance.

## Links

- **Outfitter**: https://github.com/outfitter-dev
- **Issues**: https://github.com/outfitter-dev/agents/issues

## License

MIT License - see [LICENSE](LICENSE) for details.
