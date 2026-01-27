# Stage 2: Recon

Codebase analysis to map internal structure.

**Goal**: Identify automation-worthy surfaces in the code.

**Skill**: Load `outfitter:codebase-recon`

## Analysis Checklist

**Structure**:
- [ ] Identify entry points (main, CLI handlers, exports)
- [ ] Map directory organization
- [ ] Find configuration files and patterns
- [ ] Locate test files (reveal intended usage)

**Public API**:
- [ ] List exported functions/classes
- [ ] Document CLI commands and subcommands
- [ ] Note required vs optional parameters
- [ ] Identify return types and error modes

**Conventions**:
- [ ] Naming patterns (camelCase, snake_case)
- [ ] Error handling approach
- [ ] Configuration precedence (env, file, args)
- [ ] Output formats (JSON, table, plain)

## Confidence Levels

| Level | Evidence | Action |
|-------|----------|--------|
| High | Tests + docs + clear structure | Proceed with confidence |
| Medium | Tests OR docs, some structure | Note assumptions |
| Low | Neither tests nor docs | Flag for user validation |

## Output

Create `artifacts/plugin-engineer/recon.md`:

```markdown
# Recon: {REPO_NAME}

## Structure
{KEY_DIRECTORIES}

## Public API
- {COMMAND/FUNCTION}: {PURPOSE}

## Configuration
- {CONFIG_FILE}: {OPTIONS}

## Conventions
- {CONVENTION}: {EXAMPLE}
```

## Next Stage

Proceed to [Stage 3: Patterns](stage-3-patterns.md) for full pipeline, or skip to [Stage 5: Authoring](stage-5-authoring.md) for quick mode.
