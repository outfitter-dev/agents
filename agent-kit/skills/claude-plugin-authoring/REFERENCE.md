# Claude Plugin Authoring - Complete Reference

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
| `license` | string | SPDX identifier (MIT, Apache-2.0, etc.) |
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
  "description": "Enterprise workflow automation tools for Claude Code",
  "author": {
    "name": "Enterprise Team",
    "email": "enterprise@company.com"
  },
  "homepage": "https://docs.company.com/plugins/enterprise-tools",
  "repository": "https://github.com/company/enterprise-tools",
  "license": "MIT",
  "keywords": ["enterprise", "workflow", "automation", "productivity"],
  "category": "productivity",
  "tags": ["business", "enterprise", "automation"],
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
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
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
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/audit-log.sh"
          }
        ]
      }
    ]
  },
  "mcpServers": {
    "enterprise-db": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_HOST": "${ENTERPRISE_DB_HOST}",
        "DB_PASSWORD": "${ENTERPRISE_DB_PASSWORD}"
      }
    },
    "api-gateway": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/servers/api-gateway.js"],
      "env": {
        "API_KEY": "${COMPANY_API_KEY}"
      }
    }
  },
  "strict": false
}
```

## Slash Commands

### Command File Structure

Commands are markdown files with YAML frontmatter in the `commands/` directory.

**Basic Command:**
```markdown
---
description: "Brief description of what this command does"
---

Command instructions here.
Use {{0}}, {{1}}, etc. for parameters.
```

**Command with Multiple Parameters:**
```markdown
---
description: "Deploy application to specified environment"
---

Deploy application {{0:app-name}} to {{1:environment}} environment.

Pre-deployment checks:
1. Verify environment exists
2. Check application configuration
3. Validate deployment permissions

Execute deployment:
- Build application
- Run tests
- Deploy to {{1}}
- Verify deployment

Post-deployment:
- Run smoke tests
- Update deployment logs
- Notify team
```

### Parameter Syntax

| Syntax | Description | Example |
|--------|-------------|---------|
| `{{0}}` | First parameter | `/command value` |
| `{{1}}` | Second parameter | `/command val1 val2` |
| `{{0:name}}` | Named parameter (documentation) | `{{0:environment}}` |
| `{{...}}` | All remaining parameters | `/command arg1 arg2 arg3` |

### Command Organization

**Flat Structure:**
```
commands/
├── deploy.md
├── test.md
└── review.md
```

**Organized Structure:**
```
commands/
├── core/
│   ├── help.md
│   └── version.md
├── development/
│   ├── test.md
│   └── build.md
└── deployment/
    ├── deploy.md
    └── rollback.md
```

**Custom Paths in plugin.json:**
```json
{
  "commands": [
    "./commands/core/",
    "./commands/development/",
    "./commands/deployment/"
  ]
}
```

## Custom Agents

### Agent File Structure

Agents are markdown files with YAML frontmatter in the `agents/` directory.

**Basic Agent:**
```markdown
---
name: agent-name
description: "What this agent does and when to use it"
---

You are a specialized agent for [purpose].

Your responsibilities:
1. [Task 1]
2. [Task 2]
3. [Task 3]

Follow these guidelines:
- [Guideline 1]
- [Guideline 2]

Always provide [expected output format].
```

**Agent with Tool Restrictions:**
```markdown
---
name: read-only-analyzer
description: "Analyzes code without making modifications"
allowed-tools: Read, Grep, Glob, Bash
---

You are a code analyzer that never modifies files.

Your capabilities:
- Read and analyze source code
- Search for patterns
- Find files by name
- Execute read-only commands

You CANNOT:
- Write or edit files
- Execute commands that modify state
- Make any changes to the codebase

When analyzing:
1. Read relevant files
2. Search for patterns
3. Analyze structure
4. Provide recommendations

