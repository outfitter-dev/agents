# Slash Command Examples

Real-world examples of Claude Code slash commands for various workflows.

## Table of Contents

1. [Git Workflows](#git-workflows)
2. [Testing & QA](#testing--qa)
3. [Deployment](#deployment)
4. [Code Review](#code-review)
5. [Documentation](#documentation)
6. [Project Management](#project-management)
7. [Development Workflows](#development-workflows)
8. [Team Collaboration](#team-collaboration)

## Git Workflows

### Create Feature Branch

`.claude/commands/git/feature.md`:

```markdown
---
description: Create feature branch from issue number
argument-hint: <issue-number>
allowed-tools: Bash(git *), Bash(gh *)
---

# Feature Branch Creation

Issue: #$1

## Issue Details
!`gh issue view $1 --json title,body,labels | jq -r '"Title: \(.title)\nLabels: \(.labels | map(.name) | join(", "))"'`

## Current State
Branch: !`git branch --show-current`
Status: !`git status --short`

## Action Plan

1. Ensure working directory is clean
2. Pull latest changes from main
3. Create feature branch: `feature/$1`
4. Update issue with branch link

Proceed with branch creation and link it to issue #$1.
```

### Commit Staged Changes

`.claude/commands/git/commit.md`:

```markdown
---
description: Create commit from staged changes with conventional format
allowed-tools: Bash(git *)
---

# Create Commit

## Repository Context
Branch: !`git branch --show-current`
Remote: !`git remote get-url origin | sed 's/.*[:/]\(.*\)\.git$/\1/'`

## Staged Changes
!`git diff --staged --stat`

## Detailed Diff
!`git diff --staged`

## Recent Commits (for style reference)
!`git log --oneline -5`

## Task

Create a commit following these guidelines:

1. **Format**: `type(scope): description`
2. **Types**: feat, fix, docs, style, refactor, test, chore
3. **Description**: Imperative mood, no period, max 50 chars
4. **Body**: Explain what and why, not how

Generate the commit message and execute the commit.
```

### Interactive Rebase

`.claude/commands/git/rebase-interactive.md`:

```markdown
---
description: Interactive rebase with commit selection
argument-hint: [number-of-commits]
allowed-tools: Bash(git *)
disable-model-invocation: true
---

# Interactive Rebase

## Recent Commits
!`git log --oneline -${1:-10}`

## Branch Status
!`git status`

## Warnings

⚠️ **This will rewrite history**
- Don't rebase commits that have been pushed
- Only rebase local commits
- Make sure working directory is clean

## Instructions

I'll guide you through interactive rebase of the last ${1:-10} commits:

1. Show commit list above
2. Ask which commits to squash/reword/drop
3. Explain the plan
4. Wait for your explicit approval
5. Execute rebase with instructions

What would you like to do with these commits?
```

## Testing & QA

### Run Test Suite

`.claude/commands/test/run-all.md`:

```markdown
---
description: Run complete test suite with coverage
allowed-tools: Bash(bun *), Bash(npm *)
---

# Test Suite Execution

## Pre-flight Check
Node version: !`node --version`
Package manager: !`command -v bun >/dev/null && echo "bun" || echo "npm"`

## Run Tests
!`bun test 2>&1 || npm test 2>&1`

## Analysis

Review the test results above:

1. **If all passed**: Summarize coverage and any warnings
2. **If failures**:
   - List failed tests
   - Show failure details
   - Suggest potential fixes
   - Offer to investigate specific failures

3. **Coverage gaps**: Identify untested code paths

What would you like me to help with?
```

### Debug Failing Test

`.claude/commands/test/debug.md`:

```markdown
---
description: Debug specific failing test
argument-hint: <test-file-or-name>
allowed-tools: Read, Bash(bun *), Bash(npm *)
---

# Test Debugging

Test: $1

## Run Specific Test
!`bun test --filter "$1" 2>&1 || npm test -- "$1" 2>&1`

## Test File Content
!`find . -name "*$1*" -type f | head -1 | xargs cat 2>/dev/null || echo "Test file not found"`

## Related Source Files
!`find . -name "*$1*" -type f | sed 's/\.test\././' | head -1 | xargs cat 2>/dev/null || echo "Source file not found"`

## Analysis

Based on the test failure and code above:

1. Identify the root cause
2. Explain why the test is failing
3. Suggest fixes
4. Show code changes needed

Would you like me to implement the fix?
```

### Test Coverage Report

`.claude/commands/test/coverage.md`:

```markdown
---
description: Generate and analyze test coverage report
allowed-tools: Bash(bun *), Bash(npm *), Read
---

# Test Coverage Analysis

## Generate Coverage
!`bun test --coverage 2>&1 || npm test -- --coverage 2>&1`

## Coverage Summary
!`cat coverage/coverage-summary.json 2>/dev/null | jq '.total' 2>/dev/null || echo "Coverage report not found"`

## Uncovered Files
!`find src -name "*.ts" -o -name "*.tsx" | while read f; do grep -q "$f" coverage/lcov.info 2>/dev/null || echo "$f"; done | head -20`

## Analysis

Review coverage report:

1. **Overall coverage**: Are we meeting targets (>80%)?
2. **Critical gaps**: Which important files lack coverage?
3. **Priority**: What should be tested first?
4. **Recommendations**: Specific tests to add

Shall I help write tests for uncovered code?
```

## Deployment

### Deploy to Environment

`.claude/commands/deploy/to-env.md`:

```markdown
---
description: Deploy to specified environment with validation
argument-hint: <environment> [--skip-tests]
allowed-tools: Bash(*), Read
disable-model-invocation: true
---

# Deployment Pipeline

Environment: $1
Options: $2

## Pre-flight Checks

### Environment Validation
!`case "$1" in
  development|dev) echo "✓ Valid: Development" ;;
  staging|stage) echo "✓ Valid: Staging" ;;
  production|prod) echo "⚠️ Valid: PRODUCTION" ;;
  *) echo "❌ Invalid environment: $1"; exit 1 ;;
esac`

### Prerequisites
Docker: !`docker --version 2>&1 | head -1`
kubectl: !`kubectl version --client --short 2>&1`
Context: !`kubectl config current-context 2>&1`

### Test Status
!`if [[ "$2" != *"--skip-tests"* ]]; then bun test 2>&1 | tail -1; else echo "Tests skipped"; fi`

## Deployment Plan

Based on validation above:

1. **Tests**: $([[ "$2" == *"--skip-tests"* ]] && echo "Skipped" || echo "Must pass")
2. **Docker**: Build image with tag `$1-$(git rev-parse --short HEAD)`
3. **Registry**: Push to container registry
4. **Kubernetes**: Deploy to `$1` cluster
5. **Health Check**: Verify pods are healthy
6. **Notification**: Post to Slack #deployments

⚠️ **STOP HERE** - This requires explicit approval to proceed.

Type "approved" to continue with deployment.
```

### Rollback Deployment

`.claude/commands/deploy/rollback.md`:

```markdown
---
description: Rollback to previous deployment
argument-hint: <environment>
allowed-tools: Bash(kubectl *), Bash(git *)
disable-model-invocation: true
---

# Deployment Rollback

Environment: $1

## Current State
!`kubectl get deployments -n $1 -o wide`

## Recent Deployments
!`kubectl rollout history deployment/app -n $1`

## Last Known Good
!`git log --oneline --grep="deploy.*$1" -5`

## Rollback Plan

⚠️ **CRITICAL OPERATION**

This will:
1. Rollback Kubernetes deployment to previous revision
2. Verify pods are healthy
3. Update monitoring
4. Post incident notification

**Requires approval to proceed.**

Are you sure you want to rollback $1?
```

## Code Review

### Review PR

`.claude/commands/review/pr.md`:

```markdown
---
description: Comprehensive PR review with checklist
argument-hint: <pr-number>
allowed-tools: Bash(gh *), Read, Grep
---

# PR Review

PR: #$1

## PR Details
!`gh pr view $1 --json title,body,author,additions,deletions,files | jq -r '"Title: \(.title)\nAuthor: \(.author.login)\nStats: +\(.additions)/-\(.deletions) lines\nFiles: \(.files | length)"'`

## Changed Files
!`gh pr diff $1 --name-only`

## Full Diff
!`gh pr diff $1`

## Review Checklist

### 1. Code Quality
- [ ] Clear variable and function names
- [ ] No unnecessary complexity
- [ ] DRY principle followed
- [ ] Consistent with codebase style

### 2. Functionality
- [ ] Changes match PR description
- [ ] Edge cases handled
- [ ] Error handling adequate
- [ ] No obvious bugs

### 3. Tests
- [ ] Tests included for new features
- [ ] Tests cover edge cases
- [ ] Existing tests still pass
- [ ] No test code in production

### 4. Security
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] Dependencies vetted

### 5. Performance
- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] No unnecessary API calls
- [ ] Proper caching where appropriate

### 6. Documentation
- [ ] Code comments where necessary
- [ ] Public APIs documented
- [ ] README updated if needed
- [ ] Breaking changes noted

## Review

Conduct detailed review based on checklist above. For each issue found:
1. Specify file and line number
2. Explain the concern
3. Suggest improvement
4. Rate severity (critical/major/minor/nitpick)

Provide summary of findings and recommendation (approve/request changes/comment).
```

### Security Audit

`.claude/commands/review/security.md`:

```markdown
---
description: Security-focused code review
allowed-tools: Read, Grep, Glob, Bash(git *)
---

# Security Audit

## Changed Files (Last Commit)
!`git diff --name-only HEAD~1..HEAD`

## Full Changes
!`git diff HEAD~1..HEAD`

## Security Checklist

### 1. Authentication & Authorization
- [ ] Authentication required for protected resources
- [ ] Authorization checks before sensitive operations
- [ ] Session management secure
- [ ] No hardcoded credentials

### 2. Input Validation
- [ ] All user input validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Command injection prevention
- [ ] Path traversal prevention

### 3. Data Protection
- [ ] Sensitive data encrypted
- [ ] No secrets in code
- [ ] Secure data transmission (HTTPS)
- [ ] Proper error messages (no data leaks)

### 4. Dependencies
- [ ] Dependencies up to date
- [ ] No known vulnerabilities
- [ ] Minimal dependency usage
- [ ] Dependencies from trusted sources

### 5. API Security
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] API keys secured
- [ ] Request size limits

### 6. File Operations
- [ ] File uploads validated
- [ ] File types restricted
- [ ] File size limits
- [ ] Safe file processing

## Audit

Conduct thorough security review focusing on:
1. Common vulnerabilities (OWASP Top 10)
2. Language-specific issues
3. Framework security features
4. Configuration security

For each issue:
- Severity: Critical/High/Medium/Low
- Description: What's vulnerable
- Impact: Potential consequences
- Remediation: How to fix

Provide executive summary with risk assessment.
```

## Documentation

### Generate API Docs

`.claude/commands/docs/api.md`:

```markdown
---
description: Generate API documentation from code
argument-hint: <file-or-directory>
allowed-tools: Read, Glob
---

# API Documentation Generation

Target: $1

## Files to Document
!`find $1 -name "*.ts" -o -name "*.tsx" | grep -v ".test." | head -20`

## Source Code
!`find $1 -name "*.ts" -o -name "*.tsx" | grep -v ".test." | head -5 | xargs cat`

## Generate Documentation

For each public function/class/interface:

### Format

#### `functionName(params): ReturnType`

**Description**: What it does

**Parameters**:
- `param1` (`Type`): Description
- `param2` (`Type`, optional): Description

**Returns**: `ReturnType` - Description

**Example**:
```typescript
// Usage example
const result = functionName(arg1, arg2);
```

**Throws**:
- `ErrorType`: When this error occurs

**See Also**: Related functions

---

Generate comprehensive API documentation for all public interfaces.

```

### Update README

`.claude/commands/docs/readme.md`:
```markdown
---
description: Update README with current project state
allowed-tools: Read, Write, Bash(*)
---

# README Update

## Current README
@README.md

## Project Analysis

### Dependencies
!`cat package.json | jq -r '.dependencies | keys[]' 2>/dev/null | head -10`

### Scripts
!`cat package.json | jq -r '.scripts | to_entries[] | "\(.key): \(.value)"' 2>/dev/null`

### Project Structure
!`tree -L 2 -d -I node_modules 2>/dev/null || find . -type d -maxdepth 2 -not -path '*/\.*' | head -20`

### Recent Changes
!`git log --oneline --since="1 month ago" | wc -l | xargs echo "Commits in last month:"`

## Update Plan

Review current README and project state. Update sections:

1. **Description**: Ensure accurate and compelling
2. **Installation**: Match current dependencies
3. **Usage**: Include all available scripts
4. **API**: Document main interfaces
5. **Project Structure**: Reflect current organization
6. **Contributing**: Update guidelines if needed
7. **License**: Verify correctness

Generate updated README maintaining existing style.
```

## Project Management

### Sprint Summary

`.claude/commands/project/sprint-summary.md`:

```markdown
---
description: Generate sprint summary from git and issue tracker
allowed-tools: Bash(git *), Bash(gh *)
---

# Sprint Summary

## Git Activity

### Commits This Sprint
!`git log --since="2 weeks ago" --pretty=format:"%h %s (%an)" --no-merges`

### Contributors
!`git log --since="2 weeks ago" --pretty=format:"%an" --no-merges | sort | uniq -c | sort -rn`

### File Changes
!`git diff --stat $(git log --since="2 weeks ago" --pretty=format:"%H" | tail -1)..HEAD | tail -1`

## Issues & PRs

### Closed Issues
!`gh issue list --state closed --limit 20 --json number,title,closedAt --search "closed:>=$(date -d '2 weeks ago' +%Y-%m-%d)" | jq -r '.[] | "#\(.number): \(.title)"'`

### Merged PRs
!`gh pr list --state merged --limit 20 --json number,title,mergedAt | jq -r '.[] | "#\(.number): \(.title)"'`

### Open Items
!`gh issue list --state open --json number,title,labels | jq -r '.[] | "#\(.number): \(.title) [\(.labels | map(.name) | join(", "))]"'`

## Summary

Generate sprint summary including:

1. **Highlights**: Major achievements
2. **Metrics**:
   - Commits, PRs, issues
   - Contributors
   - Lines changed
3. **Completed**: List closed issues/PRs
4. **In Progress**: Current work
5. **Blockers**: Impediments
6. **Next Sprint**: Priorities

Format for team meeting presentation.
```

### Create Issue from Bug

`.claude/commands/project/bug-report.md`:

```markdown
---
description: Create detailed bug report issue
argument-hint: <bug-description>
allowed-tools: Bash(git *), Bash(gh *), Read
---

# Bug Report Creation

Description: $ARGUMENTS

## Environment
Node: !`node --version`
OS: !`uname -a`
Branch: !`git branch --show-current`
Commit: !`git rev-parse HEAD`

## Template

Create GitHub issue with:

**Title**: 🐛 $ARGUMENTS

**Body**:
## Description
[Clear description of the bug]

## Steps to Reproduce
1.
2.
3.

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Node: [version]
- OS: [os]
- Branch: [branch]
- Commit: [commit]

## Logs/Screenshots
[Any relevant logs or screenshots]

## Possible Fix
[Optional: Suggest a fix]

---

Review template and create issue with appropriate labels (bug, priority).
```

## Development Workflows

### New Feature Setup

`.claude/commands/dev/new-feature.md`:

```markdown
---
description: Set up complete feature development workflow
argument-hint: <feature-name>
allowed-tools: Bash(git *), Write, Bash(gh *)
---

# New Feature Setup

Feature: $1

## Step 1: Issue Creation

Create feature issue:
!`gh issue create --title "feat: $1" --body "Feature implementation for $1" --label "enhancement" | grep -o "https://.*"`

## Step 2: Branch Creation
!`git checkout main && git pull && git checkout -b feature/$1`

## Step 3: Feature Structure

Create feature files:

**Implementation**: `src/features/$1/index.ts`
**Tests**: `src/features/$1/$1.test.ts`
**Types**: `src/features/$1/types.ts`
**README**: `src/features/$1/README.md`

## Step 4: Development Plan

1. Define interfaces and types
2. Write tests (TDD approach)
3. Implement feature
4. Add documentation
5. Review and refactor

Generate initial file structure with TODOs?
```

### Refactor Code

`.claude/commands/dev/refactor.md`:

```markdown
---
description: Safe refactoring with tests
argument-hint: <file-to-refactor>
allowed-tools: Read, Edit, Bash(bun test*)
---

# Code Refactoring

Target: $1

## Current Implementation
@$1

## Tests
!`find . -name "$(basename $1 .ts).test.ts" -o -name "$(basename $1 .tsx).test.tsx" | xargs cat 2>/dev/null`

## Refactoring Plan

1. **Analysis**: Review current code
   - Identify code smells
   - Find duplication
   - Spot complexity

2. **Tests**: Ensure coverage
   - Run existing tests: !`bun test --filter "$(basename $1 .ts)"`
   - Add missing tests if needed

3. **Refactor**: Improve code
   - Extract functions
   - Simplify logic
   - Improve naming
   - Add types

4. **Verify**: Run tests again
   - Ensure behavior unchanged
   - Check performance
   - Review changes

Proceed with analysis and refactoring plan?
```

## Team Collaboration

### Onboarding Checklist

`.claude/commands/team/onboard.md`:

```markdown
---
description: Generate onboarding checklist for new team member
allowed-tools: Read, Bash(*)
---

# Team Onboarding

## Repository Setup

### Prerequisites
- [ ] Git installed: !`git --version`
- [ ] Node/Bun installed: !`bun --version 2>/dev/null || node --version`
- [ ] Docker installed: !`docker --version`
- [ ] IDE setup: VS Code with recommended extensions

### Repository
- [ ] Clone repository
- [ ] Install dependencies: `bun install`
- [ ] Copy `.env.example` to `.env`
- [ ] Configure local environment
- [ ] Run tests: `bun test`
- [ ] Start dev server: `bun dev`

## Project Knowledge

### Architecture
@docs/ARCHITECTURE.md

### Contributing
@CONTRIBUTING.md

### Code Style
- [ ] Review ESLint config
- [ ] Install pre-commit hooks
- [ ] Read style guide

## Team Access

- [ ] GitHub: Add to organization
- [ ] Slack: Join channels (#dev, #deploys)
- [ ] CI/CD: Configure access
- [ ] Documentation: Share wiki access
- [ ] Meetings: Add to calendar invites

## First Tasks

- [ ] Review open issues
- [ ] Pick "good first issue"
- [ ] Create PR with small change
- [ ] Attend team standup

Generate personalized onboarding plan?
```

### Pair Programming Session

`.claude/commands/team/pair.md`:

```markdown
---
description: Start pair programming session with context
argument-hint: <task-description>
disable-model-invocation: true
---

# Pair Programming Session

Task: $ARGUMENTS

## Session Setup

Navigator: Human
Driver: Claude

## Current Context

Branch: !`git branch --show-current`
Status: !`git status --short`
Recent work: !`git log --oneline -5`

## Session Goals

Based on "$ARGUMENTS", let's:

1. **Plan**: Break down the task
2. **Design**: Discuss approach
3. **Implement**: Write code together
4. **Test**: Verify functionality
5. **Review**: Refactor and improve

## Ground Rules

- Navigator guides direction
- Driver implements details
- Switch roles as needed
- Discuss trade-offs
- Test continuously

Ready to start? What's the first step?
```

## Community Command Collections

These community repositories contain production-ready slash commands:

### [wshobson/commands](https://github.com/wshobson/commands)

57 production-ready commands organized as workflows and tools:
- `/workflows:feature-development` - End-to-end implementation
- `/workflows:tdd-cycle` - Test-driven development
- `/tools:security-scan` - Vulnerability assessment
- `/tools:refactor-clean` - Code cleanup

### [Claude Command Suite](https://github.com/qdhenry/Claude-Command-Suite)

148+ commands with namespace organization:
- `/dev:*` - Development utilities
- `/test:*` - Testing infrastructure
- `/security:*` - Security auditing
- `/deploy:*` - Deployment automation

### [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)

Curated collection featuring:
- `/commit` - Conventional commit automation
- `/context-prime` - Project context initialization
- `/catchup` - Reload work after `/clear`

## Standout Community Patterns

### Context Priming

From the community - load project context after clearing:

```markdown
---
description: Prime context with project structure
---

## Project Structure
!`tree -L 2 -I 'node_modules|.git|dist'`

## Configuration
@package.json
@tsconfig.json

## Recent Work
!`git log --oneline -10`

Ready to continue development.
```

### Fast Commit

Auto-select first commit suggestion without confirmation:

```markdown
---
description: Quick commit - auto-select first suggestion
allowed-tools: Bash(git *)
disable-model-invocation: true
---

!`git diff --staged --stat`
!`git log --oneline -3`

Generate a commit message and execute immediately.
Pick the most appropriate message without asking.
```

### Catchup After Clear

Reload uncommitted work into fresh context:

```markdown
---
description: Reload work-in-progress after /clear
allowed-tools: Bash(git *)
---

## Uncommitted Changes
!`git diff`

## Unstaged Files
!`git status --short`

## Recent Commits
!`git log --oneline -5`

Continue working with the context above.
```

## See Also

- [SKILL.md](SKILL.md) - Slash command authoring guide
- [REFERENCE.md](REFERENCE.md) - Complete reference
- [references/community.md](references/community.md) - Full community resources
- [scripts/](scripts/) - Utility scripts
