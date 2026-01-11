# Matcher Patterns Reference

Matchers determine which tool invocations or events trigger a hook. They are case-sensitive strings that support exact matching, regex patterns, wildcards, and file patterns.

## Matcher Types

### Simple String Match

Match exact tool name:

```json
{"matcher": "Write"}    // Only Write tool
{"matcher": "Edit"}     // Only Edit tool
{"matcher": "Bash"}     // Only Bash tool
{"matcher": "Read"}     // Only Read tool
{"matcher": "Grep"}     // Only Grep tool
{"matcher": "Glob"}     // Only Glob tool
{"matcher": "Task"}     // Only Task tool (subagents)
{"matcher": "WebFetch"} // Only WebFetch tool
{"matcher": "WebSearch"}// Only WebSearch tool
```

### OR Patterns (Pipe)

Match multiple tools with `|`:

```json
{"matcher": "Edit|Write"}              // Edit OR Write
{"matcher": "Read|Grep|Glob"}          // Any read/search operation
{"matcher": "Write|Edit|NotebookEdit"} // Multiple specific tools
{"matcher": "WebFetch|WebSearch"}      // Web operations
```

### Wildcard Match

Match all tools with `*`:

```json
{"matcher": "*"}  // Matches everything
```

**Use cases**:
- Logging all tool usage
- Global validation
- Universal context injection
- Metrics collection

### File Pattern Match

Match tools operating on specific file types with `(pattern)`:

```json
{"matcher": "Write(*.py)"}              // Write Python files
{"matcher": "Edit(*.ts)"}               // Edit TypeScript files
{"matcher": "Write(*.md)"}              // Write Markdown files
{"matcher": "Write|Edit(*.js)"}         // Write or Edit JavaScript
{"matcher": "Write|Edit(*.ts|*.tsx)"}   // TypeScript and TSX files
```

**Supported patterns**:
- `*.ext` - Any file with extension
- `path/*.ext` - Files in specific directory (relative to project)
- `**/*.ext` - Recursive file match

**More examples**:

```json
{"matcher": "Write(*.tsx)"}             // React components
{"matcher": "Write|Edit(*.rs)"}         // Rust files
{"matcher": "Write(src/**/*.ts)"}       // TS files in src/
{"matcher": "Edit(.env*)"}              // .env files
{"matcher": "Write(*.json)"}            // JSON files
{"matcher": "Write|Edit(*.yaml|*.yml)"} // YAML files
```

### Regex Patterns

Full regex support for complex matching:

```json
{"matcher": "^Write$"}           // Exactly "Write", no prefix/suffix
{"matcher": ".*Edit.*"}          // Contains "Edit" anywhere
{"matcher": "Notebook.*"}        // Starts with "Notebook"
{"matcher": "Bash|WebFetch"}     // Bash or WebFetch
```

**Regex features**:
- `|` - OR operator
- `.` - Any character
- `*` - Zero or more
- `+` - One or more
- `^` - Start of string
- `$` - End of string
- `[abc]` - Character class
- `\w` - Word character
- `\d` - Digit

## MCP Tool Matchers

MCP (Model Context Protocol) tools follow naming: `mcp__<server-name>__<tool-name>`

### Match All MCP Tools

```json
{"matcher": "mcp__.*__.*"}  // Any MCP tool from any server
```

### Match Specific Server

```json
{"matcher": "mcp__memory__.*"}      // All memory MCP tools
{"matcher": "mcp__github__.*"}      // All GitHub MCP tools
{"matcher": "mcp__filesystem__.*"}  // All filesystem MCP tools
{"matcher": "mcp__brave-search__.*"}// All Brave search tools
```

### Match Specific Tools

```json
{"matcher": "mcp__github__create_issue"}     // Specific GitHub tool
{"matcher": "mcp__github__create_pull_request"} // Create PR tool
{"matcher": "mcp__memory__add_memory"}       // Add to memory
{"matcher": "mcp__memory__search_memory"}    // Search memory
```

### Complex MCP Patterns

