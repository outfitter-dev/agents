# Agent Kit

Skills for authoring Agent Skills (cross-tool) and platform-specific configuration for Claude Code, Codex, and other AI coding assistants.

## What's Included

This plugin provides skills for building AI agent capabilities across multiple platforms:

### Cross-Tool Skills

- **skills-authoring** - Create Agent Skills following the open specification at [agentskills.io](https://agentskills.io), compatible with Claude Code, Codex, Cursor, Amp, Goose, and more
- **skills-check** - Validate skills against the Agent Skills specification

### Claude Code Skills

- **claude-plugin-authoring** - Create complete Claude Code plugins with proper structure, configuration, and best practices
- **claude-marketplace-setup** - Set up and manage plugin marketplaces for distribution
- **claude-code-configuration** - Manage Claude Desktop and Claude Code configuration files
- **claude-plugin-distribution** - Package and distribute plugins with proper versioning

### OpenAI Codex Skills

- **codex-configuration** - Manage Codex CLI configuration including config.toml, MCP servers, profiles, and sandbox modes

### Agent Authoring Skills

- **subagent-authoring** - Create custom subagents with proper frontmatter, routing logic, and skill loading patterns
- **subagent-check** - Validate subagents against best practices and plugin conventions

## Installation

### Via Outfitter Marketplace

```bash
# Add the Outfitter marketplace
/plugin marketplace add outfitter-dev/agents

# Install the plugin
/plugin install agent-kit@outfitter
```

## Usage

These are **skills**, not commands. Claude will automatically use them when you're working on relevant tasks.

Skills activate when you:
- Create Agent Skills for any supported platform
- Build Claude Code plugins or configuration
- Configure Codex CLI settings
- Work on marketplace setup or distribution

You can also explicitly reference them in your prompts.

## Skills Overview

### skills-authoring

Guides you through creating Agent Skills that work across multiple AI coding tools:
- SKILL.md structure and frontmatter
- Progressive disclosure pattern
- References and examples organization
- Cross-tool compatibility (Claude Code, Codex, Cursor, Amp, Goose, etc.)

Includes comprehensive reference documentation on:
- [compatibility.md](skills/skills-authoring/references/compatibility.md) - Platform support matrix
- [implementations.md](skills/skills-authoring/references/implementations.md) - Per-tool implementation details
- [invocations.md](skills/skills-authoring/references/invocations.md) - How each tool activates skills

### skills-check

Validates skills against the Agent Skills specification:
- Frontmatter validation
- Structure verification
- Cross-tool compatibility checks

### claude-plugin-authoring

Guides you through creating Claude Code plugins:
- Plugin structure and organization
- plugin.json configuration
- Slash commands, agents, and skills
- Event hooks and MCP server integration

### claude-marketplace-setup

Helps you set up plugin marketplaces:
- marketplace.json structure and schema
- Plugin source configuration (GitHub, Git, local)
- Team configuration for automatic installation

### claude-code-configuration

Manages Claude configuration files:
- Claude Desktop configuration (claude_desktop_config.json)
- Claude Code project settings (.claude/settings.json)
- MCP server configuration
- Environment variables and developer settings

### codex-configuration

Manages OpenAI Codex CLI configuration:
- config.toml settings and structure
- Model profiles (max, fast, normal)
- Sandbox modes and approval policies
- MCP server integration
- Skills path hierarchy

### claude-plugin-distribution

Packages and publishes plugins:
- Semantic versioning
- GitHub releases and CI/CD automation
- Documentation templates

### subagent-authoring

Creates custom subagents for Claude Code plugins:
- Agent frontmatter and routing patterns
- Skill loading and orchestration
- Decision tree design

### subagent-check

Validates subagent quality:
- Frontmatter completeness
- Routing logic verification
- Best practices compliance

## Supported Platforms

| Platform | Config Skill | Skills Compatible |
|----------|--------------|-------------------|
| Claude Code | claude-code-configuration | Yes |
| OpenAI Codex | codex-configuration | Yes |
| Cursor | — | Yes |
| Amp | — | Yes |
| Goose | — | Yes |
| GitHub Copilot | — | Yes |
| VS Code Copilot | — | Yes |

## Capabilities

| Capability | Used | Notes |
|------------|------|-------|
| Filesystem | read/write | Creates and modifies skill/plugin files |
| Shell | yes | Runs scaffolding and validation scripts |
| Network | no | — |
| MCP | no | — |

## Development

Source available at:
https://github.com/outfitter-dev/agents/tree/main/agent-kit

## Contributing

Found an issue or want to improve these skills?
- Report issues: https://github.com/outfitter-dev/agents/issues
- Submit PRs: https://github.com/outfitter-dev/agents/pulls

## License

MIT License - see [LICENSE](../LICENSE) for details.
