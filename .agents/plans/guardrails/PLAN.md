# Guardrails Plugin Plan

A Claude Code plugin for code quality enforcement with progressive enhancement: zero-dependency simple guards that compile to Claude hooks, with optional ast-grep/semgrep integration for structural pattern matching.

---

## Overview

**Problem:** Recurring code patterns, anti-patterns, and style violations slip through because enforcement happens too late (CI) or not at all.

**Solution:** Guardrails brings lint-style enforcement into the Claude Code agent loop via:
- **Guards** — Markdown files with YAML frontmatter defining patterns to catch (like hookify)
- **Progressive enhancement** — Simple regex guards work without dependencies; ast-grep guards add structural precision
- **Hooks** — Bun/TypeScript handlers that run guards on tool events (Edit, Write, Bash)
- **Guardian agent** — Orchestrates skills for guard authoring, analysis, and management
- **Skills** — Focused capabilities for creating, analyzing, and managing guards

### Design Principles

1. **Zero-dependency by default** — Simple guards use regex, compile to Claude hooks, no external tools required
2. **Progressive enhancement** — ast-grep/semgrep available for structural matching when installed
3. **Markdown-first** — Guards are readable markdown files with YAML frontmatter (hookify pattern)
4. **Graceful degradation** — If ast-grep unavailable, fall back to simple regex matching
5. **Performance-first** — Diff-scoped evaluation, cached patterns, fast-fail budget from day one
6. **Test-driven guards** — Unified test runner ships early; guards are validated before deployment
7. **Clean seams** — Core engine (loader → evaluator → reporter) decoupled from Claude integration

---

## Architecture

### Directory Structure (Plugin)

```
guardrails/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── agents/
│   └── guardian.md              # Main orchestrating agent
├── commands/
│   ├── guardrails.md            # Main entry point: /guardrails
│   ├── guardrails-list.md       # /guardrails:list
│   └── guardrails-help.md       # /guardrails:help
├── skills/
│   ├── index.md                 # Skill manifest (loaded into context)
│   ├── create-guard/
│   │   ├── SKILL.md
│   │   ├── reference.md
│   │   └── examples/
│   ├── analyze/
│   │   ├── SKILL.md
│   │   └── reference.md
│   ├── modify-guards/
│   │   └── SKILL.md
│   ├── explain-guard/
│   │   └── SKILL.md
│   ├── import-guards/
│   │   └── SKILL.md
│   └── antipattern-check/
│       ├── SKILL.md
│       └── antipatterns.md
├── hooks/
│   ├── pre-tool-use.ts          # Runs guards before Edit/Write/Bash
│   ├── post-tool-use.ts         # Runs guards after tool completion
│   └── lib/
│       ├── runner.ts            # ast-grep execution via Bun shell
│       ├── config.ts            # Load .guardrails/config.ts
│       └── reporter.ts          # Format violations for Claude context
├── templates/
│   ├── guard-typescript.md      # Starter guard for TS projects
│   ├── guard-security.md        # Common security patterns
│   └── guard-console-log.md     # Example: no console.log
└── README.md
```

### Project Structure (When Installed)

Users get a `.guardrails/` directory in their project root:

```
.guardrails/
├── config.ts                    # Guardrails hook config (Bun/TS)
├── guards/
│   ├── no-console-log.md        # Markdown guard files with YAML frontmatter
│   ├── no-eval.md
│   └── require-error-handling.md
├── tests/                       # Unified test fixtures
│   └── no-console-log.test.yml
├── .generated/                  # Derived artifacts (gitignored)
│   ├── hooks.json               # Compiled Claude hooks
│   ├── sgconfig.yml             # Generated ast-grep config
│   └── cache/                   # Compiled patterns for performance
└── .gitignore                   # Ignores .generated/
```

**Key insight:** `.generated/` contains derived artifacts that are rebuilt from guards + config. This avoids multi-agent conflicts and keeps source of truth clear.

---

## Core Components

### 1. Guards (Markdown with YAML Frontmatter)

