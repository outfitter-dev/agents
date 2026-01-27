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
| `metadata.pluginRoot` | string | Documentation hint for where plugins live. Does NOT affect schema validation—always use explicit `./` prefix in source paths. |

### Complete Example

For local plugins (relative paths), use `strict: false` to consolidate metadata. Always use explicit `./` prefix for source paths:

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
  "strict": false,
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./code-formatter",
      "version": "1.0.0",
      "description": "Auto-format code on save",
      "license": "MIT"
    },
    {
      "name": "deployment-tools",
      "source": "./deployment",
      "version": "2.1.0",
      "description": "Deploy to staging and production",
      "license": "MIT"
    }
  ]
}
```

With `strict: false`, plugins don't need their own `.claude-plugin/plugin.json`—the marketplace is the single source of truth.

## Plugin Entry Schema

### Local Plugins (Consolidated)

For plugins in the same repo as the marketplace, define all metadata in the marketplace entry:

```json
{
  "name": "code-formatter",
  "source": "./code-formatter",
  "version": "1.0.0",
  "description": "Auto-format code on save",
  "license": "MIT",
  "keywords": ["formatting", "linting"]
}
```

Set `strict: false` at the marketplace level. Plugins don't need their own `.claude-plugin/plugin.json`.

**Benefits:** Single source of truth, prevents version/metadata drift between marketplace and plugin manifests.

### External Plugins (Distributed)

For plugins in external repos, use minimal entries—let the external repo own its manifest:

```json
{
  "name": "enterprise-tools",
  "source": {
    "source": "github",
    "repo": "company/enterprise-plugin"
  }
}
```

The external repo should have its own `.claude-plugin/plugin.json` with metadata.

**Why:** External plugins may be used outside your marketplace. They should be self-contained.

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
| `strict` | boolean | `true` | When `false`, plugins don't need their own `.claude-plugin/plugin.json`—marketplace defines everything. Use for local plugins (relative paths). When `true`, plugins must have their own manifest. |

**When to use each mode:**

| Pattern | `strict` | Use when |
|---------|----------|----------|
| Consolidated | `false` | All plugins are local (relative paths in same repo) |
| Distributed | `true` | Plugins are external repos that may be used elsewhere |
| Mixed | `false` | Local plugins consolidated, external plugins own their manifests |

**Component configuration** (optional):

| Field | Type | Description |
|-------|------|-------------|
| `commands` | string\|array | Custom paths to command files or directories |
| `agents` | string\|array | Custom paths to agent files |
| `hooks` | string\|object | Hook configuration or path to hooks file |
| `mcpServers` | string\|object | MCP server configuration or path to MCP config |
| `lspServers` | string\|object | LSP server configuration or path to LSP config |

## Plugin Source Types

### Relative Path

For plugins in the same repository, always use explicit `./` prefix paths:

**Plugins at repo root:**

```json
{
  "plugins": [
    {"name": "my-plugin", "source": "./my-plugin"},
    {"name": "another", "source": "./another"}
  ]
}
```

**Plugins in a subdirectory:**

```json
{
  "plugins": [
    {"name": "my-plugin", "source": "./packages/my-plugin"},
    {"name": "another", "source": "./packages/another"}
  ]
}
```

The schema requires the `./` prefix for relative paths. Bare names like `"source": "my-plugin"` fail validation.

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

Monorepo pattern (plugin in a subdirectory):

```json
{
  "source": {
    "source": "github",
    "repo": "owner/my-project",
    "path": "./packages/claude-plugin"
  }
}
```

Use `path` when the plugin lives alongside application code in a monorepo. Common patterns:

| Monorepo Structure | `path` Value |
|--------------------|--------------|
| `packages/claude-plugin/` | `./packages/claude-plugin` |
| `.claude-plugin/` at root | (omit — this is the default) |
| `tools/claude-plugin/` | `./tools/claude-plugin` |

| Field | Type | Description |
|-------|------|-------------|
| `repo` | string | Required. GitHub repository in `owner/repo` format |
| `path` | string | Optional. Subdirectory containing `.claude-plugin/plugin.json` |
| `ref` | string | Optional. Branch name or tag (omit to use default branch) |
| `sha` | string | Optional. Full 40-character commit SHA for exact version pinning |

### Git URL

For GitLab, Bitbucket, or self-hosted:

```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git"
  }
}
```

With specific branch or SHA pinning:

```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git",
    "ref": "develop",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Required. Full git repository URL (must end with `.git`) |
| `path` | string | Optional. Subdirectory containing `.claude-plugin/plugin.json` |
| `ref` | string | Optional. Branch name or tag (omit to use default branch) |
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
        "repo": "company/plugins",
        "ref": "develop"
      }
    },
    "production": {
      "source": {
        "source": "github",
        "repo": "company/plugins"
      }
    }
  }
}
```

Use `ref` to point development at a non-default branch. Production uses the default branch (no `ref` needed).

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
