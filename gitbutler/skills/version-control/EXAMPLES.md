# GitButler Examples

Real-world patterns and workflows from multi-agent testing and production use.

## Table of Contents

1. [Basic Workflows](#basic-workflows)
2. [Reorganizing Work](#reorganizing-work)
3. [Multi-Agent Patterns](#multi-agent-patterns)
4. [Stack Management](#stack-management)
5. [Emergency Recovery](#emergency-recovery)

---

## Basic Workflows

### Creating Your First Virtual Branch

```bash
# Initialize GitButler (one time)
cd /path/to/repo
but init

# Check current state
but status
# ● 0c60c71 (common base) [origin/main]

# Create virtual branch
but branch new feature-user-auth

# Make changes
echo "export function authenticate()" > src/auth.ts
echo "test('authenticates user')" > src/auth.test.ts

# Check status - see file IDs
but status
# ╭┄00 [Unassigned Changes]
# │   m6 A src/auth.ts
# │   p9 A src/auth.test.ts

# Assign files to branch
but rub m6 feature-user-auth
but rub p9 feature-user-auth

# Commit
but commit feature-user-auth -m "feat: add user authentication"
```

### Working on Multiple Features Simultaneously

```bash
# Scenario: Bug reported while implementing feature

# You're working on feature
but branch new feature-dashboard
echo "Dashboard code" > dashboard.ts
but rub <id> feature-dashboard

# Bug reported - switch context immediately (no checkout!)
but branch new bugfix-login-timeout
echo "Fix timeout" > login.ts
but rub <id> bugfix-login-timeout

# Both exist in same workspace
but status
# Shows both branches with their respective files

# Commit bugfix first (urgent)
but commit bugfix-login-timeout -m "fix: resolve login timeout"

# Continue feature work
echo "More dashboard" >> dashboard.ts
but commit feature-dashboard -m "feat: add dashboard"

# Push bugfix immediately, feature when ready
git push origin bugfix-login-timeout
gh pr create --title "fix: resolve login timeout" --body "Urgent bugfix"
```

---

## Reorganizing Work

### Moving Commits Between Branches

**Scenario**: Committed work to wrong branch.

```bash
# Initial state - oops, committed to wrong branch!
but log
# Shows def5678 "feat: add new feature" on bugfix-branch

# Create correct branch
but branch new feature-new-capability

# Move the commit
but rub def5678 feature-new-capability

# Result - commit moved!
but log
# def5678 now on feature-new-capability
```

### Squashing Multiple Small Commits

**Scenario**: Made many small commits, want to combine into one.

```bash
# Initial state - too many commits
but log
# Shows c3d4e5f, c2d3e4f, c1d2e3f on feature-branch

# Squash docs into tests (newer into older)
but rub c3d4e5f c2d3e4f

# Result - commits combined
```

### Post-Hoc File Assignment

**Scenario**: Wrote code first, organize into branches after.

```bash
# Made changes without branches
echo "Auth code" > auth.ts
echo "API code" > api.ts
echo "Docs" > README.md

but status
# Shows all files in Unassigned Changes

# Realize they should be separate branches
but branch new feature-auth
but branch new feature-api
but branch new docs-update

# Assign files to respective branches
but rub m6 feature-auth
but rub p9 feature-api
but rub i3 docs-update

# Commit each
but commit feature-auth -m "feat: add authentication"
but commit feature-api -m "feat: add API endpoints"
but commit docs-update -m "docs: update readme"

# Three independent branches from one coding session!
```

---

## Multi-Agent Patterns

### Pattern 1: Parallel Feature Development

**Scenario**: Two AI agents working on different features concurrently.

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

### Pattern 2: Sequential Handoffs

**Scenario**: Agent A starts work, Agent B continues it.

```bash
# Agent A: Initial implementation
but branch new feature-user-management
echo "Initial user code" > user.ts
but rub <id> feature-user-management
but commit feature-user-management -m "feat: initial user management"

# Agent A hands off to Agent B
# Create new branch for continuation
but branch new feature-user-management-tests --anchor feature-user-management

# Agent B: Adds tests and improvements
echo "Tests for user management" > user.test.ts
but rub <id> feature-user-management-tests
but commit feature-user-management-tests -m "test: add user management tests"
```

### Pattern 3: Cross-Agent Commit Transfer

**Scenario**: Agent A finishes, Agent B takes ownership.

```bash
# Agent A finishes work
but branch new agent-a-feature
but commit agent-a-feature -m "feat: implementation complete"

# Agent B creates their branch
but branch new agent-b-continuation

# Transfer commit from A to B
but rub abc1234 agent-b-continuation

# Agent B continues from there
echo "More work" >> feature.ts
but commit agent-b-continuation -m "feat: continue implementation"
```

---

## Stack Management

### Creating a Linear Stack

**Scenario**: Break large feature into reviewable chunks.

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
# Shows three-level stack

# Submit as stack (using gh CLI)
git push origin refactor-database
gh pr create --title "refactor: database layer" --base main

git push origin feature-new-model
gh pr create --title "feat: new data model" --base refactor-database

git push origin test-new-model
gh pr create --title "test: model tests" --base feature-new-model
```

---

## Emergency Recovery

### Recovering from Accidental Deletion

```bash
# Oops, deleted wrong branch
but branch delete important-feature --force

# Oh no! Check oplog
but oplog

# Undo deletion
but undo

# Verify recovery
but log
# Branch recovered!
```

### Recovering from Bad Reorganization

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

### Recovering from Mixed Git/But Commands

**Scenario**: Accidentally used `git commit` on virtual branch.

```bash
# Made changes on virtual branch
but branch new my-feature
echo "changes" > file.ts

# Accidentally used git
git add file.ts
git commit -m "oops"  # ❌ WRONG

# Recovery attempt 1: Update base
but base update

# If still broken, reinitialize
but snapshot --message "Before recovery"
but init

# Learn: NEVER mix git and but commands!
```

---

## Tips and Best Practices

### Naming Conventions

**Agent-based naming**:
```bash
# Format: <agent-name>-<task-type>-<description>
but branch new claude-feat-user-auth
but branch new droid-fix-api-timeout
```

**Task-based naming**:
```bash
# Format: <task-type>-<description>
but branch new feature-authentication
but branch new bugfix-timeout
```

### Snapshot Cadence

**Before risky operations**:
```bash
but snapshot --message "Before major reorganization"
but snapshot --message "Before multi-agent coordination"
but snapshot --message "Before complex stack changes"
```

### File Assignment Discipline

**Immediate assignment**:
```bash
# Good: Assign immediately after creating
echo "code" > file1.ts
but rub <id> my-branch  # Assign right away
```

### Using JSON Output Effectively

```bash
# Get all branch names
but --json log | jq '.[0].branchDetails[] | .name'

# Check push status
but --json log | jq '.[0].branchDetails[] | {name, pushStatus}'

# Find unpushed branches
but --json log | jq '.[0].branchDetails[] | select(.pushStatus != "fullyPushed") | .name'
```
