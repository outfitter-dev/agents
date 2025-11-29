# Component Mapping - Detailed Decision Logic

This reference provides comprehensive guidance for mapping patterns to Claude Code components.

## Full Decision Tree with Examples

```
START: Pattern Identified
    |
    V
┌─────────────────────────────────────────────────────────────┐
│ Question 1: Is this user-invoked or event-triggered?        │
└─────────────────────────────────────────────────────────────┘
    |
    ├─── USER-INVOKED ─────────────────────────────────────────┐
    │                                                           │
    │   ┌───────────────────────────────────────────────────┐  │
    │   │ Question 2: Does it require specialized domain    │  │
    │   │ expertise throughout execution?                   │  │
    │   └───────────────────────────────────────────────────┘  │
    │   |                                                       │
    │   ├─── YES: Domain Expertise Required ──────────────────┐│
    │   │                                                      ││
    │   │   Example: Security audit, performance optimization ││
    │   │   Component: AGENT                                  ││
    │   │   - Needs specialized system prompt                 ││
    │   │   - Deep knowledge required for all decisions       ││
    │   │   - User switches to this context explicitly        ││
    │   │                                                      ││
    │   └─── NO: General Engineering ─────────────────────────┘│
    │       |                                                   │
    │       ┌─────────────────────────────────────────────┐    │
    │       │ Question 3: Is it fully automatable with    │    │
    │       │ known inputs and no judgment required?      │    │
    │       └─────────────────────────────────────────────┘    │
    │       |                                                   │
    │       ├─── YES: Fully Automatable ────────────────────┐  │
    │       │                                                │  │
    │       │   Example: Format code, run test suite        │  │
    │       │   Component: COMMAND                          │  │
    │       │   - Script-based execution                    │  │
    │       │   - Deterministic inputs                      │  │
    │       │   - No judgment calls needed                  │  │
    │       │                                                │  │
    │       └─── NO: Requires Judgment ─────────────────────┘  │
    │           |                                               │
    │           Example: Debugging, feature design             │
    │           Component: SKILL                               │
    │           - Provides structured guidance                 │
    │           - Agent makes contextual decisions             │
    │           - Progressive disclosure of complexity         │
    │                                                           │
    └─── EVENT-TRIGGERED ──────────────────────────────────────┘
        |
        ┌─────────────────────────────────────────────────┐
        │ Question 4: Does it modify agent behavior or    │
        │ enforce constraints?                            │
        └─────────────────────────────────────────────────┘
        |
        ├─── YES: Behavior Modification ─────────────────────┐
        │                                                     │
        │   Example: Pre-commit checks, auto-format on save  │
        │   Component: HOOK                                  │
        │   - Triggered by git events or file changes        │
        │   - Can block operations (pre-commit)              │
        │   - Can augment operations (post-commit)           │
        │                                                     │
        └─── NO: Passive Event ──────────────────────────────┘
            |
            Not a pattern - just event notification
            Consider if this is actually needed
```

## Detailed Decision Examples

### Example 1: TDD Workflow

**Pattern**: Test-Driven Development (Red-Green-Refactor)

**Decision Path**:
1. User-invoked? **YES** (developer chooses to use TDD)
2. Requires domain expertise? **NO** (general software practice)
3. Fully automatable? **NO** (requires judgment on test design, refactoring decisions)
4. **Result**: SKILL

**Rationale**:
- Agent needs to write appropriate tests (judgment)
- Refactoring requires contextual decisions
- Can't be fully scripted due to variability in problems

**Composite Enhancement**:
- Add `/run-tdd-cycle` COMMAND for automated test execution and reporting
- COMMAND handles mechanical parts (run tests, show results)
- SKILL provides guidance on what tests to write and how to refactor

### Example 2: Security Audit

**Pattern**: Comprehensive security review of codebase

**Decision Path**:
1. User-invoked? **YES** (developer requests audit)
2. Requires domain expertise? **YES** (security is specialized domain)
3. **Result**: AGENT

**Rationale**:
- Security requires deep, specialized knowledge
- Every decision needs security lens (not just some steps)
- Different threat models require different approaches
- Should have specialized system prompt with security principles

**Composite Enhancement**:
- AGENT can use vulnerability-scanning SKILL
- AGENT can invoke `/check-dependencies` COMMAND for known CVEs

### Example 3: Code Formatting

**Pattern**: Format code according to style guide

**Decision Path**:
1. User-invoked? **YES** (developer runs format command)
2. Requires domain expertise? **NO**
3. Fully automatable? **YES** (deterministic, rule-based)
4. **Result**: COMMAND

**Rationale**:
- No judgment needed - rules are explicit
- Same input always produces same output
- Can be scripted with formatter tools (prettier, rustfmt, etc.)

**Composite Enhancement**:
- Add pre-commit HOOK to auto-format on commit
- HOOK calls COMMAND for actual formatting

### Example 4: Pre-commit Validation

**Pattern**: Check code quality before allowing commit

