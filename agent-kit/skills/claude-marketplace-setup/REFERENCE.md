# Claude Plugin Marketplace Setup - Complete Reference

## Complete Marketplace Schema

```typescript
interface Marketplace {
  // Required fields
  name: string;                    // Marketplace identifier (kebab-case)
  owner: {
    name: string;                  // Maintainer name
    email: string;                 // Contact email
  };
  plugins: PluginEntry[];          // Array of plugin entries

  // Optional metadata
  metadata?: {
    description?: string;          // Marketplace description
    version?: string;              // Marketplace version
    pluginRoot?: string;           // Base path for relative sources
    homepage?: string;             // Documentation URL
    repository?: string;           // Source code URL
  };
}

interface PluginEntry {
  // Required
  name: string;                    // Plugin identifier (kebab-case)
  source: string | PluginSource;   // Where to fetch plugin

  // Optional standard fields
  description?: string;            // Plugin description
  version?: string;                // Plugin version
  author?: {
    name: string;
    email?: string;
  };
  homepage?: string;               // Documentation URL
  repository?: string;             // Source code URL
  license?: string;                // SPDX identifier
  keywords?: string[];             // Search tags
  category?: string;               // Plugin category
  tags?: string[];                 // Additional tags
  strict?: boolean;                // Require plugin.json (default: true)

  // Optional component configuration
  commands?: string[];             // Custom command paths
  agents?: string[];               // Custom agent paths
  hooks?: HooksConfig;             // Event hooks
  mcpServers?: Record<string, MCPServerConfig>;  // MCP servers
}

interface PluginSource {
  source: "github" | "url";
  repo?: string;                   // For GitHub: "owner/repo"
  url?: string;                    // For Git: full URL
  ref?: string;                    // Branch/tag/commit
}

interface HooksConfig {
  PreToolUse?: HookMatcher[];
  PostToolUse?: HookMatcher[];
  PrePromptSubmit?: HookMatcher[];
  PostPromptSubmit?: HookMatcher[];
}

interface HookMatcher {
  matcher: string;                 // Regex pattern
  hooks: Hook[];
}

interface Hook {
  type: "command";
  command: string;                 // Command to execute
}

interface MCPServerConfig {
  command: string;                 // Command to run
  args?: string[];                 // Command arguments
  env?: Record<string, string>;    // Environment variables
}
```

## Marketplace Configuration Examples

### Minimal Marketplace

```json
{
  "name": "my-marketplace",
  "owner": {
    "name": "Me",
    "email": "me@example.com"
  },
  "plugins": []
}
```

### Full-Featured Marketplace

```json
{
  "name": "enterprise-tools",
  "owner": {
    "name": "Enterprise Engineering Team",
    "email": "engineering@enterprise.com"
  },
  "metadata": {
    "description": "Enterprise development and deployment tools for Claude Code",
    "version": "3.1.0",
    "pluginRoot": "./plugins",
    "homepage": "https://docs.enterprise.com/claude-plugins",
    "repository": "https://github.com/enterprise/claude-plugins"
  },
  "plugins": [
    {
      "name": "deployment-automation",
      "source": "./deployment-automation",
      "description": "Automated deployment workflows with rollback support",
      "version": "2.5.0",
      "author": {
        "name": "DevOps Team",
        "email": "devops@enterprise.com"
      },
      "homepage": "https://docs.enterprise.com/plugins/deployment",
      "repository": "https://github.com/enterprise/deployment-plugin",
      "license": "MIT",
      "keywords": ["deployment", "automation", "devops"],
      "category": "infrastructure"
    },
    {
      "name": "security-scanner",
      "source": {
        "source": "github",
        "repo": "enterprise/security-scanner",
        "ref": "v3.0.0"
      },
      "description": "Security vulnerability scanning and remediation",
      "version": "3.0.0",
      "author": {
        "name": "Security Team"
      },
      "license": "Proprietary",
      "keywords": ["security", "scanning", "vulnerabilities"],
      "category": "security",
      "commands": [
        "./commands/scan/",
        "./commands/remediate/"
      ],
      "agents": [
        "./agents/security-reviewer.md"
      ],
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "Write|Edit",
            "hooks": [
              {
                "type": "command",
                "command": "${CLAUDE_PLUGIN_ROOT}/hooks/security-check.sh"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "api-gateway",
      "source": {
        "source": "url",
        "url": "https://git.enterprise.com/tools/api-gateway-plugin.git",
        "ref": "main"
      },
      "description": "Internal API gateway management and testing",
      "version": "1.8.0",
      "keywords": ["api", "gateway", "testing"],
      "category": "development",
      "mcpServers": {
        "api-gateway": {
          "command": "${CLAUDE_PLUGIN_ROOT}/servers/gateway-server",
          "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
          "env": {
            "API_ENDPOINT": "${ENTERPRISE_API_ENDPOINT}",
            "API_KEY": "${ENTERPRISE_API_KEY}"
          }
        }
      }
    }
  ]
}
```

