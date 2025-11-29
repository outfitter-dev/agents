# Pattern Types - Deep Dive

This reference provides extended examples, anti-patterns, and guidance for complex pattern scenarios.

## Workflow Patterns

### Extended Examples

#### 1. Test-Driven Development (TDD)

**Pattern specification**:
```yaml
name: tdd-workflow
title: Test-Driven Development
type: workflow
description: Red-Green-Refactor cycle for feature implementation

steps:
  - phase: Red (Write failing test)
    actions:
      - Understand requirement
      - Write test that captures expected behavior
      - Run test to confirm it fails
    outputs:
      - Failing test with clear assertion

  - phase: Green (Make it pass)
    actions:
      - Write minimal implementation
      - Run test until it passes
      - Avoid premature optimization
    outputs:
      - Passing test
      - Working implementation

  - phase: Refactor (Clean up)
    actions:
      - Improve code quality
      - Extract duplicates
      - Enhance readability
      - Re-run tests to ensure they still pass
    outputs:
      - Clean, maintainable code
      - All tests passing

triggers:
  - Implementing new feature
  - Fixing bug with test coverage
  - Building API or library function
```

**Component recommendation**: Skill (requires judgment on test design and refactoring)
**Composite**: Add `/tdd` command to automate test scaffolding

#### 2. Debugging Workflow

**Pattern specification**:
```yaml
name: systematic-debugging
title: Systematic Debugging
type: workflow
description: Structured approach to root cause investigation

steps:
  - phase: Reproduction
    actions:
      - Create minimal reproduction case
      - Document exact steps to trigger bug
      - Confirm bug reproduces consistently
    outputs:
      - Reproduction script or steps

  - phase: Investigation
    actions:
      - Add logging at suspected points
      - Use debugger to inspect state
      - Check recent changes (git log, git bisect)
      - Review related issues/PRs
    outputs:
      - Hypothesis about root cause

  - phase: Validation
    actions:
      - Test hypothesis with targeted changes
      - Verify fix resolves issue
      - Ensure no regressions
    outputs:
      - Confirmed fix

  - phase: Prevention
    actions:
      - Add regression test
      - Document root cause
      - Consider architectural improvements
    outputs:
      - Test coverage
      - Documentation

triggers:
  - Bug report received
  - Unexpected behavior observed
  - Test failure in CI
```

**Component recommendation**: Skill (requires investigative judgment)
**Composite**: Add Hook to enforce regression test requirement

#### 3. PR Review Workflow

**Pattern specification**:
```yaml
name: pr-review-checklist
title: Pull Request Review
type: workflow
description: Comprehensive PR review process

steps:
  - phase: Context
    actions:
      - Read PR description and linked issues
      - Understand problem being solved
      - Review discussion comments
    outputs:
      - Clear understanding of intent

  - phase: Code Review
    actions:
      - Check for correctness
      - Verify test coverage
      - Assess readability
      - Look for edge cases
      - Verify error handling
    outputs:
      - Code quality assessment

  - phase: Testing
    actions:
      - Check out branch locally
      - Run test suite
      - Manual testing of changes
      - Verify CI passes
    outputs:
      - Confidence in implementation

  - phase: Feedback
    actions:
      - Provide specific, actionable comments
      - Highlight positives
      - Suggest improvements
      - Approve or request changes
    outputs:
      - Review comments
      - Approval decision

triggers:
  - PR ready for review
  - Review requested
```

**Component recommendation**: Skill (requires human judgment on code quality)
**Composite**: Add Command `/code-review` to automate checks (lint, test, coverage)

### Anti-Patterns

**Too granular**: Breaking down every possible micro-step
```yaml
# BAD - Too granular
steps:
  - Open terminal
  - Type git status
  - Press enter
  - Read output
```

**Too vague**: No actionable guidance
```yaml
# BAD - Too vague
steps:
  - Understand the problem
  - Write good code
  - Test it
```

**Tool-specific instead of outcome-focused**: Locks to specific implementation
```yaml
# BAD - Tool-specific
steps:
  - Use Jest to write tests
  - Use Webpack to bundle

# GOOD - Outcome-focused
steps:
  - Write tests that verify behavior
  - Bundle for production deployment
```

### Complex/Hybrid Patterns

**Feature Development with Stacked PRs**:

Combines workflow (development process) with orchestration (git + GitHub coordination):

