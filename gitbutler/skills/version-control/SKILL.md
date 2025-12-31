---
name: GitButler Version Control
version: 2.0.0
description: Version control using GitButler's virtual branches for parallel multi-branch work, post-hoc organization, and multi-agent collaboration. Use when working with GitButler, virtual branches, `but` commands, stacked PRs, multi-agent workflows, or when `--gitbutler` or `--but` flags are mentioned.
---

# GitButler Version Control

Virtual branches → parallel development → post-hoc organization.

<when_to_use>

- Multiple unrelated features in same workspace simultaneously
- Multi-agent concurrent development (agents in same repo)
- Exploratory coding where organization comes after writing
- Post-hoc commit reorganization needed
- Visual organization preferred (GUI + CLI)

NOT for: projects using Graphite (incompatible models), simple linear workflows (use plain git), when PR submission automation required end-to-end (use Graphite instead)

</when_to_use>

<core_concepts>

| Concept | Description |
|---------|-------------|
| Virtual branches | Multiple branches applied simultaneously to working directory |
| Integration branch | `gitbutler/workspace` tracks virtual branch state — never touch directly |
| Target branch | Base branch (e.g., `origin/main`) all work diverges from |
| File assignment | Assign file hunks to branches with `but rub` |
| Stacks | Dependent branches via `--anchor` flag |
| Oplog | Operations log for undo/restore — your safety net |

**Key difference from Git**: All branches visible at once. Organize files to branches after editing. No checkout.

</core_concepts>

<workflow>

## Quick Start

```bash
# Initialize (one time)
but init

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

</workflow>

<parallel_development>

## Parallel Feature Development

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

## Multi-Agent Workflows

Multiple AI agents working concurrently in same repo:

```bash
# Agent 1
but branch new agent-1-feature
# ... make changes ...
but commit agent-1-feature -m "feat: add feature X"

# Agent 2 (simultaneously, same workspace)
but branch new agent-2-bugfix
# ... make changes ...
but commit agent-2-bugfix -m "fix: resolve issue Y"
```

**See [multi-agent skill](../multi-agent/SKILL.md) for advanced patterns**

</parallel_development>

<completion>

## Completing Work

**CRITICAL**: GitButler CLI lacks native commands for merging to main or creating PRs. Use git for integration.

```bash
# 1. Snapshot for safety
but snapshot --message "Before integrating feature-auth"

# 2. Switch to main
git checkout main

# 3. Update main
git pull origin main

# 4. Merge virtual branch
git merge --no-ff refs/gitbutler/feature-auth -m "feat: add auth"

# 5. Push
git push origin main

# 6. Clean up and return
but branch rm feature-auth
git checkout gitbutler/workspace
```

**See [complete-branch skill](../complete-branch/SKILL.md) for full guided workflow**

</completion>

<commands>

## Essential Commands

| Command | Purpose |
|---------|---------|
| `but init` | Initialize GitButler in repository |
| `but status` | View changes and file IDs |
| `but log` | View commits on active branches |
| `but branch new <name>` | Create virtual branch |
| `but branch new <name> --anchor <parent>` | Create stacked branch |
| `but rub <source> <target>` | Assign/move/squash/amend |
| `but commit <branch> -m "msg"` | Commit to branch |
| `but commit <branch> -o -m "msg"` | Commit only assigned files |
| `but publish` | Publish branches to forge (GitHub) |
| `but forge auth` | Authenticate with GitHub |
| `but absorb` | Amend uncommitted changes |
| `but oplog` | Show operation history |
| `but undo` | Undo last operation |
| `but snapshot --message "msg"` | Create manual snapshot |
| `but base update` | Update workspace with latest base |
| `but .` | Open GitButler GUI for current repo |

**Global flags come first**: `but --json status` ✓ | `but status --json` ✗

</commands>

<ai_integration>

## AI Agent Integration

Three integration methods:

**1. Agents Tab** (Claude Code, recommended)
- GUI-based launcher tied to branches
- Automatic commit management per session
- Parallel agent execution with branch isolation

**2. Lifecycle Hooks**

```json
{
  "hooks": {
    "PreToolUse": [{"matcher": "Edit|MultiEdit|Write", "hooks": [{"type": "command", "command": "but claude pre-tool"}]}],
    "PostToolUse": [{"matcher": "Edit|MultiEdit|Write", "hooks": [{"type": "command", "command": "but claude post-tool"}]}],
    "Stop": [{"matcher": "", "hooks": [{"type": "command", "command": "but claude stop"}]}]
  }
}
```

**3. MCP Server**

```bash
but mcp  # Start MCP server for agent integration
```

</ai_integration>

<rules>

ALWAYS:
- Use `but` for all work within virtual branches
- Use `git` only for integrating completed work into main
- Return to `gitbutler/workspace` after git operations: `git checkout gitbutler/workspace`
- Snapshot before risky operations: `but snapshot --message "..."`
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

<troubleshooting>

## Quick Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Branch not showing in `but log` | Not tracked | `but track --parent <parent>` |
| Files not committing | Not assigned | `but rub <file-id> <branch>` |
| Conflicts in workspace | All branches applied | Resolve in files or reassign hunks |
| Mixed git/but broke state | Used git commands | `but base update` or reinit |
| Broken pipe panic | Output consumed partially | Capture output to variable first |
| Filename with dash fails | Interpreted as range | Use file ID from `but status` |
| Lost work | Need recovery | Use `but oplog` and `but undo` |

## Recovery Pattern

```bash
# View recent operations
but oplog

# Undo last operation
but undo

# Or restore to specific snapshot
but restore <snapshot-id>

# If workspace corrupted
but base update
# Last resort: but init
```

**See [REFERENCE.md](REFERENCE.md#troubleshooting-guide) for comprehensive troubleshooting**

</troubleshooting>

<comparison>

## GitButler vs Graphite

| Aspect | Graphite | GitButler |
|--------|----------|-----------|
| Model | Linear stacks of physical branches | Virtual branches, optional stacking |
| Branch switching | Required (`gt up`/`gt down`) | Never needed (all applied) |
| PR submission | ✓ `gt submit --stack` | ✗ CLI only (use `gh` or GUI) |
| Multi-agent | Serial (checkout required) | Parallel (virtual branches) |
| Post-hoc organization | Difficult | `but rub` trivial |
| CLI completeness | Full automation | Partial (missing PR/push) |

**Choose GitButler for**: Exploratory work, multi-agent, post-hoc organization
**Choose Graphite for**: Production automation, PR submission, terminal-first

</comparison>

<references>

- [REFERENCE.md](REFERENCE.md) — complete CLI reference and troubleshooting
- [EXAMPLES.md](EXAMPLES.md) — real-world workflow patterns
- [multi-agent skill](../multi-agent/SKILL.md) — multi-agent coordination
- [stack-workflows skill](../stack-workflows/SKILL.md) — stacked branches
- [complete-branch skill](../complete-branch/SKILL.md) — merging to main
- [GitButler Docs](https://docs.gitbutler.com/) — official documentation

</references>
