---
name: claude-code-configuration
description: Manages Claude configuration files for both Claude Desktop and Claude Code projects. Handles MCP server configuration, environment variables, project settings, and developer options. Use when configuring Claude Desktop with MCP servers, setting up Claude Code project settings, managing environment variables for Claude, enabling debugging features, or troubleshooting Claude configuration issues.
version: 1.0.0
---

# Claude Config Management

Manages configuration files for Claude Desktop and Claude Code, including MCP server setup, project settings, and developer options.

## Quick Start

### Configuration File Locations

**Claude Desktop (macOS):**
- Config: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Logs: `~/Library/Logs/Claude/`
- Developer settings: `~/Library/Application Support/Claude/developer_settings.json`

**Claude Desktop (Windows):**
- Config: `%APPDATA%\Claude\claude_desktop_config.json`
- Logs: `%APPDATA%\Claude\Logs\`

**Claude Code (Project-specific):**
- Settings: `.claude/settings.json`
- Plugin marketplace: `.claude-plugin/marketplace.json`

## Claude Desktop Configuration

### Basic Structure

```json
{
  "mcpServers": {
    "server-name": {
      "command": "command-to-run",
      "args": ["arg1", "arg2"],
      "env": {
        "VAR_NAME": "value"
      }
    }
  }
}
```

### Adding an MCP Server

**Python Server:**

```json
{
  "mcpServers": {
    "weather": {
      "command": "uv",
      "args": [
        "--directory",
        "/absolute/path/to/weather",
        "run",
        "server.py"
      ]
    }
  }
}
```

**Node.js Server:**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Documents"
      ]
    }
  }
}
```

**With Environment Variables:**

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://localhost/mydb",
        "DB_PASSWORD": "${DATABASE_PASSWORD}"
      }
    }
  }
}
```

### Important Notes

- **Always use absolute paths** - Working directory may be undefined
- **Windows paths**: Use forward slashes or double backslashes
- **Restart required**: Restart Claude Desktop after configuration changes
- **Environment variables**: Limited by default (USER, HOME, PATH)

## Claude Code Project Settings

### .claude/settings.json

```json
{
  "enabledPlugins": ["plugin-name"],
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

### Team Configuration

Automatically install marketplaces when team members trust the folder:

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "company/plugins"
      }
    },
    "project-tools": {
      "source": {
        "source": "git",
        "url": "https://git.company.com/project-plugins.git"
      }
    }
  }
}
```

## Developer Settings

### Enable Chrome DevTools

**macOS:**

```bash
echo '{"allowDevTools": true}' > ~/Library/Application\ Support/Claude/developer_settings.json
```

Open DevTools: `Command-Option-Shift-i`

**Windows:**

```powershell
echo '{"allowDevTools": true}' > "$env:APPDATA\Claude\developer_settings.json"
```

## Environment Variables

### Override or Add Variables

```json
{
  "mcpServers": {
    "myserver": {
      "command": "mcp-server-myapp",
      "env": {
        "MYAPP_API_KEY": "secret_key_value",
        "CUSTOM_VAR": "custom_value",
        "PATH": "/custom/path:${PATH}"
      }
    }
  }
}
```

### Using System Environment Variables

Reference with `${VAR_NAME}`:

```json
{
  "env": {
    "API_KEY": "${MY_API_KEY}",
    "DB_HOST": "${DATABASE_HOST}"
  }
}
```

## Common Configurations

### Filesystem Access

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Projects"
      ]
    }
  }
}
```

### Database Connection

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

### Custom Python Server

```json
{
  "mcpServers": {
    "custom-tools": {
      "command": "uv",
      "args": [
        "--directory",
        "/absolute/path/to/server",
        "run",
        "server.py"
      ],
      "env": {
        "API_KEY": "${TOOLS_API_KEY}",
        "DEBUG": "false"
      }
    }
  }
}
```

## Validation

### Validate JSON Syntax

```bash
# Claude Desktop config
jq empty ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Claude Code settings
jq empty .claude/settings.json
```

### Check MCP Server Config

```bash
# Extract server names
jq -r '.mcpServers | keys[]' ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Check specific server
jq '.mcpServers["server-name"]' ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## Troubleshooting

### MCP Server Not Loading

**Checks:**
1. Validate JSON syntax
2. Verify command paths are absolute
3. Check environment variables are set
4. Review logs: `~/Library/Logs/Claude/mcp*.log`
5. Restart Claude Desktop

### Logs Location

```bash
# View all MCP logs (macOS)
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log

# View specific server logs
tail -f ~/Library/Logs/Claude/mcp-server-SERVERNAME.log

# General MCP connection logs
tail -f ~/Library/Logs/Claude/mcp.log
```

### Common Issues

**Issue: Working directory undefined**
- Solution: Always use absolute paths

**Issue: Environment variables not available**
- Solution: Explicitly set in `env` object

**Issue: Windows path errors**
- Solution: Use forward slashes: `C:/Users/name/path`

**Issue: Server not starting**
- Solution: Test command independently
- Check server logs
- Verify all dependencies installed

## Configuration Workflows

### Adding a New MCP Server

1. **Install server** (if needed)

   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   # or
   cd ~/my-server && uv sync
   ```

2. **Get full paths**

   ```bash
   which npx  # /usr/local/bin/npx
   pwd        # /Users/name/my-server
   ```

3. **Add to config**

   ```json
   {
     "mcpServers": {
       "my-server": {
         "command": "/usr/local/bin/npx",
         "args": ["-y", "server-package"]
       }
     }
   }
   ```

4. **Restart Claude Desktop**

5. **Verify in logs**

   ```bash
   tail -f ~/Library/Logs/Claude/mcp-server-my-server.log
   ```

### Setting Up Team Project

1. **Create settings file**

   ```bash
   mkdir -p .claude
   ```

2. **Add marketplaces**

   ```json
   {
     "extraKnownMarketplaces": {
       "team-tools": {
         "source": {
           "source": "github",
           "repo": "company/plugins"
         }
       }
     }
   }
   ```

3. **Commit to repository**

   ```bash
   git add .claude/settings.json
   git commit -m "feat: add Claude Code team configuration"
   ```

4. **Team members trust folder**
   - Marketplaces auto-install when trusted

## Best Practices

### Security

- Never commit credentials to config files
- Use environment variables for secrets
- Set minimal permissions for MCP servers
- Review third-party servers before adding

### Organization

- Group related servers logically
- Use descriptive server names
- Document required environment variables
- Maintain separate configs for different environments

### Maintenance

- Regularly update MCP servers
- Review logs for errors
- Test servers after updates
- Document custom server configurations

## Next Steps

- See [EXAMPLES.md](EXAMPLES.md) for real-world configuration examples
