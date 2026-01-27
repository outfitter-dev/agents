---
name: claude-plugins
description: This skill should be used when creating plugins, publishing to marketplaces, or when "plugin.json", "marketplace", "create plugin", or "distribute plugin" are mentioned.
metadata:
  version: "1.0.0"
  related-skills:
    - claude-plugin-audit
    - claude-agents
    - claude-commands
    - claude-hooks
    - skills-dev
    - claude-rules
    - claude-config
---

# Claude Plugin Development

Complete lifecycle for developing, validating, and distributing Claude Code plugins.

## Steps

1. Define plugin scope and components needed
2. Initialize plugin structure with `plugin.json`
3. If adding commands, load the `outfitter:claude-commands` skill
4. If adding agents, load the `outfitter:claude-agents` skill
5. If adding hooks, load the `outfitter:claude-hooks` skill
6. If adding skills, load the `outfitter:skills-dev` skill
7. Delegate by loading the `outfitter:claude-plugin-audit` skill for validation
8. Fix issues and distribute

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

## Stage 1: Discovery

Before creating a plugin, clarify:

| Question | Impact |
|----------|--------|
| What problem does this solve? | Plugin scope and features |
| Who will use it? | Distribution method |
| What components are needed? | Commands, agents, hooks, MCP servers |
| Where will it live? | Personal, project, or marketplace |

## Stage 2: Initialization

### Standalone Plugin

Standalone plugins need their own `.claude-plugin/plugin.json`:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Required for standalone
├── README.md            # Required for distribution
├── commands/            # Optional components
├── agents/
├── skills/
└── hooks/
```

### plugin.json (Standalone)

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

### Marketplace with Local Plugins (Consolidated)

For marketplaces where all plugins live in the same repo, use `strict: false` to consolidate metadata. Plugins don't need their own manifests:

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json # All metadata here (strict: false)
├── plugin-a/
│   └── commands/
├── plugin-b/
│   └── skills/
└── README.md
```

### marketplace.json (Consolidated)

```json
{
  "name": "my-marketplace",
  "owner": {
    "name": "Team Name",
    "email": "team@example.com"
  },
  "strict": false,
  "plugins": [
    {"name": "plugin-a", "source": "./plugin-a", "version": "1.0.0", "description": "Plugin A", "license": "MIT"},
    {"name": "plugin-b", "source": "./plugin-b", "version": "1.0.0", "description": "Plugin B", "license": "MIT"}
  ]
}
```

**Benefits:** Single source of truth, no version drift between marketplace and plugin manifests.

For external plugins (GitHub repos), use minimal entries and let the external repo own its manifest.

See [structure.md](references/structure.md) for complete plugin.json schema.

## Stage 3: Components

Add components based on plugin needs. See Steps section for which skills to load.

### Slash Commands

Create custom commands in `commands/` directory:

```markdown
---
description: "Review code for quality issues"
---

Review the following code: {{0}}

Check for: code style, bugs, performance, security
```

For complex commands, load the `outfitter:claude-commands` skill.

### Custom Agents

Define specialized agents in `agents/` directory:

```markdown
---
name: security-reviewer
description: "Security-focused code reviewer"
---

You are a security expert. When reviewing code:
1. Check for vulnerabilities
2. Verify input validation
3. Report issues with severity levels
```

For agent design patterns, load the `outfitter:claude-agents` skill.

### Event Hooks

Two ways to define hooks:

