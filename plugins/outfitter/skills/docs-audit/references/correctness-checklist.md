# Documentation Correctness Checklist

Use this checklist when auditing documentation for accuracy against the current codebase.

## Code Examples

### Import Statements
- [ ] Import paths resolve to existing files
- [ ] Named imports match actual exports
- [ ] Package names match `package.json` / `Cargo.toml` / `pyproject.toml`
- [ ] Relative vs absolute imports are correct for the context

**How to verify:**
```bash
# Extract import from doc, check if file exists
grep -E "^import|^from|^require" {doc_file} | head -5
# Then verify each path exists
```

### Function Signatures
- [ ] Function names exist in codebase
- [ ] Parameter names match implementation
- [ ] Parameter types are accurate
- [ ] Return types are accurate
- [ ] Optional parameters marked correctly

**How to verify:**
```bash
# Find function definition in code
grep -rn "function {name}\|{name} = \|def {name}\|fn {name}" --include="*.ts" --include="*.py" --include="*.rs"
```

### Configuration Examples
- [ ] Config keys exist in schema/types
- [ ] Default values match implementation
- [ ] Required vs optional fields accurate
- [ ] Value types (string, number, boolean) correct

**How to verify:**
```bash
# Find config type/interface
grep -rn "interface.*Config\|type.*Config\|Config = " --include="*.ts"
```

## CLI Documentation

### Commands
- [ ] Command names are correct
- [ ] Subcommands exist
- [ ] Command descriptions accurate

### Flags/Options
- [ ] Flag names (short and long) correct
- [ ] Flag descriptions accurate
- [ ] Default values documented correctly
- [ ] Required flags marked as such

**How to verify:**
```bash
# Run help command
{cli} --help
{cli} {subcommand} --help
```

## API Documentation

### Endpoints
- [ ] HTTP methods correct (GET, POST, etc.)
- [ ] URL paths accurate
- [ ] Query parameters documented
- [ ] Request body schema matches implementation
- [ ] Response schema matches implementation
- [ ] Status codes documented

**How to verify:**
```bash
# Find route definitions
grep -rn "app.get\|app.post\|router\." --include="*.ts" --include="*.js"
# Or for OpenAPI
cat openapi.yaml | grep "paths:" -A 100
```

### Authentication
- [ ] Auth methods accurate (Bearer, API key, etc.)
- [ ] Required headers documented
- [ ] Error responses for auth failures documented

## Environment Variables

- [ ] Variable names match actual usage
- [ ] Descriptions accurate
- [ ] Required vs optional clearly marked
- [ ] Example values are realistic (not revealing secrets)

**How to verify:**
```bash
# Find env var usage
grep -rn "process.env\|os.environ\|env::" --include="*.ts" --include="*.py" --include="*.rs"
# Or check .env.example
cat .env.example
```

## Error Messages

- [ ] Documented errors actually thrown by code
- [ ] Error codes/types match implementation
- [ ] Troubleshooting steps are accurate

**How to verify:**
```bash
# Find error definitions
grep -rn "throw new\|raise \|Error::" --include="*.ts" --include="*.py" --include="*.rs"
```

## Version-Specific Features

- [ ] Features available in documented version
- [ ] Deprecated features marked
- [ ] Breaking changes noted with versions
- [ ] Minimum version requirements accurate

## Severity Classification

When an issue is found, classify it:

| Severity | Criteria | Example |
|----------|----------|---------|
| **Critical** | Will cause errors if user follows docs | Wrong import path, non-existent function |
| **High** | Will cause confusion or unexpected behavior | Wrong default value, missing required param |
| **Medium** | Incomplete but not wrong | Missing optional parameters, outdated example |
| **Low** | Cosmetic or minor | Typo in description, suboptimal example |
