# Marketplace Reference

Complete schema, hosting strategies, and team configuration for Claude Code plugin marketplaces.

## What is a Marketplace?

A marketplace is a catalog of plugins defined in `.claude-plugin/marketplace.json` that enables:
- Plugin discovery
- One-command installation
- Version management
- Team distribution

## Marketplace Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Marketplace identifier (kebab-case) |
| `owner` | object | Maintainer information |
| `owner.name` | string | Maintainer name |
| `owner.email` | string | Contact email |
| `plugins` | array | List of plugin entries |

### Optional Metadata

| Field | Type | Description |
|-------|------|-------------|
| `metadata.description` | string | Marketplace description |
| `metadata.version` | string | Marketplace version |
| `metadata.pluginRoot` | string | Base path for relative sources |
| `metadata.homepage` | string | Documentation URL |
| `metadata.repository` | string | Source code URL |

### Complete Example

Keep plugin entries minimal when plugins have their own `.claude-plugin/plugin.json`:

```json
{
  "name": "company-tools",
  "owner": {
    "name": "Engineering Team",
    "email": "eng@company.com"
  },
  "metadata": {
    "description": "Internal development tools",
    "version": "2.0.0",
    "homepage": "https://docs.company.com/plugins"
  },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./code-formatter"
    },
    {
      "name": "deployment-tools",
      "source": "./deployment"
    }
  ]
}
```

Each plugin directory should have its own `.claude-plugin/plugin.json` with metadata.

## Plugin Entry Schema

### Minimal Entry (Recommended)

When the plugin has its own `.claude-plugin/plugin.json`:

```json
{
  "name": "plugin-name",
  "source": "./path/to/plugin"
}
```

The marketplace just points to the plugin. Metadata comes from the plugin's own manifest.

### Verbose Entry

When referencing external repos or plugins without their own manifest, provide metadata in the marketplace entry:

```json
{
  "name": "enterprise-tools",
  "source": {
    "source": "github",
    "repo": "company/enterprise-plugin",
    "ref": "v2.0.0"
  },
  "description": "Enterprise workflow automation",
  "version": "2.0.0",
  "author": {
    "name": "Enterprise Team",
    "email": "team@company.com"
  },
  "license": "MIT",
  "keywords": ["enterprise", "workflow"]
}
```

Use verbose entries when:
- The plugin is an external GitHub repo without its own manifest
- You need to override or supplement the plugin's metadata
- The plugin predates the `.claude-plugin/plugin.json` convention

### Entry Fields

**Required:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier (kebab-case, no spaces) |
| `source` | string\|object | Where to fetch plugin (relative path, GitHub, or git URL) |

**Standard metadata** (optional):

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief plugin description |
| `version` | string | Plugin version |
| `author` | object | Author info (`name` required, `email` optional) |
| `homepage` | string | Documentation URL |
| `repository` | string | Source code URL |
| `license` | string | SPDX identifier (MIT, Apache-2.0) |
| `keywords` | array | Tags for discovery |
| `category` | string | Plugin category |
| `tags` | array | Additional searchability tags |

**Behavior control:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `strict` | boolean | `true` | When `true`, plugin must have `.claude-plugin/plugin.json` and marketplace fields merge with it. When `false`, plugin needs no manifest - marketplace entry defines everything. |

**Component configuration** (optional):

| Field | Type | Description |
|-------|------|-------------|
| `commands` | string\|array | Custom paths to command files or directories |
| `agents` | string\|array | Custom paths to agent files |
| `hooks` | string\|object | Hook configuration or path to hooks file |
| `mcpServers` | string\|object | MCP server configuration or path to MCP config |
| `lspServers` | string\|object | LSP server configuration or path to LSP config |

Use component fields when defining simple plugins entirely in the marketplace (`strict: false`) or to supplement/override paths from the plugin's own manifest.

## Plugin Source Types

### Relative Path

For plugins in the same repository:

```json
{"source": "./plugins/my-plugin"}
```

With `pluginRoot`:

```json
{
  "metadata": {"pluginRoot": "./plugins"},
  "plugins": [
    {"name": "my-plugin", "source": "./my-plugin"}
  ]
}
```

### GitHub Repository

```json
{
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo"
  }
}
```

With specific version:

```json
{
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "v1.5.0"
  }
}
```

### Git URL

For GitLab, Bitbucket, or self-hosted:

```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git",
    "ref": "main"
  }
}
```

## Marketplace Types

### Team/Organization

```json
{
  "name": "company-internal",
  "owner": {
    "name": "Engineering",
    "email": "eng@company.com"
  },
  "metadata": {
    "description": "Internal development tools"
  },
  "plugins": [
    {"name": "deploy-tools", "source": "./plugins/deploy"},
    {"name": "compliance", "source": "./plugins/compliance"}
  ]
}
```

**Hosting:** Private GitHub repo or internal Git

### Project-Specific

```json
{
  "name": "project-tools",
  "owner": {
    "name": "Project Team",
    "email": "project@company.com"
  },
  "plugins": [
    {"name": "project-workflow", "source": "./plugins/workflow"}
  ]
}
```

