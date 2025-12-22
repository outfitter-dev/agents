---
name: subagent-authoring
description: Creates or updates Claude Code agents/subagents with proper YAML frontmatter, clear system prompts, and best practices. Use when creating new agents, authoring subagents, building custom AI assistants, or when the user mentions creating an agent, subagent development, or includes `--create-agent` or `--new-agent` flag.
allowed-tools: Read Write Edit Grep Glob TodoWrite
---

# Agent Authoring

Creates and updates Claude Code agents (subagents) following official best practices and conventions.

## Quick Start

When creating a new agent:

1. **Clarify requirements**
   - What is this agent's specialty/expertise?
   - When should it be invoked (triggers)?
   - Location: personal (`~/.claude/agents/`) or project (`.claude/agents/`)?
   - What tools does it need?

2. **Choose agent type**
   - **Focused specialist** - Single, clear responsibility (recommended)
   - **Domain expert** - Broader domain knowledge (e.g., data-scientist, debugger)
   - **Workflow orchestrator** - Coordinates multi-step processes

3. **Generate name**
   - Pattern: `[role]-[specialty]` or `[specialty]`
   - Examples: `code-reviewer`, `test-runner`, `debugger`, `data-scientist`
   - Use lowercase with hyphens (kebab-case)

4. **Write agent file**
   - Valid YAML frontmatter with required fields
   - Clear, detailed system prompt
   - Specific invocation triggers in description
   - Appropriate tool restrictions (if needed)

5. **Test the agent**
   - Invoke explicitly: "Use the [agent-name] agent to..."
   - Verify automatic invocation works with trigger keywords
   - Check tool access is appropriate

## Agent File Structure

```markdown
---
name: agent-name
description: When this agent should be invoked with trigger keywords
tools: Read, Grep, Glob  # Optional - omit to inherit all tools
model: sonnet  # Optional - sonnet, opus, haiku, or inherit
color: blue  # Optional - UI visual identifier
---

# Agent Name

Your agent's system prompt goes here.

## Role and Expertise
Define who this agent is and what it specializes in.

## When Invoked
Describe the triggering conditions and what the agent does first.

## Process/Workflow
Step-by-step approach the agent follows:
1. First step
2. Second step
3. ...

## Key Practices
Important guidelines, constraints, or best practices.

## Output Format
How the agent presents results.
```

## YAML Frontmatter Fields

### Required Fields

**`name`** (required)
- Unique identifier using lowercase and hyphens
- Pattern: `[role]-[specialty]` or `[specialty]`
- Examples: `code-reviewer`, `debugger`, `test-runner`

**`description`** (required)
- Natural language description of when to invoke this agent
- Include trigger keywords users would mention
- Be specific about the agent's purpose and use cases
- Add "use PROACTIVELY" or "MUST BE USED" for automatic invocation

Example:
```yaml
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
```

### Optional Fields

**`tools`** (optional)
- Comma-separated list of allowed tools
- If omitted, inherits all tools from main thread (including MCP tools)
- Restrict tools for security or focus

**`model`** (optional)
- Specify which model to use: `sonnet`, `opus`, `haiku`, or `inherit`
- `inherit` - Use same model as main conversation
- If omitted, defaults to configured subagent model (usually `sonnet`)

**`color`** (optional)
- Visual identifier in Claude Code UI
- Values: `blue`, `red`, `yellow`, `green`, `purple`, etc.

## System Prompt Best Practices

### Structure

1. **Role definition** - Who is this agent?
2. **Invocation trigger** - What happens when agent starts?
3. **Process/workflow** - Step-by-step approach
4. **Key practices** - Guidelines and constraints
5. **Output format** - How to present results

### Writing Style

- **Be specific** - Provide detailed, actionable instructions
- **Include examples** - Show concrete scenarios
- **Set constraints** - Define what NOT to do
- **Add checklists** - Make processes repeatable
- **Prioritize output** - Help agent organize findings