Guards are markdown files with YAML frontmatter, following the hookify pattern. They support **progressive enhancement**: simple regex guards work without dependencies, ast-grep adds structural precision.

#### Basic Guard (Simple Mode)

```markdown
---
formatVersion: 1
id: no-console-log
enabled: true
severity: warning
action: warn
paths:
  include: ["src/**/*.ts", "src/**/*.tsx"]
  exclude: ["**/*.test.ts", "**/fixtures/**"]
simple:
  event: file
  pattern: console\.log\(
---

**Console.log detected!**

Use the structured logger from `@/lib/logger` instead.

**Why this matters:**
- Production observability
- Structured log aggregation
- Level-based filtering
```

#### Enhanced Guard (Progressive Enhancement)

When ast-grep is available, include the `ast-grep` section for structural matching:

```markdown
---
formatVersion: 1
id: no-console-log
enabled: true
severity: warning
action: warn
paths:
  include: ["src/**/*.ts", "src/**/*.tsx"]
  exclude: ["**/*.test.ts"]
simple:
  event: file
  pattern: console\.log\(
ast-grep:
  language: TypeScript
  rule:
    pattern: console.log($$$ARGS)
---

**Console.log detected!**

Use the structured logger from `@/lib/logger` instead.

**Why this matters:**
- Production observability
- Structured log aggregation
- Level-based filtering
```

#### Guard Schema Fields

| Field | Required | Description |
|-------|----------|-------------|
| `formatVersion` | Yes | Schema version (start at 1, additive evolution) |
| `id` | Yes | Unique identifier (kebab-case) |
| `enabled` | Yes | Whether guard is active |
| `severity` | Yes | `hint` \| `warning` \| `error` |
| `action` | Yes | `warn` (allow) \| `block` (prevent) |
| `paths.include` | No | Glob patterns for files to check |
| `paths.exclude` | No | Glob patterns to skip |
| `simple` | No* | Regex-based matching config |
| `ast-grep` | No* | Structural matching config |

*At least one of `simple` or `ast-grep` required.

#### Guard Resolution Order

1. If ast-grep is available AND `ast-grep` section exists → use ast-grep
2. Otherwise → use `simple` regex matching
3. If neither → guard is invalid

**Why Markdown:**
- Rich message body (not crammed into YAML string)
- Self-documenting, readable
- Familiar pattern from hookify
- Easy to author and maintain

**Why Progressive Enhancement:**
- Zero-dependency by default
- Works in any environment
- Structural precision when tools available
- Graceful degradation

### 2. Hooks (Bun/TypeScript)

Hooks are TypeScript files executed by Bun with native shell integration:

```typescript
// hooks/pre-tool-use.ts
import { $ } from "bun";
import { loadConfig } from "./lib/config";
import { runGuards } from "./lib/runner";
import { formatViolations } from "./lib/reporter";

interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
}

const input: HookInput = await Bun.stdin.json();

// Only run on file-modifying tools
if (!["Edit", "Write", "MultiEdit"].includes(input.tool_name)) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

const config = await loadConfig();
const violations = await runGuards(input, config);

if (violations.length > 0) {
  const action = config.defaultAction ?? "warn";
  console.log(JSON.stringify({
    continue: action === "warn",
    message: formatViolations(violations),
  }));
} else {
  console.log(JSON.stringify({ continue: true }));
}
```

**Why Bun/TypeScript:**
- Fast startup (~25ms)
- Type-safe orchestration
- Native shell integration (no subprocess overhead)
- Matches user's stack preferences
- Easy ast-grep CLI invocation via `$\`ast-grep scan ...\``

### 3. Core Engine Architecture

The engine uses clean seams for testability and future portability (CI, other tools):

```
┌─────────────────────────────────────────────────────────────────┐
│                         Core Engine                              │
├─────────────────────────────────────────────────────────────────┤
│  loadGuards(dir)     →  evaluate(guards, diff)  →  report(violations)  │
│       ↓                        ↓                        ↓        │
│  Parse frontmatter      Simple regex OR         Format for       │
│  + body, validate       ast-grep adapter        Claude context   │
│  schema, cache                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                    Hook entrypoints call engine
```

