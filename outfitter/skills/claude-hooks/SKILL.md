---
name: claude-hooks
description: This skill should be used when creating hooks, automating workflows, or when "PreToolUse", "PostToolUse", "hooks.json", "event handler", or "create hook" are mentioned.
metadata:
  version: "2.0.0"
  related-skills:
    - claude-commands
    - claude-plugins
    - claude-agents
    - claude-config
---

# Claude Hook Authoring

Create event hooks that automate workflows, validate operations, and respond to Claude Code events.

## Hook Types

Three hook execution types:

| Type | Best For | Example |
|------|----------|---------|
| **command** | Deterministic checks, external tools, performance | Bash script validates paths |
| **prompt** | Complex reasoning, context-aware validation | LLM evaluates if action is safe |
| **agent** | Multi-step verification requiring tool access | Agent with Read/Grep tools verifies consistency |

**Command hooks** (for deterministic/fast checks):

```json
{
  "type": "command",
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
  "timeout": 10
}
```

**Prompt hooks** (recommended for complex logic):

```json
{
  "type": "prompt",
  "prompt": "Evaluate if this file write is safe: $TOOL_INPUT. Check for sensitive paths, credentials, path traversal. Return 'allow' or 'deny' with reason.",
  "timeout": 30
}
```

**Agent hooks** (for complex multi-step verification):

```json
{
  "type": "agent",
  "prompt": "Verify this code change maintains consistency with the existing codebase. Check imports, type signatures, and naming conventions. Use Read and Grep tools as needed.",
  "allowedTools": ["Read", "Grep", "Glob"],
  "timeout": 120
}
```

Agent hooks spawn a subagent with tool access for verification tasks that require reading files, searching code, or multi-step reasoning. Use when prompt hooks are insufficient.

## Hook Events

| Event | When | Can Block | Common Uses |
|-------|------|-----------|-------------|
| **PreToolUse** | Before tool executes | Yes | Validate commands, check paths, enforce policies |
| **PostToolUse** | After tool succeeds | No | Auto-format, run linters, update docs |
| **PostToolUseFailure** | After tool fails | No | Error logging, retry logic, notifications |
| **PermissionRequest** | Permission dialog shown | Yes | Auto-allow/deny based on rules |
| **UserPromptSubmit** | User submits prompt | No | Add context, log activity, augment prompts |
| **Notification** | Claude sends notification | No | External alerts, logging |
| **Stop** | Main agent finishes | No | Cleanup, completion notifications |
| **SubagentStart** | Subagent spawns | No | Track subagent usage |
| **SubagentStop** | Subagent finishes | No | Log results, trigger follow-ups |
| **Setup** | `--init`, `--init-only`, or `--maintenance` flags | No | Initialize environment, install dependencies |
| **PreCompact** | Before context compacts | No | Backup conversation, preserve context |
| **SessionStart** | Session starts/resumes | No | Load context, show status, init resources |
| **SessionEnd** | Session ends | No | Cleanup, save state, log metrics |

See [references/hook-types.md](references/hook-types.md) for detailed documentation of each event.

## Quick Start

### Auto-Format TypeScript

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts|*.tsx)",
        "hooks": [{
          "type": "command",
          "command": "biome check --write \"$file\"",
          "timeout": 10
        }]
      }
    ]
  }
}
```

### Block Dangerous Commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-bash.sh",
          "timeout": 5
        }]
      }
    ]
  }
}
```

**validate-bash.sh**:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE '\brm\s+-rf\s+/'; then
  echo "Dangerous command blocked: rm -rf /" >&2
  exit 2  # Exit 2 = block and show error to Claude
fi

exit 0
```

### Smart Validation with Prompt Hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "prompt",
          "prompt": "Analyze this file operation for safety. Check: 1) No sensitive paths (/etc, ~/.ssh), 2) No credentials in content, 3) No path traversal (..). Tool input: $TOOL_INPUT. Respond with JSON: {\"decision\": \"allow|deny\", \"reason\": \"...\"}",
          "timeout": 30
        }]
      }
    ]
  }
}
```

