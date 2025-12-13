# GitButler Reference

Complete CLI reference, JSON schemas, troubleshooting, and recovery patterns.

---

## Command Reference

### Global Options

```bash
but [OPTIONS] <COMMAND>

Global Options (must come BEFORE subcommand):
  -C, --current-dir <PATH>   Run from specified directory
  -j, --json                 JSON output format
  -h, --help                 Show help
```

**Critical**: Global flags come first:
```bash
✓ but --json status
✗ but status --json  # Error: unexpected argument
```

### Inspection Commands

| Command | Description |
|---------|-------------|
| `but status` | View uncommitted changes and file assignments |
| `but status -f, --files` | Show modified files in each commit |
| `but status -r` | Display code review status |
| `but log` | View commits on active branches |
| `but oplog` | View operations history (snapshots) |
| `but .` or `but /path` | Open GitButler GUI for repository |

**Status Output Example:**
```
╭┄00 [Unassigned Changes]
│   m6 A test-file.md
│   p9 M existing-file.ts
├╯

╭┄g4 [feature-branch]
│   🔒 i3 M locked-file.ts
●   abc1234 feat: initial commit
├╯

● 0c60c71 (common base) [origin/main]
```

**File Status Codes:**
- `A` — Added
- `M` — Modified
- `D` — Deleted
- `🔒` — Locked (belongs to this branch's commits)

**IDs:**
- `00`, `g4` — Branch IDs
- `m6`, `p9`, `i3` — File/hunk IDs (use with `but rub`)

### Branch Management

| Command | Description |
|---------|-------------|
| `but branch new <name>` | Create virtual branch (based on trunk) |
| `but branch new <name> --anchor <parent>` | Create stacked branch |
| `but branch new <name> -a <parent>` | Short form for stacked branch |
| `but branch delete <name>` | Soft delete (requires confirmation) |
| `but branch delete <name> --force` | Force delete |
| `but branch list` | List all branches |
| `but branch list --local` | Only local branches |
| `but branch rm <name>` | Remove virtual branch |

### Committing

| Command | Description |
|---------|-------------|
| `but commit -m "message"` | Commit to inferred branch |
| `but commit <branch> -m "message"` | Commit to specific branch |
| `but commit <branch> -o -m "msg"` | Only commit assigned files (`-o` flag) |
| `but commit` | Opens `$EDITOR` for message |

**Note:** Unlike git, GitButler commits all changes by default. Use `-o/--only` to commit only assigned files.

### File and Commit Manipulation

#### `but rub` (Swiss Army Knife)

```bash
but rub <source> <target>
```

| Source | Target | Operation | Description |
|--------|--------|-----------|-------------|
| File ID | Branch ID | **Assign** | Move file to branch |
| File ID | Commit SHA | **Amend** | Add file changes to commit |
| Commit SHA | Branch ID | **Move** | Relocate commit to branch |
| Commit SHA | Commit SHA | **Squash** | Combine newer into older |

#### Other Editing Commands

| Command | Description |
|---------|-------------|
| `but new <target>` | Insert blank commit (before commit ID or at top of branch) |
| `but describe` | Edit commit message or rename branch |
| `but absorb` | Amend uncommitted changes (v0.17.6+) |
| `but mark "pattern" <branch>` | Auto-assign files matching pattern |
| `but unmark` | Remove mark rules |

### Forge Integration (GitHub)

| Command | Description |
|---------|-------------|
| `but forge auth` | Authenticate with GitHub (OAuth flow) |
| `but forge list-users` | List authenticated accounts |
| `but forge forget <username>` | Remove authenticated account |
| `but push` | Push changes to remote |
| `but publish` | Publish review requests for branches |
| `but publish -b <branch>` | Publish specific branch |
| `but publish -f, --with-force` | Allow force push (default: true) |
| `but publish -r, --run-hooks` | Execute pre-push hooks (default: true) |

### Base Branch Operations

| Command | Description |
|---------|-------------|
| `but base check` | Fetch remotes and check mergeability |
| `but base update` | Update workspace with latest from base |

### Operations History (Undo/Restore)

| Command | Description |
|---------|-------------|
| `but oplog` | View operation history |
| `but undo` | Undo last operation |
| `but restore <snapshot-id>` | Restore to specific snapshot |
| `but snapshot --message "msg"` | Create manual snapshot |

### AI Integration Commands

**Claude Code Hooks:**
| Command | Purpose |
|---------|---------|
| `but claude pre-tool` | Run before code generation/editing |
| `but claude post-tool` | Run after editing completes |
| `but claude stop` | Run when agent session ends |

**Cursor Hooks:**
| Command | Purpose |
|---------|---------|
| `but cursor after-edit` | Triggered when Cursor edits files |
| `but cursor stop` | Triggered when task completes |

**MCP Server:**
| Command | Purpose |
|---------|---------|
| `but mcp` | Start MCP server for agent integration |

---

## JSON Output Schemas

### `but --json status`

Key fields:
- `path` — Filename as ASCII array (requires decoding)
- `assignments` — Hunk-level file assignments
- `stackId` — Which stack this belongs to (null if unassigned)

**Limitations:**
- File IDs (`m6`, `g4`) not exposed in JSON
- Paths are ASCII arrays, not strings
- Parse text output for IDs

### `but --json log`

Key fields:
- `tip` — Current HEAD of branch (commit SHA)
- `baseCommit` — Where branch diverges from parent
- `pushStatus` — `completelyUnpushed` | `unpushedCommits` | `fullyPushed`
- `state.type` — `LocalOnly` | `LocalAndRemote`
- `parentIds` — Parent commits (useful for finding stacks)

**Useful jq patterns:**
```bash
# Get all branch names
but --json log | jq '.[0].branchDetails[] | .name'

# Check push status
but --json log | jq '.[0].branchDetails[] | {name, pushStatus}'

# Find unpushed branches
but --json log | jq '.[0].branchDetails[] | select(.pushStatus != "fullyPushed") | .name'
```

---

## GitButler vs Graphite

| Aspect | Graphite | GitButler |
|--------|----------|-----------|
| **Model** | Linear stacks of physical branches | Virtual branches with optional stacking |
| **Workflow** | Plan → Branch → Code → Commit → Stack | Code → Organize → Assign → Commit |
| **Branch Switching** | Required (`gt up`/`gt down`) | Never needed (all applied) |
| **Branch Creation** | `gt create -am "msg"` | `but branch new name [--anchor parent]` |
| **Committing** | `gt modify -cam "msg"` | `but commit -m "msg"` |
| **Stack Navigation** | ✓ `gt up`/`gt down` | ✗ No CLI equivalent |
| **PR Submission** | ✓ `gt submit --stack` | ✗ No CLI (GUI or `gh` CLI) |
| **JSON Output** | Limited | ✓ Comprehensive via `--json` |
| **Multi-Feature Work** | Switch branches | All in one workspace |
| **CLI Completeness** | ✓ Full automation | ⚠️ Partial (missing PR/push) |

**Choose Graphite when:**
- Need end-to-end CLI automation
- PR submission required in scripts
- Terminal-first workflow
- Stack navigation commands needed

**Choose GitButler when:**
- Multiple unrelated features simultaneously
- Multi-agent concurrent development
- Exploratory coding (organize after)
- Post-hoc commit reorganization
- Visual organization preferred

**Don't use both in same repo** — incompatible models.

---

## Troubleshooting Guide

### Quick Reference

| Symptom | Cause | Solution |
|---------|-------|----------|
| Broken pipe panic | Output piped directly | Capture to variable first |
| Filename with dash fails | Interpreted as range | Use file ID from `but status` |
| Branch not in `but log` | Not tracked | `but track --parent <parent>` |
| Files not committing | Not assigned | `but rub <file-id> <branch>` |
| Mixed git/but broke state | Used git commands | `but base update` or `but init` |
| Workspace stuck loading | Backend timeout | Check oplog, restore snapshot |
| "Workspace commit not found" | HEAD changed externally | `git checkout gitbutler/workspace` |

### Common Issues

#### Broken Pipe Panic

**Problem:** `but status` panics when output consumed partially.

```bash
✗ but status | head -5  # Panic!

✓ status_output=$(but status)
  echo "$status_output" | head -5
```

#### Filename Parsing Issues

**Problem:** Dashes in filenames interpreted as range syntax.

```bash
✗ but rub file-with-dashes.md branch  # Fails

✓ but rub m6 branch  # Use file ID from but status
```

#### Integration Branch Conflicts

**Problem:** Mixed `git` and `but` commands corrupted state.

**Solutions:**
1. `but base update` to resync
2. If severely broken: `but init` to reinitialize

#### Files Not Committing

**Causes:**
1. Files not assigned to branch
2. Missing `-o` flag (only commit assigned files)

```bash
# Check assignments
but status

# Assign files
but rub <file-id> <branch>

# Commit with -o flag
but commit <branch> -o -m "message"
```

#### Workspace Stuck Loading

**Symptoms:**
- Loading spinner indefinitely
- Can see trunk/remote branches but not workspace

**Recovery:**
1. Wait 60 seconds for timeout
2. Check logs: `~/Library/Logs/com.gitbutler.app/GitButler.log` (macOS)
3. Use Operations History to restore previous snapshot
4. Last resort: Remove and re-add project

#### "GitButler workspace commit not found"

**Cause:** `gitbutler/workspace` branch modified or deleted outside GitButler.

**Recovery:**
```bash
# Return to integration branch
git checkout gitbutler/integration

# If that fails, check oplog
cat .git/gitbutler/operations-log.toml
git log <head_sha>

# Remove and re-add project to GitButler
```

### Recovery Scenarios

#### Lost Work (Accidentally Deleted Branch)

```bash
# Check oplog for deletion
but oplog

# Undo deletion (if last operation)
but undo

# Or restore to snapshot before deletion
but restore <snapshot-id>
```

#### Corrupted Workspace State

```bash
# Step 1: Snapshot current state
but snapshot --message "Before recovery"

# Step 2: Update base
but base update

# Step 3: Last resort - reinitialize
but init
```

#### Recovering from Mixed Git/But Commands

**If you committed with `git commit`:**
```bash
# Work is still in working directory
# Find orphaned commit
git reflog

# Create branch from it
git branch recovered <commit-sha>

# Return to GitButler
git checkout gitbutler/integration
```

**If you checked out another branch:**
```bash
# Return to GitButler
git checkout gitbutler/integration
# GitButler will resume operation
```

#### Virtual Branches Disappeared

Virtual branches are Git refs — they're still there:

```bash
# List all virtual branch refs
git for-each-ref refs/gitbutler/

# Create regular branch from virtual branch
git branch recovered-feature refs/gitbutler/Feature-A

# Or push directly to remote
git push origin refs/gitbutler/Feature-A:refs/heads/feature-a
```

#### Extract Data from Corrupted Project

```bash
# Backup everything
cp -r .git .git-backup

# Extract all virtual branch refs
git for-each-ref refs/gitbutler/ > gitbutler-refs.txt

# Create regular branch from each
while read sha type ref; do
  name=$(basename "$ref")
  git branch "recovered-$name" "$sha"
done < gitbutler-refs.txt

# Extract latest oplog snapshot
LATEST=$(cat .git/gitbutler/operations-log.toml | grep head_sha | awk '{print $3}' | tr -d '"')
git archive $LATEST index/ | tar -x -C recovered-uncommitted/
```

### Operations Log (Oplog) Deep Dive

**Location:** `.git/gitbutler/operations-log.toml`

**Snapshot contents:**
```
<snapshot-commit>
├── virtual_branches.toml     # Branch metadata
├── virtual_branches/         # Branch content trees
├── index/                    # Working directory state
├── target_tree/              # Base branch (e.g., main)
└── conflicts/                # Merge conflict info
```

**Operation types:**
- `CreateCommit` — Made a commit
- `CreateBranch` — Created branch
- `UpdateWorkspaceBase` — Updated base branch
- `RestoreFromSnapshot` — Reverted to snapshot
- `FileChanges` — Uncommitted changes detected
- `DeleteBranch` — Deleted branch
- `SquashCommit` — Squashed commits

**Manual inspection:**
```bash
# Find oplog head
OPLOG_HEAD=$(cat .git/gitbutler/operations-log.toml | grep head_sha | awk '{print $3}' | tr -d '"')

# View snapshot history
git log $OPLOG_HEAD --oneline

# Show virtual branches config from snapshot
git show <snapshot-sha>:virtual_branches.toml

# Extract file from snapshot
git show <snapshot-sha>:index/path/to/file.txt
```

### Prevention Best Practices

**Golden Rules:**
1. **NEVER remove project to fix errors** — may delete actual source files
2. **Commit frequently** — committed work is safer than WIP
3. **Push virtual branches to remote** — backup your work
4. **Don't mix GitButler and stock Git commands** — choose one workflow

**Before risky operations:**
```bash
but snapshot --message "Before major reorganization"
```

**Before GitButler updates:**
1. Commit everything
2. Push all branches to remote
3. Verify Operations History accessible

---

## Version History

**v0.18.2** (Nov 2024) — UX improvements, bug fixes
**v0.18.1** (Nov 2024) — Codegen agent CLI-aware
**v0.18.0** (Nov 2024) — `but .` command, enhanced status output
**v0.17.6** — `but absorb` command
**v0.17.0** — Shell completion, push capability, review status display