**Decision Path**:
1. User-invoked? **NO** (triggered by git commit event)
2. Event-triggered? **YES**
3. Modifies behavior? **YES** (can block commit)
4. **Result**: HOOK

**Rationale**:
- Automatically runs on git commit
- Can prevent commit if checks fail
- Enforces constraints without user action

**Implementation**:
```json
{
  "pre-commit": {
    "description": "Validate code before commit",
    "script": "scripts/pre-commit.sh"
  }
}
```

### Example 5: PR Size Validation

**Pattern**: Warn if PR exceeds size threshold

**Decision Path**:
1. User-invoked? **NO** (triggered on pre-push)
2. Event-triggered? **YES**
3. Modifies behavior? **YES** (warns or blocks)
4. **Result**: HOOK

**Alternative Path** (if user wants to check manually):
1. User-invoked? **YES** (developer runs `/check-pr-size`)
2. Requires domain expertise? **NO**
3. Fully automatable? **YES** (counting LOC is deterministic)
4. **Result**: COMMAND

**Composite Pattern**: HOOK + COMMAND
- HOOK automatically checks on pre-push
- COMMAND allows manual checking during development
- Both share same validation logic

### Example 6: Git + Linear Integration

**Pattern**: Update Linear issues based on git commits

**Decision Path**:
1. User-invoked? **NO** (triggered by commit/push)
2. Event-triggered? **YES**
3. Modifies behavior? **YES** (augments commit with Linear updates)
4. **Result**: HOOK

**Implementation**:
```json
{
  "post-commit": {
    "description": "Update Linear issues from commit messages",
    "script": "scripts/linear-integration.sh"
  }
}
```

**Rationale**:
- Automatically extracts issue IDs from commit messages
- No user action required
- Happens as part of normal git workflow

## Edge Cases and Exceptions

### Edge Case 1: Sometimes Manual, Sometimes Automated

**Scenario**: Running tests
- **Manual use case**: Developer wants to run tests during development
- **Automated use case**: CI runs tests on every push

**Solution**: COMMAND + HOOK
```
COMMAND: /run-tests
  - User-invoked test execution
  - Allows parameters (--watch, --coverage, --filter)

HOOK: pre-push
  - Automatically runs tests before push
  - Blocks push if tests fail
  - Calls same underlying script as COMMAND
```

### Edge Case 2: Guidance vs. Enforcement

**Scenario**: PR size limits
- **Guidance**: Suggest splitting large PRs
- **Enforcement**: Block PRs over threshold

**Solution**: SKILL + HOOK
```
SKILL: pr-workflow
  - Provides guidance on optimal PR size
  - Explains when to split
  - Helps plan PR stack structure

HOOK: pre-push (optional)
  - Warns if PR exceeds threshold
  - Can block (hard limit) or warn (soft limit)
  - User can configure behavior
```

### Edge Case 3: Expertise That Can Be Encoded

**Scenario**: TypeScript type design
- **Expert knowledge**: Advanced type patterns
- **Encodable**: Can be captured in examples and rules

**Solution**: SKILL (not AGENT)
```
Why not AGENT:
- Don't need specialized system prompt for every decision
- Expertise can be progressively disclosed in SKILL
- Works within general engineering context

SKILL provides:
- Examples of advanced patterns
- When to use each pattern
- Common pitfalls
- References to deep dives
```

**When to use AGENT instead**:
- If user needs type-level programming (mapped types, conditional types, template literals)
- If designing complex type system for library
- If every interaction requires type theory knowledge

### Edge Case 4: Multi-Step Pattern with Mixed Automation

**Scenario**: Feature development workflow
- Some steps automatable (create branch, run tests)
- Some steps require judgment (design API, write tests)

**Solution**: SKILL with COMMAND helpers
```
SKILL: feature-development
  - Overall workflow guidance
  - Design decisions
  - Quality criteria

COMMANDs used by SKILL:
  - /create-feature-branch
  - /run-tests
  - /generate-pr-description

User invokes SKILL, which orchestrates COMMANDs
```

### Edge Case 5: Event-Driven but No Behavior Change

**Scenario**: Logging git commits to external service
- Triggered by commit
- Doesn't block or modify anything
- Pure notification

**Solution**: HOOK (but consider if needed)
```
Technically valid:
  post-commit hook sends notification

Consider:
- Does this add value to Claude Code workflow?
- Could this be CI/CD pipeline responsibility?
- Is Claude Code the right place for this?

If pure infrastructure, maybe not a pattern worth capturing
```

## Component Selection Matrix

| Criteria | Skill | Command | Agent | Hook |
|----------|-------|---------|-------|------|
| **User-invoked** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Event-triggered** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Requires judgment** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Fully automatable** | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| **Domain expertise** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **Progressive disclosure** | ✅ Yes | ❌ No | ⚠️ Rarely | ❌ No |
| **Can block operations** | ❌ No | ⚠️ Can fail | ❌ No | ✅ Yes (pre-*) |
| **Invocation syntax** | Flag/trigger | `/command` | Switch context | Automatic |

## Composite Pattern Guidance

### When to Combine Components

