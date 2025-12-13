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

### Skills (18)

| Skill | Purpose |
|-------|---------|
| **tdd** | Test-driven development with Red-Green-Refactor cycles |
| **debugging** | Systematic root cause investigation (no fixes without understanding) |
| **analysis** | Evidence-based investigation methodology |
| **architect** | System design with technology selection frameworks |
| **research** | Multi-source technical research with citations |
| **pathfinding** | Collaborative Q&A for unclear requirements |
| **challenge-complexity** | Pushback against over-engineering |
| **patternify** | Extract reusable patterns from conversations |
| **fresh-eyes-review** | Pre-commit quality gate checklist |
| **scenario-testing** | End-to-end testing without mocks |
| **senior-developer** | Engineering judgment and decision principles |
| **conversation-analysis** | Signal extraction from chat history |
| **dev-typescript** | TypeScript patterns and strict typing |
| **dev-bun** | Bun runtime APIs and patterns |
| **dev-hono** | Type-safe Hono API development |
| **dev-react** | React 18-19 TypeScript patterns |
| **expertise-performance** | Profiling and optimization |
| **expertise-security** | Security auditing and vulnerability detection |

### Agents (7)

| Agent | Role |
|-------|------|
| **developer** | Build, fix, implement, refactor |
| **analyst** | Investigate, research, explore |
| **reviewer** | Review, critique, check, audit |
| **tester** | Test, validate, verify |
| **specialist** | Domain-specific tasks (CI/CD, deploy) |
| **skeptic** | Challenge assumptions and complexity |
| **pattern-analyzer** | Identify patterns and abstractions |

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
→ Loads architect skill → Options with tradeoffs
```

**Research:**
```
"What's the best approach for rate limiting?"
→ Loads research skill → Multi-source analysis with citations
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
├── skills/           # 18 development methodology skills
├── agents/           # 7 specialized agents
└── README.md
```

## Related Plugins

- **claude-dev** — Build your own Claude Code plugins
- **gitbutler** — Virtual branch workflows for parallel development

## License

MIT
