# Agent Authoring Skill Gap Analysis

**Date**: 2025-12-31
**Sources Reviewed**:
- <https://code.claude.com/docs/en/sub-agents> (primary subagent documentation)
- <https://code.claude.com/docs/en/plugins-reference> (plugin components reference)

**Current Skill**: `agent-kit/skills/claude-agent-authoring/`

---

## Executive Summary

Comparison of our `claude-agent-authoring` skill against official Claude Code documentation reveals several gaps in configuration fields, recommended workflows, and advanced features. The official docs have evolved to include new capabilities (resumable agents, permission modes, skill auto-loading) that our skill doesn't cover.

---

## Critical Gaps

### 1. Missing `permissionMode` Field

**Source**: <https://code.claude.com/docs/en/sub-agents#configuration-fields>

The official docs document a `permissionMode` field that controls how subagents handle permission requests:

```yaml
---
name: agent-name
permissionMode: default  # Optional - permission mode for the subagent
---
```

**Valid values**:
- `default` - Standard permission handling
- `acceptEdits` - Auto-accept edit operations
- `bypassPermissions` - Skip permission prompts entirely
- `plan` - Planning mode permissions
- `ignore` - Ignore permission requests

**Impact**: Users creating automation-focused agents don't know they can configure permission behavior. This is particularly important for CI/CD agents or batch processing agents.

**Our skill**: No mention of this field in SKILL.md or references/frontmatter.md.

---

### 2. Missing `skills` Field

**Source**: <https://code.claude.com/docs/en/sub-agents#configuration-fields>

> `skills` | No | Comma-separated list of skill names to auto-load when the subagent starts. Subagents do not inherit Skills from the parent conversation. If omitted, no Skills are preloaded.

This is a significant gap because:
1. **Subagents do NOT inherit skills** from the parent conversation
2. Skills must be explicitly loaded via this field
3. This is critical for skill-agent integration patterns

**Example from docs**:

```yaml
---
name: your-sub-agent-name
skills: skill1, skill2  # Optional - skills to auto-load
---
```

**Our skill**: No mention of this field. We discuss agents loading skills but don't explain that it must be configured via frontmatter, not inherited.

---

### 3. Missing `/agents` Command Reference

**Source**: <https://code.claude.com/docs/en/sub-agents#using-the-agents-command-recommended>

The official docs mark `/agents` as the **recommended** approach for agent management:

> The `/agents` command provides a comprehensive interface for subagent management

Features:
- View all available subagents (built-in, user, and project)
- Create new subagents with **guided setup**
- Edit existing custom subagents, including their tool access
- Delete custom subagents
- See which subagents are active when duplicates exist
- **Manage tool permissions** with a complete list of available tools

**Key recommendation from docs**:
> **Recommended**: generate with Claude first, then customize to make it yours

**Our skill**: Focuses entirely on manual file creation. We don't mention `/agents` command at all, missing the officially recommended workflow.

---

### 4. Missing Resumable Subagents Feature

**Source**: <https://code.claude.com/docs/en/sub-agents#resumable-subagents>

This is a significant feature for long-running or multi-session work:

> Subagents can be resumed to continue previous conversations, which is particularly useful for long-running research or analysis tasks that need to be continued across multiple invocations.

**How it works**:
- Each subagent execution is assigned a unique `agentId`
- Agent conversation stored in separate transcript: `agent-{agentId}.jsonl`
- Resume via `resume` parameter with the `agentId`
- Agent continues with full context from previous conversation

**Example workflow**:

```
> Use the code-analyzer agent to start reviewing the authentication module
[Agent completes initial analysis and returns agentId: "abc123"]

> Resume agent abc123 and now analyze the authorization logic as well
[Agent continues with full context from previous conversation]
```

**Programmatic usage**:

```json
{
  "description": "Continue analysis",
  "prompt": "Now examine the error handling patterns",
  "subagent_type": "code-analyzer",
  "resume": "abc123"
}
```

**Use cases**:
- Long-running research broken into multiple sessions
- Iterative refinement without losing context
- Multi-step workflows with sequential context

**Our skill**: No mention of resumable agents or the `resume` parameter.

