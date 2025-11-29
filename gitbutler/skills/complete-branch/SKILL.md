---
name: gitbutler-complete-branch
description: Completes work on GitButler virtual branches and integrates to main through guided workflows with safety checks, verification steps, and cleanup. Use when finishing branches, merging to main, creating PRs, or when --complete-branch flag is mentioned.
---

# Complete GitButler Virtual Branch

## Introduction

This skill guides you through safely completing work on a GitButler virtual branch and integrating it into the main branch. Virtual branches in GitButler allow parallel development without traditional git checkout, but completion requires careful coordination to maintain workspace integrity.

**When to use this skill:**
- Virtual branch work is complete and ready to ship
- Tests pass and code is reviewed (if required)
- Ready to merge changes into main branch
- Need to clean up completed branches

**Prerequisites:**
- GitButler initialized in repository (`but --version` succeeds)
- Virtual branch exists with committed changes
- Main branch is tracked as base
- No uncommitted changes (or changes assigned to branches)

## Quick Start

**Manual workflow (7 steps):**

```bash
# 1. Verify branch state
but status
but log

# 2. Create safety snapshot
but snapshot --message "Before integrating feature-auth"

# 3. Switch to main branch
git checkout main

# 4. Update main from remote
git pull origin main

# 5. Merge virtual branch
git merge --no-ff refs/gitbutler/feature-auth -m "Merge feature-auth: Add user authentication"

# 6. Push to remote
git push origin main

# 7. Clean up branch and return to workspace
but branch rm feature-auth
git checkout gitbutler/workspace
```

## Pre-Integration Checklist

Before integrating any virtual branch to main, verify these conditions:

**1. All work committed to branch:**
```bash
but status  # Your branch should show committed changes
```

**2. Tests passing:**
```bash
bun test  # or npm test, cargo test, etc.
```

**3. Branch up to date with main:**
```bash
but base update
```

**4. No uncommitted changes in workspace:**
```bash
but status  # Should show no unassigned files
git status  # Should be clean or show only .gitbutler/ changes
```

**5. Create snapshot before integration:**
```bash
but snapshot --message "Before integrating feature-auth"
```

## Integration Workflows

### A. Manual Direct Merge

For learning or custom requirements, follow this 7-step manual workflow:

**Step 1: Verify branch state**
```bash
but status  # Confirm branch has committed changes
but log     # View branch in stack visualization
```

**Step 2: Create safety snapshot**
```bash
but snapshot --message "Before integrating feature-auth"
```

**Step 3: Switch to main branch**
```bash
git checkout main
```
You must leave gitbutler/workspace to merge. GitButler manages workspace, git manages main.

**Step 4: Update main from remote**
```bash
git pull origin main
```

**Step 5: Merge virtual branch**
```bash
git merge --no-ff refs/gitbutler/feature-auth -m "Merge feature-auth: Add user authentication"
```
- `--no-ff`: Preserves branch history (recommended)
- Use descriptive merge commit message
- Reference refs/gitbutler/<branch-name> for virtual branches

**Step 6: Push to remote**
```bash
git push origin main
```

**Step 7: Clean up branch and return to workspace**
```bash
but branch rm feature-auth
git checkout gitbutler/workspace
```

### B. Pull Request Workflow

For team workflows requiring code review:

**Step 1: Push branch to remote**
```bash
git push origin refs/gitbutler/feature-auth:refs/heads/feature-auth
```

**Step 2: Create PR via GitHub CLI or web**
```bash
gh pr create --base main --head feature-auth --title "Add user authentication" --body "Description..."
```

**Step 3: Wait for review and approval**

**Step 4: Merge PR (via GitHub UI or CLI)**
```bash
gh pr merge feature-auth --squash
```

**Step 5: Update main and clean up**
```bash
git checkout main
git pull origin main
but branch rm feature-auth
git checkout gitbutler/workspace
```

## Error Scenarios and Recovery

### Merge Conflicts During Integration

**Recovery:**
```bash
# 1. View conflicted files
git status

# 2. Resolve conflicts manually in editor

# 3. Stage resolved files
git add src/auth.ts

# 4. Complete merge
git commit

# 5. Verify and push
git push origin main

# 6. Clean up branch
but branch rm feature-auth
git checkout gitbutler/workspace
```

### Push Rejected (Main Moved Ahead)

**Recovery:**
```bash
git pull origin main
# Resolve any conflicts if main diverged
git push origin main
```

### Undo Integration

**If you haven't pushed yet:**
```bash
git reset --hard HEAD~1
git checkout gitbutler/workspace
```

**If you already pushed:**
```bash
git revert -m 1 HEAD
git push origin main
```

## Post-Integration Cleanup

After successful integration:

**Delete integrated virtual branch:**
```bash
but branch rm feature-auth
```

**Clean up remote branch (if created for PR):**
```bash
git push origin --delete feature-auth
```

**Verify workspace is clean:**
```bash
but status  # Should show remaining active branches only
but log     # Branch should be gone from visualization
```

## Best Practices

**Keep branches small:**
- Small branches = easier merges
- Aim for single responsibility per branch

**Update base regularly:**
```bash
but base update
```

**Test before integrating:**
Always run full test suite on branch before merging.

**Meaningful merge commits:**
```bash
# Good: Describes what and why
git merge --no-ff feature-auth -m "Add JWT-based user authentication"

# Bad: Generic message
git merge --no-ff feature-auth -m "Merge branch"
```

**Use --no-ff for feature branches:**
Preserves branch history in git log.

## Examples

### Example 1: Simple Feature Branch

```bash
# Pre-flight checks
but status           # Verify branch is clean
bun test            # Tests pass
but base update     # Branch up to date

# Safety snapshot
but snapshot --message "Before merging feature-auth"

# Integration (7 steps)
git checkout main
git pull origin main
git merge --no-ff refs/gitbutler/feature-auth -m "Add user authentication"
git push origin main
but branch rm feature-auth
git checkout gitbutler/workspace
```

### Example 2: Stacked Branches (Bottom-Up Merge)

```bash
# Must merge in order from bottom to top

# 1. Merge base branch first
git checkout main && git pull
git merge --no-ff refs/gitbutler/feature-base -m "Base feature"
git push origin main
but branch rm feature-base
git checkout gitbutler/workspace

# 2. Update remaining branches
but base update

# 3. Merge api branch
git checkout main && git pull
git merge --no-ff refs/gitbutler/feature-api -m "API feature"
git push origin main
but branch rm feature-api
git checkout gitbutler/workspace

# 4. Repeat for remaining stack levels
```

## Reference

**Related Skills:**
- [version-control](../version-control/SKILL.md): Core GitButler workflows
- [stack-workflows](../stack-workflows/SKILL.md): Creating and managing stacked branches
- [multi-agent](../multi-agent/SKILL.md): Multi-agent collaboration

**GitButler Commands:**
- `but status`: View workspace state
- `but log`: Visualize branch structure
- `but snapshot`: Create rollback point
- `but branch rm`: Delete virtual branch
- `but base update`: Update main and rebase branches
- `but oplog`: View operation history for rollback
