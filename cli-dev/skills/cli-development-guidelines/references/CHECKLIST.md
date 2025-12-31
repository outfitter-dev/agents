# CLI Development Checklist

Use this to *review a CLI design* or *gate a release*.

## Interface contract

- The CLI's interface is documented (commands, flags, exit codes, output modes).
- There is a stable scripting mode (`--json` and/or `--plain`) for anything that users might automate.
- Backwards-compatibility is treated as a release constraint.

## Basics

- Exit codes:
  - `0` on success
  - Non-zero on failure
  - Usage/argument errors are consistently non-zero (often `2`)
- Streams:
  - Primary output goes to `stdout`
  - Errors, warnings, progress, and status messaging go to `stderr`
- `--help` prints help and exits successfully
- `--version` prints version and exits successfully

## Help and docs

- If invoked incorrectly (missing required args), prints a *concise* help block.
- Full help is scan-friendly:
  - USAGE
  - DESCRIPTION
  - COMMANDS (if any)
  - OPTIONS
  - EXAMPLES (near the top)
- Includes:
  - Web docs link
  - Support/issue path
- Doesn't emit ANSI escape sequences when help is piped/captured.

## Output behavior

- Human-friendly defaults when writing to a TTY.
- Machine-friendly modes exist and are documented:
  - `--json` (structured)
  - `--plain` (one record per line / simple tabular)
- Color:
  - Disabled when stream isn't a TTY
  - Disabled when `NO_COLOR` is set
  - Disabled when `TERM=dumb`
  - Disabled with `--no-color`
- No animations/spinners/progress bars when output isn't a TTY.
- Large output uses a pager only when appropriate and respects `PAGER`.

## Arguments, flags, and subcommands

- Flags are preferred over positional args unless the command is truly "classic" (`cp src dst`).
- All flags have long forms.
- One-letter flags are reserved for truly common actions.
- Uses conventional flag names where applicable (`--json`, `--dry-run`, `--force`, etc.).
- Subcommands are unambiguous and avoid near-synonyms.
- Order dependence is avoided when feasible.

## Interactivity and safety

- Prompts only when `stdin` is a TTY.
- `--no-input` disables prompts.
- Dangerous operations:
  - Support `--dry-run` (when helpful)
  - Confirm interactively
  - Support `--force`/`--confirm=...` for non-interactive usage
- Boundary-crossing actions (network, implicit file writes) are explicit and/or clearly documented.

## Configuration

- Precedence is clear and consistent:
  - Flags > env > project config > user config > system config
- Uses XDG base dirs for user config/cache/data when relevant.
- `.env` is only used for simple context knobs and is not used for secrets.

## Secrets

- Secrets are not accepted via flags or environment variables.
- Secrets are accepted via:
  - stdin (`--token-stdin`, `--password-stdin`)
  - file (`--token-file`)
  - OS keychain / secret manager (when appropriate)

## Robustness

- Validates user input early and clearly.
- Gives quick feedback (<~100ms) before long operations.
- Network operations have timeouts.
- Operations are idempotent or recoverable when possible.
- Ctrl-C exits quickly and predictably; long cleanup can be interrupted.

## Release and distribution

- Installation is clear and reversible.
- Uninstall instructions exist.
- Changelog notes behavior changes and deprecations.
- Deprecations warn before removal; replacements are documented.

## Quick automation

- Run: `python scripts/cli_audit.py -- <your-cli> [subcommand]`
- Treat FAILs as blockers; treat WARNs as "fix soon."
