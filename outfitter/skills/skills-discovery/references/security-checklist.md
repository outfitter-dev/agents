# Security Checklist

Complete audit checklist before installing community skills, plugins, or marketplaces.

## Table of Contents

- [Threat Model](#threat-model)
- [Pre-Installation Audit](#pre-installation-audit)
- [Red Flags Checklist](#red-flags-checklist)
- [Safe Installation Patterns](#safe-installation-patterns)
- [Post-Installation Monitoring](#post-installation-monitoring)
- [Marketplace-Specific Checks](#marketplace-specific-checks)
- [Recovery Procedures](#recovery-procedures)
- [Template: Audit Report](#template-audit-report)

---

## Threat Model

**Core principle**: Installing skills/plugins = running code. Treat with same care as npm packages.

### Attack Surfaces

| Surface | Risk Level | Attack Vector |
|---------|------------|---------------|
| `allowed-tools: Bash(*)` | High | Arbitrary command execution |
| Hook scripts | High | Lifecycle interception, data exfiltration |
| MCP servers | High | External network connections |
| Preprocessing `!` | Medium | Shell commands before model reasoning |
| Scripts in scripts/ | Medium | Executed during skill operation |
| Write/Edit permissions | Medium | File system modifications |

### Threat Categories

| Threat | Example | Detection |
|--------|---------|-----------|
| Data exfiltration | Hook sends files to external server | Review hook network calls |
| Credential theft | Skill reads .env and logs it | Check for secret file access |
| Arbitrary execution | Bash(*) with no restriction | Review allowed-tools |
| Persistent access | Creates cron job or daemon | Check for persistence patterns |
| Supply chain | Marketplace references malicious plugins | Verify all referenced sources |

## Pre-Installation Audit

### Step 1: Repository Signals

| Check | Good Sign | Red Flag |
|-------|-----------|----------|
| Commits | Steady history | Single commit dump |
| Contributors | Multiple contributors | Single anonymous author |
| Stars | Organic growth | Sudden spike |
| Issues | Active engagement | Many open, no response |
| Updates | Recent activity | Stale for 6+ months |

```bash
# Quick repo check
gh repo view owner/repo --json stargazersCount,pushedAt,openIssuesCount,description
```

### Step 2: Skill Audit (for each SKILL.md)

```markdown
# Open SKILL.md and check:

## Frontmatter Review
- [ ] `allowed-tools` is minimal and justified
- [ ] `disable-model-invocation: true` for side-effect skills
- [ ] `context: fork` used appropriately (analysis = fork)
- [ ] No suspicious combinations (e.g., Bash(*) + Write + no restrictions)

## Content Review
- [ ] Instructions are clear and purposeful
- [ ] No hidden commands in prose
- [ ] Preprocessing `!` commands are obvious and safe
- [ ] No instructions to disable security features
```

### Step 3: Script Audit (for scripts/ directory)

```markdown
# For each script:

- [ ] Understand what it does (no obfuscation)
- [ ] No network calls without clear purpose
- [ ] No reading of credentials/secrets
- [ ] No writing outside project directory
- [ ] No system modifications (cron, daemons, etc.)
- [ ] Dependencies are minimal and known
```

### Step 4: Hook Audit (for hooks.json and hook scripts)

```markdown
# Hook configuration review:

- [ ] Understand each hook's trigger (PreToolUse, PostToolUse, etc.)
- [ ] Matchers are scoped appropriately
- [ ] Exit codes make sense (0=allow, 2=block)

# Hook script review:

- [ ] No network calls (curl, wget, fetch)
- [ ] No data exfiltration patterns
- [ ] No writes to unexpected locations
- [ ] No process spawning or backgrounding
- [ ] Clear, readable logic
```

### Step 5: MCP Audit (for .mcp.json)

```markdown
# MCP configuration review:

- [ ] Understand each server's purpose
- [ ] Endpoints are to trusted services
- [ ] No unexpected permissions requested
- [ ] No persistent connections to unknown hosts
```

### Step 6: Plugin Audit (for plugin.json)

```markdown
# Plugin manifest review:

- [ ] All referenced skills pass Step 2
- [ ] All hooks pass Step 4
- [ ] All MCP servers pass Step 5
- [ ] No unexpected file references
- [ ] Version pinning is reasonable
```

## Red Flags Checklist

Stop and investigate if you see:

```markdown
# Immediate red flags:

- [ ] Obfuscated code (base64, minified, packed)
- [ ] "curl | bash" install patterns
- [ ] Requests to disable sandboxing
- [ ] Writes to system directories (/etc, /usr)
- [ ] Access to SSH keys, AWS credentials, etc.
- [ ] Unexplained network endpoints
- [ ] Process backgrounding or persistence
- [ ] Encoding/decoding without clear purpose
```

## Safe Installation Patterns

### Restricted First Run

```yaml
# Override untrusted skill with restrictions:
---
name: test-untrusted
allowed-tools: Read, Grep, Glob  # Read-only
context: fork                     # Isolated
disable-model-invocation: true   # No auto-trigger
---

# Test the skill with restricted permissions first
```

### Gradual Permission Expansion

1. Start with read-only tools
2. Monitor tool calls on first runs
3. Add Write/Edit after behavior verified
4. Add Bash only for specific commands
5. Never grant Bash(*) to untrusted code

### Sandbox Isolation

```markdown
# When testing untrusted skills:

1. Use a separate project directory
2. No access to home directory secrets
3. Network isolation if possible
4. Monitor file system changes
5. Review all tool calls
```

## Post-Installation Monitoring

After installing, watch for:

```markdown
# First few uses:

- [ ] Tool calls match expected behavior
- [ ] No unexpected file access
- [ ] No network calls (unless expected)
- [ ] Output makes sense for inputs
- [ ] No persistent changes to environment
```

## Marketplace-Specific Checks

When adding a marketplace:

```markdown
# Marketplace audit:

- [ ] Source is known/trusted
- [ ] Referenced plugins are version-pinned
- [ ] Update mechanism is transparent
- [ ] No auto-execution on add
- [ ] Each referenced plugin passes full audit
```

## Recovery Procedures

If you installed something suspicious:

```markdown
# Immediate steps:

1. Remove the skill/plugin: /plugin uninstall <name>
2. Check for persistence: crontab -l, launchctl list
3. Review recent file changes: git status, find . -mmin -60
4. Rotate any credentials that might be exposed
5. Review shell history for executed commands

# If compromise suspected:

1. Revoke API keys/tokens
2. Change passwords
3. Notify team if shared environment
4. Document what was installed and when
```

## Template: Audit Report

```markdown
# Skill/Plugin Audit: {name}

**Source**: {repo URL}
**Auditor**: {your name}
**Date**: {date}

## Repository Signals
- Stars: {n}
- Last updated: {date}
- Open issues: {n}
- Contributors: {n}

## Security Assessment

### Skills Reviewed
- [ ] {skill-1}: {notes}
- [ ] {skill-2}: {notes}

### Hooks Reviewed
- [ ] {hook-1}: {notes}

### Scripts Reviewed
- [ ] {script-1}: {notes}

### Red Flags Found
- {none | list}

## Verdict
- [ ] Safe to install
- [ ] Safe with restrictions: {specify}
- [ ] Do not install: {reason}

## Restrictions Applied
```yaml
allowed-tools: {restricted set}
```

## Notes
{additional observations}
```