```yaml
name: stacked-feature-development
type: workflow  # Primary classification
orchestration_aspects:
  - Git branch management
  - GitHub PR creation
  - Stack synchronization

steps:
  - phase: Planning
    actions:
      - Break feature into logical commits
      - Define stack structure
    orchestration:
      - gt init (if needed)

  - phase: Implementation
    actions:
      - Implement first logical unit
      - Write tests
    orchestration:
      - git add .
      - gt create -m "message"

  - phase: Stack Building
    actions:
      - Repeat for each logical unit
    orchestration:
      - gt create for each commit

  - phase: Submission
    orchestration:
      - gt submit --stack
      - Create PR descriptions
```

**Component recommendation**: Skill (workflow guidance) + Hook (enforce stack constraints)

## Orchestration Patterns

### Extended Examples

#### 1. Multi-Service Deployment

**Pattern specification**:
```yaml
name: multi-service-deploy
title: Coordinated Multi-Service Deployment
type: orchestration
description: Deploy multiple services with dependency ordering and rollback

tools_involved:
  - Docker (container management)
  - Kubernetes (orchestration)
  - Bash (scripting)
  - Health check endpoints

coordination:
  - Deploy services in dependency order (database → backend → frontend)
  - Wait for health checks between stages
  - Rollback all if any service fails
  - Update service discovery

external_systems:
  - name: Kubernetes Cluster
    api: kubectl
    auth: kubeconfig
  - name: Docker Registry
    api: Docker CLI
    auth: Token

steps:
  - Build all container images
  - Push to registry
  - Deploy database migrations
  - Wait for database health check
  - Deploy backend services
  - Wait for backend health checks
  - Deploy frontend
  - Verify end-to-end health
  - Update DNS/load balancer if needed

rollback_strategy:
  - Revert to previous image tags
  - Execute in reverse dependency order
```

**Component recommendation**: Skill (manual orchestration with judgment) or Command (if fully automated)

#### 2. Git + Linear Issue Tracking

**Pattern specification**:
```yaml
name: git-linear-integration
title: Git Commit to Linear Issue Integration
type: orchestration
description: Automatically update Linear issues based on git commits

tools_involved:
  - Bash (git commands)
  - Linear API (GraphQL)
  - Grep (extract issue IDs from commit messages)

coordination:
  - Extract issue IDs from commit message (format: ABC-123)
  - Query Linear API for issue details
  - Post commit SHA and branch to Linear as comment
  - Update issue status if commit message contains keywords
  - Link commit to issue in Linear

external_systems:
  - name: Linear
    api: GraphQL
    auth: API key from environment

triggers:
  - post-commit hook
  - pre-push hook (batch updates)

implementation_strategy: Hook-based automation
```

**Component recommendation**: Hook (event-driven, automated)

#### 3. Parallel Test Execution with Aggregation

**Pattern specification**:
```yaml
name: parallel-test-aggregation
title: Parallel Test Execution with Result Aggregation
type: orchestration
description: Run test suites in parallel and aggregate results

tools_involved:
  - Bash (process management)
  - Test runner (Jest, pytest, cargo test)
  - JSON/XML parsers (result aggregation)

coordination:
  - Split test suites into logical groups
  - Execute groups in parallel processes
  - Capture stdout/stderr from each process
  - Monitor for failures in real-time
  - Aggregate coverage reports
  - Combine timing information
  - Generate unified report

parallelization_strategy:
  - Group by test file or module
  - Limit concurrent processes to CPU count
  - Kill all processes if one fails fast

result_aggregation:
  - Merge coverage reports (union of covered lines)
  - Combine timing data (sum of execution times)
  - Collect all failures and errors
  - Generate HTML summary report
```

**Component recommendation**: Command (automated script with standard inputs)

### Anti-Patterns

**Over-orchestration**: Coordinating tools that don't need coordination
```yaml
# BAD - Unnecessary orchestration
coordination:
  - Run git status
  - Then run git diff
  - Then run git log
# These are independent; no coordination needed
```

**Tight coupling**: Hard-coding service URLs or configuration
```yaml
# BAD - Tight coupling
external_systems:
  - name: API
    url: https://api.example.com/v1/users  # Hard-coded

# GOOD - Configuration-based
external_systems:
  - name: API
    url: ${API_BASE_URL}/users  # From environment
```

**Missing rollback**: Orchestration without error handling
```yaml
# BAD - No rollback strategy
steps:
  - Deploy service A
  - Deploy service B
  - Deploy service C

# GOOD - With rollback
steps:
  - Deploy service A
  - Deploy service B (rollback A on failure)
  - Deploy service C (rollback A and B on failure)
```

