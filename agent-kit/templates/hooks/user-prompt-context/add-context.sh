#!/usr/bin/env bash
set -euo pipefail

# User-Prompt-Submit Hook: Add context to every user prompt
# This hook runs when the user submits a prompt, adding useful context for Claude

# Read hook input (not strictly needed for this hook, but good practice)
INPUT=$(cat)

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

# Get git context if in a repo
GIT_CONTEXT=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  GIT_CONTEXT="
**Git Context:**
- Branch: \`$BRANCH\`
- Last commit: $(git log -1 --oneline 2>/dev/null || echo "No commits")"
fi

# Get environment context
NODE_VERSION=$(node --version 2>/dev/null || echo "Not installed")
BUN_VERSION=$(bun --version 2>/dev/null || echo "Not installed")

# Output context that will be added to the prompt
cat <<EOF

---
**Session Context** (auto-added by hook)
- Current time: $TIMESTAMP
- Node.js: $NODE_VERSION
- Bun: $BUN_VERSION$GIT_CONTEXT
---

EOF

exit 0
