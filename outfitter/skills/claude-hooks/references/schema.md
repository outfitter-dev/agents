# Hook Reference

Comprehensive technical reference for Claude Code event hooks.

## Table of Contents

1. [Hook Configuration Schema](#hook-configuration-schema)
2. [Hook Events](#hook-events)
3. [Matcher Patterns](#matcher-patterns)
4. [Input Format](#input-format)
5. [Output Format](#output-format)
6. [Environment Variables](#environment-variables)
7. [Exit Codes](#exit-codes)
8. [Hook Chaining](#hook-chaining)
9. [Security Best Practices](#security-best-practices)
10. [MCP Integration](#mcp-integration)
11. [Plugin Hooks](#plugin-hooks)
12. [Advanced Patterns](#advanced-patterns)

## Hook Configuration Schema

### Location

Hooks are configured in JSON settings files:

| Location | Scope | Committed |
|----------|-------|-----------|
| `~/.claude/settings.json` | Personal (all projects) | No |
| `.claude/settings.json` | Project (shared with team) | Yes |
| `.claude/settings.local.json` | Project (local overrides) | No |
| `plugin/hooks/hooks.json` | Plugin | Yes |

### Basic Structure

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

### Field Reference

#### `hooks` (root)

**Type**: Object
**Required**: Yes
**Description**: Root object containing all hook definitions

```json
{
  "hooks": {
    // Event configurations here
  }
}
```

#### Event Name Keys

**Type**: String (key)
**Required**: At least one
**Valid values**:
- `PreToolUse`
- `PostToolUse`
- `UserPromptSubmit`
- `Notification`
- `Stop`
- `SubagentStop`
- `PreCompact`
- `SessionStart`
- `SessionEnd`

**Description**: Event type that triggers the hook

```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...],
    "SessionStart": [...]
  }
}
```

#### Event Configuration Array

**Type**: Array of objects
**Description**: Array of matcher/hooks pairs for an event

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.py)",
        "hooks": [...]
      },
      {
        "matcher": "Edit(*.ts)",
        "hooks": [...]
      }
    ]
  }
}
```

#### `matcher`

**Type**: String
**Required**: Yes
**Description**: Pattern to match tools or event types

**Syntax options:**
- Simple: `"Write"` - Exact tool name
- Regex: `"Edit|Write"` - OR pattern
- Wildcard: `"*"` - All tools
- File pattern: `"Write(*.py)"` - File extension
- MCP: `"mcp__server__tool"` - MCP tool pattern

```json
{"matcher": "Write|Edit"}
```

#### `hooks` (nested)

**Type**: Array of objects
**Required**: Yes
**Description**: Commands to execute when matcher triggers

```json
{
  "hooks": [
    {
      "type": "command",
      "command": "black \"$file\"",
      "timeout": 30
    }
  ]
}
```

#### `type`

**Type**: String
**Required**: Yes
**Valid values**: `"command"`
**Description**: Hook execution type (currently only "command" supported)

#### `command`

**Type**: String
**Required**: Yes
**Description**: Shell command to execute

**Features:**
- Variable expansion: `$file`, `$CLAUDE_PROJECT_DIR`
- Stdin: Receives JSON input
- Stdout: Shown to user
- Stderr: Error messages
- Exit code: Controls behavior

```json
{
  "type": "command",
  "command": "./.claude/hooks/format-code.sh"
}
```

#### `timeout`

**Type**: Number (seconds)
**Required**: No
**Default**: 30
**Description**: Maximum execution time

```json
{
  "type": "command",
  "command": "./slow-operation.sh",
  "timeout": 60
}
```

### Complete Example

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
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/check-paths.sh",
            "timeout": 3
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "biome check --write \"$file\"",
            "timeout": 10
          }
        ]
      },
      {
        "matcher": "Write(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "black \"$file\"",
            "timeout": 10
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session started' && git status",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## Hook Events

### PreToolUse

Executes **before** a tool runs. Can block or modify execution.

**Timing**: After Claude creates tool parameters, before tool execution

**Input**: Tool name and full input parameters

**Can block**: Yes (exit code 2)

**Common matchers**:
- `Bash` - Shell commands
- `Write` - File writing
- `Edit` - File editing
- `Read` - File reading
- `Grep` - Content search
- `Glob` - File patterns
- `WebFetch` - Web operations
- `WebSearch` - Web search
- `Task` - Subagent tasks
- `*` - All tools

**Use cases**:
- Validate bash commands before execution
- Check file paths for security issues
- Block dangerous operations
- Add context before execution
- Enforce security policies
- Log tool invocations

**Example**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/validate-bash.sh",
          "timeout": 5
        }]
      }
    ]
  }
}
```

### PostToolUse

Executes **after** a tool completes successfully.

**Timing**: Immediately after tool returns success

**Input**: Tool name, input parameters, and execution result

**Can block**: No (but can report issues)

**Common matchers**:
- `Write(*.ext)` - Specific file types
- `Edit(*.ext)` - Specific file types
- `Write|Edit` - Any file modification
- `*` - All successful tools

**Use cases**:
- Auto-format code files
- Run linters
- Update documentation
- Trigger builds
- Send notifications
- Update indexes

**Example**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts)",
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

### UserPromptSubmit

Executes when user submits a prompt to Claude.

**Timing**: After user submits, before Claude processes

**Input**: User prompt text and session metadata

**Can block**: No

**Matcher**: Always `*`

**Use cases**:
- Add timestamp or date context
- Add environment information
- Log user activity
- Pre-process or augment prompts
- Add project context

**Example**:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/add-context.sh",
          "timeout": 2
        }]
      }
    ]
  }
}
```

### Notification

Executes when Claude Code sends a notification.

**Timing**: When notification is triggered

**Input**: Notification message and metadata

**Can block**: No

**Matcher**: Always `*`

**Use cases**:
- Send to external systems (Slack, email)
- Log notifications
- Trigger alerts
- Update dashboards
- Archive important messages

**Example**:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/send-to-slack.sh",
          "timeout": 5
        }]
      }
    ]
  }
}
```

