---
name: claude-commands
description: This skill should be used when creating slash commands, writing command files, or when "/command", ".claude/commands", "$ARGUMENTS", or "create command" are mentioned.
metadata:
  version: "3.0.0"
  related-skills:
    - claude-hooks
    - claude-plugins
    - skills-dev
allowed-tools: Read Write Edit Grep Glob Bash TaskCreate TaskUpdate TaskList TaskGet
---

# Claude Command Authoring

Create custom slash commands that extend Claude Code with reusable prompts.

<critical_distinction>

| Aspect | Commands | Skills |
|--------|----------|--------|
| **Invocation** | Explicit: `/cmd args` | Auto-triggered by context |
| **Location** | `commands/` directory | `skills/` with `SKILL.md` |
| **Structure** | Single `.md` file | Directory with resources |
| **Arguments** | `$1`, `$2`, `$ARGUMENTS` | No argument system |

**Commands = user-initiated. Skills = model-initiated.**

</critical_distinction>

<when_to_use>

- Creating reusable slash commands
- Automating repetitive prompts
- Building team-shared workflows
- Personal productivity shortcuts

NOT for: auto-triggered capabilities (use skills), event automation (use hooks)

</when_to_use>

<intake>

What kind of command do you need?

1. **Basic command** - simple prompt, no arguments
2. **With arguments** - accepts `$1`, `$2`, or `$ARGUMENTS`
3. **With context** - includes bash output or file references
4. **With restrictions** - limits tool access for safety
5. **Validate existing** - check a command for issues
6. **Debug/troubleshoot** - command not working

</intake>

<routing>

| Response | Workflow | Reference |
|----------|----------|-----------|
| 1, "basic", "simple" | workflows/create-basic.md | - |
| 2, "arguments", "$1" | workflows/create-advanced.md | references/arguments.md |
| 3, "context", "bash", "file" | workflows/create-advanced.md | references/bash-execution.md |
| 4, "restrict", "permissions", "safety" | workflows/create-advanced.md | references/permissions.md |
| 5, "validate", "check", "review" | workflows/validate.md | - |
| 6, "debug", "not working", "broken" | workflows/troubleshoot.md | - |

</routing>

<quick_start>

Basic command in `.claude/commands/review.md`:

```markdown
---
description: Review code for best practices
---

Review the following code for:
- Code quality and readability
- Potential bugs or edge cases
- Performance considerations
```

Use with: `/review`

</quick_start>

<command_scopes>

| Scope | Location | Visibility |
|-------|----------|------------|
| Project | `.claude/commands/` | Team via git |
| Personal | `~/.claude/commands/` | You only |
| Plugin | `<plugin>/commands/` | Plugin users |

Project commands show "(project)" in `/help`. Personal show "(user)".

</command_scopes>

<rules>

ALWAYS:
- Use kebab-case filenames (`my-command.md`)
- Include action-oriented description
- Test commands before sharing
- Validate YAML syntax (no tabs)

NEVER:
- Use tabs in frontmatter (spaces only)
- Create commands that should be skills
- Overly broad tool permissions without reason
- Skip testing arguments and bash execution

</rules>

<references>

| Reference | Content |
|-----------|---------|
| [frontmatter.md](references/frontmatter.md) | Complete frontmatter schema |
| [arguments.md](references/arguments.md) | Argument handling patterns |
| [bash-execution.md](references/bash-execution.md) | Shell command execution |
| [file-references.md](references/file-references.md) | File inclusion syntax |
| [permissions.md](references/permissions.md) | Tool restriction patterns |
| [namespacing.md](references/namespacing.md) | Directory organization |
| [sdk-integration.md](references/sdk-integration.md) | Agent SDK usage |
| [community.md](references/community.md) | Community examples |
| [EXAMPLES.md](EXAMPLES.md) | Real-world examples |

Scripts: `scripts/scaffold-command.sh`, `scripts/validate-command.sh`

</references>

<related_skills>

- **claude-hooks**: Add automation triggers to workflows
- **claude-plugins**: Bundle commands into distributable plugins
- **claude-config**: Configure Claude Code settings

</related_skills>
