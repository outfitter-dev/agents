# Orchestration Pattern Example: Git + Linear Integration

This example demonstrates how to identify, specify, and implement an orchestration pattern.

## Pattern Identification

### Evidence from Conversation

**User request**:
> "Every time I commit code, I have to manually update the Linear issue with the commit SHA and branch name. Can we automate this?"

**Agent analysis**:
1. User has git workflow (commits, branches, PRs)
2. User tracks work in Linear (issues, status updates)
3. Manual coordination is time-consuming and error-prone
4. Pattern: Synchronize git events with Linear issue tracking

**Pattern observed**: Tool orchestration - coordinating git (version control) with Linear (project management) based on structured data (commit messages with issue IDs).

### Pattern Type Classification

**Type**: Orchestration (coordinating multiple external tools)

**Why not workflow?**: Not a multi-phase process, but ongoing event-driven coordination
**Why not heuristic?**: Not a decision rule, but automated tool synchronization

## Pattern Specification

```yaml
name: git-linear-sync
title: Git and Linear Issue Synchronization
type: orchestration
description: Automatically synchronize git commits and branches with Linear issues based on commit message conventions. Updates Linear issues with commit information and optionally changes issue status based on keywords.

tools_involved:
  - name: Git
    purpose: Version control, commit history
    access: Local git commands

  - name: Linear API
    purpose: Issue tracking, status updates
    access: GraphQL API with authentication

  - name: Grep/Pattern Matching
    purpose: Extract issue IDs from commit messages
    access: String parsing

coordination:
  - Extract Linear issue IDs from git commit messages
  - Query Linear API for issue details
  - Post commit information to Linear as comment
  - Update issue status based on commit keywords
  - Link commit SHA to Linear issue
  - Update issue branch field if applicable

external_systems:
  - name: Linear
    api: GraphQL
    endpoint: https://api.linear.app/graphql
    auth: API key (environment variable LINEAR_API_KEY)
    rate_limits: 100 requests per minute

commit_message_format: |
  Conventional format with Linear issue ID:

  feat: implement user authentication [ABC-123]

  - Add login form
  - Add session management

  Or inline format:
  ABC-123: fix password reset email

keywords:
  closes: ["closes", "fixes", "resolves"]
  starts: ["starts", "wip", "begin"]
  updates: ["updates", "relates to", "ref"]

status_mapping:
  closes: "Done"
  starts: "In Progress"
  updates: "In Progress" (if currently "Backlog" or "Todo")

triggers:
  - post-commit: Update Linear after each commit
  - pre-push: Batch update Linear for multiple commits
  - post-merge: Mark issues as done when merged to main

error_handling:
  - If Linear API is unreachable, log error but don't block commit
  - If issue ID not found in Linear, log warning
  - If multiple issue IDs in commit, update all
  - Retry failed requests up to 3 times with exponential backoff
```

## Component Recommendation

### Analysis

**Invocation**: Event-triggered (git hooks)

**Automation**: Fully automatable
- Issue ID extraction is pattern matching
- Linear API calls are deterministic
- Status updates follow clear rules
- No judgment required

**Behavior modification**: Yes (augments commits with Linear updates)

**Decision**: HOOK

### Rationale

This is a **Hook** because:
1. Event-triggered (post-commit, pre-push, post-merge)
2. Fully automatable (no human judgment needed)
3. Augments git operations with Linear synchronization
4. Should happen automatically without user action

**Not a Command** because: Should run automatically, not require manual invocation

**Not a Skill** because: No guidance needed, just automated synchronization

**Not an Agent** because: No expertise required, just API calls

### Composite Enhancement

Consider adding:

**COMMAND: `/linear-sync`**
- Manually trigger sync for existing commits
- Useful for backfilling or troubleshooting
- Same logic as hook, different trigger

**SKILL: linear-workflow**
- Guidance on commit message conventions
- Best practices for issue references
- When to use closes vs updates

## Generated Component Structure

### File Structure

