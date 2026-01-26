# GitButler Examples

Real-world patterns and workflows for virtual branches, multi-agent collaboration, and post-hoc organization.

---

## Basic Workflows

### First Virtual Branch

```bash
# Initialize (one time)
cd /path/to/repo
but init

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
but log
# Shows def5678 "feat: add new feature" on bugfix-branch

# Create correct branch
but branch new feature-new-capability

# Move the commit
but rub def5678 feature-new-capability

# Commit moved!
but log
```

### Squashing Commits

```bash
# Too many small commits
but log
# c3d4e5f, c2d3e4f, c1d2e3f on feature-branch

# Squash (newer into older)
but rub c3d4e5f c2d3e4f
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
but log
```

### Submit Stack as PRs

```bash
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
but log  # Branch recovered!
```

### Recover from Bad Reorganization

```bash
# Snapshot before risky operations
but snapshot --message "Before reorganizing commits"

# Attempt reorganization
but rub <commit1> <branch1>
but rub <commit2> <branch2>

# Result is a mess - restore to snapshot
snapshot_id=$(but oplog | grep "Before reorganizing" | awk '{print $1}')
but restore $snapshot_id

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
but base update

# If still broken, reinitialize
but snapshot --message "Before recovery"
but init
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
but snapshot --message "Before major reorganization"
but snapshot --message "Before multi-agent coordination"
but snapshot --message "Before complex stack changes"
```

### File Assignment Discipline

```bash
# Good: Assign immediately
echo "code" > file1.ts
but rub <id> my-branch  # Right away
```

### JSON Output

```bash
# Get all branch names
but --json log | jq '.[0].branchDetails[] | .name'

# Check push status
but --json log | jq '.[0].branchDetails[] | {name, pushStatus}'

# Find unpushed branches
but --json log | jq '.[0].branchDetails[] | select(.pushStatus != "fullyPushed") | .name'
```
