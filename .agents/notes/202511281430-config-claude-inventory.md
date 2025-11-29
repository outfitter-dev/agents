# ~/.config/claude/ Inventory for Migration

**Date:** 2025-11-28
**Context:** Evaluating personal Claude Code customizations for migration to outfitter-dev/agents

## Summary

| Type | Count | Notable |
|------|-------|---------|
| Skills | 23 | Meta-tools, workflows, GitButler, Linear integration |
| Agents | 21 | Specialist experts (security, TDD, architecture, etc.) |
| Commands | 27 | Organized by workflow (review, sitrep, issues) |

---

## Skills Inventory

### Agent & Skill Authoring (5 skills)
- **agent-authoring** (291 lines) - Creates/updates agents with YAML frontmatter
- **agent-skill-authoring** (292 lines) - Creates/updates skills with progressive disclosure
- **agent-skill-validation** (375 lines) - Validates against best practices, YAML schema
- **agent-skill-review** (505 lines) - Reviews for discoverability, clarity, conciseness
- **agent-validation** (305 lines) - Validates agents against best practices

### Development & Workflow (6 skills)
- **brainstorming** (146 lines) - Adaptive Q&A with confidence tracking → **REPLACED BY JAM**
- **scenario-testing** (305 lines) - E2E testing instead of unit tests
- **find-skills** (285 lines) - Skill discovery across sources → **MIGRATE AS discover-skills**
- **agent-skill-list-flags** - Lists skill flags with grouping
- **find-waymarks** - Code annotation search (:::) → **MIGRATE AS waymark PLUGIN**
- **config-coderabbit** (257 lines) - CodeRabbit YAML config

### Version Control & Git (5 skills) → **MIGRATE AS gitbutler PLUGIN**
- **gitbutler-version-control** (483 lines) - Virtual branches for parallel work
- **gitbutler-stack-workflows** (509 lines) - Stack creation and reorganization
- **gitbutler-complete-branch** (620 lines) - Branch completion with safety checks
- **gitbutler-multi-agent** (420 lines) - Multi-agent collaboration via virtual branches

### Pairing & Collaboration (3 skills)
- **codex-pairing** - OpenAI Codex CLI pair programming
- **oracle-pairing** - Oracle CLI collaboration
- **repoprompt-pairing** - RepoPrompt MCP orchestration

### Project Integration (3 skills)
- **implement-linear-issue** (488 lines) - End-to-end Linear issue workflow
- **implement-pr-feedback** (529 lines) - PR feedback across Graphite stacks
- **sitrep** - Multi-source status reports (Graphite, GitHub, Linear)

---

## Agents Inventory

### Tier 1: Universal, High Value (11 agents)

| Agent | Purpose | Dependencies |
|-------|---------|--------------|
| **code-reviewer** | Tiered feedback (critical→minor) | Superpowers plugin |
| **systematic-debugger** | Evidence-based root cause analysis | Superpowers plugin |
| **test-driven-developer** | TDD red-green-refactor | Bun/Cargo test tools |
| **type-safety-enforcer** | Strict TS, eliminate `any`, Ultracite | TypeScript 5.7+ |
| **security-auditor** | Threat modeling, OWASP/CWE | Security expertise |
| **performance-optimizer** | Profiling, benchmarking, bottlenecks | Profiling tools |
| **senior-engineer** | Production code, features, refactoring | Language knowledge |
| **systems-architect** | Design, tech selection, scaling | firecrawl |
| **research-engineer** | Evidence-based recommendations | firecrawl, context7 |
| **docs-librarian** | Documentation discovery, 70-85% compression | context7, firecrawl |
| **safe-commit-specialist** | Atomic commits, quality gates | Git, local tools |

### Tier 2: Niche but Valuable (6 agents)

| Agent | Purpose | Dependencies |
|-------|---------|--------------|
| **complexity-challenger** | Anti-overengineering | Superpowers |
| **bun-expert** | Bun migrations, monorepos, perf | context7 |
| **cicd-optimization-expert** | GitHub Actions optimization | GitHub Actions |
| **pr-review-implementer** | PR feedback across Graphite stacks | Graphite, gh |
| **vercel-ai-sdk-expert** | AI SDK v5 streaming, agents | context7, firecrawl |
| **status-scout** | Read-only repo SITREP | gh, Graphite |

### Tier 3: Specialized (2 agents)

| Agent | Purpose | Dependencies |
|-------|---------|--------------|
| **claude-code-expert** | Claude Code CLI/SDK/ecosystem | Research tools |
| **gitbutler-ops** | GitButler virtual branches | GitButler CLI |

### Not Ready
- **test** - empty placeholder (delete)

---

## Migration Decisions

### Confirmed for Migration

1. **discover-skills** → `outfitter` plugin
   - Rename from find-skills
   - Skill discovery across user, project, plugin sources

2. **gitbutler** → New plugin
   - gitbutler-version-control
   - gitbutler-stack-workflows
   - gitbutler-complete-branch
   - gitbutler-multi-agent
   - gitbutler-ops agent

3. **waymark** → New plugin
   - find-waymarks skill

### Under Consideration

- **Agents** - Most are portable but have dependencies (Superpowers, MCP servers)
- **Linear integration** - Could be own plugin or fold into outfitter
- **Authoring/validation skills** - Could enhance claude-dev

---

## Commands Structure (for reference)

```
~/.config/claude/commands/
├── review/           # 9 commands (code, perf, sec, deps, pr-single, etc.)
├── sitrep/           # 4 commands (scout, stack, pr, issues)
├── issues/           # work-on-issue
├── recap/            # create, review
├── init/             # use-core, use-repoprompt
├── subagent/         # orchestrate, pair-program
└── (root)            # skills, docs/get, ask, create-gist, test
```

---

## Dependencies to Note

- **Superpowers plugin** - code-reviewer, systematic-debugger, complexity-challenger delegate to superpowers:* skills
- **MCP servers** - docs-librarian, research-engineer, bun-expert rely on context7/firecrawl
- **Graphite** - pr-review-implementer, status-scout, sitrep use Graphite stacks
- **GitButler** - gitbutler-* skills and gitbutler-ops agent

---

## Next Steps

1. Create `gitbutler` plugin with 4 skills + agent
2. Create `waymark` plugin with find-waymarks skill
3. Add `discover-skills` to outfitter plugin
4. Evaluate agent migration after skills are stable
