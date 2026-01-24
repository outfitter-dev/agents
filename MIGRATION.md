# Migration Guide

This document tracks plugin and skill renames to help update external references.

## Plugin Renames

| Old Name | New Name | Notes |
|----------|----------|-------|
| `baselayer` | `outfitter` | Core methodology plugin |
| `agent-kit` | *(merged into outfitter)* | Skills, agents, templates now in `outfitter` |
| `gitbutler` | `but` | Matches CLI command |
| `graphite` | `gt` | Matches CLI command |
| `vcs` | *(deleted)* | Split into `but` + `gt`; `multi-agent-vcs` moved to `outfitter` |

## Install Commands

```bash
# Old
/plugin install baselayer@outfitter
/plugin install gitbutler@outfitter
/plugin install vcs@outfitter

# New
/plugin install outfitter@outfitter
/plugin install but@outfitter
/plugin install gt@outfitter
```

## Skill Prefix Changes

All skill invocations using the old prefixes need updating:

| Old | New |
|-----|-----|
| `baselayer:*` | `outfitter:*` |
| `agent-kit:*` | `outfitter:*` |
| `vcs:*` | *(see skill mapping below)* |

## Skill Path Mapping

### baselayer → outfitter

Skills moved and renamed to shorter forms. Prefix changes from `baselayer:` to `outfitter:`.

| Old Skill Reference | New Skill Reference |
|---------------------|---------------------|
| `baselayer:debugging-and-diagnosis` | `outfitter:debugging` |
| `baselayer:test-driven-development` | `outfitter:tdd` |
| `baselayer:use-the-best-tool` | `outfitter:which-tool` |
| `baselayer:research-and-report` | `outfitter:research` |
| `baselayer:root-cause-analysis` | `outfitter:find-root-causes` |
| `baselayer:software-architecture` | `outfitter:architecture` |
| `baselayer:software-engineering` | `outfitter:software-craft` |
| `baselayer:security-engineering` | `outfitter:security` |
| `baselayer:performance-engineering` | `outfitter:performance` |
| `baselayer:complexity-analysis` | `outfitter:simplify` |
| `baselayer:pattern-analysis` | `outfitter:patterns` |
| `baselayer:scenario-testing` | `outfitter:scenarios` |
| `baselayer:subagent-coordination` | `outfitter:subagents` |
| `baselayer:status-reporting` | `outfitter:status` |
| `baselayer:codebase-analysis` | `outfitter:codebase-recon` |
| `baselayer:conversation-analysis` | `outfitter:session-analysis` |
| `baselayer:cli-development-guidelines` | `outfitter:cli-dev` |
| `baselayer:pathfinding` | `outfitter:pathfinding` |
| `baselayer:code-review` | `outfitter:code-review` |
| `baselayer:patternify` | `outfitter:patternify` |
| `baselayer:context-management` | `outfitter:context-management` |
| *(all other baselayer skills)* | *(same pattern)* |

### agent-kit → outfitter (merged + renamed)

Skills were merged into `outfitter` and renamed to shorter forms:

| Old Skill Reference | New Skill Reference |
|---------------------|---------------------|
| `agent-kit:skills-development` | `outfitter:skills-dev` |
| `agent-kit:claude-plugin-development` | `outfitter:claude-plugins` |
| `agent-kit:claude-agent-development` | `outfitter:claude-agents` |
| `agent-kit:claude-hook-authoring` | `outfitter:claude-hooks` |
| `agent-kit:claude-command-authoring` | `outfitter:claude-commands` |
| `agent-kit:claude-rules-authoring` | `outfitter:claude-rules` |
| `agent-kit:claude-code-configuration` | `outfitter:claude-config` |
| `agent-kit:codex-configuration` | `outfitter:codex-config` |

**Skill restructured:**

| Old | New |
|-----|-----|
| `outfitter:claude-skills` | Merged into `outfitter:skills-dev` as `references/claude-code.md` |

Claude-specific guidance (tool restrictions, testing, troubleshooting) is now in `skills-dev/references/claude-code.md` rather than a separate skill.

**Agent moved:**

| Old | New |
|-----|-----|
| `agent-kit:agent-expert` | `outfitter:quartermaster` |

### vcs → but / gt / outfitter

| Old Path | New Path | New Reference |
|----------|----------|---------------|
| `vcs/skills/gitbutler-virtual-branches/` | `but/skills/virtual-branches/` | `but:virtual-branches` |
| `vcs/skills/gitbutler-multi-agent/` | `but/skills/multi-agent/` | `but:multi-agent` |
| `vcs/skills/gitbutler-stacks/` | `but/skills/stacks/` | `but:stacks` |
| `vcs/skills/gitbutler-complete-branch/` | `but/skills/complete-branch/` | `but:complete-branch` |
| `vcs/skills/graphite-stacks/` | `gt/skills/stacks/` | `gt:stacks` |
| `vcs/skills/multi-agent-vcs/` | `outfitter/skills/multi-agent-vcs/` | `outfitter:multi-agent-vcs` |

### gitbutler (old standalone) → but

| Old Path | New Path |
|----------|----------|
| `gitbutler/skills/version-control/` | `but/skills/virtual-branches/` |
| `gitbutler/skills/multi-agent/` | `but/skills/multi-agent/` |
| `gitbutler/skills/stack-workflows/` | `but/skills/stacks/` |
| `gitbutler/skills/complete-branch/` | `but/skills/complete-branch/` |

