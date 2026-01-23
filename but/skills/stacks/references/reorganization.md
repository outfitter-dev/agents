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
commit_sha=$(but log | grep "feature-b:" | head -1 | awk '{print $1}')
but rub $commit_sha feature-b-stacked
but branch delete feature-b --force

# Stack feature-c on feature-b-stacked
but branch new feature-c-stacked --anchor feature-b-stacked
commit_sha=$(but log | grep "feature-c:" | head -1 | awk '{print $1}')
but rub $commit_sha feature-c-stacked
but branch delete feature-c --force
```

## Squashing Within Stack

Combine commits within the same stack level.

```bash
newer_commit=$(but log | grep "newer" | awk '{print $1}')
older_commit=$(but log | grep "older" | awk '{print $1}')
but rub $newer_commit $older_commit
```

## Moving Commits Between Stack Levels

Relocate a commit to the correct branch in the stack.

```bash
commit_sha=$(but log | grep "specific commit" | awk '{print $1}')
but rub $commit_sha correct-branch
```

## Splitting a Branch

Extract part of a branch into a new stack level.

```bash
# Original has multiple features
but branch new second-feature --anchor original-branch
commit_sha=$(but log | grep "second feature commit" | awk '{print $1}')
but rub $commit_sha second-feature
```

## Recovery

Recreate a branch with correct anchor when the original was created wrong.

```bash
# Recreate branch with correct anchor
but branch new child-stacked --anchor parent
commit_sha=$(but log | grep "child:" | head -1 | awk '{print $1}')
but rub $commit_sha child-stacked
but branch delete child --force
```
