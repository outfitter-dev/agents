# CLI Development Guidelines Reference

## Scope and sources

This reference is a *condensed, operational* guide for building well-behaved CLI tools.

- Primary source (adapted heavily): *Command Line Interface Guidelines* (<https://clig.dev/>)
  - License: CC BY-SA 4.0
  - Authors: Aanand Prasad, Ben Firshman, Carl Tashian, Eva Parish
- Additional sources: POSIX utility conventions, GNU standards, Heroku CLI style guide, 12-factor CLI apps, XDG base directory spec, NO_COLOR convention.

## Table of contents

- [Design principles](#design-principles)
- [The basics: being a good CLI citizen](#the-basics-being-a-good-cli-citizen)
- [Help and documentation](#help-and-documentation)
- [Output, formatting, and modes](#output-formatting-and-modes)
- [Errors and diagnostics](#errors-and-diagnostics)
- [Arguments, flags, and subcommands](#arguments-flags-and-subcommands)
- [Interactivity and safety](#interactivity-and-safety)
- [Configuration and environment variables](#configuration-and-environment-variables)
- [Secrets and sensitive data](#secrets-and-sensitive-data)
- [Robustness: timeouts, retries, signals](#robustness-timeouts-retries-signals)
- [Future-proofing](#future-proofing)
- [Distribution and lifecycle](#distribution-and-lifecycle)
- [Analytics and telemetry](#analytics-and-telemetry)
- [Implementation notes](#implementation-notes)
- [Further reading](#further-reading)

## Design principles

### Human-first, but composable

- Optimize the default UX for humans:
  - Clear, calm messages
  - Example-first help
  - Progress indicators for long operations
- Still be *composable* in UNIX pipelines:
  - Clean `stdout` for data
  - Meaningful exit codes
  - No unexpected prompts in scripts

### Consistency is a power tool

- Prefer established CLI conventions when possible.
- Be consistent within your tool:
  - Same option names mean the same thing everywhere.
  - Output formats don't randomly change between subcommands.

### Say *just* enough

- Too little:
  - Silent hangs
  - No confirmation that anything happened
- Too much:
  - Verbose debug spew in normal mode
  - Walls of text hiding the one important line

### Discovery beats memorization

- `--help` should teach quickly.
- Suggest the "next command" in multi-step workflows.

### CLI as a conversation

- Users will iterate: run → error → fix → run.
- Respond like a helpful conversational partner:
  - Point out what went wrong
  - Suggest the simplest fix
  - Make it easy to learn the correct syntax

## The basics: being a good CLI citizen

### Use a parsing library

- Don't hand-roll parsing, help formatting, or error rendering.
- A good parser will usually also give you:
  - Help output
  - Unknown-flag handling
  - Sometimes: typo suggestions

### Streams: stdout vs stderr

- `stdout`
  - The command's primary output
  - Machine-readable output (piped into the next command)
- `stderr`
  - Errors
  - Warnings
  - Progress / status messages
  - Human "what's happening" narration

### Exit codes

- `0` means success.
- Non-zero means failure.
- Prefer a small set of stable, documented failure codes over "random integers."
- Consider reserving `2` for argument/usage errors.
- If you need a more granular taxonomy, consider the BSD `sysexits` family (e.g., EX_USAGE = 64), but be aware that many tools simply use `1`/`2` in practice.

## Help and documentation

### Required behaviors

- `--help` shows help and exits successfully.
- Ideally also support `-h` (and do not overload it with a different meaning).
- If your CLI has subcommands:
  - `tool subcmd --help`
  - `tool help subcmd` (optional but common in `git`-like tools)

### Concise help by default (when invocation is incomplete)

If the user runs a command with missing required args/flags, print a concise help block:
- What the tool does (one line)
- 1–2 common examples
- The most important flags (or a pointer to full help)
- "Run `--help` for full usage"

### Full help when asked

Full help should include:
- Usage line(s)
- Description
- Commands (if any)
- Options
- Examples (lead with examples; users will copy-paste them)
- Support path (issues / repo)
- Link to web docs (especially to a subcommand anchor if you have it)

### Formatting guidance

- Use scan-friendly formatting:
  - Uppercased section headings
  - Alignment for options
  - Avoid ANSI escape sequences if help is piped (your output should not become "escape soup")

### If stdin is required but not provided

If your tool expects piped input and `stdin` is a TTY, don't hang.
- Print help or a clear message.
- Exit non-zero.

## Output, formatting, and modes

### Human-readable output is the default

A practical heuristic:
- If output is going to a TTY, it's probably a human.
- If output is being captured/piped, it's probably a program.

### Provide machine-readable output when it doesn't harm usability

Common patterns:
- `--json` outputs structured JSON (stable shape, versioned if needed).
- `--plain` outputs simple line/tabular output with one record per line.
- Encourage scripts to use `--json`/`--plain` rather than scraping the human UI.

### Keep success output brief, but not mysterious

- Printing nothing can feel like "it hung."
- Printing too much becomes noise.
- If you changed state, tell the user *what changed*.

### Color and symbols

- Use color with intention:
  - Red for errors
  - Yellow for warnings
  - Highlight important parts only
- Disable color when:
  - The relevant stream is not a TTY
  - `NO_COLOR` is set (non-empty)
  - `TERM=dumb`
  - User passes `--no-color`
- Consider supporting `FORCE_COLOR` (some ecosystems use it), but don't let it break logs.

### Animations and progress

- Never animate when output is not a TTY.
- If something takes "long," show progress.
- If parallel work is happening, avoid interleaving chaos (multi-progress-bar libs help).

### Paging

- If output is long and you're on a TTY, consider a pager.
- Respect `PAGER` if set.
- A common `less` default is: `less -FIRX`
  - Doesn't page if one screen
  - Keeps formatting, doesn't clear screen on exit

## Errors and diagnostics

### Rewrite expected errors for humans

Don't dump raw stack traces for normal user errors.
- Say what failed
- Say why it might have failed (likely causes)
- Say what to do next (actionable fix)

### Keep signal-to-noise high

- Group repetitive errors under one explanation.
- Put the most important info at the end (recency bias in terminals is real).

### Suggest corrections carefully

- Typo suggestions are great when safe:
  - "Unknown command `pss`. Did you mean `ps`?"
- Avoid "DWIM" behavior that silently changes meaning for destructive operations.

### Unexpected errors

When something truly unexpected happens:
- Provide a short human summary
- Offer a way to get debug details:
  - `--debug` or `--verbose`
  - Optional log file path
- Provide a bug report path and include reproducibility info

## Arguments, flags, and subcommands

### Prefer flags to positional args (usually)

- Flags are self-documenting and easier to extend without breaking compatibility.
- Exception: "classic" two-arg patterns (`cp <src> <dst>`) where brevity is worth it.

### Provide long forms for all flags

- If you have `-h`, also have `--help`.
- Long forms are friendlier in scripts and documentation.

### Reserve one-letter flags for truly common options

Short flags are a scarce resource. Spend them wisely.

### Standard flag names (use existing conventions)

Common conventions across CLI ecosystems:
- `-h`, `--help`
- `--version`
- `-v`, `--verbose` (but note ambiguity: sometimes `-v` is version)
- `-q`, `--quiet`
- `-d`, `--debug`
- `-f`, `--force`
- `-n`, `--dry-run`
- `--json`
- `--no-input`
- `--no-color`
- `-o`, `--output`

### Order independence (when feasible)

Users often add flags to the end of the previous command via ↑.
If possible, allow:
- `tool --flag subcmd`
- `tool subcmd --flag`

### Subcommand naming

- Avoid near-synonyms (`update` vs `upgrade`) unless the difference is extremely clear.
- For object/action CLIs, `noun verb` is common:
  - `docker container create`
- Keep verbs consistent across objects:
  - If you use `create`, also use `delete`/`list`/`get` consistently.

## Interactivity and safety

### Prompts only when stdin is a TTY

- If `stdin` is not a TTY:
  - Fail with a clear message describing the required flag(s)
  - Do not block waiting for input that will never arrive

### `--no-input` should disable prompts

- If required info is missing:
  - Exit non-zero
  - Tell the user how to provide it via flags or stdin

### Confirm dangerous operations

Different danger levels:
- Mild:
  - Deleting an explicit file the user named
- Moderate:
  - Bulk deletes, remote deletes, complex irreversible changes
- Severe:
  - "Delete the whole app/account/project"
  - Require explicit confirmation:
    - Type the resource name, or
    - `--confirm="exact-name"`

### Provide dry-run where it reduces fear

- `--dry-run` should describe intended changes without doing them.

## Configuration and environment variables

### Choose the right configuration surface

- Flags:
  - High variability per invocation
- Environment variables:
  - Varies by execution context (shell/session/CI)
- Project config file:
  - Stable for a project and shareable in version control
- User config:
  - Stable per machine/user

### Precedence (high → low)

A common, predictable precedence order:
- Flags
- Process environment
- Project config (`.env` / tool config in repo)
- User config
- System config

### XDG base directory spec

Prefer:
- Config: `$XDG_CONFIG_HOME` (default `~/.config`)
- Data: `$XDG_DATA_HOME` (default `~/.local/share`)
- Cache: `$XDG_CACHE_HOME` (default `~/.cache`)

### Environment variable naming

- Uppercase, numbers, underscores.
- Prefer tool-specific prefixes:
  - `MYTOOL_FOO=1`

### `.env` is not a real config system

`.env` is useful for small "context knobs," but it's limited:
- Everything is a string
- Often not versioned
- Often abused for secrets

## Secrets and sensitive data

- Do *not* accept secrets via flags:
  - Leaks into shell history and process listings (`ps`)
- Do *not* accept secrets via environment variables:
  - Easy to leak into logs, `docker inspect`, systemd unit displays, etc.
Prefer:
- `--token-file path`
- `--password-stdin`
- OS keychains / secret managers
- Pipes and local IPC when appropriate

## Robustness: timeouts, retries, signals

### Responsive beats fast

- Aim to print *something* within ~100ms for operations that might take time:
  - "Fetching…"
  - "Computing…"
  - "Connecting to …"

### Timeouts and retries

- Network requests should have timeouts.
- Consider retries for transient failures (with backoff).
- Make retries visible (don't silently hide minutes of retrying).

### Recoverability and idempotence

- If a command fails mid-way, a rerun should:
  - Pick up where it left off, or
  - Fail safely without corrupting state

### Ctrl-C behavior

- On SIGINT (Ctrl-C), stop quickly and say what happened.
- If cleanup is long:
  - Allow a second Ctrl-C to force quit
  - Don't hang forever in cleanup

## Future-proofing

- Treat the CLI as a public API:
  - Commands, flags, output formats, config keys are all interfaces
- Prefer additive changes:
  - New flags > changing behavior of old flags
- Deprecate explicitly:
  - Warn when deprecated flags are used
  - Tell the user the replacement
- Output for humans can evolve.
- Output for scripts should be stabilized via `--plain` or `--json`.

## Distribution and lifecycle

- Prefer a single binary distribution if reasonable.
- Make uninstall easy and documented.
- Provide version output (`--version`).
- Consider:
  - Man pages
  - Shell completions
  - Web docs with deep links to subcommands

## Analytics and telemetry

- Don't "phone home" without consent.
- If you collect anything:
  - Explain what, why, how anonymized, and retention period
  - Make opting out easy
Consider alternatives:
- Instrument docs
- Measure downloads
- Talk to users

## Implementation notes

### Parser libraries (examples, not exhaustive)

- Go: Cobra, urfave/cli
- Rust: clap
- Python: argparse, Click, Typer
- Node: oclif, commander, yargs
- Java: picocli
- Kotlin: clikt
- Swift: swift-argument-parser

### Practical output design tip

When in doubt:
- Human UI = defaults when TTY
- Machine UI = explicit flags (`--json`, `--plain`)
- Debug UI = explicit flags (`--debug`, `--verbose`)

## Further reading

- CLI Guidelines (primary): <https://clig.dev/>
- POSIX Utility Conventions: <https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html>
- GNU Coding Standards (Program Behavior, CLI conventions): <https://www.gnu.org/prep/standards/>
- Heroku CLI Style Guide: <https://devcenter.heroku.com/articles/cli-style-guide>
- 12 Factor CLI Apps: <https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46>
- NO_COLOR convention: <https://no-color.org/>
- XDG Base Directory Spec: <https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html>
