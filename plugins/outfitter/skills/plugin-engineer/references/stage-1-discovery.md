# Stage 1: Discovery

External research before analyzing code.

**Goal**: Understand the tool from a user's perspective.

**Skill**: Load `outfitter:research`

## What to Gather

| Category | Sources | Questions |
|----------|---------|-----------|
| Official Docs | README, docs site, man pages | What's the intended workflow? |
| API Reference | Function docs, CLI help | What's the public surface? |
| Community | Tutorials, Stack Overflow, Discord | What do users struggle with? |
| Integrations | Existing plugins, wrappers | What's already automated? |

## Research Patterns by Repo Type

**CLI Tool**:
1. Start with `--help` output
2. Find official docs or man pages
3. Search GitHub issues for "workflow", "automation", "script"
4. Look for shell scripts that wrap the tool

**Library/SDK**:
1. API reference documentation
2. Getting started guides
3. Example repositories
4. Community extensions

**MCP Server**:
1. Protocol documentation
2. Existing client implementations
3. Tool manifest and capabilities
4. Common integration patterns

## Red Flags

- No documentation → requires deep code analysis
- Rapid version churn → watch for breaking changes
- Abandoned project → consider maintenance burden

## Output

Create `artifacts/plugin-engineer/discovery.md`:

```markdown
# Discovery: {REPO_NAME}

## Documentation
- Official docs: {LINKS}
- API reference: {LINKS}

## Community Patterns
- {PATTERN}: {DESCRIPTION}

## Pain Points
- {ISSUE}: {FREQUENCY}

## Existing Integrations
- {NAME}: {PURPOSE}
```

## Next Stage

Proceed to [Stage 2: Recon](stage-2-recon.md) when external research is complete.
