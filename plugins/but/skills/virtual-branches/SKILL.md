---
name: gitbutler-virtual-branches
description: This skill should be used when the user asks to "create a virtual branch", "assign file to branch", "work on multiple features simultaneously", "organize commits after coding", "use but commands", or mentions GitButler, virtual branches, parallel development without checkout, post-hoc commit organization, multi-agent concurrent development, or `--gitbutler`/`--but` flags.
metadata:
  version: "1.0.0"
  author: outfitter
  category: version-control
  related-skills:
    - gitbutler-multi-agent
    - gitbutler-stacks
    - gitbutler-complete-branch
---

# GitButler Virtual Branches

Virtual branches → parallel development → post-hoc organization.

<when_to_use>

- Multiple unrelated features in same workspace simultaneously
- Multi-agent concurrent development (agents in same repo)
- Exploratory coding where organization comes after writing
- Post-hoc commit reorganization needed
- Visual organization preferred (GUI + CLI)

NOT for: projects using Graphite (incompatible models), simple linear workflows (use plain git)

</when_to_use>

## This, Not That

| Task | This | Not That |
| ---- | ---- | -------- |
| Initialize workspace | `but setup` | manual setup |
| Create branch | `but branch new name` | `git checkout -b name` |
| View changes | `but status` | `git status` |
| Assign file to branch | `but rub <file-id> <branch>` | manual staging |
| Commit to branch | `but commit <branch> -m "msg"` | `git commit -m "msg"` |
| Move commit | `but rub <sha> <branch>` | `git cherry-pick` |
| Squash commits | `but squash <branch>` | `git rebase -i` |
| Undo operation | `but undo` | `git reset` |
| Switch context | Create new branch | `git checkout` |

**Key difference from Git**: All branches visible at once. Organize files to branches after editing. No checkout.

## Core Concepts

| Concept | Description |
|---------|-------------|
| Virtual branches | Multiple branches applied simultaneously to working directory |
| Integration branch | `gitbutler/workspace` tracks virtual branch state — never touch directly |
| Target branch | Base branch (e.g., `origin/main`) all work diverges from |
| File assignment | Assign file hunks to branches with `but rub` |
| Oplog | Operations log for undo/restore — your safety net |

## Quick Start

```bash
# Initialize (one time)
but setup

# Create branch
but branch new feature-auth

# Make changes, check status for file IDs
but status
# ╭┄00 [Unassigned Changes]
# │   m6 A src/auth.ts

# Assign file to branch using ID
but rub m6 feature-auth

# Commit
but commit feature-auth -m "feat: add authentication"
```

## Core Loop

1. **Create**: `but branch new <name>`
2. **Edit**: Make changes in working directory
3. **Check**: `but status` to see file IDs
4. **Assign**: `but rub <file-id> <branch-name>`
5. **Commit**: `but commit <branch> -m "message"`
6. **Repeat**: Continue with other features in parallel

## The Power of `but rub`

Swiss Army knife — combines entities to perform operations:

| Source | Target | Operation |
|--------|--------|-----------|
| File ID | Branch | Assign file to branch |
| File ID | Commit | Amend commit with file |
| Commit SHA | Branch | Move commit between branches |
| Commit SHA | Commit SHA | Squash (newer into older) |

## Essential Commands

| Command | Purpose |
|---------|---------|
| `but setup` | Initialize GitButler in repository |
| `but status` | View changes and file IDs |
| `but branch new <name>` | Create virtual branch |
| `but branch new <name> --anchor <parent>` | Create stacked branch |
| `but rub <source> <target>` | Assign/move/squash/amend |
| `but commit <branch> -m "msg"` | Commit to branch |
| `but commit <branch> -o -m "msg"` | Commit only assigned files |
| `but absorb` | Auto-amend uncommitted changes to appropriate commits |
| `but squash <commits>` | Squash commits (by IDs, range, or branch) |
| `but show <id>` | Inspect a commit or branch in detail |
| `but resolve <commit>` | Enter conflict resolution mode |
| `but push` | Push branches to remote |
| `but pr new` | Create/update PRs on forge |
| `but config forge auth` | Authenticate with GitHub (OAuth) |
| `but mark <branch>` | Auto-assign new changes to branch |
| `but unmark` | Remove all mark rules from workspace |
| `but oplog` | Show operation history |
| `but undo` | Undo last operation |
| `but oplog snapshot --message "msg"` | Create manual snapshot |
| `but pull` | Update workspace with latest base |
| `but gui` | Open GitButler GUI for current repo |

