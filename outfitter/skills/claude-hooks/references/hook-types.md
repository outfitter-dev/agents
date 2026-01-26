# Hook Types Reference

Detailed documentation for each Claude Code hook event.

## Tool Hooks

### PreToolUse

Executes **before** a tool runs. Can block or modify tool execution.

**Timing**: After Claude creates tool parameters, before tool executes

**Can block**: Yes (exit code 2 or `permissionDecision: "deny"`)

**Supports**: Both `command` and `prompt` hook types

**Input fields**:
- `tool_name`: Name of the tool being called
- `tool_input`: Parameters being passed to the tool

**Output capabilities**:
- Block execution with exit code 2 or `permissionDecision: "deny"`
- Modify input with `updatedInput` in JSON response
- Ask user with `permissionDecision: "ask"`
- Provide context via `systemMessage`

**Common matchers**:

```json
"Bash"                  // Shell commands
"Write"                 // File writing
"Edit"                  // File editing
"Read"                  // File reading
"Write|Edit"            // Multiple tools
"Write(*.py)"           // File patterns
"mcp__memory__.*"       // MCP tools
"*"                     // All tools
```

**Use cases**:
- Validate bash commands before execution
- Check file paths for security issues
- Block dangerous operations
- Add context before execution
- Enforce security policies
- Log tool invocations
- Modify tool input on the fly

**Example - Block dangerous commands**:

```json
{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/validate-bash.sh",
      "timeout": 5
    }]
  }]
}
```

**Example - Smart validation with prompt**:

```json
{
  "PreToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "prompt",
      "prompt": "Analyze this file operation. Check for: 1) sensitive paths, 2) credentials in content, 3) path traversal. Tool: $TOOL_INPUT. Return {\"decision\": \"allow|deny\", \"reason\": \"...\"}",
      "timeout": 30
    }]
  }]
}
```

**Example - Modify tool input**:

```bash
#!/usr/bin/env bash
# Add timestamp to all file writes
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content')

# Add header to content
NEW_CONTENT="// Modified $(date -Iseconds)\n$CONTENT"

cat << EOF
{
  "continue": true,
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {
      "file_path": "$FILE_PATH",
      "content": "$NEW_CONTENT"
    }
  }
}
EOF
```

### PostToolUse

Executes **after** a tool completes successfully.

**Timing**: Immediately after tool returns success

**Can block**: No

**Supports**: `command` hook type only

**Input fields**:
- `tool_name`: Name of the tool that ran
- `tool_input`: Parameters that were passed
- `tool_result`: Result returned by the tool

**Special variables**:
- `$file`: Path to affected file (Write/Edit tools only)

**Common matchers**:

```json
"Write|Edit(*.ts)"      // TypeScript files
"Write(*.py)"           // Python files
"Write|Edit"            // Any file modification
"*"                     // All successful tools
```

**Use cases**:
- Auto-format code files
- Run linters
- Update documentation
- Trigger builds
- Send notifications
- Update indexes

**Example - Auto-format TypeScript**:

```json
{
  "PostToolUse": [{
    "matcher": "Write|Edit(*.ts|*.tsx)",
    "hooks": [{
      "type": "command",
      "command": "biome check --write \"$file\"",
      "timeout": 10
    }]
  }]
}
```

**Example - Chain multiple formatters**:

```json
{
  "PostToolUse": [{
    "matcher": "Write|Edit(*.py)",
    "hooks": [
      {"type": "command", "command": "black \"$file\"", "timeout": 10},
      {"type": "command", "command": "isort \"$file\"", "timeout": 5},
      {"type": "command", "command": "mypy \"$file\"", "timeout": 15}
    ]
  }]
}
```

### PostToolUseFailure

Executes **after** a tool fails.

**Timing**: After tool execution fails

**Can block**: No

**Supports**: `command` hook type

**Input fields**:
- `tool_name`: Name of the tool that failed
- `tool_input`: Parameters that were passed
- `error`: Error information

**Use cases**:
- Error logging and analytics
- Retry logic
- Failure notifications
- Error recovery
- Debug information collection

**Example - Log failures**:

```json
{
  "PostToolUseFailure": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/log-failure.sh",
      "timeout": 5
    }]
  }]
}
```

### PermissionRequest

Executes when a permission dialog would be shown to the user.

**Timing**: Before showing permission dialog

**Can block**: Yes (via `permissionDecision`)

