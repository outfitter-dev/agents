# Agent-Skill Mappings

Detailed breakdown of which skills each agent can load and when. Agents are grouped by their coordination role.

## engineer (coding role)

**Identity**: Builder, implementer, fixer.

| Skill | Load When |
|-------|-----------|
| software-craft | Always (core methodology) |
| tdd | New features, bug fixes requiring tests |
| bun-dev | Bun runtime, package management |
| react-dev | React components, hooks, state |
| hono-dev | API routes, middleware, server |
| ai-sdk | AI features, streaming, tools |

**Typical combos**:
- **software-craft** + **tdd** (standard feature)
- **software-craft** + **react-dev** (frontend work)
- **software-craft** + **hono-dev** + **ai-sdk** (AI API endpoint)

## reviewer (reviewing role)

**Identity**: Evaluator, quality guardian.

| Skill | Load When |
|-------|-----------|
| code-review | PR reviews, code audits |
| performance | Performance concerns, optimization |
| architecture | Architecture decisions, structural changes |
| security | Security audits, auth review |

**Typical combos**:
- **code-review** (standard PR review)
- **code-review** + **architecture** (significant refactor)
- **code-review** + **performance** (performance-critical code)
- **code-review** + **security** (auth or sensitive code)

## analyst (research role)

**Identity**: Investigator, researcher.

| Skill | Load When |
|-------|-----------|
| codebase-recon | Understanding existing code |
| research | External research, comparisons |
| pathfinding | Unclear requirements, many unknowns |
| status | Project status, progress reports |
| report-findings | Structuring analysis output |
| patterns | Analyzing code patterns |
| codify | Extracting reusable workflows |
| session-analysis | Mining conversation for patterns |

**Typical combos**:
- **codebase-recon** + **report-findings** (codebase exploration)
- **research** (technology comparison)
- **pathfinding** (requirements clarification)
- **codify** + **session-analysis** (capture workflow from session)
- **patterns** (analyze codebase patterns)

## debugger (debugging role)

**Identity**: Problem solver, root cause finder.

| Skill | Load When |
|-------|-----------|
| debugging | Always (core methodology) |
| codebase-recon | Understanding surrounding code |

**Typical combos**:
- **debugging** (standard debugging)
- **debugging** + **codebase-recon** (unfamiliar codebase)

## tester (testing role)

**Identity**: Validator, proof provider.

| Skill | Load When |
|-------|-----------|
| scenarios | End-to-end validation, integration tests |
| tdd | TDD workflow, test-first approach |

**Typical combos**:
- **scenarios** (feature validation)
- **tdd** (TDD implementation)

## skeptic (challenging role)

**Identity**: Complexity challenger, assumption questioner.

| Skill | Load When |
|-------|-----------|
| simplify | Always (core methodology) |

**Typical combos**:
- **simplify** (challenge proposals)

## specialist (specialist role)

**Identity**: Domain expert, infrastructure handler.

| Skill | Load When |
|-------|-----------|
| (dynamic) | Based on task domain |

**Examples**:
- CI/CD configuration → loads relevant CI patterns
- Design review → loads design/UX patterns
- Accessibility audit → loads a11y patterns
- Deployment → loads infrastructure patterns

Specialist loads skills dynamically based on detected domain. Other specialist agents (e.g., `cicd-expert`, `design-agent`, `bun-expert`) may be preferred when available.

## Skill Categories

### Core Methodology

Always relevant for the agent's identity:
- engineer: software-craft
- debugger: debugging
- skeptic: simplify

### Domain-Specific

Load based on technology in use:
- bun-dev, react-dev, hono-dev, ai-sdk

### Process-Oriented

Load based on workflow stage:
- tdd, code-review, scenarios

### Analysis-Oriented

Load for investigation and research:
- codebase-recon, research, pathfinding

### Output-Oriented

Load for structuring deliverables:
- report-findings, status
