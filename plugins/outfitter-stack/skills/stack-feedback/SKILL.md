---
name: stack-feedback
version: 0.3.0
description: Creates GitHub issues for problems discovered while using @outfitter/* packages. Use when finding bugs, missing features, unclear documentation, or improvement opportunities.
context: fork
agent: stacker
allowed-tools: Bash(gh *) Bash(bun *) Read
user-invocable: false
---

# Stack Feedback

Create GitHub issues on `outfitter-dev/outfitter` for problems discovered while using the stack.

## When to Use

Invoke this skill when you discover:
- **Bugs** in @outfitter/* packages
- **Missing features** that would improve DX
- **Unclear documentation** that caused confusion
- **Pattern gaps** where guidance is missing
- **Ergonomic issues** that made tasks harder than expected

## Issue Categories

| Category | Label | Example |
|----------|-------|---------|
| `bug` | `bug` | Package throws when it should return Result |
| `enhancement` | `feature` | Add helper for common pattern |
| `docs` | `documentation` | Handler contract docs missing edge case |
| `unclear-pattern` | `question` | How to handle X scenario with Result types |
| `dx` | `dx` | Error message unclear, hard to debug |
| `migration-pattern` | `adoption` | Migration scenario lacks guidance |
| `conversion-helper` | `adoption` | Need utility for legacy conversion |
| `compatibility` | `adoption` | Breaking change concern |
| `migration-docs` | `migration, documentation` | Migration docs gap |

## Using the Helper Script

The preferred method for creating issues. The script handles templates, labels, and validation.

### Basic Usage

```bash
bun plugins/outfitter-stack/skills/stack-feedback/scripts/create-issue.ts \
  --type bug \
  --title "Result.unwrap throws on valid input" \
  --package "@outfitter/contracts" \
  --description "When calling unwrap on Ok value, it unexpectedly throws" \
  --actual "Throws TypeError instead of returning value"
```

### Dry-Run Mode (Default)

By default, the script outputs JSON with the `gh` command without executing it:

```json
{
  "command": "gh issue create --repo outfitter-dev/outfitter --title '[Bug] Result.unwrap throws...' --label bug --label feedback --label source/agent --body '...'",
  "title": "[Bug] Result.unwrap throws on valid input",
  "labels": ["bug", "feedback", "source/agent"],
  "body": "## Package\n\n`@outfitter/contracts`\n..."
}
```

### Origin Detection

The script automatically detects the git origin of the current directory and adds a "Discovered In" section to the issue body with a link to the source repo. This helps track where feedback originates.

### Submit Mode

Add `--submit` to actually create the issue:

```bash
bun plugins/outfitter-stack/skills/stack-feedback/scripts/create-issue.ts \
  --type enhancement \
  --title "Add Result.tap helper" \
  --package "@outfitter/contracts" \
  --description "Helper to run side effects without unwrapping" \
  --useCase "Logging without breaking method chains" \
  --submit
```

### View Template Requirements

Run with just `--type` to see required and optional fields:

```bash
bun plugins/outfitter-stack/skills/stack-feedback/scripts/create-issue.ts --type bug
```

### Available Types

| Type | Required Fields |
|------|-----------------|
| `bug` | package, description, actual |
| `enhancement` | package, description, useCase |
| `docs` | package, description, gap |
| `unclear-pattern` | package, description, context |
| `dx` | package, description, current |
| `migration-pattern` | sourcePattern, description, scenario |
| `conversion-helper` | legacyPattern, description, targetPattern |
| `compatibility` | package, description, breakingChange |
| `migration-docs` | area, description, gap |

## Manual Issue Creation

For cases where the script doesn't fit, use `gh` directly:

```bash
gh issue create \
  --repo outfitter-dev/outfitter \
  --title "[Bug] Brief description" \
  --label "bug" \
  --label "feedback" \
  --label "source/agent" \
  --body "$(cat <<'EOF'
## Package

`@outfitter/package-name`

## Description

What went wrong or what's missing.

## Actual Behavior

What actually happens.

---

*Created via `outfitter-stack:stack-feedback` skill*
EOF
)"
```

## Tracking Feedback

After creating, track in your project:

```markdown
## Stack Feedback

- [ ] #123: Result.unwrap throws on valid input — bug
```

## Check Existing Issues

Before creating a new issue, check if it already exists:

```bash
gh issue list --repo outfitter-dev/outfitter --label feedback
gh issue list --repo outfitter-dev/outfitter --search "{{KEYWORDS}}"
```

## Batch Feedback

If multiple issues have accumulated:

1. Review all feedback items
2. Deduplicate similar issues
3. Create issues with cross-references where related
4. Update tracking with issue numbers

## Best Practices

1. **Be specific** — Include package, function, and line if known
2. **Provide context** — Explain what task led to discovery
3. **Include workaround** — If you found one, share it
4. **Link related issues** — Reference if similar issues exist
5. **Stay constructive** — Focus on improvement, not complaint

## References

- [Migration-specific feedback](references/migration-feedback.md)
