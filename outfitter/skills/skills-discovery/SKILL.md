---
name: skills-discovery
description: Find and evaluate community skills, plugins, and marketplaces. Use when searching for existing skills, evaluating safety, or when "find skill", "discover plugin", "community skills", or "marketplace" are mentioned.
metadata:
  version: "1.0.0"
  related-skills:
    - skills-dev
    - claude-plugins
allowed-tools: Read WebFetch WebSearch Bash(gh:*)
---

# Skills Discovery

Find community skills and plugins, evaluate quality and safety before use.

<when_to_use>

- Searching for existing skills before building from scratch
- Evaluating community plugins for safety and quality
- Finding inspiration for skill design patterns
- Auditing plugins before installation

NOT for: creating new skills (use skills-dev), validating your own skills (use skills-dev)

</when_to_use>

## Discovery Workflow

1. **Search** — Find candidates via GitHub topics or code search
2. **Filter** — Apply quality heuristics to shortlist
3. **Audit** — Security review before installation
4. **Adapt** — Customize or extract patterns for your use

## GitHub Discovery

### Topic Pages

High-signal discovery starting points:

| Topic | Content | URL |
|-------|---------|-----|
| `claude-code-plugin` | Plugins | https://github.com/topics/claude-code-plugin |
| `claude-code-plugin-marketplace` | Marketplaces | https://github.com/topics/claude-code-plugin-marketplace |
| `claude-code-skills` | Skill packs | https://github.com/topics/claude-code-skills |
| `claude-code-skill` | Individual skills | https://github.com/topics/claude-code-skill |

### Code Search Patterns

Precise searches for specific artifacts:

```text
# Find SKILL.md files in .claude/skills paths
filename:SKILL.md path:.claude/skills

# Find marketplace configurations
".claude-plugin/marketplace.json"

# Find plugin manifests
".claude-plugin/plugin.json"

# Find hook configurations
"PreToolUse" AND hooks

# Find skills with specific features
filename:SKILL.md "context: fork"
filename:SKILL.md "allowed-tools"
filename:SKILL.md "disable-model-invocation"
```

### Recency Filters

Focus on actively maintained projects (adjust dates as needed):

```text
# Updated in last 90 days (calculate: date -v-90d +%Y-%m-%d)
pushed:>YYYY-MM-DD

# Updated since plugins era (Oct 2025+)
pushed:>2025-10-01
```

### Official Sources

| Source | Trust Level | Notes |
|--------|-------------|-------|
| anthropics/claude-plugins-official | High | Curated, reviewed |
| agentskills/agentskills | High | Spec + reference skills |
| platform.claude.com docs | High | Official patterns |
| Community topics | Medium | Popularity ≠ quality |
| "Awesome" lists | Low-Medium | Curated but not audited |

## Quality Heuristics

### Real Usage Signals

| Signal | Good | Suspicious |
|--------|------|------------|
| Updates | Recent commits, active issues | Stale for 6+ months |
| Stars | Steady growth | Sudden spike (star farming) |
| Issues/PRs | Open and being addressed | Many open, no responses |
| Install docs | Uses official commands | "curl \| bash" installs |
| Dependencies | Minimal, explained | Many unexplained deps |

### Content Quality

| Check | Good | Bad |
|-------|------|-----|
| Description | Clear WHAT + WHEN + TRIGGERS | Vague "helps with files" |
| `allowed-tools` | Minimal, justified | Full tool access |
| `disable-model-invocation` | Used for side effects | Missing for deploy/commit |
| Scripts | Documented, minimal | Obfuscated, complex |
| Hooks | Obvious purpose | Hidden network calls |

### Marketplaces

| Good Sign | Red Flag |
|-----------|----------|
| Version pinning | Floating branches |
| Listed sources visible | Opaque references |
| Clear update policy | Silent auto-updates |
| Curated with criteria | "Everything goes" |

## Security Audit

### Threat Model

**Installing skills/plugins = running code.** Treat with same care as npm packages.