## File Locations

### User-Level Agents

**Location**: `~/.claude/agents/`
**Scope**: Available across all projects
**Use for**: Personal workflow agents you use everywhere

```bash
mkdir -p ~/.claude/agents
```

### Project-Level Agents

**Location**: `.claude/agents/`
**Scope**: Available only in current project
**Use for**: Project-specific agents, team-shared workflows

```bash
mkdir -p .claude/agents
```

**Priority**: Project agents override user agents if names conflict.

## Creating Agents

### Method 1: Interactive (Recommended)

Use the `/agents` command for guided creation:

```
/agents
```

This provides:
- Interactive tool selection
- Live validation
- Easy editing with `e` key
- Claude-assisted generation

### Method 2: Direct File Creation

Create agent file manually:

```bash
# User agent
cat > ~/.claude/agents/test-runner.md << 'EOF'
---
name: test-runner
description: Use proactively to run tests and fix failures
tools: Read, Edit, Bash
---

You are a test automation expert. When you see code changes, proactively run the appropriate tests. If tests fail, analyze the failures and fix them while preserving the original test intent.
EOF
```

## Testing Agents

### Explicit Invocation

Test by directly requesting the agent:

```
> Use the code-reviewer agent to check my recent changes
> Have the test-runner agent verify my tests still pass
> Ask the debugger agent to investigate this error
```

### Automatic Invocation

Test by using trigger keywords from the description:

```
> Can you review this code?  # Should trigger code-reviewer
> The tests are failing  # Should trigger test-runner or debugger
```

## Common Agent Patterns

### Read-Only Analyst

For agents that analyze but don't modify:

```yaml
tools: Read, Grep, Glob, Bash
```

Use for: code analyzers, security auditors, documentation reviewers

### Full-Access Implementer

For agents that make changes:

```yaml
# Omit tools field to inherit all tools
```

Use for: test runners, debuggers, refactoring agents

### Specialized Tool Set

For agents needing specific capabilities:

```yaml
tools: Read, Write, Bash
```

Use for: data scientists (need write for output), report generators

## Best Practices Summary

1. **Start with Claude generation** - Use `/agents` to generate, then customize
2. **Single responsibility** - Each agent has one clear purpose
3. **Detailed prompts** - More guidance = better results
4. **Limit tools** - Only grant necessary tools (or omit for full access)
5. **Specific descriptions** - Include trigger keywords for automatic invocation
6. **Test thoroughly** - Both explicit and automatic invocation
7. **Version control** - Check project agents into git
8. **Document well** - Clear system prompts with examples

## Troubleshooting

**Agent not being invoked automatically:**
- Check description has specific trigger keywords
- Add "use PROACTIVELY" or "MUST BE USED" to description
- Test with explicit invocation first
- Verify agent file has valid YAML

**Agent has wrong tools:**
- Check `tools` field in frontmatter
- Omit `tools` field to inherit all tools
- Use `/agents` command to view/edit tool access
- Remember: MCP tools inherited when `tools` field omitted

**Agent giving unexpected results:**
- Review system prompt for clarity
- Add more specific instructions
- Include examples in prompt
- Test with different phrasings

**Can't find agent file:**
```bash
# List all agents
ls ~/.claude/agents/
ls .claude/agents/

# Search for agent by name
find ~/.claude/agents .claude/agents -name "*test*.md" 2>/dev/null
```

## Further Reading

For detailed examples and advanced patterns, see:
- [EXAMPLES.md](EXAMPLES.md) - Complete agent examples with analysis
- [REFERENCE.md](REFERENCE.md) - Comprehensive field reference and patterns

## References

- `docs/claude/subagents.md` - Official subagents documentation
- `~/.claude/agents/` - Example agents to learn from
- `/agents` command - Interactive agent management
- `docs/claude/cli-reference.md` - CLI `--agents` flag documentation