## Plugin Source Patterns

### Pattern 1: Monorepo with Relative Paths

For multiple plugins in the same repository:

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── plugin-a/
    ├── plugin-b/
    └── plugin-c/
```

**marketplace.json:**
```json
{
  "name": "my-marketplace",
  "metadata": {
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {"name": "plugin-a", "source": "./plugin-a"},
    {"name": "plugin-b", "source": "./plugin-b"},
    {"name": "plugin-c", "source": "./plugin-c"}
  ]
}
```

### Pattern 2: External GitHub Repositories

For plugins in separate GitHub repositories:

```json
{
  "plugins": [
    {
      "name": "auth-tools",
      "source": {
        "source": "github",
        "repo": "company/auth-tools"
      }
    },
    {
      "name": "data-tools",
      "source": {
        "source": "github",
        "repo": "company/data-tools",
        "ref": "v2.0.0"
      }
    }
  ]
}
```

### Pattern 3: Mixed Sources

Combination of local and remote plugins:

```json
{
  "plugins": [
    {
      "name": "local-plugin",
      "source": "./plugins/local-plugin",
      "description": "Local development plugin"
    },
    {
      "name": "shared-plugin",
      "source": {
        "source": "github",
        "repo": "org/shared-plugin"
      },
      "description": "Shared across projects"
    },
    {
      "name": "enterprise-plugin",
      "source": {
        "source": "url",
        "url": "https://git.company.com/plugins/enterprise.git"
      },
      "description": "Internal enterprise tools"
    }
  ]
}
```

### Pattern 4: Versioned Releases

Using specific versions and refs:

```json
{
  "plugins": [
    {
      "name": "stable-plugin",
      "source": {
        "source": "github",
        "repo": "org/stable-plugin",
        "ref": "v1.5.2"
      },
      "version": "1.5.2"
    },
    {
      "name": "beta-plugin",
      "source": {
        "source": "github",
        "repo": "org/beta-plugin",
        "ref": "develop"
      },
      "version": "2.0.0-beta.1"
    }
  ]
}
```

## Team Configuration Patterns

### Pattern 1: Single Organization Marketplace

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "company/claude-plugins"
      }
    }
  }
}
```

### Pattern 2: Multiple Marketplaces

```json
{
  "extraKnownMarketplaces": {
    "company-core": {
      "source": {
        "source": "github",
        "repo": "company/core-plugins"
      }
    },
    "company-frontend": {
      "source": {
        "source": "github",
        "repo": "company/frontend-plugins"
      }
    },
    "company-backend": {
      "source": {
        "source": "github",
        "repo": "company/backend-plugins"
      }
    }
  }
}
```

### Pattern 3: Public and Private Marketplaces

```json
{
  "extraKnownMarketplaces": {
    "public-community": {
      "source": {
        "source": "github",
        "repo": "community/awesome-claude-plugins"
      }
    },
    "company-private": {
      "source": {
        "source": "github",
        "repo": "company-private/internal-plugins"
      }
    }
  }
}
```