**Key functions (pure, no Bun globals):**

```typescript
// core/loader.ts
interface Guard { id: string; formatVersion: number; /* ... */ }
function loadGuards(guardsDir: string): Promise<Guard[]>
function validateGuard(guard: unknown): ValidationResult

// core/evaluator.ts
interface Violation { guardId: string; file: string; line: number; message: string }
function evaluate(guards: Guard[], files: FileChange[]): Promise<Violation[]>

// core/reporter.ts
function formatViolations(violations: Violation[], format: 'claude' | 'json' | 'pretty'): string
```

**Why clean seams:**
- Testable without Claude/Bun dependencies
- Portable to CI runners later
- Easy to swap adapters (simple ↔ ast-grep ↔ semgrep)

### 4. Config (TypeScript)

```typescript
// .guardrails/config.ts
import type { GuardrailsConfig } from "guardrails";

export default {
  // Which guards are enabled (glob patterns)
  guards: {
    include: ["**/*.md"],
    exclude: ["**/disabled/**"],
  },

  // Default action when guard triggers
  defaultAction: "warn", // "warn" | "block"

  // Per-guard overrides
  overrides: {
    "no-eval": { action: "block" },
    "no-console-log": { action: "warn" },
  },

  // Hook triggers
  hooks: {
    preToolUse: {
      enabled: true,
      tools: ["Edit", "Write", "MultiEdit"],
    },
    postToolUse: {
      enabled: false,
    },
  },
} satisfies GuardrailsConfig;
```

### 5. Claude Hook Compilation (Simple Guards)

Simple guards can be compiled directly to Claude hooks for zero-dependency enforcement. This is useful for:
- Projects without ast-grep installed
- Single-agent workflows where Claude hooks work natively
- Sharing guards that "just work" anywhere

#### Merge Strategy (Namespaced Blocks)

To avoid clobbering existing hooks, we use a **namespaced approach**:

1. Read existing `.claude/settings.local.json`
2. Find or create `guardrails` block in hooks
3. Replace only our block, preserve everything else
4. Include checksum header to detect manual edits

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "_guardrails": {
          "version": "1.0.0",
          "checksum": "abc123",
          "generatedAt": "2024-01-15T10:00:00Z"
        },
        "matcher": { "tool_name": ["Edit", "Write", "MultiEdit"] },
        "hooks": [
          {
            "type": "command",
            "command": "bun run .guardrails/.generated/enforce.ts"
          }
        ]
      }
    ]
  }
}
```

**Rules:**
- Only touch hooks with `_guardrails` marker
- Warn if checksum mismatch (manual edits detected)
- Never do "intelligent merge" — too fragile

#### Lite Mode (True Zero-Dependency)

For environments without Bun, emit pure JSON matchers for simple regex guards:

```json
{
  "_guardrails": { "mode": "lite", "version": "1.0.0" },
  "matcher": {
    "tool_name": ["Edit", "Write"],
    "input_pattern": "console\\.log\\("
  },
  "action": "warn",
  "message": "Console.log detected. Use logger instead."
}
```

**Limitations of lite mode:**
- Regex only (no ast-grep)
- No path filtering
- Limited message formatting

### 6. Unified Test Runner

Guards need testing from Day 1. The test runner supports both simple and ast-grep modes.

#### Test File Format

```yaml
# .guardrails/tests/no-console-log.test.yml
guard: no-console-log
cases:
  - name: "matches console.log call"
    mode: auto  # runs both simple + ast-grep, flags divergence
    code: |
      console.log("hello");
    expect: match

  - name: "ignores console.error"
    code: |
      console.error("oops");
    expect: no-match

  - name: "matches in function"
    code: |
      function foo() {
        console.log("debug");
      }
    expect: match
    line: 2  # optional: assert specific line
