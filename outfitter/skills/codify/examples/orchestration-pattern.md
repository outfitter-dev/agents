# Orchestration Pattern Example: Git + Linear Integration

Demonstrates identifying, specifying, and implementing an orchestration pattern.

## Pattern Identification

<evidence>

User: "Every time I commit, I manually update Linear with the commit SHA and branch. Can we automate this?"

Analysis:
- User has git workflow (commits, branches, PRs)
- User tracks work in Linear (issues, status)
- Manual coordination is time-consuming and error-prone

Pattern: Tool orchestration — coordinating git with Linear based on commit messages.

</evidence>

<classification>

Type: Orchestration (coordinating multiple external tools)

Why not workflow: Not multi-stage, but ongoing event-driven coordination
Why not heuristic: Not a decision rule, but automated synchronization

</classification>

## Pattern Specification

```yaml
name: git-linear-sync
type: orchestration
description: Synchronize git commits with Linear issues automatically

tools:
  - name: Git
    purpose: Version control, commit history
    access: Local git commands

  - name: Linear API
    purpose: Issue tracking, status updates
    access: GraphQL with auth

  - name: Pattern Matching
    purpose: Extract issue IDs from commits
    access: String parsing

coordination:
  - Extract Linear issue IDs from commit messages (ABC-123)
  - Query Linear API for issue details
  - Post commit info to Linear as comment
  - Update issue status based on keywords
  - Link commit SHA to issue

commit_format: |
  feat: implement auth [ABC-123]
  ABC-123: fix password reset

keywords:
  closes: [closes, fixes, resolves]
  starts: [starts, wip, begin]
  updates: [updates, relates to, ref]

status_mapping:
  closes: Done
  starts: In Progress
  updates: In Progress (if Backlog/Todo)

triggers:
  - post-commit: Update after each commit
  - pre-push: Batch update for multiple commits

error_handling:
  - API unreachable: Log error, don't block commit
  - Issue not found: Log warning
  - Multiple issue IDs: Update all
  - Retry: 3 attempts with exponential backoff
```

## Component Recommendation

<analysis>

Invocation: Event-triggered (git hooks)
Automation: Fully automatable (pattern matching, API calls)
Behavior modification: Yes (augments commits with Linear updates)

Decision: **HOOK**

</analysis>

<rationale>

HOOK because:
- Event-triggered (post-commit, pre-push)
- Fully automatable, no human judgment
- Augments git operations automatically
- Should run without user action

Not COMMAND: Should run automatically
Not SKILL: No guidance needed
Not AGENT: No expertise required

</rationale>

<composite>

COMMAND: `/linear-sync` — manually trigger for backfilling
SKILL: linear-workflow — guidance on commit conventions

</composite>

## Implementation Sketch

### File Structure

```text
hooks/
  post-commit/
    linear-sync.sh
  pre-push/
    linear-batch-sync.sh

scripts/
  linear/
    extract-issues.sh
    update-linear.sh

commands/
  linear-sync.md
```

### Hook Implementation

**post-commit hook**:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Check API key
if [[ -z "${LINEAR_API_KEY:-}" ]]; then
  echo "Warning: LINEAR_API_KEY not set, skipping sync"
  exit 0
fi

# Get commit info
COMMIT_SHA=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B "$COMMIT_SHA")
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Extract issue IDs (ABC-123)
ISSUE_IDS=$(echo "$COMMIT_MSG" | grep -oE '[A-Z]+-[0-9]+' || true)

[[ -z "$ISSUE_IDS" ]] && exit 0

# Determine action from keywords
ACTION="update"
echo "$COMMIT_MSG" | grep -qiE '\b(closes|fixes|resolves)\b' && ACTION="close"
echo "$COMMIT_MSG" | grep -qiE '\b(starts|wip|begin)\b' && ACTION="start"

# Update each issue
while IFS= read -r ISSUE_ID; do
  ./scripts/linear/update-linear.sh \
    --issue-id "$ISSUE_ID" \
    --commit-sha "$COMMIT_SHA" \
    --branch "$BRANCH" \
    --action "$ACTION"
done <<< "$ISSUE_IDS"
```

### Manual Command

```markdown
---
description: Manually sync commits with Linear
---

# /linear-sync

Sync existing commits with Linear issues.

Usage:
- `/linear-sync` — sync last 5 commits
- `/linear-sync main..feature` — sync range
- `/linear-sync --dry-run` — preview changes
```

## Testing

```bash
# Single issue
git commit -m "ABC-123: test commit"
# → Comment added to ABC-123

# Multiple issues
git commit -m "ABC-123 ABC-456: multi-issue"
# → Comments on both

# Closes keyword
git commit -m "Closes ABC-123: fix bug"
# → ABC-123 moved to Done

# No issue ID
git commit -m "refactor: clean up"
# → No API calls, silent success

# API down
LINEAR_API_KEY="invalid" git commit -m "ABC-123: test"
# → Warning logged, commit succeeds
```

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Time per commit | 2–3 min manual | 0 sec |
| Update accuracy | ~85% (human error) | ~98% |
| Commit traceability | Often incomplete | 100% linked |
