---
name: claude-hook-authoring
description: Creates event hooks for Claude Code automation with proper configuration, matchers, input/output handling, and security best practices. Covers all 9 hook types (PreToolUse, PostToolUse, UserPromptSubmit, Notification, Stop, SubagentStop, PreCompact, SessionStart, SessionEnd). Use when building automation, creating hooks, setting up event handlers, or when users mention hooks, automation, event handlers, or tool interception.
version: 1.0.0
---

# Claude Hook Authoring

Create event hooks that automate workflows and respond to Claude Code events.

## Overview

Event hooks are shell commands or scripts that run automatically in response to Claude Code events:

- **PreToolUse**: Before a tool executes (can block/approve)
- **PostToolUse**: After a tool completes
- **UserPromptSubmit**: When user submits a prompt
- **Notification**: When Claude sends notifications
- **Stop**: When main agent finishes
- **SubagentStop**: When subagent finishes
- **PreCompact**: Before conversation compacts
- **SessionStart**: When session starts/resumes
- **SessionEnd**: When session ends

## Quick Start

### Basic PostToolUse Hook

Auto-format Python files after writing:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "black \"$file\""
          }
        ]
      }
    ]
  }
}
```

Add to `.claude/settings.json` or `~/.claude/settings.json`.

### Validation Hook

Prevent problematic bash commands:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-bash.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**validate-bash.sh**:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Validate command
if echo "$COMMAND" | grep -qE '\brm\s+-rf\s+/'; then
  echo "❌ Dangerous command blocked: rm -rf /" >&2
  exit 2  # Exit 2 = block and show error to Claude
fi

# Approve
exit 0
```

## Hook Configuration

### Structure

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<ToolPattern>",
        "hooks": [
          {
            "type": "command",
            "command": "<shell-command>",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Location

**Project hooks** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PostToolUse": [...]
  }
}
```

**Personal hooks** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "PostToolUse": [...]
  }
}
```

**Plugin hooks** (`plugin/hooks/hooks.json` or `plugin/.claude-plugin/plugin.json`):

```json
{
  "hooks": {
    "PostToolUse": [...]
  }
}
```

## Matchers

Matchers determine which tool invocations trigger the hook.

### Simple Matchers

```json
{"matcher": "Write"}        // Only Write tool
{"matcher": "Edit"}         // Only Edit tool
{"matcher": "Bash"}         // Only Bash tool
```

### Regex Matchers

```json
{"matcher": "Edit|Write"}        // Edit OR Write
{"matcher": "Notebook.*"}        // Any Notebook tool
{"matcher": "Write|Edit|Notebook.*"}  // Multiple tools
```

### Wildcard Matcher

```json
{"matcher": "*"}  // ALL tools
```

### File Pattern Matchers

```json
{"matcher": "Write(*.py)"}      // Write Python files
{"matcher": "Edit(*.ts)"}       // Edit TypeScript files
{"matcher": "Write(*.md)"}      // Write Markdown files
{"matcher": "Write|Edit(*.js)"} // Write or Edit JS files
```

### MCP Tool Matchers

```json
{"matcher": "mcp__memory__.*"}     // Any memory MCP tool
{"matcher": "mcp__github__.*"}     // Any GitHub MCP tool
{"matcher": "mcp__.*__.*"}         // Any MCP tool
```

## Hook Input

Hooks receive JSON on stdin with event context:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  }
}
```

### Reading Input in Bash

```bash
#!/usr/bin/env bash
set -euo pipefail

# Read and parse JSON input
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Use the data
echo "Tool: $TOOL_NAME"
echo "File: $FILE_PATH"
```

### Reading Input in Bun/TypeScript

```typescript
#!/usr/bin/env bun
import { stdin } from "process";

// Read stdin
const chunks: Buffer[] = [];
for await (const chunk of stdin) {
  chunks.push(chunk);
}
const input = JSON.parse(Buffer.concat(chunks).toString());

// Access data
const toolName = input.tool_name;
const filePath = input.tool_input?.file_path;

console.log(`Tool: ${toolName}`);
console.log(`File: ${filePath}`);
```

## Hook Output

### Exit Codes (Simple)

```bash
#!/usr/bin/env bash

# Success (continue)
exit 0

# Blocking error (show to Claude)
echo "Error: validation failed" >&2
exit 2

# Non-blocking error (show to user)
echo "Warning: check failed" >&2
exit 1
```

**Behavior**:
- **Exit 0**: Success, stdout shown to user
- **Exit 2**: Blocking error, stderr shown to Claude
- **Other**: Non-blocking error, stderr shown to user

### JSON Output (Advanced)

```json
{
  "continue": true,
  "stopReason": "Optional message",
  "suppressOutput": false,
  "systemMessage": "Warning message",
  "decision": "block",
  "reason": "Explanation",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Dangerous operation",
    "additionalContext": "Context for Claude"
  }
}
```

## Hook Types

### PreToolUse

Runs before tool executes. Can block or approve operations.

**Common uses**:
- Validate bash commands
- Check file paths
- Enforce security policies
- Add context before execution

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/check-file-policy.sh"
        }]
      }
    ]
  }
}
```

### PostToolUse

