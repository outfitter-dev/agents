# Security Configuration for Codex

Sandbox modes, approval policies, and security best practices.

## Sandbox Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `read-only` | No write access | Safe exploration, code review |
| `workspace-write` | Write to workspace only | Normal development |
| `danger-full-access` | Full system access | Trusted operations only |

### Usage

```bash
codex -s read-only "analyze this codebase"
codex -s workspace-write "implement feature"
codex --dangerously-bypass-approvals-and-sandbox  # EXTREME CAUTION
```

### In Config

```toml
sandbox_mode = "workspace-write"  # Default for all sessions
```

## Approval Policies

| Policy | Behavior |
|--------|----------|
| `untrusted` | Only trusted commands (ls, cat, sed) run without approval |
| `on-failure` | All commands run; approval only if command fails |
| `on-request` | Model decides when to ask |
| `never` | Never ask for approval |

### Usage

```bash
codex -a untrusted "careful task"
codex -a never "automated pipeline"
codex --full-auto  # Alias for -a on-request --sandbox workspace-write
```

### In Config

```toml
approval_policy = "on-failure"  # Balanced default
```

## Project Trust Levels

Set trust levels per project:

```toml
[projects]
"/path/to/trusted/project" = { trust_level = "trusted" }
"/path/to/another" = { trust_level = "trusted" }
```

**Trust levels:**
- `trusted` - Full permissions within sandbox
- `untrusted` - Stricter command approval

## Shell Environment Policy

Control which environment variables are available:

```toml
[shell_environment_policy]
set = { MY_VAR = "value" }  # Force-set environment vars
inherit = "all"  # all | core | none
ignore_default_excludes = false
include_only = []  # Whitelist patterns
```

### Minimal Environment

```toml
[shell_environment_policy]
inherit = "core"  # Only PATH, HOME, USER
set = { CI = "true" }
```

### Inherit Everything

```toml
[shell_environment_policy]
inherit = "all"
```

### Whitelist Specific Variables

```toml
[shell_environment_policy]
inherit = "none"
include_only = ["PATH", "HOME", "USER", "EDITOR", "TERM"]
```

## Convenience Flags

| Flag | Equivalent |
|------|------------|
| `--full-auto` | `-a on-request --sandbox workspace-write` |
| `-s read-only` | `--sandbox read-only` |
| `-a never` | `--approval-policy never` |

## Best Practices

### Development Workflow

```toml
# Recommended for most development
sandbox_mode = "workspace-write"
approval_policy = "on-failure"
```

### CI/CD Pipelines

```toml
# Fully automated
sandbox_mode = "workspace-write"
approval_policy = "never"
```

### Code Review / Exploration

```toml
# Read-only for safety
sandbox_mode = "read-only"
approval_policy = "untrusted"
```

### Sensitive Operations

```bash
# Explicit approval for everything
codex -a untrusted -s read-only "security audit"
```

## Security Checklist

- [ ] Use `workspace-write` as default sandbox
- [ ] Set `approval_policy = "on-failure"` as baseline
- [ ] Only use `danger-full-access` when absolutely necessary
- [ ] Review project trust levels periodically
- [ ] Don't store secrets in config.toml
- [ ] Use environment variables for sensitive values
- [ ] Review MCP server permissions before enabling
