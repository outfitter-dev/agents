# Agent use of AST-GREP

1. A mental model: how Skills, subagents, and slash commands should play together.
2. A **copy‑pasteable blueprint**: directory layout + concrete file contents for:

   * an `ast-grep-lint` Skill
   * a `lint-rulemaker` subagent
   * a `/create-lint-rule` slash command
3. A minimal plugin skeleton in case you want to ship this to a marketplace later.

You can literally drop these into `.claude/` (or a plugin repo) and tweak paths/names.

---

## 1. Quick context: what “good” Skills + commands look like in Claude Code

Very compressed version of the docs:

* **Skills**

  * Live in `.claude/skills/<skill-name>/SKILL.md` (project) or `~/.claude/skills/<skill-name>/SKILL.md` (personal). ([Claude Code][1])
  * `SKILL.md` starts with YAML frontmatter: at least `name` and `description`. ([Claude Code][1])
  * Can include extra files: `reference.md`, `examples.md`, `scripts/*`, etc. ([Claude Code][1])
  * Are **model‑invoked**: Claude decides when to use them based on the description.

* **Subagents**

  * Live in `.claude/agents/*.md` or `~/.claude/agents/*.md`, with YAML frontmatter (`name`, `description`, `tools`, `model`). ([Claude Code][2])
  * Each subagent has its **own context window** and tool permissions, so you can keep a long‑running “lint specialist” around.

* **Slash commands**

  * Plain Markdown files in `.claude/commands/*.md` or `~/.claude/commands/*.md`. ([Claude Code][3])
  * You trigger them with `/create-lint-rule ...`.
  * They support:

    * `$ARGUMENTS` / `$1`, `$2` placeholders
    * **Bash pre‑execution** via `!` lines, gated by `allowed-tools` in frontmatter ([Claude Code][3])
    * file references with `@path/to/file` ([Claude Code][3])
    * metadata in frontmatter: `description`, `argument-hint`, `model`, `allowed-tools`, `disable-model-invocation`, etc. ([Claude Code][3])
  * The `SlashCommand` tool lets Claude call your custom commands programmatically when you reference `/create-lint-rule` in instructions. ([Claude Code][3])

* **Plugins**

  * Bundle **commands**, **agents**, **skills**, **hooks**, and MCP servers into a single installable unit. ([Claude Code][4])
  * Standard layout has `.claude-plugin/plugin.json`, plus `commands/`, `agents/`, `skills/`, `hooks/`. ([Claude Code][4])

And separately, **ast-grep**:

* Project structure:

  * `sgconfig.yml` at project root
  * a rules directory (usually `rules/`) for lint rules. ([ast-grep.github.io][5])
* Core CLI:

  * `ast-grep scan` — run all rules
  * `ast-grep new rule` / `ast-grep new test` — scaffold rules/tests ([ast-grep.github.io][6])
