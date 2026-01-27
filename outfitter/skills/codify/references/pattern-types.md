# Pattern Types Reference

Extended examples, anti-patterns, and guidance for complex pattern scenarios.

## Workflow Patterns

Multi-step sequences with defined stages and transitions.

### Examples

<example name="tdd-workflow">
```yaml
name: tdd-workflow
type: workflow
description: Red-Green-Refactor cycle

stages:
- name: Red
    actions: [understand requirement, write failing test, confirm failure]
    exit_criteria: test fails with clear assertion

- name: Green
    actions: [write minimal implementation, run until pass]
    exit_criteria: test passes

- name: Refactor
    actions: [improve quality, extract duplicates, re-run tests]
    exit_criteria: clean code, all tests pass

triggers:
- implementing new feature
- fixing bug with test coverage

```

Component: Skill (requires judgment on test design)
Composite: Add `/tdd` command for scaffolding
</example>

<example name="systematic-debugging">
```yaml
name: systematic-debugging
type: workflow
description: Structured root cause investigation

stages:
  - name: Reproduction
    actions: [create minimal case, document steps, confirm consistency]
    exit_criteria: reproducible steps

  - name: Investigation
    actions: [add logging, use debugger, check recent changes]
    exit_criteria: root cause hypothesis

  - name: Validation
    actions: [test hypothesis, verify fix, check regressions]
    exit_criteria: confirmed fix

  - name: Prevention
    actions: [add regression test, document root cause]
    exit_criteria: test coverage + documentation

triggers:
  - bug report received
  - unexpected behavior
  - CI test failure
```

Component: Skill (requires investigative judgment)
Composite: Add Hook to enforce regression test
</example>

<example name="pr-review">
```yaml
name: pr-review
type: workflow
description: Comprehensive PR review process

stages:
- name: Context
    actions: [read description, understand problem, review discussion]
    exit_criteria: clear understanding of intent

- name: Code Review
    actions: [check correctness, verify tests, assess readability]
    exit_criteria: quality assessment

- name: Testing
    actions: [checkout locally, run tests, manual testing]
    exit_criteria: confidence in implementation

- name: Feedback
    actions: [specific comments, highlight positives, approve/request changes]
    exit_criteria: review decision

triggers:
- PR ready for review
- review requested

```

Component: Skill (requires judgment on code quality)
Composite: Add Command `/code-review` for automated checks
</example>

### Anti-Patterns

Too granular:
```yaml
# BAD
steps:
  - open terminal
  - type git status
  - press enter
```

Too vague:

```yaml
# BAD
steps:
  - understand the problem
  - write good code
  - test it
```

Tool-specific instead of outcome-focused:

```yaml
# BAD
steps:
  - Use Jest to write tests

# GOOD
steps:
  - Write tests that verify behavior
```

### Hybrid Example

Feature development with stacked PRs combines workflow + orchestration:

```yaml
name: stacked-feature-development
type: workflow
orchestration_aspects:
  - Git branch management
  - GitHub PR creation
  - Stack synchronization

stages:
  - name: Planning
    actions: [break into commits, define stack]
    orchestration: [gt init]

  - name: Implementation
    actions: [implement unit, write tests]
    orchestration: [git add, gt create]

  - name: Submission
    orchestration: [gt submit --stack]
```

Component: Skill + Hook (enforce stack constraints)

---

## Orchestration Patterns

Tool coordination for achieving complex goals.

### Examples

<example name="multi-service-deploy">
```yaml
name: multi-service-deploy
type: orchestration
description: Deploy services with dependency ordering

tools:
- tool: Docker
    role: container management
- tool: Kubernetes
    role: orchestration
- tool: Health endpoints
    role: verification

sequence:
  1. Build container images
  2. Push to registry
  3. Deploy database migrations
  4. Wait for database health
  5. Deploy backend
  6. Wait for backend health
  7. Deploy frontend
  8. Verify end-to-end

rollback: Revert in reverse dependency order

```

Component: Skill (manual with judgment) or Command (if automated)
</example>

<example name="git-linear-integration">
```yaml
name: git-linear-integration
type: orchestration
description: Update Linear from git commits

tools:
  - tool: Bash
    role: git commands
  - tool: Linear API
    role: issue updates
  - tool: Grep
    role: extract issue IDs

sequence:
  1. Extract issue IDs from commit (ABC-123)
  2. Query Linear for issue details
  3. Post commit SHA as comment
  4. Update issue status on keywords

triggers:
  - post-commit hook
  - pre-push hook (batch)
```

Component: Hook (event-driven, automated)
</example>

<example name="parallel-test-aggregation">
```yaml
name: parallel-test-aggregation
type: orchestration
description: Run tests in parallel, aggregate results

tools:
- tool: Bash
    role: process management
- tool: Test runner
    role: execution
- tool: JSON parser
    role: result aggregation

coordination:
- Split tests into groups
- Execute in parallel
- Monitor for failures
- Aggregate coverage
- Generate unified report

parallelization:
- Group by file/module
- Limit to CPU count
- Kill all on fast-fail

```

Component: Command (automated with standard inputs)
</example>

### Anti-Patterns

Over-orchestration:
```yaml
# BAD - no coordination needed
coordination:
  - run git status
  - then run git diff
  - then run git log
```