**Hosting:** In project at `.claude-plugin/marketplace.json`

### Public/Community

```json
{
  "name": "awesome-plugins",
  "owner": {
    "name": "Community",
    "email": "community@example.com"
  },
  "metadata": {
    "description": "Curated Claude Code plugins",
    "homepage": "https://github.com/awesome-claude"
  },
  "plugins": [
    {
      "name": "markdown-tools",
      "source": {"source": "github", "repo": "user/markdown-tools"},
      "license": "MIT"
    }
  ]
}
```

## Team Configuration

### Automatic Installation

Configure in `.claude/settings.json`:

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

Automatically installed when team members trust the folder.

### Multi-Environment

```json
{
  "extraKnownMarketplaces": {
    "development": {
      "source": {
        "source": "github",
        "repo": "company/dev-plugins",
        "ref": "develop"
      }
    },
    "production": {
      "source": {
        "source": "github",
        "repo": "company/prod-plugins",
        "ref": "main"
      }
    }
  }
}
```

## Marketplace Commands

### Adding Marketplaces

```bash
# GitHub (short form)
/plugin marketplace add owner/repo

# GitHub (full URL)
/plugin marketplace add https://github.com/owner/repo

# Git repository
/plugin marketplace add https://gitlab.com/company/plugins.git

# Local directory
/plugin marketplace add ./path/to/marketplace

# Remote JSON URL
/plugin marketplace add https://example.com/marketplace.json
```

### Management

```bash
# List marketplaces
/plugin marketplace list

# Update specific
/plugin marketplace update marketplace-name

# Update all
/plugin marketplace update --all

# Remove (also uninstalls plugins)
/plugin marketplace remove marketplace-name

# View details
/plugin marketplace info marketplace-name
```

### Plugin Installation

```bash
# From marketplace
/plugin install plugin-name@marketplace-name

# Specific version
/plugin install plugin-name@marketplace-name@1.2.0

# List available
/plugin list marketplace-name

# Search across marketplaces
/plugin search keyword
```

## Validation

### Validate JSON

```bash
# Syntax check
jq empty .claude-plugin/marketplace.json

# Required fields
jq -e '.name, .owner, .plugins' .claude-plugin/marketplace.json

# Plugin entries
jq -e '.plugins[] | .name, .source' .claude-plugin/marketplace.json
```

### Validate Sources

```bash
# Check relative paths
for plugin in $(jq -r '.plugins[] | select(.source | type == "string") | .source' .claude-plugin/marketplace.json); do
  if [[ ! -d "$plugin" ]]; then
    echo "Missing: $plugin"
  fi
done

# Check GitHub repos
for repo in $(jq -r '.plugins[] | select(.source.source == "github") | .source.repo' .claude-plugin/marketplace.json); do
  gh repo view "$repo" > /dev/null || echo "Invalid: $repo"
done
```

## Hosting Strategies

### GitHub (Recommended)

**Advantages:**
- Version control
- Issue tracking
- Collaboration
- Free hosting
- Easy sharing

**Setup:**
1. Create repository
2. Add `.claude-plugin/marketplace.json`
3. Push
4. Share: `/plugin marketplace add owner/repo`

### GitLab/Bitbucket

```bash
/plugin marketplace add https://gitlab.com/company/plugins.git
```

**Advantages:**
- Self-hosted options
- Enterprise integration

### Local Development

```bash
/plugin marketplace add ./my-marketplace
```

**Advantages:**
- Fast iteration
- No network required
- Easy testing

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate Marketplace

on:
  push:
    paths: ['.claude-plugin/marketplace.json']
  pull_request:
    paths: ['.claude-plugin/marketplace.json']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate JSON
        run: jq empty .claude-plugin/marketplace.json

      - name: Check fields
        run: jq -e '.name, .owner.name, .plugins' .claude-plugin/marketplace.json

      - name: Check sources
        run: |
          for plugin in $(jq -r '.plugins[] | select(.source | type == "string") | .source' .claude-plugin/marketplace.json); do
            if [[ ! -d "$plugin" ]]; then
              echo "Missing: $plugin"
              exit 1
            fi
          done
```

## Best Practices

### Organization

- Group related plugins together
- Use categories for discovery
- Maintain consistent naming
- Document plugin purposes

### Versioning

- Use semantic versioning
- Track versions in entries
- Maintain CHANGELOG
- Tag releases in Git

### Security

- Review plugins before adding
- Verify sources
- Document requirements
- Use private repos for sensitive tools

### Maintenance

- Keep versions updated
- Remove deprecated plugins
- Test after updates
- Monitor feedback

## Troubleshooting

**Marketplace not loading:**
- Verify URL accessible
- Check `.claude-plugin/marketplace.json` exists
- Validate JSON syntax
- Confirm access for private repos

**Plugin installation failures:**
- Verify source URLs accessible
- Check plugin directories exist
- Test sources manually
- Review error messages

**Team configuration not working:**
- Verify `.claude/settings.json` syntax
- Check marketplace sources accessible
- Ensure folder trusted
- Restart Claude Code
