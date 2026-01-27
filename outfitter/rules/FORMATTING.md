# Formatting Conventions

## Markdown in Instructions

Avoid `**bold**` and other emphasis markers in skill/instruction text unless explicitly formatting output. Claude doesn't need visual emphasis to understand importance — the words themselves convey it.

**Use markdown when**: formatting actual output, examples, or user-facing content
**Skip markdown when**: writing instructions, rules, or guidance for Claude

## Concision Principle

Sacrifice grammar for concision — drop articles, filler words, verbose phrases. But don't strip meaning or context. Goal is density, not minimalism. If removing a word makes the instruction ambiguous, keep it.

Good: "Ask one question, wait for response"
Bad: "Ask question wait response"

## Variables and Placeholders

**Variables** — all caps, no spaces, curly braces:
- `{VARIABLE}` — concrete placeholder to be replaced
- Examples: `{N}`, `{REASON}`, `{BAR}`, `{NAME}`, `{FILE_PATH}`

**Instructional prose** — lowercase, spaces inside braces:
- `{ description of what goes here }` — guidance for what to fill in
- Examples: `{ question text }`, `{ why it matters }`, `{ if needed }`

## XML Tags in Skills

Use XML tags for structural sections in skill files:
- `<when_to_use>` — trigger conditions
- `<confidence>` — confidence levels/tracking
- `<stages>` — workflow stages
- `<workflow>` — core process loop
- `<rules>` — always/never constraints
- `<references>` — links to supporting docs

Keep content inside tags terse. Sacrifice grammar for concision where meaning is preserved.

**GitHub rendering**: Add blank lines after opening tags and before closing tags. Without them, content renders incorrectly on GitHub.

```markdown
<!-- Good -->
<rules>

- First rule
- Second rule

</rules>

<!-- Bad — won't render properly on GitHub -->
<rules>
- First rule
- Second rule
</rules>
```

## Markdown Tables

Use markdown tables for structured data. Ensure the table is properly formatted with the correct number of columns and rows.

```markdown
| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Data 1   | Data 2   | Data 3   |
```

Ensure pipes are properly aligned with spaces surrounding text or hyphens, at least between the header and separator rows. If pipes are used within a cell, ensure they are properly escaped.

## Indicators

Prefer ASCII/Unicode over emoji for terminal output (Claude Code, CLI, interactive sessions). Emoji acceptable in docs or user-facing content where rendering is reliable.

### Progress

- `░` — empty (light shade)
- `▓` — filled (medium shade)
- Example: `▓▓▓░░` = 3/5
- Use for confidence, completion, capacity — anything with discrete levels

### Severity

Escalating:

- `◇` — minor/informational
- `◆` — moderate/warning
- `◆◆` — severe/blocking
- Use for pushback, risk, alerts, uncertainty levels

### Caveats

- `△` — incomplete/uncertain (warning triangle U+25B3)
- **Mid-stream**: `△` + description — flags issue for immediate attention
- **At delivery**: `△ Caveats` — summary section of gaps, unknowns, assumptions, concerns, deferred items

### Checkmarks

- `✓` — completed/decided (U+2713)
- Use for "Decisions Made:" lists, completed items, confirmed choices
- Example:

  ```text
  Decisions Made:
  ✓ /simplify offers two modes: quick (skill) vs deep (agent)
  ✓ Agent returns: complexity identified + alternatives + escalation level
  ✓ Uses ◇/◆/◆◆ indicators from simplify skill
  ```

### Emphasis

Append to text:

- `★` — recommended/preferred

## Interactive Questions

For multi-option questions in skills:

- Use `EnterPlanMode` — enables keyboard navigation
- **Prose above tool**: context, "why it matters"
- **Inside tool**: options with inline recommendation marker
- Always include escape hatch: "5. Something else — { brief prompt }"

### Inline Recommendations

Mark recommended option inline with `[★]` + emphasized rationale:

```text
1. Google only [★] — simplest, highest coverage *good starting point, expand later*
2. Google + GitHub — covers consumer and developer users
3. Google + GitHub + Microsoft — comprehensive, more maintenance
```

Pattern: `N. Option name [★] — brief description *why recommended*`

- `[★]` visually distinguishes the recommendation
- `*italicized rationale*` provides quick reasoning
- Everything scannable in one place

## Tasks

Give tasks friendly, context-specific descriptions instead of generic stage names. The description should tell the user what's actually happening.

**Prefer**:

```text
- [x] Consider skills to load
- [ ] Prep auth system requirements
- [ ] Explore authentication approaches
- [ ] Clarify platform and fallback needs
- [ ] Deliver implementation plan
```

**Avoid**:

```text
- [ ] Gather Context
- [ ] Synthesize Requirements
- [ ] Provide Deliverables
```

## Skill References

When referencing skills in documentation, use specific language based on skill type:

| Skill Type | Language | Example |
|------------|----------|---------|
| Standard | "Load the skill" | Load the `outfitter:skills-dev` skill |
| Delegated (`context: fork` + `agent`) | "Delegate by loading" | Delegate by loading the `outfitter:security-audit` skill |

**Standard skills** load instructions into the current context. The agent continues with those instructions available.

**Delegated skills** hand off work to a subagent. The subagent runs in isolation and returns results.

**Format**: Always use backticks for skill names: `` `plugin:skill-name` ``

**Never**: Link to SKILL.md files. Always use the load/delegate pattern.

```markdown
# Wrong
See [skills-dev](../skills-dev/SKILL.md) for patterns.

# Right
Load the `outfitter:skills-dev` skill for patterns.
```

## Steps in Skills

Use a `## Steps` section for composable skill workflows. Place immediately after the H1 title.

```markdown
## Steps

1. Load the `plugin:prerequisite-skill` skill
2. { main action for this skill }
3. If { condition }, load the `plugin:conditional-skill` skill
4. { final action or output }
```

**Pattern rules**:

- Numbered list (order matters)
- Skill references use: `Load the \`plugin:skill-name\` skill`
- Conditional steps: `If { condition }, load...` or `If { condition }, { action }`
- Action descriptions: brief, imperative, no articles
- Keep to 3-6 steps; split into stages if longer

**Delegated skills**: See "Skill References" section above for load vs delegate language.

**Plan mode and questions**: Use for decision points and user input:

```markdown
5. Enter Plan mode
6. Present options with AskUserQuestion
```

**Brainstorming**: For complex problems, get multiple perspectives:

```markdown
2. Brainstorm with Plan agent for approaches
```

**When to use**:

- Skill depends on another skill being loaded first
- Workflow has clear sequential stages
- Steps can branch based on context

**When to skip**:

- Single-purpose skills with no dependencies
- Skills where workflow is the entire body (use `<workflow>` tag instead)

## Markdown Links

Use short aliases for readability. Keep paths intact.

Prefer: `[filename.md](path/to/filename.md)`
Avoid: `[path/to/filename.md](path/to/filename.md)`

```text
# Good
- [confidence.md](references/confidence.md)
- [FORMATTING.md](../rules/FORMATTING.md)

# Avoid
- [references/confidence.md](references/confidence.md)
- [../rules/FORMATTING.md](../rules/FORMATTING.md)
```
