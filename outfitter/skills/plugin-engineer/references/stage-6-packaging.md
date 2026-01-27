# Stage 6: Packaging

Create distributable plugin structure.

**Goal**: Package components into a valid plugin.

**Skill**: Load `outfitter:claude-plugins`

## Directory Structure

### Standalone Plugin (External Repo)

For plugins in their own repo that will be referenced by marketplaces, place `.claude-plugin/` at the **repo root**:

```
my-plugin/                    # Repo root
├── .claude-plugin/
│   └── plugin.json           # At repo root — required for external reference
├── README.md
├── commands/
│   └── main-command.md
├── skills/
│   ├── primary-skill/
│   │   └── SKILL.md
│   └── secondary-skill/
│       ├── SKILL.md
│       └── references/
└── hooks/
    └── hooks.json
```

When a marketplace references this via `{"source": {"source": "github", "repo": "owner/my-plugin"}}`, Claude Code looks for `.claude-plugin/plugin.json` at the repo root.

### Plugin in a Marketplace (Consolidated)

When adding to a marketplace with `strict: false`, skip `.claude-plugin/`:

```
my-plugin/
├── README.md
├── commands/
│   └── main-command.md
├── skills/
│   └── primary-skill/
│       └── SKILL.md
└── hooks/
    └── hooks.json
```

Metadata goes in the marketplace's `marketplace.json` instead.

### Plugin in a Monorepo

When the plugin lives alongside application code, place it in a conventional location:

```
my-project/                   # Monorepo root
├── packages/
│   └── claude-plugin/        # Plugin subdirectory
│       ├── .claude-plugin/
│       │   └── plugin.json   # Required — plugin owns its manifest
│       ├── README.md
│       ├── commands/
│       └── skills/
├── src/                      # Application code
└── package.json
```

Marketplaces reference this with the `path` field:

```json
{
  "source": {
    "source": "github",
    "repo": "owner/my-project",
    "path": "./packages/claude-plugin"
  }
}
```

Common monorepo locations: `packages/claude-plugin/`, `tools/claude-plugin/`, `.claude/plugin/`

## plugin.json (Standalone Only)

Only needed for standalone plugins or those distributed outside a marketplace:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Brief description of plugin purpose",
  "author": {
    "name": "Your Name"
  },
  "license": "MIT"
}
```

## README Template

```markdown
# Plugin Name

Brief description.

## Installation

\`\`\`bash
/plugin marketplace add owner/repo
/plugin install plugin-name@owner
\`\`\`

## Commands

- `/command-name` — what it does

## Skills

- `plugin:skill-name` — when to use

## Requirements

- List prerequisites
```

## Checklist

- [ ] Move components from `artifacts/plugin-engineer/components/` to plugin directory
- [ ] If standalone: Create `.claude-plugin/plugin.json`
- [ ] If marketplace: Add entry to `marketplace.json` (skip plugin.json with `strict: false`)
- [ ] Write README.md with installation instructions
- [ ] Add LICENSE file
- [ ] Verify all paths and references
- [ ] Ask about marketplace integration (see below)

## Marketplace Integration

Ask: "Do you have an existing marketplace to add this plugin to?"

**If yes:**

1. Ask: "Do you have the marketplace repo cloned locally?"

2. **If local**: Get the path and update `marketplace.json` directly:

```json
{
  "name": "new-plugin",
  "source": "./new-plugin"
}
```

Or if the plugin lives in a separate repo:

```json
{
  "name": "new-plugin",
  "source": {
    "source": "github",
    "repo": "owner/new-plugin"
  }
}
```

3. **If remote only**: Provide the entry template for manual addition

**Avoid version pinning** — Omit `ref` and `sha` unless specifically requested. Pinned versions get stale quickly and require marketplace updates for every plugin release. Let the marketplace pull from default branch.

Only pin when:
- Plugin has breaking changes between versions
- Stability is critical (enterprise/production)
- User explicitly requests it

**If no marketplace:**

- Plugin can be distributed standalone via GitHub
- User can add to a marketplace later with the entry template above

## Next Stage

Proceed to [Stage 7: Audit](stage-7-audit.md) for validation.