* Lint rule YAML structure (simplified):

  ````yaml
  id: no-await-in-loop
  language: TypeScript
  rule:
    pattern: await $_
    inside:
      any:
        - kind: for_in_statement
        - kind: while_statement
  message: "Don't await inside loops"
  severity: warning
  note: |
    Longer explanation...
  ``` :contentReference[oaicite:13]{index=13}  
  ````

There is *already* an “ast-grep Code Search” Skill that teaches Claude how to write and use ast-grep rules for structural search. ([ast-grep.github.io][7])
We’re building a **companion Skill + workflow** that’s specifically focused on **lint rules as an alignment layer**: how to **discover patterns**, **codify them**, and **wire them into CI**.

---

## 2. High‑level architecture for your ast‑grep stack

Let’s name the pieces:

* **Skill**: `ast-grep-lint`

  * Teaches Claude:

    * Your project’s `sgconfig.yml` + `rules/` conventions
    * A step‑by‑step workflow to design, test, and roll out lint rules
    * How to spot “lint gaps” (places where a new rule would help)

* **Subagent**: `lint-rulemaker`

  * Lives in `.claude/agents/lint-rulemaker.md`
  * Tools: `Read`, `Write`, `Grep`, `Glob`, `Bash`
  * Responsible for:

    * Mining diffs / code review comments / TODOs for candidate anti‑patterns
    * Following a multi‑step ast‑grep rule generation flow (inspired by ast‑grep’s own AI docs) ([ast-grep.github.io][7])
    * Writing/updating rule YAML + tests

* **Slash command**: `/create-lint-rule`

  * Project‑scoped: `.claude/commands/create-lint-rule.md`
  * Features:

    * `argument-hint` and `$ARGUMENTS` for quick usage
    * `allowed-tools: Bash(ast-grep:*), Bash(git diff:*), Bash(git status:*)` for safe automation
    * Uses `!` Bash pre‑execution to pull in diffs, git status, etc. ([Claude Code][3])
    * Tells Claude to delegate to the `lint-rulemaker` subagent.

* **Optional plugin**: `ast-grep-lint-plugin`

  * You publish this layout:

    * `commands/create-lint-rule.md`
    * `agents/lint-rulemaker.md`
    * `skills/ast-grep-lint/SKILL.md`
    * `.claude-plugin/plugin.json`

The **DRY principle** here:

* All **deep ast-grep knowledge** lives in the Skill (`SKILL.md` + `reference.md` + `examples.md`).
* The **subagent** just says “you are the specialist; follow the process described in the Skill”.
* The **slash command** is a thin “trigger & context collector” around the subagent.

---

## 3. Directory layout you can drop into a repo

Project‑level layout (works in CLI & Claude Code on the web once the repo is connected): ([Claude Code][1])

```text
.claude/
  skills/
    ast-grep-lint/
      SKILL.md
      reference.md
      examples.md
      resources/
        ast-grep-llms.txt     # optional: downloaded from ast-grep docs
      scripts/
        find-lint-gaps.py     # optional helper
        rule-scaffold.sh      # optional helper
  agents/
    lint-rulemaker.md
  commands/
    create-lint-rule.md
    scan-with-ast-grep.md     # optional extra command
```

You’ll also want the usual ast-grep bits in the repo root:

```text
sgconfig.yml
rules/
  # rule YAML files live here
tests/
  # ast-grep test YAMLs live here, if you use them
```

Now let’s fill the important files.

---

## 4. `ast-grep-lint` Skill (`.claude/skills/ast-grep-lint/SKILL.md`)

This is the “brain” of the system.

```markdown
---
name: ast-grep-lint
description: >
  Design, maintain, and apply ast-grep lint rules for this codebase.
  Use this Skill whenever you are reasoning about repeating code patterns,
  code review feedback, or opportunities to turn manual fixes into automated lint rules.
allowed-tools: Read, Grep, Glob, Bash, Write
---

# ast-grep Lint Skill

## Purpose

You are an expert assistant for **ast-grep lint rules**.

Your job when this Skill is active:

1. Recognize when a recurring pattern or bug should become a lint rule.
2. Design and refine ast-grep lint rules and their tests.
3. Keep rule IDs, locations, and severity consistent with this project’s conventions.
4. Help wire new rules into CI and local workflows.

You MUST prefer ast-grep’s documented syntax and workflows over inventing your own.
When unsure, consult the project’s ast-grep documentation files and `reference.md`.

---

## Project conventions

Assume the following by default (update this section if your project is different):

- Project root contains:
  - `sgconfig.yml` — ast-grep project config.
  - `rules/` — directory holding lint rule YAML files.
  - `tests/` — directory holding test YAML files for rules, if present.

When reasoning about configuration:

- Treat `sgconfig.yml` as the single source of truth for:
  - which directories are scanned,
  - which `rule_dirs` and `test_dirs` exist.  
- If `sgconfig.yml` or `rules/` are missing, propose creating them and outline a minimal configuration.

---

## Core workflow for creating a new lint rule

When asked to create or update an ast-grep lint rule, follow this structured loop
(adapted from ast-grep’s own AI guidance and rule workflow): :contentReference[oaicite:18]{index=18}  

1. **Clarify the intent**

   - Restate the goal in one sentence, e.g.:
     - “Flag any async function that lacks error handling.”
     - “Prevent raw `fetch` calls outside `api/`.”
   - Identify:
     - The **language(s)** involved.
     - Whether this is **pure detection** or should include **automatic fixes**.

2. **Collect concrete examples**

   - Use `Grep`/`Glob`/`Read` to gather:
     - At least 2–3 **positive examples** (code that SHOULD match).
     - At least 2–3 **negative examples** (similar code that SHOULD NOT match).
   - If examples aren’t in the repo yet, synthesize small inline snippets.

