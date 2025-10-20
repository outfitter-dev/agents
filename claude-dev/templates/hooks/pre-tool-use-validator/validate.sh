#!/usr/bin/env bash
set -euo pipefail

# Pre-Tool-Use Hook: Validate file operations before they execute
# This hook can block dangerous operations by exiting with code 2

# Read hook input from stdin
INPUT=$(cat)

# Extract tool information
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Validate file path is not empty
if [[ -z "$FILE_PATH" ]]; then
  echo "Error: No file path provided" >&2
  exit 2  # Exit 2 = block operation and show error to Claude
fi

# Block path traversal attempts
if echo "$FILE_PATH" | grep -q '\.\.'; then
  echo "❌ BLOCKED: Path traversal detected in: $FILE_PATH" >&2
  echo "Path traversal is not allowed for security reasons." >&2
  exit 2
fi

# Block sensitive file modifications
SENSITIVE_PATTERNS=(
  "^/etc/"
  "^/root/"
  "\.env$"
  "\.env\.local$"
  "\.env\.production$"
  "credentials\.json$"
  "\.aws/credentials$"
  "\.ssh/id_"
  "package-lock\.json$"
  "bun\.lockb$"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "❌ BLOCKED: Attempt to modify sensitive file: $FILE_PATH" >&2
    echo "Modifying this file requires manual review." >&2
    exit 2
  fi
done

# Block modifications outside project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REAL_FILE_PATH=$(realpath "$FILE_PATH" 2>/dev/null || echo "$FILE_PATH")

if [[ ! "$REAL_FILE_PATH" =~ ^"$PROJECT_DIR" ]]; then
  echo "⚠️  WARNING: File is outside project directory: $FILE_PATH" >&2
  echo "Proceeding, but please verify this is intentional." >&2
  # Exit 0 with warning - not blocking
fi

# Approve operation
echo "✓ Validation passed for: $FILE_PATH"
exit 0
