---
name: gitbutler-stack-workflows
description: Creates, navigates, and reorganizes stacks in GitButler using virtual branches, anchor-based stacking, and post-hoc organization patterns. Use for stack creation, dependency management, branch reorganization, and PR preparation workflows.
---

# GitButler Stack Workflows

Comprehensive guide to creating, navigating, and reorganizing stacks in GitButler using the CLI.

## When to Use This Skill

- Creating stacked branches with dependencies
- Converting independent branches into stacks
- Reorganizing existing work into stack structures
- Navigating and understanding stack relationships
- Preparing stacks for PR submission
- Post-hoc stack organization after exploratory coding

## Quick Start: Creating a Stack

### Linear Stack Pattern

Create a stack where each branch builds on the previous one:

```bash
# Create base branch
but branch new base-feature

# Create stacked branch with --anchor
but branch new dependent-feature --anchor base-feature

# Create third level
but branch new final-feature --anchor dependent-feature
```

**Result**: `base-feature` ← `dependent-feature` ← `final-feature`

### Verifying Stack Structure

```bash
# View all branches and their relationships
but log

# JSON output for programmatic inspection
but --json log | jq '.[] | .branchDetails[] | {name, baseCommit}'
```

## Stack Patterns

### 1. Feature Dependency Stack

**Use case**: Features that build on each other sequentially.

```bash
# Authentication foundation
but branch new auth-core
# ... implement auth core ...
but commit auth-core -m "feat: add authentication core"

# OAuth layer depends on auth core
but branch new auth-oauth --anchor auth-core
# ... implement OAuth ...
but commit auth-oauth -m "feat: add OAuth integration"

# Social login depends on OAuth
but branch new auth-social --anchor auth-oauth
# ... implement social login ...
but commit auth-social -m "feat: add social login providers"
```

**Stack**: `auth-core` ← `auth-oauth` ← `auth-social`

### 2. Refactoring Stack

**Use case**: Progressive refactoring with reviewable steps.

```bash
# Extract utilities
but branch new refactor-extract-utils
but commit refactor-extract-utils -m "refactor: extract common utilities"

# Update consumers to use utilities
but branch new refactor-use-utils --anchor refactor-extract-utils
but commit refactor-use-utils -m "refactor: use extracted utilities"

# Clean up old code
but branch new refactor-cleanup --anchor refactor-use-utils
but commit refactor-cleanup -m "refactor: remove deprecated code"
```

## Post-Hoc Stack Organization

### Converting Independent Branches to Stack

**Scenario**: You created branches independently, now want to stack them.

```bash
# Current state: three independent branches
but branch new feature-a
but branch new feature-b
but branch new feature-c

# Organize into stack after the fact
# (Must recreate branches with correct anchors)

# Stack feature-b on feature-a
but branch new feature-b-stacked --anchor feature-a
commit_sha=$(but log | grep "feature-b:" | head -1 | awk '{print $1}')
but rub $commit_sha feature-b-stacked
but branch delete feature-b --force

# Stack feature-c on feature-b-stacked
but branch new feature-c-stacked --anchor feature-b-stacked
commit_sha=$(but log | grep "feature-c:" | head -1 | awk '{print $1}')
but rub $commit_sha feature-c-stacked
but branch delete feature-c --force
```

**Result**: `feature-a` ← `feature-b-stacked` ← `feature-c-stacked`

### Moving Commits Between Branches in Stack

```bash
# Move commit from child to parent
commit_sha=$(but log | grep "specific commit" | awk '{print $1}')
but rub $commit_sha parent-branch

# Move commit from parent to child
commit_sha=$(but log | grep "another commit" | awk '{print $1}')
but rub $commit_sha child-branch
```

## Stack Navigation Patterns

### Understanding Current Position

```bash
# View full stack structure
but log

# See which branches are currently active
but status

# JSON for programmatic analysis
but --json log | jq '.[] | .branchDetails[] | select(.isActive == true)'
```

### Working with Stack Levels

