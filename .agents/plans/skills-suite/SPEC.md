# Claude Skills Suite Specification

## Overview

Two complementary skills for authoring and validating Claude skills:

- **claude-skills-authoring** — Create and update skills reliably
- **claude-skill-qa** — Debug, analyze, lint, and validate skills

---

## Directory Structure

```
claude-skills-authoring/
├── SKILL.md
├── LICENSE.txt
├── references/
│   ├── patterns/
│   │   ├── api-wrapper.md
│   │   ├── document-processor.md
│   │   ├── dev-workflow.md
│   │   └── research-synthesizer.md
│   ├── anti-patterns.md
│   └── composition.md
├── assets/
│   └── templates/
│       ├── api-wrapper/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       └── client.ts
│       ├── document-processor/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       └── process.ts
│       ├── dev-workflow/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       └── run.ts
│       └── research-synthesizer/
│           └── SKILL.md
└── scripts/
    ├── init-skill.ts
    └── package-skill.ts

claude-skill-qa/
├── SKILL.md
├── LICENSE.txt
├── references/
│   ├── common-issues.md
│   └── trigger-debugging.md
├── rules/
│   ├── skill-md.yml
│   └── scripts-ts.yml
└── scripts/
    ├── lint-skill.ts
    ├── analyze-skill.ts
    ├── diff-skills.ts
    └── dry-run-skill.ts
```

---

# claude-skills-authoring

## SKILL.md

````markdown
---
name: claude-skills-authoring
description: Create and update Claude skills reliably. Use when building new skills from scratch, updating existing skills, or needing guidance on skill structure and best practices. Covers skill anatomy, progressive disclosure, description writing, and provides copyable templates for common skill archetypes (API wrappers, document processors, dev workflows, research synthesizers).
---

# Claude Skill Authoring

## Quick Start

1. **New skill?** Run `bun run scripts/init-skill.ts <skill-name> <output-dir>`
2. **Need a pattern?** Check `references/patterns/` for guidance, copy from `assets/templates/`
3. **Ready to ship?** Run `bun run scripts/package-skill.ts <skill-dir>`

## Core Principles

### The Description Is Everything

The YAML `description` field is the **only thing Claude sees before deciding to use your skill**. The body of SKILL.md only loads *after* triggering.

**Your description must include:**
- What the skill does (capabilities)
- When to use it (trigger conditions)
- Keywords/contexts that should invoke it

```yaml
# ❌ Too vague
description: Helps with documents

# ✅ Complete
description: Create, edit, and analyze Word documents (.docx). Use when working with professional documents for creating new docs, modifying content, tracked changes, comments, or text extraction.
```

### Progressive Disclosure

Context window is precious. Load information only when needed:

| Level | What | When Loaded | Budget |
|-------|------|-------------|--------|
| 1 | Frontmatter (name + description) | Always | ~100 words |
| 2 | SKILL.md body | On trigger | <500 lines |
| 3 | references/, scripts/, assets/ | On demand | Unlimited |

**Rules:**
- Keep SKILL.md under 500 lines
- Split detailed docs into `references/`
- Put executable code in `scripts/`
- Put copyable starters in `assets/`

### Reference vs Asset