### Stop

Executes when main Claude agent finishes responding.

**Timing**: After Claude completes response

**Input**: Session metadata and completion reason

**Can block**: No

**Matcher**: Always `*`

**Use cases**:
- Clean up temporary resources
- Send completion notifications
- Update external systems
- Log session metrics
- Archive conversation

**Example**:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/on-completion.sh",
          "timeout": 5
        }]
      }
    ]
  }
}
```

### SubagentStop

Executes when a subagent (Task tool) finishes.

**Timing**: After subagent completes

**Input**: Subagent metadata and result

**Can block**: No

**Matcher**: Always `*`

**Use cases**:
- Track subagent usage
- Log subagent results
- Trigger follow-up actions
- Update metrics
- Debug subagent behavior

**Example**:

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/log-subagent.sh",
          "timeout": 3
        }]
      }
    ]
  }
}
```

### PreCompact

Executes before conversation compacts.

**Timing**: Before compact operation starts

**Input**: Compact trigger type

**Can block**: No

**Matchers**:
- `manual` - User triggered via `/compact`
- `auto` - Automatic compact

**Use cases**:
- Backup conversation
- Archive important context
- Update external summaries
- Log compact events
- Prepare for reset

**Example**:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "manual",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/backup-conversation.sh",
          "timeout": 10
        }]
      }
    ]
  }
}
```

### SessionStart

Executes when session starts or resumes.

**Timing**: At session initialization

**Input**: Session start reason

**Can block**: No

**Matchers**:
- `startup` - Claude Code starts
- `resume` - Session resumes (`--resume`, `--continue`)
- `clear` - After `/clear` command
- `compact` - After compact operation

**Use cases**:
- Display welcome message
- Show git status
- Load project context
- Check for updates
- Initialize resources

**Example**:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [{
          "type": "command",
          "command": "echo 'Welcome!' && git status",
          "timeout": 5
        }]
      }
    ]
  }
}
```

### SessionEnd

Executes when session ends.

**Timing**: Before session terminates

**Input**: End reason

**Can block**: No

**Matchers** (reasons):
- `clear` - User ran `/clear`
- `logout` - User logged out
- `prompt_input_exit` - Exited during prompt input
- `other` - Other reasons

**Use cases**:
- Clean up resources
- Save state
- Log session metrics
- Send completion notifications
- Archive transcripts