**JSON output**: Use `--json` or `-j` flag on any command: `but status --json`

## Parallel Development

```bash
# Create two independent features
but branch new feature-a
but branch new feature-b

# Edit files for both (same workspace!)
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

## Conflict Handling

GitButler handles conflicts **per-commit** during rebase/update (unlike Git's all-or-nothing model):

1. Rebase continues even when some commits conflict
2. Conflicted commits marked in UI/status
3. Use `but resolve` to enter resolution mode per commit
4. Partial resolution can be saved for later

```bash
# Update base (may cause conflicts)
but pull

# Check which commits have conflicts
but status

# Enter resolution mode for a specific commit
but resolve <commit-id>

# Fix conflicts in your editor, then check remaining
but resolve status

# Finalize when done (or cancel to abort)
but resolve finish
```

For detailed conflict resolution workflows, see `references/reference.md#conflict-resolution`.

## Auto-Assignment with Marks

Set up workspace rules to auto-assign files to branches:

```bash
# Auto-assign new changes to auth-feature branch
but mark auth-feature

# Remove all rules
but unmark
```

Useful for multi-agent workflows where changes should route to a specific branch.

<rules>

ALWAYS:
- Use `but` for all work within virtual branches
- Use `git` only for integrating completed work into main
- Return to `gitbutler/workspace` after git operations: `git checkout gitbutler/workspace`
- Snapshot before risky operations: `but oplog snapshot --message "..."`
- Assign files immediately after creating: `but rub <id> <branch>`
- Check file IDs with `but status` before using `but rub`

NEVER:
- Use `git commit` on virtual branches — breaks GitButler state
- Use `git add` — GitButler manages index
- Use `git checkout` on virtual branches — no checkout needed
- Push `gitbutler/integration` to remote — it's local-only
- Mix Graphite and GitButler in same repo — incompatible models
- Pipe `but status` directly — causes panic; capture output first:

  ```bash
  status_output=$(but status)
  echo "$status_output" | head -5
  ```

</rules>

## Troubleshooting

| Symptom | Solution |
|---------|----------|
| Files not committing | Assign first: `but rub <file-id> <branch>` |
| Broken pipe panic | Capture output: `output=$(but status)` |
| Mixed git/but broke state | `but pull` or `but setup` |
| Lost work | `but undo` or `but oplog restore <snapshot-id>` |

For detailed troubleshooting (branch tracking, conflicts, filename issues), see `references/reference.md#troubleshooting-guide`.

## Recovery

Quick undo: `but undo` | Full restore: `but oplog restore <snapshot-id>` | View history: `but oplog`

For recovery from lost work or corrupted state, see `references/reference.md#recovery-scenarios`.

<references>

### Reference Files

- **`references/reference.md`** — Complete CLI reference, JSON schemas, troubleshooting
- **`references/examples.md`** — Real-world workflow patterns with commands
- **`references/ai-integration.md`** — Hooks, MCP server, agent lifecycle

### Related Skills

- [gitbutler-multi-agent](../multi-agent/SKILL.md) — Multi-agent coordination
- [gitbutler-stacks](../stacks/SKILL.md) — Stacked branches
- [gitbutler-complete-branch](../complete-branch/SKILL.md) — Merging to main

### External

- [GitButler Docs](https://docs.gitbutler.com/) — Official documentation
- [GitButler AI Integration](https://docs.gitbutler.com/features/ai-integration/) — Hooks and MCP

</references>
