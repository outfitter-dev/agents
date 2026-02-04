# Outfitter

Core development methodology and Claude Code extensibility. Provides disciplined approaches to TDD, debugging, architecture, research, code quality, plus skills for authoring plugins, agents, skills, commands, and hooks.

## Installation

```bash
# Add the Outfitter marketplace (if not already added)
/plugin marketplace add outfitter-dev/agents

# Install outfitter
/plugin install outfitter@outfitter
```

## What's Included

### Skills (35)

#### Development Methodology

| Skill | Purpose |
|-------|---------|
| **ai-sdk** | Vercel AI SDK patterns for streaming, structured outputs, and agents |
| **bun-dev** | Bun runtime APIs and patterns |
| **cli-dev** | Redirect to cli-dev plugin |
| **code-review** | Pre-commit quality gate checklist |
| **codebase-recon** | Evidence-based codebase investigation methodology |
| **simplify** | Pushback against over-engineering |
| **session-analysis** | Signal extraction from chat history |
| **debugging** | Systematic root cause investigation (no fixes without understanding) |
| **hono-dev** | Type-safe Hono API development |
| **multi-agent-vcs** | Tool-agnostic multi-agent git coordination |
| **pathfinding** | Collaborative Q&A for unclear requirements |
| **patterns** | Identify and extract reusable patterns |
| **codify** | Extract reusable patterns from conversations |
| **performance** | Profiling and optimization |
| **react-dev** | React 18-19 TypeScript patterns |
| **report-findings** | Structure and present research findings |
| **research** | Multi-source technical research with citations |
| **find-root-causes** | Systematic problem investigation methodology |
| **scenarios** | End-to-end testing without mocks |
| **security** | Security auditing and vulnerability detection |
| **architecture** | System design with technology selection frameworks |
| **software-craft** | Engineering judgment and decision principles |
| **check-status** | Comprehensive status reports across VCS, PRs, issues, CI/CD |
| **subagents** | Orchestrate outfitter subagents for complex tasks |
| **tdd** | Test-driven development with Red-Green-Refactor cycles |
| **typescript-dev** | TypeScript patterns and strict typing |
| **which-tool** | Detect and select optimal CLI tools for tasks |

#### Claude Code Extensibility

| Skill | Purpose |
|-------|---------|
| **skills-dev** | Agent Skills authoring (cross-platform spec + Claude extensions via `references/claude-code.md`) |
| **claude-plugins** | Full plugin lifecycle, marketplace distribution |
| **claude-agents** | Subagent creation and validation |
| **claude-commands** | Slash command authoring |
| **claude-hooks** | Event hook creation and automation |
| **claude-rules** | Project rules in .claude/rules/ |
| **claude-config** | Claude Code/Desktop configuration |

#### Platform Configuration

| Skill | Purpose |
|-------|---------|
| **codex-config** | OpenAI Codex CLI configuration |

### Agents (10)

| Agent | Role |
|-------|------|
| **quartermaster** | Equips and provisions Claude Code extensions (plugins, agents, skills, hooks) |
| **analyst** | Investigate, research, explore, identify patterns |
| **debugger** | Debug, diagnose, troubleshoot, trace |
| **librarian** | Find documentation, API references |
| **reviewer** | Review, critique, check, audit |
| **scout** | Status reports, project health, what's changed |
| **engineer** | Build, fix, implement, refactor |
| **skeptic** | Challenge assumptions and complexity |
| **specialist** | Domain-specific tasks (CI/CD, deploy) |
| **tester** | Test, validate, verify |

## Usage

Skills are loaded automatically when relevant triggers are detected. You can also invoke them explicitly:

```
Use the tdd skill to implement this feature
```

```
Use the reviewer agent to check this code
```

### Common Workflows

**Test-Driven Development:**

```
"Implement user authentication using TDD"
→ Loads tdd skill → Red-Green-Refactor cycle
```

**Debugging:**

```
"This API returns 500 errors intermittently"
→ Loads debugging skill → Root cause investigation
```

**Architecture Design:**

```
"Design a notification system for 100k users"
→ Loads architecture skill → Options with tradeoffs
```

**Research:**

```
"What's the best approach for rate limiting?"
→ Loads research skill → Multi-source analysis with citations
```

## Philosophy

Outfitter enforces disciplined development practices:

- **Evidence over assumption** — Investigate before fixing
- **Tests before code** — Red-Green-Refactor, no exceptions
- **Simplicity over cleverness** — Challenge unnecessary complexity
- **Confidence tracking** — Know what you know and don't know

## Structure

```
outfitter/
├── .claude-plugin/
│   └── plugin.json
├── skills/           # 35 skills (methodology + extensibility)
├── agents/           # 11 specialized agents
├── commands/         # Slash commands
├── templates/        # Plugin/skill templates
├── scripts/          # Plugin utility scripts
└── README.md
```

## Capabilities

This plugin uses only standard Claude Code tools:

| Capability | Used | Notes |
|------------|------|-------|
| Filesystem | read | Reads code for analysis and review |
| Shell | no | — |
| Network | no | Research uses built-in WebSearch |
| MCP | no | — |
| Scripts | no | Instructions-only, no executable scripts |

See [SECURITY.md](../SECURITY.md) for the full security model.

## License

MIT