- **references/** — Docs Claude reads for understanding (patterns, guides, schemas)
- **assets/** — Files Claude copies/modifies for output (templates, boilerplate)

## Skill Archetypes

Choose your pattern, read the reference, copy the template:

| Archetype | Reference | Template | Use When |
|-----------|-----------|----------|----------|
| API Wrapper | `references/patterns/api-wrapper.md` | `assets/templates/api-wrapper/` | Wrapping external APIs |
| Document Processor | `references/patterns/document-processor.md` | `assets/templates/document-processor/` | Working with file formats |
| Dev Workflow | `references/patterns/dev-workflow.md` | `assets/templates/dev-workflow/` | Git, CI, coding automation |
| Research Synthesizer | `references/patterns/research-synthesizer.md` | `assets/templates/research-synthesizer/` | Search + summarization |

## Creating a Skill

### Step 1: Initialize

```bash
bun run scripts/init-skill.ts my-skill ./output
```

Or copy a template:

```bash
cp -r assets/templates/api-wrapper ./my-skill
```

### Step 2: Write the Description

Spend 80% of your thinking time here. Ask:
- What exact phrases would a user say that should trigger this?
- What adjacent phrases should *not* trigger this?
- What capabilities am I promising?

### Step 3: Write the Body

Structure your SKILL.md body:

```markdown
# Skill Name

## Quick Start
[Fastest path to value - 3-5 lines max]

## Core Concepts
[Only if non-obvious - skip if possible]

## Workflows
[Step-by-step for each major use case]
[Reference external files: "See references/advanced.md for details"]

## Scripts
[Document each script in scripts/]
```

### Step 4: Add Resources

**references/** — Create when:
- Content exceeds 100 lines
- Information is conditionally needed
- Multiple variants exist (pick one based on context)

**scripts/** — Create when:
- Same code gets rewritten repeatedly
- Deterministic reliability needed
- Complex multi-step operations

**assets/** — Create when:
- Users need copyable starting points
- Boilerplate is required
- Templates/media are part of output

### Step 5: Package

```bash
bun run scripts/package-skill.ts ./my-skill
# Creates: my-skill.skill
```

## Common Mistakes

See `references/anti-patterns.md` for detailed examples. Quick hits:

- ❌ Description says "when to use" but that's in the body (body loads *after* trigger)
- ❌ SKILL.md over 500 lines (split into references/)
- ❌ Duplicating content between SKILL.md and references/
- ❌ Including README.md, CHANGELOG.md, etc. (skills are for agents, not humans)
- ❌ Hardcoding paths in scripts (use relative paths)

## When to Split Skills

See `references/composition.md` for detailed guidance. Quick heuristics:

**Keep together when:**
- Shared context is essential
- Workflows are sequential
- One description covers all use cases

**Split apart when:**
- Triggers are distinct ("create X" vs "debug X")
- Context for one pollutes the other
- Independent iteration cycles
````

---

## references/patterns/api-wrapper.md

````markdown
# API Wrapper Pattern

## When to Use

You're building a skill that wraps an external API (REST, GraphQL, etc.) to give Claude access to a service.

**Examples:**
- GitHub API wrapper
- Stripe API wrapper
- Internal company API wrapper

## Anatomy

```
my-api-wrapper/
├── SKILL.md           # Tool descriptions, auth setup, common workflows
├── references/
│   └── endpoints.md   # Full endpoint documentation (if large)
└── scripts/
    └── client.ts      # Typed API client
```

## Key Decisions

### Auth Strategy

Where does the API key come from?

| Approach | Pros | Cons |
|----------|------|------|
| Environment variable | Simple, standard | User must set it |
| Config file | Can store multiple keys | File management |
| Prompt user | No setup needed | Interrupts flow |

Recommend: Environment variable with clear error message if missing.

### Tool Granularity

| Approach | When |
|----------|------|
| One tool per endpoint | Full flexibility, composable |
| Workflow tools | Common multi-step operations |
| Hybrid | Both, with workflow tools calling endpoint tools |

Recommend: Start with endpoint tools, add workflow tools when you see patterns.

### Response Formatting

- Return structured data (JSON) for programmatic use
- Include a human-readable summary for conversational use
- Paginate large responses

## Template Usage

Copy `assets/templates/api-wrapper/` and customize:

1. Update `SKILL.md` frontmatter with your API's description
2. Replace `scripts/client.ts` with your API's endpoints
3. Add `references/endpoints.md` if documentation is large
4. Add auth setup instructions to SKILL.md

## Example Description

```yaml
description: Interact with the GitHub API. Use when working with GitHub repositories, issues, pull requests, actions, or any GitHub-related tasks. Supports repo management, issue tracking, PR workflows, and GitHub Actions.
```
````

---

## references/patterns/document-processor.md

````markdown
# Document Processor Pattern

## When to Use

You're building a skill that works with a specific file format (PDF, DOCX, XLSX, images, etc.).

**Examples:**
- PDF form filler
- Excel analyzer
- Image resizer

## Anatomy

```
my-doc-processor/
├── SKILL.md           # Workflows for read/write/transform
├── references/
│   └── format-spec.md # Format-specific details (optional)
└── scripts/
    └── process.ts     # Processing utilities
```

## Key Decisions

### Read vs Write vs Transform

Most doc processors do one or more of:

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Read/Extract | Low | Usually straightforward |
| Transform | Medium | Resize, convert, filter |
| Write/Create | High | Often needs templates |
| Edit in place | Highest | Must preserve structure |

Be clear in your description which operations you support.

### Library Selection (TypeScript/Bun)

| Format | Recommended Library |
|--------|---------------------|
| PDF | pdf-lib, pdfjs-dist |
| DOCX | docx, mammoth |
| XLSX | xlsx, exceljs |
| Images | sharp |
| CSV | papaparse |

### Template-Based vs Programmatic Creation

**Template-based:** Copy and modify existing file
- Pros: Preserves complex formatting
- Cons: Need template for each variant

**Programmatic:** Build from scratch with library
- Pros: Full control
- Cons: Formatting is manual

Recommend: Template-based for complex formats (PPTX), programmatic for simple ones (CSV).

## Template Usage

Copy `assets/templates/document-processor/` and customize:

1. Update `SKILL.md` with your format's operations
2. Replace `scripts/process.ts` with your format's logic
3. Add templates to `assets/` if using template-based approach

## Example Description

```yaml
description: Process and analyze PDF documents. Use when extracting text, filling forms, merging/splitting PDFs, or converting PDF to images. Supports both native and scanned PDFs (via OCR).
```
````

---

## references/patterns/dev-workflow.md

````markdown
# Dev Workflow Pattern

## When to Use

You're building a skill that automates development tasks (git operations, CI/CD, code generation, project scaffolding).

**Examples:**
- Git workflow automator
- CI pipeline generator
- Project scaffolder

## Anatomy

```
my-dev-workflow/
├── SKILL.md           # Workflow steps, commands, decision trees
├── references/
│   └── commands.md    # Detailed command reference (optional)
├── assets/
│   └── templates/     # Boilerplate files (optional)
└── scripts/
    └── run.ts         # Automation scripts
```

## Key Decisions

### Interactive vs Automated

| Mode | When |
|------|------|
| Interactive | User confirmation needed, destructive operations |
| Automated | Repeatable, safe, well-understood operations |

Recommend: Default to interactive for destructive ops (force push, delete).

### Shell Commands vs Library Calls

| Approach | Pros | Cons |
|----------|------|------|
| Shell (`$` spawn) | Works everywhere, familiar | Parsing output is fragile |
| Library (e.g., isomorphic-git) | Typed, testable | Another dependency |

Recommend: Shell for simple commands, library for complex logic.

### Idempotency

Can the script be run twice without breaking things?

- ✅ `git checkout -b feature || git checkout feature`
- ❌ `git checkout -b feature` (fails if exists)

Always design for re-runs.

## Template Usage

Copy `assets/templates/dev-workflow/` and customize:

1. Update `SKILL.md` with your workflow's steps
2. Replace `scripts/run.ts` with your automation
3. Add boilerplate to `assets/templates/` if scaffolding

## Example Description

```yaml
description: Automate git workflows including branch management, commit conventions, PR creation, and release tagging. Use when managing git operations, enforcing commit standards, or automating release processes.
```
````

---

## references/patterns/research-synthesizer.md

````markdown
# Research Synthesizer Pattern

## When to Use

You're building a skill that gathers information from multiple sources and synthesizes it into a coherent output.

**Examples:**
- Competitive analysis generator
- Literature review assistant
- News digest creator

## Anatomy

```
my-research-synthesizer/
├── SKILL.md           # Research workflow, source priorities, output format
└── references/
    └── sources.md     # Source-specific instructions (optional)
```

Note: Usually no scripts needed — this pattern leverages Claude's native capabilities.

## Key Decisions

### Source Priority

Define which sources to check and in what order:

```markdown
1. Internal docs (Google Drive) — authoritative for company info
2. Official sources (company websites, docs) — authoritative for external info  
3. News/articles — for recent developments
4. General web — for background context
```

### Synthesis Format

| Format | When |
|--------|------|
| Bullet summary | Quick digest |
| Structured report | Formal deliverable |
| Comparison table | Multiple entities |
| Narrative | Storytelling, context-heavy |

### Citation Style

Be explicit about how to cite:
- Inline links: `[claim](source)`
- Footnotes: `claim[^1]`
- Bibliography: Sources listed at end

## Template Usage

Copy `assets/templates/research-synthesizer/` (just SKILL.md) and customize:

1. Define your source priority
2. Define your output format
3. Add source-specific instructions to `references/sources.md` if needed

## Example Description

```yaml
description: Research and synthesize information on a topic from multiple sources. Use when creating competitive analyses, market research, literature reviews, or any task requiring multi-source synthesis with citations.
```
````

---

## references/anti-patterns.md

````markdown
# Skill Anti-Patterns

Common mistakes that make skills unreliable or inefficient.

## Trigger Failures

### ❌ "When to Use" in Body

```yaml
# SKILL.md
---
name: my-skill
description: Does stuff with documents
---

## When to Use This Skill
Use this skill when you need to...
```

**Problem:** The body loads *after* triggering. Claude never sees "When to Use" section when deciding whether to invoke.

**Fix:** Put all trigger information in the `description` field.

---

### ❌ Vague Description

```yaml
description: Helps with code
```

**Problem:** Too generic. Will either trigger too often or not enough.

**Fix:** Be specific about capabilities and contexts:

```yaml
description: Generate TypeScript API clients from OpenAPI specs. Use when converting swagger/openapi JSON or YAML files into typed TypeScript code with fetch-based HTTP clients.
```

---

## Context Bloat

### ❌ Monolithic SKILL.md

A SKILL.md that's 1000+ lines with everything inline.

**Problem:** Loads too much context on every trigger, even when only part is relevant.

**Fix:** Split into references:

```markdown
## PDF Operations

For basic operations, see below. For form filling, see `references/forms.md`.
```

---

### ❌ Duplicated Content

Same information in SKILL.md and references/guide.md.

**Problem:** Wastes tokens, creates inconsistency risk.

**Fix:** Single source of truth. SKILL.md should reference, not duplicate.

---

## Structural Issues

### ❌ Extra Documentation Files

```
my-skill/
├── SKILL.md
├── README.md          # ❌
├── CONTRIBUTING.md    # ❌
├── CHANGELOG.md       # ❌
└── INSTALLATION.md    # ❌
```

**Problem:** Skills are for agents, not humans. Extra docs confuse and bloat.

**Fix:** Only include files the agent needs to do the job.

---

### ❌ Hardcoded Paths

```typescript
// scripts/process.ts
const template = fs.readFileSync('/Users/matt/skills/my-skill/assets/template.docx');
```

**Problem:** Breaks when skill is used elsewhere.

**Fix:** Use relative paths from script location:

```typescript
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const template = fs.readFileSync(path.join(__dirname, '../assets/template.docx'));
```

---

## Script Issues

### ❌ No Error Handling

```typescript
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
```

**Problem:** Cryptic failures when file missing or invalid JSON.

**Fix:** Actionable error messages:

```typescript
if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}\nExpected a JSON file at this path.`);
  process.exit(1);
}
try {
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
  console.error(`Invalid JSON in ${file}: ${e.message}`);
  process.exit(1);
}
```

---

### ❌ Console.log Instead of Structured Output

```typescript
console.log('Processing...');
console.log('Found 5 items');
console.log('Done!');
```

**Problem:** Hard for calling agent to parse results.

**Fix:** Structured output (JSON) with optional verbose flag:

```typescript
const result = { itemCount: 5, status: 'success' };
console.log(JSON.stringify(result, null, 2));
```
````

---

## references/composition.md

````markdown
# Skill Composition

When to keep skills together vs split them apart.

## The Core Question

> "Would a single description accurately trigger for all use cases?"

If yes → keep together  
If no → split apart

## Keep Together When

### Shared Context is Essential

If workflow A needs context from workflow B, keep them together.

**Example:** A "git-workflow" skill where branching, committing, and PR creation share repository context.

### Sequential Workflows

If users typically do A then B then C, keep them together.

**Example:** A "document-review" skill covering: open → annotate → export.

### Single Mental Model

If a user thinks of it as "one thing," keep it as one skill.

**Example:** "Excel skill" covers read, write, formulas, formatting — all "Excel stuff."

## Split Apart When

### Distinct Triggers

If the phrases that invoke A are different from B, split them.

**Example:**
- "Create a new skill" → claude-skills-authoring
- "Why isn't my skill working?" → claude-skill-qa

### Context Pollution

If loading context for A hurts performance on B, split them.

**Example:** A skill for "Python development" and "JavaScript development" — loading Python patterns while doing JS work is wasteful.

### Independent Iteration

If A and B evolve at different rates or by different people, split them.

**Example:** Company-wide "brand-guidelines" skill vs team-specific "frontend-components" skill.

## Composition Patterns

### Skill References Skill

One skill can tell Claude to use another:

```markdown
# my-skill/SKILL.md

## Advanced Validation

For comprehensive quality checks, use the `claude-skill-qa` skill.
```

### Shared References

Multiple skills can reference common documentation:

```
shared-refs/
├── company-standards.md
└── api-schemas.md

skill-a/
├── SKILL.md  # References: ../shared-refs/company-standards.md

skill-b/
├── SKILL.md  # References: ../shared-refs/company-standards.md
```

### Pipeline Skills

Skills that expect to be used in sequence:

```
research-skill/     # Gathers information
  → outputs structured data

analysis-skill/     # Processes structured data
  → expects research-skill output format
```

Document the interface contract in both skills.
````

---

## assets/templates/api-wrapper/SKILL.md

````markdown
---
name: {{API_NAME}}-api
description: Interact with the {{API_NAME}} API. Use when {{TRIGGER_CONTEXTS}}. Supports {{CAPABILITIES}}.
---

# {{API_NAME}} API

## Setup

Set your API key:

```bash
export {{API_NAME}}_API_KEY="your-key-here"
```

## Available Operations

### {{OPERATION_1}}

{{Description of operation}}

```bash
bun run scripts/client.ts {{operation_1}} --param value
```

### {{OPERATION_2}}

{{Description of operation}}

```bash
bun run scripts/client.ts {{operation_2}} --param value
```

## Error Handling

| Error | Meaning | Resolution |
|-------|---------|------------|
| 401 | Invalid API key | Check {{API_NAME}}_API_KEY is set correctly |
| 429 | Rate limited | Wait and retry, or reduce request frequency |
| 500 | Server error | Retry after a moment |
````

---

## assets/templates/api-wrapper/scripts/client.ts

```typescript
#!/usr/bin/env bun

/**
 * {{API_NAME}} API Client
 * 
 * Usage: bun run client.ts <command> [options]
 */

