# GitButler Examples

Real-world patterns and workflows for virtual branches, multi-agent collaboration, and post-hoc organization.

---

## Basic Workflows

### First Virtual Branch

```bash
# Initialize (one time)
cd /path/to/repo
but setup

# Check state
but status
# ● 0c60c71 (common base) [origin/main]

# Create branch
but branch new feature-user-auth

# Make changes
echo "export function authenticate()" > src/auth.ts
echo "test('authenticates user')" > src/auth.test.ts

# Check status for file IDs
but status
# ╭┄00 [Unassigned Changes]
# │   m6 A src/auth.ts
# │   p9 A src/auth.test.ts

# Assign and commit
but rub m6 feature-user-auth
but rub p9 feature-user-auth
but commit feature-user-auth -m "feat: add user authentication"
```

### Context Switching (No Checkout!)

```bash
# Working on feature when bug reported
but branch new feature-dashboard
echo "Dashboard code" > dashboard.ts
but rub <id> feature-dashboard

# Bug reported - switch context immediately (no checkout!)
but branch new bugfix-login-timeout
echo "Fix timeout" > login.ts
but rub <id> bugfix-login-timeout

# Both exist in same workspace
but status  # Shows both branches

# Commit bugfix first (urgent)
but commit bugfix-login-timeout -m "fix: resolve login timeout"

# Continue feature work
but commit feature-dashboard -m "feat: add dashboard"
```

---

## Reorganizing Work

### Moving Commits Between Branches

```bash
# Oops, committed to wrong branch!
but status
# Shows def5678 "feat: add new feature" on bugfix-branch

# Create correct branch
but branch new feature-new-capability

# Move the commit
but rub def5678 feature-new-capability

# Commit moved!
but status
```

### Squashing Commits

```bash
# Too many small commits on feature-branch
# Squash using explicit command
but squash feature-branch
```

### Post-Hoc File Assignment

```bash
# Made changes without branches
echo "Auth code" > auth.ts
echo "API code" > api.ts
echo "Docs" > README.md

but status
# Shows all files in Unassigned Changes

# Create branches and organize
but branch new feature-auth
but branch new feature-api
but branch new docs-update

# Assign to respective branches
but rub m6 feature-auth
but rub p9 feature-api
but rub i3 docs-update

# Commit each
but commit feature-auth -m "feat: add authentication"
but commit feature-api -m "feat: add API endpoints"
but commit docs-update -m "docs: update readme"
```

---

## Multi-Agent Patterns

### Parallel Feature Development

```bash
# Agent 1 (Claude)
but branch new claude-feature-auth
echo "Auth implementation" > src/auth.ts
but rub <id> claude-feature-auth
but commit claude-feature-auth -m "feat: add authentication"

# Agent 2 (Droid) - simultaneously, same workspace!
but branch new droid-feature-api
echo "API implementation" > src/api.ts
but rub <id> droid-feature-api
but commit droid-feature-api -m "feat: add API endpoints"

# Zero conflicts, zero coordination overhead
```

### Sequential Handoffs

```bash
# Agent A: Initial implementation
but branch new feature-user-management
echo "Initial user code" > user.ts
but rub <id> feature-user-management
but commit feature-user-management -m "feat: initial user management"

# Agent A hands off to Agent B
but branch new feature-user-management-tests --anchor feature-user-management

# Agent B: Adds tests
echo "Tests for user management" > user.test.ts
but rub <id> feature-user-management-tests
but commit feature-user-management-tests -m "test: add user management tests"
```

### Cross-Agent Commit Transfer

```bash
# Agent A finishes work
but branch new agent-a-feature
but commit agent-a-feature -m "feat: implementation complete"

# Agent B creates their branch
but branch new agent-b-continuation

# Transfer commit from A to B
but rub abc1234 agent-b-continuation

# Agent B continues
echo "More work" >> feature.ts
but commit agent-b-continuation -m "feat: continue implementation"
```

---

## Stack Management

### Creating a Linear Stack

