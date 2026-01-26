# Plugin Caching Reference

How Claude Code caches plugins and implications for plugin structure.

## How Plugin Caching Works

When plugins are installed, Claude Code copies them to a cache directory for security. This affects how you structure shared resources.

## Path Traversal Limitation

Paths that traverse outside the plugin root will not work after installation:

```
# BROKEN after install - traverses outside plugin
../../shared-utils/helper.sh
../other-plugin/rules/FORMATTING.md
```

Only files within the plugin directory are copied to the cache.

## Shared Resources Within a Plugin

Organize shared resources inside your plugin:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── rules/                    # Shared rules
│   └── FORMATTING.md
├── scripts/                  # Shared scripts
│   └── validate.sh
└── skills/
    └── my-skill/
        └── SKILL.md          # Can reference ../../rules/FORMATTING.md
```

Skills can reference `../../rules/FORMATTING.md` because it stays within the plugin.

## Cross-Plugin Dependencies

If plugins need to share resources across plugin boundaries, you have three options:

### Option 1: Symlinks

Create symlinks within your plugin that point to external files. Symlinks are followed during the copy:

```bash
# Inside your plugin directory
ln -s /path/to/shared-utils ./shared-utils
```

### Option 2: Restructure Marketplace

Set the marketplace source to a parent directory containing all plugins:

```json
{
  "name": "my-plugin",
  "source": "./",
  "description": "Plugin with access to sibling directories",
  "commands": ["./plugins/my-plugin/commands/"],
  "skills": ["./plugins/my-plugin/skills/"],
  "strict": false
}
```

This copies the entire marketplace root, giving plugins access to siblings.

### Option 3: Skill Invocation (Recommended)

Instead of file references, use skill invocation for cross-plugin patterns:

```markdown
## Related Skills

- **outfitter:tdd** - Test-driven development patterns
- **outfitter:debugging** - Systematic debugging methodology
```

Reference skills by `plugin:skill-name` and invoke with the Skill tool.

## Best Practice

**Prefer Option 3** (skill invocation) when possible. It:
- Avoids caching complexity
- Works regardless of installation method
- Maintains clean plugin boundaries
- Enables proper versioning of dependencies