**File-based** (auto-discovered from `hooks/hooks.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{"type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"}]
      }
    ]
  }
}
```

**Inline in plugin.json** - same structure, add `"hooks"` key directly.

Hook types: PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart, SessionEnd

For hook implementation, load the `outfitter:claude-hooks` skill. See [structure.md](references/structure.md) for hook JSON format and script interface.

### Skills

Add reusable methodology patterns in `skills/` directory. For skill authoring, load the `outfitter:skills-dev` skill.

### MCP Servers

```json
{
  "mcpServers": {
    "my-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {"API_KEY": "${MY_API_KEY}"}
    }
  }
}
```

Path variables: `${CLAUDE_PLUGIN_ROOT}` (plugin directory), `${VAR_NAME}` (env var)

## Plugin Caching

When plugins are installed, Claude Code copies them to a cache directory. This has implications:

- **Path traversal breaks**: `../../shared/file.md` will not work after install
- **Keep resources inside plugin**: Shared scripts, rules, and assets must be within plugin directory
- **Cross-plugin dependencies**: Use skill invocation (`plugin:skill-name`) instead of file references

See [caching.md](references/caching.md) for workarounds and best practices.

## Stage 4: Validation

Before distribution, validate the plugin.

### Checklist

**Structure:**
- [ ] Standalone: plugin.json exists and is valid JSON
- [ ] Marketplace (consolidated): metadata in marketplace.json with `strict: false`
- [ ] Required fields present (name, version, description)
- [ ] Plugin name matches directory name (kebab-case)

**Components:**
- [ ] Commands have YAML frontmatter with description
- [ ] Agents have YAML frontmatter with name and description
- [ ] Hook scripts are executable (`chmod +x`)
- [ ] Hook matchers are valid regex

**Documentation:**
- [ ] README.md with installation instructions
- [ ] LICENSE file included

### Local Testing

```bash
# Add as local marketplace
/plugin marketplace add ./my-plugin

# Install and test
/plugin install my-plugin@my-plugin

# Test commands
/my-command arg1 arg2
```

See [structure.md](references/structure.md) for validation commands and detailed component schemas.

## Stage 5: Distribution

### Semantic Versioning

Follow semver (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Workflow

```bash
# 1. Update version in plugin.json
# 2. Update CHANGELOG.md
# 3. Commit and tag
git add plugin.json CHANGELOG.md
git commit -m "chore: release v1.0.0"
git tag v1.0.0
git push origin main --tags

# 4. Create GitHub release
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release"
```

### Distribution Methods

| Method | Best For | Setup |
|--------|----------|-------|
| GitHub repo | Public/team plugins | Push to GitHub |
| Git URL | GitLab, Bitbucket | Full URL in source |
| Local path | Development/testing | Relative path |

See [distribution.md](references/distribution.md) for packaging, CI/CD, and release automation.

## Stage 6: Marketplace

A marketplace catalogs plugins for discovery and installation.

### Creating a Marketplace

Create `.claude-plugin/marketplace.json`:

```json
{
  "name": "my-marketplace",
  "owner": {"name": "Team Name", "email": "team@example.com"},
  "plugins": [
    {"name": "my-plugin", "source": "./plugins/my-plugin"}
  ]
}
```

### Plugin Sources

```json
// Relative path
{"source": "./plugins/my-plugin"}

// GitHub
{"source": {"source": "github", "repo": "owner/plugin-repo", "ref": "v1.0.0"}}

// Git URL
{"source": {"source": "url", "url": "https://gitlab.com/team/plugin.git"}}
```

### Commands

```bash
/plugin marketplace add owner/repo       # Add marketplace
/plugin marketplace list                  # List available
/plugin install plugin-name@marketplace  # Install from marketplace
/plugin marketplace update marketplace   # Update
```

See [marketplace.md](references/marketplace.md) for full schema, team configuration, and hosting strategies.

## Best Practices

### Naming Conventions

- **Plugin name**: kebab-case (e.g., `dev-tools`)
- **Commands**: kebab-case (e.g., `review-pr`)
- **Agents**: kebab-case (e.g., `security-reviewer`)

### Security

- Never hardcode secrets in plugin files
- Use environment variables for sensitive data
- Validate all user inputs in hooks
- Document security requirements

### Documentation

- **README.md**: Overview, installation, usage examples
- **CHANGELOG.md**: Version history with semver
- **LICENSE**: Appropriate license file

## Troubleshooting

**Plugin not loading:**
- Standalone: verify plugin.json syntax: `jq empty .claude-plugin/plugin.json`
- Marketplace: verify marketplace.json syntax and `strict: false` if no plugin.json
- Check plugin name matches directory
- Ensure required fields present (name, version, description)

**Commands not appearing:**
- Verify YAML frontmatter exists
- Check files in `commands/` directory

**Hooks not executing:**
- Check scripts executable: `chmod +x`
- Verify matcher regex correct
- Test hook script independently

**MCP servers failing:**
- Verify server binary exists
- Check environment variables set
- Review logs: `~/Library/Logs/Claude/`

<references>

- [structure.md](references/structure.md) - Directory layout, plugin.json schema, component formats
- [distribution.md](references/distribution.md) - Packaging, versioning, CI/CD, release automation
- [marketplace.md](references/marketplace.md) - Marketplace schema, hosting, team configuration
- [caching.md](references/caching.md) - Plugin caching behavior and cross-plugin dependencies

</references>

<rules>

ALWAYS:
- Standalone plugins: create `.claude-plugin/plugin.json`
- Marketplace local plugins: use `strict: false` and consolidate metadata in marketplace.json
- External plugins: let the external repo own its manifest
- Keep plugin resources within plugin directory (caching limitation)
- Use kebab-case for all names
- Include README.md and LICENSE for distribution
- Follow semantic versioning

NEVER:
- Hardcode secrets in plugin files
- Use path traversal (`../`) for cross-plugin resources
- Skip validation before distribution
- Omit description (in plugin.json or marketplace entry)

</rules>

## Related Skills

- **claude-commands** - Slash command development
- **claude-agents** - Custom agent design
- **claude-hooks** - Event hook implementation
- **skills-dev** - Skill creation patterns