## Agent Mapping

| Old Reference | New Reference |
|---------------|---------------|
| `baselayer:senior-dev` | `outfitter:engineer` |
| `baselayer:ranger` | `outfitter:reviewer` |
| `baselayer:analyst` | `outfitter:analyst` |
| `baselayer:debugger` | `outfitter:debugger` |
| `baselayer:tester` | `outfitter:tester` |
| `baselayer:skeptic` | `outfitter:skeptic` |
| `baselayer:specialist` | `outfitter:specialist` |
| `baselayer:scout` | `outfitter:scout` |
| `baselayer:librarian` | `outfitter:librarian` |
| `baselayer:pattern-analyzer` | `outfitter:pattern-analyzer` |
| `vcs:gitbutler-expert` | `but:gitbutler-expert` |

### Agent Renames (outfitter 1.0)

| Old Name | New Name |
|----------|----------|
| `senior-dev` | `engineer` |
| `ranger` | `reviewer` |

## Command Mapping

| Old Command | New Command |
|-------------|-------------|
| `/baselayer:debug` | `/outfitter:debug` |
| `/baselayer:tdd` | *(removed — use `outfitter:tdd` skill directly)* |
| `/baselayer:pathfind` | `/outfitter:collab` |
| `/baselayer:simplify` | `/outfitter:simplify` |
| `/baselayer:patternify` | `/outfitter:patternify` |
| `/baselayer:sitrep` | `/outfitter:sitrep` |
| `/baselayer:best-tool` | `/outfitter:toolcheck` |
| `/baselayer:dispatch-agents` | `/outfitter:crew:dispatch` |

### Command Renames (outfitter 1.0)

| Old Name | New Name |
|----------|----------|
| `best-tool` | `toolcheck` |
| `dispatch-agents` | `crew:dispatch` |
| `pathfind` | `collab` |
| `tdd` | *(removed)* |

## Directory Structure

### Before

```
agents/
├── baselayer/           # Core methodology
├── gitbutler/           # GitButler (standalone, old)
├── vcs/                 # Unified VCS (GitButler + Graphite + multi-agent)
├── agent-kit/
└── cli-dev/
```

### After

```
agents/
├── outfitter/           # Core methodology + extensibility skills (merged from agent-kit)
├── but/                 # GitButler workflows
├── gt/                  # Graphite workflows
└── cli-dev/
```

## Search & Replace Patterns

For bulk updates in external codebases:

```bash
# Plugin names
s/baselayer/outfitter/g
s/\bagent-kit\b/outfitter/g
s/\bgitbutler\b/but/g      # word boundary to avoid partial matches
s/\bgraphite\b/gt/g

# Skill prefixes
s/baselayer:/outfitter:/g
s/agent-kit:/outfitter:/g
s/vcs:gitbutler-/but:/g
s/vcs:graphite-/gt:/g
s/vcs:multi-agent-vcs/outfitter:multi-agent-vcs/g

# Skill renames (agent-kit → outfitter)
s/skills-development/skills-dev/g
s/claude-plugin-development/claude-plugins/g
s/claude-agent-development/claude-agents/g
s/claude-hook-authoring/claude-hooks/g
s/claude-command-authoring/claude-commands/g
s/claude-rules-authoring/claude-rules/g
s/claude-code-configuration/claude-config/g
s/codex-configuration/codex-config/g

# Skill renames (baselayer/outfitter shorter names)
s/debugging-and-diagnosis/debugging/g
s/test-driven-development/tdd/g
s/use-the-best-tool/which-tool/g
s/research-and-report/research/g
s/root-cause-analysis/find-root-causes/g
s/software-architecture/architecture/g
s/software-engineering/software-craft/g
s/security-engineering/security/g
s/performance-engineering/performance/g
s/complexity-analysis/simplify/g
s/pattern-analysis/patterns/g
s/scenario-testing/scenarios/g
s/subagent-coordination/subagents/g
s/status-reporting/status/g
s/codebase-analysis/codebase-recon/g
s/conversation-analysis/session-analysis/g
s/cli-development-guidelines/cli-dev/g
```

## Skill Name Shortening (outfitter)

All verbose skill names shortened for cleaner invocations:

| Old Name | New Name |
|----------|----------|
| `debugging-and-diagnosis` | `debugging` |
| `test-driven-development` | `tdd` |
| `use-the-best-tool` | `which-tool` |
| `research-and-report` | `research` |
| `root-cause-analysis` | `find-root-causes` |
| `software-architecture` | `architecture` |
| `software-engineering` | `software-craft` |
| `security-engineering` | `security` |
| `performance-engineering` | `performance` |
| `complexity-analysis` | `simplify` |
| `pattern-analysis` | `patterns` |
| `scenario-testing` | `scenarios` |
| `subagent-coordination` | `subagents` |
| `status-reporting` | `status` |
| `codebase-analysis` | `codebase-recon` |
| `conversation-analysis` | `session-analysis` |
| `cli-development-guidelines` | `cli-dev` |

## Completed Migrations

- [x] `baselayer` → `outfitter` (core methodology)
- [x] `agent-kit` → merged into `outfitter` (skills, agents, templates)
- [x] `vcs` → split into `but` + `gt`
- [x] Skill naming convention overhaul (shorter names)

## Pending Changes

*Document future migrations here before executing them.*

*(none pending)*
