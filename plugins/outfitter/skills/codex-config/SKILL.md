---
name: codex-config
description: This skill should be used when configuring Codex CLI, setting up profiles, or when "config.toml", "sandbox mode", "Codex config", or "approval policy" are mentioned.
metadata:
  version: "1.0.0"
  related-skills:
    - claude-config
    - skills-dev
---

# Codex Configuration Management

Manages configuration files for OpenAI Codex CLI, including model settings, sandbox policies, MCP servers, and profiles.

## Configuration Location

**Primary Config:** `~/.codex/config.toml`

**Skills Paths (precedence, highest first):**
1. `$CWD/.codex/skills/` - Current directory
2. `$CWD/../.codex/skills/` - Parent directory
3. `$REPO_ROOT/.codex/skills/` - Repository root
4. `~/.codex/skills/` - User-level
5. `/etc/codex/skills/` - System/admin level
6. Built-in skills - Bundled with Codex

## Basic config.toml

```toml
# Model settings
model = "gpt-5.2-codex"
model_verbosity = "medium"  # high | medium | low
model_reasoning_effort = "high"  # low | high | xhigh

# Permissions
approval_policy = "on-failure"  # untrusted | on-failure | on-request | never
sandbox_mode = "workspace-write"  # read-only | workspace-write | danger-full-access
exec_timeout_ms = 300000  # 5 minutes

# Misc
file_opener = "cursor"  # Editor for opening files
```

## Profiles

Define named profiles for different workflows:

```toml
[profiles.max]
model = "gpt-5.1-codex-max"
model_verbosity = "high"
model_reasoning_effort = "xhigh"

[profiles.fast]
model = "gpt-5.1-codex-mini"
model_verbosity = "low"
model_reasoning_effort = "low"
```

**Usage:**

```bash
codex -p max "complex refactoring task"
codex -p fast "quick fix"
```

## MCP Servers

```toml
[mcp_servers.server-name]
command = "npx"
args = ["-y", "@package/mcp-server"]
enabled = true
tool_timeout_sec = 60.0

[mcp_servers.server-name.env]
API_KEY = "your-key"
```

## Skills

### Invoking Skills

```bash
# Explicit invocation
codex "$plan implement authentication"
codex "$skill-creator new skill for testing"

# Implicit (Codex decides based on context)
codex "plan out the implementation"
```

### Built-in Skills

- `$plan` - Research and create implementation plans
- `$skill-creator` - Bootstrap new skills
- `$skill-installer` - Download skills from GitHub

## CLI Override

Override any config value at runtime:

```bash
codex -c model="o3"
codex -c 'sandbox_permissions=["disk-full-read-access"]'
codex -c shell_environment_policy.inherit=all
```

## Convenience Flags

| Flag | Equivalent |
|------|------------|
| `--full-auto` | `-a on-request --sandbox workspace-write` |
| `--oss` | `-c model_provider=oss` (local LM Studio/Ollama) |
| `--search` | Enable web search tool |

```bash
codex --full-auto "implement feature"
codex -C /path/to/project "work in different dir"
codex --add-dir /additional/path "access multiple dirs"
```

## Quick Validation

```bash
# Check TOML syntax
cat ~/.codex/config.toml | toml-lint

# Test config override
codex -c model="test" --help

# Verify MCP servers
codex mcp list
```

## Quick Troubleshooting

**Config not loading:** Verify `~/.codex/config.toml` exists, check TOML syntax

**MCP server not connecting:** Check command path, verify API keys, check `enabled = true`

**Skills not found:** Verify path hierarchy, check SKILL.md exists in skill folder

**Sandbox too restrictive:** Use `-s workspace-write`, check project trust level

## References

Detailed documentation for specific scenarios:

- **[MCP Servers](references/mcp-servers.md)** - Server configuration examples (Context7, Firecrawl, Graphite, Linear)
- **[Troubleshooting](references/troubleshooting.md)** - Common issues, debug commands, validation
- **[Security](references/security.md)** - Sandbox modes, approval policies, trust levels, best practices