Tight coupling:

```yaml
# BAD
url: https://api.example.com/v1/users

# GOOD
url: ${API_BASE_URL}/users
```

Missing rollback:

```yaml
# BAD
steps:
  - deploy A
  - deploy B
  - deploy C

# GOOD
steps:
  - deploy A
  - deploy B (rollback A on failure)
  - deploy C (rollback A+B on failure)
```

### Hybrid Example

Adaptive CI pipeline combines orchestration + heuristics:

```yaml
name: adaptive-ci-pipeline
type: orchestration
heuristic_aspects:
  - Skip expensive tests on draft PRs
  - Full suite on main
  - Parallel for large suites

coordination:
  Lint → Type Check → Unit → Integration → Deploy

decision_logic:
  - if: branch == main
    then: full suite + deploy
  - if: pr_status == draft
    then: lint + type check only
  - if: files_changed < 5
    then: affected tests only
```

Component: Hook + Skill

---

## Heuristic Patterns

Decision rules and conditional logic.

### Examples

<example name="pr-size-heuristic">
```yaml
name: pr-size-heuristic
type: heuristic
description: Optimize PR size for review quality

condition: Calculate effective LOC
action: Recommend splitting if over threshold
rationale: Large PRs = slower review + lower quality feedback

thresholds:
  ideal: 100-250 LOC
  acceptable: 250-300 LOC
  warning: 300-500 LOC
  must_split: 500+ LOC

exceptions:
- Mechanical changes (formatting, renames)
- Lockfile updates
- Batch refactoring with clear pattern

rules:
- condition: LOC < 100
    action: Consider if PR is complete
- condition: LOC 100-250
    action: Ideal, proceed
- condition: LOC 300-500
    action: Strongly recommend splitting
- condition: LOC > 500
    action: Must split unless mechanical

```

Component: Hook (pre-push check) + Skill (splitting guidance)
</example>

<example name="technology-selection">
```yaml
name: technology-selection
type: heuristic
description: Framework for choosing tech/dependencies

criteria:
  maturity:
    - Stable API (v1.0+)
    - Active maintenance (3 months)
    - Production usage

  ecosystem:
    - Documentation quality
    - Community size
    - Stack integration

  technical:
    - Performance
    - Bundle size
    - Type safety

  team:
    - Learning curve
    - Existing expertise

rules:
  - condition: problem has boring solution
    action: use established library
  - condition: library is critical path
    action: require high maturity
  - condition: library is peripheral
    action: optimize for simplicity

red_flags:
  - No updates in 12+ months
  - Security vulnerabilities
  - Frequent breaking changes
```

Component: Skill (requires judgment)
</example>

<example name="error-handling-strategy">
```yaml
name: error-handling-strategy
type: heuristic
description: Choose error handling by type/context

classifications:
  expected_recoverable:
    examples: [network timeout, file not found, validation]
    strategy: Return Result type, let caller decide

  expected_unrecoverable:
    examples: [config error, db connection at startup]
    strategy: Fail fast with clear message

  unexpected:
    examples: [null pointer, index out of bounds]
    strategy: Panic/throw, capture in boundary

  degraded:
    examples: [cache miss, optional feature unavailable]
    strategy: Log warning, use fallback

recovery:
  retry: Transient errors, exponential backoff
  fallback: Optional enhancement unavailable
  compensate: Partial success, undo completed steps
  propagate: Caller has better context

```

Component: Skill (embedded guidance)
</example>

### Anti-Patterns

Too rigid:
```yaml
# BAD
condition: Function > 10 lines
action: Must split
# Ignores complexity, cohesion, readability
```

Cargo cult:

```yaml
# BAD
condition: Writing React
action: Must use hooks, never classes
rationale: "Hooks are modern"
```

Contradictory:

```yaml
# BAD
- condition: Code is complex
  action: Add comments
- condition: Code needs comments
  action: Refactor to be clearer
# When to comment vs refactor?
```

### Hybrid Example

Adaptive testing combines heuristic + workflow:

```yaml
name: adaptive-testing
type: heuristic
workflow_aspects:
  - Execute in optimal order
  - Report results

rules:
  - condition: changed files include tests
    action: run those first
  - condition: changes in /src/auth/
    action: run auth suite
  - condition: running locally
    action: affected tests only
  - condition: coverage < 80%
    action: warn, show uncovered

workflow:
  1. Analyze changed files
  2. Select test scope
  3. Execute in priority order
  4. Report with actionable feedback
```

Component: Command + Skill

---

## Pattern Evolution

Patterns evolve as needs grow:

1. Manual Process → User runs tests, reads output, fixes
2. Documented Workflow (Skill) → Structured steps
3. Partial Automation (Skill + Command) → `/run-tests --watch`
4. Event-Driven (Skill + Command + Hook) → Trigger on file save
5. Intelligent Orchestration (Agent + Skills) → Decides what to run

Recognition triggers:
- Manual → Workflow: User repeatedly asks "how do I..."
- Workflow → Command: Fully automatable with known inputs
- Command → Hook: Run at predictable times
- Skill → Agent: Requires deep expertise
- Single → Composite: Has automated + judgment aspects
