# Claude Config Management - Examples

## Example 1: Basic MCP Server Setup

### Filesystem Server

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/john/Documents"
      ]
    }
  }
}
```

## Example 2: Multiple MCP Servers

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/john/Projects"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://localhost/mydb"
      }
    },
    "weather": {
      "command": "uv",
      "args": [
        "--directory",
        "/Users/john/weather-server",
        "run",
        "server.py"
      ]
    }
  }
}
```

## Example 3: Team Project Configuration

### .claude/settings.json

```json
{
  "extraKnownMarketplaces": {
    "company-core": {
      "source": {
        "source": "github",
        "repo": "company/core-plugins"
      }
    },
    "project-specific": {
      "source": {
        "source": "git",
        "url": "https://git.company.com/project/plugins.git"
      }
    }
  },
  "enabledPlugins": [
    "project-workflow",
    "team-standards"
  ]
}
```

## Example 4: Development vs Production

### Development (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "dev-database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://localhost/dev_db"
      }
    },
    "mock-api": {
      "command": "node",
      "args": ["/Users/john/mock-api-server/server.js"],
      "env": {
        "PORT": "3000",
        "API_MODE": "mock"
      }
    }
  }
}
```

### Production

```json
{
  "mcpServers": {
    "prod-database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${PROD_DATABASE_URL}"
      }
    },
    "monitoring": {
      "command": "/usr/local/bin/monitoring-server",
      "args": ["--prod"],
      "env": {
        "API_KEY": "${MONITORING_API_KEY}",
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

## Example 5: Cross-Platform Configuration

### macOS

```json
{
  "mcpServers": {
    "tools": {
      "command": "uv",
      "args": [
        "--directory",
        "/Users/john/tools-server",
        "run",
        "server.py"
      ]
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "tools": {
      "command": "uv",
      "args": [
        "--directory",
        "C:/Users/john/tools-server",
        "run",
        "server.py"
      ]
    }
  }
}
```

### Linux

```json
{
  "mcpServers": {
    "tools": {
      "command": "uv",
      "args": [
        "--directory",
        "/home/john/tools-server",
        "run",
        "server.py"
      ]
    }
  }
}
```

## Example 6: Environment-Specific Settings

### .env file

```bash
# Development
DATABASE_URL=postgresql://localhost/dev_db
API_KEY=dev_api_key_123
DEBUG=true

# Production
# DATABASE_URL=postgresql://prod.server.com/prod_db
# API_KEY=prod_api_key_xyz
# DEBUG=false
```

### Configuration using environment variables

```json
{
  "mcpServers": {
    "app-server": {
      "command": "node",
      "args": ["/absolute/path/to/server/index.js"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}",
        "API_KEY": "${API_KEY}",
        "DEBUG": "${DEBUG}"
      }
    }
  }
}
```

## Example 7: Complete Team Setup

### Project structure

```
my-project/
├── .claude/
│   └── settings.json
├── .claude-plugin/
│   └── marketplace.json
├── .env.example
└── README.md
```

### .claude/settings.json

```json
{
  "extraKnownMarketplaces": {
    "project-tools": {
      "source": {
        "source": "git",
        "url": "./.claude-plugin"
      }
    }
  },
  "enabledPlugins": ["project-workflow"]
}
```

### .env.example

```bash
# Required environment variables for MCP servers
DATABASE_URL=postgresql://localhost/mydb
API_KEY=your_api_key_here
S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

### README.md section

```markdown
## Claude Code Setup

1. Copy environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your values
   \`\`\`

2. Configure Claude Desktop:
   \`\`\`bash
   # macOS
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   \`\`\`

   Add MCP server:
   \`\`\`json
   {
     "mcpServers": {
       "project-db": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-postgres"],
         "env": {
           "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
         }
       }
     }
   }
   \`\`\`

3. Restart Claude Desktop

4. In Claude Code, trust the project folder to enable team plugins
```
