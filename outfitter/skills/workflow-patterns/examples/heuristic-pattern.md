# Heuristic Pattern Example: PR Size Optimization

This example demonstrates how to identify, specify, and implement a heuristic pattern.

## Pattern Identification

### Evidence from Conversation

**User observation**:
> "Our PRs keep getting stuck in review. Sometimes they sit for days before anyone looks at them. When they do get reviewed, the feedback is often superficial."

**Agent investigation**:
1. Analyzed recent PRs: Average size was 450 LOC, some exceeded 1,000 LOC
2. Reviewed feedback quality: Large PRs (>300 LOC) received 2.3 comments on average vs 8.7 for small PRs (<200 LOC)
3. Checked merge time: Large PRs took 4.2 days average vs 1.1 days for small PRs

**Pattern observed**: PR size directly correlates with review quality and merge speed. Need decision rule for when to split PRs.

**User confirmation**:
> "That makes sense. How do we decide when a PR is too large?"

**Agent response**:
> "Based on research and your team's data, I recommend:
> - Ideal: 100-250 LOC
> - Acceptable: 250-300 LOC
> - Must split: 300+ LOC (unless mechanical changes)
>
> This heuristic optimizes for reviewer attention span and thoughtful feedback."

### Pattern Type Classification

**Type**: Heuristic (decision rule with contextual exceptions)

**Why not workflow?**: Not a multi-step process, but a guideline for making decisions
**Why not orchestration?**: Not coordinating tools, but providing decision framework

## Pattern Specification

```yaml
name: pr-size-optimization
title: Pull Request Size Optimization
type: heuristic
description: Decision framework for determining optimal PR size to maximize review quality and merge speed while accounting for legitimate exceptions.

condition: Preparing to create pull request from local changes
action: Evaluate PR size and recommend splitting if over threshold

rationale: |
  Large PRs suffer from:
  - Reviewer fatigue (attention span limits)
  - Superficial feedback (too much to review thoroughly)
  - Longer time-to-merge (reviewers avoid large PRs)
  - Higher defect rates (important issues missed)

  Research shows:
  - PRs under 250 LOC get reviewed 60% faster
  - PRs under 250 LOC receive 3x more substantive comments
  - Best practice: 200 LOC as sweet spot

thresholds:
  ideal_min: 50    # Below this, might be incomplete
  ideal_max: 250   # Optimal for thorough review
  acceptable: 300  # Yellow zone - consider splitting
  warning: 500     # Red zone - strongly recommend splitting
  must_split: 800  # Should never exceed without exception

calculation: |
  Effective LOC = Total changed lines - Mechanical changes

  Mechanical changes (exclude from count):
  - Auto-generated code (package-lock.json, yarn.lock, Cargo.lock)
  - Formatting-only changes (whitespace, indentation)
  - Batch renames (same change across many files)
  - Code moves (file relocations without logic changes)
  - Schema migrations (auto-generated SQL/DDL)

recommendations:
  - if: effective_loc < 50
    severity: info
    message: "PR seems small. Consider if it's complete or should include more context."
    action: optional

  - if: effective_loc >= 50 and effective_loc <= 250
    severity: success
    message: "PR size is ideal for thorough review."
    action: proceed

  - if: effective_loc > 250 and effective_loc <= 300
    severity: warning
    message: "PR is approaching upper limit. Consider splitting if natural boundaries exist."
    action: review_for_split

  - if: effective_loc > 300 and effective_loc <= 500
    severity: warning
    message: "PR is large. Strongly recommend splitting into stacked PRs."
    action: recommend_split
    help: "Look for logical boundaries: separate commits, feature phases, refactor vs feature."

  - if: effective_loc > 500
    severity: error
    message: "PR is too large for effective review. Must split unless exceptional circumstances."
    action: must_split
    exceptions_note: "Only proceed if this is mechanical changes, emergency hotfix, or approved by team lead."

exceptions:
  mechanical_changes:
    description: "Auto-generated or formatting-only changes"
    examples:
      - Package lockfiles (package-lock.json, Cargo.lock)
      - Database migrations (if auto-generated)
      - Formatting fixes (prettier, rustfmt across codebase)
      - Batch renames (variable/function rename via IDE)
    action: "Isolate in separate PR or commit, mark as mechanical"

  emergency_hotfix:
    description: "Production incident requiring immediate fix"
    examples:
      - Security vulnerability patch
      - Data loss prevention
      - Service outage fix
    action: "Proceed with large PR, but plan follow-up split for review"
    note: "After emergency, create follow-up PRs to properly review changes"

  approved_exception:
    description: "Team lead approves large PR for specific reason"
    examples:
      - Major refactoring that can't be split logically
      - Third-party library integration with extensive changes
      - Architectural migration requiring atomic change
    action: "Document exception reason in PR description"
    requirement: "Explicit approval in PR description or comments"

splitting_strategies:
  logical_phases:
    description: "Split by implementation phases"
    example: |
      PR 1: Database schema changes
      PR 2: Backend API implementation
      PR 3: Frontend UI changes
      PR 4: Tests and documentation

  commit_boundaries:
    description: "Each commit becomes separate PR in stack"
    example: |
      PR 1: Add user authentication (commit 1)
      PR 2: Add session management (commit 2)
      PR 3: Add logout functionality (commit 3)
    tool: "Use Graphite (gt) for stacked PRs"

  refactor_vs_feature:
    description: "Separate preparatory refactoring from feature work"
    example: |
      PR 1: Refactor auth module for extensibility
      PR 2: Add OAuth provider using refactored module

  by_component:
    description: "Split by architectural component"
    example: |
      PR 1: Auth service changes
      PR 2: User service changes
      PR 3: API gateway changes

validation:
  - Count effective LOC (excluding mechanical)
  - Identify natural split boundaries
  - Verify each split PR is independently reviewable
  - Ensure dependencies are clear (PR stack order)
  - Check that splits don't create broken intermediate states
```

