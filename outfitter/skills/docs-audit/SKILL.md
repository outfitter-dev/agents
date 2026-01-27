---
name: docs-audit
description: |
  Comprehensive documentation audit against current code state. Checks markdown files for accuracy, link validity, code example correctness, and docstring coverage. Uses efficient discovery to minimize context usage while providing thorough analysis.
context: fork
agent: editor
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - TaskCreate
  - TaskUpdate
  - TaskList
  - TaskGet
metadata:
  arg-schema:
    path:
      type: string
      description: Optional path to limit audit scope (e.g., "docs/", "src/")
    focus:
      type: string
      enum: [stale, all, recent]
      default: stale
      description: Which files to prioritize - stale (default), all, or recently modified
    limit:
      type: number
      default: 10
      description: Maximum number of files to analyze deeply (5-20 recommended)
    output:
      type: string
      description: Output path for report. Defaults to .pack/reports/{timestamp}-docs-audit-{sessionShort}.md
    multi:
      type: boolean
      default: false
      description: Multi-file mode - creates .pack/reports/{timestamp}-docs-audit-{sessionShort}/ directory
---

# Documentation Audit Skill

Audit documentation files against the current codebase state, checking for accuracy, completeness, and freshness.

## Workflow

### Stage 1: Discovery

Run the discovery script to get a manifest of all markdown files with git metadata:

```bash
bun "$(dirname "$0")/scripts/discover-docs.ts" ${path ? `--path "${path}"` : ""} --limit 50 --sort staleness
```

Parse the JSON output to understand:
- Total documentation files in scope
- Activity status distribution (active/recent/idle/stale/ancient)
- Files with related code changes (potential staleness indicators)

### Stage 2: Prioritization

Select files for deep analysis based on `focus` argument:

| Focus | Strategy |
|-------|----------|
| `stale` | Prioritize files with oldest commits, especially those with recent related code changes |
| `all` | Balanced sampling across activity statuses |
| `recent` | Focus on recently modified docs that may have introduced errors |

Target: Select top `limit` files (default 10) for deep analysis.

### Stage 3: Deep Analysis

For each selected file, perform these checks:

#### 3.1 Correctness (see references/correctness-checklist.md)

- [ ] Code examples use correct imports/require paths
- [ ] Function signatures match current implementation
- [ ] Configuration examples reflect current schema
- [ ] CLI commands and flags are accurate
- [ ] Environment variables mentioned actually exist

#### 3.2 Link Validation

- [ ] Internal markdown links (`[text](./other.md)`) resolve
- [ ] Anchor links (`[text](#section)`) point to existing headings
- [ ] Image references exist
- [ ] External URLs (sample only if many) - note but don't block on these

#### 3.3 Completeness (see references/completeness-checklist.md)

- [ ] Required sections present (varies by doc type)
- [ ] All public exports documented (for API docs)
- [ ] Examples provided for complex features
- [ ] Error handling documented where relevant

### Stage 4: Docstring Coverage

Check TSDoc/JSDoc/docstring coverage for code files related to the documentation:

**TypeScript/JavaScript:**
```bash
# Find exports without TSDoc
grep -rn "^export " --include="*.ts" --include="*.tsx" | head -20
# vs exports with TSDoc (/** precedes export)
grep -B1 "^export " --include="*.ts" --include="*.tsx" | grep -c "/\*\*"
```

**Python:**
```bash
# Find functions/classes without docstrings
grep -rn "^def \|^class " --include="*.py" | head -20
```

**Rust:**
```bash
# Find pub items without doc comments
grep -rn "^pub " --include="*.rs" | head -20
```

**Go:**
```bash
# Find exported funcs without godoc
grep -rn "^func [A-Z]" --include="*.go" | head -20
```

Calculate coverage percentage per language detected.

### Stage 5: Report Generation

First, generate the report path using the helper script:

```bash
REPORT_PATH=$(bun "$(dirname "$0")/scripts/report-path.ts" --session "${CLAUDE_SESSION_ID}" --json)
# Extracts: timestamp, sessionShort, path, timestampISO
```

Write the report to the generated path (e.g., `.pack/reports/202601251900-docs-audit-a7b3c2d1.md`):

