---
name: claude-config
description: This skill should be used when configuring Claude, setting up MCP servers, or when "settings.json", "claude_desktop_config", "MCP server", or "Claude config" are mentioned.
metadata:
  version: "1.0.0"
  related-skills:
    - codex-config
    - claude-hooks
    - claude-rules
    - claude-plugins
    - skills-dev
---

# Claude Config Management

Manages configuration files for Claude Desktop and Claude Code, including MCP server setup, project settings, and developer options.

## Configuration File Locations

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

### Important Notes

- **Always use absolute paths** - Working directory may be undefined
- **Windows paths**: Use forward slashes or double backslashes
- **Restart required**: Restart Claude Desktop after configuration changes
- **Environment variables**: Limited by default (USER, HOME, PATH); set explicitly in `env`

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

## Quick Validation

```bash
# Validate JSON syntax
jq empty ~/Library/Application\ Support/Claude/claude_desktop_config.json
jq empty .claude/settings.json

# Check server names
jq -r '.mcpServers | keys[]' ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## Quick Troubleshooting

If MCP server not loading:
1. Validate JSON syntax
2. Verify command paths are absolute
3. Check environment variables are set
4. Review logs: `~/Library/Logs/Claude/mcp*.log`
5. Restart Claude Desktop

## References

Detailed documentation for specific scenarios:

- **[MCP Patterns](references/mcp-patterns.md)** - Server configuration examples (Python, Node.js, environment variables)
- **[Troubleshooting](references/troubleshooting.md)** - Common issues, log locations, debugging tools
- **[Workflows](references/workflows.md)** - Step-by-step guides for adding servers, team setup, migration

## Next Steps

- See [EXAMPLES.md](EXAMPLES.md) for real-world configuration examples