3. **Sketch a minimal rule**

   - Start from a simple rule using:
     - `id`
     - `language`
     - `rule.pattern` / `rule.kind` / `rule.inside` / `rule.has` etc.
     - `message`, `severity`, and optionally `note`.
   - Prefer small, composable patterns over deeply nested ones.
   - Use `constraints` when narrowing specific meta-variables makes the rule clearer.

4. **Test the rule**

   - If the project uses `tests/`:
     - Create a test YAML for the rule with the positive/negative examples.
     - Run `ast-grep test` via Bash if allowed, or at least suggest the command.
   - Otherwise:
     - Use `ast-grep scan` or `ast-grep run` on the repo or a subset of files and
       verify that:
       - All positive examples are matched.
       - No obvious false positives appear.

5. **Refine**

   - Iterate on `rule`, `constraints`, and optional `fix` until:
     - The rule matches exactly the intended pattern.
     - False positives are acceptably low.
   - When you adjust the rule, update or expand test cases accordingly.

6. **Finalize**

   - Ensure:
     - `id` is unique and follows the project’s naming style (e.g. `no-console-log-in-src`).
     - `message` is concise and user-facing.
     - `note` (if present) is actionable and explains the rationale.
   - Place the rule file in `rules/<category>/<id>.yml` if the project uses categories,
     otherwise `rules/<id>.yml`.
   - Suggest adding or updating CI to run `ast-grep scan --config sgconfig.yml` on PRs.

---

## Detecting where a new rule would help (lint gap analysis)

When asked to “find lint rule opportunities” or similar:

1. **Scan recent changes**

   - Use Git via Bash (when allowed in the calling context) to:
     - Inspect `git diff` for the current branch.
     - Look for repeated manual changes with similar patterns.
   - When direct Git access is not granted, infer from the files you can see.

2. **Mine review feedback and TODOs**

   - Search for:
     - `TODO lint`, `TODO rule`, `TODO ast-grep`, and similar tags.
     - Comments in code or docs that say things like:
       - “we keep forgetting to…”
       - “this should really be enforced by tooling”
   - Propose rules for any pattern that keeps reappearing in comments.

3. **Look for architecture or style invariants**

   Consider rules that enforce:

   - Module boundaries:
     - e.g., “only `foo/*` can import from `bar/core/*`”.
   - Logging conventions:
     - e.g., “no `console.log` in `src/`, use `logger` instead”.
   - Error handling:
     - e.g., “any call to `service.doX` must be wrapped in `try/catch` with `handleError`”.

4. **Prioritize**

   Rank candidate rules by:

   - Frequency of manual correction.
   - Severity of impact when violated (bugs, security, performance).
   - Ease of expressing them in ast-grep.

Produce a short report like:

- **High impact** (implement now)
- **Medium impact** (good candidates)
- **Low impact** (nice-to-haves)

---

## Using scripts and resources

If the `resources/ast-grep-llms.txt` file exists (downloaded from ast-grep’s “llms-full” docs), you may:

- Use `Read` to load relevant sections into context when you need precise syntax.
- Avoid rephrasing that file; quote only small pieces as needed. :contentReference[oaicite:19]{index=19}  

If `scripts/` contains helper scripts (documented in `reference.md`), you may:

- Call them via Bash, following the documented usage.
- Avoid inventing new script names or flags.

---

## When to ask for `/create-lint-rule`

When you are acting as the main Claude Code agent (not a subagent), and you notice:

- A recurring pattern that is clearly lintable, or
- The user explicitly says “this should be a lint rule” or “let’s make a rule for this”,

then either:

- Directly design the rule following this Skill, or  
- Ask the user to run `/create-lint-rule` with a short description of the rule they want.

Prefer `/create-lint-rule` when:

- Multiple files, diffs, or examples are involved.
- You want a focused `lint-rulemaker` subagent with its own context window to own the job.
```

You’ll want to lightly edit the **“Project conventions”** section for your repo (rule dir name, test dir name, etc.), but otherwise this is drop‑in.

---

## 5. `reference.md` and `examples.md` (supporting files)

These are optional but make the Skill much more “teachable” to agents and humans.

### `.claude/skills/ast-grep-lint/reference.md`

```markdown
# ast-grep Lint Quick Reference

This file summarizes the key ast-grep concepts used in this project.
For full details, see the official ast-grep docs and llms reference.

## Common fields in lint rules

