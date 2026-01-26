---
name: claude-plugins
description: This skill should be used when creating plugins, publishing to marketplaces, or when "plugin.json", "marketplace", "create plugin", or "distribute plugin" are mentioned.
metadata:
  version: "1.0.0"
  related-skills:
    - claude-agents
    - claude-commands
    - claude-hooks
    - skills-dev
    - claude-rules
    - claude-config
---

# Claude Plugin Development

Complete lifecycle for developing, validating, and distributing Claude Code plugins.

## Quick Start

```bash
# 1. Scaffold plugin
./scripts/scaffold-plugin.sh my-plugin --with-commands

# 2. Add components (commands, agents, hooks, skills)
# 3. Test locally
/plugin marketplace add ./my-plugin
/plugin install my-plugin@my-plugin

# 4. Distribute
git push origin main --tags
```

## Lifecycle Overview

```
Discovery -> Init -> Components -> Validate -> Distribute -> Marketplace
    |         |          |            |            |             |
    v         v          v            v            v             v
 Purpose   Scaffold   Commands    Structure    Package      Catalog
  Scope    plugin.json  Agents     Testing     Version      Publish
  Type      README      Hooks      Quality     Release       Share
```

## Phase 1: Discovery

Before creating a plugin, clarify:

| Question | Impact |
|----------|--------|
| What problem does this solve? | Plugin scope and features |
| Who will use it? | Distribution method |
| What components are needed? | Commands, agents, hooks, MCP servers |
| Where will it live? | Personal, project, or marketplace |

## Phase 2: Initialization

### Plugin Structure

Every plugin should have its own `.claude-plugin/plugin.json` manifest:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Required: plugin metadata
├── README.md            # Required for distribution
├── commands/            # Optional components
├── agents/
├── skills/
└── hooks/
```

### plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Brief description of what this plugin does",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT"
}
```

### Marketplace Structure

A marketplace catalogs multiple plugins. Each plugin remains self-contained with its own `.claude-plugin/plugin.json`. The marketplace.json simply points to plugin directories:

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json # Catalogs plugins
├── plugin-a/
│   ├── .claude-plugin/
│   │   └── plugin.json  # Plugin A's own manifest
│   └── commands/
├── plugin-b/
│   ├── .claude-plugin/
│   │   └── plugin.json  # Plugin B's own manifest
│   └── skills/
└── README.md
```

### marketplace.json

Keep marketplace entries minimal - just point to plugin directories:

```json
{
  "name": "my-marketplace",
  "owner": {
    "name": "Team Name",
    "email": "team@example.com"
  },
  "plugins": [
    {
      "name": "plugin-a",
      "source": "./plugin-a"
    },
    {
      "name": "plugin-b",
      "source": "./plugin-b"
    }
  ]
}
```

Marketplace entries can supplement plugin.json with additional metadata (description, version, keywords), but the plugin itself should be complete and self-contained.

### Using the Scaffold Script

```bash
./scripts/scaffold-plugin.sh my-plugin \
  --author "Your Name" \
  --with-commands \
  --with-agent \
  --with-hooks
```

See [references/structure.md](references/structure.md) for complete plugin structure and plugin.json schema.

## Phase 3: Components

Add components based on plugin needs. For detailed component authoring, load the appropriate skill:

### Slash Commands

Create custom commands in `commands/` directory.

**Example: commands/review.md**

```markdown
---
description: "Review code for quality issues"
---

Review the following code: {{0}}

Check for:
- Code style and formatting
- Potential bugs
- Performance issues
- Security concerns
```

For complex commands, load the **claude-command-authoring** skill.

### Custom Agents

Define specialized agents in `agents/` directory.

**Example: agents/security-reviewer.md**

```markdown
---
name: security-reviewer
description: "Security-focused code reviewer"
---

You are a security expert. When reviewing code:
1. Check for vulnerabilities
2. Verify input validation
3. Review authentication flows
4. Report issues with severity levels
```

For agent design patterns, load the **claude-agent-development** skill.

### Event Hooks

Two ways to define hooks in a plugin:

**Option 1: File-based** (auto-discovered from `hooks/hooks.json`)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Option 2: Inline in plugin.json**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
          }
        ]
      }
    ]
  }
}
```

Both formats use the same structure with a `"hooks"` wrapper around event types.

**Hook types:** PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart, SessionEnd

For hook implementation, load the **claude-hooks** skill.

### Skills

Add reusable methodology patterns in `skills/` directory.

For skill authoring, load the **skills-development** skill.

### MCP Servers

Integrate MCP servers for external capabilities:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

**Path variables:**
- `${CLAUDE_PLUGIN_ROOT}` - Plugin installation directory
- `${MY_API_KEY}` - Environment variable expansion

## Plugin Caching and Path Limitations

When plugins are installed, Claude Code copies them to a cache directory for security. This affects how you structure shared resources.

### Path Traversal Limitation

Paths that traverse outside the plugin root won't work after installation:

```
# BROKEN after install - traverses outside plugin
../../shared-utils/helper.sh
../other-plugin/rules/FORMATTING.md
```

Only files within the plugin directory are copied to the cache.

### Shared Resources Within a Plugin

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

### Cross-Plugin Dependencies

If plugins need to share resources across plugin boundaries, you have two options:

**Option 1: Symlinks**

Create symlinks within your plugin that point to external files. Symlinks are followed during the copy:

```bash
# Inside your plugin directory
ln -s /path/to/shared-utils ./shared-utils
```

**Option 2: Restructure Marketplace**

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

**Option 3: Skill Invocation (Recommended)**

Instead of file references, use skill invocation for cross-plugin patterns:

```markdown
## Related Skills

- **outfitter:tdd** — Test-driven development patterns
- **outfitter:debugging** — Systematic debugging methodology
```