```
hooks/
  post-commit/
    linear-sync.sh       # Main hook script
    linear-sync.config   # Configuration
  pre-push/
    linear-batch-sync.sh # Batch update for push

scripts/
  linear/
    extract-issues.sh    # Extract issue IDs from messages
    update-linear.sh     # Call Linear API
    retry.sh             # Retry logic with backoff

commands/
  linear-sync.md         # Manual sync command

docs/
  linear-integration.md  # Setup and configuration
```

### Hook Implementation

#### hooks.json

```json
{
  "post-commit": {
    "description": "Update Linear issues with commit information",
    "script": "hooks/post-commit/linear-sync.sh"
  },
  "pre-push": {
    "description": "Batch update Linear issues before push",
    "script": "hooks/pre-push/linear-batch-sync.sh"
  }
}
```

#### linear-sync.sh

```bash
#!/usr/bin/env bash
# Post-commit hook: Update Linear issues with commit information

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
LINEAR_API_KEY="${LINEAR_API_KEY:-}"

# Check if Linear API key is configured
if [[ -z "$LINEAR_API_KEY" ]]; then
  echo "Warning: LINEAR_API_KEY not set, skipping Linear sync"
  exit 0
fi

# Get commit information
COMMIT_SHA=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B "$COMMIT_SHA")
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
AUTHOR_NAME=$(git log -1 --pretty=%an "$COMMIT_SHA")

# Extract Linear issue IDs (format: ABC-123)
ISSUE_IDS=$(echo "$COMMIT_MSG" | grep -oE '[A-Z]+-[0-9]+' || true)

if [[ -z "$ISSUE_IDS" ]]; then
  echo "No Linear issue IDs found in commit message"
  exit 0
fi

# Update each issue
while IFS= read -r ISSUE_ID; do
  echo "Updating Linear issue: $ISSUE_ID"

  # Determine action based on keywords
  ACTION="update"
  if echo "$COMMIT_MSG" | grep -qiE '\b(closes|fixes|resolves)\b'; then
    ACTION="close"
  elif echo "$COMMIT_MSG" | grep -qiE '\b(starts|wip|begin)\b'; then
    ACTION="start"
  fi

  # Call Linear API update script
  "$SCRIPT_DIR/../scripts/linear/update-linear.sh" \
    --issue-id "$ISSUE_ID" \
    --commit-sha "$COMMIT_SHA" \
    --branch "$BRANCH_NAME" \
    --author "$AUTHOR_NAME" \
    --action "$ACTION" \
    --message "$COMMIT_MSG" || {
      echo "Warning: Failed to update Linear issue $ISSUE_ID"
    }

done <<< "$ISSUE_IDS"

echo "Linear sync complete"
```

#### scripts/linear/update-linear.sh

