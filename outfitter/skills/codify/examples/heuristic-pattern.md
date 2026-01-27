# Heuristic Pattern Example: PR Size Optimization

Demonstrates identifying, specifying, and implementing a heuristic pattern.

## Pattern Identification

<evidence>

User: "Our PRs keep getting stuck in review. When reviewed, feedback is often superficial."

Investigation:
- Average PR size: 450 LOC, some exceeded 1,000 LOC
- Large PRs (>300 LOC): 2.3 comments avg, 4.2 days to merge
- Small PRs (<200 LOC): 8.7 comments avg, 1.1 days to merge

Pattern: PR size correlates with review quality and merge speed. Need decision rule for when to split.

</evidence>

<classification>

Type: Heuristic (decision rule with contextual exceptions)

Why not workflow: Not multi-step process, but a guideline
Why not orchestration: Not coordinating tools, but providing framework

</classification>

## Pattern Specification

```yaml
name: pr-size-optimization
type: heuristic
description: Decision framework for optimal PR size

condition: Preparing to create pull request
action: Evaluate size, recommend splitting if over threshold

rationale: |
  Large PRs suffer from:
  - Reviewer fatigue
  - Superficial feedback
  - Longer time-to-merge
  - Higher defect rates

thresholds:
  ideal: 50-250 LOC
  acceptable: 250-300 LOC
  warning: 300-500 LOC
  must_split: 500+ LOC

calculation: |
  Effective LOC = Total - Mechanical changes

  Mechanical (exclude):
  - Lockfiles (package-lock.json, Cargo.lock)
  - Formatting-only changes
  - Batch renames
  - Code moves without logic changes
  - Auto-generated schemas

rules:
  - condition: LOC < 50
    severity: info
    action: Consider if PR is complete

  - condition: LOC 50-250
    severity: success
    action: Proceed

  - condition: LOC 250-300
    severity: warning
    action: Consider splitting if natural boundaries exist

  - condition: LOC 300-500
    severity: warning
    action: Strongly recommend splitting

  - condition: LOC > 500
    severity: error
    action: Must split unless exception

exceptions:
  mechanical_changes:
    description: Auto-generated or formatting-only
    action: Isolate in separate PR, mark as mechanical

  emergency_hotfix:
    description: Production incident requiring immediate fix
    action: Proceed, plan follow-up split

  approved_exception:
    description: Team lead approves for specific reason
    action: Document exception in PR description

splitting_strategies:
  logical_stages: Schema → Backend → Frontend → Tests
  commit_boundaries: Each commit becomes PR in stack
  refactor_vs_feature: Preparatory refactoring separate from feature
  by_component: Separate PRs per service/module
```

## Component Recommendation

<analysis>

Invocation: User-invoked (manual check) or event-triggered (pre-push)
Automation: Partially — LOC counting automated, split decision requires judgment

Decision: **SKILL + HOOK** (composite)

</analysis>

<rationale>

SKILL because:
- Provides guidance on thresholds
- Explains rationale for limits
- Teaches splitting strategies
- Requires judgment on split boundaries

HOOK because:
- Automatically checks on pre-push
- Warns if over threshold
- Can block (configurable)
- Immediate feedback

Not just COMMAND: Requires teaching beyond execution
Not AGENT: General engineering, not specialized

</rationale>

<composite>

SKILL: pr-size-optimization — guidance and strategies
HOOK: pre-push — automatic validation
COMMAND: /check-pr-size — manual check during development

</composite>

## Implementation Sketch

### File Structure

```text
skills/
  pr-size-optimization/
    SKILL.md
    examples/
      splitting-strategies.md
      exceptions.md

hooks/
  pre-push/
    check-pr-size.sh

commands/
  check-pr-size.md
```

### Pre-push Hook

```bash
#!/usr/bin/env bash
set -euo pipefail

BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE="main"

EFFECTIVE_LOC=$(./scripts/pr-size/count-effective-loc.sh "$BASE" "$BRANCH")

echo "PR size check: $EFFECTIVE_LOC effective LOC"

IDEAL=250; WARNING=300; ERROR=500

if (( EFFECTIVE_LOC <= IDEAL )); then
  echo "✅ PR size ideal for review"
elif (( EFFECTIVE_LOC <= WARNING )); then
  echo "⚠️  Acceptable, consider splitting (${EFFECTIVE_LOC}/${WARNING} LOC)"
elif (( EFFECTIVE_LOC <= ERROR )); then
  echo "⚠️  Large - strongly recommend splitting"
  [[ "${PR_SIZE_STRICT:-false}" == "true" ]] && exit 1
else
  echo "🛑 Too large (${EFFECTIVE_LOC} LOC, limit: ${ERROR})"
  echo "   Must split unless exceptional circumstances"
  [[ "${PR_SIZE_OVERRIDE:-false}" != "true" ]] && exit 1
fi
```

### Manual Command

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

## Splitting Example

**Before** (487 LOC):

```text
feat: add user authentication
  - Add user model and schema
  - Add auth endpoints
  - Add session management
  - Add login UI
```

**After** (stacked PRs):

```text
PR #1: feat: add user model (123 LOC)
PR #2: feat: add auth endpoints (108 LOC) ← based on #1
PR #3: feat: add session management (89 LOC) ← based on #2
PR #4: feat: add login UI (124 LOC) ← based on #3
```

Using Graphite:

```bash
gt create -m "feat: add user model"
gt create -m "feat: add auth endpoints"
gt create -m "feat: add session management"
gt create -m "feat: add login UI"
gt submit --stack
```

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Average PR size | 450 LOC | <250 LOC |
| Review time | 3.8 days | <1.5 days |
| Comments/PR | 3.2 | >6.0 |
| Defect escape rate | 12% | <5% |
