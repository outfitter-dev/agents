# Claude Plugin Marketplace Setup - Examples

## Example 1: Personal Tools Marketplace

A simple marketplace for personal development tools.

### Structure

```
my-tools/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── quick-commit/
    ├── format-code/
    └── test-runner/
```

### .claude-plugin/marketplace.json

```json
{
  "name": "my-personal-tools",
  "owner": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "description": "Personal development workflow tools",
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "quick-commit",
      "source": "./quick-commit",
      "description": "Quick git commit with conventional commit messages",
      "version": "1.0.0"
    },
    {
      "name": "format-code",
      "source": "./format-code",
      "description": "Auto-format code on save",
      "version": "1.2.0"
    },
    {
      "name": "test-runner",
      "source": "./test-runner",
      "description": "Run tests with watch mode",
      "version": "2.0.0"
    }
  ]
}
```

### Usage

```bash
# Add marketplace
/plugin marketplace add ~/my-tools

# Install plugin
/plugin install quick-commit@my-personal-tools
```

---

## Example 2: Team Organization Marketplace

An organization-wide marketplace with multiple plugin sources.

### Structure

```
company-plugins/
├── .claude-plugin/
│   └── marketplace.json
├── README.md
└── plugins/
    └── shared-tools/
```

### .claude-plugin/marketplace.json

```json
{
  "name": "company-tools",
  "owner": {
    "name": "Engineering Team",
    "email": "eng@company.com"
  },
  "metadata": {
    "description": "Company-wide development tools and workflows",
    "version": "2.0.0",
    "homepage": "https://github.com/company/claude-plugins",
    "repository": "https://github.com/company/claude-plugins"
  },
  "plugins": [
    {
      "name": "shared-tools",
      "source": "./plugins/shared-tools",
      "description": "Common development utilities",
      "version": "1.5.0",
      "author": {
        "name": "Tools Team"
      },
      "keywords": ["utilities", "common", "shared"]
    },
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deployment-tools"
      },
      "description": "Deployment automation and orchestration",
      "version": "3.2.0",
      "category": "infrastructure",
      "keywords": ["deployment", "kubernetes", "docker"]
    },
    {
      "name": "security-scanner",
      "source": {
        "source": "github",
        "repo": "company-private/security-scanner"
      },
      "description": "Internal security scanning tools",
      "version": "2.1.0",
      "license": "Proprietary",
      "category": "security"
    },
    {
      "name": "api-tools",
      "source": {
        "source": "url",
        "url": "https://git.company.com/tools/api-tools.git"
      },
      "description": "Internal API development and testing tools",
      "version": "1.8.0",
      "category": "development"
    }
  ]
}
```

### Team Configuration (.claude/settings.json)

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

### Usage

```bash
# Automatically available after trusting folder
/plugin install deployment-tools@company-tools
```

---

## Example 3: Project-Specific Marketplace

A marketplace specific to a single project with custom workflows.

### Structure

```
my-project/
├── .claude/
│   └── settings.json
├── .claude-plugin/
│   └── marketplace.json
└── project-plugins/
    ├── project-commands/
    └── project-agents/
```

### .claude-plugin/marketplace.json

```json
{
  "name": "my-project-tools",
  "owner": {
    "name": "Project Team",
    "email": "team@project.com"
  },
  "metadata": {
    "description": "Project-specific development tools",
    "pluginRoot": "./project-plugins"
  },
  "plugins": [
    {
      "name": "project-commands",
      "source": "./project-commands",
      "description": "Custom commands for this project's workflow",
      "version": "1.0.0",
      "commands": [
        "./commands/"
      ]
    },
    {
      "name": "project-agents",
      "source": "./project-agents",
      "description": "Specialized agents for project architecture",
      "version": "1.0.0",
      "agents": [
        "./agents/architecture-reviewer.md",
        "./agents/api-designer.md"
      ]
    }
  ]
}
```

### .claude/settings.json

```json
{
  "extraKnownMarketplaces": {
    "my-project-tools": {
      "source": {
        "source": "git",
        "url": "./.claude-plugin"
      }
    }
  }
}
```

---

## Example 4: Multi-Environment Marketplace

Separate marketplaces for different environments.

### Development Marketplace

```json
{
  "name": "dev-tools",
  "owner": {
    "name": "DevOps",
    "email": "devops@company.com"
  },
  "plugins": [
    {
      "name": "debug-tools",
      "source": {
        "source": "github",
        "repo": "company/debug-tools",
        "ref": "develop"
      },
      "description": "Development debugging and profiling tools"
    },
    {
      "name": "mock-services",
      "source": {
        "source": "github",
        "repo": "company/mock-services",
        "ref": "develop"
      },
      "description": "Mock external services for local development"
    }
  ]
}
```

