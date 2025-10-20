# Claude Plugin Authoring - Examples

## Example 1: Simple Command Plugin

A basic plugin with a few slash commands for common development tasks.

### Directory Structure

```
dev-commands/
├── plugin.json
├── README.md
└── commands/
    ├── format.md
    ├── lint.md
    └── test.md
```

### plugin.json

```json
{
  "name": "dev-commands",
  "version": "1.0.0",
  "description": "Common development workflow commands",
  "author": {
    "name": "Dev Team",
    "email": "dev@example.com"
  },
  "license": "MIT"
}
```

### commands/format.md

```markdown
---
description: "Format code in the current directory"
---

Format all code files in the current directory using the project's configured formatters.

Steps:
1. Identify the project type (detect package.json, Cargo.toml, etc.)
2. Run the appropriate formatter (Prettier, Black, rustfmt, etc.)
3. Report formatting results
4. Show any files that couldn't be formatted
```

### commands/lint.md

```markdown
---
description: "Run linting checks on the codebase"
---

Run linting checks on the codebase and report issues.

Process:
1. Detect project type and linting tools
2. Run appropriate linter (ESLint, Ruff, Clippy, etc.)
3. Categorize issues by severity
4. Provide fix suggestions for common issues
5. Show summary of all issues found
```

### commands/test.md

```markdown
---
description: "Run test suite with coverage"
---

Run the project's test suite and generate coverage report.

Execution:
1. Identify test framework (Jest, pytest, cargo test, etc.)
2. Run tests with coverage enabled
3. Display test results
4. Show coverage percentage
5. Highlight untested code areas
```

---

## Example 2: Security Review Plugin

A plugin with a custom agent and pre-commit hook for security checks.

### Directory Structure

```
security-tools/
├── plugin.json
├── README.md
├── agents/
│   └── security-reviewer.md
└── hooks/
    └── pre-write-security.sh
```

### plugin.json

```json
{
  "name": "security-tools",
  "version": "1.0.0",
  "description": "Security review tools and automated checks",
  "author": {
    "name": "Security Team",
    "email": "security@example.com"
  },
  "license": "MIT",
  "keywords": ["security", "audit", "review"],
  "agents": ["./agents/security-reviewer.md"],
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/pre-write-security.sh"
          }
        ]
      }
    ]
  }
}
```

### agents/security-reviewer.md

```markdown
---
name: security-reviewer
description: "Specialized agent for security code reviews and vulnerability detection"
---

You are a security-focused code reviewer with expertise in identifying vulnerabilities and security anti-patterns.

## Core Responsibilities

1. **Vulnerability Detection**
   - SQL injection risks
   - XSS vulnerabilities
   - CSRF weaknesses
   - Authentication bypass
   - Authorization issues

2. **Secrets Management**
   - Hardcoded credentials
   - API keys in code
   - Exposed secrets
   - Insecure configuration

3. **Data Protection**
   - Unencrypted sensitive data
   - Weak encryption algorithms
   - Insecure data transmission
   - Insufficient access controls

4. **Input Validation**
   - Missing input sanitization
   - Insufficient validation
   - Type confusion vulnerabilities
   - Path traversal risks

## Review Process

When reviewing code:

1. **Initial Scan**
   - Identify authentication/authorization logic
   - Locate data handling code
   - Find external API interactions
   - Check configuration management

2. **Deep Analysis**
   - Examine each potential vulnerability
   - Trace data flow
   - Verify security controls
   - Check error handling

3. **Reporting**
   - Classify by severity (Critical, High, Medium, Low)
   - Provide specific examples
   - Suggest remediation
   - Include references (OWASP, CWE)

## Output Format

For each issue found:

**Issue:** [Brief description]
**Severity:** [Critical/High/Medium/Low]
**Location:** [File:line]
**Impact:** [What could happen]
**Recommendation:** [How to fix]
**Reference:** [OWASP/CWE link]

**Example:**
```
Issue: SQL Injection vulnerability in user query
Severity: Critical
Location: src/database.ts:42
Impact: Attacker could execute arbitrary SQL queries
Recommendation: Use parameterized queries instead of string concatenation
Reference: OWASP A03:2021 - Injection
```

## Guidelines

- Assume adversarial mindset
- Consider edge cases and unusual inputs
- Verify defense-in-depth
- Check for security regressions
- Validate all third-party dependencies
```

### hooks/pre-write-security.sh

