# Changesets

This repo uses changesets for version management. Changesets are created manually when you want to bump plugin versions.

## When to Create a Changeset

Create a changeset when your PR includes changes that plugin consumers should know about:

| Change Type | Changeset? | Example |
|-------------|------------|---------|
| New feature | Yes (minor) | Add new skill, agent, command |
| Bug fix | Yes (patch) | Fix skill behavior |
| Breaking change | Yes (major) | Rename skill, change API |
| Infrastructure | No | CI workflows, scripts |
| Documentation | Usually no | README updates |
| Tooling shims | No | package.json for tooling |

## Creating a Changeset

```bash
bun changeset
```

Interactive prompts will ask:
1. Which packages to include (select affected plugins)
2. Bump type (major/minor/patch)
3. Summary of changes

This creates `.changeset/{random-name}.md`.

## Manual Changeset Format

```markdown
---
"outfitter": minor
"gt": patch
---

Add pathfinding skill and fix gt stack detection
```

## CI Behavior

The changeset check is advisory, not blocking. It warns when plugin files change without a changeset but doesn't fail the build. This lets you merge infrastructure PRs without ceremony.

## Release Flow

1. PRs with changesets merge to main
2. Changesets action creates a "Version Packages" PR
3. Merging that PR bumps versions and creates git tags
4. Tags like `outfitter@1.2.0` are created for each bumped plugin
