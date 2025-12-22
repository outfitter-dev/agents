# Skill Naming Standardization

**Date**: 2025-12-22
**Scope**: All skills in `baselayer/skills/`

## Summary

Standardized all 18 skill names to use kebab-case consistently. Both directory names and YAML frontmatter `name:` fields now follow the same convention.

## Naming Patterns Applied

| Pattern | Examples |
|---------|----------|
| `*-dev` | bun-dev, hono-dev, react-dev, typescript-dev |
| `*-engineering` | software-engineering, performance-engineering, security-engineering |
| `*-authoring` / `*-check` | skills-authoring, skills-check, subagent-authoring, subagent-check |
| Descriptive | test-driven-development, debugging-and-diagnosis, research-and-report |

## Complete Rename List

| Old Name | New Name |
|----------|----------|
| senior-developer | software-engineering |
| architect | software-architecture |
| expertise-performance | performance-engineering |
| expertise-security | security-engineering |
| typescript-development | typescript-dev |
| dev-bun | bun-dev |
| dev-hono | hono-dev |
| dev-react | react-dev |
| tdd | test-driven-development |
| analysis | investigation |
| fresh-eyes-review | code-review |
| debugging | debugging-and-diagnosis |
| challenge-complexity | complexity-analysis |
| skill-authoring | skills-authoring |
| skill-check | skills-check |
| agent-authoring | subagent-authoring |
| agent-check | subagent-check |
| research | research-and-report |

## Cross-References Updated

Each rename included updates to all files referencing the old name:
- `baselayer/README.md` — skills table
- `baselayer/agents/*.md` — agent skill loading references
- `.claude/rules/*.md` — SUBAGENTS.md, COMMANDS.md, FORMATTING.md
- Other `SKILL.md` files with cross-skill references
- `.agents/plans/` documentation

## Notes

- `test-driven-development` keeps "tdd" in description for discoverability
- `subagent-*` naming aligns with Claude Code terminology (subagents vs agents)
- `skills-*` plural form distinguishes from singular skill references
