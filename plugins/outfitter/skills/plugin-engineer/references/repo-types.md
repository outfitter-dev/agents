# Repo Type Patterns

Guidance for different repository types.

## CLI Tool

Examples: git, docker, kubectl, gh, npm

### Discovery Focus
- Command structure and subcommands
- Common workflows users perform
- Flags that are hard to remember
- Error messages and recovery patterns

### Pattern Types
- Command sequences (e.g., add → commit → push)
- Option combinations (e.g., docker build with caching)
- Error handling workflows

### Primary Components
- **Skills**: For multi-step workflows
- **Commands**: Entry points for common operations

### Example Plugin Structure

```
kubectl-plugin/
├── skills/
│   ├── deploy-workflow/      # Rolling deployment process
│   ├── debug-pod/            # Pod debugging methodology
│   └── resource-management/  # Resource lifecycle
├── commands/
│   ├── quick-deploy.md       # Fast deployment entry
│   └── pod-shell.md          # Quick shell access
└── hooks/
    └── hooks.json            # Validate before apply
```

---

## Library/SDK

Examples: Stripe, OpenAI, AWS SDK, Prisma

### Discovery Focus
- API surface and key methods
- Authentication patterns
- Common integration scenarios
- Error handling conventions

### Pattern Types
- Request/response patterns
- Error handling and retry logic
- Configuration and initialization

### Primary Components
- **Skills**: Integration patterns and best practices
- **Commands**: Quick API calls

### Example Plugin Structure

```
stripe-plugin/
├── skills/
│   ├── payment-flow/         # Checkout implementation
│   ├── subscription-mgmt/    # Subscription lifecycle
│   └── webhook-handling/     # Webhook verification
├── commands/
│   ├── test-webhook.md       # Trigger test webhooks
│   └── list-products.md      # Quick product listing
└── README.md
```

---

## MCP Server

Examples: filesystem, database, memory, linear

### Discovery Focus
- Tool manifest and capabilities
- Common operation sequences
- State management patterns
- Error modes and recovery

### Pattern Types
- Tool combinations (read → transform → write)
- State management across calls
- Coordination patterns

### Primary Components
- **Skills**: Coordinated operations
- **Hooks**: Automatic triggers based on state

### Example Plugin Structure

```
database-mcp-plugin/
├── skills/
│   ├── migration-workflow/   # Schema migration process
│   ├── backup-restore/       # Backup and recovery
│   └── query-optimization/   # Performance tuning
├── commands/
│   ├── quick-backup.md       # One-command backup
│   └── schema-diff.md        # Compare schemas
└── hooks/
    └── hooks.json            # Pre-migration validation
```

---

## Build Tool

Examples: webpack, vite, esbuild, turbo

### Discovery Focus
- Configuration options
- Plugin/loader ecosystem
- Build optimization patterns
- Common troubleshooting

### Pattern Types
- Configuration generation
- Performance optimization sequences
- Migration between tools

### Primary Components
- **Skills**: Configuration and optimization
- **Commands**: Quick actions (build, analyze)

---

## Testing Framework

Examples: jest, vitest, playwright, cypress

### Discovery Focus
- Test patterns and best practices
- Configuration options
- Mocking and fixtures
- CI integration

### Pattern Types
- Test organization
- Fixture management
- Coverage optimization

### Primary Components
- **Skills**: Testing methodology
- **Hooks**: Pre-commit test runs

---

## Quick Mode Criteria

Use quick mode (skip Stages 3-4) when:

| Criterion | Quick Mode | Full Pipeline |
|-----------|------------|---------------|
| Commands | < 5 | 5+ |
| Scope | Single purpose | Multi-purpose |
| Patterns | Obvious | Needs discovery |
| User request | "Just get it working" | "Comprehensive" |
