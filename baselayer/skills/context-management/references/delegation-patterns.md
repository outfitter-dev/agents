# Delegation Patterns for Context Preservation

How to delegate work to preserve main conversation context.

> **TL;DR**: Subagents run in isolated contexts—only their summary returns. Delegate: 5+ file reads, codebase searches, specialized reviews. Keep in main: user Q&A, simple edits, files already in context. Use `run_in_background: true` for parallel work. Track delegated tasks in TodoWrite with agent IDs.

## The Context Problem

Main conversation context is ~128K tokens. Every operation consumes it:
- Reading a file: file contents enter context
- Search results: matches enter context
- Reasoning: your analysis consumes tokens
- Tool results: outputs accumulate

Subagents run in **isolated contexts**. When they complete, only their final output (summary, findings, results) returns to main context. The files they read, searches they ran, reasoning they did — all stay in their isolated context.

## Delegation Decision Matrix

| Task Type | Delegate? | Agent | Why |
|-----------|-----------|-------|-----|
| Read 1-2 files | No | Main | Already focused |
| Read 5+ files | Yes | Explore | Preserves main context |
| Codebase search | Yes | Explore | Returns summary, not raw results |
| Security review | Yes | ranger | Specialized + isolated |
| Performance analysis | Yes | analyst | Research-heavy |
| Simple edit | No | Main | Quick, in-context |
| Multi-file refactor | Yes | senior-dev | Coordinates changes |
| Test validation | Yes | tester | Isolated execution |
| User Q&A | No | Main | Needs conversation history |

## Pattern: Research Delegation

Instead of reading many files yourself:

```json
{
  "description": "Find auth implementation",
  "prompt": "Locate all authentication-related files. Summarize: (1) auth flow, (2) libraries used, (3) key entry points",
  "subagent_type": "Explore"
}
```

**Returns to main context**: ~50 lines of summary
**Stayed in subagent context**: contents of 15 files

## Pattern: Parallel Independent Reviews

When multiple concerns need analysis:

```json
// All in single message, all run_in_background: true
{
  "description": "Security review",
  "prompt": "Review src/auth/ for security vulnerabilities",
  "subagent_type": "ranger",
  "run_in_background": true
}
{
  "description": "Performance review",
  "prompt": "Analyze src/auth/ for performance issues",
  "subagent_type": "analyst",
  "run_in_background": true
}
{
  "description": "Test coverage",
  "prompt": "Assess test coverage for src/auth/",
  "subagent_type": "tester",
  "run_in_background": true
}
```

Three reviews run simultaneously. Main agent stays responsive. Collect results with `TaskOutput` when ready.

## Pattern: Sequential Handoff with Context

When later agents need earlier agents' output:

```
1. analyst researches → returns findings
2. Main agent extracts key points
3. senior-dev implements → receives key points in prompt
4. ranger reviews → receives implementation summary
```

Don't pass full agent output to next agent. Extract and summarize.

## Pattern: Resumable Long-Running Work

For multi-phase work:

```json
// Phase 1
{
  "description": "Begin auth analysis",
  "prompt": "Analyze authentication patterns in src/auth/",
  "subagent_type": "analyst"
}
// Returns agent-id: abc123

// Phase 2 (later)
{
  "description": "Continue auth analysis",
  "prompt": "Now examine the session management aspect",
  "subagent_type": "analyst",
  "resume": "abc123"
}
```

Agent preserves its full context across invocations. Main agent stays lean.

## What to Keep in Main Context

Not everything should be delegated:

**Keep in main**:
- Direct user interaction
- Final synthesis and decisions
- Coordination logic
- Files already read (don't re-delegate)
- Simple, quick operations

**Delegate**:
- Exploratory research
- Multi-file analysis
- Specialized reviews
- Test execution
- Background validation

## TodoWrite Integration

Track delegated work:

```
- [ ] [analyst] Research caching patterns (task-id: abc123, background)
- [ ] Wait for analyst results
- [ ] [senior-dev] Implement cache layer (after analyst, depends-on: abc123)
- [ ] [ranger] Review implementation (after senior-dev)
```

Update when agents complete:

```
- [x] [analyst] Research caching patterns (task-id: abc123) → Redis recommended
- [x] Wait for analyst results → received, Redis approach confirmed
- [ ] [in_progress] [senior-dev] Implement Redis cache layer
```

## Anti-Patterns

**Delegating simple work**: Single file edit doesn't need an agent.

**Over-parallelization**: Don't run 10 agents when 3 would do.

**Missing handoff context**: Agents need enough info to act independently.

**Forgetting to collect**: Background agents finish but results never retrieved.

**Re-delegating**: If file already in context, don't send agent to read it again.

## Context Budget Mental Model

Think of context as a budget:

```
Total: 128K tokens
System prompts: ~10K
User messages: ~5K
Your reasoning: ~20K
Tool results: ~???
```

Every file read, search result, and agent output draws from `tool results`. Delegation shifts that cost to isolated contexts, keeping main budget available for synthesis and user interaction.
