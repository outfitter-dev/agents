# Help Text Template

Use this as a skeleton for `mycmd --help` (plain text, scan-friendly).

```text
mycmd — <one-line summary>

USAGE
  mycmd <command> [options]
  mycmd <command> --help

DESCRIPTION
  <what this tool does, and when to use it>
  <what it does NOT do (optional, but helpful for setting expectations)>

EXAMPLES
  # <most common use case>
  mycmd <command> <args>

  # <machine-readable output>
  mycmd <command> --json

COMMANDS
  <command>        <short summary>
  <command>        <short summary>
  help [command]   Show help for a command (optional)

OPTIONS
  -h, --help       Show help and exit
  --version        Show version and exit
  --json           Output structured JSON
  --plain          Output stable plain text (one record per line)
  --no-color       Disable ANSI color output
  --no-input       Disable prompts; fail if required input is missing
  -q, --quiet      Reduce non-essential output
  -v, --verbose    Increase output detail
  -d, --debug      Enable debug logging
  -n, --dry-run    Describe changes without applying them
  -f, --force      Skip confirmations / force the action

ENVIRONMENT
  NO_COLOR         Disable color output
  MYCMD_DEBUG      Enable debug logging (equivalent to --debug)

DOCUMENTATION
  Docs: <https://example.com/docs/mycmd>
  Issues: <https://github.com/example/mycmd/issues>
```