| Surface | Risk | Mitigation |
|---------|------|------------|
| Skills with Bash | Command execution | Review `allowed-tools` |
| Hooks | Lifecycle interception | Review hook scripts |
| MCP servers | External connections | Review endpoints |
| Preprocessing `!` | Shell before thinking | Review commands |

### Audit Checklist

Before installing, review:

**For Skills:**
- [ ] Read SKILL.md frontmatter (`allowed-tools`, `disable-model-invocation`)
- [ ] Check for scripts/ directory — review any scripts
- [ ] Search for `!` `` ` `` preprocessing commands
- [ ] Verify no secrets/credentials in files

**For Plugins:**
- [ ] Read .claude-plugin/plugin.json
- [ ] Check for hooks/ — review hook scripts
- [ ] Check for .mcp.json — review MCP endpoints
- [ ] Review all referenced skill SKILL.md files

**For Hooks:**
- [ ] Understand exit code semantics (0=allow, 2=block)
- [ ] Check for network calls in hook scripts
- [ ] Verify no data exfiltration patterns

### Sandboxing

When running untrusted skills:

1. **Restrict tools** — Start with minimal `allowed-tools`, expand as needed
2. **Isolate context** — Use `context: fork` to limit blast radius
3. **Block side effects** — Add `disable-model-invocation: true` initially
4. **Monitor first run** — Watch tool calls on first execution

### Safe First Run

```markdown
# Test skill in restricted mode:
---
name: untrusted-skill-test
allowed-tools: Read, Grep, Glob  # read-only first
context: fork                     # isolated
disable-model-invocation: true   # explicit only
---
```

Expand permissions only after reviewing behavior.

## Use Case Catalog

Common skill categories with examples (for inspiration, not endorsement):

### Workflow Automation

| Pattern | What It Does | Key Features |
|---------|--------------|--------------|
| PR workflows | Summarize, review, update PRs | Preprocessing with `gh` |
| Issue pipelines | Triage → implement → ship | Artifact-based state |
| Release automation | Preflight → deploy → verify | Side-effect gates |

### Code Quality

| Pattern | What It Does | Key Features |
|---------|--------------|--------------|
| Spec gates | Verify scope before coding | Fork for clean analysis |
| Adversarial review | Security-focused code review | Threat model in artifacts |
| Refactor loops | Safe read-only explore first | Tool restrictions |

### Domain Skills

| Pattern | What It Does | Key Features |
|---------|--------------|--------------|
| Framework-specific | Rails, React, etc conventions | Nested skill discovery |
| DB-aware | Schema injection for queries | Preprocessing with psql |
| Platform integrations | Jira, Linear, GitHub | MCP or API wrappers |

### Safety & Guardrails

| Pattern | What It Does | Key Features |
|---------|--------------|--------------|
| Safety nets | Block irreversible operations | PreToolUse hooks |
| Hardstops | Require human acknowledgment | Exit code blocking |
| Test gates | Enforce tests before commit | Hook enforcement |

### Context Management

| Pattern | What It Does | Key Features |
|---------|--------------|--------------|
| Memory plugins | Persist across sessions | MCP-backed storage |
| Context ledgers | Rolling state in files | Hook-driven updates |
| Constraint files | Minimal "always load" context | Shared conventions |

## Extraction Patterns

When you find a useful skill, extract patterns rather than copying wholesale:

1. **Identify the pattern** — What makes it work?
2. **Adapt to your context** — Match your conventions
3. **Minimize scope** — Take only what you need
4. **Document provenance** — Note where the pattern came from

<rules>

ALWAYS:
- Verify recency (prefer active projects)
- Review security surfaces before install
- Start with restricted permissions
- Document what you installed and why

NEVER:
- Blindly install from unknown sources
- Trust stars as quality signal
- Run obfuscated scripts
- Skip hook script review

</rules>

<references>

- [discovery-patterns.md](references/discovery-patterns.md) — Detailed GitHub search patterns
- [security-checklist.md](references/security-checklist.md) — Full audit checklist
- [use-cases.md](references/use-cases.md) — Extended use case catalog

</references>