```bash
#!/usr/bin/env bash

# Security check hook for file writes
input=$(cat)

file_path=$(echo "$input" | jq -r '.parameters.file_path')
content=$(echo "$input" | jq -r '.parameters.content')

# Check for hardcoded secrets
if echo "$content" | grep -qiE '(password|api[_-]?key|secret|token)["\s]*[:=]["\s]*[a-zA-Z0-9+/]{16,}'; then
  echo '{
    "allowed": false,
    "message": "Potential hardcoded secret detected. Use environment variables instead."
  }'
  exit 0
fi

# Check for SQL concatenation (SQL injection risk)
if echo "$content" | grep -qE 'query.*\+.*\$|query.*\`.*\$\{'; then
  echo '{
    "allowed": false,
    "message": "Potential SQL injection vulnerability detected. Use parameterized queries."
  }'
  exit 0
fi

# Check for eval usage (code injection risk)
if echo "$content" | grep -qE '\beval\s*\('; then
  echo '{
    "allowed": false,
    "message": "Use of eval() detected, which poses security risks. Consider safer alternatives."
  }'
  exit 0
fi

# Check for insecure random (weak crypto)
if echo "$content" | grep -qE 'Math\.random\(\)|random\.random\(\)' && \
   echo "$content" | grep -qiE 'token|session|password|key'; then
  echo '{
    "allowed": false,
    "message": "Insecure random number generator for security-sensitive value. Use crypto.randomBytes() or secrets module."
  }'
  exit 0
fi

# All checks passed
echo '{"allowed": true}'
```

---

## Example 3: MCP Server Integration Plugin

A plugin that bundles an MCP server for database access.

### Directory Structure

```
database-tools/
├── plugin.json
├── README.md
├── commands/
│   ├── query.md
│   └── schema.md
└── servers/
    └── db-server/
        ├── server.py
        ├── requirements.txt
        └── config.json.example
```

### plugin.json

```json
{
  "name": "database-tools",
  "version": "1.0.0",
  "description": "Database query and management tools with MCP integration",
  "author": {
    "name": "Data Team",
    "email": "data@example.com"
  },
  "license": "MIT",
  "keywords": ["database", "sql", "query"],
  "mcpServers": {
    "database": {
      "command": "uv",
      "args": [
        "--directory",
        "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
        "run",
        "server.py"
      ],
      "env": {
        "DB_HOST": "${DATABASE_HOST}",
        "DB_PORT": "${DATABASE_PORT}",
        "DB_NAME": "${DATABASE_NAME}",
        "DB_USER": "${DATABASE_USER}",
        "DB_PASSWORD": "${DATABASE_PASSWORD}"
      }
    }
  }
}
```

### commands/query.md

```markdown
---
description: "Execute a SQL query using the database MCP server"
---

Execute the following SQL query: {{0}}

Process:
1. Validate SQL syntax
2. Check for potentially dangerous operations
3. Execute query using the database MCP server tool
4. Format results in a readable table
5. Show row count and execution time

If query modifies data:
- Ask for confirmation before executing
- Show number of affected rows
- Offer rollback option if in transaction
```

### commands/schema.md

```markdown
---
description: "View database schema information"
---

Retrieve schema information for: {{0:table-or-database}}

Actions:
1. Use database MCP server to get schema
2. Display table structure
3. Show column types and constraints
4. List indexes
5. Display foreign key relationships

Format output as:
- Table overview
- Column details table
- Index information
- Relationship diagram (if applicable)
```

### servers/db-server/server.py

```python
"""
MCP server for database access
"""
from mcp.server.fastmcp import FastMCP
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json

# Initialize MCP server
mcp = FastMCP("database")

def get_connection():
    """Create database connection from environment variables"""
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

@mcp.tool()
async def execute_query(sql: str) -> str:
    """
    Execute a SQL query and return results.

    Args:
        sql: SQL query to execute

    Returns:
        JSON string with query results
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql)

            # Check if query returns results
            if cur.description:
                results = cur.fetchall()
                return json.dumps({
                    "rows": results,
                    "count": len(results)
                }, default=str)
            else:
                conn.commit()
                return json.dumps({
                    "affected": cur.rowcount,
                    "message": "Query executed successfully"
                })
    except Exception as e:
        conn.rollback()
        return json.dumps({
            "error": str(e)
        })
    finally:
        conn.close()

@mcp.tool()
async def get_schema(table_name: str = None) -> str:
    """
    Get database schema information.

    Args:
        table_name: Specific table name, or None for all tables

    Returns:
        JSON string with schema information
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if table_name:
                # Get specific table schema
                cur.execute("""
                    SELECT column_name, data_type, character_maximum_length,
                           is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = %s
                    ORDER BY ordinal_position
                """, (table_name,))
            else:
                # Get all tables
                cur.execute("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)

            results = cur.fetchall()
            return json.dumps(results, default=str)
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        conn.close()

@mcp.resource("schema://tables")
async def list_tables() -> str:
    """List all tables in the database"""
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT table_name,
                       (SELECT COUNT(*) FROM information_schema.columns
                        WHERE table_name = t.table_name) as column_count
                FROM information_schema.tables t
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            results = cur.fetchall()
            return json.dumps(results, default=str)
    finally:
        conn.close()

if __name__ == "__main__":
    mcp.run(transport='stdio')
```

