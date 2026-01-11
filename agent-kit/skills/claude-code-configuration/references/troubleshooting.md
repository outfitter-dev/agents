# Troubleshooting Claude Configuration

Common issues and solutions for Claude Desktop and Claude Code configurations.

## MCP Server Not Loading

**Diagnostic checklist:**

1. Validate JSON syntax
2. Verify command paths are absolute
3. Check environment variables are set
4. Review logs: `~/Library/Logs/Claude/mcp*.log`
5. Restart Claude Desktop

## Log Locations

### macOS

```bash
# View all MCP logs
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log

# View specific server logs
tail -f ~/Library/Logs/Claude/mcp-server-SERVERNAME.log

# General MCP connection logs
tail -f ~/Library/Logs/Claude/mcp.log
```

### Windows

```powershell
Get-Content "$env:APPDATA\Claude\Logs\mcp.log" -Tail 20 -Wait
```

## Common Issues

### Working Directory Undefined

**Symptom:** Server fails with "file not found" errors for relative paths

**Solution:** Always use absolute paths in configuration

```json
{
  "mcpServers": {
    "server": {
      "command": "/absolute/path/to/command",
      "args": ["--config", "/absolute/path/to/config"]
    }
  }
}
```

### Environment Variables Not Available

**Symptom:** Server can't access expected environment variables

**Solution:** Explicitly set variables in `env` object

```json
{
  "mcpServers": {
    "server": {
      "command": "my-server",
      "env": {
        "API_KEY": "${MY_API_KEY}",
        "HOME": "${HOME}",
        "PATH": "${PATH}"
      }
    }
  }
}
```

### Windows Path Errors

**Symptom:** "Command not found" or path parsing errors

**Solution:** Use forward slashes in paths

```json
{
  "command": "C:/Users/name/path/to/command"
}
```

### Server Not Starting

**Diagnostic steps:**

1. Test command independently in terminal
2. Check server logs
3. Verify all dependencies installed
4. Confirm API keys are valid

```bash
# Test command manually
/usr/local/bin/npx -y @modelcontextprotocol/server-filesystem /tmp

# Check if package exists
npm view @modelcontextprotocol/server-filesystem
```

### JSON Syntax Errors

**Symptom:** Claude Desktop fails to load any configuration

**Solution:** Validate JSON before saving

```bash
# Validate Claude Desktop config
jq empty ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Validate Claude Code settings
jq empty .claude/settings.json
```

## Validation Commands

### Check MCP Server Config

```bash
# Extract server names
jq -r '.mcpServers | keys[]' ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Check specific server
jq '.mcpServers["server-name"]' ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Pretty print entire config
jq '.' ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Test Server Connection

```bash
# Check if server process runs
/path/to/server --help

# Check npm package availability
npx -y @package/server --version
```

## Developer Tools

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

### Debug Network Issues

With DevTools enabled:
1. Open DevTools (`Cmd+Opt+Shift+i`)
2. Go to Network tab
3. Look for failed MCP connections
4. Check Console for error messages
