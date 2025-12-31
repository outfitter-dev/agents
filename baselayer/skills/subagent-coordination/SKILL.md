---
name: subagent-coordination
version: 2.1.0
description: |
  Orchestrate baselayer subagents for complex tasks. Defines available agents, their skills, and workflows for multi-agent scenarios. Load when coordinating work across agents, delegating tasks, or deciding which agent handles what.
triggers:
  - orchestrate
  - coordinate
  - delegate
  - dispatch
  - which agent
  - multi-agent
  - subagent
---

# Subagent Coordination

Orchestrate baselayer subagents by matching tasks to the right agent + skill combinations.

## Orchestration Planning

For complex multi-agent tasks, **start with the Plan subagent** to research and design the orchestration strategy before execution.

```
Complex task arrives
    │
    ├─► Plan subagent (research phase)
    │   └─► Explore codebase, gather context
    │   └─► Identify which agents and skills needed
    │   └─► Design execution sequence (sequential, parallel, or hybrid)
    │   └─► Return orchestration plan
    │
    └─► Execute plan (dispatch agents per plan)
```

**Plan subagent benefits**:
- Runs in isolated context — doesn't consume main conversation tokens
- Can read many files without bloating orchestrator context
- Returns concise plan for execution

**When to use Plan subagent**:
- Task touches multiple domains (auth + performance + testing)
- Unknown codebase area — needs exploration first
- Sequence of agents matters (dependencies between steps)
- High-stakes changes requiring careful coordination

## Roles and Agents

Coordination uses **roles** (what function is needed) mapped to **agents** (who fulfills it). This allows substitution when better-suited agents are available.

### Baselayer Agents

| Role | Agent | Purpose |
|------|-------|---------|
| coding | **senior-dev** | Build, implement, fix, refactor |
| reviewing | **ranger** | Evaluate code, PRs, architecture, security |
| research | **analyst** | Investigate, research, explore |
| debugging | **debugger** | Diagnose issues, trace problems |
| testing | **tester** | Validate, prove, verify behavior |
| challenging | **skeptic** | Challenge complexity, question assumptions |
| specialist | **specialist** | Domain expertise (CI/CD, design, accessibility, etc.) |
| patterns | **pattern-analyzer** | Extract reusable patterns from work |

### Other Available Agents

Additional agents may be available in your environment (user-defined, plugin-provided, or built-in). When dispatching:

1. Check available agents for best fit to the role
2. Prefer specialized agents over generalists when they match the task
3. Fall back to baselayer agents when no better option exists

Examples of role substitution:
- **coding** → `senior-engineer`, `developer`, `senior-dev`
- **reviewing** → `security-auditor`, `code-reviewer`, `ranger`
- **research** → `research-engineer`, `docs-librarian`, `analyst`
- **specialist** → `cicd-expert`, `design-agent`, `accessibility-auditor`, `bun-expert`

## Task Routing

Route by role, then select the best available agent for that role:

```
User request arrives
    │
    ├─► "build/implement/fix/refactor" ──► coding role
    │
    ├─► "review/critique/audit" ──► reviewing role
    │
    ├─► "investigate/research/explore" ──► research role
    │
    ├─► "debug/diagnose/trace" ──► debugging role
    │
    ├─► "test/validate/prove" ──► testing role
    │
    ├─► "simplify/challenge/is this overkill" ──► challenging role
    │
    ├─► "deploy/configure/CI/design/a11y" ──► specialist role
    │
    └─► "capture this workflow/make reusable" ──► patterns role
```

## Workflow Patterns

### Sequential Handoff

One agent completes, passes to next:

```
research (investigate) → coding (implement) → reviewing (verify) → testing (validate)
```

**Use when**: Clear phases, each requires different expertise.

### Parallel Execution

Multiple agents work simultaneously using `run_in_background: true`:

```
┌─► reviewing (code quality)
│
task ──┼─► research (impact analysis)
│
└─► testing (regression tests)
```

**Use when**: Independent concerns, time-sensitive, comprehensive coverage needed.

### Challenge Loop

Build → challenge → refine:

```
coding (propose) ←→ challenging (evaluate) → coding (refine)
```

**Use when**: Complex architecture, preventing over-engineering, high-stakes decisions.

### Investigation Chain

Narrow down, then fix:

```
research (scope) → debugging (root cause) → coding (fix) → testing (verify)
```

**Use when**: Bug reports, production issues, unclear symptoms.

## Role + Skill Combinations

### Coding Role

