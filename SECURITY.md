# Security

Plugins are code. This document covers the threat model, review guidelines, and safe usage practices for the Outfitter marketplace.

## Threat Model

Claude Code plugins can:
- Read and write files in your project
- Execute shell commands
- Make network requests (via MCP servers)
- Access environment variables
- Invoke other tools and agents

This makes plugins a potential supply chain attack vector. Only install plugins you trust.

## Capabilities by Plugin

Each plugin documents its capabilities in its README. Summary:

| Plugin | Filesystem | Shell | Network | MCP |
|--------|------------|-------|---------|-----|
| baselayer | read | no | no | no |
| gitbutler | read | yes (git/but commands) | no | no |
| claude-dev | read/write | yes (scaffolding) | no | no |

**Capability definitions:**
- **Filesystem read**: Reads files to understand context
- **Filesystem write**: Creates or modifies files
- **Shell**: Executes terminal commands
- **Network**: Makes HTTP requests or connects to external services
- **MCP**: Connects to MCP servers for extended capabilities

## Review Checklist

Before installing a plugin, review:

1. **Source**: Is it from a known maintainer? Check the `author` field in plugin.json
2. **Scripts**: Does it include executable scripts? Review them for unexpected behavior
3. **Capabilities**: What can it access? Check the capabilities section in the plugin README
4. **Changes**: When updating, review the diff for new capabilities or scripts

### What to Look For

Red flags in plugin code:
- Hardcoded URLs or IP addresses
- Base64 encoded strings
- `eval()` or dynamic code execution
- Unexpected network calls
- File operations outside project directory
- Environment variable access beyond documented needs

## Safe Usage

### Installation

```bash
# Add marketplace
/plugin marketplace add outfitter-dev/agents

# Review plugin before installing
# Check the plugin's README and source code

# Install specific plugin
/plugin install baselayer@outfitter
```

### Updates

When updating plugins:

1. Check the changelog or commit history for changes
2. Review any new scripts or capabilities
3. Test in a non-critical project first if uncertain

### Reporting Issues

Found a security issue? Please report it:
- **Email**: team@outfitter.dev
- **GitHub**: Open a private security advisory at https://github.com/outfitter-dev/agents/security

## Plugin Development Guidelines

If contributing plugins to this marketplace:

1. **Minimize capabilities**: Only request what you need
2. **Document everything**: List all capabilities in your README
3. **No auto-execution**: Scripts should be explicitly invoked, not auto-run
4. **Prefer instructions**: Use markdown-based skills over executable scripts when possible
5. **Pin dependencies**: If your scripts have dependencies, pin versions

## Validation

Run the marketplace validation script to check plugin structure:

```bash
bun run shared/scripts/validate-marketplace.ts
```

This validates:
- Marketplace JSON schema
- Plugin metadata completeness
- Required skill fields
- File structure conventions