const API_BASE = "https://api.example.com/v1";

function getApiKey(): string {
  const key = process.env.{{API_NAME}}_API_KEY;
  if (!key) {
    console.error("Error: {{API_NAME}}_API_KEY environment variable not set");
    console.error("Set it with: export {{API_NAME}}_API_KEY='your-key'");
    process.exit(1);
  }
  return key;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Authorization": `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  return response.json() as Promise<T>;
}

// Example operations — replace with actual API endpoints

async function listItems(limit = 10) {
  return apiRequest<{ items: unknown[] }>(`/items?limit=${limit}`);
}

async function getItem(id: string) {
  return apiRequest<{ item: unknown }>(`/items/${id}`);
}

async function createItem(data: Record<string, unknown>) {
  return apiRequest<{ item: unknown }>("/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// CLI handler
async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "list": {
        const limit = args[0] ? parseInt(args[0]) : 10;
        const result = await listItems(limit);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "get": {
        if (!args[0]) throw new Error("Usage: get <id>");
        const result = await getItem(args[0]);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "create": {
        if (!args[0]) throw new Error("Usage: create <json-data>");
        const data = JSON.parse(args[0]);
        const result = await createItem(data);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      default:
        console.log("Usage: client.ts <list|get|create> [args]");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
```

---

## assets/templates/document-processor/SKILL.md

````markdown
---
name: {{FORMAT}}-processor
description: Process and analyze {{FORMAT}} files. Use when {{TRIGGER_CONTEXTS}}. Supports {{CAPABILITIES}}.
---

# {{FORMAT}} Processor

## Operations

### Read / Extract

Extract content from {{FORMAT}} files:

```bash
bun run scripts/process.ts extract input.{{ext}}
```

### Transform

Transform {{FORMAT}} files:

```bash
bun run scripts/process.ts transform input.{{ext}} --option value
```

### Create

Create new {{FORMAT}} files:

```bash
bun run scripts/process.ts create output.{{ext}} --from data.json
```

## Output Formats

| Flag | Output |
|------|--------|
| `--json` | Structured JSON |
| `--text` | Plain text |
| `--markdown` | Markdown formatted |
````

---

## assets/templates/document-processor/scripts/process.ts

```typescript
#!/usr/bin/env bun

/**
 * {{FORMAT}} Processor
 * 
 * Usage: bun run process.ts <command> <file> [options]
 */

import * as fs from "fs";
import * as path from "path";

// Type definitions for your format
interface DocumentContent {
  text: string;
  metadata: Record<string, unknown>;
}

async function extract(filePath: string): Promise<DocumentContent> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // TODO: Implement extraction logic for your format
  // Example: const doc = await SomeLibrary.load(filePath);
  
  return {
    text: "Extracted content here",
    metadata: {},
  };
}

async function transform(
  filePath: string, 
  options: Record<string, string>
): Promise<void> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // TODO: Implement transformation logic
  console.log(`Transforming ${filePath} with options:`, options);
}

async function create(
  outputPath: string, 
  dataPath: string
): Promise<void> {
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found: ${dataPath}`);
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  
  // TODO: Implement creation logic
  // Example: const doc = SomeLibrary.create(data);
  // doc.save(outputPath);
  
  console.log(`Created ${outputPath}`);
}

// CLI handler
async function main() {
  const [command, file, ...rest] = process.argv.slice(2);
  
  // Parse --key value pairs
  const options: Record<string, string> = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (rest[i]?.startsWith("--")) {
      options[rest[i].slice(2)] = rest[i + 1] || "true";
    }
  }

  try {
    switch (command) {
      case "extract": {
        if (!file) throw new Error("Usage: extract <file>");
        const result = await extract(file);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "transform": {
        if (!file) throw new Error("Usage: transform <file> [--options]");
        await transform(file, options);
        break;
      }
      case "create": {
        if (!file || !options.from) {
          throw new Error("Usage: create <output> --from <data.json>");
        }
        await create(file, options.from);
        break;
      }
      default:
        console.log("Usage: process.ts <extract|transform|create> <file> [options]");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
```

---

## assets/templates/dev-workflow/SKILL.md

````markdown
---
name: {{WORKFLOW}}-workflow
description: Automate {{WORKFLOW}} tasks. Use when {{TRIGGER_CONTEXTS}}. Supports {{CAPABILITIES}}.
---

# {{WORKFLOW}} Workflow

## Commands

### {{COMMAND_1}}

{{Description}}

```bash
bun run scripts/run.ts {{command_1}} [options]
```

**Options:**
- `--dry-run` — Preview without executing
- `--verbose` — Show detailed output

### {{COMMAND_2}}

{{Description}}

```bash
bun run scripts/run.ts {{command_2}} [options]
```

## Safety

Destructive operations require confirmation:

```bash
bun run scripts/run.ts dangerous-op
# Prompts: "This will delete X. Continue? [y/N]"

bun run scripts/run.ts dangerous-op --force
# Skips confirmation (use with caution)
```
````

---

## assets/templates/dev-workflow/scripts/run.ts

```typescript
#!/usr/bin/env bun

/**
 * {{WORKFLOW}} Workflow Runner
 * 
 * Usage: bun run run.ts <command> [options]
 */

import { $ } from "bun";

interface RunOptions {
  dryRun: boolean;
  verbose: boolean;
  force: boolean;
}

function parseOptions(args: string[]): { command: string; options: RunOptions; args: string[] } {
  const options: RunOptions = {
    dryRun: false,
    verbose: false,
    force: false,
  };
  
  const positional: string[] = [];
  
  for (const arg of args) {
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--verbose") options.verbose = true;
    else if (arg === "--force") options.force = true;
    else positional.push(arg);
  }
  
  return {
    command: positional[0] || "",
    options,
    args: positional.slice(1),
  };
}

async function confirm(message: string): Promise<boolean> {
  process.stdout.write(`${message} [y/N] `);
  const response = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });
  return response.toLowerCase() === "y";
}

async function run(cmd: string, options: RunOptions): Promise<void> {
  if (options.verbose) console.log(`Running: ${cmd}`);
  if (options.dryRun) {
    console.log(`[dry-run] Would execute: ${cmd}`);
    return;
  }
  await $`${{ raw: cmd }}`;
}

// Command implementations
async function exampleSafeCommand(options: RunOptions) {
  await run("echo 'This is safe'", options);
}

async function exampleDestructiveCommand(options: RunOptions) {
  if (!options.force) {
    const confirmed = await confirm("This will do something destructive. Continue?");
    if (!confirmed) {
      console.log("Aborted.");
      return;
    }
  }
  await run("echo 'Doing destructive thing'", options);
}

// CLI handler
async function main() {
  const { command, options, args } = parseOptions(process.argv.slice(2));

  try {
    switch (command) {
      case "safe":
        await exampleSafeCommand(options);
        break;
      case "destructive":
        await exampleDestructiveCommand(options);
        break;
      default:
        console.log("Usage: run.ts <safe|destructive> [--dry-run] [--verbose] [--force]");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
```

---

## assets/templates/research-synthesizer/SKILL.md

````markdown
---
name: {{TOPIC}}-research
description: Research and synthesize information about {{TOPIC}}. Use when {{TRIGGER_CONTEXTS}}. Produces {{OUTPUT_FORMAT}} with citations.
---

# {{TOPIC}} Research

## Source Priority

Check sources in this order:

1. **{{PRIMARY_SOURCE}}** — Authoritative for {{reason}}
2. **{{SECONDARY_SOURCE}}** — Good for {{reason}}
3. **General web search** — For background and recent developments

## Research Workflow

### Step 1: Scope Definition

Before searching, clarify:
- What specific questions need answers?
- What time range is relevant?
- What level of detail is needed?

### Step 2: Gather Information

For each source:
1. Search with specific queries
2. Extract relevant facts
3. Note the source URL and date

### Step 3: Synthesize

Combine findings into {{OUTPUT_FORMAT}}:
- Lead with key findings
- Support claims with citations
- Note conflicting information
- Highlight gaps

## Output Format

{{DESCRIBE_FORMAT}}

## Citation Style

Use inline citations: [claim](source_url)

For multiple sources supporting one claim: [claim](source1) [source2]
````

---

## scripts/init-skill.ts

```typescript
#!/usr/bin/env bun

/**
 * Initialize a new Claude skill from template or scratch
 * 
 * Usage: 
 *   bun run init-skill.ts <skill-name> <output-dir>
 *   bun run init-skill.ts <skill-name> <output-dir> --template <template-name>
 */

import * as fs from "fs";
import * as path from "path";

const TEMPLATES_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "../assets/templates"
);

function getAvailableTemplates(): string[] {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs.readdirSync(TEMPLATES_DIR).filter((f) => 
    fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory()
  );
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createMinimalSkill(skillName: string, outputDir: string): void {
  const skillDir = path.join(outputDir, skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  
  const skillMd = `---
name: ${skillName}
description: TODO - Describe what this skill does and when to use it. Be specific about capabilities and trigger contexts.
---

# ${skillName}

## Quick Start

TODO: Fastest path to value

## Workflows

TODO: Document main use cases

## Scripts

TODO: Document any scripts in scripts/
`;

  fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillMd);
  fs.mkdirSync(path.join(skillDir, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "references"), { recursive: true });
  
  console.log(JSON.stringify({
    status: "success",
    skillDir,
    files: ["SKILL.md", "scripts/", "references/"],
    nextSteps: [
      "Edit SKILL.md description (most important!)",
      "Add workflows to SKILL.md body",
      "Add scripts to scripts/",
      "Add reference docs to references/",
    ],
  }, null, 2));
}

function createFromTemplate(
  skillName: string, 
  outputDir: string, 
  templateName: string
): void {
  const templateDir = path.join(TEMPLATES_DIR, templateName);
  
  if (!fs.existsSync(templateDir)) {
    console.error(JSON.stringify({
      status: "error",
      message: `Template '${templateName}' not found`,
      availableTemplates: getAvailableTemplates(),
    }, null, 2));
    process.exit(1);
  }
  
  const skillDir = path.join(outputDir, skillName);
  copyDir(templateDir, skillDir);
  
  console.log(JSON.stringify({
    status: "success",
    skillDir,
    template: templateName,
    nextSteps: [
      "Replace {{PLACEHOLDERS}} in SKILL.md",
      "Customize scripts for your use case",
      "Test with real inputs",
    ],
  }, null, 2));
}

// Main
const args = process.argv.slice(2);
const templateIdx = args.indexOf("--template");
let template: string | null = null;

if (templateIdx !== -1) {
  template = args[templateIdx + 1];
  args.splice(templateIdx, 2);
}

const [skillName, outputDir] = args;

if (!skillName || !outputDir) {
  console.log(`Usage: init-skill.ts <skill-name> <output-dir> [--template <name>]

Available templates: ${getAvailableTemplates().join(", ") || "(none)"}
`);
  process.exit(1);
}

if (template) {
  createFromTemplate(skillName, outputDir, template);
} else {
  createMinimalSkill(skillName, outputDir);
}
```

---

## scripts/package-skill.ts

```typescript
#!/usr/bin/env bun

/**
 * Package a skill into a distributable .skill file
 * 
 * Usage: bun run package-skill.ts <skill-dir> [output-dir]
 */

import * as fs from "fs";
import * as path from "path";
import { $ } from "bun";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateSkill(skillDir: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check SKILL.md exists
  const skillMdPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    errors.push("Missing SKILL.md");
    return { valid: false, errors, warnings };
  }
  
  const content = fs.readFileSync(skillMdPath, "utf-8");
  
  // Check frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push("Missing YAML frontmatter (---\\n...\\n---)");
  } else {
    const frontmatter = frontmatterMatch[1];
    if (!frontmatter.includes("name:")) {
      errors.push("Frontmatter missing 'name' field");
    }
    if (!frontmatter.includes("description:")) {
      errors.push("Frontmatter missing 'description' field");
    }
    
    // Check description quality
    const descMatch = frontmatter.match(/description:\s*["']?(.+?)["']?\n/);
    if (descMatch) {
      const desc = descMatch[1];
      if (desc.length < 50) {
        warnings.push("Description seems short. Include capabilities and trigger contexts.");
      }
      if (desc.toLowerCase().includes("todo")) {
        errors.push("Description contains TODO placeholder");
      }
    }
  }
  
  // Check for common issues
  if (content.includes("TODO")) {
    warnings.push("SKILL.md contains TODO markers");
  }
  
  // Check file count
  const lineCount = content.split("\n").length;
  if (lineCount > 500) {
    warnings.push(`SKILL.md is ${lineCount} lines. Consider splitting into references/.`);
  }
  
  // Check for extraneous files
  const badFiles = ["README.md", "CHANGELOG.md", "CONTRIBUTING.md"];
  for (const f of badFiles) {
    if (fs.existsSync(path.join(skillDir, f))) {
      warnings.push(`Found ${f} — skills shouldn't include human-facing docs`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

async function packageSkill(skillDir: string, outputDir: string): Promise<void> {
  const skillName = path.basename(skillDir);
  const outputFile = path.join(outputDir, `${skillName}.skill`);
  
  // Create zip
  await $`cd ${skillDir} && zip -r ${path.resolve(outputFile)} . -x "*.DS_Store" -x "__MACOSX/*"`;
  
  const stats = fs.statSync(outputFile);
  
  console.log(JSON.stringify({
    status: "success",
    outputFile,
    sizeBytes: stats.size,
    sizeHuman: `${(stats.size / 1024).toFixed(1)} KB`,
  }, null, 2));
}

// Main
const [skillDir, outputDir = "."] = process.argv.slice(2);

if (!skillDir) {
  console.log("Usage: package-skill.ts <skill-dir> [output-dir]");
  process.exit(1);
}

if (!fs.existsSync(skillDir)) {
  console.error(JSON.stringify({
    status: "error",
    message: `Skill directory not found: ${skillDir}`,
  }, null, 2));
  process.exit(1);
}

// Validate
const validation = validateSkill(skillDir);

if (!validation.valid) {
  console.error(JSON.stringify({
    status: "validation_failed",
    errors: validation.errors,
    warnings: validation.warnings,
  }, null, 2));
  process.exit(1);
}

if (validation.warnings.length > 0) {
  console.warn(JSON.stringify({
    status: "warnings",
    warnings: validation.warnings,
  }, null, 2));
}

// Package
await packageSkill(skillDir, outputDir);
```

---

# claude-skill-qa

## SKILL.md

````markdown
---
name: claude-skill-qa
description: Debug, analyze, lint, and validate Claude skills. Use when a skill isn't triggering correctly, seems bloated, needs quality checks, or when comparing skills for overlap. Provides ast-grep linting, token analysis, semantic diff, and trigger simulation.
---

# Claude Skill QA

## Quick Start

| Task | Command |
|------|---------|
| Lint a skill | `bun run scripts/lint-skill.ts <skill-dir>` |
| Analyze structure | `bun run scripts/analyze-skill.ts <skill-dir>` |
| Compare two skills | `bun run scripts/diff-skills.ts <skill-a> <skill-b>` |
| Test trigger | `bun run scripts/dry-run-skill.ts <skill-dir> "<prompt>"` |

## Diagnosing Issues

### "My skill isn't triggering"

See `references/trigger-debugging.md`. Quick checks:

1. **Description too vague?** Must include specific capabilities and contexts
2. **Trigger words missing?** Add phrases users actually say
3. **Competing with another skill?** Run diff to check overlap

### "My skill is slow / using too much context"

Run `analyze-skill.ts` to check:
- Total token count
- SKILL.md line count (should be <500)
- Reference file sizes
- Unreferenced files

### "I'm not sure if my skill is well-formed"

Run `lint-skill.ts` which checks:
- Frontmatter structure
- Description quality
- File references
- Script issues (hardcoded paths, missing error handling)

## Tools

### lint-skill.ts

Static analysis using ast-grep rules.

```bash
bun run scripts/lint-skill.ts ./my-skill
```

Output:
```json
{
  "status": "pass|fail",
  "errors": [...],
  "warnings": [...]
}
```

Rules defined in `rules/skill-md.yml` and `rules/scripts-ts.yml`.

### analyze-skill.ts

Structural analysis with optional agent commentary.

```bash
bun run scripts/analyze-skill.ts ./my-skill
bun run scripts/analyze-skill.ts ./my-skill --agent  # include Claude analysis
```

Output:
```json
{
  "tokenEstimate": 1234,
  "lineCount": 150,
  "files": [...],
  "references": [...],
  "unreferencedFiles": [...],
  "agentCommentary": "..." // if --agent
}
```

### diff-skills.ts

Agent-driven semantic comparison.

```bash
bun run scripts/diff-skills.ts ./skill-a ./skill-b
```

Produces markdown document covering:
- Trigger overlap
- Capability differences
- Structural comparison
- Recommendations

### dry-run-skill.ts

Test if a prompt would trigger a skill.

```bash
bun run scripts/dry-run-skill.ts ./my-skill "Help me create a PowerPoint"
```

Uses two-phase approach:
1. Fast simulation (would Claude likely trigger this?)
2. Optional real invocation to confirm
````

---

## references/trigger-debugging.md

````markdown
# Trigger Debugging Guide

## How Skill Triggering Works

1. Claude sees **only frontmatter** (name + description) for all skills
2. Based on user prompt, Claude decides which skills to invoke
3. **Only then** does SKILL.md body load

Implication: Everything about "when to use" must be in `description`.

## Common Trigger Failures

### 1. Description Too Abstract

```yaml
# ❌ Won't trigger reliably
description: Helps with documents

# ✅ Specific triggers
description: Create, edit, and analyze Word documents (.docx). Use for creating new docs, modifying content, tracked changes, comments, or text extraction from Word files.
```

### 2. Missing User Vocabulary

Think about what users actually say:

```yaml
# ❌ Technical terms only
description: OOXML manipulation toolkit

# ✅ User language + technical
description: Work with Word documents (.docx files). Use when users ask to "write a doc", "edit my document", "add comments", or "track changes". Also handles OOXML manipulation.
```

### 3. Competing Skills

If two skills have similar descriptions, triggering becomes unpredictable.

Use `diff-skills.ts` to check for overlap. Resolution options:
- Make descriptions more distinct
- Merge skills if overlap is fundamental
- Add explicit "do NOT use when..." guidance

### 4. Description Too Long

Long descriptions can dilute trigger signals.

```yaml
# ❌ Wall of text
description: This comprehensive skill handles all aspects of document processing including but not limited to creating new documents from scratch with support for headers, footers, tables, images, and formatting, as well as editing existing documents while preserving all formatting and tracked changes, plus extracting text content and metadata...

# ✅ Focused
description: Create and edit Word documents (.docx). Supports formatting, tracked changes, comments, and text extraction.
```

## Testing Triggers

### Manual Test

Ask Claude directly:

> "Given these skill descriptions, which would you use for 'help me write a cover letter'?"
> 
> Skill A: [description]
> Skill B: [description]

### Automated Test

```bash
bun run scripts/dry-run-skill.ts ./my-skill "help me write a cover letter"
```

## Debugging Checklist

- [ ] Description includes specific file types/formats
- [ ] Description includes user-language trigger phrases
- [ ] Description is under 200 words
- [ ] No competing skills with similar descriptions
- [ ] Ran dry-run with 5+ realistic prompts
````

---

## references/common-issues.md

````markdown
# Common Skill Issues

## Structural Issues

### Unreferenced Files

Files in skill directory that SKILL.md never mentions.

**Symptoms:** Bloated skill, confusion about what's used  
**Fix:** Either reference the file or delete it

### Circular References

File A references file B which references file A.

**Symptoms:** Potential infinite loops in loading  
**Fix:** Restructure to have clear hierarchy

### Orphaned Scripts

Scripts in `scripts/` not documented in SKILL.md.

**Symptoms:** Agent doesn't know scripts exist  
**Fix:** Document in SKILL.md or delete

## Content Issues

### Context Bloat

SKILL.md too long, loading unnecessary content.

**Symptoms:** Slow performance, hitting context limits  
**Fix:** Split into references/, load on demand

### Stale References

SKILL.md references files that don't exist.

**Symptoms:** Errors when agent tries to load  
**Fix:** Update references or create missing files

### Placeholder Text

TODO markers, {{PLACEHOLDERS}} still present.

**Symptoms:** Confusing/broken behavior  
**Fix:** Complete all placeholders before packaging

## Script Issues

### Hardcoded Paths

Absolute paths that only work on one machine.

**Symptoms:** "File not found" on other systems  
**Fix:** Use relative paths from script location

### Missing Error Handling

Scripts that crash without useful messages.

**Symptoms:** Cryptic failures  
**Fix:** Add try/catch with actionable error messages

### No Structured Output

Scripts that console.log prose instead of JSON.

**Symptoms:** Hard for agent to parse results  
**Fix:** Output JSON, use --verbose for human-readable
````

---

## rules/skill-md.yml

```yaml
# ast-grep rules for SKILL.md linting
# Run with: ast-grep scan --rule rules/skill-md.yml

rules:
  - id: missing-frontmatter
    message: "SKILL.md must start with YAML frontmatter (---)"
    severity: error
    language: markdown
    # Note: ast-grep markdown support is limited
    # This is a placeholder - actual implementation may use custom parser

  - id: todo-placeholder
    message: "Found TODO placeholder - complete before packaging"
    severity: warning
    pattern: "TODO"
    
  - id: placeholder-brackets
    message: "Found {{PLACEHOLDER}} - replace with actual content"
    severity: error
    pattern: "{{$VAR}}"
```

---

## rules/scripts-ts.yml

```yaml
# ast-grep rules for TypeScript script linting

rules:
  - id: hardcoded-absolute-path
    message: "Avoid absolute paths - use relative paths from script location"
    severity: error
    language: typescript
    pattern: |
      "/Users/$$$"
      
  - id: hardcoded-home-path  
    message: "Avoid hardcoded home paths"
    severity: error
    language: typescript
    pattern: |
      "/home/$$$"

  - id: console-log-in-output
    message: "Consider structured JSON output instead of console.log"
    severity: warning
    language: typescript
    pattern: |
      console.log($MSG)
    # Exclude if inside verbose/debug block

  - id: missing-error-handling
    message: "fs operations should have error handling"
    severity: warning
    language: typescript
    pattern: |
      fs.readFileSync($PATH)
    # Should be wrapped in try/catch or existence check
```

---

## scripts/lint-skill.ts

```typescript
#!/usr/bin/env bun

/**
 * Lint a Claude skill using ast-grep rules and custom checks
 * 
 * Usage: bun run lint-skill.ts <skill-dir>
 */

import * as fs from "fs";
import * as path from "path";
import { $ } from "bun";

interface LintResult {
  status: "pass" | "fail";
  errors: string[];
  warnings: string[];
}

async function lintSkillMd(skillDir: string): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const skillMdPath = path.join(skillDir, "SKILL.md");
  
  if (!fs.existsSync(skillMdPath)) {
    errors.push("Missing SKILL.md");
    return { errors, warnings };
  }
  
  const content = fs.readFileSync(skillMdPath, "utf-8");
  
  // Frontmatter checks
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push("Missing YAML frontmatter");
  } else {
    const fm = frontmatterMatch[1];
    if (!fm.includes("name:")) errors.push("Frontmatter missing 'name'");
    if (!fm.includes("description:")) errors.push("Frontmatter missing 'description'");
    
    const descMatch = fm.match(/description:\s*["']?([\s\S]*?)["']?(?=\n[a-z]|\n---|\n$)/i);
    if (descMatch && descMatch[1].length < 50) {
      warnings.push("Description seems short (<50 chars)");
    }
  }
  
  // Content checks
  if (content.includes("TODO")) {
    warnings.push("Contains TODO markers");
  }
  
  if (/\{\{[A-Z_]+\}\}/.test(content)) {
    errors.push("Contains {{PLACEHOLDER}} markers");
  }
  
  const lines = content.split("\n").length;
  if (lines > 500) {
    warnings.push(`SKILL.md is ${lines} lines (recommend <500)`);
  }
  
  // Check for referenced files that don't exist
  const refMatches = content.matchAll(/\[.*?\]\(([^)]+)\)/g);
  for (const match of refMatches) {
    const ref = match[1];
    if (!ref.startsWith("http") && !ref.startsWith("#")) {
      const refPath = path.join(skillDir, ref);
      if (!fs.existsSync(refPath)) {
        errors.push(`Broken reference: ${ref}`);
      }
    }
  }
  
  return { errors, warnings };
}

async function lintScripts(skillDir: string): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const scriptsDir = path.join(skillDir, "scripts");
  if (!fs.existsSync(scriptsDir)) {
    return { errors, warnings };
  }
  
  const scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith(".ts"));
  
  for (const script of scripts) {
    const content = fs.readFileSync(path.join(scriptsDir, script), "utf-8");
    
    // Hardcoded paths
    if (/["'`]\/Users\//.test(content) || /["'`]\/home\/(?!claude)/.test(content)) {
      errors.push(`${script}: Contains hardcoded absolute path`);
    }
    
    // Basic error handling check
    if (content.includes("fs.readFileSync") && !content.includes("existsSync") && !content.includes("try")) {
      warnings.push(`${script}: fs.readFileSync without error handling`);
    }
  }
  
  return { errors, warnings };
}

async function main() {
  const [skillDir] = process.argv.slice(2);
  
  if (!skillDir) {
    console.log("Usage: lint-skill.ts <skill-dir>");
    process.exit(1);
  }
  
  if (!fs.existsSync(skillDir)) {
    console.error(JSON.stringify({ status: "fail", errors: [`Directory not found: ${skillDir}`], warnings: [] }));
    process.exit(1);
  }
  
  const mdLint = await lintSkillMd(skillDir);
  const scriptLint = await lintScripts(skillDir);
  
  const result: LintResult = {
    status: (mdLint.errors.length + scriptLint.errors.length) === 0 ? "pass" : "fail",
    errors: [...mdLint.errors, ...scriptLint.errors],
    warnings: [...mdLint.warnings, ...scriptLint.warnings],
  };
  
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "pass" ? 0 : 1);
}

main();
```

---

## scripts/analyze-skill.ts

```typescript
#!/usr/bin/env bun

/**
 * Analyze a Claude skill's structure and token usage
 * 
 * Usage: 
 *   bun run analyze-skill.ts <skill-dir>
 *   bun run analyze-skill.ts <skill-dir> --agent  # include Claude commentary
 */

import * as fs from "fs";
import * as path from "path";
import { $ } from "bun";

interface FileInfo {
  path: string;
  lines: number;
  estimatedTokens: number;
  referenced: boolean;
}

interface AnalysisResult {
  skillName: string;
  totalEstimatedTokens: number;
  skillMdLines: number;
  files: FileInfo[];
  unreferencedFiles: string[];
  referencedButMissing: string[];
  agentCommentary?: string;
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
}

function getAllFiles(dir: string, base = ""): string[] {
  const files: string[] = [];
  
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

function findReferences(content: string): string[] {
  const refs: string[] = [];
  
  // Markdown links
  const mdLinks = content.matchAll(/\[.*?\]\(([^)]+)\)/g);
  for (const match of mdLinks) {
    if (!match[1].startsWith("http") && !match[1].startsWith("#")) {
      refs.push(match[1]);
    }
  }
  
  // Code references (import, require, path strings)
  const codeRefs = content.matchAll(/(?:from |require\(|import )["']\.\.?\/([^"']+)["']/g);
  for (const match of codeRefs) {
    refs.push(match[1]);
  }
  
  return refs;
}

async function analyzeSkill(skillDir: string, includeAgent: boolean): Promise<AnalysisResult> {
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const skillMdContent = fs.readFileSync(skillMdPath, "utf-8");
  
  // Extract name from frontmatter
  const nameMatch = skillMdContent.match(/name:\s*(.+)/);
  const skillName = nameMatch ? nameMatch[1].trim() : path.basename(skillDir);
  
  // Get all files
  const allFiles = getAllFiles(skillDir);
  
  // Find all references in SKILL.md
  const references = findReferences(skillMdContent);
  
  // Analyze each file
  const fileInfos: FileInfo[] = [];
  let totalTokens = 0;
  
  for (const file of allFiles) {
    const fullPath = path.join(skillDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n").length;
    const tokens = estimateTokens(content);
    
    const referenced = file === "SKILL.md" || references.some(r => file.includes(r) || r.includes(file));
    
    fileInfos.push({
      path: file,
      lines,
      estimatedTokens: tokens,
      referenced,
    });
    
    totalTokens += tokens;
  }
  
  // Find unreferenced files (excluding SKILL.md and LICENSE)
  const unreferenced = fileInfos
    .filter(f => !f.referenced && f.path !== "SKILL.md" && f.path !== "LICENSE.txt")
    .map(f => f.path);
  
  // Find referenced but missing files
  const existingFiles = new Set(allFiles);
  const missing = references.filter(r => !existingFiles.has(r) && !existingFiles.has(r.replace(/^\.\//, "")));
  
  const result: AnalysisResult = {
    skillName,
    totalEstimatedTokens: totalTokens,
    skillMdLines: skillMdContent.split("\n").length,
    files: fileInfos,
    unreferencedFiles: unreferenced,
    referencedButMissing: missing,
  };
  
  // Optional: Get Claude's analysis
  if (includeAgent) {
    try {
      const prompt = `Analyze this Claude skill structure and provide brief commentary on:
1. Is the description effective for triggering?
2. Is the structure well-organized?
3. Any obvious improvements?

SKILL.md content:
${skillMdContent.slice(0, 2000)}

File structure:
${fileInfos.map(f => `${f.path} (${f.lines} lines)`).join("\n")}

Respond in 3-4 sentences.`;

      const agentResult = await $`echo ${prompt} | claude --print`.text();
      result.agentCommentary = agentResult.trim();
    } catch (e) {
      result.agentCommentary = "(Agent analysis failed - is Claude CLI installed?)";
    }
  }
  
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const includeAgent = args.includes("--agent");
  const skillDir = args.find(a => !a.startsWith("--"));
  
  if (!skillDir) {
    console.log("Usage: analyze-skill.ts <skill-dir> [--agent]");
    process.exit(1);
  }
  
  if (!fs.existsSync(skillDir)) {
    console.error(JSON.stringify({ error: `Directory not found: ${skillDir}` }));
    process.exit(1);
  }
  
  const result = await analyzeSkill(skillDir, includeAgent);
  console.log(JSON.stringify(result, null, 2));
}

main();
```

---

## scripts/diff-skills.ts

```typescript
#!/usr/bin/env bun

/**
 * Compare two Claude skills using agent-driven semantic analysis
 * 
 * Usage: bun run diff-skills.ts <skill-a> <skill-b> [--output <file>]
 */

import * as fs from "fs";
import * as path from "path";
import { $ } from "bun";

interface SkillSummary {
  name: string;
  description: string;
  capabilities: string[];
  files: string[];
}

function extractSkillSummary(skillDir: string): SkillSummary {
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const content = fs.readFileSync(skillMdPath, "utf-8");
  
  const nameMatch = content.match(/name:\s*(.+)/);
  const descMatch = content.match(/description:\s*["']?([\s\S]*?)["']?(?=\n[a-z]|\n---)/i);
  
  // Extract capabilities from headers
  const capabilities = [...content.matchAll(/^##\s+(.+)/gm)].map(m => m[1]);
  
  // Get file list
  const files = fs.readdirSync(skillDir, { recursive: true })
    .filter(f => typeof f === "string")
    .map(f => f as string);
  
  return {
    name: nameMatch ? nameMatch[1].trim() : path.basename(skillDir),
    description: descMatch ? descMatch[1].trim() : "",
    capabilities,
    files,
  };
}

async function diffSkills(skillDirA: string, skillDirB: string): Promise<string> {
  const summaryA = extractSkillSummary(skillDirA);
  const summaryB = extractSkillSummary(skillDirB);
  
  const prompt = `Compare these two Claude skills and produce a markdown analysis document.

## Skill A: ${summaryA.name}
Description: ${summaryA.description}
Capabilities: ${summaryA.capabilities.join(", ")}
Files: ${summaryA.files.join(", ")}

## Skill B: ${summaryB.name}
Description: ${summaryB.description}
Capabilities: ${summaryB.capabilities.join(", ")}
Files: ${summaryB.files.join(", ")}

Analyze:
1. **Trigger Overlap**: Would similar prompts trigger both skills? Rate overlap 0-100%.
2. **Capability Comparison**: What does each do that the other doesn't?
3. **Structural Differences**: How do their organizations differ?
4. **Recommendations**: Should they be merged? Split differently? How to reduce overlap?

Output as a well-formatted markdown document.`;

  try {
    const result = await $`echo ${prompt} | claude --print`.text();
    return result;
  } catch (e) {
    return `# Skill Comparison Failed

Could not run Claude CLI. Ensure it's installed and authenticated.

## Manual Comparison

### Skill A: ${summaryA.name}
${summaryA.description}

### Skill B: ${summaryB.name}
${summaryB.description}
`;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const outputIdx = args.indexOf("--output");
  let outputFile: string | null = null;
  
  if (outputIdx !== -1) {
    outputFile = args[outputIdx + 1];
    args.splice(outputIdx, 2);
  }
  
  const [skillDirA, skillDirB] = args;
  
  if (!skillDirA || !skillDirB) {
    console.log("Usage: diff-skills.ts <skill-a> <skill-b> [--output <file>]");
    process.exit(1);
  }
  
  for (const dir of [skillDirA, skillDirB]) {
    if (!fs.existsSync(dir)) {
      console.error(`Directory not found: ${dir}`);
      process.exit(1);
    }
  }
  
  const result = await diffSkills(skillDirA, skillDirB);
  
  if (outputFile) {
    fs.writeFileSync(outputFile, result);
    console.log(JSON.stringify({ status: "success", outputFile }));
  } else {
    console.log(result);
  }
}

main();
```

---

## scripts/dry-run-skill.ts

```typescript
#!/usr/bin/env bun

/**
 * Test if a prompt would trigger a skill
 * 
 * Usage: bun run dry-run-skill.ts <skill-dir> "<prompt>"
 */

import * as fs from "fs";
import * as path from "path";
import { $ } from "bun";

interface DryRunResult {
  prompt: string;
  skillName: string;
  phase1: {
    wouldTrigger: boolean;
    confidence: "high" | "medium" | "low";
    reasoning: string;
  };
  phase2?: {
    actuallyTriggered: boolean;
    evidence: string;
  };
}

function extractFrontmatter(skillDir: string): { name: string; description: string } {
  const content = fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf-8");
  const nameMatch = content.match(/name:\s*(.+)/);
  const descMatch = content.match(/description:\s*["']?([\s\S]*?)["']?(?=\n[a-z]|\n---)/i);
  
  return {
    name: nameMatch ? nameMatch[1].trim() : path.basename(skillDir),
    description: descMatch ? descMatch[1].trim() : "",
  };
}

async function phase1Simulation(
  skillName: string, 
  skillDescription: string, 
  prompt: string
): Promise<DryRunResult["phase1"]> {
  const simulationPrompt = `You are simulating Claude's skill-matching behavior.

Given this skill:
Name: ${skillName}
Description: ${skillDescription}

And this user prompt:
"${prompt}"

Would you invoke this skill? Respond with JSON only:
{
  "wouldTrigger": true/false,
  "confidence": "high"/"medium"/"low",
  "reasoning": "brief explanation"
}`;

  try {
    const result = await $`echo ${simulationPrompt} | claude --print`.text();
    
    // Try to parse JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      wouldTrigger: false,
      confidence: "low",
      reasoning: "Could not parse simulation response",
    };
  } catch (e) {
    return {
      wouldTrigger: false,
      confidence: "low",
      reasoning: `Simulation failed: ${e}`,
    };
  }
}

async function main() {
  const [skillDir, prompt] = process.argv.slice(2);
  
  if (!skillDir || !prompt) {
    console.log('Usage: dry-run-skill.ts <skill-dir> "<prompt>"');
    process.exit(1);
  }
  
  if (!fs.existsSync(skillDir)) {
    console.error(JSON.stringify({ error: `Directory not found: ${skillDir}` }));
    process.exit(1);
  }
  
  const { name, description } = extractFrontmatter(skillDir);
  
  // Phase 1: Simulation
  const phase1 = await phase1Simulation(name, description, prompt);
  
  const result: DryRunResult = {
    prompt,
    skillName: name,
    phase1,
  };
  
  // Phase 2 would go here (actual invocation) - commented out for now
  // as it requires more infrastructure to capture tool calls
  
  console.log(JSON.stringify(result, null, 2));
  
  // Exit code based on trigger prediction
  process.exit(phase1.wouldTrigger ? 0 : 1);
}

main();
```

---

## Next Steps

1. Review the structure and content
2. Identify any gaps or adjustments
3. Create actual files in a repository
4. Test the scripts
5. Iterate based on real usage