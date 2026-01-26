# Security Best Practices

Comprehensive security guidance for Claude Code hooks.

## Input Validation

### Validate All Input

Always validate and sanitize hook input before use:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Validate input exists
if [[ -z "$FILE_PATH" ]]; then
  echo "Error: file_path missing" >&2
  exit 1
fi

# Validate format
if [[ ! "$FILE_PATH" =~ ^[a-zA-Z0-9_./-]+$ ]]; then
  echo "Error: invalid characters in file path" >&2
  exit 2
fi
```

### Check for Path Traversal

Block directory traversal attacks:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Block path traversal
if echo "$FILE_PATH" | grep -qE '\.\./'; then
  cat << EOF >&2
Path traversal detected: $FILE_PATH
Paths containing '..' are not allowed.
EOF
  exit 2
fi

# Block absolute paths outside project
if [[ "$FILE_PATH" == /* ]] && [[ ! "$FILE_PATH" == "$CLAUDE_PROJECT_DIR"* ]]; then
  echo "Access outside project directory blocked: $FILE_PATH" >&2
  exit 2
fi
```

### Block Sensitive System Paths

Prevent access to system files:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Blocked system paths
BLOCKED_PATHS=(
  '^/etc/'
  '^/root/'
  '^/home/[^/]+/\.ssh/'
  '^/var/log/'
  '^/sys/'
  '^/proc/'
  '^/boot/'
  '^/usr/bin/'
  '^/usr/sbin/'
)

for pattern in "${BLOCKED_PATHS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    cat << EOF >&2
Access to sensitive system path blocked: $FILE_PATH
This path is restricted for security reasons.
EOF
    exit 2
  fi
done
```

### Detect Sensitive Files

Warn or block access to sensitive project files:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Sensitive file patterns
SENSITIVE_PATTERNS=(
  '\.env$'
  '\.env\.'
  'id_rsa'
  'id_ed25519'
  '\.pem$'
  '\.key$'
  '\.p12$'
  'credentials'
  'password'
  'token'
  'secret'
  '\.git/config$'
  '\.npmrc$'
  '\.pypirc$'
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qiE "$pattern"; then
    cat << EOF >&2
Warning: Accessing sensitive file: $FILE_PATH
This file may contain sensitive information.
EOF
    # Could exit 2 to block, or continue with warning
  fi
done
```

## Command Injection Prevention

### Always Quote Variables

```bash
# WRONG - vulnerable to injection
rm $FILE_PATH
cd $DIRECTORY
echo $CONTENT

# CORRECT - properly quoted
rm "$FILE_PATH"
cd "$DIRECTORY"
echo "$CONTENT"
```

### Avoid eval

```bash
# WRONG - dangerous
eval "$USER_COMMAND"

# CORRECT - use specific commands
if [[ "$USER_COMMAND" == "format" ]]; then
  black "$FILE_PATH"
fi
```

