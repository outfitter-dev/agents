# Agent Kit

Skills for authoring Agent Skills (cross-tool) and platform-specific configuration for Claude Code, Codex, and other AI coding assistants.

## What's Included

This plugin provides skills for building AI agent capabilities across multiple platforms:

### Cross-Tool Skills

- **skills-development** - Create and validate Agent Skills following the open specification at [agentskills.io](https://agentskills.io), compatible with Claude Code, Codex, Cursor, Amp, Goose, and more

### Claude Code Skills

- **claude-plugin-development** - Complete lifecycle for creating, validating, and distributing Claude Code plugins
- **claude-code-configuration** - Manage Claude Desktop and Claude Code configuration files
- **claude-command-authoring** - Create and maintain Claude Code slash commands
- **claude-hook-authoring** - Author Claude Code hooks for automation
- **claude-agent-development** - Create and validate specialized Claude Code agents

### OpenAI Codex Skills

- **codex-configuration** - Manage Codex CLI configuration including config.toml, MCP servers, profiles, and sandbox modes

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

### skills-development

Creates and validates Agent Skills that work across multiple AI coding tools:
- SKILL.md structure and frontmatter
- Progressive disclosure pattern
- References and examples organization
- Cross-tool compatibility (Claude Code, Codex, Cursor, Amp, Goose, etc.)
- Validation checklists and report templates
- Common fixes with before/after examples

Includes comprehensive reference documentation on:
- [compatibility.md](skills/skills-development/references/compatibility.md) - Platform support matrix
- [implementations.md](skills/skills-development/references/implementations.md) - Per-tool implementation details
- [invocations.md](skills/skills-development/references/invocations.md) - How each tool activates skills

### claude-plugin-development

Complete lifecycle for developing, validating, and distributing Claude Code plugins:
- Plugin initialization and structure
- Component authoring (commands, agents, hooks, skills)
- Validation and testing
- Packaging and versioning
- Marketplace setup and distribution
- Team configuration

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

### claude-command-authoring

Creates Claude Code slash commands:
- Frontmatter, args, and file reference patterns
- Command naming and conventions
- Examples and validation steps

### claude-hook-authoring

Creates Claude Code hooks:
- Hook lifecycle and trigger points
- Safe shell patterns and tooling
- Testing and validation guidance

### claude-agent-development

Creates and validates specialized Claude Code agents:
- Agent frontmatter and routing patterns
- Task tool invocation and scoping
- Best practices for focused expertise
- YAML correctness and tool constraints
- Prompt clarity and role definition
- Validation checklists and quality checks

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
<https://github.com/outfitter-dev/agents/tree/main/agent-kit>

## Contributing

Found an issue or want to improve these skills?
- Report issues: <https://github.com/outfitter-dev/agents/issues>
- Submit PRs: <https://github.com/outfitter-dev/agents/pulls>

## License

MIT License - see [LICENSE](../LICENSE) for details.
