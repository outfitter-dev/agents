---
name: claude-marketplace-setup
description: Creates and manages plugin marketplaces for Claude Code, enabling plugin discovery, distribution, and team sharing. Generates marketplace.json files with proper schema, configures plugin sources (GitHub, Git, local), and sets up team configurations for automatic marketplace installation. Use when publishing Claude Code plugins, creating internal plugin catalogs, setting up team plugin distribution, or managing plugin discovery for Claude Code projects.
version: 1.0.0
---

# Claude Plugin Marketplace Setup

Creates and manages plugin marketplaces for Claude Code, making plugins discoverable and installable across teams and projects.

## Quick Start

### What is a Marketplace?

A marketplace is a catalog of Claude Code plugins defined in a `.claude-plugin/marketplace.json` file. It enables:
- Plugin discovery
- One-command installation
- Version management
- Team distribution

### Basic Marketplace Structure

```json
{
  "name": "my-marketplace",
  "owner": {
    "name": "Team Name",
    "email": "team@example.com"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "Plugin description",
      "version": "1.0.0"
    }
  ]
}
```

### Creating Your First Marketplace

**Step 1: Create marketplace directory**

```bash
mkdir -p .claude-plugin
```

**Step 2: Create marketplace.json**

```bash
cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "team-tools",
  "owner": {
    "name": "Development Team",
    "email": "dev@company.com"
  },
  "plugins": []
}
EOF
```

**Step 3: Add plugins**
Add plugin entries to the `plugins` array (see Plugin Entry Schema below)

**Step 4: Test locally**

```bash
/plugin marketplace add .
/plugin
```

## Marketplace Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Marketplace identifier (kebab-case) |
| `owner` | object | Maintainer information |
| `owner.name` | string | Maintainer name |
| `owner.email` | string | Contact email |
| `plugins` | array | List of available plugins |

### Optional Metadata

| Field | Type | Description |
|-------|------|-------------|
| `metadata.description` | string | Brief marketplace description |
| `metadata.version` | string | Marketplace version |
| `metadata.pluginRoot` | string | Base path for relative sources |

### Complete Example

```json
{
  "name": "company-tools",
  "owner": {
    "name": "Engineering Team",
    "email": "eng@company.com"
  },
  "metadata": {
    "description": "Internal development tools and workflows",
    "version": "2.0.0",
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./code-formatter",
      "description": "Automatic code formatting on save",
      "version": "2.1.0",
      "author": {
        "name": "Tools Team"
      },
      "keywords": ["formatting", "code-quality"]
    }
  ]
}
```

## Plugin Entry Schema

### Minimal Plugin Entry

```json
{
  "name": "plugin-name",
  "source": "./path/to/plugin"
}
```

### Complete Plugin Entry

```json
{
  "name": "enterprise-tools",
  "source": {
    "source": "github",
    "repo": "company/enterprise-plugin"
  },
  "description": "Enterprise workflow automation tools",
  "version": "2.1.0",
  "author": {
    "name": "Enterprise Team",
    "email": "enterprise@company.com"
  },
  "homepage": "https://docs.company.com/plugins",
  "repository": "https://github.com/company/enterprise-plugin",
  "license": "MIT",
  "keywords": ["enterprise", "workflow", "automation"],
  "category": "productivity",
  "strict": false
}
```

### Plugin Entry Fields

**Required:**
- `name`: Plugin identifier (kebab-case)
- `source`: Where to fetch plugin from

**Optional Standard Fields:**
- `description`: Brief plugin description
- `version`: Plugin version
- `author`: Author information
- `homepage`: Documentation URL
- `repository`: Source code URL
- `license`: SPDX identifier (e.g., MIT)
- `keywords`: Tags for discovery
- `category`: Plugin category
- `tags`: Searchability tags
- `strict`: Require plugin.json (default: true)

**Optional Component Configuration:**
- `commands`: Custom paths to command files
- `agents`: Custom paths to agent files
- `hooks`: Custom hooks configuration
- `mcpServers`: MCP server configurations

