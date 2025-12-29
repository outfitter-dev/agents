# cli-dev

Skills for building command-line tools with human-first UX and UNIX composability.

## Installation

```bash
/plugin install cli-dev@outfitter
```

## Skills

| Skill | Purpose |
|-------|---------|
| `cli-development-guidelines` | Design and review CLIs: arguments/flags, help text, stdout/stderr, exit codes, interactivity, configuration, errors, and distribution |

## Usage

The skill activates when you're designing, implementing, or reviewing a CLI tool. Trigger phrases include:

- `--help`, flags, subcommands, exit codes
- stdout/stderr, piping, JSON output
- color, prompts, config files, env vars
- "works in CI", install/uninstall, telemetry

### What it produces

- **CLI contract**: commands, flags, IO behavior, exit codes, config/env, examples
- **Help output**: example-first, scan-friendly
- **Compliance audit**: via `scripts/cli_audit.py`

### Quick audit

```bash
python cli-dev/skills/cli-development-guidelines/scripts/cli_audit.py -- <your-cli>
```

## License

- Documentation: CC-BY-SA-4.0 (adapted from [clig.dev](https://clig.dev/))
- Scripts: MIT