Your analysis should be thorough but never make changes.
```

### Available Tool Restrictions

| Tool Category | Tools | Use Case |
|---------------|-------|----------|
| Read-only | `Read, Grep, Glob` | Analysis only |
| Read + Execute | `Read, Grep, Glob, Bash` | Analysis with commands |
| No restrictions | (omit field) | Full capabilities |

### Agent Organization

**Custom Paths in plugin.json:**
```json
{
  "agents": [
    "./agents/core/code-reviewer.md",
    "./agents/specialized/security-auditor.md",
    "./agents/specialized/performance-analyzer.md"
  ]
}
```

## Event Hooks

### Hook Types

| Hook Type | When Executed | Use Cases |
|-----------|---------------|-----------|
| `PreToolUse` | Before tool execution | Validation, permission checks |
| `PostToolUse` | After tool execution | Logging, notifications |
| `PrePromptSubmit` | Before prompt processing | Input validation, preprocessing |
| `PostPromptSubmit` | After prompt processing | Audit logging, analytics |

### Hook Configuration

**Basic Hook:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate-write.sh"
          }
        ]
      }
    ]
  }
}
```

**Multiple Matchers:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate-changes.sh"
          }
        ]
      }
    ]
  }
}
```

**Regex Matchers:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write.*\\.ts$",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/typescript-check.sh"
          }
        ]
      },
      {
        "matcher": "Bash.*npm|yarn|pnpm",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/package-audit.sh"
          }
        ]
      }
    ]
  }
}
```

### Hook Script Interface

**Input:** Hook scripts receive JSON via stdin:
```json
{
  "tool": "Write",
  "parameters": {
    "file_path": "/path/to/file.ts",
    "content": "file content"
  }
}
```

**Output:** Hook scripts should output JSON:

**Success (allow):**
```json
{
  "allowed": true
}
```

**Block with message:**
```json
{
  "allowed": false,
  "message": "Validation failed: File contains hardcoded secrets"
}
```

**Modify parameters:**
```json
{
  "allowed": true,
  "modified_parameters": {
    "content": "modified content with auto-formatting applied"
  }
}
```

### Example Hook Scripts

**TypeScript Validation Hook:**
```bash
#!/usr/bin/env bash

# Read JSON input
input=$(cat)

# Extract file path and content
file_path=$(echo "$input" | jq -r '.parameters.file_path')
content=$(echo "$input" | jq -r '.parameters.content')

# Check if TypeScript file
if [[ ! "$file_path" =~ \.ts$ ]]; then
  echo '{"allowed": true}'
  exit 0
fi

# Write to temp file
temp_file=$(mktemp)
echo "$content" > "$temp_file"

# Run TypeScript compiler check
if tsc --noEmit "$temp_file" 2>/dev/null; then
  echo '{"allowed": true}'
else
  echo '{"allowed": false, "message": "TypeScript compilation failed"}'
fi

# Cleanup
rm "$temp_file"
```

**Secret Detection Hook:**
```bash
#!/usr/bin/env bash

input=$(cat)
content=$(echo "$input" | jq -r '.parameters.content')

# Check for common secret patterns
if echo "$content" | grep -qE "(api[_-]?key|secret|password|token).*=.*['\"][^'\"]{10,}"; then
  echo '{"allowed": false, "message": "Potential secret detected in file"}'
else
  echo '{"allowed": true}'
fi
```

## MCP Server Integration

### Server Configuration

**Basic Server:**
```json
{
  "mcpServers": {
    "server-name": {
      "command": "command-to-run",
      "args": ["arg1", "arg2"]
    }
  }
}
```

**Server with Environment Variables:**
```json
{
  "mcpServers": {
    "database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/db-config.json"],
      "env": {
        "DB_HOST": "${DATABASE_HOST}",
        "DB_PORT": "${DATABASE_PORT}",
        "DB_PASSWORD": "${DATABASE_PASSWORD}"
      }
    }
  }
}
```