**Supports**: Both `command` and `prompt` hook types

**Input fields**:
- `tool_name`: Tool requesting permission
- `tool_input`: Parameters being requested

**Output capabilities**:
- Auto-allow with `permissionDecision: "allow"`
- Auto-deny with `permissionDecision: "deny"`
- Show dialog with `permissionDecision: "ask"` (default)

**Use cases**:
- Auto-approve known-safe operations
- Auto-deny high-risk operations
- Implement custom permission policies
- Reduce permission fatigue for trusted patterns

**Example - Auto-approve safe reads**:

```json
{
  "PermissionRequest": [{
    "matcher": "Read",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/auto-approve-reads.sh",
      "timeout": 3
    }]
  }]
}
```

## User Interaction Hooks

### UserPromptSubmit

Executes when user submits a prompt to Claude.

**Timing**: After user submits, before Claude processes

**Can block**: No

**Supports**: Both `command` and `prompt` hook types

**Input fields**:
- `user_prompt`: The prompt text submitted

**Matcher**: Always `*`

**Use cases**:
- Add timestamp or date context
- Add environment information
- Log user activity
- Pre-process or augment prompts
- Add project context
- Skill matching and suggestion

**Example - Add timestamp**:

```json
{
  "UserPromptSubmit": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "echo \"Current time: $(date '+%Y-%m-%d %H:%M:%S %Z')\"",
      "timeout": 2
    }]
  }]
}
```

**Example - Add git context**:

```json
{
  "UserPromptSubmit": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "echo \"Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')\"",
      "timeout": 3
    }]
  }]
}
```

### Notification

Executes when Claude Code sends a notification.

**Timing**: When notification is triggered

**Can block**: No

**Supports**: `command` hook type

**Input fields**:
- Notification message and metadata

**Matcher**: Always `*`

**Use cases**:
- Send to external systems (Slack, email)
- Log notifications
- Trigger alerts
- Update dashboards
- Archive important messages
- Text-to-speech announcements

**Example - Slack integration**:

```json
{
  "Notification": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/send-to-slack.sh",
      "timeout": 10
    }]
  }]
}
```

## Agent Lifecycle Hooks

### Stop

Executes when main Claude agent finishes responding.

**Timing**: After Claude completes response

**Can block**: No

**Supports**: Both `command` and `prompt` hook types

**Input fields**:
- `reason`: Why the agent stopped

**Matcher**: Always `*`

**Use cases**:
- Clean up temporary resources
- Send completion notifications
- Update external systems
- Log session metrics
- Archive conversation
- Verify task completion

**Example - Completion notification**:

```json
{
  "Stop": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "echo 'Task completed at $(date +%H:%M)'",
      "timeout": 2
    }]
  }]
}
```

**Example - Verify completeness with prompt**:

```json
{
  "Stop": [{
    "matcher": "*",
    "hooks": [{
      "type": "prompt",
      "prompt": "Review if the task was completed satisfactorily. Check for any unfinished work or follow-up items.",
      "timeout": 30
    }]
  }]
}
```

### SubagentStart

Executes when a subagent (Task tool) spawns.

**Timing**: When subagent is created

**Can block**: No

**Supports**: `command` hook type

**Input fields**:
- Subagent metadata

**Matcher**: Always `*`

**Use cases**:
- Track subagent spawning
- Log subagent parameters
- Monitor parallel execution
- Resource allocation

**Example - Track subagent usage**:

```json
{
  "SubagentStart": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/log-subagent-start.sh",
      "timeout": 2
    }]
  }]
}
```

### SubagentStop

Executes when a subagent (Task tool) finishes.

**Timing**: After subagent completes

**Can block**: No

**Supports**: Both `command` and `prompt` hook types

**Input fields**:
- `reason`: Why the subagent stopped
- Subagent result metadata

**Matcher**: Always `*`

**Use cases**:
- Track subagent completion
- Log subagent results
- Trigger follow-up actions
- Update metrics
- Debug subagent behavior

**Example - Log subagent completion**:

```json
{
  "SubagentStop": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/log-subagent-stop.sh",
      "timeout": 3
    }]
  }]
}
```

## Session Lifecycle Hooks

### SessionStart

Executes when session starts or resumes.

**Timing**: At session initialization

**Can block**: No

**Supports**: `command` hook type

**Input fields**:
- `reason`: Start type

