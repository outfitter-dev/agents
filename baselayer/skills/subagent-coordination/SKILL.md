---
name: subagent-coordination
version: 1.0.0
description: |
  Orchestrate baselayer subagents for complex tasks. Defines available agents, their skills, and workflows for multi-agent scenarios. Load when coordinating work across agents, delegating tasks, or deciding which agent handles what.
triggers:
  - orchestrate
  - coordinate
  - delegate
  - which agent
  - multi-agent
  - subagent
---

# Subagent Coordination

Orchestrate baselayer subagents by matching tasks to the right agent + skill combinations.

## Available Subagents

| Agent | Purpose | Primary Skills |
|-------|---------|----------------|
| **developer** | Build, implement, fix, refactor | software-engineering, test-driven-development, bun-dev, react-dev, hono-dev, ai-sdk |
| **reviewer** | Evaluate code, PRs, architecture | code-review, performance-engineering, software-architecture |
| **analyst** | Investigate, research, explore | codebase-analysis, research-and-report, pathfinding, report-findings |
| **debugger** | Diagnose issues, trace problems | debugging-and-diagnosis, codebase-analysis |
| **tester** | Validate, prove, verify behavior | scenario-testing, test-driven-development |
| **skeptic** | Challenge complexity, question assumptions | complexity-analysis |
| **specialist** | Infrastructure, CI/CD, domain expertise | (loads skills dynamically) |
| **pattern-analyzer** | Extract reusable patterns from work | pattern-analysis, patternify, conversation-analysis |

## Task Routing

```
User request arrives
    │
    ├─► "build/implement/fix/refactor" ──► developer
    │
    ├─► "review/critique/audit" ──► reviewer
    │
    ├─► "investigate/research/explore" ──► analyst
    │
    ├─► "debug/diagnose/trace" ──► debugger
    │
    ├─► "test/validate/prove" ──► tester
    │
    ├─► "simplify/challenge/is this overkill" ──► skeptic
    │
    ├─► "deploy/configure/CI" ──► specialist
    │
    └─► "capture this workflow/make reusable" ──► pattern-analyzer
```

## Workflow Patterns

### Sequential Handoff

One agent completes, passes to next:

```
analyst (investigate) → developer (implement) → reviewer (verify) → tester (validate)
```

**Use when**: Clear phases, each requires different expertise.

### Parallel Execution

Multiple agents work simultaneously:

```
┌─► reviewer (code quality)
│
task ──┼─► analyst (impact analysis)
│
└─► tester (regression tests)
```

**Use when**: Independent concerns, time-sensitive, comprehensive coverage needed.

### Challenge Loop

Build → challenge → refine:

```
developer (propose) ←→ skeptic (challenge) → developer (refine)
```

**Use when**: Complex architecture, preventing over-engineering, high-stakes decisions.

### Investigation Chain

Narrow down, then fix:

```
analyst (scope) → debugger (root cause) → developer (fix) → tester (verify)
```

**Use when**: Bug reports, production issues, unclear symptoms.

## Agent + Skill Combinations

### Development Tasks

| Task | Agent | Skills |
|------|-------|--------|
| New feature | developer | software-engineering, test-driven-development |
| Bug fix | debugger → developer | debugging-and-diagnosis, software-engineering |
| Refactor | developer + skeptic | software-engineering, complexity-analysis |
| API endpoint | developer | hono-dev, software-engineering |
| React component | developer | react-dev, software-engineering |
| AI feature | developer | ai-sdk, software-engineering |

### Review Tasks

| Task | Agent | Skills |
|------|-------|--------|
| PR review | reviewer | code-review |
| Architecture review | reviewer | software-architecture |
| Performance audit | reviewer | performance-engineering |
| Pre-merge check | reviewer + tester | code-review, scenario-testing |

### Analysis Tasks

| Task | Agent | Skills |
|------|-------|--------|
| Codebase exploration | analyst | codebase-analysis |
| Research question | analyst | research-and-report |
| Unclear requirements | analyst | pathfinding |
| Status report | analyst | status-reporting, report-findings |

### Validation Tasks

| Task | Agent | Skills |
|------|-------|--------|
| Feature validation | tester | scenario-testing |
| TDD implementation | developer or tester | test-driven-development |
| Integration testing | tester | scenario-testing |

## Coordination Rules

1. **Single owner**: One agent owns each task phase
2. **Clear handoffs**: Explicit deliverables between agents
3. **Skill loading**: Agent loads only needed skills
4. **User prefs first**: Check CLAUDE.md before applying defaults
5. **Minimal agents**: Don't parallelize what can be sequential

## When to Escalate

- **Blocked**: Agent can't proceed → route to analyst for investigation
- **Conflicting findings**: Multiple agents disagree → surface to user
- **Scope creep**: Task expands beyond agent's domain → re-route
- **Missing context**: Not enough info → analyst with pathfinding skill

## Anti-Patterns

- Running all agents on every task (wasteful)
- Skipping reviewer for "small changes" (risk)
- Developer debugging without debugger skills (inefficient)
- Parallel agents with dependencies (race conditions)
- Not challenging complex proposals with skeptic (over-engineering)

## Quick Reference

**"I need to build X"** → developer + software-engineering + test-driven-development

**"Review this PR"** → reviewer + code-review

**"Why is this broken?"** → debugger + debugging-and-diagnosis

**"Is this approach overkill?"** → skeptic + complexity-analysis

**"Prove this works"** → tester + scenario-testing

**"What's the codebase doing?"** → analyst + codebase-analysis

**"Deploy to production"** → specialist + (domain skills)

**"Make this workflow reusable"** → pattern-analyzer + patternify
