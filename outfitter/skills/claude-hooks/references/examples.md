# Hook Examples

Real-world examples of Claude Code event hooks for automation, validation, and workflow enhancement.

## Table of Contents

1. [Auto-Formatting](#auto-formatting)
2. [Validation Hooks](#validation-hooks)
3. [CI/CD Integration](#cicd-integration)
4. [Notification Systems](#notification-systems)
5. [Context Injection](#context-injection)
6. [Security Enforcement](#security-enforcement)
7. [Multi-Hook Workflows](#multi-hook-workflows)
8. [Team Collaboration](#team-collaboration)
9. [MCP Integration](#mcp-integration)
10. [Advanced Patterns](#advanced-patterns)
11. [Prompt-Based Hooks](#prompt-based-hooks)
12. [Community Examples](#community-examples)
13. [Component-Scoped Hooks](#component-scoped-hooks)

## Auto-Formatting

### TypeScript with Biome

Auto-format TypeScript files after writing or editing.

**Configuration** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts|*.tsx)",
        "hooks": [
          {
            "type": "command",
            "command": "biome check --write \"$file\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Result**: Every TypeScript file is automatically formatted with Biome after Claude writes or edits it.

### Python with Black

Auto-format Python files with Black.

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "black \"$file\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Advanced version with multiple formatters**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "black \"$file\"",
            "timeout": 10
          },
          {
            "type": "command",
            "command": "isort \"$file\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### Rust with rustfmt

Auto-format Rust code.

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.rs)",
        "hooks": [
          {
            "type": "command",
            "command": "rustfmt \"$file\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Multi-Language Formatter

Format multiple languages with appropriate tools.

**Script** (`.claude/hooks/format-code.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Determine formatter based on extension
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    if command -v biome &>/dev/null; then
      biome check --write "$FILE_PATH" 2>&1 || true
    fi
    ;;
  *.py)
    if command -v black &>/dev/null; then
      black "$FILE_PATH" 2>&1 || true
      isort "$FILE_PATH" 2>&1 || true
    fi
    ;;
  *.rs)
    if command -v rustfmt &>/dev/null; then
      rustfmt "$FILE_PATH" 2>&1 || true
    fi
    ;;
  *.go)
    if command -v gofmt &>/dev/null; then
      gofmt -w "$FILE_PATH" 2>&1 || true
    fi
    ;;
  *.md)
    if command -v prettier &>/dev/null; then
      prettier --write "$FILE_PATH" 2>&1 || true
    fi
    ;;
esac

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/format-code.sh",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

## Validation Hooks

### Bash Command Safety

Validate bash commands before execution.

**Script** (`.claude/hooks/validate-bash.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only validate Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Dangerous patterns to block
DANGEROUS_PATTERNS=(
  '\brm\s+-rf\s+/'
  '\bmkfs\b'
  '\bdd\s+if='
  '\bformat\s+[cC]:'
  '>\s*/dev/sd[a-z]'
  '\b:()\{\s*:\|\:&\s*\};:'  # Fork bomb
  '\bchmod\s+777\s+/'
  '\bchown\s+.*\s+/'
)

# Check for dangerous patterns
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    cat << EOF >&2
❌ Dangerous command blocked

Command: $COMMAND
Pattern: $pattern

This command could cause system damage and has been blocked.
EOF
    exit 2
  fi
done

# Deprecated command warnings
if echo "$COMMAND" | grep -qE '\bgrep\b'; then
  echo "⚠ Consider using 'rg' (ripgrep) instead of 'grep'" >&2
fi

if echo "$COMMAND" | grep -qE '\bfind\s+\S+\s+-name'; then
  echo "⚠ Consider using 'rg --files' or 'fd' instead of 'find'" >&2
fi

# Force push warning
if echo "$COMMAND" | grep -qE 'git\s+push\s+(--force|-f)'; then
  echo "⚠ Warning: Force push detected. Verify this is intentional." >&2
fi

echo "✓ Command validation passed"
exit 0
```

**Configuration**:

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

### File Path Security

Prevent path traversal and sensitive file access.

**Script** (`.claude/hooks/validate-paths.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Check for path traversal
if echo "$FILE_PATH" | grep -qE '\.\./'; then
  cat << EOF >&2
❌ Path traversal detected

File: $FILE_PATH

Paths containing '..' are not allowed for security reasons.
EOF
  exit 2
fi

# Check for sensitive system paths
SENSITIVE_PATTERNS=(
  '^/etc/'
  '^/root/'
  '^/home/[^/]+/\.ssh/'
  '^/var/log/'
  '^/sys/'
  '^/proc/'
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    cat << EOF >&2
❌ Access to sensitive system path blocked

File: $FILE_PATH

This path is restricted for security reasons.
EOF
    exit 2
  fi
done

# Check for sensitive files
SENSITIVE_FILES=(
  '\.env$'
  '\.env\.'
  'id_rsa'
  'id_ed25519'
  '\.pem$'
  'credentials'
  'password'
  '\.key$'
  'secret'
)

for pattern in "${SENSITIVE_FILES[@]}"; do
  if echo "$FILE_PATH" | grep -qiE "$pattern"; then
    cat << EOF >&2
⚠ Warning: Accessing sensitive file

File: $FILE_PATH

This file may contain sensitive information. Ensure this is intentional.
EOF
    # Don't block, just warn
  fi
done

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|Read",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-paths.sh",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

### JSON Schema Validation

Validate JSON files against schemas.

**Script** (`.claude/hooks/validate-json.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')

# Only validate JSON files
if [[ ! "$FILE_PATH" =~ \.json$ ]] || [[ -z "$CONTENT" ]]; then
  exit 0
fi

# Validate JSON syntax
if ! echo "$CONTENT" | jq empty 2>/dev/null; then
  echo "❌ Invalid JSON syntax" >&2
  exit 2
fi

# Validate specific files against schemas
case "$FILE_PATH" in
  *package.json)
    # Validate package.json has required fields
    if ! echo "$CONTENT" | jq -e '.name and .version' >/dev/null 2>&1; then
      echo "⚠ package.json missing required fields (name, version)" >&2
    fi
    ;;
  *tsconfig.json)
    # Validate tsconfig has compilerOptions
    if ! echo "$CONTENT" | jq -e '.compilerOptions' >/dev/null 2>&1; then
      echo "⚠ tsconfig.json missing compilerOptions" >&2
    fi
    ;;
  *.claude/settings.json)
    # Validate hooks structure if present
    if echo "$CONTENT" | jq -e '.hooks' >/dev/null 2>&1; then
      # Check each hook has required fields
      if ! echo "$CONTENT" | jq -e '.hooks | to_entries[] | .value[] | .matcher and .hooks' >/dev/null 2>&1; then
        echo "❌ Invalid hooks configuration" >&2
        exit 2
      fi
    fi
    ;;
esac

echo "✓ JSON validation passed"
exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write(*.json)",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-json.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## CI/CD Integration

### Trigger Build on File Change

Trigger build when specific files are modified.

**Script** (`.claude/hooks/trigger-build.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only trigger for source files
if [[ ! "$FILE_PATH" =~ (src/|lib/|pages/) ]]; then
  exit 0
fi

# Check if CI/CD is configured
if [[ ! -f ".github/workflows/build.yml" ]] && [[ ! -f ".gitlab-ci.yml" ]]; then
  exit 0
fi

# Create marker file for build trigger
MARKER_FILE=".build-needed"
echo "Build triggered by: $FILE_PATH" >> "$MARKER_FILE"

echo "✓ Build marker created: $MARKER_FILE"
echo "Run 'git add $MARKER_FILE && git commit' to trigger CI/CD build"

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/trigger-build.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

### Run Tests After Code Changes

Automatically run tests when code changes.

**Script** (`.claude/hooks/run-tests.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run tests for source files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx|py|rs)$ ]]; then
  exit 0
fi

# Skip test files themselves
if [[ "$FILE_PATH" =~ \.(test|spec)\. ]]; then
  exit 0
fi

echo "Running tests..."

# Detect test runner and run tests
if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
  # Node.js project
  if command -v bun &>/dev/null; then
    bun test 2>&1 || {
      echo "⚠ Tests failed. Review failures before committing." >&2
      exit 0  # Don't block, just warn
    }
  elif command -v npm &>/dev/null; then
    npm test 2>&1 || {
      echo "⚠ Tests failed. Review failures before committing." >&2
      exit 0
    }
  fi
elif [[ -f "Cargo.toml" ]]; then
  # Rust project
  cargo test 2>&1 || {
    echo "⚠ Tests failed. Review failures before committing." >&2
    exit 0
  }
elif [[ -f "pytest.ini" ]] || [[ -f "pyproject.toml" ]]; then
  # Python project
  pytest 2>&1 || {
    echo "⚠ Tests failed. Review failures before committing." >&2
    exit 0
  }
fi

echo "✓ Tests passed"
exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts|*.tsx|*.py|*.rs)",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/run-tests.sh",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

### Update Documentation

Auto-update docs when code changes.

**Script** (`.claude/hooks/update-docs.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only for public API files
if [[ ! "$FILE_PATH" =~ src/(index|api|public)\. ]]; then
  exit 0
fi

# Generate TypeScript docs
if [[ -f "tsconfig.json" ]] && command -v typedoc &>/dev/null; then
  echo "Generating TypeScript documentation..."
  typedoc --out docs/api src/index.ts 2>&1 || true
fi

# Generate Python docs
if [[ "$FILE_PATH" =~ \.py$ ]] && command -v pdoc &>/dev/null; then
  echo "Generating Python documentation..."
  pdoc --html --force --output-dir docs/api . 2>&1 || true
fi

# Generate Rust docs
if [[ "$FILE_PATH" =~ \.rs$ ]] && [[ -f "Cargo.toml" ]]; then
  echo "Generating Rust documentation..."
  cargo doc --no-deps 2>&1 || true
fi

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/update-docs.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## Notification Systems

### Slack Integration

Send notifications to Slack.

**Script** (`.claude/hooks/notify-slack.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Load webhook URL from .env if present (safe single-variable extraction)
if [[ -f ".env" ]]; then
  SLACK_WEBHOOK_URL=$(grep -E '^SLACK_WEBHOOK_URL=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
fi

WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

if [[ -z "$WEBHOOK_URL" ]]; then
  exit 0
fi

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only notify for important operations
case "$TOOL_NAME" in
  Write|Edit)
    # Only notify for specific directories
    if [[ "$FILE_PATH" =~ (src/core/|src/api/|migrations/) ]]; then
      MESSAGE="🤖 Claude modified: \`$(basename "$FILE_PATH")\` in \`$(dirname "$FILE_PATH")\`"

      curl -X POST "$WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"$MESSAGE\"}" \
        --silent --show-error 2>&1 || true
    fi
    ;;
esac

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/notify-slack.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Email Notifications

Send email for important events.

> **Note**: Configure a valid email address before use. The `mail` command will
> succeed even if the email is undeliverable, so verify your mail server setup.

**Script** (`.claude/hooks/send-email.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')

# Only email for session events
if [[ "$HOOK_EVENT" != "SessionEnd" ]]; then
  exit 0
fi

REASON=$(echo "$INPUT" | jq -r '.reason // "unknown"')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')

# Check if email is configured
if ! command -v mail &>/dev/null; then
  exit 0
fi

# Send email
mail -s "Claude Code Session Ended: $REASON" user@example.com << EOF
Session ID: $SESSION_ID
Reason: $REASON
Timestamp: $(date -Iseconds)

This is an automated notification from Claude Code.
EOF

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/send-email.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### Logging System

Comprehensive logging of all operations.

**Script** (`.claude/hooks/log-operations.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="$CLAUDE_PROJECT_DIR/.claude/logs"
mkdir -p "$LOG_DIR"

INPUT=$(cat)
TIMESTAMP=$(date -Iseconds)
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "N/A"')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')

# Log to daily file
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"

# Create log entry
LOG_ENTRY=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --arg event "$HOOK_EVENT" \
  --arg tool "$TOOL_NAME" \
  --arg session "$SESSION_ID" \
  '{timestamp: $ts, event: $event, tool: $tool, session: $session}')

echo "$LOG_ENTRY" >> "$LOG_FILE"

# Rotate logs older than 30 days
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/log-operations.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

## Context Injection

### Add Timestamp

Add current timestamp to every prompt.

**Script** (`.claude/hooks/add-timestamp.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Output current time context
cat << EOF
Current timestamp: $(date -Iseconds)
Current time: $(date '+%Y-%m-%d %H:%M:%S %Z')
Day of week: $(date '+%A')
EOF

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/add-timestamp.sh",
            "timeout": 1
          }
        ]
      }
    ]
  }
}
```

### Add Git Context

Inject git status into prompt context.

**Script** (`.claude/hooks/git-context.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Check if git repo
if ! git rev-parse --git-dir &>/dev/null; then
  exit 0
fi

cat << EOF
## Git Context

Branch: $(git branch --show-current 2>/dev/null || echo "detached")
Status: $(git status --short 2>/dev/null | wc -l | xargs) files modified
Last commit: $(git log -1 --oneline 2>/dev/null || echo "none")
Remote: $(git remote -v 2>/dev/null | head -1 | awk '{print $2}' || echo "none")
EOF

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/git-context.sh",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

### Add Environment Info

Inject environment and system information.

**Script** (`.claude/hooks/env-context.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

cat << EOF
## Environment Context

OS: $(uname -s)
Architecture: $(uname -m)
Node: $(node --version 2>/dev/null || echo "not installed")
Bun: $(bun --version 2>/dev/null || echo "not installed")
Python: $(python3 --version 2>/dev/null || echo "not installed")
Rust: $(rustc --version 2>/dev/null || echo "not installed")

Working directory: $PWD
User: $USER
Shell: $SHELL
EOF

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/env-context.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

## Security Enforcement

### Block Sensitive File Operations

Prevent operations on sensitive files.

**Script** (`.claude/hooks/block-sensitive.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Define sensitive patterns
BLOCKED_PATTERNS=(
  '\.env$'
  '\.env\.'
  'credentials'
  'secrets'
  'id_rsa'
  'id_ed25519'
  '\.pem$'
  '\.key$'
  '\.p12$'
  'password'
  'token'
  '\.git/config$'
)

# Check against patterns
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qiE "$pattern"; then
    cat << EOF >&2
❌ Access to sensitive file blocked

File: $FILE_PATH
Pattern: $pattern

This file may contain sensitive information and is protected.
If you need to modify this file, do it manually outside Claude Code.
EOF
    exit 2
  fi
done

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|Read",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/block-sensitive.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

### Enforce File Permissions

Ensure proper file permissions.

**Script** (`.claude/hooks/enforce-permissions.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]] || [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Ensure no world-writable files
if [[ -w "$FILE_PATH" ]] && [[ $(stat -f %A "$FILE_PATH" 2>/dev/null || stat -c %a "$FILE_PATH" 2>/dev/null) =~ [0-9][0-9]2$ ]]; then
  chmod o-w "$FILE_PATH"
  echo "⚠ Removed world-write permission from $FILE_PATH" >&2
fi

# Ensure scripts are executable
if [[ "$FILE_PATH" =~ \.(sh|bash|zsh)$ ]]; then
  if [[ ! -x "$FILE_PATH" ]]; then
    chmod +x "$FILE_PATH"
    echo "✓ Made script executable: $FILE_PATH"
  fi
fi

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/enforce-permissions.sh",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

### Audit Trail

Create audit trail of all operations.

**Script** (`.claude/hooks/audit-trail.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

AUDIT_FILE="$CLAUDE_PROJECT_DIR/.claude/audit.log"

INPUT=$(cat)
TIMESTAMP=$(date -Iseconds)
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "N/A"')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // "N/A"')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')

# Create audit entry
AUDIT_ENTRY=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --arg event "$HOOK_EVENT" \
  --arg tool "$TOOL_NAME" \
  --arg file "$FILE_PATH" \
  --arg session "$SESSION_ID" \
  --arg user "$USER" \
  --arg host "$HOSTNAME" \
  '{
    timestamp: $ts,
    event: $event,
    tool: $tool,
    file: $file,
    session: $session,
    user: $user,
    host: $host
  }')

# Append to audit log
echo "$AUDIT_ENTRY" >> "$AUDIT_FILE"

# Keep only last 10000 lines
tail -n 10000 "$AUDIT_FILE" > "$AUDIT_FILE.tmp" && mv "$AUDIT_FILE.tmp" "$AUDIT_FILE"

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/audit-trail.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

## Multi-Hook Workflows

### Complete TypeScript Workflow

Format, type-check, lint, and test TypeScript files.

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts|*.tsx)",
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
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/run-tests.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Python Development Workflow

Format, type-check, lint, and test Python files.

**Configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "black \"$file\"",
            "timeout": 10
          },
          {
            "type": "command",
            "command": "isort \"$file\"",
            "timeout": 5
          },
          {
            "type": "command",
            "command": "mypy \"$file\"",
            "timeout": 10
          },
          {
            "type": "command",
            "command": "pylint \"$file\"",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

### Pre-Commit Workflow

Validate before allowing write operations.

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-paths.sh",
            "timeout": 3
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/block-sensitive.sh",
            "timeout": 2
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/format-code.sh",
            "timeout": 15
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/audit-trail.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

## Team Collaboration

### Shared Team Hooks

Team-wide formatting and validation.

**Project** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit(*.ts|*.tsx)",
        "hooks": [
          {
            "type": "command",
            "command": "biome check --write \"$file\"",
            "timeout": 10
          }
        ]
      },
      {
        "matcher": "Write|Edit(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "black \"$file\"",
            "timeout": 10
          }
        ]
      }
    ],
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

### Personal Overrides

Personal preferences that extend team hooks.

**Personal** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "echo '👋 Welcome back!' && git status",
            "timeout": 3
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo '✅ Task completed at $(date +%H:%M)'",
            "timeout": 1
          }
        ]
      }
    ]
  }
}
```

## MCP Integration

### Log Memory Operations

Track MCP memory tool usage.

**Script** (`.claude/hooks/log-memory.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Only for memory MCP tools
if [[ ! "$TOOL_NAME" =~ ^mcp__memory__ ]]; then
  exit 0
fi

OPERATION=$(echo "$TOOL_NAME" | sed 's/mcp__memory__//')
TIMESTAMP=$(date -Iseconds)

# Log the operation
echo "[$TIMESTAMP] Memory operation: $OPERATION" >> "$CLAUDE_PROJECT_DIR/.claude/memory-ops.log"

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/log-memory.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

### Validate GitHub Operations

Validate GitHub MCP operations.

**Script** (`.claude/hooks/validate-github.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Only for GitHub MCP tools
if [[ ! "$TOOL_NAME" =~ ^mcp__github__ ]]; then
  exit 0
fi

# Warn about destructive operations
if [[ "$TOOL_NAME" =~ (delete|close|merge) ]]; then
  echo "⚠ Warning: Destructive GitHub operation: $TOOL_NAME" >&2
fi

exit 0
```

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-github.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

## Advanced Patterns

### Conditional Hook Execution

Execute hooks only under certain conditions.

**Script** (`.claude/hooks/conditional-format.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only format during work hours (9 AM - 5 PM)
HOUR=$(date +%H)
if [[ $HOUR -lt 9 || $HOUR -gt 17 ]]; then
  echo "Skipping format outside work hours"
  exit 0
fi

# Only format files in src/ directory
if [[ ! "$FILE_PATH" =~ ^.*/src/ ]]; then
  exit 0
fi

# Run formatter
if [[ "$FILE_PATH" =~ \.ts$ ]]; then
  biome check --write "$FILE_PATH"
fi

exit 0
```

### State Management

Track state across hook invocations.

**Script** (`.claude/hooks/track-changes.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

STATE_FILE="$CLAUDE_PROJECT_DIR/.claude/hook-state.json"

# Initialize state if needed
if [[ ! -f "$STATE_FILE" ]]; then
  echo '{"files_modified": [], "total_operations": 0}' > "$STATE_FILE"
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -n "$FILE_PATH" ]]; then
  # Update state
  STATE=$(cat "$STATE_FILE")
  STATE=$(echo "$STATE" | jq \
    --arg file "$FILE_PATH" \
    '.files_modified += [$file] | .files_modified |= unique | .total_operations += 1')
  echo "$STATE" > "$STATE_FILE"

  # Report
  TOTAL=$(echo "$STATE" | jq '.total_operations')
  echo "Total operations this session: $TOTAL"
fi

exit 0
```

### Async Background Operations

Run expensive operations asynchronously.

**Script** (`.claude/hooks/async-index.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Start background indexing
(
  sleep 1
  # Rebuild search index
  if command -v rg &>/dev/null; then
    rg --files > "$CLAUDE_PROJECT_DIR/.claude/file-index.txt" 2>/dev/null
  fi
  echo "Index updated: $(date -Iseconds)" >> "$CLAUDE_PROJECT_DIR/.claude/index.log"
) &

echo "✓ Background indexing started"
exit 0
```

### Performance Monitoring

Track hook performance.

**Script** (`.claude/hooks/perf-monitor.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

START_NS=$(date +%s%N)

# Original hook logic
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# ... process ...

# Calculate duration
END_NS=$(date +%s%N)
DURATION_MS=$(( (END_NS - START_NS) / 1000000 ))

# Log performance
PERF_LOG="$CLAUDE_PROJECT_DIR/.claude/perf.log"
echo "$(date -Iseconds) | $TOOL_NAME | ${DURATION_MS}ms" >> "$PERF_LOG"

# Warn if slow
if [[ $DURATION_MS -gt 1000 ]]; then
  echo "⚠ Hook took ${DURATION_MS}ms (>1s)" >&2
fi

exit 0
```

### Error Recovery

Robust error handling with recovery.

**Script** (`.claude/hooks/robust-format.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Trap errors
trap 'echo "Error on line $LINENO" >&2; exit 1' ERR

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Create backup before formatting
BACKUP="${FILE_PATH}.bak"
cp "$FILE_PATH" "$BACKUP"

# Try to format
if ! biome check --write "$FILE_PATH" 2>/dev/null; then
  # Restore backup on failure
  mv "$BACKUP" "$FILE_PATH"
  echo "⚠ Format failed, restored original file" >&2
  exit 1
fi

# Remove backup on success
rm -f "$BACKUP"
echo "✓ Formatted successfully"
exit 0
```

## Prompt-Based Hooks

Prompt-based hooks use LLM reasoning for context-aware validation. Recommended for complex decisions.

### Smart Security Validation

Use LLM to analyze file operations:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "prompt",
          "prompt": "Analyze this file operation for security issues:\n\n$TOOL_INPUT\n\nCheck for:\n1. Sensitive paths (/etc, ~/.ssh, .env files)\n2. Credentials or API keys in content\n3. Path traversal attempts (..)\n4. Executable file creation\n\nRespond with JSON: {\"decision\": \"allow|deny\", \"reason\": \"brief explanation\"}",
          "timeout": 30
        }]
      }
    ]
  }
}
```

### Context-Aware Bash Validation

Evaluate command safety with reasoning:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "prompt",
          "prompt": "Evaluate if this bash command is safe to execute:\n\n$TOOL_INPUT\n\nConsider:\n1. Could it delete important files?\n2. Could it expose secrets?\n3. Could it modify system configuration?\n4. Is it appropriate for a development environment?\n\nRespond: {\"decision\": \"allow|deny\", \"reason\": \"...\"}",
          "timeout": 30
        }]
      }
    ]
  }
}
```

### Task Completion Verification

Verify work quality before stopping:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "prompt",
          "prompt": "Review the completed task. Consider:\n1. Were all requirements addressed?\n2. Were tests added or updated?\n3. Is there any unfinished work?\n4. Should the user be informed of anything?\n\nProvide a brief summary if there are concerns.",
          "timeout": 30
        }]
      }
    ]
  }
}
```

## Community Examples

Real-world examples from the Claude Code community.

### disler/claude-code-hooks-mastery

Comprehensive hook examples using Python with UV for dependency management.

**Directory structure**:

```
.claude/
├── hooks/
│   ├── user_prompt_submit.py   # Prompt validation and logging
│   ├── pre_tool_use.py         # Command blocking
│   ├── post_tool_use.py        # Tool completion logging
│   ├── notification.py         # TTS notifications
│   ├── stop.py                 # AI completion messages
│   ├── subagent_stop.py        # Subagent tracking
│   ├── pre_compact.py          # Transcript backup
│   └── session_start.py        # Context loading
└── settings.json
```

**Configuration pattern**:

```json
{
  "UserPromptSubmit": [{
    "hooks": [{
      "type": "command",
      "command": "uv run .claude/hooks/user_prompt_submit.py --log-only"
    }]
  }],
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "command",
      "command": "uv run .claude/hooks/pre_tool_use.py"
    }]
  }]
}
```

**Source**: <https://github.com/disler/claude-code-hooks-mastery>

### ChrisWiles/claude-code-showcase

Complete Claude Code configuration with hooks, skills, agents, and GitHub Actions.

**Features**:
- Auto-format code on file changes
- Run tests when test files change
- Type-check TypeScript
- Block edits on main branch
- Skill matching for prompts

**Branch protection hook**:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "[ \"$(git branch --show-current)\" != \"main\" ] || exit 2",
        "timeout": 5
      }]
    }]
  }
}
```

