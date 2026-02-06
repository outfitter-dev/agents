# Stack Reorganization

Advanced techniques for reorganizing GitButler stacks.

## Post-Hoc Stack Organization

**Problem:** Created branches independently, now want to stack them.

**Solution:** Recreate with correct anchors:

```bash
# Current: three independent branches
# feature-a, feature-b, feature-c

# Stack feature-b on feature-a
but branch new feature-b-stacked --anchor feature-a
commit_sha=$(but show feature-b --json | jq -r '.commits[0].id')
but rub $commit_sha feature-b-stacked
but branch delete feature-b --force

# Stack feature-c on feature-b-stacked
but branch new feature-c-stacked --anchor feature-b-stacked
commit_sha=$(but show feature-c --json | jq -r '.commits[0].id')
but rub $commit_sha feature-c-stacked
but branch delete feature-c --force
```

## Squashing Within Stack

Combine commits within the same stack level.

```bash
# Squash all commits in a branch
but squash my-branch

# Or squash specific commits
but squash <newer-commit> <older-commit>
```

## Moving Commits Between Stack Levels

Relocate a commit to the correct branch in the stack.

```bash
# Use commit ID from `but status` or `but show`
but rub <commit-id> correct-branch
```

## Splitting a Branch

Extract part of a branch into a new stack level.

```bash
# Original has multiple features
but branch new second-feature --anchor original-branch
# Use commit ID from `but show original-branch`
but rub <commit-id> second-feature
```

## Recovery

Recreate a branch with correct anchor when the original was created wrong.

```bash
# Recreate branch with correct anchor
but branch new child-stacked --anchor parent
commit_sha=$(but show child --json | jq -r '.commits[0].id')
but rub $commit_sha child-stacked
but branch delete child --force
```
