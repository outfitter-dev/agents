# Changesets

This repo uses changesets for version management. When you modify files in plugin directories (`outfitter/`, `but/`, `gt/`, `cli-dev/`), a changeset is automatically created via lefthook pre-commit hook.

## How It Works

1. You make changes to plugin files
2. You commit with a conventional commit message
3. Lefthook runs `scripts/ensure-changeset.ts`
4. Script creates/updates `.changeset/{branch-name}.md`
5. Changeset is auto-staged and included in commit

## Conventional Commits → Bump Type

| Commit Type | Bump | Example |
|-------------|------|---------|
| `feat:` or `feat(scope):` | minor | `feat(outfitter): add pathfinding skill` |
| `fix:`, `perf:`, `refactor:`, `docs:` | patch | `fix(gt): correct stack detection` |
| `feat!:` or `BREAKING CHANGE:` | major | `feat(outfitter)!: redesign skill API` |
| `chore:`, `test:`, `ci:`, `build:` | skip | `chore: update deps` (no changeset) |

## Stacked PRs

Each branch in a Graphite stack gets its own changeset. The script diffs against the parent branch (via `gt parent`) to detect only the current branch's changes.

## Manual Override

If you need to create a changeset manually:

```bash
bun changeset
```

Or edit `.changeset/{branch-name}.md` directly:

```markdown
---
"outfitter": minor
"gt": patch
---

Add pathfinding skill and fix gt stack detection
```

## Skipping Changesets

For commits that shouldn't trigger changesets:
- Use `chore:`, `test:`, `ci:`, or `build:` commit types
- Or skip hooks with `--no-verify` (use sparingly)
