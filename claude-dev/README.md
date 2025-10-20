# Claude Dev Plugin

Comprehensive skills and tools for authoring Claude Code plugins, marketplaces, and configuration management.

## What's Included

This plugin provides complete workflows for building, testing, and distributing Claude Code plugins:

### Skills

- **[claude-plugin-authoring](#claude-plugin-authoring)** - Create complete plugins with proper structure and configuration
- **[claude-slash-command-authoring](#claude-slash-command-authoring)** - Build custom slash commands with arguments and file references
- **[claude-hook-authoring](#claude-hook-authoring)** - Create event hooks for automation and workflow customization
- **[claude-plugin-marketplace-setup](#claude-plugin-marketplace-setup)** - Set up and manage plugin marketplaces
- **[claude-config-management](#claude-config-management)** - Manage Claude Desktop and Claude Code configuration
- **[claude-plugin-distribution](#claude-plugin-distribution)** - Package and distribute plugins with proper versioning

### Scripts

- **[init-plugin.sh](#init-pluginsh)** - Interactive plugin initialization wizard
- **[validate-plugin.sh](#validate-pluginsh)** - Comprehensive plugin validation
- **[test-plugin.sh](#test-pluginsh)** - Local plugin testing setup

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
# From a local clone
git clone https://github.com/outfitter-dev/agents.git
/plugin marketplace add ./agents
/plugin install claude-dev@outfitter
```

## Skills Overview

### claude-plugin-authoring

**Creates complete Claude Code plugins from scratch.**

**Covers:**
- Plugin structure and organization (`.claude-plugin/plugin.json`)
- Component types: skills, commands, agents, hooks, MCP servers
- Configuration and metadata
- Best practices for plugin development

**Use when:**
- Building a new Claude Code plugin
- Adding components to existing plugins
- Setting up plugin structure
- Configuring plugin.json

**Includes:**
- Complete reference documentation
- Real-world plugin examples
- Plugin templates and scaffolding

**Example:**
```
"I want to create a new Claude Code plugin for managing database migrations."
```

### claude-slash-command-authoring

**Creates custom slash commands with advanced features.**

**Covers:**
- Command Markdown file structure
- Frontmatter configuration (description, argument-hint, allowed-tools, model)
- Arguments: `$1`, `$2`, `$ARGUMENTS`, `{{0:name}}`
- Bash execution: `` !`command` ``
- File references: `@file.txt`
- Command namespacing in subdirectories

**Use when:**
- Building reusable team workflows
- Creating shortcut commands
- Automating repetitive tasks
- Setting up project-specific commands

**Includes:**
- Complete command syntax reference
- Validation script for testing commands
- Scaffolding script for quick creation
- Example commands for common use cases

**Example:**
```
"Create a slash command that reviews code for security issues and performance."
```

### claude-hook-authoring

**Creates event hooks for automation and workflow customization.**

**Covers:**
- All 9 hook types:
  - `PreToolUse` - Intercept/approve tool execution
  - `PostToolUse` - React to completed tools
  - `UserPromptSubmit` - Process user input
  - `Notification` - Handle Claude notifications
  - `Stop` - Main agent completion
  - `SubagentStop` - Subagent completion
  - `PreCompact` - Before conversation compaction
  - `SessionStart` - Session initialization
  - `SessionEnd` - Session cleanup
- Hook configuration in plugin.json and settings.json
- Matchers and filtering
- Input/output JSON handling
- Security best practices

**Use when:**
- Automating workflows on specific events
- Intercepting tool use for validation
- Running formatters/linters automatically
- Setting up team guardrails
- Building complex automation pipelines

**Includes:**
- Complete hook type reference
- Configuration examples
- Security guidelines
- Common automation patterns

**Example:**
```
"Create a hook that runs Prettier after writing TypeScript files."
```

### claude-plugin-marketplace-setup

**Sets up and manages plugin marketplaces for distribution.**

**Covers:**
- Marketplace.json structure and schema
- Plugin source types:
  - GitHub repositories
  - Git URLs
  - Local paths
  - npm packages (future)
- Team configuration for automatic installation
- Validation and troubleshooting
- Multi-plugin marketplace management

**Use when:**
- Distributing plugins to your team
- Setting up organization-wide plugin catalogs
- Managing plugin collections
- Creating curated plugin lists

**Includes:**
- Complete marketplace schema reference
- Multiple marketplace examples
- Team configuration examples
- Validation scripts

**Example:**
```
"Set up a marketplace for my company's internal Claude Code plugins."
```

### claude-config-management

**Manages Claude Desktop and Claude Code configuration files.**

**Covers:**
- Claude Desktop config (`claude_desktop_config.json`)
  - MCP server configuration
  - API keys and environment variables
  - Developer settings (DevTools)
- Claude Code project settings (`.claude/settings.json`)
  - Project-specific preferences
  - Tool restrictions
  - Model selection
  - Hook configuration
- Configuration file locations (macOS, Windows, Linux)
- Environment variable management

**Use when:**
- Setting up new development environments
- Configuring MCP servers
- Managing project-specific settings
- Troubleshooting configuration issues
- Setting up team standards

**Includes:**
- Complete configuration reference
- Platform-specific paths
- Example configurations
- Best practices

**Example:**
```
"Help me configure Claude Desktop to use my custom MCP server."
```

### claude-plugin-distribution

**Packages and publishes plugins for distribution.**

**Covers:**
- Semantic versioning best practices
- CHANGELOG.md management
- GitHub releases workflow
- ZIP packaging (when needed)
- CI/CD automation with GitHub Actions
- Documentation requirements
- npm publishing (future)

**Use when:**
- Preparing plugins for public release
- Updating plugin versions
- Automating distribution workflows
- Setting up release pipelines
- Publishing to marketplaces

**Includes:**
- Versioning guidelines
- Release checklist
- GitHub Actions workflows
- Documentation templates

**Example:**
```
"I'm ready to release version 2.0.0 of my plugin. Help me package it properly."
```

## Scripts Reference

### init-plugin.sh

**Interactive wizard for initializing new plugins.**

```bash
# Interactive mode
./scripts/init-plugin.sh

# Non-interactive with defaults
./scripts/init-plugin.sh --non-interactive

# Create in specific directory
./scripts/init-plugin.sh --directory ./my-plugins
```

**Features:**
- Guided plugin creation with prompts
- Component selection (skills, commands, agents, hooks, MCP)
- Auto-detects git config for author info
- Creates complete plugin structure
- Initializes git repository
- Generates LICENSE based on type
- Creates starter files for selected components

**Options:**
- `-d, --directory DIR` - Create plugin in specified directory
- `-n, --non-interactive` - Use defaults without prompting
- `-h, --help` - Show help

### validate-plugin.sh

**Comprehensive validation for plugin structure and content.**

```bash
# Validate plugin
./scripts/validate-plugin.sh .

# Strict mode (warnings become errors)
./scripts/validate-plugin.sh --strict .

# Auto-fix common issues
./scripts/validate-plugin.sh --fix .

# Quiet mode (errors only)
./scripts/validate-plugin.sh --quiet .
```

**Validates:**
- plugin.json structure and required fields
- Semantic versioning format
- Skills: frontmatter, naming, content
- Commands: syntax, frontmatter, arguments
- Agents: configuration, frontmatter
- Hooks: executability, shebang, configuration
- MCP servers: implementation files, dependencies
- Common files: README, LICENSE, CHANGELOG, .gitignore
- Git repository status

**Options:**
- `-s, --strict` - Treat warnings as errors
- `-q, --quiet` - Only show errors and warnings
- `-f, --fix` - Auto-fix issues where possible
- `-h, --help` - Show help

**Exit Codes:**
- `0` - No errors
- `1` - Validation errors found
- `2` - Invalid arguments

### test-plugin.sh

**Sets up local testing environment for plugins.**

```bash
# Test plugin locally
./scripts/test-plugin.sh .

# Keep test marketplace for inspection
./scripts/test-plugin.sh --keep-temp .

# Validate and test
./scripts/test-plugin.sh --validate .
```

**What it does:**
1. Creates temporary local marketplace
2. Adds your plugin to marketplace.json
3. Provides testing instructions
4. Cleans up automatically (unless `--keep-temp`)

**Options:**
- `-k, --keep-temp` - Keep temporary marketplace directory
- `-v, --validate` - Run validation before testing
- `-h, --help` - Show help

**Testing workflow:**
1. Run script to create test marketplace
2. Follow provided Claude Code commands
3. Test all plugin components
4. Verify functionality
5. Clean up when done

## Usage

These are **skills**, not slash commands. Claude will automatically activate them when working on plugin-related tasks.

### Activating Skills

Skills activate automatically when you:
- Mention plugin development, commands, hooks, or configuration
- Ask about Claude Code plugin structure
- Work on marketplace setup or plugin distribution
- Reference skill names or related keywords

### Explicit Usage

You can also reference skills explicitly:

```
"Using the claude-slash-command-authoring skill, create a command that runs tests."
```

```
"Help me set up hooks using the claude-hook-authoring skill."
```

### Common Workflows

**Creating a new plugin:**
```bash
# 1. Initialize plugin
./scripts/init-plugin.sh

# 2. Add components (skills, commands, etc)
# Use claude-plugin-authoring skill for guidance

# 3. Validate plugin
./scripts/validate-plugin.sh .

# 4. Test locally
./scripts/test-plugin.sh .
```

**Adding a slash command:**
```bash
# Use claude-slash-command-authoring skill
"Create a slash command called 'deploy' that deploys to production with safety checks."
```

**Setting up a marketplace:**
```bash
# Use claude-plugin-marketplace-setup skill
"Create a marketplace for my team with our three internal plugins."
```

**Distributing a plugin:**
```bash
# Use claude-plugin-distribution skill
"Help me prepare version 1.5.0 for release with proper changelog and GitHub release."
```

## Templates

The plugin includes templates for common component types:

### Plugin Structure Template
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── skills/                  # Optional: Skills
│   └── my-skill/
│       ├── SKILL.md         # Skill definition
│       ├── REFERENCE.md     # Optional: Reference docs
│       └── EXAMPLES.md      # Optional: Examples
├── commands/                # Optional: Slash commands
│   └── my-command.md
├── agents/                  # Optional: Custom agents
│   └── my-agent.md
├── hooks/                   # Optional: Event hooks
│   └── my-hook.sh
├── servers/                 # Optional: MCP servers
│   └── my-server/
│       ├── server.py
│       └── pyproject.toml
├── README.md
├── CHANGELOG.md
├── LICENSE
└── .gitignore
```

### Skills Template Structure
```
skills/my-skill/
├── SKILL.md              # Main skill file (required)
│   ├── Frontmatter       # name, description, version
│   ├── Overview          # What the skill does
│   ├── Quick Start       # Fast examples
│   └── Detailed Guide    # Comprehensive docs
├── REFERENCE.md          # Optional: API/syntax reference
├── EXAMPLES.md           # Optional: Real-world examples
└── scripts/              # Optional: Helper scripts
    └── helper.sh
```

## Examples

### Complete Plugin Example

See the `claude-dev` plugin itself as a comprehensive example:
- 6 skills covering different aspects
- Multiple documentation levels (SKILL.md, REFERENCE.md, EXAMPLES.md)
- Utility scripts for common tasks
- Proper plugin.json configuration

### Simple Command Plugin Example

```markdown
<!-- .claude-plugin/plugin.json -->
{
  "name": "my-commands",
  "version": "1.0.0",
  "description": "Custom project commands"
}

<!-- commands/deploy.md -->
---
description: Deploy application to production
argument-hint: <environment>
---

Deploy the application to {{0:environment}} environment:

1. Run tests: !`npm test`
2. Build: !`npm run build`
3. Deploy: !`npm run deploy:$1`
4. Verify deployment

Confirm success and provide deployment URL.
```

### Hook Plugin Example

```bash
# hooks/format-on-write.sh
#!/usr/bin/env bash
input=$(cat)
file_path=$(echo "$input" | jq -r '.parameters.file_path')

# Run formatter if it's a TypeScript file
if [[ "$file_path" == *.ts ]]; then
  prettier --write "$file_path" 2>/dev/null
fi

# Allow the operation
echo '{"allowed": true}'
```

```json
// .claude-plugin/plugin.json
{
  "name": "auto-format",
  "version": "1.0.0",
  "description": "Auto-format code on save",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/format-on-write.sh"
          }
        ]
      }
    ]
  }
}
```

## Development

This plugin was built using its own skills - a practical example of dogfooding!

### Contributing

Want to improve these skills or add new ones?

1. Fork the repository
2. Create your feature branch
3. Use the validation script: `./scripts/validate-plugin.sh .`
4. Test locally: `./scripts/test-plugin.sh .`
5. Submit a pull request

### Source Code

All source files are available at:
- GitHub: https://github.com/outfitter-dev/agents/tree/main/claude-dev
- Skills: `claude-dev/skills/`
- Scripts: `claude-dev/scripts/`

### Reporting Issues

Found a bug or have a feature request?
- Issues: https://github.com/outfitter-dev/agents/issues
- Discussions: https://github.com/outfitter-dev/agents/discussions

## Roadmap

Planned improvements:
- [ ] Skill authoring skill for creating new skills
- [ ] Agent authoring skill for custom agents
- [ ] Template library for common patterns
- [ ] Plugin testing framework
- [ ] CI/CD templates for automated validation
- [ ] npm package support for distribution
- [ ] Plugin analytics and usage tracking

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Links

- **Outfitter**: https://github.com/outfitter-dev
- **Agents Repository**: https://github.com/outfitter-dev/agents
- **Marketplace**: https://github.com/outfitter-dev/agents/tree/main/.claude-plugin
- **Issues**: https://github.com/outfitter-dev/agents/issues

---

Built with Claude Code • Powered by Outfitter