**Example**:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/cleanup.sh",
          "timeout": 5
        }]
      }
    ]
  }
}
```

## Matcher Patterns

### Simple String Match

Match exact tool name:

```json
{"matcher": "Write"}   // Only Write tool
{"matcher": "Edit"}    // Only Edit tool
{"matcher": "Bash"}    // Only Bash tool
{"matcher": "Read"}    // Only Read tool
```

### Regex Patterns

Use `|` for OR logic:

```json
{"matcher": "Edit|Write"}              // Edit OR Write
{"matcher": "Read|Grep|Glob"}          // Any read operation
{"matcher": "Notebook.*"}              // Any Notebook tool
{"matcher": "Write|Edit|NotebookEdit"} // Multiple tools
```

**Regex features:**
- `|` - OR operator
- `.` - Any character
- `*` - Zero or more
- `+` - One or more
- `^` - Start of string
- `$` - End of string

**Examples:**

```json
{"matcher": "^Write$"}        // Exactly "Write", no prefix/suffix
{"matcher": ".*Edit.*"}       // Contains "Edit" anywhere
{"matcher": "Bash|WebFetch"}  // Bash or WebFetch
```

### Wildcard Match

Match all tools:

```json
{"matcher": "*"}  // Matches everything
```

**Use cases:**
- Logging all tool usage
- Global validation
- Universal context injection
- Metrics collection

### File Pattern Match

Match tools with specific file patterns:

```json
{"matcher": "Write(*.py)"}         // Write Python files
{"matcher": "Edit(*.ts)"}          // Edit TypeScript files
{"matcher": "Write(*.md)"}         // Write Markdown files
{"matcher": "Write|Edit(*.js)"}    // Write or Edit JavaScript
```

**Supported patterns:**
- `*.ext` - Any file with extension
- `path/*.ext` - Files in specific directory
- `**/*.ext` - Recursive file match

**Examples:**

```json
{"matcher": "Write(*.tsx)"}            // React components
{"matcher": "Write|Edit(*.rs)"}        // Rust files
{"matcher": "Write(src/**/*.ts)"}      // TS files in src/
{"matcher": "Edit(.env*)"}             // .env files
```

### MCP Tool Match

Match MCP server tools:

```json
{"matcher": "mcp__memory__.*"}        // Any memory MCP tool
{"matcher": "mcp__github__.*"}        // Any GitHub MCP tool
{"matcher": "mcp__.*__.*"}            // Any MCP tool
{"matcher": "mcp__linear__create_issue"}  // Specific MCP tool
```

**MCP tool naming**: `mcp__<server-name>__<tool-name>`

**Examples:**

```json
// Match all memory operations
{"matcher": "mcp__memory__.*"}

// Match specific GitHub operations
{"matcher": "mcp__github__(create_issue|create_comment)"}

// Match all MCP tools
{"matcher": "mcp__.*__.*"}

// Match Linear issue creation
{"matcher": "mcp__linear__create_issue"}
```

### Complex Matchers

Combine patterns with regex:

```json
// Format Python or TypeScript files
{"matcher": "Write|Edit(*.py)|Write|Edit(*.ts)"}

// Format code files, exclude tests
{"matcher": "Write|Edit(*.ts|*.py)"}

// Bash or any MCP tool
{"matcher": "Bash|mcp__.*__.*"}

// Read operations (multiple tools)
{"matcher": "Read|Grep|Glob|WebFetch"}
```

## Input Format

### JSON Schema

Hooks receive JSON on stdin:

```typescript
interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  tool_name?: string;
  tool_input?: Record<string, any>;
  reason?: string;
  [key: string]: any;
}
```

### Common Fields

#### All Events

```json
{
  "session_id": "abc123-def456-ghi789",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "hook_event_name": "PreToolUse"
}
```

#### Tool Events (PreToolUse, PostToolUse)

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/project/root",
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/project/root/src/file.ts",
    "content": "export const foo = 'bar';"
  }
}
```

#### Session Events

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/project/root",
  "hook_event_name": "SessionStart",
  "reason": "startup"
}
```

### Tool-Specific Input

#### Bash Tool

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "git status",
    "description": "Check git status"
  }
}
```