```

#### Running Tests

```bash
/guardrails:test                    # Run all tests
/guardrails:test no-console-log     # Run specific guard's tests
/guardrails:test --divergence       # Check simple vs ast-grep parity
```

**Divergence detection:** When `mode: auto`, run both simple regex and ast-grep (if available) and report mismatches. This catches when patterns drift apart.

### 7. Guardian Agent

The orchestrating agent that dispatches to skills:

```markdown
---
name: guardian
description: >
  Orchestrates guardrails skills for code quality enforcement.
  Use when creating, analyzing, or managing ast-grep guards.
tools: [Read, Write, Grep, Glob, Bash, Task, Skill, AskUserQuestion, TodoWrite]
model: inherit
---

You are the Guardian, an expert in code quality enforcement via ast-grep guards.

## Skill Dispatch

You have access to these skills (loaded via skills/index.md):
- **create-guard**: Author new guards with guided workflow
- **analyze**: Discover patterns (default) or audit paths
- **modify-guards**: Enable/disable/edit existing guards
- **explain-guard**: Explain what a guard does and why
- **import-guards**: Pull guards from community registries
- **antipattern-check**: Validate guards against antipatterns

## Dispatch Logic

1. Parse user intent from request
2. If `--skill <name>` specified, use that skill explicitly
3. Otherwise, use LLM judgment to select appropriate skill(s)
4. Invoke skill via Skill tool
5. Report results and suggest next actions

