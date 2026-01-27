# Changesets

This folder is managed by [@changesets/cli](https://github.com/changesets/changesets).

## Adding a changeset

When you make changes to a plugin, run:

```bash
bun changeset
```

This will prompt you to:
1. Select which plugin(s) changed
2. Choose the bump type (patch/minor/major)
3. Write a summary of the changes

Commit the generated changeset file with your changes.

## Version bumping

When changesets are merged to main, CI will create a "Version Packages" PR that:
- Bumps versions in package.json files
- Updates CHANGELOG.md files
- Syncs versions to marketplace.json

Merging that PR creates git tags for each released plugin.
