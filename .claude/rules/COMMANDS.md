# Command Patterns

## Structure

```
{plugin}/commands/{name}.md
```

Commands are slash-invoked workflows that expand into prompts.

## Frontmatter

```yaml
---
description: Action-oriented one-liner (shown in /help)
argument-hint: [what user provides, or omit if no args]
---
```

## Template

```markdown
---
description: Systematic debugging with root cause investigation
argument-hint: [bug description or error message]
---

# Command Title

Brief framing of what this command does.

## The Framework / Process

Numbered steps or framework summary.

## Context

$ARGUMENTS

---

Load the {skill-name} skill and begin by:
1. First action
2. Second action
3. Third action

{Key constraint or philosophy reminder}
```

## Key Elements

**$ARGUMENTS**: Replaced with user input after command name
**Skill loading**: Commands should load skills for methodology
**Clear kickoff**: End with concrete first steps to take

## Command vs Skill vs Agent

| Component | Invocation | Purpose |
|-----------|------------|---------|
| Command | `/name args` | Entry point, expands to prompt |
| Skill | Skill tool | Methodology and patterns |
| Agent | Task tool | Autonomous execution |

Commands are lightweight entry points that load skills.

## Examples

**Simple command** (`/debug`):
- Takes error/bug as argument
- Loads debugging skill
- Starts investigation process

**Analysis command** (`/simplify`):
- Takes proposed solution as argument
- Loads challenge-complexity skill
- Returns structured analysis

**Discovery command** (`/patternify`):
- Optional hint argument
- Loads patternify skill
- Scans conversation for patterns

## Naming Conventions

- Verb-based: `/debug`, `/simplify`, `/pathfind`
- Action-oriented: what user wants to happen
- Kebab-case for multi-word: `/skill-check`

## Anti-Patterns

- Command that doesn't load a skill (embed methodology in skill instead)
- Command with complex logic (that's an agent)
- Command that duplicates skill content (just reference skill)
