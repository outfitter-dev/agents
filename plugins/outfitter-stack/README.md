# Outfitter Stack Plugin

Claude Code plugin for @outfitter/* packages. Provides skills, agents, and commands for building with the Outfitter Stack.

## Installation

```bash
# Add marketplace
/plugin marketplace add outfitter-dev/agents

# Install plugin
/plugin install outfitter-stack@outfitter
```

## Skills

| Skill | Purpose |
|-------|---------|
| `outfitter-stack:stack-patterns` | Core patterns: Result types, Handler contract, Error taxonomy, package reference |
| `outfitter-stack:stack-templates` | Create handlers, CLI commands, MCP tools, daemons |
| `outfitter-stack:stack-audit` | Scan codebase for adoption candidates and scope assessment |
| `outfitter-stack:stack-review` | Audit code for stack compliance |
| `outfitter-stack:stack-architecture` | Design stack-based systems, choose packages |
| `outfitter-stack:stack-feedback` | Report issues to outfitter-dev/outfitter |
| `outfitter-stack:stack-debug` | Troubleshoot stack-specific issues |

## Agents

| Agent | Purpose |
|-------|---------|
| `outfitter-stack:stacker` | Skill-aware generalist for all stack work |

## Commands

| Command | Purpose |
|---------|---------|
| `/adopt [path]` | Phased Outfitter Stack adoption workflow |
| `/audit [path]` | Quick compliance audit of file or directory |

## Scripts

| Script | Purpose |
|--------|---------|
| `skills/stack-audit/scripts/init-audit.ts` | Scan codebase for adoption candidates |
| `skills/stack-feedback/scripts/create-issue.ts` | Create GitHub issues for stack feedback |

## Quick Start

### Learn the Stack

```
Tell me about Outfitter Stack patterns
```

The `outfitter-stack:stack-patterns` skill activates automatically.

### Create a Handler

```
Create a handler for fetching user profiles
```

The `outfitter-stack:stack-templates` skill provides templates.

### Review Code

```
Audit src/handlers/ for stack compliance
```

Or use the command:

```
/audit src/handlers/
```

### Adopt Outfitter Stack

```
/adopt
```

The `/adopt` command orchestrates a phased workflow:
1. **Audit** — Scan codebase with `outfitter-stack:stack-audit`
2. **Foundation** — Scaffold infrastructure with `outfitter-stack:stack-templates`
3. **Convert** — TDD handler conversion with `outfitter:tdd` + `outfitter-stack:stack-patterns`
4. **Adapters** — Wire CLI/MCP with `outfitter-stack:stack-templates`
5. **Review** — Verify compliance with `outfitter-stack:stack-review`
6. **Feedback** — Report issues with `outfitter-stack:stack-feedback`

## Stack Overview

Outfitter Stack provides transport-agnostic infrastructure:

- **Handler Contract**: Pure functions returning `Result<T, E>`
- **Error Taxonomy**: 10 categories with exit/HTTP code mapping
- **Result Types**: Explicit error handling with `better-result`
- **Validation**: Zod schemas with `createValidator()`

Write handlers once, expose via CLI, MCP, or HTTP.

## Packages

| Package | Purpose |
|---------|---------|
| `@outfitter/contracts` | Result types, errors, Handler contract |
| `@outfitter/cli` | CLI commands with output modes |
| `@outfitter/mcp` | MCP server framework |
| `@outfitter/config` | XDG-compliant configuration |
| `@outfitter/logging` | Structured logging with redaction |
| `@outfitter/daemon` | Background services with IPC |
| `@outfitter/file-ops` | Secure paths, atomic writes |
| `@outfitter/testing` | Test harnesses for CLI/MCP |

## Links

- [Outfitter Stack Repository](https://github.com/outfitter-dev/outfitter)
- [Documentation](https://github.com/outfitter-dev/outfitter/tree/main/docs)
- [npm Packages](https://www.npmjs.com/org/outfitter)
