---
name: skills-dev
description: This skill should be used when creating skills, writing SKILL.md files, or when "create skill", "new skill", "validate skill", or "SKILL.md" are mentioned. Covers cross-platform Agent Skills specification.
metadata:
  version: "2.1.0"
  related-skills:
    - claude-skills
    - claude-plugins
    - claude-agents
    - codex-config
allowed-tools: Read Write Edit Grep Glob Bash TaskCreate TaskUpdate TaskList TaskGet AskUserQuestion
---

# Skills Development

Create skills that follow the [Agent Skills specification](https://agentskills.io/specification)—an open format supported by Claude Code, Cursor, VS Code, GitHub Copilot, Codex, and other agent products.

## Workflow

1. **Discovery** — Understand what the skill should do
2. **Archetype Selection** — Choose the best pattern
3. **Initialization** — Create skill structure
4. **Customization** — Tailor to specific needs
5. **Validation** — Verify quality before committing

## Stage 1: Discovery

Ask about the skill:

- What problem does this skill solve?
- What are the main capabilities?
- What triggers should invoke it? (phrases users would say)
- Where should it live? (personal, project, or plugin)

## Stage 2: Archetype Selection

| Archetype | Use When | Example |
|-----------|----------|---------|
| **simple** | Basic skill without scripts | Quick reference, style guide |
| **api-wrapper** | Wrapping external APIs | GitHub API, Stripe API |
| **document-processor** | Working with file formats | PDF extractor, Excel analyzer |
| **dev-workflow** | Automating development tasks | Git workflow, project scaffolder |
| **research-synthesizer** | Gathering and synthesizing information | Competitive analysis, literature review |

## Stage 3: Directory Structure

```
skill-name/
├── SKILL.md           # Required: instructions + metadata
├── scripts/           # Optional: executable code
├── references/        # Optional: documentation
└── assets/            # Optional: templates, resources
```

## Stage 4: Frontmatter Schema

```yaml
---
name: skill-name
description: What it does and when to use it. Include trigger keywords.
version: 1.0.0                         # optional, recommended
license: Apache-2.0                    # optional
compatibility: Requires git and jq     # optional
metadata:                              # optional
  author: your-org
  category: development
  tags: [testing, automation]
---
```

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | 2-64 chars, lowercase/numbers/hyphens, must match directory |
| `description` | Yes | 10-1024 chars, describes what + when |
| `version` | No | Semantic version (MAJOR.MINOR.PATCH) |
| `license` | No | License name or reference |
| `compatibility` | No | 1-500 chars, environment requirements |
| `metadata` | No | Object for custom fields |

**Note**: Platform-specific fields (e.g., Claude's `allowed-tools`, `user-invocable`) should be added per-platform. See [claude-code.md](references/claude-code.md) for Claude Code extensions.

### Custom Frontmatter

Custom fields **must** be nested under `metadata`:

```yaml
---
name: my-skill
description: ...
metadata:
  author: your-org
  version: "1.0"
  category: development
  tags: [typescript, testing]
---
```

Top-level custom fields are not allowed and may cause parsing errors.

### Description Formula

**[WHAT] + [WHEN] + [TRIGGERS]**

```yaml
description: Extracts text and tables from PDF files, fills forms, merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Checklist:**
- [ ] Explains WHAT (capabilities)
- [ ] States WHEN (trigger conditions)
- [ ] Includes 3-5 trigger KEYWORDS
- [ ] Uses third-person voice
- [ ] Under 200 words

## Stage 5: Validation

### Validation Checklist

#### A. YAML Frontmatter

- [ ] Opens with `---` on line 1, closes with `---`
- [ ] `name` and `description` present (required)
- [ ] Uses spaces, not tabs
- [ ] Special characters quoted

#### B. Naming

- [ ] Lowercase, numbers, hyphens only (1-64 chars)
- [ ] Matches parent directory name
- [ ] No `--`, leading/trailing hyphens
- [ ] No `anthropic` or `claude` in name

#### C. Description Quality

- [ ] WHAT: Explains capabilities
- [ ] WHEN: States "Use when..." conditions
- [ ] TRIGGERS: 3-5 keywords users would say
- [ ] Third-person voice (not "I can" or "you can")

#### D. Structure

- [ ] SKILL.md under 500 lines
- [ ] All referenced files exist
- [ ] No TODO/placeholder markers
- [ ] Progressive disclosure (details in `references/`)

### Report Format

```markdown
# Skill Check: {skill-name}

**Status**: PASS | WARNINGS | FAIL
**Issues**: {critical} critical, {warnings} warnings

## Critical (must fix)
1. {issue with fix}

## Warnings (should fix)
1. {issue with fix}

## Strengths
- {what's done well}
```

## Core Principles

### Concise is key

Context window is shared. Only include what the agent doesn't already know. Challenge each paragraph—does it justify its token cost?

### Third-person descriptions

Descriptions inject into system prompt:
- "Extracts text from PDFs"
- "I can help you extract text from PDFs"

### Progressive disclosure

Keep SKILL.md under 500 lines. Move details to:
- `references/` - Detailed docs, API references
- `scripts/` - Executable utilities (code never enters context)
- `assets/` - Templates, data files

Token loading:
1. **Metadata** (~100 tokens): name + description at startup
2. **Instructions** (<5000 tokens): SKILL.md body when activated
3. **Resources** (as needed): files loaded only when referenced

### Degrees of freedom

Match instruction specificity to task requirements:
- **High freedom** (text): Multiple valid approaches, use judgment
- **Medium freedom** (pseudocode): Preferred pattern with variation allowed
- **Low freedom** (scripts): Exact sequence required, no deviation

See [patterns.md](references/patterns.md) for detailed examples.

## Naming Requirements

- Lowercase letters, numbers, hyphens only
- Cannot start/end with hyphen or contain `--`
- Must match parent directory name
- Cannot contain `anthropic` or `claude`

**Recommended**: Gerund form (`processing-pdfs`, `reviewing-code`)

## Platform-Specific Guidance

Skills are cross-platform, but each tool has specific implementation details:

- **Claude Code**: See [claude-code.md](references/claude-code.md) for tool restrictions, testing, troubleshooting, and Claude-specific frontmatter extensions
- **Codex CLI**: See [codex.md](references/codex.md) for discovery paths, `$skill-name` invocation

See [implementations.md](references/implementations.md) for storage paths and [invocations.md](references/invocations.md) for activation patterns.

## References

- [steps-pattern.md](references/steps-pattern.md) - Composable skill workflows with dependencies
- [patterns.md](references/patterns.md) - Degrees of freedom, script design, variant organization
- [best-practices.md](references/best-practices.md) - Community patterns, testing strategies
- [quick-reference.md](references/quick-reference.md) - Fast checklist and one-liners
- [implementations.md](references/implementations.md) - Per-tool storage paths
- [invocations.md](references/invocations.md) - How tools activate skills
- [compatibility.md](references/compatibility.md) - Path compatibility matrix

## External Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [Best Practices Guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [skills-ref Validation Library](https://github.com/agentskills/agentskills/tree/main/skills-ref)