## Component Recommendation

### Analysis

**Invocation**: Could be user-invoked (manual check) or event-triggered (pre-push hook)

**Automation**: Partially automatable
- LOC counting: Fully automatable
- Mechanical change detection: Mostly automatable (pattern matching)
- Split decision: Requires human judgment
- Exception evaluation: Requires context and approval

**Decision**: SKILL + HOOK (composite pattern)

### Rationale

This is a **Skill + Hook composite** because:

**SKILL component**:
- Provides guidance on PR size thresholds
- Explains rationale for limits
- Teaches splitting strategies
- Helps evaluate exceptions
- Requires judgment on split boundaries

**HOOK component**:
- Automatically checks PR size on pre-push
- Warns if over threshold
- Can block push (configurable)
- Provides immediate feedback

**Not just a Command** because: Requires teaching/guidance beyond simple execution

**Not an Agent** because: General engineering practice, not specialized domain

### Composite Structure

```
SKILL: pr-size-optimization
  - Explains thresholds and rationale
  - Teaches splitting strategies
  - Provides exception guidelines

HOOK: pre-push validation
  - Automatically checks LOC count
  - Warns or blocks based on size
  - References SKILL for guidance

COMMAND: /check-pr-size
  - Manual PR size check during development
  - Shows current LOC and recommendation
  - Helps plan splits before committing
```

## Generated Component Structure

### File Structure

```
skills/
  pr-size-optimization/
    SKILL.md                    # Main guidance
    examples/
      splitting-strategies.md   # How to split effectively
      exceptions.md             # Valid exception cases
    references/
      research.md               # Studies on PR size impact
      metrics.md                # Team-specific data

hooks/
  pre-push/
    check-pr-size.sh           # Automatic validation

commands/
  check-pr-size.md             # Manual size check

scripts/
  pr-size/
    count-effective-loc.sh     # LOC counter (excludes mechanical)
    detect-mechanical.sh       # Identify auto-generated changes
    suggest-splits.sh          # Analyze for split boundaries
```

