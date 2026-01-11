# Configuration Workflows

Step-by-step workflows for common Claude configuration tasks.

## Adding a New MCP Server

### Step 1: Install Server

```bash
# NPM-based server
npm install -g @modelcontextprotocol/server-filesystem

# Python-based server
cd ~/my-server && uv sync

# Or use npx (no install needed)
npx -y @package/server --help
```

### Step 2: Get Full Paths

```bash
which npx           # /usr/local/bin/npx
which uv            # /usr/local/bin/uv
pwd                 # /Users/name/my-server
realpath server.py  # /Users/name/my-server/server.py
```

### Step 3: Add to Config

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Step 4: Restart Claude Desktop

Quit and reopen Claude Desktop to load new configuration.

### Step 5: Verify in Logs

```bash
tail -f ~/Library/Logs/Claude/mcp-server-my-server.log
```

Look for successful initialization messages.

## Setting Up Team Project

### Step 1: Create Settings Directory

```bash
mkdir -p .claude
```

### Step 2: Configure Marketplaces

Create `.claude/settings.json`:

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

### Step 3: Add Enabled Plugins

```json
{
  "enabledPlugins": ["plugin-name"],
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

### Step 4: Commit to Repository

```bash
git add .claude/settings.json
git commit -m "feat: add Claude Code team configuration"
```

### Step 5: Team Onboarding

When team members open the project in Claude Code and trust the folder:
- Marketplaces auto-install
- Plugins become available

## Configuring Multiple Environments

### Development Config

```json
{
  "mcpServers": {
    "dev-database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://localhost/dev"
      }
    }
  }
}
```

### Production Config (Separate Machine)

```json
{
  "mcpServers": {
    "prod-database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${PROD_DATABASE_URL}"
      }
    }
  }
}
```

## Migrating Configuration

### Export Current Config

```bash
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/claude-config-backup.json
```

### Import to New Machine

```bash
# Copy backup to new machine
cp ~/claude-config-backup.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Update paths for new machine
# Edit file to fix absolute paths
```

### Validate After Migration

```bash
jq empty ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## Best Practices

### Security

- Never commit credentials to config files
- Use environment variables for secrets: `"API_KEY": "${MY_API_KEY}"`
- Set minimal permissions for MCP servers
- Review third-party servers before adding

### Organization

- Group related servers logically
- Use descriptive server names
- Document required environment variables in README
- Maintain separate configs for different environments

### Maintenance

- Regularly update MCP servers
- Review logs for errors periodically
- Test servers after updates
- Document custom server configurations
