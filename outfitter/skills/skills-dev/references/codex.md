# Codex CLI Implementation

Codex CLI-specific implementation details for Agent Skills. For cross-platform concepts, see the main [SKILL.md](../SKILL.md).

## Discovery Paths

Codex loads skills from multiple locations with this precedence order (higher overrides lower):

| Scope | Location | Use Case |
| ----- | -------- | -------- |
| `REPO` | `$CWD/.codex/skills` | Project-specific skills in current directory |
| `REPO` | `$CWD/../.codex/skills` | Parent folder skills (when in Git repo) |
| `REPO` | `$REPO_ROOT/.codex/skills` | Repository root skills |
| `USER` | `$CODEX_HOME/skills` (default: `~/.codex/skills`) | User's personal skills |
| `ADMIN` | `/etc/codex/skills` | System/admin skills |
| `SYSTEM` | Bundled with Codex | Built-in skills |

**Key behaviors:**
- Skills with the same name from higher precedence scopes overwrite lower ones
- Skills are discovered at startup by scanning these paths
- Restart Codex after installing new skills to load them

## Enabling Skills

Skills are gated behind a feature flag:

```bash
# Check if enabled
codex features list

# Enable once
codex --enable skills

# Enable permanently in ~/.codex/config.toml:
[features]
skills = true
```

## Invocation Methods

### Explicit Invocation

Supported in CLI and IDE extensions:

```
# Skill picker
Type $ to see available skills

# Slash command
/skills

# Direct mention in prompt
$skill-name analyze this code
```

Not yet supported in Codex Web or iOS.

### Implicit Invocation

Works across all platforms (CLI, Web, iOS):

- Codex auto-detects when task matches a skill's description
- The `description` field is the primary trigger signal
- Write descriptions with "Use when..." clauses for better matching

```yaml
# Good: clear trigger conditions
description: Extracts text and tables from PDFs. Use when working with PDF files or document extraction.

# Bad: vague, hard to match
description: Helps with files
```

## AGENTS.md vs Skills

Codex uses `AGENTS.md` for project instructions, separate from skills:

| Aspect | AGENTS.md | Skills |
| ------ | --------- | ------ |
| **Loading** | Always loaded per-session | Loaded on-demand when invoked |
| **Purpose** | Project-wide context and rules | Task-specific capabilities |
| **Scope** | Per-repository | Personal, project, or system |
| **Location** | Repository root or `~/.codex/` | `skills/` directories |

**AGENTS.md discovery order:**
1. `~/.codex/AGENTS.override.md` (or `AGENTS.md`)
2. Repository root `AGENTS.md`
3. Nested `AGENTS.override.md` in subdirectories

## Built-in Skills

Codex includes utility skills:

| Skill | Purpose |
| ----- | ------- |
| `$skill-creator` | Creates new skills interactively |
| `$skill-installer` | Downloads skills from GitHub repos |
| `$create-plan` | Experimental planning skill |

### Skill Installer

```bash
# Install from OpenAI's curated skills
$skill-installer linear
$skill-installer notion-spec-to-implementation

# Downloads to $CODEX_HOME/skills/
```

## Tool Restrictions

The `allowed-tools` field is experimental in Codex:

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

**Status:**
- Marked as "experimental" in the Agent Skills spec
- "Support for this field may vary between agent implementations"
- No explicit Codex documentation on implementation

**Alternative controls in Codex:**
- Global `sandbox_mode` setting
- Global `approval_policy` setting
- MCP servers support `enabled_tools` and `disabled_tools` arrays
- No per-skill tool restrictions documented

## Testing Skills

### Validation

Use the skills-ref validator:

```bash
skills-ref validate ./my-skill
```

Checks:
- YAML frontmatter validity
- Name/description constraints
- Naming conventions

### Testing Workflow

1. Create skill in `~/.codex/skills/my-skill/`
2. **Restart Codex** to load it (required)
3. Test explicit invocation: `$my-skill test task`
4. Test implicit invocation: Use keywords from description
5. Check `/skills` command to confirm it's loaded

### Debugging

- Check `~/.codex/log/codex-tui.log` for skill loading errors
- Validation errors shown at startup if YAML malformed
- Codex ignores empty files and symlinked directories

## Troubleshooting

### Skill Not Loading

**Check feature flag:**

```bash
codex features list
# Look for: skills ... true
```

**Verify file location:**

```bash
# Personal skills
ls ~/.codex/skills/my-skill/SKILL.md

# Project skills
ls .codex/skills/my-skill/SKILL.md
```

**Restart Codex:**

Skills are only discovered at startup. After adding a new skill, restart the CLI.

### Skill Not Activating

**Check description triggers:**

The description is the primary trigger for implicit invocation. Ensure it includes:
- What the skill does
- "Use when..." conditions
- Keywords users would naturally say

**Try explicit invocation:**

```
$skill-name do the task
```

If explicit works but implicit doesn't, improve the description.

### Validation Errors

**Check YAML syntax:**

```bash
# Validate YAML
python3 -c "import yaml; yaml.safe_load(open('SKILL.md').read().split('---')[1])"

# Check for tabs (YAML requires spaces)
grep -P "\t" SKILL.md
```

**Common issues:**
- Tabs instead of spaces
- Missing quotes around special characters
- Missing closing `---` delimiter

## Differences from Claude Code

| Feature | Codex CLI | Claude Code |
| ------- | --------- | ----------- |
| **Skill loading** | Feature flag required | Built-in support |
| **Discovery paths** | 6 scopes with precedence | Plugin system + `.claude/skills/` |
| **Invocation** | `$skill-name` syntax | Skill tool, natural language |
| **Project instructions** | `AGENTS.md` | `CLAUDE.md` |
| **Restart required** | Yes, after adding skills | No, skills reload on `/clear` |
| **Tool restrictions** | `allowed-tools` (experimental) | `allowed-tools` (functional) |
| **Built-in creator** | `$skill-creator` | Manual or via outfitter plugin |
| **Debug mode** | Log files | `claude --debug` |

## Quick Reference

```bash
# Check skills feature is enabled
codex features list

# Find all skills
find ~/.codex/skills .codex/skills -name "SKILL.md" 2>/dev/null

# Validate skill
skills-ref validate ./my-skill

# Check logs for errors
cat ~/.codex/log/codex-tui.log | grep -i skill

# Invoke skill explicitly
# In Codex prompt: $skill-name do something
```

## Sources

- [Codex Skills Overview](https://developers.openai.com/codex/skills)
- [Create Skills Guide](https://developers.openai.com/codex/skills/create-skill)
- [AGENTS.md Documentation](https://developers.openai.com/codex/guides/agents-md)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Codex Configuration Reference](https://developers.openai.com/codex/config-reference)