### README.md

```markdown
# Database Tools Plugin

Claude Code plugin for database query and management with built-in MCP server.

## Installation

```bash
/plugin marketplace add your-org/database-tools
/plugin install database-tools@your-marketplace
```

## Configuration

Set these environment variables before using:

```bash
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_NAME=mydb
export DATABASE_USER=dbuser
export DATABASE_PASSWORD=secret
```

Or add to `.env` file in your project root.

## Features

### Commands

- `/query <sql>` - Execute SQL query
- `/schema <table>` - View table schema

### MCP Server Tools

- `execute_query` - Execute arbitrary SQL
- `get_schema` - Retrieve schema information

### MCP Server Resources

- `schema://tables` - List all tables

## Usage Examples

```bash
# Query users
/query SELECT * FROM users LIMIT 10

# View table structure
/schema users

# Complex query
/query SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name
```

## Security

- Never commit `.env` file with credentials
- Use read-only database user when possible
- Review all queries before execution
- Be cautious with DELETE/UPDATE operations

## License

MIT License
```

---

## Example 4: Team Workflow Plugin

A comprehensive plugin for team development workflows.

### Directory Structure

```
team-workflow/
├── plugin.json
├── README.md
├── CHANGELOG.md
├── commands/
│   ├── planning/
│   │   ├── roadmap.md
│   │   └── sprint.md
│   ├── development/
│   │   ├── feature.md
│   │   └── bugfix.md
│   └── review/
│       ├── pr-review.md
│       └── code-quality.md
├── agents/
│   ├── tech-lead.md
│   └── reviewer.md
└── hooks/
    ├── pre-commit-check.sh
    └── post-deploy-notify.sh
```

### plugin.json

```json
{
  "name": "team-workflow",
  "version": "2.0.0",
  "description": "Complete team development workflow automation for Claude Code",
  "author": {
    "name": "Engineering Team",
    "email": "eng@company.com"
  },
  "homepage": "https://github.com/company/team-workflow",
  "repository": "https://github.com/company/team-workflow",
  "license": "MIT",
  "keywords": ["workflow", "team", "automation", "development"],
  "category": "productivity",
  "commands": [
    "./commands/planning/",
    "./commands/development/",
    "./commands/review/"
  ],
  "agents": [
    "./agents/tech-lead.md",
    "./agents/reviewer.md"
  ],
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash.*git commit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/pre-commit-check.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash.*git push.*production",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/post-deploy-notify.sh"
          }
        ]
      }
    ]
  }
}
```

### commands/development/feature.md

```markdown
---
description: "Start a new feature branch with proper setup"
---

Create a new feature branch for: {{0:feature-name}}

Workflow:
1. Verify on main/trunk branch
2. Pull latest changes
3. Create feature branch: `feature/{{0}}`
4. Set up feature tracking
5. Create initial commit with feature scaffold
6. Push branch to remote
7. Create draft PR with template
8. Link to tracking issue (if provided)

Branch naming: `feature/{{0}}`
Example: `feature/user-authentication`
```

### agents/tech-lead.md

```markdown
---
name: tech-lead
description: "Technical leadership agent for architecture decisions and code review"
---

You are a technical lead responsible for maintaining code quality, architecture decisions, and team guidance.

## Responsibilities

### Architecture Reviews
- Evaluate system design decisions
- Identify scalability issues
- Ensure consistent patterns
- Review technology choices
- Consider long-term maintainability

### Code Quality
- Review code for clarity and maintainability
- Ensure proper error handling
- Verify test coverage
- Check performance implications
- Validate security practices

### Team Guidance
- Provide technical mentorship
- Explain architectural decisions
- Suggest learning resources
- Facilitate technical discussions

## Review Framework

### System Design
1. **Scalability**: Can this handle growth?
2. **Reliability**: What could fail?
3. **Maintainability**: Easy to modify?
4. **Performance**: Any bottlenecks?
5. **Security**: Potential vulnerabilities?

