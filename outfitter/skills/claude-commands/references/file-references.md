# File References Reference

Complete guide to including file contents in Claude Code slash commands.

## Overview

The `@` prefix includes file contents directly in the command context.

```markdown
Review this configuration: @package.json
```

---

## Syntax

### Basic Reference

```markdown
@path/to/file
```

**Example**:

```markdown
Analyze this file:
@src/main.ts
```

The entire contents of `src/main.ts` are included where `@src/main.ts` appears.

### With Arguments

Combine with command arguments:

```markdown
---
argument-hint: <file-path>
---

Explain this file: @$1
```

**Usage**: `/explain src/auth/login.ts`

---

## Path Resolution

### Relative Paths

Paths are relative to project root:

```markdown
@src/components/Button.tsx
@package.json
@.env.example
```

### Nested Paths

```markdown
@src/features/auth/middleware/validate.ts
```

### Current Directory

For commands in specific contexts:

```markdown
# If command is about current file
@$1
```

---

## Patterns

### Single File Analysis

```yaml
---
description: Explain a file in detail
argument-hint: <file-path>
---

# File Analysis

**File**: @$1

Provide detailed explanation:
1. Purpose and responsibility
2. Key functions and methods
3. Dependencies and imports
4. Potential improvements
```

### Multiple Files

```yaml
---
description: Compare implementations
argument-hint: <file1> <file2>
---

# Comparison

## File 1
@$1

## File 2
@$2

Compare these implementations:
- Architecture differences
- Performance implications
- Maintainability
```

### Configuration Review

```markdown
---
description: Review project configuration
---

# Configuration Review

## Package
@package.json

## TypeScript
@tsconfig.json

## Linter
@.eslintrc.json

Review configuration for:
- Consistency
- Best practices
- Potential issues
```

### Code + Tests

```yaml
---
description: Review implementation with tests
argument-hint: <source-file>
---

# Code Review

## Implementation
@$1

## Tests
@$1.test.ts

Review:
1. Does the implementation meet requirements?
2. Are tests comprehensive?
3. Edge cases covered?
```

---

## Limitations

### No Glob Patterns

File references don't support wildcards:

```markdown
# Not supported
@src/**/*.ts
@*.json
```

**Workaround**: Use bash to list files, then reference individually:

```markdown
Files to review:
!`find src -name '*.ts' -type f`

Review each file listed above.
```

Or prompt Claude to read files:

```markdown
Find all TypeScript files in src/auth/ and review them.
```

### Binary Files

Binary files produce unreadable output:

```markdown
# Don't do this
@image.png
@compiled.wasm
```

**Workaround**: Get file info instead:

```markdown
Image info: !`file assets/logo.png`
Image size: !`ls -lh assets/logo.png`
```

### Large Files

Very large files may be truncated. Claude will inform you if this happens.

**Best practice**: Reference specific portions when possible:

```markdown
Instead of the full log, show last 100 lines:
!`tail -100 app.log`
```

### Non-existent Files

Referencing missing files produces an error message in that location:

```markdown
Configuration: @config.json

# If config.json doesn't exist, shows error
```

---

## Combining with Other Features

### File + Bash

```yaml
---
description: Analyze file with git history
argument-hint: <file-path>
---

# File Analysis

## Current Content
@$1

## Git History
!`git log --oneline -10 -- $1`

## Recent Changes
!`git diff HEAD~5 -- $1`
```

### File + Arguments

```yaml
---
description: Compare file versions
argument-hint: <file-path> <commit-hash>
---

# Version Comparison

## Current Version
@$1

## Previous Version (at $2)
!`git show $2:$1`

Explain what changed between versions.
```

### Multiple Dynamic Files

```yaml
---
description: Review component and styles
argument-hint: <component-name>
---

# Component Review

## Component
@src/components/$1.tsx

## Styles
@src/components/$1.module.css

## Tests
@src/components/$1.test.tsx

Review the complete component implementation.
```

---

## Best Practices

### 1. Validate File Exists

```markdown
First, verify the file exists:
!`[ -f "$1" ] && echo "File found" || echo "File not found: $1"`

If file exists:
@$1
```

### 2. Provide Context

```markdown
# Configuration Review

**Purpose**: Review the TypeScript configuration for best practices.

## File: tsconfig.json
@tsconfig.json

## Analysis

Focus on:
- Strict mode settings
- Path mappings
- Module resolution
```

### 3. Handle Missing Files

```markdown
Review these configurations (skip if not found):

## TypeScript
@tsconfig.json

## ESLint (if present)
!`[ -f .eslintrc.json ] && cat .eslintrc.json || echo "No ESLint config"`
```

### 4. Combine Related Files

```markdown
# Review Authentication Module

## Types
@src/auth/types.ts

## Implementation
@src/auth/service.ts

## Tests
@src/auth/service.test.ts

Review the complete auth module.
```

---

## Common Errors

### Wrong Path

```markdown
# Wrong (from user home)
@~/project/file.ts

# Correct (from project root)
@src/file.ts
```

### Spaces in Path

```markdown
# Problematic
@path/to/my file.ts

# Better (use quotes in instructions)
Analyze the file at: @"path/to/my file.ts"
```

### Variable Syntax

```markdown
# Wrong (shell syntax)
@${FILE_PATH}

# Correct (command argument)
@$1
```
