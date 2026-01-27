# Stage 5: Authoring

Create high-quality components.

**Goal**: Build skills, commands, hooks, and agents.

**Skills**: Load per component type (see below).

## Skill Authoring

Load `outfitter:skills-dev` for base patterns, `outfitter:claude-skills` for Claude-specific features.

**Frontmatter Template**:

```yaml
---
name: tool-name-action
description: Does X when Y. Use when "trigger phrase", "another trigger".
metadata:
  version: "1.0.0"
  source-repo: owner/repo
allowed-tools: Read Grep Glob Bash(tool-name *)
---
```

**Body Structure**:

```markdown
# Skill Name

Brief purpose statement.

## Steps

1. First action
2. If condition, do X
3. Final action

<when_to_use>
Trigger conditions
</when_to_use>

<workflow>
Detailed process
</workflow>

<rules>
ALWAYS/NEVER constraints
</rules>
```

## Command Authoring

Load `outfitter:claude-commands`.

**Simple Command**:

```markdown
---
description: Run tool-name with common options
argument-hint: [target]
---

Run tool-name on $ARGUMENTS with sensible defaults.
```

**Command Loading Skill**:

```markdown
---
description: Deploy using deployment workflow
---

Load the deployment skill and apply to current project.
```

## Hook Authoring

Load `outfitter:claude-hooks`.

**Common Triggers**:

| Hook Type | Use Case |
|-----------|----------|
| PreToolUse | Validate before file changes |
| PostToolUse | Run after successful operations |
| Stop | Cleanup on session end |

## Agent Authoring

Load `outfitter:claude-agents`.

Only create agents for complex orchestration. Most plugins don't need custom agents.

## Output

Create components in `artifacts/plugin-engineer/components/`:

```
components/
├── skills/
│   └── my-skill/
│       └── SKILL.md
├── commands/
│   └── my-command.md
└── hooks/
    └── hooks.json
```

## Next Stage

Proceed to [Stage 6: Packaging](stage-6-packaging.md) when components are ready.
