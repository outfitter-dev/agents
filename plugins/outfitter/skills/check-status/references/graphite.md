# Graphite Integration

Tool-specific patterns for integrating Graphite (gt) stack visualization and PR management into status reports.

## Overview

Graphite provides stack-aware version control with visual branch hierarchies and integrated PR management. Status reports should leverage stack structure for context-rich presentation.

## Core Commands

### Stack Visualization

```bash
# Get visual tree of stacked branches
gt log

# Output includes:
# - Branch hierarchy (parent/child relationships)
# - PR status per branch
# - Commit counts
# - Current branch indicator (◆)
# - Branch states (needs restack, needs submit, ready to merge)
```

**Example Output**:

```
◆ feature/auth-refactor (3) - #123 ✓ Ready to merge
├─ feature/add-jwt (2) - #122 ⏳ In progress
└─ feature/update-middleware (1) - #121 ⏸ Draft
```

### Branch State

```bash
# Get current stack state as JSON
gt stack --json

# Returns:
# - Branch metadata (name, parent, children)
# - PR associations
# - Commit SHAs and messages
# - Sync status (ahead/behind trunk)
```

### PR Submission Status

```bash
# Check if branches need submission
gt stack

# Shows branches with:
# - "needs submit" → changes not pushed to PR
# - "needs restack" → parent branch updated
# - "ready to merge" → approved, passing CI
```

## Data Gathering

### Stack Structure

Extract hierarchical branch relationships:

```typescript
interface StackNode {
  branch: string;
  prNumber?: number;
  prStatus?: 'draft' | 'open' | 'ready' | 'merged';
  commitCount: number;
  parent?: string;
  children: string[];
  isCurrent: boolean;
  needsRestack: boolean;
  needsSubmit: boolean;
}

async function getStackStructure(): Promise<StackNode[]> {
  // Parse gt log output or gt stack --json
  const output = await exec('gt log');

  // Extract:
  // - Branch names and hierarchy
  // - PR numbers (from "#123" markers)
  // - Status indicators (✓ ⏳ ⏸)
  // - Commit counts (from "(N)" markers)
  // - Current branch (◆ marker)

  return parseStackTree(output);
}
```

### PR Integration

Graphite automatically links branches to PRs:

```typescript
// Get PR metadata for stack
async function getStackPRs(branches: string[]): Promise<PRMetadata[]> {
  // Option 1: Parse from gt log (includes basic status)
  // Option 2: Query GitHub directly with PR numbers
  // Option 3: Use gt pr status --json (if available)

  const prNumbers = branches
    .map(b => extractPRNumber(b))
    .filter(Boolean);

  // Fetch details from GitHub (see github.md)
  return fetchPRDetails(prNumbers);
}
```

## Time Filtering

Graphite doesn't natively support time filtering, so filter results:

```typescript
async function getRecentStackActivity(since: string): Promise<StackActivity> {
  // Get full stack
  const stack = await getStackStructure();

  // Parse time constraint
  const cutoff = parseTimeConstraint(since); // "-24h" → Date

  // Filter by git commit timestamps
  for (const node of stack) {
    const commits = await exec(`git log ${node.branch} --since="${cutoff}" --format="%H %s %cr"`);
    node.recentCommits = parseCommits(commits);
  }

  // Only show branches with activity
  return stack.filter(n => n.recentCommits.length > 0);
}
```

## Presentation Templates

### Stack Tree Format

```
📊 GRAPHITE STACK
{current_branch_name}

{tree visualization from gt log}

Stack Summary:
  Branches: {total} ({open} with PRs)
  Ready to merge: {ready_count}
  Needs attention: {needs_restack + needs_submit}
```

### Stack-Aware PR Grouping

Organize PRs by stack position (bottom to top):

```
🔀 PULL REQUESTS (Stack-Aware)

Stack: {stack_name}
├─ PR #123: [feature/auth-refactor] Refactor authentication
│  CI: ✓ 3/3 passing | Reviews: ✓ 2 approved
│  Updated: 3 hours ago
│  └─ Ready to merge ✓
│
├─ PR #122: [feature/add-jwt] Add JWT token support
│  CI: ⏳ 2/3 passing | Reviews: 👀 1 change requested
│  Updated: 5 hours ago
│  └─ Depends on: PR #121
│
└─ PR #121: [feature/update-middleware] Update auth middleware
   CI: ✗ 1/3 failing | Reviews: ⏸ No reviews
   Updated: 1 day ago
   └─ Blocker: CI failing ◆◆
```

### Attention Indicators

Highlight stack-specific issues:

```
⚠️  STACK ATTENTION NEEDED
◆◆ PR #121: Blocking entire stack (failing CI)
◆  Branch feature/add-jwt: Needs restack (parent updated)
◇  Branch feature/auth-refactor: Needs submit (local changes)
```

## Cross-Referencing

### Link Stack to Issues

Match issue IDs in PR titles/bodies:

```typescript
function linkStackToIssues(stack: StackNode[], issues: Issue[]): void {
  for (const node of stack) {
    // Extract issue references from PR title
    // Pattern: "BLZ-123: Feature title" or "[BLZ-123] Feature title"
    const issueKeys = extractIssueKeys(node.prTitle);

    // Find matching issues
    node.relatedIssues = issues.filter(i => issueKeys.includes(i.key));
  }
}
```

### Dependency Tracking

