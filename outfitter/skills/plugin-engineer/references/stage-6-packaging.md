# Stage 6: Packaging

Create distributable plugin structure.

**Goal**: Package components into a valid plugin.

**Skill**: Load `outfitter:claude-plugins`

## Directory Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
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

## plugin.json

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
- [ ] Create `.claude-plugin/plugin.json`
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
