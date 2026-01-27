# Stack Patterns

Detailed patterns for GitButler stacked branches.

## Feature Dependency Stack

Build features that depend on each other in sequence.

```bash
# Auth foundation
but branch new auth-core
but commit auth-core -m "feat: add authentication core"

# OAuth layer depends on auth core
but branch new auth-oauth --anchor auth-core
but commit auth-oauth -m "feat: add OAuth integration"

# Social login depends on OAuth
but branch new auth-social --anchor auth-oauth
but commit auth-social -m "feat: add social login"
```

## Refactoring Stack

Break large refactors into reviewable phases.

```bash
# Extract utilities
but branch new refactor-extract-utils
but commit refactor-extract-utils -m "refactor: extract common utilities"

# Update consumers
but branch new refactor-use-utils --anchor refactor-extract-utils
but commit refactor-use-utils -m "refactor: use extracted utilities"

# Clean up
but branch new refactor-cleanup --anchor refactor-use-utils
but commit refactor-cleanup -m "refactor: remove deprecated code"
```

## Deep Stack (5+ Levels)

For complex features requiring many dependent phases.

```bash
but branch new db-schema
but branch new data-access --anchor db-schema
but branch new business-logic --anchor data-access
but branch new api-endpoints --anchor business-logic
but branch new frontend-integration --anchor api-endpoints
```

**Caution:** Deep stacks increase merge complexity. Prefer 2-3 levels when possible.
