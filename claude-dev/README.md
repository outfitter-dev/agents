# Claude Dev Plugin

Skills for authoring Claude Code plugins, marketplaces, and configuration management.

## What's Included

This plugin provides comprehensive skills for building and managing Claude Code plugins:

### Skills

- **claude-plugin-authoring** - Create complete Claude Code plugins with proper structure, configuration, and best practices
- **claude-plugin-marketplace-setup** - Set up and manage plugin marketplaces for distribution
- **claude-config-management** - Manage Claude Desktop and Claude Code configuration files
- **claude-plugin-distribution** - Package and distribute plugins with proper versioning

## Installation

### Via Outfitter Marketplace

```bash
# Add the Outfitter marketplace
/plugin marketplace add outfitter-dev/agents

# Install the plugin
/plugin install claude-dev@outfitter
```

### Direct Installation

```bash
# From the agents repository
/plugin marketplace add outfitter-dev/agents
/plugin install claude-dev@outfitter
```

## Usage

These are **skills**, not commands. Claude will automatically use them when you're working on plugin-related tasks.

Skills activate when you:
- Mention creating or building Claude Code plugins
- Ask about plugin structure or configuration
- Work on marketplace setup
- Need help with plugin distribution

You can also explicitly reference them in your prompts.

## Skills Overview

### claude-plugin-authoring

Guides you through creating Claude Code plugins from scratch, including:
- Plugin structure and organization
- plugin.json configuration
- Slash commands creation
- Custom agents
- Event hooks
- MCP server integration

Includes:
- Complete reference documentation
- Real-world examples
- Scaffolding scripts

### claude-plugin-marketplace-setup

Helps you set up plugin marketplaces:
- marketplace.json structure and schema
- Plugin source configuration (GitHub, Git, local)
- Team configuration for automatic installation
- Validation and troubleshooting

Includes:
- Complete schema reference
- Multiple marketplace examples
- Validation scripts

### claude-config-management

Manages Claude configuration files:
- Claude Desktop configuration (claude_desktop_config.json)
- Claude Code project settings (.claude/settings.json)
- MCP server configuration
- Environment variables
- Developer settings (DevTools)

### claude-plugin-distribution

Packages and publishes plugins:
- Semantic versioning
- ZIP packaging (when needed)
- GitHub releases
- CI/CD automation
- Documentation templates

## Development

These skills were built using themselves! The source is available at:
https://github.com/outfitter-dev/agents/tree/main/claude-dev

## Contributing

Found an issue or want to improve these skills?
- Report issues: https://github.com/outfitter-dev/agents/issues
- Submit PRs: https://github.com/outfitter-dev/agents/pulls

## License

MIT License - see [LICENSE](../LICENSE) for details.