### Production Marketplace

```json
{
  "name": "prod-tools",
  "owner": {
    "name": "DevOps",
    "email": "devops@company.com"
  },
  "plugins": [
    {
      "name": "deploy-prod",
      "source": {
        "source": "github",
        "repo": "company/deploy-tools",
        "ref": "v3.0.0"
      },
      "description": "Production deployment with safeguards",
      "version": "3.0.0"
    },
    {
      "name": "monitoring",
      "source": {
        "source": "github",
        "repo": "company/monitoring-tools",
        "ref": "stable"
      },
      "description": "Production monitoring and alerting"
    }
  ]
}
```

### Team Configuration

```json
{
  "extraKnownMarketplaces": {
    "development": {
      "source": {
        "source": "github",
        "repo": "company/dev-marketplace"
      }
    },
    "production": {
      "source": {
        "source": "github",
        "repo": "company/prod-marketplace"
      }
    }
  }
}
```

---

## Example 5: Public Community Marketplace

A curated collection of open-source plugins.

### Structure

```
awesome-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json
├── README.md
├── CONTRIBUTING.md
└── docs/
    └── plugins/
```

### .claude-plugin/marketplace.json

```json
{
  "name": "awesome-claude-plugins",
  "owner": {
    "name": "Community",
    "email": "community@example.com"
  },
  "metadata": {
    "description": "Curated collection of awesome Claude Code plugins",
    "version": "1.0.0",
    "homepage": "https://github.com/awesome-claude/plugins",
    "repository": "https://github.com/awesome-claude/plugins"
  },
  "plugins": [
    {
      "name": "markdown-tools",
      "source": {
        "source": "github",
        "repo": "user1/markdown-tools"
      },
      "description": "Markdown editing, preview, and conversion tools",
      "version": "2.0.0",
      "author": {
        "name": "User One"
      },
      "license": "MIT",
      "homepage": "https://github.com/user1/markdown-tools",
      "keywords": ["markdown", "editing", "documentation"],
      "category": "documentation"
    },
    {
      "name": "git-workflow",
      "source": {
        "source": "github",
        "repo": "user2/git-workflow"
      },
      "description": "Advanced git workflow automation",
      "version": "1.5.0",
      "author": {
        "name": "User Two"
      },
      "license": "Apache-2.0",
      "homepage": "https://github.com/user2/git-workflow",
      "keywords": ["git", "workflow", "automation"],
      "category": "development"
    },
    {
      "name": "code-quality",
      "source": {
        "source": "github",
        "repo": "user3/code-quality"
      },
      "description": "Code quality analysis and improvement suggestions",
      "version": "3.1.0",
      "author": {
        "name": "User Three"
      },
      "license": "MIT",
      "keywords": ["quality", "linting", "analysis"],
      "category": "code-quality"
    }
  ]
}
```

### README.md

```markdown
# Awesome Claude Plugins

A curated list of awesome Claude Code plugins.

## Installation

\`\`\`bash
/plugin marketplace add awesome-claude/plugins
\`\`\`

## Categories

### Documentation
- **markdown-tools** - Markdown editing and conversion
  \`\`\`bash
  /plugin install markdown-tools@awesome-claude-plugins
  \`\`\`

### Development
- **git-workflow** - Git workflow automation
- **code-quality** - Code quality analysis

## License

CC0 1.0 Universal
```

---

## Example 6: Monorepo with Multiple Marketplaces

Large organization with specialized marketplaces in a monorepo.

### Structure

```
company-claude-tools/
├── .claude-plugin/
│   ├── frontend-marketplace.json
│   ├── backend-marketplace.json
│   └── devops-marketplace.json
├── frontend-plugins/
│   ├── react-tools/
│   └── vue-tools/
├── backend-plugins/
│   ├── api-tools/
│   └── database-tools/
└── devops-plugins/
    ├── kubernetes-tools/
    └── terraform-tools/
```

### frontend-marketplace.json

```json
{
  "name": "frontend-tools",
  "owner": {
    "name": "Frontend Team",
    "email": "frontend@company.com"
  },
  "metadata": {
    "pluginRoot": "../frontend-plugins"
  },
  "plugins": [
    {
      "name": "react-tools",
      "source": "./react-tools",
      "description": "React development and testing tools",
      "keywords": ["react", "frontend", "components"]
    },
    {
      "name": "vue-tools",
      "source": "./vue-tools",
      "description": "Vue.js development tools",
      "keywords": ["vue", "frontend", "spa"]
    }
  ]
}
```