**Note**: GitButler uses virtual branches where all branches remain visible and active simultaneously. There's no need to "checkout" branches like in traditional git. You work on branches by committing to them directly.

```bash
# Work on base branch (no checkout needed - all branches are active)
but commit base-feature -m "update base"

# Work on dependent branch (no checkout needed)
but commit dependent-feature -m "update dependent"
```

## Multi-Level Stack Management

### Creating Deep Stacks

```bash
# Level 1: Database schema
but branch new db-schema

# Level 2: Data access layer (depends on schema)
but branch new data-access --anchor db-schema

# Level 3: Business logic (depends on data access)
but branch new business-logic --anchor data-access

# Level 4: API endpoints (depends on business logic)
but branch new api-endpoints --anchor business-logic

# Level 5: Frontend integration (depends on API)
but branch new frontend-integration --anchor api-endpoints
```

## PR Preparation for Stacks

### Current Limitation

GitButler CLI does not have native PR submission.

### Workaround: GitHub CLI

```bash
# Push branches manually
git push -u origin base-feature
git push -u origin dependent-feature

# Create PRs with correct base branches
gh pr create --base main --head base-feature \
  --title "feat: base feature" \
  --body "First in stack"

gh pr create --base base-feature --head dependent-feature \
  --title "feat: dependent feature" \
  --body "Depends on base-feature PR"
```

## Stack Reorganization Techniques

### Squashing Within Stack

```bash
# Squash commits within a single branch
newer_commit=$(but log | grep "newer" | awk '{print $1}')
older_commit=$(but log | grep "older" | awk '{print $1}')

but rub $newer_commit $older_commit
```

### Splitting a Branch in Stack

```bash
# Original: one branch with multiple features
but branch new original-branch

# Split into stack:
# 1. Create new branch for second feature
but branch new second-feature --anchor original-branch

# 2. Move relevant commits to new branch
commit_sha=$(but log | grep "second feature commit" | awk '{print $1}')
but rub $commit_sha second-feature
```

## Best Practices

### Stack Planning

1. **Start simple**: 2-3 levels max initially
2. **Single responsibility**: Each level should have one clear purpose
3. **Logical dependencies**: Only stack when there's a real dependency
4. **Reviewability**: Keep each level small enough for review (100-250 LOC)

### Stack Maintenance

1. **Regular verification**: Run `but log` to verify structure
2. **Early commits**: Commit to correct branches immediately
3. **Snapshot before reorganizing**: `but snapshot --message "Before stack reorganization"`
4. **Clean up empty branches**: Delete branches with zero commits after reorganization

### Stack Communication

1. **Document dependencies**: Clear commit messages explaining why stack level exists
2. **Branch naming**: Use descriptive names that indicate stack relationship
3. **Status updates**: Share `but status` output when coordinating with other agents

## Troubleshooting

### Stack Relationships Not Showing

**Problem**: Branches created but not showing as stack in `but log`.

**Solution**: Branches must be created with `--anchor` from the start. To fix existing branches:
```bash
# Recreate branch with correct anchor
but branch new child-branch-stacked --anchor parent-branch
commit_sha=$(but log | grep "child-branch:" | head -1 | awk '{print $1}')
but rub $commit_sha child-branch-stacked
but branch delete child-branch --force
```

### Commits in Wrong Stack Level

**Problem**: Commit ended up on wrong branch in stack.

**Solution**: Move with `but rub`:
```bash
commit_sha=$(but log | grep "commit message" | awk '{print $1}')
but rub $commit_sha correct-branch
```

## Related Resources

- GitButler CLI reference: `but --help`
- Multi-agent patterns: See [multi-agent skill](../multi-agent/SKILL.md)

## Skill Limitations

This skill covers GitButler stack workflows using the CLI. It does not cover:

- GUI-based stack operations (use GitButler desktop app)
- PR submission automation (not yet available in CLI)
- CI/CD integration (experimental)
- Stack visualization tools (use `but log` or GUI)
