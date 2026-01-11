# Troubleshooting Codex Configuration

Common issues and solutions for Codex CLI configuration.

## Common Issues

### Config Not Loading

**Symptoms:** Settings not applied, defaults used instead

**Solutions:**
1. Verify `~/.codex/config.toml` exists
2. Check TOML syntax
3. Use `-c` to override and test

```bash
# Test with override
codex -c model="gpt-5.2" --help

# Validate TOML syntax
cat ~/.codex/config.toml | toml-lint
```

### MCP Server Not Connecting

**Symptoms:** Tools not available, connection errors

**Checklist:**
1. Check command path is correct
2. Verify API keys in env section
3. Check `enabled = true`
4. Review `tool_timeout_sec`

```bash
# List servers and status
codex mcp list

# Test server connection
codex mcp test server-name
```

### Skills Not Found

**Symptoms:** `$skill-name` not recognized

**Checklist:**
1. Verify path hierarchy
2. Check skill directory structure
3. Ensure SKILL.md exists in skill folder

**Skills path precedence:**
1. `$CWD/.codex/skills/`
2. `$CWD/../.codex/skills/`
3. `$REPO_ROOT/.codex/skills/`
4. `~/.codex/skills/`
5. `/etc/codex/skills/`
6. Built-in skills

### Sandbox Too Restrictive

**Symptoms:** Permission denied, can't access files

**Solutions:**
- Use `-s workspace-write` for normal development
- Check project trust level
- Consider `--add-dir` for additional paths

```bash
# Add additional writable directory
codex --add-dir /path/to/data "task requiring data access"

# Check current sandbox mode
codex -c sandbox_mode
```

## Debug Commands

### Check Current Configuration

```bash
# View current features
codex features

# Check effective config
codex config show
```

### Session Management

```bash
# Resume previous session
codex resume

# Resume last session
codex resume --last

# List recent sessions
codex sessions
```

### Sandbox Debugging

```bash
# Run command in sandbox debug mode
codex sandbox <command>

# Check sandbox permissions
codex sandbox --check
```

## Validation

### TOML Syntax

```bash
# Using toml-lint
cat ~/.codex/config.toml | toml-lint

# Using Python
python -c "import toml; toml.load(open('$HOME/.codex/config.toml'))"
```

### Test Config Override

```bash
# Test model setting
codex -c model="gpt-5.2-codex" --help

# Test multiple settings
codex -c model="gpt-5.2" -c model_verbosity="high" --help
```

### Verify MCP Servers

```bash
# List all configured servers
codex mcp list

# Check specific server
codex mcp test graphite
```

## Log Locations

Codex logs are typically in:
- `~/.codex/logs/` (if logging enabled)
- System journal (on Linux with systemd)

## Reset Configuration

If configuration is corrupted:

```bash
# Backup current config
cp ~/.codex/config.toml ~/.codex/config.toml.bak

# Start fresh
rm ~/.codex/config.toml

# Recreate with defaults
codex config init
```