## Configuration Locations

| Location | Scope | Committed |
|----------|-------|-----------|
| `.claude/settings.json` | Project (team-shared) | Yes |
| `.claude/settings.local.json` | Project (local only) | No |
| `~/.claude/settings.json` | Personal (all projects) | No |
| `plugin/hooks/hooks.json` | Plugin | Yes |

### Plugin Format (hooks.json)

Uses wrapper structure:

```json
{
  "description": "Plugin hooks for auto-formatting",
  "hooks": {
    "PostToolUse": [...]
  }
}
```

### Settings Format (settings.json)

Direct structure (no wrapper):

```json
{
  "hooks": {
    "PostToolUse": [...]
  }
}
```

## Matchers

Matchers determine which tool invocations trigger the hook. Case-sensitive.

```json
{"matcher": "Write"}                    // Exact match
{"matcher": "Edit|Write"}               // Multiple tools (OR)
{"matcher": "*"}                        // All tools
{"matcher": "Write(*.py)"}              // File pattern
{"matcher": "Write|Edit(*.ts|*.tsx)"}   // Multiple + pattern
{"matcher": "mcp__memory__.*"}          // MCP server tools
{"matcher": "mcp__github__create_issue"} // Specific MCP tool
```

**Lifecycle hooks** (SessionStart, SessionEnd, Stop, Notification) use special matchers:

```json
// SessionStart matchers
{"matcher": "startup"}   // Initial start
{"matcher": "resume"}    // --resume or --continue
{"matcher": "clear"}     // After /clear
{"matcher": "compact"}   // After compaction

// PreCompact matchers
{"matcher": "manual"}    // User triggered /compact
{"matcher": "auto"}      // Automatic compaction
```

See [references/matchers.md](references/matchers.md) for advanced patterns.

## Input Format

All hooks receive JSON on stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "hook_event_name": "PreToolUse",
  "permission_mode": "ask",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/project/src/file.ts",
    "content": "export const foo = 'bar';"
  }
}
```

**Event-specific fields**:
- Tool hooks: `tool_name`, `tool_input`, `tool_result` (PostToolUse)
- UserPromptSubmit: `user_prompt`
- Stop/SubagentStop: `reason`

**Prompt hooks** access fields via placeholders:
- `$ARGUMENTS` - Full context passed to the hook (general-purpose)
- `$TOOL_INPUT` - Tool input for tool-related events
- `$TOOL_RESULT` - Tool result (PostToolUse only)
- `$USER_PROMPT` - User prompt (UserPromptSubmit only)

### Reading Input

**Bash**:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
```

**Bun/TypeScript**:

```typescript
#!/usr/bin/env bun
const input = await Bun.stdin.json();
const toolName = input.tool_name;
const filePath = input.tool_input?.file_path;
```

## Output Format

### Exit Codes (Simple)

```bash
exit 0   # Success, continue execution
exit 2   # Block operation (PreToolUse only), stderr shown to Claude
exit 1   # Warning, stderr shown to user, continues
```

### JSON Output (Advanced)

```json
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": "Context for Claude",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Explanation",
    "updatedInput": {"modified": "field"}
  }
}
```

**PreToolUse** can modify tool input via `updatedInput` and control permissions via `permissionDecision`.

## Environment Variables

| Variable | Availability | Description |
|----------|--------------|-------------|
| `$CLAUDE_PROJECT_DIR` | All hooks | Project root directory |
| `$CLAUDE_PLUGIN_ROOT` | Plugin hooks | Plugin root (use for portable paths) |
| `$file` | PostToolUse (Write/Edit) | Path to affected file |
| `$CLAUDE_ENV_FILE` | SessionStart | Write env vars here to persist |
| `$CLAUDE_CODE_REMOTE` | All hooks | Set if running in remote context |

