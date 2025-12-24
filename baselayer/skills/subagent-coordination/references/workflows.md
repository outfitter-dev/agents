# Coordination Workflows

Detailed patterns for multi-agent coordination.

## Feature Development Workflow

Full cycle from requirements to delivery:

```
1. analyst + pathfinding
   └─► Clarify requirements, identify unknowns

2. skeptic + complexity-analysis
   └─► Challenge proposed approach before building

3. developer + test-driven-development
   └─► Implement with tests first

4. reviewer + code-review
   └─► Verify quality, patterns, security

5. tester + scenario-testing
   └─► Validate end-to-end behavior

6. pattern-analyzer + patternify (optional)
   └─► Capture reusable patterns from the work
```

**Handoff artifacts**:
- analyst → developer: Requirements doc, decision log
- developer → reviewer: PR with tests passing
- reviewer → tester: Approval with caveats noted
- tester → done: Validation report

## Bug Investigation Workflow

From symptom to verified fix:

```
1. analyst + codebase-analysis
   └─► Locate relevant code, understand context

2. debugger + debugging-and-diagnosis
   └─► Root cause analysis, hypothesis testing

3. developer + software-engineering
   └─► Implement fix with regression test

4. tester + scenario-testing
   └─► Verify fix, confirm no regressions
```

**Key principle**: Don't jump to fixing before understanding.

## Architecture Decision Workflow

When making significant structural changes:

```
1. analyst + research-and-report
   └─► Gather options, prior art, tradeoffs

2. skeptic + complexity-analysis
   └─► Challenge each option for over-engineering

3. reviewer + software-architecture
   └─► Evaluate against project constraints

4. developer + software-engineering
   └─► Implement chosen approach
```

**Gate**: Don't proceed past skeptic without addressing concerns.

## Code Review Workflow

Comprehensive review before merge:

```
Parallel:
├─► reviewer + code-review (correctness, style)
├─► reviewer + performance-engineering (if applicable)
└─► tester + scenario-testing (behavior validation)

Then:
└─► developer (address feedback)
```

**When to parallelize**: Large PRs, critical paths, time pressure.

## Exploration Workflow

Understanding unfamiliar territory:

```
1. analyst + codebase-analysis
   └─► Map structure, identify patterns

2. analyst + research-and-report
   └─► Document findings, create reference

3. (optional) pattern-analyzer + pattern-analysis
   └─► Extract patterns for future use
```

**Output**: Knowledge artifact for future agents.

## Refactoring Workflow

Safe structural changes:

```
1. tester + scenario-testing
   └─► Establish baseline behavior tests

2. skeptic + complexity-analysis
   └─► Validate refactor is worthwhile

3. developer + software-engineering
   └─► Execute refactor in small steps

4. tester + scenario-testing
   └─► Verify behavior unchanged
```

**Key principle**: Tests before and after, skeptic validates ROI.

## Incident Response Workflow

Production issues:

```
1. analyst + status-reporting
   └─► Assess scope, communicate status

2. debugger + debugging-and-diagnosis
   └─► Rapid root cause identification

3. developer + software-engineering
   └─► Hotfix implementation

4. reviewer + code-review (abbreviated)
   └─► Quick sanity check

5. tester + scenario-testing
   └─► Verify fix in staging
```

**Priority**: Speed over perfection, but never skip verification.

## Choosing a Workflow

| Situation | Workflow |
|-----------|----------|
| New feature request | Feature Development |
| Bug report | Bug Investigation |
| "Should we use X?" | Architecture Decision |
| PR ready for merge | Code Review |
| "How does this work?" | Exploration |
| Tech debt cleanup | Refactoring |
| Production is down | Incident Response |

## Workflow Customization

Workflows adapt based on:

- **Project phase**: Early = more analyst, late = more tester
- **Risk level**: High = mandatory skeptic + reviewer
- **Time pressure**: Can skip pattern-analyzer, abbreviate reviewer
- **Team context**: Solo = lighter review, team = full workflow

User preferences in CLAUDE.md override defaults.
