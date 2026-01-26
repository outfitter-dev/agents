# Advanced Skill Patterns

Patterns from official Anthropic examples and production skills. These extend the core concepts in [SKILL.md](../SKILL.md) and [best-practices.md](./best-practices.md).

## Table of Contents

- [Degrees of Freedom](#degrees-of-freedom)
- [Script Design Principles](#script-design-principles)
- [Variant Organization](#variant-organization)
- [Reference File Structure](#reference-file-structure)
- [Visual Indicators](#visual-indicators)
- [Writing Patterns](#writing-patterns)
- [Naming Patterns](#naming-patterns)

---

## Degrees of Freedom

Control how much latitude Claude has when executing instructions.

### High Freedom (Text Instructions)

Use when multiple valid approaches exist. Claude applies judgment.

```markdown
## Data Validation

Validate user input before processing. Check for:
- Required fields present
- Data types match schema
- Values within acceptable ranges

Handle invalid input gracefully with clear error messages.
```

**When to use:** Creative tasks, flexible requirements, exploratory work.

### Medium Freedom (Pseudocode)

Use when a preferred pattern exists but variation is acceptable.

```markdown
## Data Validation

1. Extract fields from input
2. For each field:
   - Check type matches schema[field].type
   - Check value passes schema[field].validator
   - Collect errors for invalid fields
3. If errors: return { valid: false, errors }
4. Return { valid: true, data: sanitized }
```

**When to use:** Standard workflows, established patterns, moderate complexity.

### Low Freedom (Specific Scripts)

Use for fragile operations requiring exact sequences.

```markdown
## Data Validation

Run the validation script:

```bash
bun run scripts/validate.ts --schema=user.json --input=$INPUT_FILE
```

Do not modify the validation logic inline. If changes are needed, update scripts/validate.ts.

```

**When to use:** Security-critical, deterministic reliability, complex algorithms.

### Selection Guide

| Scenario | Freedom Level |
|----------|---------------|
| Creative writing, exploration | High |
| Standard CRUD operations | Medium |
| Authentication flows | Low |
| Database migrations | Low |
| API integrations | Medium |
| Error message formatting | High |
| Cryptographic operations | Low (always script) |

---

## Script Design Principles

Scripts in `scripts/` should be robust and informative.

### Solve, Don't Punt

Scripts should handle errors explicitly rather than failing to Claude.

**Good (solves the problem):**

```python
def process_file(path: str) -> str:
    """Process file, creating if doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found. Creating empty file.")
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).touch()
        return ""
    except PermissionError:
        print(f"Permission denied for {path}. Try: chmod 644 {path}")
        raise
```

**Bad (punts to Claude):**

```python
def process_file(path: str) -> str:
    return open(path).read()  # Fails, Claude figures it out
```

### Actionable Error Messages

Include specific suggestions for resolution.

```python
if not api_key:
    print("Error: API_KEY not set")
    print("Fix: export API_KEY=your-key-here")
    print("Or create .env file with API_KEY=...")
    sys.exit(1)
```

### Document Non-Obvious Values

No "voodoo constants" - explain why values are chosen.

```python
# Rate limit: 100 requests per minute (API docs: https://api.example.com/limits)
RATE_LIMIT = 100

# Timeout: 30s based on P99 latency from production metrics
TIMEOUT_SECONDS = 30

# Retry count: 3 attempts covers transient failures without excessive delay
MAX_RETRIES = 3
```

### Test Before Including

Run scripts with representative samples before bundling.

```markdown
## Testing Checklist

- [ ] Script runs on clean environment
- [ ] Handles missing dependencies gracefully
- [ ] Error messages are actionable
- [ ] Output format matches skill expectations
- [ ] No hardcoded paths or credentials
```

---

## Variant Organization

For skills supporting multiple frameworks, providers, or approaches.

### Pattern: Selection in SKILL.md, Details in References

**SKILL.md structure:**

```markdown
# Cloud Deployment

Deploy applications to major cloud providers.

## Provider Selection

| Provider | Best For |
|----------|----------|
| AWS | Enterprise, full-stack |
| GCP | Data/ML workloads |
| Azure | Microsoft ecosystem |

Choose provider based on requirements, then see specific guide.

## Deployment Workflow

1. Configure credentials (provider-specific)
2. Define infrastructure (see provider guide)
3. Deploy: `deploy.sh --provider=<provider>`
4. Verify deployment health

## Provider Guides

- **AWS**: See [references/aws.md](references/aws.md)
- **GCP**: See [references/gcp.md](references/gcp.md)
- **Azure**: See [references/azure.md](references/azure.md)
```

**Each reference file is complete and standalone:**

```markdown
# AWS Deployment Guide

Complete guide for deploying to AWS.

## Prerequisites
- AWS CLI installed
- IAM credentials configured

## Infrastructure Setup
[Complete AWS-specific content]

## Deployment
[Complete AWS-specific content]

## Troubleshooting
[AWS-specific issues]
```

### Why This Pattern Works

1. **Context efficiency**: Only load the relevant variant
2. **Independent evolution**: Update one provider without touching others
3. **Clear selection**: User picks once, then gets focused content
4. **No cross-contamination**: Each guide is complete without assumptions

### Anti-Pattern: Mixed Content

**Avoid:**

```markdown
## Deployment

For AWS: `aws s3 cp`
For GCP: `gsutil cp`
For Azure: `az storage blob upload`

Then for AWS do X, but for GCP do Y, and Azure is different...
```

This creates cognitive load and wastes tokens.

---

## Reference File Structure

Patterns for organizing reference files effectively.

### Table of Contents for Large Files

Files over 100 lines should include a TOC for partial reads.

```markdown
# API Reference

## Contents

- [Authentication](#authentication) - Setup and credential management
- [Core Methods](#core-methods) - CRUD operations
- [Batch Operations](#batch-operations) - Bulk processing
- [Webhooks](#webhooks) - Event notifications
- [Error Handling](#error-handling) - Status codes and recovery
- [Rate Limits](#rate-limits) - Throttling and quotas

---

## Authentication

[Section content...]

## Core Methods

[Section content...]
```

**Why it matters:** Claude may use `head -100` previews. A TOC ensures visibility of full scope even in partial reads.

### Conditional Loading Patterns

**Bold keywords with links:**

```markdown
**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For complex formatting**: See [OOXML.md](OOXML.md)
```

**Bullet arrows:**

```markdown
- **Form filling** -> See [FORMS.md](FORMS.md) for complete guide
- **API reference** -> See [REFERENCE.md](REFERENCE.md) for all methods
```

**Domain-based routing:**

```markdown
## Available Datasets

- **Finance**: Revenue, ARR, billing -> See [finance.md](references/finance.md)
- **Sales**: Opportunities, pipeline -> See [sales.md](references/sales.md)
- **Product**: API usage, features -> See [product.md](references/product.md)

## Quick Search

Find specific metrics:
```bash
grep -i "revenue" references/finance.md
```

```

### Keep References One Level Deep

```

# Good

SKILL.md -> reference.md

# Bad (too deep)

SKILL.md -> advanced.md -> details.md -> specifics.md

```

Claude may partially read nested files, getting incomplete information.

### Topic-Based File Naming

```

references/
├── finance.md          # Clear domain
├── sales.md
└── product.md

```

**Not:**

```

references/
├── doc1.md             # What's in this?
├── reference2.md
└── stuff.md

```

---

## Visual Indicators

Emoji conventions from official Anthropic skills.

### Reference Type Indicators

| Emoji | Meaning | Example |
|-------|---------|---------|
| `[icon]` | Guidelines/checklist | `[checklist] MCP Best Practices` |
| `[lightning]` | Quick guide | `[lightning] Quick Start` |
| `[python]` | Python-specific | `[python] Python Setup` |
| `[check]` | Evaluation/testing | `[check] Test Suite` |

**In context:**

```markdown
Load these resources as needed:
- [checklist] [MCP Best Practices](references/best-practices.md)
- [lightning] [Quick Start](references/quick-start.md)
- [python] [Python Client](references/python.md)
```

### Status Indicators

```markdown
## Implementation Status

- [check] Core API endpoints
- [check] Authentication flow
- [pending] Webhook handlers
- [x] Rate limiting
```

### When to Use

- Making references scannable
- Indicating content type at a glance
- Categorizing in lists

### When to Avoid

- Main body text (distracting)
- Already-clear headings
- User-facing output (unless requested)

---

## Writing Patterns

Consistent style for skill instructions.

### Imperative Voice

Always use imperative/infinitive form.

```markdown
# Good
Run the script.
Create a mapping.
Validate the output.

# Bad
You should run the script.
The script can be run.
It's recommended to run the script.
```

### Concise Examples Over Explanations

Assume Claude's base knowledge. Don't explain fundamentals.

**Good:**

```python
# Extract text from PDF
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

**Bad:**

```markdown
PDFs (Portable Document Format) are a common file format developed by Adobe
that contains text, images, and formatting information. To extract text from
a PDF file, you'll need to use a specialized library. We recommend pdfplumber
because it's easy to use and handles most PDF formats. First, you'll need to
install it with pip install pdfplumber, then you can open the file and...

[50 more lines explaining basic concepts]
```

### Template Pattern

For strict output requirements, provide exact templates.

```markdown
ALWAYS use this exact commit message format:

```

<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

Example:

```
feat(auth): add refresh token rotation

Implements automatic token rotation on refresh to improve security.
Tokens are invalidated after single use.

Closes #123
```

```

### Checklist Pattern

For multi-step validation workflows.

```markdown
## Pre-Deploy Checklist

- [ ] All tests pass: `bun test`
- [ ] No linting errors: `bun lint`
- [ ] Build succeeds: `bun run build`
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Health check endpoint responds

Do not proceed until all items are checked.
```

---

## Naming Patterns

Conventions for skill, file, and reference naming.

### Gerund Form (Preferred)

Use verb + -ing form for skill names.

```
processing-pdfs
analyzing-spreadsheets
managing-databases
testing-code
writing-documentation
deploying-applications
debugging-issues
```

### Noun Form (Acceptable)

When gerund feels awkward.

```
pdf-processing
spreadsheet-analysis
code-review
api-integration
```

### Avoid

```
# Vague
helper
utils
tools
stuff

# Too Generic
documents
data
files
code

# Reserved Words
anthropic-helper
claude-tools
claude-assistant
```

### File Naming

```
references/
├── authentication.md    # Domain topic
├── error-handling.md    # Concept
├── aws-deployment.md    # Variant-specific
└── quick-start.md       # Purpose
```

**Not:**

```
references/
├── ref1.md
├── DOCS.md
├── more_stuff.md
└── NEW-FILE.md
```

---

## Summary

| Pattern | When to Use |
|---------|-------------|
| Degrees of Freedom | Control Claude's latitude per task type |
| Solve Don't Punt | Scripts should handle errors, not fail to Claude |
| Variant Organization | Multi-framework/provider skills |
| TOC in References | Large files (>100 lines) |
| Visual Indicators | Make reference lists scannable |
| Imperative Voice | All instructions |
| Gerund Naming | Skill and file names |

## Sources

Patterns derived from:
- Official Anthropic skills repository (pdf, skill-creator, mcp-builder)
- Anthropic Agent Skills Best Practices documentation
- Production skill analysis

Last updated: 2026-01-10
