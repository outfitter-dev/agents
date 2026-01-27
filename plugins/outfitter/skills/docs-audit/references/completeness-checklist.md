# Documentation Completeness Checklist

Use this checklist when auditing documentation for coverage and required content.

## Export Coverage

### TypeScript/JavaScript

Every public export should have documentation:

```typescript
// ✅ Documented export
/**
 * Processes user input and returns validated result.
 * @param input - Raw user input string
 * @returns Validated and sanitized input
 * @throws {ValidationError} If input fails validation
 */
export function processInput(input: string): ValidatedInput { ... }

// ❌ Undocumented export
export function processInput(input: string): ValidatedInput { ... }
```

**Check coverage:**
```bash
# Count exports
EXPORTS=$(grep -c "^export " src/**/*.ts)
# Count documented exports (/** before export)
DOCUMENTED=$(grep -B1 "^export " src/**/*.ts | grep -c "/\*\*")
# Coverage = DOCUMENTED / EXPORTS * 100
```

### Python

Every public function/class should have a docstring:

```python
# ✅ Documented
def process_input(input: str) -> ValidatedInput:
    """Process user input and return validated result.

    Args:
        input: Raw user input string

    Returns:
        Validated and sanitized input

    Raises:
        ValidationError: If input fails validation
    """
    ...

# ❌ Undocumented
def process_input(input: str) -> ValidatedInput:
    ...
```

### Rust

Every public item should have doc comments:

```rust
// ✅ Documented
/// Processes user input and returns validated result.
///
/// # Arguments
/// * `input` - Raw user input string
///
/// # Returns
/// Validated and sanitized input
///
/// # Errors
/// Returns `ValidationError` if input fails validation
pub fn process_input(input: &str) -> Result<ValidatedInput, ValidationError> { ... }

// ❌ Undocumented
pub fn process_input(input: &str) -> Result<ValidatedInput, ValidationError> { ... }
```

### Go

Every exported function should have a godoc comment:

```go
// ✅ Documented
// ProcessInput processes user input and returns validated result.
// It returns a ValidationError if input fails validation.
func ProcessInput(input string) (ValidatedInput, error) { ... }

// ❌ Undocumented
func ProcessInput(input string) (ValidatedInput, error) { ... }
```

## Required Sections by Document Type

### README.md

- [ ] **Title** - Clear project name
- [ ] **Description** - What it does (1-2 sentences)
- [ ] **Installation** - How to install/setup
- [ ] **Quick Start** - Minimal working example
- [ ] **Usage** - Basic usage patterns
- [ ] **License** - License type or link

**Nice to have:**
- [ ] Badges (build status, version, etc.)
- [ ] Table of contents (for long READMEs)
- [ ] Contributing guidelines or link
- [ ] Changelog or link

### API Reference

- [ ] **Overview** - What the API does
- [ ] **Authentication** - How to authenticate
- [ ] **Base URL** - API endpoint base
- [ ] **Endpoints** - All public endpoints documented
- [ ] **Request/Response** - Schemas for each endpoint
- [ ] **Errors** - Common error codes and meanings

### Configuration Reference

- [ ] **Overview** - What can be configured
- [ ] **File Location** - Where config lives
- [ ] **Format** - JSON, YAML, TOML, etc.
- [ ] **All Options** - Each config key documented
- [ ] **Defaults** - Default values listed
- [ ] **Examples** - Working config examples

### CLI Reference

- [ ] **Installation** - How to install
- [ ] **Commands** - All commands documented
- [ ] **Options** - Global and command-specific options
- [ ] **Examples** - Common usage examples
- [ ] **Exit Codes** - What different exit codes mean

### Contributing Guide

- [ ] **Setup** - Development environment setup
- [ ] **Workflow** - How to submit changes
- [ ] **Standards** - Code style, testing requirements
- [ ] **Review Process** - What to expect

### Changelog

- [ ] **Version Numbers** - Semantic versioning
- [ ] **Dates** - Release dates
- [ ] **Categories** - Added, Changed, Fixed, Removed
- [ ] **Migration Notes** - For breaking changes

## Cross-Reference Completeness

### Internal Links
- [ ] All mentioned features link to their docs
- [ ] Related concepts are cross-linked
- [ ] No dead internal links

### External Links
- [ ] Dependencies link to their docs
- [ ] Standards link to specifications
- [ ] Tools link to official sites

## Example Completeness

### Code Examples Should Include
- [ ] Necessary imports
- [ ] Variable declarations with types
- [ ] Error handling (where appropriate)
- [ ] Expected output (for non-obvious cases)

### Example Types Needed
- [ ] **Minimal** - Simplest possible usage
- [ ] **Typical** - Common real-world usage
- [ ] **Advanced** - Complex scenarios (if applicable)
- [ ] **Edge Cases** - Unusual but valid inputs

## Accessibility

- [ ] **Alt text** - Images have descriptive alt text
- [ ] **Headings** - Proper heading hierarchy (h1 > h2 > h3)
- [ ] **Code blocks** - Language specified for syntax highlighting
- [ ] **Tables** - Headers on tables

## Severity Classification

| Severity | Criteria | Example |
|----------|----------|---------|
| **Critical** | Core functionality undocumented | No installation instructions, main API undocumented |
| **High** | Important features undocumented | Missing error handling docs, no config reference |
| **Medium** | Nice-to-have sections missing | No contributing guide, missing advanced examples |
| **Low** | Polish items | Missing badges, no table of contents |
