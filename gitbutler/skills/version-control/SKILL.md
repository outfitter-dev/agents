---
name: GitButler Version Control
description: Version control using GitButler's virtual branches for parallel multi-branch work, post-hoc organization, and multi-agent collaboration. Use when working with GitButler, virtual branches, `but` commands, stacked PRs, multi-agent workflows, or when `--gitbutler` or `--but` flags are mentioned. Enables concurrent feature development without checkout overhead.
---

# GitButler Version Control

## Quick Start

GitButler reimagines version control with **virtual branches** - multiple branches coexisting in your working directory simultaneously. No checkout, no context switching, organize work after coding.

**Installation**: Download GitButler app from https://gitbutler.com (includes CLI)

```bash
# Verify installation
but --version

# Initialize in git repository
but init
```

## When to Use GitButler

**Use GitButler when:**
- Working on multiple unrelated features simultaneously
- Multi-agent concurrent development (agents in same workspace)
- Exploratory coding (organize commits after writing)
- Post-hoc branch organization needed
- Visual organization preferred (GUI + CLI)

**Use Graphite instead when:**
- Need PR submission automation (`gt submit --stack`)
- Terminal-first workflow without GUI
- Full CLI automation required end-to-end
- See [REFERENCE.md](REFERENCE.md#gitbutler-vs-graphite) for detailed comparison

**Use plain Git when:**
- Simple linear workflows
- Single-feature-at-a-time development
- GitButler not installed or initialized

## Core Concepts

### Virtual Branches

Multiple branches applied simultaneously to your working directory:

```
Working Directory
├─ Virtual Branch A (feature-auth.ts)
├─ Virtual Branch B (bugfix-api.ts)
├─ Virtual Branch C (docs-update.md)
└─ Unassigned Changes (new files)
```

**Key difference from Git**: All branches visible at once, organize files to branches after editing.

### The Integration Branch

GitButler uses `gitbutler/workspace` to track virtual branch state. **Never interact with this branch directly** - it's managed automatically.

### Stacks (Optional)

Create dependent branches using `--anchor`:

```bash
but branch new parent-feature
but branch new child-feature --anchor parent-feature
# child-feature builds on top of parent-feature
```

## Essential Workflows

### Creating and Assigning Work

```bash
# Create virtual branch
but branch new feature-authentication

# Make changes to files
echo "auth code" > auth.ts
echo "tests" > auth.test.ts

# Check status to see file IDs
but status
# ╭┄00 [Unassigned Changes]
# │   m6 A auth.ts
# │   p9 A auth.test.ts

# Assign files to branch using IDs
but rub m6 feature-authentication
but rub p9 feature-authentication

# Commit
but commit feature-authentication -m "feat: add authentication"
```

### The Power of `but rub`

Swiss Army knife command - combines entities to perform operations:

```bash
# Assign file to branch
but rub <file-id> <branch-id>

# Move commit between branches
but rub <commit-sha> <branch-name>

# Squash commits (newer into older)
but rub <newer-commit> <older-commit>

# Amend commit with file changes
but rub <file-id> <commit-sha>
```

**See [EXAMPLES.md](EXAMPLES.md#reorganizing-work) for real-world reorganization patterns**

### Parallel Feature Development

```bash
# Create two independent features
but branch new feature-a
but branch new feature-b

# Edit files for both features (same workspace!)
echo "Feature A" > feature-a.ts
echo "Feature B" > feature-b.ts

# Assign to respective branches
but rub <id-a> feature-a
but rub <id-b> feature-b

# Commit independently
but commit feature-a -m "feat: implement feature A"
but commit feature-b -m "feat: implement feature B"

# Both branches exist, zero conflicts, same directory
```

### Multi-Agent Workflows

**Unique capability**: Multiple AI agents working concurrently in same repo.

```bash
# Agent 1
but branch new agent-1-feature
# ... make changes ...
but commit agent-1-feature -m "feat: add feature X"

# Agent 2 (simultaneously, same workspace)
but branch new agent-2-bugfix
# ... make changes ...
but commit agent-2-bugfix -m "fix: resolve issue Y"

# Both visible in workspace, zero coordination overhead
```

**See [multi-agent skill](../multi-agent/SKILL.md) for advanced multi-agent patterns**

### Completing Work and Merging to Main

**CRITICAL**: GitButler CLI has **no native command** for merging virtual branches to main or creating PRs. Use integration workflows.

**See [complete-branch skill](../complete-branch/SKILL.md) for full guided workflow**

**Key Concepts**:
- GitButler virtual branches = real git branches under the hood
- Standard `git merge` and `git push` work perfectly
- **CRITICAL**: Always `git checkout gitbutler/workspace` after git operations

### Inspection and Status

```bash
# View uncommitted changes and file assignments
but status

# View commit history on active branches
but log

# JSON output for automation
but --json status
but --json log
```

## Critical Rules

### When to Use Git vs GitButler Commands

**Workspace Operations (NEVER use git)**:
```bash
but branch new my-feature
git commit -m "Changes"        # ❌ BREAKS GITBUTLER STATE
git add file.ts                # ❌ Use `but rub` instead
git checkout virtual-branch    # ❌ Virtual branches don't need checkout
```

**Integration Operations (git is SAFE)**:
```bash
git checkout main              # ✅ Safe - switching to trunk
git merge my-feature --no-ff   # ✅ Safe - merging completed work
git push origin main           # ✅ Safe - pushing to remote
git push origin my-feature     # ✅ Safe - pushing for PR
gh pr create                   # ✅ Safe - GitHub CLI

# CRITICAL: Always return after git operations
git checkout gitbutler/workspace
```

**Why**: GitButler manages `gitbutler/workspace` integration branch. Using `git` for **workspace operations** corrupts this state. Using `git` for **integration operations** (merge, push, PR creation) is safe and necessary because GitButler CLI lacks these commands.

**Rule of Thumb**:
- Use `but` for all work within virtual branches
- Use `git` only for integrating completed work into main
- Always `git checkout gitbutler/workspace` after git operations

### Global Flags Come First

```bash
✅ but --json status
❌ but status --json  # Error: unexpected argument
```

### Handle Broken Pipe

`but status` panics when output consumed partially:

```bash
❌ but status | head -5  # Panic!

✅ status_output=$(but status)
   echo "$status_output" | head -5
```

## Common Commands

```bash
# Branch Management
but branch new <name>              # Create virtual branch
but branch new <name> --anchor <parent>  # Create stacked branch
but branch delete <name> --force   # Delete branch
but branch list                    # List all branches

# Committing
but commit -m "message"            # Commit to inferred branch
but commit <branch> -m "message"   # Commit to specific branch
but commit <branch> -o -m "msg"    # Only commit assigned files

# Reorganization
but rub <source> <target>          # The Swiss Army knife
but new <target>                   # Insert blank commit
but describe <target>              # Edit commit message or rename branch

# History & Undo
but oplog                          # Show operation history
but undo                           # Undo last operation
but snapshot --message "msg"       # Create manual snapshot

# Base Branch Updates
but base check                     # Check mergeability with base
but base update                    # Update workspace with latest base
```

**See [REFERENCE.md](REFERENCE.md#command-reference) for complete command list**

## Operation History and Safety

GitButler tracks all operations in oplog (like Git's reflog):

```bash
# View recent operations
but oplog

# Undo last operation
but undo

# Create snapshot before risky operations
but snapshot --message "Before major reorganization"
# ... risky operations ...
# If needed: but undo
```

**Best practice**: Snapshot before complex reorganizations, stack changes, or multi-agent coordination.

## Limitations and Workarounds

### Missing PR Submission CLI

**Problem**: No `but submit --stack` equivalent

**Workaround**: Use GitHub CLI after organizing with GitButler
```bash
# Organize work with GitButler
but status  # Verify branches ready

# Push and create PRs with gh
gh pr create --title "..." --body "..."
```

### Filename Parsing Issues

**Problem**: Dashes in filenames interpreted as range syntax

**Workaround**: Use file IDs from `but status` instead of filenames

## Integration with Project Workflows

### With Graphite

**Don't use both in same repo** - incompatible models:
- GitButler: virtual branches on integration branch
- Graphite: physical branches with metadata

**Choose per-repository**:
- GitButler for exploratory/multi-agent work
- Graphite for production automation

### With Linear

Track work in Linear while using GitButler:

```bash
# Create Linear issue first
# Use issue ID in commit messages
but commit my-branch -m "feat: add feature (RGR-123)"

# Reference commits in Linear comments
# Link PRs to Linear issues
```

## Troubleshooting

**Branch not showing in `but log`**:
- Not tracked yet - branches created with `git` need `but track --parent <parent>`

**Files not committing**:
- Check they're assigned to a branch (`but status`)
- Use `but rub <file-id> <branch>` to assign

**Conflicts in workspace**:
- GitButler shows conflicts immediately (all branches applied)
- Resolve conflicts in files, then commit
- Or reassign conflicting hunks to different branches

**Mixed git/but commands broke state**:
- Run `but base update` to sync
- If severely broken, may need to reinitialize (`but init`)

## Next Steps

- **Learn advanced patterns**: See [EXAMPLES.md](EXAMPLES.md)
- **Complete CLI reference**: See [REFERENCE.md](REFERENCE.md)
- **Multi-agent workflows**: See [multi-agent skill](../multi-agent/SKILL.md)
- **Stack management**: See [stack-workflows skill](../stack-workflows/SKILL.md)

## Quick Reference

```bash
but branch new <name> [--anchor <parent>]  # Create branch/stack
but rub <file-id> <branch-id>              # Assign file
but commit <branch> -m "message"           # Commit
but rub <commit-sha> <branch>              # Move commit
but status / but log                       # Inspect
but undo / but snapshot --message "msg"    # Safety
```