- `id`: Unique identifier for the rule (kebab-case).
- `language`: Language name as used by ast-grep (e.g. `TypeScript`, `Rust`).
- `rule`: Core structural pattern to match, using:
  - `pattern`: Code-like pattern with meta-variables.
  - `kind`: Optional node kind filter.
  - `inside` / `has` / `any` / `all` / `not`: Structural composition primitives.
- `constraints`: Extra filters on meta-variables (e.g. restrict kind or text).
- `message`: Short, user-facing error message.
- `severity`: One of `hint`, `info`, `warning`, or `error`.
- `note`: Longer explanation and remediation guidance.
- `fix`: Optional replacement template for automated fixes.

## CLI commands we rely on

- `ast-grep scan --config sgconfig.yml`
  - Run all configured rules over the project.
- `ast-grep new rule --name <id> --lang <Language>`
  - Scaffold a new rule YAML in the configured rule directory.
- `ast-grep new test --name <id>`
  - Scaffold a test YAML in the configured test directory.
- `ast-grep test --config sgconfig.yml`
  - Run rule tests defined under the configured test directories.

When in doubt about syntax, consult the ast-grep docs rather than guessing.
```

### `.claude/skills/ast-grep-lint/examples.md`

````markdown
# Example lint rules for this project

These examples are intended as patterns for new rules.

---

## Example: no-console-log-in-src

```yaml
id: no-console-log-in-src
language: TypeScript
rule:
  pattern: console.log($ARGS)
message: "Avoid console.log in src/, use the logger instead."
severity: warning
note: |
  This project standardizes on a structured logger for observability.
  Direct console.log calls are easy to forget and hard to filter in production logs.
````

**Intent**

* Match any `console.log(...)` in the `src/` tree (the file scoping is handled by `sgconfig.yml`).
* Suggest migrating to the project's logger API.

---

## Example: enforce-typed-obj-magic (for languages that have it)

```yaml
id: enforce-typed-obj-magic
language: ReScript
rule:
  pattern: Obj.magic($EXPR)
message: "Always specify the expected type when using Obj.magic."
severity: error
note: |
  Obj.magic is dangerous when its result type is implicit.
  Always annotate the expected type to improve readability and safety.
```

**Intent**

* Flag bare `Obj.magic(expr)` calls and nudge developers towards explicit type annotations.

````

(Tweak language / examples to match your stack.)

---

## 6. `lint-rulemaker` subagent (`.claude/agents/lint-rulemaker.md`)

This is the dedicated agent you asked for.