**SKILL + COMMAND**:
- **Use when**: Workflow has both guidance and automation needs
- **Pattern**: SKILL provides strategy, COMMAND handles mechanical execution
- **Example**: TDD skill + `/run-tests` command

**SKILL + HOOK**:
- **Use when**: Guidance should be reinforced with automated checks
- **Pattern**: SKILL teaches best practices, HOOK enforces them
- **Example**: PR workflow skill + pre-push size validation hook

**AGENT + SKILL**:
- **Use when**: Expert needs specialized capabilities
- **Pattern**: AGENT embodies expertise, SKILLs extend capabilities
- **Example**: Security agent + vulnerability-scanning skill

**COMMAND + HOOK**:
- **Use when**: Same operation needed both manually and automatically
- **Pattern**: COMMAND for manual use, HOOK for automation
- **Example**: `/format-code` command + pre-commit format hook

**AGENT + COMMAND**:
- **Use when**: Automated workflow should hand off to specialist
- **Pattern**: COMMAND triggers, AGENT takes over with context
- **Example**: `/implement-feature` command switches to feature-dev agent

**Multi-component (SKILL + COMMAND + HOOK)**:
- **Use when**: Complete workflow needs guidance, automation, and enforcement
- **Pattern**: SKILL guides, COMMAND automates, HOOK enforces
- **Example**: Testing workflow
  - SKILL: test strategy and patterns
  - COMMAND: `/run-tests` for manual execution
  - HOOK: pre-push to enforce coverage

### Anti-Pattern: Over-Engineering

**Avoid creating composite patterns when single component suffices**:

❌ **Bad**: Creating SKILL + COMMAND for simple formatting
```
SKILL: formatting-guide
  - Explains why formatting matters
  - Shows examples

COMMAND: /format
  - Runs prettier
```
✅ **Good**: Just use COMMAND - formatting is straightforward

❌ **Bad**: Creating AGENT for simple workflow
```
AGENT: commit-message-writer
  - Specialized in writing commit messages
```
✅ **Good**: SKILL provides commit message guidance within general context

## Decision Checklist

Use this checklist when mapping a pattern to components:

### 1. Invocation
- [ ] How is this triggered?
  - User request → SKILL or COMMAND or AGENT
  - Event → HOOK
  - Both → COMMAND + HOOK

### 2. Automation
- [ ] Can this be fully automated?
  - Yes, no judgment → COMMAND
  - No, requires decisions → SKILL or AGENT

### 3. Expertise
- [ ] Does this require specialized domain knowledge?
  - Yes, for every step → AGENT
  - Yes, but can be encoded → SKILL
  - No → SKILL or COMMAND

### 4. Behavior
- [ ] Does this modify agent behavior or enforce rules?
  - Yes → HOOK (if event-triggered)
  - No → SKILL/COMMAND/AGENT

### 5. Complexity
- [ ] How complex is this pattern?
  - Simple, single-purpose → Single component
  - Multi-faceted → Consider composite
  - Very complex → May need AGENT

### 6. Value
- [ ] Does this save significant time or reduce errors?
  - Yes → Worth capturing
  - Marginal → Consider if needed
  - No → Don't create component

## Common Mistakes

### Mistake 1: Creating AGENT for Non-Expert Work

❌ **Wrong**:
```yaml
name: file-organizer-agent
description: Organizes files into folders
```

This doesn't require specialized expertise. Use COMMAND or SKILL.

✅ **Correct**: COMMAND for automated organization, SKILL for strategy

### Mistake 2: Using SKILL When COMMAND Suffices

❌ **Wrong**:
```yaml
name: run-prettier-skill
description: Guides user through running prettier
```

No guidance needed - just run the tool.

✅ **Correct**: COMMAND `/format`

### Mistake 3: Creating HOOK for User-Driven Action

❌ **Wrong**:
```json
{
  "on-user-request": {
    "description": "When user asks to format code",
    "script": "prettier.sh"
  }
}
```

Hooks are for events, not user requests.

✅ **Correct**: COMMAND or SKILL

### Mistake 4: Encoding Expertise in COMMAND

❌ **Wrong**:
```bash
#!/bin/bash
# /check-security command
# Runs basic grep for common security issues
grep -r "eval(" .
grep -r "innerHTML" .
```

This is superficial checking, not real security audit.

✅ **Correct**: AGENT for real security review, or external security scanning tool

### Mistake 5: Over-Compositing

❌ **Wrong**: Creating SKILL + COMMAND + HOOK + AGENT for simple linting

✅ **Correct**: COMMAND for linting, optionally HOOK for pre-commit

## Summary Decision Framework

```
Is this user-invoked?
  YES → Requires domain expertise throughout?
    YES → AGENT
    NO  → Fully automatable?
      YES → COMMAND
      NO  → SKILL

  NO (event-triggered) → Modifies behavior?
    YES → HOOK
    NO  → Question if needed

Consider composite if:
  - Multiple invocation patterns (manual + automatic)
  - Both guidance and automation needed
  - Enforcement + education desired
```

Use this framework to make consistent, well-reasoned component selection decisions.
