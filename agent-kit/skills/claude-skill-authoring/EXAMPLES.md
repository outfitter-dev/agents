# Agent Skills Examples

Real-world examples of Agent Skills across various domains and complexity levels.

## Table of Contents

1. [Simple Single-File Skills](#simple-single-file-skills)
2. [Read-Only Analysis Skills](#read-only-analysis-skills)
3. [File Modification Skills](#file-modification-skills)
4. [Git Workflow Skills](#git-workflow-skills)
5. [Testing Skills](#testing-skills)
6. [Documentation Skills](#documentation-skills)
7. [Multi-File Skills](#multi-file-skills)
8. [Skills with Scripts](#skills-with-scripts)
9. [Skills with Templates](#skills-with-templates)
10. [Complex Workflow Skills](#complex-workflow-skills)
11. [Domain-Specific Skills](#domain-specific-skills)

## Simple Single-File Skills

### Example 1: Commit Message Generator

`.claude/skills/commit-message-generator/SKILL.md`:
```markdown
---
name: commit-message-generator
description: Generate conventional commit messages from git diffs. Use when writing commits, creating commit messages, or when user mentions commit formatting or conventional commits.
allowed-tools: Bash(git *)
version: 1.0.0
---

# Commit Message Generator

Generate clear, conventional commit messages following the format: `type(scope): description`

## Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi colons, etc)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

## Process

1. Analyze staged changes: `git diff --staged`
2. Identify primary change type
3. Determine scope (component, module, or feature)
4. Write concise description (50 chars max)
5. Add body explaining what and why (not how)

## Best Practices

- Use imperative mood: "add" not "added" or "adds"
- First line: type(scope): description
- Body: Explain what and why
- Reference issues: "Closes #123"

## Example Output

```
feat(auth): add OAuth2 login support

Implement OAuth2 authentication flow for GitHub and Google providers.
Users can now log in using their existing accounts instead of creating
new credentials.

Closes #456
```
```

### Example 2: JSON Validator

`.claude/skills/json-validator/SKILL.md`:
```markdown
---
name: json-validator
description: Parse, validate, and format JSON files including schema validation. Use when working with JSON data, .json files, configuration files, or when user mentions JSON parsing or validation.
allowed-tools: Read, Write, Bash(jq:*)
version: 1.0.0
---

# JSON Validator

Validate and format JSON files with optional schema validation.

## Basic Validation

1. Read JSON file
2. Parse and check syntax
3. Report errors with line numbers
4. Suggest fixes for common issues

## Formatting

Apply consistent JSON formatting:
- 2-space indentation
- Sorted keys (optional)
- Trailing commas removed
- Proper line breaks

## Schema Validation

When schema provided:
1. Load JSON schema
2. Validate data against schema
3. Report validation errors
4. Suggest corrections

## Common Issues Fixed

- Trailing commas
- Unquoted keys
- Single quotes instead of double quotes
- Missing closing brackets
- Invalid escape sequences

## Usage

```bash
# Validate JSON file
jq empty file.json

# Format JSON
jq . file.json > formatted.json

# Validate against schema (with external tool)
```
```

### Example 3: Environment Variable Manager

`.claude/skills/env-manager/SKILL.md`:
```markdown
---
name: env-manager
description: Manage environment variables and .env files including validation and template generation. Use when working with environment variables, .env files, or configuration management.
allowed-tools: Read, Write
version: 1.0.0
---

# Environment Variable Manager

Manage .env files, validate variables, and generate templates.

## Operations

### 1. Validate .env File
- Check for missing required variables
- Verify value formats (URLs, ports, booleans)
- Detect unused variables
- Find duplicates

### 2. Generate .env.example
- Create template from .env
- Replace sensitive values with placeholders
- Add comments for each variable
- Group related variables

### 3. Compare Environments
- Compare .env files across environments
- Identify missing variables
- Show value differences
- Suggest synchronization

## Security Best Practices

- Never commit .env to git
- Use strong, unique values
- Rotate secrets regularly
- Validate URLs and ports
- Escape special characters

## Example Template

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_SIZE=10

# API Keys (never commit actual values)
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```
```

## Read-Only Analysis Skills

### Example 4: Code Complexity Analyzer

`.claude/skills/code-complexity-analyzer/SKILL.md`:
```markdown
---
name: code-complexity-analyzer
description: Analyze code complexity, detect code smells, and suggest refactoring. Use when reviewing code complexity, finding maintainability issues, or when user mentions code quality or refactoring.
allowed-tools: Read, Grep, Glob
version: 1.0.0
---

# Code Complexity Analyzer

Analyze code for complexity issues and suggest improvements without modifying files.

## Analysis Criteria

### 1. Cyclomatic Complexity
- Count decision points (if, while, for, case)
- Flag functions with >10 decision points
- Suggest breaking into smaller functions

### 2. Function Length
- Flag functions >50 lines
- Identify opportunities to extract helper functions
- Suggest single responsibility refactoring

### 3. Nesting Depth
- Flag code with >4 levels of nesting
- Suggest early returns
- Recommend guard clauses

### 4. Code Duplication
- Identify repeated code blocks
- Suggest extraction to functions
- Find similar patterns

### 5. Naming Issues
- Short, unclear names (a, tmp, data)
- Inconsistent naming conventions
- Misleading names

## Report Format

```markdown
## Complexity Report

### High Complexity Functions
1. `processUserData()` - Complexity: 15 (threshold: 10)
   - Location: src/users.ts:45
   - Recommendation: Extract validation logic

### Long Functions
1. `handleRequest()` - 87 lines (threshold: 50)
   - Location: src/api.ts:120
   - Recommendation: Split into smaller handlers

### Deep Nesting
1. `validateForm()` - 6 levels (threshold: 4)
   - Location: src/validation.ts:30
   - Recommendation: Use early returns
```

## Refactoring Suggestions

For each issue, provide:
- **What**: Specific problem
- **Why**: Impact on maintainability
- **How**: Concrete refactoring approach
- **Example**: Before/after code snippet
```

### Example 5: Security Audit

`.claude/skills/security-audit/SKILL.md`:
```markdown
---
name: security-audit
description: Audit code for security vulnerabilities including XSS, SQL injection, and authentication issues. Use when reviewing security, checking for vulnerabilities, or when user mentions security audit or penetration testing.
allowed-tools: Read, Grep, Glob
version: 1.2.0
---

# Security Audit

Comprehensive security analysis without modifying code.

## Vulnerability Categories

### 1. Injection Attacks
**SQL Injection:**
- Raw SQL queries with string concatenation
- Unsanitized user input in queries
- Missing parameterized queries

**Command Injection:**
- `exec()`, `system()` with user input
- Shell command construction
- Unsafe subprocess calls

### 2. Cross-Site Scripting (XSS)
- Unescaped user input in HTML
- `dangerouslySetInnerHTML` in React
- Missing Content-Security-Policy headers

### 3. Authentication & Authorization
- Hardcoded credentials
- Weak password requirements
- Missing authentication checks
- Improper session management
- JWT secrets in code

### 4. Data Exposure
- Sensitive data in logs
- Exposed API keys
- Unencrypted data transmission
- Verbose error messages

### 5. Cryptography
- Weak encryption algorithms (MD5, SHA1)
- Hardcoded encryption keys
- Insecure random number generation

## Audit Process

1. **Scan for patterns**: Use grep to find vulnerable patterns
2. **Context analysis**: Read surrounding code for context
3. **Severity rating**: Critical, High, Medium, Low
4. **Impact assessment**: Potential consequences
5. **Remediation**: Specific fix recommendations

## Report Format

```markdown
## Security Audit Report

### Critical Issues (Requires Immediate Action)

#### SQL Injection in User Query (Critical)
- **Location**: src/database/users.ts:45
- **Issue**: User input concatenated into SQL query
- **Code**:
  ```typescript
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  ```
- **Impact**: Attacker can execute arbitrary SQL
- **Fix**: Use parameterized queries
  ```typescript
  const query = sql`SELECT * FROM users WHERE id = ${sql.param(userId)}`;
  ```

### High Priority Issues
[Similar format for high priority items]

### Medium Priority Issues
[Similar format for medium priority items]

### Recommendations
1. Implement input validation library
2. Add security headers middleware
3. Enable SQL query logging
4. Set up automated security scanning
```

## Security Best Practices

- Input validation on all user data
- Parameterized queries for databases
- Proper authentication/authorization
- Secure session management
- HTTPS for all communications
- Regular dependency updates
- Security headers (CSP, HSTS, etc.)
```

### Example 6: Performance Profiler

`.claude/skills/performance-profiler/SKILL.md`:
```markdown
---
name: performance-profiler
description: Identify performance bottlenecks including inefficient algorithms, memory leaks, and N+1 queries. Use when analyzing performance, optimizing code, or when user mentions slow code or performance issues.
allowed-tools: Read, Grep, Glob, Bash(time:*)
version: 1.0.0
---

# Performance Profiler

Identify and analyze performance issues in code.

## Performance Anti-Patterns

### 1. Algorithm Inefficiency
- O(n²) or worse when O(n) possible
- Nested loops over same data
- Repeated expensive operations
- Unnecessary sorting/searching

### 2. Database Issues
- N+1 query problems
- Missing database indexes
- Large result sets without pagination
- Inefficient query structure

### 3. Memory Issues
- Memory leaks (event listeners, closures)
- Large object allocations
- Unnecessary data retention
- Inefficient data structures

### 4. Network Issues
- Multiple sequential API calls
- Missing request batching
- No caching strategy
- Large payload sizes

### 5. Frontend Issues
- Unnecessary re-renders
- Large bundle sizes
- No code splitting
- Unoptimized images

## Analysis Process

1. **Hot spot identification**: Find frequently called functions
2. **Complexity analysis**: Check algorithm complexity
3. **Resource usage**: Memory, CPU, network
4. **Optimization opportunities**: Quick wins and major improvements

## Recommendations Format

```markdown
## Performance Analysis

### Critical Bottlenecks

#### N+1 Query in User Dashboard (High Impact)
- **Location**: src/api/dashboard.ts:67
- **Issue**: Separate query for each user's posts
- **Current**:
  ```typescript
  users.forEach(user => {
    const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', user.id);
  });
  ```
- **Impact**: 1 + N queries instead of 2
- **Optimization**:
  ```typescript
  const posts = await db.query('SELECT * FROM posts WHERE user_id IN (?)', userIds);
  // Group by user_id
  ```
- **Expected Improvement**: 500ms → 50ms (10x faster)

### Optimization Opportunities
[Similar format for other optimizations]
```

## Performance Metrics

For each issue, estimate:
- Current performance
- Expected improvement
- Implementation effort
- Priority (high/medium/low)
```

## File Modification Skills

### Example 7: Code Formatter

`.claude/skills/code-formatter/SKILL.md`:
```markdown
---
name: code-formatter
description: Format code following project style guides including TypeScript, Rust, Python, and JavaScript. Use when formatting code, fixing style issues, or when user mentions code formatting or linting.
allowed-tools: Read, Edit, Write, Bash(bun *), Bash(cargo *), Bash(black:*)
version: 1.0.0
---

# Code Formatter

Apply consistent code formatting across multiple languages.

## Supported Languages

### TypeScript/JavaScript
- **Tool**: Biome or Prettier
- **Config**: biome.json or .prettierrc
- **Command**: `bun run format` or `npx prettier --write`

### Rust
- **Tool**: rustfmt
- **Config**: rustfmt.toml
- **Command**: `cargo fmt`

### Python
- **Tool**: Black
- **Config**: pyproject.toml
- **Command**: `black .`

## Formatting Process

1. **Detect language**: Check file extension
2. **Find config**: Look for project config files
3. **Apply formatter**: Run appropriate tool
4. **Verify**: Check for formatting errors
5. **Report**: List formatted files

## Style Rules Applied

### TypeScript/JavaScript
- 2-space indentation
- Single quotes (or per config)
- Trailing commas
- Line length: 80-100 chars
- Semicolons (per config)

### Rust
- 4-space indentation
- Line length: 100 chars
- Follow Rust style guide

### Python
- 4-space indentation
- Line length: 88 chars (Black default)
- Double quotes
- PEP 8 compliance

## Batch Formatting

```bash
# Format all TypeScript files
find src -name "*.ts" -o -name "*.tsx" | xargs bun run format

# Format all Rust files
cargo fmt

# Format all Python files
black src/
```

## Pre-commit Integration

Suggest setting up pre-commit hooks for automatic formatting:

```bash
# .git/hooks/pre-commit
#!/bin/bash
bun run format
git add -u
```
```

### Example 8: Import Organizer

`.claude/skills/import-organizer/SKILL.md`:
```markdown
---
name: import-organizer
description: Organize and sort import statements following best practices for TypeScript, Rust, and Python. Use when organizing imports, cleaning up code, or when user mentions import sorting or organization.
allowed-tools: Read, Edit
version: 1.0.0
---

# Import Organizer

Organize and sort import statements following language conventions.

## TypeScript/JavaScript

### Organization Order
1. External packages (node_modules)
2. Internal absolute imports
3. Relative imports (parent directories)
4. Relative imports (same directory)
5. Type imports (separate block)

### Example
```typescript
// 1. External packages
import React from 'react';
import { Router } from 'express';

// 2. Internal absolute imports
import { config } from '@/config';
import { logger } from '@/utils/logger';

// 3. Relative imports (parent)
import { UserService } from '../services/user';

// 4. Relative imports (same)
import { helpers } from './helpers';

// 5. Type imports
import type { User } from '@/types';
```

## Rust

### Organization Order
1. Standard library (`std::`)
2. External crates
3. Internal modules (`crate::`)
4. Super and self references

### Example
```rust
// 1. Standard library
use std::collections::HashMap;
use std::fs::File;

// 2. External crates
use serde::{Deserialize, Serialize};
use tokio::runtime::Runtime;

// 3. Internal modules
use crate::config::Config;
use crate::models::User;

// 4. Super/self
use super::helpers;
use self::utils;
```

## Python

### Organization Order (PEP 8)
1. Standard library
2. Third-party packages
3. Local application imports

### Example
```python
# 1. Standard library
import os
import sys
from typing import Optional

# 2. Third-party
import numpy as np
import pandas as pd

# 3. Local
from app.config import settings
from app.models import User
```

## Cleanup Actions

1. Remove unused imports
2. Sort alphabetically within groups
3. Combine imports from same module
4. Convert between named and default imports (when appropriate)
5. Add missing imports (based on usage)

## Process

1. Parse all import statements
2. Categorize by type (external, internal, relative)
3. Sort within categories
4. Rewrite file with organized imports
5. Verify code still compiles
```

### Example 9: Refactoring Assistant

`.claude/skills/refactoring-assistant/SKILL.md`:
```markdown
---
name: refactoring-assistant
description: Assist with safe code refactoring including extract method, rename, and move file operations. Use when refactoring code, improving structure, or when user mentions refactoring or code improvement.
allowed-tools: Read, Edit, Write, Bash(grep:*), Bash(find:*)
version: 1.0.0
---

# Refactoring Assistant

Perform safe code refactoring with validation.

## Refactoring Operations

### 1. Extract Method
Convert code block into separate function.

**Process:**
1. Identify code block to extract
2. Analyze dependencies (parameters needed)
3. Determine return value
4. Create new function
5. Replace original code with function call
6. Update tests if needed

**Example:**
```typescript
// Before
function processUser(user: User) {
  if (!user.email || !user.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (user.age < 18) {
    throw new Error('User must be 18+');
  }
  // ... rest of logic
}

// After
function processUser(user: User) {
  validateUser(user);
  // ... rest of logic
}

function validateUser(user: User) {
  if (!user.email || !user.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (user.age < 18) {
    throw new Error('User must be 18+');
  }
}
```

### 2. Rename Symbol
Rename variable, function, or class safely.

**Process:**
1. Find all occurrences
2. Verify scope (avoid false positives)
3. Update all references
4. Update comments/documentation
5. Update tests

### 3. Move File
Move file to new location and update imports.

**Process:**
1. Identify all imports of the file
2. Calculate new relative paths
3. Execute the move operation
4. Update all import statements
5. Verify no broken imports

### 4. Extract Interface/Type
Create type/interface from usage.

**Process:**
1. Analyze object usage
2. Infer property types
3. Create type definition
4. Apply type to code
5. Remove redundant type annotations

### 5. Inline Function
Replace function call with function body (when appropriate).

## Safety Checks

Before refactoring:
- [ ] Code compiles/runs successfully
- [ ] Tests pass
- [ ] No uncommitted changes
- [ ] Create backup or commit first

After refactoring:
- [ ] Code still compiles
- [ ] Tests still pass
- [ ] No new linting errors
- [ ] Behavior unchanged

## Validation

```bash
# Check compilation
bun run build

# Run tests
bun test

# Check linting
bun run lint
```
```

## Git Workflow Skills

### Example 10: Branch Manager

`.claude/skills/branch-manager/SKILL.md`:
```markdown
---
name: branch-manager
description: Manage git branches including creation, cleanup, and synchronization. Use when working with git branches, creating features, or when user mentions branch management or git workflows.
allowed-tools: Bash(git *), Read
version: 1.0.0
---

# Branch Manager

Comprehensive git branch management.

## Branch Operations

### 1. Create Feature Branch
```bash
# From issue number
git checkout main
git pull origin main
git checkout -b feature/123-add-user-auth

# Link to issue
gh issue comment 123 --body "Working on feature/123-add-user-auth"
```

### 2. Clean Stale Branches
```bash
# List merged branches
git branch --merged main | grep -v main

# Delete merged branches
git branch --merged main | grep -v main | xargs git branch -d

# Delete remote tracking branches
git remote prune origin
```

### 3. Synchronize with Main
```bash
# Rebase on main
git checkout feature/my-branch
git fetch origin
git rebase origin/main

# Or merge main
git merge origin/main
```

### 4. Branch Status Check
```bash
# List all branches with status
git branch -vv

# Show ahead/behind commits
git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads
```

## Branch Naming Conventions

**Pattern**: `type/issue-description`

**Types:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Test additions/fixes

**Examples:**
- `feature/123-user-authentication`
- `bugfix/456-fix-login-error`
- `hotfix/789-security-patch`

## Workflow Integration

### Before Creating Branch
1. Check current status: `git status`
2. Ensure on main: `git checkout main`
3. Pull latest: `git pull origin main`
4. Create branch: `git checkout -b feature/name`

### Before Merging
1. Sync with main: `git rebase origin/main`
2. Run tests: `bun test`
3. Push branch: `git push -u origin feature/name`
4. Create PR: `gh pr create`

### After Merge
1. Switch to main: `git checkout main`
2. Pull changes: `git pull origin main`
3. Delete local branch: `git branch -d feature/name`
4. Delete remote branch: `git push origin --delete feature/name`
```

### Example 11: Pull Request Workflow

`.claude/skills/pr-workflow/SKILL.md`:
```markdown
---
name: pr-workflow
description: Manage pull request workflows including creation, review, and merging. Use when creating PRs, reviewing code, or when user mentions pull requests or code review.
allowed-tools: Bash(git *), Bash(gh *), Read, Write
version: 1.0.0
---

# Pull Request Workflow

Complete PR lifecycle management.

## Creating Pull Requests

### Step 1: Pre-flight Checks
```bash
# Ensure tests pass
bun test

# Check build
bun run build

# Lint code
bun run lint

# Review changes
git diff main...HEAD
```

### Step 2: PR Creation
```bash
# Create PR with template
gh pr create \
  --title "feat: add user authentication" \
  --body "$(cat .github/pull_request_template.md)" \
  --base main \
  --head feature/123-auth

# Or interactive
gh pr create
```

### Step 3: PR Description Template
```markdown
## Summary
Brief description of changes

## Changes Made
- Added authentication middleware
- Implemented JWT token validation
- Created user session management

## Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed

## Screenshots/Recordings
[If UI changes]

## Breaking Changes
None / List breaking changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] No console warnings
- [ ] Build passing

## Related Issues
Closes #123
```

## Reviewing Pull Requests

### Review Checklist

**Code Quality:**
- [ ] Clear variable/function names
- [ ] Follows project conventions
- [ ] No unnecessary complexity
- [ ] DRY principle followed

**Functionality:**
- [ ] Changes match PR description
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] No obvious bugs

**Tests:**
- [ ] Tests included for new features
- [ ] Tests cover edge cases
- [ ] All tests passing
- [ ] No test pollution

**Security:**
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] Authentication checks correct
- [ ] No SQL injection vectors

**Performance:**
- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] No unnecessary API calls
- [ ] Caching where appropriate

**Documentation:**
- [ ] Code comments for complex logic
- [ ] API documentation updated
- [ ] README updated if needed
- [ ] CHANGELOG entry added

### Review Commands
```bash
# Checkout PR locally
gh pr checkout 123

# View PR diff
gh pr diff 123

# Add review comment
gh pr review 123 --comment --body "Looks good!"

# Request changes
gh pr review 123 --request-changes --body "Please address..."

# Approve PR
gh pr review 123 --approve
```

## Merging Pull Requests

### Pre-merge Checks
```bash
# Ensure CI passing
gh pr checks 123

# Ensure approved
gh pr view 123 --json reviewDecision

# Ensure up to date with base
git fetch origin
git log HEAD..origin/main --oneline
```

### Merge Strategies

**1. Merge Commit** (default)
```bash
gh pr merge 123 --merge
```
- Preserves full history
- Creates merge commit
- Use for: Feature branches

**2. Squash and Merge**
```bash
gh pr merge 123 --squash
```
- Combines all commits into one
- Cleaner history
- Use for: Multiple small commits

**3. Rebase and Merge**
```bash
gh pr merge 123 --rebase
```
- Linear history
- No merge commit
- Use for: Single commits, clean history

### Post-merge Actions
```bash
# Delete branch
gh pr merge 123 --delete-branch

# Update local main
git checkout main
git pull origin main

# Clean up local branches
git branch --merged main | grep -v main | xargs git branch -d
```
```

## Testing Skills

### Example 12: Test Generator

`.claude/skills/test-generator/SKILL.md`:
```markdown
---
name: test-generator
description: Generate comprehensive unit and integration tests for TypeScript, Rust, and Python. Use when writing tests, adding test coverage, or when user mentions test generation or TDD.
allowed-tools: Read, Write, Bash(bun test:*)
version: 1.0.0
---

# Test Generator

Generate comprehensive test suites from source code.

## Supported Frameworks

### TypeScript
- **Bun Test** (built-in)
- **Jest**
- **Vitest**

### Rust
- **cargo test** (built-in)
- **rstest** (fixtures)

### Python
- **pytest**
- **unittest**

## Test Generation Strategy

### 1. Analyze Source Code
- Identify functions to test
- Determine input/output types
- Find edge cases
- Identify error conditions

### 2. Generate Test Cases

**Happy Path:**
```typescript
// Source
function add(a: number, b: number): number {
  return a + b;
}

// Test
import { describe, it, expect } from 'bun:test';
import { add } from './math';

describe('add', () => {
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should add negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
  });
});
```

**Edge Cases:**
```typescript
describe('add edge cases', () => {
  it('should handle very large numbers', () => {
    expect(add(Number.MAX_SAFE_INTEGER, 1))
      .toBe(Number.MAX_SAFE_INTEGER + 1);
  });

  it('should handle floating point precision', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
```

**Error Cases:**
```typescript
describe('add error handling', () => {
  it('should throw on non-number input', () => {
    expect(() => add('2' as any, 3)).toThrow();
  });

  it('should throw on NaN input', () => {
    expect(() => add(NaN, 3)).toThrow();
  });
});
```

### 3. Mocks and Fixtures

**Mock external dependencies:**
```typescript
import { mock } from 'bun:test';

describe('UserService', () => {
  it('should fetch user from API', async () => {
    const mockFetch = mock(() => Promise.resolve({
      json: () => Promise.resolve({ id: 1, name: 'John' })
    }));

    global.fetch = mockFetch as any;

    const user = await UserService.getUser(1);
    expect(user.name).toBe('John');
    expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
  });
});
```

## Test Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Key business scenarios

## Test Organization

```
src/
├── math.ts
├── math.test.ts        (unit tests)
└── __tests__/
    ├── math.integration.test.ts
    └── math.e2e.test.ts
```

## Test Naming Convention

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do expected behavior when condition', () => {
      // Test implementation
    });

    it('should throw error when invalid input', () => {
      // Test implementation
    });
  });
});
```
```

### Example 13: Test Runner and Reporter

`.claude/skills/test-runner/SKILL.md`:
```markdown
---
name: test-runner
description: Run test suites with coverage reporting and failure analysis. Use when running tests, checking coverage, or when user mentions test execution or CI/CD.
allowed-tools: Bash(bun test:*), Bash(npm test:*), Bash(cargo test:*), Read, Write
version: 1.0.0
---

# Test Runner and Reporter

Execute tests and generate comprehensive reports.

## Running Tests

### Full Test Suite
```bash
# Bun
bun test

# Cargo
cargo test

# Python
pytest
```

### Specific Tests
```bash
# Single file
bun test src/math.test.ts

# Pattern matching
bun test --filter "user"

# Watch mode
bun test --watch
```

### With Coverage
```bash
# Bun with coverage
bun test --coverage

# Cargo with coverage (using tarpaulin)
cargo tarpaulin --out Html

# Python with coverage
pytest --cov=src --cov-report=html
```

## Test Analysis

### Parse Test Results
1. Count: passed, failed, skipped
2. Duration: total and per-test
3. Coverage: lines, branches, functions
4. Failures: error messages and stack traces

### Failure Analysis

**For each failure:**
```markdown
### Test: `should validate email format`
**File**: src/validation.test.ts:45
**Error**: Expected true but received false

**Failure Reason**: Email validation regex missing special characters

**Stack Trace**:
```
at validateEmail (src/validation.ts:23)
at Test (src/validation.test.ts:47)
```

**Suggested Fix**:
Update regex to handle all valid email formats:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Related Tests**: This may affect other email validation tests
```

### Coverage Report

```markdown
## Coverage Report

### Overall Coverage
- Lines: 87.5% (350/400)
- Branches: 82.3% (123/150)
- Functions: 91.2% (104/114)
- Statements: 87.1% (347/398)

### Coverage by File
| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| src/auth.ts | 95% | 90% | 100% |
| src/users.ts | 78% | 75% | 85% |
| src/api.ts | 65% | 60% | 70% |

### Uncovered Code
1. src/api.ts:45-67 (error handling path)
2. src/users.ts:123-130 (admin-only feature)
3. src/auth.ts:89 (token refresh edge case)

### Recommendations
- Add tests for error handling in src/api.ts
- Add admin user tests in src/users.ts
- Add token expiry tests in src/auth.ts
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Performance Tracking

Track test execution times:
```bash
# Identify slow tests
bun test --reporter=verbose | grep -E "^\s+✓.*[0-9]{3,}ms"

# Run only fast tests
bun test --test-name-pattern="^(?!.*slow)"
```
```

## Documentation Skills

### Example 14: API Documentation Generator

`.claude/skills/api-doc-generator/SKILL.md`:
```markdown
---
name: api-doc-generator
description: Generate API documentation from TypeScript code including JSDoc comments and OpenAPI specs. Use when documenting APIs, creating API docs, or when user mentions API documentation or OpenAPI.
allowed-tools: Read, Write, Bash(bun *)
version: 1.0.0
---

# API Documentation Generator

Generate comprehensive API documentation from source code.

## Documentation Formats

### 1. JSDoc Comments
```typescript
/**
 * Create a new user in the system.
 *
 * @param userData - User data for account creation
 * @param userData.email - User's email address
 * @param userData.name - User's full name
 * @param userData.age - User's age (must be 18+)
 * @returns Promise resolving to created user with ID
 * @throws {ValidationError} If user data is invalid
 * @throws {DuplicateError} If email already exists
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'john@example.com',
 *   name: 'John Doe',
 *   age: 25
 * });
 * console.log(user.id); // "user-123"
 * ```
 */
async function createUser(userData: CreateUserInput): Promise<User> {
  // Implementation
}
```

### 2. Markdown Documentation
```markdown
## API Reference

### `createUser(userData)`

Create a new user in the system.

#### Parameters

- **userData** (`CreateUserInput`): User data for account creation
  - **email** (`string`, required): User's email address
  - **name** (`string`, required): User's full name
  - **age** (`number`, required): User's age (must be 18+)

#### Returns

`Promise<User>` - Created user object with assigned ID

#### Throws

- `ValidationError` - If user data is invalid
- `DuplicateError` - If email already exists

#### Example

```typescript
const user = await createUser({
  email: 'john@example.com',
  name: 'John Doe',
  age: 25
});
console.log(user.id); // "user-123"
```

#### HTTP Endpoint

```
POST /api/users
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Doe",
  "age": 25
}
```

Response:
```json
{
  "id": "user-123",
  "email": "john@example.com",
  "name": "John Doe",
  "age": 25,
  "createdAt": "2025-10-20T12:00:00Z"
}
```
```

### 3. OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /api/users:
    post:
      summary: Create a new user
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserInput'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid input
        '409':
          description: Email already exists

components:
  schemas:
    CreateUserInput:
      type: object
      required:
        - email
        - name
        - age
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
        age:
          type: integer
          minimum: 18

    User:
      allOf:
        - $ref: '#/components/schemas/CreateUserInput'
        - type: object
          properties:
            id:
              type: string
            createdAt:
              type: string
              format: date-time
```

## Generation Process

1. **Parse Source Code**: Extract types, interfaces, functions
2. **Extract Documentation**: Read existing JSDoc comments
3. **Infer Types**: Use TypeScript type information
4. **Generate Examples**: Create realistic usage examples
5. **Format Output**: Markdown, HTML, or OpenAPI

## Documentation Quality

**Good API Documentation Includes:**
- Clear, concise description
- All parameters with types
- Return value documentation
- Error/exception documentation
- Usage examples
- Edge cases and limitations
- Related endpoints/functions
```

(Continued in next part due to length...)