```markdown
---
name: lint-rulemaker
description: >
  Specialized subagent for discovering, designing, and refining ast-grep lint rules.
  Use this agent when you want to turn recurring code patterns or review feedback
  into enforceable ast-grep rules with tests.
tools: Read, Write, Grep, Glob, Bash
model: inherit
---

You are `lint-rulemaker`, an expert in ast-grep lint rules and this project’s conventions.

## Responsibilities

When invoked, you:

1. Clarify the target behavior:
   - Summarize the pattern or bug that should become a lint rule.
   - Identify the language(s) and relevant directories/modules.

2. Collect examples:
   - Use `Grep` and `Glob` to locate candidate code snippets.
   - Use `Read` to pull in enough surrounding context to understand the pattern.
   - Distinguish positive vs negative examples.

3. Design or update ast-grep rules:
   - Follow the process defined in the `ast-grep-lint` Skill:
     - start from a minimal rule,
     - refine with constraints and structural operators,
     - add `message`, `severity`, and `note`.
   - Prefer small, composable rules over overly generic ones.

4. Wire rules into the project:
   - Create or update rule YAML files under the configured `rules/` directory.
   - Optionally create or update test YAML files under `tests/` (if present).
   - Keep rule IDs consistent and avoid collisions.

5. Test and iterate:
   - When Bash is permitted:
     - Run `ast-grep scan --config sgconfig.yml` or `ast-grep test --config sgconfig.yml`
       on a focused path (or whole project if acceptable).
     - Adjust the rule to reduce false positives/negatives, then rerun.
   - When Bash is not permitted:
     - Simulate expected matches against the examples you collected.
     - Clearly mark any unverified assumptions.

6. Communicate:
   - Summarize:
     - the rule’s **intent**,
     - changes you made to files,
     - how to run the relevant ast-grep commands locally and in CI.
   - Highlight any edge cases you were unable to cover or test.

## Lint gap discovery mode

When invoked without a specific rule request, or when explicitly asked to find
“where should we add lint rules?”:

1. Use `Bash` (when allowed) to inspect:
   - `git diff` for the current branch.
   - Recent commit messages for words like “cleanup”, “hardening”, “hack”, “hotfix”.
2. Use `Grep` to search for comments and TODOs:
   - `TODO lint`, `TODO rule`, `TODO ast-grep`, or similar project-specific markers.
3. Scan for:
   - Repeated manual patterns (same change applied in multiple places).
   - Code review comments pointing out similar issues in different files.

Produce a ranked list of candidate rules with:

- a short title,
- a one-line intent,
- links to representative file paths.

Then, for the top 1–3 candidates, offer to create rules and tests immediately.

## Interaction with Skills and commands

- When this agent is active, you SHOULD:
  - Use and follow the `ast-grep-lint` Skill as your primary reference for
    workflows, examples, and project-specific conventions.
- When invoked via `/create-lint-rule`:
  - Treat the command arguments as the initial rule intent and refine them, not as
    a strict specification.
  - Confirm any ambiguous details (paths, severity, fix behavior) before editing files.
````

This file is very lightweight because all the heavy ast‑grep knowledge is in the Skill.

---

## 7. `/create-lint-rule` slash command (`.claude/commands/create-lint-rule.md`)

This is the user‑facing entrypoint. It uses a few “fancy” features:

* `argument-hint` to improve autocomplete. ([Claude Code][3])
* `allowed-tools` with **scoped Bash commands**: `Bash(ast-grep:*)`, `Bash(git diff:*)`, etc. ([Claude Code][3])
* Bash pre‑execution with `!` to populate context with `git status`, `git diff`, and a sample `ast-grep scan` output. ([Claude Code][3])
* Explicit mention of the `lint-rulemaker` subagent so Claude is more likely to delegate to it. ([Claude Code][2])

```markdown
---
description: Create or update an ast-grep lint rule using the lint-rulemaker subagent.
argument-hint: "[rule-id-or-short-name] [optional brief intent]"
allowed-tools: >
  Bash(git status:*),
  Bash(git diff:*),
  Bash(ast-grep scan:*),
  Bash(ast-grep new:*),
  Read, Write, Grep, Glob
---

# /create-lint-rule

You are executing the `/create-lint-rule` command.

## 1. Interpret arguments

The user ran something like:

> /create-lint-rule $ARGUMENTS

Treat `$ARGUMENTS` as an optional hint containing:

- An optional **rule id** or short name (e.g. `no-console-log-in-src`).
- An optional **brief description** of the intent (e.g. "no console.log in src").

If `$ARGUMENTS` is empty or ambiguous, ask the user to describe:

- What pattern should be detected?
- Which language(s)?
- Any directories or modules that should be in scope.

## 2. Gather context

Use these helpers (only if their commands match the allowed-tools configuration):

- Git status and diff:

  - Current status:  !`git status --short`
  - Current diff:    !`git diff --stat`

- Optional quick lint scan (if sgconfig.yml exists and repo is small enough):

  - Quick scan:      !`ast-grep scan --config sgconfig.yml --stats-only || true`

If the project does not use git or ast-grep yet, skip the commands gracefully and
instead infer context from the visible files.

## 3. Delegate to the lint-rulemaker subagent

Once you understand the user’s intent:

1. Summarize the intended rule in 1–2 sentences.
2. Invoke the `lint-rulemaker` subagent with:
   - The summary of the intended rule.
   - Any relevant paths or file names you’ve identified.
   - The raw `$ARGUMENTS` from this command.

In plain language, say something like:

> Use the lint-rulemaker subagent to design and implement an ast-grep lint rule
> for this pattern, following the ast-grep-lint Skill.

The subagent should:

- Design the rule,
- Create or update the rule YAML under `rules/`,
- Optionally create tests,
- Propose CI updates if relevant.

## 4. Present the result

When the subagent completes:

1. Show the final rule YAML and test YAML (if created) as code blocks.
2. List any files that were created or modified.
3. Show the exact ast-grep commands developers can run locally, for example:

   - `ast-grep scan --config sgconfig.yml`
   - `ast-grep test --config sgconfig.yml`