```bash
# Base refactoring
but branch new refactor-database
echo "Refactor database layer" > db-refactor.ts
but rub <id> refactor-database
but commit refactor-database -m "refactor: restructure database"

# Build on refactoring
but branch new feature-new-model --anchor refactor-database
echo "New data model" > model.ts
but rub <id> feature-new-model
but commit feature-new-model -m "feat: add new data model"

# Add tests on top
but branch new test-new-model --anchor feature-new-model
echo "Model tests" > model.test.ts
but rub <id> test-new-model
but commit test-new-model -m "test: comprehensive model tests"

# Visualize stack
but status
```

### Submit Stack as PRs

```bash
# Using but CLI (preferred)
but push refactor-database
but pr new refactor-database

but push feature-new-model
but pr new feature-new-model

but push test-new-model
but pr new test-new-model
```

```bash
# Alternative: using git + gh directly
git push origin refactor-database
gh pr create --title "refactor: database layer" --base main

git push origin feature-new-model
gh pr create --title "feat: new data model" --base refactor-database

git push origin test-new-model
gh pr create --title "test: model tests" --base feature-new-model
```

---

## Emergency Recovery

### Recover Deleted Branch

```bash
# Oops, deleted wrong branch
but branch delete important-feature --force

# Check oplog
but oplog

# Undo deletion
but undo

# Verify recovery
but status  # Branch recovered!
```

### Recover from Bad Reorganization

```bash
# Snapshot before risky operations
but oplog snapshot --message "Before reorganizing commits"

# Attempt reorganization
but rub <commit1> <branch1>
but rub <commit2> <branch2>

# Result is a mess - restore to snapshot
snapshot_id=$(but oplog | grep "Before reorganizing" | awk '{print $1}')
but oplog restore $snapshot_id

# Back to pre-reorganization state!
```

### Recover from Mixed Git/But Commands

```bash
# Made changes on virtual branch
but branch new my-feature
echo "changes" > file.ts

# Accidentally used git
git add file.ts
git commit -m "oops"  # WRONG!

# Recovery
but pull

# If still broken, reinitialize
but oplog snapshot --message "Before recovery"
but setup
```

---

## New in 0.19.0

### Selective Commit with `--changes`

```bash
# Check status for file/hunk IDs
but status
# ╭┄00 [Unassigned Changes]
# │   m6 A src/auth.ts
# │   p9 A src/api.ts
# │   i3 M README.md

# Commit only specific files by ID
but commit feature-auth -p m6,i3 -m "feat: add auth and update docs"

# p9 remains uncommitted
```

### Conflict Resolution with `but resolve`

```bash
# After pulling, a commit has conflicts
but pull
but status
# Shows conflicted commit with ⚠️ marker

# Enter resolution mode
but resolve abc1234

# Fix conflict markers in your editor
# Check what's left
but resolve status

# Finalize
but resolve finish
```

### Squashing with Ranges

```bash
# Squash all commits in a branch
but squash feature-branch

# Squash specific commits
but squash abc1234 def5678

# Squash a range
but squash abc1234..ghi9012
```

### Absorb with Preview

```bash
# Preview where changes would be absorbed
but absorb --dry-run

# Absorb into new commits instead of amending
but absorb --new
```

### Push with Preview

```bash
# See what would be pushed without pushing
but push --dry-run

# Push a specific branch
but push feature-auth

# Push all unpushed branches
but push
```

---

## Tips and Patterns

### Branch Naming

```bash
# Agent-based naming
but branch new claude-feat-user-auth
but branch new droid-fix-api-timeout

# Task-based naming
but branch new feature-authentication
but branch new bugfix-timeout
```

### Snapshot Cadence

```bash
but oplog snapshot --message "Before major reorganization"
but oplog snapshot --message "Before multi-agent coordination"
but oplog snapshot --message "Before complex stack changes"
```

### File Assignment Discipline

```bash
# Good: Assign immediately
echo "code" > file1.ts
but rub <id> my-branch  # Right away
```

### JSON Output

```bash
# Get branch commits
but show feature-branch --json | jq '.commits[] | .id'

# Workspace overview
but status --json | jq '.stacks'
```
