# Community Resources

Curated collection of community-created slash commands, patterns, and resources.

## Popular Command Collections

### Production-Ready Collections

**[wshobson/commands](https://github.com/wshobson/commands)**
57 production-ready commands organized into workflows and tools:
- 15 workflow commands (feature development, TDD, modernization)
- 42 tool commands (testing, security, infrastructure)
- Invocation: `/workflows:command-name` or `/tools:command-name`

**[Claude Command Suite](https://github.com/qdhenry/Claude-Command-Suite)**
Enterprise-scale development toolkit:
- 148+ slash commands
- 54 AI agents
- Namespace organization: `/dev:*`, `/test:*`, `/security:*`, `/deploy:*`
- Business scenario modeling and GitHub-Linear sync

**[awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)**
Curated list of commands, CLAUDE.md files, and workflows:
- Git workflows: `/commit`, `/create-pr`, `/fix-github-issue`
- Code quality: `/check`, `/optimize`, `/tdd`
- Documentation: `/create-docs`, `/update-docs`
- Project management: `/create-prd`, `/todo`

### Starter Collections

**[claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)**
Comprehensive project configuration example:
- Hooks, skills, agents, commands
- GitHub Actions workflows
- Best practices demonstration

**[claude-code-guide](https://github.com/zebbern/claude-code-guide)**
Setup guide with:
- SKILL.md files
- Agents and commands
- Workflow examples

---

## Standout Commands

### Git Workflows

**`/commit` (steadycursor)**
Automates git commit with conventional format:

```yaml
---
description: Create conventional commit from staged changes
allowed-tools: Bash(git *)
---
```

**`/create-pr` (toyamarinyon)**
Full PR workflow: branch, commit, format, submit.

**`/catchup`**
Reload work-in-progress after `/clear`:

```yaml
---
description: Load uncommitted changes into context
---
!`git diff`
!`git status`
Continue with the above context.
```

### Code Quality

**`/commit-fast`**
Selects first commit suggestion automatically:

```yaml
---
description: Fast commit - auto-select first suggestion
disable-model-invocation: true
---
```

**`/security-scan`**
Vulnerability assessment with OWASP patterns.

**`/tdd-cycle`**
Test-driven development orchestration:
- Red: Write failing tests
- Green: Implement to pass
- Refactor: Clean up

### Context Management

**`/context-prime`**
Initialize project understanding:

```yaml
---
description: Prime context with project structure and goals
---
!`tree -L 2 -I node_modules`
@README.md
@package.json
```

**`/prime`**
Lightweight context setup via directory visualization.

---

## Command Patterns from Community

### Workflow Orchestration

**Sequential Pipeline**:

```
/feature-development implement OAuth
  -> Backend scaffolding
  -> Frontend integration
  -> Testing
  -> Documentation
```

**Parallel Tools**:

```
/review-suite
  -> /security-scan (parallel)
  -> /performance-check (parallel)
  -> /code-quality (parallel)
```

### Smart Routing

**Dynamic Agent Selection** (from Claude Command Suite):

```yaml
---
description: Intelligent problem resolution
---
Based on the issue type, delegate to:
- Security issues -> security agent
- Performance -> optimization agent
- Tests failing -> debugging agent
```

### Resume Capability

**Interruptible Workflows**:

```yaml
---
description: Save and resume complex tasks
---
## State
!`cat .claude/workflow-state.json 2>/dev/null || echo "No state"`

## Resume or Start
If state exists, continue. Otherwise, begin fresh.
```

---

## Community Best Practices

### From Production Users

1. **Namespace by domain** (`/git:*`, `/test:*`, `/deploy:*`)
2. **Include validation** in deployment commands
3. **Use `disable-model-invocation`** for destructive operations
4. **Add context sections** before task instructions
5. **Limit bash output** to prevent truncation

### Common Pitfalls

1. Commands too broad (do one thing well)
2. Missing `allowed-tools` for safety
3. No validation for required arguments
4. Excessive bash output hitting char limits
5. Forgetting to quote arguments with spaces

---

## Integration Examples

### GitHub Integration

```yaml
---
description: Review PR with full context
argument-hint: <pr-number>
allowed-tools: Bash(gh *), Read, Grep
---
## PR Details
!`gh pr view $1 --json title,body,files`

## Changes
!`gh pr diff $1`

## Checks
!`gh pr checks $1`

Review comprehensively.
```

### Linear Integration

```yaml
---
description: Create issue from current context
allowed-tools: Bash(linear *), Read
---
!`git diff --stat`
!`git status`

Create Linear issue based on current changes.
```

### Slack Notifications

```yaml
---
description: Deploy with Slack notification
argument-hint: <environment>
allowed-tools: Bash(*)
---
!`curl -X POST $SLACK_WEBHOOK -d '{"text":"Deploying to $1"}'`

## Deploy
!`./deploy.sh $1`

!`curl -X POST $SLACK_WEBHOOK -d '{"text":"Deployed to $1 successfully"}'`
```

---

## Learning Resources

### Official Documentation

- [Claude Code Docs - Slash Commands](https://code.claude.com/docs/en/slash-commands)
- [Claude Agent SDK - Commands](https://platform.claude.com/docs/en/agent-sdk/slash-commands)
- [Best Practices Guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

### Tutorials

- [How I use Claude Code](https://www.builder.io/blog/claude-code) - Practical tips from Builder.io
- [Custom Commands Guide](https://en.bioerrorlog.work/entry/claude-code-custom-slash-command) - Step-by-step tutorial
- [Claude Code Cheatsheet](https://shipyard.build/blog/claude-code-cheat-sheet/) - Configuration and commands

### Community Discussions

- [GitHub Issues](https://github.com/anthropics/claude-code/issues) - Bug reports and feature requests
- [Discord Community](https://discord.gg/anthropic) - Real-time discussions

---

## Contributing Commands

### Share Your Commands

1. Create a GitHub repository with your commands
2. Include clear README with examples
3. Add to awesome-claude-code list via PR
4. Tag with `claude-code-commands` topic

### Quality Checklist

Before sharing:
- [ ] Commands have clear descriptions
- [ ] Arguments are documented with `argument-hint`
- [ ] `allowed-tools` specified for safety
- [ ] Tested in real projects
- [ ] README with usage examples
- [ ] License included

---

## Staying Updated

### Follow Changes

- Watch [anthropics/claude-code](https://github.com/anthropics/claude-code) for updates
- Monitor [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) for new entries
- Check [platform.claude.com](https://platform.claude.com/docs) for documentation updates

### Version Compatibility

Commands may need updates when:
- Frontmatter schema changes
- New features added (new fields)
- Tool names modified
- SDK breaking changes