### SKILL.md (excerpt)

```markdown
---
name: pr-size-optimization
description: Provides decision framework for optimal PR sizing to maximize review quality and merge speed. Use when preparing PRs, planning work breakdown, or evaluating if changes should be split. Includes thresholds, exceptions, and splitting strategies.
---

# PR Size Optimization

Keep PRs small to get faster, higher-quality reviews.

## Quick Reference

**Ideal**: 100-250 LOC → Ship it
**Acceptable**: 250-300 LOC → Consider splitting
**Large**: 300-500 LOC → Strongly recommend splitting
**Too Large**: 500+ LOC → Must split (exceptions rare)

## Why Size Matters

### Review Quality

Small PRs get better reviews:
- Reviewers have time and energy to be thorough
- All code gets careful attention
- More substantive feedback
- Edge cases and bugs caught

Large PRs get superficial reviews:
- Reviewers feel overwhelmed
- Skim rather than study
- Miss important issues
- Give generic feedback ("LGTM")

### Merge Speed

**Data from your team** (last 90 days):

| Size | Avg Review Time | Avg Comments | Defect Rate |
|------|----------------|--------------|-------------|
| <200 LOC | 1.1 days | 8.7 | 2.3% |
| 200-300 LOC | 1.8 days | 5.2 | 4.1% |
| 300-500 LOC | 3.4 days | 3.1 | 8.7% |
| 500+ LOC | 5.2 days | 2.3 | 14.2% |

Small PRs merge **5x faster** than large ones.

## Calculating Effective LOC

Not all changed lines count equally.

### Include in Count

- New code (logic, features)
- Modified code (refactoring, fixes)
- Deleted code (removals)
- Test code (counts fully)
- Documentation (counts fully)

### Exclude from Count

**Auto-generated**:
- `package-lock.json`, `yarn.lock`, `Cargo.lock`, `go.sum`
- Database migrations (if tool-generated)
- Protobuf/GraphQL generated code
- Build artifacts

**Mechanical**:
- Formatting-only changes (prettier, rustfmt)
- Whitespace adjustments
- Batch renames (same change across files)
- File moves without logic changes

### Example Calculation

```diff
Total changes: 487 LOC

Breakdown:
- src/**/*.ts: 245 LOC (feature code)
- tests/**/*.ts: 89 LOC (test code)
- package-lock.json: 143 LOC (auto-generated)
- README.md: 10 LOC (docs)

Effective LOC = 245 + 89 + 10 = 344 LOC
(Exclude package-lock.json)

Recommendation: SPLIT (over 300 LOC threshold)
```

## Decision Framework

### Step 1: Calculate Effective LOC

Use `/check-pr-size` command or pre-push hook:

```bash
$ /check-pr-size

Analyzing PR size...

Total changed lines: 487
Mechanical changes: 143 (package-lock.json)
Effective LOC: 344

Status: ⚠️ LARGE - Recommend splitting

Suggested split points:
  1. After commit "Add user model" (123 LOC)
  2. After commit "Add auth endpoints" (221 LOC)
```

### Step 2: Evaluate Threshold

- **0-50 LOC**: Might be too small, ensure completeness
- **50-250 LOC**: ✅ Ideal, proceed
- **250-300 LOC**: ⚠️ Consider splitting if natural boundaries exist
- **300-500 LOC**: ⚠️ Strongly recommend splitting
- **500+ LOC**: 🛑 Must split (exceptions require approval)

### Step 3: Check for Exceptions

Valid reasons to exceed threshold:

**1. Mechanical changes**
```
Example: Renamed `userId` to `userID` across 45 files
Action: Isolate in separate "mechanical" commit/PR
```

**2. Emergency hotfix**
```
Example: Security vulnerability requires immediate patch
Action: Proceed, but plan follow-up review PRs
```

**3. Approved exception**
```
Example: Database migration requires atomic schema + code changes
Action: Get explicit approval, document in PR description
```

If no valid exception applies: **Must split**

### Step 4: Choose Splitting Strategy

See [Splitting Strategies](examples/splitting-strategies.md) for details.

**Quick guide**:
- **By phase**: Schema → Backend → Frontend → Tests
- **By commit**: One PR per commit in your stack
- **By component**: Separate PRs for each service/module
- **Refactor first**: Preparatory refactoring, then feature

## Splitting Strategies

### Strategy 1: Stacked PRs by Commit

Each commit becomes a PR in a stack.

**Before** (single large PR):
```
feat: add user authentication (487 LOC)
  - Add user model and database schema
  - Add authentication endpoints
  - Add session management
  - Add login UI