## Plugin Source Types

### 1. Relative Path

For plugins in the same repository:

```json
{
  "name": "my-plugin",
  "source": "./plugins/my-plugin"
}
```

With `pluginRoot`:

```json
{
  "metadata": {
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./my-plugin"
    }
  ]
}
```

### 2. GitHub Repository

For plugins in GitHub repos:

```json
{
  "name": "github-plugin",
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo"
  }
}
```

With specific branch:

```json
{
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "develop"
  }
}
```

### 3. Git Repository

For plugins in other Git hosting:

```json
{
  "name": "git-plugin",
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git"
  }
}
```

With specific branch:

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

### 1. Team/Organization Marketplace

For internal team tools:

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
    {
      "name": "deploy-tools",
      "source": "./plugins/deploy-tools",
      "description": "Deployment automation"
    },
    {
      "name": "compliance-check",
      "source": "./plugins/compliance-check",
      "description": "Security and compliance validation"
    }
  ]
}
```

**Hosting:** Private GitHub repo or internal Git server

### 2. Project-Specific Marketplace

For project-specific plugins:

```json
{
  "name": "project-tools",
  "owner": {
    "name": "Project Team",
    "email": "project@company.com"
  },
  "plugins": [
    {
      "name": "project-workflow",
      "source": "./plugins/workflow",
      "description": "Project-specific workflow automation"
    }
  ]
}
```

**Hosting:** In project repository at `.claude-plugin/marketplace.json`

### 3. Public Marketplace

For public/open-source plugins:

```json
{
  "name": "awesome-claude-plugins",
  "owner": {
    "name": "Community",
    "email": "community@example.com"
  },
  "metadata": {
    "description": "Curated collection of Claude Code plugins",
    "homepage": "https://github.com/awesome-claude-plugins"
  },
  "plugins": [
    {
      "name": "markdown-tools",
      "source": {
        "source": "github",
        "repo": "user/markdown-tools"
      },
      "description": "Markdown editing and preview tools",
      "license": "MIT"
    }
  ]
}
```

**Hosting:** Public GitHub repository

## Team Configuration

### Automatic Marketplace Installation

Configure team marketplaces in `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "github",
        "repo": "company/claude-plugins"
      }
    },
    "project-specific": {
      "source": {
        "source": "git",
        "url": "https://git.company.com/project-plugins.git"
      }
    }
  }
}
```

When team members trust the folder, Claude Code automatically installs these marketplaces.

### Multi-Environment Setup

Different marketplaces for different environments:

```json
{
  "extraKnownMarketplaces": {
    "production-tools": {
      "source": {
        "source": "github",
        "repo": "company/prod-plugins"
      }
    },
    "development-tools": {
      "source": {
        "source": "github",
        "repo": "company/dev-plugins"
      }
    }
  }
}
```

## Marketplace Management

### Adding a Marketplace

```bash
# GitHub repository
/plugin marketplace add owner/repo

# Git repository
/plugin marketplace add https://gitlab.com/company/plugins.git

# Local directory
/plugin marketplace add ./path/to/marketplace

