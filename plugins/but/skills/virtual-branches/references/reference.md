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

**JSON output**: Use `--json` or `-j` per command, or as a global flag:

```bash
but status --json    # Per-command flag
but --json status    # Global flag (also works)
```

### Inspection Commands

| Command | Description |
|---------|-------------|
| `but status` | View uncommitted changes and file assignments |
| `but status -f` | Show modified files in each commit |
| `but status -v, --verbose` | Show verbose output with commit author and timestamp |
| `but show <id>` | Show detailed info about a commit or branch |
| `but diff` | Show diff of all uncommitted changes |
| `but diff <id>` | Show diff for a specific entity (file, branch, commit) |
| `but oplog` | View operations history (snapshots) |
| `but gui` | Open GitButler GUI for current repo |

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
| `but unapply <name>` | Remove branch from workspace (keeps in Git) |
| `but apply <name>` | Apply an unapplied branch to workspace |
| `but pick <source> [branch]` | Cherry-pick commit from unapplied branch |

### Committing

| Command | Description |
|---------|-------------|
| `but commit -m "message"` | Commit to inferred branch |
| `but commit <branch> -m "message"` | Commit to specific branch |
| `but commit <branch> -o -m "msg"` | Only commit assigned files (`-o` flag) |
| `but commit -p <id>,<id>` | Commit specific files/hunks by CLI ID |
| `but commit --ai` | Generate commit message with AI |
| `but commit -c` | Create new branch for this commit |
| `but commit` | Opens `$EDITOR` for message |
| `but commit empty --before <target>` | Insert blank commit before target |
| `but commit empty --after <target>` | Insert blank commit after target |

**Note:** Unlike git, GitButler commits all changes by default. Use `-o/--only` to commit only assigned files, or `-p/--changes` to select specific file/hunk IDs.

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
| `but commit empty --before/--after <target>` | Insert blank commit before or after target |
| `but reword` | Edit commit message or rename branch |
| `but absorb` | Auto-amend uncommitted changes to appropriate commits based on context |
| `but absorb --dry-run` | Preview what absorb would do without changing anything |
| `but absorb --new` | Create new commits instead of amending existing ones |
| `but squash <commits>` | Squash commits together (by IDs, range, or branch name) |
| `but move <commit> <target>` | Move commit to a different location in the stack |
| `but amend <file> <commit>` | Amend a file change into a specific commit |
| `but uncommit <source>` | Uncommit changes back to unstaged area |
| `but discard <id>` | Discard uncommitted changes from worktree |
| `but mark <branch>` | Auto-assign new changes to branch |
| `but unmark` | Remove all mark rules from workspace |

**`but absorb`**: Analyzes uncommitted changes and automatically amends them to the appropriate existing commits based on file context and change location. Similar to `git absorb` but integrated with virtual branches.

### Forge Integration (GitHub)

| Command | Description |
|---------|-------------|
| `but config forge auth` | Authenticate with GitHub via OAuth flow |
| `but config forge list-users` | List authenticated accounts |
| `but config forge forget <username>` | Remove authenticated account |
| `but push [branch]` | Push branch to remote |
| `but push -d, --dry-run` | Preview what would be pushed |
| `but push -f, --with-force` | Force push |
| `but push -r, --run-hooks` | Execute pre-push hooks |
| `but pr new [branch]` | Create PR for branch on forge |

**Push + PR workflow:**
1. Push branch to remote: `but push feature-auth`
2. Create PR: `but pr new feature-auth`
3. Or push all unpushed branches: `but push` (non-interactive)
4. Requires prior `but config forge auth` for first-time setup

### Base Branch Operations

| Command | Description |
|---------|-------------|
| `but pull --check` | Fetch remotes and check mergeability |
| `but pull` | Update workspace with latest from base |

### Operations History (Undo/Restore)

| Command | Description |
|---------|-------------|
| `but oplog` | View operation history |
| `but undo` | Undo last operation |
| `but oplog restore <snapshot-id>` | Restore to specific snapshot |
| `but oplog snapshot --message "msg"` | Create manual snapshot |

### Conflict Resolution

