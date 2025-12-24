# Agent-Skill Mappings

Detailed breakdown of which skills each agent can load and when.

## developer

**Identity**: Builder, implementer, fixer.

| Skill | Load When |
|-------|-----------|
| software-engineering | Always (core methodology) |
| test-driven-development | New features, bug fixes requiring tests |
| bun-dev | Bun runtime, package management |
| react-dev | React components, hooks, state |
| hono-dev | API routes, middleware, server |
| ai-sdk | AI features, streaming, tools |

**Typical combos**:
- `software-engineering` + `test-driven-development` (standard feature)
- `software-engineering` + `react-dev` (frontend work)
- `software-engineering` + `hono-dev` + `ai-sdk` (AI API endpoint)

## reviewer

**Identity**: Evaluator, quality guardian.

| Skill | Load When |
|-------|-----------|
| code-review | PR reviews, code audits |
| performance-engineering | Performance concerns, optimization |
| software-architecture | Architecture decisions, structural changes |

**Typical combos**:
- `code-review` (standard PR review)
- `code-review` + `software-architecture` (significant refactor)
- `code-review` + `performance-engineering` (performance-critical code)

## analyst

**Identity**: Investigator, researcher.

| Skill | Load When |
|-------|-----------|
| codebase-analysis | Understanding existing code |
| research-and-report | External research, comparisons |
| pathfinding | Unclear requirements, many unknowns |
| status-reporting | Project status, progress reports |
| report-findings | Structuring analysis output |

**Typical combos**:
- `codebase-analysis` + `report-findings` (codebase exploration)
- `research-and-report` (technology comparison)
- `pathfinding` (requirements clarification)

## debugger

**Identity**: Problem solver, root cause finder.

| Skill | Load When |
|-------|-----------|
| debugging-and-diagnosis | Always (core methodology) |
| codebase-analysis | Understanding surrounding code |

**Typical combos**:
- `debugging-and-diagnosis` (standard debugging)
- `debugging-and-diagnosis` + `codebase-analysis` (unfamiliar codebase)

## tester

**Identity**: Validator, proof provider.

| Skill | Load When |
|-------|-----------|
| scenario-testing | End-to-end validation, integration tests |
| test-driven-development | TDD workflow, test-first approach |

**Typical combos**:
- `scenario-testing` (feature validation)
- `test-driven-development` (TDD implementation)

## skeptic

**Identity**: Complexity challenger, assumption questioner.

| Skill | Load When |
|-------|-----------|
| complexity-analysis | Always (core methodology) |

**Typical combos**:
- `complexity-analysis` (challenge proposals)

## specialist

**Identity**: Domain expert, infrastructure handler.

| Skill | Load When |
|-------|-----------|
| (dynamic) | Based on task domain |

**Examples**:
- CI/CD configuration → loads relevant CI patterns
- Deployment → loads infrastructure patterns
- Security audit → loads security patterns

Specialist loads skills dynamically based on detected domain.

## pattern-analyzer

**Identity**: Pattern extractor, workflow capturer.

| Skill | Load When |
|-------|-----------|
| pattern-analysis | Analyzing code patterns |
| patternify | Extracting reusable workflows |
| conversation-analysis | Mining conversation for patterns |

**Typical combos**:
- `patternify` + `conversation-analysis` (capture workflow from session)
- `pattern-analysis` (analyze codebase patterns)

## Skill Categories

### Core Methodology
Always relevant for the agent's identity:
- developer: software-engineering
- debugger: debugging-and-diagnosis
- skeptic: complexity-analysis

### Domain-Specific
Load based on technology in use:
- bun-dev, react-dev, hono-dev, ai-sdk

### Process-Oriented
Load based on workflow phase:
- test-driven-development, code-review, scenario-testing

### Analysis-Oriented
Load for investigation and research:
- codebase-analysis, research-and-report, pathfinding

### Output-Oriented
Load for structuring deliverables:
- report-findings, status-reporting