#### Write Tool

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/absolute/path/to/file.ts",
    "content": "file contents here"
  }
}
```

#### Edit Tool

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/absolute/path/to/file.ts",
    "old_string": "const foo = 'old';",
    "new_string": "const foo = 'new';",
    "replace_all": false
  }
}
```

#### Read Tool

```json
{
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/absolute/path/to/file.ts",
    "offset": 0,
    "limit": 2000
  }
}
```

### Reading Input

#### Bash

```bash
#!/usr/bin/env bash
set -euo pipefail

# Read entire input
INPUT=$(cat)

# Parse with jq
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Check if field exists
if [[ -z "$TOOL_NAME" ]]; then
  echo "Error: tool_name not found" >&2
  exit 1
fi
```

#### Bun/TypeScript

```typescript
#!/usr/bin/env bun
import { stdin } from "process";

interface HookInput {
  session_id: string;
  tool_name?: string;
  tool_input?: Record<string, any>;
  hook_event_name: string;
}

// Read stdin
const chunks: Buffer[] = [];
for await (const chunk of stdin) {
  chunks.push(chunk);
}

const input: HookInput = JSON.parse(Buffer.concat(chunks).toString());

// Access fields
const toolName = input.tool_name;
const filePath = input.tool_input?.file_path;

// Validate
if (!toolName) {
  console.error("Error: tool_name missing");
  process.exit(1);
}
```

#### Python

```python
#!/usr/bin/env python3
import json
import sys

# Read input
try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error parsing JSON: {e}", file=sys.stderr)
    sys.exit(1)

# Access fields
tool_name = input_data.get("tool_name", "")
file_path = input_data.get("tool_input", {}).get("file_path", "")

# Validate
if not tool_name:
    print("Error: tool_name missing", file=sys.stderr)
    sys.exit(1)
```

## Output Format

### Exit Codes (Simple)

Most common approach:

```bash
#!/usr/bin/env bash

# Success - continue execution
echo "Validation passed"
exit 0

# Blocking error - show to Claude
echo "Error: dangerous operation detected" >&2
exit 2

# Non-blocking error - show to user
echo "Warning: minor issue detected" >&2
exit 1
```

**Behavior:**

| Exit Code | Behavior | Stdout | Stderr |
|-----------|----------|--------|--------|
| 0 | Success | Shown to user | Ignored |
| 2 | Block (PreToolUse only) | Ignored | Shown to Claude |
| 1 or other | Non-blocking error | Ignored | Shown to user |

### JSON Output (Advanced)

For complex responses:

```json
{
  "continue": true,
  "stopReason": "Optional stop message",
  "suppressOutput": false,
  "systemMessage": "Warning or info message",
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Dangerous operation",
    "additionalContext": "Context for Claude"
  }
}
```

#### Field Reference

**`continue`** (boolean)
- `true`: Continue execution
- `false`: Stop execution

**`stopReason`** (string)
- Message explaining why stopped
- Shown to user

**`suppressOutput`** (boolean)
- `true`: Hide stdout from user
- `false`: Show stdout

**`systemMessage`** (string)
- Info/warning message
- Shown to user

**`decision`** (string)
- `"block"`: Block operation (PreToolUse)
- `"approve"`: Approve operation
- `undefined`: No decision

**`reason`** (string)
- Explanation for decision
- Shown in context

**`hookSpecificOutput`** (object)
- Event-specific data
- See below for details

#### PreToolUse JSON Output

```json
{
  "continue": false,
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Path traversal detected in file path",
    "additionalContext": "The file path contains '..' which could allow directory traversal"
  }
}
```

**Permission decisions:**
- `"allow"`: Approve tool use
- `"deny"`: Block tool use
- `"ask"`: Ask user for permission

#### Example: Bash with JSON Output

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Check for path traversal
if echo "$FILE_PATH" | grep -q '\.\.'; then
  # Output JSON response
  cat << EOF
{
  "continue": false,
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Path traversal detected",
    "additionalContext": "File path contains '..' which is not allowed"
  }
}
EOF
  exit 0
fi

