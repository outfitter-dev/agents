# Outfitter Agents

Official Outfitter development tools and integrations for Claude Code.

## What's This?

This repository hosts the **Outfitter Marketplace** - a curated collection of Claude Code plugins for developers working with Outfitter projects.

## Installation

```bash
# Add the Outfitter marketplace
/plugin marketplace add outfitter-dev/agents

# Browse available plugins
/plugin
```

## Available Plugins

### claude-dev

Skills for authoring Claude Code plugins, marketplaces, and configuration management.

**Install:**
```bash
/plugin install claude-dev@outfitter
```

**What it does:**
- Creates complete Claude Code plugins
- Sets up plugin marketplaces
- Manages Claude configuration files
- Handles plugin distribution and versioning

**Use when:** Building Claude Code plugins, setting up marketplaces, or managing configuration.

### blz

Fast local documentation search with llms.txt indexing.

**Install:**
```bash
/plugin install blz@outfitter
```

**What it does:**
- Search 12K+ line docs in 6ms
- Line-accurate citations
- Works offline after initial download
- Smart HTTP caching

**Use when:** Searching technical documentation, looking up APIs, or finding code examples.

## Plugin Development

Want to add your own plugin to the marketplace?

1. **Install claude-dev**: Get the plugin authoring skills
   ```bash
   /plugin install claude-dev@outfitter
   ```

2. **Create your plugin**: Use the skills to build your plugin

3. **Submit a PR**: Add your plugin to `.claude-plugin/marketplace.json`

See [claude-dev/README.md](claude-dev/README.md) for detailed guidance.

## Repository Structure

```
agents/
├── .claude-plugin/
│   └── marketplace.json       # Marketplace catalog
├── claude-dev/                # Plugin authoring skills
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   └── README.md
└── README.md                  # This file
```

## For Outfitter Contributors

If you're working on Outfitter projects and want to use these tools locally:

```bash
# From this directory
/plugin marketplace add .
/plugin install claude-dev@outfitter
/plugin install blz@outfitter
```

## Links

- **Outfitter**: https://github.com/outfitter-dev
- **BLZ**: https://github.com/outfitter-dev/blz
- **Issues**: https://github.com/outfitter-dev/agents/issues

## License

MIT License - see [LICENSE](LICENSE) for details.