...
```

### 8. Skills

#### create-guard

Guided workflow for authoring new guards:

1. Clarify intent (what pattern to catch, why)
2. Collect examples (positive/negative from codebase)
3. Draft minimal guard with both `simple` and `ast-grep` sections
4. Run `guardrails:test` to validate
5. Refine until FP/FN are acceptable
6. Save to `.guardrails/guards/`

#### analyze

Context-aware analysis skill with concrete heuristics:

**Discovery Mode (no args / diff context):**

| Signal | How to detect | Weight |
|--------|---------------|--------|
| Repeated manual edits | Scan last 50 git commits for same before→after pattern | High |
| TODO/FIXME markers | Grep for `TODO lint`, `TODO guard`, `TODO ban`, `FIXME avoid` | High |
| Risky primitives | Count `eval(`, `innerHTML`, `dangerouslySetInnerHTML`, `exec(` per KLOC | Medium |
| Suppression clusters | Find files with `// eslint-disable`, `// @ts-ignore`, cluster by reason | Medium |
| Review hints | Parse recent commit messages for "please avoid", "should be a lint" | Low |

**Scoring:** `frequency × severity_weight`

**Output:** Top 5 candidates with:
- One-line rationale
- Suggested guard template (pre-filled `simple.pattern`)
- Estimated match count from sampling

**Audit Mode (with path arg):**
- Run all enabled guards against target
- Report violations with file:line links
- Suggest fixes where `fix` field exists
- Show "top offenders" summary

#### modify-guards

Manage existing guards:

- Enable/disable guards (update config.ts overrides)
- Edit guard YAML (refine patterns, messages)
- Delete guards
- Bulk operations (enable all security guards, etc.)

#### explain-guard

Documentation and understanding:

- Parse guard YAML and explain in plain English
- Show what code would match vs not match
- Explain why the guard exists (from `note` field)
- Link to related documentation

#### import-guards

Pull from external sources:

- Semgrep registry (security rules)
- ast-grep community rules
- Convert between formats if needed
- Validate before saving

#### antipattern-check

Quality gate for guards themselves:

- Check against documented antipatterns (too broad, too specific, etc.)
- Validate YAML syntax
- Test for false positive rate
- Suggest improvements

---

## Commands

### /guardrails

Main entry point (like hookify):

```markdown
---
description: Create, analyze, and manage code quality guards
argument-hint: [instruction] or --skill <name>
allowed-tools: [Read, Write, Grep, Glob, Bash, Task, Skill, AskUserQuestion, TodoWrite]
---

# /guardrails

## Pre-load Context

!cat ${PLUGIN_ROOT}/skills/index.md

## Dispatch

If $ARGUMENTS contains `--skill <name>`:
  → Invoke that skill explicitly

If $ARGUMENTS is empty:
  → Run `analyze` skill in discovery mode (mine for guard opportunities)

If $ARGUMENTS contains instruction:
  → Parse intent and dispatch to appropriate skill via Guardian agent
```

### /guardrails:list

Show all guards and their status:

```markdown
---
description: List all guards and their enabled/disabled status
---

# /guardrails:list

1. Read .guardrails/config.ts for overrides
2. Glob .guardrails/guards/**/*.md
3. For each guard, show:
   - ID
   - Severity
   - Mode (simple / ast-grep / both)
   - Enabled/disabled
   - Brief message (first line of body)
4. Summarize: N guards (M enabled, K disabled)
```

### /guardrails:sync

Compile simple guards to Claude hooks:

```markdown
---
description: Compile simple guards to Claude hooks for zero-dependency enforcement
---

# /guardrails:sync

1. Glob .guardrails/guards/**/*.md
2. Parse each guard's `simple` section
3. Generate Claude hook configuration
4. Write to .claude/settings.local.json
5. Report: N guards synced to Claude hooks

**Options:**
- `--dry-run` - Show what would be synced without writing
- `--force` - Overwrite existing hooks
```

### /guardrails:test

Run guard tests:

```markdown
---
description: Run guard tests and check for divergence between simple/ast-grep modes
---

# /guardrails:test

1. Glob .guardrails/tests/**/*.test.yml
2. For each test file:
   - Load referenced guard
   - Run each test case
   - Compare expected vs actual
3. Report: passed/failed/skipped
4. If `--divergence`: run both modes, flag mismatches

**Options:**
- `<guard-id>` - Test specific guard only
- `--divergence` - Check simple vs ast-grep parity
- `--verbose` - Show match details
```

### /guardrails:help

Quick reference:

```markdown
---
description: Show guardrails help and available skills
---

# Guardrails Help

## Commands
- `/guardrails` - Analyze for guard opportunities or create from instruction
- `/guardrails:list` - Show all guards
- `/guardrails:sync` - Compile simple guards to Claude hooks
- `/guardrails:help` - This help

## Skills
- `create-guard` - Author new guards
- `analyze` - Discover patterns or audit code
- `modify-guards` - Enable/disable/edit guards
- `explain-guard` - Understand a guard
- `import-guards` - Pull from registries
- `antipattern-check` - Validate guard quality

## Quick Start
1. Run `/guardrails` to discover patterns worth guarding
2. Create guards with `/guardrails create a guard for X`
3. List guards with `/guardrails:list`
4. Sync to Claude hooks with `/guardrails:sync` (optional, for zero-dependency enforcement)
5. Guards auto-enforce via hooks on Edit/Write
```

---

## Implementation Phases

**Philosophy:** Surface risk early. Test runner before hooks. Performance built in, not bolted on.

### Phase 1: Core Engine + Tests (Week 1)
- [ ] Guard loader/parser with schema validation (`formatVersion`, required fields)
- [ ] Unified test runner (`/guardrails:test`) — proves API shape
- [ ] Simple evaluator (regex, path filters)
- [ ] Fixture-based validation of loader + evaluator
- [ ] JSON Schema for guard format

**Exit criteria:** Can load guards, run tests, see pass/fail.

### Phase 2: Hook Integration (Week 2)
- [ ] PreToolUse hook entrypoint with diff-scoping
- [ ] Guard caching (load once per session)
- [ ] Violation reporter (Claude-formatted messages)
- [ ] `/guardrails:sync` with namespaced merge strategy
- [ ] Basic `create-guard` skill

**Exit criteria:** Guards enforce on Edit/Write in real sessions.

### Phase 3: ast-grep Layer (Week 3)
- [ ] ast-grep adapter in evaluator
- [ ] Guard resolution order (ast-grep → simple fallback)
- [ ] Divergence detection in test runner
- [ ] `.generated/sgconfig.yml` for CLI usage

**Exit criteria:** ast-grep patterns work, divergence flagged.

### Phase 4: Skills + UX (Week 4)
- [ ] `analyze` skill with heuristics
- [ ] `modify-guards` skill
- [ ] `explain-guard` skill
- [ ] Skill manifest (`skills/index.md`)
- [ ] Template guards library

**Exit criteria:** Full skill suite usable.

### Phase 5: Polish + Docs
- [ ] `antipattern-check` skill
- [ ] PostToolUse hooks (optional, diff-scoped)
- [ ] Performance profiling (`--profile` flag)
- [ ] Documentation and examples
- [ ] README with quick start

### Phase 6: Advanced (Deferred)
- [ ] `import-guards` skill (semgrep registry)
- [ ] Inline suppression (`// guardrails-disable`)
- [ ] Severity escalation
- [ ] CI integration guidance
- [ ] Metrics/telemetry

---

## v1 Scope (What to Ship vs. Defer)

### Ship in v1
| Feature | Why |
|---------|-----|
| Guard loader + schema validation | Foundation |
| Simple regex evaluator | Zero-dep story |
| Unified test runner | Quality from day 1 |
| PreToolUse hooks | Core enforcement |
| `/guardrails:sync` | Claude hook compilation |
| ast-grep adapter | Progressive enhancement |
| `create-guard`, `analyze`, `modify-guards`, `explain-guard` | Essential skills |
| Template guards | Quick start |

### Defer to v1.1+
| Feature | Why defer |
|---------|-----------|
| Semgrep import/registry | Mapping nuances will soak time |
| Advanced analyze (reviews/TODOs) | Ship manual `analyze path` first |
| PostToolUse hooks | Add once pre-tool + diff-scoping is solid |
| Inline suppression | Nice-to-have, not critical |
| File locking | `.generated/` + gitignore handles 95% |
| Severity escalation | Needs usage data first |

**Core value prop preserved:** Author guards, run in hooks, test locally, optionally ast-grep for precision.

---

## Risk Assessment

### Biggest Technical Risk

**Risk:** Performance/latency of running guards on each tool call, especially with ast-grep, leading to user disablement.

**Mitigations:**
1. **Diff-scoped evaluation** — Only check files being touched, not full repo
2. **Guard caching** — Load and compile patterns once per session
3. **Fast-fail budget** — Cap at 300ms; remaining guards downgrade to warn
4. **Path filtering** — Skip guards whose `paths.include` don't match
5. **`--profile` mode** — Surface slow guards so authors can refine patterns

### Secondary Risks

| Risk | Mitigation |
|------|------------|
| Regex guards produce noisy false positives | Mandate ast-grep stub in templates; divergence tests |
| Multi-agent conflicts on settings.local.json | Generated artifacts in `.generated/`; warn if locked |
| Schema evolution breaks existing guards | `formatVersion` + `guardrails migrate` command |
| Users don't write tests | Test runner ships Day 1; templates include test stubs |

---

## Open Questions (Deferred)

### Resolved in This Plan
| Question | Resolution |
|----------|------------|
| Multi-agent coordination | `.generated/` directory + gitignore; treat as derived |
| Schema evolution | `formatVersion` field + `guardrails migrate` command |
| Test format | Unified YAML with `mode: auto` for divergence detection |
| Hook merge strategy | Namespaced blocks with checksum, only touch our marker |

### Still Open
1. **Semgrep integration depth** — Full parity or ast-grep primary with semgrep import?
2. **Guard inheritance** — Can projects extend/override plugin-provided guards?
3. **Severity escalation** — Should repeated violations escalate from warn to block?
4. **Metrics/telemetry** — Track which guards fire most often? Privacy implications?
5. **Auto-sync on save** — Should `/guardrails:sync` run automatically when guards change?
6. **Provider interface** — Should evaluator expose plugin interface for future engines (Tree-sitter, WASI)?
7. **Sandbox for hooks** — Document safe subset (no network, no fs writes) or sandbox the runner?

---

## References

- [ast-grep documentation](https://ast-grep.github.io/)
- [ast-grep AI prompting guide](https://ast-grep.github.io/advanced/prompting.html)
- [Hookify plugin](https://github.com/anthropics/claude-code/tree/main/plugins/hookify) — Pattern inspiration
- [Claude Code plugins reference](https://docs.anthropic.com/en/docs/claude-code/plugins)