---

### 5. Missing CLI `--agents` Flag

**Source**: <https://code.claude.com/docs/en/sub-agents#cli-based-configuration>

Dynamic subagent definition via CLI:

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

**Priority**: CLI-defined subagents have lower priority than project-level but higher than user-level.

**Use cases**:
- Quick testing of subagent configurations
- Session-specific subagents that don't need to be saved
- Automation scripts that need custom subagents
- Sharing subagent definitions in documentation or scripts

**Our skill**: No mention of CLI-based configuration.

---

### 6. Missing Built-in Subagents Reference

**Source**: <https://code.claude.com/docs/en/sub-agents#built-in-subagents>

The official docs describe three built-in subagents that users should understand:

#### General-purpose Subagent

- **Model**: Sonnet
- **Tools**: All tools
- **Mode**: Read and write, execute commands
- **Purpose**: Complex research, multi-step operations, code modifications
- **When used**: Tasks requiring both exploration AND modification, complex reasoning, multiple strategies needed

#### Plan Subagent

- **Model**: Sonnet
- **Tools**: Read, Glob, Grep, Bash (exploration only)
- **Purpose**: Research during plan mode
- **When used**: Automatically in plan mode when Claude needs to research codebase
- **Note**: Only used in plan mode, prevents infinite nesting

#### Explore Subagent

- **Model**: Haiku (fast, low-latency)
- **Mode**: Strictly read-only
- **Tools**: Glob, Grep, Read, Bash (read-only commands only)
- **Purpose**: Fast file discovery and code exploration
- **Thoroughness levels**: Quick, Medium, Very thorough

**Why this matters**: Users should know when built-in agents suffice vs when to create custom agents.

**Our skill**: No mention of built-in subagents.

---

## Inaccuracies

### 1. File Priority Order (INCORRECT)

**Source**: <https://code.claude.com/docs/en/sub-agents#file-locations>

Official docs state:
> When subagent names conflict, **project-level subagents take precedence** over user-level subagents.

| Type | Location | Priority |
|------|----------|----------|
| Project subagents | `.claude/agents/` | **Highest** |
| User subagents | `~/.claude/agents/` | Lower |

**Our skill** (references/frontmatter.md lines 110-116):

```markdown
| Scope | Path | Priority |
|-------|------|----------|
| Personal | `~/.claude/agents/` | Highest |
| Project | `<project>/agents/` | Medium |
| Plugin | `<plugin>/agents/` | Lowest |
```

**This is backwards.** Project takes precedence over Personal/User.

---

### 2. Model Default Behavior (UNCLEAR)

**Source**: <https://code.claude.com/docs/en/sub-agents#model-selection>

Official docs clarify:
> **Omitted**: If not specified, uses the **default model configured for subagents** (`sonnet`)

The default is NOT inheritance - it's the configured subagent model (sonnet by default). `inherit` must be explicitly specified to use parent's model.

**Our skill**: Implies inheritance is the default behavior, which is incorrect.

---

### 3. Task Tool Parameter Names (INCONSISTENT)

**Source**: <https://code.claude.com/docs/en/sub-agents#resumable-subagents>

Official docs show Task tool uses:

```json
{
  "description": "Continue analysis",
  "prompt": "Now examine the error handling patterns",
  "subagent_type": "code-analyzer",
  "resume": "abc123"
}
```

**Our skill** (SKILL.md lines 449-458, references/task-tool.md) uses:

```json
{
  "task": "Review authentication code for security vulnerabilities",
  "subagent_type": "security-reviewer",
  "context": [...]
}
```

The actual parameters appear to be `prompt` and `description`, not `task` and `context`. Need to verify against actual implementation, but our docs may be using incorrect parameter names.

---

## Missing Best Practices

### 1. "Generate with Claude First"

**Source**: <https://code.claude.com/docs/en/sub-agents#best-practices>

> **Start with Claude-generated agents**: We highly recommend generating your initial subagent with Claude and then iterating on it to make it personally yours. This approach gives you the best results - a solid foundation that you can customize to your specific needs.

**Our skill**: Doesn't mention this approach. Focuses on manual authoring.