**Source**: <https://github.com/ChrisWiles/claude-code-showcase>

### GitButler Integration

GitButler provides hooks for automatic branch and commit management.

**Configuration**:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "but claude pre-tool",
        "timeout": 5
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "but claude post-tool",
        "timeout": 5
      }]
    }],
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "but claude stop",
        "timeout": 10
      }]
    }]
  }
}
```

**Source**: <https://docs.gitbutler.com/features/ai-integration/claude-code-hooks>

## Component-Scoped Hooks

Hooks defined in skills, agents, and commands frontmatter. Only active when the component is loaded.

### Skill with Validation Hook

```yaml
---
name: secure-coding
description: Security-focused coding skill
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: prompt
          prompt: "Validate this code change for security best practices..."
  PostToolUse:
    - matcher: "Write|Edit(*.ts)"
      hooks:
        - type: command
          command: "eslint --fix \"$file\""
---

# Secure Coding Skill

When active, this skill validates all code changes for security issues.
```

### Agent with Completion Hook

```yaml
---
name: code-reviewer
description: Reviews code for quality issues
model: sonnet
hooks:
  Stop:
    - matcher: "*"
      hooks:
        - type: prompt
          prompt: "Summarize the code review findings and severity levels."
---

# Code Reviewer Agent

Performs thorough code review with summarized findings.
```

### Command with Context Hook

```yaml
---
description: Deploy to staging environment
argument-hint: [component to deploy]
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./.claude/hooks/validate-deploy.sh"
---

# Deploy Command

Deploys the specified component to staging with pre-flight checks.
```

## External Resources

- [Official Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Blog: Hook Configuration](https://claude.com/blog/how-to-configure-hooks)
- [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)
- [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [GitButler Hooks Documentation](https://docs.gitbutler.com/features/ai-integration/claude-code-hooks)
