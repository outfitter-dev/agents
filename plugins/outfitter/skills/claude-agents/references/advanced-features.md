# Advanced Agent Features

Advanced capabilities for agent configuration and usage.

## Resumable Agents

Agents can be resumed to continue previous conversations across multiple invocations.

### How It Works

1. Each agent execution returns a unique `agentId`
2. Agent conversation stored in separate transcript: `agent-{agentId}.jsonl`
3. Resume via `resume` parameter with the `agentId`
4. Agent continues with full context from previous conversation

### Example Workflow

```
> Use the code-analyzer agent to start reviewing the authentication module
[Agent completes initial analysis and returns agentId: "abc123"]

> Resume agent abc123 and now analyze the authorization logic as well
[Agent continues with full context from previous conversation]
```

### Programmatic Usage

```json
{
  "description": "Continue analysis",
  "prompt": "Now examine the error handling patterns",
  "subagent_type": "code-analyzer",
  "resume": "abc123"
}
```

### Use Cases

- **Long-running research**: Break complex analysis into multiple sessions
- **Iterative refinement**: Continue improving without losing context
- **Multi-step workflows**: Sequential tasks that build on previous context

## CLI Agent Configuration

Define agents dynamically via CLI for testing or automation.

### `--agents` Flag

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

### Priority

CLI-defined agents have lower priority than project-level but higher than user-level:

1. Project (`.claude/agents/`) — Highest
2. CLI (`--agents`) — Medium
3. User (`~/.claude/agents/`) — Lower
4. Plugin — Lowest

### Use Cases

- Quick testing of agent configurations before committing
- Session-specific agents that don't need to persist
- Automation scripts with custom agents
- Sharing agent definitions in documentation

## Built-in Agents

Claude Code includes built-in agents you should understand before creating custom agents.

### General-purpose Agent

- **Model**: Sonnet
- **Tools**: All tools
- **Mode**: Read and write, execute commands
- **Purpose**: Complex research, multi-step operations, code modifications

**When used:**
- Tasks requiring both exploration AND modification
- Complex reasoning across multiple files
- When multiple strategies may be needed

### Plan Agent

- **Model**: Sonnet
- **Tools**: Read, Glob, Grep, Bash (exploration only)
- **Purpose**: Research during plan mode

**When used:**
- Automatically in plan mode when Claude needs to research codebase
- Only used in plan mode (prevents infinite nesting)

### Explore Agent

- **Model**: Haiku (fast, low-latency)
- **Mode**: Strictly read-only
- **Tools**: Glob, Grep, Read, Bash (read-only commands only)
- **Purpose**: Fast file discovery and code exploration

**Thoroughness levels:**
- `quick` — Basic searches
- `medium` — Moderate exploration
- `very thorough` — Comprehensive analysis

### When to Create Custom vs Use Built-in

**Use built-in agents when:**
- Task is general code exploration (Explore)
- Task is general implementation (General-purpose)
- You're in plan mode (Plan)

**Create custom agents when:**
- You need specialized domain expertise
- You want consistent output formats
- You need specific tool restrictions
- You want proactive invocation based on keywords

## Proactive Invocation

To encourage automatic agent use, include trigger phrases in descriptions:

```yaml
description: |
  Use this agent PROACTIVELY after any code changes for security review.
  MUST BE USED when authentication or authorization code is modified.
```

**Effective phrases:**
- "Use PROACTIVELY"
- "MUST BE USED when..."
- "Automatically invoke for..."

## Agent Chaining

Explicit user-facing syntax for chaining agents:

```
> First use the code-analyzer agent to find performance issues,
  then use the optimizer agent to fix them
```

Claude will:
1. Invoke code-analyzer agent
2. Collect results
3. Invoke optimizer agent with context from first agent
4. Return combined results
