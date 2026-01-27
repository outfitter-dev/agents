# Preprocessing with `!command`

Deterministic context injection that runs before Claude sees the prompt.

## How It Works

```markdown
---
name: pr-summary
---

## Current Branch
!`git branch --show-current`

## Recent Commits
!`git log --oneline -5`
```

When skill loads:
1. Shell commands inside `!` `` ` `` run first
2. Output replaces the syntax
3. Claude sees rendered output, not commands

**Claude receives:**
```markdown
## Current Branch
feature/add-auth

## Recent Commits
a1b2c3d Add JWT validation
e4f5g6h Implement login endpoint
...
```

## Syntax

```markdown
# Inline
Current branch: !`git branch --show-current`

# Block
## Status
!`git status`

# With formatting
- **Diff**: !`gh pr diff`
- **Comments**: !`gh pr view --comments`
```

## When to Preprocess

| Use Case | Command | Why |
|----------|---------|-----|
| Git state | `!git status` | Snapshot at invocation |
| PR context | `!gh pr diff` | Avoid tool call overhead |
| Schema info | `!psql -c "\\d users"` | Fresh structure |
| Environment | `!echo $NODE_ENV` | Runtime context |
| File contents | `!cat config.json` | Static reference |
| Versions | `!node --version` | Environment info |

## When NOT to Preprocess

| Avoid | Why | Alternative |
|-------|-----|-------------|
| Dynamic queries | Needs conversation context | Use Bash tool |
| Large outputs | Bloats context | Summarize or Read tool |
| Mutations | Side effects before thinking | Tool with confirmation |
| Secrets | Ends up in context | Environment variables |
| Interactive commands | Hangs | Avoid or timeout |

## Patterns

### Git Context

```markdown
---
name: commit-review
---

## Current State
- **Branch**: !`git branch --show-current`
- **Status**: !`git status --short`
- **Staged**: !`git diff --cached --stat`

## Recent History
!`git log --oneline -10`

Review changes and suggest commit message.
```

### PR Workflow

```markdown
---
name: pr-summary
context: fork
agent: Explore
allowed-tools: Bash(gh:*)
---

## Pull Request

- **Title**: !`gh pr view --json title -q .title`
- **Author**: !`gh pr view --json author -q .author.login`
- **State**: !`gh pr view --json state -q .state`

## Changes
!`gh pr diff --stat`

## Full Diff
!`gh pr diff`

## Comments
!`gh pr view --comments`

Summarize changes, highlight risks, note open discussions.
```

### Database Schema

```markdown
---
name: db-aware-query
---

## Schema Reference

### Users Table
!`psql -c "\\d users" --no-psqlrc`

### Orders Table
!`psql -c "\\d orders" --no-psqlrc`

Write queries aware of this schema.
```

### Environment Info

```markdown
---
name: debug-env
---

## Runtime Environment

| Component | Version |
|-----------|---------|
| Node | !`node --version` |
| npm | !`npm --version` |
| TypeScript | !`npx tsc --version` |

## Config
!`cat package.json | jq '{name, version, scripts}'`
```

### Incident Context

```markdown
---
name: incident-triage
---

## Current Time
!`date -u +"%Y-%m-%dT%H:%M:%SZ"`

## Recent Errors
!`tail -50 /var/log/app.log | grep ERROR`

## System State
!`ps aux | head -10`
!`df -h | head -5`

Assess severity and identify immediate actions.
```

## Combining with Artifacts

Preprocessing captures **live state**; artifacts capture **work state**:

```markdown
---
name: deploy-preflight
---

## Live State (preprocessed)
- **Branch**: !`git branch --show-current`
- **Clean**: !`git status --porcelain`
- **Tests**: !`npm test 2>&1 | tail -5`

## Work State (from artifacts)
Read artifacts/plan.md for deployment checklist.
Read artifacts/review-notes.md for outstanding issues.

Proceed only if live state is clean AND artifacts show ready.
```

## Error Handling

Commands that fail show error output:

```markdown
# If git not installed:
## Current Branch
!`git branch --show-current`

# Claude sees:
## Current Branch
bash: git: command not found
```

Handle gracefully in skill:

```markdown
## Prerequisites

If any preprocessing shows errors (command not found, permission denied),
report the issue and do not proceed.
```

## Security Considerations

**Never preprocess:**
- Commands that output secrets (`cat ~/.ssh/id_rsa`)
- API calls with credentials in output
- Anything that exposes tokens/passwords

**Safe patterns:**
- Git operations (on repo content, not remotes with embedded creds)
- System info (versions, paths)
- File structure (ls, find)
- Log snippets (ensure logs don't contain secrets)

## Performance

Preprocessing runs synchronously before skill loads. Keep commands fast:

| Good | Bad |
|------|-----|
| `git status` | `git clone ...` |
| `head -100 file` | `cat giant-file` |
| `ls -la` | `find / -name ...` |
| `jq .field file.json` | `curl slow-api` |

If command might be slow, use tools instead (can stream output, user sees progress).

## Timeouts

Preprocessing commands have a **5-second timeout**. Commands exceeding this will:
- Be terminated
- Show timeout error in output
- Still allow skill to load (with error visible)

**Implications:**
- Keep commands under 2 seconds for reliable execution
- Network calls are risky (latency varies)
- Large file operations may timeout
- Complex pipelines may need optimization

**Workarounds for slow operations:**

| Slow Pattern | Alternative |
|--------------|-------------|
| `curl api/endpoint` | Use WebFetch tool instead |
| `find / -name ...` | Narrow scope or use Glob tool |
| `git log --all` | Limit with `-n 10` |
| `npm test` | Run as tool (shows progress) |

**No timeout control**: You cannot extend the timeout. If a command needs more than 5 seconds, it belongs in a tool call, not preprocessing.

## Debugging

If preprocessing seems wrong:

1. Run commands manually in terminal
2. Check shell environment (preprocessing uses default shell)
3. Verify paths are absolute or relative to skill location
4. Check for quoting issues in complex commands

```markdown
# Debug with echo
!`echo "PWD: $(pwd)"`
!`echo "PATH: $PATH"`
```
