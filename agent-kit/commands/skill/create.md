---
description: Create a new Claude skill with guided workflow and archetype templates (api-wrapper, document-processor, dev-workflow, research-synthesizer)
argument-hint: Optional skill name or archetype
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, TodoWrite, AskUserQuestion, Skill
---

# Create Claude Skill

Guided workflow for creating high-quality Claude skills using proven archetype templates.

## Prerequisites

**Load skill-development knowledge** (if plugin-dev is installed):

Before starting, use the Skill tool to load `plugin-dev:skill-development` for comprehensive skill authoring guidance. This provides:
- Skill structure best practices
- Progressive disclosure principles
- Description writing guidelines
- Trigger phrase optimization

If plugin-dev is not available, this command provides standalone templates and workflows.

## Workflow Overview

1. **Discovery** - Understand what the skill should do
2. **Archetype Selection** - Choose the best pattern for the use case
3. **Initialization** - Create skill structure from template
4. **Customization** - Tailor the skill to specific needs
5. **Validation** - Verify skill quality before committing

## Phase 1: Discovery

Ask the user about the skill they want to create:

**Key Questions:**
- What problem does this skill solve?
- What are the main capabilities?
- What triggers should invoke this skill? (phrases users would say)
- Where should it live? (personal `~/.claude/skills/`, project `.claude/skills/`, or plugin)

If user provided a skill name or description in the command, use it as context.

## Phase 2: Archetype Selection

Based on discovery, recommend an archetype:

### Available Archetypes

| Archetype | Use When | Example |
|-----------|----------|---------|
| **api-wrapper** | Wrapping external APIs (REST, GraphQL) | GitHub API, Stripe API |
| **document-processor** | Working with file formats (PDF, DOCX, XLSX) | PDF extractor, Excel analyzer |
| **dev-workflow** | Automating development tasks (git, CI, scaffolding) | Git workflow, project scaffolder |
| **research-synthesizer** | Gathering and synthesizing information | Competitive analysis, literature review |
| **simple** | Basic skill without scripts | Quick reference, style guide |

**Present options to user:**
```
Based on your description, I recommend the [archetype] pattern because [reasoning].

Alternatives:
- [archetype]: [when to use instead]
- [archetype]: [when to use instead]

Which archetype would you like to use?
```

## Phase 3: Initialization

Run the init script with the chosen archetype:

```bash
bun run ${CLAUDE_PLUGIN_ROOT}/scripts/init-skill.ts <skill-name> <output-dir> --template <archetype>
```

**Output directories by location:**
- Personal: `~/.claude/skills/<skill-name>/`
- Project: `.claude/skills/<skill-name>/`
- Plugin: `<plugin-dir>/skills/<skill-name>/`

If no template matches, create a minimal skill:

```bash
bun run ${CLAUDE_PLUGIN_ROOT}/scripts/init-skill.ts <skill-name> <output-dir>
```

## Phase 4: Customization

After initialization, guide the user through customization:

### 4.1 Frontmatter

The most critical part. Guide the user to craft a strong description:

```yaml
---
name: skill-name
description: [WHAT it does]. Use when [WHEN to use it]. Supports [CAPABILITIES]. Triggers: [KEYWORDS users would say].
---
```

**Description Checklist:**
- [ ] Explains WHAT (capabilities)
- [ ] States WHEN (trigger conditions)
- [ ] Includes 3-5 trigger KEYWORDS
- [ ] Uses third-person voice
- [ ] Under 200 words
- [ ] Specific, not vague

### 4.2 Body Content

Replace placeholders in SKILL.md:

1. **Quick Start** - Fastest path to value (3-5 lines)
2. **Workflows** - Step-by-step for each use case
3. **Scripts** - Document any scripts in `scripts/`

### 4.3 Supporting Files

Based on archetype, customize:

**api-wrapper:**
- Update `scripts/client.ts` with actual API endpoints
- Add auth instructions to SKILL.md
- Create `references/endpoints.md` if API is large

**document-processor:**
- Update `scripts/process.ts` with format-specific logic
- Add library dependencies to Requirements section
- Document supported operations

**dev-workflow:**
- Update `scripts/run.ts` with workflow commands
- Add safety checks for destructive operations
- Document all available commands

**research-synthesizer:**
- Define source priority order
- Specify output format
- Set citation style

## Phase 5: Validation

Before completing, validate the skill:

```bash
bun run ${CLAUDE_PLUGIN_ROOT}/scripts/validate-skill.sh <skill-dir>
```

Or use the validate-claude-skill skill for comprehensive checks.

**Validation Checklist:**
- [ ] YAML frontmatter is valid
- [ ] Description is high-quality
- [ ] SKILL.md under 500 lines
- [ ] All referenced files exist
- [ ] No TODO/placeholder markers remain
- [ ] Scripts are executable (if any)

## Completion

When all phases complete:

1. Show the created skill structure
2. Highlight next steps (test, iterate, commit)
3. Suggest running `validate-claude-skill` for comprehensive review
4. If plugin skill, remind to update plugin.json if needed

## Example Session

**User:** `/claude-dev:skill:create github-issues`

**Assistant:**
1. Asks clarifying questions about GitHub issues skill
2. Recommends `api-wrapper` archetype
3. Runs init-skill.ts with api-wrapper template
4. Guides through customizing for GitHub API
5. Validates the result
6. Shows final structure and next steps

## Template Locations

Templates are in `${CLAUDE_PLUGIN_ROOT}/templates/skill-archetypes/`:

```
skill-archetypes/
├── api-wrapper/
│   ├── SKILL.md
│   └── scripts/
│       └── client.ts
├── document-processor/
│   ├── SKILL.md
│   └── scripts/
│       └── process.ts
├── dev-workflow/
│   ├── SKILL.md
│   └── scripts/
│       └── run.ts
├── research-synthesizer/
│   └── SKILL.md
└── simple/
    └── SKILL.md
```

## Related Commands

- `/claude-dev:skill:validate` - Validate skill structure (future)
- `/claude-dev:skill:package` - Package skill for distribution (future)
