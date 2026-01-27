# Discovery Patterns

Detailed GitHub search strategies for finding skills and plugins.

## Topic-Based Discovery

### Primary Topics

Navigate directly to GitHub topic pages:

| Topic | Description | URL |
|-------|-------------|-----|
| `claude-code-plugin` | Individual plugins | https://github.com/topics/claude-code-plugin |
| `claude-code-plugin-marketplace` | Plugin marketplaces | https://github.com/topics/claude-code-plugin-marketplace |
| `claude-code-skills` | Skill collections | https://github.com/topics/claude-code-skills |
| `claude-code-skill` | Single skills | https://github.com/topics/claude-code-skill |

### Topic Page Analysis

On each topic page, use filters:

- **Sort by**: Recently updated (not Most stars)
- **Language**: Filter if relevant (TypeScript, Python)
- **Updated**: Last month/year

Note the topic card info:
- Stars and forks
- "Updated X days ago"
- Short description

## Code Search Patterns

### Finding SKILL.md Files

```
# Skills in standard location
filename:SKILL.md path:.claude/skills

# Skills in home directory (tutorials, examples)
filename:SKILL.md path:~/.claude/skills

# Any SKILL.md file
filename:SKILL.md
```

### Finding Plugin Manifests

```
# Plugin configurations
filename:plugin.json path:.claude-plugin

# Marketplace configurations
filename:marketplace.json path:.claude-plugin

# Any plugin.json
".claude-plugin/plugin.json"
```

### Finding Hook Configurations

```
# Hook definitions
"PreToolUse" filename:hooks.json

# Hooks that block
"exit 2" filename:hooks

# PostToolUse patterns
"PostToolUse" AND "matcher"
```

### Finding Specific Features

```
# Skills with tool restrictions
filename:SKILL.md "allowed-tools:"

# Skills with forked context
filename:SKILL.md "context: fork"

# Skills with preprocessing
filename:SKILL.md "`!"

# Side-effect-safe skills
filename:SKILL.md "disable-model-invocation: true"

# Skills using specific agents
filename:SKILL.md "agent: Explore"
filename:SKILL.md "agent: Plan"
```

### Finding Real-World Usage

```
# Skills in major repos (indicates adoption)
filename:SKILL.md org:pytorch
filename:SKILL.md org:facebook
filename:SKILL.md org:microsoft

# Skills with tests
filename:SKILL.md path:test
filename:SKILL.md path:__tests__
```

## Recency Filters

GitHub search supports date filters. Calculate dates relative to today:

```bash
# Get date for 30 days ago
date -v-30d +%Y-%m-%d  # macOS
date -d "30 days ago" +%Y-%m-%d  # Linux
```

```
# Updated in last 30 days (adjust date)
pushed:>YYYY-MM-DD

# Updated in last 90 days (adjust date)
pushed:>YYYY-MM-DD

# Updated since plugins announcement (Oct 2025)
pushed:>2025-10-01

# Created recently (adjust date)
created:>YYYY-MM-DD
```

Combine with other searches:

```
filename:SKILL.md pushed:>2025-10-01 "allowed-tools"
```

## Quality Filters

### Activity Signals

```
# Repos with issues
filename:SKILL.md is:issue

# Repos with PRs
filename:SKILL.md is:pr

# Archived repos (avoid)
filename:SKILL.md NOT archived:true
```

### Size Signals

```
# Reasonable file sizes (not bloated)
filename:SKILL.md size:<50000

# Multi-file skills (more complete)
path:.claude/skills language:Markdown
```

## CLI Alternatives

Using `gh` CLI for search:

```bash
# Search code
gh search code "filename:SKILL.md path:.claude/skills" --limit 50

# Search repos
gh search repos "claude-code-skill" --sort updated --order desc

# Get repo details
gh repo view owner/repo --json stargazersCount,pushedAt,description
```

## Discovery Workflow

### 1. Broad Search

Start with topic pages, sorted by recent updates:
- Note repos that appear across multiple searches
- Check "Used by" if visible

### 2. Narrow by Feature

Use code search to find specific capabilities:
```
filename:SKILL.md "context: fork" pushed:>2025-10-01
```

### 3. Verify Quality

For each candidate:
```bash
# Check activity
gh repo view owner/repo --json pushedAt,openIssuesCount

# Check structure
gh api repos/owner/repo/contents/.claude --jq '.[].name'
```

### 4. Cross-Reference

Search for mentions:
```
"owner/repo" claude skill
```

Check if referenced in:
- Official docs
- Awesome lists
- Community discussions

## Bookmark-Worthy Sources

### Official

- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — Curated directory
- [agentskills/agentskills](https://github.com/agentskills/agentskills) — Spec + reference skills
- [Claude Code Docs](https://code.claude.com/docs/en/skills) — Official skill docs

### Community Directories

- Search for repos with "awesome-claude" in name
- Check GitHub topics for curated lists

### Marketplaces

Search for marketplaces and evaluate before adding:
```
filename:marketplace.json path:.claude-plugin
```

## Search Tips

### Escape Special Characters

```
# Search for literal braces
"interface\{\}"

# Search for backticks
"`git status`"
```

### Combine Patterns

```
# Multiple requirements
filename:SKILL.md "context: fork" "allowed-tools" pushed:>2025-10-01

# Exclude patterns
filename:SKILL.md NOT "user-invocable: false"
```

### Iterate

Start broad, then narrow:
1. Topic search → get repo names
2. Code search in promising repos → find specific skills
3. Read and evaluate → decide on adoption
