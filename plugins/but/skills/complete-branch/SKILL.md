---
name: gitbutler-complete-branch
description: This skill should be used when the user asks to "complete a branch", "merge to main", "finish my feature", "ship this branch", "integrate to main", "create a PR from GitButler", or when `--complete-branch` flag is mentioned. Guides completion of GitButler virtual branches with safety snapshots, integration workflows, and cleanup.
metadata:
  version: "1.0.0"
  author: outfitter
  category: version-control
  related-skills:
    - gitbutler-virtual-branches
    - gitbutler-stacks
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

## TL;DR

**Using CLI** (preferred): `but oplog snapshot` -> `but push <branch>` -> `but pr new <branch>` -> merge PR on GitHub -> `but branch delete <branch>`

**Direct merge**: `but oplog snapshot` -> `git checkout main` -> `git pull` -> `git merge --no-ff refs/gitbutler/<branch>` -> `git push` -> `but branch delete <branch>` -> `git checkout gitbutler/workspace`

**Manual PR workflow**: `git push origin refs/gitbutler/<branch>:refs/heads/<branch>` -> `gh pr create` -> merge PR -> cleanup

See detailed workflows below.

## Pre-Integration Checklist

Run through before any integration:

| Check | Command | Expected |
|-------|---------|----------|
| GitButler running | `but --version` | Version output |
| Work committed | `but status` | Committed changes, no unassigned files |
| Tests passing | `bun test` (or project equivalent) | All green |
| Base updated | `but pull` | Up to date with main |
| Snapshot created | `but oplog snapshot -m "Before integrating..."` | Snapshot ID returned |

## Integration Workflows

### A. Using CLI (Preferred)

```bash
# 1. Verify branch state
but status
but show feature-auth

# 2. Create snapshot
but oplog snapshot --message "Before publishing feature-auth"

# 3. Authenticate with forge (one-time)
but config forge auth

# 4. Push branch and create PR
but push feature-auth
but pr new feature-auth

# 5. Review and merge PR on GitHub

# 6. Update local and clean up
but pull
but branch delete feature-auth
```

**Benefits:**
- Full CLI workflow, no GUI needed
- Correct base branch set automatically for stacks
- Stays in GitButler workspace throughout

### B. Direct Merge to Main

```bash
# 1. Verify branch state
but status
but show feature-auth

# 2. Create snapshot
but oplog snapshot --message "Before integrating feature-auth"

# 3. Switch to main
git checkout main

# 4. Update main
git pull origin main

# 5. Merge with --no-ff (preserves history)
git merge --no-ff refs/gitbutler/feature-auth -m "feat: add user authentication"

# 6. Push
git push origin main

# 7. Clean up
but branch delete feature-auth
git checkout gitbutler/workspace
```

### C. Manual Pull Request Workflow

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
but branch delete feature-auth
git checkout gitbutler/workspace
```

### D. Stacked Branches (Bottom-Up)

```bash
# Must merge in order: base → dependent → final

# 1. Merge base branch first
git checkout main && git pull
git merge --no-ff refs/gitbutler/feature-base -m "feat: base feature"
git push origin main
but branch delete feature-base
git checkout gitbutler/workspace

# 2. Update remaining branches
but pull

# 3. Merge next level
git checkout main && git pull
git merge --no-ff refs/gitbutler/feature-api -m "feat: API feature"
git push origin main
but branch delete feature-api
git checkout gitbutler/workspace

# 4. Repeat for remaining stack levels
```

> For comprehensive stacked branch management, load the **gitbutler-stacks** skill.

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
but branch delete feature-auth
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

## Post-Integration Cleanup

```bash
# Delete integrated virtual branch
but branch delete feature-auth

# Clean up remote branch (if created for PR)
git push origin --delete feature-auth

# Verify workspace is clean
but status  # Should show remaining active branches only
but status  # Branch should be gone
```

<rules>

ALWAYS:
- Create snapshot before integration: `but oplog snapshot --message "..."`
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

## Troubleshooting

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

## Best Practices

**Keep branches small:**
- Small branches = easier merges
- Aim for single responsibility per branch

**Update base regularly:**

```bash
but pull
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

<references>

### Related Skills

- [gitbutler-virtual-branches](../virtual-branches/SKILL.md) — Core GitButler workflows
- [gitbutler-stacks](../stacks/SKILL.md) — Stacked branches

### Reference Files

- [gitbutler-virtual-branches/references/reference.md](../virtual-branches/references/reference.md) — CLI reference and troubleshooting

### External

- [GitButler GitHub Integration](https://docs.gitbutler.com/features/forge-integration/github-integration)

</references>