### Validate Command Patterns

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block dangerous command patterns
DANGEROUS_PATTERNS=(
  '\brm\s+-rf\s+/'           # rm -rf /
  '\brm\s+--no-preserve-root' # rm --no-preserve-root
  '\bmkfs\b'                  # filesystem format
  '\bdd\s+if='                # disk destruction
  '\bformat\s+[cC]:'          # Windows format
  '>\s*/dev/sd[a-z]'          # overwrite disk
  ':()\{\s*:\|\:&\s*\};:'     # Fork bomb
  '\bchmod\s+777\s+/'         # Dangerous permissions
  '\bchown\s+.*\s+/'          # System ownership change
  '\bcurl\s+.*\|\s*bash'      # Pipe to bash
  '\bwget\s+.*\|\s*bash'      # Pipe to bash
  '\bsudo\s+rm'               # Sudo rm
  '\bgit\s+push\s+--force\s+origin\s+main' # Force push main
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    cat << EOF >&2
Dangerous command blocked: $COMMAND
Pattern matched: $pattern
EOF
    exit 2
  fi
done
```

## Path Security

### Use Absolute Paths

Always construct paths from known roots:

```bash
#!/usr/bin/env bash
# Use CLAUDE_PROJECT_DIR for project paths
SCRIPT_PATH="$CLAUDE_PROJECT_DIR/.claude/hooks/helper.sh"

# Use CLAUDE_PLUGIN_ROOT for plugin paths
PLUGIN_SCRIPT="${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"

# Never rely on relative paths
# BAD: ./scripts/validate.sh
# GOOD: "$CLAUDE_PROJECT_DIR/.claude/scripts/validate.sh"
```

### Validate Script Existence

```bash
#!/usr/bin/env bash
SCRIPT_PATH="$CLAUDE_PROJECT_DIR/.claude/hooks/helper.sh"

# Check exists
if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "Error: script not found: $SCRIPT_PATH" >&2
  exit 1
fi

# Check executable
if [[ ! -x "$SCRIPT_PATH" ]]; then
  echo "Error: script not executable: $SCRIPT_PATH" >&2
  exit 1
fi

# Execute safely
"$SCRIPT_PATH" "$@"
```

### Resolve Symlinks

```bash
#!/usr/bin/env bash
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path')

# Resolve symlinks to check actual destination
REAL_PATH=$(realpath "$FILE_PATH" 2>/dev/null || echo "$FILE_PATH")

# Check the real path is within project
if [[ ! "$REAL_PATH" == "$CLAUDE_PROJECT_DIR"* ]]; then
  echo "Symlink points outside project: $FILE_PATH -> $REAL_PATH" >&2
  exit 2
fi
```

## Sensitive Data Protection

### Never Log Sensitive Data

```bash
#!/usr/bin/env bash
INPUT=$(cat)

# WRONG - logs everything including secrets
echo "Input: $INPUT" >> /tmp/debug.log

# CORRECT - log only safe fields
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
echo "Tool: $TOOL_NAME" >> /tmp/debug.log

# CORRECT - filter sensitive fields before logging
echo "$INPUT" | jq 'del(.tool_input.password, .tool_input.api_key, .tool_input.token)' >> /tmp/debug.log
```

### Sanitize Output

```bash
#!/usr/bin/env bash
INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')

# Check for secrets in content
if echo "$CONTENT" | grep -qiE '(password|api_key|secret|token)\s*[=:]\s*\S+'; then
  echo "Warning: Potential secret detected in content" >&2
  # Could block or just warn
fi
```

### Protect Environment Variables

```bash
#!/usr/bin/env bash
# Don't expose sensitive env vars

# WRONG
echo "API_KEY=$API_KEY"
env | grep -i secret

# CORRECT - never print secrets
echo "API key configured: $([ -n "$API_KEY" ] && echo "yes" || echo "no")"
```

## Timeout Protection

### Set Appropriate Timeouts

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "./.claude/hooks/validate.sh",
        "timeout": 5
      }]
    }],
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "./.claude/hooks/format.sh",
        "timeout": 30
      }]
    }]
  }
}
```

**Guidelines**:
- Quick validation: 3-5 seconds
- Formatting: 10-30 seconds
- Network operations: 30-60 seconds
- Default: 60 seconds for command, 30 seconds for prompt

### Handle Timeouts Gracefully

```bash
#!/usr/bin/env bash
set -euo pipefail

# Set internal timeout for network operations
timeout 10 curl -s https://api.example.com/validate || {
  echo "API validation skipped (timeout)" >&2
  exit 0  # Don't block on timeout
}
```

## Error Handling

### Use Strict Mode

```bash
#!/usr/bin/env bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Also consider:
set -E  # Inherit ERR trap in functions
trap 'echo "Error on line $LINENO" >&2' ERR
```

### Validate Dependencies

```bash
#!/usr/bin/env bash
set -euo pipefail

# Check required tools exist
for cmd in jq git curl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd not installed" >&2
    exit 1
  fi
done
```

### Handle JSON Parsing Errors

```bash
#!/usr/bin/env bash
set -euo pipefail

# Read input with error handling
INPUT=$(cat) || {
  echo "Error: failed to read stdin" >&2
  exit 1
}

# Parse with validation
if ! echo "$INPUT" | jq empty 2>/dev/null; then
  echo "Error: invalid JSON input" >&2
  exit 1
fi

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
if [[ -z "$TOOL_NAME" ]]; then
  echo "Error: tool_name missing" >&2
  exit 1
fi
```

## Permission Control

### PreToolUse Permission Decisions

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Auto-approve reads of non-sensitive files
if [[ "$TOOL_NAME" == "Read" ]] && [[ ! "$FILE_PATH" =~ \.(env|key|pem)$ ]]; then
  cat << EOF
{
  "continue": true,
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow"
  }
}
EOF
  exit 0
fi

# Ask for writes to core files
if [[ "$FILE_PATH" =~ src/core/ ]]; then
  cat << EOF
{
  "continue": true,
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Write to core module requires confirmation"
  }
}
EOF
  exit 0
fi

# Default: allow
exit 0
```

### PermissionRequest Hook

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Auto-deny certain operations
if [[ "$TOOL_NAME" =~ (delete|destroy|remove) ]]; then
  cat << EOF
{
  "hookSpecificOutput": {
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive operations require manual approval"
  }
}
EOF
  exit 0
fi
```

## Audit Trail

### Log All Operations

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

# Create audit entry (filter sensitive data)
AUDIT_ENTRY=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --arg event "$HOOK_EVENT" \
  --arg tool "$TOOL_NAME" \
  --arg file "$FILE_PATH" \
  --arg session "$SESSION_ID" \
  --arg user "$USER" \
  '{
    timestamp: $ts,
    event: $event,
    tool: $tool,
    file: $file,
    session: $session,
    user: $user
  }')

echo "$AUDIT_ENTRY" >> "$AUDIT_FILE"

# Rotate: keep only last 10000 entries
tail -n 10000 "$AUDIT_FILE" > "$AUDIT_FILE.tmp" && mv "$AUDIT_FILE.tmp" "$AUDIT_FILE"

exit 0
```

## Security Checklist

### Before Deploying Hooks

- [ ] All input validated and sanitized
- [ ] Path traversal attacks blocked
- [ ] Sensitive system paths protected
- [ ] All shell variables quoted
- [ ] No eval or command injection vectors
- [ ] Sensitive data not logged
- [ ] Appropriate timeouts set
- [ ] Dependencies validated
- [ ] Error handling robust
- [ ] Audit trail enabled

### Regular Security Review

- [ ] Review hook scripts for vulnerabilities
- [ ] Check for hardcoded secrets
- [ ] Verify timeout values are appropriate
- [ ] Audit logged data for sensitive info leaks
- [ ] Update blocked patterns for new threats
- [ ] Test hooks with malicious input
