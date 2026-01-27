# Stack Recovery Procedures

When parallel agents or mixed git/gt operations corrupt the stack.

## Symptoms of Corruption

- Branches appear as siblings instead of parent-child
- PRs contain files from wrong features
- PR titles don't match branch content
- `gt status` shows unexpected structure
- `gt ls` shows flat tree instead of stack

## Recovery Workflow

```
Assess → Save Work → Fix Relationships → Redistribute → Restack → Submit
```

## Phase 1: Assess Damage

```bash
# Save uncommitted work first
git stash push -u -m "WIP before recovery"

# See Graphite's view (source of truth for parents)
gt status

# Visual tree
gt ls

# Compare with expected structure
# Document which branches are wrong
```

Questions to answer:
- Which branches have wrong parents?
- Which files ended up in wrong branches?
- What should the correct stack structure be?

## Phase 2: Fix Branch Relationships

Move branches to correct parents:

```bash
# Move branch to correct parent
gt move --source wrong-branch --onto correct-parent

# Example: branch should be child of feature-a, not sibling
gt move --source feature-b --onto feature-a
```

For complex reorganization:

```bash
# Move multiple branches
gt move --source branch-1 --onto main
gt move --source branch-2 --onto branch-1
gt move --source branch-3 --onto branch-2
```

## Phase 3: Insert Missing Branches

If branches need to be inserted:

```bash
# Go to parent branch
gt checkout parent-branch

# Insert new branch between parent and existing child
gt create 'missing-branch' --insert -am "feat: description"
```

## Phase 4: Redistribute Files

Move files to correct branches:

```bash
# Go to top of stack
gt top

# Restore stashed work
git stash pop

# Stage specific files
git add path/to/file.ts

# Commit to correct downstack branch
gt modify --into target-branch -m "feat: move file to correct branch"

# Repeat for each misplaced file
```

Alternative using absorb (when files should go to original branches):

```bash
gt top
git add .
gt absorb -a
```

## Phase 5: Restack and Verify

```bash
# Rebase all branches onto updated parents
gt restack

# Verify structure
gt status
gt ls

# Check each branch has correct files
gt checkout branch-1
ls -la

gt checkout branch-2
ls -la
```

## Phase 6: Submit Fixed Stack

```bash
# Submit the corrected stack
gt submit --stack
```

Review PRs to ensure:
- Correct files in each PR
- Correct parent/child relationships
- PR titles match content

## Emergency Recovery

When normal recovery fails:

```bash
# Try automatic repair
gt repo fix

# If that fails, nuclear option:
# 1. Note current branch contents
# 2. Create fresh branches
# 3. Manually move files
# 4. Rebuild stack from scratch
```

## Metadata Repair

When Graphite's tracking diverges from Git:

```bash
# Add branch created outside Graphite
gt track branch-name
# Prompts to select correct parent

# Remove branch from Graphite tracking
gt untrack branch-name
```

## Prevention

To avoid future corruption:

1. **Single orchestrator** - Only one agent performs git operations
2. **Explicit commits** - Use `gt modify --into` for specific branches
3. **Regular status checks** - Run `gt status` before complex operations
4. **Atomic stacks** - Keep stacks focused (3-5 branches max)

See the [multi-agent-vcs](../../multi-agent-vcs/SKILL.md) skill for multi-agent coordination patterns.
