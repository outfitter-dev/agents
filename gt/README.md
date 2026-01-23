# Graphite Plugin

Graphite stack workflows for trunk-based development with stacked PRs.

## Skills

### stacks

Complete Graphite workflow for managing stacked PRs. Use when creating branch stacks, navigating dependencies, submitting for review, or syncing with trunk.

**Triggers**: graphite, gt commands, stacked PRs, trunk-based development, gt create, gt submit

**Covers**:
- Branch creation with `gt create`
- Stack navigation (`gt up`, `gt down`, `gt top`, `gt bottom`)
- Modifying branches with `gt modify` and `gt absorb`
- Stack visualization (`gt status`, `gt log`, `gt ls`)
- Submitting PRs with `gt submit`
- Syncing and maintenance (`gt sync`, `gt restack`)
- Recovery patterns (`gt undo`, `gt repo fix`)

## Installation

```bash
/plugin install gt@outfitter
```

## Requirements

- Graphite CLI (`gt`) installed and authenticated
- Repository initialized with Graphite (`gt init`)
