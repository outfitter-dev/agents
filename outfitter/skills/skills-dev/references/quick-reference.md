# Quick Reference: Skills Best Practices

Fast checklist for skill development. See [best-practices.md](./best-practices.md) for detailed explanations.

## Skill Creation Checklist

### Structure

```
skill-name/
├── SKILL.md              # < 500 lines, core workflow
├── references/           # Deep dives (loaded on demand)
│   ├── patterns.md
│   ├── examples.md
│   └── advanced.md
└── scripts/              # Helper utilities
```

### SKILL.md Template

```markdown
---
name: kebab-case-name
description: What it does AND when to use it. Trigger terms: keywords, phrases.
version: 1.0.0
---

# Skill Name

<when_to_use>
Clear criteria for when this applies
</when_to_use>

<workflow>
1. Step one
2. Step two
3. Step three
</workflow>

<rules>
- ALWAYS: Do this
- NEVER: Don't do that
- PREFER: Recommended approach
</rules>

<references>
- [Pattern details](references/patterns.md)
- [Examples](references/examples.md)
</references>
```

## Description Checklist

- [ ] Third-person voice ("Creates reports" not "I create reports")
- [ ] Includes WHAT skill does
- [ ] Includes WHEN to use it
- [ ] Lists trigger terms users might say
- [ ] Under 100 tokens
- [ ] Specific, not generic

✅ **Good**: "Implements test-driven development using Red-Green-Refactor cycles. Use when implementing features with tests first, refactoring with test coverage, or reproducing bugs. Keywords: TDD, test-first, red-green-refactor."

❌ **Bad**: "Helps with testing"

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| Verbose SKILL.md (1000+ lines) | Keep under 500, move details to references/ |
| "NEVER do X" without alternatives | "ALWAYS do Y; NEVER do X" |
| Deeply nested references (3+ levels) | Keep 1 level deep with table of contents |
| No version control | Track in git with semantic versioning |
| No examples | Add 1-2 examples in references/examples.md |
| Unclear scope (skill does too much) | One skill, one job |
| Testing only with Sonnet | Test with Haiku, Sonnet, AND Opus |
| Static text without action | Make it executable/testable |

## Testing Checklist

### Before Publishing

- [ ] Test with Haiku (needs more explicit instructions?)
- [ ] Test with Sonnet (balanced clarity?)
- [ ] Test with Opus (handles complexity?)
- [ ] Use skill for real work (dogfooding)
- [ ] Check description triggers discovery correctly
- [ ] Verify workflow completes successfully
- [ ] Review security (no malicious code)
- [ ] Under 500 lines in SKILL.md
- [ ] References properly linked

### Ongoing Validation

- [ ] Track skill load frequency
- [ ] Monitor completion rate
- [ ] Log user satisfaction
- [ ] Note when Claude asks for clarification (skill unclear?)
- [ ] Build regression tests for critical paths

## Composition Patterns

### Reference Other Skills

```markdown
Load the **outfitter:debugging** skill using the Skill tool to investigate.
```

### Skill Chaining

```markdown
1. Load **pathfinding** skill for planning
2. Load **tdd** skill for implementation
3. Load **code-review** skill for validation
```

### Skills + MCP

- **MCP**: Data access (APIs, databases, tools)
- **Skill**: Workflows (what to do with that data)

## Progressive Disclosure

```
Discovery (50 tokens)      → YAML frontmatter
   ↓
Activation (2-5K tokens)   → SKILL.md core
   ↓
Execution (dynamic)        → references/ loaded on demand
```

**Key**: Don't load everything upfront. Let Claude request detail.

## Degrees of Freedom

| Level | Format | When to Use |
|-------|--------|-------------|
| **High** | Text instructions | Creative tasks, multiple valid approaches |
| **Medium** | Pseudocode | Standard patterns with variation allowed |
| **Low** | Scripts | Security-critical, exact sequence required |

**Examples:**

| Task | Freedom |
|------|---------|
| Error message formatting | High |
| API integration | Medium |
| Authentication flows | Low |
| Database migrations | Low |
| Code formatting | High |

## Security Quick Check

- [ ] Review all scripts in scripts/ directory
- [ ] No credential harvesting (API keys, tokens)
- [ ] No unexpected file system writes
- [ ] No suspicious network requests
- [ ] No obfuscated code
- [ ] Verify external dependencies
- [ ] Test in isolated environment first

## Description Optimization Formula

```
[What it does] + [When to use] + [Trigger keywords]
```

**Example**:
"Debugs issues using systematic root cause analysis. Use when encountering errors, unexpected behavior, or test failures. Keywords: debug, troubleshoot, error, failure, bug."

## Versioning Rules

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes (workflow changed, different inputs)
- **MINOR** (1.0.0 → 1.1.0): New features (additional optional steps)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes (typos, clarifications)

## One-Liners to Remember

1. **Assume intelligence** - Claude doesn't need basic concepts explained
2. **Be directive, not comprehensive** - Focus on what makes THIS approach different
3. **One skill, one job** - Don't make Swiss Army knife skills
4. **Test like code** - Build evals, use version control, review changes
5. **Progressive disclosure** - Start small, load detail on demand
6. **Security matters** - Skills execute code; review carefully
7. **Positive constraints** - Tell what TO do, not just what NOT to do
8. **Examples clarify** - Non-obvious patterns need concrete examples
9. **Version semantically** - Breaking changes = major version bump
10. **Dogfood relentlessly** - Use your own skills for real work

## Advanced Patterns Quick List

- **Degrees of freedom**: Match instruction specificity to task type
- **Solve don't punt**: Scripts should handle errors, not fail to Claude
- **Variant organization**: Multi-framework skills with selection in SKILL.md
- **Hook-based validation**: PreToolUse for quality gates
- **Master-Clone architecture**: Preserve context via subagents
- **Eval-driven development**: Tests before extensive docs
- **Organization-wide libraries**: Central skill registry
- **Skills as living docs**: Replace static wikis
- **Conditional chaining**: Orchestrate complex workflows
- **ToC in references**: Navigate to specific sections (>100 lines)
- **Skill contribution flow**: Treat like open source PRs

See [patterns.md](./patterns.md) for detailed examples.

## When to Create a Skill vs Other Tools

| Need | Use |
|------|-----|
| Multi-step workflow with judgment | **Skill** |
| Simple shortcut/expansion | Slash command |
| Data access / API integration | MCP server |
| Specialized autonomous work | Subagent |
| Event-triggered automation | Hook |

## Getting Help

- **Official docs**: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills>
- **Community**: ComposioHQ/awesome-claude-skills (GitHub)
- **Research**: skillmatic-ai/awesome-agent-skills (GitHub)
- **Examples**: Load existing well-crafted skills for patterns

Last updated: 2026-01-10
