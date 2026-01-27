# MCP Server Configuration Patterns

Detailed examples and patterns for configuring MCP servers in Claude Desktop.

## Server Types

### Python Server (uv)

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

### Node.js Server (npx)

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

### With Environment Variables

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

## Environment Variable Patterns

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

### Reference System Variables

Use `${VAR_NAME}` syntax:

```json
{
  "env": {
    "API_KEY": "${MY_API_KEY}",
    "DB_HOST": "${DATABASE_HOST}"
  }
}
```

## Common Server Configurations

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

## Path Patterns

### macOS

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

### Windows

Use forward slashes or double backslashes:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "C:/Users/name/AppData/Roaming/npm/npx.cmd",
      "args": ["-y", "server-package"]
    }
  }
}
```

## Best Practices

- **Always use absolute paths** - Working directory may be undefined
- **Set environment variables explicitly** - Limited inherited by default (USER, HOME, PATH)
- **Use `${VAR_NAME}` for secrets** - Reference system environment variables
- **Restart after changes** - Claude Desktop requires restart for config changes
