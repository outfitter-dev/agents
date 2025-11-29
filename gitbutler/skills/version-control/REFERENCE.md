# GitButler Reference

Complete reference for GitButler CLI, JSON schemas, and advanced patterns.

## Table of Contents

1. [Command Reference](#command-reference)
2. [JSON Output Schemas](#json-output-schemas)
3. [GitButler vs Graphite](#gitbutler-vs-graphite)
4. [Troubleshooting Guide](#troubleshooting-guide)

---

## Command Reference

### Global Options

```bash
but [OPTIONS] <COMMAND>

Global Options (must come before subcommand):
  -C, --current-dir <PATH>   Run from specified directory
  -j, --json                 JSON output format
  -h, --help                 Show help
```

**Critical**: `--json` is a global flag:
```bash
✅ but --json status
❌ but status --json  # Error: unexpected argument
```

### Inspection Commands

#### `but status`

Shows uncommitted changes and file assignments.

```bash
but status                    # Human-readable output
but --json status             # JSON output
```

**Text Output Example**:
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

**File Status Codes**:
- `A` - Added
- `M` - Modified
- `D` - Deleted
- `🔒` - Locked (belongs to this branch's commits)

**IDs**:
- `00`, `g4` - Branch IDs
- `m6`, `p9`, `i3` - File/hunk IDs (use with `but rub`)

#### `but log`

Shows commits on active branches.

```bash
but log                       # Human-readable output
but --json log                # JSON output
```

#### `but oplog`

Shows operation history (last 20 operations).

```bash
but oplog                     # Human-readable output
but --json oplog              # JSON output
```

### Branch Management

#### `but branch new`

Creates a new virtual branch.

```bash
but branch new <name>                    # Independent branch (based on trunk)
but branch new <name> --anchor <parent>  # Stacked branch (based on parent)
```

#### `but branch delete`

Deletes a virtual branch.

```bash
but branch delete <name>          # Soft delete (requires confirmation)
but branch delete <name> --force  # Force delete
```

#### `but branch list`

Lists all virtual branches.

```bash
but branch list              # All branches
but branch list --local      # Only local branches
```

### Committing

#### `but commit`

Creates a commit on a virtual branch.

```bash
but commit -m "message"                # Commit to inferred/current branch
but commit <branch> -m "message"       # Commit to specific branch
but commit <branch> -o -m "message"    # Only commit assigned files (-o flag)
```

### File and Commit Manipulation

#### `but rub`

The Swiss Army knife - combines entities to perform operations.

```bash
but rub <source> <target>
```

**Operations by Entity Combination**:

| Source | Target | Operation | Description |
|--------|--------|-----------|-------------|
| File ID | Branch ID | **Assign** | Move file to branch |
| File ID | Commit SHA | **Amend** | Add file changes to commit |
| Commit SHA | Branch ID | **Move** | Relocate commit to branch |
| Commit SHA | Commit SHA | **Squash** | Combine newer into older |

#### `but new`

Inserts blank commit before specified commit or at top of stack.

#### `but describe`

Edits commit message or renames branch.

### Base Branch Operations

#### `but base check`

Fetches remotes and checks mergeability.

#### `but base update`

Updates workspace with latest from base branch.

### Operation History

#### `but undo`

Undoes last operation by reverting to previous snapshot.

#### `but snapshot`

Creates on-demand snapshot.

```bash
but snapshot --message "Before major reorganization"
```

#### `but restore`

Restores to specific oplog snapshot.

```bash
but restore <snapshot-id>
```

### Auto-Assignment

#### `but mark`

Creates rules for auto-assigning files to branches.

```bash
but mark "src/features/**/*.ts" feature-branch
```

---

## JSON Output Schemas

### `but --json status`

**Key Fields**:
- `path`: Filename as ASCII array (requires decoding)
- `assignments`: Hunk-level file assignments
- `stackId`: Which stack this belongs to (null if unassigned)

**Limitations**:
- File IDs (`m6`, `g4`) not exposed in JSON
- Paths are ASCII arrays, not strings
- Requires parsing text output for IDs

### `but --json log`

**Key Fields**:
- `tip`: Current HEAD of branch (commit SHA)
- `baseCommit`: Where branch diverges from parent
- `pushStatus`: `completelyUnpushed` | `unpushedCommits` | `fullyPushed`
- `state.type`: `LocalOnly` | `LocalAndRemote`
- `parentIds`: Parent commits (useful for finding stacks)

---

## GitButler vs Graphite

### Core Philosophy

| Aspect | **Graphite** | **GitButler** |
|--------|-------------|---------------|
| **Model** | Linear stacks of physical Git branches | Virtual branches with optional stacking |
| **Workflow** | Plan → Branch → Code → Commit → Stack | Code → Organize → Assign → Commit → Stack (optional) |
| **Branch Switching** | Required (`gt up`/`gt down`) | Never needed (all applied simultaneously) |

### Feature Comparison

| Feature | **Graphite** | **GitButler** |
|---------|-------------|---------------|
| **Branch Creation** | `gt create -am "msg"` | `but branch new name [--anchor parent]` |
| **Committing** | `gt modify -cam "msg"` | `but commit -m "msg"` |
| **Stack Navigation** | ✅ `gt up`/`gt down` | ❌ No CLI equivalent |
| **PR Submission** | ✅ `gt submit --stack` | ❌ No CLI (GUI only) |
| **JSON Output** | Limited | ✅ Comprehensive via `--json` |
| **Multi-Feature Work** | Switch branches (`gt checkout`) | All in one workspace (virtual branches) |
| **CLI Completeness** | ✅ Full automation | ⚠️ Partial (missing PR/push) |

### When to Use Each

**Use Graphite when:**
- Need end-to-end CLI automation
- PR submission required in scripts
- Terminal-first workflow
- Stack navigation commands needed

**Use GitButler when:**
- Multiple unrelated features simultaneously
- Multi-agent concurrent development
- Exploratory coding (organize after)
- Post-hoc commit reorganization
- Visual organization preferred

**Don't use both in same repo** - incompatible models.

---

## Troubleshooting Guide

### Common Issues

#### "Start of range 'X' must match exactly one item"

**Cause**: Filename contains dash, interpreted as range syntax.

**Solutions**:
1. Use file ID instead: `but rub m6 branch`
2. Avoid dashes in new filenames

#### "Target 'X' is ambiguous"

**Cause**: Short ID matches multiple items.

**Solutions**:
1. Use full branch name instead of short ID
2. Use commit SHA instead of short ID

#### Broken Pipe Panic

**Cause**: `but status` output consumed partially.

**Solution**:
```bash
# Capture full output first
status_output=$(but status)
echo "$status_output" | head -5
```

#### Integration Branch Conflicts

**Cause**: Mixed `git` and `but` commands.

**Solutions**:
1. **Never use git commands on virtual branches**
2. If corrupted: `but base update` to resync
3. If severely broken: Reinitialize with `but init`

#### Files Not Committing

**Causes**:
1. Files not assigned to branch
2. Forgot `-o` flag (only commit assigned files)

**Solutions**:
```bash
# Check assignments
but status

# Assign files
but rub <file-id> <branch>

# Commit with -o flag
but commit <branch> -o -m "message"
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
