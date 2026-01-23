# Subagent Usage

## Authoring

To create or edit subagents, use the **outfitter:claude-agents** skill.

## Philosophy: Proactive Delegation

**Use subagents aggressively to preserve main conversation context.**

The main agent's context is precious. Every file read, search result, and intermediate reasoning consumes tokens. Subagents run in isolated contexts—when they complete, only their final output returns to the main conversation.

**Default stance**: If a task can be delegated, delegate it.

## When to Delegate

```
Task arrives
├── Exploration/research? → Explore agent (always)
├── Specialized expertise? → Domain agent
├── Multi-file analysis? → Subagent (saves context)
├── Independent subtask? → Background agent
└── Simple, focused work? → Main agent (maybe)
```

**Delegate when:**
- Reading/analyzing more than 2-3 files
- Task requires specialized knowledge (security, performance, testing)
- Work is independent and can run in parallel
- You need to preserve main context for user interaction

**Keep in main when:**
- Direct user Q&A requiring conversation history
- Single-file, simple operations
- Tasks requiring immediate back-and-forth

## Background Invocation

Run agents asynchronously to parallelize work:

```json
{
  "description": "Security audit of auth module",
  "prompt": "Review src/auth/ for vulnerabilities",
  "subagent_type": "outfitter:reviewer",
  "run_in_background": true
}
```

**Retrieve results with TaskOutput:**

```json
{
  "task_id": "agent-abc123",
  "block": true
}
```

**Parallel execution pattern:**

```
Main agent receives complex task
  ├─ Launch outfitter:reviewer (background)
  ├─ Launch outfitter:analyst (background)
  ├─ Launch outfitter:tester (background)
  └─ Continue other work...

Later: TaskOutput to collect results
  └─ Synthesize and report to user
```

## Invocation Parameters

| Parameter | Purpose |
|-----------|---------|
| `description` | Short summary (3-5 words) |
| `prompt` | Detailed instructions |
| `subagent_type` | Agent identifier (see naming below) |
| `run_in_background` | Async execution |
| `resume` | Continue previous agent session |
| `model` | Override model (haiku/sonnet/opus) |

## Agent Naming

**Built-in agents** (no prefix needed):
- `Explore`, `Plan`, `general-purpose`

**Plugin agents** (require `plugin:agent-name` format):
- `outfitter:reviewer`, `outfitter:engineer`, `outfitter:analyst`
- `outfitter:quartermaster`, `outfitter:pattern-analyzer`

Without the prefix, Claude will fail to find the agent and may retry with the correct prefix. Always use the fully qualified name for plugin agents.

## Context-Saving Patterns

### Research Delegation

```json
{
  "description": "Find auth implementation",
  "prompt": "Locate all authentication-related files and summarize the auth flow",
  "subagent_type": "Explore"
}
```

Main agent receives summary, not 50 file contents.

### Parallel Review

```json
// Launch all in single message with run_in_background: true
{ "subagent_type": "outfitter:reviewer", "run_in_background": true, ... }
{ "subagent_type": "outfitter:analyst", "run_in_background": true, ... }
{ "subagent_type": "outfitter:tester", "run_in_background": true, ... }
```

Three reviews run in parallel. Main agent stays responsive.

### Resumable Sessions

```json
{
  "description": "Continue security analysis",
  "prompt": "Now check the session management",
  "subagent_type": "outfitter:reviewer",
  "resume": "abc123"
}
```

Long analysis across multiple invocations without losing agent context.

## Built-in Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| **Explore** | haiku | Fast read-only codebase exploration |
| **general-purpose** | sonnet | Complex multi-step tasks |
| **Plan** | sonnet | Research during plan mode |

## Design Principles

**Generalist over specialist**: Few agents (5-7) loading many skills
**Router pattern**: Agents detect task type, load appropriate skill
**Skill holds methodology**: Agent orchestrates, skill executes
**Context preservation**: Main agent stays lean, subagents do heavy lifting

## Anti-Patterns

- Reading 10+ files in main agent (delegate to Explore)
- Sequential agent calls that could be parallel
- Keeping research results in main context (let subagent summarize)
- Not using `run_in_background` for independent tasks