```markdown
---
type: docs-audit
generated: {timestampISO}
timestamp: "{timestamp}"
session: "{CLAUDE_SESSION_ID}"
session_short: "{sessionShort}"
scope: {path or "entire repo"}
focus: {focus}
files_analyzed: {count}
files_total: {total}
status: {pass|needs-work|critical}
---

# Documentation Audit Report

**Generated**: {timestamp}
**Session**: `{sessionShort}`
**Scope**: {path or "entire repo"}
**Files analyzed**: {count} / {total}
**Focus**: {focus}

## Summary

| Dimension | Status | Score |
|-----------|--------|-------|
| Correctness | {PASS/NEEDS WORK} | {x}/{y} files |
| Links | {PASS/NEEDS WORK} | {valid}/{total} |
| Docstrings | {GOOD/ACCEPTABLE/POOR} | {x}% |
| Freshness | {CURRENT/STALE} | {stale_count} files |

## Critical Issues (blocking)

Issues that could cause user confusion or errors:
- {file}: {issue description}

## Warnings (should fix)

Non-blocking but should be addressed:
- {file}: {issue description}

## Stale Documentation

Files that may need review (old docs + recent code changes):
- {file}: Last updated {days}d ago, related code changed {code_days}d ago

## Docstring Coverage by Language

| Language | Coverage | Files Checked |
|----------|----------|---------------|
| TypeScript | {x}% | {n} |
| Python | {x}% | {n} |

## Recommendations

1. {Prioritized recommendation}
2. {Next recommendation}
```

## Report Output

### Path Generation & Scaffolding

Use the `report-path.ts` helper script to generate paths and scaffold directories:

```bash
# Get just the path
bun scripts/report-path.ts --session "${CLAUDE_SESSION_ID}"
# → .pack/reports/202601251900-docs-audit-a7b3c2d1.md

# Scaffold the directory structure (creates .pack/reports/)
bun scripts/report-path.ts --scaffold --session "${CLAUDE_SESSION_ID}"

# Multi-file mode: scaffold with placeholder files
bun scripts/report-path.ts --scaffold --multi --session "${CLAUDE_SESSION_ID}"
# Creates:
#   .pack/reports/202601251900-docs-audit/
#   .pack/reports/202601251900-docs-audit/summary.md
#   .pack/reports/202601251900-docs-audit/markdown-docs.md
#   .pack/reports/202601251900-docs-audit/docstrings.md
#   .pack/reports/202601251900-docs-audit/recommendations.md
#   .pack/reports/202601251900-docs-audit/meta.json

# Get all components as JSON (includes scaffolded paths if --scaffold used)
bun scripts/report-path.ts --scaffold --multi --session "${CLAUDE_SESSION_ID}" --json
```

### Default Location

Reports are written to `.pack/reports/` with frontloaded timestamp:

```
.pack/reports/202601251900-docs-audit-a7b3c2d1.md   # Single file (with session)
.pack/reports/202601251900-docs-audit.md            # Single file (no session)
.pack/reports/202601251900-docs-audit/              # Multi-file (no session in dir name)
```

**Filename patterns:**
- **Single-file**: `{timestamp}-docs-audit-{sessionShort}.md` (session for parallel disambiguation)
- **Multi-file**: `{timestamp}-docs-audit/` (session tracked in frontmatter inside files)

### Multi-File Mode

For comprehensive audits covering different documentation types, use `--multi`:

```
.pack/reports/202601251900-docs-audit/
├── summary.md           # Overall findings + links to other reports
├── markdown-docs.md     # docs/, README, etc.
├── docstrings.md        # TSDoc/JSDoc/docstring coverage
├── recommendations.md   # Prioritized actionable recommendations
└── meta.json            # Session metadata (structured, machine-readable)
```

Each file includes frontmatter with full session ID for traceability.

### Frontmatter Schema

All report artifacts include YAML frontmatter for searchability:

```yaml
---
type: docs-audit           # Report type (searchable)
generated: 2026-01-25T19:00:00Z
timestamp: "202601251900"
session: abc123-def456...  # Full session ID
session_short: a7b3c2d1    # First 8 chars (matches filename)
scope: docs/               # Audit scope
focus: stale               # Focus strategy used
files_analyzed: 10
files_total: 47
status: needs-work         # pass | needs-work | critical
---
```

**Why frontmatter:**
- Grep/ripgrep searchable (`rg "session: abc123"`)
- Tooling can parse and aggregate reports
- Enables filtering by status, scope, date range
- Parallel agent runs are distinguishable by session

### Session ID for Parallel Agents

**Single-file mode** uses session suffix for parallel disambiguation:

```
.pack/reports/202601251900-docs-audit-a7b3c2d1.md  # Agent 1
.pack/reports/202601251900-docs-audit-f8e9d0c1.md  # Agent 2
.pack/reports/202601251900-docs-audit-12345678.md  # Agent 3
```

**Multi-file mode** relies on timestamps (coordinated audits typically don't run in parallel). Session is tracked inside each file's frontmatter for traceability.

### Custom Output

Override the default location (session ID still included in frontmatter):

```
/docs-audit --output docs/audits/latest.md
/docs-audit --multi --output .pack/reports/202601-quarterly/
```

Note: Custom filenames don't auto-include session ID prefix - use frontmatter for tracking.

### Output Behavior

1. **Create directory** if it doesn't exist
2. **Write report(s)** with session ID embedded
3. **Print summary** to conversation (critical issues + file path)
4. **Return path** so user can open/commit the report

### Git Considerations

The default `.pack/reports/` location:
- Should be gitignored for ephemeral reports
- Can be selectively committed for audit history
- Keeps reports separate from actual documentation

## Context Efficiency

This skill uses `context: fork` to run in isolation. The token budget strategy:

| Stage | Token Target | Strategy |
|-------|--------------|----------|
| Discovery | ~200-500 | Script output is compact JSON |
| Prioritization | ~100 | Selection logic only |
| Deep Analysis | ~500-2000/file | Read only selected files |
| Docstring Check | ~500 | Grep summaries, not full files |
| Report | ~1000 | Structured output |

**Total target**: 15-30k tokens for a typical audit.

## Task Management

Use task tools (`TaskCreate`, `TaskUpdate`, `TaskList`) to track progress through stages. Tasks survive context compaction and allow resumption if the audit is interrupted.

### Initial Task Setup

After discovery, create tasks for the audit stages:

```
TaskCreate:
  subject: "Run docs-audit discovery"
  activeForm: "Running discovery script"
  description: "Execute discover-docs.ts, parse manifest, identify {n} files in scope"

TaskCreate:
  subject: "Analyze {n} priority docs"
  activeForm: "Analyzing documentation"
  description: "Deep analysis of top {limit} files for correctness, links, completeness"

TaskCreate:
  subject: "Check docstring coverage"
  activeForm: "Checking docstring coverage"
  description: "Grep exports vs documented exports per detected language"

TaskCreate:
  subject: "Generate audit report"
  activeForm: "Generating report"
  description: "Compile findings into .pack/reports/{timestamp}-docs-audit-{sessionShort}.md"
```

### Progress Tracking

Update tasks as you work:

1. **Before starting a stage** → `TaskUpdate` with `status: in_progress`
2. **After completing a stage** → `TaskUpdate` with `status: completed`, update description with key findings
3. **If issues found** → `TaskCreate` follow-up tasks for fixes

### State Persistence

Before context approaches limit, update task descriptions with checkpoint data:

```
TaskUpdate:
  taskId: "2"
  description: |
    [CHECKPOINT] Analyzed 7/10 docs.
    Critical: 2 broken imports in api.md (lines 45, 89)
    Warnings: 3 stale files (config.md, setup.md, advanced.md)
    Remaining: config.md, setup.md, advanced.md
```

This ensures findings survive compaction even if the stage isn't complete.

### Resumption

If context resets mid-audit:
1. `TaskList` to see current state
2. `TaskGet` on `in_progress` task to read checkpoint data
3. Skip completed stages
4. Resume from checkpoint, don't re-analyze completed files
5. Reference persisted findings in final report

## Handling Edge Cases

**No documentation found:**
Report "No markdown files found in {scope}. Consider adding documentation for your project."

**Very large repos (100+ docs):**
- Stick to `limit` parameter strictly
- Focus on highest-staleness files
- Note total count in report for context

**Non-git repos:**
- Skip git-based metadata (SHA, author, etc.)
- Use file modification times as fallback
- Note "Git metadata unavailable" in report

**Mixed language repos:**
- Detect languages from file extensions
- Report coverage per detected language
- Skip languages with no source files

## Example Invocations

```
/docs-audit                                    # Single report to .pack/reports/
/docs-audit --path docs/                       # Scope to docs/ directory
/docs-audit --focus all --limit 20             # Analyze 20 files across all statuses
/docs-audit --multi                            # Multi-file mode with separate reports
/docs-audit --output docs/audits/latest.md     # Custom output location
/docs-audit --multi --path src/                # Multi-file audit of src/ docs
```