### backend-marketplace.json

```json
{
  "name": "backend-tools",
  "owner": {
    "name": "Backend Team",
    "email": "backend@company.com"
  },
  "metadata": {
    "pluginRoot": "../backend-plugins"
  },
  "plugins": [
    {
      "name": "api-tools",
      "source": "./api-tools",
      "description": "API development and testing",
      "keywords": ["api", "backend", "rest"]
    },
    {
      "name": "database-tools",
      "source": "./database-tools",
      "description": "Database management and migration tools",
      "keywords": ["database", "sql", "migration"]
    }
  ]
}
```

### Usage

```bash
# Add specific marketplace
/plugin marketplace add company/claude-tools/.claude-plugin/frontend-marketplace.json
/plugin marketplace add company/claude-tools/.claude-plugin/backend-marketplace.json

# Install from each
/plugin install react-tools@frontend-tools
/plugin install api-tools@backend-tools
```

---

## Complete Workflow Example

### Step 1: Create Repository

```bash
git init my-marketplace
cd my-marketplace
mkdir -p .claude-plugin plugins
```

### Step 2: Create Marketplace

```bash
cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "my-marketplace",
  "owner": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "metadata": {
    "description": "My custom plugin marketplace",
    "pluginRoot": "./plugins"
  },
  "plugins": []
}
EOF
```

### Step 3: Add First Plugin

Create plugin directory:
```bash
mkdir -p plugins/hello-world
```

Create plugin.json:
```bash
cat > plugins/hello-world/plugin.json << 'EOF'
{
  "name": "hello-world",
  "version": "1.0.0",
  "description": "A simple hello world plugin"
}
EOF
```

Create command:
```bash
mkdir -p plugins/hello-world/commands
cat > plugins/hello-world/commands/hello.md << 'EOF'
---
description: "Say hello"
---

Say a friendly hello to {{0:name}}!
EOF
```

### Step 4: Add Plugin to Marketplace

```bash
# Use jq to add plugin entry
jq '.plugins += [{
  "name": "hello-world",
  "source": "./hello-world",
  "description": "A simple hello world plugin",
  "version": "1.0.0"
}]' .claude-plugin/marketplace.json > temp.json && mv temp.json .claude-plugin/marketplace.json
```

### Step 5: Test Locally

```bash
# Add marketplace
/plugin marketplace add .

# Install plugin
/plugin install hello-world@my-marketplace

# Test command
/hello Claude
```

### Step 6: Commit and Push

```bash
git add .
git commit -m "feat: initial marketplace with hello-world plugin"
git remote add origin https://github.com/yourusername/my-marketplace.git
git push -u origin main
```

### Step 7: Share

Others can now use your marketplace:
```bash
/plugin marketplace add yourusername/my-marketplace
/plugin install hello-world@my-marketplace
```

---

## Script Example: Add Plugin to Marketplace

```bash
#!/usr/bin/env bash

# add-plugin-to-marketplace.sh

MARKETPLACE_FILE=".claude-plugin/marketplace.json"
PLUGIN_NAME="$1"
PLUGIN_SOURCE="$2"
PLUGIN_DESC="$3"
PLUGIN_VERSION="${4:-1.0.0}"

if [[ -z "$PLUGIN_NAME" || -z "$PLUGIN_SOURCE" || -z "$PLUGIN_DESC" ]]; then
  echo "Usage: $0 <name> <source> <description> [version]"
  exit 1
fi

# Create plugin entry
PLUGIN_ENTRY=$(jq -n \
  --arg name "$PLUGIN_NAME" \
  --arg source "$PLUGIN_SOURCE" \
  --arg desc "$PLUGIN_DESC" \
  --arg version "$PLUGIN_VERSION" \
  '{
    name: $name,
    source: $source,
    description: $desc,
    version: $version
  }')

# Add to marketplace
jq --argjson plugin "$PLUGIN_ENTRY" \
  '.plugins += [$plugin]' \
  "$MARKETPLACE_FILE" > temp.json && mv temp.json "$MARKETPLACE_FILE"

echo "Added plugin: $PLUGIN_NAME"
```

Usage:
```bash
./add-plugin-to-marketplace.sh \
  "my-plugin" \
  "./plugins/my-plugin" \
  "My awesome plugin" \
  "1.0.0"
```