### Complex/Hybrid Patterns

**CI/CD Pipeline Orchestration**:

Combines orchestration (tool coordination) with heuristics (decision logic):

```yaml
name: adaptive-ci-pipeline
type: orchestration
heuristic_aspects:
  - Skip expensive tests on draft PRs
  - Run full suite on main branch
  - Parallel execution for large test suites

coordination:
  - Lint → Type Check → Unit Tests → Integration Tests → Deploy
  - Cache dependencies between stages
  - Fail fast on critical errors
  - Continue on non-critical warnings

decision_logic:
  - if: branch == main
    then: run full test suite + deploy
  - if: pr_status == draft
    then: run lint + type check only
  - if: files_changed < 5
    then: run affected tests only
  - if: test_count > 1000
    then: parallelize across 4 workers
```

**Component recommendation**: Hook (automated CI trigger) + Skill (pipeline design guidance)

## Heuristic Patterns

### Extended Examples

#### 1. PR Size Management

**Pattern specification**:
```yaml
name: pr-size-heuristic
title: Pull Request Size Optimization
type: heuristic
description: Guide PR size to optimize review quality and merge speed

condition: Calculate effective LOC (exclude mechanical changes)
action: Recommend splitting if over threshold
rationale: Large PRs take longer to review, receive lower quality feedback, and have higher defect rates

thresholds:
  ideal: 100-250 LOC
  acceptable: 250-300 LOC
  warning: 300-500 LOC
  must_split: 500+ LOC

exceptions:
  - Mechanical changes (formatting, renames, auto-generated code)
  - Lockfile updates
  - Batch refactoring with clear pattern
  - Emergency hotfixes (post-split into follow-ups)

recommendations:
  - if: LOC < 100
    then: Consider if PR is complete or should include more context
  - if: LOC between 100-250
    then: Ideal size, proceed
  - if: LOC between 250-300
    then: Acceptable, but consider splitting if natural boundaries exist
  - if: LOC between 300-500
    then: Strongly recommend splitting into stack
  - if: LOC > 500
    then: Must split unless mechanical
```

**Component recommendation**: Hook (automated check on pre-push) + Skill (guidance on splitting strategy)

#### 2. Technology Selection

**Pattern specification**:
```yaml
name: technology-selection-heuristic
title: Technology and Library Selection
type: heuristic
description: Decision framework for choosing technologies and dependencies

condition: Need to add new technology or library
action: Evaluate against criteria and team context

evaluation_criteria:
  maturity:
    - Stable API (v1.0+)
    - Active maintenance (commits in last 3 months)
    - Production usage (known companies using it)

  ecosystem:
    - Documentation quality
    - Community size (GitHub stars, npm downloads)
    - Integration with existing stack

  technical:
    - Performance characteristics
    - Bundle size impact
    - Type safety support
    - Testing capabilities

  team:
    - Learning curve
    - Existing team expertise
    - Hiring pool implications

decision_logic:
  - if: problem has boring solution (auth, forms, HTTP)
    then: use established library (Passport, React Hook Form, fetch)

  - if: problem requires cutting-edge features
    then: evaluate maturity vs innovation trade-off

  - if: library is critical path (database, security)
    then: require high maturity + active maintenance

  - if: library is peripheral (logging, formatting)
    then: optimize for simplicity + small bundle size

red_flags:
  - No updates in 12+ months
  - Major security vulnerabilities
  - Frequent breaking changes
  - Lack of TypeScript support (for TS projects)
  - "Clever" solutions over simple ones
```

**Component recommendation**: Skill (provides decision framework, requires judgment)

#### 3. Error Handling Strategy

