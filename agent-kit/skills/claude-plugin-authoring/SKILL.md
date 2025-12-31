---
name: claude-plugin-authoring
description: Creates complete Claude Code plugins with proper structure, configuration, and best practices. Handles plugin.json metadata, slash commands, agent configurations, event hooks, and MCP server integration. Use when building Claude Code plugins, extending Claude Code capabilities, creating custom commands or agents for Claude Code, or setting up plugin project structure.
version: 1.0.0
---

# Claude Plugin Authoring

Creates production-ready Claude Code plugins with proper directory structure, configuration files, and all necessary components.

## Quick Start

### Basic Plugin Structure

A Claude Code plugin requires this minimal structure:

```
my-plugin/
├── plugin.json          # Required: Plugin metadata
├── .claude-plugin/      # Optional: Marketplace config
│   └── marketplace.json
├── commands/            # Optional: Slash commands
│   └── my-command.md
├── agents/              # Optional: Custom agents
│   └── my-agent.md
└── hooks/               # Optional: Event hooks
    └── pre-tool-use.sh
```

### Creating Your First Plugin

**Step 1: Create plugin directory**

```bash
mkdir my-plugin && cd my-plugin
```

**Step 2: Create plugin.json**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Brief description of what this plugin does",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "license": "MIT"
}
```

**Step 3: Add components** (all optional):
- Slash commands in `commands/`
- Custom agents in `agents/`
- Event hooks in `hooks/`
- MCP servers in plugin.json

**Step 4: Test locally**

```bash
/plugin marketplace add ./path/to/my-plugin
/plugin install my-plugin@my-plugin
```

## Core Components

### 1. plugin.json (Required)

The metadata file that defines your plugin:

**Required fields:**
- `name`: Plugin identifier (kebab-case)
- `version`: Semantic version (e.g., "1.0.0")
- `description`: Brief plugin description

**Recommended fields:**
- `author`: Creator information
- `license`: SPDX identifier (e.g., "MIT")
- `homepage`: Documentation URL
- `repository`: Source code URL

**Example:**

```json
{
  "name": "dev-tools",
  "version": "1.0.0",
  "description": "Development workflow automation tools",
  "author": {
    "name": "DevTools Team",
    "email": "dev@example.com"
  },
  "license": "MIT",
  "homepage": "https://github.com/example/dev-tools",
  "repository": "https://github.com/example/dev-tools",
  "keywords": ["development", "automation", "workflow"]
}
```

### 2. Slash Commands (Optional)

Create custom commands in `commands/` directory. Each command is a markdown file.

**File: commands/review-pr.md**

```markdown
---
description: "Review a pull request with comprehensive analysis"
---

Review the pull request: {{0}}

Analyze:
- Code quality and style
- Potential bugs or issues
- Performance considerations
- Security concerns

Provide specific, actionable feedback.
```

**Usage:**

```bash
/review-pr 123
```

### 3. Custom Agents (Optional)

Define specialized agents in `agents/` directory.

**File: agents/security-reviewer.md**

```markdown
---
name: security-reviewer
description: "Specialized agent for security code reviews"
---

You are a security-focused code reviewer. When reviewing code:

1. Identify potential security vulnerabilities
2. Check for common security anti-patterns
3. Verify input validation and sanitization
4. Review authentication and authorization
5. Check for hardcoded secrets

Provide specific recommendations with code examples.
```

### 4. Event Hooks (Optional)

React to Claude Code events. Configure in plugin.json:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate-changes.sh"
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
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/log-command.sh"
          }
        ]
      }
    ]
  }
}
```

**Available hook types:**
- `PreToolUse`: Before tool execution
- `PostToolUse`: After tool execution
- `PrePromptSubmit`: Before user prompt processing
- `PostPromptSubmit`: After prompt processing

### 5. MCP Servers (Optional)

Integrate MCP servers directly in plugin.json:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

**Note:** Two path variables are available:

- `${CLAUDE_PLUGIN_ROOT}` - Plugin installation directory (use in plugin.json)
- `$CLAUDE_PROJECT_DIR` - User's project root (use in hook scripts at runtime)

See [Environment Variables Reference](../../shared/rules/ENV-VARS.md) for details.

## Plugin Development Workflow

1. **Initialize plugin structure**

   ```bash
   mkdir my-plugin
   cd my-plugin
   ```

2. **Create plugin.json**
   - Define metadata
   - Configure components
   - Set up hooks if needed

3. **Add components**
   - Create slash commands
   - Define custom agents
   - Implement event hooks
   - Configure MCP servers

4. **Test locally**

   ```bash
   /plugin marketplace add .
   /plugin install my-plugin@my-plugin
   ```

5. **Iterate and refine**
   - Test all commands
   - Verify hooks work correctly
   - Check agent behavior
   - Validate MCP server integration

6. **Prepare for distribution**
   - Add README.md
   - Create CHANGELOG.md
   - Add LICENSE file
   - Document installation process

## Best Practices

### Naming Conventions

- **Plugin name**: kebab-case (e.g., `dev-tools`)
- **Commands**: kebab-case (e.g., `review-pr`)
- **Agents**: kebab-case (e.g., `security-reviewer`)
- **Scripts**: kebab-case with extension (e.g., `validate-changes.sh`)

### Directory Organization

```
my-plugin/
├── plugin.json
├── README.md
├── CHANGELOG.md
├── LICENSE
├── commands/
│   ├── core/           # Core commands
│   └── advanced/       # Advanced features
├── agents/
│   └── specialized/    # Domain-specific agents
├── hooks/
│   ├── pre-tool/
│   └── post-tool/
└── servers/            # MCP server binaries
```

### Documentation

- **README.md**: Overview, installation, usage examples
- **CHANGELOG.md**: Version history and changes
- **Command files**: Clear description in frontmatter
- **Agent files**: Detailed instructions and context

### Testing

- Test all slash commands with various inputs
- Verify hooks don't interfere with normal workflow
- Check MCP servers connect properly
- Test plugin installation and removal
- Validate cross-platform compatibility

### Security

- Never hardcode secrets in plugin files
- Use environment variables for sensitive data
- Validate all user inputs in hooks
- Review third-party dependencies
- Document security considerations

## Common Patterns

### 1. Command with Parameters

```markdown
---
description: "Deploy application to environment"
---

Deploy the application to {{0:environment}} environment.

Steps:
1. Validate environment configuration
2. Run pre-deployment checks
3. Deploy application
4. Run post-deployment verification
5. Update deployment logs
```

### 2. Agent with Tool Restrictions

```markdown
---
name: read-only-analyzer
description: "Analyzes code without making changes"
allowed-tools: Read, Grep, Glob
---

You are a code analyzer that never modifies files. Analyze the codebase and provide insights.
```

### 3. Conditional Hook

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
      }
    ]
  }
}
```

## Troubleshooting

**Plugin not loading:**
- Verify plugin.json syntax is valid JSON
- Check plugin name matches directory name
- Ensure required fields are present

**Commands not appearing:**
- Verify command files have proper frontmatter
- Check files are in `commands/` directory
- Ensure markdown syntax is correct

**Hooks not executing:**
- Verify matcher regex is correct
- Check hook scripts are executable
- Review hook script output in logs
- Ensure paths use `${CLAUDE_PLUGIN_ROOT}`

**MCP servers failing:**
- Check server binary exists and is executable
- Verify environment variables are set
- Review MCP logs in `~/Library/Logs/Claude/`
- Test server independently with MCP Inspector

## Next Steps

- See [REFERENCE.md](REFERENCE.md) for complete API documentation
- See [EXAMPLES.md](EXAMPLES.md) for real-world plugin examples
- Use scripts in `scripts/` for plugin scaffolding and validation