| Command | Description |
|---------|-------------|
| `but resolve <commit-id>` | Enter resolution mode for a conflicted commit |
| `but resolve status` | Show remaining conflicted files |
| `but resolve finish` | Finalize resolution and return to workspace |
| `but resolve cancel` | Cancel resolution and return to workspace |

**Workflow:**
1. `but status` shows conflicted commits
2. `but resolve <commit-id>` to enter resolution mode
3. Fix conflict markers in your editor
4. `but resolve status` to check remaining conflicts
5. `but resolve finish` to finalize

### Workspace Lifecycle

| Command | Description |
|---------|-------------|
| `but setup` | Initialize GitButler project from existing Git repo |
| `but setup --init` | Initialize new Git repo and set up GitButler |
| `but teardown` | Exit GitButler mode, return to normal Git |

**`but teardown`**: Creates an oplog snapshot, checks out the first active branch as a regular Git branch, and provides instructions for returning to GitButler mode.

### Configuration

| Command | Description |
|---------|-------------|
| `but config` | Show configuration overview |
| `but config user` | View user configuration |
| `but config user set name "Name"` | Set user name |
| `but config user set email "email"` | Set user email |
| `but config forge` | View forge configuration |
| `but config forge auth` | Authenticate with forge (GitHub OAuth) |
| `but config forge list-users` | List authenticated accounts |
| `but config forge forget <user>` | Remove authenticated account |

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

### `but status --json`

Key fields:
- `path` — Filename as ASCII array (requires decoding)
- `assignments` — Hunk-level file assignments
- `stackId` — Which stack this belongs to (null if unassigned)

**Limitations:**
- File IDs (`m6`, `g4`) not exposed in JSON
- Paths are ASCII arrays, not strings
- Parse text output for IDs

### `but show <branch> --json`

Shows detailed branch info with commits. Key fields:
- `commits` — Array of commits on the branch
- `commits[].id` — Commit SHA

### `but diff --json`

Shows diffs in JSON format for programmatic analysis.

**Useful jq patterns:**

```bash
# Get branch commits
but show feature-branch --json | jq '.commits[] | .id'

# Workspace overview
but status --json | jq '.stacks'
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
| **Stack Navigation** | ✓ `gt up`/`gt down` | ✗ No CLI equivalent (all applied) |
| **PR Submission** | ✓ `gt submit --stack` | ✓ `but push` + `but pr new` |
| **JSON Output** | Limited | ✓ Comprehensive via `--json` per command |
| **Multi-Feature Work** | Switch branches | All in one workspace |
| **CLI Completeness** | ✓ Full automation | ✓ Full automation (as of 0.19.0) |
| **Conflict Resolution** | Standard git rebase | ✓ Per-commit via `but resolve` |

**Choose Graphite when:**
- Stack navigation commands needed (`gt up`/`gt down`)
- Terminal-first linear workflow
- Established stacked PR practices

**Choose GitButler when:**
- Multiple unrelated features simultaneously
- Multi-agent concurrent development
- Exploratory coding (organize after)
- Post-hoc commit reorganization
- Per-commit conflict resolution needed
- Visual organization preferred (GUI + CLI)

**Don't use both in same repo** — incompatible models.

---

## Troubleshooting Guide

### Quick Reference

| Symptom | Cause | Solution |
|---------|-------|----------|
| Broken pipe panic | Output piped directly | Capture to variable first |
| Filename with dash fails | Interpreted as range | Use file ID from `but status` |
| Branch not visible | Not applied | `but apply <branch>` or `but pick <commit>` |
| Files not committing | Not assigned | `but rub <file-id> <branch>` |
| Mixed git/but broke state | Used git commands | `but pull` or `but setup` |
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
1. `but pull` to resync
2. If severely broken: `but setup` to reinitialize

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
but oplog restore <snapshot-id>
```

#### Corrupted Workspace State

```bash
# Step 1: Snapshot current state
but oplog snapshot --message "Before recovery"

# Step 2: Update base
but pull

# Step 3: Last resort - reinitialize
but setup
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
but oplog snapshot --message "Before major reorganization"
```

**Before GitButler updates:**
1. Commit everything
2. Push all branches to remote
3. Verify Operations History accessible
