# Stage 3: Patterns

Extract repeatable behaviors worth automating.

**Goal**: Identify patterns with automation value.

**Skill**: Load `outfitter:patterns`

## Pattern Categories

**Workflow Patterns**:
Multi-step sequences users perform repeatedly.

```
Example: Git release workflow
1. Update version
2. Generate changelog
3. Create tag
4. Push to remote
5. Create GitHub release
```

**Command Patterns**:
Single actions with complex options.

```
Example: Docker build with optimal caching
docker build --cache-from=... --build-arg=... --tag=... .
```

**Decision Patterns**:
Conditional logic users apply manually.

```
Example: Choose test runner based on project
if package.json has "jest" → jest
if package.json has "vitest" → vitest
if bun.lockb exists → bun test
else → error
```

## Automation Value Assessment

| Signal | High Value | Low Value |
|--------|------------|-----------|
| Frequency | Daily/weekly | Monthly/rarely |
| Complexity | 5+ steps or flags | 1-2 steps |
| Error rate | Users often make mistakes | Straightforward |
| Memorability | Hard to remember options | Obvious invocation |

## Evidence Threshold

Require 3+ instances before codifying:

- Documented in multiple tutorials
- Appears in GitHub issues repeatedly
- Found in multiple wrapper scripts
- User explicitly mentions as pain point

## Output

Create `artifacts/plugin-engineer/patterns.md`:

```markdown
# Patterns: {REPO_NAME}

## Workflows
1. {WORKFLOW_NAME}
   - Steps: {STEP_LIST}
   - Frequency: {COMMON|OCCASIONAL|RARE}
   - Automation value: {HIGH|MEDIUM|LOW}

## Decision Points
- {DECISION}: {OPTIONS}

## Boilerplate
- {TEMPLATE}: {USE_CASE}
```

## Next Stage

Proceed to [Stage 4: Mapping](stage-4-mapping.md) to select components.
