# Steps Pattern

Composable building blocks for skill workflows. Use when skills depend on other skills or have clear sequential stages.

## Basic Structure

```markdown
# Skill Name

## Steps

1. Load the `plugin:prerequisite-skill` skill
2. { main action }
3. { next action }
```

Place `## Steps` immediately after the H1 title, before any other content.

## Syntax

### Loading Skills

```markdown
1. Load the `outfitter:skills-dev` skill
```

Always use the full `plugin:skill-name` format. Never link to SKILL.md files.

### Conditional Steps

```markdown
3. If working with TypeScript, load the `outfitter:typescript-dev` skill
4. If tests fail, load the `outfitter:debugging` skill
```

Conditions should be brief and contextual.

### Action Steps

```markdown
2. Analyze the codebase structure
5. Generate the implementation plan
```

Use imperative voice, drop articles, keep brief.

### Delegated Skills (Agent-Handled)

Skills with `context: fork` + `agent` delegate work to agents rather than loading instructions into the current context. Use "delegate by loading" language:

```markdown
3. Delegate by loading the `outfitter:security-audit` skill for vulnerability analysis
4. Delegate by loading the `outfitter:codebase-recon` skill for deep analysis
```

**Key difference**:
- `Load the skill` → instructions enter current context
- `Delegate by loading the skill` → agent runs in isolated context, returns results

Delegated skills are defined with:

```yaml
---
name: security-audit
context: fork
agent: outfitter:reviewer
model: sonnet
---
```

When referenced in Steps, make the delegation explicit so readers understand work happens in a subagent.

### Branching Workflows

```markdown
## Steps

1. Load the `outfitter:codebase-recon` skill
2. Investigate the problem area
3. Based on findings:
   - If pattern issue → load `outfitter:patterns` skill
   - If root cause needed → load `outfitter:find-root-causes` skill
   - If ready to report → load `outfitter:report-findings` skill
```

### Plan Mode and User Questions

Use Plan mode and AskUserQuestion for workflows that need user input or have decision points:

```markdown
## Steps

1. Delegate by loading the `outfitter:claude-plugin-audit` skill for analysis
2. Apply auto-fixable issues
3. Enter Plan mode
4. Present remaining issues with AskUserQuestion
```

**Why Plan mode?** Claude thinks more carefully and presents options sequentially. Good for:
- Transitioning from automated to manual work
- Complex decisions requiring user input
- Presenting multiple options with tradeoffs

### Brainstorming with Plan Agent

For complex problems benefiting from multiple perspectives:

```markdown
## Steps

1. Gather initial context
2. Brainstorm with Plan agent for approaches
3. Present options with AskUserQuestion
4. Implement chosen approach
```

The Plan agent (`subagent_type: Plan`) explores the problem space independently, returning with considered options. Gets more than one "mind" on the problem before committing to an approach.

## Examples

### Extension Skill (claude-skills)

```markdown
# Claude Code Skills

## Steps

1. Load the `outfitter:skills-dev` skill
2. Apply Claude Code-specific extensions from this skill
```

Simple two-step: load base, extend with specifics.

### Research Workflow

```markdown
# Technical Research

## Steps

1. Load the `outfitter:codebase-recon` skill
2. Gather evidence from codebase
3. If external research needed, use WebSearch/WebFetch
4. Load the `outfitter:report-findings` skill
5. Synthesize into structured report
```

Linear workflow with conditional mid-step.

### Debugging Workflow

```markdown
# Debugging

## Steps

1. Load the `outfitter:find-root-causes` skill
2. Investigate with systematic diagnosis
3. If code-level issue, apply fix
4. If architectural issue, load the `outfitter:architecture` skill
5. Validate fix resolves the issue
```

Branching based on diagnosis outcome.

### TDD Workflow

```markdown
# Test-Driven Development

## Steps

1. Write failing test (Red)
2. Implement minimal code to pass (Green)
3. Load the `outfitter:simplify` skill
4. Refactor while keeping tests green
5. Repeat from step 1 for next requirement
```

Cyclical workflow with embedded skill.

### Security Review with Delegated Skill

```markdown
# Pre-Merge Security Check

## Steps

1. Gather changed files from PR
2. Delegate by loading the `outfitter:security-audit` skill for vulnerability scan
3. Review findings and severity levels
4. If critical issues, block merge with explanation
5. If clean, approve with security sign-off
```

The `security-audit` skill has `context: fork` and `agent: outfitter:reviewer`, so step 2 delegates to a subagent. Results return to main context for steps 3-5.

## Guidelines

### Keep Steps Brief

Each step should be one line. If a step needs explanation, the detail belongs in the skill body, not the steps.

```markdown
# Good
2. Analyze authentication patterns

# Bad
2. Analyze authentication patterns including OAuth flows, JWT handling,
   session management, and credential storage
```

### 3-6 Steps Ideal

- Fewer than 3: probably doesn't need Steps section
- More than 6: consider splitting into stages or separate skills

### Steps vs Workflow Tag

| Use `## Steps` | Use `<workflow>` tag |
|----------------|---------------------|
| Dependencies on other skills | Self-contained process |
| High-level orchestration | Detailed methodology |
| Composable building blocks | Single-skill workflow |

Can combine both: Steps for orchestration, `<workflow>` for detail within a step.

### Steps vs Stages

Steps are for the top-level flow. Stages are for detailed breakdown within the skill body.

```markdown
# Skill Name

## Steps

1. Load prerequisite skill
2. Execute Stage 1-3 below
3. Load synthesis skill

## Stage 1: Discovery
{ detailed content }

## Stage 2: Analysis
{ detailed content }

## Stage 3: Output
{ detailed content }
```

## Anti-Patterns

### Linking to SKILL.md

```markdown
# Wrong
1. See [skills-dev](../skills-dev/SKILL.md) for base patterns

# Right
1. Load the `outfitter:skills-dev` skill
```

### Verbose Steps

```markdown
# Wrong
1. First, you should load the skills-dev skill which provides the base
   Agent Skills specification that this skill extends

# Right
1. Load the `outfitter:skills-dev` skill
```

### Steps That Are Just Headers

```markdown
# Wrong - these are stages, not steps
## Steps
1. Discovery
2. Analysis
3. Synthesis

# Right - actionable steps
## Steps
1. Load the `outfitter:codebase-recon` skill
2. Investigate problem area
3. Load the `outfitter:report-findings` skill
```

### Too Many Steps

```markdown
# Wrong - this is a detailed workflow, not steps
## Steps
1. Read the error message
2. Check the stack trace
3. Find the failing line
4. Read surrounding context
5. Form hypothesis
6. Add logging
7. Reproduce issue
8. Verify hypothesis
9. Implement fix
10. Run tests

# Right - high-level steps, detail in body
## Steps
1. Load the `outfitter:find-root-causes` skill
2. Diagnose with systematic investigation
3. Implement and validate fix
```