### Pattern 4: Environment-Specific Marketplaces

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
    "staging": {
      "source": {
        "source": "github",
        "repo": "company/staging-plugins",
        "ref": "staging"
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

## Marketplace Management Commands

### Installation

```bash
# GitHub repository (short form)
/plugin marketplace add owner/repo

# GitHub repository (full URL)
/plugin marketplace add https://github.com/owner/repo

# Git repository
/plugin marketplace add https://gitlab.com/company/plugins.git

# Local directory
/plugin marketplace add ./path/to/marketplace

# Local marketplace.json file
/plugin marketplace add ./path/to/marketplace.json

# Remote marketplace.json URL
/plugin marketplace add https://example.com/marketplace.json
```

### Management

```bash
# List all installed marketplaces
/plugin marketplace list

# Update specific marketplace
/plugin marketplace update marketplace-name

# Update all marketplaces
/plugin marketplace update --all

# Remove marketplace (and its plugins)
/plugin marketplace remove marketplace-name

# View marketplace details
/plugin marketplace info marketplace-name
```

### Plugin Installation from Marketplace

```bash
# Install from specific marketplace
/plugin install plugin-name@marketplace-name

# Install latest version
/plugin install plugin-name@marketplace-name@latest

# Install specific version
/plugin install plugin-name@marketplace-name@1.2.0

# List available plugins in marketplace
/plugin list marketplace-name

# Search across marketplaces
/plugin search keyword
```

## Validation Scripts

### Validate Marketplace JSON

```bash
#!/usr/bin/env bash

# validate-marketplace.sh

MARKETPLACE_FILE="${1:-.claude-plugin/marketplace.json}"

echo "Validating marketplace: $MARKETPLACE_FILE"

# Check file exists
if [[ ! -f "$MARKETPLACE_FILE" ]]; then
  echo "Error: File not found: $MARKETPLACE_FILE"
  exit 1
fi

# Validate JSON syntax
if ! jq empty "$MARKETPLACE_FILE" 2>/dev/null; then
  echo "Error: Invalid JSON syntax"
  exit 1
fi

# Check required fields
if ! jq -e '.name' "$MARKETPLACE_FILE" > /dev/null; then
  echo "Error: Missing required field: name"
  exit 1
fi

if ! jq -e '.owner.name' "$MARKETPLACE_FILE" > /dev/null; then
  echo "Error: Missing required field: owner.name"
  exit 1
fi

if ! jq -e '.owner.email' "$MARKETPLACE_FILE" > /dev/null; then
  echo "Error: Missing required field: owner.email"
  exit 1
fi

if ! jq -e '.plugins' "$MARKETPLACE_FILE" > /dev/null; then
  echo "Error: Missing required field: plugins"
  exit 1
fi

# Validate plugin entries
plugin_count=$(jq '.plugins | length' "$MARKETPLACE_FILE")
echo "Found $plugin_count plugins"

for i in $(seq 0 $((plugin_count - 1))); do
  plugin_name=$(jq -r ".plugins[$i].name" "$MARKETPLACE_FILE")

  if [[ -z "$plugin_name" || "$plugin_name" == "null" ]]; then
    echo "Error: Plugin at index $i missing name"
    exit 1
  fi

  if ! jq -e ".plugins[$i].source" "$MARKETPLACE_FILE" > /dev/null; then
    echo "Error: Plugin '$plugin_name' missing source"
    exit 1
  fi

  echo "✓ Plugin: $plugin_name"
done

echo "Validation successful!"
```

### Validate Plugin Sources

```bash
#!/usr/bin/env bash

# validate-plugin-sources.sh

MARKETPLACE_FILE="${1:-.claude-plugin/marketplace.json}"
BASE_DIR=$(dirname "$MARKETPLACE_FILE")

# Get plugin root if specified
PLUGIN_ROOT=$(jq -r '.metadata.pluginRoot // ""' "$MARKETPLACE_FILE")

# Validate relative path sources
echo "Checking relative path sources..."
jq -r '.plugins[] | select(.source | type == "string") | "\(.name)|\(.source)"' "$MARKETPLACE_FILE" | \
while IFS='|' read -r name source; do
  # Construct full path
  if [[ -n "$PLUGIN_ROOT" ]]; then
    full_path="$BASE_DIR/$PLUGIN_ROOT/$source"
  else
    full_path="$BASE_DIR/$source"
  fi

  if [[ ! -d "$full_path" ]]; then
    echo "✗ $name: Directory not found: $full_path"
  else
    # Check for plugin.json
    if [[ -f "$full_path/plugin.json" ]]; then
      echo "✓ $name: Valid plugin directory"
    else
      echo "⚠ $name: Missing plugin.json (may be okay if strict=false)"
    fi
  fi
done

# Validate GitHub sources (requires gh CLI)
if command -v gh &> /dev/null; then
  echo -e "\nChecking GitHub sources..."
  jq -r '.plugins[] | select(.source.source == "github") | "\(.name)|\(.source.repo)"' "$MARKETPLACE_FILE" | \
  while IFS='|' read -r name repo; do
    if gh repo view "$repo" &> /dev/null; then
      echo "✓ $name: GitHub repo accessible: $repo"
    else
      echo "✗ $name: GitHub repo not found or not accessible: $repo"
    fi
  done
fi

# Validate Git sources
echo -e "\nChecking Git sources..."
jq -r '.plugins[] | select(.source.source == "url") | "\(.name)|\(.source.url)"' "$MARKETPLACE_FILE" | \
while IFS='|' read -r name url; do
  if git ls-remote "$url" &> /dev/null; then
    echo "✓ $name: Git repository accessible: $url"
  else
    echo "✗ $name: Git repository not accessible: $url"
  fi
done
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Validate Marketplace

on:
  push:
    paths:
      - '.claude-plugin/marketplace.json'
  pull_request:
    paths:
      - '.claude-plugin/marketplace.json'

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Validate JSON syntax
        run: |
          jq empty .claude-plugin/marketplace.json

      - name: Check required fields
        run: |
          jq -e '.name, .owner.name, .owner.email, .plugins' .claude-plugin/marketplace.json

      - name: Validate plugin entries
        run: |
          # Check each plugin has name and source
          jq -e '.plugins[] | .name, .source' .claude-plugin/marketplace.json

      - name: Check relative paths exist
        run: |
          for plugin in $(jq -r '.plugins[] | select(.source | type == "string") | .source' .claude-plugin/marketplace.json); do
            if [[ ! -d "$plugin" ]]; then
              echo "Missing plugin directory: $plugin"
              exit 1
            fi
          done

      - name: Validate GitHub sources
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          for repo in $(jq -r '.plugins[] | select(.source.source == "github") | .source.repo' .claude-plugin/marketplace.json); do
            if ! gh repo view "$repo" > /dev/null 2>&1; then
              echo "Invalid GitHub repo: $repo"
              exit 1
            fi
          done
```

### GitLab CI Pipeline

```yaml
validate-marketplace:
  image: alpine:latest

  before_script:
    - apk add --no-cache jq git

  script:
    # Validate JSON
    - jq empty .claude-plugin/marketplace.json

    # Check required fields
    - jq -e '.name, .owner.name, .owner.email, .plugins' .claude-plugin/marketplace.json

    # Validate plugins
    - jq -e '.plugins[] | .name, .source' .claude-plugin/marketplace.json

    # Check relative paths
    - |
      for plugin in $(jq -r '.plugins[] | select(.source | type == "string") | .source' .claude-plugin/marketplace.json); do
        if [ ! -d "$plugin" ]; then
          echo "Missing: $plugin"
          exit 1
        fi
      done

  only:
    changes:
      - .claude-plugin/marketplace.json
```

## Marketplace Discovery and SEO

### README.md Template

```markdown
# My Awesome Marketplace

A curated collection of Claude Code plugins for [domain/purpose].

## Installation

\`\`\`bash
/plugin marketplace add owner/my-awesome-marketplace
\`\`\`

## Available Plugins

### Development Tools

- **plugin-name** - Description
  \`\`\`bash
  /plugin install plugin-name@my-awesome-marketplace
  \`\`\`

### Infrastructure Tools

- **another-plugin** - Description
  \`\`\`bash
  /plugin install another-plugin@my-awesome-marketplace
  \`\`\`

## Categories

- Development
- Infrastructure
- Security
- Testing

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
```

### Topics and Tags (GitHub)

Add topics to your GitHub repository for discoverability:
- `claude-code`
- `claude-plugins`
- `marketplace`
- `ai-tools`
- `developer-tools`

### Awesome List

Consider submitting to curated awesome lists:
- awesome-claude-code
- awesome-ai-tools
- awesome-developer-tools

## Security Best Practices

### Plugin Review Process

1. **Source Code Review**
   - Review all plugin code before adding
   - Check for malicious patterns
   - Verify dependencies
   - Audit scripts and hooks

2. **Dependency Scanning**
   - Scan for known vulnerabilities
   - Check for outdated packages
   - Review license compatibility

3. **Access Control**
   - Use private repositories for sensitive plugins
   - Implement approval workflows
   - Restrict write access to marketplace

4. **Audit Logging**
   - Log all marketplace changes
   - Track plugin installations
   - Monitor usage patterns

### Marketplace Security Checklist

- [ ] All plugins reviewed and approved
- [ ] Repository has branch protection
- [ ] Required reviews for PRs
- [ ] CI/CD validation in place
- [ ] Security scanning enabled
- [ ] Private for sensitive tools
- [ ] Access control documented
- [ ] Incident response plan
- [ ] Regular security audits

## Performance Optimization

### Marketplace Size

Keep marketplaces focused and manageable:
- **Small**: 1-10 plugins (team-specific)
- **Medium**: 10-50 plugins (organization-wide)
- **Large**: 50+ plugins (community/public)

### Plugin Loading

Optimize plugin loading:
- Use relative paths for monorepo
- Leverage Git shallow clones
- Cache plugin sources
- Minimize external dependencies

### Update Strategy

Efficient update management:
- Batch updates periodically
- Use semantic versioning
- Pin stable versions
- Test before promoting

## Migration Patterns

### From Manual Installation to Marketplace

**Before:**
```bash
# Users manually install each plugin
/plugin install ./path/to/plugin-a
/plugin install ./path/to/plugin-b
```

**After:**
```bash
# Add marketplace once
/plugin marketplace add company/plugins

# Install from marketplace
/plugin install plugin-a@company
/plugin install plugin-b@company
```

### From Single Marketplace to Multiple

**Split by concern:**
```json
// Before: one large marketplace
{"name": "all-tools", "plugins": [...50 plugins...]}

// After: focused marketplaces
{"name": "frontend-tools", "plugins": [...10 plugins...]}
{"name": "backend-tools", "plugins": [...15 plugins...]}
{"name": "devops-tools", "plugins": [...12 plugins...]}
```

## Troubleshooting Guide

### Common Issues

**Issue: Marketplace not found**
```
Error: Could not find marketplace at <url>
```
**Solution:**
- Verify URL is correct
- Check `.claude-plugin/marketplace.json` exists at root
- Ensure repository is accessible
- For private repos, check authentication

**Issue: Plugin source not found**
```
Error: Could not fetch plugin from <source>
```
**Solution:**
- Verify source path/URL is correct
- For relative paths, check `pluginRoot` configuration
- For GitHub, verify repo exists and is accessible
- Check branch/ref is correct

**Issue: Invalid marketplace JSON**
```
Error: Failed to parse marketplace.json
```
**Solution:**
- Validate JSON syntax: `jq empty marketplace.json`
- Check for trailing commas
- Verify all strings are quoted
- Ensure proper nesting

**Issue: Plugin won't install**
```
Error: Plugin installation failed
```
**Solution:**
- Check plugin has required structure
- Verify plugin.json exists (if strict=true)
- Review plugin compatibility
- Check for conflicting plugins

### Debug Commands

```bash
# Validate marketplace JSON
jq empty .claude-plugin/marketplace.json

# List all fields
jq '.' .claude-plugin/marketplace.json

# Check specific plugin
jq '.plugins[] | select(.name == "plugin-name")' .claude-plugin/marketplace.json

# Count plugins
jq '.plugins | length' .claude-plugin/marketplace.json

# List plugin names
jq -r '.plugins[].name' .claude-plugin/marketplace.json

# Find plugins by keyword
jq -r '.plugins[] | select(.keywords[]? == "security") | .name' .claude-plugin/marketplace.json
```

## Advanced Patterns

### Dynamic Plugin Loading

Load plugins based on project type:

```json
{
  "plugins": [
    {
      "name": "typescript-tools",
      "source": "./plugins/typescript",
      "tags": ["typescript", "javascript"]
    },
    {
      "name": "rust-tools",
      "source": "./plugins/rust",
      "tags": ["rust", "systems"]
    },
    {
      "name": "python-tools",
      "source": "./plugins/python",
      "tags": ["python", "data-science"]
    }
  ]
}
```

### Plugin Dependencies

Express plugin dependencies in metadata:

```json
{
  "name": "advanced-deploy",
  "source": "./plugins/advanced-deploy",
  "metadata": {
    "requires": ["base-tools", "git-helpers"]
  }
}
```

### Plugin Variants

Offer different plugin configurations:

```json
{
  "plugins": [
    {
      "name": "tools-minimal",
      "source": "./plugins/tools",
      "description": "Minimal tool set"
    },
    {
      "name": "tools-full",
      "source": {
        "source": "github",
        "repo": "company/tools",
        "ref": "full-featured"
      },
      "description": "Complete tool set with all features"
    }
  ]
}
```
