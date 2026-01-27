# Evaluation Prompts for This Skill

Use these to verify an agent is applying CLI best practices (not just "making something that runs").

## Scoring rubric

- *Pass*:
  - Produces a clear CLI contract (commands, flags, IO, exit codes, examples).
  - Explicitly addresses stdout/stderr, exit codes, help behavior, and interactivity.
  - Includes stable scripting output modes (`--json`/`--plain`) when relevant.
  - Avoids secret leaks (no secrets via flags/env).
- *Strong pass*:
  - Uses the checklist and/or the audit script.
  - Highlights trade-offs and backwards-compatibility risks.
  - Provides ready-to-ship help output and error message patterns.

## Prompt: design a new CLI

- Task:
  - "Design a CLI called `logship` that tails logs from multiple sources (local files and HTTP endpoints), filters by regex, and outputs either human-friendly colored logs or machine-readable JSON."
- Must include:
  - Subcommands or flags decision (and rationale)
  - `stdout` vs `stderr` behavior
  - `--json` output definition (shape)
  - Color behavior (`NO_COLOR`, `--no-color`, TTY detection)
  - Timeouts for HTTP, progress/status messages
  - Example-first help outline
  - Exit codes

## Prompt: review a flawed CLI help output

- Task:
  - "Here's the current `--help` output for `acmectl`. It's 200 lines of flags, no examples, and no description. Rewrite it to be discoverable."
- Must include:
  - Concise default help vs full help structure
  - Examples near the top
  - Group common flags first
  - Support path / docs link

## Prompt: fix stdout/stderr separation

- Task:
  - "This command prints progress bars to stdout and the JSON result to stderr. Fix the output contract."
- Must include:
  - Machine output on stdout
  - Human/progress on stderr
  - Behavior when piped/captured (no animations)

## Prompt: safe destructive action

- Task:
  - "Add a `delete` command that can delete remote projects. Make it safe for humans but scriptable."
- Must include:
  - Confirmation levels (moderate vs severe)
  - `--dry-run`
  - `--force` and/or `--confirm="exact-name"`
  - `--no-input` behavior

## Prompt: secret handling

- Task:
  - "Add auth to the CLI. It currently accepts `--token <secret>` and reads `MYAPP_TOKEN` env var. Fix the design."
- Must include:
  - `--token-file` and/or `--token-stdin`
  - Recommendation for OS keychain / secret manager
  - Explain why flags/env are unsafe

## Prompt: run the audit script

- Task:
  - "Run `scripts/cli_audit.py` against `./mycli` and address the FAIL/WARN items."
- Must include:
  - Interpreting the audit output
  - Fixing highest severity issues first
  - Updating help text and/or flags accordingly
