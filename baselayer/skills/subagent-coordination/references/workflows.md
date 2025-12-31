# Coordination Workflows

Detailed patterns for multi-agent coordination. Workflows use **roles** — select the best available agent for each role.

## Feature Development Workflow

Full cycle from requirements to delivery:

```
1. research + pathfinding
   └─► Clarify requirements, identify unknowns

2. challenging + complexity-analysis
   └─► Challenge proposed approach before building

3. coding + test-driven-development
   └─► Implement with tests first

4. reviewing + code-review
   └─► Verify quality, patterns, security

5. testing + scenario-testing
   └─► Validate end-to-end behavior

6. patterns + patternify (optional)
   └─► Capture reusable patterns from the work
```

**Handoff artifacts**:
- research → coding: Requirements doc, decision log
- coding → reviewing: PR with tests passing
- reviewing → testing: Approval with caveats noted
- testing → done: Validation report

## Bug Investigation Workflow

From symptom to verified fix:

```
1. research + codebase-analysis
   └─► Locate relevant code, understand context

2. debugging + debugging-and-diagnosis
   └─► Root cause analysis, hypothesis testing

3. coding + software-engineering
   └─► Implement fix with regression test

4. testing + scenario-testing
   └─► Verify fix, confirm no regressions
```

**Key principle**: Don't jump to fixing before understanding.

## Architecture Decision Workflow

When making significant structural changes:

```
1. research + research-and-report
   └─► Gather options, prior art, tradeoffs

2. challenging + complexity-analysis
   └─► Challenge each option for over-engineering

3. reviewing + software-architecture
   └─► Evaluate against project constraints

4. coding + software-engineering
   └─► Implement chosen approach
```

**Gate**: Don't proceed past challenging without addressing concerns.

## Code Review Workflow

Comprehensive review before merge:

```
Parallel:
├─► reviewing + code-review (correctness, style)
├─► reviewing + performance-engineering (if applicable)
└─► testing + scenario-testing (behavior validation)

Then:
└─► coding (address feedback)
```

**When to parallelize**: Large PRs, critical paths, time pressure.

## Exploration Workflow

Understanding unfamiliar territory:

```
1. research + codebase-analysis
   └─► Map structure, identify patterns

2. research + research-and-report
   └─► Document findings, create reference

3. (optional) patterns + pattern-analysis
   └─► Extract patterns for future use
```

**Output**: Knowledge artifact for future agents.

## Refactoring Workflow

Safe structural changes:

```
1. testing + scenario-testing
   └─► Establish baseline behavior tests

2. challenging + complexity-analysis
   └─► Validate refactor is worthwhile

3. coding + software-engineering
   └─► Execute refactor in small steps

4. testing + scenario-testing
   └─► Verify behavior unchanged
```

**Key principle**: Tests before and after, challenging validates ROI.

## Incident Response Workflow

Production issues:

```
1. research + status-reporting
   └─► Assess scope, communicate status

2. debugging + debugging-and-diagnosis
   └─► Rapid root cause identification

3. coding + software-engineering
   └─► Hotfix implementation

4. reviewing + code-review (abbreviated)
   └─► Quick sanity check

5. testing + scenario-testing
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

User preferences in `CLAUDE.md` override defaults.
