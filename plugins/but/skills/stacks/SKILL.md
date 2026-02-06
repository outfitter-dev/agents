---
name: gitbutler-stacks
description: This skill should be used when creating stacks, dependent branches, or when "stack", "stacked branches", "anchor", "--anchor", "but branch new -a", "create dependent branch", or "break feature into PRs" are mentioned with GitButler. Covers anchor-based stacking for dependent features and reviewable PR breakdown.
metadata:
  version: "1.0.0"
  author: outfitter
  category: version-control
  related-skills:
    - gitbutler-virtual-branches
    - gitbutler-complete-branch
    - gitbutler-multi-agent
---

# GitButler Stacks

Dependent branches → anchor-based stacking → reviewable chunks.

<when_to_use>

- Sequential dependencies (e.g., refactor → API → frontend)
- Large features broken into reviewable chunks
- Granular code review (approve/merge early phases independently)
- Post-hoc stack organization after exploratory coding

NOT for: independent parallel features (use virtual branches), projects using Graphite stacking

</when_to_use>

## Stacked vs Virtual Branches

| Type | Use Case | Dependencies |
|------|----------|--------------|
| **Virtual** | Independent, unrelated work | None — parallel |
| **Stacked** | Sequential dependencies | Each builds on parent |

Stacked branches = virtual branches split into dependent sequence.
Default: Virtual branches are stacks of one.

## Creating Stacks

```bash
# Base branch (no anchor)
but branch new base-feature

# Stacked branch (--anchor specifies parent)
but branch new child-feature --anchor base-feature

# Third level
but branch new grandchild-feature --anchor child-feature
```

**Result:** `base-feature` ← `child-feature` ← `grandchild-feature`

**Short form:** `-a` instead of `--anchor`

```bash
but branch new child -a parent
```

## Stack Patterns

Common patterns: feature dependency chains, refactoring sequences, deep stacks.

**Example - Feature Dependency:**

```bash
but branch new auth-core
but branch new auth-oauth --anchor auth-core
but branch new auth-social --anchor auth-oauth
```

See `references/patterns.md` for detailed patterns with commit examples.

## Post-Hoc Stack Organization

Convert independent branches into a stack by recreating with correct anchors:

1. Create new branch with `--anchor` pointing to intended parent
2. Move commits with `but rub <sha> <new-branch>`
3. Delete original branch

See `references/reorganization.md` for detailed workflows.

## Publishing Stacks

### Using CLI (Preferred)

```bash
# Push and create PR for a branch
but push dependent-feature
but pr new dependent-feature

# Push all unpushed branches
but push
```

`but push` + `but pr new` handles:
- Pushing branches to remote
- Creating PRs with correct base branches
- Updating existing PRs if already created

### Using GitHub CLI (Alternative)

```bash
# Push branches
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

### GitHub Settings

- Enable automatic branch deletion after merge
- Use **Merge** strategy (recommended) — no force pushes needed
- Merge bottom-to-top (sequential order)

## Conflict Handling in Stacks

GitButler resolves conflicts **per-commit** during rebase:

1. When base branch updates, dependent commits rebase automatically
2. Conflicted commits marked but don't block other commits
3. Resolve conflicts per affected commit
4. Partial resolution can be saved and continued later

```bash
# Update base (may trigger rebases in stack)
but pull

# Check which commits have conflicts
but status

# Resolve in editor, GitButler auto-detects resolution
```

**Unlike git rebase:** Remaining commits continue rebasing even if some conflict.

## Stack Reorganization

Key operations for restructuring stacks:

| Operation | Command |
|-----------|---------|
| Squash commits | `but squash <branch>` or `but rub <newer> <older>` |
| Move commit | `but rub <sha> <target-branch>` |
| Split branch | Create anchored branch, move commits |

See `references/reorganization.md` for detailed examples.

## Stack Navigation

**Note:** Virtual branches don't need checkout — all branches active simultaneously.

```bash
# View full stack structure
but status

# Work on any branch directly (no checkout needed)
but commit base-feature -m "update base"
but commit dependent-feature -m "update dependent"

# Inspect a specific branch
but show dependent-feature

# JSON for programmatic analysis
but show dependent-feature --json | jq '.commits[] | .id'
```

<rules>

ALWAYS:
- Create stacks with `--anchor` from the start
- Merge stacks bottom-to-top (base first, dependents after)
- Snapshot before reorganizing: `but oplog snapshot --message "Before stack reorganization"`
- Keep each level small (100-250 LOC) for reviewability
- Delete empty branches after reorganization

NEVER:
- Skip stack levels when merging
- Stack independent, unrelated features (use virtual branches)
- Create deep stacks (5+ levels) without good reason
- Forget anchor when creating dependent branches

</rules>

## Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Stack not showing in `but status` | Missing `--anchor` | Recreate with correct anchor |
| Commits in wrong stack level | Wrong branch targeted | `but rub <sha> correct-branch` |
| Can't merge middle of stack | Wrong order | Merge bottom-to-top only |

## Recovery

To fix a branch with wrong/missing anchor: create new branch with correct anchor, move commits with `but rub`, delete original.

See `references/reorganization.md` for complete recovery procedures.

## Best Practices

### Planning

- Start simple: 2-3 levels max initially
- Single responsibility per level
- Only stack when there's a real dependency

### Maintenance

- Run `but status` regularly to verify structure
- Commit to correct branches immediately
- Clean up empty branches

### Communication

- Clear commit messages explaining why stack level exists
- Descriptive names indicating stack relationship
- Share `but status` when coordinating

<references>

### Reference Files

- **`references/patterns.md`** — Detailed stack patterns (feature dependency, refactoring, deep stacks)
- **`references/reorganization.md`** — Post-hoc organization, squashing, moving commits, splitting

### Related Skills

- [gitbutler-virtual-branches](../virtual-branches/SKILL.md) — Core GitButler workflows
- [gitbutler-complete-branch](../complete-branch/SKILL.md) — Merging to main
- [gitbutler-multi-agent](../multi-agent/SKILL.md) — Multi-agent coordination

### External

- [GitButler Stacks Docs](https://docs.gitbutler.com/features/branch-management/stacked-branches)
- [Stacked Branches Blog](https://blog.gitbutler.com/stacked-branches-with-gitbutler)

</references>
