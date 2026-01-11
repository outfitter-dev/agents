# Baselayer

Core development methodology skills for Claude Code. Provides disciplined approaches to TDD, debugging, architecture, research, and code quality.

## Installation

```bash
# Add the Outfitter marketplace (if not already added)
/plugin marketplace add outfitter-dev/agents

# Install baselayer
/plugin install baselayer@outfitter
```

## What's Included

### Skills (26)

| Skill | Purpose |
|-------|---------|
| **ai-sdk** | Vercel AI SDK patterns for streaming, structured outputs, and agents |
| **bun-dev** | Bun runtime APIs and patterns |
| **cli-development-guidelines** | Redirect to cli-dev plugin |
| **code-review** | Pre-commit quality gate checklist |
| **codebase-analysis** | Evidence-based codebase investigation methodology |
| **complexity-analysis** | Pushback against over-engineering |
| **conversation-analysis** | Signal extraction from chat history |
| **debugging-and-diagnosis** | Systematic root cause investigation (no fixes without understanding) |
| **hono-dev** | Type-safe Hono API development |
| **pathfinding** | Collaborative Q&A for unclear requirements |
| **pattern-analysis** | Identify and extract reusable patterns |
| **patternify** | Extract reusable patterns from conversations |
| **performance-engineering** | Profiling and optimization |
| **react-dev** | React 18-19 TypeScript patterns |
| **report-findings** | Structure and present research findings |
| **research-and-report** | Multi-source technical research with citations |
| **root-cause-analysis** | Systematic problem investigation methodology |
| **scenario-testing** | End-to-end testing without mocks |
| **security-engineering** | Security auditing and vulnerability detection |
| **software-architecture** | System design with technology selection frameworks |
| **software-engineering** | Engineering judgment and decision principles |
| **status-reporting** | Comprehensive status reports across VCS, PRs, issues, CI/CD |
| **subagent-coordination** | Orchestrate baselayer subagents for complex tasks |
| **test-driven-development** | Test-driven development with Red-Green-Refactor cycles |
| **typescript-dev** | TypeScript patterns and strict typing |
| **use-the-best-tool** | Detect and select optimal CLI tools for tasks |

### Agents (10)

| Agent | Role |
|-------|------|
| **analyst** | Investigate, research, explore |
| **debugger** | Debug, diagnose, troubleshoot, trace |
| **librarian** | Find documentation, API references |
| **pattern-analyzer** | Identify patterns and abstractions |
| **ranger** | Review, critique, check, audit |
| **scout** | Status reports, project health, what's changed |
| **senior-dev** | Build, fix, implement, refactor |
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
→ Loads software-architecture skill → Options with tradeoffs
```

**Research:**

```
"What's the best approach for rate limiting?"
→ Loads research-and-report skill → Multi-source analysis with citations
```

## Philosophy

Baselayer enforces disciplined development practices:

- **Evidence over assumption** — Investigate before fixing
- **Tests before code** — Red-Green-Refactor, no exceptions
- **Simplicity over cleverness** — Challenge unnecessary complexity
- **Confidence tracking** — Know what you know and don't know

## Structure

```
baselayer/
├── .claude-plugin/
│   └── plugin.json
├── skills/           # 26 development methodology skills
├── agents/           # 10 specialized agents
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
