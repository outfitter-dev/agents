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
- `<phases>` — workflow phases
- `<workflow>` — core process loop
- `<rules>` — always/never constraints
- `<references>` — links to supporting docs

Keep content inside tags terse. Sacrifice grammar for concision where meaning is preserved.

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
  ✓ Uses ◇/◆/◆◆ indicators from complexity-analysis skill
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

## Markdown Links

Use short aliases for readability. Keep paths intact.

Prefer: `[filename.md](path/to/filename.md)`
Avoid: `[path/to/filename.md](path/to/filename.md)`

```text
# Good
- [confidence.md](references/confidence.md)
- [FORMATTING.md](../../shared/rules/FORMATTING.md)

# Avoid
- [references/confidence.md](references/confidence.md)
- [../../shared/rules/FORMATTING.md](../../shared/rules/FORMATTING.md)
```