**Plugin hooks** should always use `${CLAUDE_PLUGIN_ROOT}` for portability:

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
}
```

**SessionStart** can persist environment variables:

```bash
#!/usr/bin/env bash
# Persist variables for the session
echo "export PROJECT_TYPE=nodejs" >> "$CLAUDE_ENV_FILE"
echo "export API_URL=https://api.example.com" >> "$CLAUDE_ENV_FILE"
```

## Component-Scoped Hooks

Skills, agents, and commands can define hooks in frontmatter. These hooks only run when the component is active.

**Supported events**: PreToolUse, PostToolUse, Stop

### Skill with Hooks

```yaml
---
name: my-skill
description: Skill with validation hooks
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: prompt
          prompt: "Validate this write operation for the skill context..."
---
```

### Agent with Hooks

```yaml
---
name: security-reviewer
model: sonnet
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "${CLAUDE_PLUGIN_ROOT}/scripts/validate-bash.sh"
  Stop:
    - matcher: "*"
      hooks:
        - type: prompt
          prompt: "Verify the security review is complete..."
---
```

## Execution Model

**Parallel execution**: All matching hooks run in parallel, not sequentially.

```json
{
  "PreToolUse": [{
    "matcher": "Write",
    "hooks": [
      {"type": "command", "command": "check1.sh"},  // Runs in parallel
      {"type": "command", "command": "check2.sh"},  // Runs in parallel
      {"type": "prompt", "prompt": "Validate..."}   // Runs in parallel
    ]
  }]
}
```

**Implications**:
- Hooks cannot see each other's output
- Non-deterministic ordering
- Design for independence

**Hot-swap limitations**: Hook changes require restarting Claude Code. Editing `hooks.json` or hook scripts does not affect the current session.

## Security Best Practices

1. **Validate all input** - Check for path traversal, sensitive paths, injection
2. **Quote shell variables** - Always use `"$VAR"` not `$VAR`
3. **Set timeouts** - Prevent hanging hooks (default: 60s command, 30s prompt)
4. **Use absolute paths** - Via `$CLAUDE_PROJECT_DIR` or `${CLAUDE_PLUGIN_ROOT}`
5. **Handle errors gracefully** - Use `set -euo pipefail` in bash
6. **Don't log sensitive data** - Filter credentials, tokens, API keys

See [references/security.md](references/security.md) for detailed security patterns.

## Debugging

```bash
# Run Claude with debug output
claude --debug

# Test hook manually
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.ts"}}' | ./.claude/hooks/my-hook.sh

# Check transcript for hook execution
# Press Ctrl+R in Claude Code to view transcript
```

**Common issues**:
- Hook not firing: Check matcher syntax, restart Claude Code
- Permission errors: `chmod +x script.sh`
- Timeout: Increase timeout value or optimize script

## Workflow Patterns

### Pre-Commit Quality Gate

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {"type": "command", "command": "./.claude/hooks/validate-paths.sh"},
          {"type": "command", "command": "./.claude/hooks/check-sensitive.sh"}
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts)",
        "hooks": [
          {"type": "command", "command": "biome check --write \"$file\""},
          {"type": "command", "command": "tsc --noEmit \"$file\""}
        ]
      }
    ]
  }
}
```

### Context Injection

```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup",
      "hooks": [{
        "type": "command",
        "command": "echo \"Branch: $(git branch --show-current)\" && git status --short"
      }]
    }],
    "UserPromptSubmit": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "echo \"Time: $(date '+%Y-%m-%d %H:%M %Z')\""
      }]
    }]
  }
}
```

## References

- [references/hook-types.md](references/hook-types.md) - Detailed documentation for each hook event
- [references/matchers.md](references/matchers.md) - Advanced matcher patterns and MCP tools
- [references/security.md](references/security.md) - Security best practices and validation patterns
- [references/schema.md](references/schema.md) - Complete configuration schema reference
- [references/examples.md](references/examples.md) - Real-world hook implementations

## External Resources

- [Official Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Community Examples (disler)](https://github.com/disler/claude-code-hooks-mastery)
- [Claude Code Showcase](https://github.com/ChrisWiles/claude-code-showcase)
