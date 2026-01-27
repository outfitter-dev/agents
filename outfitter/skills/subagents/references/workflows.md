# Coordination Workflows

Detailed patterns for multi-agent coordination. Workflows use **roles** — select the best available agent for each role.

## Feature Development Workflow

Full cycle from requirements to delivery:

```
1. research + pathfinding
   └─► Clarify requirements, identify unknowns

2. challenging + simplify
   └─► Challenge proposed approach before building

3. coding + tdd
   └─► Implement with tests first

4. reviewing + code-review
   └─► Verify quality, patterns, security

5. testing + scenarios
   └─► Validate end-to-end behavior

6. patterns + codify (optional)
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
1. research + codebase-recon
   └─► Locate relevant code, understand context

2. debugging + debugging
   └─► Root cause analysis, hypothesis testing

3. coding + software-craft
   └─► Implement fix with regression test

4. testing + scenarios
   └─► Verify fix, confirm no regressions
```

**Key principle**: Don't jump to fixing before understanding.

## Architecture Decision Workflow

When making significant structural changes:

```
1. research + research
   └─► Gather options, prior art, tradeoffs

2. challenging + simplify
   └─► Challenge each option for over-engineering

3. reviewing + architecture
   └─► Evaluate against project constraints

4. coding + software-craft
   └─► Implement chosen approach
```

**Gate**: Don't proceed past challenging without addressing concerns.

## Code Review Workflow

Comprehensive review before merge:

```
Parallel:
├─► reviewing + code-review (correctness, style)
├─► reviewing + performance (if applicable)
└─► testing + scenarios (behavior validation)

Then:
└─► coding (address feedback)
```

**When to parallelize**: Large PRs, critical paths, time pressure.

## Exploration Workflow

Understanding unfamiliar territory:

```
1. research + codebase-recon
   └─► Map structure, identify patterns

2. research + research
   └─► Document findings, create reference

3. (optional) patterns + patterns
   └─► Extract patterns for future use
```

**Output**: Knowledge artifact for future agents.

## Refactoring Workflow

Safe structural changes:

```
1. testing + scenarios
   └─► Establish baseline behavior tests

2. challenging + simplify
   └─► Validate refactor is worthwhile

3. coding + software-craft
   └─► Execute refactor in small steps

4. testing + scenarios
   └─► Verify behavior unchanged
```

**Key principle**: Tests before and after, challenging validates ROI.

## Incident Response Workflow

Production issues:

```
1. research + status
   └─► Assess scope, communicate status

2. debugging + debugging
   └─► Rapid root cause identification

3. coding + software-craft
   └─► Hotfix implementation

4. reviewing + code-review (abbreviated)
   └─► Quick sanity check

5. testing + scenarios
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

- **Project stage**: Early = more analyst, late = more tester
- **Risk level**: High = mandatory skeptic + reviewer
- **Time pressure**: Can skip patterns role, abbreviate reviewer
- **Team context**: Solo = lighter review, team = full workflow

User preferences in `CLAUDE.md` override defaults.