# Approve
echo "Path validation passed"
exit 0
```

## Environment Variables

### Available Variables

#### `$CLAUDE_PROJECT_DIR`

**Type**: String
**Availability**: All hooks
**Description**: Absolute path to project root directory

```bash
"$CLAUDE_PROJECT_DIR/.claude/hooks/format.sh"
```

**Use cases:**
- Reference project scripts
- Construct relative paths
- Check project structure

#### `$file`

**Type**: String
**Availability**: PostToolUse hooks for Write/Edit tools
**Description**: Absolute path to affected file

```bash
"biome check --write \"$file\""
```

**Use cases:**
- Auto-format files
- Run linters
- Update related files

#### `${CLAUDE_PLUGIN_ROOT}`

**Type**: String
**Availability**: Plugin hooks only
**Description**: Absolute path to plugin root directory

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/process.sh"
}
```

**Use cases:**
- Reference plugin scripts
- Load plugin resources
- Access plugin data

### Custom Variables

Define in settings.json:

```json
{
  "env": {
    "CUSTOM_VAR": "value",
    "API_KEY": "secret"
  },
  "hooks": {
    "PostToolUse": [...]
  }
}
```

Access in hooks:

```bash
#!/usr/bin/env bash
echo "Custom var: $CUSTOM_VAR"
```

## Exit Codes

### Standard Exit Codes

```bash
0   - Success, continue
1   - Non-blocking error
2   - Blocking error (PreToolUse only)
3+ - Non-blocking error
```

### Exit Code Behavior

#### Exit 0 (Success)

```bash
#!/usr/bin/env bash
echo "Validation passed"
exit 0
```

**Behavior:**
- Execution continues
- Stdout shown to user
- Stderr ignored

**Use for:**
- Successful validation
- Informational output
- Non-critical messages

#### Exit 1 (Warning)

```bash
#!/usr/bin/env bash
echo "Warning: potential issue detected" >&2
exit 1
```

**Behavior:**
- Execution continues
- Stderr shown to user
- Stdout ignored

**Use for:**
- Warnings
- Non-critical issues
- Suggestions

#### Exit 2 (Block)

```bash
#!/usr/bin/env bash
echo "Error: dangerous operation blocked" >&2
exit 2
```

**Behavior:**
- PreToolUse: Blocks tool execution
- PostToolUse: Reports error (doesn't block)
- Stderr shown to Claude
- Stdout ignored

**Use for:**
- Security violations
- Policy enforcement
- Dangerous operations

### Error Handling

Always handle errors gracefully:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Check dependencies
if ! command -v jq &>/dev/null; then
  echo "Error: jq not installed" >&2
  exit 1
fi

# Validate input
INPUT=$(cat) || {
  echo "Error: failed to read stdin" >&2
  exit 1
}

# Parse with error handling
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty') || {
  echo "Error: failed to parse JSON" >&2
  exit 1
}

# Validate required fields
if [[ -z "$TOOL_NAME" ]]; then
  echo "Error: tool_name missing" >&2
  exit 1
fi
```

## Hook Chaining

### Multiple Hooks per Event

Execute multiple hooks sequentially:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "biome check --write \"$file\"",
            "timeout": 10
          },
          {
            "type": "command",
            "command": "tsc --noEmit \"$file\"",
            "timeout": 15
          },
          {
            "type": "command",
            "command": "./.claude/hooks/update-index.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**Execution:**
- Runs in order
- If one fails (non-zero exit), subsequent hooks still run
- All output collected and shown

### Cross-Event Coordination

Use shared state for coordination:

```bash
# PreToolUse: Record operation
#!/usr/bin/env bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
echo "$TOOL_NAME $(date +%s)" >> /tmp/claude-operations.log
exit 0
```

```bash
# PostToolUse: Update metrics
#!/usr/bin/env bash
OPERATIONS=$(wc -l < /tmp/claude-operations.log)
echo "Total operations: $OPERATIONS" >&2
exit 0
```

## Security Best Practices

### 1. Input Validation

Always validate and sanitize inputs:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Check for path traversal
if echo "$FILE_PATH" | grep -qE '\.\.|^/etc/|^/root/|^/home/[^/]+/\.ssh/'; then
  echo "❌ Dangerous path detected: $FILE_PATH" >&2
  exit 2
fi

# Check for sensitive files
if echo "$FILE_PATH" | grep -qE '\.env$|\.git/config|id_rsa|credentials'; then
  echo "❌ Sensitive file access blocked: $FILE_PATH" >&2
  exit 2
fi

# Validate file extension
if [[ "$FILE_PATH" =~ \.(exe|sh|bin)$ ]]; then
  echo "⚠ Warning: executable file" >&2
fi
```