**Matchers**:

```json
"startup"   // Claude Code starts fresh
"resume"    // Session resumes (--resume or --continue)
"clear"     // After /clear command
"compact"   // After compaction
```

**Special capability**: Persist environment variables via `$CLAUDE_ENV_FILE`

**Use cases**:
- Display welcome message
- Show git status
- Load project context
- Check for updates
- Initialize resources
- Set session-wide variables

**Example - Welcome with git status**:

```json
{
  "SessionStart": [{
    "matcher": "startup",
    "hooks": [{
      "type": "command",
      "command": "echo 'Welcome!' && git status --short",
      "timeout": 5
    }]
  }]
}
```

**Example - Persist environment variables**:

```bash
#!/usr/bin/env bash
# This script runs on SessionStart
# Persist variables for the entire session

# Detect project type and persist
if [[ -f "package.json" ]]; then
  echo "export PROJECT_TYPE=nodejs" >> "$CLAUDE_ENV_FILE"
elif [[ -f "Cargo.toml" ]]; then
  echo "export PROJECT_TYPE=rust" >> "$CLAUDE_ENV_FILE"
fi

# Set API endpoints
echo "export API_URL=https://api.example.com" >> "$CLAUDE_ENV_FILE"
```

### SessionEnd

Executes when session ends.

**Timing**: Before session terminates

**Can block**: No

**Supports**: `command` hook type

**Input fields**:
- `reason`: End type

**Matchers** (reasons):

```json
"clear"               // User ran /clear
"logout"              // User logged out
"prompt_input_exit"   // Exited during prompt input
"other"               // Other reasons
```

**Use cases**:
- Clean up resources
- Save state
- Log session metrics
- Send completion notifications
- Archive transcripts

**Example - Cleanup**:

```json
{
  "SessionEnd": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/cleanup.sh",
      "timeout": 5
    }]
  }]
}
```

### PreCompact

Executes before conversation compacts.

**Timing**: Before compact operation starts

**Can block**: No

**Supports**: `command` hook type

**Input fields**:
- Compact trigger type

**Matchers**:

```json
"manual"   // User triggered via /compact
"auto"     // Automatic compact (context limit)
```

**Use cases**:
- Backup conversation
- Archive important context
- Update external summaries
- Log compact events
- Prepare for context reset

**Example - Backup before compact**:

```json
{
  "PreCompact": [{
    "matcher": "manual|auto",
    "hooks": [{
      "type": "command",
      "command": "./.claude/hooks/backup-conversation.sh",
      "timeout": 10
    }]
  }]
}
```

## Hook Type Comparison

| Event | Can Block | Prompt Type | Command Type | Common Use |
|-------|-----------|-------------|--------------|------------|
| PreToolUse | Yes | Yes | Yes | Validation, security |
| PostToolUse | No | No | Yes | Formatting, linting |
| PostToolUseFailure | No | No | Yes | Error logging |
| PermissionRequest | Yes | Yes | Yes | Auto-approve/deny |
| UserPromptSubmit | No | Yes | Yes | Context injection |
| Notification | No | No | Yes | External alerts |
| Stop | No | Yes | Yes | Cleanup, verification |
| SubagentStart | No | No | Yes | Tracking |
| SubagentStop | No | Yes | Yes | Logging |
| SessionStart | No | No | Yes | Initialization |
| SessionEnd | No | No | Yes | Cleanup |
| PreCompact | No | No | Yes | Backup |

## Tool Use ID Correlation

PreToolUse and PostToolUse events for the same tool invocation share a tool use ID, allowing you to correlate them:

```bash
#!/usr/bin/env bash
# PreToolUse - save state
INPUT=$(cat)
TOOL_USE_ID=$(echo "$INPUT" | jq -r '.tool_use_id')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Save start time for correlation
echo "$(date +%s%N)" > "/tmp/claude-tool-$TOOL_USE_ID.start"
```

```bash
#!/usr/bin/env bash
# PostToolUse - calculate duration
INPUT=$(cat)
TOOL_USE_ID=$(echo "$INPUT" | jq -r '.tool_use_id')

START=$(cat "/tmp/claude-tool-$TOOL_USE_ID.start" 2>/dev/null || echo "0")
END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))

echo "Tool completed in ${DURATION_MS}ms"
rm -f "/tmp/claude-tool-$TOOL_USE_ID.start"
```
