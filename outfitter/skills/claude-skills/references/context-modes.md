# Context Modes

How `context` field controls skill execution environment.

## inherit (default)

Skill runs in the main conversation context.

**Characteristics:**
- Access to full conversation history
- Prior tool results available
- Changes affect main context
- Shared memory/state

**When to use:**
- Skills that build on conversation context
- Iterative workflows
- Skills that need prior decisions/results

```yaml
---
name: code-improver
context: inherit
---
```

## fork

Skill runs in isolated subagent context.

**Characteristics:**
- Clean context (no conversation history)
- Only skill instructions + user input
- Results return to main context, but intermediate work doesn't
- Can run in parallel

**When to use:**
- Prevent context pollution from verbose analysis
- Parallel execution of independent tasks
- Specialized processing that shouldn't affect main flow
- Security-sensitive operations with limited exposure

```yaml
---
name: security-audit
context: fork
agent: outfitter:reviewer
model: sonnet
---
```

## Fork Configuration

When using `context: fork`, additional fields control the subagent:

| Field | Purpose | Example |
|-------|---------|---------|
| `agent` | Agent type for the fork | `outfitter:analyst` |
| `model` | Model override | `haiku`, `sonnet`, `opus` |

### Agent Selection

Choose agents based on the skill's purpose:

| Agent | Best For |
|-------|----------|
| `outfitter:analyst` | Research, analysis, synthesis |
| `outfitter:reviewer` | Code review, security audit |
| `outfitter:engineer` | Implementation, refactoring |
| `Explore` | Read-only codebase exploration |

### Model Selection

| Model | When to Use |
|-------|-------------|
| `haiku` | Fast, simple tasks, exploration |
| `sonnet` | Balanced (default) |
| `opus` | Complex reasoning, nuanced judgment |

## Patterns

### Analysis Without Pollution

```yaml
---
name: codebase-metrics
context: fork
agent: outfitter:analyst
model: haiku
description: Analyzes codebase for metrics without polluting main context
---
```

The skill can do extensive file reading and analysis; only the summary returns.

### Parallel Security Reviews

```yaml
---
name: security-scan
context: fork
agent: outfitter:reviewer
model: sonnet
---
```

Multiple security scans can run in parallel via `run_in_background: true` in Task tool.

### Specialized Processing

```yaml
---
name: log-analyzer
context: fork
agent: Explore
model: haiku
description: Processes large log files without filling main context
---
```

## Decision Guide

| Scenario | Context | Why |
|----------|---------|-----|
| Building on conversation | `inherit` | Needs prior context |
| One-off analysis | `fork` | Keep main context clean |
| Verbose intermediate work | `fork` | Prevent pollution |
| Parallel execution | `fork` | Independent subagents |
| Iterative refinement | `inherit` | Needs state between calls |
| Security-sensitive | `fork` | Isolated, controlled exposure |