### Code Review
1. **Correctness**: Does it work as intended?
2. **Clarity**: Is it understandable?
3. **Consistency**: Matches codebase patterns?
4. **Testing**: Adequate test coverage?
5. **Documentation**: Sufficient comments/docs?

## Output Format

Provide feedback as:

**Architecture Feedback:**
- [Aspect]: [Observation]
- [Recommendation with reasoning]

**Code Review:**
- [File:line]: [Issue]
- [Severity]: Critical/Major/Minor
- [Suggestion with example]

**Mentorship:**
- [Concept]: [Explanation]
- [Resource]: [Learning link]

Be constructive, specific, and educational.
```

### hooks/pre-commit-check.sh

```bash
#!/usr/bin/env bash

# Pre-commit validation hook
input=$(cat)

# Extract git commit parameters
command=$(echo "$input" | jq -r '.parameters.command')

# Parse commit message
commit_msg=$(echo "$command" | grep -oP "(?<=-m ['\"])[^'\"]+")

# Validate commit message format (Conventional Commits)
if ! echo "$commit_msg" | grep -qE '^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+'; then
  echo '{
    "allowed": false,
    "message": "Commit message must follow Conventional Commits format: type(scope): message\nExamples: feat(auth): add login, fix(api): handle timeout"
  }'
  exit 0
fi

# Check for common issues
if echo "$commit_msg" | grep -qE '(WIP|TODO|FIXME|XXX)'; then
  echo '{
    "allowed": false,
    "message": "Commit message contains WIP/TODO markers. Please complete work before committing."
  }'
  exit 0
fi

# All checks passed
echo '{"allowed": true}'
```

---

## Example 5: Multi-Language Support Plugin

A plugin that provides language-specific tooling.

### Directory Structure

```
lang-tools/
├── plugin.json
├── commands/
│   ├── typescript/
│   │   ├── type-check.md
│   │   └── build.md
│   ├── rust/
│   │   ├── check.md
│   │   └── test.md
│   └── python/
│       ├── lint.md
│       └── format.md
└── hooks/
    ├── typescript-check.sh
    ├── rust-check.sh
    └── python-check.sh
```

### plugin.json

```json
{
  "name": "lang-tools",
  "version": "1.0.0",
  "description": "Language-specific development tools for TypeScript, Rust, and Python",
  "author": {
    "name": "Tools Team"
  },
  "license": "MIT",
  "keywords": ["typescript", "rust", "python", "tools"],
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write.*\\.ts$",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/typescript-check.sh"
          }
        ]
      },
      {
        "matcher": "Write.*\\.rs$",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/rust-check.sh"
          }
        ]
      },
      {
        "matcher": "Write.*\\.py$",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/python-check.sh"
          }
        ]
      }
    ]
  }
}
```

This demonstrates language-specific validation with separate hooks for each language.

---

## Complete Plugin Development Example

Here's a complete walkthrough of creating a plugin from scratch:

### 1. Initialize Project

```bash
mkdir my-awesome-plugin
cd my-awesome-plugin
git init
```

### 2. Create plugin.json

```json
{
  "name": "my-awesome-plugin",
  "version": "0.1.0",
  "description": "An awesome plugin for Claude Code",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",
  "homepage": "https://github.com/yourusername/my-awesome-plugin",
  "repository": "https://github.com/yourusername/my-awesome-plugin"
}
```

### 3. Add First Command

```bash
mkdir -p commands
cat > commands/hello.md << 'EOF'
---
description: "Say hello with a personalized greeting"
---

Generate a friendly, personalized greeting for {{0:name}}.

Make the greeting:
- Warm and welcoming
- Include time of day
- Add a relevant emoji
- Keep it professional yet friendly
EOF
```

### 4. Test Locally

```bash
/plugin marketplace add .
/plugin install my-awesome-plugin@my-awesome-plugin
/hello Claude
```

### 5. Add Documentation

```bash
cat > README.md << 'EOF'
# My Awesome Plugin

A Claude Code plugin that provides awesome functionality.

## Installation

\`\`\`bash
/plugin marketplace add yourusername/my-awesome-plugin
/plugin install my-awesome-plugin@yourusername
\`\`\`

## Commands

- `/hello <name>` - Generate a personalized greeting

## License

MIT
EOF
```

### 6. Iterate and Expand

- Add more commands
- Create custom agents
- Implement hooks
- Add MCP servers

### 7. Publish

```bash
git add .
git commit -m "feat: initial plugin release"
git tag v0.1.0
git push origin main --tags
```

Then create a marketplace entry or publish to GitHub for others to use.