```bash
#!/usr/bin/env bash
# Update Linear issue via GraphQL API

set -euo pipefail

# Parse arguments
ISSUE_ID=""
COMMIT_SHA=""
BRANCH=""
AUTHOR=""
ACTION="update"
MESSAGE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --issue-id) ISSUE_ID="$2"; shift 2 ;;
    --commit-sha) COMMIT_SHA="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --author) AUTHOR="$2"; shift 2 ;;
    --action) ACTION="$2"; shift 2 ;;
    --message) MESSAGE="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Validate required arguments
if [[ -z "$ISSUE_ID" || -z "$COMMIT_SHA" ]]; then
  echo "Error: --issue-id and --commit-sha are required"
  exit 1
fi

# Linear API endpoint
LINEAR_API="https://api.linear.app/graphql"

# Escape message for JSON
MESSAGE_ESCAPED=$(echo "$MESSAGE" | jq -Rs .)

# Create comment body
COMMENT_BODY="Commit: \`$COMMIT_SHA\`
Branch: \`$BRANCH\`
Author: $AUTHOR

$MESSAGE"

COMMENT_ESCAPED=$(echo "$COMMENT_BODY" | jq -Rs .)

# GraphQL mutation to add comment
MUTATION_COMMENT=$(cat <<EOF
mutation {
  commentCreate(
    input: {
      issueId: "$ISSUE_ID"
      body: $COMMENT_ESCAPED
    }
  ) {
    success
    comment {
      id
    }
  }
}
EOF
)

# Call Linear API to add comment
curl -s -X POST "$LINEAR_API" \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MUTATION_COMMENT" | jq -Rs .)}" | \
  jq -e '.data.commentCreate.success' > /dev/null || {
    echo "Failed to add comment to issue $ISSUE_ID"
    exit 1
  }

# Update issue status based on action
if [[ "$ACTION" == "close" ]]; then
  STATUS_MUTATION=$(cat <<EOF
mutation {
  issueUpdate(
    id: "$ISSUE_ID"
    input: {
      stateId: "done-state-id"  # Replace with actual state ID
    }
  ) {
    success
  }
}
EOF
  )

  curl -s -X POST "$LINEAR_API" \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$STATUS_MUTATION" | jq -Rs .)}" | \
    jq -e '.data.issueUpdate.success' > /dev/null || {
      echo "Warning: Failed to update status for issue $ISSUE_ID"
    }

elif [[ "$ACTION" == "start" ]]; then
  STATUS_MUTATION=$(cat <<EOF
mutation {
  issueUpdate(
    id: "$ISSUE_ID"
    input: {
      stateId: "in-progress-state-id"  # Replace with actual state ID
    }
  ) {
    success
  }
}
EOF
  )

  curl -s -X POST "$LINEAR_API" \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$STATUS_MUTATION" | jq -Rs .)}" | \
    jq -e '.data.issueUpdate.success' > /dev/null || {
      echo "Warning: Failed to update status for issue $ISSUE_ID"
    }
fi

echo "Successfully updated Linear issue $ISSUE_ID"
```

### Configuration

#### linear-sync.config

```bash
# Linear API Configuration
LINEAR_API_KEY="${LINEAR_API_KEY:-}"  # Set in environment
LINEAR_WORKSPACE="${LINEAR_WORKSPACE:-}"  # Optional: workspace ID

# Issue ID pattern (default: PROJECT-123)
ISSUE_ID_PATTERN='[A-Z]+-[0-9]+'

# Keywords for status transitions
CLOSE_KEYWORDS="closes|fixes|resolves"
START_KEYWORDS="starts|wip|begin"
UPDATE_KEYWORDS="updates|relates to|ref"

# State IDs (fetch from Linear API)
STATE_TODO="todo-state-id"
STATE_IN_PROGRESS="in-progress-state-id"
STATE_DONE="done-state-id"

# Error handling
RETRY_ATTEMPTS=3
RETRY_DELAY=2  # seconds
FAIL_SILENTLY=true  # Don't block commits on Linear API failure
```

### Manual Command

#### commands/linear-sync.md

```markdown
---
name: linear-sync
description: Manually synchronize git commits with Linear issues
args:
  - name: commit-range
    description: Range of commits to sync (default: HEAD~5..HEAD)
    required: false
  - name: --dry-run
    description: Show what would be updated without making changes
    required: false
---

# Linear Sync Command

Manually synchronize git commits with Linear issues.

## Usage

```bash
# Sync last 5 commits (default)
/linear-sync

# Sync specific range
/linear-sync main..feature-branch

# Dry run to preview changes
/linear-sync --dry-run
```

## Implementation

```bash
#!/usr/bin/env bash

COMMIT_RANGE="${1:-HEAD~5..HEAD}"
DRY_RUN=false

if [[ "$*" == *"--dry-run"* ]]; then
  DRY_RUN=true
fi

# Get commits in range
git log --format="%H|%s" "$COMMIT_RANGE" | while IFS='|' read -r SHA MESSAGE; do
  ISSUE_IDS=$(echo "$MESSAGE" | grep -oE '[A-Z]+-[0-9]+' || true)

  if [[ -z "$ISSUE_IDS" ]]; then
    continue
  fi

  while IFS= read -r ISSUE_ID; do
    if [[ "$DRY_RUN" == true ]]; then
      echo "Would update $ISSUE_ID with commit $SHA"
    else
      echo "Updating $ISSUE_ID with commit $SHA"
      ./scripts/linear/update-linear.sh \
        --issue-id "$ISSUE_ID" \
        --commit-sha "$SHA" \
        --branch "$(git rev-parse --abbrev-ref HEAD)" \
        --author "$(git log -1 --pretty=%an "$SHA")" \
        --message "$MESSAGE"
    fi
  done <<< "$ISSUE_IDS"
