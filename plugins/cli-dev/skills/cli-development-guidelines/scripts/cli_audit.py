#!/usr/bin/env python3
"""
cli_audit.py — a lightweight CLI "citizenship" checker.

Usage:
  python scripts/cli_audit.py -- <command> [args...]

Examples:
  python scripts/cli_audit.py -- ./mycmd
  python scripts/cli_audit.py -- mycmd subcmd

What it checks (heuristically):
- --help works (exit 0) and looks like help
- invalid flag produces non-zero and error on stderr
- common conventions appear in help (e.g., --version, --json, --no-color)
- ANSI escape codes / animations in non-TTY output (captured output is non-TTY)
- NO_COLOR / TERM=dumb behavior (best-effort)

Notes:
- This script does NOT "prove" correctness; it flags likely UX/composability issues.
- Some checks are WARN (recommendations), not FAIL (hard requirements).
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple


ANSI_RE = re.compile(
    r"""
    \x1b  # ESC
    (?:
        \[ [0-?]* [ -/]* [@-~]   # CSI sequences
      | \] .*? (?:\x07|\x1b\\)   # OSC sequences
      | [@-Z\\-_]                # 2-character sequences
    )
    """,
    re.VERBOSE | re.DOTALL,
)


@dataclass
class RunResult:
    argv: List[str]
    returncode: Optional[int]
    stdout: str
    stderr: str
    timed_out: bool


@dataclass
class Finding:
    level: str  # PASS | WARN | FAIL
    title: str
    details: str = ""


def _decode(b: bytes) -> str:
    return b.decode("utf-8", errors="replace")


def run_cmd(
    argv: Sequence[str],
    timeout_s: float,
    env_overrides: Optional[Dict[str, str]] = None,
) -> RunResult:
    env = os.environ.copy()
    if env_overrides:
        env.update(env_overrides)

    try:
        proc = subprocess.run(
            list(argv),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            timeout=timeout_s,
            check=False,
        )
        return RunResult(
            argv=list(argv),
            returncode=proc.returncode,
            stdout=_decode(proc.stdout),
            stderr=_decode(proc.stderr),
            timed_out=False,
        )
    except FileNotFoundError:
        return RunResult(
            argv=list(argv),
            returncode=None,
            stdout="",
            stderr="Command not found.",
            timed_out=False,
        )
    except subprocess.TimeoutExpired as e:
        return RunResult(
            argv=list(argv),
            returncode=None,
            stdout=_decode(e.stdout or b""),
            stderr=_decode(e.stderr or b""),
            timed_out=True,
        )


def has_ansi(s: str) -> bool:
    return bool(ANSI_RE.search(s))


def has_carriage_returns(s: str) -> bool:
    return "\r" in s


def looks_like_help(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["usage:", "\nusage", "synopsis", "options", "commands"])


def find_flag_mentions(help_text: str) -> Dict[str, bool]:
    t = help_text
    flags = {
        "--help": "--help" in t,
        "-h": re.search(r"(^|\s)-h(\s|,|$)", t) is not None,
        "--version": "--version" in t,
        "--json": "--json" in t,
        "--plain": "--plain" in t,
        "--no-color": "--no-color" in t,
        "NO_COLOR": "NO_COLOR" in t,
        "--no-input": "--no-input" in t,
        "--dry-run": "--dry-run" in t,
        "--force": "--force" in t,
        "--quiet": "--quiet" in t or re.search(r"(^|\s)-q(\s|,|$)", t) is not None,
        "--verbose": "--verbose" in t or re.search(r"(^|\s)-v(\s|,|$)", t) is not None,
        "--debug": "--debug" in t or re.search(r"(^|\s)-d(\s|,|$)", t) is not None,
    }
    return flags


def format_findings(findings: List[Finding]) -> str:
    def icon(level: str) -> str:
        return {"PASS": "[PASS]", "WARN": "[WARN]", "FAIL": "[FAIL]"}.get(
            level, "[INFO]"
        )

    lines: List[str] = []
    for f in findings:
        lines.append(f"{icon(f.level)} {f.title}")
        if f.details.strip():
            for line in f.details.rstrip().splitlines():
                lines.append(f"  {line}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(add_help=True)
    parser.add_argument(
        "--timeout",
        type=float,
        default=10.0,
        help="Per-invocation timeout in seconds (default: 10).",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat WARN as FAIL for exit status purposes.",
    )
    parser.add_argument(
        "--print-output",
        action="store_true",
        help="Print captured stdout/stderr for each probe.",
    )
    parser.add_argument(
        "cmd",
        nargs=argparse.REMAINDER,
        help="Command to audit (must be provided after --).",
    )
    args = parser.parse_args()

    if not args.cmd:
        print(
            "Error: no command provided.\n\nUsage:\n  python scripts/cli_audit.py -- <command> [args...]\n",
            file=sys.stderr,
        )
        return 2

    # If user forgot the -- separator, try to recover.
    cmd = args.cmd
    if cmd and cmd[0] == "--":
        cmd = cmd[1:]
    if not cmd:
        print("Error: no command provided after --.", file=sys.stderr)
        return 2

    exe = cmd[0]
    if shutil.which(exe) is None and not os.path.exists(exe):
        print(f"Error: command not found: {exe}", file=sys.stderr)
        return 127

    findings: List[Finding] = []

    # Probe: --help
    help_res = run_cmd(cmd + ["--help"], timeout_s=args.timeout)
    if help_res.timed_out:
        findings.append(
            Finding("FAIL", "--help timed out", "Help should return quickly.")
        )
    elif help_res.returncode is None:
        findings.append(
            Finding(
                "FAIL",
                "--help failed to execute",
                help_res.stderr.strip() or "Unknown error.",
            )
        )
    else:
        if help_res.returncode != 0:
            findings.append(
                Finding(
                    "FAIL",
                    f"--help exit code was {help_res.returncode}",
                    "Help should exit 0.",
                )
            )
        else:
            findings.append(Finding("PASS", "--help exits with code 0"))

        combined = (help_res.stdout + "\n" + help_res.stderr).strip()
        if not combined:
            findings.append(Finding("FAIL", "--help produced no output"))
        else:
            if looks_like_help(combined):
                findings.append(
                    Finding(
                        "PASS",
                        "--help output looks like help (usage/options/commands detected)",
                    )
                )
            else:
                findings.append(
                    Finding(
                        "WARN",
                        "--help output did not obviously look like help",
                        "Check formatting and content.",
                    )
                )

        if help_res.stdout.strip() and not help_res.stderr.strip():
            findings.append(Finding("PASS", "Help printed to stdout"))
        elif help_res.stderr.strip() and not help_res.stdout.strip():
            findings.append(
                Finding(
                    "WARN",
                    "Help printed to stderr",
                    "Common convention is help on stdout; stderr is typically for errors.",
                )
            )
        else:
            findings.append(
                Finding(
                    "WARN",
                    "Help printed to both stdout and stderr",
                    "Prefer help on stdout; reserve stderr for errors/warnings.",
                )
            )

    if args.print_output:
        print("== PROBE: --help ==")
        print("--- stdout ---")
        print(help_res.stdout.rstrip())
        print("--- stderr ---")
        print(help_res.stderr.rstrip())
        print()

    # Probe: -h (recommended, not required)
    h_res = run_cmd(cmd + ["-h"], timeout_s=args.timeout)
    if h_res.timed_out:
        findings.append(
            Finding(
                "WARN", "-h timed out", "If you support -h, it should return quickly."
            )
        )
    elif h_res.returncode == 0 and (h_res.stdout.strip() or h_res.stderr.strip()):
        findings.append(Finding("PASS", "-h works (exit 0)"))
    else:
        findings.append(
            Finding(
                "WARN",
                "-h did not behave like help",
                "If you intentionally use -h for something else, consider avoiding that.",
            )
        )

    # Probe: invalid flag
    bad_flag = "--definitely-not-a-real-flag-xyz"
    bad_res = run_cmd(cmd + [bad_flag], timeout_s=args.timeout)
    if bad_res.timed_out:
        findings.append(
            Finding(
                "FAIL",
                "Invalid-flag probe timed out",
                "Invalid input should fail fast with guidance.",
            )
        )
    elif bad_res.returncode is None:
        findings.append(
            Finding(
                "FAIL",
                "Invalid-flag probe failed to execute",
                bad_res.stderr.strip() or "Unknown error.",
            )
        )
    else:
        if bad_res.returncode == 0:
            findings.append(
                Finding(
                    "FAIL",
                    "Unknown flag returned exit code 0",
                    "Unknown flags should be an error.",
                )
            )
        else:
            findings.append(
                Finding("PASS", f"Unknown flag returns non-zero ({bad_res.returncode})")
            )

        if bad_res.stderr.strip():
            findings.append(Finding("PASS", "Unknown-flag error printed to stderr"))
        else:
            findings.append(
                Finding(
                    "WARN",
                    "Unknown-flag error not printed to stderr",
                    "Prefer errors on stderr.",
                )
            )

        if "--help" in (bad_res.stdout + bad_res.stderr):
            findings.append(Finding("PASS", "Unknown-flag error mentions --help"))
        else:
            findings.append(
                Finding(
                    "WARN",
                    "Unknown-flag error does not mention --help",
                    "Consider adding a hint to discover help.",
                )
            )

        noisy_markers = [
            "Traceback (most recent call last)",
            "panic:",
            "stack trace",
            "Stack trace",
        ]
        if any(m in (bad_res.stdout + bad_res.stderr) for m in noisy_markers):
            findings.append(
                Finding(
                    "WARN",
                    "Error output includes a stack trace marker",
                    "Prefer stack traces only in --debug/--verbose mode.",
                )
            )

    if args.print_output:
        print("== PROBE: invalid flag ==")
        print("--- stdout ---")
        print(bad_res.stdout.rstrip())
        print("--- stderr ---")
        print(bad_res.stderr.rstrip())
        print()

    # Analyze help for common conventions
    help_text = help_res.stdout + "\n" + help_res.stderr
    flag_mentions = find_flag_mentions(help_text)

    if flag_mentions.get("--version"):
        findings.append(Finding("PASS", "Help mentions --version"))
    else:
        findings.append(
            Finding(
                "WARN",
                "Help does not mention --version",
                "Consider supporting --version for discoverability.",
            )
        )

    if flag_mentions.get("--json"):
        findings.append(Finding("PASS", "Help mentions --json"))
    else:
        findings.append(
            Finding(
                "WARN",
                "Help does not mention --json",
                "If scripts may consume output, consider a structured JSON mode.",
            )
        )

    if flag_mentions.get("--plain"):
        findings.append(Finding("PASS", "Help mentions --plain"))
    else:
        findings.append(
            Finding(
                "WARN",
                "Help does not mention --plain",
                "If human output is formatted, a stable plain mode helps scripting.",
            )
        )

    if flag_mentions.get("--no-color") or flag_mentions.get("NO_COLOR"):
        findings.append(
            Finding("PASS", "Help mentions color controls (--no-color and/or NO_COLOR)")
        )
    else:
        findings.append(
            Finding(
                "WARN",
                "Help does not mention color controls",
                "Consider supporting --no-color and NO_COLOR.",
            )
        )

    if flag_mentions.get("--no-input"):
        findings.append(Finding("PASS", "Help mentions --no-input"))
    else:
        findings.append(
            Finding(
                "WARN",
                "Help does not mention --no-input",
                "If you prompt, consider a non-interactive escape hatch.",
            )
        )

    # ANSI / animation checks (captured output is non-TTY)
    if has_ansi(help_res.stdout) or has_ansi(help_res.stderr):
        findings.append(
            Finding(
                "WARN",
                "ANSI escape sequences detected in --help output (captured/non-TTY)",
                "Consider disabling color/formatting when output is not a TTY, or when NO_COLOR is set.",
            )
        )
    else:
        findings.append(
            Finding(
                "PASS", "No ANSI escape sequences detected in captured --help output"
            )
        )

    if has_carriage_returns(help_res.stdout) or has_carriage_returns(help_res.stderr):
        findings.append(
            Finding(
                "WARN",
                "Carriage returns detected in --help output",
                "This can indicate animations/progress behavior; ensure you don't animate when not a TTY.",
            )
        )

    # NO_COLOR / TERM=dumb best-effort probes (only meaningful if the tool would emit ANSI)
    no_color_res = run_cmd(
        cmd + ["--help"], timeout_s=args.timeout, env_overrides={"NO_COLOR": "1"}
    )
    if has_ansi(no_color_res.stdout) or has_ansi(no_color_res.stderr):
        findings.append(
            Finding(
                "WARN",
                "ANSI still present with NO_COLOR=1",
                "Consider honoring NO_COLOR to disable color output.",
            )
        )
    else:
        findings.append(
            Finding("PASS", "NO_COLOR=1 produced no ANSI sequences (best-effort check)")
        )

    dumb_term_res = run_cmd(
        cmd + ["--help"], timeout_s=args.timeout, env_overrides={"TERM": "dumb"}
    )
    if has_ansi(dumb_term_res.stdout) or has_ansi(dumb_term_res.stderr):
        findings.append(
            Finding(
                "WARN",
                "ANSI still present with TERM=dumb",
                "Consider disabling ANSI when TERM=dumb.",
            )
        )
    else:
        findings.append(
            Finding("PASS", "TERM=dumb produced no ANSI sequences (best-effort check)")
        )

    # Summary and exit status
    fail = sum(1 for f in findings if f.level == "FAIL")
    warn = sum(1 for f in findings if f.level == "WARN")

    print(format_findings(findings))
    print(f"Summary: {fail} FAIL, {warn} WARN")

    if fail > 0:
        return 1
    if args.strict and warn > 0:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
