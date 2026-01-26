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
| `name` | string | Marketplace identifier (kebab-case, no spaces) |
| `owner` | object | Maintainer information |
| `plugins` | array | List of plugin entries |

### Owner Fields

| Field | Required | Description |
|-------|----------|-------------|
| `owner.name` | Yes | Name of maintainer or team |
| `owner.email` | No | Contact email |

### Reserved Names

The following marketplace names are reserved and cannot be used:

- `claude-code-marketplace`
- `claude-code-plugins`
- `claude-plugins-official`
- `anthropic-marketplace`
- `anthropic-plugins`
- `agent-skills`
- `life-sciences`

Names that impersonate official marketplaces (like `official-claude-plugins` or `anthropic-tools-v2`) are also blocked.

### Optional Metadata

| Field | Type | Description |
|-------|------|-------------|
| `metadata.description` | string | Brief marketplace description |
| `metadata.version` | string | Marketplace version |
| `metadata.pluginRoot` | string | Base directory prepended to relative plugin source paths (e.g., `"./plugins"` lets you write `"source": "formatter"` instead of `"source": "./plugins/formatter"`) |

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
    "version": "2.0.0"
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

Pin to exact commit:

```json
{
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `repo` | string | Required. GitHub repository in `owner/repo` format |
| `ref` | string | Optional. Git branch or tag (defaults to repository default branch) |
| `sha` | string | Optional. Full 40-character commit SHA for exact version pinning |

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

With SHA pinning:

```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git",
    "ref": "main",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Required. Full git repository URL (must end with `.git`) |
| `ref` | string | Optional. Git branch or tag (defaults to repository default branch) |
| `sha` | string | Optional. Full 40-character commit SHA for exact version pinning |

### Private Repository Authentication

Claude Code supports installing plugins from private repositories. Set the appropriate authentication token in your environment:

| Provider | Environment Variables | Notes |
|----------|----------------------|-------|
| GitHub | `GITHUB_TOKEN` or `GH_TOKEN` | Personal access token or GitHub App token |
| GitLab | `GITLAB_TOKEN` or `GL_TOKEN` | Personal access token or project token |
| Bitbucket | `BITBUCKET_TOKEN` | App password or repository access token |

Set the token in your shell configuration (`.bashrc`, `.zshrc`) or pass it when running Claude Code:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

Authentication tokens are only used when a repository requires authentication. Public repositories work without tokens.

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
    "name": "Community"
  },
  "metadata": {
    "description": "Curated Claude Code plugins"
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