**Pattern specification**:
```yaml
name: error-handling-strategy
title: Error Handling and Recovery
type: heuristic
description: Choose appropriate error handling strategy based on error type and context

condition: Implementing error handling for operation
action: Select strategy based on error characteristics

error_classifications:
  expected_recoverable:
    examples:
      - Network timeout
      - File not found
      - Validation failure
    strategy: Return Result/Either type, let caller decide

  expected_unrecoverable:
    examples:
      - Configuration error
      - Database connection failure at startup
      - Missing required environment variables
    strategy: Fail fast with clear error message

  unexpected:
    examples:
      - Null pointer in safe code
      - Array index out of bounds
      - Type assertion failure
    strategy: Panic/throw, capture in error boundary

  degraded:
    examples:
      - Cache miss (use slower path)
      - Optional feature unavailable (skip)
      - Rate limit exceeded (queue for later)
    strategy: Log warning, use fallback behavior

recovery_strategies:
  retry:
    use_when: Transient network/service errors
    pattern: Exponential backoff with max attempts
    example: API call fails with 503

  fallback:
    use_when: Optional enhancement unavailable
    pattern: Degrade gracefully to simpler version
    example: CDN unreachable, use local assets

  compensate:
    use_when: Partial success in multi-step operation
    pattern: Undo completed steps
    example: Payment succeeded but email failed

  propagate:
    use_when: Caller has better context for handling
    pattern: Return error as value (Result<T, E>)
    example: User input validation

implementation_guidelines:
  - Always include context in error messages
  - Use typed errors (not just strings)
  - Log before retrying (include attempt number)
  - Set reasonable timeout values
  - Avoid swallowing errors silently
```

**Component recommendation**: Skill (embedded in error-handling guidance)

### Anti-Patterns

**Too rigid**: No consideration for context
```yaml
# BAD - Too rigid
condition: Function has more than 10 lines
action: Must split into multiple functions
# Ignores complexity, cohesion, readability
```

**Cargo cult**: Following rule without understanding
```yaml
# BAD - Cargo cult
condition: Writing React component
action: Must use hooks, never classes
rationale: "Hooks are modern"
# Ignores valid use cases for class components
```

**Contradictory**: Heuristics that conflict
```yaml
# BAD - Contradictory heuristics
- condition: Code is complex
  action: Add comments

- condition: Code needs comments
  action: Refactor to be clearer
# When do you comment vs refactor?
```

### Complex/Hybrid Patterns

**Adaptive Testing Strategy**:

Combines heuristic (decision logic) with workflow (test execution):

```yaml
name: adaptive-testing
type: heuristic
workflow_aspects:
  - Execute tests in optimal order
  - Report results and coverage

decision_logic:
  - if: changed_files include *.test.*
    then: run those test files first

  - if: changed_files are in /src/auth/
    then: run auth test suite

  - if: integration_tests exist and unit_tests pass
    then: run integration tests

  - if: running_in_ci and branch == main
    then: run full suite including e2e

  - if: running_locally
    then: run affected tests only (fast feedback)

  - if: coverage < 80%
    then: warn and show uncovered lines

  - if: test_duration > 5min locally
    then: suggest splitting or mocking

workflow:
  - Analyze changed files
  - Select appropriate test scope
  - Execute in priority order
  - Report results with actionable feedback
```

**Component recommendation**: Command (automated execution) + Skill (strategy guidance)

## Pattern Evolution

Patterns often start simple and evolve as needs become more sophisticated.

### Example: From Simple to Complex

**Stage 1 - Manual Process**:
```
User manually runs tests, reads output, fixes failures, repeats
```

**Stage 2 - Documented Workflow** (Skill):
```yaml
name: manual-testing-workflow
type: workflow
steps:
  - Run test suite
  - Review failures
  - Fix issues
  - Re-run tests
```

**Stage 3 - Partial Automation** (Skill + Command):
```yaml
# Skill guides when to test
# Command automates test execution and reporting
command: /run-tests --watch --coverage
```

**Stage 4 - Event-Driven** (Skill + Command + Hook):
```yaml
# Hook triggers tests on file save or commit
# Command provides manual control
# Skill guides testing strategy
```

**Stage 5 - Intelligent Orchestration** (Agent + Skills):
```yaml
# Agent decides which tests to run based on changes
# Uses multiple skills: test-selection, failure-analysis, coverage-optimization
# Learns from past test execution patterns
```

### Recognition Criteria

Recognize when a simple pattern needs to evolve:

- **Manual → Workflow**: User repeatedly asks "how do I..." for same task
- **Workflow → Command**: Workflow is fully automatable with known inputs
- **Command → Hook**: Command is run at predictable times (pre-commit, on file save)
- **Skill → Agent**: Task requires deep expertise or specialized knowledge domain
- **Single → Composite**: Pattern has both automated and judgment-based aspects

## Summary

Effective pattern classification requires understanding:

1. **Pattern essence**: What problem does it actually solve?
2. **Automation potential**: Can it be scripted or does it require judgment?
3. **Trigger mechanism**: User-invoked or event-driven?
4. **Domain expertise**: Generic software engineering or specialized knowledge?
5. **Evolution path**: Will this pattern grow in complexity?

Use these extended examples and guidelines to make informed decisions about component type selection and pattern implementation.