---

### 2. Proactive Invocation Hints

**Source**: <https://code.claude.com/docs/en/sub-agents#automatic-delegation>

> To encourage more proactive subagent use, include phrases like "use PROACTIVELY" or "MUST BE USED" in your `description` field.

**Our skill**: Doesn't mention this technique for improving automatic delegation.

---

### 3. Agent Chaining Syntax

**Source**: <https://code.claude.com/docs/en/sub-agents#chaining-subagents>

Official docs show explicit chaining:

```
> First use the code-analyzer subagent to find performance issues, then use the optimizer subagent to fix them
```

**Our skill**: Has multi-agent workflow examples but doesn't show explicit user-facing chaining syntax.

---

## Plugin Agent Reference

**Source**: <https://code.claude.com/docs/en/plugins-reference#agents>

The plugins-reference shows a slightly different agent structure for plugin agents:

```markdown
---
description: What this agent specializes in
capabilities: ["task1", "task2", "task3"]
---

# Agent Name

Detailed description of the agent's role, expertise, and when Claude should invoke it.

## Capabilities
- Specific task the agent excels at
- Another specialized capability
- When to use this agent vs others

## Context and examples
Provide examples of when this agent should be used and what kinds of problems it solves.
```

**Note**: Shows `capabilities` array field (possibly just example metadata, not schema).

**Integration points**:
- Agents appear in the `/agents` interface
- Claude can invoke agents automatically based on task context
- Agents can be invoked manually by users
- Plugin agents work alongside built-in Claude agents

---

## What Our Skill Does Well

1. **Agent vs Skill distinction table** - Clear differentiation (SKILL.md lines 13-24)
2. **Description format with examples** - Good coverage of example patterns
3. **Tool configuration philosophy** - "Don't over-restrict" guidance is solid
4. **Validation guidance** - References claude-agent-validation skill
5. **Troubleshooting section** - Common issues covered
6. **Multi-agent workflow examples** - EXAMPLES.md has good orchestration patterns
7. **Agent type patterns** - Analysis, Implementation, Review, Testing archetypes

---

## Recommended Improvements

### High Priority

1. **Add `permissionMode` field** to frontmatter documentation
   - Document all valid values
   - Explain use cases for each mode

2. **Add `skills` field** to frontmatter documentation
   - Emphasize that subagents DON'T inherit skills
   - Show how to preload skills

3. **Add `/agents` command section**
   - Position as recommended approach
   - Explain guided setup workflow
   - "Generate with Claude first" guidance

4. **Fix file priority order** in frontmatter.md
   - Project > User (not User > Project)

5. **Add resumable agents section**
   - Explain `resume` parameter
   - Show `agentId` usage
   - Use cases for multi-session work

### Medium Priority

6. **Add built-in agents reference**
   - Explore, Plan, General-purpose
   - When to use vs custom agents

7. **Verify Task tool parameters**
   - Check if `prompt`/`description` vs `task`/`context`
   - Update examples accordingly

8. **Add CLI configuration section**
   - `--agents` flag usage
   - Testing and automation patterns

9. **Clarify model default behavior**
   - Default is sonnet, not inherited
   - `inherit` must be explicit

### Low Priority

10. **Add proactive invocation hints**
    - "PROACTIVELY" and "MUST BE USED" patterns

11. **Add explicit chaining syntax examples**
    - User-facing chaining commands

---

## Source Documentation Structure

For reference, the official docs are structured as:

**<https://code.claude.com/docs/en/sub-agents>**:
- What are subagents?
- Key benefits
- Quick start
- Subagent configuration (file locations, plugin agents, CLI config, file format, configuration fields, model selection, available tools)
- Managing subagents (/agents command, direct file management)
- Using subagents effectively (automatic delegation, explicit invocation)
- Built-in subagents (general-purpose, plan, explore)
- Example subagents (code reviewer, debugger, data scientist)
- Best practices
- Advanced usage (chaining, dynamic selection, resumable)
- Performance considerations

**<https://code.claude.com/docs/en/plugins-reference#agents>**:
- Agents section under plugin components
- File format and structure
- Integration points
