# Component Mapping Reference

Detailed decision logic for mapping patterns to Claude Code components.

## Decision Tree

```text
START: Pattern Identified
    │
    ├── USER-INVOKED?
    │   │
    │   ├── YES → Requires domain expertise throughout?
    │   │         │
    │   │         ├── YES → AGENT
    │   │         │         (specialized system prompt, deep knowledge)
    │   │         │
    │   │         └── NO → Fully automatable?
    │   │                   │
    │   │                   ├── YES → COMMAND
    │   │                   │         (script-based, deterministic)
    │   │                   │
    │   │                   └── NO → SKILL
    │   │                             (structured guidance, judgment needed)
    │   │
    │   └── NO (EVENT-TRIGGERED) → Modifies behavior?
    │                               │
    │                               ├── YES → HOOK
    │                               │         (can block/augment operations)
    │                               │
    │                               └── NO → Question if needed
```

## Examples by Decision Path

<example name="tdd-workflow">
Path: User-invoked → No domain expertise → Not fully automatable → **SKILL**

Why not COMMAND: Requires judgment on test design, refactoring decisions
Why not AGENT: General software practice, not specialized domain

Composite: Add `/run-tdd-cycle` COMMAND for mechanical test execution
</example>

<example name="security-audit">
Path: User-invoked → Requires domain expertise → **AGENT**

Why AGENT: Security requires deep specialized knowledge for every decision
Why not SKILL: Can't encode all security judgment in progressive disclosure

Composite: AGENT can use vulnerability-scanning SKILL, `/check-deps` COMMAND
</example>

<example name="code-formatting">
Path: User-invoked → No expertise → Fully automatable → **COMMAND**

Why COMMAND: Deterministic, rule-based, no judgment needed
Why not SKILL: No guidance needed, just run the tool

Composite: Add pre-commit HOOK for automatic formatting
</example>

<example name="pre-commit-validation">
Path: Event-triggered → Modifies behavior → **HOOK**

Why HOOK: Automatically runs on git event, can block commit
Implementation: `pre-commit` hook runs validation script
</example>

<example name="git-linear-integration">
Path: Event-triggered → Modifies behavior → **HOOK**

Why HOOK: Triggered by commit, augments with Linear updates
No user action required, happens in normal git workflow
</example>

## Edge Cases

### Manual + Automated

Running tests: both manual and CI use cases

```text
COMMAND: /run-tests
  User-invoked, allows parameters (--watch, --coverage)

HOOK: pre-push
  Automatically runs tests, blocks on failure
  Calls same script as COMMAND
```

### Guidance + Enforcement

PR size limits: suggest vs block

```text
SKILL: pr-workflow
  Provides guidance on optimal size
  Helps plan PR stack structure

HOOK: pre-push (optional)
  Warns or blocks on threshold
  User configures hard vs soft limit
```

### Encodable Expertise

TypeScript type design: expert knowledge that can be captured

```text
SKILL (not AGENT) because:
  - Don't need specialized prompt for every decision
  - Expertise can be progressively disclosed
  - Works in general engineering context

Use AGENT when:
  - Type-level programming (mapped, conditional, template types)
  - Designing complex type system for library
  - Every interaction requires type theory
```

### Mixed Automation

Feature development: some steps automatable, some need judgment

```text
SKILL: feature-development
  Overall workflow guidance
  Design decisions, quality criteria

COMMANDs orchestrated by SKILL:
  - /create-feature-branch
  - /run-tests
  - /generate-pr-description
```

## Selection Matrix

| Criteria | Skill | Command | Agent | Hook |
|----------|-------|---------|-------|------|
| User-invoked | ✓ | ✓ | ✓ | ✗ |
| Event-triggered | ✗ | ✗ | ✗ | ✓ |
| Requires judgment | ✓ | ✗ | ✓ | ✗ |
| Fully automatable | ✗ | ✓ | ✗ | ✓ |
| Domain expertise | ✗ | ✗ | ✓ | ✗ |
| Progressive disclosure | ✓ | ✗ | rarely | ✗ |
| Can block operations | ✗ | can fail | ✗ | ✓ (pre-*) |

## Composite Patterns

**SKILL + COMMAND**: Workflow has guidance + automation needs
- SKILL provides strategy, COMMAND handles execution
- Example: TDD skill + `/run-tests`

**SKILL + HOOK**: Guidance reinforced with automated checks
- SKILL teaches best practices, HOOK enforces them
- Example: PR workflow + pre-push size validation

**AGENT + SKILL**: Expert needs extended capabilities
- AGENT embodies expertise, SKILLs extend it
- Example: Security agent + vulnerability scanning skill

**COMMAND + HOOK**: Same operation, manual and automatic
- COMMAND for manual, HOOK for automation
- Example: `/format-code` + pre-commit format hook

**Multi-component (SKILL + COMMAND + HOOK)**: Complete workflow
- SKILL guides, COMMAND automates, HOOK enforces
- Example: Testing (strategy skill + /run-tests + pre-push coverage)

## Common Mistakes

**Creating AGENT for non-expert work**

```text
✗ file-organizer-agent
✓ COMMAND for organization, SKILL for strategy
```

**Using SKILL when COMMAND suffices**

```text
✗ run-prettier-skill (no guidance needed)
✓ COMMAND /format
```

**Creating HOOK for user-driven action**

```text
✗ on-user-request hook
✓ COMMAND or SKILL
```

**Encoding expertise in COMMAND**

```text
✗ grep-based security check
✓ AGENT for real review, or external scanning tool
```

**Over-compositing**

```text
✗ SKILL + COMMAND + HOOK + AGENT for simple linting
✓ COMMAND, optionally HOOK for pre-commit
```

## Decision Checklist

1. **Invocation**: How triggered?
   - User request → SKILL/COMMAND/AGENT
   - Event → HOOK
   - Both → COMMAND + HOOK

2. **Automation**: Fully automatable?
   - Yes, no judgment → COMMAND
   - No, requires decisions → SKILL or AGENT

3. **Expertise**: Specialized domain knowledge?
   - Yes, for every step → AGENT
   - Yes, but encodable → SKILL
   - No → SKILL or COMMAND

4. **Behavior**: Modifies agent behavior or enforces rules?
   - Yes (event-triggered) → HOOK
   - No → SKILL/COMMAND/AGENT

5. **Value**: Saves time or reduces errors?
   - Yes → Worth capturing
   - Marginal → Question if needed
   - No → Don't create component
