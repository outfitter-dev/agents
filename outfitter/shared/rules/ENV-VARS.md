# Environment Variables Reference

Claude Code exposes environment variables for plugins to reference paths and configuration.

## Quick Reference

| Variable | Available In | Purpose |
|----------|-------------|---------|
| `${CLAUDE_PLUGIN_ROOT}` | plugin.json config | Plugin installation directory |
| `$CLAUDE_PROJECT_DIR` | Hook scripts (runtime) | User's project root |
| `$file` | PostToolUse hooks | Affected file path |

## The Key Distinction

**`${CLAUDE_PLUGIN_ROOT}`** - Where your plugin is installed

- Use in `plugin.json` for hooks, MCP servers, and resources
- Resolved at config parse time
- References files that **ship with** your plugin

**`$CLAUDE_PROJECT_DIR`** - Where the user is working

- Available to hook scripts at runtime
- References the user's project files
- Use when your plugin needs to **operate on** user code

## Common Pattern: Both Together

A hook that loads plugin config but operates on user files:

```bash
#!/bin/bash
# Load config from plugin installation
CONFIG="${CLAUDE_PLUGIN_ROOT}/config/rules.json"

# Operate on user's project
TARGET="$CLAUDE_PROJECT_DIR/src"

jq -r '.patterns[]' "$CONFIG" | while read pattern; do
  grep -r "$pattern" "$TARGET"
done
```

## In plugin.json

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.sh"
      }]
    }]
  }
}
```

The script `validate.sh` receives `$CLAUDE_PROJECT_DIR` at runtime.

## Variable Syntax

- **Config files** (plugin.json): Use `${VARIABLE}` with braces
- **Shell scripts**: Use `$VARIABLE` (standard shell syntax)