```

**After** (stacked PRs):
```
PR #1: feat: add user model (123 LOC)
  - User model and schema
  - Database migrations

PR #2: feat: add auth endpoints (108 LOC, based on PR #1)
  - Login/logout endpoints
  - Token generation

PR #3: feat: add session management (89 LOC, based on PR #2)
  - Session storage
  - Session middleware

PR #4: feat: add login UI (124 LOC, based on PR #3)
  - Login form component
  - Authentication hooks
```

**Tool**: Use Graphite (`gt`) for stacked PRs:
```bash
# Create first PR
gt create -m "feat: add user model"
gt submit

# Create second PR (stacked on first)
gt create -m "feat: add auth endpoints"
gt submit --stack
```

### Strategy 2: Refactor Then Feature

Separate preparatory work from feature implementation.

**Before** (mixed refactoring and feature):
```
feat: add OAuth support (412 LOC)
  - Refactor auth module for extensibility
  - Add OAuth provider interface
  - Implement GitHub OAuth
  - Update login flow
```

**After** (separate PRs):
```
PR #1: refactor: prepare auth module for OAuth (178 LOC)
  - Extract provider interface
  - Refactor existing password auth to use interface
  - Add provider registry

PR #2: feat: add GitHub OAuth (156 LOC, based on PR #1)
  - Implement GitHub provider
  - Add OAuth endpoints
  - Update login UI with OAuth button
```

**Benefits**:
- Refactoring reviewed independently (lower risk)
- Feature PR is cleaner (just new functionality)
- Easier to revert if feature has issues

### Strategy 3: By Architectural Layer

Split by backend, frontend, infrastructure.

**Before** (full-stack change):
```
feat: add user profiles (534 LOC)
  - Database schema for profiles
  - Backend API for profile CRUD
  - Frontend profile page
  - Profile image upload
```

**After** (by layer):
```
PR #1: feat: add profile database schema (87 LOC)
  - Profile table and migrations
  - Add indexes

PR #2: feat: add profile API endpoints (156 LOC, based on PR #1)
  - CRUD endpoints
  - Validation
  - Tests

PR #3: feat: add profile UI (198 LOC, based on PR #2)
  - Profile page component
  - Edit profile form
  - Image upload component
```

## Hook Implementation

### pre-push Hook

Automatically check PR size before pushing.

```bash
#!/usr/bin/env bash
# .git/hooks/pre-push

set -euo pipefail

# Get changes between current branch and main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_BRANCH="main"

# Count effective LOC
EFFECTIVE_LOC=$(./scripts/pr-size/count-effective-loc.sh "$BASE_BRANCH" "$BRANCH")

echo "PR size check: $EFFECTIVE_LOC effective LOC"

# Thresholds
IDEAL=250
WARNING=300
ERROR=500

if (( EFFECTIVE_LOC <= IDEAL )); then
  echo "✅ PR size is ideal for review"
  exit 0
elif (( EFFECTIVE_LOC <= WARNING )); then
  echo "⚠️  PR is acceptable but consider splitting (${EFFECTIVE_LOC}/${WARNING} LOC)"
  echo "   See: /skills/pr-size-optimization for splitting strategies"
  exit 0
