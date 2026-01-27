# MCP Server Configuration for Codex

Detailed examples and patterns for configuring MCP servers in Codex CLI.

## Basic Structure

```toml
[mcp_servers.server-name]
command = "npx"
args = ["-y", "@package/mcp-server"]
enabled = true
tool_timeout_sec = 60.0

[mcp_servers.server-name.env]
API_KEY = "your-key"
```

## Common MCP Servers

### Context7 (Documentation Lookup)

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_KEY"]
```

### Firecrawl (Web Scraping)

```toml
[mcp_servers.firecrawl]
command = "npx"
args = ["-y", "firecrawl-mcp"]

[mcp_servers.firecrawl.env]
FIRECRAWL_API_KEY = "YOUR_KEY"
```

### Graphite (Stacked PRs)

```toml
[mcp_servers.graphite]
command = "gt"
args = ["mcp"]
```

### Linear (Project Management)

```toml
[mcp_servers.linear]
command = "npx"
args = ["-y", "mcp-remote@latest", "https://mcp.linear.app/sse"]
```

### PostgreSQL

```toml
[mcp_servers.postgres]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-postgres"]

[mcp_servers.postgres.env]
POSTGRES_CONNECTION_STRING = "postgresql://localhost/mydb"
```

### Filesystem

```toml
[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"]
```

## Configuration Options

### Timeout Settings

```toml
[mcp_servers.slow-server]
command = "slow-command"
args = []
tool_timeout_sec = 120.0  # 2 minutes
```

### Disabling Servers

```toml
[mcp_servers.disabled-server]
command = "some-command"
args = []
enabled = false
```

### Environment Variables

```toml
[mcp_servers.custom-server.env]
API_KEY = "secret"
DEBUG = "true"
HOME = "/custom/home"
```

## Multiple Servers Example

```toml
# Documentation
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

# Project management
[mcp_servers.linear]
command = "npx"
args = ["-y", "mcp-remote@latest", "https://mcp.linear.app/sse"]

# Version control
[mcp_servers.graphite]
command = "gt"
args = ["mcp"]

# Web scraping
[mcp_servers.firecrawl]
command = "npx"
args = ["-y", "firecrawl-mcp"]

[mcp_servers.firecrawl.env]
FIRECRAWL_API_KEY = "YOUR_KEY"
```

## Verification

```bash
# List configured MCP servers
codex mcp list

# Test specific server
codex mcp test server-name
```