Runs after tool completes successfully.

**Common uses**:
- Auto-format code
- Update documentation
- Run linters
- Trigger builds

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts)",
        "hooks": [{
          "type": "command",
          "command": "biome check --write \"$file\""
        }]
      }
    ]
  }
}
```

### UserPromptSubmit

Runs when user submits a prompt.

**Common uses**:
- Add current time/date
- Add environment context
- Log user activity
- Pre-process prompts

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/add-context.sh"
        }]
      }
    ]
  }
}
```

### Notification

Runs when Claude sends notifications.

**Common uses**:
- Send to external systems
- Log notifications
- Trigger alerts

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/log-notification.sh"
        }]
      }
    ]
  }
}
```

### Stop

Runs when main Claude agent finishes responding.

**Common uses**:
- Clean up resources
- Send completion notifications
- Update external systems

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/on-completion.sh"
        }]
      }
    ]
  }
}
```

### SubagentStop

Runs when a subagent finishes.

**Common uses**:
- Track subagent usage
- Log subagent results
- Trigger follow-up actions

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/on-subagent-done.sh"
        }]
      }
    ]
  }
}
```

### PreCompact

Runs before conversation compacts.

**Matchers**:
- `manual`: User-triggered (`/compact`)
- `auto`: Automatic compact

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "manual",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/before-compact.sh"
        }]
      }
    ]
  }
}
```

### SessionStart

Runs when session starts or resumes.

**Matchers**:
- `startup`: Claude Code starts
- `resume`: Session resumes (`--resume`)
- `clear`: After `/clear`
- `compact`: After compact

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [{
          "type": "command",
          "command": "echo 'Welcome!' && git status"
        }]
      }
    ]
  }
}
```

### SessionEnd

Runs when session ends.

**Reasons**:
- `clear`: User ran `/clear`
- `logout`: User logged out
- `prompt_input_exit`: Exited during prompt
- `other`: Other reasons

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/cleanup.sh"
        }]
      }
    ]
  }
}
```

## Security Best Practices

### 1. Validate All Input

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Check for path traversal
if echo "$FILE_PATH" | grep -q '\.\.'; then
  echo "❌ Path traversal detected" >&2
  exit 2
fi

# Check for sensitive paths
if echo "$FILE_PATH" | grep -qE '^/etc/|^/root/|\.env$'; then
  echo "❌ Sensitive path blocked" >&2
  exit 2
fi
```

### 2. Quote Shell Variables

```bash
# ❌ WRONG - vulnerable to injection
rm $FILE_PATH

# ✅ CORRECT - properly quoted
rm "$FILE_PATH"
```

### 3. Use Absolute Paths

```json
{
  "hooks": {
    "PostToolUse": [{
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/format.sh"
      }]
    }]
  }
}
```

### 4. Set Timeouts

```json
{
  "hooks": [{
    "type": "command",
    "command": "./slow-operation.sh",
    "timeout": 30
  }]
}
```

### 5. Handle Errors Gracefully

```bash
#!/usr/bin/env bash
set -euo pipefail

# Always validate input exists
if ! command -v jq &>/dev/null; then
  echo "Error: jq not installed" >&2
  exit 1
fi

# Catch errors
if ! INPUT=$(cat 2>&1); then
  echo "Error: Failed to read stdin" >&2
  exit 1
fi
```

## Common Patterns

See [REFERENCE.md](REFERENCE.md) for:
- Advanced hook configurations
- Complex matchers
- Hook chaining
- Error handling patterns
- Integration examples

See [EXAMPLES.md](EXAMPLES.md) for:
- Real-world hook implementations
- Auto-formatting workflows
- Validation patterns
- CI/CD integration
- Team workflows

## Utilities

```bash
# Create hook with template
./scripts/scaffold-hook.sh format-typescript

# Validate hook configuration
./scripts/validate-hook.sh .claude/settings.json

# Test hook script with sample input
./scripts/test-hook.ts .claude/hooks/my-hook.sh
```

## Debugging Hooks

### Enable Debug Mode

```bash
claude --debug
```

### Check Hook Output

Use transcript mode (Ctrl+R) to see hook execution and output.

### Test Hook Manually

```bash
# Create sample input
cat > /tmp/hook-input.json << 'EOF'
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "test.ts",
    "content": "console.log('test');"
  }
}
EOF

# Test hook
cat /tmp/hook-input.json | ./.claude/hooks/my-hook.sh
```

### Common Issues

**Hook not firing**:
- Check matcher syntax
- Verify hook is in correct settings file
- Restart Claude Code

**Permission errors**:
- Make script executable: `chmod +x script.sh`
- Check file paths are correct
- Verify `$CLAUDE_PROJECT_DIR` is set

**Timeout errors**:
- Increase timeout value
- Optimize script performance
- Check for hanging commands

## Environment Variables

Available in hook scripts:

- `$CLAUDE_PROJECT_DIR`: Project root directory
- `$file`: File path (PostToolUse hooks)
- Custom variables from settings.json

## Related Skills

- **claude-command-authoring**: Combine commands with hooks
- **claude-plugin-authoring**: Package hooks into plugins
- **claude-config-management**: Manage hook configuration
