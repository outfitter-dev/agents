#!/usr/bin/env bash
set -euo pipefail

# Post-Tool-Use Hook: Auto-format TypeScript files after Write/Edit
# This hook runs automatically after Claude writes or edits .ts files

# Read hook input from stdin
INPUT=$(cat)

# Extract file path from the tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Validate file path exists
if [[ -z "$FILE_PATH" ]]; then
  echo "No file path provided" >&2
  exit 1
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
  echo "File not found: $FILE_PATH" >&2
  exit 1
fi

# Format the file with biome (adjust to your formatter)
echo "Formatting $FILE_PATH..."

if command -v biome &>/dev/null; then
  biome check --write "$FILE_PATH" 2>&1 || {
    echo "Warning: biome formatting failed for $FILE_PATH" >&2
    exit 0  # Non-blocking warning
  }
  echo "✓ Formatted successfully"
elif command -v prettier &>/dev/null; then
  prettier --write "$FILE_PATH" 2>&1 || {
    echo "Warning: prettier formatting failed for $FILE_PATH" >&2
    exit 0
  }
  echo "✓ Formatted successfully"
else
  echo "Warning: No formatter found (biome or prettier)" >&2
  exit 0
fi

exit 0
