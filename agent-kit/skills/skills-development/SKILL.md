---
name: skills-development
version: 1.3.0
description: This skill should be used when creating skills, writing SKILL.md files, or when "create skill", "new skill", "validate skill", or "SKILL.md" are mentioned.
user-invocable: true
allowed-tools: Read Write Edit Grep Glob Bash TodoWrite AskUserQuestion
---

# Skills Development

Create skills that follow the [Agent Skills specification](https://agentskills.io/specification)—an open format supported by Claude Code, Cursor, VS Code, GitHub, and other agent products.

## Workflow

1. **Discovery** — Understand what the skill should do
2. **Archetype Selection** — Choose the best pattern
3. **Initialization** — Create skill structure from template
4. **Customization** — Tailor to specific needs
5. **Validation** — Verify quality before committing

## Phase 1: Discovery

Ask about the skill:

- What problem does this skill solve?
- What are the main capabilities?
- What triggers should invoke it? (phrases users would say)
- Where should it live? (personal `~/.claude/skills/`, project `.claude/skills/`, or plugin)

## Phase 2: Archetype Selection

| Archetype | Use When | Example |
|-----------|----------|---------|
| **simple** | Basic skill without scripts | Quick reference, style guide |
| **api-wrapper** | Wrapping external APIs | GitHub API, Stripe API |
| **document-processor** | Working with file formats | PDF extractor, Excel analyzer |
| **dev-workflow** | Automating development tasks | Git workflow, project scaffolder |
| **research-synthesizer** | Gathering and synthesizing information | Competitive analysis, literature review |

Templates in `templates/skill-archetypes/`.

## Phase 3: Initialization

Run the init script:

```bash
bun run ${CLAUDE_PLUGIN_ROOT}/skills/skills-development/scripts/init-skill.ts <skill-name> <output-dir> --template <archetype>
```

**Output directories:**
- Personal: `~/.claude/skills/<skill-name>/`
- Project: `.claude/skills/<skill-name>/`
- Plugin: `<plugin-dir>/skills/<skill-name>/`

## Phase 4: Customization

### Directory Structure

```
skill-name/
├── SKILL.md           # Required: instructions + metadata
├── scripts/           # Optional: executable code
├── references/        # Optional: documentation
└── assets/            # Optional: templates, resources
```

### Frontmatter

```yaml
---
name: skill-name
description: What it does and when to use it. Include trigger keywords.
license: Apache-2.0                    # optional
compatibility: Requires git and jq     # optional
metadata:                              # optional
  author: your-org
  version: "1.0"
allowed-tools: Read Grep Glob          # optional, experimental
user-invocable: true                   # optional, makes skill a /command
---
```

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | 1-64 chars, lowercase/numbers/hyphens, must match directory |
| `description` | Yes | 1-1024 chars, describes what + when |
| `user-invocable` | No | Boolean, enables `/skill-name` command (Claude Code) |
| `license` | No | License name or reference |
| `compatibility` | No | 1-500 chars, environment requirements |
| `allowed-tools` | No | Space-delimited tool list (experimental) |
| `metadata` | No | Object for custom fields (see below) |

### user-invocable

When `user-invocable: true`, the skill becomes callable as a slash command:

```yaml
---
name: code-review
description: Reviews code for bugs and best practices...
user-invocable: true
---
```

Users can then invoke with `/code-review` instead of waiting for auto-activation. The skill content becomes the command prompt.

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

### Per-Archetype Customization

**api-wrapper:**
- Update `scripts/client.ts` with API endpoints
- Add auth instructions
- Create `references/endpoints.md` if API is large

**document-processor:**
- Update `scripts/process.ts` with format logic
- Add library dependencies
- Document supported operations

**dev-workflow:**
- Update `scripts/run.ts` with commands
- Add safety checks for destructive operations
- Document available commands

**research-synthesizer:**
- Define source priority order
- Specify output format
- Set citation style

## Phase 5: Validation

Validate before committing. Use the CLI or run checks manually:

```bash
skills-ref validate ./my-skill
```

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

### Review Checks

After validation passes, review for quality:

| Aspect | Check |
|--------|-------|
| **Discoverability** | Would Claude know when to activate? |
| **Conciseness** | Does each paragraph justify its token cost? |
| **Clarity** | Are instructions step-by-step and actionable? |

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

### Common Fixes

**Vague description:**
```yaml
# Before
description: Helps with PDF files

# After
description: Extracts text and tables from PDF files, fills forms, merges documents. Use when working with PDFs, forms, or document extraction.
```

**Wrong voice:**
```yaml
# Before
description: I can help you process data files

# After
description: Processes data files and converts between formats (CSV, JSON, XML). Use when working with data files or format conversion.
```

### Priority Levels

- **Critical**: Invalid YAML, missing required fields, broken references
- **Important**: Vague descriptions, wrong voice, missing triggers
- **Nice-to-have**: Additional examples, better organization

## Core Principles

### Concise is key

Context window is shared. Only include what the agent doesn't already know. Challenge each paragraph—does it justify its token cost?

### Third-person descriptions

Descriptions inject into system prompt:
- ✓ "Extracts text from PDFs"
- ✗ "I can help you extract text from PDFs"

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

## Tool Restrictions

Use `allowed-tools` to limit capabilities (experimental):

```yaml
# Read-only
allowed-tools: Read Grep Glob

# With shell access
allowed-tools: Bash(git:*) Bash(jq:*) Read

# Full access (default)
# Omit field entirely
```

## After Creation

1. **Validate**: Run Phase 5 checklist or `skills-ref validate`
2. **Test**: Ask a question that should trigger it
3. **Iterate**: Fix issues until passing
4. **Share**: Commit to git or distribute via plugin

## Troubleshooting

```bash
# Find all skills
find ~/.claude/skills .claude/skills -name "SKILL.md" 2>/dev/null

# Check for tab characters (YAML requires spaces)
grep -P "\t" SKILL.md

# Find broken markdown links
grep -oE '\[[^]]+\]\([^)]+\)' SKILL.md | while read link; do
  file=$(echo "$link" | sed 's/.*(\(.*\))/\1/')
  [ ! -f "$file" ] && echo "Missing: $file"
done
```

## References

- [patterns.md](references/patterns.md) - Degrees of freedom, script design, variant organization, writing patterns
- [best-practices.md](references/best-practices.md) - Community patterns, testing strategies, advanced techniques
- [quick-reference.md](references/quick-reference.md) - Fast checklist and one-liners
- [implementations.md](references/implementations.md) - Per-tool storage paths
- [invocations.md](references/invocations.md) - How tools activate skills
- [compatibility.md](references/compatibility.md) - Path compatibility matrix

## Platform-Specific Implementation

Each tool has specific implementation details beyond the common spec:

- **Claude Code**: [claude.md](references/claude.md) - Tool restrictions syntax, `--debug` testing, troubleshooting, command/hook integration
- **Codex CLI**: [codex.md](references/codex.md) - Discovery paths, `$skill-name` invocation, AGENTS.md relationship, feature flags, built-in skills

See [implementations.md](references/implementations.md) for storage paths and platform-specific notes.

## External Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [Best Practices Guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [skills-ref Validation Library](https://github.com/agentskills/agentskills/tree/main/skills-ref)