elif (( EFFECTIVE_LOC <= ERROR )); then
  echo "⚠️  PR is large - strongly recommend splitting (${EFFECTIVE_LOC} LOC)"
  echo "   Run: /check-pr-size for suggested split points"

  # Configurable: warn or block
  if [[ "${PR_SIZE_STRICT:-false}" == "true" ]]; then
    echo "🛑 Blocking push. Set PR_SIZE_STRICT=false to override."
    exit 1
  else
    echo "   Set PR_SIZE_STRICT=true to block large PRs"
    exit 0
  fi
else
  echo "🛑 PR is too large (${EFFECTIVE_LOC} LOC, limit: ${ERROR})"
  echo "   Must split unless exceptional circumstances"
  echo "   Run: /check-pr-size for suggested split points"

  # Always block if over error threshold (unless override)
  if [[ "${PR_SIZE_OVERRIDE:-false}" == "true" ]]; then
    echo "⚠️  Override enabled, proceeding anyway"
    exit 0
  else
    echo "   Set PR_SIZE_OVERRIDE=true to force push (requires exception approval)"
    exit 1
  fi
fi
```

### Configuration

```bash
# .env or shell profile

# Warn but don't block PRs 300-500 LOC
PR_SIZE_STRICT=false

# Set true to allow emergency override of 500+ LOC limit
PR_SIZE_OVERRIDE=false
```

## Command Implementation

### /check-pr-size

```bash
#!/usr/bin/env bash
# Manual PR size check

BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD)}"
BASE_BRANCH="${2:-main}"

echo "Analyzing PR: $BRANCH (base: $BASE_BRANCH)"
echo ""

# Count effective LOC
EFFECTIVE_LOC=$(./scripts/pr-size/count-effective-loc.sh "$BASE_BRANCH" "$BRANCH")
TOTAL_LOC=$(git diff --shortstat "$BASE_BRANCH...$BRANCH" | awk '{print $4+$6}')
MECHANICAL_LOC=$((TOTAL_LOC - EFFECTIVE_LOC))

echo "Total changed lines: $TOTAL_LOC"
echo "Mechanical changes: $MECHANICAL_LOC"
echo "Effective LOC: $EFFECTIVE_LOC"
echo ""

# Recommendation
if (( EFFECTIVE_LOC <= 250 )); then
  echo "Status: ✅ IDEAL"
  echo "This PR is well-sized for thorough review."
elif (( EFFECTIVE_LOC <= 300 )); then
  echo "Status: ⚠️  ACCEPTABLE"
  echo "Consider splitting if natural boundaries exist."
elif (( EFFECTIVE_LOC <= 500 )); then
  echo "Status: ⚠️  LARGE"
  echo "Strongly recommend splitting into stacked PRs."

  # Suggest split points
  echo ""
  echo "Suggested split points:"
  ./scripts/pr-size/suggest-splits.sh "$BASE_BRANCH" "$BRANCH"
else
  echo "Status: 🛑 TOO LARGE"
  echo "Must split unless exceptional circumstances."

  echo ""
  echo "Suggested split points:"
  ./scripts/pr-size/suggest-splits.sh "$BASE_BRANCH" "$BRANCH"
fi
```

## Success Metrics

Track impact of PR size optimization:

**Before heuristic** (baseline):
- Average PR size: 450 LOC
- Average review time: 3.8 days
- Average comments per PR: 3.2
- Defect escape rate: 12%

**After heuristic** (target):
- Average PR size: <250 LOC
- Average review time: <1.5 days
- Average comments per PR: >6.0
- Defect escape rate: <5%

**Track weekly**:
```bash
# PR size distribution
$ ./scripts/metrics/pr-size-distribution.sh

Week of 2025-11-21:
  <200 LOC: 12 PRs (60%)
  200-300 LOC: 5 PRs (25%)
  300-500 LOC: 2 PRs (10%)
  500+ LOC: 1 PR (5%, exception approved)

Average size: 187 LOC ✅
Target: <250 LOC
```

## Conclusion

This heuristic pattern provides clear decision rules for PR sizing while allowing contextual exceptions. Implement as Skill (guidance) + Hook (enforcement) + Command (manual check).