```json
// All delete operations across MCP servers
{"matcher": "mcp__.*__delete.*"}

// Create operations in GitHub
{"matcher": "mcp__github__(create_issue|create_comment|create_pull_request)"}

// All read operations in filesystem
{"matcher": "mcp__filesystem__(read|list|search).*"}

// Dangerous operations to block
{"matcher": "mcp__.*(delete|remove|destroy).*"}
```

## Lifecycle Event Matchers

Some hooks use special matchers for lifecycle events instead of tool names.

### SessionStart Matchers

```json
{"matcher": "startup"}   // Fresh Claude Code start
{"matcher": "resume"}    // Session resume (--resume, --continue)
{"matcher": "clear"}     // After /clear command
{"matcher": "compact"}   // After context compaction
{"matcher": "*"}         // Any session start type
```

### SessionEnd Matchers

```json
{"matcher": "clear"}             // User ran /clear
{"matcher": "logout"}            // User logged out
{"matcher": "prompt_input_exit"} // Exited during prompt
{"matcher": "other"}             // Other reasons
{"matcher": "*"}                 // Any end reason
```

### PreCompact Matchers

```json
{"matcher": "manual"}    // User triggered /compact
{"matcher": "auto"}      // Automatic compaction
{"matcher": "*"}         // Any compact type
```

### Stop/SubagentStop Matchers

```json
{"matcher": "*"}         // Always matches (lifecycle events)
```

## Complex Matcher Examples

### Multiple Tools with File Patterns

```json
// Format Python or TypeScript
{"matcher": "Write|Edit(*.py)|Write|Edit(*.ts)"}

// All code files
{"matcher": "Write|Edit(*.ts|*.tsx|*.js|*.jsx|*.py|*.rs)"}
```

### Excluding Patterns

There's no direct exclusion, but you can handle this in the hook script:

```bash
#!/usr/bin/env bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip test files
if [[ "$FILE_PATH" =~ \.(test|spec)\. ]]; then
  exit 0
fi

# Skip node_modules
if [[ "$FILE_PATH" =~ node_modules/ ]]; then
  exit 0
fi

# Continue with validation...
```

### Combining with Regex

```json
// Bash or any MCP tool
{"matcher": "Bash|mcp__.*__.*"}

// Read operations (multiple tools)
{"matcher": "Read|Grep|Glob|WebFetch"}

// File modifications only
{"matcher": "Write|Edit|NotebookEdit"}
```

## Matcher Debugging

If your hook isn't firing, check:

1. **Case sensitivity**: `Write` works, `write` doesn't
2. **Exact tool names**: Use `claude --debug` to see actual tool names
3. **File patterns**: Ensure the pattern matches the file path format
4. **MCP naming**: Verify server and tool names match exactly

### Testing Matchers

```bash
# See what tools Claude is calling
claude --debug 2>&1 | grep "tool_name"

# Test regex patterns
echo "Write" | grep -E '^Write$'  # Should match
echo "WriteFile" | grep -E '^Write$'  # Should not match
```

## Common Matcher Patterns

### Security Validation

```json
// All file operations
{"matcher": "Write|Edit|Read"}

// Dangerous commands
{"matcher": "Bash"}

// Network operations
{"matcher": "WebFetch|WebSearch|mcp__.*"}
```

### Auto-Formatting

```json
// TypeScript/JavaScript
{"matcher": "Write|Edit(*.ts|*.tsx|*.js|*.jsx)"}

// Python
{"matcher": "Write|Edit(*.py)"}

// Rust
{"matcher": "Write|Edit(*.rs)"}

// All supported
{"matcher": "Write|Edit(*.ts|*.tsx|*.py|*.rs|*.go)"}
```

### Logging

```json
// All tool operations
{"matcher": "*"}

// All MCP operations
{"matcher": "mcp__.*__.*"}

// File operations only
{"matcher": "Write|Edit|Read|Grep|Glob"}
```

### External Integration

```json
// GitHub operations
{"matcher": "mcp__github__.*"}

// Memory operations
{"matcher": "mcp__memory__.*"}

// All external services
{"matcher": "mcp__.*__.*|WebFetch|WebSearch"}
```
