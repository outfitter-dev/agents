---
name: Discover Skills
description: Discovers and recommends available skills based on user queries or task context. Searches across user, project, and plugin sources with intelligent filtering. Use when exploring available capabilities, searching for skills by keyword, looking for the right skill for a task, or when "find skills", "what skills", "available skills", "list skills", or `--find-skills` flag are mentioned.
---

# Discover Skills

Discovers available skills and recommends the most relevant ones based on user intent or task context.

## Quick Start

When a user asks about available skills or you need to find a skill for a specific task:

1. **Understand the query** - What capability is needed?
2. **Run discovery** - Use the /skills command with appropriate filters
3. **Analyze results** - Match skills to the user's actual need
4. **Recommend** - Suggest the most relevant skill(s) with reasoning

## Usage Patterns

### User wants to see all skills

```bash
/skills --text
```

### User wants skills from specific source

```bash
# Personal skills only
/skills --source user --text

# Project skills only
/skills --source project --text

# Plugin skills only
/skills --source plugin --text
```

### User wants skills from specific plugin

```bash
# Skills from superpowers plugin
/skills --plugin superpowers --text

# Skills from specific marketplace
/skills --marketplace superpowers-marketplace --text
```

### Agent needs structured data

```bash
# JSON for programmatic analysis
/skills --json

# Agent-optimized markdown
/skills --agent
```

## Output Formats

- `--text` - Human-readable text (default, best for user display)
- `--json` - Machine-readable JSON (best for programmatic filtering)
- `--agent` - Markdown optimized for AI agents (best for analysis)

## Discovery Strategy

### For broad queries ("what skills are available?")

1. List all skills with `--text` format
2. Group by source (user, project, plugin)
3. Highlight most commonly used skills
4. Suggest using filters for narrowing

### For specific needs ("I need a skill for X")

1. Run with `--json` to get structured data
2. Parse descriptions for keyword matches
3. Rank by relevance to user's task
4. Present top 2-3 matches with reasoning
5. Explain what each skill does and when to use it

### For exploration ("what can superpowers do?")

1. Filter by plugin: `--plugin superpowers`
2. Use `--text` for readability
3. Categorize by capability type
4. Suggest related skills from other sources

## Response Format

When recommending skills to users:

**Found multiple relevant skills:**
```
I found [N] skills that might help with [task]:

1. **[Skill Name]** - [What it does]
   - Use when: [Specific trigger conditions]
   - Source: [user/project/plugin]

2. **[Skill Name]** - [What it does]
   - Use when: [Specific trigger conditions]
   - Source: [user/project/plugin]

The best match for your task is [Skill Name] because [reasoning].
```

**Found one clear match:**
```
I found the perfect skill for [task]:

**[Skill Name]** - [What it does]
- Use when: [Specific trigger conditions]
- Source: [user/project/plugin]

Would you like me to use this skill now?
```

**No exact matches:**
```
I searched [N] available skills but didn't find an exact match for [task].

The closest options are:
1. **[Skill Name]** - [How it's related]
2. **[Skill Name]** - [How it's related]

Would you like to:
- Use one of these skills?
- Create a new skill for this task?
- Proceed without a specialized skill?
```

## Common Questions

**"What skills do I have?"**
→ List user skills: `--source user --text`

**"What skills are in this project?"**
→ List project skills: `--source project --text`

**"What can the superpowers plugin do?"**
→ Filter plugin: `--plugin superpowers --text`

**"Show me everything"**
→ All skills: `--text` (no filters)

**"I need data to analyze"**
→ Structured output: `--json` or `--agent`

## Integration with Other Skills

This skill works well with:
- **agent-skill-authoring** - After finding gaps, create new skills
- **agent-skill-validation** - Validate skills before adding them
- **agent-skill-review** - Improve existing skills you discover

## Best Practices

1. **Match user intent** - Don't just list, recommend based on need
2. **Explain reasoning** - Why is this skill relevant?
3. **Provide context** - When should they use it vs. alternatives?
4. **Group logically** - By capability, source, or relevance
5. **Stay current** - Skills may have been added recently

## Examples

### Example 1: User exploring capabilities

**User**: "What skills are available?"

**Response**:
```
Let me show you all available skills:

[Run: /skills --text]

I found 35 skills across three sources:
- 16 personal skills (your custom capabilities)
- 3 project skills (team workflows)
- 16 plugin skills (from installed plugins)

Some frequently used skills:
- **brainstorming** - Clarifies requirements through Q&A
- **test-driven-development** - Implements features with TDD
- **systematic-debugging** - Structured bug investigation

Would you like me to filter by a specific category?
```

### Example 2: Finding skill for specific task

**User**: "I need help debugging a failing test"

**Response**:
```
Let me find the right skill for debugging:

[Run: /skills --json]
[Parse results for "debug", "test", "bug" keywords]

I found the perfect skill for this:

**systematic-debugging** - Four-phase framework (root cause investigation,
pattern analysis, hypothesis testing, implementation) that ensures
understanding before attempting solutions.

This skill will:
1. Investigate the root cause of the test failure
2. Analyze patterns in the failure
3. Test hypotheses before proposing fixes
4. Implement the solution systematically

Should I use this skill to debug your failing test?
```

### Example 3: Exploring plugin capabilities

**User**: "What does the superpowers plugin provide?"

**Response**:
```
Let me show you all superpowers capabilities:

[Run: /skills --plugin superpowers --text]

The superpowers plugin provides 16 skills organized by workflow:

**Development Workflows:**
- test-driven-development - TDD methodology
- systematic-debugging - Structured debugging framework
- subagent-driven-development - Task delegation to subagents

**Code Quality:**
- requesting-code-review - Pre-merge verification
- receiving-code-review - Rigorous review response
- defense-in-depth - Multi-layer validation

**Planning & Design:**
- brainstorming - Collaborative design refinement
- executing-plans - Batch execution with checkpoints
- writing-plans - Detailed implementation plans

Would you like details on any specific skill?
```

## Troubleshooting

**Empty results:**
- Check if skills exist in expected locations
- Verify directory permissions

**Skills not appearing:**
- Check YAML frontmatter is valid
- Verify `name` and `description` fields exist
- Ensure file is named `SKILL.md`

For more details on skill structure, see the agent-skill-authoring skill.
