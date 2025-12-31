---
name: GitButler Complete Branch
version: 2.0.0
description: Complete work on GitButler virtual branches and integrate to main through guided workflows with safety checks and cleanup. Use when finishing branches, merging to main, creating PRs, or when `--complete-branch` flag is mentioned.
---

# Complete GitButler Virtual Branch

Virtual branch ready → snapshot → merge to main → cleanup → return.

<when_to_use>

- Virtual branch work is complete and ready to ship
- Tests pass and code is reviewed (if required)
- Ready to merge changes into main branch
- Need to clean up completed branches

NOT for: ongoing work, branches needing more development, stacks (complete bottom-to-top)

</when_to_use>

<prerequisites>

**Before completing any branch:**
- [ ] GitButler initialized (`but --version` succeeds)
- [ ] Virtual branch exists with committed changes
- [ ] Main branch tracked as base
- [ ] No uncommitted changes (or changes assigned to branches)
- [ ] Tests passing

</prerequisites>

<quick_start>

## Quick Start (7 Steps)

```bash
# 1. Verify branch state
but status
but log

# 2. Create safety snapshot
but snapshot --message "Before integrating feature-auth"

# 3. Switch to main
git checkout main

# 4. Update main from remote
git pull origin main

# 5. Merge virtual branch
git merge --no-ff refs/gitbutler/feature-auth -m "feat: add user authentication"

# 6. Push to remote
git push origin main

# 7. Clean up and return
but branch rm feature-auth
git checkout gitbutler/workspace
```

</quick_start>

<pre_flight>

## Pre-Integration Checklist

```bash
# All work committed?
but status  # Your branch should show committed changes

# Tests passing?
bun test  # or npm test, cargo test, etc.

# Branch up to date with main?
but base update

# No uncommitted changes?
but status  # Should show no unassigned files
git status  # Should be clean or show only .gitbutler/ changes

# Safety snapshot created?
but snapshot --message "Before integrating feature-auth"
```

</pre_flight>

<workflows>

## Integration Workflows

### A. Direct Merge to Main

```bash
# 1. Verify branch state
but status
but log

# 2. Create snapshot
but snapshot --message "Before integrating feature-auth"

# 3. Switch to main
git checkout main

# 4. Update main
git pull origin main

# 5. Merge with --no-ff (preserves history)
git merge --no-ff refs/gitbutler/feature-auth -m "feat: add user authentication"

# 6. Push
git push origin main

# 7. Clean up
but branch rm feature-auth
git checkout gitbutler/workspace
```

### B. Pull Request Workflow

```bash
# 1. Push branch to remote
git push origin refs/gitbutler/feature-auth:refs/heads/feature-auth

# 2. Create PR
gh pr create --base main --head feature-auth \
  --title "feat: add user authentication" \
  --body "Description..."

# 3. Wait for review and approval

# 4. Merge PR (via GitHub UI or CLI)
gh pr merge feature-auth --squash

# 5. Update main and clean up
git checkout main
git pull origin main
but branch rm feature-auth
git checkout gitbutler/workspace
```

### C. Stacked Branches (Bottom-Up)

```bash
# Must merge in order: base → dependent → final

# 1. Merge base branch first
git checkout main && git pull
git merge --no-ff refs/gitbutler/feature-base -m "feat: base feature"
git push origin main
but branch rm feature-base
git checkout gitbutler/workspace

# 2. Update remaining branches
but base update

# 3. Merge next level
git checkout main && git pull
git merge --no-ff refs/gitbutler/feature-api -m "feat: API feature"
git push origin main
but branch rm feature-api
git checkout gitbutler/workspace

# 4. Repeat for remaining stack levels
```

</workflows>

<recovery>

## Error Recovery

### Merge Conflicts

```bash
# View conflicted files
git status

# Resolve conflicts manually

# Stage resolved files
git add src/auth.ts

# Complete merge
git commit

# Verify and push
git push origin main

# Clean up
but branch rm feature-auth
git checkout gitbutler/workspace
```

### Push Rejected (Main Moved Ahead)

```bash
git pull origin main
# Resolve any conflicts if main diverged
git push origin main
```

### Undo Integration (Not Pushed Yet)

```bash
git reset --hard HEAD~1
git checkout gitbutler/workspace
```

### Undo Integration (Already Pushed)

```bash
git revert -m 1 HEAD
git push origin main
```

</recovery>

<cleanup>

## Post-Integration Cleanup

```bash
# Delete integrated virtual branch
but branch rm feature-auth

# Clean up remote branch (if created for PR)
git push origin --delete feature-auth

# Verify workspace is clean
but status  # Should show remaining active branches only
but log     # Branch should be gone
```

</cleanup>

<rules>

ALWAYS:
- Create snapshot before integration: `but snapshot --message "..."`
- Use `--no-ff` flag to preserve branch history
- Return to workspace after git operations: `git checkout gitbutler/workspace`
- Run tests before integrating
- Complete stacked branches bottom-to-top

NEVER:
- Merge without snapshot backup
- Skip updating main first (`git pull`)
- Forget to return to `gitbutler/workspace`
- Merge middle of stack before base
- Force push to main without explicit confirmation

</rules>

<troubleshooting>

## Common Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Merge conflicts | Diverged from main | Resolve conflicts, stage, commit |
| Push rejected | Main moved ahead | `git pull`, resolve, push |
| Branch not found | Wrong ref path | Use `refs/gitbutler/<name>` |
| Can't return to workspace | Integration branch issue | `git checkout gitbutler/workspace` |

## Emergency Recovery

```bash
# If integration went wrong
but oplog
but undo  # Restores pre-integration state

# If stuck after git operations
git checkout gitbutler/workspace
```

</troubleshooting>

<best_practices>

## Best Practices

**Keep branches small:**
- Small branches = easier merges
- Aim for single responsibility per branch

**Update base regularly:**

```bash
but base update
```

**Test before integrating:**
- Always run full test suite before merging

**Meaningful merge commits:**

```bash
# Good: Describes what and why
git merge --no-ff feature-auth -m "feat: add JWT-based user authentication"

# Bad: Generic message
git merge --no-ff feature-auth -m "Merge branch"
```

</best_practices>

<references>

- [version-control skill](../version-control/SKILL.md) — core GitButler workflows
- [stack-workflows skill](../stack-workflows/SKILL.md) — stacked branches
- [REFERENCE.md](../version-control/REFERENCE.md) — CLI reference and troubleshooting

</references>