Show blocked/blocking relationships:

```typescript
interface StackDependencies {
  branch: string;
  blockedBy: string[];  // Parent branches not merged
  blocking: string[];   // Child branches waiting
}

function analyzeStackDependencies(stack: StackNode[]): StackDependencies[] {
  return stack.map(node => ({
    branch: node.branch,
    blockedBy: node.parent && !isReadyToMerge(node.parent) ? [node.parent] : [],
    blocking: node.children.filter(child => isReadyToMerge(node) && !isReadyToMerge(child))
  }));
}
```

## Best Practices

### Efficient Queries

Minimize git/Graphite calls:
1. Single `gt log` for stack structure
2. Single `git log --all --since` for commit history
3. Batch PR queries to GitHub (see github.md)

### State Caching

Cache stack state to avoid repeated parsing:

```typescript
interface StackCache {
  timestamp: Date;
  stack: StackNode[];
  ttl: number; // milliseconds
}

function getCachedStack(ttl = 60000): StackNode[] | null {
  const cache = loadCache();
  if (cache && Date.now() - cache.timestamp.getTime() < ttl) {
    return cache.stack;
  }
  return null;
}
```

### Error Handling

Handle common Graphite errors:

```typescript
try {
  const stack = await exec('gt log');
} catch (error) {
  if (error.message.includes('not a git repository')) {
    return null; // Gracefully skip Graphite section
  }
  if (error.message.includes('graphite not initialized')) {
    // Suggest: gt repo init
    return null;
  }
  throw error; // Unexpected error
}
```

## Integration Points

### With GitHub (see github.md)

Combine Graphite stack structure with GitHub PR details:

```typescript
async function enrichStackWithGitHub(stack: StackNode[]): Promise<void> {
  const prNumbers = stack
    .map(n => n.prNumber)
    .filter(Boolean);

  const prDetails = await fetchGitHubPRs(prNumbers); // See github.md

  for (const node of stack) {
    const pr = prDetails.find(p => p.number === node.prNumber);
    if (pr) {
      node.ciStatus = pr.ciStatus;
      node.reviewStatus = pr.reviewStatus;
      node.updatedAt = pr.updatedAt;
    }
  }
}
```

### With Linear (see linear.md)

Link Linear issues to stack branches:

```typescript
async function linkStackToLinear(stack: StackNode[]): Promise<void> {
  // Extract all issue keys from PR titles
  const issueKeys = stack
    .flatMap(n => extractIssueKeys(n.prTitle || ''))
    .filter(Boolean);

  // Fetch Linear issues
  const issues = await fetchLinearIssues({ keys: issueKeys });

  // Annotate stack nodes
  for (const node of stack) {
    const keys = extractIssueKeys(node.prTitle || '');
    node.linearIssues = issues.filter(i => keys.includes(i.identifier));
  }
}
```

## Common Patterns

### Stack Health Score

Calculate stack quality metrics:

```typescript
interface StackHealth {
  score: number; // 0-100
  issues: string[];
  readyToMerge: number;
  needsWork: number;
}

function calculateStackHealth(stack: StackNode[]): StackHealth {
  let score = 100;
  const issues: string[] = [];

  const needsRestack = stack.filter(n => n.needsRestack).length;
  const needsSubmit = stack.filter(n => n.needsSubmit).length;
  const failingCI = stack.filter(n => n.ciStatus === 'failing').length;
  const readyToMerge = stack.filter(n => n.prStatus === 'ready').length;

  score -= needsRestack * 10; // -10 per restack needed
  score -= needsSubmit * 5;   // -5 per submit needed
  score -= failingCI * 20;    // -20 per failing CI

  if (needsRestack) issues.push(`${needsRestack} branches need restack`);
  if (needsSubmit) issues.push(`${needsSubmit} branches need submit`);
  if (failingCI) issues.push(`${failingCI} PRs with failing CI`);

  return {
    score: Math.max(0, score),
    issues,
    readyToMerge,
    needsWork: needsRestack + needsSubmit + failingCI
  };
}
```

### Stack Timeline

Show activity timeline across stack:

```
📅 STACK TIMELINE (Last 24 hours)

2 hours ago  │ PR #123 approved by @reviewer
3 hours ago  │ feature/auth-refactor: Pushed 2 commits
5 hours ago  │ PR #122: CI checks passing
1 day ago    │ feature/add-jwt: Created PR
```

## CLI Reference

Essential Graphite commands for status reporting:

```bash
# Stack visualization
gt log                    # Visual tree
gt log --short            # Compact format
gt log --json             # Machine-readable

# Stack state
gt stack                  # Current stack info
gt stack --json           # Structured output

# Branch operations (for context)
gt upstack                # Show branches above
gt downstack              # Show branches below

# PR operations (for context)
gt pr status              # PR status for stack
gt submit --dry-run       # Preview what would be submitted
```

## Troubleshooting

### Stack Not Showing

```bash
# Verify Graphite initialized
gt repo init

# Verify on a branch
git branch

# Check for trunk configuration
gt repo --show
```

### PR Associations Missing

```bash
# PRs might not be associated with branches
# Check with:
gt pr status

# Re-associate if needed:
gt pr submit
```

### Performance Issues

Large stacks (>20 branches) can slow down:
- Cache `gt log` output
- Limit depth with `gt log --depth 10`
- Filter to relevant branches only
- Consider pagination for display
