# GitButler

Virtual branch workflows for Claude Code. Enables parallel development, multi-agent collaboration, and post-hoc commit organization using GitButler.

## Installation

```bash
# Add the Outfitter marketplace (if not already added)
/plugin marketplace add outfitter-dev/agents

# Install gitbutler
/plugin install gitbutler@outfitter
```

## Prerequisites

- [GitButler](https://gitbutler.com/) installed and configured
- Repository initialized with `but init`

## What's Included

### Skills (4)

| Skill | Purpose |
|-------|---------|
| **version-control** | Core GitButler workflow patterns and `but` commands |
| **multi-agent** | Coordinate multiple AI agents in the same workspace |
| **stack-workflows** | Stacked branches with `--anchor` for dependent PRs |
| **complete-branch** | Safely merge virtual branches to main |

### Agent

| Agent | Role |
|-------|------|
| **gitbutler-expert** | All GitButler operations and troubleshooting |

## Why GitButler?

GitButler uses **virtual branches** — multiple branches applied to your working directory simultaneously. This enables:

- **Parallel development** — Work on multiple features without checkout
- **Post-hoc organization** — Assign changes to branches after writing code
- **Multi-agent workflows** — AI agents work concurrently without conflicts
- **Visual organization** — GUI + CLI for flexible workflows

## Quick Start

```bash
# Initialize GitButler in your repo
but init

# Create a virtual branch
but branch new feature-auth

# Make changes, then check status for file IDs
but status

# Assign files to branches
but rub <file-id> feature-auth

# Commit
but commit feature-auth -m "feat: add authentication"
```

## Key Commands

| Command | Purpose |
|---------|---------|
| `but init` | Initialize GitButler |
| `but status` | View changes and file IDs |
| `but branch new <name>` | Create virtual branch |
| `but rub <source> <target>` | Assign/move/squash/amend |
| `but commit <branch> -m "msg"` | Commit to branch |
| `but publish` | Publish to GitHub |
| `but .` | Open GitButler GUI |

## GitButler vs Graphite

| Aspect | GitButler | Graphite |
|--------|-----------|----------|
| Model | Virtual branches (all visible) | Linear stacks (checkout required) |
| Multi-agent | Parallel (no conflicts) | Serial (checkout needed) |
| Post-hoc organization | `but rub` trivial | Difficult |
| PR submission | Manual (use `gh`) | `gt submit --stack` |

**Choose GitButler for:** Exploratory work, multi-agent, post-hoc organization

**Choose Graphite for:** Production automation, PR submission, terminal-first

## Usage

Skills activate when you mention GitButler, virtual branches, or the `but` command:

```
"Set up GitButler for this repo"
→ Loads version-control skill → Initialization workflow
```

```
"Help me organize my changes into branches"
→ Loads version-control skill → Post-hoc organization
```

```
"I need multiple agents working on this codebase"
→ Loads multi-agent skill → Concurrent agent setup
```

## Structure

```
gitbutler/
├── .claude-plugin/
│   └── plugin.json
├── skills/           # 4 GitButler workflow skills
├── agents/           # gitbutler-expert agent
└── README.md
```

## Related Plugins

- **baselayer** — Core development methodology (TDD, debugging, architecture)
- **claude-dev** — Build your own Claude Code plugins

## Resources

- [GitButler Documentation](https://docs.gitbutler.com/)
- [GitButler CLI Reference](https://docs.gitbutler.com/cli)

## License

MIT
