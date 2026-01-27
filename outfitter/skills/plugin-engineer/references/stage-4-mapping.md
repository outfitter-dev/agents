# Stage 4: Mapping

Choose the right component for each pattern.

**Goal**: Map patterns to Claude Code components.

**Skill**: Load `outfitter:codify`

## Decision Tree

```
Is it a multi-step process with stages?
├─ Yes → Does it need tool restrictions?
│        ├─ Yes → Skill (with allowed-tools)
│        └─ No → Skill
└─ No → Is it a simple entry point?
         ├─ Yes → Command (can load Skill)
         └─ No → Is it autonomous/long-running?
                  ├─ Yes → Agent
                  └─ No → Is it reactive to events?
                           ├─ Yes → Hook
                           └─ No → Probably doesn't need codifying
```

## Component Comparison

| Aspect | Skill | Command | Hook | Agent |
|--------|-------|---------|------|-------|
| Invocation | Auto or `/skill` | `/command` | Event-triggered | Task tool |
| Context | Inherit or fork | Main context | Script execution | Isolated |
| Complexity | Medium-high | Low-medium | Low | High |
| Use case | Methodology | Entry point | Automation | Orchestration |

## Common Combos

**Skill + Command**:
Skill holds methodology, command provides entry point.

```
commands/deploy.md → loads → skills/deployment/SKILL.md
```

**Skill + Hook**:
Skill defines process, hook triggers automatically.

```
hooks/on-commit → loads → skills/commit-checks/SKILL.md
```

**Agent + Skills**:
Agent orchestrates, skills provide methodology.

```
agents/developer.md → loads → skills/tdd/SKILL.md
```

## Output

Create `artifacts/plugin-engineer/mapping.md`:

```markdown
# Component Mapping: {REPO_NAME}

## Skills
- {SKILL_NAME}: {PATTERN} → {RATIONALE}

## Commands
- {COMMAND_NAME}: {PURPOSE}

## Hooks
- {HOOK_TYPE}: {TRIGGER} → {ACTION}

## Agents
- {AGENT_NAME}: {ORCHESTRATION_SCOPE}
```

## Next Stage

Proceed to [Stage 5: Authoring](stage-5-authoring.md) to create components.
