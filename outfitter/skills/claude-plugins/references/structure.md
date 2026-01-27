# Plugin Structure Reference

Complete directory layout and configuration schemas for Claude Code plugins.

## Plugin Structure

How you structure plugins depends on how they're distributed.

### Single Plugin (Standalone)

Standalone plugins need their own `.claude-plugin/plugin.json`:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Plugin manifest (required)
├── commands/
├── agents/
├── hooks/
│   └── hooks.json       # Auto-discovered hooks (or inline in plugin.json)
└── README.md
```

### Marketplace with Local Plugins (Consolidated)

When all plugins live in the same repo as the marketplace, use `strict: false` to consolidate metadata in `marketplace.json`. Plugins don't need their own manifests:

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json # All metadata here (strict: false)
├── plugin-a/
│   ├── commands/
│   ├── agents/
│   └── README.md
├── plugin-b/
│   ├── skills/
│   └── README.md
└── README.md
```

**Benefits:** Single source of truth, no version drift, simpler structure.

### Marketplace with External Plugins (Distributed)

When referencing plugins from external repos (GitHub, GitLab, etc.), let each plugin own its manifest:

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json # Points to external repos
└── README.md

# External repos each have:
external-plugin/
├── .claude-plugin/
│   └── plugin.json      # Plugin owns its manifest
├── commands/
└── README.md
```

**Key principle:** External plugins are self-contained. The marketplace.json points to them via `source` but doesn't define their metadata.

### Mixed Approach

Marketplaces can combine both patterns—consolidated for local plugins, distributed for external:

```json
{
  "strict": false,
  "plugins": [
    {"name": "local-plugin", "source": "./local-plugin", "version": "1.0.0"},
    {"name": "external-plugin", "source": {"source": "github", "repo": "owner/plugin"}}
  ]
}
```

## Directory Structure

### Minimal Standalone Plugin

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Required: metadata
└── README.md            # Required for distribution
```

### Complete Standalone Plugin

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Plugin metadata
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
│   └── hooks.json       # Auto-discovered (required format)
├── servers/             # MCP servers
│   └── my-server/
│       ├── server.py
│       └── pyproject.toml
└── scripts/             # Utility scripts
    └── setup.sh
```

## plugin.json Schema

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Unique identifier (kebab-case, no spaces) | `"deployment-tools"` |

### Recommended Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
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
| `commands` | string\|array | Custom paths to command files or directories |
| `agents` | string\|array | Custom paths to agent files |
| `hooks` | string\|object | Hook config path or inline config |
| `mcpServers` | string\|object | MCP config path or inline config |
| `lspServers` | string\|object | LSP config path or inline config |

### Behavior Control

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `strict` | boolean | `true` | Set at marketplace level. When `false`, local plugins don't need `.claude-plugin/plugin.json`—marketplace defines all metadata. Use `false` for consolidated local plugins, `true` (or omit) for external plugins. |

> **Note:** Hooks can be defined inline in plugin.json OR in a separate `hooks/hooks.json` file.

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

> **Note:** Hooks can be inlined in plugin.json (add a `"hooks"` key) or defined in `hooks/hooks.json`. See [Event Hooks](#event-hooks) below.

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
description: "What this agent specializes in"
capabilities: ["task1", "task2", "task3"]
allowed-tools: Read, Grep, Glob
---

# Agent Name

Detailed description of the agent's role, expertise, and when Claude should invoke it.

## Capabilities

- Specific task the agent excels at
- Another specialized capability
- When to use this agent vs others

## Context and examples

Provide examples of when this agent should be used.
```

### Agent Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief explanation of what the agent does |
| `capabilities` | array | List of tasks the agent can perform (aids discovery) |
| `allowed-tools` | string | Comma-separated list of allowed tools (optional) |

### Tool Restrictions

| Restriction | Tools | Use Case |
|-------------|-------|----------|
| Read-only | `Read, Grep, Glob` | Analysis only |
| With execution | `Read, Grep, Glob, Bash` | Analysis + commands |
| No restriction | (omit field) | Full capabilities |

## Event Hooks

Two ways to define hooks in a plugin:

1. **Inline in plugin.json** — Add a `"hooks"` key directly
2. **File-based** — Auto-discovered from `hooks/hooks.json`

### Option 1: Inline in plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
          }
        ]
      }
    ]
  }
}
```

### Option 2: Separate hooks.json File

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Can also have hooks inline here
└── hooks/
    └── hooks.json       # Auto-discovered if present
```

### Hook Types

| Type | When | Use Cases |
|------|------|-----------|
| `PreToolUse` | Before tool | Validation, permissions |
| `PostToolUse` | After tool | Logging, formatting |
| `UserPromptSubmit` | Before prompt | Input validation |
| `Stop` | After response | Cleanup, notifications |
| `SessionStart` | Session begins | Context loading |
| `SessionEnd` | Session ends | Cleanup |

### hooks/hooks.json Format

When using a separate file, it requires a root-level `"hooks"` wrapper:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "biome check --write \"$file\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Key Points

- Hooks can be inline in plugin.json OR in `hooks/hooks.json`
- Both formats use a `"hooks"` object containing event types
- Use `${CLAUDE_PLUGIN_ROOT}` for paths relative to plugin
- Use `$file` for the affected file path in PostToolUse

### Hook Script Interface

**Input (stdin):**

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/project/src/file.ts",
    "content": "export const foo = 'bar';"
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

file_path=$(echo "$input" | jq -r '.tool_input.file_path')
content=$(echo "$input" | jq -r '.tool_input.content')

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
