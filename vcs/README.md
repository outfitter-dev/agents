# VCS Plugin

Version control workflows for Graphite stacks, GitButler branches, and multi-agent coordination.

## Installation

```bash
/plugin marketplace add outfitter-dev/agents
/plugin install vcs@outfitter
```

## Skills

### Graphite

#### graphite-stacks

Graphite stack workflows for trunk-based development with stacked PRs.

**Triggers**: Graphite, gt commands, stacked PRs, branch stacks

**Covers**:
- Creating and managing stacks with `gt create`, `gt modify`
- Navigation: `gt up`, `gt down`, `gt top`, `gt bottom`
- Addressing PR feedback with `gt absorb`
- Reorganizing branch relationships with `gt move`
- Stack recovery procedures

### GitButler

#### gitbutler-virtual-branches

Core GitButler workflows for virtual branch version control.

**Triggers**: GitButler, but commands, virtual branches, `--gitbutler`

**Covers**:
- Virtual branch creation and management
- File assignment with `but rub`
- Parallel feature development
- Post-hoc commit organization

#### gitbutler-multi-agent

Multi-agent coordination using GitButler's virtual branch model.

**Triggers**: parallel agents with GitButler, concurrent agents, agent handoffs

**Covers**:
- Parallel feature development patterns
- Sequential agent handoffs
- Branch naming conventions
- AI integration methods (hooks, MCP)

#### gitbutler-stacks

Stacked branch workflows using GitButler's `--anchor` flag.

**Triggers**: GitButler stacks, dependent branches, `--anchor`

**Covers**:
- Creating dependency stacks
- Post-hoc stack organization
- PR preparation for stacks
- Stack reorganization with `but rub`

#### gitbutler-complete-branch

Completing work and merging virtual branches to main.

**Triggers**: completing GitButler branches, merging to main, `--complete-branch`

**Covers**:
- Pre-integration checklist
- Direct merge workflow
- Pull request workflow
- Stacked branch completion (bottom-up)
- Error recovery

### Multi-Agent Coordination

#### multi-agent-vcs

Tool-agnostic patterns for coordinating git when multiple AI agents work in parallel.

**Triggers**: parallel agents, subagent coordination, multi-agent git

**Covers**:
- Orchestrator-only git policy
- Subagent prompt templates
- TodoWrite patterns for tracking git operations
- Recovery from parallel agent corruption

## Agents

### gitbutler-expert

Specialist agent for GitButler operations.

**Use when**: Working with GitButler virtual branches, workspace management, or complex branch operations.

## Quick Reference

### Graphite Essentials

```bash
# Create stacked branches
gt create 'feature/step-1' -am "feat: first step"
gt create 'feature/step-2' -am "feat: second step"

# Navigate
gt up / gt down / gt top / gt bottom

# Modify
gt modify -acm "fix: address feedback"

# Address multi-PR feedback
gt top && gt absorb -a

# Submit
gt submit --stack
```

### GitButler Essentials

```bash
# Initialize
but init

# Create virtual branch
but branch new feature-auth

# Check status for file IDs
but status

# Assign file to branch
but rub <file-id> <branch>

# Commit
but commit <branch> -m "feat: add auth"

# Create stacked branch
but branch new child-feature --anchor parent-feature
```

### Multi-Agent Rule

> Subagents write filesystem only. Orchestrator handles all git operations.

```
IMPORTANT: Do NOT perform any git operations (commit, push, branch creation).
Write code to the filesystem only. The orchestrator handles all git state.
Report which files you created/modified when done.
```

## Tool Comparison

| Aspect | Graphite | GitButler |
|--------|----------|-----------|
| **Model** | Linear stacks of physical branches | Virtual branches, all applied |
| **Branch switching** | Required (`gt up`/`gt down`) | Never needed |
| **PR Submission** | `gt submit --stack` | Manual (`gh` CLI) |
| **Multi-agent** | Serial (checkout required) | Parallel (virtual branches) |
| **Post-hoc organization** | Difficult | `but rub` trivial |
| **CLI completeness** | Full automation | Partial |

**Choose Graphite for**: Production automation, PR submission, terminal-first
**Choose GitButler for**: Exploratory work, multi-agent, post-hoc organization

**Don't use both in same repo** — incompatible models.

## Related Plugins

- **baselayer** - Subagent coordination patterns (`subagent-coordination` skill)

## License

Apache-2.0
