---
name: codex-configuration
description: Manages OpenAI Codex CLI configuration including config.toml settings, MCP servers, model profiles, sandbox modes, approval policies, and skill paths. Use when configuring Codex CLI, setting up model profiles, managing MCP server integrations, troubleshooting Codex configuration issues, or optimizing Codex for different workflows.
version: 1.0.0
---

# Codex Configuration Management

Manages configuration files for OpenAI Codex CLI, including model settings, sandbox policies, MCP servers, and profiles.

## Quick Start

### Configuration File Location

**Primary Config:**
- `~/.codex/config.toml` — User-level configuration

**Skills Paths (precedence, highest first):**
1. `$CWD/.codex/skills/` — Current directory
2. `$CWD/../.codex/skills/` — Parent directory
3. `$REPO_ROOT/.codex/skills/` — Repository root
4. `~/.codex/skills/` — User-level
5. `/etc/codex/skills/` — System/admin level
6. Built-in skills — Bundled with Codex

### CLI Config Override

Override any config value at runtime:

```bash
codex -c model="o3"
codex -c 'sandbox_permissions=["disk-full-read-access"]'
codex -c shell_environment_policy.inherit=all
```

## Config Structure

### Basic config.toml

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

### Model Configuration

```toml
model = "gpt-5.2-codex"
model_verbosity = "medium"
model_reasoning_summary = "auto"  # auto | concise | detailed
model_reasoning_summary_format = "experimental"
model_supports_reasoning_summaries = true
model_reasoning_effort = "high"
tool_output_token_limit = 25000
```

### Profiles

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

[profiles.normal]
model = "gpt-5.2"
model_verbosity = "medium"
model_reasoning_effort = "high"
```

**Usage:**

```bash
codex -p max "complex refactoring task"
codex -p fast "quick fix"
```

### Sandbox Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `read-only` | No write access | Safe exploration |
| `workspace-write` | Write to workspace only | Normal development |
| `danger-full-access` | Full system access | Trusted operations |

```bash
codex -s read-only "analyze this codebase"
codex -s workspace-write "implement feature"
codex --dangerously-bypass-approvals-and-sandbox  # EXTREME CAUTION
```

### Approval Policies

| Policy | Behavior |
|--------|----------|
| `untrusted` | Only trusted commands (ls, cat, sed) run without approval |
| `on-failure` | All commands run; approval only if command fails |
| `on-request` | Model decides when to ask |
| `never` | Never ask for approval |

```bash
codex -a untrusted "careful task"
codex -a never "automated pipeline"
codex --full-auto  # Alias for -a on-request --sandbox workspace-write
```

### Project Trust Levels

```toml
[projects]
"/path/to/trusted/project" = { trust_level = "trusted" }
"/path/to/another" = { trust_level = "trusted" }
```

### Shell Environment Policy

```toml
[shell_environment_policy]
set = { MY_VAR = "value" }  # Force-set environment vars
inherit = "all"  # all | core | none
ignore_default_excludes = false
include_only = []  # Whitelist patterns
```

### Features

Toggle experimental features:

```toml
[features]
unified_exec = true
shell_snapshot = true
apply_patch_freeform = true
exec_policy = true
remote_compaction = true
skills = true
```

**CLI toggle:**

```bash
codex --enable skills
codex --disable remote_compaction
```

### TUI Settings

```toml
[tui]
notifications = ["agent-turn-complete", "approval-requested"]
```

## MCP Server Configuration

### Adding MCP Servers

```toml
[mcp_servers.server-name]
command = "npx"
args = ["-y", "@package/mcp-server"]
enabled = true
tool_timeout_sec = 60.0

[mcp_servers.server-name.env]
API_KEY = "your-key"
```

### Common MCP Servers

**Context7 (documentation):**

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_KEY"]
```

**Firecrawl (web scraping):**

```toml
[mcp_servers.firecrawl]
command = "npx"
args = ["-y", "firecrawl-mcp"]

[mcp_servers.firecrawl.env]
FIRECRAWL_API_KEY = "YOUR_KEY"
```

**Graphite (stacked PRs):**

```toml
[mcp_servers.graphite]
command = "gt"
args = ["mcp"]
```

**Linear (project management):**

```toml
[mcp_servers.linear]
command = "npx"
args = ["-y", "mcp-remote@latest", "https://mcp.linear.app/sse"]
```

### Disabling MCP Servers

```toml
[mcp_servers.disabled-server]
command = "some-command"
args = []
enabled = false
```

## Skills Configuration

### Skills Paths

Codex loads skills from multiple locations with precedence:

1. **CWD**: `.codex/skills/` — Project-specific
2. **Parent**: `../.codex/skills/` — Shared in parent folder
3. **Repo Root**: `$REPO_ROOT/.codex/skills/` — Repository-wide
4. **User**: `~/.codex/skills/` — Personal skills
5. **Admin**: `/etc/codex/skills/` — System-wide
6. **Built-in**: Bundled with Codex (`$plan`, `$skill-creator`)

### Invoking Skills

```bash
# Explicit invocation
codex "$plan implement authentication"
codex "$skill-creator new skill for testing"

# Implicit (Codex decides based on context)
codex "plan out the implementation"
```

### Built-in Skills

- `$plan` — Research and create implementation plans
- `$skill-creator` — Bootstrap new skills
- `$skill-installer` — Download skills from GitHub

## Convenience Flags

| Flag | Equivalent |
|------|------------|
| `--full-auto` | `-a on-request --sandbox workspace-write` |
| `--oss` | `-c model_provider=oss` (local LM Studio/Ollama) |
| `--search` | Enable web search tool |

```bash
codex --full-auto "implement feature"
codex --oss --local-provider ollama "explain this code"
codex --search "find latest React patterns"
```

## Working Directory

```bash
codex -C /path/to/project "work here"
codex --add-dir /additional/writable/path "access multiple dirs"
```

## Validation

```bash
# Check TOML syntax
cat ~/.codex/config.toml | toml-lint

# Test config override
codex -c model="test" --help

# Verify MCP server
codex mcp list
```

## Troubleshooting

### Common Issues

**Config not loading:**
- Verify `~/.codex/config.toml` exists
- Check TOML syntax
- Use `-c` to override and test

**MCP server not connecting:**
- Check command path is correct
- Verify API keys in env section
- Check `enabled = true`
- Review `tool_timeout_sec`

**Skills not found:**
- Verify path hierarchy
- Check skill directory structure
- Ensure SKILL.md exists in skill folder

**Sandbox too restrictive:**
- Use `-s workspace-write` for normal development
- Check project trust level
- Consider `--add-dir` for additional paths

### Debug Commands

```bash
# Check current features
codex features

# Resume previous session
codex resume
codex resume --last

# Run in sandbox debug mode
codex sandbox <command>
```

## Best Practices

### Security

- Use `workspace-write` sandbox for most work
- Set `approval_policy = "on-failure"` as baseline
- Only use `danger-full-access` when necessary
- Review project trust levels periodically

### Performance

- Use profiles for different task types
- Set appropriate `exec_timeout_ms`
- Configure `tool_output_token_limit` for large outputs

### Organization

- Keep user-level skills in `~/.codex/skills/`
- Use project-level skills for team sharing
- Document custom MCP server configurations