Reference skills by `plugin:skill-name` and invoke with the Skill tool.

## Phase 4: Validation

Before distribution, validate the plugin:

### Validation Checklist

**Structure:**
- [ ] plugin.json exists and is valid JSON
- [ ] Required fields present (name, version, description)
- [ ] Plugin name matches directory name (kebab-case)

**Commands:**
- [ ] YAML frontmatter with description
- [ ] Parameter syntax correct ({{0}}, {{1}})

**Agents:**
- [ ] YAML frontmatter with name and description
- [ ] Tool restrictions appropriate

**Hooks:**
- [ ] Scripts executable (`chmod +x`)
- [ ] JSON input/output format correct
- [ ] Matchers are valid regex

**Documentation:**
- [ ] README.md with installation instructions
- [ ] CHANGELOG.md for version history
- [ ] LICENSE file included

### Validation Commands

```bash
# Validate JSON
jq empty plugin.json

# Check command frontmatter
for f in commands/**/*.md; do
  head -n 5 "$f" | grep -q '^---$' || echo "Missing: $f"
done

# Verify scripts executable
for f in hooks/**/*.sh; do
  test -x "$f" || echo "Not executable: $f"
done
```

### Local Testing

```bash
# Add as local marketplace
/plugin marketplace add ./my-plugin

# Install and test
/plugin install my-plugin@my-plugin

# Test commands
/my-command arg1 arg2
```

## Phase 5: Distribution

### Semantic Versioning

Follow semver (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Workflow

```bash
# 1. Update version in plugin.json
# 2. Update CHANGELOG.md
# 3. Commit
git add plugin.json CHANGELOG.md
git commit -m "chore: release v1.0.0"

# 4. Tag
git tag v1.0.0

# 5. Push
git push origin main --tags

# 6. Create GitHub release
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes "Initial release"
```

### Distribution Methods

| Method | Best For | Setup |
|--------|----------|-------|
| GitHub repo | Public/team plugins | Push to GitHub |
| Git URL | GitLab, Bitbucket | Full URL in source |
| Local path | Development/testing | Relative path |
| ZIP package | Offline distribution | Create archive |

See [references/distribution.md](references/distribution.md) for packaging, CI/CD, and release automation.

## Phase 6: Marketplace

### What is a Marketplace?

A catalog of plugins defined in `.claude-plugin/marketplace.json` that enables discovery, installation, and version management.

### Creating a Marketplace

```bash
mkdir -p .claude-plugin
```

**.claude-plugin/marketplace.json:**

Keep entries minimal - just point to plugin directories:

```json
{
  "name": "my-marketplace",
  "owner": {
    "name": "Team Name",
    "email": "team@example.com"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin"
    }
  ]
}
```

The plugin's own `.claude-plugin/plugin.json` provides metadata. Marketplace entries can supplement with additional fields if needed.

**When to use `strict: false`:** Set `strict: false` in a marketplace entry when the plugin has no `.claude-plugin/plugin.json` - the marketplace entry then defines everything (commands, hooks, mcpServers, etc.).

### Plugin Sources

**Relative path:**

```json
{"source": "./plugins/my-plugin"}
```

**GitHub:**

```json
{
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "v1.0.0"
  }
}
```

**Git URL:**

```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git"
  }
}
```

### Team Configuration

Configure automatic marketplace installation in `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "github",
        "repo": "company/claude-plugins"
      }
    }
  }
}
```

### Marketplace Commands

```bash
# Add marketplace
/plugin marketplace add owner/repo
/plugin marketplace add ./local-path

# List available
/plugin marketplace list

# Install from marketplace
/plugin install plugin-name@marketplace-name

# Update
/plugin marketplace update marketplace-name
```

See [references/marketplace.md](references/marketplace.md) for full schema, team setup, and hosting strategies.

## Best Practices

### Naming Conventions

- **Plugin name**: kebab-case (e.g., `dev-tools`)
- **Commands**: kebab-case (e.g., `review-pr`)
- **Agents**: kebab-case (e.g., `security-reviewer`)
- **Scripts**: kebab-case with extension (e.g., `validate.sh`)

### Security

- Never hardcode secrets in plugin files
- Use environment variables for sensitive data
- Validate all user inputs in hooks
- Review third-party dependencies
- Document security requirements

### Documentation

- **README.md**: Overview, installation, usage examples
- **CHANGELOG.md**: Version history with semver
- **LICENSE**: Appropriate license file
- **Commands/Agents**: Clear description in frontmatter

### Testing

- Test all commands with various inputs
- Verify hooks don't block normal workflow
- Check MCP servers connect properly
- Test installation and removal
- Validate cross-platform compatibility

## Troubleshooting

**Plugin not loading:**
- Verify plugin.json syntax: `jq empty plugin.json`
- Check plugin name matches directory
- Ensure required fields present

**Commands not appearing:**
- Verify YAML frontmatter exists
- Check files in `commands/` directory
- Ensure markdown syntax correct

**Hooks not executing:**
- Check scripts executable: `chmod +x`
- Verify matcher regex correct
- Test hook script independently
- Review JSON output format

**MCP servers failing:**
- Verify server binary exists
- Check environment variables set
- Test with MCP Inspector
- Review logs: `~/Library/Logs/Claude/`

## References

- [references/structure.md](references/structure.md) - Directory layout, plugin.json schema
- [references/distribution.md](references/distribution.md) - Packaging, versioning, release automation
- [references/marketplace.md](references/marketplace.md) - Marketplace schema, hosting, team setup

## Related Skills

- **claude-command-authoring** - Slash command development
- **claude-agent-development** - Custom agent design
- **claude-hook-authoring** - Event hook implementation
- **skills-development** - Skill creation patterns