# Direct URL
/plugin marketplace add https://url.of/marketplace.json
```

### Listing Marketplaces

```bash
/plugin marketplace list
```

### Updating a Marketplace

```bash
/plugin marketplace update marketplace-name
```

### Removing a Marketplace

```bash
/plugin marketplace remove marketplace-name
```

**Note:** Removing a marketplace also uninstalls all plugins from that marketplace.

## Workflow

### Creating a New Marketplace

1. **Initialize structure**

   ```bash
   mkdir -p .claude-plugin
   ```

2. **Create marketplace.json**
   - Define name, owner, metadata
   - Start with empty plugins array

3. **Add plugins**
   - Add plugin entries with sources
   - Include descriptions and versions

4. **Test locally**

   ```bash
   /plugin marketplace add .
   /plugin
   ```

5. **Commit to version control**

   ```bash
   git add .claude-plugin/marketplace.json
   git commit -m "feat: add plugin marketplace"
   ```

### Adding a Plugin to Marketplace

1. **Create plugin entry**

   ```json
   {
     "name": "new-plugin",
     "source": "./plugins/new-plugin",
     "description": "Plugin description",
     "version": "1.0.0"
   }
   ```

2. **Add to plugins array**
   Edit marketplace.json and add entry

3. **Validate JSON**

   ```bash
   jq empty .claude-plugin/marketplace.json
   ```

4. **Update marketplace**

   ```bash
   /plugin marketplace update marketplace-name
   ```

5. **Install plugin**

   ```bash
   /plugin install new-plugin@marketplace-name
   ```

## Hosting Strategies

### GitHub (Recommended)

**Advantages:**
- Version control
- Issue tracking
- Collaboration tools
- Free for public/private repos
- Easy sharing

**Setup:**
1. Create repository
2. Add `.claude-plugin/marketplace.json`
3. Commit and push
4. Share: `/plugin marketplace add owner/repo`

### GitLab/Bitbucket

**Works with any Git hosting:**

```bash
/plugin marketplace add https://gitlab.com/company/plugins.git
```

**Advantages:**
- Self-hosted options
- Enterprise integration
- Custom workflows

### Local Development

**For testing and development:**

```bash
/plugin marketplace add ./my-local-marketplace
/plugin install test-plugin@my-local-marketplace
```

**Advantages:**
- Fast iteration
- No network required
- Easy testing

## Validation

### Validate Marketplace Structure

```bash
# Validate JSON syntax
jq empty .claude-plugin/marketplace.json

# Validate required fields
jq -e '.name, .owner, .plugins' .claude-plugin/marketplace.json

# Check plugin entries
jq -e '.plugins[] | .name, .source' .claude-plugin/marketplace.json
```

### Validate Plugin Sources

```bash
# Check relative paths exist
for plugin in $(jq -r '.plugins[] | select(.source | type == "string") | .source' .claude-plugin/marketplace.json); do
  if [[ ! -d "$plugin" ]]; then
    echo "Missing: $plugin"
  fi
done

# Validate GitHub repos (requires gh CLI)
for repo in $(jq -r '.plugins[] | select(.source.source == "github") | .source.repo' .claude-plugin/marketplace.json); do
  gh repo view "$repo" > /dev/null || echo "Invalid repo: $repo"
done
```

## Best Practices

### Organization

- Group related plugins together
- Use categories for better discovery
- Maintain consistent naming
- Document plugin purposes clearly

### Versioning

- Use semantic versioning for marketplace
- Track plugin versions
- Maintain CHANGELOG.md
- Tag releases in Git

### Documentation

- Include README.md in marketplace repo
- Document installation process
- Provide usage examples
- Link to plugin documentation

### Security

- Review plugins before adding
- Verify plugin sources
- Document security requirements
- Use private repos for sensitive tools

### Maintenance

- Keep plugin versions updated
- Remove deprecated plugins
- Test plugins after updates
- Monitor user feedback

## Troubleshooting

**Marketplace not loading:**
- Verify URL is accessible
- Check `.claude-plugin/marketplace.json` exists
- Validate JSON syntax
- Confirm access permissions for private repos

**Plugin installation failures:**
- Verify plugin source URLs are accessible
- Check plugin directories contain required files
- Test sources manually (clone/download)
- Review error messages in logs

**Team configuration not working:**
- Verify `.claude/settings.json` syntax
- Check marketplace sources are accessible
- Ensure team members trusted the folder
- Restart Claude Code after config changes

## Next Steps

- See [REFERENCE.md](REFERENCE.md) for complete schema documentation
- See [EXAMPLES.md](EXAMPLES.md) for real-world marketplace examples
- Use scripts in `scripts/` for marketplace validation and management
