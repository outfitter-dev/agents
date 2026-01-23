# Plugin Structure Reference

Complete directory layout and plugin.json schema for Claude Code plugins.

## Directory Structure

### Minimal Plugin

```
my-plugin/
├── plugin.json          # Required: metadata
└── README.md            # Required for distribution
```

### Complete Plugin

```
my-plugin/
├── plugin.json          # Plugin metadata
├── README.md            # Documentation
├── CHANGELOG.md         # Version history
├── LICENSE              # License file
├── .gitignore           # Git ignore patterns
├── commands/            # Slash commands
│   ├── core/            # Core commands
│   │   └── help.md
│   └── advanced/        # Advanced features
│       └── deploy.md
├── agents/              # Custom agents
│   ├── reviewer.md
│   └── analyzer.md
├── skills/              # Reusable skills
│   └── my-skill/
│       └── SKILL.md
├── hooks/               # Event hooks
│   ├── pre-tool/
│   │   └── validate.sh
│   └── post-tool/
│       └── log.sh
├── servers/             # MCP servers
│   └── my-server/
│       ├── server.py
│       └── pyproject.toml
└── scripts/             # Utility scripts
    └── setup.sh
```

## plugin.json Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier (kebab-case, unique) |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `description` | string | Brief plugin description |

### Optional Standard Fields

| Field | Type | Description |
|-------|------|-------------|
| `author` | object | Creator information |
| `author.name` | string | Author name |
| `author.email` | string | Author email |
| `homepage` | string | Documentation URL |
| `repository` | string | Source code URL |
| `license` | string | SPDX identifier (MIT, Apache-2.0) |
| `keywords` | array | Search tags |
| `category` | string | Plugin category |
| `tags` | array | Additional searchability tags |

### Component Configuration Fields

| Field | Type | Description |
|-------|------|-------------|
| `commands` | array | Custom paths to command files |
| `agents` | array | Custom paths to agent files |
| `hooks` | object | Event hook configurations |
| `mcpServers` | object | MCP server configurations |
| `strict` | boolean | Require plugin.json (default: true) |

### Complete Example

```json
{
  "name": "enterprise-tools",
  "version": "2.1.0",
  "description": "Enterprise workflow automation tools",
  "author": {
    "name": "Enterprise Team",
    "email": "team@company.com"
  },
  "homepage": "https://docs.company.com/plugins",
  "repository": "https://github.com/company/enterprise-tools",
  "license": "MIT",
  "keywords": ["enterprise", "workflow", "automation"],
  "category": "productivity",
  "commands": [
    "./commands/core/",
    "./commands/enterprise/"
  ],
  "agents": [
    "./agents/security-reviewer.md",
    "./agents/compliance-checker.md"
  ],
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/audit.sh"
          }
        ]
      }
    ]
  },
  "mcpServers": {
    "database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_HOST": "${DATABASE_HOST}",
        "DB_PASSWORD": "${DATABASE_PASSWORD}"
      }
    }
  }
}
```

## Slash Commands

### Command File Structure

Commands are markdown files with YAML frontmatter in `commands/`.

```markdown
---
description: "Brief description shown in /help"
---

Command instructions here.
Use {{0}}, {{1}} for parameters.
```

### Parameter Syntax

| Syntax | Description | Example |
|--------|-------------|---------|
| `{{0}}` | First parameter | `/cmd value` |
| `{{1}}` | Second parameter | `/cmd val1 val2` |
| `{{0:name}}` | Named (documentation) | `{{0:environment}}` |
| `{{...}}` | All remaining | `/cmd arg1 arg2 arg3` |

### Example Command

```markdown
---
description: "Deploy to specified environment"
---

Deploy application to {{0:environment}}.

Steps:
1. Validate environment configuration
2. Run pre-deployment checks
3. Deploy application
4. Verify deployment
```

## Custom Agents

### Agent File Structure

Agents are markdown files with YAML frontmatter in `agents/`.

```markdown
---
name: agent-name
description: "What this agent does"
allowed-tools: Read, Grep, Glob
---

You are a specialized agent for [purpose].

Your responsibilities:
1. Task 1
2. Task 2
```

### Tool Restrictions

| Restriction | Tools | Use Case |
|-------------|-------|----------|
| Read-only | `Read, Grep, Glob` | Analysis only |
| With execution | `Read, Grep, Glob, Bash` | Analysis + commands |
| No restriction | (omit field) | Full capabilities |

## Event Hooks

### Hook Types

| Type | When | Use Cases |
|------|------|-----------|
| `PreToolUse` | Before tool | Validation, permissions |
| `PostToolUse` | After tool | Logging, notifications |
| `PrePromptSubmit` | Before prompt | Input validation |
| `PostPromptSubmit` | After prompt | Audit logging |

### Hook Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.sh"
          }
        ]
      }
    ]
  }
}
```

### Hook Script Interface

**Input (stdin):**
```json
{
  "tool": "Write",
  "parameters": {
    "file_path": "/path/to/file.ts",
    "content": "file content"
  }
}
```

**Output (stdout):**

Allow:
```json
{"allowed": true}
```

Block:
```json
{
  "allowed": false,
  "message": "Validation failed: reason"
}
```

Modify:
```json
{
  "allowed": true,
  "modified_parameters": {
    "content": "modified content"
  }
}
```

### Example Hook Script

```bash
#!/usr/bin/env bash
input=$(cat)

file_path=$(echo "$input" | jq -r '.parameters.file_path')
content=$(echo "$input" | jq -r '.parameters.content')

# Check for secrets
if echo "$content" | grep -qiE 'api[_-]?key.*=.*[a-zA-Z0-9]{16,}'; then
  echo '{"allowed": false, "message": "Potential secret detected"}'
  exit 0
fi

echo '{"allowed": true}'
```

## MCP Servers

### Server Configuration

```json
{
  "mcpServers": {
    "server-name": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
      "args": ["--flag", "value"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

### Variable Substitution

| Variable | Resolves To |
|----------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin installation directory |
| `${VAR_NAME}` | Environment variable |

### Python MCP Server Example

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
async def my_tool(param: str) -> str:
    """Tool description"""
    return f"Result: {param}"

if __name__ == "__main__":
    mcp.run(transport='stdio')
```

## Platform Considerations

### macOS
- Config: `~/Library/Application Support/Claude/`
- Logs: `~/Library/Logs/Claude/`

### Windows
- Config: `%APPDATA%\Claude\`
- Use forward slashes or double backslashes

### Linux
- Config: `~/.config/claude/`
- Check shebang and permissions