4. Call out any known limitations or edge cases of the rule so humans know what to watch for in review.
```

You can use this either as a project command (`.claude/commands/create-lint-rule.md`) or as a **plugin command** in `commands/create-lint-rule.md` for a plugin; the behavior is the same. ([Claude Code][3])

---

## 8. Optional: `/scan-with-ast-grep` helper command

Tiny extra command that just runs `ast-grep scan` in a nice way:

```markdown
---
description: Run ast-grep scan with sgconfig.yml and help interpret the output.
argument-hint: "[optional path filter]"
allowed-tools: Bash(ast-grep scan:*), Read
---

# /scan-with-ast-grep

Run `ast-grep scan` using `sgconfig.yml` and help interpret the results.

1. If the user supplied arguments, treat them as optional path filters.
2. Run:

   - !`ast-grep scan --config sgconfig.yml $ARGUMENTS || true`

3. Parse the output:
   - Group findings by rule id.
   - Summarize the most frequent rules and the most severe ones.
4. For any rule that appears frequently and looks like it might be noisy or misconfigured,
   offer to refine it using `/create-lint-rule` and the `lint-rulemaker` subagent.
```

This gives you a nice loop: scan → see noisy/missing rules → call `/create-lint-rule`.

---

## 9. Optional plugin packaging (`ast-grep-lint-plugin`)

If you want this to be installable via a plugin marketplace, follow the standard layout: ([Claude Code][4])

```text
ast-grep-lint-plugin/
  .claude-plugin/
    plugin.json
  commands/
    create-lint-rule.md
    scan-with-ast-grep.md
  agents/
    lint-rulemaker.md
  skills/
    ast-grep-lint/
      SKILL.md
      reference.md
      examples.md
      resources/
        ast-grep-llms.txt
      scripts/
        find-lint-gaps.py
        rule-scaffold.sh
```

A minimal `plugin.json`:

```json
{
  "name": "ast-grep-lint-plugin",
  "version": "0.1.0",
  "description": "ast-grep lint workflow for Claude Code: Skill, lint-rulemaker subagent, and /create-lint-rule command.",
  "author": {
    "name": "Your Name",
    "email": "[email protected]"
  },
  "repository": "https://github.com/your-org/ast-grep-lint-plugin",
  "license": "MIT",
  "keywords": ["ast-grep", "lint", "claude-code", "skills"],
  "commands": ["./commands"],
  "agents": "./agents",
  "hooks": "./hooks.json"
}
```

You don’t *need* hooks to start; you can add them later if you want e.g. “after every `Write` or `Edit`, run `/scan-with-ast-grep` on touched files” via `PostToolUse` hooks. ([Claude Code][4])

---

## 10. How this plays with DRY + other agents / environments

A couple of nice properties of this design:

* **DRY**:

  * Skill holds instructions + patterns.
  * Subagent is a thin executor of that Skill.
  * Slash command is just a trigger and context gatherer.

* **Works across environments**:

  * **Claude Code CLI** and **Claude Code on the web** both understand `.claude/skills`, `.claude/agents`, and `.claude/commands`, and plugins once installed. ([Claude Code][1])
  * Other “web agents” (Factory, Codex, etc.) can still benefit from the Skill content itself: you can point them at the same `SKILL.md` and ast-grep docs, even if they don’t support Skills natively.

* **CI integration is natural**:

  * Once rules are landing in `rules/` and `sgconfig.yml` is configured, you just wire `ast-grep scan --config sgconfig.yml` (or the official GitHub Action) into CI. ([ast-grep.github.io][5])

From here, your next iteration is mostly empirical: run this stack on a real repo, see where the agent misunderstands patterns, and then evolve the Skill text and examples as you discover new failure modes. That’s where this gets fun: your lint corpus becomes a growing, very opinionated fossil record of your agents’ past mistakes.

[1]: https://code.claude.com/docs/en/skills "Agent Skills - Claude Code Docs"
[2]: https://code.claude.com/docs/en/sub-agents "Subagents - Claude Code Docs"
[3]: https://code.claude.com/docs/en/slash-commands "Slash commands - Claude Code Docs"
[4]: https://code.claude.com/docs/en/plugins-reference "Plugins reference - Claude Code Docs"
[5]: https://ast-grep.github.io/guide/scan-project.html?utm_source=chatgpt.com "Scan Your Project! | ast-grep"
[6]: https://ast-grep.github.io/reference/cli/new.html?utm_source=chatgpt.com "ast-grep new"
[7]: https://ast-grep.github.io/advanced/prompting.html "Using ast-grep with AI Tools | ast-grep"
