---
name: stack-architecture
version: 0.1.0
description: Design stack-based systems using @outfitter/* packages. Use when planning new projects, choosing packages, designing handler architecture, or when "architecture", "design", "structure", "plan handlers", or "error taxonomy" are mentioned.
context: fork
agent: stacker
allowed-tools: Read Grep Glob
---

# Stack Architecture Design

Design transport-agnostic handler systems with proper Result types and error taxonomy.

## Process

### Step 1: Understand Requirements

Gather information about:

- **Transport surfaces** — CLI, MCP, HTTP, or all?
- **Domain operations** — What actions does the system perform?
- **Failure modes** — What can go wrong? (maps to error taxonomy)
- **External dependencies** — APIs, databases, file system?

### Step 2: Design Handler Layer

For each domain operation:

1. Define input type (Zod schema)
2. Define output type
3. Identify possible error types (from taxonomy)
4. Write handler signature: `Handler<Input, Output, Error1 | Error2>`

**Example:**

```typescript
// Input schema
const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

// Output type
interface User {
  id: string;
  email: string;
  name: string;
}

// Handler signature
const createUser: Handler<unknown, User, ValidationError | ConflictError>;
```

### Step 3: Map Errors to Taxonomy

Map domain errors to the 10 categories:

| Domain Error | Stack Category | Error Class |
|--------------|----------------|-------------|
| Not found | `not_found` | `NotFoundError` |
| Invalid input | `validation` | `ValidationError` |
| Already exists | `conflict` | `ConflictError` |
| No permission | `permission` | `PermissionError` |
| Auth required | `auth` | `AuthError` |
| Timed out | `timeout` | `TimeoutError` |
| Connection failed | `network` | `NetworkError` |
| Limit exceeded | `rate_limit` | `RateLimitError` |
| Bug/unexpected | `internal` | `InternalError` |
| User cancelled | `cancelled` | `CancelledError` |

### Step 4: Choose Packages

Packages are organized into three tiers:

#### Package Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                        TOOLING TIER                              │
│  Build-time, dev-time, test-time packages                       │
│  @outfitter/testing                                             │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on
┌─────────────────────────────────────────────────────────────────┐
│                        RUNTIME TIER                              │
│  Application-specific packages for different deployment targets  │
│  @outfitter/cli    @outfitter/mcp    @outfitter/daemon          │
│  @outfitter/config @outfitter/logging @outfitter/file-ops       │
│  @outfitter/state                                               │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on
┌─────────────────────────────────────────────────────────────────┐
│                       FOUNDATION TIER                            │
│  Zero-runtime-dependency core packages                          │
│  @outfitter/contracts    @outfitter/types                       │
└─────────────────────────────────────────────────────────────────┘
```

| Tier | Packages | Dependency Rule |
|------|----------|-----------------|
| **Foundation** | `contracts`, `types` | No @outfitter/* deps |
| **Runtime** | `cli`, `mcp`, `daemon`, `config`, `logging`, `file-ops`, `state` | May depend on Foundation |
| **Tooling** | `testing` | May depend on Foundation + Runtime |

#### Package Selection

| Package | Purpose | When to Use |
|---------|---------|-------------|
| `@outfitter/contracts` | Result types, errors, Handler contract | Always (foundation) |
| `@outfitter/types` | Type utilities, collection helpers | Type manipulation |
| `@outfitter/cli` | CLI commands, output modes, formatting | CLI applications |
| `@outfitter/mcp` | MCP server, tool registration | AI agent tools |
| `@outfitter/config` | XDG paths, config loading | Configuration needed |
| `@outfitter/logging` | Structured logging, redaction | Logging needed |
| `@outfitter/daemon` | Background services, IPC | Long-running services |
| `@outfitter/file-ops` | Secure paths, atomic writes, locking | File operations |
| `@outfitter/state` | Pagination, cursor state | Paginated data |
| `@outfitter/testing` | Test harnesses, fixtures | Testing |

**Selection criteria:**

- All projects need `@outfitter/contracts` (foundation)
- CLI applications add `@outfitter/cli` (includes UI components)
- MCP servers add `@outfitter/mcp`
- File operations need both `@outfitter/config` (paths) and `@outfitter/file-ops` (safety)

### Step 5: Design Context Flow

Determine:

- **Entry points** — Where is context created? (CLI main, MCP server, HTTP handler)
- **Context contents** — Logger, config, signal, workspaceRoot
- **Tracing** — How requestId flows through operations

## Output Templates

### Architecture Overview

```
Project: {PROJECT_NAME}
Transport Surfaces: {CLI | MCP | HTTP | ...}

Directory Structure:
├── src/
│   ├── handlers/           # Transport-agnostic business logic
│   │   ├── {handler-1}.ts
│   │   └── {handler-2}.ts
│   ├── commands/           # CLI adapter (if CLI)
│   ├── tools/              # MCP adapter (if MCP)
│   └── index.ts            # Entry point
└── tests/
    └── handlers/           # Handler tests

Dependencies:
├── @outfitter/contracts    # Foundation (always)
├── @outfitter/{package-2}  # {reason}
└── @outfitter/{package-3}  # {reason}
```

### Handler Inventory

| Handler | Input | Output | Errors | Description |
|---------|-------|--------|--------|-------------|
| `getUser` | `GetUserInput` | `User` | `NotFoundError` | Fetch user by ID |
| `createUser` | `CreateUserInput` | `User` | `ValidationError`, `ConflictError` | Create new user |
| `deleteUser` | `DeleteUserInput` | `void` | `NotFoundError`, `PermissionError` | Remove user |

### Error Strategy

```
Domain Errors → Stack Taxonomy:

{domain-error-1} → {stack-category} ({ErrorClass})
  - When: {condition}
  - Exit code: {code}

{domain-error-2} → {stack-category} ({ErrorClass})
  - When: {condition}
  - Exit code: {code}
```

### Implementation Order

1. **Foundation** — Install packages, create types
2. **Core handlers** — Implement business logic with tests
3. **Transport adapters** — Wire up CLI/MCP/HTTP
4. **Testing** — Integration tests across transports

## Constraints

**Always:**
- Recommend Result types over exceptions
- Map domain errors to taxonomy categories
- Design handlers as pure functions (input, context) → Result
- Consider all transport surfaces upfront
- Include error types in handler signatures

**Never:**
- Suggest throwing exceptions
- Design transport-specific logic in handlers
- Recommend hardcoded paths
- Skip error type planning
- Couple handlers to specific transports

## Related Skills

- `outfitter-stack:stack-patterns` — Reference for all patterns
- `outfitter:tdd` — TDD implementation methodology
- `outfitter-stack:stack-templates` — Templates for components