### 2. Command Injection Prevention

Always quote variables:

```bash
# ❌ WRONG - vulnerable to injection
rm $FILE_PATH

# ✅ CORRECT - properly quoted
rm "$FILE_PATH"

# ❌ WRONG - vulnerable
eval "$COMMAND"

# ✅ CORRECT - use array or avoid eval
bash -c "$COMMAND"
```

### 3. Path Security

Use absolute paths and validate:

```bash
#!/usr/bin/env bash

# Get absolute path
SCRIPT_PATH="$CLAUDE_PROJECT_DIR/.claude/hooks/helper.sh"

# Validate script exists
if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "Error: script not found: $SCRIPT_PATH" >&2
  exit 1
fi

# Validate script is executable
if [[ ! -x "$SCRIPT_PATH" ]]; then
  echo "Error: script not executable: $SCRIPT_PATH" >&2
  exit 1
fi

# Execute safely
"$SCRIPT_PATH" "$@"
```

### 4. Sensitive Data Protection

Never log or expose sensitive data:

```bash
#!/usr/bin/env bash
INPUT=$(cat)

# ❌ WRONG - logs sensitive data
echo "Input: $INPUT" >> /tmp/debug.log

# ✅ CORRECT - log only safe fields
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
echo "Tool: $TOOL_NAME" >> /tmp/debug.log

# ✅ Filter sensitive fields
echo "$INPUT" | jq 'del(.tool_input.password, .tool_input.api_key)' >> /tmp/debug.log
```

### 5. Timeout Protection

Set appropriate timeouts:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/validate.sh",
          "timeout": 5
        }]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/format.sh",
          "timeout": 30
        }]
      }
    ]
  }
}
```

**Guidelines:**
- Validation: 3-5 seconds
- Formatting: 10-30 seconds
- Network operations: 30-60 seconds
- Heavy operations: Consider running async

### 6. Error Recovery

Handle failures gracefully:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Trap errors
trap 'echo "Error on line $LINENO" >&2' ERR

# Validate dependencies
for cmd in jq git; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd not installed" >&2
    exit 1
  fi
done

# Main logic with error handling
if ! INPUT=$(cat 2>&1); then
  echo "Error: failed to read stdin" >&2
  exit 1
fi

# Parse with validation
if ! TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name' 2>&1); then
  echo "Error: invalid JSON input" >&2
  exit 1
fi
```

## MCP Integration

### Matching MCP Tools

MCP tools follow pattern: `mcp__<server>__<tool>`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/log-memory-ops.sh"
        }]
      },
      {
        "matcher": "mcp__github__create_issue",
        "hooks": [{
          "type": "command",
          "command": "./.claude/hooks/validate-issue.sh"
        }]
      }
    ]
  }
}
```

### Common MCP Servers

```json
// Memory operations
{"matcher": "mcp__memory__.*"}

// GitHub operations
{"matcher": "mcp__github__.*"}

// Linear operations
{"matcher": "mcp__linear__.*"}

// Filesystem operations
{"matcher": "mcp__filesystem__.*"}

// All MCP tools
{"matcher": "mcp__.*__.*"}
```

### MCP Hook Example

```bash
#!/usr/bin/env bash
# Log MCP operations
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
SERVER=$(echo "$TOOL_NAME" | cut -d'_' -f3)
OPERATION=$(echo "$TOOL_NAME" | cut -d'_' -f4-)

echo "[$(date -Iseconds)] MCP $SERVER: $OPERATION" >> "$CLAUDE_PROJECT_DIR/.claude/mcp-operations.log"
exit 0
```

## Plugin Hooks

### Plugin Hook Configuration

Hooks are **auto-discovered** from `{plugin}/hooks/hooks.json`. Do NOT define hooks in `plugin.json`.

**Location:** `{plugin}/hooks/hooks.json`

**Important:** The file requires a root-level `"hooks"` wrapper around the event types:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh",
          "timeout": 30
        }]
      }
    ]
  }
}
```

> **Note:** This differs from project-level hooks in `.claude/settings.json`, which also have a `"hooks"` wrapper but are configured differently. Plugin hooks use `${CLAUDE_PLUGIN_ROOT}` for paths.