**Python Server:**
```json
{
  "mcpServers": {
    "data-processor": {
      "command": "uv",
      "args": [
        "--directory",
        "${CLAUDE_PLUGIN_ROOT}/servers/data-processor",
        "run",
        "server.py"
      ],
      "env": {
        "API_KEY": "${DATA_API_KEY}"
      }
    }
  }
}
```

**Node.js Server:**
```json
{
  "mcpServers": {
    "api-client": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/servers/api-client/index.js"],
      "env": {
        "API_ENDPOINT": "${COMPANY_API_ENDPOINT}",
        "API_TOKEN": "${COMPANY_API_TOKEN}"
      }
    }
  }
}
```

### Variable Substitution

| Variable | Resolves To | Use Case |
|----------|-------------|----------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin installation directory | Reference plugin files |
| `${VAR_NAME}` | Environment variable | External configuration |

**Example:**
```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
  "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
  "env": {
    "API_KEY": "${MY_API_KEY}"
  }
}
```

### MCP Server Development

See Claude Code documentation for creating MCP servers:
- Python: Use `mcp` SDK with FastMCP
- TypeScript: Use `@modelcontextprotocol/sdk`

**Basic Python MCP Server:**
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
async def my_tool(param: str) -> str:
    """Tool description"""
    return f"Processed: {param}"

if __name__ == "__main__":
    mcp.run(transport='stdio')
```

## Plugin Validation

### Validation Checklist

**Structure:**
- [ ] plugin.json exists and is valid JSON
- [ ] All required fields present (name, version, description)
- [ ] Plugin name matches directory name
- [ ] Directory structure follows conventions

**Commands:**
- [ ] All command files have valid YAML frontmatter
- [ ] Command descriptions are clear and concise
- [ ] Parameter syntax is correct
- [ ] Commands are organized logically

**Agents:**
- [ ] All agent files have valid YAML frontmatter
- [ ] Agent names and descriptions follow conventions
- [ ] Tool restrictions are appropriate
- [ ] Agent instructions are clear

**Hooks:**
- [ ] Hook scripts are executable
- [ ] Hook scripts handle JSON input/output correctly
- [ ] Matchers are valid regex patterns
- [ ] Hooks don't interfere with normal workflow

**MCP Servers:**
- [ ] Server binaries exist and are executable
- [ ] Server configurations are correct
- [ ] Environment variables are documented
- [ ] Servers can be tested independently

**Documentation:**
- [ ] README.md exists with installation instructions
- [ ] CHANGELOG.md tracks version history
- [ ] LICENSE file included
- [ ] All features documented

### Validation Commands

```bash
# Validate JSON syntax
jq empty plugin.json

# Check command frontmatter
for f in commands/**/*.md; do
  head -n 20 "$f" | grep -q '^---$' || echo "Missing frontmatter: $f"
done

# Check agent frontmatter
for f in agents/**/*.md; do
  head -n 20 "$f" | grep -q '^---$' || echo "Missing frontmatter: $f"
done

# Verify hook scripts are executable
for f in hooks/**/*.sh; do
  test -x "$f" || echo "Not executable: $f"
