# Command Namespacing Reference

Complete guide to organizing slash commands with directories and namespaces.

## Overview

Commands can be organized in subdirectories to group related functionality. The directory structure becomes the namespace.

```
.claude/commands/
+-- frontend/
|   +-- component.md    # /component (project:frontend)
|   +-- styling.md      # /styling (project:frontend)
+-- backend/
|   +-- api.md          # /api (project:backend)
+-- review.md           # /review (project)
```

---

## How Namespacing Works

### Display in /help

Commands show their namespace in parentheses:

```
Available commands:
  /component    Create React component (project:frontend)
  /styling      Check styling guidelines (project:frontend)
  /api          Create API endpoint (project:backend)
  /review       Review code changes (project)
```

### Invocation

Commands can be invoked with or without namespace:

```bash
# Direct (command name only)
/component Button

# With namespace
/frontend/component Button
```

Both work. Use direct for brevity, namespace for clarity when names overlap.

---

## Directory Structure

### Single Level

```
.claude/commands/
+-- git/
|   +-- commit.md       # /commit (project:git)
|   +-- branch.md       # /branch (project:git)
|   +-- sync.md         # /sync (project:git)
```

### Multiple Namespaces

```
.claude/commands/
+-- frontend/
|   +-- component.md
|   +-- test.md
+-- backend/
|   +-- endpoint.md
|   +-- test.md         # Different from frontend/test.md
+-- deploy/
|   +-- staging.md
|   +-- production.md
```

### Mixed (Root + Namespaced)

```
.claude/commands/
+-- review.md           # Root level: /review
+-- commit.md           # Root level: /commit
+-- git/
|   +-- sync.md         # Namespaced: /sync (project:git)
+-- test/
|   +-- unit.md         # Namespaced: /unit (project:test)
|   +-- e2e.md          # Namespaced: /e2e (project:test)
```

---

## Naming Collisions

### Same Name in Different Namespaces

When multiple commands have the same name:

```
.claude/commands/
+-- frontend/
|   +-- build.md        # /build (project:frontend)
+-- backend/
|   +-- build.md        # /build (project:backend)
```

**Invocation**:
- `/build` - Ambiguous, may prompt for clarification
- `/frontend/build` - Explicit
- `/backend/build` - Explicit

### Resolution Priority

1. Root commands (`.claude/commands/name.md`)
2. First alphabetically by namespace
3. User prompted if ambiguous

**Best practice**: Use unique names or explicit namespaces to avoid ambiguity.

---

## Organizational Patterns

### By Domain

Group by functional area:

```
.claude/commands/
+-- auth/
|   +-- login.md
|   +-- session.md
|   +-- permissions.md
+-- data/
|   +-- migrate.md
|   +-- seed.md
|   +-- backup.md
+-- api/
|   +-- endpoint.md
|   +-- client.md
```

### By Workflow

Group by development stage:

```
.claude/commands/
+-- setup/
|   +-- init.md
|   +-- config.md
+-- develop/
|   +-- feature.md
|   +-- fix.md
+-- review/
|   +-- pr.md
|   +-- security.md
+-- deploy/
|   +-- staging.md
|   +-- production.md
```

### By Team

Group by team ownership:

```
.claude/commands/
+-- platform/
|   +-- infra.md
|   +-- deploy.md
+-- frontend/
|   +-- component.md
|   +-- story.md
+-- backend/
|   +-- api.md
|   +-- migration.md
```

### By Command Type

Group by command category:

```
.claude/commands/
+-- tools/
|   +-- lint.md
|   +-- format.md
|   +-- test.md
+-- workflows/
|   +-- feature.md
|   +-- release.md
+-- analysis/
|   +-- review.md
|   +-- audit.md
```

---

## Scope Interaction

### Project Namespaces

Project commands (`.claude/commands/`) show:

```
/command (project:namespace)
```

### Personal Namespaces

Personal commands (`~/.claude/commands/`) show:

```
/command (user:namespace)
```

### Plugin Namespaces

Plugin commands show:

```
/command (plugin-name:namespace)
```

### Priority

When same-named commands exist:
1. Plugin commands
2. Project commands (override personal)
3. Personal commands (fallback)

---

## Best Practices

### 1. Consistent Structure

Choose one organizational pattern and stick with it:

```
# Good: Consistent by domain
frontend/
backend/
deploy/

# Bad: Mixed patterns
frontend/
deploy-staging/
api-commands/
```

### 2. Shallow Nesting

Keep to one level of directories:

```
# Good
.claude/commands/frontend/component.md

# Avoid
.claude/commands/frontend/react/components/button.md
```

### 3. Descriptive Names

Make namespaces self-explanatory:

```
# Good
git/
test/
deploy/

# Avoid
g/
t/
d/
```

### 4. README in Directories

Document namespace purpose:

```
.claude/commands/
+-- frontend/
|   +-- README.md       # Explains frontend commands
|   +-- component.md
|   +-- styling.md
```

### 5. Group Related Commands

Keep tightly related commands together:

```
# Good: Git operations together
git/
  +-- commit.md
  +-- branch.md
  +-- sync.md

# Avoid: Scattered
commands/
  +-- git-commit.md
  +-- git-branch.md
  +-- other-stuff.md
  +-- git-sync.md
```

---

## Examples

### Monorepo Structure

```
.claude/commands/
+-- packages/
|   +-- core/
|   |   +-- build.md
|   |   +-- test.md
|   +-- web/
|   |   +-- build.md
|   |   +-- dev.md
|   +-- api/
|       +-- build.md
|       +-- deploy.md
+-- shared/
    +-- lint.md
    +-- format.md
```

### Full-Stack App

```
.claude/commands/
+-- client/
|   +-- component.md
|   +-- page.md
|   +-- story.md
+-- server/
|   +-- endpoint.md
|   +-- middleware.md
|   +-- migration.md
+-- ops/
|   +-- deploy.md
|   +-- rollback.md
|   +-- monitor.md
+-- review.md
+-- test.md
```

### Open Source Project

```
.claude/commands/
+-- contribute/
|   +-- setup.md
|   +-- pr.md
|   +-- issue.md
+-- maintain/
|   +-- release.md
|   +-- changelog.md
+-- docs/
|   +-- api.md
|   +-- readme.md
```