### Plugin-Specific Variables

Use `${CLAUDE_PLUGIN_ROOT}` for plugin paths:

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/helper.sh"
}
```

### Plugin Hook Best Practices

**1. Use relative paths with variable:**

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/process.sh"
}
```

**2. Include dependencies in plugin:**

```
plugin/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json
└── scripts/
    ├── process.sh
    └── utils.sh
```

**3. Document hook requirements:**

```json
{
  "name": "my-plugin",
  "description": "Plugin with auto-formatting",
  "requirements": {
    "binaries": ["jq", "black"],
    "notes": "PostToolUse hooks require black for Python formatting"
  }
}
```

## Advanced Patterns

### Conditional Execution

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only format during work hours
HOUR=$(date +%H)
if [[ $HOUR -lt 9 || $HOUR -gt 17 ]]; then
  echo "Skipping format outside work hours"
  exit 0
fi

# Only format if file is in src/
if [[ ! "$FILE_PATH" =~ ^.*/src/ ]]; then
  exit 0
fi

# Format the file
black "$FILE_PATH"
```

### Async Operations

```bash
#!/usr/bin/env bash
# Run expensive operation in background

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Start background job
(
  sleep 2
  expensive-operation "$FILE_PATH"
  echo "Background operation completed" >> /tmp/claude-bg.log
) &

# Return immediately
echo "Background operation started"
exit 0
```

### State Management

```bash
#!/usr/bin/env bash
# Track state across hooks

STATE_FILE="/tmp/claude-state.json"

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Load state
if [[ -f "$STATE_FILE" ]]; then
  STATE=$(cat "$STATE_FILE")
else
  STATE='{"operations": []}'
fi

# Update state
STATE=$(echo "$STATE" | jq ".operations += [\"$TOOL_NAME\"]")
echo "$STATE" > "$STATE_FILE"

# Report
COUNT=$(echo "$STATE" | jq '.operations | length')
echo "Total operations: $COUNT"
exit 0
```

### Multi-File Operations

```bash
#!/usr/bin/env bash
# Update related files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# If component updated, update index
if [[ "$FILE_PATH" =~ /components/.*\.tsx$ ]]; then
  INDEX_FILE="$(dirname "$FILE_PATH")/index.ts"

  # Regenerate index
  echo "// Auto-generated by hook" > "$INDEX_FILE"
  for file in "$(dirname "$FILE_PATH")"/*.tsx; do
    NAME=$(basename "$file" .tsx)
    echo "export { $NAME } from './$NAME';" >> "$INDEX_FILE"
  done

  echo "Updated $INDEX_FILE"
fi

exit 0
```

### Notification Integration

```bash
#!/usr/bin/env bash
# Send Slack notification

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only notify for important files
if [[ "$FILE_PATH" =~ /src/core/ ]]; then
  WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

  if [[ -n "$WEBHOOK_URL" ]]; then
    curl -X POST "$WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"Core file modified: $(basename "$FILE_PATH")\"}" \
      2>/dev/null
  fi
fi

exit 0
```

### Validation Pipeline

```bash
#!/usr/bin/env bash
# Multi-stage validation

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Stage 1: Check for dangerous commands
if echo "$COMMAND" | grep -qE '\brm\s+-rf\s+/|\bmkfs\b|\bdd\s+if='; then
  echo "❌ Dangerous command blocked" >&2
  exit 2
fi

# Stage 2: Check for deprecated commands
if echo "$COMMAND" | grep -qE '\bgrep\b|\bfind\b'; then
  echo "⚠ Consider using rg or fd instead" >&2
fi

# Stage 3: Check for common mistakes
if echo "$COMMAND" | grep -qE 'git\s+push\s+--force'; then
  echo "⚠ Force push detected - use with caution" >&2
fi

exit 0
```

### Performance Monitoring

```bash
#!/usr/bin/env bash
# Track hook performance

START=$(date +%s%N)

# Hook logic here
INPUT=$(cat)
# ... process ...

# Calculate duration
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 )) # milliseconds

# Log performance
echo "[$(date -Iseconds)] Hook duration: ${DURATION}ms" >> /tmp/claude-perf.log

exit 0
```
