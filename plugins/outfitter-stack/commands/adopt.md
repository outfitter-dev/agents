---
description: Adopt Outfitter Stack patterns in a codebase through a phased workflow
argument-hint: [project path]
allowed-tools: Read Write Edit Glob Grep Bash Skill Task
---

# Adopt Outfitter Stack

Target: $ARGUMENTS

## Steps

1. **Load Skills** — Use Skill tool to load `outfitter:context-management` for task persistence.
2. **Plan** — Delegate to **Plan subagent** with `outfitter-stack:stack-audit` to:
   - Scan codebase for adoption candidates (throws, console, paths, custom errors)
   - Assess scope and effort
   - Generate `.outfitter/adopt/` with audit report and phased plan
   - Return implementation strategy
3. **Execute** — Delegate phases to `outfitter-stack:stacker`:
   - `outfitter-stack:stack-templates` — Scaffold context, logger, dependencies
   - `outfitter:tdd` + `outfitter-stack:stack-patterns` — TDD handler conversions
   - `outfitter-stack:stack-templates` — Wire CLI/MCP transport layers
   - `outfitter-stack:stack-review` — Verify compliance
4. **Persist** — Update Tasks throughout with progress and decisions.
5. **Feedback** — If issues discovered, delegate to `outfitter-stack:stacker` with `outfitter-stack:stack-feedback`.

Proceed without interrupting the user, unless necessary.
