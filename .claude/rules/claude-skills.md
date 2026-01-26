---
paths:
  - "**/SKILL.md"
  - "**/skills/**/*.md"
---

# Skill Development

When creating or modifying skill files, load the `outfitter:skills-dev` skill for comprehensive guidance on skill structure, frontmatter, progressive disclosure, and formatting conventions.

For Claude Code-specific features (allowed-tools, context modes, arguments), load the `outfitter:claude-skills` skill.

## Skill References

When referencing skills in documentation:

| Skill Type | Language | Example |
|------------|----------|---------|
| Standard | "Load the skill" | Load the `outfitter:skills-dev` skill |
| Delegated (`context: fork` + `agent`) | "Delegate by loading" | Delegate by loading the `outfitter:security-audit` skill |

**Never** link to SKILL.md files. Always use the load/delegate pattern with backticks.