| Task | Skills |
|------|--------|
| New feature | software-engineering, test-driven-development |
| Bug fix | debugging-and-diagnosis → software-engineering |
| Refactor | software-engineering + complexity-analysis |
| API endpoint | hono-dev, software-engineering |
| React component | react-dev, software-engineering |
| AI feature | ai-sdk, software-engineering |

### Reviewing Role

| Task | Skills |
|------|--------|
| PR review | code-review |
| Architecture review | software-architecture |
| Performance audit | performance-engineering |
| Security audit | security-engineering |
| Pre-merge check | code-review + scenario-testing |

### Research Role

| Task | Skills |
|------|--------|
| Codebase exploration | codebase-analysis |
| Research question | research-and-report |
| Unclear requirements | pathfinding |
| Status report | status-reporting, report-findings |

### Testing Role

| Task | Skills |
|------|--------|
| Feature validation | scenario-testing |
| TDD implementation | test-driven-development |
| Integration testing | scenario-testing |

## Advanced Execution Patterns

### Background Execution

Run agents asynchronously for parallel work:

```json
{
  "description": "Security review",
  "prompt": "Review auth module for vulnerabilities",
  "subagent_type": "ranger",
  "run_in_background": true
}
```

Retrieve results with `TaskOutput`:

```json
{
  "task_id": "agent-abc123",
  "block": true
}
```

### Chaining Subagents

Sequence agents for complex workflows — each agent's output informs the next:

```
research agent → "Found 3 auth patterns in use"
    ↓
coding agent → "Implementing refresh token flow using pattern A"
    ↓
reviewing agent → "Verified implementation, found 1 issue"
    ↓
coding agent → "Fixed issue, ready for merge"
```

Pass context explicitly between agents via prompt.

### Resumable Sessions

Continue long-running work across invocations:

```json
{
  "description": "Continue security analysis",
  "prompt": "Now examine session management",
  "subagent_type": "ranger",
  "resume": "agent-abc123"
}
```

Agent preserves full context from previous execution.

**Use cases**:
- Multi-phase research spanning topics
- Iterative refinement without re-explaining context
- Long debugging sessions with incremental discoveries

### Model Selection

Override model for specific needs:

```json
{
  "subagent_type": "analyst",
  "model": "haiku"  // Fast, cheap for exploration
}
```

- **haiku**: Fast exploration, simple queries
- **sonnet**: Balanced reasoning (default)
- **opus**: Complex analysis, nuanced judgment

## Coordination Rules

1. **Single owner**: One role owns each task phase
2. **Clear handoffs**: Explicit deliverables between agents
3. **Skill loading**: Agent loads only needed skills
4. **User prefs first**: Check `CLAUDE.md` before applying defaults
5. **Minimal agents**: Don't parallelize what can be sequential

## Decision Framework

When agents face implementation choices:

1. **Favor existing patterns** — Match what's already in the codebase
2. **Prefer simplicity** — Cleverness is a liability; simple is maintainable
3. **Optimize for maintainability** — Next developer (or agent) must understand it
4. **Consider backward compatibility** — Breaking changes require explicit approval
5. **Document trade-offs** — When choosing between options, record why

These principles apply across all roles. Agents should surface decisions to the orchestrator when trade-offs are significant.

## Communication Style

Orchestrators and agents should:

- **Report progress** at each major step (don't go silent)
- **Flag blockers immediately** — don't spin on unsolvable problems
- **Provide clear summaries** of delegated work (what was done, what remains)
- **Include file paths and line numbers** when referencing code

Progress format:
```
░░░░░░░░░░ [1/5] research: Exploring auth patterns
▓▓▓▓░░░░░░ [2/5] coding: Implementing refresh token flow
```

## When to Escalate

- **Blocked**: Agent can't proceed → route to research role
- **Conflicting findings**: Multiple agents disagree → surface to user
- **Scope creep**: Task expands beyond role's domain → re-route
- **Missing context**: Not enough info → research role with pathfinding skill

## Anti-Patterns

- Running all agents on every task (wasteful)
- Skipping reviewing role for "small changes" (risk)
- Coding role debugging without debugging skills (inefficient)
- Parallel agents with dependencies (race conditions)
- Not challenging complex proposals (over-engineering)

## Quick Reference

**"I need to build X"** → coding role + TDD skills

**"Review this PR"** → reviewing role + code-review

**"Why is this broken?"** → debugging role + debugging-and-diagnosis

**"Is this approach overkill?"** → challenging role + complexity-analysis

**"Prove this works"** → testing role + scenario-testing

**"What's the codebase doing?"** → research role + codebase-analysis

**"Deploy to production"** → specialist role + domain skills

**"Make this workflow reusable"** → patterns role + patternify