done
```
```

## Integration with Other Components

### Used alongside

**SKILL: linear-workflow**
- Teaches commit message conventions
- Shows when to use closes vs updates
- Hook enforces, Skill educates

**COMMAND: /linear-status**
- Query Linear issues for project
- See which commits are linked
- Complementary to sync

### Configuration Example

```bash
# In .env or shell profile
export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxx"
export LINEAR_WORKSPACE="my-workspace"

# Initialize hook
cd my-project
./scripts/linear/setup.sh
```

### Setup Script

```bash
#!/usr/bin/env bash
# Setup Linear git integration

echo "Setting up Linear + Git integration..."

# Check for Linear API key
if [[ -z "$LINEAR_API_KEY" ]]; then
  echo "Error: LINEAR_API_KEY not set"
  echo "Get your API key from: https://linear.app/settings/api"
  exit 1
fi

# Fetch workspace state IDs
echo "Fetching Linear workspace states..."

STATE_IDS=$(curl -s -X POST "https://api.linear.app/graphql" \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ workflowStates { nodes { id name } } }"}' | \
  jq -r '.data.workflowStates.nodes[] | "\(.name): \(.id)"')

echo "Available states:"
echo "$STATE_IDS"

# Update config file
echo "Updating linear-sync.config with state IDs..."

# (Interactive prompts to select state IDs for todo, in-progress, done)

echo "Setup complete! Linear sync is now active."
echo "Commit messages with issue IDs (e.g., ABC-123) will update Linear."
```

## Testing

### Test Cases

```bash
# Test 1: Single issue ID
git commit -m "ABC-123: test commit"
# Expected: Comment added to ABC-123 in Linear

# Test 2: Multiple issue IDs
git commit -m "ABC-123 ABC-456: test multi-issue commit"
# Expected: Comments added to both ABC-123 and ABC-456

# Test 3: Closes keyword
git commit -m "Closes ABC-123: fix authentication bug"
# Expected: ABC-123 moved to Done state

# Test 4: No issue ID
git commit -m "refactor: clean up code"
# Expected: No Linear API calls, silent success

# Test 5: Invalid issue ID
git commit -m "ABC-999: test non-existent issue"
# Expected: Warning logged, commit succeeds

# Test 6: Linear API down
# Temporarily set wrong API key
LINEAR_API_KEY="invalid" git commit -m "ABC-123: test"
# Expected: Warning logged, commit succeeds (fail silently)
```

### Dry Run Testing

```bash
# Test sync without making changes
/linear-sync --dry-run

# Output should show:
# Would update ABC-123 with commit abc1234
# Would update ABC-456 with commit def5678
```

## Success Metrics

**Time saved**: How much manual work is eliminated?
- Before: ~2-3 minutes per commit to update Linear manually
- After: 0 seconds (automatic)
- For 20 commits/day: 40-60 minutes saved

**Accuracy**: How often are issues updated correctly?
- Before: ~85% (human error, forgotten updates)
- After: ~98% (automated, consistent)

**Traceability**: Can you find commits from Linear issues?
- Before: Manual linking, often incomplete
- After: 100% linked via commit comments

## Troubleshooting

### Hook not running

```bash
# Check if hook is executable
ls -l .git/hooks/post-commit
# Should show: -rwxr-xr-x

# If not, make executable
chmod +x .git/hooks/post-commit
```

### Linear API errors

```bash
# Test API key
curl -X POST "https://api.linear.app/graphql" \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { name } }"}' | jq .

# Should return your user info, not error
```

### Issue ID not extracted

```bash
# Test regex pattern
echo "ABC-123: test message" | grep -oE '[A-Z]+-[0-9]+'
# Should output: ABC-123
```

## Conclusion

This orchestration pattern automates git + Linear synchronization through event-driven hooks. Implement as a Hook for automatic updates, with optional Command for manual backfilling.