done
```

## Platform-Specific Considerations

### macOS
- Config location: `~/Library/Application Support/Claude/`
- Logs location: `~/Library/Logs/Claude/`
- Use absolute paths for all commands

### Windows
- Config location: `%APPDATA%\Claude\`
- Use forward slashes or double backslashes in paths
- Ensure scripts have `.bat` or `.ps1` extensions

### Linux
- Config location: `~/.config/claude/`
- Ensure scripts have proper shebangs
- Check execute permissions

## Security Best Practices

### Secrets Management
- Never hardcode secrets in plugin files
- Use environment variables for sensitive data
- Document required environment variables
- Provide `.env.example` template

### Input Validation
- Validate all user inputs in hooks
- Sanitize parameters in commands
- Check file paths for traversal attacks
- Validate regex patterns in matchers

### Permission Model
- Request minimum necessary permissions
- Use tool restrictions for agents when appropriate
- Implement approval workflows for sensitive operations
- Document security requirements clearly

### Audit and Logging
- Log security-relevant events
- Don't log sensitive data
- Implement audit trails for critical operations
- Provide mechanisms to review actions

## Performance Considerations

### Hook Performance
- Keep hooks fast (< 100ms when possible)
- Avoid blocking operations
- Cache validation results when appropriate
- Use async operations where supported

### MCP Server Performance
- Optimize server startup time
- Cache frequently accessed data
- Use connection pooling for databases
- Monitor server resource usage

### Command Performance
- Avoid expensive operations in command templates
- Defer heavy processing to hooks or agents
- Provide progress feedback for long operations
- Implement timeouts for external calls

## Troubleshooting Guide

### Plugin Not Loading

**Symptoms:** Plugin doesn't appear in `/plugin` list

**Checks:**
1. Verify plugin.json syntax: `jq empty plugin.json`
2. Check plugin name matches directory name
3. Ensure all required fields present
4. Review Claude Code logs for errors

### Commands Not Working

**Symptoms:** Slash commands don't appear or fail

**Checks:**
1. Verify command files have YAML frontmatter
2. Check files are in `commands/` directory
3. Ensure markdown syntax is correct
4. Test parameter substitution

### Hooks Not Executing

**Symptoms:** Hooks don't run or fail silently

**Checks:**
1. Verify scripts are executable: `chmod +x hooks/*.sh`
2. Check matcher regex is correct
3. Test hook script independently
4. Review hook output format (JSON)
5. Check logs for error messages

### MCP Servers Failing

**Symptoms:** MCP server tools not available

**Checks:**
1. Verify server binary exists and is executable
2. Check environment variables are set
3. Test server with MCP Inspector
4. Review logs: `~/Library/Logs/Claude/mcp-server-*.log`
5. Verify paths use `${CLAUDE_PLUGIN_ROOT}`

## Version Management

### Semantic Versioning

Follow semver (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

**Example:**
```json
{
  "version": "2.1.3"
}
```

### CHANGELOG.md Format

```markdown
# Changelog

## [2.1.3] - 2025-01-20

### Fixed
- Fixed TypeScript validation hook for .tsx files
- Corrected path resolution in MCP server config

## [2.1.0] - 2025-01-15

### Added
- New `/deploy` command with environment validation
- Security audit hook for package installations

### Changed
- Improved error messages in validation hooks

## [2.0.0] - 2025-01-01

### Breaking Changes
- Renamed command `/check` to `/validate`
- Changed hook output format to JSON

### Added
- New MCP server for database access
- Custom agent for security reviews
```

## Distribution Preparation

### Required Files

**README.md:**
```markdown
# Plugin Name

Brief description of what this plugin does.

## Installation

\`\`\`bash
/plugin marketplace add owner/repo
/plugin install plugin-name@marketplace-name
\`\`\`

## Features

- Feature 1
- Feature 2

## Usage

### Commands

- `/command-name` - Description

### Agents

Invoke agents through Claude Code interface.

## Configuration

Required environment variables:
- `VAR_NAME`: Description

## License

MIT License - see LICENSE file
```

**CHANGELOG.md:** See version management section

**LICENSE:** Include appropriate license file

**.gitignore:**
```
node_modules/
*.log
.env
.DS_Store
```

### Package Structure

```
my-plugin/
├── README.md
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── plugin.json
├── commands/
├── agents/
├── hooks/
└── servers/
```

### Pre-Release Checklist

- [ ] All features tested
- [ ] Documentation complete
- [ ] CHANGELOG updated
- [ ] Version bumped in plugin.json
- [ ] README includes installation instructions
- [ ] LICENSE file included
- [ ] .gitignore configured
- [ ] Git tags created for release
- [ ] Marketplace entry ready
