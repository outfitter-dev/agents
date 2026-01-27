# Error Message Template

## Goals

- *Human readable first*: describe the problem in plain language.
- *Actionable*: include the next step (flag, file path, permission change, docs link).
- *Low noise*: avoid stack traces in normal mode.
- *Correct stream*: errors go to `stderr`.
- *Correct exit code*: non-zero.

## Pattern

```text
Error: <what failed in plain language>
Cause: <most likely cause, if known> (optional)
Fix:   <what the user should do next>
Hint:  <related command / docs> (optional)

For more help: mycmd <subcmd> --help
Docs: <https://example.com/docs/...> (optional)
```

## Examples

### Missing required argument

```text
Error: missing required argument <path>
Fix:   pass a path, or run: mycmd upload --help
```

### Permission error with actionable fix

```text
Error: can't write to /var/log/mycmd/output.txt
Fix:   choose a writable location, or run: chmod u+w /var/log/mycmd/output.txt
```

### Unknown flag (with suggestion)

```text
Error: unknown option: --jon
Fix:   did you mean --json ?
For more help: mycmd --help
```

### Unexpected error (debug path)

```text
Error: unexpected failure while reading config
Fix:   re-run with --debug, and include the log in a bug report
Issues: https://github.com/example/mycmd/issues/new
```
